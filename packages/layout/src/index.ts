import type { FlowEdge, FlowNode, Graph, PathType } from '../../core/src/index.js';

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

export interface EdgeRoute {
  points: Point[];
  labelPosition?: Point;
  routeType: PathType;
}

export interface LaneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  nodePositions: Record<string, NodePosition>;
  edgeRoutes: Record<string, EdgeRoute>;
  laneBounds: Record<string, LaneBounds>;
  warnings: string[];
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 56;
const EXTERNAL_NODE_WIDTH = 160;
const RANK_GAP = 220;
const LANE_GAP = 48;
const LANE_PADDING_X = 48;
const LANE_PADDING_Y = 64;
const COLLISION_GAP_Y = 24;
const RETURN_CHANNEL_OFFSET = 48;

export function layoutGraph(graph: Graph): LayoutResult {
  const warnings: string[] = [];
  const rankByNodeId = assignRanks(graph, warnings);
  const laneIndexById = new Map(graph.lanes.map((lane, index) => [lane.id, index]));
  const nodePositions: Record<string, NodePosition> = {};

  const groupedByLaneAndRank = new Map<string, FlowNode[]>();

  for (const node of graph.nodes) {
    const rank = rankByNodeId.get(node.id) ?? 0;
    const key = `${node.laneId}::${rank}`;
    const group = groupedByLaneAndRank.get(key) ?? [];
    group.push(node);
    groupedByLaneAndRank.set(key, group);
  }

  const laneHeights = calculateLaneHeights(graph, groupedByLaneAndRank);
  const laneTopById = new Map<string, number>();
  let currentY = 0;

  for (const lane of graph.lanes) {
    laneTopById.set(lane.id, currentY);
    currentY += (laneHeights.get(lane.id) ?? defaultLaneHeight()) + LANE_GAP;
  }

  const collisionIndexByKey = new Map<string, number>();

  for (const node of graph.nodes) {
    const rank = rankByNodeId.get(node.id) ?? 0;
    const key = `${node.laneId}::${rank}`;
    const collisionIndex = collisionIndexByKey.get(key) ?? 0;
    collisionIndexByKey.set(key, collisionIndex + 1);

    const laneIndex = laneIndexById.get(node.laneId);
    if (laneIndex === undefined) {
      warnings.push(`NODE_LANE_NOT_FOUND:${node.id}:${node.laneId}`);
    }

    const laneTop = laneTopById.get(node.laneId) ?? 0;
    const width = node.type === 'external_ref' ? EXTERNAL_NODE_WIDTH : NODE_WIDTH;

    nodePositions[node.id] = {
      x: LANE_PADDING_X + rank * RANK_GAP,
      y: laneTop + LANE_PADDING_Y + collisionIndex * (NODE_HEIGHT + COLLISION_GAP_Y),
      width,
      height: NODE_HEIGHT
    };
  }

  const maxRank = Math.max(0, ...Array.from(rankByNodeId.values()));
  const laneBounds = buildLaneBounds(graph, laneTopById, laneHeights, maxRank);
  const edgeRoutes = routeEdges(graph.edges, nodePositions);

  return {
    nodePositions,
    edgeRoutes,
    laneBounds,
    warnings
  };
}

export function layoutGraphPlaceholder(graph: Graph): LayoutResult {
  return layoutGraph(graph);
}

