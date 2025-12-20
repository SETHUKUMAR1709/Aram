import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import fs from "fs";
import Chat from "../models/chatModel.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";

const imageFileToDataURL = (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
};

const deleteUploadedFiles = (files) => {
  for (const file of files) {
    if (file?.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("File delete failed:", file.path, err.message);
        }
      });
    }
  }
};


let agent = null;

async function ensureAgent() {
  if (agent) return agent;

  const llm = new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.2,
  });

  agent = createReactAgent({
    llm,
    tools: [],
    messageModifier: `
You are Aram AI — a structured, concise, and precise legal assistant specializing in Indian Law.

CRITICAL STREAMING RULES:
- Never acknowledge receipt of files.
- Never state that you are analyzing or processing.
- Start responding immediately.
- Stream partial findings as soon as possible.

DOCUMENT HANDLING:
- Immediately summarize documents.
- Extract identity, dates, parties, obligations, and legal relevance if present.

IMAGE HANDLING:
- Immediately describe visible content.
- Extract readable text if present.
- Stream observations line by line.

FORMAT:
- Use Markdown headings.
- Keep paragraphs short.
- Do not repeat information.
- Do not include meta commentary.

LEGAL SAFETY:
- Provide legal information only.

TONE:
- Professional, direct, factual.
`,
    checkpointSaver: new MemorySaver(),
  });

  return agent;
}

export const sendMessage = async (req, res) => {
  try {
    const { chatId, queryreceived, checkpoint_id } = req.query;
    const parsed = JSON.parse(queryreceived);

    const userMessage = parsed.query || "";
    const files = Array.isArray(parsed.files) ? parsed.files : [];

    const graph = await ensureAgent();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const send = (ev) => {
      res.write(`data: ${JSON.stringify(ev)}\n\n`);
      res.flush?.();
    };

    const threadId = checkpoint_id || crypto.randomUUID();
    if (!checkpoint_id) {
      send({ type: "checkpoint", checkpoint_id: threadId });
    }

    send({ type: "thinking" });

    const contentParts = [];

    if (userMessage) {
      contentParts.push({ type: "text", text: userMessage });
    }

    for (const file of files) {
      if (file.isImage && file.path) {
        contentParts.push({
        type: "image_url",
        image_url: {
          url: imageFileToDataURL(file.path, file.mimeType),
        },
      });
      } else {
        contentParts.push({
          type: "text",
          text: `Summarize this document:\nName: ${file.originalName}\nType: ${file.mimeType}`,
        });
      }
    }

    let assistantResponse = "";
    let searchInfo = {
      stages: [],
      query: "",
      urls: [],
      internalQuery: "",
      internalUrls: [],
      ragQuery: "",
      ragContext: "",
      error: null,
    };

    const eventStream = await graph.streamEvents(
      {
        messages: [
          {
            role: "user",
            content: contentParts,
          },
        ],
      },
      {
        version: "v2",
        configurable: { thread_id: threadId },
      }
    );

    for await (const event of eventStream) {
      if (event.event === "on_chat_model_stream") {
        const chunk = event.data?.chunk?.content || "";
        assistantResponse += chunk;
        searchInfo.stages.push("writing");
        send({ type: "content", content: chunk });
      }
    }

    send({ type: "end" });
    res.end();

    setImmediate(async () => {
      try {
        const chat = await Chat.findById(chatId).select("messages");
        if (!chat) return;

        const lastId = chat.messages.length
          ? chat.messages[chat.messages.length - 1].messageId
          : 0;

        searchInfo.stages = Array.from(new Set(searchInfo.stages));

        await Chat.findByIdAndUpdate(chatId, {
          $push: {
            messages: [
              {
                role: "user",
                content: userMessage,
                messageId: lastId + 1,
                timestamp: new Date(),
                files,
              },
              {
                role: "ai",
                content: assistantResponse.trim(),
                messageId: lastId + 2,
                timestamp: new Date(),
                searchInfo,
              },
            ],
          },
          checkpoint_id: threadId,
        });

        deleteUploadedFiles(files);

      } catch (err) {
        console.error("DB save error:", err);
      }
    });
  } catch (err) {
    console.error("chatStream error:", err);
    res.write(
      `data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`
    );
    res.end();
  }
};
