#!/usr/bin/env python3
"""
Download and clean every transcribed sermon that exists on the site but not
in the local sermons folder.

This is the batch version of download_missing_sermon_sample.py. It is still a
review step: it writes PDFs, cleaned text, removed-lines reports, and metadata.
It does not modify files under sermons/.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from check_new_transcribed_sermons import (
    DEFAULT_SERMONS_DIR,
    DEFAULT_URL,
    compare_entries,
    fetch_html,
    parse_local_entries,
    parse_site_entries,
)
from clean_sermon_pdf import clean_pages, infer_name, load_pdf_text_pages, write_removed_report
from download_missing_sermon_sample import download_file


PDF_DOWNLOAD_DIR = Path("reports/missing-sermons")
PDF_CLEAN_DIR = Path("reports/pdf-cleaning")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Download and clean all missing transcribed sermon PDFs."
    )
    parser.add_argument("--url", default=DEFAULT_URL, help="Transcribed sermons index URL")
    parser.add_argument("--sermons-dir", type=Path, default=DEFAULT_SERMONS_DIR)
    parser.add_argument("--engine", choices=("pymupdf", "pdfplumber"), default="pymupdf")
    parser.add_argument("--edge-lines", type=int, default=4)
    parser.add_argument("--min-repeat-ratio", type=float, default=0.35)
    parser.add_argument("--download-dir", type=Path, default=PDF_DOWNLOAD_DIR)
    parser.add_argument("--output-dir", type=Path, default=PDF_CLEAN_DIR)
    parser.add_argument(
        "--limit",
        type=int,
        help="Only process the first N missing sermons, useful for testing",
    )
    args = parser.parse_args()

    site_entries = parse_site_entries(fetch_html(args.url))
    local_entries = parse_local_entries(args.sermons_dir)
    comparison = compare_entries(site_entries, local_entries, fuzzy_threshold=0.86)
    missing = comparison["missing"]
    if args.limit is not None:
        missing = missing[: args.limit]

    if not missing:
        print("No missing sermons found.")
        return 0

    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.download_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    failures = []

    for ordinal, item in enumerate(missing, start=1):
        site = item["site"]
        title = site["title"]
        date = site["date"]
        pdf_url = site.get("pdf_url")

        print(f"[{ordinal}/{len(missing)}] {date} - {title}")
        if not pdf_url:
            failures.append({"title": title, "date": date, "error": "No PDF URL"})
            print("  skipped: no PDF URL")
            continue

        try:
            fallback = infer_name(pdf_url, title)
            pdf_path = download_file(pdf_url, args.download_dir, fallback)
            pages = load_pdf_text_pages(pdf_path, args.engine)
            cleaned_text, removed, diagnostics = clean_pages(
                pages,
                edge_lines=args.edge_lines,
                min_repeat_ratio=args.min_repeat_ratio,
            )

            output_name = infer_name(str(pdf_path), title)
            cleaned_path = args.output_dir / f"{output_name}.cleaned.txt"
            removed_path = args.output_dir / f"{output_name}.removed.md"
            metadata_path = args.output_dir / f"{output_name}.metadata.json"

            cleaned_path.write_text(cleaned_text, encoding="utf-8")
            write_removed_report(removed_path, removed, diagnostics)

            metadata = {
                "title": title,
                "date": date,
                "year": site["year"],
                "site_index": site.get("index"),
                "has_audio": site.get("has_audio"),
                "pdf_url": pdf_url,
                "pdf_path": str(pdf_path),
                "cleaned_path": str(cleaned_path),
                "removed_report_path": str(removed_path),
                "engine": args.engine,
                "pages": diagnostics["page_count"],
                "removed_lines": diagnostics["removed_count"],
            }
            metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
            manifest.append(metadata)

            print(f"  cleaned: {cleaned_path}")
            print(f"  removed lines: {diagnostics['removed_count']}")
        except Exception as exc:
            failures.append({"title": title, "date": date, "pdf_url": pdf_url, "error": str(exc)})
            print(f"  failed: {exc}")

    manifest_path = args.output_dir / "missing-sermons-cleaned-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    failure_path = args.output_dir / "missing-sermons-cleaning-failures.json"
    failure_path.write_text(json.dumps(failures, indent=2) + "\n", encoding="utf-8")

    print("")
    print(f"Processed: {len(manifest)}")
    print(f"Failed: {len(failures)}")
    print(f"Manifest: {manifest_path}")
    if failures:
        print(f"Failures: {failure_path}")
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
