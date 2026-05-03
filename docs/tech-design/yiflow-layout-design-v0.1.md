# Yiflow Layout Design v0.1

任务编号：YF-P2-004
状态：Completed
输出文件：docs/tech-design/yiflow-layout-design-v0.1.md
依据：Yiflow DSL Schema v0.1、Yiflow AST Model v0.1、Yiflow Operation Protocol v0.1、Yiflow Editor Interaction Spec v1.0

---

## 1. 文档目的

本文档定义 Yiflow v0.1 的布局设计原则和最小技术方案。

目标是让以下链路具备清晰布局规则：

```text
Graph AST → Layout Engine → LayoutResult → Renderer
```

本文档只定义 layout 设计，不实现布局算法，不引入具体第三方库，不写代码。

---

## 2. 布局目标

Yiflow 布局的核心目标不是“自由好看”，而是“结构可读”。

优先级如下：

1. 主路径清晰。
2. 泳道归属明确。
3. 异常路径不干扰主路径。
4. 回跳路径可识别。
5. 局部修改后不造成全图大幅抖动。
6. 视觉尽量整洁。

---

## 3. 基本方向

v0.1 只支持：

```text
LR = Left to Right
```

主路径默认从左到右推进。

其他方向（TB / RL / BT）不进入 v0.1。

---

## 4. 输入与输出

### 4.1 输入

Layout Engine 输入：

```text
Graph AST
LayoutConfig
AffectedScope（可选）
```

### 4.2 输出

Layout Engine 输出：

```text
LayoutResult
├── nodePositions
├── edgeRoutes
├── laneBounds
├── warnings
└── metadata
```

---

## 5. LayoutResult

### 5.1 nodePositions

```text
nodeId → NodePosition
```

NodePosition：

| 字段 | 类型 | 说明 |
|---|---|---|
| x | number | 节点左上角 x |
| y | number | 节点左上角 y |
| width | number | 节点宽度 |
| height | number | 节点高度 |
| locked | boolean | 是否锁定 |

### 5.2 edgeRoutes

```text
edgeId → EdgeRoute
```

EdgeRoute：

| 字段 | 类型 | 说明 |
|---|---|---|
| points | Point[] | 折线路径点 |
| labelPosition | Point | label 位置 |
| routeType | enum | main / side / return / exception |

### 5.3 laneBounds

```text
laneId → LaneBounds
```

LaneBounds：

| 字段 | 类型 | 说明 |
|---|---|---|
| x | number | 泳道起始 x |
| y | number | 泳道起始 y |
| width | number | 泳道宽度 |
| height | number | 泳道高度 |

---

## 6. 布局阶段

v0.1 layout 建议分 6 步：

```text
1. Build graph indexes
2. Identify main path
3. Assign node rank
4. Assign lane rows
5. Route edges
6. Generate warnings
```

---

## 7. 主路径识别

### 7.1 输入

主路径由 Edge.pathType = main 推导。

### 7.2 规则

- main edge 优先形成左到右主干。
- start → ... → end 的主要链路应尽量水平展开。
- decision 的 main 出边优先继续主干。
- secondary / exception / return 不应打断主干。

### 7.3 异常情况

如果 main path 不连续：

- Layout 不应强行猜测完整主路径。
- 应输出 warning。

建议 warning：

```text
MAIN_PATH_NOT_CONTINUOUS
```

---

## 8. Rank 分配

rank 表示节点在 LR 方向上的层级。

### 8.1 基本规则

- start 节点 rank 最小。
- main path 每前进一步 rank +1。
- 同一阶段的并行或分支节点可共享 rank。
- return path 不应导致目标节点 rank 倒退重排。

### 8.2 decision 节点

- decision 节点位于判断发生位置。
- main 分支继续向右。
- exception / secondary 分支放在主路径附近侧边。

---

## 9. 泳道布局

泳道由 Lane 顺序决定。

### 9.1 规则

- lanes 数组顺序即默认垂直顺序。
- 每个节点根据 node.laneId 放入对应泳道。
- 不允许 layout 自行改变节点 lane。
- 泳道高度根据节点数量和分支复杂度自动扩展。

### 9.2 泳道宽度

v0.1 支持：

```text
lane_width_mode: auto
```

含义：

- 根据节点最大 rank 和节点宽度自动计算。
- 所有泳道共享相同 x 轴 rank 栅格。

---

## 10. 节点尺寸

v0.1 可采用默认尺寸：

| 节点类型 | 默认宽度 | 默认高度 |
|---|---:|---:|
| start | 96 | 40 |
| end | 96 | 40 |
| process | 140 | 56 |
| decision | 140 | 64 |
| external_ref | 160 | 56 |

后续可根据 text 长度自适应，但 P0 可先使用固定尺寸。

---

## 11. 路径类型布局策略

### 11.1 main

- 优先直线或少折线。
- 尽量水平向右。
- 不被 exception / return 覆盖。

### 11.2 secondary

- 放在主路径附近。
- 可使用侧边折线。
- 视觉优先级低于 main。

### 11.3 exception

- 放在主路径上方或下方的侧边区域。
- 不穿越主路径核心节点。
- 可更弯折，但必须可读。

### 11.4 return

- 优先使用 bottom channel。
- 不触发主路径节点 rank 反向重排。
- 通过回跳线明确指向返回目标。

---

## 12. 回跳路径通道

return path 默认：

```text
return_path_channel: bottom
```

