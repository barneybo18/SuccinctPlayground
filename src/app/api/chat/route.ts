import OpenAI from 'openai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('[CHAT_API_ERROR] OpenAI API key not found');
      return new Response('OpenAI API key not configured', { status: 500 });
    }

    const body = await req.json();
    const { messages } = body;

    // Validate messages input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages array is required and must not be empty', { 
        status: 400 
      });
    }

    // Ask OpenAI for a streaming chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Create a custom streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[CHAT_API_ERROR]', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return new Response('Invalid API key', { status: 401 });
      }
      if (error.status === 429) {
        return new Response('Rate limit exceeded', { status: 429 });
      }
      if (error.status === 400) {
        return new Response('Invalid request to OpenAI', { status: 400 });
      }
    }
    
    return new Response('Internal server error', { status: 500 });
  }
}