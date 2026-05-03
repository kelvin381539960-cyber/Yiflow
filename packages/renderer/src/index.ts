import type { Graph } from '../../core/src/index.js';
import type { LayoutResult } from '../../layout/src/index.js';

export function renderSvgPlaceholder(graph: Graph, _layout: LayoutResult): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">',
    '  <text x="24" y="40" font-family="Arial" font-size="18">Yiflow SVG placeholder</text>',
    `  <text x="24" y="72" font-family="Arial" font-size="14">${escapeXml(graph.title)}</text>`,
    '</svg>'
  ].join('\n');
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
