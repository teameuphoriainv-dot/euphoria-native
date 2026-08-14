#!/usr/bin/env python3
"""Generate CHANGELOG.md from the full git log (bypassing the token-filtering wrapper)."""
import collections
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]

rows = []
for line in open(SRC, encoding="utf-8"):
    line = line.rstrip("\n")
    if not line:
        continue
    parts = line.split("\t", 2)
    if len(parts) != 3:
        continue
    sha, date, subj = parts
    rows.append((sha, date, subj))

# Conventional Commits. `[a-z][a-z0-9]*` not `[a-z]+`, because `a11y(unit13):` is a real type here
# and a letters-only class silently dropped it into the unparsed bucket.
CONV = re.compile(r"^([a-z][a-z0-9]*)(\(([^)]+)\))?(!?):\s*(.*)$")
# The older convention this repo used before it standardised: "Area: what changed".
AREA = re.compile(r"^([A-Z][A-Za-z0-9_/.-]*(?:\.md)?):\s*(.*)$")

by_date = collections.OrderedDict()
type_counts = collections.Counter()
scope_counts = collections.Counter()

for sha, date, subj in rows:
    m = CONV.match(subj)
    if m:
        typ, scope, rest = m.group(1), m.group(3), m.group(5)
    else:
        a = AREA.match(subj)
        if a:
            typ, scope, rest = "change", a.group(1), a.group(2)
        else:
            typ, scope, rest = "change", None, subj
    type_counts[typ] += 1
    if scope:
        scope_counts[scope] += 1
    by_date.setdefault(date, []).append((sha[:7], typ, scope, rest))

dates = list(by_date.keys())
newest, oldest = dates[0], dates[-1]

TYPE_MEANING = {
    "feat": "a user-visible capability",
    "fix": "a defect corrected",
    "docs": "the plan, the corrections log, or a handoff",
    "test": "a regression or pin added",
    "audit": "a screen or system reviewed against evidence",
    "copy": "user-facing wording, approved per §0.7",
    "refactor": "structure changed, behaviour held",
    "style": "formatting only",
    "revert": "a change backed out",
    "redesign": "a screen reworked",
    "chore": "housekeeping",
    "a11y": "an accessibility defect closed",
    "change": "pre-convention commits, from before the repo standardised on Conventional Commits",
    "other": "not conventional-commit formatted",
}

w = open(OUT, "w", encoding="utf-8")
w.write("# Changelog\n\n")
w.write(
    f"Every commit in `euphoria-native`, newest first — **{len(rows)} commits** across "
    f"**{len(dates)} active days**, {oldest} → {newest}.\n\n"
)
w.write(
    "This file is generated from `git log`. It is the *record*; the *reasoning* lives in "
    "`refs/MASTER_PLAN.md` §22, the corrections log, where entries are numbered `C1`…`C115` and "
    "commit messages reference them by number. When a subject here mentions a `C` number, that is "
    "where to read why.\n\n"
)

w.write("## Commits by type\n\n")
w.write("| type | count | what it means here |\n|---|---:|---|\n")
for typ, n in type_counts.most_common():
    w.write(f"| `{typ}` | {n} | {TYPE_MEANING.get(typ, '')} |\n")
w.write("\n")

if scope_counts:
    w.write("## Most-touched scopes\n\n")
    w.write("| scope | commits |\n|---|---:|\n")
    for scope, n in scope_counts.most_common(15):
        w.write(f"| `{scope}` | {n} |\n")
    w.write("\n")

w.write("---\n\n")
for date in dates:
    entries = by_date[date]
    w.write(f"## {date} · {len(entries)} commit{'s' if len(entries) != 1 else ''}\n\n")
    for sha, typ, scope, rest in entries:
        label = f"{typ}({scope})" if scope else typ
        w.write(f"- `{sha}` **{label}** — {rest}\n")
    w.write("\n")
w.close()
print(f"wrote {OUT}: {len(rows)} commits, {len(dates)} days, {len(type_counts)} types")
