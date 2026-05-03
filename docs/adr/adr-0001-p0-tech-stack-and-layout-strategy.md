# ADR-0001: P0 技术栈与布局策略

## ADR 编号

```text
ADR-0001
```

## 标题

P0 技术样机采用 TypeScript、自研简单布局、SVG only 输出。

---

## 状态

```text
Accepted
```

---

## 日期

```text
2026-05-03
```

---

## 背景

Yiflow 已完成 Phase 0、Phase 1 和 Phase 2 的核心文档工作：

- 项目治理与交接体系。
- MVP Scope。
- 用户任务流。
- 编辑器交互规格。
- DSL Schema v0.1。
- AST Model v0.1。
- Operation Protocol v0.1。
- Layout Design v0.1。
- CLI Design v0.1。

根据执行状态，下一阶段为 Phase 3：P0 技术样机。

Phase 3 的目标不是做完整产品，而是验证最小技术闭环：

```text
.swimflow.yaml → parser → AST → validator → layout → SVG
```

进入代码实现前，需要确认三项关键技术决策：

1. P0 技术栈。
2. P0 layout 策略。
3. P0 render 输出范围。

这些决策会影响工程结构、依赖选择、开发节奏和验收方式，因此需要通过 ADR 固化。

---

## 决策

Yiflow P0 技术样机采用以下决策：

```text
1. 技术栈：TypeScript
2. Layout：自研简单布局
3. Render 输出：SVG only
```

具体含义：

- 使用 TypeScript 作为 P0 默认实现语言。
- P0 不直接引入 dagre / elkjs 等复杂布局引擎。
- P0 先实现自研的最小泳道布局：lane = y axis，rank = x axis，main path 从左到右。
- P0 只输出 SVG，不实现 HTML Preview、PNG 导出、Markdown Preview 或 Editor。

---

## 备选方案

### 方案 A：TypeScript + 自研简单布局 + SVG only

优点：

- 与前端、CLI、后续 Editor 方向一致。
- 开发成本低。
- 易于快速验证 DSL → AST → Layout → SVG 闭环。
- 避免过早依赖复杂 layout 引擎。
- SVG 输出足够验证 P0 核心价值。

缺点：

- 自研布局能力有限。
- 美观度和复杂图处理能力不足。
- 后续可能需要替换或增强 layout 模块。

选择结果：采用。

---

### 方案 B：TypeScript + dagre / elkjs + SVG

优点：

- 可以更快获得成熟图布局能力。
- 对复杂有向图的自动排版更强。

缺点：

- 早期依赖过重。
- 可能掩盖 Yiflow 自身布局需求，例如泳道、主路径、异常路径、回跳路径。
- 局部重排和锁定对象避让未必符合 Yiflow 模型。
- 需要额外验证第三方库能力，当前尚未完成。

选择结果：不在 P0 采用，可在后续技术验证中评估。

---

### 方案 C：Python + 自研布局 + SVG

优点：

- 原型开发快。
- 适合脚本验证。

缺点：

- 与后续 Editor、Cursor、Web Preview 的 TypeScript 生态不一致。
- 后续迁移成本高。
- CLI、前端复用成本较高。

选择结果：不采用。

---

### 方案 D：TypeScript + 完整 HTML Preview / PNG / Editor 同时实现

优点：

- 产物更接近最终产品。

缺点：

- 明显超过 P0 技术样机范围。
- 容易导致一次性生成大系统。
- 会绕过 Parser、AST、Validator、Layout、Renderer 的小步验证。

选择结果：不采用。

---

## 选择理由

当前阶段最重要的是验证最小闭环，而不是追求完整产品体验。

采用 TypeScript + 自研简单布局 + SVG only 的理由：

- 符合 P0 技术样机目标。
- 避免过早工程复杂化。
- 能最大程度复用 Phase 2 文档中的 DSL、AST、Layout、CLI 设计。
- 便于后续进入 P1 Editor / Markdown Preview。
- 更容易做小步提交和单元测试。
- 更符合 AI 使用规则中“小步执行，不一次性生成完整系统”的约束。

---

## 影响范围

本 ADR 影响：

- `docs/project-plan/yiflow-execution-status.md`
- `docs/tech-design/yiflow-cli-design-v0.1.md`
- `docs/tech-design/yiflow-layout-design-v0.1.md`
- Phase 3 工程结构
- Parser / Validator / Layout / Renderer / CLI 的实现顺序
- P0 验收方式

---

## 风险

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| 自研简单布局效果有限 | 复杂图可能不够美观 | P0 只要求可读，不要求复杂美化 |
| 后续可能需要替换 layout 引擎 | 可能带来重构 | 保持 layout 模块边界清晰 |
| SVG only 输出不覆盖完整文档集成 | P1 才能验证 Markdown/HTML/PNG | P0 聚焦最小闭环 |
| TypeScript 工程初始化需要选择包管理方式 | 可能影响后续维护 | P0 采用简单 npm workspace 或单 package 结构 |

---

## 风险缓解措施

- Phase 3 每次只做一个任务。
- 先初始化工程结构，再实现 Parser。
- Parser、Validator、Layout、Renderer、CLI 分任务实现。
- Layout 保持模块边界，后续可替换为 dagre / elkjs。
- Renderer 只读取 AST + LayoutResult，不直接读取 DSL。
- CLI 先验证 `validate` 和 `render` 两个最小命令。

---

## 回滚方式

如果该决策失败，可回滚为：

- 保留 TypeScript，但引入第三方 layout 引擎。
- 或保留 DSL / AST / Validator，仅替换 Layout 模块。
- 或将 SVG Renderer 保留，增加 HTML Preview / PNG 输出。

需要修改的文件：

- `docs/tech-design/yiflow-layout-design-v0.1.md`
- `docs/tech-design/yiflow-cli-design-v0.1.md`
- `docs/project-plan/yiflow-execution-status.md`
- 后续 Phase 3 工程实现文件

现有 examples 不需要迁移。

---

## 验收标准

该决策的有效性通过 Phase 3 P0 技术样机验证。

必须能够执行：

```bash
yiflow validate examples/approval-flow.swimflow.yaml
yiflow render examples/approval-flow.swimflow.yaml -o output.svg
```

并得到：

- 校验成功结果。
- 可打开的 SVG 文件。
- 可读的泳道流程图。
- 主路径从左到右展示。
- 异常路径和回跳路径可识别。

---

## 关联文档

```text
docs/project-plan/yiflow-implementation-plan-v1.0.md
docs/project-plan/yiflow-project-plan-v1.0.md
docs/project-plan/yiflow-execution-status.md
docs/tech-design/yiflow-dsl-schema-v0.1.md
docs/tech-design/yiflow-ast-model-v0.1.md
docs/tech-design/yiflow-operation-protocol-v0.1.md
docs/tech-design/yiflow-layout-design-v0.1.md
docs/tech-design/yiflow-cli-design-v0.1.md
```

---

## 备注

本 ADR 只确认 P0 技术样机策略。

不代表后续 P1/P2 不允许引入更复杂 layout 引擎、HTML Preview、PNG 导出或 Editor。
