"use client";

import { useTheme } from "next-themes";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Sun, Moon, ChevronRight, Home } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { currentPrefix, setPrefix } = useFileBrowserStore();
  const { user, isGuest } = useAuthStore();

  const segments = currentPrefix ? currentPrefix.replace(/\/$/, "").split("/") : [];

  return (
    <TooltipProvider>
      <header className="h-[58px] flex items-center justify-between px-6 md:px-8 shrink-0 gap-4 border-b bg-card/80 backdrop-blur-md">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-0.5 text-sm min-w-0 overflow-x-auto overflow-y-hidden py-1 px-1 -mx-1 rounded-lg max-w-[min(100%,40rem)] bg-muted border">
          <button type="button" onClick={() => setPrefix("")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md shrink-0 cursor-pointer transition-all text-sm
              ${!currentPrefix ? "bg-background shadow-sm font-bold text-primary" : "font-medium text-muted-foreground hover:bg-background/50"}`}>
            <Home size={15} strokeWidth={2.25} />
            All Files
          </button>

          {segments.map((segment, index) => {
            const path = segments.slice(0, index + 1).join("/") + "/";
            const isLast = index === segments.length - 1;
            return (
              <motion.div key={path} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }} className="flex items-center gap-0.5 shrink-0">
                <ChevronRight size={14} className="text-muted-foreground/40" />
                <button type="button" onClick={() => setPrefix(path)}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-all
                    ${isLast ? "bg-background shadow-sm font-bold text-primary" : "font-medium text-muted-foreground hover:bg-background/50"}`}>
                  {segment}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger>
              <Button size="icon" variant="outline" className="h-10 w-10"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <motion.div key={theme} initial={{ rotate: -30, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }}
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
