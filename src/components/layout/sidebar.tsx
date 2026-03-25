"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useFileBrowserStore, type AppView } from "@/stores/file-browser-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAnalytics } from "@/hooks/use-analytics";
import { useConnections, useSwitchConnection } from "@/hooks/use-connections";
import { formatBytes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  { icon: Image, label: "Images", color: "text-purple-400" },
  { icon: Film, label: "Videos", color: "text-pink-400" },
  { icon: FileCode, label: "Code", color: "text-blue-400" },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] pl-3 pr-2 pb-2.5 text-sidebar-foreground/30">
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
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left cursor-pointer transition-colors hover:bg-sidebar-accent/50">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
          <Database size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-sidebar-foreground truncate">{activeConnection?.bucketName || "No bucket"}</p>
          <p className="text-[10px] truncate text-sidebar-foreground/35">{activeConnection?.name || "Connect a bucket"}</p>
        </div>
        <ChevronDown size={14} className={`shrink-0 text-sidebar-foreground/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute left-2 right-2 top-full mt-1 z-50 rounded-lg overflow-hidden bg-popover border shadow-xl">
            <div className="p-1.5 max-h-[200px] overflow-y-auto">
              {connections?.map((conn) => (
                <button key={conn.id} type="button"
                  onClick={() => { if (!conn.isActive) switchConnection.mutate(conn.id); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-left cursor-pointer transition-colors hover:bg-accent text-sm">
                  <span className="font-medium text-foreground/80 truncate flex-1">{conn.name}</span>
                  <span className="text-xs font-mono text-muted-foreground truncate">{conn.bucketName}</span>
                  {conn.isActive && <Check size={13} className="text-primary" />}
                </button>
              ))}
            </div>
            <Separator />
            <div className="p-1.5">
              <button type="button" onClick={() => { onManage(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors hover:bg-accent text-muted-foreground">
                <Plus size={13} /> Add / manage buckets
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
  const { user, activeConnection, logout, isGuest } = useAuthStore();
  const { data: analytics } = useAnalytics(!!activeConnection);

  const usedStorage = analytics?.totalSize || 0;

  return (
    <TooltipProvider>
      <aside className="flex flex-col shrink-0 min-h-0 w-[var(--sidebar-width)] rounded-xl overflow-hidden bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-lg">
        {/* ── Brand ── */}
        <div className="px-5 pt-5 pb-4 shrink-0 border-b border-sidebar-border">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shadow-md">
              <Cloud size={21} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">R2 Manager</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1 text-sidebar-foreground/35">Cloudflare R2</p>
            </div>
          </div>
        </div>

        {/* ── Bucket Switcher ── */}
        {!isGuest && (
          <div className="px-3 pt-3 pb-2 shrink-0 border-b border-sidebar-border">
            <BucketSwitcher onManage={onManageConnections} />
          </div>
        )}

        {/* ── Search ── */}
        <div className="px-5 pt-4 pb-4 shrink-0 border-b border-sidebar-border">
          <Button variant="outline" className="w-full justify-start gap-3.5 h-12 text-sidebar-foreground/50 font-medium bg-sidebar-accent/30 border-sidebar-border hover:bg-sidebar-accent/60"
            onClick={() => setSearchOpen(true)}>
            <Search size={17} strokeWidth={2} className="shrink-0 opacity-80" />
            <span className="truncate">Search files...</span>
            <kbd className="ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded bg-sidebar-accent/50 font-mono font-semibold text-sidebar-foreground/30">
              ⌘F
            </kbd>
          </Button>
        </div>

        {/* ── Nav ── */}
        <ScrollArea className="flex-1 min-h-0">
          <nav className="px-5 py-4 flex flex-col gap-6">
            <div>
              <SectionLabel>Menu</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {PRIMARY_NAV.map(({ icon: Icon, label, view }) => {
                  const isActive = appView === view;
                  return (
                    <button key={label} type="button"
                      onClick={() => { setAppView(view); if (view === "objects") setPrefix(""); }}
                      className={`relative flex items-center gap-3 w-full h-11 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all
                        ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/70"}`}>
                      {isActive && (
                        <motion.span layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-full bg-sidebar-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-sidebar-primary/15" : "bg-sidebar-accent/30"}`}>
                        <Icon size={18} strokeWidth={isActive ? 2.25 : 1.85} />
                      </span>
                      {label}
                    </button>
                  );
                })}

                <button type="button" onClick={() => setAnalyticsOpen(true)}
                  className="flex items-center gap-3 w-full h-11 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/70">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/30">
                    <BarChart3 size={18} strokeWidth={1.85} />
                  </span>
                  Analytics
                </button>
              </div>
            </div>

            <Separator className="bg-sidebar-border" />

            <div>
              <SectionLabel>Quick filter</SectionLabel>
              <div className="flex flex-col gap-1">
                {CATEGORY_ITEMS.map(({ icon: Icon, label, color }) => (
                  <button key={label} type="button" onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-3 w-full h-10 px-3 rounded-lg text-sm font-medium cursor-pointer transition-all text-sidebar-foreground/45 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/65">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/30">
                      <Icon size={16} className={color} strokeWidth={1.85} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-sidebar-border" />

            <div className="mt-auto pt-1">
              <SectionLabel>Workspace</SectionLabel>
              <div className="flex flex-col gap-1 rounded-lg p-1.5 bg-black/15 border border-sidebar-border">
                <button type="button" onClick={onManageConnections}
                  className="flex items-center gap-3 w-full h-11 px-3 rounded-md text-sm font-semibold cursor-pointer transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/30"><Key size={17} strokeWidth={1.85} /></span>
                  Manage Buckets
                </button>
                <button type="button"
                  className="flex items-center gap-3 w-full h-11 px-3 rounded-md text-sm font-semibold cursor-pointer transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/30"><Settings size={17} strokeWidth={1.85} /></span>
                  Settings
                </button>
              </div>
            </div>
          </nav>
        </ScrollArea>

        {/* ── Storage ── */}
        {activeConnection && (
          <div className="px-5 pb-3 pt-3 shrink-0 border-t border-sidebar-border">
            <div className="rounded-lg p-4 bg-sidebar-accent/30 border border-sidebar-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center bg-sidebar-primary/15">
                    <HardDrive size={14} className="text-sidebar-primary" />
                  </div>
                  <span className="text-xs font-bold">Storage</span>
                </div>
                <span className="text-[10px] font-bold text-sidebar-foreground/25">{analytics?.totalObjects || 0} files</span>
              </div>
              <p className="text-xs font-semibold text-sidebar-foreground/30">{formatBytes(usedStorage)} used</p>
            </div>
          </div>
        )}

        {/* ── User ── */}
        <div className="px-5 pb-5 pt-2 shrink-0 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={`text-xs font-bold ${isGuest ? "bg-sidebar-accent" : "bg-primary text-primary-foreground"}`}>
                {isGuest ? "G" : user?.name?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{isGuest ? "Guest User" : user?.name}</p>
              <p className="text-[10px] truncate text-sidebar-foreground/30">{isGuest ? "Browser-only session" : user?.email}</p>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-sidebar-foreground/35 hover:text-sidebar-foreground/60" onClick={logout}>
                  <LogOut size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isGuest ? "Exit guest mode" : "Sign out"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
