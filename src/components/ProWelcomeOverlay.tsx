import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface ProWelcomeOverlayProps {
  onClose: () => void;
}

export function ProWelcomeOverlay({ onClose }: ProWelcomeOverlayProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger mount animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleBegin = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      router.push("/home");
    }, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#FAF7F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@400;500&display=swap');

        .screen {
          width: 100%;
          max-width: 440px;
          text-align: center;
        }

        .stage {
          position: relative;
          width: 280px;
          height: 280px;
          margin: 0 auto 8px;
        }

        .glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, rgba(212,175,106,.55), rgba(212,175,106,0) 62%);
          opacity: 0;
          animation: glow 3.4s ease-in-out 1.9s infinite;
        }

        .flower {
          position: relative;
          width: 100%;
          height: 100%;
          transform-origin: 50% 58%;
          animation: sway 6.5s ease-in-out 2s infinite;
        }

        .petal {
          transform-box: view-box;
          transform-origin: 200px 200px;
          animation: bloom .95s cubic-bezier(.22,.9,.3,1) backwards;
        }

        .core {
          transform-box: view-box;
          transform-origin: 200px 200px;
          animation: pop .55s ease .05s backwards;
        }

        @keyframes bloom {
          from {
            transform: rotate(var(--a)) scale(0);
            opacity: .2;
          }
          to {
            transform: rotate(var(--a)) scale(var(--s,1));
            opacity: 1;
          }
        }

        @keyframes pop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes glow {
          0%, 100% { opacity: .28; }
          50% { opacity: .6; }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-1.6deg); }
          50% { transform: rotate(1.6deg); }
        }

        .eyebrow {
          font-family: 'DM Sans';
          font-weight: 500;
          font-size: 12px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: #D4AF6A;
          opacity: 0;
          animation: rise .8s ease 1.6s forwards;
        }

        h1 {
          font-family: 'Cormorant Garamond';
          font-weight: 600;
          font-size: 42px;
          line-height: 1.08;
          margin: 10px 0 0;
          color: #2D4A3E;
          opacity: 0;
          animation: rise .8s ease 1.9s forwards;
        }

        .tagline {
          font-family: 'Cormorant Garamond';
          font-style: italic;
          font-weight: 500;
          font-size: 21px;
          color: #C4714A;
          margin-top: 10px;
          opacity: 0;
          animation: rise .8s ease 2.4s forwards;
        }

        .pansy {
          font-size: 15.5px;
          line-height: 1.6;
          color: #5c6b62;
          margin: 20px auto 0;
          max-width: 360px;
          opacity: 0;
          animation: rise .8s ease 2.9s forwards;
        }

        .cta {
          display: inline-block;
          margin-top: 28px;
          padding: 14px 30px;
          border: 0;
          border-radius: 999px;
          background: #C4714A;
          color: #fff;
          font-family: 'DM Sans';
          font-weight: 500;
          font-size: 15px;
          letter-spacing: .01em;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(196,113,74,.28);
          opacity: 0;
          animation: rise .8s ease 3.4s forwards;
          transition: transform .15s ease, box-shadow .15s ease;
        }

        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(196,113,74,.34);
        }

        @keyframes rise {
          to {
            opacity: 1;
            transform: none;
          }
        }

        .eyebrow, h1, .tagline, .pansy, .cta {
          transform: translateY(12px);
        }

        @media (prefers-reduced-motion: reduce) {
          .petal, .core {
            animation: none;
            transform: rotate(var(--a)) scale(var(--s,1));
          }
          .core {
            transform: scale(1);
          }
          .flower {
            animation: none;
          }
          .glow {
            animation: none;
            opacity: .4;
          }
          .eyebrow, h1, .tagline, .pansy, .cta {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="screen">
        <div className="stage">
          <div className="glow"></div>
          <div className="flower">
            <svg viewBox="0 0 400 400" aria-label="A flower blooming">
              <defs>
                <linearGradient id="outer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#D9A05B"/>
                  <stop offset="1" stopColor="#C4714A"/>
                </linearGradient>
                <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#EBD9B6"/>
                  <stop offset="1" stopColor="#D4AF6A"/>
                </linearGradient>
              </defs>

              {/* OUTER RING: 8 petals */}
              <g fill="url(#outer)">
                <path className="petal" style={{ "--a": "0deg", "--s": "1", animationDelay: ".30s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "45deg", "--s": "1", animationDelay: ".40s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "90deg", "--s": "1", animationDelay: ".50s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "135deg", "--s": "1", animationDelay: ".60s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "180deg", "--s": "1", animationDelay: ".70s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "225deg", "--s": "1", animationDelay: ".80s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "270deg", "--s": "1", animationDelay: ".90s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "315deg", "--s": "1", animationDelay: "1.0s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
              </g>

              {/* INNER RING: 8 petals, offset + smaller */}
              <g fill="url(#inner)">
                <path className="petal" style={{ "--a": "22deg", "--s": ".62", animationDelay: "1.1s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "67deg", "--s": ".62", animationDelay: "1.18s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "112deg", "--s": ".62", animationDelay: "1.26s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "157deg", "--s": ".62", animationDelay: "1.34s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "202deg", "--s": ".62", animationDelay: "1.42s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "247deg", "--s": ".62", animationDelay: "1.50s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "292deg", "--s": ".62", animationDelay: "1.58s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
                <path className="petal" style={{ "--a": "337deg", "--s": ".62", animationDelay: "1.66s" } as React.CSSProperties} d="M200,200 C166,150 171,94 200,56 C229,94 234,150 200,200 Z"/>
              </g>

              {/* CENTER */}
              <circle className="core" cx="200" cy="200" r="20" fill="#2D4A3E"/>
              <circle className="core" cx="200" cy="200" r="9" fill="#D4AF6A"/>
            </svg>
          </div>
        </div>

        <p className="eyebrow">Bloom Pro</p>
        <h1>Welcome to Bloom&nbsp;Pro</h1>
        <p className="tagline">Bloom where you are planted.</p>
        <p className="pansy">Hey girl — I'm so glad you're here. You just invested in <em>you</em>, and that's everything. From here on, I'll walk every step with you. Let's grow this, one bloom at a time.</p>
        <button className="cta" onClick={handleBegin}>
          Let's begin &nbsp;&rarr;
        </button>
      </div>
    </div>
  );
}