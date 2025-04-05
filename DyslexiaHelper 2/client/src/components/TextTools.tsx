import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { summarizeText, simplifyText, correctGrammar } from "../lib/groq";

interface TextToolsProps {
  isActive: boolean;
}

export default function TextTools({ isActive }: TextToolsProps) {
  const [inputText, setInputText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [grammarInput, setGrammarInput] = useState("");
  const [grammarResult, setGrammarResult] = useState("");
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const { isListening, startListening, stopListening, transcript } =
    useSpeechToText();
  const { speak, cancel, isSpeaking } = useTextToSpeech();

  // Setup mutations for text processing
  const summarizeMutation = useMutation({
    mutationFn: (text: string) => summarizeText(text),
    onSuccess: (summary) => {
      setProcessedText(summary);
    },
  });

  const simplifyMutation = useMutation({
    mutationFn: (text: string) => simplifyText(text),
    onSuccess: (simplified) => {
      setProcessedText(simplified);
    },
  });

  const grammarMutation = useMutation({
    mutationFn: (text: string) => correctGrammar(text),
    onSuccess: (corrected) => {
      setGrammarResult(corrected);
    },
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleGrammarInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setGrammarInput(e.target.value);
  };

  // Handle text processing actions
  const handleSummarize = () => {
    if (inputText.trim()) {
      summarizeMutation.mutate(inputText);
    }
  };

  const handleSimplify = () => {
    if (inputText.trim()) {
      simplifyMutation.mutate(inputText);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      cancel();
    } else if (inputText.trim()) {
      speak(inputText);
    }
  };

  const handleCorrectGrammar = () => {
    if (grammarInput.trim()) {
      grammarMutation.mutate(grammarInput);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setInputText((prevText) => prevText + " " + transcript);
    } else {
      startListening();
    }
  };

  // Handle font size changes
  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 28) {
      setFontSize(fontSize + 2);
    }
  };

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(processedText);
  };

  // Handle download as text file
  const downloadAsTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob([processedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "textease-processed.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle clear text
  const clearText = () => {
    setInputText("");
  };

  // Handle paste from clipboard
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
  };

  return (
    <div
      id="content-text-tools"
      className={`tab-content ${isActive ? "" : "hidden"}`}
    >
      {/* Text Processing Controls */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Text Input Card */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Text Input ✍️</h2>
            <div className="flex space-x-3">
              <button
                id="paste-text"
                className="p-3 text-green-600 hover:bg-green-50 rounded-full transition"
                aria-label="Paste from clipboard"
                onClick={pasteFromClipboard}
              >
                <i className="fas fa-paste text-xl"></i>
              </button>
              <button
                id="clear-text"
                className="p-3 text-green-600 hover:bg-green-50 rounded-full transition"
                aria-label="Clear text"
                onClick={clearText}
              >
                <i className="fas fa-trash-alt text-xl"></i>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="input-text"
              className="w-full min-h-[220px] p-5 border-2 border-gray-300 rounded-xl resize-y text-gray-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
              placeholder="Enter or paste text here..."
              value={inputText}
              onChange={handleInputChange}
              style={{ fontSize: `${fontSize}px` }}
            ></textarea>
            <div className="absolute right-3 bottom-3">
              <button
                id="voice-input"
                className={`p-3 rounded-full ${isListening ? "bg-red-500" : "bg-green-600"} text-white hover:opacity-90 transition`}
                aria-label="Voice input"
                onClick={handleVoiceInput}
              >
                <i
                  className={`fas ${isListening ? "fa-stop" : "fa-microphone"} text-xl`}
                ></i>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              id="summarize-text"
              className="flex items-center px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              onClick={handleSummarize}
              disabled={summarizeMutation.isPending || !inputText.trim()}
            >
              {summarizeMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-3"></i>
              ) : (
                <i className="fas fa-compress-alt mr-3"></i>
              )}
              Summarize 🔍
            </button>
            <button
              id="read-aloud"
              className="flex items-center px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
              onClick={handleReadAloud}
              disabled={!inputText.trim()}
            >
              <i
                className={`fas ${isSpeaking ? "fa-stop" : "fa-volume-up"} mr-3`}
              ></i>
              {isSpeaking ? "Stop" : "Read Aloud"} 🔊
            </button>
            <button
              id="simplify-text"
              className="flex items-center px-5 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition"
              onClick={handleSimplify}
              disabled={simplifyMutation.isPending || !inputText.trim()}
            >
              {simplifyMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-3"></i>
              ) : (
                <i className="fas fa-magic mr-3"></i>
              )}
              Simplify ✨
            </button>
          </div>
        </div>

        {/* Result Output Card */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Processed Text 📄
            </h2>
            <div className="flex space-x-3">
              <button
                id="copy-result"
                className="p-3 text-green-600 hover:bg-green-50 rounded-full transition"
                aria-label="Copy to clipboard"
                onClick={copyToClipboard}
                disabled={!processedText}
              >
                <i className="fas fa-copy text-xl"></i>
              </button>
              <button
                id="download-result"
                className="p-3 text-green-600 hover:bg-green-50 rounded-full transition"
                aria-label="Download as text file"
                onClick={downloadAsTextFile}
                disabled={!processedText}
              >
                <i className="fas fa-download text-xl"></i>
              </button>
            </div>
          </div>

          <div
            id="result-container"
            className="min-h-[220px] p-5 border-2 border-gray-300 rounded-xl mb-5 overflow-y-auto text-gray-800"
            style={{ fontSize: `${fontSize}px` }}
          >
            {processedText ? (
              isHighlightMode ? (
                processedText.split(" ").map((word, index) => (
                  <span
                    key={index}
                    className="px-1 py-1 mx-0.5 my-0.5 rounded transition-colors bg-green-100"
                    data-word
                  >
                    {word}{" "}
                  </span>
                ))
              ) : (
                <p>{processedText}</p>
              )
            ) : (
              <p className="text-gray-500 italic">
                Processed text will appear here... 📝
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-3 md:mb-0">
              <button
                id="text-smaller"
                className="p-3 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                aria-label="Decrease font size"
                onClick={decreaseFontSize}
              >
                <i className="fas fa-font text-base"></i>
              </button>
              <button
                id="text-larger"
                className="p-3 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                aria-label="Increase font size"
                onClick={increaseFontSize}
              >
                <i className="fas fa-font text-2xl"></i>
              </button>
            </div>
            <div>
              <button
                id="highlight-mode"
                className={`px-5 py-3 rounded-xl transition ${isHighlightMode ? "bg-green-600 text-white" : "bg-green-400 text-white"}`}
                onClick={toggleHighlightMode}
                disabled={!processedText}
              >
                Word Highlighting 🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grammar Correction Section */}
      <div className="bg-white rounded-xl shadow-xl p-6 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Grammar & Spelling Assistance ✏️
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label
              htmlFor="grammar-input"
              className="block mb-3 text-lg text-gray-800"
            >
              Enter text for correction:
            </label>
            <textarea
              id="grammar-input"
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl resize-y text-gray-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
              placeholder="Enter text with spelling or grammar issues..."
              value={grammarInput}
              onChange={handleGrammarInputChange}
              style={{ fontSize: "18px" }}
            ></textarea>
            <button
              id="correct-text"
              className="mt-4 w-full px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              onClick={handleCorrectGrammar}
              disabled={grammarMutation.isPending || !grammarInput.trim()}
            >
              {grammarMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-3"></i>
              ) : (
                "Correct Text"
              )}
            </button>
          </div>
          <div>
            <h3 className="block mb-3 text-lg font-semibold text-gray-800">
              Corrected Version:
            </h3>
            <div
              id="grammar-result"
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl bg-gray-50 overflow-y-auto text-gray-800"
              style={{ fontSize: "18px" }}
            >
              {grammarResult ? (
                <p>{grammarResult}</p>
              ) : (
                <p className="text-gray-500 italic">
                  Corrected text will appear here... 📢
                </p>
              )}
            </div>
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
              <h4 className="font-medium text-lg mb-2 text-gray-800">Tips:</h4>
              <ul className="text-lg list-disc pl-6 space-y-1 text-gray-700">
                <li>Use clear, simple sentences</li>
                <li>Avoid complicated words when possible</li>
                <li>Check for subject-verb agreement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
