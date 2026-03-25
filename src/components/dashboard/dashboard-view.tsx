"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { formatBytes } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  HardDrive, FileText, FolderOpen, Activity,
  TrendingUp, ArrowUpRight, ArrowDownRight, Upload, Trash2, Eye,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { SkeletonDashboard } from "@/components/ui/skeleton";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6", "#3b82f6", "#f97316"];

// Simulated data for the area chart (storage over time)
const storageOverTime = [
  { date: "Jan", storage: 120 }, { date: "Feb", storage: 180 },
  { date: "Mar", storage: 240 }, { date: "Apr", storage: 310 },
  { date: "May", storage: 390 }, { date: "Jun", storage: 480 },
];

const recentActivity = [
  { icon: Upload, action: "Uploaded", target: "hero-banner.png", time: "2 min ago", color: "var(--accent)" },
  { icon: FolderOpen, action: "Created folder", target: "outputs/v2", time: "15 min ago", color: "var(--file-folder)" },
  { icon: Trash2, action: "Deleted", target: "old-backup.zip", time: "1 hour ago", color: "var(--danger)" },
  { icon: Eye, action: "Previewed", target: "product-shot.jpg", time: "2 hours ago", color: "var(--file-image)" },
  { icon: Upload, action: "Uploaded 5 files", target: "loras/", time: "3 hours ago", color: "var(--accent)" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function DashboardView() {
  const { data: analytics, isLoading } = useAnalytics(true);

  if (isLoading) return <SkeletonDashboard />;

  const stats = [
    {
      icon: HardDrive,
      label: "Storage Used",
      value: formatBytes(analytics?.totalSize || 0),
      change: "+12%",
      trend: "up" as const,
      color: "#6366f1",
      bgColor: "var(--accent-subtle)",
    },
    {
      icon: FolderOpen,
      label: "Buckets",
      value: "1",
      change: "Active",
      trend: "neutral" as const,
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.1)",
    },
    {
      icon: FileText,
      label: "Total Objects",
      value: (analytics?.totalObjects || 0).toLocaleString(),
      change: "+8",
      trend: "up" as const,
      color: "#8b5cf6",
      bgColor: "rgba(139,92,246,0.1)",
    },
    {
      icon: Activity,
      label: "Bandwidth",
      value: formatBytes((analytics?.totalSize || 0) * 0.3),
      change: "-3%",
      trend: "down" as const,
      color: "#14b8a6",
      bgColor: "rgba(20,184,166,0.1)",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain main-panel-scroll px-6 py-5 md:px-8 md:py-6 space-y-6"
      style={{ background: "var(--bg-body)" }}
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight">Dashboard</h2>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Overview of your R2 storage
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-[var(--radius)]"
          style={{ background: "var(--success-subtle)", color: "var(--success)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
          All systems operational
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="group p-5 rounded-[var(--radius-lg)] transition-all cursor-default"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: stat.bgColor }}>
                <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2} />
              </div>
              {stat.trend !== "neutral" && (
                <div className="flex items-center gap-0.5 text-[11px] font-bold"
                  style={{ color: stat.trend === "up" ? "var(--success)" : "var(--danger)" }}>
                  {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              )}
              {stat.trend === "neutral" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--success-subtle)", color: "var(--success)" }}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-[22px] font-bold tracking-tight leading-none mb-1">
              {stat.value}
            </p>
            <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Storage over time */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 p-6 rounded-[var(--radius-lg)]"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[14px] font-bold">Storage Usage</h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Last 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius)]"
              style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
              <TrendingUp size={12} /> Growing
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageOverTime}>
                <defs>
                  <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--border-light)" }} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: "var(--text-muted)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${v}MB`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  formatter={(v) => [`${Number(v)} MB`, "Storage"]}
                />
                <Area type="monotone" dataKey="storage" stroke="var(--accent)"
                  strokeWidth={2.5} fill="url(#storageGradient)" dot={false}
                  activeDot={{ r: 5, fill: "var(--accent)", strokeWidth: 2, stroke: "var(--bg-surface)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Type breakdown */}
        <motion.div
          variants={fadeUp}
          className="p-6 rounded-[var(--radius-lg)]"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
        >
          <h3 className="text-[14px] font-bold mb-1">File Types</h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>Distribution by size</p>

          {analytics?.typeBreakdown && analytics.typeBreakdown.length > 0 ? (
            <>
              <div className="h-[140px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.typeBreakdown} dataKey="size" nameKey="type"
                      cx="50%" cy="50%" outerRadius={60} innerRadius={32}
                      paddingAngle={3} strokeWidth={0}>
                      {analytics.typeBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatBytes(Number(v))}
                      contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {analytics.typeBreakdown.slice(0, 5).map((item, i) => (
                  <div key={item.type} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="font-semibold">{item.type}</span>
                    </div>
                    <span style={{ color: "var(--text-muted)" }}>{formatBytes(item.size)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-[12px]" style={{ color: "var(--text-muted)" }}>
              No data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row: Top files + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Largest files */}
        <motion.div
          variants={fadeUp}
          className="p-6 rounded-[var(--radius-lg)]"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
        >
          <h3 className="text-[14px] font-bold mb-1">Largest Files</h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>Top storage consumers</p>

          {analytics?.topFiles && analytics.topFiles.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topFiles.slice(0, 5)} layout="vertical" barCategoryGap={8}>
                  <XAxis type="number" fontSize={10} tick={{ fill: "var(--text-muted)" }}
                    tickFormatter={(v: number) => formatBytes(v)} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="key" width={100} fontSize={10}
                    tick={{ fill: "var(--text-secondary)" }} axisLine={false} tickLine={false}
                    tickFormatter={(k: string) => { const n = k.split("/").pop() || k; return n.length > 14 ? n.slice(0, 14) + "…" : n; }} />
                  <Tooltip formatter={(v) => formatBytes(Number(v))}
                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px" }} />
                  <Bar dataKey="size" fill="var(--accent)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-[12px]" style={{ color: "var(--text-muted)" }}>
              No files yet
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          variants={fadeUp}
          className="p-6 rounded-[var(--radius-lg)]"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
        >
          <h3 className="text-[14px] font-bold mb-1">Recent Activity</h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>Latest operations</p>

          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-colors hover:bg-[var(--bg-surface-hover)]"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">
                    <span style={{ color: "var(--text-secondary)" }}>{item.action}</span>{" "}
                    <span className="font-semibold">{item.target}</span>
                  </p>
                </div>
                <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-muted)" }}>
                  {item.time}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
