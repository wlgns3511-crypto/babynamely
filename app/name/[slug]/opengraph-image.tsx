import { ImageResponse } from 'next/og';
import { getNameBySlug, getAllNames } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllNames().slice(0, 1000).map((n) => ({ slug: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNameBySlug(slug);

  if (!n) {
    return new ImageResponse(
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#db2777', color: 'white', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 48 }}>NAMEBLOOMS</div>
      </div>,
      { ...size }
    );
  }

  const isBoy = n.gender === 'boy';
  const accentColor = isBoy ? '#2563eb' : '#db2777';
  const bgColor = isBoy ? '#eff6ff' : '#fdf2f8';
  const cardBg = isBoy ? '#dbeafe' : '#fce7f3';
  const cardBorder = isBoy ? '#bfdbfe' : '#fbcfe8';

  const details = [
    ...(n.origin ? [{ label: 'Origin', value: n.origin }] : []),
    { label: 'Gender', value: isBoy ? 'Boy' : 'Girl' },
    ...(n.peak_year ? [{ label: 'Peak Year', value: String(n.peak_year) }] : []),
    ...(n.peak_pct ? [{ label: 'Peak Popularity', value: (n.peak_pct * 100).toFixed(2) + '%' }] : []),
  ].slice(0, 4);

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: bgColor, fontFamily: 'sans-serif', padding: '48px 56px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 18, color: accentColor, fontWeight: 700, letterSpacing: 2 }}>NAMEBLOOMS</div>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 900, color: '#1e1e2e', marginTop: 8, lineHeight: 1 }}>
            {n.name}
          </div>
          {n.meaning && (
            <div style={{ display: 'flex', fontSize: 22, color: '#475569', marginTop: 10, fontStyle: 'italic' }}>
              &ldquo;{n.meaning}&rdquo;
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: cardBg, borderRadius: 16, padding: '16px 28px', border: `2px solid ${cardBorder}` }}>
          <div style={{ display: 'flex', fontSize: 14, color: accentColor, fontWeight: 600, marginBottom: 6 }}>Gender</div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 800, color: accentColor }}>{isBoy ? 'Boy' : 'Girl'}</div>
          {n.origin && (
            <div style={{ display: 'flex', fontSize: 16, color: '#64748b', marginTop: 4 }}>{n.origin} origin</div>
          )}
        </div>
      </div>

      {/* Detail cards */}
      {details.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'white', borderRadius: 12, padding: '18px 16px', border: `2px solid ${cardBorder}`, alignItems: 'center' }}>
              <div style={{ display: 'flex', fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{d.label}</div>
              <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: '#1e1e2e', textAlign: 'center' }}>{d.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Accent bar */}
      <div style={{ display: 'flex', height: 8, borderRadius: 4, backgroundColor: accentColor, marginTop: 'auto', marginBottom: 16 }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#94a3b8' }}>
        <div style={{ display: 'flex', color: accentColor, fontWeight: 600 }}>nameblooms.com</div>
        <div>Baby Names · Meanings · Origins · Popularity</div>
      </div>
    </div>,
    { ...size }
  );
}
