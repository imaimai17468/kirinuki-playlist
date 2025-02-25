"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const VideoPlayerBar: React.FC = () => {
  const { state } = useSidebar();

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 border-t bg-white duration-200 transition-[width] ease-linear p-3",
        state === "collapsed" ? "w-[calc(100%-var(--sidebar-width-icon))]" : "w-[calc(100%-var(--sidebar-width))]",
      )}
    >
      VideoPlayerBar
    </div>
  );
};
