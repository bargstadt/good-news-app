import "dotenv/config"; // for local development
import * as functions from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import OpenAI from "openai";

// --- Initialize OpenAI client ---
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not set.");
  return new OpenAI({ apiKey, timeout: 300000 }); // 5 minutes
};

// --- Prompt builder ---
const buildPrompt = ({
  scope,
  location,
  timeframe,
  lens,
  topicText = "",
}) => {
  const locationText = scope === "local" ? location : scope === "us" ? "US" : scope;

  return `
Give me the **current top news stories** for ${locationText} in the past ${timeframe}, through the lens of ${lens}.  
${topicText ? `Focus on the topic: ${topicText}.` : ""}  

- Prioritize **timely articles** only — the story doesn't have to be about ${lens}, but it should be current and relevant.  
- Include only the **leading stories of the ${timeframe}, unless a specific topic is requested.  
- For each news story, provide:  
  1. A **brief summary** (2-3 sentences)  
  2. A **credible, reputable source** and the URL to the article  
  3. A **short reflection** on the story from the perspective of ${lens}  
  4. A **call to action** that aligns with the message or implications of the story, based on ${lens}  

Please do **not** suggest follow-up steps for the user (i.e., don't propose continuing the conversation or next questions).  
  `.trim();
};

// --- HTTP Cloud Function ---
export const getGoodNewsHttp = functions.onRequest(
  {
    timeoutSeconds: 300,
    memory: "1GB",
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    // --- CORS headers ---
    res.setHeader("Access-Control-Allow-Origin", "*"); // or your frontend URL
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send({ error: "Method not allowed" });
      return;
    }

    const { scope, lens, timeframe, location, topic } = req.body || {};
    const topicText = topic?.trim() || "";

    if (!scope || !lens || !timeframe) {
      res.status(400).send({ error: "Missing parameters: scope, lens, or timeframe" });
      return;
    }
    if (scope === "local" && !location) {
      res.status(400).send({ error: "Missing location for local news" });
      return;
    }

    try {
      const client = getOpenAIClient();
      const prompt = buildPrompt({ scope, location, timeframe, lens, topicText });

      // --- Set streaming headers ---
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // --- OpenAI streaming request ---
      const completion = await client.chat.completions.create({
        model: "gpt-5-search-api",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });

      try {
        for await (const chunk of completion) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify(content)}\n\n`);
          }
        }

        res.write("event: done\ndata: {}\n\n");
        res.end();
      } catch (streamErr) {
        logger.error("OpenAI streaming error:", streamErr);
        res.write(`event: error\ndata: ${JSON.stringify({ message: streamErr.message })}\n\n`);
        res.end();
      }
    } catch (error) {
      logger.error("Error generating good news:", error);
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  }
);
