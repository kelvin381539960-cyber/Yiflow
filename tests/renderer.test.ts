import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseSwimflow } from '../packages/parser/src/index.js';
import { layoutGraph } from '../packages/layout/src/index.js';
import { renderSvg } from '../packages/renderer/src/index.js';
import type { Graph } from '../packages/core/src/index.js';

describe('renderSvg', () => {
  it('renders lanes, nodes, edges, and labels into SVG', async () => {
    const graph = await parseExample('examples/approval-flow.swimflow.yaml');
    const layout = layoutGraph(graph);
    const svg = renderSvg(graph, layout);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('标准审批流程示例');
    expect(svg).toContain('data-yiflow-lane-id="applicant"');
    expect(svg).toContain('data-yiflow-node-id="submit_request"');
    expect(svg).toContain('data-yiflow-edge-id="e_start_submit"');
    expect(svg).toContain('marker-end="url(#yiflow-arrow)"');
  });

  it('escapes XML special characters in graph and node text', () => {
    const graph: Graph = {
      graphId: 'escape_test',
      title: 'A&B <Flow>',
      direction: 'LR',
      lanes: [{ id: 'lane', title: 'Lane <1>' }],
      nodes: [
        { id: 'start', type: 'start', text: 'Start & Go', laneId: 'lane' },
        { id: 'end', type: 'end', text: 'End <Done>', laneId: 'lane' }
      ],
      edges: [{ id: 'e_start_end', fromNodeId: 'start', toNodeId: 'end', label: 'A > B', pathType: 'main' }]
    };

    const layout = layoutGraph(graph);
    const svg = renderSvg(graph, layout);

    expect(svg).toContain('A&amp;B &lt;Flow&gt;');
    expect(svg).toContain('Lane &lt;1&gt;');
    expect(svg).toContain('Start &amp; Go');
    expect(svg).toContain('End &lt;Done&gt;');
    expect(svg).toContain('A &gt; B');
  });
});

async function parseExample(path: string): Promise<Graph> {
  const source = await readFile(path, 'utf8');
  const parsed = parseSwimflow(source);

  expect(parsed.errors).toEqual([]);
  expect(parsed.graph).toBeDefined();

  return parsed.graph as Graph;
}
