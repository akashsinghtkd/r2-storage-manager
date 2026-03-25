import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthGuard } from "@/components/providers/auth-guard";
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

/** Runs before paint so `dark` matches localStorage / system — avoids theme flash (CLS). */
const themeInitScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");var dark=t==="dark"||(t==="system"||t==null)&&window.matchMedia("(prefers-color-scheme: dark)").matches;d.classList.toggle("dark",dark);}catch(e){}})();`;

export const metadata: Metadata = {
  title: "R2 Storage Manager",
  description: "Modern Cloudflare R2 Storage Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakarta.variable} style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
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
