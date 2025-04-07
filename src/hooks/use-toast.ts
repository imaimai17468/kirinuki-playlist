"use client";

// Inspired by react-hot-toast library
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // If no id is provided, dismiss all
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }

      // Dismiss a specific toast
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)),
      };
    }
    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action;

      // If no id is provided, remove all
      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      // Remove a specific toast
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }
  }
};

const useToast = () => {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  });

  React.useEffect(() => {
    for (const toast of state.toasts) {
      if (toast.open === false && !toastTimeouts.has(toast.id)) {
        const timeout = setTimeout(() => {
          toastTimeouts.delete(toast.id);
          dispatch({
            type: actionTypes.REMOVE_TOAST,
            toastId: toast.id,
          });
        }, TOAST_REMOVE_DELAY);

        toastTimeouts.set(toast.id, timeout);
      }
    }
  }, [state.toasts]);

  const toast = React.useCallback(
    ({ ...props }: Omit<ToasterToast, "id">) => {
      const id = genId();

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
        },
      });

      return id;
    },
    [dispatch],
  );

  const update = React.useCallback(
    (id: string, toast: Partial<ToasterToast>) => {
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...toast, id },
      });
    },
    [dispatch],
  );

  const dismiss = React.useCallback(
    (id?: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
    },
    [dispatch],
  );

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    update,
  };
};

export { useToast };
