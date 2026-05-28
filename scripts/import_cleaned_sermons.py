#!/usr/bin/env python3
"""
Import reviewed cleaned sermon text into the yearly JS files under sermons/.

This script expects the manifest produced by download_all_missing_sermons.py.
It appends new sermon objects with stable new IDs while preserving the existing
IDs, so bookmarks/reading positions tied to older sermons are not disturbed.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


DEFAULT_MANIFEST = Path("reports/pdf-cleaning/missing-sermons-cleaned-manifest.json")
DEFAULT_SERMONS_DIR = Path("sermons")


TARGET_FILES = {
    "1964": Path("1964-1969/firstset.js"),
    "1965": Path("1964-1969/firstset.js"),
    "1966": Path("1964-1969/firstset.js"),
    "1967": Path("1964-1969/firstset.js"),
    "1968": Path("1964-1969/firstset.js"),
    "1969": Path("1964-1969/firstset.js"),
    "1970": Path("1970/1970.js"),
    "1971": Path("1971/1971.js"),
    "1972": Path("1972/1972.js"),
    "1973": Path("1973/1973.js"),
}


@dataclass(frozen=True)
class ImportItem:
    id: int
    title: str
    date: str
    year: str
    location: str
    cleaned_path: Path
    target_path: Path
    site_index: int | None


def normalize_title(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def normalize_date(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip())
    match = re.search(r"\b([A-Za-z]+)-\s*(\d{1,2})-(\d{4})\b", value)
    if not match:
        return value
    return f"{match.group(1).title()}-{int(match.group(2))}-{match.group(3)}"


def js_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def escape_template_literal(value: str) -> str:
    # Backticks terminate template literals and ${ starts JS interpolation.
    return value.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def get_max_text_sermon_id(sermons_dir: Path) -> int:
    max_id = 0
    for path in sermons_dir.glob("*/*.js"):
        text = path.read_text(encoding="utf-8", errors="replace")
        for match in re.finditer(r"\bid\s*:\s*(\d+)", text):
            max_id = max(max_id, int(match.group(1)))
    return max_id


def existing_keys(sermons_dir: Path) -> set[tuple[str, str]]:
    keys: set[tuple[str, str]] = set()
    pattern = re.compile(
        r"title\s*:\s*(?P<q>['\"])(?P<title>.*?)(?P=q)"
        r"[\s\S]{0,700}?"
        r"date\s*:\s*(?P<dq>['\"])(?P<date>.*?)(?P=dq)",
        re.MULTILINE,
    )
    for path in sermons_dir.glob("*/*.js"):
        text = path.read_text(encoding="utf-8", errors="replace")
        for match in pattern.finditer(text):
            keys.add(
                (
                    normalize_date(match.group("date")),
                    normalize_title(match.group("title")),
                )
            )
    return keys


def target_for_year(sermons_dir: Path, year: str) -> Path:
    rel = TARGET_FILES.get(year)
    if not rel:
        raise RuntimeError(f"No target yearly file configured for year {year}")
    path = sermons_dir / rel
    if not path.exists():
        raise RuntimeError(f"Target yearly file not found: {path}")
    return path


def strip_pdf_heading(text: str, title: str) -> tuple[str, str]:
    lines = text.replace("\r\n", "\n").replace("\r", "\n").splitlines()
    while lines and not lines[0].strip():
        lines.pop(0)

    location = ""
    if lines:
        first = lines[0].strip()
        title_key = normalize_title(title)
        first_key = normalize_title(first)
        if title_key and first_key.startswith(title_key):
            location = infer_location_from_heading(first)
            lines.pop(0)

    while lines and not lines[0].strip():
        lines.pop(0)
    return "\n".join(lines).strip() + "\n", location


def infer_location_from_heading(line: str) -> str:
    # Example: "SHAMGAR October 20, 1968 Pm Durham, Connecticut Robert Lee Lambert Jr"
    match = re.search(
        r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{1,2},\s+\d{4}\s+(?:Am|Pm)\s+(?P<location>.*?)\s+Robert\s+Lee\s+Lambert",
        line,
        re.IGNORECASE,
    )
    if not match:
        return ""
    return re.sub(r"\s+", " ", match.group("location")).strip()


def build_item(raw: dict, next_id: int, sermons_dir: Path) -> ImportItem:
    title = raw["title"]
    date = normalize_date(raw["date"])
    year = raw["year"]
    cleaned_path = Path(raw["cleaned_path"])
    if not cleaned_path.exists():
        raise RuntimeError(f"Cleaned text not found: {cleaned_path}")

    raw_text = cleaned_path.read_text(encoding="utf-8", errors="replace")
    sermon_text, location = strip_pdf_heading(raw_text, title)

    temp_path = cleaned_path.with_suffix(".import-body.tmp")
    temp_path.write_text(sermon_text, encoding="utf-8")

    return ImportItem(
        id=next_id,
        title=title,
        date=date,
        year=year,
        location=location,
        cleaned_path=temp_path,
        target_path=target_for_year(sermons_dir, year),
        site_index=raw.get("site_index"),
    )


def render_sermon_object(item: ImportItem) -> str:
    sermon_text = item.cleaned_path.read_text(encoding="utf-8")
    escaped_sermon = escape_template_literal(sermon_text)

    fields = [
        f"    id: {item.id},",
        f"    title: {js_string(item.title)},",
        f"    year: {js_string(item.year)},",
        '    type: "text",',
        f"    date: {js_string(item.date)},",
    ]
    if item.location:
        fields.append(f"    location: {js_string(item.location)},")
    fields.append(f"    sermon: `\n{escaped_sermon}`")

    return "  {\n" + "\n".join(fields) + "\n  },\n"


def append_objects_by_file(items: list[ImportItem], dry_run: bool) -> None:
    by_file: dict[Path, list[ImportItem]] = {}
    for item in items:
        by_file.setdefault(item.target_path, []).append(item)

    for path, file_items in by_file.items():
        original = path.read_text(encoding="utf-8", errors="replace")
        marker = re.search(r"\n\s*\]\s*;?\s*\n\s*export\s+default\b", original)
        if not marker:
            raise RuntimeError(f"Could not find array closing marker in {path}")

        insertion = "\n" + "".join(render_sermon_object(item) for item in file_items)
        updated = original[: marker.start()] + insertion + original[marker.start() :]

        if dry_run:
            print(f"Would append {len(file_items)} sermon(s) to {path}")
        else:
            path.write_text(updated, encoding="utf-8", newline="\n")
            print(f"Appended {len(file_items)} sermon(s) to {path}")


def cleanup_temp_files(items: list[ImportItem]) -> None:
    for item in items:
        try:
            item.cleaned_path.unlink(missing_ok=True)
        except TypeError:
            if item.cleaned_path.exists():
                item.cleaned_path.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="Import cleaned sermons into yearly JS files.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--sermons-dir", type=Path, default=DEFAULT_SERMONS_DIR)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    manifest = sorted(manifest, key=lambda item: item.get("site_index") or 0)
    existing = existing_keys(args.sermons_dir)
    next_id = get_max_text_sermon_id(args.sermons_dir) + 1

    items: list[ImportItem] = []
    try:
        for raw in manifest:
            key = (normalize_date(raw["date"]), normalize_title(raw["title"]))
            if key in existing:
                print(f"Skipping already-present sermon: {raw['date']} - {raw['title']}")
                continue
            item = build_item(raw, next_id, args.sermons_dir)
            items.append(item)
            next_id += 1

        if not items:
            print("No new sermons to import.")
            return 0

        append_objects_by_file(items, dry_run=args.dry_run)
        print("")
        print(f"Prepared/imported sermons: {len(items)}")
        print(f"Assigned IDs: {items[0].id}-{items[-1].id}")
        return 0
    finally:
        cleanup_temp_files(items)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
