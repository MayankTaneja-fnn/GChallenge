import express, { type Express } from "express";
import { storage } from "./storage";
import {
  summarizeText,
  simplifyText,
  translateText,
  correctGrammar,
  getChatResponse,
  getSuggestedResponses,
} from "./groq";

export async function registerRoutes(app: Express): Promise<Express> {
  // Create API routes with /api prefix
  const apiRouter = express.Router();

  // OpenAI text summarization endpoint
  apiRouter.post("/summarize", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }

      const summary = await summarizeText(text);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing text:", error);
      res.status(500).json({
        message: "Error processing text summarization",
        error: (error as Error).message,
      });
    }
  });

  // Text simplification endpoint
  apiRouter.post("/simplify", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }

      const simplifiedText = await simplifyText(text);
      res.json({ simplifiedText });
    } catch (error) {
      console.error("Error simplifying text:", error);
      res.status(500).json({
        message: "Error processing text simplification",
        error: (error as Error).message,
      });
    }
  });

  // Grammar correction endpoint
  apiRouter.post("/correct-grammar", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }

      const correctedText = await correctGrammar(text);
      res.json({ correctedText });
    } catch (error) {
      console.error("Error correcting grammar:", error);
      res.status(500).json({
        message: "Error processing grammar correction",
        error: (error as Error).message,
      });
    }
  });

  // Translation endpoint
  apiRouter.post("/translate", async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;

      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }

      if (!targetLanguage) {
        return res.status(400).json({ message: "Target language is required" });
      }

      const translatedText = await translateText(
        text,
        sourceLanguage,
        targetLanguage,
      );
      res.json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(500).json({
        message: "Error processing translation",
        error: (error as Error).message,
      });
    }
  });

  // Chat response endpoint
  apiRouter.post("/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res
          .status(400)
          .json({ message: "Message is required and must be a string" });
      }

      const response = await getChatResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("Error getting chat response:", error);
      res.status(500).json({
        message: "Error processing chat response",
        error: (error as Error).message,
      });
    }
  });

  // Suggested responses endpoint
  apiRouter.post("/suggested-responses", async (req, res) => {
    try {
      const { context } = req.body;

      if (!context || typeof context !== "string") {
        return res
          .status(400)
          .json({ message: "Context is required and must be a string" });
      }

      const suggestions = await getSuggestedResponses(context);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting suggested responses:", error);
      res.status(500).json({
        message: "Error processing suggested responses",
        error: (error as Error).message,
      });
    }
  });

  // User preferences endpoints
  apiRouter.post("/preferences", async (req, res) => {
    try {
      const { userId, ...preferences } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userPrefs = await storage.saveUserPreferences(userId, preferences);
      res.json(userPrefs);
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({
        message: "Error saving user preferences",
        error: (error as Error).message,
      });
    }
  });

  apiRouter.get("/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const preferences = await storage.getUserPreferences(userId);

      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }

      res.json(preferences);
    } catch (error) {
      console.error("Error getting user preferences:", error);
      res.status(500).json({
        message: "Error getting user preferences",
        error: (error as Error).message,
      });
    }
  });

  // Test endpoint to check GROQ integration
  apiRouter.get("/test-groq", async (req, res) => {
    try {
      const testResult = await summarizeText(
        "Hello, this is a test to check if GROQ is working properly. The quick brown fox jumps over the lazy dog.",
      );
      res.json({
        success: true,
        message: "GROQ integration is working",
        testResult,
      });
    } catch (error) {
      console.error("Error testing GROQ:", error);
      res.status(500).json({
        success: false,
        message: "GROQ integration test failed",
        error: (error as Error).message,
      });
    }
  });

  // Register the API router
  app.use("/api", apiRouter);

  return app;
}
