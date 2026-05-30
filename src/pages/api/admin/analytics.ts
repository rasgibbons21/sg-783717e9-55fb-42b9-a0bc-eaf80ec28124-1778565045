import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { authorization } = req.headers;
  
  if (authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Total registered users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // New signups by period
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const monthStart = new Date(now.setDate(1)).toISOString();
    const yearStart = new Date(now.setMonth(0, 1)).toISOString();

    const { count: signupsToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    const { count: signupsWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart);

    const { count: signupsMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart);

    const { count: signupsYear } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yearStart);

    // Subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');

    const proUsers = subscriptions?.length || 0;
    const freeUsers = (totalUsers || 0) - proUsers;

    // MRR calculation
    const monthlyRevenue = subscriptions?.reduce((sum, sub) => {
      if (sub.plan === 'monthly') return sum + 7.99;
      if (sub.plan === 'yearly') return sum + (57.99 / 12);
      return sum;
    }, 0) || 0;

    // Broker clicks
    const { data: brokerClicks } = await supabase
      .from('broker_clicks')
      .select('*');

    const brokerStats: Record<string, number> = {};
    brokerClicks?.forEach(click => {
      brokerStats[click.broker_name] = (brokerStats[click.broker_name] || 0) + 1;
    });

    // Most viewed stocks (from watchlist as proxy)
    const { data: watchlistData } = await supabase
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