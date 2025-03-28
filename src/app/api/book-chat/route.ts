import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/openai';
import { findSimilarChunks } from '@/lib/embeddings';
import { createOpenAIStream } from '@/lib/openai-stream';

// Define response type for non-streaming responses
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
    const { question, stream = true } = body;
    
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
    
    // Format context for the AI
    const context = relevantChunks.map(chunk => {
      return `
From ${chunk.citation.display_text}:
"${chunk.content}"
`;
    }).join("\n\n");
    
    // Format sources for the response
    const sources = relevantChunks.map(chunk => ({
      text: truncateText(chunk.content, 150),
      citation: chunk.citation.display_text,
      link: chunk.citation.url_path
    }));
    
    // If streaming is requested
    if (stream) {
      try {
        // Create a streaming response
        const openAIStream = await createOpenAIStream(question, context);
        
        // Return the stream along with the sources as a header
        const sourcesHeader = encodeURIComponent(JSON.stringify(sources));
        
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
        return fallbackToNonStreaming(question, context, sources, streamError);
      }
    } else {
      // Non-streaming response (fallback)
      return fallbackToNonStreaming(question, context, sources);
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
  error?: any
) {
  try {
    // Import OpenAIChat only when needed (for fallback)
    const { OpenAIChat } = await import('@/lib/openai');
    const chat = new OpenAIChat();
    
    // Generate AI response with context
    const answer = await chat.generateChatResponse(question, context);
    
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
