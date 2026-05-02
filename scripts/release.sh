#!/usr/bin/env bash
# Publish crisp-oquent to npm + tag the release.
#
# Usage:
#   ./scripts/release.sh                # interactive: shows pack contents, asks for confirmation
#   ./scripts/release.sh --dry-run      # everything except `npm publish` and `git push`
#   ./scripts/release.sh --no-tag       # publish without creating a git tag
#
# Prerequisites:
#   - `npm whoami` must succeed (run `npm login` first)
#   - working tree must be clean
#   - current branch must be `main`

set -euo pipefail

cd "$(dirname "$0")/.."

DRY_RUN=false
NO_TAG=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --no-tag) NO_TAG=true ;;
    -h|--help)
      head -n 13 "$0" | tail -n 12 | sed 's/^# \{0,1\}//'
      exit 0
      ;;
  esac
done

bold()  { printf "\033[1m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*" >&2; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

abort() { red "✗ $*"; exit 1; }

# ---------- preflight ----------
bold "▶ Preflight"

[ -f package.json ] || abort "Run from the crisp-oquent repo root."

WHOAMI=$(npm whoami 2>/dev/null || true)
[ -n "$WHOAMI" ] || abort "Not logged in to npm. Run: npm login"
green "  ✓ npm user: $WHOAMI"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
[ "$BRANCH" = "main" ] || abort "Must be on 'main' (currently on '$BRANCH')."
green "  ✓ branch: main"

if [ -n "$(git status --porcelain)" ]; then
  abort "Working tree not clean. Commit or stash first."
fi
green "  ✓ working tree clean"

VERSION=$(node -p "require('./package.json').version")
PACKAGE=$(node -p "require('./package.json').name")
green "  ✓ package: $PACKAGE@$VERSION"

# Refuse if this version is already published
if npm view "$PACKAGE@$VERSION" version >/dev/null 2>&1; then
  abort "$PACKAGE@$VERSION is already published. Bump the version in package.json first."
fi
green "  ✓ version $VERSION not yet published"

# Refuse if tag already exists
TAG="v$VERSION"
if git rev-parse "$TAG" >/dev/null 2>&1; then
  abort "Git tag $TAG already exists locally."
fi

# ---------- verify ----------
bold "▶ Verify"
npm run typecheck
npm test
green "  ✓ typecheck + tests passed"

# ---------- build + pack preview ----------
bold "▶ Build + pack preview"
npm run clean
npm run build
PACK_FILE=$(npm pack --silent | tail -n1)
green "  ✓ packed: $PACK_FILE"
echo
yellow "── Tarball contents (only files inside this list will be published):"
tar -tzf "$PACK_FILE" | sed 's|^package/|  |' | sort
echo
SIZE=$(du -h "$PACK_FILE" | cut -f1)
yellow "── Tarball size: $SIZE"
echo

# ---------- confirm ----------
if [ "$DRY_RUN" = true ]; then
  yellow "▶ Dry run — skipping publish and tag."
  rm -f "$PACK_FILE"
  exit 0
fi

read -r -p "$(bold "▶ Publish $PACKAGE@$VERSION as $WHOAMI? [y/N] ")" REPLY
case "$REPLY" in
  y|Y|yes|YES) ;;
  *) yellow "Aborted by user."; rm -f "$PACK_FILE"; exit 0 ;;
esac

# ---------- publish ----------
bold "▶ Publishing"
npm publish --access public
green "  ✓ published $PACKAGE@$VERSION"
rm -f "$PACK_FILE"

# ---------- git tag + push ----------
if [ "$NO_TAG" = false ]; then
  bold "▶ Tagging + pushing"
  git tag -a "$TAG" -m "Release $TAG"
  git push origin main
  git push origin "$TAG"
  green "  ✓ pushed $TAG"
fi

echo
green "✅  Done. https://www.npmjs.com/package/$PACKAGE/v/$VERSION"
