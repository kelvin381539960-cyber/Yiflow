# Yiflow Editor Interaction Spec v1.0

任务编号：YF-P1-003
状态：Completed
输出文件：docs/ux/yiflow-editor-interaction-spec-v1.0.md
依据：Yiflow User Flows v1.0、Yiflow MVP Scope v1.0、Yiflow PRD v1.3、Implementation Plan v1.0

---

## 1. 文档目的

本文档定义 Yiflow MVP 阶段的编辑器交互规格。

它的目标不是设计完整视觉稿，也不是技术实现方案，而是明确：

- 编辑器允许用户做什么。
- 编辑器不允许用户做什么。
- 用户操作如何映射为结构化变更。
- 哪些操作必须校验。
- 哪些操作必须局部重排。
- 如何避免 Yiflow 滑向自由画布工具。

本文档是后续 Operation Protocol、Editor Prototype、Layout Design、Save-back Design 的上游输入。

---

## 2. 编辑器定位

Yiflow Editor 是结构化流程编辑器，不是自由画布。

核心原则：

```text
用户操作 → Operation → Graph AST → Validation → Layout → Render → DSL Save-back
```

编辑器不直接把 SVG、HTML 或像素坐标作为数据真相。

---

## 3. 交互边界

### 3.1 MVP 允许

- 选择节点。
- 选择边。
- 编辑节点文案。
- 编辑边 label。
- 在节点后插入节点。
- 在两节点之间插入节点。
- 删除节点。
- 移动节点到其他泳道。
- 对局部区域重新布局。
- 锁定主路径。
- 锁定单个节点。
- 保存并回写 DSL。
- 导出 SVG / PNG。

### 3.2 MVP 不允许

- 任意拖动画布元素到任意坐标。
- 直接编辑 SVG 作为数据源。
- 像 draw.io / Figma 一样自由排版。
- 一次性批量重写整图。
- 多人实时协作。
- 复杂权限控制。
- AI 自动改图。
- 在编辑器内直接定义新 DSL 语法。

---

## 4. 编辑器基础布局

MVP 编辑器建议包含 4 个区域：

| 区域 | 用途 |
|---|---|
| Top Bar | 文件名、校验状态、保存、导出、Open DSL |
| Canvas / Preview Area | 显示泳道流程图 |
| Context Panel | 显示选中节点/边的属性 |
| Error Panel | 显示校验错误、布局警告和保存失败原因 |

MVP 不要求复杂属性面板，但必须能展示当前选中对象的基础信息。

---

## 5. 选择交互

### 5.1 选择节点

用户点击节点后，系统应：

- 高亮该节点。
- 高亮直接入边和出边。
- 在 Context Panel 展示节点属性。
- 显示节点操作菜单。

节点属性至少包含：

```text
id
type
text
lane
locked
```

### 5.2 选择边

用户点击边后，系统应：

- 高亮该边。
- 高亮 from / to 节点。
- 在 Context Panel 展示边属性。
- 显示边操作菜单。

边属性至少包含：

```text
id
from
to
label
path_type
```

### 5.3 空白点击

点击空白区域后：

- 清除选择。
- 收起对象菜单。
- Context Panel 回到 diagram summary。

---

## 6. 节点菜单

用户选中节点后，节点菜单应包含以下操作。

| 操作 | MVP | 对应 Operation |
|---|---|---|
| Edit text | ✅ | update_node_text |
| Insert after | ✅ | insert_node_after |
| Insert before | 可选 | insert_node_before |
| Insert between | ✅ | insert_node_between |
| Delete node | ✅ | delete_node |
| Move to lane | ✅ | move_node_to_lane |
| Lock node | ✅ | lock_node |
| Local relayout around node | ✅ | local_relayout |
| Change node type | P1 可选 | update_node_type |
| Duplicate node | ❌ | 非 MVP |

### 6.1 Edit text

用户输入：

```text
new_text
```

系统动作：

```text
生成 update_node_text
→ 校验 text 非空
→ 更新 AST
→ 回写 DSL
→ 重新渲染
```

失败处理：

- 空文本：阻止保存。
- 节点不存在：取消操作并提示。

### 6.2 Insert after

用户输入：

```text
target_node_id
new_node.type
new_node.text
new_node.lane
```

系统动作：

```text
在目标节点后插入新节点
→ 连接原有后继节点
→ 校验 edge 引用
→ 局部重排
→ 回写 DSL
```

失败处理：

- target 不存在：取消。
- lane 不存在：提示选择有效泳道。
- target 后继不唯一：要求用户选择插入到哪条出边。

