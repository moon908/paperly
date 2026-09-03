import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Lora } from "next/font/google";
import TopLoader from "@/components/TopLoader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paperly",
  description: "Simple, elegant note-taking application.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF7F2] text-[#1C1C1E]">
        <ClerkProvider>
          <Suspense fallback={null}>
          <TopLoader />
          </Suspense>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}