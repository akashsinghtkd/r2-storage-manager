"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Cloud, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, UserCircle } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-body)" }}>
      {/* ── Left panel: illustration / branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[540px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: "var(--bg-sidebar)" }}
      >
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[30%] -left-[20%] w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(91,92,240,0.5) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }} />
        </div>

        {/* Top: Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-2">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 8px 32px rgba(91,92,240,0.4)" }}
            >
              <Cloud size={22} color="white" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold text-white tracking-tight">R2 Manager</h1>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                Storage Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Feature highlights */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-4">
              Manage your cloud
              <br />
              storage with ease
            </h2>
            <p className="text-[14px] leading-relaxed max-w-[340px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Connect multiple Cloudflare R2 buckets, browse files, upload, download and manage everything from one beautiful dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Multi-bucket support", desc: "Switch between buckets instantly" },
              { label: "Drag & drop uploads", desc: "Upload files and folders with ease" },
              { label: "Real-time analytics", desc: "Storage insights at a glance" },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3.5"
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Sparkles size={14} style={{ color: "#a5b4fc" }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">{feature.label}</p>
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Cloudflare R2 Storage Manager
        </p>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 6px 20px var(--accent-glow)" }}
            >
              <Cloud size={20} color="white" strokeWidth={1.75} />
            </div>
            <span className="text-[16px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              R2 Manager
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[24px] font-extrabold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
              Welcome back
            </h2>
            <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-2.5 h-12 rounded-[var(--radius-lg)] text-[13px] font-semibold transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </a>
            <a
              href="/api/auth/github"
              className="flex items-center justify-center gap-2.5 h-12 rounded-[var(--radius-lg)] text-[13px] font-semibold transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <Separator.Root className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              or
            </span>
            <Separator.Root className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="rounded-[var(--radius-lg)] px-4 py-3.5 text-[13px] font-medium"
                style={{ background: "var(--danger-subtle)", color: "var(--danger)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)" }}
              >
                {error}
              </motion.div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold block" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <div
                className="relative rounded-[var(--radius-lg)] transition-all duration-200"
                style={{
                  boxShadow: focusedField === "email"
                    ? "0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)"
                    : "none",
                }}
              >
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: focusedField === "email" ? "var(--accent)" : "var(--text-muted)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-[var(--radius-lg)] text-[14px] font-medium outline-none transition-all"
                  style={{
                    background: "var(--bg-input)",
                    border: focusedField === "email" ? "1px solid var(--accent)" : "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <button type="button" className="text-[11px] font-semibold cursor-pointer" style={{ color: "var(--accent)" }}>
                  Forgot password?
                </button>
              </div>
              <div
                className="relative rounded-[var(--radius-lg)] transition-all duration-200"
                style={{
                  boxShadow: focusedField === "password"
                    ? "0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)"
                    : "none",
                }}
              >
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: focusedField === "password" ? "var(--accent)" : "var(--text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-[var(--radius-lg)] text-[14px] font-medium outline-none transition-all"
                  style={{
                    background: "var(--bg-input)",
                    border: focusedField === "password" ? "1px solid var(--accent)" : "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-[8px] transition-colors hover:bg-[var(--bg-surface-hover)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex items-center justify-center gap-2.5 w-full h-12 rounded-[var(--radius-lg)] text-[14px] font-bold text-white cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "0 10px 30px -5px var(--accent-glow), 0 0 0 1px rgba(255,255,255,0.1) inset",
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-[13px] mt-8" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-bold transition-colors hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Create one
            </a>
          </p>

          {/* Guest mode divider */}
          <div className="flex items-center gap-4 mt-6">
            <Separator.Root className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              or skip login
            </span>
            <Separator.Root className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <button
            type="button"
            onClick={() => {
              useAuthStore.getState().enterGuestMode({
                accountId: "",
                accessKeyId: "",
                secretAccessKey: "",
                bucketName: "",
              });
              router.push("/");
            }}
            className="flex items-center justify-center gap-2.5 w-full h-12 mt-4 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <UserCircle size={18} />
            Continue as Guest
          </button>
          <p className="text-center text-[11px] mt-2" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
            You&apos;ll enter your R2 credentials directly — nothing is saved to any server
          </p>
        </motion.div>
      </div>
    </div>
  );
}
