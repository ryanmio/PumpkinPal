'use client';

export default function GlobalError({ error, reset }) {
  // You can customize the styling and structure of this page as needed
  return (
    <html>
      <head>
        <title>An Error Occurred</title>
        {/* Add any meta tags or links to CSS files here */}
      </head>
      <body style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Something went wrong!</h2>
        <p>We're sorry, there was an unexpected error. Please try again.</p>
        <button onClick={() => reset()} style={{ padding: '10px', marginTop: '20px' }}>
          Try again
        </button>
      </body>
    </html>
  );
}