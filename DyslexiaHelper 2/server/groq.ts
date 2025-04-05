import Groq from "groq-sdk";

// Initialize GROQ client with API key
const groq = new Groq({
  apiKey:
    process.env.GROQ_API_KEY ||
    "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",
});

// Define model to use
const MODEL_NAME = "llama-3.3-70b-versatile";

// Text summarization function
export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
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

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error(`Failed to summarize text: ${(error as Error).message}`);
  }
}

// Text simplification function
export async function simplifyText(text: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that simplifies complex text for people with reading difficulties. Your task is to rewrite text using simpler words, shorter sentences, and clearer structure. Make the text more accessible while preserving the core meaning.",
        },
        {
          role: "user",
          content: `Please simplify the following text to make it easier to read and understand:\n\n${text}`,
        },
      ],
    });

    return response.choices[0].message.content || "Unable to simplify text.";
  } catch (error) {
    console.error("Error simplifying text:", error);
    throw new Error(`Failed to simplify text: ${(error as Error).message}`);
  }
}

// Grammar correction function
export async function correctGrammar(text: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
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

    return response.choices[0].message.content || "Unable to correct grammar.";
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
      userPrompt = `Please translate this text from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}:\n\n${text}`;
    }

    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    return response.choices[0].message.content || "Unable to translate text.";
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error(`Failed to translate text: ${(error as Error).message}`);
  }
}

// Chat response function
export async function getChatResponse(message: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for people with dyslexia and reading difficulties. Use simple language, short sentences, and clear explanations. Avoid complex words when simpler alternatives exist. Be patient, supportive, and understanding.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return (
      response.choices[0].message.content ||
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
    const response = await groq.chat.completions.create({
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

    const content = response.choices[0].message.content || "";
    let suggestions: string[] = [];

    try {
      // Try to parse as JSON
      if (content.includes("[") && content.includes("]")) {
        const jsonContent = content.substring(
          content.indexOf("["),
          content.lastIndexOf("]") + 1,
        );
        suggestions = JSON.parse(jsonContent);
      } else {
        // If it's not valid JSON, try to extract from text
        const lines = content
          .split("\n")
          .filter(
            (line: string) =>
              line.trim() && !line.includes("{") && !line.includes("}"),
          );
        suggestions = lines.slice(0, 4).map((line: string) => {
          // Remove numbers, quotes, and other formatting
          return line.replace(/^[0-9."'\-]*/, "").trim();
        });
      }
    } catch (e) {
      // If JSON parsing fails, extract suggestions from text
      const lines = content.split("\n").filter((line: string) => line.trim());
      suggestions = lines.slice(0, 4).map((line: string) => {
        // Remove numbers, quotes, and other formatting
        return line.replace(/^[0-9."'\-]*/, "").trim();
      });
    }

    // Fallback if we still don't have suggestions
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
    // Return default suggestions on error
    return [
      "Can you explain this simpler?",
      "What does this word mean?",
      "Help me write a response",
      "Summarize this conversation",
    ];
  }
}
