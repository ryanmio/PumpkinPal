// app/layout.js
import dynamic from 'next/dynamic';
import { Inter as FontSans } from "next/font/google"; 
import 'chart.js/auto';
import "./globals.css";
import { GrowerContextProvider } from '../contexts/GrowerContext';
import { UserProvider } from '../contexts/UserContext';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { generateMetadata } from './utilities/generateMetadata'; // Updated import path

// Dynamic import for Sidebar
const Sidebar = dynamic(() => import('../components/Sidebar'), { ssr: false });

// Dynamically import the initFacebookSdk function for client-side execution
const initFacebookSdk = dynamic(
  () => import('../app/utilities/facebookSdkInit'),
  { ssr: false }
);

// Google font
const fontSans = FontSans({
  subsets: ["latin"],
  display: "swap",
});

// Metadata for the page, to be managed with the Metadata API
export const metadata = generateMetadata('Home'); // Example usage, you can customize the parameter based on the page

export default function RootLayout({ children }) {
  // Execute the Facebook SDK initialization function on the client side
  initFacebookSdk();

  return (
    <html lang="en" className={fontSans.className}>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <DarkModeProvider>
            <div className={`App flex flex-col min-h-screen`}>
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
