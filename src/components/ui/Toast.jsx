import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "info", options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const toast = {
        id,
        message,
        title: options.title || "",
        tone,
      };
      setToasts((current) => [...current.slice(-3), toast]);
      window.setTimeout(() => dismiss(id), options.duration || 5200);
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => push(message, "success", options),
      error: (message, options) => push(message, "error", options),
      info: (message, options) => push(message, "info", options),
      dismiss,
    }),
    [dismiss, push],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((item) => {
          const Icon = icons[item.tone] || Info;
          return (
            <div
              className={`toast-item toast-item--${item.tone}`}
              key={item.id}
              role="status"
            >
              <span className="toast-item__icon">
                <Icon size={19} aria-hidden="true" />
              </span>
              <div className="toast-item__content">
                {item.title && (
                  <strong className="toast-item__title">{item.title}</strong>
                )}
                <span>{item.message}</span>
              </div>
              <button
                type="button"
                className="toast-item__close"
                onClick={() => dismiss(item.id)}
                aria-label="Cerrar notificación"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de ToastProvider.");
  return context;
};