function assignRanks(graph: Graph, warnings: string[]): Map<string, number> {
  const rankByNodeId = new Map<string, number>();
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const nonReturnEdges = graph.edges.filter((edge) => edge.pathType !== 'return');
  const startNodes = graph.nodes.filter((node) => node.type === 'start');

  if (startNodes.length === 0) {
    warnings.push('START_NODE_NOT_FOUND');
  }

  for (const startNode of startNodes) {
    rankByNodeId.set(startNode.id, 0);
  }

  let changed = true;
  let iteration = 0;
  const maxIterations = Math.max(1, graph.nodes.length * Math.max(1, nonReturnEdges.length));

  while (changed && iteration < maxIterations) {
    changed = false;
    iteration += 1;

    for (const edge of sortEdgesForRanking(nonReturnEdges)) {
      if (!nodesById.has(edge.fromNodeId) || !nodesById.has(edge.toNodeId)) {
        continue;
      }

      const fromRank = rankByNodeId.get(edge.fromNodeId);
      if (fromRank === undefined) {
        continue;
      }

      const nextRank = fromRank + 1;
      const currentToRank = rankByNodeId.get(edge.toNodeId);

      if (currentToRank === undefined || nextRank > currentToRank) {
        rankByNodeId.set(edge.toNodeId, nextRank);
        changed = true;
      }
    }
  }

  if (iteration >= maxIterations && changed) {
    warnings.push('RANK_ASSIGNMENT_MAX_ITERATIONS_REACHED');
  }

  let fallbackRank = Math.max(0, ...Array.from(rankByNodeId.values())) + 1;
  for (const node of graph.nodes) {
    if (!rankByNodeId.has(node.id)) {
      rankByNodeId.set(node.id, fallbackRank);
      fallbackRank += 1;
      warnings.push(`NODE_NOT_REACHABLE_FROM_START:${node.id}`);
    }
  }

  return rankByNodeId;
}

function sortEdgesForRanking(edges: FlowEdge[]): FlowEdge[] {
  const priority: Record<PathType, number> = {
    main: 0,
    secondary: 1,
    exception: 2,
    return: 3
  };

  return [...edges].sort((a, b) => priority[a.pathType] - priority[b.pathType]);
}

function calculateLaneHeights(graph: Graph, groupedByLaneAndRank: Map<string, FlowNode[]>): Map<string, number> {
  const laneHeights = new Map<string, number>();

  for (const lane of graph.lanes) {
    let maxStack = 1;

    for (const [key, nodes] of groupedByLaneAndRank.entries()) {
      if (key.startsWith(`${lane.id}::`)) {
        maxStack = Math.max(maxStack, nodes.length);
      }
    }

    laneHeights.set(lane.id, LANE_PADDING_Y * 2 + maxStack * NODE_HEIGHT + Math.max(0, maxStack - 1) * COLLISION_GAP_Y);
  }

  return laneHeights;
}

function buildLaneBounds(graph: Graph, laneTopById: Map<string, number>, laneHeights: Map<string, number>, maxRank: number): Record<string, LaneBounds> {
  const laneBounds: Record<string, LaneBounds> = {};
  const width = LANE_PADDING_X * 2 + maxRank * RANK_GAP + EXTERNAL_NODE_WIDTH;

  for (const lane of graph.lanes) {
    laneBounds[lane.id] = {
      x: 0,
      y: laneTopById.get(lane.id) ?? 0,
      width,
      height: laneHeights.get(lane.id) ?? defaultLaneHeight()
    };
  }

  return laneBounds;
}

function routeEdges(edges: FlowEdge[], nodePositions: Record<string, NodePosition>): Record<string, EdgeRoute> {
  const routes: Record<string, EdgeRoute> = {};

  for (const edge of edges) {
    const from = nodePositions[edge.fromNodeId];
    const to = nodePositions[edge.toNodeId];

    if (!from || !to) {
      continue;
    }

    const fromPoint = {
      x: from.x + from.width,
      y: from.y + from.height / 2
    };
    const toPoint = {
      x: to.x,
      y: to.y + to.height / 2
    };

    if (edge.pathType === 'return') {
      const channelY = Math.max(from.y, to.y) + NODE_HEIGHT + RETURN_CHANNEL_OFFSET;
      routes[edge.id] = {
        routeType: edge.pathType,
        points: [fromPoint, { x: fromPoint.x, y: channelY }, { x: toPoint.x, y: channelY }, toPoint],
        labelPosition: midpoint({ x: fromPoint.x, y: channelY }, { x: toPoint.x, y: channelY })
      };
      continue;
    }

    const midX = (fromPoint.x + toPoint.x) / 2;
    routes[edge.id] = {
      routeType: edge.pathType,
      points: [fromPoint, { x: midX, y: fromPoint.y }, { x: midX, y: toPoint.y }, toPoint],
      labelPosition: midpoint({ x: midX, y: fromPoint.y }, { x: midX, y: toPoint.y })
    };
  }

  return routes;
}

function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}

function defaultLaneHeight(): number {
  return LANE_PADDING_Y * 2 + NODE_HEIGHT;
}
