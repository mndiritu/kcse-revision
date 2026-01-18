#!/usr/bin/env python3
"""
Generate topics.js manifest for KCSE Revision Hub.

Usage (run at repo root):
  python3 scripts/generate_topics_manifest.py

It will overwrite ./topics.js
"""

from __future__ import annotations
import os
from pathlib import Path
import json
import re

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

ROOT = Path(__file__).resolve().parents[1]

def title_from_filename(name: str) -> str:
    base = name.replace(".html", "")
    base = base.replace("-", " ").replace("_", " ")
    base = re.sub(r"\s+", " ", base).strip()
    # Title-case, but keep common acronyms
    return " ".join(w.upper() if w.lower() in {"au", "oau", "eac", "ecowas", "comesa"} else w.capitalize()
                    for w in base.split())

def main() -> None:
    manifest = {s: [] for s in SUBJECTS}

    for subject in SUBJECTS:
        subject_dir = ROOT / subject
        if not subject_dir.exists() or not subject_dir.is_dir():
            continue

        for html in subject_dir.rglob("*.html"):
            # Skip any index.html that you might add later
            if html.name.lower() == "index.html":
                continue

            rel = html.relative_to(ROOT).as_posix()
            item = {
                "title": title_from_filename(html.name),
                "path": rel,
                "tags": ["Form 4"]
            }
            manifest[subject].append(item)

        # Keep stable ordering
        manifest[subject].sort(key=lambda x: x["title"].lower())

    out_path = ROOT / "topics.js"
    with out_path.open("w", encoding="utf-8") as f:
        f.write("// topics.js\n")
        f.write("// Auto-generated topic manifest for KCSE Revision Hub\n")
        f.write("// Regenerate using: python3 scripts/generate_topics_manifest.py\n\n")
        f.write("window.KCSE_TOPICS = ")
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Wrote: {out_path}")

if __name__ == "__main__":
    main()
