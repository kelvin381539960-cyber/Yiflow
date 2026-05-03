# Yiflow P0 Local Verification

任务编号：YF-P3-007
状态：Ready for local execution

---

## 1. 目的

本文档定义 Yiflow P0 技术样机的本地验证步骤。

由于本任务需要真实 Node.js / npm 环境，因此必须在本地仓库执行。

---

## 2. 前置条件

建议环境：

```text
Node.js >= 20
npm >= 10
```

---

## 3. 一键验证

在仓库根目录执行：

```bash
npm install
npm run verify:p0
```

`verify:p0` 会依次执行：

```bash
npm run build
npm test
npm run cli -- validate examples/approval-flow.swimflow.yaml
npm run cli -- render examples/approval-flow.swimflow.yaml -o artifacts/approval-flow.svg
```

---

## 4. 预期结果

### 4.1 build

预期：

```text
npm run build
```

能够通过 TypeScript 编译。

### 4.2 test

预期：

```text
npm test
```

所有测试通过。

### 4.3 validate

预期输出包含：

```text
Yiflow validate
Status: valid
Graph: approval_flow_basic
```

### 4.4 render

预期生成：

```text
artifacts/approval-flow.svg
```

该 SVG 应能在浏览器中打开，并显示：

- 图标题。
- 泳道。
- 节点。
- 连线。
- 箭头。
- edge label。

---

## 5. 单步验证命令

如果一键验证失败，可逐步执行：

```bash
npm install
npm run build
npm test
npm run cli -- validate examples/approval-flow.swimflow.yaml
npm run cli -- inspect examples/approval-flow.swimflow.yaml
npm run cli -- render examples/approval-flow.swimflow.yaml -o artifacts/approval-flow.svg
```

---

## 6. 常见失败处理

### 6.1 npm install 失败

检查：

- Node.js 版本。
- npm 版本。
- 网络代理。
- npm registry。

### 6.2 build 失败

优先检查：

- TypeScript import 路径。
- `moduleResolution: NodeNext` 下是否使用 `.js` 后缀。
- workspace dependency 是否正确。

### 6.3 test 失败

优先检查：

- examples 是否与 DSL Schema v0.1 一致。
- parser 输出字段是否与 tests 预期一致。
- renderer 输出是否包含必要 SVG 元素。

### 6.4 render 失败

优先检查：

- Parser 是否返回 graph。
- Validator 是否通过。
- LayoutResult 是否包含 nodePositions、laneBounds、edgeRoutes。
- 输出路径是否可写。

---

## 7. 验收标准

YF-P3-007 完成标准：

- [ ] `npm install` 成功。
- [ ] `npm run build` 成功。
- [ ] `npm test` 成功。
- [ ] `npm run cli -- validate examples/approval-flow.swimflow.yaml` 成功。
- [ ] `npm run cli -- render examples/approval-flow.swimflow.yaml -o artifacts/approval-flow.svg` 成功。
- [ ] `artifacts/approval-flow.svg` 可在浏览器打开。

---

## 8. 当前限制

本文件只定义本地验证步骤。

如果无法访问 npm registry 或 GitHub，验证需要在具备网络和 Node.js 环境的本地机器上执行。
