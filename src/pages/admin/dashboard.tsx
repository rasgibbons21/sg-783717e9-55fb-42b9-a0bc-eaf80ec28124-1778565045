/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
      router.push('/admin');
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{color:'white',padding:40}}>Loading...</div>;
  if (error) return <div style={{color:'red',padding:40}}>Error: {error}</div>;

  return (
    <div style={{background:'#06060a',minHeight:'100vh',color:'white',padding:40}}>
      <h1 style={{color:'#c8953a',marginBottom:8}}>🌸 Bloom Admin</h1>
      <p style={{color:'#666',marginBottom:32}}>Total users in profiles table: {users.length}</p>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:'1px solid #333'}}>
            <th style={{textAlign:'left',padding:'8px',color:'#c8953a'}}>Email / ID</th>
            <th style={{textAlign:'left',padding:'8px',color:'#c8953a'}}>Name</th>
            <th style={{textAlign:'left',padding:'8px',color:'#c8953a'}}>Risk</th>
            <th style={{textAlign:'left',padding:'8px',color:'#c8953a'}}>Onboarding</th>
            <th style={{textAlign:'left',padding:'8px',color:'#c8953a'}}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} style={{borderBottom:'1px solid #1a1a1a'}}>
              <td style={{padding:'8px',fontSize:12}}>{u.email || u.id}</td>
              <td style={{padding:'8px'}}>{u.full_name || u.name || '-'}</td>
              <td style={{padding:'8px'}}>{u.risk_tolerance || '-'}</td>
              <td style={{padding:'8px'}}>{u.onboarding_complete ? '✅' : '❌'}</td>
              <td style={{padding:'8px',fontSize:12}}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p style={{color:'#666',marginTop:20}}>No profiles found. Check if profiles table exists in Supabase.</p>}
    </div>
  );
}