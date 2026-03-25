import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to R2 Storage Manager to manage your Cloudflare R2 buckets. Email, Google, or GitHub login supported. Or continue as a guest.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Sign In to R2 Storage Manager",
    description: "Access your Cloudflare R2 storage dashboard. Multi-bucket management, file preview, analytics, and more.",
    url: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
