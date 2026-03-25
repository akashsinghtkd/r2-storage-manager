import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

interface Connection {
  id: string;
  name: string;
  accountId: string;
  bucketName: string;
  publicUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export function useConnections() {
  return useQuery<Connection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await fetch("/api/connections");
      if (!res.ok) throw new Error("Failed to fetch connections");
      return res.json();
    },
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  const { fetchUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      accountId: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucketName: string;
      publicUrl?: string;
    }) => {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      fetchUser();
      toast.success("R2 bucket connected successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add connection");
    },
  });
}

export function useSwitchConnection() {
  const queryClient = useQueryClient();
  const { fetchUser } = useAuthStore();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setActive: true }),
      });
      if (!res.ok) throw new Error("Failed to switch connection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["objects"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      fetchUser();
      toast.success("Switched bucket");
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  const { fetchUser } = useAuthStore();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const res = await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete connection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      fetchUser();
      toast.success("Connection removed");
    },
  });
}
