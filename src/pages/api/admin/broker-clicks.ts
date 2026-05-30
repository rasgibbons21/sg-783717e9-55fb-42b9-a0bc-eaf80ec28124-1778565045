import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  
  if (authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { data: clicks, error } = await supabase
        .from('broker_clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      if (error) throw error;

      // Group by broker
      const brokerData: Record<string, any> = {};
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
            dailyClicks: {} as Record<string, number>,
          };
        }

        brokerData[click.broker_name].totalClicks++;
        
        if (clickDate >= weekAgo) {
          brokerData[click.broker_name].thisWeek++;
        }
        
        if (clickDate >= monthAgo) {
          brokerData[click.broker_name].thisMonth++;
        }

        // Daily aggregation for charts
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}