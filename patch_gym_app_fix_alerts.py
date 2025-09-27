#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_gym_app_fix_alerts.py — Fixes broken alert() strings in Day page.
Rewrites any alert("Αποτυχία προσθήκης άσκησης...") and alert("Αποτυχία προσθήκης σετ...")
to use template literals with backticks to avoid newline parsing issues.

Usage:
  python patch_gym_app_fix_alerts.py --project .
"""
import argparse
import re
from pathlib import Path
from datetime import datetime

def patch_file(path: Path):
    if not path.exists():
        return False, f"File not found: {path}"
    s = path.read_text(encoding="utf-8")
    orig = s

    # Normalize newlines
    s = s.replace("\r\n", "\n")

    # Replace both alert blocks (multi-line safe)
    s = re.sub(
        r'alert\("Αποτυχία προσθήκης άσκησης[\s\S]*?\);',
        'alert(`Αποτυχία προσθήκης άσκησης\\n${e}`);',
        s
    )
    s = re.sub(
        r'alert\("Αποτυχία προσθήκης σετ[\s\S]*?\);',
        'alert(`Αποτυχία προσθήκης σετ\\n${e}`);',
        s
    )

    if s != orig:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        bak = path.with_suffix(path.suffix + f".bak.{ts}")
        bak.write_text(orig, encoding="utf-8")
        path.write_text(s, encoding="utf-8")
        return True, f"Patched {path} (backup -> {bak.name})"
    else:
        return False, "No changes needed (patterns not found)."

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", default=".", help="project root (has package.json)")
    args = ap.parse_args()
    root = Path(args.project).resolve()

    # Detect src/ layout
    day = root / "app/(dashboard)/day/[date]/page.tsx"
    if not day.exists():
        day = root / "src/app/(dashboard)/day/[date]/page.tsx"

    ok, msg = patch_file(day)
    print(msg)

if __name__ == "__main__":
    main()
