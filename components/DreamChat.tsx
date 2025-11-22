import React, { useState, useEffect, useRef } from 'react';
import { DreamAnalysis, ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat } from "@google/genai";

interface DreamChatProps {
  dreamContext: DreamAnalysis;
}

export const DreamChat: React.FC<DreamChatProps> = ({ dreamContext }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        const session = createChatSession(dreamContext);
        setChatSession(session);
        setMessages([{ 
            role: 'model', 
            text: `I've analyzed your dream about "${dreamContext.analysis.theme}". How does this interpretation resonate with you?` 
        }]);
    } catch (e) {
        console.error("Failed to init chat", e);
    }
  }, [dreamContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg });
      const responseText = result.text;
      
      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the ether right now. Please try again.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-mystic-600 text-white rounded-br-none' 
                  : 'bg-night-700 text-gray-200 rounded-bl-none border border-white/5'
              } ${msg.isError ? 'bg-red-900/50 text-red-200' : ''}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-night-700 rounded-2xl p-3 rounded-bl-none border border-white/5 flex gap-1 items-center">
              <div className="w-2 h-2 bg-mystic-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-mystic-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-mystic-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 bg-night-800 border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a symbol..."
            className="w-full bg-night-900 text-white text-sm rounded-full pl-4 pr-12 py-3 border border-mystic-500/20 focus:outline-none focus:border-mystic-500 transition-colors placeholder-gray-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 bg-mystic-500 rounded-full text-white hover:bg-mystic-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
