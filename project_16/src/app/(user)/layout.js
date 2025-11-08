import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
   default: "Find Doctors | Finding Doctors According to your need",
   template: "%s | Find Doctors"
  },
  description: "finding doctors according to your need. in this site doctors can be available",
  keywords: ["Laparoscopic Surgery", "Hearing Disorders", "Sinus Surgery", "Cataract Surgery", "Retina Disorders"],
  icons:{
   icon: "/images/testing.png"
  }
  
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
