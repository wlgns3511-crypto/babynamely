import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NameBlooms - Baby Name Meanings & Popularity';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
          NameBlooms
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>
          Baby Name Meanings & Popularity
        </div>
      </div>
    ),
    { ...size }
  );
}
