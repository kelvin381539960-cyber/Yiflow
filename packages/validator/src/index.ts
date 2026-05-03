import type { FlowEdge, FlowNode, Graph, Lane } from '../../core/src/index.js';

export type ValidationIssueLevel = 'error' | 'warning';

export interface ValidationIssue {
  code: string;
  message: string;
  target?: string;
  level?: ValidationIssueLevel;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function validateGraph(graph: Graph): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const laneIds = collectDuplicateIds(graph.lanes, 'lane', errors);
  const nodeIds = collectDuplicateIds(graph.nodes, 'node', errors);
  collectDuplicateIds(graph.edges, 'edge', errors);

  validateNodeLaneReferences(graph.nodes, laneIds, errors);
  validateEdgeNodeReferences(graph.edges, nodeIds, errors);
  validateDecisionOutgoingEdges(graph.nodes, graph.edges, errors);
  validateStartAndEndEdges(graph.nodes, graph.edges, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateGraphPlaceholder(graph: Graph): ValidationResult {
  return validateGraph(graph);
}

function collectDuplicateIds<T extends Lane | FlowNode | FlowEdge>(items: T[], kind: 'lane' | 'node' | 'edge', errors: ValidationIssue[]): Set<string> {
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      duplicateIds.add(item.id);
    }
    ids.add(item.id);
  }

  for (const id of duplicateIds) {
    errors.push({
      code: duplicateCodeFor(kind),
      message: `Duplicate ${kind} id: ${id}.`,
      target: `${kind}:${id}`,
      level: 'error'
    });
  }

  return ids;
}

function validateNodeLaneReferences(nodes: FlowNode[], laneIds: Set<string>, errors: ValidationIssue[]): void {
  for (const node of nodes) {
    if (!laneIds.has(node.laneId)) {
      errors.push({
        code: 'NODE_LANE_NOT_FOUND',
        message: `Node ${node.id} references missing lane ${node.laneId}.`,
        target: `node:${node.id}`,
        level: 'error'
      });
    }
  }
}

function validateEdgeNodeReferences(edges: FlowEdge[], nodeIds: Set<string>, errors: ValidationIssue[]): void {
  for (const edge of edges) {
    if (!nodeIds.has(edge.fromNodeId)) {
      errors.push({
        code: 'EDGE_FROM_NOT_FOUND',
        message: `Edge ${edge.id} references missing from node ${edge.fromNodeId}.`,
        target: `edge:${edge.id}`,
        level: 'error'
      });
    }

    if (!nodeIds.has(edge.toNodeId)) {
      errors.push({
        code: 'EDGE_TO_NOT_FOUND',
        message: `Edge ${edge.id} references missing to node ${edge.toNodeId}.`,
        target: `edge:${edge.id}`,
        level: 'error'
      });
    }
  }
}

function validateDecisionOutgoingEdges(nodes: FlowNode[], edges: FlowEdge[], errors: ValidationIssue[]): void {
  const outgoingCount = new Map<string, number>();

  for (const edge of edges) {
    outgoingCount.set(edge.fromNodeId, (outgoingCount.get(edge.fromNodeId) ?? 0) + 1);
  }

  for (const node of nodes) {
    if (node.type === 'decision' && (outgoingCount.get(node.id) ?? 0) < 2) {
      errors.push({
        code: 'DECISION_OUT_EDGE_TOO_FEW',
        message: `Decision node ${node.id} must have at least 2 outgoing edges.`,
        target: `node:${node.id}`,
        level: 'error'
      });
    }
  }
}

function validateStartAndEndEdges(nodes: FlowNode[], edges: FlowEdge[], warnings: ValidationIssue[]): void {
  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();

  for (const edge of edges) {
    incomingCount.set(edge.toNodeId, (incomingCount.get(edge.toNodeId) ?? 0) + 1);
    outgoingCount.set(edge.fromNodeId, (outgoingCount.get(edge.fromNodeId) ?? 0) + 1);
  }

  for (const node of nodes) {
    if (node.type === 'start' && (incomingCount.get(node.id) ?? 0) > 0) {
      warnings.push({
        code: 'START_NODE_HAS_INCOMING_EDGE',
        message: `Start node ${node.id} should not have incoming edges.`,
        target: `node:${node.id}`,
        level: 'warning'
      });
    }

    if (node.type === 'end' && (outgoingCount.get(node.id) ?? 0) > 0) {
      warnings.push({
        code: 'END_NODE_HAS_OUTGOING_EDGE',
        message: `End node ${node.id} should not have outgoing edges.`,
        target: `node:${node.id}`,
        level: 'warning'
      });
    }
  }
}

function duplicateCodeFor(kind: 'lane' | 'node' | 'edge'): string {
  switch (kind) {
    case 'lane':
      return 'DUPLICATE_LANE_ID';
    case 'node':
      return 'DUPLICATE_NODE_ID';
    case 'edge':
      return 'DUPLICATE_EDGE_ID';
  }
}
