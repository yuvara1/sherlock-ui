import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};

export function Modal({ children }: { children: ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

export const ModalTrigger = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { setOpen } = useModal();
  return (
    <button
      className={cn("relative overflow-hidden", className)}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  );
};

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { open } = useModal();
  const { setOpen } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useOutsideClick(modalRef, () => setOpen(false));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.6)", zIndex: 0,
            }}
          />
          <motion.div
            ref={modalRef}
            className={cn("relative z-10 w-full", className)}
            style={{
              maxWidth: 520, margin: "0 16px",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              display: "flex", flexDirection: "column",
              maxHeight: "90vh", overflow: "hidden",
            }}
            initial={{ opacity: 0, scale: 0.92, rotateX: 8, y: 24 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 4 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
          >
            <CloseIcon />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col flex-1 overflow-y-auto", className)}
    style={{ padding: "28px 28px 0" }}>
    {children}
  </div>
);

export const ModalFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn("flex justify-end", className)}
    style={{
      padding: "16px 28px",
      borderTop: "1px solid var(--border)",
      background: "var(--bg-3)",
      gap: 8,
    }}
  >
    {children}
  </div>
);

const CloseIcon = () => {
  const { setOpen } = useModal();
  return (
    <button
      onClick={() => setOpen(false)}
      style={{
        position: "absolute", top: 14, right: 14,
        background: "var(--bg-3)", border: "1px solid var(--border)",
        borderRadius: 6, width: 26, height: 26,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s",
        zIndex: 10,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-3)";
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
};

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      callback(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
