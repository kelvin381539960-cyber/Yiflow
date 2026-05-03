# Yiflow Operation Protocol v0.1

任务编号：YF-P2-003
状态：Completed
输出文件：docs/tech-design/yiflow-operation-protocol-v0.1.md
依据：Yiflow AST Model v0.1、Yiflow Editor Interaction Spec v1.0、Yiflow User Flows v1.0、Yiflow DSL Schema v0.1

---

## 1. 文档目的

本文档定义 Yiflow v0.1 的 Operation Protocol。

Operation 是用户或 AI 修改流程图时使用的结构化变更协议。

目标是避免默认重写整张图，让编辑行为可校验、可审查、可局部应用、可回滚。

本文档只定义协议，不实现代码、不实现 editor、不实现 AI 自动改图。

---

## 2. 核心原则

### 2.1 Operation-first

Yiflow 的修改默认应通过 Operation 完成，而不是直接改 DSL 文本或 SVG。

```text
User action / AI intent
→ Operation
→ Validate operation
→ Apply to Graph AST
→ Validate Graph AST
→ Layout affected scope
→ Render
→ Save back to DSL
```

### 2.2 Local-first

Operation 默认只影响局部范围。

禁止为了小修改重写整张图。

### 2.3 Validate-before-save

任何 Operation 应用后，必须通过 AST 校验才能保存回 DSL。

### 2.4 SVG is not source

Operation 不直接修改 SVG / HTML。

SVG / HTML 只是渲染结果。

---

## 3. Operation 顶层结构

```yaml
operation:
  id: op_001
  type: insert_node_after
  target:
    node_id: submit_request
  input:
    new_node:
      id: review_request
      type: process
      text: 人工审核
      lane: reviewer
  options:
    relayout: local
  metadata:
    source: editor
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | operation 唯一 ID |
| type | enum | 是 | operation 类型 |
| target | object | 是 | 目标对象 |
| input | object | 否 | 输入参数 |
| options | object | 否 | 应用选项 |
| metadata | object | 否 | 来源、作者、时间等扩展信息 |

---

## 4. OperationResult

每次执行 Operation 后，应返回 OperationResult。

```text
OperationResult
├── success
├── operationId
├── affectedScope
├── validationResult
├── layoutRequired
├── renderRequired
├── saveRequired
└── message
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| success | boolean | 是否执行成功 |
| operationId | string | 对应 operation.id |
| affectedScope | AffectedScope | 影响范围 |
| validationResult | ValidationResult | 校验结果 |
| layoutRequired | boolean | 是否需要重新布局 |
| renderRequired | boolean | 是否需要重新渲染 |
| saveRequired | boolean | 是否需要保存 DSL |
| message | string | 可读说明 |

---

## 5. AffectedScope

AffectedScope 表示本次修改影响了哪些对象。

```text
AffectedScope
├── laneIds
├── nodeIds
├── edgeIds
├── requiresValidation
├── requiresLayout
└── requiresRender
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| laneIds | string[] | 受影响泳道 |
| nodeIds | string[] | 受影响节点 |
| edgeIds | string[] | 受影响边 |
| requiresValidation | boolean | 是否需要校验 |
| requiresLayout | boolean | 是否需要布局 |
| requiresRender | boolean | 是否需要渲染 |

---

## 6. v0.1 Operation 类型总览

| Operation | MVP | 说明 |
|---|---|---|
| update_node_text | ✅ | 修改节点文案 |
| insert_node_after | ✅ | 在节点后插入节点 |
| insert_node_between | ✅ | 在两节点之间插入节点 |
| delete_node | ✅ | 删除节点 |
| move_node_to_lane | ✅ | 移动节点到其他泳道 |
| update_edge_label | ✅ | 修改边标签 |
| update_edge_path_type | ✅ | 修改路径类型 |
| add_branch | ✅ | 为 decision 增加分支 |
| local_relayout | ✅ | 局部整理 |
| lock_node | ✅ | 锁定节点 |
| unlock_node | ✅ | 解锁节点 |
| lock_main_path | ✅ | 锁定主路径优先布局 |
| unlock_main_path | ✅ | 解除主路径锁定 |

---

## 7. update_node_text

### 7.1 目的

修改节点展示文案。

### 7.2 输入

```yaml
operation:
  type: update_node_text
  target:
    node_id: submit_request
  input:
    text: 提交申请资料
