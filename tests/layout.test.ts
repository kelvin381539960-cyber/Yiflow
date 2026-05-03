import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseSwimflow } from '../packages/parser/src/index.js';
import { layoutGraph } from '../packages/layout/src/index.js';
import type { Graph } from '../packages/core/src/index.js';

describe('layoutGraph', () => {
  it('positions nodes by lane and main path rank', async () => {
    const graph = await parseExample('examples/approval-flow.swimflow.yaml');
    const layout = layoutGraph(graph);

    const start = layout.nodePositions.start;
    const submit = layout.nodePositions.submit_request;
    const validate = layout.nodePositions.validate_request;

    expect(start).toBeDefined();
    expect(submit).toBeDefined();
    expect(validate).toBeDefined();
    expect(submit!.x).toBeGreaterThan(start!.x);
    expect(validate!.x).toBeGreaterThan(submit!.x);
  });

  it('creates lane bounds with increasing y positions', async () => {
    const graph = await parseExample('examples/human-system-flow.swimflow.yaml');
    const layout = layoutGraph(graph);

    const userLane = layout.laneBounds.user;
    const frontendLane = layout.laneBounds.frontend;
    const backendLane = layout.laneBounds.backend;

    expect(userLane).toBeDefined();
    expect(frontendLane).toBeDefined();
    expect(backendLane).toBeDefined();
    expect(frontendLane!.y).toBeGreaterThan(userLane!.y);
    expect(backendLane!.y).toBeGreaterThan(frontendLane!.y);
  });

  it('routes return edges through a lower channel', async () => {
    const graph = await parseExample('examples/exception-return-flow.swimflow.yaml');
    const layout = layoutGraph(graph);
    const returnEdge = graph.edges.find((edge) => edge.pathType === 'return');

    expect(returnEdge).toBeDefined();

    const route = layout.edgeRoutes[returnEdge!.id];
    const from = layout.nodePositions[returnEdge!.fromNodeId];
    const to = layout.nodePositions[returnEdge!.toNodeId];

    expect(route).toBeDefined();
    expect(route!.routeType).toBe('return');
    expect(route!.points.length).toBe(4);

    const channelY = route!.points[1]!.y;
    expect(channelY).toBeGreaterThan(from!.y + from!.height);
    expect(channelY).toBeGreaterThan(to!.y + to!.height);
  });
});

async function parseExample(path: string): Promise<Graph> {
  const source = await readFile(path, 'utf8');
  const parsed = parseSwimflow(source);

  expect(parsed.errors).toEqual([]);
  expect(parsed.graph).toBeDefined();

  return parsed.graph as Graph;
}
