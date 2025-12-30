import { createContext, useContext, useState } from "react";
import { ToastMessage } from "../ui/Toast";
type Props = {
  addToToasts: (toast: Omit<ToastMessage, "id">) => void;
  removeFromToastsById: (toastId: string) => void;
  toasts: ToastMessage[];
};
const ToastContext = createContext<Props | undefined>(undefined);

export function ToastProvider({ children }) {
  const [toasts, settoasts] = useState<ToastMessage[]>([]);
  function addToToasts(toast: Omit<ToastMessage, "id">) {
    settoasts((pre) => [
      ...pre,
      { id: new Date().toString(), type: toast.type, message: toast.message },
    ]);
  }
  function removeFromToastsById(toastId: string) {
    const newToasts = toasts.filter((i) => i.id !== toastId);
    settoasts(newToasts);
  }
  return (
    <ToastContext.Provider
      value={{ addToToasts, removeFromToastsById, toasts }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("DataProvider initial error");
  }
  return context;
}
