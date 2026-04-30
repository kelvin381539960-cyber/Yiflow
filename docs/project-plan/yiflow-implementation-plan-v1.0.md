# Yiflow 实施计划 v1.0

## 1. 文档目的

本文档是 Yiflow 项目的执行主线，用于指导后续所有对话、Agent、Codex、Cursor 或人工开发按同一套节奏推进。

它的核心目标不是描述产品愿景，而是解决执行问题：

- 下一步该做什么。
- 每一步做到什么程度算完成。
- 换一个对话或 Agent 后如何继续。
- 如何避免 AI 乱扩展、乱写代码、重复返工。
- 如何把 PRD、技术设计、示例、代码和测试保持一致。

本实施计划应作为后续开发的主控文件。任何 Agent 接手项目前，应先阅读本文件，再阅读 PRD 和项目计划。

---

## 2. 当前项目状态

截至本计划创建时，项目已有以下资产：

```text
Yiflow/
├── docs/
│   ├── prd/
│   │   └── yiflow-prd-v1.3.md
│   └── project-plan/
│       ├── yiflow-project-plan-v1.0.md
│       └── yiflow-implementation-plan-v1.0.md
```

当前阶段：

```text
Phase 0：项目治理与执行体系建设
```

当前还未进入代码开发阶段。

---

## 3. 总体执行原则

### 3.1 先建立可交接机制，再写代码

Yiflow 的第一步不是立即开发，而是建立：

- README
- AI 使用规则
- ADR 模板
- MVP Scope
- DSL Schema
- AST Model
- 示例文件
- 技术设计

这些完成前，不进入核心代码开发。

### 3.2 所有工作必须有任务编号

后续每一项工作都必须使用任务编号，便于跨对话衔接。

编号格式：

```text
YF-P0-001
YF-P1-001
YF-P2-001
```

其中：

- `YF` = Yiflow
- `P0/P1/P2` = 阶段
- `001` = 序号

### 3.3 每个任务必须有验收标准

禁止只写“完成某某设计”。必须写清楚：

- 输入是什么。
- 输出是什么。
- 文件放在哪里。
- 怎么判断完成。
- 哪些内容不做。

### 3.4 AI 不允许越级执行

AI 不允许在没有明确任务的情况下自行：

- 扩大 MVP 范围。
- 改 DSL 格式。
- 改 AST 核心结构。
- 切换技术路线。
- 引入大型依赖。
- 一次性生成大批代码。

如需做以上动作，必须先创建 ADR 或更新技术方案。

### 3.5 每次执行后必须更新交接状态

每次完成一项任务，必须更新：

- 完成了什么。
- 修改了哪些文件。
- 当前风险是什么。
- 下一步建议是什么。

建议集中维护在：

```text
docs/project-plan/yiflow-execution-status.md
```

该文件尚未创建，应作为后续任务之一创建。

---

## 4. Agent 接手协议

任何新的对话 Agent 接手 Yiflow 项目时，必须按以下顺序阅读文件：

```text
1. docs/project-plan/yiflow-implementation-plan-v1.0.md
2. docs/project-plan/yiflow-project-plan-v1.0.md
3. docs/prd/yiflow-prd-v1.3.md
4. docs/project-plan/yiflow-execution-status.md（创建后）
5. 当前任务相关文档
```

读取后，Agent 必须先输出一段接手摘要：

```text
我已接手 Yiflow 项目。
当前阶段：xxx
当前任务：xxx
已知约束：xxx
下一步动作：xxx
不会做的事：xxx
```

禁止直接跳入写代码。

---

## 5. 标准交接包格式

每次结束一个对话或完成一轮工作时，应生成以下交接包。

```md
# Yiflow Handoff

## 当前阶段
例如：Phase 0 / Phase 1 / P0 技术样机

## 当前任务
例如：YF-P0-001 创建 README

## 已完成
- xxx
- xxx

## 修改文件
- path/to/file.md
- path/to/file.yaml

## 当前决策
- xxx

## 未解决问题
- xxx

## 风险
- xxx

## 下一步
1. xxx
2. xxx
3. xxx

## 禁止事项
- 不要直接写核心代码
- 不要改 DSL 核心结构
- 不要扩大 MVP
```

该交接包可以放在：

```text
docs/project-plan/yiflow-execution-status.md
```

或作为 GitHub Issue / PR 描述。

---

## 6. 阶段划分

Yiflow 实施分为 6 个阶段：

```text
Phase 0：项目治理与交接体系
Phase 1：产品需求收敛
Phase 2：技术设计与验证
Phase 3：P0 技术样机
Phase 4：P1 内部可用版
Phase 5：P2 AI 工作流版
```

---

# Phase 0：项目治理与交接体系

## 目标

让项目具备可持续推进、可跨 Agent 交接、可审查的基础结构。

## 不做

