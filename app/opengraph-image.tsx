import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NameBlooms - Baby Name Meanings and Popularity';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#7c3aed', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, marginBottom: 16 }}>NameBlooms</div>
        <div style={{ display: 'flex', fontSize: 32, opacity: 0.9 }}>Baby Name Meanings and Popularity</div>
      </div>
    ),
    { ...size }
  );
}
