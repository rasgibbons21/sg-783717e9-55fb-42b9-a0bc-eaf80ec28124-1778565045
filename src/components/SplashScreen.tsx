'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const t = setTimeout(onComplete, 1800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#07080C',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{
        textAlign: 'center',
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={{ fontFamily: "'Inter',system-ui,sans-serif", fontWeight: 800, fontSize: 48, color: '#F3EDE3', letterSpacing: 4 }}>
          Radar
        </div>
        <div style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 10, letterSpacing: 4, color: '#27B7C8', textTransform: 'uppercase' as const, marginTop: 8, fontWeight: 500 }}>
          Stock Screener & Alerts
        </div>
      </div>
    </div>
  );
}
