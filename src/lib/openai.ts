import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

// Get or create OpenAI client
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey
    });
  }
  
  return openaiClient;
}

// OpenAI Embeddings class
export class OpenAIEmbeddings {
  private client: OpenAI;
  private model: string;
  
  constructor(model: string = 'text-embedding-3-small') {
    this.client = getOpenAIClient();
    this.model = model;
  }
  
  // Generate embedding for a single text
  async embedText(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float'
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
  
  // Generate embeddings for multiple texts in batch
  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
        encoding_format: 'float'
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw error;
    }
  }
}

// Chat completion class
export class OpenAIChat {
  private client: OpenAI;
  private model: string;
  
  constructor(model: string = 'gpt-4o') {
    this.client = getOpenAIClient();
    this.model = model;
  }
  
  // Determine if sources should be shown for a given question and response
  async shouldShowSources(question: string, context: string): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an assistant that determines if a response to a user question should include sources from a book.
            
If the user's question is asking for specific information from the book, or if the response heavily relies on book content, respond with "yes".
If the user's question is conversational, a greeting, or doesn't require specific book knowledge, respond with "no".
Only respond with "yes" or "no", nothing else.`
          },
          {
            role: 'user',
            content: `User question: "${question}"

Response context from book: "${context.substring(0, 500)}..."

Should sources be shown? Answer only yes or no.`
          }
        ],
        temperature: 0.1,
        max_tokens: 5
      });
      
      const answer = response.choices[0]?.message?.content?.toLowerCase().trim() || '';
      return answer === 'yes';
    } catch (error) {
      console.error('Error determining if sources should be shown:', error);
      // Default to showing sources if there's an error
      return true;
    }
  }
  
  // Generate chat completion
  async generateChatResponse(
    prompt: string, 
    context: string, 
    options: {
      temperature?: number;
      max_tokens?: number;
      chatHistory?: Array<{role: 'user' | 'assistant' | 'system', content: string}>;
    } = {}
  ): Promise<string> {
    try {
      // Prepare messages array with system prompt
      const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [
        {
          role: 'system',
          content: `You are an AI assistant helping with questions about the book "SHAIPE: A guide to creating superhuman AI-powered employees through AI Operations in the enterprise".
            
When referencing information from the book, include citations like [Chapter X: Title, Section: Y].
Base your answers strictly on the provided context. If the answer is not in the context, say "I don't have enough information about that in the book."

IMPORTANT: If previous conversation history is provided, use it to maintain context and answer follow-up questions appropriately. Refer back to earlier exchanges when needed.

Be concise and helpful.`
        }
      ];

      // Add chat history if provided
      if (options.chatHistory && options.chatHistory.length > 0) {
        // Convert chat history to proper OpenAI message format
        const formattedHistory = options.chatHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }));
        messages.push(...formattedHistory);
      }

      // Add current user question
      messages.push({
        role: 'user',
        content: `The user has asked: "${prompt}"

Based on the following information from the book:

${context}`
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 500
      });
      
      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  }
}

export default {
  OpenAIEmbeddings,
  OpenAIChat
};
