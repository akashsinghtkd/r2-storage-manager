import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthGuard } from "@/components/providers/auth-guard";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const themeInitScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");var dark=t==="dark"||(t==="system"||t==null)&&window.matchMedia("(prefers-color-scheme: dark)").matches;d.classList.toggle("dark",dark);}catch(e){}})();`;

const APP_NAME = "R2 Storage Manager";
const APP_DESCRIPTION = "Open-source multi-tenant SaaS platform for managing Cloudflare R2 cloud storage. Upload, browse, preview, and organize files across multiple R2 buckets with a beautiful dashboard. Built with Next.js, React, and TypeScript.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://r2manager.dev";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Manage Cloudflare R2 Storage`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Cloudflare R2", "R2 storage manager", "cloud storage", "S3 compatible",
    "file manager", "object storage", "R2 bucket manager", "Cloudflare dashboard",
    "file upload", "cloud file browser", "R2 API", "storage analytics",
    "drag and drop upload", "presigned URLs", "multi-tenant storage",
    "open source file manager", "Next.js storage app", "R2 GUI",
  ],
  authors: [{ name: "Akash Singh", url: "https://github.com/akashsinghtkd" }],
  creator: "Akash Singh",
  publisher: "Akash Singh",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Modern Cloudflare R2 File Manager`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Manage Cloudflare R2 Storage`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Modern Cloudflare R2 File Manager`,
    description: "Open-source SaaS platform to manage Cloudflare R2 storage. Multi-bucket, drag-drop uploads, file preview, analytics dashboard.",
    images: ["/og-image.png"],
    creator: "@akashsinghtkd",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Cloud Storage Management",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceef2" },
    { media: "(prefers-color-scheme: dark)", color: "#07080d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    description: APP_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Akash Singh",
      url: "https://github.com/akashsinghtkd",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "50",
    },
    featureList: [
      "Multi-bucket R2 management",
      "Drag and drop file uploads",
      "File preview (images, videos, PDFs, code)",
      "Storage analytics dashboard",
      "Presigned URL generation",
      "Dark/light theme",
      "Guest mode without registration",
      "Google and GitHub OAuth login",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={geist.variable} style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <QueryProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster
              richColors
              position="bottom-right"
              toastOptions={{
                style: {
                  borderRadius: "16px",
                  padding: "14px 18px",
                  fontSize: "13px",
                  fontWeight: 500,
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
