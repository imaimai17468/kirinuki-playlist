import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Root } from "@/components/parts/video-player";
import { TanstackProvider } from "@/components/providers/tanstack-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "Kirinukist - YouTube Clip Platform",
  description:
    "お気に入りのYouTubeクリップを収集、整理、共有できるプラットフォーム。Kirinuki Playlist（切り抜きプレイリスト）で最高の動画体験を。",
  keywords: ["YouTube", "切り抜き", "クリップ", "プレイリスト", "動画共有", "Kirinukist", "Kirinuki"],
  authors: [{ name: "imaimai17468" }],
  openGraph: {
    title: "Kirinukist - YouTube Clip Platform",
    description: "お気に入りのYouTubeクリップを収集、整理、共有できるプラットフォーム。",
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
    description: "お気に入りのYouTubeクリップを収集、整理、共有できるプラットフォーム。",
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
    <html lang="en">
      <body>
        <TanstackProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <MainLayout>
              <Root />
              {children}
            </MainLayout>
          </ThemeProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
