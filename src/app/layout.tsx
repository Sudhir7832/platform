import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulseSync — Post Everywhere. Grow Faster.",
  description:
    "AI-powered multi-platform social media publishing dashboard. Create one post and publish it instantly to Instagram, X, Facebook, LinkedIn, TikTok, Pinterest, Threads, and more.",
  keywords: [
    "social media",
    "publishing",
    "dashboard",
    "AI",
    "scheduling",
    "analytics",
    "cross-posting",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#050510] text-[#f0f0f5] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
