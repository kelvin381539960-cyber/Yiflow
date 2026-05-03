# Yiflow DSL Schema v0.1

任务编号：YF-P2-001
状态：Completed
输出文件：docs/tech-design/yiflow-dsl-schema-v0.1.md
依据：Yiflow MVP Scope v1.0、Yiflow User Flows v1.0、Yiflow Editor Interaction Spec v1.0、现有 examples

---

## 1. 文档目的

本文档定义 Yiflow P0 技术样机阶段的 SwimFlow DSL Schema v0.1。

目标是让以下链路具备明确输入结构：

```text
.swimflow.yaml → Parser → Graph AST → Validator → Layout → SVG Renderer
```

本文档只定义 DSL 输入格式和基础校验规则，不实现 parser，不定义完整 AST，不定义 operation protocol。

---

## 2. 设计原则

### 2.1 YAML-first

v0.1 使用 YAML 作为唯一 MVP 输入格式。

原因：

- 人类可读。
- AI 容易生成。
- Git diff 友好。
- 适合 PRD、Cursor、Markdown 工作流。
- 现有 examples 已采用 YAML。

### 2.2 Graph-first

DSL 表达的是结构化流程图，不是画布。

核心对象：

```text
diagram
lanes
nodes
edges
layout
```

节点和边组成有向图，泳道表达责任归属，layout 只表达布局策略或约束，不作为业务真相。

### 2.3 Minimal but extensible

v0.1 只保留 P0/P1 必需字段。

不提前加入：

- 权限。
- 多人协作。
- 执行流引擎。
- 复杂 BPMN 语义。
- 自由画布坐标。
- AI prompt 元数据。

---

## 3. 文件扩展名

推荐扩展名：

```text
.swimflow.yaml
```

示例：

```text
examples/approval-flow.swimflow.yaml
examples/human-system-flow.swimflow.yaml
examples/exception-return-flow.swimflow.yaml
```

---

## 4. 顶层结构

SwimFlow DSL v0.1 顶层必须包含：

```yaml
diagram:
  id: approval_flow_basic
  title: 标准审批流程示例
  description: 用于验证普通审批流程
  direction: LR
  version: 0.1.0
  metadata:
    category: approval
    author: Yiflow
    status: example

lanes:
  - id: applicant
    title: 申请人

nodes:
  - id: start
    type: start
    text: 开始
    lane: applicant

edges:
  - id: e_start_submit
    from: start
    to: submit_request
    path_type: main

layout:
  lane_width_mode: auto
  path_priority: main_first
```

顶层字段说明：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| diagram | object | 是 | 图的基础信息 |
| lanes | array | 是 | 泳道列表 |
| nodes | array | 是 | 节点列表 |
| edges | array | 是 | 边列表 |
| layout | object | 否 | 布局策略和约束 |

---

## 5. diagram

### 5.1 结构

```yaml
diagram:
  id: approval_flow_basic
  title: 标准审批流程示例
  description: 用于验证普通审批流程中的泳道、主路径、人工审核和通过/拒绝分支。
  direction: LR
  version: 0.1.0
  metadata:
    category: approval
    author: Yiflow
    status: example
```

### 5.2 字段定义

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 图唯一 ID |
| title | string | 是 | 图标题 |
| description | string | 否 | 图说明 |
| direction | enum | 否 | 布局方向，v0.1 默认 LR |
| version | string | 否 | DSL 文档版本 |
| metadata | object | 否 | 扩展元数据 |

### 5.3 diagram.id 规则

- 必须唯一表示当前图。
- 推荐使用 snake_case。
- 不应包含空格。
- 不应使用中文作为 id。

示例：

```text
approval_flow_basic
human_system_flow
exception_return_flow
```

### 5.4 direction

v0.1 支持：

| 值 | 说明 |
|---|---|
| LR | Left to Right，主路径从左到右 |

v0.1 只要求实现 LR。

TB、RL、BT 可作为后续版本扩展，不属于 P0 必须能力。

---

## 6. metadata

metadata 是可选扩展信息。

### 6.1 示例

