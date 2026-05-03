import { createEmptyGraph, type Graph } from '../../core/src/index.js';

export interface ParseResult {
  graph: Graph;
  warnings: string[];
}

export function parseSwimflowPlaceholder(source: string): ParseResult {
  return {
    graph: createEmptyGraph(source.length > 0 ? 'parsed_placeholder' : 'empty_input'),
    warnings: ['Parser v0.1 is not implemented yet. This placeholder exists for YF-P3-001 only.']
  };
}
