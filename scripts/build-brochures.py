#!/usr/bin/env python3
"""
Rasterise brochure PDFs into the media package.

Each PDF in docs/raw/pdf/ becomes a folder of WebP page images under
public/media/brochures/<slug>/, plus a cover thumbnail. The tablet then
shows plain images: no PDF library in the bundle and no per-page decoding
on the K10's weak CPU.

Usage:
    python scripts/build-brochures.py            # convert everything
    python scripts/build-brochures.py --list     # print the JS manifest

Requires: pip install pymupdf
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is required:  pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "docs" / "raw" / "pdf"
OUT_DIR = ROOT / "public" / "media" / "brochures"

# The tablet panel is 1920x1200. Pages are rendered to fit 1600px on the
# long edge - comfortably sharp when a page fills the screen, without
# producing files the tablet has to scale down anyway.
PAGE_LONG_EDGE = 1600
THUMB_LONG_EDGE = 500
WEBP_QUALITY = 82
THUMB_QUALITY = 78


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-+", "-", slug)


def render(page, long_edge: int, quality: int, dest: Path) -> None:
    rect = page.rect
    zoom = long_edge / max(rect.width, rect.height)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    dest.write_bytes(pix.pil_tobytes(format="WEBP", quality=quality, method=4))


def convert(pdf_path: Path) -> dict:
    slug = slugify(pdf_path.stem)
    out = OUT_DIR / slug
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    doc = fitz.open(pdf_path)
    total = 0
    for index, page in enumerate(doc, start=1):
        render(page, PAGE_LONG_EDGE, WEBP_QUALITY, out / f"page-{index:02d}.webp")
        if index == 1:
            render(page, THUMB_LONG_EDGE, THUMB_QUALITY, out / "thumb.webp")
        total += 1

    first = doc[0].rect
    doc.close()

    size = sum(f.stat().st_size for f in out.iterdir())
    print(
        f"  {pdf_path.name:<44} {total:>3} pages  "
        f"{pdf_path.stat().st_size / 1048576:>6.2f} MB -> {size / 1048576:>6.2f} MB"
    )

    return {
        "id": slug,
        "title": pdf_path.stem.replace("-", " ").replace("_", " ").title(),
        "slug": slug,
        "pageCount": total,
        "portrait": first.height >= first.width,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--list", action="store_true", help="print the JS manifest only")
    args = parser.parse_args()

    pdfs = sorted(SRC_DIR.glob("*.pdf"))
    if not pdfs:
        sys.exit(f"No PDFs found in {SRC_DIR}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Converting {len(pdfs)} PDF(s) -> {OUT_DIR.relative_to(ROOT)}")
    entries = [convert(p) for p in pdfs]

    print("\nAdd to src/config/brochures.js:\n")
    print(json.dumps(entries, indent=2))


if __name__ == "__main__":
    main()
