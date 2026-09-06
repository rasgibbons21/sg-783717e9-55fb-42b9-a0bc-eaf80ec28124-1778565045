import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';
import { CertificateGenerator } from '@/components/CertificateGenerator';
import { Loader2 } from 'lucide-react';

export default function AcademyCertificatePage() {
  const router = useRouter();
  const { course, level } = router.query;
  const [defaultName, setDefaultName] = useState('');
  const [certName, setCertName] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certId, setCertId] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/onboarding'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', session.user.id)
        .single();

      const name = data?.full_name || data?.email?.split('@')[0] || '';
      setDefaultName(name);
      setCertName(name);

      const res = await fetch('/api/certificate/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          course_id: course || 'investing-foundations',
          level: level || 'beginner',
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCertId(result.certificate_id);
      }

      setLoading(false);
    })();
  }, [router.isReady, course, level, router]);

  const courseTitle: Record<string, string> = {
    'investing-foundations': 'Bloom Investing Foundations',
    'advanced-trading': 'Advanced Trading Mastery',
    'options-strategies': 'Options Trading Strategies',
    'budget-basics': 'Budget Basics',
    'side-hustles': 'Side Hustle Blueprint',
    'trade-fundamentals': 'Trade Fundamentals',
  };

  const title = courseTitle[course as string] || 'Bloom Academy Course';
  const certificateLevel = (level as 'beginner' | 'advanced') || 'beginner';

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0E1B30' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#27B7C8]" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Your Certificate - She Blooms Wealth</title>
      </Head>

      <div className="min-h-screen p-4 sm:p-8" style={{ background: '#0E1B30' }}>
        <div className="max-w-6xl mx-auto">
          {!nameConfirmed ? (
            /* ── Name input step ── */
            <div className="max-w-md mx-auto mt-16 text-center">
              <div style={{ fontSize: 64 }} className="mb-4">&#127800;</div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: '#F4F7FA', fontFamily: 'Georgia, serif' }}
              >
                Congratulations!
              </h1>
              <p className="text-sm mb-8" style={{ color: 'rgba(244,247,250,0.6)' }}>
                You&apos;ve completed <strong style={{ color: '#27B7C8' }}>{title}</strong>.
                Enter the name you&apos;d like on your certificate.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Your name for the certificate"
                  className="w-full px-4 py-3.5 rounded-xl text-center text-lg font-semibold outline-none transition-all focus:ring-2"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#F4F7FA',
                    fontFamily: 'Georgia, serif',
                    caretColor: '#D4AF37',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(201,168,76,0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(201,168,76,0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                <button
                  onClick={() => {
                    if (certName.trim()) setNameConfirmed(true);
                  }}
                  disabled={!certName.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C, #D4AF37)',
                    color: '#0E1B30',
                  }}
                >
                  Generate My Certificate
                </button>

                {defaultName && defaultName !== certName && (
                  <button
                    onClick={() => setCertName(defaultName)}
                    className="text-xs transition-colors hover:brightness-125"
                    style={{ color: 'rgba(244,247,250,0.4)' }}
                  >
                    Use my account name: {defaultName}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Certificate view ── */
            <>
              <div className="text-center mb-8">
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: '#F4F7FA', fontFamily: 'Georgia, serif' }}
                >
                  Your Certificate
                </h1>
                <p style={{ color: 'rgba(244,247,250,0.5)' }} className="text-sm">
                  Download or share your achievement
                </p>
              </div>

              <CertificateGenerator
                userName={certName.trim()}
                courseTitle={title}
                level={certificateLevel}
                completionDate={new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                certificateId={certId || `BLOOM-${new Date().getFullYear()}-PENDING`}
              />

              <div className="mt-10 text-center space-y-3">
                <button
                  onClick={() => setNameConfirmed(false)}
                  className="text-xs transition-colors hover:brightness-125"
                  style={{ color: 'rgba(244,247,250,0.4)' }}
                >
                  Change name on certificate
                </button>
                <div>
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-2 font-semibold hover:underline"
                    style={{ color: '#27B7C8' }}
                  >
                    Back to Academy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