- 不写核心代码。
- 不做编辑器。
- 不做 Cursor 插件。
- 不做 AI 自动改图。

## 任务清单

### YF-P0-001：创建 README

#### 目标

让任何人打开仓库后，能在 3 分钟内理解 Yiflow 是什么、解决什么问题、当前进度如何。

#### 输出文件

```text
README.md
```

#### 内容要求

README 至少包含：

- 项目一句话定义。
- 项目解决的问题。
- 核心理念。
- 当前阶段。
- 文档入口。
- 路线图摘要。
- 当前不做什么。

#### 验收标准

- 仓库首页不是空的。
- 能链接到 PRD、项目计划和实施计划。
- 不承诺尚未实现的功能。

---

### YF-P0-002：创建 AI 使用规则

#### 目标

约束 AI 在项目中的职责，避免 AI 导致需求膨胀、代码失控、幻觉进入项目资产。

#### 输出文件

```text
docs/ai-rules/yiflow-ai-rules-v1.0.md
```

#### 内容要求

必须包含：

- AI 可做什么。
- AI 不可做什么。
- AI 写代码规则。
- AI 修改文档规则。
- AI 变更 DSL/AST 的限制。
- AI 输出必须包含的自检项。

#### 验收标准

- 新 Agent 可以按该规则执行。
- 明确禁止一次性生成大系统。
- 明确关键变更必须先写 ADR。

---

### YF-P0-003：创建 ADR 模板

#### 目标

建立关键决策记录机制。

#### 输出文件

```text
docs/adr/adr-template.md
```

#### 内容要求

模板必须包含：

- 背景
- 决策
- 备选方案
- 选择理由
- 影响范围
- 风险
- 回滚方式

#### 验收标准

- 后续 DSL、AST、Layout、Cursor 集成等关键决策可按此模板记录。

---

### YF-P0-004：创建执行状态文件

#### 目标

建立跨对话交接的单一状态入口。

#### 输出文件

```text
docs/project-plan/yiflow-execution-status.md
```

#### 内容要求

必须包含：

- 当前阶段
- 当前任务
- 已完成任务
- 修改文件
- 当前风险
- 下一步任务
- 接手说明

#### 验收标准

- 换一个 Agent 后，只要看该文件就知道接下来做什么。

---

### YF-P0-005：创建示例目录和首批示例

#### 目标

让项目从纯文档进入可验证资产阶段。

#### 输出文件

```text
examples/approval-flow.swimflow.yaml
examples/human-system-flow.swimflow.yaml
examples/exception-return-flow.swimflow.yaml
```

#### 内容要求

至少覆盖：

- 普通审批流程。
- 系统 + 人工混合流程。
- 异常 / 回跳流程。

#### 验收标准

- 不把 KYC 作为唯一示例。
- 每个示例都能验证一种核心能力。

---

# Phase 1：产品需求收敛

## 目标

将 PRD v1.3 收敛为 MVP 可执行范围，避免概念过宽。

## 任务清单

### YF-P1-001：输出 MVP Scope v1.0

#### 输出文件

```text
docs/prd/yiflow-mvp-scope-v1.0.md
```

#### 必须明确

- MVP 必做。
- MVP 不做。
- P0/P1/P2 分界。
- 每个能力的验收方式。

#### 验收标准

- 研发可以按范围开发。
- 不会误解成通用画图工具。

---

### YF-P1-002：输出用户任务流文档

#### 输出文件

```text
docs/ux/yiflow-user-flows-v1.0.md
```

#### 必须覆盖

- 首次出图。
- 小改。
- 改职责归属。
- 局部整理。
- 导出进文档。

#### 验收标准

- 每个任务流都有用户输入、系统动作、成功状态、失败状态。

---

### YF-P1-003：输出编辑器交互规格

#### 输出文件

```text
docs/ux/yiflow-editor-interaction-spec-v1.0.md
```

#### 必须覆盖

- 节点菜单。
- 边菜单。
- 合法拖拽。
- 局部整理。
- 锁定。
- 保存回写。

---

# Phase 2：技术设计与验证

## 目标

在写代码前，完成核心技术设计。

## 任务清单

### YF-P2-001：DSL Schema v0.1

#### 输出文件

```text
docs/tech-design/yiflow-dsl-schema-v0.1.md
```

#### 必须定义

- diagram
- lanes
- nodes
- edges
- path_type
- layout
- metadata

#### 验收标准

- 示例文件能按 schema 解释。
- AI 能根据 schema 生成 DSL。

---

### YF-P2-002：AST Model v0.1

#### 输出文件

```text
docs/tech-design/yiflow-ast-model-v0.1.md
```

#### 必须定义

- Graph
- Lane
- Node
- Edge
- Layout
- Operation
- ValidationResult

#### 验收标准

- 能支持局部 patch。
- 能支持从 DSL 转换。

---

### YF-P2-003：Operation Protocol v0.1

