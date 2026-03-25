import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewMode, SortField, SortDirection, ClipboardOperation } from "@/types/r2";

export type AppView = "dashboard" | "objects";

interface FileBrowserState {
  appView: AppView;
  currentPrefix: string;
  viewMode: ViewMode;
  detailItem: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedKeys: Set<string>;
  clipboardKeys: string[];
  clipboardOperation: ClipboardOperation | null;
  searchOpen: boolean;
  analyticsOpen: boolean;

  setPrefix: (prefix: string) => void;
  navigateToFolder: (folderKey: string) => void;
  navigateUp: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSort: (field: SortField, direction: SortDirection) => void;
  toggleSort: (field: SortField) => void;

  selectKey: (key: string) => void;
  toggleSelectKey: (key: string) => void;
  selectRange: (keys: string[]) => void;
  selectAll: (keys: string[]) => void;
  clearSelection: () => void;
  isSelected: (key: string) => boolean;

  copyToClipboard: (keys: string[], operation: ClipboardOperation) => void;
  clearClipboard: () => void;

  setAppView: (view: AppView) => void;
  setDetailItem: (key: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setAnalyticsOpen: (open: boolean) => void;
}

export const useFileBrowserStore = create<FileBrowserState>()(
  persist(
    (set, get) => ({
      appView: "objects",
      currentPrefix: "",
      viewMode: "grid",
      detailItem: null,
      sortField: "name",
      sortDirection: "asc",
      selectedKeys: new Set<string>(),
      clipboardKeys: [],
      clipboardOperation: null,
      searchOpen: false,
      analyticsOpen: false,

      setAppView: (view) => set({ appView: view, selectedKeys: new Set(), detailItem: null }),
      setDetailItem: (key) => set({ detailItem: key }),
      setPrefix: (prefix) => set({ currentPrefix: prefix, selectedKeys: new Set(), appView: "objects" }),
      navigateToFolder: (folderKey) =>
        set({ currentPrefix: folderKey, selectedKeys: new Set(), appView: "objects" }),
      navigateUp: () => {
        const prefix = get().currentPrefix;
        const trimmed = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
        const lastSlash = trimmed.lastIndexOf("/");
        set({
          currentPrefix: lastSlash >= 0 ? trimmed.substring(0, lastSlash + 1) : "",
          selectedKeys: new Set(),
        });
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      setSort: (field, direction) => set({ sortField: field, sortDirection: direction }),
      toggleSort: (field) => {
        const { sortField, sortDirection } = get();
        if (sortField === field) {
          set({ sortDirection: sortDirection === "asc" ? "desc" : "asc" });
        } else {
          set({ sortField: field, sortDirection: "asc" });
        }
      },

      selectKey: (key) => set({ selectedKeys: new Set([key]) }),
      toggleSelectKey: (key) => {
        const selected = new Set(get().selectedKeys);
        if (selected.has(key)) {
          selected.delete(key);
        } else {
          selected.add(key);
        }
        set({ selectedKeys: selected });
      },
      selectRange: (keys) => {
        const selected = new Set(get().selectedKeys);
        keys.forEach((k) => selected.add(k));
        set({ selectedKeys: selected });
      },
      selectAll: (keys) => set({ selectedKeys: new Set(keys) }),
      clearSelection: () => set({ selectedKeys: new Set() }),
      isSelected: (key) => get().selectedKeys.has(key),

      copyToClipboard: (keys, operation) =>
        set({ clipboardKeys: keys, clipboardOperation: operation }),
      clearClipboard: () => set({ clipboardKeys: [], clipboardOperation: null }),

      setSearchOpen: (open) => set({ searchOpen: open }),
      setAnalyticsOpen: (open) => set({ analyticsOpen: open }),
    }),
    {
      name: "r2-file-browser",
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
      }),
    }
  )
);
