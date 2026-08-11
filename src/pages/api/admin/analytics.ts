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
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

    const [todayRes, weekRes, monthRes, yearRes, proRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', yearStart),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_pro', true),
    ]);

    const proUsers = proRes.count || 0;
    const freeUsers = (totalUsers || 0) - proUsers;

    // Broker clicks (safe — table exists from migration)
    const { data: brokerClicks } = await supabaseAdmin
      .from('broker_clicks')
      .select('*');

    const brokerStats: Record<string, number> = {};
    (brokerClicks ?? []).forEach(click => {
      brokerStats[click.broker_name] = (brokerStats[click.broker_name] || 0) + 1;
    });

    // Watchlist — may not exist, handle gracefully
    let topStocks: [string, number][] = [];
    try {
      const { data: watchlistData } = await supabaseAdmin
        .from('watchlist')
        .select('ticker');

      if (watchlistData) {
        const stockViews: Record<string, number> = {};
        watchlistData.forEach((item: any) => {
          stockViews[item.ticker] = (stockViews[item.ticker] || 0) + 1;
        });
        topStocks = Object.entries(stockViews)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);
      }
    } catch {}

    res.status(200).json({
      overview: {
        totalUsers: totalUsers || 0,
        signupsToday: todayRes.count || 0,
        signupsWeek: weekRes.count || 0,
        signupsMonth: monthRes.count || 0,
        signupsYear: yearRes.count || 0,
        proUsers,
        freeUsers,
        mrr: "0.00",
      },
      brokers: brokerStats,
      stocks: topStocks,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
