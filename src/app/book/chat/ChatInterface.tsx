"use client";

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ArrowPathIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import SourceCitation from '@/app/book/chat/SourceCitation';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import styles from './chat.module.css';

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
  id?: string; // Added for tracking streaming messages
};

// Function to format markdown content to HTML
const formatMarkdown = (content: string): string => {
  try {
    // Simple synchronous version for client-side rendering
    const processedContent = remark()
      .use(html)
      .use(remarkGfm)
      .processSync(content);
    
    return processedContent.toString();
  } catch (error) {
    console.error('Error formatting markdown:', error);
    return content; // Return original content if there's an error
  }
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
  
  // State to track if streaming has started
  const [isStreaming, setIsStreaming] = useState(false);
  
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
    setIsStreaming(false);
    setError(null);
    
    // Create a placeholder for the assistant's message
    const assistantMessageId = Date.now().toString();
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      id: assistantMessageId
    };
    
    // Add the empty assistant message to the chat
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      // Call the book chat API with streaming enabled
      const response = await fetch('/api/book-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input, stream: true }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get a response');
      }
      
      // Check if the response is a stream or JSON
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        // Get sources from header if available
        const sourcesHeader = response.headers.get('X-Sources');
        let sources = [];
        
        if (sourcesHeader) {
          try {
            sources = JSON.parse(decodeURIComponent(sourcesHeader));
          } catch (e) {
            console.error('Error parsing sources from header:', e);
          }
        }
        
        if (!reader) {
          throw new Error('Failed to get response reader');
        }
        
        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode the chunk and update the message content
          const chunk = decoder.decode(value, { stream: true });
          
          // Mark streaming as started when we get the first chunk
          if (!isStreaming) {
            setIsStreaming(true);
          }
          
          // Update the assistant message with the new chunk
          setMessages(prev => {
            return prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: msg.content + chunk,
                  sources: sources.length > 0 ? sources : msg.sources
                };
              }
              return msg;
            });
          });
        }
      } else {
        // Handle non-streaming JSON response (fallback)
        const data = await response.json();
        
        // Update the assistant message with the complete response
        setMessages(prev => {
          return prev.map(msg => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: data.answer,
                sources: data.sources
              };
            }
            return msg;
          });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error in chat:', err);
      
      // Remove the assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-3">
          <BookOpenIcon className="h-6 w-6 text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Chat with SHAIPE</h2>
        </div>
        <Link 
          href="/book" 
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
          Back to Book
        </Link>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          if (message.role === 'system') {
            // System message styled like a bot message
            return (
              <div key={index} style={{ display: "flex", width: "100%", marginBottom: "1rem", justifyContent: "flex-start", alignItems: "center", columnGap: "12px" }}>
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                </div>
                <div style={{ borderRadius: '0.5rem', padding: '12px 16px', maxWidth: '70%', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }} className="bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-200">
                  <div className={styles['markdown-content']} dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}></div>
                </div>
              </div>
            );
          } else if (message.role === 'user') {
            // User message (right side)
            return (
              <div key={index} style={{ display: "flex", width: "100%", marginBottom: "1rem", justifyContent: "flex-end", alignItems: "center", columnGap: "12px" }}>
                <div style={{ borderRadius: '0.5rem', padding: '12px 16px', maxWidth: '70%', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }} className="bg-emerald-500 text-white dark:bg-emerald-600">
                  <div className={styles['markdown-content']} dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}></div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            );
          } else {
            // Assistant message (left side) - only show if it has content
            if (message.content.trim() === '' && !isStreaming) {
              // Don't render empty assistant messages unless streaming
              return null;
            }
            
            return (
              <div key={index} style={{ display: "flex", width: "100%", marginBottom: "1rem", justifyContent: "flex-start", alignItems: "center", columnGap: "12px" }}>
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                </div>
                <div style={{ borderRadius: '0.5rem', padding: '12px 16px', maxWidth: '70%', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }} className="bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-200">
                  <div className={styles['markdown-content']} dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content || ' ') }}></div>
                  
                  {/* Show sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-300 dark:border-slate-600">
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
                </div>
              </div>
            );
          }
        })}
        
        {/* Loading indicator - only show when loading but not yet streaming */}
        {isLoading && !isStreaming && (
          <div style={{ display: "flex", width: "100%", marginBottom: "1rem", justifyContent: "flex-start", alignItems: "center", columnGap: "12px" }}>
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
            <div style={{ borderRadius: '0.5rem', padding: '12px 16px', maxWidth: '70%', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }} className="bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-200">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-emerald-500 animate-spin" />
                <p>Thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="flex justify-center w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm shadow-sm max-w-[85%]">
              {error}
            </div>
          </div>
        )}
        
        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the book..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shadow-sm"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
