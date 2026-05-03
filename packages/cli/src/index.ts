#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { YIFLOW_VERSION, type Graph } from '../../core/src/index.js';
import { layoutGraph } from '../../layout/src/index.js';
import { parseSwimflowFile, type ParseResult } from '../../parser/src/index.js';
import { renderSvg } from '../../renderer/src/index.js';
import { validateGraph, type ValidationResult } from '../../validator/src/index.js';

export interface CliIo {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
  writeFile: (filePath: string, content: string) => Promise<void>;
}

const defaultIo: CliIo = {
  stdout: (message) => console.log(message),
  stderr: (message) => console.error(message),
  writeFile
};

export async function runCli(args: string[] = process.argv.slice(2), io: CliIo = defaultIo): Promise<number> {
  const command = args[0] ?? 'help';

  switch (command) {
    case 'version':
    case '--version':
    case '-v': {
      io.stdout(`Yiflow CLI ${YIFLOW_VERSION}`);
      return 0;
    }

    case 'help':
    case '--help':
    case '-h': {
      io.stdout(helpText());
      return 0;
    }

    case 'validate': {
      return runValidate(args.slice(1), io);
    }

    case 'inspect': {
      return runInspect(args.slice(1), io);
    }

    case 'render': {
      return runRender(args.slice(1), io);
    }

    case 'apply-op': {
      io.stdout('Yiflow apply-op\nStatus: not implemented yet.');
      return 0;
    }

    default: {
      io.stderr(`Unknown command: ${command}`);
      io.stdout(helpText());
      return 2;
    }
  }
}

async function runValidate(args: string[], io: CliIo): Promise<number> {
  const filePath = args[0];
  if (!filePath) {
    io.stderr('Missing input file. Usage: yiflow validate <file>');
    return 2;
  }

  const parsed = await parseSwimflowFile(filePath);
  const graph = getGraphOrPrintParseErrors(parsed, filePath, io);
  if (!graph) {
    return 1;
  }

  const validation = validateGraph(graph);
  printValidationResult(filePath, graph, validation, io);

  return validation.valid ? 0 : 1;
}

async function runInspect(args: string[], io: CliIo): Promise<number> {
  const filePath = args[0];
  if (!filePath) {
    io.stderr('Missing input file. Usage: yiflow inspect <file>');
    return 2;
  }

  const parsed = await parseSwimflowFile(filePath);
  const graph = getGraphOrPrintParseErrors(parsed, filePath, io);
  if (!graph) {
    return 1;
  }

  io.stdout([
    'Yiflow inspect',
    `File: ${filePath}`,
    `Graph: ${graph.graphId}`,
    `Title: ${graph.title}`,
    `Direction: ${graph.direction}`,
    `Lanes: ${graph.lanes.length}`,
    `Nodes: ${graph.nodes.length}`,
    `Edges: ${graph.edges.length}`,
    `Main edges: ${graph.edges.filter((edge) => edge.pathType === 'main').length}`,
    `Return edges: ${graph.edges.filter((edge) => edge.pathType === 'return').length}`
  ].join('\n'));

  return 0;
}

async function runRender(args: string[], io: CliIo): Promise<number> {
  const filePath = args[0];
  const outputPath = readOutputPath(args);

  if (!filePath) {
    io.stderr('Missing input file. Usage: yiflow render <file> -o <output.svg>');
    return 2;
  }

  if (!outputPath) {
    io.stderr('Missing output file. Usage: yiflow render <file> -o <output.svg>');
    return 2;
  }

  const parsed = await parseSwimflowFile(filePath);
  const graph = getGraphOrPrintParseErrors(parsed, filePath, io);
  if (!graph) {
    return 1;
  }

  const validation = validateGraph(graph);
  if (!validation.valid) {
    printValidationResult(filePath, graph, validation, io);
    return 1;
  }

  const layout = layoutGraph(graph);
  const svg = renderSvg(graph, layout);
  await io.writeFile(outputPath, svg);

  io.stdout([
    'Yiflow render',
    `Input: ${filePath}`,
    `Output: ${outputPath}`,
    'Status: success',
    `Nodes: ${graph.nodes.length}`,
    `Edges: ${graph.edges.length}`,
    `Lanes: ${graph.lanes.length}`
  ].join('\n'));

  return 0;
}

function getGraphOrPrintParseErrors(parsed: ParseResult, filePath: string, io: CliIo): Graph | undefined {
  if (parsed.graph && parsed.errors.length === 0) {
    return parsed.graph;
  }

  io.stderr([
    'Yiflow parse',
    `File: ${filePath}`,
    'Status: invalid',
    '',
    'Errors:',
    ...parsed.errors.map((error) => `- ${error.code}: ${error.message}${error.path ? ` (${error.path})` : ''}`)
  ].join('\n'));

  return undefined;
}

function printValidationResult(filePath: string, graph: Graph, validation: ValidationResult, io: CliIo): void {
  const lines = [
    'Yiflow validate',
    `File: ${filePath}`,
    `Status: ${validation.valid ? 'valid' : 'invalid'}`,
    `Graph: ${graph.graphId}`,
    `Nodes: ${graph.nodes.length}`,
    `Edges: ${graph.edges.length}`,
    `Lanes: ${graph.lanes.length}`,
    `Warnings: ${validation.warnings.length}`
  ];

  if (validation.errors.length > 0) {
    lines.push('', 'Errors:', ...validation.errors.map((error) => `- ${error.code}: ${error.message}${error.target ? ` (${error.target})` : ''}`));
  }

  if (validation.warnings.length > 0) {
    lines.push('', 'Warnings:', ...validation.warnings.map((warning) => `- ${warning.code}: ${warning.message}${warning.target ? ` (${warning.target})` : ''}`));
  }

  io.stdout(lines.join('\n'));
}

function readOutputPath(args: string[]): string | undefined {
  const outputIndex = args.findIndex((arg) => arg === '-o' || arg === '--output');
  if (outputIndex < 0) {
    return undefined;
  }

  return args[outputIndex + 1];
}

function helpText(): string {
  return `Yiflow CLI ${YIFLOW_VERSION}\n\nUsage:\n  yiflow validate <file>\n  yiflow render <file> -o <output.svg>\n  yiflow inspect <file>\n  yiflow apply-op <file> <op.json>\n  yiflow version\n  yiflow help\n\nP0 scope:\n  validate: parse YAML and validate Graph AST\n  render: parse, validate, layout, and render SVG\n  inspect: print graph summary\n  apply-op: placeholder only`;
}

function isMainModule(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  runCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
