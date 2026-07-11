var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);

// server/routes/analyzeRequest.ts
async function analyzeRequestHandler(req, res) {
  try {
    const { message, expertSkills, expertBio } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI that analyzes consultation requests. Given a guest's message and an expert's skills/bio, determine:
1. urgency: "high", "medium", or "low" based on how urgent the request sounds
2. relevance_score: 0.0-1.0 how well the request matches the expert's expertise
3. summary: a 1-2 sentence preview of the request

Respond using the analyze_request tool.`
          },
          {
            role: "user",
            content: `Guest message: "${message}"

Expert skills: ${(expertSkills || []).join(", ")}
Expert bio: ${expertBio || "N/A"}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_request",
              description: "Return analysis of the consultation request",
              parameters: {
                type: "object",
                properties: {
                  urgency: { type: "string", enum: ["high", "medium", "low"] },
                  relevance_score: { type: "number", minimum: 0, maximum: 1 },
                  summary: { type: "string" }
                },
                required: ["urgency", "relevance_score", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_request" } }
      })
    });
    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limited, please try again later." });
      }
      if (response.status === 402) {
        return res.status(402).json({ error: "Payment required." });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return res.status(500).json({ error: "AI gateway error" });
    }
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const result = JSON.parse(toolCall.function.arguments);
      return res.json(result);
    }
    return res.json({ urgency: "medium", relevance_score: 0.5, summary: "Request received" });
  } catch (e) {
    console.error("analyze-request error:", e);
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}

// server/index.ts
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3001", 10);
app.use((0, import_cors.default)());
app.use(import_express.default.json());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.post("/api/analyze-request", analyzeRequestHandler);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
