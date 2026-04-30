# ADR 模板

## ADR 编号

```text
ADR-000X
```

## 标题

用一句话描述本次架构或产品关键决策。

示例：

```text
ADR-0001: 使用 Graph AST 作为 Yiflow 的唯一真相模型
```

---

## 状态

可选值：

```text
Proposed / Accepted / Rejected / Superseded / Deprecated
```

当前状态：

```text
Proposed
```

---

## 日期

```text
YYYY-MM-DD
```

---

## 背景

说明为什么需要做这个决策。

应包含：

- 当前问题是什么。
- 为什么现有方案不足。
- 该决策影响哪些模块。
- 是否来自 PRD、项目计划或实施计划中的约束。

示例：

```text
Yiflow 需要支持 AI 生成、人工轻量编辑、局部 patch、自动布局和文档导出。
如果没有统一的数据真相，DSL、编辑器状态、SVG 渲染结果之间会出现不一致。
因此需要决定系统内部的唯一真相模型。
```

---

## 决策

明确写出最终选择。

要求：

- 结论必须清晰。
- 不要只写“建议”。
- 不要把多个无关决策混在一起。

示例：

```text
决定使用 Graph AST 作为 Yiflow 内部唯一真相。
DSL 作为输入输出表达层。
Layout Model 作为布局派生层。
SVG / HTML 作为渲染结果，不保存编辑真相。
```

---

## 备选方案

列出至少 2 个备选方案。

### 方案 A

说明方案内容。

优点：

- xxx

缺点：

- xxx

### 方案 B

说明方案内容。

优点：

- xxx

缺点：

- xxx

### 方案 C（可选）

说明方案内容。

优点：

- xxx

缺点：

- xxx

---

## 选择理由

说明为什么选择当前方案。

应覆盖：

- 产品目标匹配度。
- 技术可实现性。
- AI 友好性。
- 可维护性。
- 对 MVP 的影响。
- 对长期演进的影响。

---

## 影响范围

说明该决策会影响哪些内容。

可选范围：

- PRD
- DSL Schema
- AST Model
- Operation Protocol
- Layout Engine
- Renderer
- Editor
- Cursor Integration
- CLI
- Examples
- Tests
- Documentation

---

## 风险

列出该决策可能带来的风险。

示例：

- 实现复杂度增加。
- 后续迁移成本高。
- AI 生成难度增加。
- 与现有示例不兼容。
- 需要补充更多测试。

---

## 风险缓解措施

说明如何降低风险。

示例：

- 先在 P0 中做最小验证。
- 保留旧字段兼容一段时间。
- 增加示例和 validator。
- 先写 schema 再写代码。

---

## 回滚方式

说明如果该决策失败，如何回退。

必须写清楚：

- 回退到什么方案。
- 哪些文件需要修改。
- 是否影响已有示例。
- 是否需要迁移数据。

---

## 验收标准

说明如何判断该决策是有效的。

示例：

- 示例 DSL 可以转换为 AST。
- AST 可以支持至少 5 类 operation。
- Renderer 不直接依赖 DSL。
- Editor 修改后能回写 DSL。

---

## 关联文档

列出相关文档路径。

```text
docs/prd/yiflow-prd-v1.3.md
docs/project-plan/yiflow-project-plan-v1.0.md
docs/project-plan/yiflow-implementation-plan-v1.0.md
```

---

## 备注

记录其他补充说明。

如无补充，写：

```text
None
```
