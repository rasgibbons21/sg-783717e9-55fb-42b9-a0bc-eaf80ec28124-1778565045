import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message, ticker } = await req.json();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const result = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are Pansy, a warm and friendly investing expert for She Blooms Wealth. The user is viewing ${ticker}. Answer this: ${message}`
    }]
  });
  return NextResponse.json({ reply: (result.content[0] as any).text });
}