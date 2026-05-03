# Yiflow CLI Design v0.1

任务编号：YF-P2-005
状态：Completed
输出文件：docs/tech-design/yiflow-cli-design-v0.1.md
依据：Yiflow DSL Schema v0.1、Yiflow AST Model v0.1、Yiflow Operation Protocol v0.1、Yiflow Layout Design v0.1、Yiflow MVP Scope v1.0

---

## 1. 文档目的

本文档定义 Yiflow P0 技术样机阶段的 CLI 设计。

CLI 的目标是验证最小链路：

```text
.swimflow.yaml → parser → AST → validator → layout → SVG
```

本文档只定义命令设计、输入输出、错误处理和验收方式，不实现代码。

---

## 2. CLI 定位

Yiflow CLI 是 P0 技术样机的主要验证入口。

它用于：

- 校验 DSL 文件。
- 渲染 SVG。
- 检查 AST / Graph 概况。
- 应用 Operation。
- 为后续 Editor、Markdown Preview、CI 校验提供基础能力。

---

## 3. 命令总览

v0.1 必须支持：

```bash
yiflow validate examples/approval-flow.swimflow.yaml
yiflow render examples/approval-flow.swimflow.yaml -o output.svg
yiflow inspect examples/approval-flow.swimflow.yaml
yiflow apply-op examples/approval-flow.swimflow.yaml op.json
```

命令列表：

| 命令 | P0 必须 | 说明 |
|---|---|---|
| validate | ✅ | 校验 DSL / AST 合法性 |
| render | ✅ | 渲染 SVG |
| inspect | ✅ | 输出图结构摘要 |
| apply-op | ✅ | 应用 Operation 并输出新 DSL |
| version | ✅ | 输出 CLI 版本 |
| help | ✅ | 输出帮助信息 |

---

## 4. 通用规则

### 4.1 输入文件

默认输入：

```text
*.swimflow.yaml
```

P0 不要求支持 JSON、Mermaid、draw.io。

### 4.2 输出格式

CLI 输出应尽量可读，同时为后续 CI 保留机器可读模式。

建议支持：

```bash
--format text
--format json
```

P0 可先实现 text，json 作为建议能力。

### 4.3 Exit Code

| Exit Code | 含义 |
|---:|---|
| 0 | 成功 |
| 1 | 校验失败或业务错误 |
| 2 | 命令参数错误 |
| 3 | 文件读写错误 |
| 4 | 内部异常 |

---

## 5. validate

### 5.1 目的

校验 `.swimflow.yaml` 是否符合 DSL Schema 和 AST 不变量。

### 5.2 命令

```bash
yiflow validate examples/approval-flow.swimflow.yaml
```

可选参数：

```bash
yiflow validate examples/approval-flow.swimflow.yaml --format json
yiflow validate examples/approval-flow.swimflow.yaml --strict
```

### 5.3 执行流程

```text
读取文件
→ 解析 YAML
→ 转换 Graph AST
→ 执行 Validator
→ 输出 ValidationResult
```

### 5.4 成功输出

```text
Yiflow validate
File: examples/approval-flow.swimflow.yaml
Status: valid
Nodes: 10
Edges: 11
Lanes: 4
Warnings: 0
```

### 5.5 失败输出

```text
Yiflow validate
File: examples/broken.swimflow.yaml
Status: invalid

Errors:
- EDGE_TO_NOT_FOUND: Edge e_submit_review points to missing node review_request.
  Target: edge:e_submit_review
  Suggested fix: create node review_request or update edge.to.
```

### 5.6 验收标准

- 能读取现有 3 个 examples。
- 能检查 required fields。
- 能检查 node / edge / lane id 唯一。
- 能检查 edge 引用。
- 能检查 lane 引用。
- 能检查 decision 出边。

---

## 6. render

### 6.1 目的

将 `.swimflow.yaml` 渲染为 SVG。

### 6.2 命令

```bash
yiflow render examples/approval-flow.swimflow.yaml -o output.svg
```

可选参数：

```bash
yiflow render examples/approval-flow.swimflow.yaml -o output.svg --format svg
yiflow render examples/approval-flow.swimflow.yaml -o output.html --format html
yiflow render examples/approval-flow.swimflow.yaml -o output.svg --strict
```

P0 必须支持 SVG。

HTML 可作为后续扩展。

### 6.3 执行流程

```text
读取文件
→ 解析 YAML
→ 转换 AST
→ 校验 AST
→ 计算 LayoutResult
→ Renderer 输出 SVG
→ 写入文件
```

### 6.4 成功输出

```text
Yiflow render
Input: examples/approval-flow.swimflow.yaml
Output: output.svg
Status: success
Nodes: 10
Edges: 11
Lanes: 4
```

### 6.5 失败处理

| 失败原因 | 处理 |
|---|---|
| 输入文件不存在 | exit 3 |
| YAML 解析失败 | exit 1 |
| Validator 失败 | exit 1，不输出 SVG |
| 输出路径不可写 | exit 3 |
| Layout 失败 | exit 1 |

### 6.6 验收标准

- 能输出 SVG 文件。
- SVG 可在浏览器打开。
- 能显示泳道、节点、连线、label。
- 主路径从左到右可读。

---

## 7. inspect

### 7.1 目的

输出图结构摘要，帮助开发和用户理解流程文件。

### 7.2 命令

