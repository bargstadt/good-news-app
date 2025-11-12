import "dotenv/config";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import OpenAI from "openai";

export const getGoodNews = onCall(
  {
    secrets: ["OPENAI_API_KEY"],
    timeoutSeconds: 120, // Increase timeout to 2 minutes
    memory: "1GB",       // Optional: increase memory if needed
  },
  async (request) => {
    const { scope, lens, timeframe, location } = request.data || {};

    // Validate required parameters
    if (!scope || !lens || !timeframe) {
      logger.error("Missing parameters:", { scope, lens, timeframe });
      throw new Error("Missing parameters: scope, lens, or timeframe");
    }

    if (scope === "local" && !location) {
      logger.error("Missing location for local news");
      throw new Error("Missing location for local news");
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Build prompt
      let prompt = "";
      if (scope === "local") {
        prompt = `Give me the ${location} news of the ${timeframe} through the lens of the ${lens}. Keep it positive, insightful, and grounded in compassion, humility, and wisdom.`;
      } else if (scope === "us") {
        prompt = `Give me the US news of the ${timeframe} through the lens of the ${lens}. Keep it positive, insightful, and grounded in compassion, humility, and wisdom.`;
      } else {
        prompt = `Give me the ${scope} news of the ${timeframe} through the lens of the ${lens}. Keep it positive, insightful, and grounded in compassion, humility, and wisdom.`;
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const message = completion.choices[0].message.content;

      logger.info("Generated Good News successfully.");
      return { message };
    } catch (error) {
      logger.error("Error generating good news:", error);
      throw new Error("Error generating good news."); // Let frontend see an error
    }
  }
);
