'use client';
import { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) { onComplete(); return; }
    sessionStorage.setItem('splashShown', 'true');

    const vid = videoRef.current;
    if (!vid) { onComplete(); return; }

    const handleEnd = () => {
      setFadeOut(true);
      setTimeout(onComplete, 600);
    };

    // Fallback: if video can't play or takes too long, skip after 8s
    const fallback = setTimeout(handleEnd, 8000);

    vid.addEventListener('ended', handleEnd);
    vid.play().catch(() => {
      // Autoplay blocked — skip splash
      clearTimeout(fallback);
      onComplete();
    });

    return () => {
      clearTimeout(fallback);
      vid.removeEventListener('ended', handleEnd);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#06060a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      <video
        ref={videoRef}
        src="/splash.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