```bash
yiflow inspect examples/approval-flow.swimflow.yaml
```

可选参数：

```bash
yiflow inspect examples/approval-flow.swimflow.yaml --format json
yiflow inspect examples/approval-flow.swimflow.yaml --show-edges
yiflow inspect examples/approval-flow.swimflow.yaml --show-indexes
```

### 7.3 执行流程

```text
读取文件
→ 解析 YAML
→ 转换 AST
→ 构建 indexes
→ 输出 summary
```

### 7.4 输出示例

```text
Yiflow inspect
Graph: approval_flow_basic
Title: 标准审批流程示例
Direction: LR

Lanes:
- applicant: 3 nodes
- system: 4 nodes
- reviewer: 2 nodes
- manager: 1 node

Nodes by type:
- start: 1
- process: 5
- decision: 2
- end: 2

Edges by path_type:
- main: 7
- secondary: 1
- exception: 2
- return: 1
```

### 7.5 验收标准

- 能输出 lanes / nodes / edges 数量。
- 能按 node.type 汇总。
- 能按 path_type 汇总。
- 能帮助快速判断图结构复杂度。

---

## 8. apply-op

### 8.1 目的

将 Operation 应用到 `.swimflow.yaml`，输出更新后的 DSL。

### 8.2 命令

```bash
yiflow apply-op examples/approval-flow.swimflow.yaml op.json
```

推荐参数：

```bash
yiflow apply-op examples/approval-flow.swimflow.yaml op.json -o updated.swimflow.yaml
yiflow apply-op examples/approval-flow.swimflow.yaml op.json --dry-run
yiflow apply-op examples/approval-flow.swimflow.yaml op.json --format json
```

### 8.3 执行流程

```text
读取 DSL 文件
→ 解析为 AST
→ 读取 Operation
→ pre-check operation
→ apply operation to AST
→ validate AST
→ calculate affected scope
→ serialize AST to DSL
→ 输出到文件或 stdout
```

### 8.4 dry-run

`--dry-run` 不写文件，只输出影响范围。

示例：

```text
Yiflow apply-op --dry-run
Operation: insert_node_between
Status: success
Affected nodes: submit_request, pre_check, validate_request
Affected edges: e_submit_validate
Requires layout: true
Requires render: true
```

### 8.5 验收标准

- 能应用 update_node_text。
- 能应用 insert_node_between。
- 能输出更新后的 DSL。
- 能在失败时保留原文件不变。
- 能输出 affectedScope。

---

## 9. version

### 9.1 命令

```bash
yiflow version
```

输出：

```text
Yiflow CLI 0.1.0
```

---

## 10. help

### 10.1 命令

```bash
yiflow help
yiflow --help
yiflow validate --help
```

### 10.2 输出要求

help 至少包含：

- 命令说明。
- 参数说明。
- 示例。
- exit code 说明。

---

## 11. 错误输出规范

错误输出应包含：

```text
error_code
message
target
suggested_fix
```

示例：

```text
Error: EDGE_TO_NOT_FOUND
Message: Edge e_submit_review points to missing node review_request.
Target: edge:e_submit_review
Suggested fix: create node review_request or update edge.to.
```

---

## 12. 文件写入规则

### 12.1 不覆盖原则

CLI 默认不应静默覆盖重要文件。

建议：

- render 输出文件已存在时，可覆盖，但提示。
- apply-op 默认输出 stdout 或要求 `-o`。
- 原地修改应使用显式参数，例如 `--write`。

### 12.2 原地写入

原地写入建议命令：

```bash
yiflow apply-op example.swimflow.yaml op.json --write
```

P0 可不实现 `--write`，优先使用 `-o` 输出新文件。

---

## 13. 与模块关系

| CLI 命令 | 依赖模块 |
|---|---|
| validate | parser, ast, validator |
| render | parser, ast, validator, layout, renderer |
| inspect | parser, ast, indexes |
| apply-op | parser, ast, operation, validator, serializer |

---

## 14. P0 最小闭环

P0 最小成功标准：

```bash
yiflow validate examples/approval-flow.swimflow.yaml
yiflow render examples/approval-flow.swimflow.yaml -o output.svg
```

必须得到：

- 校验成功结果。
- 可打开 SVG。
- 可读泳道流程图。

---

## 15. 非 v0.1 范围

CLI Design v0.1 不包含：

- 云端命令。
- 登录鉴权。
- 批量目录扫描。
- Mermaid / draw.io 导入。
- 多格式完整导出。
- watch mode。
- GUI 启动。
- AI 命令。
- npm publish 细节。

---

## 16. 验收标准

YF-P2-005 完成标准：

- [x] 定义 validate 命令。
- [x] 定义 render 命令。
- [x] 定义 inspect 命令。
- [x] 定义 apply-op 命令。
- [x] 定义 version / help。
- [x] 定义 exit code。
- [x] 定义错误输出规范。
- [x] 定义文件写入规则。
- [x] 明确 P0 最小闭环。

---

## 17. 下一步

Phase 2 核心技术设计文档已完成。

建议下一步进入 Phase 3：P0 技术样机。

首个任务：

```text
YF-P3-001：初始化工程结构
```

但进入 Phase 3 前，建议先由项目主控人确认：

- 技术栈是否采用 TypeScript。
- 是否先实现自研简单 layout。
- P0 是否只支持 SVG。
