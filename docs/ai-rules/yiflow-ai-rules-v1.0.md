# Yiflow AI 使用规则 v1.0

## 1. 文档目的

本文档定义 AI Agent、Codex、Cursor Agent、ChatGPT 或其他 AI 工具参与 Yiflow 项目时必须遵守的规则。

目标是避免以下问题：

- AI 直接扩大产品范围。
- AI 在没有任务编号时随意执行。
- AI 一次性生成大量不可维护代码。
- AI 把未经验证的推测写入正式文档。
- AI 修改 DSL、AST、Layout 等核心设计但没有记录决策。
- AI 写代码后不更新文档、不补测试、不说明风险。

本规则优先级高于单次对话中的随意指令。若用户明确要求偏离本规则，应先说明风险，并建议通过 ADR 或任务变更记录处理。

---

## 2. AI 角色定位

AI 在 Yiflow 项目中的角色是：

> **辅助执行者，不是项目主控者。**

AI 可以帮助：

- 整理方案。
- 拆解任务。
- 编写文档草案。
- 生成示例 DSL。
- 编写小范围代码。
- 生成测试样例。
- 做代码 review。
- 更新执行状态。

AI 不能自动决定：

- 产品边界。
- MVP 范围。
- DSL 核心格式。
- AST 核心结构。
- Layout 引擎路线。
- Cursor 集成路线。
- 是否进入下一阶段。

这些必须由项目主控人确认，或通过 ADR 记录。

---

## 3. 开工前必须读取的文件

任何 AI Agent 接手项目时，必须先读取以下文件：

```text
1. docs/project-plan/yiflow-implementation-plan-v1.0.md
2. docs/project-plan/yiflow-project-plan-v1.0.md
3. docs/prd/yiflow-prd-v1.3.md
4. docs/project-plan/yiflow-execution-status.md（创建后）
5. 当前任务相关文档
```

读取后必须先输出接手摘要：

```text
我已接手 Yiflow 项目。
当前阶段：xxx
当前任务：xxx
已知约束：xxx
下一步动作：xxx
不会做的事：xxx
```

未读取这些文件前，不允许直接写代码或修改核心设计。

---

## 4. 任务执行规则

### 4.1 必须有任务编号

AI 执行任何正式工作前，必须确认任务编号。

示例：

```text
YF-P0-002 创建 AI 使用规则
YF-P2-001 DSL Schema v0.1
YF-P3-002 Parser v0.1
```

没有任务编号时，只能做讨论、建议或澄清，不得直接提交正式产物。

### 4.2 每次只做一个任务

AI 每次执行只能完成一个明确任务。

允许：

- 创建一个 README。
- 创建一个 AI 规则文件。
- 创建一个 ADR 模板。
- 创建一个示例 DSL。
- 实现一个 parser 函数。

不允许：

- 一次性生成完整系统。
- 一次性实现 parser、layout、renderer、cli、editor。
- 同时改 PRD、改 DSL、写代码、加测试。

### 4.3 必须遵守验收标准

每个任务完成时必须对照实施计划中的验收标准说明是否满足。

若无法满足，应明确说明缺口，而不是假装完成。

---

## 5. 文档修改规则

### 5.1 文档不得随意覆盖

AI 修改已有文档时，必须先确认：

- 修改原因。
- 修改范围。
- 是否改变已有决策。
- 是否需要保留历史版本。

若是重大变化，应新增版本文档，而不是覆盖旧版本。

### 5.2 文档必须区分事实、决策和建议

文档中应避免把推测写成事实。

推荐写法：

- “当前决策是...”
- “待验证假设是...”
- “建议后续验证...”

不推荐写法：

- “一定可以实现...”
- “Cursor 完全支持...”
- “该库必然满足需求...”

### 5.3 与产品边界相关的变更必须谨慎

以下内容不能随意改：

- Yiflow 不做自由画布。
- Yiflow 不做完整 BPMN 替代。
- Yiflow 不做流程执行引擎。
- Yiflow 优先 Markdown-first + Editor-on-demand。
- Yiflow 使用 Graph AST 作为唯一真相。

如需更改，必须写 ADR。

---

## 6. 代码生成规则

### 6.1 不允许过早写核心代码

在以下文件完成前，不进入核心代码开发：

- README.md
- docs/ai-rules/yiflow-ai-rules-v1.0.md
- docs/adr/adr-template.md
- docs/project-plan/yiflow-execution-status.md
- examples 首批示例
- DSL Schema v0.1
- AST Model v0.1
- Operation Protocol v0.1

