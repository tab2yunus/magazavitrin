import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MağazaVitrin - Online Alışveriş Pazaryeri",
  description: "Türkiye'nin en büyük online alışveriş pazaryeri. Binlerce ürün, uygun fiyatlar, hızlı kargo.",
  keywords: ["online alışveriş", "pazaryeri", "e-ticaret", "alışveriş", "indirim"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MağazaVitrin - Online Alışveriş Pazaryeri",
    description: "Türkiye'nin en büyük online alışveriş pazaryeri",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
