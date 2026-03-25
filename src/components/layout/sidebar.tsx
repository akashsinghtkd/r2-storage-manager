"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useFileBrowserStore, type AppView } from "@/stores/file-browser-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAnalytics } from "@/hooks/use-analytics";
import { useConnections, useSwitchConnection } from "@/hooks/use-connections";
import { formatBytes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, LayoutDashboard, FolderOpen, Search, BarChart3,
  HardDrive, Image, Film, FileCode, Key, Settings,
  ChevronDown, Check, Plus, LogOut, Database,
} from "lucide-react";

interface NavItem { icon: typeof LayoutDashboard; label: string; view: AppView }

const PRIMARY_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: FolderOpen, label: "Objects", view: "objects" },
];

const CATEGORY_ITEMS = [
  { icon: Image, label: "Images", color: "var(--file-image)" },
  { icon: Film, label: "Videos", color: "var(--file-video)" },
  { icon: FileCode, label: "Code", color: "var(--file-code)" },
];

function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[10px] font-bold uppercase tracking-[0.18em] pl-3 pr-2 pb-2.5 ${className}`}
      style={{ color: "rgba(255,255,255,0.36)" }}
    >
      {children}
    </p>
  );
}

function BucketSwitcher({ onManage }: { onManage: () => void }) {
  const { activeConnection } = useAuthStore();
  const { data: connections } = useConnections();
  const switchConnection = useSwitchConnection();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[var(--radius-lg)] text-left cursor-pointer transition-all hover:bg-white/[0.07]"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
          style={{ background: "rgba(99,102,241,0.22)" }}
        >
          <Database size={14} style={{ color: "#a5b4fc" }} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white truncate">
            {activeConnection?.bucketName || "No bucket"}
          </p>
          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
            {activeConnection?.name || "Connect a bucket"}
          </p>
        </div>
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform"
          style={{ color: "rgba(255,255,255,0.35)", transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-2 right-2 top-full mt-1 z-50 rounded-[var(--radius-lg)] overflow-hidden"
            style={{
              background: "#1a1d26",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
          >
            <div className="p-1.5 max-h-[200px] overflow-y-auto">
              {connections?.map((conn) => (
                <button
                  key={conn.id}
                  type="button"
                  onClick={() => {
                    if (!conn.isActive) switchConnection.mutate(conn.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius)] text-left cursor-pointer transition-colors hover:bg-white/[0.07]"
                >
                  <span className="text-[12px] font-semibold text-white/80 truncate flex-1">
                    {conn.name}
                  </span>
                  <span className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {conn.bucketName}
                  </span>
                  {conn.isActive && <Check size={13} style={{ color: "#a5b4fc" }} />}
                </button>
              ))}
            </div>
            <div className="border-t border-white/[0.08] p-1.5">
              <button
                type="button"
                onClick={() => { onManage(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius)] text-[12px] font-semibold cursor-pointer transition-colors hover:bg-white/[0.07]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <Plus size={13} />
                Add / manage buckets
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ onManageConnections }: { onManageConnections: () => void }) {
  const { appView, setAppView, setPrefix, setSearchOpen, setAnalyticsOpen } = useFileBrowserStore();
  const { user, activeConnection, logout } = useAuthStore();
  const { data: analytics } = useAnalytics(!!activeConnection);

  const usedStorage = analytics?.totalSize || 0;

  return (
    <aside
      className="sidebar-shell flex flex-col shrink-0 min-h-0 rounded-r-[var(--radius-xl)] overflow-hidden"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-sidebar)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center ring-1 ring-white/10"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 8px 24px var(--accent-glow)" }}
          >
            <Cloud size={21} color="white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-[16px] font-extrabold text-white tracking-tight leading-none">
              R2 Manager
            </h1>
            <p
              className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Cloudflare R2
            </p>
          </div>
        </div>
      </div>

      {/* ── Bucket Switcher ── */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-white/[0.06]">
        <BucketSwitcher onManage={onManageConnections} />
      </div>

      {/* ── Search ── */}
      <div className="px-5 pt-4 pb-4 shrink-0 border-b border-white/[0.05]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-3.5 w-full min-h-[48px] px-4 py-3 rounded-[var(--radius-lg)] text-[13px] cursor-pointer transition-colors hover:bg-white/[0.07]"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <Search size={17} strokeWidth={2} className="shrink-0 opacity-90" />
          <span className="font-medium truncate">Search files…</span>
          <kbd
            className="ml-auto shrink-0 text-[10px] px-2 py-1 rounded-[var(--radius)] font-mono font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.38)" }}
          >
            ⌘F
          </kbd>
        </motion.button>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav-scroll flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 py-4 min-h-0 flex flex-col gap-6">
        <div>
          <SectionLabel>Menu</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {PRIMARY_NAV.map(({ icon: Icon, label, view }) => {
              const isActive = appView === view;
              return (
                <motion.button
                  key={label}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAppView(view); if (view === "objects") setPrefix(""); }}
                  className="relative flex items-center gap-3 w-full min-h-[44px] px-3 py-2.5 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-all hover:bg-white/[0.05]"
                  style={{
                    background: isActive ? "var(--bg-sidebar-active)" : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.52)",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[58%] rounded-full"
                      style={{ background: "var(--gradient-brand)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.25 : 1.85} />
                  </span>
                  {label}
                </motion.button>
              );
            })}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnalyticsOpen(true)}
              className="flex items-center gap-3 w-full min-h-[44px] px-3 py-2.5 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-all hover:bg-white/[0.05]"
              style={{ color: "rgba(255,255,255,0.52)" }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.04]">
                <BarChart3 size={18} strokeWidth={1.85} />
              </span>
              Analytics
            </motion.button>
          </div>
        </div>

        <div className="h-px shrink-0 -mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />

        <div>
          <SectionLabel>Quick filter</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {CATEGORY_ITEMS.map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 w-full min-h-[42px] px-3 py-2.5 rounded-[var(--radius-lg)] text-[13px] font-medium cursor-pointer transition-all hover:bg-white/[0.05]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <Icon size={17} style={{ color }} strokeWidth={1.85} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px shrink-0 -mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />

        <div className="mt-auto pt-2">
          <SectionLabel>Workspace</SectionLabel>
          <div
            className="flex flex-col gap-1 rounded-[var(--radius-lg)] p-1.5"
            style={{
              background: "rgba(0,0,0,0.22)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              type="button"
              onClick={onManageConnections}
              className="flex items-center gap-3 w-full min-h-[46px] px-3 py-2.5 rounded-[var(--radius)] text-[13px] font-semibold cursor-pointer transition-all hover:bg-white/[0.07] active:bg-white/[0.09]"
              style={{ color: "rgba(255,255,255,0.68)" }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Key size={18} strokeWidth={1.85} />
              </span>
              <span className="text-left leading-snug">Manage Buckets</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full min-h-[46px] px-3 py-2.5 rounded-[var(--radius)] text-[13px] font-semibold cursor-pointer transition-all hover:bg-white/[0.07] active:bg-white/[0.09]"
              style={{ color: "rgba(255,255,255,0.68)" }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Settings size={18} strokeWidth={1.85} />
              </span>
              <span className="text-left leading-snug">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Storage ── */}
      {activeConnection && (
        <div className="px-5 pb-3 pt-3 shrink-0 border-t border-white/[0.06] bg-black/10">
          <div
            className="rounded-[var(--radius-lg)] p-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: "rgba(99,102,241,0.22)" }}>
                  <HardDrive size={14} style={{ color: "#a5b4fc" }} />
                </div>
                <span className="text-[12px] font-bold text-white">Storage</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                {analytics?.totalObjects || 0} files
              </span>
            </div>
            <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
              {formatBytes(usedStorage)} used
            </p>
          </div>
        </div>
      )}

      {/* ── User ── */}
      <div className="px-5 pb-5 pt-2 shrink-0 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: "var(--gradient-brand)", color: "white" }}
          >
            {user?.name?.slice(0, 2).toUpperCase() || "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-8 h-8 shrink-0 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/[0.08]"
            style={{ color: "rgba(255,255,255,0.4)" }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
