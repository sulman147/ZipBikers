import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  title: "ZipBikers | Fleet Console",
  description: "Ride. Earn. Repeat. — Admin console for the ZipBikers Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${lora.variable}`}>
      <body className="h-full min-h-full bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
