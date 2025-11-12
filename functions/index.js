import "dotenv/config";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import OpenAI from "openai";

// Firebase onCall function: getGoodNews
export const getGoodNews = onCall(
  {
    secrets: ["OPENAI_API_KEY"], // Firebase secret for OpenAI API key
    timeoutSeconds: 120,         // Increase timeout
    memory: "1GB",               // Optional: increase memory
    allowUnauthenticated: true, 
  },
  async (request) => {
    const { scope, lens, timeframe, location } = request.data || {};

    // --- Validate parameters ---
    if (!scope || !lens || !timeframe) {
      logger.error("Missing parameters:", { scope, lens, timeframe });
      throw new HttpsError(
        "invalid-argument",
        "Missing parameters: scope, lens, or timeframe"
      );
    }

    if (scope === "local" && !location) {
      logger.error("Missing location for local news");
      throw new HttpsError("invalid-argument", "Missing location for local news");
    }

    try {
      // --- Initialize OpenAI client ---
      const client = new OpenAI({
                        apiKey: process.env.OPENAI_API_KEY,
                        timeout: 120000, // 2 minutes
                        });

      // --- Build dynamic prompt ---
      let prompt = "";
      if (scope === "local") {
        prompt = `Give me the real current top news stories for ${location} of the ${timeframe} through the lens of the ${lens}. Keep it insightful with a reflection and a light suggestion for current ways to take action to help in alignment with the text. Use only credible news outlets and provide references to the religious texts as well as the news source.`;
      } else if (scope === "us") {
        prompt = `Give me the real current top news stories for the US for the ${timeframe} through the lens of the ${lens}. Keep it insightful with a reflection and a light suggestion for current ways to take action to help in alignment with the text. Use only credible news outlets and provide references to the religious texts as well as the news source.`;
      } else {
        prompt = `Give me the real current top news stories for the ${scope} news of the ${timeframe} through the lens of the ${lens}. Keep it insightful with a reflection and a light suggestion for current ways to take action to help in alignment with the text. Use only credible news outlets and provide references to the religious texts as well as the news source.`;
      }

      // --- Call OpenAI GPT-5 / Search-Enabled Model ---
        const completion = await client.chat.completions.create(
        {
            model: "gpt-5-search-api",
            web_search_options: {},
            messages: [{ role: "user", content: prompt }],
        },
        {
            timeout: 120000, // 2 min
        }
        );

      const message = completion.choices[0].message.content;

      logger.info("Generated Good News successfully.");
      return { message }; // Return structured object to frontend

    } catch (error) {
      logger.error("Error generating good news:", error);

      // Detect web search-specific issues
      if (error?.response?.status === 400 && error?.response?.data?.error?.message?.includes("web_search")) {
        throw new HttpsError(
          "failed-precondition",
          "Web search tool is not enabled for this account or model variant."
        );
      }

      throw new HttpsError("internal", "Error generating good news", error);
    }
  }
);
