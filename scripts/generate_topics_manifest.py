#!/usr/bin/env python3
"""
Generate topics.js manifest for KCSE Revision Hub.

Usage (run at repo root):
  python3 scripts/generate_topics_manifest.py

It will overwrite ./topics.js

What it does:
- Scans known subject folders (SUBJECTS)
- Finds all .html topics (skips index.html)
- Uses <title> from the HTML if present; otherwise derives title from filename
- Reads optional tags from <meta name="tags" content="..."> (comma-separated)
- Writes a browser-friendly registry: window.KCSE_TOPICS = {...}
"""

from __future__ import annotations

from pathlib import Path
import json
import re
from typing import List, Optional

SUBJECTS = [
    "physics",
    "mathematics",
    "history",
    "chemistry",
    "biology",
    "computer",
    "english",
    "kiswahili",
]

ACRONYMS = {"au", "oau", "eac", "ecowas", "comesa", "nepad", "aprm"}

ROOT = Path(__file__).resolve().parents[1]


def title_from_filename(name: str) -> str:
    base = name.replace(".html", "")
    base = base.replace("-", " ").replace("_", " ")
    base = re.sub(r"\s+", " ", base).strip()
    # Title-case, but keep common acronyms
    words = []
    for w in base.split():
        wl = w.lower()
        if wl in ACRONYMS:
            words.append(w.upper())
        else:
            words.append(w.capitalize())
    return " ".join(words)


def read_text(path: Path, max_chars: int = 64_000) -> str:
    """Read a file safely (bounded)."""
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        return f.read(max_chars)


def title_from_html(path: Path) -> Optional[str]:
    """Extract <title>...</title> from HTML if present."""
    text = read_text(path)
    m = re.search(r"<title>\s*(.*?)\s*</title>", text, flags=re.IGNORECASE | re.DOTALL)
    if not m:
        return None
    title = re.sub(r"\s+", " ", m.group(1)).strip()
    return title or None


def tags_from_html(path: Path) -> List[str]:
    """Extract comma-separated tags from <meta name='tags' content='...'>."""
    text = read_text(path)
    m = re.search(
        r'<meta\s+name\s*=\s*["\']tags["\']\s+content\s*=\s*["\'](.*?)["\']\s*/?>',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return []
    raw = re.sub(r"\s+", " ", m.group(1)).strip()
    if not raw:
        return []
    return [t.strip() for t in raw.split(",") if t.strip()]


def uniq_preserve(items: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def main() -> None:
    manifest = {s: [] for s in SUBJECTS}
    total = 0

    for subject in SUBJECTS:
        subject_dir = ROOT / subject
        if not subject_dir.exists() or not subject_dir.is_dir():
            continue

        for html in sorted(subject_dir.rglob("*.html")):
            if html.name.lower() == "index.html":
                continue

            rel = html.relative_to(ROOT).as_posix()
            title = title_from_html(html) or title_from_filename(html.name)

            default_tags = ["Form 4", subject.capitalize()]
            meta_tags = tags_from_html(html)
            tags = uniq_preserve(default_tags + meta_tags)

            manifest[subject].append({"title": title, "path": rel, "tags": tags})
            total += 1

        manifest[subject].sort(key=lambda x: x["title"].lower())

    out_path = ROOT / "topics.js"
    with out_path.open("w", encoding="utf-8") as f:
        f.write("// topics.js\n")
        f.write("// Auto-generated topic manifest for KCSE Revision Hub\n")
        f.write("// Regenerate using: python3 scripts/generate_topics_manifest.py\n\n")
        f.write("window.KCSE_TOPICS = ")
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Wrote: {out_path} ({total} topics)")


if __name__ == "__main__":
    main()
