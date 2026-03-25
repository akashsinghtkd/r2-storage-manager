"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { useAuthStore } from "@/stores/auth-store";
import { useObjects } from "@/hooks/use-objects";
import { useUpload } from "@/hooks/use-upload";
import { useBulkOperations } from "@/hooks/use-bulk-operations";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { R2Object, SortField, SortDirection } from "@/types/r2";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Database, Plus, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toolbar } from "@/components/file-browser/toolbar";
import { GridView } from "@/components/file-browser/grid-view";
import { ListView } from "@/components/file-browser/list-view";
import { EmptyState } from "@/components/file-browser/empty-state";
import { ContextMenu } from "@/components/file-browser/context-menu";
import { DetailPanel } from "@/components/file-browser/detail-panel";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgressPanel } from "@/components/upload/upload-progress";
import { PreviewDialog } from "@/components/preview/preview-dialog";
import { RenameDialog } from "@/components/dialogs/rename-dialog";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { PresignDialog } from "@/components/dialogs/presign-dialog";
import { SearchDialog } from "@/components/dialogs/search-dialog";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { NewFolderDialog } from "@/components/dialogs/new-folder-dialog";
import { ConnectionsDialog } from "@/components/dialogs/connections-dialog";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SkeletonGrid, SkeletonList } from "@/components/ui/skeleton";

function sortItems(items: R2Object[], field: SortField, direction: SortDirection): R2Object[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "size": cmp = a.size - b.size; break;
      case "lastModified": cmp = (a.lastModified || "").localeCompare(b.lastModified || ""); break;
      case "type": cmp = (a.name.split(".").pop() || "").localeCompare(b.name.split(".").pop() || ""); break;
    }
    return direction === "asc" ? cmp : -cmp;
  });
}

function NoBucketState({ onConnect }: { onConnect: () => void }) {
  const { isGuest, enterGuestMode, updateGuestCredentials } = useAuthStore();

  const [accountId, setAccountId] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleGuestConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    const creds = { accountId, accessKeyId, secretAccessKey, bucketName };
    if (isGuest) updateGuestCredentials(creds); else enterGuestMode(creds);
    setTimeout(() => setConnecting(false), 500);
  };

  if (isGuest) {
    return (
      <div className="flex-1 flex min-h-0 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[520px] mx-auto"
        >
          <div className="text-center mb-8 sm:mb-10 px-1">
            <div className="mx-auto mb-5 sm:mb-6 w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
              <Database size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2.5 sm:mb-3 px-1">
              Connect your R2 bucket
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[42ch] mx-auto px-2">
              Credentials stored in your browser only — never sent to any server
            </p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6 sm:p-8 pt-7 sm:pt-8">
              <form onSubmit={handleGuestConnect} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label>Account ID</Label>
                    <Input value={accountId} onChange={(e) => setAccountId(e.target.value)} required placeholder="5a7fcb06f..." className="font-mono text-xs h-10" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label>Bucket Name</Label>
                    <Input value={bucketName} onChange={(e) => setBucketName(e.target.value)} required placeholder="my-bucket" className="font-mono text-xs h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Access Key ID</Label>
                  <Input value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} required placeholder="a324547d683..." className="font-mono text-xs h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Secret Access Key</Label>
                  <div className="relative">
                    <Input type={showSecret ? "text" : "password"} value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)}
                      required placeholder="7c2a11d9c3b36c..." className="font-mono text-xs h-10 pr-10" />
                    <button type="button" onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground p-0.5 rounded">
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="pt-1 sm:pt-2">
                  <Button type="submit" size="lg" disabled={connecting} className="w-full h-12 gap-2.5">
                    {connecting ? <Loader2 size={16} className="animate-spin" /> : <><Database size={16} /> Connect <ArrowRight size={15} /></>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="text-center max-w-[440px]">
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
            <Database size={36} className="text-primary" />
          </div>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }} className="absolute -inset-3 rounded-3xl bg-primary/10" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-3">Connect your first bucket</h2>
        <p className="text-sm leading-relaxed mb-8 max-w-[360px] mx-auto text-muted-foreground">
          Add your Cloudflare R2 credentials to start browsing, uploading, and managing your cloud storage.
        </p>
        <Button size="lg" onClick={onConnect} className="h-12 px-8 gap-2.5">
          <Plus size={17} /> Connect R2 Bucket
        </Button>
      </motion.div>
    </div>
  );
}