### 6.2 代码必须小步提交

每次代码提交只解决一个明确问题。

示例：

- 添加 YAML parser。
- 添加 node id 校验。
- 添加 edge 引用校验。
- 添加 SVG 矩形节点渲染。
- 添加 CLI validate 命令。

### 6.3 代码必须包含测试或验证方式

每个核心能力至少要有以下之一：

- 单元测试。
- 示例文件验证。
- CLI 验证命令。
- 手动验证步骤。

### 6.4 代码不得绕过数据模型

所有核心能力必须围绕 Graph AST 工作。

不允许：

- renderer 直接解析 DSL 并画图。
- layout 直接依赖原始 YAML 文本。
- editor 直接修改 SVG。
- AI 直接重写整份 DSL 作为默认修改方式。

必须遵循：

```text
DSL → Parser → Graph AST → Validator → Layout → Renderer
```

---

## 7. DSL / AST / Operation 变更规则

以下变更必须先写 ADR：

- 新增或删除顶层 DSL 字段。
- 改变 `lanes`、`nodes`、`edges` 的结构。
- 改变 `path_type` 定义。
- 改变 Graph AST 核心实体。
- 改变 Operation 协议。
- 将默认修改方式从 operation-first 改为 full rewrite。
- 引入与现有 DSL 不兼容的语法。

小的文案说明或示例补充不需要 ADR，但不能改变核心结构。

---

## 8. Layout / Renderer 规则

### 8.1 Layout 优先保证可读性

布局优先级：

1. 主路径清晰。
2. 泳道归属明确。
3. 异常路径不干扰主路径。
4. 回跳路径可读。
5. 视觉美观。

不得为了视觉美观破坏语义结构。

### 8.2 Renderer 不保存真相

SVG / HTML 只是渲染结果，不是数据真相。

禁止把用户编辑结果只保存在 SVG 或 HTML 中。

### 8.3 Visual override 必须可清理

任何视觉微调都应可被清理、重算或回退。

---

## 9. AI 修改流程规则

AI 修改流程图时，必须按以下顺序：

```text
1. 理解用户意图
2. 定位目标节点 / 分支 / 泳道
3. 选择 operation
4. 生成 operation
5. 校验 operation
6. 应用 operation
7. 局部重排
8. 输出影响范围
```

默认不允许直接输出整份新 DSL 替换原图。

只有在以下情况可以全量重写：

- 用户明确要求重画。
- 当前图结构已损坏且无法 patch。
- 正在进行首图生成。

---

## 10. 幻觉防控规则

AI 遇到以下内容时必须标记为“待验证”：

- 第三方库能力。
- Cursor / VS Code API 能力。
- GitHub API 能力。
- Mermaid 兼容能力。
- Layout 引擎限制。
- 浏览器渲染限制。
- 性能数据。
- token 节省比例。

不得把未经验证的信息写成最终结论。

推荐表达：

```text
待验证：ELK 是否能稳定满足泳道布局中的局部重排需求。
```

不允许表达：

```text
ELK 一定可以完美解决布局问题。
```

---

## 11. GitHub 提交规则

每次提交应满足：

- commit message 清晰。
- 一个 commit 尽量只对应一个任务。
- 不混合无关修改。
- 不提交未说明来源的大段生成代码。
- 不提交密钥、token、个人敏感信息。

推荐 commit message：

```text
Add Yiflow AI rules v1.0
Add ADR template
Add approval flow example
```

不推荐：

```text
update
fix
misc
big changes
```

---

## 12. 输出自检清单

AI 每次完成任务后，必须自检：

```text
- 是否符合当前任务编号？
- 是否只完成了一个任务？
- 是否修改了预期文件？
- 是否没有扩大范围？
- 是否没有改变核心决策？
- 是否需要 ADR？
- 是否需要更新执行状态？
- 是否说明了下一步？
```

如果任一项不满足，应主动说明。

---

## 13. 当前阶段限制

当前阶段是：

```text
Phase 0：项目治理与交接体系
```

因此当前允许做：

- README
- AI 使用规则
- ADR 模板
- 执行状态文件
- 示例 DSL

当前不允许做：

- 核心代码实现
- 可视化编辑器
- Cursor 插件
- AI 自动改图
- Layout 引擎集成
- npm 包发布

---

## 14. 最终原则

Yiflow 项目使用 AI，但不被 AI 驱动失控。

最终原则：

> **AI 负责加速，计划负责方向，验收负责质量，ADR 负责决策。**