```yaml
metadata:
  category: approval
  author: Yiflow
  status: example
```

### 6.2 v0.1 建议字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| category | string | 否 | 流程分类 |
| author | string | 否 | 作者或来源 |
| status | string | 否 | example / draft / reviewed 等 |

metadata 不参与核心图校验。

---

## 7. lanes

lanes 表示泳道，即职责归属。

### 7.1 结构

```yaml
lanes:
  - id: applicant
    title: 申请人
  - id: system
    title: 系统
```

### 7.2 字段定义

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 泳道唯一 ID |
| title | string | 是 | 展示名称 |
| description | string | 否 | 泳道说明 |
| order | number | 否 | 泳道排序，缺省按数组顺序 |

### 7.3 lane.id 规则

- 在 lanes 内必须唯一。
- 推荐使用 snake_case。
- 不应包含空格。
- nodes.lane 必须引用已存在的 lane.id。

### 7.4 泳道顺序

v0.1 默认使用 lanes 数组顺序作为展示顺序。

如果存在 order 字段，则后续实现可按 order 排序，但 P0 不强制要求支持 order。

---

## 8. nodes

nodes 表示流程节点。

### 8.1 结构

```yaml
nodes:
  - id: submit_request
    type: process
    text: 提交申请
    lane: applicant
```

### 8.2 字段定义

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 节点唯一 ID |
| type | enum | 是 | 节点类型 |
| text | string | 是 | 节点展示文案 |
| lane | string | 是 | 所属泳道 ID |
| description | string | 否 | 节点说明 |
| metadata | object | 否 | 节点扩展信息 |
| locked | boolean | 否 | 是否锁定节点 |

### 8.3 node.id 规则

- 在 nodes 内必须唯一。
- edges.from 和 edges.to 必须引用已存在的 node.id。
- 推荐使用 snake_case。
- 不应使用纯数字。
- 不应使用中文作为 id。

### 8.4 node.type

v0.1 支持以下类型：

| 类型 | 说明 | 示例 |
|---|---|---|
| start | 开始节点 | 开始 |
| end | 结束节点 | 审批通过 / 拒绝 |
| process | 普通处理节点 | 提交申请 |
| decision | 判断节点 | 信息是否完整 |
| external_ref | 外部系统或第三方服务节点 | 调用外部服务 |

### 8.5 node.text

- 必填。
- 用于图中展示。
- 可以使用中文。
- 不建议过长。

### 8.6 node.lane

node.lane 必须引用 lanes 中存在的 lane.id。

错误示例：

```yaml
nodes:
  - id: review
    type: process
    text: 人工审核
    lane: reviewer

lanes:
  - id: system
    title: 系统
```

如果 `reviewer` 不在 lanes 中，validator 必须报错。

---

## 9. edges

edges 表示节点之间的有向连接。

### 9.1 结构

```yaml
edges:
  - id: e_submit_validate
    from: submit_request
    to: validate_request
    label: 提交后校验
    path_type: main
```

### 9.2 字段定义

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 边唯一 ID |
| from | string | 是 | 起点 node.id |
| to | string | 是 | 终点 node.id |
| label | string | 否 | 边标签 |
| path_type | enum | 是 | 路径类型 |
| metadata | object | 否 | 边扩展信息 |

### 9.3 edge.id 规则

- 在 edges 内必须唯一。
- 推荐使用 `e_` 前缀。
- 不应包含空格。

### 9.4 from / to 规则

- from 必须引用存在的 node.id。
- to 必须引用存在的 node.id。
- from 和 to 不建议相同。
- v0.1 不支持跨图引用。

### 9.5 label

label 可选。

但 decision 节点的出边建议提供 label，例如：

```yaml
- from: info_complete
  to: review_request
  label: 完整
  path_type: main

- from: info_complete
  to: request_more_info
  label: 不完整
  path_type: exception
```

---

## 10. path_type

path_type 是 Yiflow 布局和阅读体验的关键字段。

v0.1 支持：

