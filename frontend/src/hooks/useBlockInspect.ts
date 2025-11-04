// src/hooks/useBlockInspect.tsx
import { useEffect } from "react";

type Action = "overlay" | "redirect";
interface Options {
  action?: Action;
  redirectUrl?: string;
  overlayMessage?: string;
  detectionIntervalMs?: number;
  dimensionThreshold?: number;
}

const defaultOptions: Options = {
  action: "overlay",
  overlayMessage: "Developer tools detected. Close it to continue.",
  detectionIntervalMs: 800,
  dimensionThreshold: 160,
};

export default function useBlockInspect(opts?: Options) {
  const options = { ...defaultOptions, ...opts };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ Detect mobile devices
    const isMobile = () =>
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );

    // ✅ Block context menu & shortcuts
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        (e.ctrlKey && e.shiftKey && key === "i") || // Ctrl+Shift+I
        e.key === "F12" ||                          // F12
        (e.ctrlKey && key === "u") ||               // Ctrl+U
        (e.ctrlKey && key === "s")                  // Ctrl+S
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);

    const overlayId = "__devtools_block_overlay__";

    const createOverlay = (text: string) => {
      if (document.getElementById(overlayId)) return;
      const el = document.createElement("div");
      el.id = overlayId;
      Object.assign(el.style, {
        position: "fixed",
        inset: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        color: "#000",
        fontSize: "18px",
        padding: "20px",
        zIndex: "999999999",
        textAlign: "center",
      });
      el.textContent = text;
      document.body.appendChild(el);
    };

    const removeOverlay = () => {
      const el = document.getElementById(overlayId);
      if (el) el.remove();
    };

    let lastState = false;
    const threshold = options.dimensionThreshold ?? 160;

    function detectDevTools(): boolean {
      // ✅ Disable DEVTOOLS detection on mobile (only block shortcuts & menu)
      if (isMobile()) return false;

      // ✅ Check if console devtools is open
      let opened = false;
      const sentinel = {
        toString() {
          opened = true;
          return "";
        },
      };
      console.log("%c", sentinel);

      // ✅ Check dimension difference only if not resizing window
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);

      const dimOpen =
        widthDiff > threshold || heightDiff > threshold;

      return opened || dimOpen;
    }

    const interval = setInterval(() => {
      const isOpen = detectDevTools();

      if (isOpen && !lastState) {
        lastState = true;

        if (options.action === "overlay") {
          createOverlay(options.overlayMessage!);
        }

        if (options.action === "redirect") {
          setTimeout(() => {
            window.location.replace(options.redirectUrl ?? "about:blank");
          }, 100);
        }
      }

      if (!isOpen && lastState) {
        lastState = false;
        removeOverlay();
      }
    }, options.detectionIntervalMs);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(interval);
      removeOverlay();
    };
  }, [JSON.stringify(opts ?? {})]);
}
