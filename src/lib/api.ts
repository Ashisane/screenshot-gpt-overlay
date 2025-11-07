// API utilities for Groq integration
import { Groq } from 'groq-sdk';

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Initialize Groq client with correct configuration
// Using the base API URL without the /openai/v1 suffix to avoid double prefixing
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com", // Base URL without the /openai/v1 suffix
  dangerouslyAllowBrowser: true, // Required for browser environments
});

// Function to send messages to Groq API
export const sendToGroq = async (
  messages: ChatMessage[]
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      throw new Error("VITE_GROQ_API_KEY is not set in environment variables");
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "openai/gpt-oss-120b", // Updated to a currently supported model
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: false,
      stop: null
    });

    if (chatCompletion.choices && chatCompletion.choices.length > 0) {
      return chatCompletion.choices[0]?.message?.content || "";
    } else {
      throw new Error("Empty response from Groq API");
    }
  } catch (error) {
    console.error("Error sending message to Groq:", error);
    throw new Error(`Failed to get response from Groq: ${error.message}`);
  }
};