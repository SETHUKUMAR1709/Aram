export function formatAIResponse(text = "") {
  if (!text) return "";
  
  text = text
    .replace(/\r\n/g, "\n")           // Normalize line endings
    .replace(/\n{3,}/g, "\n\n")       // Reduce 3+ newlines to exactly 2
    .replace(/ {3,}/g, " ")           // Remove excessive spaces inside lines
    .replace(/^\s+/gm, "")            // Trim leading spaces from each line
    .trim();                          // Clean edges
    
  return text;  
}

export function normalizeMarkdownChunk(prev, chunk) {
  let fixed = chunk;

  // Trim unnecessary leading spaces
  fixed = fixed.replace(/^\s+/g, "");

  // Collapse 3+ line breaks
  fixed = fixed.replace(/\n{3,}/g, "\n\n");

  // Remove excessive spaces inside lines
  fixed = fixed.replace(/ {3,}/g, " ");

  // If previous chunk ended with incomplete heading (e.g., "##")
  if (/^#+\s*$/.test(prev.trim())) {
    fixed = fixed.trimStart();
  }

  // Fix broken list continuation ("-" + "\n" + " item")
  if (prev.trim().endsWith("-") && fixed.startsWith(" ")) {
    fixed = fixed.trimStart();
  }

  // Fix markdown bullets that got messed up
  fixed = fixed.replace(/^\*\s{2,}/, "- ");

  // Fix heading broken across chunks ("### Req" + "uirements")
  if (prev.endsWith("#") || prev.endsWith("##") || prev.endsWith("###")) {
    fixed = fixed.trimStart();
  }

  // Fix broken code block (``` + ``` chunk)
  if (prev.trim().endsWith("```") && fixed.trim().startsWith("```")) {
    fixed = "\n" + fixed;
  }

  return fixed;
}