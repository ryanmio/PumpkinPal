// app/layout.js
import { useState } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { GrowerContextProvider } from '../contexts/GrowerContext';
import { UserProvider } from '../contexts/UserContext';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import Sidebar from '../components/Sidebar'; // Adjust the import path as necessary

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <DarkModeProvider>
          <UserProvider>
            <GrowerContextProvider>
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <div className={`main-content flex-grow ${isSidebarOpen ? 'open' : 'closed'}`} onClick={() => setIsSidebarOpen(false)}>
                {children}
              </div>
            </GrowerContextProvider>
          </UserProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
