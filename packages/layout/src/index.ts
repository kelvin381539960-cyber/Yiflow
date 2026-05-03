import type { Graph } from '../../core/src/index.js';

export interface Point {
  x: number;
  y: number;
}

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  nodePositions: Record<string, NodePosition>;
  edgeRoutes: Record<string, Point[]>;
  warnings: string[];
}

export function layoutGraphPlaceholder(graph: Graph): LayoutResult {
  return {
    nodePositions: Object.fromEntries(
      graph.nodes.map((node, index) => [
        node.id,
        {
          x: index * 180,
          y: 0,
          width: 140,
          height: 56
        }
      ])
    ),
    edgeRoutes: {},
    warnings: ['Layout v0.1 is not implemented yet. This placeholder exists for YF-P3-001 only.']
  };
}