```

### 7.3 校验

- target.node_id 必须存在。
- input.text 必须非空。

### 7.4 应用结果

- 更新 Node.text。
- 不改变节点 id、lane、type。

### 7.5 影响范围

- nodeIds: 当前节点。
- requiresValidation: true。
- requiresLayout: text 尺寸变化时 true。
- requiresRender: true。

---

## 8. insert_node_after

### 8.1 目的

在目标节点后插入一个新节点。

### 8.2 输入

```yaml
operation:
  type: insert_node_after
  target:
    node_id: validate_request
  input:
    new_node:
      id: review_request
      type: process
      text: 人工审核
      lane: reviewer
    edge_label: 进入审核
    path_type: main
```

### 8.3 校验

- target.node_id 必须存在。
- new_node.id 不得重复。
- new_node.lane 必须存在。
- new_node.type 必须合法。
- 若 target 有多个出边，必须指定如何处理后继边。

### 8.4 应用规则

如果 target 只有一条出边：

```text
target → old_next
```

变为：

```text
target → new_node → old_next
```

如果 target 没有出边：

```text
target → new_node
```

如果 target 有多条出边：

- 需要指定 target_edge_id，表示插入到哪条出边上。
- 否则返回错误。

### 8.5 失败条件

| 错误 | 说明 |
|---|---|
| TARGET_NODE_NOT_FOUND | target 不存在 |
| DUPLICATE_NODE_ID | 新节点 id 重复 |
| NODE_LANE_NOT_FOUND | lane 不存在 |
| AMBIGUOUS_OUTGOING_EDGE | target 出边不唯一 |

---

## 9. insert_node_between

### 9.1 目的

在两个已连接节点之间插入新节点。

### 9.2 输入

```yaml
operation:
  type: insert_node_between
  target:
    from_node_id: submit_request
    to_node_id: validate_request
  input:
    new_node:
      id: pre_check
      type: process
      text: 预检查
      lane: system
```

### 9.3 校验

- from_node_id 必须存在。
- to_node_id 必须存在。
- from → to 的 edge 必须存在。
- new_node.id 不得重复。
- new_node.lane 必须存在。

### 9.4 应用规则

```text
from → to
```

变为：

```text
from → new_node → to
```

原 edge 的 pathType 默认继承到两条新 edge。

原 edge.label 可按策略处理：

- 保留到 from → new_node。
- 或移动到 new_node → to。
- v0.1 默认保留到 from → new_node。

---

## 10. delete_node

### 10.1 目的

删除一个节点。

### 10.2 输入

```yaml
operation:
  type: delete_node
  target:
    node_id: request_more_info
  options:
    reconnect: true
```

### 10.3 校验

- node_id 必须存在。
- start 节点禁止删除。
- locked 节点禁止删除。
- decision 节点删除为高风险操作。

### 10.4 应用规则

如果普通节点只有 1 条入边和 1 条出边，且 reconnect=true：

```text
prev → node → next
```

变为：

```text
prev → next
```

如果节点有多入边或多出边：

- 默认不自动重连。
- 返回影响范围并要求用户确认。

### 10.5 失败条件

| 错误 | 说明 |
|---|---|
| TARGET_NODE_NOT_FOUND | 目标节点不存在 |
| CANNOT_DELETE_START_NODE | 不允许删除 start |
| NODE_LOCKED | 节点已锁定 |
| DELETE_WOULD_BREAK_MAIN_PATH | 删除会破坏主路径 |
| AMBIGUOUS_RECONNECT | 无法安全重连 |

---

## 11. move_node_to_lane

### 11.1 目的

将节点移动到另一个泳道。

### 11.2 输入

```yaml
operation:
  type: move_node_to_lane
  target:
    node_id: manual_review
  input:
    lane_id: operator
