// app/layout.js
import dynamic from 'next/dynamic';
import { Inter } from "next/font/google";
import "./globals.css";
import { GrowerContextProvider } from '../contexts/GrowerContext';
import { UserProvider } from '../contexts/UserContext';
import { DarkModeProvider } from '../contexts/DarkModeContext';

// Dynamically import the Sidebar component with SSR disabled
const Sidebar = dynamic(() => import('../src/components/Sidebar'), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <DarkModeProvider>
          <UserProvider>
            <GrowerContextProvider>
              <Sidebar /> {/* Sidebar now manages its own open/close state */}
              <div className="main-content flex-grow">
                {children}
              </div>
            </GrowerContextProvider>
          </UserProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
