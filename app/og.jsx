// app/og.jsx
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const font = fetch(new URL('../../assets/Lato-Bold.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer(),
);

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          fontFamily: 'Lato',
        }}
      >
        <img
          src="https://pumpkinpal.app/images/logo512.png"
          alt="PumpkinPal Logo"
          width={200}
          height={200}
          style={{ marginBottom: 40 }}
        />
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16,
            color: '#FF6600',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 24, textAlign: 'center', color: '#333333' }}>
          GPC weigh-off history on PumpkinPal
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Lato',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  );
}