#!/usr/bin/env python3
"""
Extract and clean sermon text from a PDF.

The script is intentionally conservative. It removes obvious repeated
headers/footers and standalone page numbers, then writes:
  - cleaned sermon text
  - a review report showing removed lines
  - optional JSON page diagnostics

Usage:
  python scripts/clean_sermon_pdf.py path/to/sermon.pdf
  python scripts/clean_sermon_pdf.py https://example.com/sermon.pdf
  python scripts/clean_sermon_pdf.py sermon.pdf --title "Shamgar" --date October-20-1968
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
import textwrap
import unicodedata
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import quote, unquote, urlparse, urlunparse
from urllib.request import Request, urlopen


DEFAULT_OUTPUT_DIR = Path("reports/pdf-cleaning")
USER_AGENT = "HisVoicePDFCleaner/1.0"


@dataclass
class PageLine:
    page: int
    line_number: int
    text: str
    normalized: str
    zone: str


@dataclass
class RemovedLine:
    page: int
    line_number: int
    text: str
    reason: str


def load_pdf_text_pages(pdf_path: Path, engine: str) -> list[str]:
    if engine == "pymupdf":
        return load_with_pymupdf(pdf_path)
    if engine == "pdfplumber":
        return load_with_pdfplumber(pdf_path)
    raise ValueError(f"Unsupported engine: {engine}")


def load_with_pymupdf(pdf_path: Path) -> list[str]:
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:
        raise RuntimeError("PyMuPDF is not installed. Run: pip install pymupdf") from exc

    pages: list[str] = []
    with fitz.open(pdf_path) as document:
        for page in document:
            pages.append(page.get_text("text") or "")
    return pages


def load_with_pdfplumber(pdf_path: Path) -> list[str]:
    try:
        import pdfplumber
    except ImportError as exc:
        raise RuntimeError("pdfplumber is not installed. Run: pip install pdfplumber") from exc

    pages: list[str] = []
    with pdfplumber.open(pdf_path) as document:
        for page in document.pages:
            pages.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
    return pages


def download_pdf(url: str) -> Path:
    request = Request(encode_url_path(url), headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=60) as response:
        data = response.read()

    parsed = urlparse(url)
    filename = Path(unquote(parsed.path)).name or "sermon.pdf"
    if not filename.lower().endswith(".pdf"):
        filename = f"{filename}.pdf"

    path = Path(tempfile.gettempdir()) / filename
    path.write_bytes(data)
    return path


def encode_url_path(url: str) -> str:
    parsed = urlparse(url)
    return urlunparse(parsed._replace(path=quote(unquote(parsed.path), safe="/%")))


def normalize_line(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\u00a0", " ")
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def comparable_line(text: str) -> str:
    text = normalize_line(text).lower()
    text = re.sub(r"\b\d{1,4}\b", "#", text)
    text = re.sub(r"[^a-z0-9#]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def zone_for_line(line_number: int, total_lines: int, edge_lines: int) -> str:
    if line_number <= edge_lines:
        return "top"
    if line_number > max(0, total_lines - edge_lines):
        return "bottom"
    return "body"


def collect_page_lines(pages: list[str], edge_lines: int) -> list[PageLine]:
    collected: list[PageLine] = []
    for page_index, page_text in enumerate(pages, start=1):
        raw_lines = [line.rstrip() for line in page_text.splitlines()]
        cleaned_lines = [line for line in raw_lines if normalize_line(line)]
        total = len(cleaned_lines)

        for line_index, line in enumerate(cleaned_lines, start=1):
            normalized = normalize_line(line)
            collected.append(
                PageLine(
                    page=page_index,
                    line_number=line_index,
                    text=normalized,
                    normalized=comparable_line(normalized),
                    zone=zone_for_line(line_index, total, edge_lines),
                )
            )
    return collected


def detect_repeated_edge_lines(
    lines: list[PageLine],
    page_count: int,
    min_repeat_ratio: float,
) -> set[str]:
    threshold = max(2, int(page_count * min_repeat_ratio))
    pages_by_line: dict[str, set[int]] = defaultdict(set)

    for line in lines:
        if line.zone not in {"top", "bottom"}:
            continue
        if len(line.normalized) < 3:
            continue
        pages_by_line[line.normalized].add(line.page)

    return {
        normalized
        for normalized, pages in pages_by_line.items()
        if len(pages) >= threshold
    }


def is_page_number(line: PageLine, page_count: int) -> bool:
    text = line.text.strip()
    if line.zone == "body":
        return False

    patterns = [
        r"^\d{1,4}$",
        r"^-\s*\d{1,4}\s*-$",
        r"^page\s+\d{1,4}$",
        r"^page\s+\d{1,4}\s+of\s+\d{1,4}$",
        r"^\d{1,4}\s*/\s*\d{1,4}$",
    ]
    if any(re.match(pattern, text, re.IGNORECASE) for pattern in patterns):
        numbers = [int(value) for value in re.findall(r"\d{1,4}", text)]
        return bool(numbers) and all(0 < value <= page_count + 10 for value in numbers)
    return False


def looks_like_pdf_boilerplate(line: PageLine) -> bool:
    if line.zone == "body":
        return False

    text = line.text.lower()
    boilerplate_bits = [
        "robertlambert.org",
        "sermons-transcribed",
        "transcribed sermons",
        "downloaded from",
        "www.",
    ]
    return any(bit in text for bit in boilerplate_bits)


def clean_pages(
    pages: list[str],
    edge_lines: int,
    min_repeat_ratio: float,
) -> tuple[str, list[RemovedLine], dict[str, object]]:
    page_count = len(pages)
    lines = collect_page_lines(pages, edge_lines=edge_lines)
    repeated_edge_lines = detect_repeated_edge_lines(
        lines,
        page_count=page_count,
        min_repeat_ratio=min_repeat_ratio,
    )

    removed: list[RemovedLine] = []
    kept_by_page: dict[int, list[str]] = defaultdict(list)

    for line in lines:
        reason = None
        if line.normalized in repeated_edge_lines:
            reason = "repeated top/bottom line"
        elif is_page_number(line, page_count):
            reason = "page number"
        elif looks_like_pdf_boilerplate(line):
            reason = "pdf/site boilerplate"

        if reason:
            removed.append(
                RemovedLine(
                    page=line.page,
                    line_number=line.line_number,
                    text=line.text,
                    reason=reason,
                )
            )
        else:
            kept_by_page[line.page].append(line.text)

    page_texts = [join_lines_to_paragraphs(kept_by_page[index]) for index in range(1, page_count + 1)]
    cleaned_text = "\n\n".join(page for page in page_texts if page.strip())
    cleaned_text = final_text_cleanup(cleaned_text)

    diagnostics = {
        "page_count": page_count,
        "line_count": len(lines),
        "removed_count": len(removed),
        "repeated_edge_lines": sorted(repeated_edge_lines),
        "removed_by_reason": Counter(item.reason for item in removed),
    }
    return cleaned_text, removed, diagnostics


def join_lines_to_paragraphs(lines: Iterable[str]) -> str:
    paragraphs: list[str] = []
    current: list[str] = []

    for line in lines:
        text = normalize_line(line)
        if not text:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue

        if current and starts_new_paragraph(text, current[-1]):
            paragraphs.append(" ".join(current))
            current = [text]
        else:
            current.append(text)

    if current:
        paragraphs.append(" ".join(current))

    return "\n\n".join(paragraphs)


def starts_new_paragraph(line: str, previous: str) -> bool:
    if re.match(r"^(Endnote|Reference|Scripture|Prayer|Opening prayer)\b", line, re.I):
        return True
    if re.match(r"^\(?[A-Z][A-Za-z .,'&-]{0,60}\)?[:;]$", line):
        return True
    if re.match(r"^\d+\s+[A-Z]", line):
        return True
    if previous.endswith((".", "!", "?", ":", ";", ")")) and len(previous) < 90:
        return True
    return False


def final_text_cleanup(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or "sermon"


def infer_name(source: str, title: str | None) -> str:
    if title:
        return slugify(title)
    parsed = urlparse(source)
    if parsed.scheme in {"http", "https"}:
        name = Path(unquote(parsed.path)).stem
        return slugify(name)
    return slugify(Path(source).stem)


def write_removed_report(path: Path, removed: list[RemovedLine], diagnostics: dict[str, object]) -> None:
    lines = [
        "# PDF Cleaning Removed Lines",
        "",
        f"- Pages: {diagnostics['page_count']}",
        f"- Total extracted lines: {diagnostics['line_count']}",
        f"- Removed lines: {diagnostics['removed_count']}",
        "",
        "## Removed By Reason",
        "",
    ]

    for reason, count in sorted(diagnostics["removed_by_reason"].items()):
        lines.append(f"- {reason}: {count}")

    lines.extend(["", "## Removed Lines", ""])
    if not removed:
        lines.append("No lines were removed.")
    else:
        lines.append("| Page | Line | Reason | Text |")
        lines.append("|---:|---:|---|---|")
        for item in removed:
            safe_text = item.text.replace("|", "\\|")
            lines.append(f"| {item.page} | {item.line_number} | {item.reason} | {safe_text} |")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract and clean sermon text from a PDF.")
    parser.add_argument("source", help="Local PDF path or direct PDF URL")
    parser.add_argument("--title", help="Sermon title, used for output names")
    parser.add_argument("--date", help="Sermon date, stored in metadata")
    parser.add_argument(
        "--engine",
        choices=("pymupdf", "pdfplumber"),
        default="pymupdf",
        help="PDF extraction engine",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory for cleaned output and reports",
    )
    parser.add_argument(
        "--edge-lines",
        type=int,
        default=4,
        help="How many top/bottom lines per page are considered header/footer candidates",
    )
    parser.add_argument(
        "--min-repeat-ratio",
        type=float,
        default=0.35,
        help="Fraction of pages a header/footer line must appear on before removal",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Write page diagnostics JSON beside the text/report",
    )
    args = parser.parse_args()

    source = args.source
    parsed = urlparse(source)
    if parsed.scheme in {"http", "https"}:
        pdf_path = download_pdf(source)
    else:
        pdf_path = Path(source)

    if not pdf_path.exists():
        raise RuntimeError(f"PDF not found: {pdf_path}")

    pages = load_pdf_text_pages(pdf_path, args.engine)
    cleaned_text, removed, diagnostics = clean_pages(
        pages,
        edge_lines=args.edge_lines,
        min_repeat_ratio=args.min_repeat_ratio,
    )

    output_name = infer_name(source, args.title)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    text_path = args.output_dir / f"{output_name}.cleaned.txt"
    removed_path = args.output_dir / f"{output_name}.removed.md"
    metadata_path = args.output_dir / f"{output_name}.metadata.json"

    text_path.write_text(cleaned_text, encoding="utf-8")
    write_removed_report(removed_path, removed, diagnostics)

    metadata = {
        "title": args.title,
        "date": args.date,
        "source": source,
        "engine": args.engine,
        **diagnostics,
    }
    if args.json:
        metadata_path.write_text(json.dumps(metadata, indent=2, default=str), encoding="utf-8")

    preview = textwrap.shorten(cleaned_text.replace("\n", " "), width=240, placeholder="...")
    print(f"Pages: {diagnostics['page_count']}")
    print(f"Removed lines: {diagnostics['removed_count']}")
    print(f"Cleaned text: {text_path}")
    print(f"Removed-lines report: {removed_path}")
    if args.json:
        print(f"Metadata: {metadata_path}")
    print("")
    print("Preview:")
    print(preview)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