### 6.3 Insert between

用户输入：

```text
from_node_id
to_node_id
new_node
```

系统动作：

```text
找到 from → to 的 edge
→ 删除或替换该 edge
→ 插入 new_node
→ 创建 from → new_node → to
→ 校验
→ 局部重排
```

失败处理：

- from / to 之间没有直接边：阻止操作。
- 插入后 decision 出边不合法：阻止操作。

### 6.4 Delete node

系统动作：

```text
检查节点是否可删除
→ 计算影响的入边和出边
→ 根据规则重连或要求用户确认
→ 校验
→ 局部重排
```

删除规则：

| 节点类型 | 默认处理 |
|---|---|
| start | 禁止删除 |
| end | 允许删除，但必须处理入边 |
| process | 可删除，尝试连接前后节点 |
| decision | 高风险，默认要求确认 |
| external_ref | 可删除，但提示外部服务调用被移除 |

失败处理：

- 删除会导致主路径断裂：提示影响范围。
- 删除会导致孤立节点：阻止或要求确认。
- 删除 locked 节点：阻止。

### 6.5 Move to lane

用户输入：

```text
target_lane_id
```

系统动作：

```text
校验 lane 存在
→ 更新 node.lane
→ 局部重排相关区域
→ 回写 DSL
```

失败处理：

- 目标泳道不存在：阻止。
- 节点锁定：阻止。
- 移动后布局过密：允许保存，但显示布局警告。

### 6.6 Lock node

节点锁定后：

- local_relayout 不应移动该节点。
- full relayout 也应尽量保留该节点位置。
- 删除锁定节点必须先解锁。

MVP 可只实现逻辑锁定，不要求复杂视觉状态。

---

## 7. 边菜单

用户选中边后，边菜单应包含以下操作。

| 操作 | MVP | 对应 Operation |
|---|---|---|
| Edit label | ✅ | update_edge_label |
| Change path type | ✅ | update_edge_path_type |
| Insert node on edge | ✅ | insert_node_between |
| Delete edge | P1 可选 | delete_edge |
| Local relayout edge area | ✅ | local_relayout |

### 7.1 Edit label

系统动作：

```text
更新 edge.label
→ 校验 edge 存在
→ 回写 DSL
→ 重新渲染
```

label 可以为空，但 decision 出边建议有 label。

### 7.2 Change path type

允许的 path_type：

```text
main
secondary
exception
return
```

系统动作：

```text
更新 edge.path_type
→ 校验主路径是否仍清晰
→ 触发布局重新计算
```

失败处理：

- 将唯一主路径改成非 main 后导致主路径不连续：提示风险。
- return path 缺少合理回跳目标：提示检查。

### 7.3 Insert node on edge

等同于 Insert between。

用户选择一条边后，系统自动识别：

```text
from = edge.from
to = edge.to
```

---

## 8. 合法拖拽规则

Yiflow 支持受控拖拽，不支持自由拖拽。

### 8.1 合法拖拽

| 拖拽行为 | 是否允许 | 结果 |
|---|---|---|
| 节点拖到另一个泳道 | ✅ | 更新 node.lane |
| 节点在同泳道内轻微调整 | P1 可选 | 仅作为 layout override，不作为流程真相 |
| 边端点拖到其他节点 | ❌ | 非 MVP |
| 节点任意摆放 | ❌ | 禁止 |
| 泳道顺序拖拽 | P1 可选 | 更新 lane order，需后续定义 |

### 8.2 拖拽到泳道

用户拖动节点到目标泳道时：

```text
hover target lane
→ 释放鼠标
→ 触发 move_node_to_lane
→ 校验
→ 局部重排
→ 保存或提示错误
```

### 8.3 非法拖拽反馈

非法拖拽应提供明确反馈：

- 光标或边框显示不可放置。
- 释放后回弹到原位置。
- Error Panel 显示原因。

---

## 9. 局部整理

局部整理是 P1 的核心能力之一。

### 9.1 触发入口

- 节点菜单：Relayout around this node。
- 边菜单：Relayout this branch。
- 分支区域菜单：Relayout selected area。

### 9.2 局部范围识别

系统根据选中对象推导影响范围：

| 选中对象 | 默认整理范围 |
|---|---|
| 普通节点 | 该节点、前驱、后继 |
| decision 节点 | decision 及其所有直接分支 |
| return 边 | return path 及回跳目标周边 |
| exception 边 | 异常分支局部 |

### 9.3 约束

局部整理不得：

- 改变节点 lane。
- 改变 edge from / to。
- 改变 path_type。
- 移动 locked 节点。
- 破坏 main path。

