#!/usr/bin/env python3
"""
Build the deployable SQLite database from local sermon source files.

Output defaults to dist/sermons-db.db, matching the filename used by the app's
downloadDatabase.js GitHub release flow.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from dataclasses import dataclass
from pathlib import Path


DEFAULT_SERMONS_DIR = Path("sermons")
DEFAULT_OUTPUT = Path("dist/sermons-db.db")


@dataclass
class Sermon:
    id: str
    title: str
    location: str
    year: str
    type: str
    date: str
    sermon: str
    audio_url: str
    download_link: str


def js_string_value(raw: str) -> str:
    raw = raw.strip()
    try:
        return json.loads(raw)
    except Exception:
        if (raw.startswith("'") and raw.endswith("'")) or (
            raw.startswith('"') and raw.endswith('"')
        ):
            return raw[1:-1]
        return raw


def unescape_template_literal(value: str) -> str:
    value = value.replace("\\`", "`").replace("\\${", "${")
    value = value.replace("\\\\", "\\")
    return value


def parse_template_at(text: str, start: int) -> tuple[str, int]:
    if text[start] != "`":
        raise ValueError("Expected template literal start")

    index = start + 1
    chunks: list[str] = []
    while index < len(text):
        char = text[index]
        if char == "\\" and index + 1 < len(text):
            chunks.append(text[index : index + 2])
            index += 2
            continue
        if char == "`":
            return unescape_template_literal("".join(chunks)), index + 1
        chunks.append(char)
        index += 1
    raise ValueError("Unterminated template literal")


def extract_field(segment: str, field: str, default: str = "") -> str:
    pattern = re.compile(
        rf"\b{re.escape(field)}\s*:\s*(?P<value>\"(?:\\.|[^\"])*\"|'(?:\\.|[^'])*'|[^\n,]+)",
        re.MULTILINE,
    )
    match = pattern.search(segment)
    if not match:
        return default
    return js_string_value(match.group("value").strip())


def parse_text_sermon_file(path: Path) -> list[Sermon]:
    text = path.read_text(encoding="utf-8", errors="replace")
    sermons: list[Sermon] = []
    cursor = 0

    while True:
        id_match = re.search(r"\bid\s*:", text[cursor:])
        if not id_match:
            break

        id_pos = cursor + id_match.start()
        object_start = text.rfind("{", 0, id_pos)
        sermon_match = re.search(r"\bsermon\s*:\s*`", text[id_pos:])
        if object_start == -1 or not sermon_match:
            cursor = id_pos + 3
            continue

        sermon_tick = id_pos + sermon_match.end() - 1
        before_sermon = text[object_start:sermon_tick]
        sermon_text, end_pos = parse_template_at(text, sermon_tick)

        sermons.append(
            Sermon(
                id=str(extract_field(before_sermon, "id")),
                title=extract_field(before_sermon, "title"),
                location=extract_field(before_sermon, "location"),
                year=extract_field(before_sermon, "year"),
                type=extract_field(before_sermon, "type", "text"),
                date=extract_field(before_sermon, "date"),
                sermon=sermon_text.strip(),
                audio_url=extract_field(before_sermon, "audioUrl"),
                download_link=extract_field(before_sermon, "downloadLink"),
            )
        )
        cursor = end_pos

    return sermons


def parse_audio_sermons(path: Path) -> list[Sermon]:
    text = path.read_text(encoding="utf-8", errors="replace")
    object_pattern = re.compile(r"\{(?P<body>[\s\S]*?)\}\s*,?", re.MULTILINE)
    sermons: list[Sermon] = []

    for match in object_pattern.finditer(text):
        body = match.group("body")
        if "id" not in body or "title" not in body:
            continue
        sermon_type = extract_field(body, "type", "")
        if sermon_type != "mp3":
            continue
        sermons.append(
            Sermon(
                id=str(extract_field(body, "id")),
                title=extract_field(body, "title"),
                location=extract_field(body, "location"),
                year=extract_field(body, "year"),
                type=sermon_type,
                date=extract_field(body, "date"),
                sermon="",
                audio_url=extract_field(body, "audioUrl"),
                download_link=extract_field(body, "downloadLink"),
            )
        )
    return sermons


def load_sermons(sermons_dir: Path) -> list[Sermon]:
    sermons: list[Sermon] = []
    for path in sorted(sermons_dir.glob("*/*.js")):
        sermons.extend(parse_text_sermon_file(path))
    sermons.extend(parse_audio_sermons(sermons_dir / "audio.ts"))
    return sermons


def create_equal_volume_paragraphs(text: str) -> list[str]:
    if not text or len(text) < 200:
        return [text]

    min_words = 300
    max_words = 450
    target_words = 375
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    if len(sentences) <= 2:
        return [text]

    total_words = len(re.split(r"\s+", text))
    estimated_paragraphs = max(1, (total_words + target_words - 1) // target_words)
    adjusted_target = max(1, total_words // estimated_paragraphs)

    result: list[str] = []
    current = ""
    current_words = 0

    for index, sentence in enumerate(sentences):
        sentence_words = len(re.split(r"\s+", sentence))
        would_exceed = current_words + sentence_words > adjusted_target
        has_minimum = current_words >= min_words
        is_last = index == len(sentences) - 1

        if would_exceed and has_minimum and not is_last:
            if current.strip():
                result.append(current.strip())
            current = sentence
            current_words = sentence_words
        else:
            current = f"{current} {sentence}".strip()
            current_words += sentence_words

        if current_words > max_words and not is_last:
            if current.strip():
                result.append(current.strip())
            current = ""
            current_words = 0

    if current.strip():
        if current_words < min_words / 2 and result:
            previous = result.pop()
            result.append(f"{previous} {current.strip()}")
        else:
            result.append(current.strip())

    return result or [text]


def format_sermon_into_paragraphs(text: str) -> list[str]:
    if not text:
        return []
    if len(text) < 100:
        return [text.strip()]

    cleaned = text.replace("\r\n", "\n")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    major_paragraphs = [p.strip() for p in re.split(r"\n\s*\n", cleaned) if p.strip()]

    result: list[str] = []
    for paragraph in major_paragraphs:
        result.extend(create_equal_volume_paragraphs(paragraph))
    return result


def initialize_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        DROP TABLE IF EXISTS sermons_fts;
        DROP TABLE IF EXISTS sermon_paragraphs;
        DROP TABLE IF EXISTS migration_status;
        DROP TABLE IF EXISTS sermons;

        CREATE TABLE sermons (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          location TEXT,
          year TEXT,
          type TEXT NOT NULL,
          date TEXT,
          sermon TEXT,
          audioUrl TEXT,
          downloadLink TEXT,
          paragraph_count INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE INDEX idx_sermons_type ON sermons(type);
        CREATE INDEX idx_sermons_year ON sermons(year);
        CREATE INDEX idx_sermons_date ON sermons(date);

        CREATE TABLE migration_status (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
        """
    )


