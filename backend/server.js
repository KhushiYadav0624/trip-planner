import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const MAX_PROMPT_LENGTH = 2000;

function validateItinerary(data) {
  if (!data) return false;

  if (typeof data.trip_title !== "string") return false;

  if (typeof data.summary !== "string") return false;

  if (!Array.isArray(data.days)) return false;

  for (const day of data.days) {
    if (typeof day.day_number !== "number") return false;

    if (typeof day.theme !== "string") return false;

    if (!Array.isArray(day.stops)) return false;

    for (const stop of day.stops) {
      if (typeof stop.name !== "string") return false;

      if (typeof stop.type !== "string") return false;

      if (typeof stop.time_of_day !== "string") return false;

      if (typeof stop.description !== "string") return false;

      if (typeof stop.duration !== "string") return false;
    }
  }

  return true;
}
app.post("/api/plan-trip", async (req, res) => {
  try {
    const prompt = req.body?.prompt?.trim();

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Please describe your trip." });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters.`,
      });
    }

    const fullPrompt = `
You are an expert travel planner.

Return ONLY valid JSON.

Do not use markdown.
Do not wrap in \`\`\`.
Do not explain anything.

Return exactly this structure:

{
  "trip_title": "",
  "summary": "",
  "days": [
    {
      "day_number": 1,
      "theme": "",
      "stops": [
        {
          "name": "",
          "type": "sightseeing",
          "time_of_day": "morning",
          "duration": "",
          "description": ""
        }
      ]
    }
  ]
}

User Request:
${prompt}
`;

    const result = await ai.models.generateContent({
    model: "models/gemini-2.0-flash-lite",
    contents: fullPrompt,
    });

    let text = result.text.trim();

    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "");
        let itinerary;

    try {
      itinerary = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: "AI returned invalid JSON.",
      });
    }

    if (!validateItinerary(itinerary)) {
      return res.status(500).json({
        error: "AI returned an unexpected response format.",
      });
    }

    itinerary.days = itinerary.days.map((day, dIdx) => ({
      ...day,
      id: `day-${dIdx}`,
      stops: day.stops.map((stop, sIdx) => ({
        ...stop,
        id: `day-${dIdx}-stop-${sIdx}`,
      })),
    }));

    return res.json(itinerary);

  } catch (err) {
  console.error(err);

  if (err.status === 429) {
    return res.status(429).json({
      error: "Request limit reached. Please wait a few seconds and try again.",
    });
  }

  if (err.status === 503) {
    return res.status(503).json({
      error: "Gemini is experiencing high demand. Please try again in a few moments.",
    });
  }

  return res.status(500).json({
    error: "Failed to generate itinerary.",
  });
}
});
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    provider: "Gemini",
    model: "models/gemini-2.0-flash-lite",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});