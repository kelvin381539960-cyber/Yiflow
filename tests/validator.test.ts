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

  it('rejects an empty graph', () => {
    const result = validateGraph({
      graphId: 'empty_graph',
      title: 'Empty Graph',
      direction: 'LR',
      lanes: [],
      nodes: [],
      edges: []
    });

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toEqual(expect.arrayContaining(['LANE_REQUIRED', 'NODE_REQUIRED', 'START_NODE_REQUIRED', 'END_NODE_REQUIRED']));
  });

  it('rejects a graph without lanes', () => {
    const graph = createValidGraph();
    graph.lanes = [];

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('LANE_REQUIRED');
  });

  it('rejects a graph without nodes', () => {
    const graph = createValidGraph();
    graph.nodes = [];
    graph.edges = [];

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toEqual(expect.arrayContaining(['NODE_REQUIRED', 'START_NODE_REQUIRED', 'END_NODE_REQUIRED']));
  });

  it('rejects a graph without start node', () => {
    const graph = createValidGraph();
    graph.nodes = graph.nodes.filter((node) => node.type !== 'start');
    graph.edges = graph.edges.filter((edge) => edge.fromNodeId !== 'start' && edge.toNodeId !== 'start');

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('START_NODE_REQUIRED');
  });

  it('rejects a graph without end node', () => {
    const graph = createValidGraph();
    graph.nodes = graph.nodes.filter((node) => node.type !== 'end');
    graph.edges = graph.edges.filter((edge) => !['pass', 'reject'].includes(edge.fromNodeId) && !['pass', 'reject'].includes(edge.toNodeId));

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('END_NODE_REQUIRED');
  });

  it('detects duplicate lane ids', () => {
    const graph = createValidGraph();
    graph.lanes.push({ ...graph.lanes[0]!, title: 'Duplicate lane' });

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('DUPLICATE_LANE_ID');
  });

  it('detects duplicate node ids', () => {
    const graph = createValidGraph();
    graph.nodes.push({ ...graph.nodes[0]!, text: 'Duplicate start' });

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('DUPLICATE_NODE_ID');
  });

  it('detects duplicate edge ids', () => {
    const graph = createValidGraph();
    graph.edges.push({ ...graph.edges[0]!, toNodeId: 'review' });

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('DUPLICATE_EDGE_ID');
  });

  it('detects node lane references that do not exist', () => {
    const graph = createValidGraph();
    graph.nodes[0] = { ...graph.nodes[0]!, laneId: 'missing_lane' };

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('NODE_LANE_NOT_FOUND');
  });

  it('detects missing edge from references', () => {
    const graph = createValidGraph();
    graph.edges[0] = { ...graph.edges[0]!, fromNodeId: 'missing_node' };

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('EDGE_FROM_NOT_FOUND');
  });

  it('detects missing edge to references', () => {
    const graph = createValidGraph();
    graph.edges[0] = { ...graph.edges[0]!, toNodeId: 'missing_node' };

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('EDGE_TO_NOT_FOUND');
  });

  it('detects decision nodes with fewer than 2 outgoing edges', () => {
    const graph = createValidGraph();
    graph.edges = graph.edges.filter((edge) => edge.id !== 'e_review_reject');

    const result = validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(errorCodes(result)).toContain('DECISION_OUT_EDGE_TOO_FEW');
  });

  it('warns when a start node has incoming edges', () => {
    const graph = createValidGraph();
    graph.edges.push({ id: 'e_reject_start', fromNodeId: 'reject', toNodeId: 'start', pathType: 'return' });

    const result = validateGraph(graph);

    expect(result.warnings.some((warning) => warning.code === 'START_NODE_HAS_INCOMING_EDGE')).toBe(true);
  });

  it('warns when an end node has outgoing edges', () => {
    const graph = createValidGraph();
    graph.edges.push({ id: 'e_pass_submit', fromNodeId: 'pass', toNodeId: 'submit', pathType: 'return' });

    const result = validateGraph(graph);

    expect(result.warnings.some((warning) => warning.code === 'END_NODE_HAS_OUTGOING_EDGE')).toBe(true);
  });
});

function errorCodes(result: ReturnType<typeof validateGraph>): string[] {
  return result.errors.map((error) => error.code);
}

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
