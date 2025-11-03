// src/hooks/useBlockInspect.tsx
import { useEffect } from "react";

type Action = "overlay" | "redirect";
interface Options {
  action?: Action;             // "overlay" (default) or "redirect"
  redirectUrl?: string;        // used when action === "redirect"
  overlayMessage?: string;     // message shown in overlay
  detectionIntervalMs?: number;
  dimensionThreshold?: number; // px difference to consider devtools open
}

const defaultOptions: Options = {
  action: "overlay",
  overlayMessage: "Access disabled. Close developer tools to continue.",
  detectionIntervalMs: 800,
  dimensionThreshold: 160,
};

export default function useBlockInspect(opts?: Options) {
  const options = { ...defaultOptions, ...opts };

  useEffect(() => {
    // --- Prevent context menu and common shortcuts ---
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Block common devtools / view-source / save shortcuts
      const key = e.key.toLowerCase();
      if (
        (e.ctrlKey && e.shiftKey && key === "i") || // Ctrl+Shift+I
        e.key === "F12" ||                          // F12
        (e.ctrlKey && key === "u") ||               // Ctrl+U
        (e.ctrlKey && key === "s") ||               // Ctrl+S
        (e.ctrlKey && key === "i")                  // Ctrl+I
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);

    // --- Overlay creation helper (appends to body) ---
    const overlayId = "__devtools_block_overlay__";
    const createOverlay = (text: string) => {
      if (document.getElementById(overlayId)) return;
      const div = document.createElement("div");
      div.id = overlayId;
      Object.assign(div.style, {
        position: "fixed",
        inset: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        color: "#111",
        zIndex: "2147483647", // very high
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
      });
      div.innerText = text;
      // prevent interaction with underlying page
      div.addEventListener("contextmenu", (e) => e.preventDefault());
      document.body.appendChild(div);
    };

    const removeOverlay = () => {
      const el = document.getElementById(overlayId);
      if (el) el.remove();
    };

    // --- Detection logic ---
    let lastOpen = false;
    const threshold = options.dimensionThreshold ?? 160;

    function detectDevTools(): boolean {
      // 1) Check window dimension differences (common approach)
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      if (widthDiff > threshold || heightDiff > threshold) {
        return true;
      }

      // 2) Console inspection trick: log an object whose toString/ getter runs when console tries to format it.
      // This is somewhat browser-dependent but often works:
      let opened = false;
      try {
        const sentinel = {
          toString() {
            opened = true;
            return "";
          },
        };
        // This forces the runtime to call toString if console is inspected in some consoles
        // We place it inside console.log so devtools may try to format it.
        // Note: If console is closed, this usually doesn't set `opened`.
        // Using %o ensures object formatting in some browsers.
        // eslint-disable-next-line no-console
        console.log("%c", sentinel);
      } catch (err) {
        // ignore
      }

      if (opened) return true;

      // optional: check for enormous console width (older technique)
      // Not added to avoid false positives.

      return false;
    }

    const interval = window.setInterval(() => {
      const isOpen = detectDevTools();

      if (isOpen && !lastOpen) {
        // just opened
        lastOpen = true;
        if (options.action === "overlay") {
          createOverlay(options.overlayMessage ?? defaultOptions.overlayMessage!);
        } else if (options.action === "redirect") {
          const url = options.redirectUrl ?? "about:blank";
          // Slight delay ensures detection isn't from a transient state
          setTimeout(() => {
            window.location.replace(url);
          }, 50);
        }
      } else if (!isOpen && lastOpen) {
        // just closed
        lastOpen = false;
        removeOverlay();
      }
      // if isOpen and already open, do nothing (overlay already present)
    }, options.detectionIntervalMs);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(interval);
      removeOverlay();
    };
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(opts ?? {}),
  ]);
}
