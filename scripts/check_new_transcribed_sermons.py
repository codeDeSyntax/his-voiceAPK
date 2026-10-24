#!/usr/bin/env python3
"""
Check robertlambert.org transcribed sermons against the local sermon corpus.

This script is intentionally read-only for sermon data. It fetches the public
transcribed-sermons index, parses the local JS sermon arrays, compares by
normalized date + title, and writes a report of site sermons missing locally.

Usage:
  python scripts/check_new_transcribed_sermons.py
  python scripts/check_new_transcribed_sermons.py --json
  python scripts/check_new_transcribed_sermons.py --output reports/sermon-diff.md
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import unicodedata
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_URL = "https://robertlambert.org/sermons-transcribed/"
DEFAULT_SERMONS_DIR = Path("sermons")
DEFAULT_OUTPUT = Path("reports/new-transcribed-sermons.md")

MONTHS = (
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
)

MONTH_PATTERN = "|".join(MONTHS)
DATE_PATTERN = re.compile(
    rf"\b(?P<month>{MONTH_PATTERN})-\s*(?P<day>\d{{1,2}})-(?P<year>\d{{4}})\b",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class SermonEntry:
    title: str
    date: str
    year: str
    source: str
    index: int | None = None
    has_audio: bool | None = None
    pdf_url: str | None = None

    @property
    def date_key(self) -> str:
        return normalize_date(self.date)

    @property
    def title_key(self) -> str:
        return normalize_title(self.title)

    @property
    def key(self) -> tuple[str, str]:
        return (self.date_key, self.title_key)


def fetch_html(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (compatible; HisVoiceSermonChecker/1.0; "
                "+https://github.com/codeDeSyntax/hisvoice)"
            )
        },
    )
    try:
        with urlopen(request, timeout=45) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return response.read().decode(charset, errors="replace")
    except HTTPError as exc:
        raise RuntimeError(f"Site request failed with HTTP {exc.code}: {url}") from exc
    except URLError as exc:
        raise RuntimeError(f"Could not reach site: {exc.reason}") from exc


def html_to_text(raw_html: str) -> str:
    text = re.sub(r"(?is)<(script|style).*?</\1>", " ", raw_html)
    text = re.sub(r"(?i)<br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</(p|div|li|tr|h[1-6]|table|section)>", "\n", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    return html.unescape(text)


def parse_site_entries(raw_html: str) -> list[SermonEntry]:
    row_entries = parse_site_table_rows(raw_html)
    if row_entries:
        return row_entries

    text = html_to_text(raw_html)
    compact = re.sub(r"\s+", " ", text)

    start = compact.find("Total Results")
    if start != -1:
        compact = compact[start:]
    end = compact.find("Available in audio")
    if end != -1:
        compact = compact[:end]

    row_pattern = re.compile(
        rf"(?P<index>\d+)\s+"
        rf"(?P<month>{MONTH_PATTERN})-\s*(?P<day>\d{{1,2}})-(?P<year>\d{{4}})\s+"
        rf"(?P<title>.*?)(?=\s+\d+\s+(?:{MONTH_PATTERN})-\s*\d{{1,2}}-\d{{4}}\s+|\s+\*\s*$|$)",
        re.IGNORECASE,
    )

    entries: list[SermonEntry] = []
    for match in row_pattern.finditer(compact):
        title = clean_title(match.group("title"))
        if not title:
            continue

        date = f"{match.group('month').title()}-{int(match.group('day'))}-{match.group('year')}"
        entries.append(
            SermonEntry(
                index=int(match.group("index")),
                date=date,
                year=match.group("year"),
                title=title.rstrip(" *").strip(),
                has_audio=title.endswith("*"),
                pdf_url=None,
                source="site",
            )
        )

    return dedupe_entries(entries)


def parse_site_table_rows(raw_html: str) -> list[SermonEntry]:
    row_pattern = re.compile(r"(?is)<tr\b[^>]*>(.*?)</tr>")
    cell_pattern = re.compile(r"(?is)<td\b[^>]*>(.*?)</td>")
    href_pattern = re.compile(r"""(?is)<a\b[^>]*href=["'](?P<href>[^"']+\.pdf)["']""")

    entries: list[SermonEntry] = []
    for row in row_pattern.findall(raw_html):
        cells = cell_pattern.findall(row)
        if len(cells) < 5:
            continue

        index_text = clean_html_cell(cells[0])
        date_text = clean_html_cell(cells[1])
        title = clean_title(clean_html_cell(cells[2]))
        audio_mark = clean_html_cell(cells[3])
        pdf_match = href_pattern.search(cells[4])

        if not index_text.isdigit() or not title:
            continue

        normalized_date = normalize_date(date_text)
        if not DATE_PATTERN.search(normalized_date):
            continue

        year_match = re.search(r"\b(19\d{2}|20\d{2})\b", normalized_date)
        entries.append(
            SermonEntry(
                index=int(index_text),
                date=normalized_date,
                year=year_match.group(1) if year_match else "",
                title=title,
                has_audio="*" in audio_mark,
                pdf_url=html.unescape(pdf_match.group("href")) if pdf_match else None,
                source="site",
            )
        )

    return dedupe_entries(entries)


def clean_html_cell(value: str) -> str:
    value = re.sub(r"(?is)<[^>]+>", " ", value)
    value = html.unescape(value)
    value = value.replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def parse_local_entries(sermons_dir: Path) -> list[SermonEntry]:
    if not sermons_dir.exists():
        raise RuntimeError(f"Local sermons directory not found: {sermons_dir}")

    entries: list[SermonEntry] = []
    for path in sorted(sermons_dir.glob("*/*.js")):
        text = path.read_text(encoding="utf-8", errors="replace")

        # The local arrays consistently put title before date in each object.
        # Limit the gap so content inside the sermon template string is ignored.
        pattern = re.compile(
            r"title\s*:\s*(?P<q>['\"])(?P<title>.*?)(?P=q)"
            r"[\s\S]{0,700}?"
            r"date\s*:\s*(?P<dq>['\"])(?P<date>.*?)(?P=dq)",
            re.MULTILINE,
        )

        for match in pattern.finditer(text):
            raw_date = match.group("date")
            normalized_date = normalize_date(raw_date)
            year_match = re.search(r"\b(19\d{2}|20\d{2})\b", normalized_date or raw_date)
            entries.append(
                SermonEntry(
                    title=clean_title(match.group("title")),
                    date=normalized_date or raw_date.strip(),
                    year=year_match.group(1) if year_match else "",
                    source=str(path),
                )
            )

    return dedupe_entries(entries)


def clean_title(value: str) -> str:
    value = html.unescape(value)
    value = value.replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_date(value: str) -> str:
    match = DATE_PATTERN.search(value)
    if not match:
        return re.sub(r"\s+", " ", value.strip())
    month = match.group("month").title()
    day = int(match.group("day"))
    year = match.group("year")
    return f"{month}-{day}-{year}"


def normalize_title(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = value.replace("&", " and ")
    value = re.sub(r"\bno\.\b", "number", value)
    value = re.sub(r"[^a-z0-9#]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def title_similarity(left: str, right: str) -> float:
    left_key = normalize_title(left)
    right_key = normalize_title(right)
    if not left_key or not right_key:
        return 0.0
    if left_key == right_key:
        return 1.0
    if left_key in right_key or right_key in left_key:
        return 0.92
    return SequenceMatcher(None, left_key, right_key).ratio()


def dedupe_entries(entries: Iterable[SermonEntry]) -> list[SermonEntry]:
    seen: set[tuple[str, str, str]] = set()
    deduped: list[SermonEntry] = []
    for entry in entries:
        key = (entry.date_key, entry.title_key, entry.source)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(entry)
    return deduped


def compare_entries(
    site_entries: list[SermonEntry],
    local_entries: list[SermonEntry],
    fuzzy_threshold: float,
) -> dict[str, list[dict[str, object]]]:
    local_by_exact = {entry.key: entry for entry in local_entries}
    local_by_date: dict[str, list[SermonEntry]] = {}
    for entry in local_entries:
        local_by_date.setdefault(entry.date_key, []).append(entry)

    missing: list[dict[str, object]] = []
    possible_title_mismatches: list[dict[str, object]] = []
    matched_local_keys: set[tuple[str, str]] = set()

    for site in site_entries:
        exact = local_by_exact.get(site.key)
        if exact:
            matched_local_keys.add(exact.key)
            continue

        same_date = local_by_date.get(site.date_key, [])
        best = None
        best_score = 0.0
        for candidate in same_date:
            score = title_similarity(site.title, candidate.title)
            if score > best_score:
                best = candidate
                best_score = score

        if best and best_score >= fuzzy_threshold:
            matched_local_keys.add(best.key)
            possible_title_mismatches.append(
                {
                    "site": asdict(site),
                    "local": asdict(best),
                    "similarity": round(best_score, 3),
                }
            )
        else:
            missing.append(
                {
                    "site": asdict(site),
                    "same_date_local_candidates": [asdict(item) for item in same_date],
                    "best_similarity": round(best_score, 3),
                }
            )

    site_keys = {entry.key for entry in site_entries}
    local_only = [
        {"local": asdict(entry)}
        for entry in local_entries
        if entry.key not in site_keys and entry.key not in matched_local_keys
    ]

    return {
        "missing": missing,
        "possible_title_mismatches": possible_title_mismatches,
        "local_only": local_only,
    }


def render_markdown(
    site_entries: list[SermonEntry],
    local_entries: list[SermonEntry],
    comparison: dict[str, list[dict[str, object]]],
    url: str,
) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines = [
        "# New Transcribed Sermons Check",
        "",
        f"- Checked: {now}",
        f"- Source: {url}",
        f"- Site transcribed sermons: {len(site_entries)}",
        f"- Local transcribed sermons: {len(local_entries)}",
        f"- Missing locally: {len(comparison['missing'])}",
        f"- Possible title/date matches needing review: {len(comparison['possible_title_mismatches'])}",
        f"- Local-only entries: {len(comparison['local_only'])}",
        "",
        "## Missing Locally",
        "",
    ]

    if not comparison["missing"]:
        lines.append("No site sermons appear to be missing locally.")
    else:
        lines.append("| # | Date | Title | Audio | PDF | Notes |")
        lines.append("|---:|---|---|---|---|---|")
        for item in comparison["missing"]:
            site = item["site"]
            candidates = item["same_date_local_candidates"]
            note = (
                f"{len(candidates)} same-date local candidate(s)"
                if candidates
                else ""
            )
            pdf_url = site.get("pdf_url")
            pdf_link = f"[PDF]({pdf_url})" if pdf_url else ""
            lines.append(
                "| {index} | {date} | {title} | {audio} | {pdf} | {note} |".format(
                    index=site.get("index") or "",
                    date=site["date"],
                    title=site["title"].replace("|", "\\|"),
                    audio="yes" if site.get("has_audio") else "no",
                    pdf=pdf_link,
                    note=note,
                )
            )

    lines.extend(["", "## Possible Title Mismatches", ""])
    if not comparison["possible_title_mismatches"]:
        lines.append("None.")
    else:
        lines.append("| Site # | Date | Site title | Local title | Similarity |")
        lines.append("|---:|---|---|---|---:|")
        for item in comparison["possible_title_mismatches"]:
            site = item["site"]
            local = item["local"]
            lines.append(
                "| {index} | {date} | {site_title} | {local_title} | {similarity} |".format(
                    index=site.get("index") or "",
                    date=site["date"],
                    site_title=site["title"].replace("|", "\\|"),
                    local_title=local["title"].replace("|", "\\|"),
                    similarity=item["similarity"],
                )
            )

    lines.extend(["", "## Local Only", ""])
    if not comparison["local_only"]:
        lines.append("None.")
    else:
        lines.append("| Date | Local title | File |")
        lines.append("|---|---|---|")
        for item in comparison["local_only"]:
            local = item["local"]
            lines.append(
                "| {date} | {title} | {source} |".format(
                    date=local["date"],
                    title=local["title"].replace("|", "\\|"),
                    source=local["source"],
                )
            )

    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Find transcribed sermons on robertlambert.org that are missing locally."
    )
    parser.add_argument("--url", default=DEFAULT_URL, help="Sermons index URL")
    parser.add_argument(
        "--sermons-dir",
        type=Path,
        default=DEFAULT_SERMONS_DIR,
        help="Local sermons directory",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Markdown report path",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print JSON to stdout instead of writing Markdown",
    )
    parser.add_argument(
        "--fuzzy-threshold",
        type=float,
        default=0.86,
        help="Similarity threshold for same-date title mismatch detection",
    )
    args = parser.parse_args()

    raw_html = fetch_html(args.url)
    site_entries = parse_site_entries(raw_html)
    local_entries = parse_local_entries(args.sermons_dir)

    if not site_entries:
        raise RuntimeError("Could not parse any sermons from the site index.")
    if not local_entries:
        raise RuntimeError("Could not parse any sermons from local files.")

    comparison = compare_entries(site_entries, local_entries, args.fuzzy_threshold)

    payload = {
        "url": args.url,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "site_count": len(site_entries),
        "local_count": len(local_entries),
        **comparison,
    }

    if args.json:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        report = render_markdown(site_entries, local_entries, comparison, args.url)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(report, encoding="utf-8")
        print(f"Site sermons: {len(site_entries)}")
        print(f"Local sermons: {len(local_entries)}")
        print(f"Missing locally: {len(comparison['missing'])}")
        print(f"Possible title mismatches: {len(comparison['possible_title_mismatches'])}")
        print(f"Local-only entries: {len(comparison['local_only'])}")
        print(f"Report written to: {args.output}")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
