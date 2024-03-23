// app/api/og/route.js
import { ImageResponse } from '@vercel/og';

// Replace the config object with direct export of runtime
export const runtime = 'edge';

export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const rank = searchParams.get('rank');

  // Load the Lato font
  const font = await fetch(new URL('/assets/Lato-Bold.ttf', request.url)).then(res => res.arrayBuffer());

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
          backgroundColor: '#80876E',
          color: 'white',
        }}
      >
        <img
          src="https://pumpkinpal.app/logowide.png"
          alt="PumpkinPal Logo"
          width={400}
          height={128}
          style={{ marginBottom: 20 }}
        />
        <h1
          style={{
            fontSize: 72,
            fontFamily: 'Lato', // Specify the Lato font here
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 30, textAlign: 'center' }}>
          Global Rank: {rank}
        </p>
        <p style={{ fontSize: 24, textAlign: 'center', marginTop: 16 }}>
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
          data: font,
          style: 'normal',
        },
      ],
    },
  );
};