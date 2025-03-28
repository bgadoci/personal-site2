import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/openai';
import { findSimilarChunks } from '@/lib/embeddings';
import { createOpenAIStream } from '@/lib/openai-stream';
import { OpenAIChat } from '@/lib/openai';

// Define types for chat messages and response
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatResponse = {
  answer: string;
  sources: {
    text: string;
    citation: string;
    link: string;
  }[];
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { question, stream = true, history = [] } = body;
    
    // Validate history if provided
    const chatHistory: ChatMessage[] = Array.isArray(history) ? history : [];
    
    // Debug: Log received chat history
    console.log('Received chat history:', chatHistory);
    
    // Validate input
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Question is required.' },
        { status: 400 }
      );
    }
    
    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings();
    
    // Generate embedding for the question
    const questionEmbedding = await embeddings.embedText(question);
    
    // Find relevant chunks using vector similarity
    const relevantChunks = await findSimilarChunks(questionEmbedding, 5);
    
    // If no relevant chunks found
    if (relevantChunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information about that in the book. Could you rephrase your question?",
        sources: []
      } as ChatResponse);
    }
    
    // Format book context from relevant chunks
    const bookContext = relevantChunks.map(chunk => {
      return `
From ${chunk.citation.display_text}:
"${chunk.content}"
`;
    }).join("\n\n");
    
    // We'll use the chat history directly in the OpenAI API call
    // But we'll also keep a text version for the non-streaming fallback
    const historyContext = chatHistory.length > 0 
      ? "\n\nPrevious conversation history (IMPORTANT - refer to this when answering follow-up questions):\n" + 
        chatHistory.map((msg: ChatMessage) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n")
      : "";
    
    // Debug: Log formatted history context
    console.log('Formatted history context:', historyContext);
    
    // For non-streaming fallback, combine book context and chat history as text
    const context = bookContext;
    
    // Format sources for the response
    const sources = relevantChunks.map(chunk => ({
      text: truncateText(chunk.content, 150),
      citation: chunk.citation.display_text,
      link: chunk.citation.url_path
    }));
    
    // Determine if sources should be shown
    const chat = new OpenAIChat();
    const shouldShowSources = await chat.shouldShowSources(question, context);
    
    // Only include sources if they should be shown
    const finalSources = shouldShowSources ? sources : [];
    
    // If streaming is requested
    if (stream) {
      try {
        // Create a streaming response with chat history as separate messages
        const openAIStream = await createOpenAIStream(question, context, {
          chatHistory: chatHistory.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }))
        });
        
        // Return the stream along with the sources as a header
        const sourcesHeader = encodeURIComponent(JSON.stringify(finalSources));
        
        return new Response(openAIStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Sources': sourcesHeader
          }
        });
      } catch (streamError) {
        console.error('Error in streaming response:', streamError);
        // Fall back to non-streaming response
        return fallbackToNonStreaming(question, context, finalSources, streamError);
      }
    } else {
      // Non-streaming response (fallback)
      return fallbackToNonStreaming(question, context, finalSources, undefined, chatHistory);
    }
    
  } catch (error) {
    console.error('Error in book chat API:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your question.',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Fallback to non-streaming response
async function fallbackToNonStreaming(
  question: string, 
  context: string, 
  sources: any[], 
  error?: any,
  chatHistory?: ChatMessage[]
) {
  try {
    // Import OpenAIChat only when needed (for fallback)
    const { OpenAIChat } = await import('@/lib/openai');
    const chat = new OpenAIChat();
    
    // Generate AI response with context and chat history
    const answer = await chat.generateChatResponse(question, context, {
      chatHistory: chatHistory?.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))
    });
    
    // Return the response
    return NextResponse.json({
      answer,
      sources,
      streamed: false,
      fallbackReason: error ? (error instanceof Error ? error.message : 'Unknown error') : 'Streaming disabled'
    } as ChatResponse);
  } catch (fallbackError) {
    console.error('Error in fallback response:', fallbackError);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate a response.',
        message: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // Otherwise truncate at word boundary
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}
