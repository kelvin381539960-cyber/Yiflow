# Yiflow AST Model v0.1

任务编号：YF-P2-002
状态：Completed
输出文件：docs/tech-design/yiflow-ast-model-v0.1.md
依据：Yiflow DSL Schema v0.1、Yiflow Editor Interaction Spec v1.0、Yiflow MVP Scope v1.0、Implementation Plan v1.0

---

## 1. 文档目的

本文档定义 Yiflow P0 技术样机阶段的 Graph AST Model v0.1。

AST 是 Yiflow 的内部结构真相，用于承接：

```text
SwimFlow DSL → Parser → Graph AST → Validator → Layout → Renderer
```

本文档只定义 AST 模型和数据关系，不实现代码，不定义具体 TypeScript interface，不实现 parser / validator / layout / renderer。

---

## 2. AST 定位

Graph AST 是 Yiflow 内部的唯一结构真相。

各层关系：

| 层 | 作用 | 是否真相 |
|---|---|---|
| SwimFlow DSL | 输入输出表达层 | 是，文件级源数据 |
| Graph AST | 内部结构真相 | 是，运行时主模型 |
| Layout Model | 布局派生结果 | 否，由 AST 计算得到 |
| SVG / HTML | 渲染结果 | 否，不保存业务真相 |
| Editor State | 编辑器交互状态 | 否，应回写到 AST/DSL |

核心原则：

```text
Renderer 不直接读取 DSL。
Editor 不直接修改 SVG。
Layout 不直接依赖 YAML 文本。
Operation 默认作用于 Graph AST。
```

---

## 3. 设计目标

AST v0.1 必须支持：

- 从 DSL 转换。
- 结构校验。
- 节点、边、泳道的快速查找。
- main / secondary / exception / return 路径识别。
- 局部 patch。
- 局部 layout 影响范围计算。
- DSL 回写。
- 后续 Operation Protocol 承接。

AST v0.1 不做：

- 完整 BPMN 语义。
- 流程执行状态。
- 多人协作状态。
- 复杂权限。
- 自由画布绝对坐标作为业务真相。
- AI prompt 历史。

---

## 4. AST 顶层结构

Graph AST v0.1 顶层对象：

```text
Graph
├── graphId
├── title
├── description
├── version
├── direction
├── metadata
├── lanes
├── nodes
├── edges
├── indexes
├── layoutConfig
└── diagnostics
```

---

## 5. Graph

Graph 表示一张完整流程图。

### 5.1 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| graphId | string | 是 | 来自 DSL `diagram.id` |
| title | string | 是 | 来自 DSL `diagram.title` |
| description | string | 否 | 来自 DSL `diagram.description` |
| version | string | 否 | 来自 DSL `diagram.version` |
| direction | enum | 是 | 当前 v0.1 默认 `LR` |
| metadata | object | 否 | 图级元数据 |
| lanes | Lane[] | 是 | 泳道列表 |
| nodes | Node[] | 是 | 节点列表 |
| edges | Edge[] | 是 | 边列表 |
| indexes | GraphIndexes | 是 | 派生索引 |
| layoutConfig | LayoutConfig | 否 | 布局策略配置 |
| diagnostics | Diagnostic[] | 否 | 校验诊断信息 |

### 5.2 规则

- Graph 必须至少包含 1 个 lane。
- Graph 必须至少包含 1 个 node。
- Graph 必须至少包含 1 个 start node。
- Graph 必须至少包含 1 个 end node。
- Graph 的结构变更必须通过 operation 或 parser 转换产生。

---

## 6. Lane

Lane 表示泳道，即责任归属。

### 6.1 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 泳道唯一 ID |
| title | string | 是 | 泳道展示名称 |
| description | string | 否 | 泳道说明 |
| order | number | 否 | 展示顺序 |
| metadata | object | 否 | 扩展信息 |

### 6.2 规则

- Lane id 在 Graph 内必须唯一。
- Node.laneId 必须引用存在的 Lane.id。
- v0.1 默认按 lanes 数组顺序展示。
- Lane 不直接保存节点列表，节点归属由 Node.laneId 表达。

---

## 7. Node

Node 表示流程节点。

### 7.1 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 节点唯一 ID |
| type | NodeType | 是 | 节点类型 |
| text | string | 是 | 展示文案 |
| laneId | string | 是 | 所属泳道 ID |
| description | string | 否 | 节点说明 |
| locked | boolean | 否 | 是否锁定 |
| metadata | object | 否 | 扩展信息 |

### 7.2 NodeType

v0.1 支持：

```text
start
end
process
decision
external_ref
```

说明：

| 类型 | 说明 |
|---|---|
| start | 起点节点 |
| end | 终点节点 |
| process | 普通处理节点 |
| decision | 判断节点 |
| external_ref | 外部服务或第三方系统节点 |

### 7.3 规则