| path_type | 说明 | 布局倾向 |
|---|---|---|
| main | 主路径 | 优先从左到右展示 |
| secondary | 次要路径 | 放在主路径附近，但弱于 main |
| exception | 异常路径 | 视觉上弱化，不干扰主路径 |
| return | 回跳路径 | 使用回跳通道，避免破坏主路径 |

### 10.1 main

表示主业务路径。

规则：

- 主路径应尽量连续。
- 一张图可以有多条 main edge，但应形成可读主干。
- layout 应优先保证 main path 清晰。

### 10.2 secondary

表示非主干但仍常见的路径。

示例：

- 是否需要主管审批。
- 是否需要人工复核。
- 是否命中风险复核。

### 10.3 exception

表示异常、失败、拒绝、缺资料、超时等路径。

layout 应避免 exception path 抢占主路径视觉中心。

### 10.4 return

表示回跳路径。

示例：

- 补件后重新提交。
- 回到系统校验。

return path 应优先使用 bottom 或 side channel。

---

## 11. layout

layout 用于表达布局策略或约束，不表达业务流程真相。

### 11.1 结构

```yaml
layout:
  lane_width_mode: auto
  path_priority: main_first
  branch_policy: main_plus_side_branch
  return_path_channel: bottom
  external_node_policy: weak_layout
  lock:
    main_path: true
```

### 11.2 字段定义

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| lane_width_mode | enum | 否 | 泳道宽度策略 |
| path_priority | enum | 否 | 路径布局优先级 |
| branch_policy | enum | 否 | 分支布局策略 |
| return_path_channel | enum | 否 | 回跳路径通道 |
| external_node_policy | enum | 否 | 外部节点布局策略 |
| lock | object | 否 | 锁定约束 |

### 11.3 lane_width_mode

v0.1 支持：

| 值 | 说明 |
|---|---|
| auto | 系统自动计算泳道宽度 |

### 11.4 path_priority

v0.1 支持：

| 值 | 说明 |
|---|---|
| main_first | 主路径优先布局 |

### 11.5 branch_policy

v0.1 支持：

| 值 | 说明 |
|---|---|
| main_plus_side_branch | 主路径为主，分支放侧边 |

### 11.6 return_path_channel

v0.1 支持：

| 值 | 说明 |
|---|---|
| bottom | 回跳路径优先走底部通道 |

### 11.7 external_node_policy

v0.1 支持：

| 值 | 说明 |
|---|---|
| weak_layout | 外部服务节点参与布局，但视觉优先级弱于主路径 |

### 11.8 lock

```yaml
layout:
  lock:
    main_path: true
```

字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| main_path | boolean | 否 | 是否锁定主路径优先布局 |

v0.1 只定义语义，不要求 P0 完整实现复杂锁定。

---

## 12. 基础校验规则

P0 Validator 至少应支持以下校验。

### 12.1 Required fields

必须存在：

```text
diagram.id
diagram.title
lanes
nodes
edges
lane.id
lane.title
node.id
node.type
node.text
node.lane
edge.id
edge.from
edge.to
edge.path_type
```

### 12.2 Unique IDs

- lane.id 在 lanes 内唯一。
- node.id 在 nodes 内唯一。
- edge.id 在 edges 内唯一。

### 12.3 Reference validation

- node.lane 必须引用存在的 lane.id。
- edge.from 必须引用存在的 node.id。
- edge.to 必须引用存在的 node.id。

### 12.4 Node type validation

node.type 必须属于：

```text
start
end
process
decision
external_ref
```

### 12.5 Path type validation

edge.path_type 必须属于：

```text
main
secondary
exception
return
```

### 12.6 Decision validation

decision 节点建议至少有 2 条出边。

P0 可先作为 Error 处理：

```text
DECISION_OUT_EDGE_TOO_FEW
```

### 12.7 Start / End validation

P0 建议规则：

- 至少 1 个 start 节点。
- 至少 1 个 end 节点。
- start 节点不应有入边。
- end 节点不应有出边。

### 12.8 Graph reachability

P0 可选，P1 建议：

- 从 start 可到达主要节点。
- 不应存在明显孤立节点。

---

