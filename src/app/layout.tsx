import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Root } from "@/components/parts/video-player";
import { ClerkProvider } from "@clerk/nextjs";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kirinukist.com"),
  title: "Kirinukist - YouTube Clip Platform",
  description: "お気に入りのYouTubeクリップを収集、整理、共有できるプラットフォーム。Kirinukistで最高の動画体験を。",
  keywords: ["YouTube", "切り抜き", "クリップ", "プレイリスト", "動画共有", "Kirinukist", "Kirinuki", "clip"],

  authors: [{ name: "imaimai17468" }],
  openGraph: {
    title: "Kirinukist - YouTube Clip Platform",
    description: "お気に入りのYouTubeクリップを収集、整理、共有できるプラットフォーム。Kirinukistで最高の動画体験を。",
    url: "https://kirinukist.com",
    siteName: "Kirinukist",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Kirinukist - YouTube Clip Platform",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kirinukist - YouTube Clip Platform",
    description: "お気に入りのYouTubeクリップを収集、整理、共有できるプラットフォーム。Kirinukistで最高の動画体験を。",
    images: ["/twitter-image.png"],
  },
  robots: "index, follow",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <MainLayout>
              <Root />
              {children}
            </MainLayout>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
