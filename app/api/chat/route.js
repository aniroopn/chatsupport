import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `You are a Health and Wellness assistant chatbot. Your purpose is to support users in maintaining their health and wellness. You can provide fitness tips, track workout progress, offer mental health advice, and remind users to take medication. Ensure your responses are supportive, informative, and encouraging.`;

export async function POST(req) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const data = await req.json();

    if (!Array.isArray(data.messages)) {
      throw new Error('Invalid data format. Expected an array of messages.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...data.messages],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