### 9.4 失败处理

| 失败原因 | 处理 |
|---|---|
| 无法识别范围 | 要求用户选择更明确的节点或边 |
| 锁定对象过多 | 提示无法充分整理 |
| 整理后效果更差 | 保留原布局 |

---

## 10. 锁定机制

### 10.1 锁定类型

MVP 支持两类锁定：

| 锁定类型 | 说明 |
|---|---|
| lock_node | 锁定单个节点位置或结构 |
| lock_main_path | 锁定主路径优先布局 |

### 10.2 lock_node

锁定节点后：

- 不能删除。
- 不能 move to lane。
- local relayout 应避让。
- 可编辑 text，但需保留 id 和 lane。

### 10.3 lock_main_path

锁定主路径后：

- main path 的相对顺序不可变。
- exception / return / secondary 应围绕主路径布局。
- local relayout 不应导致主路径弯折混乱。

### 10.4 解锁

MVP 可以支持手动 Unlock。

删除或移动锁定对象时，应提示：

```text
This node is locked. Unlock before changing its structure.
```

---

## 11. 保存与回写 DSL

### 11.1 保存原则

保存时必须以 Graph AST 为准，回写 `.swimflow.yaml`。

不允许只保存 SVG / HTML。

### 11.2 保存流程

```text
用户点击 Save
→ 检查当前 AST 是否有效
→ 序列化为 SwimFlow DSL
→ 写回原文件
→ 重新读取并校验
→ 显示保存成功
```

### 11.3 保存失败

| 失败原因 | 处理 |
|---|---|
| AST 校验失败 | 阻止保存，展示错误 |
| 文件不可写 | 提示权限或路径问题 |
| 外部文件已变更 | 提示 reload / merge / overwrite |
| 序列化失败 | 保留编辑器状态，提示错误 |

### 11.4 外部文件变更

当 DSL 文件被外部工具修改时，编辑器应提示：

- Reload from file。
- Keep editor version。
- Compare manually（P1 可选）。

MVP 不要求自动 merge。

---

## 12. 错误提示

错误提示必须可操作。

### 12.1 错误等级

| 等级 | 含义 | 示例 |
|---|---|---|
| Error | 阻止保存或渲染 | edge 引用不存在 |
| Warning | 可保存但需注意 | 布局过密 |
| Info | 普通提示 | 保存成功 |

### 12.2 错误内容

错误至少包含：

```text
error_code
message
affected_object
suggested_fix
```

示例：

```text
EDGE_TARGET_NOT_FOUND
Edge e_submit_review points to missing node review_request.
Suggested fix: create node review_request or update edge.to.
```

---

## 13. Markdown / Preview / Editor 关系

Yiflow 的 MVP 交互需要区分：

| 形态 | 作用 | 是否编辑真相 |
|---|---|---|
| .swimflow.yaml | 源文件 | ✅ |
| Graph AST | 内部真相 | ✅ |
| SVG | 渲染结果 | ❌ |
| HTML Preview | 预览结果 | ❌ |
| Markdown Preview | 文档展示 | ❌ |
| Yiflow Editor | 结构化编辑入口 | 通过 AST/DSL 保存 |

Markdown Preview 只负责展示，不承诺完整编辑能力。

编辑入口应通过：

```text
Open in Yiflow Editor
```

---

## 14. 操作与用户任务流映射

| 用户任务流 | 必要交互 |
|---|---|
| UF-001 首次出图 | Preview / Validate / Export |
| UF-002 小改节点 | Node menu / Edge menu / Save-back |
| UF-003 改职责归属 | Drag to lane / Move to lane |
| UF-004 局部整理 | Local relayout / Lock main path |
| UF-005 导出进文档 | Export SVG / PNG / Markdown Preview |

---

## 15. 验收标准

YF-P1-003 完成标准：

- [x] 明确节点菜单。
- [x] 明确边菜单。
- [x] 明确合法拖拽和非法拖拽。
- [x] 明确局部整理规则。
- [x] 明确锁定机制。
- [x] 明确保存回写 DSL 规则。
- [x] 明确 Markdown Preview 与 Editor 的边界。
- [x] 明确不做自由画布。

---

## 16. 下一步

Phase 1 的 MVP Scope、User Flows、Editor Interaction Spec 已完成。

建议下一步进入 Phase 2：技术设计与验证。

首个任务：

```text
YF-P2-001：DSL Schema v0.1
```

建议输出文件：

```text
docs/tech-design/yiflow-dsl-schema-v0.1.md
```
