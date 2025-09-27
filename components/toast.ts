"use client";

/** Απλό toast χωρίς React state – φτιάχνει μόνο του container στο <body>. */
let root: HTMLDivElement | null = null;

function ensureRoot() {
  if (typeof document === "undefined") return null;
  if (root && document.body.contains(root)) return root;
  root = document.createElement("div");
  root.id = "app-toast-root";
  Object.assign(root.style, {
    position: "fixed",
    left: "0",
    right: "0",
    bottom: "24px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: "1000",
  });
  document.body.appendChild(root);
  return root;
}

export function toast(message: string) {
  const host = ensureRoot();
  if (!host) return;
  const pill = document.createElement("div");
  pill.className = "toast-pill";
  pill.textContent = message;
  host.appendChild(pill);
  // animate in
  requestAnimationFrame(() => pill.classList.add("show"));
  // remove after 1200ms
  setTimeout(() => {
    pill.classList.remove("show");
    setTimeout(() => pill.remove(), 200);
  }, 1200);
}