- Node id 在 Graph 内必须唯一。
- Node.text 必填且不应为空。
- Node.laneId 必须引用存在的 Lane.id。
- start 节点不应有入边。
- end 节点不应有出边。
- decision 节点建议至少有 2 条出边。
- locked 节点不能被删除或移动泳道，除非先解锁。

---

## 8. Edge

Edge 表示节点之间的有向连接。

### 8.1 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 边唯一 ID |
| fromNodeId | string | 是 | 起点 Node.id |
| toNodeId | string | 是 | 终点 Node.id |
| label | string | 否 | 边标签 |
| pathType | PathType | 是 | 路径类型 |
| metadata | object | 否 | 扩展信息 |

### 8.2 PathType

v0.1 支持：

```text
main
secondary
exception
return
```

| pathType | 说明 |
|---|---|
| main | 主路径 |
| secondary | 次要路径 |
| exception | 异常路径 |
| return | 回跳路径 |

### 8.3 规则

- Edge id 在 Graph 内必须唯一。
- fromNodeId 必须引用存在的 Node.id。
- toNodeId 必须引用存在的 Node.id。
- fromNodeId 和 toNodeId 不建议相同。
- decision 节点的出边建议有 label。
- return path 应用于补件、重新提交、回跳校验等场景。

---

## 9. GraphIndexes

GraphIndexes 是由 lanes / nodes / edges 派生出的索引，不从 DSL 直接读取。

### 9.1 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| lanesById | map | lane.id → Lane |
| nodesById | map | node.id → Node |
| edgesById | map | edge.id → Edge |
| incomingEdgesByNodeId | map | node.id → Edge[] |
| outgoingEdgesByNodeId | map | node.id → Edge[] |
| nodesByLaneId | map | lane.id → Node[] |
| mainPathEdgeIds | string[] | pathType = main 的 edge id 列表 |
| returnPathEdgeIds | string[] | pathType = return 的 edge id 列表 |
| exceptionPathEdgeIds | string[] | pathType = exception 的 edge id 列表 |

### 9.2 规则

- indexes 是派生数据，不应被直接编辑。
- 每次 AST 结构变更后必须重建或增量更新 indexes。
- Validator、Layout、Operation 可依赖 indexes 提升查找效率。

---

## 10. LayoutConfig

LayoutConfig 来自 DSL `layout`，用于表达布局偏好或约束。

### 10.1 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| laneWidthMode | enum | 对应 `lane_width_mode` |
| pathPriority | enum | 对应 `path_priority` |
| branchPolicy | enum | 对应 `branch_policy` |
| returnPathChannel | enum | 对应 `return_path_channel` |
| externalNodePolicy | enum | 对应 `external_node_policy` |
| lock | LayoutLockConfig | 锁定配置 |

### 10.2 LayoutLockConfig

| 字段 | 类型 | 说明 |
|---|---|---|
| mainPath | boolean | 是否锁定主路径优先布局 |

### 10.3 规则

- LayoutConfig 不是业务真相。
- LayoutConfig 不应保存自由画布绝对坐标作为主要真相。
- 具体 LayoutResult 在 Layout Design 中定义。

---

## 11. LayoutResult

LayoutResult 是布局引擎输出的派生结果。

v0.1 可在后续 Layout Design 中详细定义，这里只定义 AST 对其的关系。

### 11.1 建议结构

```text
LayoutResult
├── nodePositions
├── edgeRoutes
├── laneBounds
├── warnings
└── generatedAt
```

### 11.2 规则

- LayoutResult 可缓存，但不是结构真相。
- 修改 AST 后，受影响区域的 LayoutResult 应失效或重算。
- Renderer 应优先读取 Graph AST + LayoutResult 渲染。

---

## 12. Operation

Operation 表示对 Graph AST 的结构化修改。

本文档只定义 Operation 与 AST 的关系，完整协议在 YF-P2-003 中定义。

### 12.1 v0.1 需要支持的 Operation 类型

```text
update_node_text
insert_node_after
insert_node_between
delete_node
move_node_to_lane
update_edge_label
update_edge_path_type
local_relayout
lock_node
lock_main_path
```

### 12.2 Operation 应满足

- 明确 target。
- 明确 input。
- 可校验。
- 可应用。
- 可失败。
- 可说明影响范围。

### 12.3 Operation 不应

- 默认重写整张图。
- 绕过 Graph AST 直接改 SVG。
- 绕过 Validator 直接保存 DSL。

---

## 13. ValidationResult

ValidationResult 表示 AST 校验结果。

### 13.1 结构

```text
ValidationResult
├── valid
├── errors
├── warnings
└── infos
```

### 13.2 字段定义

| 字段 | 类型 | 说明 |
|---|---|---|
| valid | boolean | 是否通过校验 |
| errors | Diagnostic[] | 阻断性错误 |
| warnings | Diagnostic[] | 警告 |
| infos | Diagnostic[] | 普通提示 |

---

## 14. Diagnostic

Diagnostic 表示错误、警告或提示。

