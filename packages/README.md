# Yiflow Packages

This directory contains the Phase 3 P0 technical prototype package skeleton.

Current scope for `YF-P3-001`:

```text
packages/core
packages/parser
packages/validator
packages/layout
packages/renderer
packages/cli
tests
```

## Current status

This is only the engineering skeleton.

Implemented now:

- TypeScript workspace setup.
- Package directories.
- Basic exported placeholders.
- CLI skeleton commands.
- Smoke test.

Not implemented yet:

- Real YAML parser.
- Real DSL to AST conversion.
- Real validator.
- Real layout engine.
- Real SVG renderer.
- Real operation application.

These will be implemented in later tasks according to `docs/project-plan/yiflow-execution-status.md`.
