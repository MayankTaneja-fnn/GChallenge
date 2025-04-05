import Gemini from "gemini-ai-sdk";

// Initialize Gemini client with API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const gemini = new Gemini(apiKey);

// Define model to use (update with the correct Gemini model name as needed)
const MODEL_NAME = "gemini-1";

/**
 * Helper function to safely extract the message content from the Gemini API response.
 * Throws an error if the expected structure is missing.
 */
function extractContentFromResponse(response: any): string {
  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Invalid response structure: Missing message content.");
  }
  return content.trim();
}

// Text summarization function
export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await gemini.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that summarizes text for people with dyslexia and other reading difficulties. Create clear, concise summaries that are easy to read and understand. Use simple language and short sentences.",
        },
        {
          role: "user",
          content: `Please summarize the following text in a way that's easy to read for someone with dyslexia:\n\n${text}`,
        },
      ],
    });
    return (
      extractContentFromResponse(response) || "Unable to generate summary."
    );
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error(`Failed to summarize text: ${(error as Error).message}`);
  }
}

// Text simplification function
export async function simplifyText(text: string): Promise<string> {
  try {
    const response = await gemini.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that simplifies complex text for people with reading difficulties. Your task is to rewrite text using simpler words, shorter sentences, and clear structure. Make the text more accessible while preserving the core meaning.",
        },
        {
          role: "user",
          content: `Please simplify the following text to make it easier to read and understand:\n\n${text}`,
        },
      ],
    });
    return extractContentFromResponse(response) || "Unable to simplify text.";
  } catch (error) {
    console.error("Error simplifying text:", error);
    throw new Error(`Failed to simplify text: ${(error as Error).message}`);
  }
}

// Grammar correction function
export async function correctGrammar(text: string): Promise<string> {
  try {
    const response = await gemini.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that helps people with dyslexia and writing difficulties correct their grammar and spelling. Fix grammatical errors, spelling mistakes, and improve readability while maintaining the original meaning.",
        },
        {
          role: "user",
          content: `Please correct the grammar and spelling in this text:\n\n${text}`,
        },
      ],
    });
    return extractContentFromResponse(response) || "Unable to correct grammar.";
  } catch (error) {
    console.error("Error correcting grammar:", error);
    throw new Error(`Failed to correct grammar: ${(error as Error).message}`);
  }
}

// Translation and transliteration function
export async function translateText(
  text: string,
  sourceLanguage: string = "auto",
  targetLanguage: string,
): Promise<string> {
  try {
    let systemPrompt =
      "You are a translation assistant that helps people convert text between languages.";
    let userPrompt = "";

    if (sourceLanguage === "hi-t" && targetLanguage === "hi") {
      // Hinglish to Hindi transliteration
      systemPrompt =
        "You are an assistant that converts Hinglish (Roman script Hindi) into proper Hindi script.";
      userPrompt = `Please convert this Hinglish text to proper Hindi script:\n\n${text}`;
    } else if (sourceLanguage === "hi-t" && targetLanguage === "en") {
      // Hinglish to English translation
      systemPrompt =
        "You are an assistant that translates Hinglish (Hindi written in Roman script) into proper English.";
      userPrompt = `Please translate this Hinglish text to English:\n\n${text}`;
    } else if (targetLanguage === "simple") {
      // Any language to simple English
      systemPrompt =
        "You are an assistant that translates text into very simple, easy-to-understand English for people with reading difficulties.";
      userPrompt = `Please translate this text into very simple English:\n\n${text}`;
    } else {
      // Standard translation
      userPrompt = `Please translate this text from ${
        sourceLanguage === "auto" ? "the detected language" : sourceLanguage
      } to ${targetLanguage}:\n\n${text}`;
    }

    const response = await gemini.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return extractContentFromResponse(response) || "Unable to translate text.";
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error(`Failed to translate text: ${(error as Error).message}`);
  }
}

// Chat response function
export async function getChatResponse(message: string): Promise<string> {
  try {
    const response = await gemini.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for people with dyslexia and reading difficulties. Use simple language, short sentences, and clear explanations. Avoid complex words when simpler alternatives exist. Be patient, supportive, and understanding.",
        },
        { role: "user", content: message },
      ],
    });
    return (
      extractContentFromResponse(response) ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error(`Failed to get chat response: ${(error as Error).message}`);
  }
}

// Get suggested responses function
export async function getSuggestedResponses(
  context: string,
): Promise<string[]> {
  try {
    const response = await gemini.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that generates helpful suggested responses for users with dyslexia and reading difficulties. Generate 4 short, simple response options that the user might want to use in a conversation. Format your response as a JSON array with 4 suggestion strings.",
        },
        {
          role: "user",
          content: `Based on this message, generate 4 brief suggested responses that I might want to use (max 8 words each):\n\n${context}`,
        },
      ],
    });
    const content = extractContentFromResponse(response);
    let suggestions: string[] = [];

    try {
      // Attempt to extract JSON array from the response
      if (content.includes("[") && content.includes("]")) {
        const jsonContent = content.substring(
          content.indexOf("["),
          content.lastIndexOf("]") + 1,
        );
        suggestions = JSON.parse(jsonContent);
      } else {
        // Fallback: split lines and extract suggestions
        const lines = content.split("\n").filter((line: string) => line.trim());
        suggestions = lines
          .slice(0, 4)
          .map((line: string) => line.replace(/^[0-9."'\-]*/, "").trim());
      }
    } catch (jsonError) {
      console.error("Error parsing suggested responses JSON:", jsonError);
      const lines = content.split("\n").filter((line: string) => line.trim());
      suggestions = lines
        .slice(0, 4)
        .map((line: string) => line.replace(/^[0-9."'\-]*/, "").trim());
    }

    // Fallback default suggestions if extraction fails
    if (suggestions.length === 0) {
      suggestions = [
        "Can you explain this simpler?",
        "What does this word mean?",
        "Help me write a response",
        "Summarize this conversation",
      ];
    }

    return suggestions.slice(0, 4);
  } catch (error) {
    console.error("Error getting suggested responses:", error);
    return [
      "Can you explain this simpler?",
      "What does this word mean?",
      "Help me write a response",
      "Summarize this conversation",
    ];
  }
}
