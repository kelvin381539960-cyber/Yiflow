#!/usr/bin/env node

import { YIFLOW_VERSION, createEmptyGraph } from '../../core/src/index.js';
import { layoutGraphPlaceholder } from '../../layout/src/index.js';
import { renderSvgPlaceholder } from '../../renderer/src/index.js';
import { validateGraphPlaceholder } from '../../validator/src/index.js';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

function printHelp(): void {
  console.log(`Yiflow CLI ${YIFLOW_VERSION}\n\nUsage:\n  yiflow validate <file>\n  yiflow render <file> -o <output.svg>\n  yiflow inspect <file>\n  yiflow apply-op <file> <op.json>\n  yiflow version\n  yiflow help\n\nNote:\n  YF-P3-001 only provides the CLI skeleton. Parser, validator, layout, renderer, and apply-op behavior are implemented in later tasks.`);
}

function run(): number {
  switch (command) {
    case 'version':
    case '--version':
    case '-v': {
      console.log(`Yiflow CLI ${YIFLOW_VERSION}`);
      return 0;
    }

    case 'help':
    case '--help':
    case '-h': {
      printHelp();
      return 0;
    }

    case 'validate': {
      const graph = createEmptyGraph('cli_validate_placeholder');
      const result = validateGraphPlaceholder(graph);
      console.log(`Yiflow validate\nStatus: ${result.valid ? 'valid' : 'invalid'}\nWarnings: ${result.warnings.length}`);
      return result.valid ? 0 : 1;
    }

    case 'inspect': {
      const graph = createEmptyGraph('cli_inspect_placeholder');
      console.log(`Yiflow inspect\nGraph: ${graph.graphId}\nNodes: ${graph.nodes.length}\nEdges: ${graph.edges.length}\nLanes: ${graph.lanes.length}`);
      return 0;
    }

    case 'render': {
      const graph = createEmptyGraph('cli_render_placeholder');
      const layout = layoutGraphPlaceholder(graph);
      const svg = renderSvgPlaceholder(graph, layout);
      console.log(svg);
      return 0;
    }

    case 'apply-op': {
      console.log('Yiflow apply-op\nStatus: not implemented yet. Skeleton command is available for YF-P3-001.');
      return 0;
    }

    default: {
      console.error(`Unknown command: ${command}`);
      printHelp();
      return 2;
    }
  }
}

process.exitCode = run();
