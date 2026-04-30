# Yiflow

Yiflow is an AI-native workflow diagram project focused on turning business processes into structured, editable, validated, and reusable workflow assets.

## What is Yiflow

Yiflow is not a general drawing tool and not a full BPMN platform.

It is designed for work scenarios where product managers, business analysts, engineers, QA, and operation teams need to describe, maintain, and discuss business flows with both AI and human editing.

The core workflow is:

```text
Natural language / DSL
        ↓
Graph AST
        ↓
Layout Engine
        ↓
SVG / HTML Render
        ↓
Document / Markdown / Cursor workflow
```

## Why Yiflow

Current tools have a gap:

- Mermaid is fast, but complex swimlane diagrams are difficult to control.
- draw.io is flexible, but not AI-native and not easy to patch structurally.
- BPMN tools are powerful, but too heavy for daily PRD and workflow design.

Yiflow aims to fill this gap:

> AI can generate it, humans can lightly edit it, and the workflow can remain stable over time.

## Core Ideas

- **SwimFlow DSL**: a structured text format for workflow diagrams.
- **Graph AST**: the single source of truth for diagrams.
- **Operation-first editing**: changes should usually be local patches, not full rewrites.
- **Controlled editing**: no free canvas; only structure-safe edits.
- **Stable layout**: main paths, exception paths, return paths, and swimlanes should remain readable.
- **Work-ready output**: diagrams should be usable in PRDs, Markdown, Cursor, and review documents.

## Current Phase

Current phase:

```text
Phase 0: Project governance and handoff system
```

The project is not yet in core code development.

According to the implementation plan, the first stage is to establish project governance, AI usage rules, ADR templates, execution status, and examples before writing core code.

## Documents

Read these documents in order:

1. [Implementation Plan](docs/project-plan/yiflow-implementation-plan-v1.0.md)
2. [Project Plan](docs/project-plan/yiflow-project-plan-v1.0.md)
3. [PRD v1.3](docs/prd/yiflow-prd-v1.3.md)

Planned next documents:

- `docs/ai-rules/yiflow-ai-rules-v1.0.md`
- `docs/adr/adr-template.md`
- `docs/project-plan/yiflow-execution-status.md`
- `examples/approval-flow.swimflow.yaml`
- `examples/human-system-flow.swimflow.yaml`
- `examples/exception-return-flow.swimflow.yaml`

## Roadmap Summary

### Phase 0: Governance and handoff

- README
- AI rules
- ADR template
- execution status
- first examples

### Phase 1: Product scope refinement

- MVP scope
- user flows
- editor interaction spec

### Phase 2: Technical design

- DSL schema
- AST model
- operation protocol
- layout design
- CLI design

### Phase 3: P0 technical prototype

- parser
- validator
- layout
- SVG renderer
- CLI

### Phase 4: P1 internal usable version

- preview
- lightweight editor
- local edits
- export

### Phase 5: P2 AI workflow version

- natural language to DSL
- natural language to operation
- patch preview
- validation before applying changes

## What Yiflow does not do now

Yiflow does not currently aim to support:

- free canvas editing
- full BPMN replacement
- real-time multiplayer collaboration
- draw.io import/export
- Mermaid high-fidelity import
- workflow execution engine

## Agent / AI Working Rule

Any Agent or AI tool that works on this repository must first read:

```text
1. docs/project-plan/yiflow-implementation-plan-v1.0.md
2. docs/project-plan/yiflow-project-plan-v1.0.md
3. docs/prd/yiflow-prd-v1.3.md
4. docs/project-plan/yiflow-execution-status.md, after it is created
```

Do not start coding without a task ID and acceptance criteria.

Do not change DSL, AST, layout strategy, Cursor integration strategy, or MVP boundary without an ADR or explicit project decision.
