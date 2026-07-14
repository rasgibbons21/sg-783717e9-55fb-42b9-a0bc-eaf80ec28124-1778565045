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
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const monthStart = new Date(now.setDate(1)).toISOString();
    const yearStart = new Date(now.setMonth(0, 1)).toISOString();

    const { count: signupsToday } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    const { count: signupsWeek } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart);

    const { count: signupsMonth } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart);

    const { count: signupsYear } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yearStart);

    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');

    const proUsers = subscriptions?.length || 0;
    const freeUsers = (totalUsers || 0) - proUsers;

    const monthlyRevenue = subscriptions?.reduce((sum, sub) => {
      if (sub.plan === 'monthly') return sum + 7.99;
      if (sub.plan === 'yearly') return sum + (57.99 / 12);
      return sum;
    }, 0) || 0;

    const { data: brokerClicks } = await supabaseAdmin
      .from('broker_clicks')
      .select('*');

    const brokerStats: Record<string, number> = {};
    brokerClicks?.forEach(click => {
      brokerStats[click.broker_name] = (brokerStats[click.broker_name] || 0) + 1;
    });

    const { data: watchlistData } = await supabaseAdmin
      .from('watchlist')
      .select('ticker');

    const stockViews: Record<string, number> = {};
    watchlistData?.forEach(item => {
      stockViews[item.ticker] = (stockViews[item.ticker] || 0) + 1;
    });

    const topStocks = Object.entries(stockViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    res.status(200).json({
      overview: {
        totalUsers: totalUsers || 0,
        signupsToday: signupsToday || 0,
        signupsWeek: signupsWeek || 0,
        signupsMonth: signupsMonth || 0,
        signupsYear: signupsYear || 0,
        proUsers,
        freeUsers,
        mrr: monthlyRevenue.toFixed(2),
      },
      brokers: brokerStats,
      stocks: topStocks,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
