import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import { SpeedInsights } from "@/components/speed-insights";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { META_THEME_COLORS, siteConfig } from "@/lib/config";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import "@/app/globals.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || siteConfig.url),
  description: siteConfig.description,
  keywords: ["Analytics", "Data", "Statistics", "Metrics", "Dashboard"],
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@ahmoin0",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.url}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={fontVariables} lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: required to prevent theme flash before hydration
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
        <meta content={META_THEME_COLORS.light} name="theme-color" />
      </head>
      <body
        className={cn(
          "group/body overscroll-none antialiased [--footer-height:--spacing(14)] [--header-height:--spacing(14)] lg:[--header-height:--spacing(16)] xl:[--footer-height:--spacing(24)]"
        )}
      >
        <ThemeProvider>
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster position="top-center" />
          </TooltipProvider>
          <TailwindIndicator />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