def insert_sermons(connection: sqlite3.Connection, sermons: list[Sermon]) -> None:
    for sermon in sermons:
        paragraphs = format_sermon_into_paragraphs(sermon.sermon)
        paragraph_count = len(paragraphs) if sermon.sermon else 0

        connection.execute(
            """
            INSERT INTO sermons
              (id, title, location, year, type, date, sermon, audioUrl, downloadLink, paragraph_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sermon.id,
                sermon.title,
                sermon.location,
                sermon.year,
                sermon.type,
                sermon.date,
                sermon.sermon,
                sermon.audio_url,
                sermon.download_link,
                paragraph_count,
            ),
        )

    connection.execute(
        "INSERT OR REPLACE INTO migration_status (key, value) VALUES (?, ?)",
        ("migration_completed", "true"),
    )


def verify_database(connection: sqlite3.Connection) -> dict[str, int]:
    values = {}
    for key, query in {
        "total": "SELECT COUNT(*) FROM sermons",
        "text": "SELECT COUNT(*) FROM sermons WHERE type = 'text'",
        "audio": "SELECT COUNT(*) FROM sermons WHERE type = 'mp3'",
        "migration_status": "SELECT COUNT(*) FROM migration_status",
    }.items():
        values[key] = int(connection.execute(query).fetchone()[0])
    return values


def main() -> int:
    parser = argparse.ArgumentParser(description="Build sermons-db.db from local sermon files.")
    parser.add_argument("--sermons-dir", type=Path, default=DEFAULT_SERMONS_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    sermons = load_sermons(args.sermons_dir)
    text_count = sum(1 for sermon in sermons if sermon.type == "text")
    audio_count = sum(1 for sermon in sermons if sermon.type == "mp3")

    if text_count != 134:
        raise RuntimeError(f"Expected 134 text sermons, parsed {text_count}")
    if audio_count != 469:
        raise RuntimeError(f"Expected 469 audio sermons, parsed {audio_count}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.output.exists():
        args.output.unlink()

    connection = sqlite3.connect(args.output)
    try:
        initialize_schema(connection)
        insert_sermons(connection, sermons)
        connection.commit()
        verification = verify_database(connection)
    finally:
        connection.close()

    size_mb = args.output.stat().st_size / 1024 / 1024
    print(f"Built database: {args.output}")
    print(f"Size: {size_mb:.2f} MB")
    print(f"Rows: {verification}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
