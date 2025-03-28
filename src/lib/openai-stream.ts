import { createParser, type EventSourceParser, type EventSourceMessage } from 'eventsource-parser';
import { OpenAIChat } from './openai';

export async function createOpenAIStream(
  prompt: string,
  context: string,
  options: {
    temperature?: number;
    max_tokens?: number;
    chatHistory?: Array<{role: 'user' | 'assistant' | 'system', content: string}>;
  } = {}
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const openai = new OpenAIChat();
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  // Make the request to OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping with questions about the book "SHAIPE: A guide to creating superhuman AI-powered employees through AI Operations in the enterprise".
          Use a combination of the book content and your own knowledge to answer questions.

IMPORTANT: If previous conversation history is provided, use it to maintain context and answer follow-up questions appropriately. Refer back to earlier exchanges when needed.`
        },
        // Include chat history as separate messages if provided
        ...(options.chatHistory?.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })) || []),
        {
          role: 'user',
          content: `The user has asked: "${prompt}"

Based on the following information from the book:

${context}`
        }
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 500,
      stream: true, // Enable streaming
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'An error occurred while streaming the response');
  }

  // Create a stream to parse the response
  const stream = new ReadableStream({
    async start(controller) {
      // Parse the streaming response
      const parser = createParser({
        onEvent(event: EventSourceMessage) {
          // OpenAI sends [DONE] when the stream is complete
          if (event.data === '[DONE]') {
            controller.close();
            return;
          }
          
          try {
            const json = JSON.parse(event.data);
            const text = json.choices[0]?.delta?.content || '';
            
            // Send the text chunk to the client
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      });
      
      // Process each chunk from the response
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
