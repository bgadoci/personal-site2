import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings, OpenAIChat } from '@/lib/openai';
import { findSimilarChunks } from '@/lib/embeddings';

// Define response type
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
    const { question } = body;
    
    // Validate input
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Question is required.' },
        { status: 400 }
      );
    }
    
    // Initialize OpenAI clients
    const embeddings = new OpenAIEmbeddings();
    const chat = new OpenAIChat();
    
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
    
    // Generate AI response with context
    const answer = await chat.generateChatResponse(question, context);
    
    // Format sources for the response
    const sources = relevantChunks.map(chunk => ({
      text: truncateText(chunk.content, 150),
      citation: chunk.citation.display_text,
      link: chunk.citation.url_path
    }));
    
    // Return the response
    return NextResponse.json({
      answer,
      sources
    } as ChatResponse);
    
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
