import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseSwimflow } from '../packages/parser/src/index.js';

describe('parseSwimflow', () => {
  it('parses the approval flow example into Graph AST', async () => {
    const source = await readFile('examples/approval-flow.swimflow.yaml', 'utf8');
    const result = parseSwimflow(source);

    expect(result.errors).toEqual([]);
    expect(result.graph?.graphId).toBe('approval_flow_basic');
    expect(result.graph?.title).toBe('标准审批流程示例');
    expect(result.graph?.direction).toBe('LR');
    expect(result.graph?.lanes.length).toBeGreaterThan(0);
    expect(result.graph?.nodes.some((node) => node.id === 'submit_request')).toBe(true);
    expect(result.graph?.edges.some((edge) => edge.pathType === 'return')).toBe(true);
  });

  it('parses the human-system flow example into Graph AST', async () => {
    const source = await readFile('examples/human-system-flow.swimflow.yaml', 'utf8');
    const result = parseSwimflow(source);

    expect(result.errors).toEqual([]);
    expect(result.graph?.graphId).toBe('human_system_flow');
    expect(result.graph?.nodes.some((node) => node.type === 'external_ref')).toBe(true);
  });

  it('parses the exception-return flow example and layout lock config', async () => {
    const source = await readFile('examples/exception-return-flow.swimflow.yaml', 'utf8');
    const result = parseSwimflow(source);

    expect(result.errors).toEqual([]);
    expect(result.graph?.graphId).toBe('exception_return_flow');
    expect(result.graph?.layoutConfig?.lock?.mainPath).toBe(true);
  });

  it('returns a required-field error when diagram.title is missing', () => {
    const result = parseSwimflow(`
diagram:
  id: broken_flow
lanes:
  - id: user
    title: 用户
nodes:
  - id: start
    type: start
    text: 开始
    lane: user
edges: []
`);

    expect(result.graph).toBeUndefined();
    expect(result.errors.some((error) => error.code === 'REQUIRED_FIELD_MISSING' && error.path === 'diagram.title')).toBe(true);
  });

  it('returns an invalid enum error for unsupported node type', () => {
    const result = parseSwimflow(`
diagram:
  id: broken_flow
  title: Broken Flow
lanes:
  - id: user
    title: 用户
nodes:
  - id: start
    type: unknown_type
    text: 开始
    lane: user
edges: []
`);

    expect(result.graph).toBeUndefined();
    expect(result.errors.some((error) => error.code === 'INVALID_NODE_TYPE' && error.path === 'nodes[0].type')).toBe(true);
  });
});
