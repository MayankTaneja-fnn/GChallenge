// server/index.ts
import express3 from "express";
import { createServer } from "http";

// server/routes.ts
import express from "express";

// server/storage.ts
var MemStorage = class {
  users;
  preferences;
  currentId;
  currentPreferenceId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.preferences = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.currentPreferenceId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getUserPreferences(userId) {
    return this.preferences.get(userId);
  }
  async saveUserPreferences(userId, preferences) {
    const existingPrefs = this.preferences.get(userId);
    if (existingPrefs) {
      const updatedPrefs = {
        ...existingPrefs,
        ...preferences
      };
      this.preferences.set(userId, updatedPrefs);
      return updatedPrefs;
    } else {
      const id = this.currentPreferenceId++;
      const defaultPrefs = {
        id,
        userId,
        theme: "light",
        fontFamily: "roboto",
        fontSize: 16,
        letterSpacing: 1,
        lineHeight: 15,
        customSettings: null
      };
      const newPrefs = {
        ...defaultPrefs,
        ...preferences
      };
      this.preferences.set(userId, newPrefs);
      return newPrefs;
    }
  }
};
var storage = new MemStorage();

// server/groq.ts
import Groq from "groq-sdk";
var groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
var MODEL_NAME = "llama-3.3-70b-versatile";
async function summarizeText(text) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an assistant that summarizes text for people with dyslexia and other reading difficulties. Create clear, concise summaries that are easy to read and understand. Use simple language and short sentences."
        },
        {
          role: "user",
          content: `Please summarize the following text in a way that's easy to read for someone with dyslexia:

${text}`
        }
      ]
    });
    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error(`Failed to summarize text: ${error.message}`);
  }
}
async function simplifyText(text) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an assistant that simplifies complex text for people with reading difficulties. Your task is to rewrite text using simpler words, shorter sentences, and clearer structure. Make the text more accessible while preserving the core meaning."
        },
        {
          role: "user",
          content: `Please simplify the following text to make it easier to read and understand:

${text}`
        }
      ]
    });
    return response.choices[0].message.content || "Unable to simplify text.";
  } catch (error) {
    console.error("Error simplifying text:", error);
    throw new Error(`Failed to simplify text: ${error.message}`);
  }
}
async function correctGrammar(text) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an assistant that helps people with dyslexia and writing difficulties correct their grammar and spelling. Fix grammatical errors, spelling mistakes, and improve readability while maintaining the original meaning."
        },
        {
          role: "user",
          content: `Please correct the grammar and spelling in this text:

${text}`
        }
      ]
    });
    return response.choices[0].message.content || "Unable to correct grammar.";
  } catch (error) {
    console.error("Error correcting grammar:", error);
    throw new Error(`Failed to correct grammar: ${error.message}`);
  }
}
async function translateText(text, sourceLanguage = "auto", targetLanguage) {
  try {
    let systemPrompt = "You are a translation assistant that helps people convert text between languages.";
    let userPrompt = "";
    if (sourceLanguage === "hi-t" && targetLanguage === "hi") {
      systemPrompt = "You are an assistant that converts Hinglish (Roman script Hindi) into proper Hindi script.";
      userPrompt = `Please convert this Hinglish text to proper Hindi script:

${text}`;
    } else if (sourceLanguage === "hi-t" && targetLanguage === "en") {
      systemPrompt = "You are an assistant that translates Hinglish (Hindi written in Roman script) into proper English.";
      userPrompt = `Please translate this Hinglish text to English:

${text}`;
    } else if (targetLanguage === "simple") {
      systemPrompt = "You are an assistant that translates text into very simple, easy-to-understand English for people with reading difficulties.";
      userPrompt = `Please translate this text into very simple English:

${text}`;
    } else {
      userPrompt = `Please translate this text from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}:

${text}`;
    }
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    });
    return response.choices[0].message.content || "Unable to translate text.";
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
}
async function getChatResponse(message) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for people with dyslexia and reading difficulties. Use simple language, short sentences, and clear explanations. Avoid complex words when simpler alternatives exist. Be patient, supportive, and understanding."
        },
        {
          role: "user",
          content: message
        }
      ]
    });
    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error(`Failed to get chat response: ${error.message}`);
  }
}
async function getSuggestedResponses(context) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an assistant that generates helpful suggested responses for users with dyslexia and reading difficulties. Generate 4 short, simple response options that the user might want to use in a conversation. Format your response as a JSON array with 4 suggestion strings."
        },
        {
          role: "user",
          content: `Based on this message, generate 4 brief suggested responses that I might want to use (max 8 words each):

${context}`
        }
      ]
    });
    const content = response.choices[0].message.content || "";
    let suggestions = [];
    try {
      if (content.includes("[") && content.includes("]")) {
        const jsonContent = content.substring(
          content.indexOf("["),
          content.lastIndexOf("]") + 1
        );
        suggestions = JSON.parse(jsonContent);
      } else {
        const lines = content.split("\n").filter((line) => line.trim() && !line.includes("{") && !line.includes("}"));
        suggestions = lines.slice(0, 4).map((line) => {
          return line.replace(/^[0-9."'\-]*/, "").trim();
        });
      }
    } catch (e) {
      const lines = content.split("\n").filter((line) => line.trim());
      suggestions = lines.slice(0, 4).map((line) => {
        return line.replace(/^[0-9."'\-]*/, "").trim();
      });
    }
    if (suggestions.length === 0) {
      suggestions = [
        "Can you explain this simpler?",
        "What does this word mean?",
        "Help me write a response",
        "Summarize this conversation"
      ];
    }
    return suggestions.slice(0, 4);
  } catch (error) {
    console.error("Error getting suggested responses:", error);
    return [
      "Can you explain this simpler?",
      "What does this word mean?",
      "Help me write a response",
      "Summarize this conversation"
    ];
  }
}

// server/routes.ts
async function registerRoutes(app) {
  const apiRouter = express.Router();
  apiRouter.post("/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      const summary = await summarizeText(text);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing text:", error);
      res.status(500).json({
        message: "Error processing text summarization",
        error: error.message
      });
    }
  });
  apiRouter.post("/simplify", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      const simplifiedText = await simplifyText(text);
      res.json({ simplifiedText });
    } catch (error) {
      console.error("Error simplifying text:", error);
      res.status(500).json({
        message: "Error processing text simplification",
        error: error.message
      });
    }
  });
  apiRouter.post("/correct-grammar", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      const correctedText = await correctGrammar(text);
      res.json({ correctedText });
    } catch (error) {
      console.error("Error correcting grammar:", error);
      res.status(500).json({
        message: "Error processing grammar correction",
        error: error.message
      });
    }
  });
  apiRouter.post("/translate", async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      if (!targetLanguage) {
        return res.status(400).json({ message: "Target language is required" });
      }
      const translatedText = await translateText(
        text,
        sourceLanguage,
        targetLanguage
      );
      res.json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(500).json({
        message: "Error processing translation",
        error: error.message
      });
    }
  });
  apiRouter.post("/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required and must be a string" });
      }
      const response = await getChatResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("Error getting chat response:", error);
      res.status(500).json({
        message: "Error processing chat response",
        error: error.message
      });
    }
  });
  apiRouter.post("/suggested-responses", async (req, res) => {
    try {
      const { context } = req.body;
      if (!context || typeof context !== "string") {
        return res.status(400).json({ message: "Context is required and must be a string" });
      }
      const suggestions = await getSuggestedResponses(context);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting suggested responses:", error);
      res.status(500).json({
        message: "Error processing suggested responses",
        error: error.message
      });
    }
  });
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
        error: error.message
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
        error: error.message
      });
    }
  });
  apiRouter.get("/test-groq", async (req, res) => {
    try {
      const testResult = await summarizeText(
        "Hello, this is a test to check if GROQ is working properly. The quick brown fox jumps over the lazy dog."
      );
      res.json({
        success: true,
        message: "GROQ integration is working",
        testResult
      });
    } catch (error) {
      console.error("Error testing GROQ:", error);
      res.status(500).json({
        success: false,
        message: "GROQ integration test failed",
        error: error.message
      });
    }
  });
  app.use("/api", apiRouter);
  return app;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express2.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
async function startServer() {
  const app = express3();
  app.use(express3.json());
  app.use(express3.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
    next();
  });
  try {
    await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      console.error("Error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    const server = createServer(app);
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    server.listen(5e3, "0.0.0.0", () => {
      log(`Server running at http://0.0.0.0:5000`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer().catch(console.error);
