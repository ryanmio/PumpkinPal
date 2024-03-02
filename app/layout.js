// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { GrowerContextProvider } from '../contexts/GrowerContext'; // Adjust the path as necessary
import { UserProvider } from '../contexts/UserContext'; // Adjust the path as necessary
import { DarkModeProvider } from '../contexts/DarkModeContext'; // Adjust the path as necessary

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <DarkModeProvider>
          <UserProvider>
            <GrowerContextProvider>
              {children}
            </GrowerContextProvider>
          </UserProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
