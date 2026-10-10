#!/bin/sh
# =============================================================================
# sync-digest.sh: LINKED Digest sync, WEB ==> NATIVE
# =============================================================================
#
#   THE WEB REPO IS THE PERMANENT SOURCE OF TRUTH. Everything this writes is
#   GENERATED; never hand-edit a synced file.
#
#   Usage:
#     ./scripts/sync-digest.sh                   # defaults to ../euphoriaweb-master
#     ./scripts/sync-digest.sh /path/to/web      # explicit web repo root
#     ./scripts/sync-digest.sh --dry-run [path]  # validate only, write nothing
#
#   The work lives in scripts/sync-digest.mjs (rewritten in Node on 2026-09-28,
#   when posts grew charts, key points and sources that one-regex-per-field
#   parsing could not read). This file stays as the entry point so every doc and
#   habit that names it keeps working. See the .mjs header for what it owns.
# =============================================================================

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# No cd: a relative web path is resolved against the caller's directory, as it always was.
# The resolve hook lets a post file import an extensionless sibling ('../types') the way Vite does.
exec node --import "$SCRIPT_DIR/ts-resolve-hooks.mjs" "$SCRIPT_DIR/sync-digest.mjs" "$@"
