import ChatList from "@/components/chat/ChatList";
import Header from "@/components/chat/Header";
import InputBar from "@/components/chat/InputBar";
import MessageArea from "@/components/chat/MessageArea";
import React, { useState, useEffect } from "react";
import { useParams, redirect } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeMarkdownChunk } from "@/utils/formatAI";

const ChatPage = () => {
  const {
    authUser,
    getMessages,
    setCurrentChatId,
    sendAIMessage,
  } = useAuthStore();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [checkpointId, setCheckpointId] = useState("");
  const [receiving, setReceiving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { chatId } = useParams();

  // ===========================
  // 📌 Init Chat
  // ===========================
  useEffect(() => {
    if (!chatId) redirect("/chat");

    setMessages([]);
    setCheckpointId("");
    setReceiving(false);

    const chat = authUser?.chats?.find((c) => c._id === chatId);
    if (chat?.checkpoint_id) {
      setCheckpointId(chat.checkpoint_id);
    }

    setCurrentChatId(chatId);
  }, [chatId, authUser?.chats]);

  // ===========================
  // 📥 Load Messages
  // ===========================
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await getMessages(chatId);
        setMessages(res.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [chatId]);

    const uploadFiles = async (files) => {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch(`${BACKEND_URL}/api/chats/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("File upload failed");
    }

    const data = await res.json();
    return data.files;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!currentMessage.trim() && !selectedFiles.length) || receiving) return;

    setReceiving(true);

    const userInput = currentMessage;
    const filesToUpload = selectedFiles;
    setCurrentMessage("");
    setSelectedFiles([]);

    const userMsgId = messages.length + 1;
    const aiMsgId = userMsgId + 1;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        id: userMsgId,
        content: userInput,
        isUser: true,
        type: "message",
        files: filesToUpload,
      },
      {
        role: "ai",
        id: aiMsgId,
        content: "",
        isUser: false,
        type: "message",
        isLoading: true,
        searchInfo: {
          stages: [],
          query: "",
          urls: [],
        },
      },
    ]);

    let uploadedFiles = [];
    if (filesToUpload.length) {
      try {
        uploadedFiles = await uploadFiles(filesToUpload);
      } catch {
        setReceiving(false);
        return;
      }
    }

    let streamedContent = "";

    sendAIMessage({
      chatId,
      payload: {
        query: userInput,
        files: uploadedFiles,
      },
      checkpointId,
      onEvent: (data) => {
        if (data.type === "checkpoint") {
          setCheckpointId(data.checkpoint_id);
        }

        if (data.type === "content") {
          const fixed = normalizeMarkdownChunk(data.content);
          streamedContent = normalizeMarkdownChunk(streamedContent + fixed);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? { ...msg, content: streamedContent, isLoading: false }
                : msg
            )
          );
        }

        if (data.type === "end") {
          setReceiving(false);
        }
      },
      onError: () => {
        setReceiving(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  content: "Sorry, there was an error processing your request.",
                  isLoading: false,
                }
              : msg
          )
        );
      },
    });
  };


  // ===========================
  // 🧱 Layout (UNCHANGED)
  // ===========================
  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Top Header */}
      <Header />

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto px-4 flex justify-center w-full">
        <MessageArea messages={messages} />
      </div>

      {/* Input Bar (fixed visual position) */}
      <div className="flex items-center bg-transparent justify-center w-full z-50">
        <InputBar
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          onSubmit={handleSubmit}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          disabled={receiving}
        />

      </div>
    </div>
  );
};

export default ChatPage;
