#!/usr/bin/env bash
# Copy the freshly-built Anchor IDL + TS types into packages/idl so the dApp
# consumes the real interface. Run after `anchor build`.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HERE/../packages/idl"
cp "$HERE/target/idl/zkhelios.json" "$DEST/zkhelios.json"
cp "$HERE/target/types/zkhelios.ts" "$DEST/src/zkhelios.ts"
echo "Synced IDL + types → packages/idl"