export function FileBrowser() {
  const {
    appView, currentPrefix, viewMode, sortField, sortDirection,
    navigateToFolder, searchOpen, setSearchOpen, analyticsOpen, setAnalyticsOpen,
    clearSelection, selectedKeys, detailItem, setDetailItem,
  } = useFileBrowserStore();

  const { activeConnection, isGuest, guestCredentials } = useAuthStore();

  // For guests, check if they've actually entered credentials (not just empty placeholders)
  const hasActiveBucket = isGuest
    ? !!(guestCredentials?.accountId && guestCredentials?.accessKeyId && guestCredentials?.secretAccessKey && guestCredentials?.bucketName)
    : !!activeConnection;

  const { data, isLoading, error } = useObjects(currentPrefix);
  const { uploads, clearCompleted } = useUpload(currentPrefix);
  const { bulkDownload, pasteFromClipboard } = useBulkOperations();
  useKeyboardShortcuts();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; item: R2Object | null;
  } | null>(null);

  const [previewItem, setPreviewItem] = useState<R2Object | null>(null);
  const [renameItem, setRenameItem] = useState<R2Object | null>(null);
  const [deleteItems, setDeleteItems] = useState<string[]>([]);
  const [presignKey, setPresignKey] = useState<string | null>(null);

  const allItems = useMemo(() => {
    if (!data) return [];
    const folders = sortItems(data.folders, sortField, sortDirection);
    const files = sortItems(data.objects.filter((o) => !o.isFolder), sortField, sortDirection);
    return [...folders, ...files];
  }, [data, sortField, sortDirection]);

  const detailObject = useMemo(() => {
    if (!detailItem) return null;
    return allItems.find((i) => i.key === detailItem) || null;
  }, [detailItem, allItems]);

  const handleOpen = useCallback((item: R2Object) => {
    if (item.isFolder) navigateToFolder(item.key);
    else setPreviewItem(item);
  }, [navigateToFolder]);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: R2Object) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const handleBackgroundContextMenu = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-file-item]")) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item: null });
  }, []);

  return (
    <div className="flex h-screen min-h-0 min-w-0 gap-3 p-3">
      <Sidebar onManageConnections={() => setConnectionsOpen(true)} />

      {/* ── Main panel ── */}
      <div
        className="flex flex-col flex-1 min-w-0 min-h-0 rounded-r-[var(--radius-xl)] overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {!hasActiveBucket ? (
          <div className="flex flex-1 flex-col min-h-0 min-w-0">
            <DashboardHeader />
            <NoBucketState onConnect={() => setConnectionsOpen(true)} />
          </div>
        ) : appView === "dashboard" ? (
          <div className="flex flex-1 flex-col min-h-0 min-w-0">
            <DashboardHeader />
            <DashboardView />
          </div>
        ) : (
          <div className="flex flex-1 flex-col min-h-0 min-w-0">
            <Header />
            <Toolbar />

            <div className="flex flex-1 min-h-0 min-w-0">
              <UploadZone>
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-y-contain main-panel-scroll"
                  style={{ background: "transparent" }}
                  onClick={() => { clearSelection(); setDetailItem(null); }}
                  onContextMenu={handleBackgroundContextMenu}
                >
                  {isLoading ? (
                    viewMode === "grid" ? <SkeletonGrid /> : <SkeletonList />
                  ) : error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-full gap-4"
                    >
                      <div
                        className="w-16 h-16 rounded-[18px] flex items-center justify-center"
                        style={{ background: "var(--danger-subtle)" }}
                      >
                        <span className="text-3xl">⚠️</span>
                      </div>
                      <div className="text-center">
                        <p className="text-[16px] font-bold mb-1" style={{ color: "var(--danger)" }}>
                          Connection Failed
                        </p>
                        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                          Check your R2 credentials in bucket settings
                        </p>
                      </div>
                    </motion.div>
                  ) : allItems.length === 0 ? (
                    <EmptyState
                      onUpload={() => fileInputRef.current?.click()}
                      onNewFolder={() => setNewFolderOpen(true)}
                    />
                  ) : viewMode === "grid" ? (
                    <GridView items={allItems} onOpen={handleOpen} onContextMenu={handleContextMenu} />
                  ) : (
                    <ListView items={allItems} onOpen={handleOpen} onContextMenu={handleContextMenu} />
                  )}
                </div>
              </UploadZone>

              <DetailPanel
                item={detailObject}
                onClose={() => setDetailItem(null)}
                onPreview={(item) => setPreviewItem(item)}
                onRename={(item) => setRenameItem(item)}
                onDelete={(item) => setDeleteItems([item.key])}
                onPresign={(key) => setPresignKey(key)}
                onDownload={(keys) => bulkDownload(keys)}
              />
            </div>

            {/* Status bar */}
            <div
              className="h-10 flex items-center justify-between px-6 md:px-8 text-[11px] font-semibold shrink-0"
              style={{
                borderTop: "1px solid var(--border-light)",
                background: "var(--bg-input)",
                color: "var(--text-muted)",
              }}
            >
              <span>
                {allItems.length} item{allItems.length !== 1 ? "s" : ""}
                {selectedKeys.size > 0 && ` · ${selectedKeys.size} selected`}
                {currentPrefix && ` · /${currentPrefix.replace(/\/$/, "")}`}
              </span>
              <span style={{ opacity: 0.6 }}>Cloudflare R2</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" />

      {/* Overlays */}
      <UploadProgressPanel uploads={uploads} onClear={clearCompleted} />
      <ConnectionsDialog open={connectionsOpen} onClose={() => setConnectionsOpen(false)} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y} item={contextMenu.item}
          onClose={() => setContextMenu(null)}
          onOpen={handleOpen}
          onPreview={(item) => setPreviewItem(item)}
          onEdit={(item) => setPreviewItem(item)}
          onRename={(item) => setRenameItem(item)}
          onDelete={(item) => setDeleteItems([item.key])}
          onDownload={(keys) => bulkDownload(keys)}
          onPresign={(key) => setPresignKey(key)}
          onPaste={() => {
            const store = useFileBrowserStore.getState();
            if (store.clipboardKeys.length > 0 && store.clipboardOperation) {
              pasteFromClipboard(store.clipboardKeys, store.clipboardOperation);
              if (store.clipboardOperation === "cut") store.clearClipboard();
            }
          }}
        />
      )}

      <PreviewDialog open={!!previewItem} onClose={() => setPreviewItem(null)}
        item={previewItem} items={allItems} onNavigate={(item) => setPreviewItem(item)} />
      {renameItem && <RenameDialog open={!!renameItem} onClose={() => setRenameItem(null)}
        currentKey={renameItem.key} currentName={renameItem.name} isFolder={renameItem.isFolder} />}
      <DeleteConfirmDialog open={deleteItems.length > 0} onClose={() => setDeleteItems([])}
        keys={deleteItems} onDeleted={() => setDeleteItems([])} />
      {presignKey && <PresignDialog open={!!presignKey} onClose={() => setPresignKey(null)} fileKey={presignKey} />}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AnalyticsDashboard open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <NewFolderDialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)} prefix={currentPrefix} />
    </div>
  );
}

/* Dashboard-only header */
function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const { user, isGuest } = useAuthStore();
  return (
    <TooltipProvider>
      <header className="h-[58px] flex items-center justify-between px-6 md:px-8 shrink-0 gap-4 border-b bg-card/80 backdrop-blur-md">
        <h2 className="text-sm font-bold tracking-tight">Overview</h2>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Button size="icon" variant="outline" className="h-10 w-10"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}>
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {isGuest ? "G" : user?.name?.slice(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
    </TooltipProvider>
  );
}
