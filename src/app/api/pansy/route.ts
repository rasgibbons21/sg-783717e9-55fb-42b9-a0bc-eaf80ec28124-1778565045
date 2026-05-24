import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { message, ticker } = await req.json();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: `You are Pansy, a friendly investing expert. The user is asking about ${ticker}: ${message}` }]
  });
  
  const firstBlock = response.content[0];
  const reply = firstBlock && firstBlock.type === 'text' ? firstBlock.text : '';
  
  return NextResponse.json({ reply });
}