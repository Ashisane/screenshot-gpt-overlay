import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface ChatInterfaceProps {
  rect: { x: number; y: number; width: number; height: number };
  fontSize: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Simple markdown formatter for code blocks and basic formatting
const formatMessage = (content: string) => {
  // Convert code blocks
  let formatted = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-100 p-2 my-2 rounded overflow-x-auto"><code>$2</code></pre>');
  
  // Convert inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>');
  
  // Convert headers
  formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="font-bold text-lg mt-2">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="font-bold text-xl mt-3">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="font-bold text-2xl mt-4">$1</h1>');
  
  // Convert bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert lists
  formatted = formatted.replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>');
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br />');
  
  return formatted;
};

export const ChatInterface = ({ rect, fontSize }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm a Groq-powered AI assistant. I'm ready to help you with this window. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Import the sendToGroq function dynamically to avoid SSR issues
      const { sendToGroq } = await import("@/lib/api");
      
      // Convert our message format to Groq format
      const groqMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the new user message
      groqMessages.push({
        role: "user",
        content: userMessage.content
      });

      // Call Groq API
      const response = await sendToGroq(groqMessages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed bg-white flex flex-col overflow-hidden"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: "0.5px solid rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-2 py-1 max-w-[80%] ${
                msg.role === "user" 
                  ? "bg-blue-100 text-blue-900" 
                  : "bg-gray-100 text-gray-900"
              }`}
              style={{ 
                fontSize: `${fontSize}px`,
                border: '0.5px solid rgba(0, 0, 0, 0.5)'
              }}
            >
              {msg.role === "assistant" ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessage(msg.content) 
                  }} 
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div
              className="inline-block px-2 py-1 max-w-[80%] bg-gray-100 text-gray-900"
              style={{ 
                fontSize: `${fontSize}px`,
                border: '0.5px solid rgba(0, 0, 0, 0.5)'
              }}
            >
              Thinking with Groq...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-2 bg-white" style={{ borderTop: '0.5px solid rgba(0, 0, 0, 0.5)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 px-2 py-1 bg-white rounded-none focus:outline-none"
            style={{ 
              fontSize: `${fontSize}px`,
              border: '0.5px solid rgba(0, 0, 0, 0.5)'
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-1 bg-blue-500 text-white disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};