import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import {
  getChatResponse,
  getSuggestedResponses,
  translateText,
} from "../lib/groq";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface ChatAssistantProps {
  isActive: boolean;
}

export default function ChatAssistant({ isActive }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content:
        "Hi there! I'm your reading and writing assistant. I can help simplify text, suggest responses, or explain difficult words. How can I help you today? 🤖",
    },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "Can you explain this simpler?",
    "What does this word mean?",
    "Help me write a response",
    "Summarize this conversation",
  ]);

  const [translateInput, setTranslateInput] = useState("");
  const [translateResult, setTranslateResult] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");

  const { isListening, startListening, stopListening, transcript } =
    useSpeechToText();
  const { speak, isSpeaking } = useTextToSpeech();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (message: string) => getChatResponse(message),
    onSuccess: (response) => {
      addMessage("system", response);
      fetchSuggestions(response);
    },
  });

  const translateMutation = useMutation({
    mutationFn: (payload: {
      text: string;
      sourceLanguage: string;
      targetLanguage: string;
    }) =>
      translateText(
        payload.text,
        payload.sourceLanguage,
        payload.targetLanguage,
      ),
    onSuccess: (translatedText) => {
      setTranslateResult(translatedText);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setMessageInput((prev) => prev + " " + transcript);
    }
  }, [transcript]);

  // Fetch suggested responses based on conversation context
  const fetchSuggestions = async (lastMessage: string) => {
    try {
      const newSuggestions = await getSuggestedResponses(lastMessage);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const addMessage = (role: "user" | "system", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      addMessage("user", messageInput);
      chatMutation.mutate(messageInput);
      setMessageInput("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessageInput(suggestion);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTranslate = () => {
    if (translateInput.trim()) {
      translateMutation.mutate({
        text: translateInput,
        sourceLanguage,
        targetLanguage,
      });
    }
  };

  const speakTranslation = () => {
    if (translateResult) {
      speak(translateResult);
    }
  };

  const copyTranslation = () => {
    if (translateResult) {
      navigator.clipboard.writeText(translateResult);
    }
  };

  return (
    <div
      id="content-chat"
      className={`tab-content ${isActive ? "" : "hidden"}`}
    >
      <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          AI Chat Assistant 🤖
        </h2>

        {/* Chat Messages Container */}
        <div
          id="chat-messages"
          className="border-2 border-gray-200 rounded-xl mb-6 h-80 overflow-y-auto p-6 bg-gray-50"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-6 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "system" && (
                <div className="flex-shrink-0 mr-4">
                  <div
                    className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white text-xl"
                    aria-label="Assistant"
                  >
                    🤖
                  </div>
                </div>
              )}

              <div
                className={`${message.role === "system" ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white"} rounded-2xl p-4 max-w-[80%] text-lg leading-relaxed`}
              >
                <p>{message.content}</p>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 ml-4">
                  <div
                    className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white text-xl"
                    aria-label="User"
                  >
                    🙂
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="relative mb-6">
          <textarea
            id="chat-input"
            className="w-full p-4 pr-28 border-2 border-gray-300 rounded-2xl resize-none text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
            placeholder="Type your message here... ✍️"
            rows={3}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Chat message input"
          ></textarea>

          <div className="absolute right-4 bottom-4 flex space-x-3">
            <button
              id="chat-voice-input"
              className={`p-3 rounded-full ${isListening ? "bg-red-500" : "bg-green-500"} text-white hover:opacity-90 transition focus:outline-none`}
              aria-label="Toggle voice input"
              onClick={handleVoiceInput}
            >
              <i
                className={`fas ${isListening ? "fa-stop" : "fa-microphone"}`}
              ></i>
            </button>
            <button
              id="send-message"
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition focus:outline-none"
              aria-label="Send message"
              onClick={handleSendMessage}
              disabled={chatMutation.isPending || !messageInput.trim()}
            >
              {chatMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </div>

        {/* Suggested Responses */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Suggested Responses 💡
          </h3>
          <div className="flex flex-wrap gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-gray-200 rounded-full text-base hover:bg-gray-300 transition focus:outline-none"
                onClick={() => handleSuggestionClick(suggestion)}
                aria-label={`Suggested: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translation & Transliteration Tool */}
      <div className="bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          Translation & Transliteration 🌐
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Translation Input */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label
                htmlFor="translate-input"
                className="block text-xl font-semibold text-gray-800"
              >
                Original Text 📝
              </label>
              <select
                id="source-language"
                className="p-2 border-2 border-gray-300 rounded-xl text-lg bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi-t">Hinglish (Transliterated)</option>
                <option value="hi">Hindi</option>
                <option value="auto">Auto-detect</option>
              </select>
            </div>
            <textarea
              id="translate-input"
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl resize-none text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
              placeholder="Enter text to translate or transliterate... 🔄"
              value={translateInput}
              onChange={(e) => setTranslateInput(e.target.value)}
              aria-label="Text to translate"
            ></textarea>
            <button
              id="translate-text"
              className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl text-lg hover:bg-green-600 transition focus:outline-none"
              onClick={handleTranslate}
              disabled={translateMutation.isPending || !translateInput.trim()}
            >
              {translateMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                "Convert 🔄"
              )}
            </button>
          </div>

          {/* Translation Output */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label
                htmlFor="translate-result"
                className="block text-xl font-semibold text-gray-800"
              >
                Converted Text 📢
              </label>
              <select
                id="target-language"
                className="p-2 border-2 border-gray-300 rounded-xl text-lg bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="simple">Simplified English</option>
              </select>
            </div>
            <div
              id="translate-result"
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl bg-gray-50 overflow-y-auto text-lg text-gray-900"
            >
              {translateResult ? (
                <p>{translateResult}</p>
              ) : (
                <p className="text-gray-500 italic">
                  Converted text will appear here...
                </p>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button
                id="copy-translation"
                className="px-6 py-3 bg-gray-700 text-white rounded-xl text-lg hover:bg-gray-800 transition focus:outline-none"
                onClick={copyTranslation}
                disabled={!translateResult}
                aria-label="Copy converted text"
              >
                <i className="fas fa-copy mr-2"></i>Copy 📋
              </button>
              <button
                id="speak-translation"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl text-lg hover:bg-purple-700 transition focus:outline-none"
                onClick={speakTranslation}
                disabled={!translateResult || isSpeaking}
                aria-label="Speak converted text"
              >
                <i className="fas fa-volume-up mr-2"></i>Speak 🔊
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
