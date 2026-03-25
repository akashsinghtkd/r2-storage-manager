"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { formatBytes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, HardDrive, FileText, Loader2, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6", "#3b82f6", "#f97316"];

interface Props { open: boolean; onClose: () => void; }

export function AnalyticsDashboard({ open, onClose }: Props) {
  const { data, isLoading } = useAnalytics(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "var(--bg-overlay)" }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
              style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--gradient-brand)" }}>
                  <TrendingUp size={20} color="white" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Storage Analytics</h2>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>R2 bucket overview</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl cursor-pointer hover:bg-[var(--bg-surface-hover)]"><X size={17} /></button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
              </div>
            ) : data ? (
              <div className="p-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: HardDrive, label: "Total Size", value: formatBytes(data.totalSize) },
                    { icon: FileText, label: "Total Files", value: data.totalObjects.toLocaleString() },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-5 rounded-xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                          <Icon size={14} style={{ color: "var(--accent)" }} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
                      </div>
                      <div className="text-2xl font-bold gradient-text">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Pie */}
                {data.typeBreakdown.length > 0 && (
                  <div className="p-5 rounded-xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <h3 className="text-[13px] font-bold mb-4">File Type Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={data.typeBreakdown} dataKey="size" nameKey="type" cx="50%" cy="50%"
                              outerRadius={75} innerRadius={35} paddingAngle={3}
                              label={({ name }) => name as string} fontSize={11}>
                              {data.typeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                            </Pie>
                            <Tooltip formatter={(v) => formatBytes(Number(v))}
                              contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2.5 flex flex-col justify-center">
                        {data.typeBreakdown.map((item, i) => (
                          <div key={item.type} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="font-medium">{item.type}</span>
                            </div>
                            <span style={{ color: "var(--text-muted)" }}>{item.count} · {formatBytes(item.size)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bar */}
                {data.topFiles.length > 0 && (
                  <div className="p-5 rounded-xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <h3 className="text-[13px] font-bold mb-4">Largest Files</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.topFiles.slice(0, 5)}>
                          <XAxis dataKey="key" tickFormatter={(k: string) => { const n = k.split("/").pop() || k; return n.length > 12 ? n.slice(0, 12) + "…" : n; }}
                            fontSize={11} tick={{ fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                          <YAxis tickFormatter={(v: number) => formatBytes(v)} fontSize={11} tick={{ fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v) => formatBytes(Number(v))}
                            contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
                          <Bar dataKey="size" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : <div className="p-10 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>Failed to load</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
