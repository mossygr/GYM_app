// hooks/use-shortcuts.ts
import { useEffect } from "react";

type Map = Record<string, (e: KeyboardEvent) => void>;

export function useShortcuts(map: Map) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = [e.ctrlKey || e.metaKey ? "mod" : null, e.key.toLowerCase()]
        .filter(Boolean)
        .join("+");
      const plain = e.key.toLowerCase();
      if (map[combo]) { e.preventDefault(); map[combo](e); }
      else if (map[plain]) { map[plain](e); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map]);
}
