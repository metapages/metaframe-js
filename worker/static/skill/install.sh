#!/bin/sh
# Install the `framejs` Agent Skill (https://framejs.io) into a skills directory.
#
# Quick install (into ~/.claude/skills):
#   curl -fsSL https://framejs.io/skill/install.sh | sh
#
# Pick another harness's skills directory (first arg or FRAMEJS_SKILLS_DIR):
#   curl -fsSL https://framejs.io/skill/install.sh | sh -s -- ~/.cursor/skills
#   curl -fsSL https://framejs.io/skill/install.sh | sh -s -- "$PWD/.opencode/skills"
#
# The result is a `framejs/` folder (SKILL.md + references + scripts) in that
# directory. Re-run any time to update to the latest version.
set -eu

BASE="${FRAMEJS_BASE:-https://framejs.io}"
DIR="${1:-${FRAMEJS_SKILLS_DIR:-$HOME/.claude/skills}}"

if ! command -v tar >/dev/null 2>&1; then
  echo "framejs install: 'tar' is required but was not found in PATH." >&2
  exit 1
fi

mkdir -p "$DIR"
echo "Installing the framejs skill into: $DIR/framejs"
curl -fsSL "$BASE/skill/framejs.tar.gz" | tar xz -C "$DIR"
echo "Done. Installed $DIR/framejs"
echo
echo "Restart your agent (skills load at startup), then ask for a chart,"
echo "animation, or to visualize a data file. To target another harness, pass"
echo "its skills directory, e.g.:  | sh -s -- ~/.config/opencode/skills"
