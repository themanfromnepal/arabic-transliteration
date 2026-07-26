#!/usr/bin/env python3
"""
subset-fonts.py
Subsets Scheherazade New (Regular, Medium, SemiBold, Bold) against the
full Quranic Unicode glyph inventory using pyftsubset (fonttools).

Usage:
    python scripts/subset-fonts.py
    # or via npm:
    npm run subset-fonts

Prerequisites:
    pip install fonttools[woff]
"""

import os
import sys
import subprocess


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
FONTS_DIR = os.path.join("public", "fonts", "Scheherazade_New")

WEIGHTS = [
    ("Regular",  "ScheherazadeNew-Regular.ttf"),
    ("Medium",   "ScheherazadeNew-Medium.ttf"),
    ("SemiBold", "ScheherazadeNew-SemiBold.ttf"),
    ("Bold",     "ScheherazadeNew-Bold.ttf"),
]

AMIRI_FONTS_DIR = os.path.join("public", "fonts", "Amiri")

AMIRI_WEIGHTS = [
    ("Regular",     "Amiri-Regular.ttf"),
    ("Bold",        "Amiri-Bold.ttf"),
    ("BoldItalic",  "Amiri-BoldItalic.ttf"),
    ("Italic",      "Amiri-Italic.ttf"),
]

# Full Quranic Unicode range — core Arabic + diacritics + presentation forms
UNICODES = (
    "U+0020,U+0021,U+0022,U+0027,U+0028,U+0029,U+002C,U+002E,U+003A,U+003B,"  # punctuation needed
    "U+0600-06FF,"   # Arabic block (letters + harakat + Quranic marks)
    "U+0750-077F,"   # Arabic Supplement
    "U+08A0-08FF,"   # Arabic Extended-A (Quranic annotations)
    "U+FB50-FDFF,"   # Arabic Presentation Forms-A (ligatures, positional forms)
    "U+FE70-FEFF,"   # Arabic Presentation Forms-B
    "U+10E60-10E7F"  # Rumi Numeral Signs
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def check_pyftsubset() -> bool:
    """Return True if pyftsubset is on PATH or importable via fonttools."""
    try:
        result = subprocess.run(
            [sys.executable, "-m", "fontTools.subset", "--help"],
            capture_output=True,
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def subset_font(weight_name: str, input_file: str) -> None:
    input_path = os.path.join(FONTS_DIR, input_file)
    output_name = f"ScheherazadeNew-{weight_name}-quran-subset.woff2"
    output_path = os.path.join(FONTS_DIR, output_name)

    if not os.path.isfile(input_path):
        print(f"  [ERROR] Source not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    args = [
        sys.executable, "-m", "fontTools.subset",
        input_path,
        f"--output-file={output_path}",
        f"--unicodes={UNICODES}",
        "--flavor=woff2",
        "--no-hinting",
        "--desubroutinize",
        "--layout-features=*",  # keep all OpenType features (ligatures, mark positioning)
    ]

    print(f"  Subsetting {weight_name}...", end=" ", flush=True)
    result = subprocess.run(args, capture_output=True, text=True)

    if result.returncode != 0:
        print("FAILED")
        print(result.stderr, file=sys.stderr)
        sys.exit(1)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"OK  \u2192  {output_name}  ({size_kb:.1f} KB)")


def subset_amiri_font(weight_name: str, input_file: str) -> None:
    input_path = os.path.join(AMIRI_FONTS_DIR, input_file)
    output_name = f"Amiri-{weight_name}-quran-subset.woff2"
    output_path = os.path.join(AMIRI_FONTS_DIR, output_name)

    if not os.path.isfile(input_path):
        print(f"  [ERROR] Source not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    args = [
        sys.executable, "-m", "fontTools.subset",
        input_path,
        f"--output-file={output_path}",
        f"--unicodes={UNICODES}",
        "--flavor=woff2",
        "--no-hinting",
        "--desubroutinize",
        "--layout-features=*",  # keep all OpenType features (ligatures, mark positioning)
    ]

    print(f"  Subsetting {weight_name}...", end=" ", flush=True)
    result = subprocess.run(args, capture_output=True, text=True)

    if result.returncode != 0:
        print("FAILED")
        print(result.stderr, file=sys.stderr)
        sys.exit(1)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"OK  \u2192  {output_name}  ({size_kb:.1f} KB)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    print("subset-fonts.py \u2014 Scheherazade New Quranic subset")
    print("=" * 52)

    # Must run from project root
    if not os.path.isdir("public"):
        print(
            "[ERROR] Run this script from the project root directory.",
            file=sys.stderr,
        )
        sys.exit(1)

    if not check_pyftsubset():
        print(
            "[ERROR] fonttools is not installed or not runnable.\n"
            "        Install it with:  pip install fonttools[woff]",
            file=sys.stderr,
        )
        sys.exit(1)

    for weight_name, input_file in WEIGHTS:
        subset_font(weight_name, input_file)

    print("=" * 52)
    print("Done. 4 woff2 subset files written to:", FONTS_DIR)

    print()
    print("subset-fonts.py \u2014 Amiri Quranic subset")
    print("=" * 52)

    for weight_name, input_file in AMIRI_WEIGHTS:
        subset_amiri_font(weight_name, input_file)

    print("=" * 52)
    print("Done. 4 woff2 subset files written to:", AMIRI_FONTS_DIR)


if __name__ == "__main__":
    main()