规则：

- 从源节点向下进入回跳通道。
- 沿底部通道水平移动。
- 向上连接到目标节点。
- 避免穿过主路径节点中心。

---

## 13. 局部重排

local_relayout 是 P1 的核心能力。

### 13.1 输入

```text
Graph AST
Existing LayoutResult
AffectedScope
```

### 13.2 目标

- 只调整受影响区域。
- 尽量保持其他区域不动。
- 避让 locked 节点。
- 不改变流程语义。

### 13.3 可移动对象

| 对象 | 是否可移动 |
|---|---|
| affectedScope 内未锁定节点 | ✅ |
| affectedScope 外节点 | 默认不移动 |
| locked 节点 | ❌ |
| main path locked 节点 | ❌ 或尽量不移动 |

### 13.4 局部范围推导

| Operation | 默认 layout 范围 |
|---|---|
| update_node_text | 当前节点；文本变长时包含相邻节点 |
| insert_node_after | target、new_node、原后继节点 |
| insert_node_between | from、new_node、to |
| delete_node | 前驱、后继、相关边 |
| move_node_to_lane | old lane、new lane、当前节点、相邻边 |
| add_branch | decision、新分支、相关泳道 |
| local_relayout | 用户指定范围 |

---

## 14. 锁定对象避让

### 14.1 lock_node

锁定节点后：

- node position 尽量保持。
- local_relayout 不移动该节点。
- edge route 可重新绕行。

### 14.2 lock_main_path

主路径锁定后：

- main path 节点相对顺序保持。
- main path rank 保持。
- exception / return / secondary 围绕主路径布局。

### 14.3 冲突处理

如果锁定对象过多导致无法整理，应输出 warning：

```text
TOO_MANY_LOCKED_OBJECTS
```

---

## 15. Visual Override

Yiflow 不以自由坐标作为业务真相，但可以保留轻量 visual override。

### 15.1 v0.1 原则

- override 是布局辅助，不是流程语义。
- override 可以被清理。
- override 不影响 node.lane、edge.from、edge.to。

### 15.2 P0 是否实现

P0 不要求实现 visual override。

P1 可在 Editor 中引入有限 override，但必须可清理。

---

## 16. Override 清理

如果后续支持 override，必须提供清理策略：

```text
clear_layout_override
reset_local_layout
reset_full_layout
```

清理后应回到自动布局结果。

---

## 17. 布局警告

Layout Engine 应输出 warnings。

建议 warning：

| warning | 说明 |
|---|---|
| MAIN_PATH_NOT_CONTINUOUS | 主路径不连续 |
| RETURN_PATH_TOO_COMPLEX | 回跳路径过复杂 |
| TOO_MANY_LOCKED_OBJECTS | 锁定对象过多 |
| LANE_TOO_DENSE | 泳道过密 |
| EDGE_ROUTE_OVERLAP | 边路径重叠严重 |
| LOCAL_LAYOUT_DEGRADED | 局部整理结果不优 |

---

## 18. 与 Renderer 的关系

Renderer 不负责计算布局。

Renderer 输入：

```text
Graph AST + LayoutResult
```

Renderer 负责：

- 绘制泳道。
- 绘制节点。
- 绘制边。
- 绘制 label。
- 表达 pathType 的视觉差异。

Renderer 不负责：

- 决定节点 rank。
- 决定泳道顺序。
- 改变 AST。
- 保存 DSL。

---

## 19. 与 Operation 的关系

Operation 产生 AffectedScope。

Layout 根据 AffectedScope 决定：

- 全图重排。
- 局部重排。
- 只重新渲染。

规则：

| Operation | Layout 行为 |
|---|---|
| update_node_text | 文案变长时局部重排 |
| insert_node_after | 局部重排 |
| insert_node_between | 局部重排 |
| delete_node | 局部重排 |
| move_node_to_lane | 局部重排 |
| update_edge_path_type | 相关路径重排 |
| add_branch | decision 周边重排 |
| local_relayout | 指定范围重排 |
| lock_main_path | 更新布局约束 |

---

## 20. P0 最小实现建议

P0 可先采用简单自研布局：

```text
lane = y axis
rank = x axis
main path decides rank
branches offset within lane
return path uses bottom channel
```

P0 不要求：

- 完美避让。
- 美观曲线。
- 复杂自动排版。
- 高级 route optimization。

是否引入 dagre / elkjs 应作为后续技术验证或 ADR 决策。

---

## 21. 非 v0.1 范围

Layout Design v0.1 不包含：

- 自由画布布局。
- BPMN 完整布局。
- 多人协作布局冲突处理。
- 自动美化模板。
- 复杂文本测量。
- 大规模图性能优化。
- 第三方 layout 引擎选型最终结论。

---

## 22. 验收标准

YF-P2-004 完成标准：

- [x] 定义主路径优先策略。
- [x] 定义异常路径弱化策略。
- [x] 定义回跳路径通道。
- [x] 定义局部重排规则。
- [x] 定义锁定对象避让。
- [x] 定义 visual override 和清理原则。
- [x] 定义 LayoutResult。
- [x] 定义 Operation 与 Layout 的关系。
- [x] 明确 P0 最小实现建议。

---

## 23. 下一步

下一任务：

```text
YF-P2-005：CLI Design v0.1
```

建议输出文件：

```text
docs/tech-design/yiflow-cli-design-v0.1.md
```