## 13. 错误码建议

Validator 可使用以下错误码。

| 错误码 | 说明 |
|---|---|
| REQUIRED_FIELD_MISSING | 必填字段缺失 |
| DUPLICATE_LANE_ID | lane.id 重复 |
| DUPLICATE_NODE_ID | node.id 重复 |
| DUPLICATE_EDGE_ID | edge.id 重复 |
| NODE_LANE_NOT_FOUND | node.lane 引用不存在 |
| EDGE_FROM_NOT_FOUND | edge.from 引用不存在 |
| EDGE_TO_NOT_FOUND | edge.to 引用不存在 |
| INVALID_NODE_TYPE | node.type 不合法 |
| INVALID_PATH_TYPE | edge.path_type 不合法 |
| DECISION_OUT_EDGE_TOO_FEW | decision 出边不足 |
| START_NODE_HAS_INCOMING_EDGE | start 节点存在入边 |
| END_NODE_HAS_OUTGOING_EDGE | end 节点存在出边 |
| ISOLATED_NODE | 存在孤立节点 |

---

## 14. 与现有 examples 的兼容性

v0.1 schema 必须兼容以下文件：

```text
examples/approval-flow.swimflow.yaml
examples/human-system-flow.swimflow.yaml
examples/exception-return-flow.swimflow.yaml
```

覆盖能力：

| 示例 | 覆盖内容 |
|---|---|
| approval-flow | 普通审批、主路径、异常分支、回跳 |
| human-system-flow | 用户、前端、后端、外部服务、人工运营 |
| exception-return-flow | 异常、补件、重新提交、风控复核、主路径锁定 |

---

## 15. 非 v0.1 范围

以下内容不进入 DSL Schema v0.1：

- BPMN 完整语义。
- 复杂事件类型。
- 子流程。
- 角色权限。
- 多人协作信息。
- 云端同步信息。
- 自由画布绝对坐标作为真相。
- AI prompt 历史。
- 运行时执行状态。
- draw.io / Mermaid 高保真兼容字段。

---

## 16. 最小完整示例

```yaml
diagram:
  id: simple_approval
  title: 简单审批
  direction: LR
  version: 0.1.0

lanes:
  - id: applicant
    title: 申请人
  - id: reviewer
    title: 审核人
  - id: system
    title: 系统

nodes:
  - id: start
    type: start
    text: 开始
    lane: applicant
  - id: submit
    type: process
    text: 提交申请
    lane: applicant
  - id: review
    type: decision
    text: 审核是否通过
    lane: reviewer
  - id: approved
    type: end
    text: 通过
    lane: system
  - id: rejected
    type: end
    text: 拒绝
    lane: system

edges:
  - id: e_start_submit
    from: start
    to: submit
    path_type: main
  - id: e_submit_review
    from: submit
    to: review
    path_type: main
  - id: e_review_approved
    from: review
    to: approved
    label: 通过
    path_type: main
  - id: e_review_rejected
    from: review
    to: rejected
    label: 拒绝
    path_type: exception

layout:
  lane_width_mode: auto
  path_priority: main_first
```

---

## 17. 与 AST 的关系

DSL 是输入输出表达层。

Graph AST 是内部真相层。

关系：

```text
SwimFlow DSL → Parser → Graph AST
Graph AST → Serializer → SwimFlow DSL
```

本文档不定义 AST 的具体结构。

AST 结构将在下一任务中定义：

```text
YF-P2-002：AST Model v0.1
```

---

## 18. 验收标准

YF-P2-001 完成标准：

- [x] 定义 diagram。
- [x] 定义 lanes。
- [x] 定义 nodes。
- [x] 定义 edges。
- [x] 定义 path_type。
- [x] 定义 layout。
- [x] 定义 metadata。
- [x] 定义基础校验规则。
- [x] 确认兼容现有 examples。
- [x] 明确非 v0.1 范围。

---

## 19. 下一步

下一任务：

```text
YF-P2-002：AST Model v0.1
```

建议输出文件：

```text
docs/tech-design/yiflow-ast-model-v0.1.md
```
