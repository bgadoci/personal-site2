"use client";

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ArrowPathIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import SourceCitation from '@/app/book/chat/SourceCitation';

// Define types for chat messages
type MessageRole = 'user' | 'assistant' | 'system';

type Source = {
  text: string;
  citation: string;
  link: string;
};

type Message = {
  role: MessageRole;
  content: string;
  sources?: Source[];
  timestamp: Date;
};

export default function ChatInterface() {
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Ask me anything about the book "SHAIPE: A guide to creating superhuman AI-powered employees through AI Operations in the enterprise".',
      timestamp: new Date()
    }
  ]);
  
  // State for user input
  const [input, setInput] = useState('');
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  
  // Ref for message container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the book chat API
      const response = await fetch('/api/book-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get a response');
      }
      
      const data = await response.json();
      
      // Add assistant message to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error in chat:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <BookOpenIcon className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Chat with SHAIPE</h2>
        </div>
        <Link 
          href="/book" 
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Back to Book
        </Link>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-slate-800 dark:text-slate-200' 
                  : message.role === 'system'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 italic'
                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Show sources if available */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Sources:
                  </p>
                  <div className="space-y-2">
                    {message.sources.map((source, idx) => (
                      <SourceCitation key={idx} source={source} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Message timestamp */}
              <div className="text-right mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-emerald-500 animate-spin" />
                <p className="text-slate-600 dark:text-slate-300">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}
        
        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the book..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
