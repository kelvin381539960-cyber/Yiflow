import { describe, expect, it } from 'vitest';
import { createEmptyGraph, YIFLOW_VERSION } from '../packages/core/src/index.js';
import { layoutGraphPlaceholder } from '../packages/layout/src/index.js';
import { renderSvgPlaceholder } from '../packages/renderer/src/index.js';
import { validateGraph } from '../packages/validator/src/index.js';

describe('Yiflow smoke test', () => {
  it('creates an empty graph with the current version', () => {
    const graph = createEmptyGraph('smoke_graph');

    expect(YIFLOW_VERSION).toBe('0.1.0');
    expect(graph.graphId).toBe('smoke_graph');
    expect(graph.direction).toBe('LR');
  });

  it('runs validation, placeholder layout, and placeholder rendering', () => {
    const graph = createEmptyGraph('smoke_graph');
    const validation = validateGraph(graph);
    const layout = layoutGraphPlaceholder(graph);
    const svg = renderSvgPlaceholder(graph, layout);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(layout.warnings.length).toBeGreaterThan(0);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Yiflow SVG placeholder');
  });
});
