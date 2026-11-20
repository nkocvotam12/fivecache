import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FiveCache",
  description:
    "Accelerate your FiveM server with our global cache network. Reduce load times and improve player experience.",
  keywords: [
    "FiveM",
    "cache",
    "CDN",
    "server",
    "GTARP",
    "FiveCache",
    "performance",
    "gaming",
  ],
  authors: [{ name: "FiveCache" }],
  openGraph: {
    title: "Fivecache | Speed up your FiveM server in just 60 seconds",
    description: "Ultra-fast global CDN to serve your FiveM resources in a flash.",
    siteName: "FiveCache",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fivecache | Speed up your FiveM server in 60 seconds",
    description: "Ultra-fast global CDN to serve your FiveM resources in a flash.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#09090b", color: "#fafafa" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
