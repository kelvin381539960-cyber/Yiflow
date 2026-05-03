# Yiflow Execution Status

## Current Phase

`Phase 3：P0 技术样机`

## Current Task

`YF-P3-004：实现 Layout v0.1`

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

### ADR-0001：P0 技术栈与布局策略

- 输出文件：`docs/adr/adr-0001-p0-tech-stack-and-layout-strategy.md`
- 状态：Accepted
- 说明：已确认 P0 采用 TypeScript、自研简单布局、SVG only 输出。

### YF-P3-001：初始化工程结构

- 输出文件：
  - `package.json`
  - `tsconfig.json`
  - `packages/README.md`
  - `packages/core/package.json`
  - `packages/core/src/index.ts`
  - `packages/parser/package.json`
  - `packages/parser/src/index.ts`
  - `packages/validator/package.json`
  - `packages/validator/src/index.ts`
  - `packages/layout/package.json`
  - `packages/layout/src/index.ts`
  - `packages/renderer/package.json`
  - `packages/renderer/src/index.ts`
  - `packages/cli/package.json`
  - `packages/cli/src/index.ts`
  - `tests/smoke.test.ts`
- 状态：Completed
- 说明：已建立 TypeScript + npm workspace 工程骨架，创建 core/parser/validator/layout/renderer/cli 六个包、基础 CLI 占位入口和 smoke test。

### YF-P3-002：实现 Parser v0.1

- 输出文件：
  - `packages/parser/package.json`
  - `packages/core/src/index.ts`
  - `packages/parser/src/index.ts`
  - `tests/parser.test.ts`
- 状态：Completed
- 说明：已实现 YAML → Graph AST 解析，支持读取 `.swimflow.yaml`、转换 diagram/lanes/nodes/edges/layout 到 AST，并在缺少必填字段或 enum 非法时返回结构化错误。已添加 parser 测试覆盖 3 个 examples 和错误场景。

### YF-P3-003：实现 Validator v0.1

- 输出文件：
  - `packages/validator/src/index.ts`
  - `tests/smoke.test.ts`
  - `tests/validator.test.ts`
- 状态：Completed
- 说明：已实现 Graph AST 结构校验，覆盖 lane/node/edge id 唯一性、node.lane 引用、edge from/to 引用、decision 出边数量、start/end 边方向 warning。已添加 validator 测试覆盖 3 个 examples 和 duplicate/reference/decision 错误场景。

## Changed Files

- `README.md`
- `docs/project-plan/yiflow-implementation-plan-v1.0.md`
- `docs/project-plan/yiflow-project-plan-v1.0.md`
- `docs/prd/yiflow-prd-v1.3.md`
- `docs/ai-rules/yiflow-ai-rules-v1.0.md`
- `docs/adr/adr-template.md`
- `docs/adr/adr-0001-p0-tech-stack-and-layout-strategy.md`
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
- `package.json`
- `tsconfig.json`
- `packages/README.md`
- `packages/core/package.json`
- `packages/core/src/index.ts`
- `packages/parser/package.json`
- `packages/parser/src/index.ts`
- `packages/validator/package.json`
- `packages/validator/src/index.ts`
- `packages/layout/package.json`
- `packages/layout/src/index.ts`
- `packages/renderer/package.json`
- `packages/renderer/src/index.ts`
- `packages/cli/package.json`
- `packages/cli/src/index.ts`
- `tests/smoke.test.ts`
- `tests/parser.test.ts`
- `tests/validator.test.ts`

## Current Decisions

- Yiflow 已完成 Phase 0 的核心治理体系建设。
- Yiflow 已完成 Phase 1 的产品需求收敛。
- Yiflow 已完成 Phase 2 的核心技术设计文档。
- Yiflow 当前处于 Phase 3：P0 技术样机。
- 后续所有正式工作必须有任务编号。
- AI 不能越级修改产品边界、DSL、AST、Operation、Layout 或 Cursor 集成路线。
- 关键决策必须写 ADR。
- DSL v0.1 采用 YAML-first，当前 schema 必须兼容现有 3 个 examples。
- Graph AST 是 Yiflow 内部结构真相，Renderer 不直接读取 DSL，Editor 不直接修改 SVG。
- Operation 默认作用于 Graph AST，不直接改 SVG。
- Layout v0.1 以主路径可读性为第一优先级。
- CLI v0.1 以 validate / render 最小闭环为核心。
- ADR-0001 已确认：P0 技术栈为 TypeScript；P0 Layout 采用自研简单布局；P0 Render 只支持 SVG。
- Phase 3 工程结构采用 npm workspace 起步。
- Parser v0.1 引入最小依赖 `yaml`。

## Open Questions

- 是否需要额外加入 KYC 示例作为补充样例。
- P0 是否需要在 Parser / Validator 完成后加入 GitHub Actions。
- CLI 是否在 Layout / Renderer 完成后统一接入真实 validate/render 流程。

## Risks

- Phase 3 必须继续小步提交，避免一次性生成完整系统。
- 当前代码通过 GitHub 写入，但尚未在本地实际执行 `npm install`、`npm test` 或 CLI 命令验证。
- Layout、renderer 仍为占位入口，不代表对应能力已实现。
- Validator 当前只做结构校验，不负责布局可读性或 SVG 输出校验。

## Next Tasks

按实施计划继续执行：

### YF-P3-004：实现 Layout v0.1

- 能按泳道排列节点。
- 能让主路径从左到右。
- 能输出节点坐标。

### YF-P3-005：实现 SVG Renderer v0.1

- 能输出 SVG。
- 能显示泳道、节点、连线。
- 能在浏览器打开查看。

### YF-P3-006：接入 CLI validate/render 最小闭环

- `yiflow validate examples/approval-flow.swimflow.yaml`
- `yiflow render examples/approval-flow.swimflow.yaml -o output.svg`

## Agent Handoff Notes

新 Agent 接手时，请先阅读：

1. `docs/project-plan/yiflow-implementation-plan-v1.0.md`
2. `docs/project-plan/yiflow-project-plan-v1.0.md`
3. `docs/prd/yiflow-prd-v1.3.md`
4. `docs/project-plan/yiflow-execution-status.md`
5. 当前任务相关文档

接手后必须先输出：

> 我已接手 Yiflow 项目。  
> 当前阶段：Phase 3  
> 当前任务：YF-P3-004 实现 Layout v0.1  
> 已知约束：TypeScript；自研简单布局；SVG only；小步提交；不一次性实现完整系统；Layout 只做基础坐标计算，不实现 SVG Renderer 业务逻辑  
> 下一步动作：实现 Layout v0.1，按泳道和主路径 rank 输出节点坐标  
> 不会做的事：不会直接一次性实现 Renderer、CLI 全套系统

## Do Not Do

- 不要一次性生成完整系统。
- 不要创建复杂编辑器。
- 不要实现 Cursor 插件。
- 不要改变 Yiflow 的产品边界。
- 不要将 KYC 作为唯一示例场景。
- 不要未经 ADR 修改 DSL / AST / Operation 核心结构。
- 不要把编辑器设计成 Figma / draw.io 式自由画布。