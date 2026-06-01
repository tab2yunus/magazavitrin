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
  title: "MağazaVitrin - Motosiklet Yedek Parça Pazaryeri",
  description: "Türkiye'nin en büyük motosiklet yedek parça pazaryeri. Orijinal yedek parça, güvenli alışveriş ve hızlı kargo avantajıyla binlerce motosiklet parçasını keşfedin.",
  keywords: ["motosiklet yedek parça", "motosiklet parça", "orijinal yedek parça", "OEM parça", "moto parça", "pazaryeri"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MağazaVitrin - Motosiklet Yedek Parça Pazaryeri",
    description: "Türkiye'nin en büyük motosiklet yedek parça pazaryeri",
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
