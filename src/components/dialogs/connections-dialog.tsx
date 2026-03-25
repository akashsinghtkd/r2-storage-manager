"use client";

import { useState } from "react";
import { useConnections, useCreateConnection, useSwitchConnection, useDeleteConnection } from "@/hooks/use-connections";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Database, Check, Trash2, Loader2, Eye, EyeOff, Server, ArrowRight, AlertCircle, CloudCog } from "lucide-react";

interface Props { open: boolean; onClose: () => void }

export function ConnectionsDialog({ open, onClose }: Props) {
  const { data: connections, isLoading } = useConnections();
  const createConnection = useCreateConnection();
  const switchConnection = useSwitchConnection();
  const deleteConnection = useDeleteConnection();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[580px] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary border border-primary/20">
              <CloudCog size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg">R2 Bucket Connections</DialogTitle>
              <DialogDescription className="mt-1">Connect and manage your Cloudflare R2 storage buckets</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading connections...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection cards */}
              {connections && connections.length > 0 && (
                <div className="space-y-2.5">
                  {connections.map((conn, i) => (
                    <motion.div key={conn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className={`flex items-center gap-4 p-4 ${conn.isActive ? "border-primary/30 bg-primary/5" : ""}`}>
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${conn.isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <Server size={17} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{conn.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            <span className="font-mono">{conn.bucketName}</span>
                            <span className="mx-1.5 opacity-40">&middot;</span>
                            <span className="font-mono">{conn.accountId.slice(0, 10)}...</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {conn.isActive ? (
                            <Badge variant="secondary" className="gap-1.5"><Check size={12} />Active</Badge>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => switchConnection.mutate(conn.id)}>Switch</Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => { if (confirm("Remove this connection?")) deleteConnection.mutate(conn.id); }}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty */}
              {connections?.length === 0 && !showAdd && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-muted border">
                    <Database size={28} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-base font-bold mb-1.5">No buckets connected yet</p>
                  <p className="text-sm text-muted-foreground max-w-[280px]">Add your Cloudflare R2 credentials below to start managing your storage</p>
                </motion.div>
              )}

              {connections && connections.length > 0 && !showAdd && <Separator className="my-2" />}

              {/* Add form or button */}
              <AnimatePresence mode="wait">
                {showAdd ? (
                  <AddConnectionForm key="form"
                    onSubmit={async (data) => { await createConnection.mutateAsync(data); setShowAdd(false); }}
                    onCancel={() => setShowAdd(false)}
                    loading={createConnection.isPending} />
                ) : (
                  <Button key="add-btn" variant="outline" className="w-full h-12 gap-2.5 border-dashed text-muted-foreground"
                    onClick={() => setShowAdd(true)}>
                    <Plus size={16} /> Add R2 Bucket Connection
                  </Button>
                )}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, accountId, accessKeyId, secretAccessKey, bucketName, publicUrl: publicUrl || undefined });
  };

  return (
    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}>
      <Card className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
            <Plus size={16} />
          </div>
          <div>
            <p className="text-sm font-bold">New R2 Connection</p>
            <p className="text-xs text-muted-foreground">Enter your Cloudflare R2 credentials</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg px-4 py-3 bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Find your R2 API credentials in <span className="font-bold text-foreground">Cloudflare Dashboard &rarr; R2 &rarr; Manage R2 API Tokens</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Connection Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Production bucket" />
          </div>
          <div className="space-y-1.5">
            <Label>Account ID</Label>
            <Input value={accountId} onChange={(e) => setAccountId(e.target.value)} required placeholder="5a7fcb06f..." className="font-mono text-xs" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Access Key ID</Label>
          <Input value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} required placeholder="a324547d68319..." className="font-mono text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label>Secret Access Key</Label>
          <div className="relative">
            <Input type={showSecret ? "text" : "password"} value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)} required
              placeholder="7c2a11d9c3b36c5ad..." className="font-mono text-xs pr-10" />
            <button type="button" onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground p-0.5 rounded">
              {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Bucket Name</Label>
            <Input value={bucketName} onChange={(e) => setBucketName(e.target.value)} required placeholder="my-bucket" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label>Public URL <span className="text-muted-foreground/60 font-normal">(optional)</span></Label>
            <Input value={publicUrl} onChange={(e) => setPublicUrl(e.target.value)} placeholder="https://pub-..." className="font-mono text-xs" />
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><Database size={14} /> Connect Bucket <ArrowRight size={14} /></>}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </Card>
    </motion.form>
  );
}
