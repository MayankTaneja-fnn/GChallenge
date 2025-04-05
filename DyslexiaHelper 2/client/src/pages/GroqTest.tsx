import { useState } from 'react';
import * as groq from '../lib/groq';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroqTest() {
  const [inputText, setInputText] = useState("The quick brown fox jumps over the lazy dog.");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState("summarize");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFunction(e.target.value);
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      return;
    }

    setIsLoading(true);
    setOutputText("Processing...");

    try {
      let result = "";
      
      switch (selectedFunction) {
        case "summarize":
          result = await groq.summarizeText(inputText);
          break;
        case "simplify":
          result = await groq.simplifyText(inputText);
          break;
        case "correctGrammar":
          result = await groq.correctGrammar(inputText);
          break;
        case "translateToSimple":
          result = await groq.translateText(inputText, "auto", "simple");
          break;
        case "chat":
          result = await groq.getChatResponse(inputText);
          break;
        case "suggestedResponses":
          const suggestions = await groq.getSuggestedResponses(inputText);
          result = suggestions.join("\n\n");
          break;
        default:
          result = "Please select a function to test";
      }

      setOutputText(result);
    } catch (error) {
      console.error("Error processing request:", error);
      setOutputText("Error processing request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>GROQ API Test</CardTitle>
          <CardDescription>
            Test various GROQ-powered text processing functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="function-select" className="block text-sm font-medium mb-2">
              Select Function
            </label>
            <select
              id="function-select"
              value={selectedFunction}
              onChange={handleFunctionChange}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="summarize">Summarize Text</option>
              <option value="simplify">Simplify Text</option>
              <option value="correctGrammar">Correct Grammar</option>
              <option value="translateToSimple">Translate to Simple English</option>
              <option value="chat">Chat Response</option>
              <option value="suggestedResponses">Suggested Responses</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="input-text" className="block text-sm font-medium mb-2">
              Input Text
            </label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={handleInputChange}
              rows={5}
              placeholder="Enter text to process..."
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !inputText.trim()}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Process Text"}
          </Button>

          <div className="mt-6">
            <label htmlFor="output-text" className="block text-sm font-medium mb-2">
              Result
            </label>
            <div 
              id="output-text"
              className="w-full rounded-md border border-gray-300 p-3 min-h-[150px] bg-gray-50 whitespace-pre-wrap"
            >
              {outputText}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setInputText("")}
          >
            Clear Input
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setOutputText("")}
          >
            Clear Output
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}