### 14.1 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| code | string | 是 | 错误码 |
| level | enum | 是 | error / warning / info |
| message | string | 是 | 可读提示 |
| targetType | enum | 否 | graph / lane / node / edge / layout |
| targetId | string | 否 | 目标对象 ID |
| suggestedFix | string | 否 | 建议修复方式 |

### 14.2 示例

```text
code: EDGE_TO_NOT_FOUND
level: error
message: Edge e_submit_review points to missing node review_request.
targetType: edge
targetId: e_submit_review
suggestedFix: Create node review_request or update edge.to.
```

---

## 15. DSL 到 AST 映射

| DSL 字段 | AST 字段 |
|---|---|
| diagram.id | Graph.graphId |
| diagram.title | Graph.title |
| diagram.description | Graph.description |
| diagram.version | Graph.version |
| diagram.direction | Graph.direction |
| diagram.metadata | Graph.metadata |
| lanes[].id | Lane.id |
| lanes[].title | Lane.title |
| lanes[].description | Lane.description |
| lanes[].order | Lane.order |
| nodes[].id | Node.id |
| nodes[].type | Node.type |
| nodes[].text | Node.text |
| nodes[].lane | Node.laneId |
| nodes[].description | Node.description |
| nodes[].locked | Node.locked |
| edges[].id | Edge.id |
| edges[].from | Edge.fromNodeId |
| edges[].to | Edge.toNodeId |
| edges[].label | Edge.label |
| edges[].path_type | Edge.pathType |
| layout | Graph.layoutConfig |

---

## 16. AST 到 DSL 回写规则

AST 回写 DSL 时：

- Graph.graphId 回写为 diagram.id。
- Node.laneId 回写为 nodes[].lane。
- Edge.pathType 回写为 edges[].path_type。
- layoutConfig 回写为 layout。
- indexes 不回写。
- diagnostics 不回写。
- LayoutResult 默认不回写。

原则：

```text
只回写结构真相，不回写派生索引和诊断状态。
```

---

## 17. 局部 Patch 支持

AST 必须支持局部 patch。

### 17.1 影响范围模型

任何 Operation 应返回或计算影响范围：

```text
AffectedScope
├── laneIds
├── nodeIds
├── edgeIds
├── requiresValidation
├── requiresLayout
└── requiresRender
```

### 17.2 示例

#### update_node_text

影响：

- nodeIds: 当前节点
- requiresValidation: true
- requiresLayout: false 或 text 尺寸变化时 true
- requiresRender: true

#### move_node_to_lane

影响：

- laneIds: old lane + new lane
- nodeIds: 当前节点
- edgeIds: 入边 + 出边
- requiresValidation: true
- requiresLayout: true
- requiresRender: true

#### delete_node

影响：

- nodeIds: 被删除节点及相邻节点
- edgeIds: 入边、出边、可能新建的边
- requiresValidation: true
- requiresLayout: true
- requiresRender: true

---

## 18. 不变量

Graph AST 应始终尽量保持以下不变量：

- lane id 唯一。
- node id 唯一。
- edge id 唯一。
- edge.fromNodeId 引用存在节点。
- edge.toNodeId 引用存在节点。
- node.laneId 引用存在泳道。
- start 节点无入边。
- end 节点无出边。
- Renderer 不直接依赖 DSL。
- Editor 不直接修改 SVG。

如果 Operation 暂时破坏不变量，必须在保存前恢复并通过 Validator。

---

## 19. 与后续模块关系

| 模块 | 与 AST 的关系 |
|---|---|
| Parser | DSL → AST |
| Validator | 校验 AST 不变量 |
| Layout | AST → LayoutResult |
| Renderer | AST + LayoutResult → SVG/HTML |
| Editor | 用户操作 → Operation → AST |
| Serializer | AST → DSL |
| CLI | 调用 Parser / Validator / Layout / Renderer |

---

## 20. 非 v0.1 范围

AST v0.1 不定义：

- TypeScript 具体接口文件。
- Parser 实现。
- Validator 实现。
- Layout 坐标算法。
- Renderer 输出格式细节。
- Editor 状态管理实现。
- AI 自然语言修改协议。
- 多人协作冲突模型。
- 运行时流程实例。

---

## 21. 验收标准

YF-P2-002 完成标准：

- [x] 定义 Graph。
- [x] 定义 Lane。
- [x] 定义 Node。
- [x] 定义 Edge。
- [x] 定义 LayoutConfig / LayoutResult 关系。
- [x] 定义 Operation 与 AST 的关系。
- [x] 定义 ValidationResult。
- [x] 定义 Diagnostic。
- [x] 定义 DSL → AST 映射。
- [x] 定义 AST → DSL 回写规则。
- [x] 明确支持局部 patch。
- [x] 明确非 v0.1 范围。

---

## 22. 下一步

下一任务：

```text
YF-P2-003：Operation Protocol v0.1
```

建议输出文件：

```text
docs/tech-design/yiflow-operation-protocol-v0.1.md
```
