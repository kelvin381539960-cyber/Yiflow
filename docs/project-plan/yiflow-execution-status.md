# Yiflow Execution Status

## Current Phase

`Phase 2：技术设计与验证`

## Current Task

`YF-P2-001：DSL Schema v0.1`

## Completed Tasks

### YF-P0-001：创建 README

- 输出文件：`README.md`
- 状态：Completed
- 说明：仓库根目录已具备项目入口、文档入口、当前阶段说明和 Agent 工作规则提示。

### YF-P0-002：创建 AI 使用规则

- 输出文件：`docs/ai-rules/yiflow-ai-rules-v1.0.md`
- 状态：Completed
- 说明：已定义 AI 角色边界、任务编号规则、代码生成规则、DSL/AST/Operation 变更规则、幻觉防控规则和输出自检清单。

### YF-P0-003：创建 ADR 模板

- 输出文件：`docs/adr/adr-template.md`
- 状态：Completed
- 说明：已建立关键决策记录模板，后续 DSL、AST、Layout、Cursor 集成等关键变更必须通过 ADR 记录。

### YF-P0-004：创建执行状态文件

- 输出文件：`docs/project-plan/yiflow-execution-status.md`
- 状态：Completed
- 说明：本文件即为跨对话、跨 Agent 的当前执行状态入口。

### YF-P0-005：创建首批 examples

- 输出文件：
  - `examples/approval-flow.swimflow.yaml`
  - `examples/human-system-flow.swimflow.yaml`
  - `examples/exception-return-flow.swimflow.yaml`
- 状态：Completed
- 说明：已创建三类核心示例，分别覆盖标准审批、系统与人工混合、异常与回跳流程。未将 KYC 作为唯一示例场景。

### YF-P1-001：输出 MVP Scope v1.0

- 输出文件：`docs/prd/yiflow-mvp-scope-v1.0.md`
- 状态：Completed
- 说明：已明确 MVP 三阶段交付范围（P0 技术样机 / P1 可用原型 / P2 产品化），确认 MVP 必做功能集（SwimFlow DSL、Graph AST、Parser/Validator、基础布局、Markdown 预览、Editor 基础功能、CLI、SVG/PNG 导出），并明确排除项（自由画布、多人协作、完整 BPMN、AI 自然语言生成、draw.io 导入）。

### YF-P1-002：输出用户任务流文档

- 输出文件：`docs/ux/yiflow-user-flows-v1.0.md`
- 状态：Completed
- 说明：已覆盖首次出图、小改节点、改职责归属、局部整理、导出进文档 5 条 MVP 用户任务流；每条任务流均包含用户输入、系统动作、成功状态、失败状态和不做范围。

### YF-P1-003：输出编辑器交互规格

- 输出文件：`docs/ux/yiflow-editor-interaction-spec-v1.0.md`
- 状态：Completed
- 说明：已明确节点菜单、边菜单、合法拖拽、局部整理、锁定机制、保存回写 DSL、Markdown Preview 与 Editor 边界，并明确禁止自由画布模式。

## Changed Files

- `README.md`
- `docs/project-plan/yiflow-implementation-plan-v1.0.md`
- `docs/project-plan/yiflow-project-plan-v1.0.md`
- `docs/prd/yiflow-prd-v1.3.md`
- `docs/ai-rules/yiflow-ai-rules-v1.0.md`
- `docs/adr/adr-template.md`
- `docs/project-plan/yiflow-execution-status.md`
- `examples/approval-flow.swimflow.yaml`
- `examples/human-system-flow.swimflow.yaml`
- `examples/exception-return-flow.swimflow.yaml`
- `docs/prd/yiflow-mvp-scope-v1.0.md`
- `docs/ux/yiflow-user-flows-v1.0.md`
- `docs/ux/yiflow-editor-interaction-spec-v1.0.md`

## Current Decisions

- Yiflow 已完成 Phase 0 的核心治理体系建设。
- Yiflow 已完成 Phase 1 的产品需求收敛，可以进入 Phase 2 技术设计与验证。
- 后续所有正式工作必须有任务编号。
- AI 不能越级修改产品边界、DSL、AST、Operation、Layout 或 Cursor 集成路线。
- 关键决策必须写 ADR。
- 默认执行顺序遵循 `docs/project-plan/yiflow-implementation-plan-v1.0.md`。
- 新 Agent 接手时必须先读实施计划、项目计划、PRD 和本执行状态文件。
- examples 必须覆盖多类真实业务流程，不把 KYC 作为唯一目标场景。
- MVP 用户任务流已收敛为 5 条：首次出图、小改节点、改职责归属、局部整理、导出进文档。
- 编辑器是结构化编辑器，不是 Figma / draw.io 式自由画布。

## Open Questions

- 是否需要额外加入 KYC 示例作为补充样例。
- DSL Schema v0.1 是否采用 YAML 作为唯一 MVP 输入格式。
- P0 技术栈是否采用 TypeScript 作为默认实现语言。
- Layout P0 是否先做自研简单布局，还是直接引入 dagre / elkjs 进行验证。
- DSL Schema v0.1 需要在不破坏现有 examples 的前提下明确 `diagram`、`lanes`、`nodes`、`edges`、`path_type`、`layout`、`metadata`。

## Risks

- 若直接进入代码开发，会绕过 DSL Schema、AST Model 和技术设计。
- 若 AI 未严格遵守 `docs/ai-rules/yiflow-ai-rules-v1.0.md`，可能导致范围膨胀和不可维护代码。
- 当前 examples 尚未经过 schema 校验，因为 DSL Schema v0.1 尚未正式定义。
- 若 DSL Schema 定义过宽，后续 Parser、Validator 和 Editor 实现成本会升高。
- 若 DSL Schema 定义过窄，后续 Operation 和 Layout 可能缺少必要字段。

## Next Tasks

按实施计划继续执行：

### YF-P2-001：DSL Schema v0.1

- `docs/tech-design/yiflow-dsl-schema-v0.1.md`

### YF-P2-002：AST Model v0.1

- `docs/tech-design/yiflow-ast-model-v0.1.md`

### YF-P2-003：Operation Protocol v0.1

- `docs/tech-design/yiflow-operation-protocol-v0.1.md`

## Agent Handoff Notes

新 Agent 接手时，请先阅读：

1. `docs/project-plan/yiflow-implementation-plan-v1.0.md`
2. `docs/project-plan/yiflow-project-plan-v1.0.md`
3. `docs/prd/yiflow-prd-v1.3.md`
4. `docs/project-plan/yiflow-execution-status.md`
5. 当前任务相关文档

接手后必须先输出：

> 我已接手 Yiflow 项目。  
> 当前阶段：Phase 2  
> 当前任务：YF-P2-001 DSL Schema v0.1  
> 已知约束：不直接写核心代码；不实现 Parser；不改产品边界；关键决策必须写 ADR；Schema 必须兼容现有 examples  
> 下一步动作：创建 docs/tech-design/yiflow-dsl-schema-v0.1.md  
> 不会做的事：不会跳过技术设计直接进入 P0 代码实现

## Do Not Do

- 不要直接进入核心代码实现。
- 不要创建复杂编辑器。
- 不要实现 Cursor 插件。
- 不要改变 Yiflow 的产品边界。
- 不要将 KYC 作为唯一示例场景。
- 不要未经 ADR 修改 DSL / AST / Operation 核心结构。
- 不要把编辑器设计成 Figma / draw.io 式自由画布。
- 不要在 DSL Schema 未完成前实现 Parser。