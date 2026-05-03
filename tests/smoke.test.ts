import { describe, expect, it } from 'vitest';
import { YIFLOW_VERSION, type Graph } from '../packages/core/src/index.js';
import { layoutGraphPlaceholder } from '../packages/layout/src/index.js';
import { renderSvgPlaceholder } from '../packages/renderer/src/index.js';
import { validateGraph } from '../packages/validator/src/index.js';

describe('Yiflow smoke test', () => {
  it('exposes the current version', () => {
    expect(YIFLOW_VERSION).toBe('0.1.0');
  });

  it('runs validation, layout, and SVG rendering on a minimal valid graph', () => {
    const graph = createMinimalValidGraph();
    const validation = validateGraph(graph);
    const layout = layoutGraphPlaceholder(graph);
    const svg = renderSvgPlaceholder(graph, layout);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Smoke Graph');
  });
});

function createMinimalValidGraph(): Graph {
  return {
    graphId: 'smoke_graph',
    title: 'Smoke Graph',
    direction: 'LR',
    lanes: [{ id: 'user', title: '用户' }],
    nodes: [
      { id: 'start', type: 'start', text: '开始', laneId: 'user' },
      { id: 'end', type: 'end', text: '结束', laneId: 'user' }
    ],
    edges: [{ id: 'e_start_end', fromNodeId: 'start', toNodeId: 'end', pathType: 'main' }]
  };
}
