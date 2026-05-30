import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  
  if (authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    let csvContent = '';
    let filename = 'export.csv';

    if (type === 'brokers') {
      const { data } = await supabase
        .from('broker_clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      csvContent = 'Broker Name,User ID,Clicked At\n';
      data?.forEach(click => {
        csvContent += `"${click.broker_name}","${click.user_id}","${click.clicked_at}"\n`;
      });
      filename = 'broker-clicks.csv';
    } else if (type === 'users') {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      csvContent = 'Email,Full Name,Plan Type,Risk Tolerance,Created At\n';
      data?.forEach(user => {
        csvContent += `"${user.email}","${user.full_name || ''}","${user.plan_type}","${user.risk_tolerance || ''}","${user.created_at}"\n`;
      });
      filename = 'users.csv';
    } else if (type === 'subscriptions') {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      csvContent = 'User ID,Plan,Status,Payment Method,Created At\n';
      data?.forEach(sub => {
        csvContent += `"${sub.user_id}","${sub.plan}","${sub.status}","${sub.payment_method || ''}","${sub.created_at}"\n`;
      });
      filename = 'subscriptions.csv';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
}