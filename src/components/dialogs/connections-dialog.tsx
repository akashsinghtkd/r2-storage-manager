"use client";

import { useState } from "react";
import { useConnections, useCreateConnection, useSwitchConnection, useDeleteConnection } from "@/hooks/use-connections";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import {
  X, Plus, Database, Check, Trash2, Loader2, Eye, EyeOff,
  Server, ArrowRight, AlertCircle, CloudCog,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ConnectionsDialog({ open, onClose }: Props) {
  const { data: connections, isLoading } = useConnections();
  const createConnection = useCreateConnection();
  const switchConnection = useSwitchConnection();
  const deleteConnection = useDeleteConnection();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "var(--bg-overlay)", backdropFilter: "blur(4px)" }}
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-[580px] max-h-[85vh] flex flex-col rounded-[var(--radius-xl)] overflow-hidden outline-none"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl), 0 0 0 1px var(--border-light)",
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-start justify-between px-7 pt-7 pb-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-subtle)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}
                >
                  <CloudCog size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <Dialog.Title className="text-[17px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    R2 Bucket Connections
                  </Dialog.Title>
                  <Dialog.Description className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
                    Connect and manage your Cloudflare R2 storage buckets
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] shrink-0 mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <Separator.Root className="mx-7" style={{ height: 1, background: "var(--border-light)" }} />

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>Loading connections...</p>
                </div>
              ) : (
                <>
                  {/* ── Connection cards ── */}
                  {connections && connections.length > 0 && (
                    <div className="space-y-2.5">
                      {connections.map((conn, i) => (
                        <motion.div
                          key={conn.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 px-5 py-4 rounded-[var(--radius-lg)] transition-all"
                          style={{
                            background: conn.isActive ? "var(--accent-subtle)" : "var(--bg-input)",
                            border: conn.isActive
                              ? "1px solid color-mix(in srgb, var(--accent) 25%, transparent)"
                              : "1px solid var(--border-light)",
                          }}
                        >
                          <div
                            className="w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center"
                            style={{
                              background: conn.isActive
                                ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                                : "var(--bg-surface)",
                              border: conn.isActive ? "none" : "1px solid var(--border-light)",
                            }}
                          >
                            <Server size={17} style={{ color: conn.isActive ? "var(--accent)" : "var(--text-muted)" }} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                              {conn.name}
                            </p>
                            <p className="text-[12px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                              <span className="font-mono">{conn.bucketName}</span>
                              <span className="mx-1.5 opacity-40">·</span>
                              <span className="font-mono">{conn.accountId.slice(0, 10)}...</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {conn.isActive ? (
                              <span
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-[var(--radius)]"
                                style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
                              >
                                <Check size={13} strokeWidth={2.5} />
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => switchConnection.mutate(conn.id)}
                                className="text-[12px] font-bold px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)] active:scale-[0.97]"
                                style={{ color: "var(--accent)", border: "1px solid var(--border)" }}
                              >
                                Switch
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => { if (confirm("Remove this connection?")) deleteConnection.mutate(conn.id); }}
                              className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--danger-subtle)] active:scale-[0.95]"
                              style={{ color: "var(--text-muted)" }}
                              title="Remove connection"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── Empty state ── */}
                  {connections?.length === 0 && !showAdd && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center text-center py-12"
                    >
                      <div
                        className="w-16 h-16 rounded-[18px] flex items-center justify-center mb-5"
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                      >
                        <Database size={28} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                      </div>
                      <p className="text-[15px] font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                        No buckets connected yet
                      </p>
                      <p className="text-[13px] max-w-[280px]" style={{ color: "var(--text-muted)" }}>
                        Add your Cloudflare R2 credentials below to start managing your storage
                      </p>
                    </motion.div>
                  )}

                  {/* ── Separator ── */}
                  {connections && connections.length > 0 && !showAdd && (
                    <Separator.Root style={{ height: 1, background: "var(--border-light)" }} className="my-2" />
                  )}

                  {/* ── Add new / form ── */}
                  <AnimatePresence mode="wait">
                    {showAdd ? (
                      <AddConnectionForm
                        key="form"
                        onSubmit={async (data) => {
                          await createConnection.mutateAsync(data);
                          setShowAdd(false);
                        }}
                        onCancel={() => setShowAdd(false)}
                        loading={createConnection.isPending}
                      />
                    ) : (
                      <motion.button
                        key="add-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        type="button"
                        onClick={() => setShowAdd(true)}
                        className="flex items-center justify-center gap-2.5 w-full h-12 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-[0.99]"
                        style={{ border: "1.5px dashed var(--border)", color: "var(--text-muted)" }}
                      >
                        <Plus size={16} />
                        Add R2 Bucket Connection
                      </motion.button>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─────────────── Add Connection Form ─────────────── */

function AddConnectionForm({ onSubmit, onCancel, loading }: {
  onSubmit: (data: { name: string; accountId: string; accessKeyId: string; secretAccessKey: string; bucketName: string; publicUrl?: string }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, accountId, accessKeyId, secretAccessKey, bucketName, publicUrl: publicUrl || undefined });
  };

  const inputClasses = "w-full h-11 px-4 rounded-[var(--radius)] text-[13px] font-medium outline-none transition-all";

  const inputStyle = (field: string) => ({
    background: "var(--bg-surface)",
    border: focusedField === field ? "1px solid var(--accent)" : "1px solid var(--border)",
    color: "var(--text-primary)",
    boxShadow: focusedField === field ? "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)" : "none",
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] p-6 space-y-5"
      style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: "var(--accent-subtle)" }}
        >
          <Plus size={16} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>New R2 Connection</p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Enter your Cloudflare R2 credentials</p>
        </div>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-[var(--radius)] px-4 py-3"
        style={{ background: "color-mix(in srgb, var(--warning) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--warning) 20%, transparent)" }}
      >
        <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          You can find your R2 API credentials in the{" "}
          <span className="font-bold">Cloudflare Dashboard → R2 → Manage R2 API Tokens</span>
        </p>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Connection Name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Production bucket"
            onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
            className={inputClasses} style={inputStyle("name")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Account ID
          </label>
          <input value={accountId} onChange={(e) => setAccountId(e.target.value)} required placeholder="5a7fcb06f..."
            onFocus={() => setFocusedField("accountId")} onBlur={() => setFocusedField(null)}
            className={`${inputClasses} font-mono`} style={inputStyle("accountId")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
          Access Key ID
        </label>
        <input value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} required placeholder="a324547d68319..."
          onFocus={() => setFocusedField("accessKeyId")} onBlur={() => setFocusedField(null)}
          className={`${inputClasses} font-mono`} style={inputStyle("accessKeyId")} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
          Secret Access Key
        </label>
        <div className="relative">
          <input type={showSecret ? "text" : "password"} value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)} required
            placeholder="7c2a11d9c3b36c5ad..."
            onFocus={() => setFocusedField("secret")} onBlur={() => setFocusedField(null)}
            className={`${inputClasses} font-mono pr-11`} style={inputStyle("secret")} />
          <button type="button" onClick={() => setShowSecret(!showSecret)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-[6px] transition-colors hover:bg-[var(--bg-surface-hover)]"
            style={{ color: "var(--text-muted)" }}>
            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Bucket Name
          </label>
          <input value={bucketName} onChange={(e) => setBucketName(e.target.value)} required placeholder="my-bucket"
            onFocus={() => setFocusedField("bucket")} onBlur={() => setFocusedField(null)}
            className={`${inputClasses} font-mono`} style={inputStyle("bucket")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Public URL <span className="opacity-40 normal-case">(optional)</span>
          </label>
          <input value={publicUrl} onChange={(e) => setPublicUrl(e.target.value)} placeholder="https://pub-..."
            onFocus={() => setFocusedField("publicUrl")} onBlur={() => setFocusedField(null)}
            className={`${inputClasses} font-mono`} style={inputStyle("publicUrl")} />
        </div>
      </div>

      {/* Actions */}
      <Separator.Root style={{ height: 1, background: "var(--border-light)" }} className="my-1" />

      <div className="flex items-center gap-3 pt-1">
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="flex items-center justify-center gap-2 h-11 px-6 rounded-[var(--radius)] text-[13px] font-bold text-white cursor-pointer transition-all disabled:opacity-60"
          style={{ background: "var(--gradient-brand)", boxShadow: "0 6px 20px -4px var(--accent-glow)" }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <><Database size={14} /> Connect Bucket <ArrowRight size={14} /></>}
        </motion.button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 px-5 rounded-[var(--radius)] text-[13px] font-semibold cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