```

### 11.3 校验

- node_id 必须存在。
- lane_id 必须存在。
- locked 节点不允许移动。

### 11.4 应用结果

- 更新 Node.laneId。
- 入边和出边不变。
- 触发局部布局。

### 11.5 影响范围

- old lane。
- new lane。
- 当前节点。
- 当前节点入边和出边。

---

## 12. update_edge_label

### 12.1 目的

修改边标签。

### 12.2 输入

```yaml
operation:
  type: update_edge_label
  target:
    edge_id: e_review_pass
  input:
    label: 审核通过
```

### 12.3 校验

- edge_id 必须存在。
- label 可以为空。
- decision 出边建议保留 label。

### 12.4 应用结果

- 更新 Edge.label。
- 触发 render。
- label 长度变化较大时触发布局。

---

## 13. update_edge_path_type

### 13.1 目的

修改边路径类型。

### 13.2 输入

```yaml
operation:
  type: update_edge_path_type
  target:
    edge_id: e_review_risk
  input:
    path_type: secondary
```

### 13.3 校验

path_type 必须属于：

```text
main
secondary
exception
return
```

### 13.4 影响

- 可能影响主路径识别。
- 必须重新计算 layout。
- 必须重新渲染。

### 13.5 失败条件

| 错误 | 说明 |
|---|---|
| EDGE_NOT_FOUND | edge 不存在 |
| INVALID_PATH_TYPE | path_type 不合法 |
| MAIN_PATH_BROKEN | 改动会破坏主路径连续性 |

---

## 14. add_branch

### 14.1 目的

为 decision 节点增加一个分支。

### 14.2 输入

```yaml
operation:
  type: add_branch
  target:
    decision_node_id: review_result
  input:
    branch_label: 需风控复核
    target_node:
      id: risk_review
      type: process
      text: 风控复核
      lane: risk
    path_type: secondary
```

### 14.3 校验

- decision_node_id 必须存在。
- 目标节点可以是新节点或已有节点。
- 新节点 id 不得重复。
- lane 必须存在。
- path_type 必须合法。

### 14.4 应用规则

- 若 target_node 不存在，则创建新节点。
- 创建 decision → target_node 的 edge。
- edge.label = branch_label。
- edge.pathType = input.path_type。

### 14.5 影响范围

- decision 节点。
- 新分支节点。
- 新 edge。
- 相关泳道。
- 需要局部布局。

---

## 15. local_relayout

### 15.1 目的

对局部区域重新布局，不改变流程语义。

### 15.2 输入

```yaml
operation:
  type: local_relayout
  target:
    node_id: validate_result
  options:
    scope: branch
```

### 15.3 校验

- target 必须能定位到节点、边或分支。
- locked 节点不能移动。
- local_relayout 不得改变 AST 的结构字段。

### 15.4 应用结果

- 不新增 node。
- 不删除 node。
- 不改变 edge from / to。
- 不改变 lane。
- 只触发布局结果更新。

### 15.5 失败条件

| 错误 | 说明 |
|---|---|
| TARGET_NOT_FOUND | 无法定位目标 |
| SCOPE_NOT_RESOLVED | 无法识别局部范围 |
| TOO_MANY_LOCKED_OBJECTS | 锁定对象过多，无法整理 |

---

## 16. lock_node / unlock_node

### 16.1 lock_node

```yaml
operation:
  type: lock_node
  target:
    node_id: submit_request
```

效果：

- Node.locked = true。
- 禁止删除。
- 禁止 move_node_to_lane。
- local_relayout 应避让。

### 16.2 unlock_node

```yaml
operation:
  type: unlock_node
  target:
    node_id: submit_request
```

效果：

- Node.locked = false。

---

## 17. lock_main_path / unlock_main_path

### 17.1 lock_main_path

```yaml
operation:
  type: lock_main_path
