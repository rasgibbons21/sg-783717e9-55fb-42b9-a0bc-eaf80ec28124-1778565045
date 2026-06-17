import Anthropic from '@anthropic-ai/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireProUser, sendAuthError } from '@/lib/requireProUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  try {
    const { message, ticker } = req.body;
    
    console.log("ANTHROPIC_API_KEY exists:", !!process.env.ANTHROPIC_API_KEY);
    console.log("Request received:", { message, ticker });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const result = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are Pansy, a warm and friendly investing expert for She Blooms Wealth. The user is viewing ${ticker}. Answer this: ${message}`
      }]
    });
    
    return res.status(200).json({ reply: (result.content[0] as {text?: string}).text });
  } catch (error: unknown) {
    console.error("Pansy route error:", error);
    return res.status(500).json({ error: (error as Error).message || String(error) });
  }
}