# Yiflow Execution Status

## Current Phase

`Phase 3：P0 技术样机（待项目主控确认后开始）`

## Current Task

`YF-P3-001：初始化工程结构`

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

### YF-P2-001：DSL Schema v0.1

- 输出文件：`docs/tech-design/yiflow-dsl-schema-v0.1.md`
- 状态：Completed
- 说明：已定义 `diagram`、`lanes`、`nodes`、`edges`、`path_type`、`layout`、`metadata` 和基础校验规则；确认兼容现有 examples；明确 v0.1 不包含 BPMN 完整语义、自由画布坐标、AI prompt 历史和运行时执行状态。

### YF-P2-002：AST Model v0.1

- 输出文件：`docs/tech-design/yiflow-ast-model-v0.1.md`
- 状态：Completed
- 说明：已定义 Graph、Lane、Node、Edge、GraphIndexes、LayoutConfig、LayoutResult 关系、Operation 关系、ValidationResult、Diagnostic、DSL 到 AST 映射、AST 到 DSL 回写规则，并明确支持局部 patch。

### YF-P2-003：Operation Protocol v0.1

- 输出文件：`docs/tech-design/yiflow-operation-protocol-v0.1.md`
- 状态：Completed
- 说明：已定义 Operation 顶层结构、OperationResult、AffectedScope，并覆盖 update_node_text、insert_node_after、insert_node_between、delete_node、move_node_to_lane、update_edge_label、update_edge_path_type、add_branch、local_relayout、lock_node、lock_main_path 等操作。

### YF-P2-004：Layout Design v0.1

- 输出文件：`docs/tech-design/yiflow-layout-design-v0.1.md`
- 状态：Completed
- 说明：已定义主路径优先、异常路径弱化、回跳路径 bottom channel、局部重排、锁定对象避让、visual override 清理原则、LayoutResult 和 Operation 与 Layout 的关系。

### YF-P2-005：CLI Design v0.1

- 输出文件：`docs/tech-design/yiflow-cli-design-v0.1.md`
- 状态：Completed
- 说明：已定义 validate、render、inspect、apply-op、version、help 命令，明确 exit code、错误输出规范、文件写入规则和 P0 最小闭环。

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
- `docs/tech-design/yiflow-dsl-schema-v0.1.md`
- `docs/tech-design/yiflow-ast-model-v0.1.md`
- `docs/tech-design/yiflow-operation-protocol-v0.1.md`
- `docs/tech-design/yiflow-layout-design-v0.1.md`
- `docs/tech-design/yiflow-cli-design-v0.1.md`

## Current Decisions

- Yiflow 已完成 Phase 0 的核心治理体系建设。
- Yiflow 已完成 Phase 1 的产品需求收敛。
- Yiflow 已完成 Phase 2 的核心技术设计文档。
- 后续所有正式工作必须有任务编号。
- AI 不能越级修改产品边界、DSL、AST、Operation、Layout 或 Cursor 集成路线。
- 关键决策必须写 ADR。
- 默认执行顺序遵循 `docs/project-plan/yiflow-implementation-plan-v1.0.md`。
- 新 Agent 接手时必须先读实施计划、项目计划、PRD 和本执行状态文件。
- examples 必须覆盖多类真实业务流程，不把 KYC 作为唯一目标场景。
- MVP 用户任务流已收敛为 5 条：首次出图、小改节点、改职责归属、局部整理、导出进文档。
- 编辑器是结构化编辑器，不是 Figma / draw.io 式自由画布。
- DSL v0.1 采用 YAML-first，当前 schema 必须兼容现有 3 个 examples。
- Graph AST 是 Yiflow 内部结构真相，Renderer 不直接读取 DSL，Editor 不直接修改 SVG。
- Operation 默认作用于 Graph AST，不直接改 SVG。
- Layout v0.1 以主路径可读性为第一优先级。
- CLI v0.1 以 validate / render 最小闭环为核心。

## Open Questions

- 是否需要额外加入 KYC 示例作为补充样例。
- P0 技术栈是否采用 TypeScript 作为默认实现语言。
- Layout P0 是否先做自研简单布局，还是直接引入 dagre / elkjs 进行验证。
- P0 是否只支持 SVG 输出，HTML Preview 延后到 P1。
- 是否需要在进入 Phase 3 前创建 ADR-0001 固化技术栈与布局策略。

## Risks

- 若直接进入代码开发但未确认技术栈，可能导致后续重构。
- 若 Layout P0 选型过重，可能拖慢技术样机。
- 若 Layout P0 选型过轻，可能无法验证异常路径和回跳路径。
- 当前 examples 尚未经过真实 parser / validator 校验，因为代码尚未实现。
- Phase 3 开始后必须小步提交，避免一次性生成完整系统。

## Next Tasks

按实施计划继续执行：

### YF-P3-001：初始化工程结构

建议输出：

```text
packages/core
packages/parser
packages/validator
packages/layout
packages/renderer
packages/cli
tests
```

验收：

- 能安装依赖。
- 能运行空测试。
- 能执行基础 CLI 入口。

### YF-P3-002：实现 Parser v0.1

- 能读取 YAML。
- 能转换为 AST。
- 遇到缺字段能报错。

### YF-P3-003：实现 Validator v0.1

- 能校验节点唯一。
- 能校验 edge 引用。
- 能校验 lane 引用。
- 能校验 decision 出边。

## Agent Handoff Notes

新 Agent 接手时，请先阅读：

1. `docs/project-plan/yiflow-implementation-plan-v1.0.md`
2. `docs/project-plan/yiflow-project-plan-v1.0.md`
3. `docs/prd/yiflow-prd-v1.3.md`
4. `docs/project-plan/yiflow-execution-status.md`
5. 当前任务相关文档

接手后必须先输出：

> 我已接手 Yiflow 项目。  
> 当前阶段：Phase 3（待项目主控确认后开始）  
> 当前任务：YF-P3-001 初始化工程结构  
> 已知约束：小步提交；不一次性实现完整系统；不改变 DSL/AST/Operation 核心结构；关键变更必须写 ADR  
> 下一步动作：确认技术栈与 P0 layout 策略后，初始化工程结构  
> 不会做的事：不会直接一次性实现 Parser、Validator、Layout、Renderer、CLI 全套系统

## Do Not Do

- 不要一次性生成完整系统。
- 不要创建复杂编辑器。
- 不要实现 Cursor 插件。
- 不要改变 Yiflow 的产品边界。
- 不要将 KYC 作为唯一示例场景。
- 不要未经 ADR 修改 DSL / AST / Operation 核心结构。
- 不要把编辑器设计成 Figma / draw.io 式自由画布。