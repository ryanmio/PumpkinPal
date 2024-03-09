// app/layout.js
import dynamic from 'next/dynamic';
import { Inter } from "next/font/google";
import 'chart.js/auto';
import "./globals.css";
import { GrowerContextProvider } from '../contexts/GrowerContext';
import { UserProvider } from '../contexts/UserContext';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from "@vercel/speed-insights/next"

// Dynamic import for Sidebar
const Sidebar = dynamic(() => import('../src/components/Sidebar'), { ssr: false });

// Dynamically import the initFacebookSdk function for client-side execution
const initFacebookSdk = dynamic(
  () => import('../app/utilities/facebookSdkInit'),
  { ssr: false }
);

// Google font
const inter = Inter({ subsets: ["latin"] });

// Metadata for the page, to be managed with the Metadata API
export const metadata = {
  title: 'PumpkinPal: Your Pumpkin Growing Companion App',
  description: 'PumpkinPal is a user-friendly, open-source application designed for serious pumpkin growers. Calculate and track the weight of your pumpkins using the OTT method, manage your pumpkins and measurements, and view detailed data all in one place.',
  keywords: 'PumpkinPal, Pumpkin Growing, OTT Weight Calculation, Pumpkin Management, Measurement Management, Pumpkin Detail View, User Profile, Real-Time Updates, Data Backup',
  og: {
    title: 'PumpkinPal: Your Pumpkin Growing Companion',
    description: 'PumpkinPal is a user-friendly, open-source application designed for serious pumpkin growers. Calculate and track the weight of your pumpkins using the OTT method, manage your pumpkins and measurements, and view detailed data all in one place.',
    image: '/images/metashare.png',
    url: 'https://pumpkinpal.app'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({ children }) {
  // Execute the Facebook SDK initialization function on the client side
  initFacebookSdk();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://pumpkinpal.app" />
        <meta name="theme-color" content="#80876E" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
        <title>{metadata.title}</title>
        {/* Metadata API can be used here for dynamic metadata */}
      </head>
      <body className={inter.className}>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <DarkModeProvider>
            <div className={`App font-lato flex flex-col min-h-screen`}>
              <UserProvider>
                <GrowerContextProvider>
                  <Sidebar />
                  <Toaster /> {/* Toast notifications available throughout the app */}
                  <div className="main-content flex-grow">
                    {children}
                  </div>
                </GrowerContextProvider>
              </UserProvider>
            </div>
          </DarkModeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_TRACKING_ID} />
        <SpeedInsights />
      </body>
    </html>
  );
}
