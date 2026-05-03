#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="artifacts"
OUTPUT_FILE="$OUTPUT_DIR/approval-flow.svg"

mkdir -p "$OUTPUT_DIR"

echo "[Yiflow] build"
npm run build

echo "[Yiflow] test"
npm test

echo "[Yiflow] validate approval-flow"
npm run cli -- validate examples/approval-flow.swimflow.yaml

echo "[Yiflow] render approval-flow"
npm run cli -- render examples/approval-flow.swimflow.yaml -o "$OUTPUT_FILE"

if [[ ! -s "$OUTPUT_FILE" ]]; then
  echo "[Yiflow] expected SVG output missing or empty: $OUTPUT_FILE" >&2
  exit 1
fi

echo "[Yiflow] P0 verification passed"
echo "[Yiflow] SVG output: $OUTPUT_FILE"
