#!/usr/bin/env python3
"""
Rasterise brochure PDFs into the media package.

Each PDF in docs/raw/pdf/Brochures/ becomes a folder of WebP page images under
public/media/brochures/<slug>/, plus a cover thumbnail. The tablet then
shows plain images: no PDF library in the bundle and no per-page decoding
on the K10's weak CPU.

Usage:
    python scripts/build-brochures.py

Rewrites src/config/brochures.js to match what it converted.

Requires: pip install pymupdf
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is required:  pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "docs" / "raw" / "pdf" / "Brochures"
OUT_DIR = ROOT / "public" / "media" / "brochures"
CONFIG_PATH = ROOT / "src" / "config" / "brochures.js"

# Version/quality markers the supplier appends to filenames. They are not
# part of the brochure's name, so they are stripped for the title and the
# slug - otherwise the tablet would show "Delhi Edition Low Res".
NAME_NOISE = re.compile(
    r"\s*[-_]*\s*(?:low\s*res|v[-\s]*r?\s*\d+|vr\d+|final|copy)\s*$",
    re.IGNORECASE,
)

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


def clean_name(stem: str) -> str:
    """Filename stem minus the supplier's version/quality suffix."""
    return NAME_NOISE.sub("", stem).strip(" -_")


def split_title(name: str) -> tuple[str, str]:
    """
    Card title and subtitle.

    Every brochure is "The Tide Wave X <Place> Edition", so the series name
    is the same on all sixteen cards and only the place tells them apart.
    Leading with the place makes the grid scannable; the series drops to
    the subtitle. Anything not matching that shape keeps its full name.
    """
    match = re.search(r"^(.*?)\s*X\s+(.+?)\s+Edition$", name, re.IGNORECASE)
    if match:
        series, place = match.group(1).strip(), match.group(2).strip()
        return place, f"{series} Edition" if series else "Edition"
    return name, ""


def render(page, long_edge: int, quality: int, dest: Path) -> None:
    rect = page.rect
    zoom = long_edge / max(rect.width, rect.height)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    dest.write_bytes(pix.pil_tobytes(format="WEBP", quality=quality, method=4))


def convert(pdf_path: Path) -> dict:
    name = clean_name(pdf_path.stem)
    slug = slugify(name)
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

    title, subtitle = split_title(name)
    return {
        "id": slug,
        "title": title,
        "subtitle": subtitle,
        "slug": slug,
        "pageCount": total,
        "portrait": first.height >= first.width,
    }


def js_string(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def write_manifest(entries: list[dict]) -> None:
    """
    Rewrite src/config/brochures.js from the converted PDFs.

    Generated rather than hand-edited: the page counts and slugs have to
    match what was actually rasterised, and keeping sixteen entries in sync
    by hand is exactly the kind of thing that silently drifts.
    """
    lines = [
        "/**",
        " * Brochure manifest - one entry per PDF shown in the Brochure experience.",
        " *",
        " * GENERATED FILE - do not edit by hand.",
        " * Regenerate with:  python scripts/build-brochures.py",
        " *",
        " * Page images are pre-rendered from the source PDFs in",
        " * docs/raw/pdf/Brochures/. The tablet only ever loads WebP images, so",
        " * there is no PDF library in the bundle and no per-page decoding on",
        " * device.",
        " *",
        " * To change the brochures: replace the PDFs in that folder and re-run",
        " * the script. Titles come from the filenames.",
        " */",
        "export const BROCHURES = [",
    ]
    for entry in entries:
        lines.append("  {")
        lines.append(f"    id: {js_string(entry['id'])},")
        lines.append(f"    slug: {js_string(entry['slug'])},")
        lines.append(f"    title: {js_string(entry['title'])},")
        lines.append(f"    subtitle: {js_string(entry['subtitle'])},")
        lines.append(f"    pageCount: {entry['pageCount']},")
        lines.append(f"    portrait: {'true' if entry['portrait'] else 'false'},")
        lines.append("  },")
    lines += [
        "]",
        "",
        "export function getBrochureById(id) {",
        "  return BROCHURES.find((brochure) => brochure.id === id) ?? null",
        "}",
        "",
    ]
    CONFIG_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()

    pdfs = sorted(SRC_DIR.glob("*.pdf"))
    if not pdfs:
        sys.exit(f"No PDFs found in {SRC_DIR}")

    # Two PDFs whose names differ only by a version suffix would collide on
    # slug and silently overwrite each other's pages. Fail loudly instead.
    seen: dict[str, str] = {}
    for p in pdfs:
        slug = slugify(clean_name(p.stem))
        if slug in seen:
            sys.exit(f"Duplicate slug '{slug}':\n  {seen[slug]}\n  {p.name}")
        seen[slug] = p.name

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Converting {len(pdfs)} PDF(s) -> {OUT_DIR.relative_to(ROOT)}")
    entries = [convert(p) for p in pdfs]

    total_out = sum(
        f.stat().st_size for d in OUT_DIR.iterdir() if d.is_dir() for f in d.iterdir()
    )
    total_in = sum(p.stat().st_size for p in pdfs)
    print(
        f"\nTotal {total_in / 1048576:.1f} MB of PDF -> "
        f"{total_out / 1048576:.1f} MB of WebP "
        f"({total_out / total_in * 100:.0f}%)"
    )

    write_manifest(entries)
    print(f"Wrote {CONFIG_PATH.relative_to(ROOT)} ({len(entries)} brochures)")


if __name__ == "__main__":
    main()
