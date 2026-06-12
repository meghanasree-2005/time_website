import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, HelpCircle, ArrowRight, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial friendly greeting from Aurelius
    return [
      {
        id: "welcome",
        role: "model",
        text: "Welcome to TIME, connoisseur. I am Aurelius, your Horology Concierge. How may I assist you with fine-tuning, bespoke calibrating, or exploring our new Sapphire design palette today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest advice
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Handle message submission
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Prepare conversational context history
    // Convert to client-to-server format
    const historyPayload = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      text: msg.text
    }));

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: "reply-" + Date.now(),
        role: "model",
        text: data.response || "I apologize, my calibration mechanism experiences minor lag. How else can I assist your design goals?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: "error-" + Date.now(),
        role: "model",
        text: "My apologies, my primary quartz signal disrupted. However, our master workshop remains open. Please guide me through your watch request!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Preset quick inquiries
  const PRESET_SUGGESTIONS = [
    { label: "✨ New Seasonal Palette?", query: "Tell me about your sapphire, royal blue, quick sand, swan wing, and shell stone colors." },
    { label: "💎 How to Customize?", query: "How do I customize a watch case engraving and strap?" },
    { label: "⌚ Best Skeleton Watch?", query: "Can you recommend a premium skeleton automatic watch?" },
    { label: "🚚 Shipping Zones?", query: "How is delivery shipping calculated for suburban or remote regions?" }
  ];

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="connoisseur-chatbot">
      {/* Floating Messenger Icon Button */}
      <button
        onClick={handleOpenToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-300 scale-100 hover:scale-110 active:scale-95 group cursor-pointer ${
          isOpen 
            ? "bg-sapphire text-quicksand border border-quicksand/40" 
            : "bg-sapphire text-swanwing hover:bg-royalblue border-2 border-quicksand"
        }`}
        title="Consult Aurelius Concierge"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-fade-in" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-quicksand animate-pulse bg-sapphire rounded-full p-0.5 border border-quicksand/50" />
            
            {hasUnread && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            )}
          </>
        )}
      </button>

      {/* Elegant Slide-Up Consulting Panel */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-84 sm:w-96 h-[500px] sm:h-[580px] bg-swanwing rounded-2xl border border-shellstone shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          
          {/* Header (Sapphire background, Quicksand accent, Swan Wing text) */}
          <div className="bg-sapphire p-4 text-swanwing flex items-center justify-between border-b border-quicksand/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-royalblue/50 border border-quicksand flex items-center justify-center text-quicksand font-bold text-xs">
                A
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold tracking-wider uppercase font-sans text-swanwing flex items-center gap-1">
                  <span>Aurelius</span>
                  <Sparkles className="w-3.5 h-3.5 text-quicksand" />
                </div>
                <div className="text-[10px] text-quicksand font-mono">TIME Horology Guide</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setMessages([
                    {
                      id: "welcome-reset",
                      role: "model",
                      text: "Workshop cleared. Standard alignment restored. How can Aurelius assist you now, collector?",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="p-1.5 hover:bg-white/10 rounded text-quicksand transition-colors cursor-pointer"
                title="Reset consultation session"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded text-swanwing/80 hover:text-swanwing transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Palette Mini-Banner (Premium brand layout detail) */}
          <div className="bg-shellstone px-3.5 py-1.5 border-b border-shellstone/60 text-[9px] text-[#4A4B4D] font-mono tracking-wider flex items-center justify-between gap-1">
            <span className="font-semibold text-sapphire">🎨 Seasonal Edition:</span>
            <div className="flex items-center gap-1">
              <span className="font-bold underline" title="Sapphire">Sapphire</span> &bull; <span className="font-bold underline" title="Shell Stone">Shell Stone</span> &bull; <span className="font-bold underline" title="Quick Sand">Quick Sand</span>
            </div>
          </div>

          {/* Chat Messages Body Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"} animate-fade-in`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left ${
                      isUser
                        ? "bg-royalblue text-swanwing rounded-tr-none"
                        : "bg-white border border-shellstone text-[#1A1A1A] rounded-tl-none shadow-sm"
                    }`}
                  >
                    {/* Preserve structured line breaks or bold tags for custom seasonal pallet answers */}
                    <div className="whitespace-pre-line space-y-1">
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 font-mono">{msg.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start max-w-[85%] space-y-1">
                <div className="p-3 bg-white border border-shellstone text-gray-500 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-quicksand rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-quicksand rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-quicksand rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                  <span>Aurelius is analyzing movement specs...</span>
                </div>
              </div>
            )}

            <div ref={listEndRef} />
          </div>

          {/* Preset Custom Suggestions Quick Bar */}
          <div className="px-3.5 py-2.5 bg-white border-t border-shellstone space-y-1.5">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-left flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-quicksand" />
              <span>Connoisseur Questions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS.map((preset, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => sendMessage(preset.query)}
                  className="px-2.5 py-1.5 bg-swanwing border border-shellstone hover:border-quicksand hover:bg-quicksand/10 text-[10px] text-sapphire font-semibold rounded-lg transition-colors cursor-pointer text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleFormSubmit} className="p-3.5 bg-white border-t border-shellstone flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Aurelius about sapphire, movements, customizer..."
              disabled={isLoading}
              className="flex-1 px-3 py-2.5 bg-swanwing border border-shellstone rounded-xl focus:border-quicksand focus:outline-none text-xs transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                inputValue.trim() && !isLoading
                  ? "bg-sapphire text-quicksand shadow-md hover:bg-royalblue"
                  : "bg-gray-100 text-gray-300 pointer-events-none"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
