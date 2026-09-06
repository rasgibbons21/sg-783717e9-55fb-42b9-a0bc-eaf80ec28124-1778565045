import { useState } from 'react';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  level: 'beginner' | 'advanced';
  completionDate: string;
  certificateId: string;
}

export const CertificateGenerator = ({
  userName,
  courseTitle,
  level,
  completionDate,
  certificateId,
}: CertificateProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('certificate-content');
      if (!element) return;

      const html2canvas = (await import('html2canvas')).default;
      const { default: jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFBF7',
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${userName}-${level}-certificate.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('certificate-content');
    if (!element) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#FFFBF7' });
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
      if (blob && navigator.share) {
        const file = new File([blob], 'bloom-certificate.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Bloom Certificate',
          text: `I earned my ${courseTitle} certificate on Bloom!`,
          files: [file],
        });
      }
    } catch { /* user cancelled */ }
  };

  const accentColor = level === 'beginner' ? '#27B7C8' : '#F59E0B';
  const borderColor = '#D4AF37';

  return (
    <div>
      <div
        id="certificate-content"
        className="w-full max-w-4xl mx-auto p-0 relative"
        style={{
          backgroundColor: '#FFFBF7',
          aspectRatio: '16/9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFBF7',
          }}
        />

        {/* Border */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: `3px solid ${borderColor}`,
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative Corners */}
        {[
          { top: '30px', left: '30px' },
          { top: '30px', right: '30px', transform: 'scaleX(-1)' },
          { bottom: '30px', left: '30px', transform: 'scaleY(-1)' },
          { bottom: '30px', right: '30px', transform: 'scale(-1)' },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              width: '80px',
              height: '80px',
              fontSize: '60px',
              opacity: 0.7,
              fontFamily: 'serif',
              color: borderColor,
            } as React.CSSProperties}
          >
            &#10048;
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 text-center px-16">
          {/* Logo */}
          <div className="mb-4">
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>&#127800;</div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0E1B30', letterSpacing: '2px' }}>
              BLOOM
            </p>
            <p style={{ fontSize: '12px', color: accentColor, letterSpacing: '1px', marginTop: '2px' }}>
              SHE BLOOMS WEALTH
            </p>
          </div>

          {/* Title */}
          <div className="mb-8">
            <p
              style={{
                fontSize: '14px',
                color: borderColor,
                letterSpacing: '3px',
                marginBottom: '8px',
              }}
            >
              &#10022; CERTIFICATE OF COMPLETION &#10022;
            </p>
            <div style={{ width: '120px', height: '1px', backgroundColor: borderColor, margin: '0 auto' }} />
          </div>

          {/* Recognition */}
          <p style={{ fontSize: '12px', color: '#0E1B30', marginBottom: '12px', letterSpacing: '1px' }}>
            THIS CERTIFICATE RECOGNIZES THAT
          </p>

          {/* User Name */}
          <h2
            style={{
              fontSize: '42px',
              color: '#0E1B30',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              marginBottom: '16px',
              letterSpacing: '2px',
            }}
          >
            {userName}
          </h2>

          {/* Divider */}
          <div style={{ width: '200px', height: '2px', backgroundColor: borderColor, margin: '0 auto 16px' }} />

          {/* Achievement */}
          <p style={{ fontSize: '12px', color: '#0E1B30', marginBottom: '8px', letterSpacing: '1px' }}>
            HAS SUCCESSFULLY COMPLETED
          </p>

          {/* Course Title */}
          <h3
            style={{
              fontSize: '28px',
              color: accentColor,
              fontWeight: 'bold',
              marginBottom: '16px',
              letterSpacing: '1px',
            }}
          >
            {courseTitle}
          </h3>

          {/* Description */}
          <p style={{ fontSize: '10px', color: '#0E1B30', marginBottom: '20px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 20px' }}>
            Demonstrating completion of educational modules covering investing fundamentals, stocks &
            ETFs, market concepts, chart reading, risk awareness, trading psychology and practical
            market education.
          </p>

          {/* Bottom Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '40px',
              marginTop: '24px',
              width: '100%',
              maxWidth: '500px',
              margin: '24px auto 0',
            }}
          >
            {/* Signature */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#0E1B30', fontStyle: 'italic' }}>Pansy</p>
              <div style={{ width: '60px', height: '1px', backgroundColor: borderColor, margin: '4px auto' }} />
              <p style={{ fontSize: '9px', color: borderColor, marginTop: '4px' }}>PANSY</p>
              <p style={{ fontSize: '8px', color: borderColor }}>Learning Guide</p>
            </div>

            {/* Seal */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', color: borderColor }}>&#10047;</div>
            </div>

            {/* Date */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#0E1B30', fontStyle: 'italic' }}>{completionDate}</p>
              <div style={{ width: '60px', height: '1px', backgroundColor: borderColor, margin: '4px auto' }} />
              <p style={{ fontSize: '9px', color: borderColor, marginTop: '4px' }}>DATE COMPLETED</p>
            </div>
          </div>

          {/* Certificate ID */}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '120px', fontSize: '10px' }}>
            <div>
              <p style={{ color: borderColor, letterSpacing: '1px' }}>CERTIFICATE ID</p>
              <p style={{ color: '#0E1B30', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {certificateId}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '8px', color: '#0E1B30', opacity: 0.6 }}>
                For educational achievement only —<br />
                not a professional or financial-services certification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="px-8 py-3 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0E1B30, #27B7C8)' }}
        >
          {isGenerating ? 'Generating PDF...' : 'Download Certificate'}
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-3 rounded-lg font-semibold border transition"
          style={{ color: '#27B7C8', borderColor: 'rgba(39,183,200,0.3)' }}
        >
          Share
        </button>
      </div>
    </div>
  );
};
