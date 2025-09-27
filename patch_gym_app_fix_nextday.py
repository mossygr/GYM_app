#!/usr/bin/env python3
import re, sys
from pathlib import Path
from datetime import datetime

def backup(p: Path, txt: str):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    b = p.with_suffix(p.suffix + f".bak.{ts}")
    b.write_text(txt, encoding="utf-8")
    return b

def find_api(root: Path) -> Path:
    for rel in ("lib/api.ts", "src/lib/api.ts"):
        p = root / rel
        if p.exists(): return p
    sys.exit("lib/api.ts not found")

NEW_NEXTDAY = """function nextDay(dateStr: string): string {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1); // local time, όχι UTC
  dt.setDate(dt.getDate() + 1);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}"""

def patch(txt: str) -> str:
    # 1) αντικατάσταση ολόκληρης της nextDay(...)
    txt = re.sub(r'function\s+nextDay\s*\([^)]*\)\s*\{[\s\S]*?\}',
                 NEW_NEXTDAY, txt, count=1)
    # 2) στη fetchDay: μην κάνεις UTC .toISOString(), πάρε σκέτο string slice
    txt = re.sub(r'new\s+Date\(\s*d\.date\s*\)\.toISOString\(\)\.slice\(\s*0\s*,\s*10\s*\)',
                 'String(d.date).slice(0, 10)', txt)
    return txt

def main():
    root = Path(".").resolve()
    api = find_api(root)
    src = api.read_text(encoding="utf-8")
    out = patch(src)
    if out != src:
        b = backup(api, src)
        api.write_text(out, encoding="utf-8")
        print(f"Patched {api} (backup -> {b.name})")
    else:
        print("No changes (already patched).")

if __name__ == "__main__":
    main()
