import type { FlowEdge, FlowNode, Graph, Lane, PathType } from '../../core/src/index.js';
import type { EdgeRoute, LaneBounds, LayoutResult, NodePosition, Point } from '../../layout/src/index.js';

export interface RenderSvgOptions {
  title?: string;
  showWarnings?: boolean;
}

const NODE_RX = 8;
const FONT_FAMILY = 'Arial, sans-serif';
const LANE_TITLE_WIDTH = 132;
const EDGE_MARKER_ID = 'yiflow-arrow';

export function renderSvg(graph: Graph, layout: LayoutResult, options: RenderSvgOptions = {}): string {
  const bounds = calculateSvgBounds(layout);
  const title = options.title ?? graph.title;

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}" role="img" aria-label="${escapeXml(title)}">`,
    renderDefs(),
    renderBackground(bounds.width, bounds.height),
    renderTitle(title),
    ...graph.lanes.map((lane) => renderLane(lane, layout.laneBounds[lane.id])),
    ...graph.edges.map((edge) => renderEdge(edge, layout.edgeRoutes[edge.id])),
    ...graph.nodes.map((node) => renderNode(node, layout.nodePositions[node.id])),
    ...(options.showWarnings ? renderWarnings(layout.warnings, bounds.height) : []),
    '</svg>'
  ];

  return parts.filter(Boolean).join('\n');
}

export function renderSvgPlaceholder(graph: Graph, layout: LayoutResult): string {
  return renderSvg(graph, layout);
}

function calculateSvgBounds(layout: LayoutResult): { width: number; height: number } {
  const laneBounds = Object.values(layout.laneBounds);
  const nodePositions = Object.values(layout.nodePositions);

  const maxX = Math.max(
    640,
    ...laneBounds.map((lane) => lane.x + lane.width),
    ...nodePositions.map((node) => node.x + node.width)
  );

  const maxY = Math.max(
    240,
    ...laneBounds.map((lane) => lane.y + lane.height),
    ...nodePositions.map((node) => node.y + node.height)
  );

  return {
    width: Math.ceil(maxX + 48),
    height: Math.ceil(maxY + 72)
  };
}

function renderDefs(): string {
  return [
    '<defs>',
    `  <marker id="${EDGE_MARKER_ID}" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">`,
    '    <path d="M0,0 L0,6 L9,3 z" fill="#344054" />',
    '  </marker>',
    '</defs>'
  ].join('\n');
}

function renderBackground(width: number, height: number): string {
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />`;
}

function renderTitle(title: string): string {
  return `<text x="24" y="32" font-family="${FONT_FAMILY}" font-size="18" font-weight="700" fill="#101828">${escapeXml(title)}</text>`;
}

function renderLane(lane: Lane, bounds?: LaneBounds): string {
  if (!bounds) {
    return '';
  }

  return [
    `<g data-yiflow-lane-id="${escapeXml(lane.id)}">`,
    `  <rect x="${bounds.x + 16}" y="${bounds.y + 48}" width="${bounds.width}" height="${bounds.height}" rx="10" fill="#f9fafb" stroke="#d0d5dd" />`,
    `  <rect x="${bounds.x + 16}" y="${bounds.y + 48}" width="${LANE_TITLE_WIDTH}" height="${bounds.height}" rx="10" fill="#f2f4f7" stroke="#d0d5dd" />`,
    `  <text x="${bounds.x + 32}" y="${bounds.y + 82}" font-family="${FONT_FAMILY}" font-size="14" font-weight="700" fill="#344054">${escapeXml(lane.title)}</text>`,
    '</g>'
  ].join('\n');
}

function renderNode(node: FlowNode, position?: NodePosition): string {
  if (!position) {
    return '';
  }

  const style = nodeStyle(node.type);
  const centerX = position.x + position.width / 2;
  const centerY = position.y + position.height / 2;

  const shape = node.type === 'decision'
    ? renderDecisionShape(position, style)
    : renderRectNode(position, style);

  return [
    `<g data-yiflow-node-id="${escapeXml(node.id)}">`,
    `  ${shape}`,
    `  <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="13" font-weight="600" fill="${style.text}">${escapeXml(node.text)}</text>`,
    '</g>'
  ].join('\n');
}

function renderRectNode(position: NodePosition, style: NodeStyle): string {
  return `<rect x="${position.x}" y="${position.y}" width="${position.width}" height="${position.height}" rx="${NODE_RX}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5" />`;
}

function renderDecisionShape(position: NodePosition, style: NodeStyle): string {
  const cx = position.x + position.width / 2;
  const cy = position.y + position.height / 2;
  const points = [
    `${cx},${position.y}`,
    `${position.x + position.width},${cy}`,
    `${cx},${position.y + position.height}`,
    `${position.x},${cy}`
  ].join(' ');

  return `<polygon points="${points}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5" />`;
}

function renderEdge(edge: FlowEdge, route?: EdgeRoute): string {
  if (!route || route.points.length < 2) {
    return '';
  }

  const pathData = pointsToPath(route.points);
  const style = edgeStyle(edge.pathType);
  const label = edge.label && route.labelPosition
    ? `  <text x="${route.labelPosition.x}" y="${route.labelPosition.y - 6}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="12" fill="#344054">${escapeXml(edge.label)}</text>`
    : '';

  return [
    `<g data-yiflow-edge-id="${escapeXml(edge.id)}">`,
    `  <path d="${pathData}" fill="none" stroke="${style.stroke}" stroke-width="${style.width}" stroke-dasharray="${style.dasharray}" marker-end="url(#${EDGE_MARKER_ID})" />`,
    label,
    '</g>'
  ].filter(Boolean).join('\n');
}

function pointsToPath(points: Point[]): string {
  const [first, ...rest] = points;
  if (!first) {
    return '';
  }

  return [`M ${first.x} ${first.y}`, ...rest.map((point) => `L ${point.x} ${point.y}`)].join(' ');
}

function renderWarnings(warnings: string[], height: number): string[] {
  if (warnings.length === 0) {
    return [];
  }

  return [
    `<text x="24" y="${height - 24}" font-family="${FONT_FAMILY}" font-size="12" fill="#b54708">Warnings: ${escapeXml(warnings.join(', '))}</text>`
  ];
}

interface NodeStyle {
  fill: string;
  stroke: string;
  text: string;
}

function nodeStyle(type: FlowNode['type']): NodeStyle {
  switch (type) {
    case 'start':
      return { fill: '#ecfdf3', stroke: '#12b76a', text: '#027a48' };
    case 'end':
      return { fill: '#fef3f2', stroke: '#f04438', text: '#b42318' };
    case 'decision':
      return { fill: '#fffaeb', stroke: '#f79009', text: '#93370d' };
    case 'external_ref':
      return { fill: '#eef4ff', stroke: '#6172f3', text: '#3538cd' };
    case 'process':
      return { fill: '#f2f4f7', stroke: '#667085', text: '#344054' };
  }
}

function edgeStyle(pathType: PathType): { stroke: string; width: number; dasharray: string } {
  switch (pathType) {
    case 'main':
      return { stroke: '#344054', width: 2, dasharray: '0' };
    case 'secondary':
      return { stroke: '#667085', width: 1.5, dasharray: '6 4' };
    case 'exception':
      return { stroke: '#d92d20', width: 1.5, dasharray: '4 4' };
    case 'return':
      return { stroke: '#7a5af8', width: 1.5, dasharray: '8 4' };
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
