import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseSwimflow } from '../packages/parser/src/index.js';
import { validateGraph } from '../packages/validator/src/index.js';
import type { Graph } from '../packages/core/src/index.js';

describe('validateGraph', () => {
  it('validates all current examples successfully', async () => {
    const files = [
      'examples/approval-flow.swimflow.yaml',
      'examples/human-system-flow.swimflow.yaml',
      'examples/exception-return-flow.swimflow.yaml'
    ];

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const parsed = parseSwimflow(source);

      expect(parsed.errors).toEqual([]);
      expect(parsed.graph).toBeDefined();

      const validation = validateGraph(parsed.graph as Graph);
      expect(validation.errors).toEqual([]);
      expect(validation.valid).toBe(true);
    }
  });

  it('detects duplicate node ids', () => {
    const graph = createValidGraph();
    graph.nodes.push({ ...graph.nodes[0]!, text: 'Duplicate start' });

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === 'DUPLICATE_NODE_ID')).toBe(true);
  });

  it('detects node lane references that do not exist', () => {
    const graph = createValidGraph();
    graph.nodes[0] = { ...graph.nodes[0]!, laneId: 'missing_lane' };

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === 'NODE_LANE_NOT_FOUND')).toBe(true);
  });

  it('detects edge node references that do not exist', () => {
    const graph = createValidGraph();
    graph.edges[0] = { ...graph.edges[0]!, toNodeId: 'missing_node' };

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === 'EDGE_TO_NOT_FOUND')).toBe(true);
  });

  it('detects decision nodes with fewer than 2 outgoing edges', () => {
    const graph = createValidGraph();
    graph.edges = graph.edges.filter((edge) => edge.id !== 'e_review_reject');

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === 'DECISION_OUT_EDGE_TOO_FEW')).toBe(true);
  });
});

function createValidGraph(): Graph {
  return {
    graphId: 'validator_test_graph',
    title: 'Validator Test Graph',
    direction: 'LR',
    lanes: [
      { id: 'user', title: '用户' },
      { id: 'system', title: '系统' }
    ],
    nodes: [
      { id: 'start', type: 'start', text: '开始', laneId: 'user' },
      { id: 'submit', type: 'process', text: '提交', laneId: 'user' },
      { id: 'review', type: 'decision', text: '是否通过', laneId: 'system' },
      { id: 'pass', type: 'end', text: '通过', laneId: 'system' },
      { id: 'reject', type: 'end', text: '拒绝', laneId: 'system' }
    ],
    edges: [
      { id: 'e_start_submit', fromNodeId: 'start', toNodeId: 'submit', pathType: 'main' },
      { id: 'e_submit_review', fromNodeId: 'submit', toNodeId: 'review', pathType: 'main' },
      { id: 'e_review_pass', fromNodeId: 'review', toNodeId: 'pass', label: '通过', pathType: 'main' },
      { id: 'e_review_reject', fromNodeId: 'review', toNodeId: 'reject', label: '拒绝', pathType: 'exception' }
    ]
  };
}