```

效果：

- Graph.layoutConfig.lock.mainPath = true。
- main path 相对顺序不应被 local_relayout 改动。

### 17.2 unlock_main_path

```yaml
operation:
  type: unlock_main_path
```

效果：

- Graph.layoutConfig.lock.mainPath = false。

---

## 18. Operation 校验阶段

Operation 应分两层校验。

### 18.1 Pre-check

应用前检查：

- operation.type 是否支持。
- target 是否存在。
- input 是否完整。
- 是否违反锁定规则。

### 18.2 Post-check

应用后检查 Graph AST：

- id 唯一。
- 引用合法。
- start / end 规则。
- decision 出边规则。
- 主路径是否仍可读。

---

## 19. 错误码建议

| 错误码 | 说明 |
|---|---|
| UNKNOWN_OPERATION_TYPE | 未知操作类型 |
| TARGET_NODE_NOT_FOUND | 目标节点不存在 |
| TARGET_EDGE_NOT_FOUND | 目标边不存在 |
| TARGET_LANE_NOT_FOUND | 目标泳道不存在 |
| DUPLICATE_NODE_ID | 节点 id 重复 |
| DUPLICATE_EDGE_ID | 边 id 重复 |
| NODE_LOCKED | 节点已锁定 |
| INVALID_NODE_TYPE | 节点类型非法 |
| INVALID_PATH_TYPE | 路径类型非法 |
| AMBIGUOUS_OUTGOING_EDGE | 出边不唯一，无法自动判断 |
| AMBIGUOUS_RECONNECT | 删除节点后无法安全重连 |
| DELETE_WOULD_BREAK_MAIN_PATH | 删除会破坏主路径 |
| MAIN_PATH_BROKEN | 主路径被破坏 |
| SCOPE_NOT_RESOLVED | 局部范围无法识别 |
| VALIDATION_FAILED | 应用后校验失败 |

---

## 20. 与 Editor 的关系

Editor 操作应映射为 Operation。

| Editor 行为 | Operation |
|---|---|
| 改节点文案 | update_node_text |
| 节点后插入 | insert_node_after |
| 边上插节点 | insert_node_between |
| 删除节点 | delete_node |
| 拖到其他泳道 | move_node_to_lane |
| 改边标签 | update_edge_label |
| 改边类型 | update_edge_path_type |
| 添加分支 | add_branch |
| 局部整理 | local_relayout |
| 锁定节点 | lock_node |
| 锁定主路径 | lock_main_path |

---

## 21. 与 AI 修改的关系

P2 才支持 NL → Operation。

即使未来 AI 修改流程图，也应优先输出 Operation，而不是直接输出整份新 DSL。

AI 输出 Operation 时必须包含：

- operation type。
- target。
- input。
- 影响范围说明。
- 不确定点。

不确定时必须降级为建议，不得强制修改。

---

## 22. 非 v0.1 范围

Operation Protocol v0.1 不包含：

- 复杂批量操作。
- 多人协作冲突解决。
- undo / redo 栈实现。
- AI prompt 设计。
- 操作权限。
- 跨文件引用。
- 子流程操作。
- BPMN 事件操作。

---

## 23. 验收标准

YF-P2-003 完成标准：

- [x] 定义 Operation 顶层结构。
- [x] 定义 OperationResult。
- [x] 定义 AffectedScope。
- [x] 覆盖 insert_node_after。
- [x] 覆盖 insert_node_between。
- [x] 覆盖 delete_node。
- [x] 覆盖 move_node_to_lane。
- [x] 覆盖 add_branch。
- [x] 覆盖 local_relayout。
- [x] 覆盖 lock_main_path。
- [x] 明确 Editor 行为映射。
- [x] 明确 AI 修改边界。

---

## 24. 下一步

下一任务：

```text
YF-P2-004：Layout Design v0.1
```

建议输出文件：

```text
docs/tech-design/yiflow-layout-design-v0.1.md
```
