#!/usr/bin/env python3
"""
Download and clean one missing transcribed sermon PDF for review.

By default this picks the first missing sermon reported by
check_new_transcribed_sermons.py, downloads its PDF to reports/missing-sermons,
then runs the conservative PDF cleaner into reports/pdf-cleaning.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urlparse, urlunparse
from urllib.request import Request, urlopen

from check_new_transcribed_sermons import (
    DEFAULT_SERMONS_DIR,
    DEFAULT_URL,
    compare_entries,
    fetch_html,
    parse_local_entries,
    parse_site_entries,
)
from clean_sermon_pdf import clean_pages, infer_name, load_pdf_text_pages, write_removed_report


PDF_DOWNLOAD_DIR = Path("reports/missing-sermons")
PDF_CLEAN_DIR = Path("reports/pdf-cleaning")


def download_file(url: str, output_dir: Path, fallback_name: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    parsed = urlparse(url)
    filename = Path(unquote(parsed.path)).name or f"{fallback_name}.pdf"
    filename = sanitize_filename(filename)
    if not filename.lower().endswith(".pdf"):
        filename = f"{filename}.pdf"

    output_path = output_dir / filename
    request_url = encode_url_path(url)
    request = Request(request_url, headers={"User-Agent": "HisVoiceMissingSermonDownloader/1.0"})
    with urlopen(request, timeout=90) as response:
        output_path.write_bytes(response.read())
    return output_path


def encode_url_path(url: str) -> str:
    parsed = urlparse(url)
    return urlunparse(
        parsed._replace(path=quote(unquote(parsed.path), safe="/%"))
    )


def sanitize_filename(value: str) -> str:
    value = value.replace("\u00a0", " ")
    value = re.sub(r'[<>:"/\\|?*]+', " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value or "sermon.pdf"


def pick_missing(missing: list[dict[str, object]], title: str | None, index: int | None):
    if title:
        title_key = title.strip().lower()
        for item in missing:
            site = item["site"]
            if site["title"].strip().lower() == title_key:
                return item
        raise RuntimeError(f"No missing sermon found with title: {title}")

    if index is not None:
        for item in missing:
            site = item["site"]
            if site.get("index") == index:
                return item
        raise RuntimeError(f"No missing sermon found with site index: {index}")

    if not missing:
        raise RuntimeError("No missing sermons found.")
    return missing[0]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Download one missing sermon PDF and run the cleaner for testing."
    )
    parser.add_argument("--url", default=DEFAULT_URL, help="Transcribed sermons index URL")
    parser.add_argument("--sermons-dir", type=Path, default=DEFAULT_SERMONS_DIR)
    parser.add_argument("--title", help="Missing sermon title to sample")
    parser.add_argument("--index", type=int, help="Missing sermon site row number to sample")
    parser.add_argument("--engine", choices=("pymupdf", "pdfplumber"), default="pymupdf")
    parser.add_argument("--edge-lines", type=int, default=4)
    parser.add_argument("--min-repeat-ratio", type=float, default=0.35)
    parser.add_argument("--download-dir", type=Path, default=PDF_DOWNLOAD_DIR)
    parser.add_argument("--output-dir", type=Path, default=PDF_CLEAN_DIR)
    args = parser.parse_args()

    site_entries = parse_site_entries(fetch_html(args.url))
    local_entries = parse_local_entries(args.sermons_dir)
    comparison = compare_entries(site_entries, local_entries, fuzzy_threshold=0.86)
    selected = pick_missing(comparison["missing"], args.title, args.index)
    site = selected["site"]

    pdf_url = site.get("pdf_url")
    if not pdf_url:
        raise RuntimeError(f"Missing sermon has no PDF URL: {site['title']}")

    fallback = infer_name(pdf_url, site["title"])
    pdf_path = download_file(pdf_url, args.download_dir, fallback)
    pages = load_pdf_text_pages(pdf_path, args.engine)
    cleaned_text, removed, diagnostics = clean_pages(
        pages,
        edge_lines=args.edge_lines,
        min_repeat_ratio=args.min_repeat_ratio,
    )

    output_name = infer_name(str(pdf_path), site["title"])
    args.output_dir.mkdir(parents=True, exist_ok=True)
    cleaned_path = args.output_dir / f"{output_name}.cleaned.txt"
    removed_path = args.output_dir / f"{output_name}.removed.md"
    metadata_path = args.output_dir / f"{output_name}.metadata.json"

    cleaned_path.write_text(cleaned_text, encoding="utf-8")
    write_removed_report(removed_path, removed, diagnostics)
    metadata_path.write_text(
        json.dumps(
            {
                "title": site["title"],
                "date": site["date"],
                "site_index": site.get("index"),
                "pdf_url": pdf_url,
                "pdf_path": str(pdf_path),
                "engine": args.engine,
                "pages": diagnostics["page_count"],
                "removed_lines": diagnostics["removed_count"],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    preview = cleaned_text.replace("\n", " ")[:500]
    print(f"Selected: #{site.get('index')} {site['date']} - {site['title']}")
    print(f"PDF: {pdf_path}")
    print(f"Cleaned text: {cleaned_path}")
    print(f"Removed-lines report: {removed_path}")
    print(f"Metadata: {metadata_path}")
    print(f"Pages: {diagnostics['page_count']}")
    print(f"Removed lines: {diagnostics['removed_count']}")
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