#### 输出文件

```text
docs/tech-design/yiflow-operation-protocol-v0.1.md
```

#### 必须覆盖

- insert_node_after
- insert_node_between
- delete_node
- move_node_to_lane
- add_branch
- local_relayout
- lock_main_path

#### 验收标准

- AI 修改可以优先输出 operation。
- 每个 operation 有输入、输出和失败条件。

---

### YF-P2-004：Layout Design v0.1

#### 输出文件

```text
docs/tech-design/yiflow-layout-design-v0.1.md
```

#### 必须覆盖

- 主路径优先。
- 异常路径弱化。
- 回跳路径通道。
- 局部重排。
- 锁定对象避让。
- override 清理。

---

### YF-P2-005：CLI Design v0.1

#### 输出文件

```text
docs/tech-design/yiflow-cli-design-v0.1.md
```

#### 必须覆盖

```bash
yiflow validate examples/approval-flow.swimflow.yaml
yiflow render examples/approval-flow.swimflow.yaml -o output.svg
yiflow inspect examples/approval-flow.swimflow.yaml
yiflow apply-op examples/approval-flow.swimflow.yaml op.json
```

---

# Phase 3：P0 技术样机

## 目标

完成最小可运行链路。

```text
.swimflow.yaml → parser → AST → validator → layout → SVG
```

## 任务清单

### YF-P3-001：初始化工程结构

输出：

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

---

### YF-P3-002：实现 Parser v0.1

验收：

- 能读取 YAML。
- 能转换为 AST。
- 遇到缺字段能报错。

---

### YF-P3-003：实现 Validator v0.1

验收：

- 能校验节点唯一。
- 能校验 edge 引用。
- 能校验 lane 引用。
- 能校验 decision 出边。

---

### YF-P3-004：实现 Layout v0.1

验收：

- 能按泳道排列节点。
- 能让主路径从左到右。
- 能输出节点坐标。

---

### YF-P3-005：实现 SVG Renderer v0.1

验收：

- 能输出 SVG。
- 能显示泳道、节点、连线。
- 能在浏览器打开查看。

---

### YF-P3-006：实现 CLI v0.1

验收：

```bash
yiflow validate examples/approval-flow.swimflow.yaml
yiflow render examples/approval-flow.swimflow.yaml -o output.svg
```

能正常运行。

---

# Phase 4：P1 内部可用版

## 目标

让 Yiflow 能用于简单真实工作流。

## 范围

- HTML Preview。
- Markdown 预览原型。
- 基础编辑器。
- 节点编辑。
- 改职责归属。
- 局部整理。
- 导出 SVG / PNG。

---

# Phase 5：P2 AI 工作流版

## 目标

让 AI 以受控方式参与生成和修改。

## 范围

- NL → DSL。
- NL → Operation。
- 局部上下文。
- patch 预览。
- patch 校验。
- 影响范围提示。
- 失败降级。

---

# 7. 每次执行标准流程

任何 Agent 执行任务时，必须按以下流程：

```text
1. 读取实施计划
2. 读取执行状态
3. 确认当前任务编号
4. 输出本次执行计划
5. 执行单一任务
6. 更新文件
7. 说明修改内容
8. 更新执行状态
9. 给出下一步建议
```

禁止跳过第 1、2、3、8 步。

---

# 8. 执行状态模板

`yiflow-execution-status.md` 应采用以下结构：

```md
# Yiflow Execution Status

## Current Phase
Phase 0

## Current Task
YF-P0-001 Create README

## Completed Tasks
- xxx

## Changed Files
- xxx

## Current Decisions
- xxx

## Open Questions
- xxx

## Risks
- xxx

## Next Tasks
1. xxx
2. xxx
3. xxx

## Agent Handoff Notes
新 Agent 接手时，请先阅读：
1. implementation plan
2. project plan
3. PRD
4. execution status
```

---

# 9. 第一轮实际执行顺序

当前建议立即执行以下任务：

```text
YF-P0-001 创建 README
YF-P0-002 创建 AI 使用规则
YF-P0-003 创建 ADR 模板
YF-P0-004 创建执行状态文件
YF-P0-005 创建首批 examples
```

这 5 个任务完成后，再进入 Phase 1 产品收敛。

---

# 10. 最终要求

后续任何 Agent 接手 Yiflow 项目时，都必须遵守：

- 不读实施计划，不开始执行。
- 没有任务编号，不开始执行。
- 没有验收标准，不开始执行。
- 不能一次性做多个阶段。
- 不能直接进入代码实现。
- 不能随意改变产品边界。
- 不能把 AI 推测当成事实。

Yiflow 的执行方式必须是：

> **计划驱动、任务编号驱动、验收标准驱动、交接状态驱动。**

这样即使更换对话、更换 Agent、更换执行工具，也能继续沿着同一条项目主线推进。
