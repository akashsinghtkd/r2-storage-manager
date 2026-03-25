import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free R2 Storage Manager account. Connect your Cloudflare R2 buckets and start managing cloud storage instantly. No credit card required.",
  alternates: { canonical: "/signup" },
  openGraph: {
    title: "Create Your R2 Storage Manager Account",
    description: "Free cloud storage management for Cloudflare R2. Sign up in seconds with email, Google, or GitHub.",
    url: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
