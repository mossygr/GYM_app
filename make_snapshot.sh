#!/usr/bin/env bash
set -euo pipefail

OUT=code_snapshot.txt

echo "# Project snapshot  $(date -Iseconds)" > "$OUT"

# --- TREE ---
{
  echo
  echo "## TREE"
  if command -v tree >/dev/null 2>&1; then
    tree -a -F -I 'node_modules|.next|.git|dist|build|.turbo|coverage|.cache|code_snapshot.txt'
  else
    find . -path ./node_modules -prune -o -path ./.next -prune -o -path ./.git -prune \
           -o -path ./dist -prune -o -path ./build -prune -o -path ./.turbo -prune \
           -o -path ./coverage -prune -o -path ./.cache -prune \
           -o -name "$OUT" -prune \
           -o -print
  fi
} >> "$OUT"

# --- FILE CONTENTS ---
{
  echo
  echo "## FILE CONTENTS"
} >> "$OUT"

LC_ALL=C find . \
  -path ./node_modules -prune -o -path ./.next -prune -o -path ./.git -prune \
  -o -path ./dist -prune -o -path ./build -prune -o -path ./.turbo -prune \
  -o -path ./coverage -prune -o -path ./.cache -prune \
  -o -name "$OUT" -prune \
  -o -type f -print0 \
| sort -z \
| while IFS= read -r -d '' f; do
    size=$(wc -c < "$f" 2>/dev/null || stat -f%z "$f" 2>/dev/null || echo 0)
    sha=$( (sha256sum "$f" 2>/dev/null || shasum -a 256 "$f" 2>/dev/null) | awk '{print $1}' )

    printf "\n\n===== FILE: %s (size=%sB sha256=%s) =====\n" "$f" "$size" "$sha" >> "$OUT"

    if grep -Iq . "$f"; then
      if [ "${size:-0}" -le 1048576 ]; then
        cat "$f" >> "$OUT"
      else
        echo "[[TRUNCATED to first 1MB]]" >> "$OUT"
        head -c 1048576 "$f" >> "$OUT"
      fi
    else
      echo "[[BINARY FILE - SKIPPED CONTENT]]" >> "$OUT"
    fi
  done

echo -e "\n\n# End of snapshot" >> "$OUT"
echo "Έτοιμο: $OUT"
