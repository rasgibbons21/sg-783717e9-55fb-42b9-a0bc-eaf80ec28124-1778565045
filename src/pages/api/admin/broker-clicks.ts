import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { requireAdminUser, sendAuthError } from '@/lib/requireProUser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAdminUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (!supabaseServiceKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: clicks, error } = await supabaseAdmin
      .from('broker_clicks')
      .select('*')
      .order('clicked_at', { ascending: false });

    if (error) throw error;

    const brokerData: Record<string, { name: string; totalClicks: number; thisWeek: number; thisMonth: number; dailyClicks: Record<string, number> }> = {};
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    clicks?.forEach(click => {
      const clickDate = new Date(click.clicked_at);

      if (!brokerData[click.broker_name]) {
        brokerData[click.broker_name] = {
          name: click.broker_name,
          totalClicks: 0,
          thisWeek: 0,
          thisMonth: 0,
          dailyClicks: {},
        };
      }

      brokerData[click.broker_name].totalClicks++;

      if (clickDate >= weekAgo) {
        brokerData[click.broker_name].thisWeek++;
      }

      if (clickDate >= monthAgo) {
        brokerData[click.broker_name].thisMonth++;
      }

      const dateKey = clickDate.toISOString().split('T')[0];
      brokerData[click.broker_name].dailyClicks[dateKey] =
        (brokerData[click.broker_name].dailyClicks[dateKey] || 0) + 1;
    });

    const rankedBrokers = Object.values(brokerData)
      .sort((a, b) => b.totalClicks - a.totalClicks);

    res.status(200).json({ brokers: rankedBrokers, rawClicks: clicks });
  } catch (error) {
    console.error('Broker clicks error:', error);
    res.status(500).json({ error: 'Failed to fetch broker clicks' });
  }
}
