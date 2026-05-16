import type { Request, Response } from "express";

export async function analyzeRequestHandler(req: Request, res: Response) {
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
        "Content-Type": "application/json",
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

Respond using the analyze_request tool.`,
          },
          {
            role: "user",
            content: `Guest message: "${message}"\n\nExpert skills: ${(expertSkills || []).join(", ")}\nExpert bio: ${expertBio || "N/A"}`,
          },
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
                  summary: { type: "string" },
                },
                required: ["urgency", "relevance_score", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_request" } },
      }),
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
  } catch (e: any) {
    console.error("analyze-request error:", e);
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}
