"use client";

import { cn } from "@/libs/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackLinkProps {
  href: string;
  text: string;
  className?: string;
}

export function BackLink({ href, text, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center text-sm text-muted-foreground hover:text-green-600 transition-colors w-fit",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {text}
    </Link>
  );
}
