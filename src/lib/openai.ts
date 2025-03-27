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
  
  // Generate chat completion
  async generateChatResponse(
    prompt: string, 
    context: string, 
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping with questions about the book "SHAIPE: A guide to creating superhuman AI-powered employees through AI Operations in the enterprise".
            
When referencing information from the book, include citations like [Chapter X: Title, Section: Y].
Base your answers strictly on the provided context. If the answer is not in the context, say "I don't have enough information about that in the book."
Be concise and helpful.`
          },
          {
            role: 'user',
            content: `The user has asked: "${prompt}"

Based on the following excerpts from the book:

${context}`
          }
        ],
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
