export const YIFLOW_VERSION = '0.1.0';

export type NodeType = 'start' | 'end' | 'process' | 'decision' | 'external_ref';

export type PathType = 'main' | 'secondary' | 'exception' | 'return';

export interface Lane {
  id: string;
  title: string;
  description?: string;
  order?: number;
  metadata?: Record<string, unknown>;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  text: string;
  laneId: string;
  description?: string;
  locked?: boolean;
  metadata?: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  pathType: PathType;
  metadata?: Record<string, unknown>;
}

export interface Graph {
  graphId: string;
  title: string;
  description?: string;
  version?: string;
  direction: 'LR';
  metadata?: Record<string, unknown>;
  lanes: Lane[];
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function createEmptyGraph(graphId = 'empty_graph'): Graph {
  return {
    graphId,
    title: 'Empty Graph',
    direction: 'LR',
    lanes: [],
    nodes: [],
    edges: []
  };
}
