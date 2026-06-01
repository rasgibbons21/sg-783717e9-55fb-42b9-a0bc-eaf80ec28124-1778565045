 
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

export default function AuthConfirm() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/home');
      }
    });
  }, [router]);

  return (
    <div style={{background:'#06060a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:60}}>🌸</div>
        <h2>Confirming your account...</h2>
        <p style={{color:'#666'}}>Please wait a moment</p>
      </div>
    </div>
  );
}