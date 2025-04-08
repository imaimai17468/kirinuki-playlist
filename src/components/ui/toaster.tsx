"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

// トーストのバリアント型
type ToastVariant = "default" | "success" | "info" | "warning" | "destructive" | undefined;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, icon, ...props }) => {
        // 各バリアントに合わせたデフォルトアイコンを設定
        let defaultIcon: React.ReactNode = null;
        const toastVariant = variant as ToastVariant;
        switch (toastVariant) {
          case "success":
            defaultIcon = <CheckCircle2 className="text-green-600 dark:text-green-400" />;
            break;
          case "info":
            defaultIcon = <Info className="text-blue-600 dark:text-blue-400" />;
            break;
          case "warning":
            defaultIcon = <AlertCircle className="text-yellow-600 dark:text-yellow-400" />;
            break;
          case "destructive":
            defaultIcon = <XCircle className="text-red-600 dark:text-red-400" />;
            break;
          default:
            defaultIcon = null;
        }

        return (
          <Toast key={id} {...props} variant={toastVariant}>
            {(icon || defaultIcon) && <ToastIcon>{icon || defaultIcon}</ToastIcon>}
            <div className="flex-1 grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
