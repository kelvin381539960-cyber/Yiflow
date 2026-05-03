import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import type { Direction, FlowEdge, FlowNode, Graph, Lane, LayoutConfig, NodeType, PathType } from '../../core/src/index.js';

export interface ParseIssue {
  code: string;
  message: string;
  path?: string;
}

export interface ParseResult {
  graph?: Graph;
  errors: ParseIssue[];
  warnings: ParseIssue[];
}

type UnknownRecord = Record<string, unknown>;

const NODE_TYPES: ReadonlySet<string> = new Set(['start', 'end', 'process', 'decision', 'external_ref']);
const PATH_TYPES: ReadonlySet<string> = new Set(['main', 'secondary', 'exception', 'return']);

export async function parseSwimflowFile(filePath: string): Promise<ParseResult> {
  try {
    const source = await readFile(filePath, 'utf8');
    return parseSwimflow(source);
  } catch (error) {
    return {
      errors: [
        {
          code: 'FILE_READ_FAILED',
          message: error instanceof Error ? error.message : `Failed to read file: ${filePath}`
        }
      ],
      warnings: []
    };
  }
}

export function parseSwimflow(source: string): ParseResult {
  let document: unknown;

  try {
    document = parseYaml(source);
  } catch (error) {
    return {
      errors: [
        {
          code: 'YAML_PARSE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to parse YAML source.'
        }
      ],
      warnings: []
    };
  }

  const errors: ParseIssue[] = [];
  const warnings: ParseIssue[] = [];

  if (!isRecord(document)) {
    return {
      errors: [
        {
          code: 'ROOT_MUST_BE_OBJECT',
          message: 'SwimFlow document root must be an object.'
        }
      ],
      warnings
    };
  }

  const diagram = getRecord(document, 'diagram', errors, 'diagram');
  const lanesSource = getArray(document, 'lanes', errors, 'lanes');
  const nodesSource = getArray(document, 'nodes', errors, 'nodes');
  const edgesSource = getArray(document, 'edges', errors, 'edges');
  const layoutSource = getOptionalRecord(document, 'layout', errors, 'layout');

  if (!diagram || !lanesSource || !nodesSource || !edgesSource) {
    return { errors, warnings };
  }

  const graphId = getRequiredString(diagram, 'id', errors, 'diagram.id');
  const title = getRequiredString(diagram, 'title', errors, 'diagram.title');
  const direction = getOptionalDirection(diagram, errors);
  const description = getOptionalString(diagram, 'description', errors, 'diagram.description');
  const version = getOptionalString(diagram, 'version', errors, 'diagram.version');
  const metadata = getOptionalMetadata(diagram, 'metadata', errors, 'diagram.metadata');

  const lanes = parseLanes(lanesSource, errors);
  const nodes = parseNodes(nodesSource, errors);
  const edges = parseEdges(edgesSource, errors);
  const layoutConfig = layoutSource ? parseLayoutConfig(layoutSource, errors) : undefined;

  if (!graphId || !title) {
    return { errors, warnings };
  }

  if (errors.length > 0) {
    return { errors, warnings };
  }

  return {
    graph: {
      graphId,
      title,
      description,
      version,
      direction,
      metadata,
      lanes,
      nodes,
      edges,
      layoutConfig
    },
    errors,
    warnings
  };
}

function parseLanes(items: unknown[], errors: ParseIssue[]): Lane[] {
  return items.flatMap((item, index) => {
    const path = `lanes[${index}]`;
    if (!isRecord(item)) {
      errors.push({ code: 'LANE_MUST_BE_OBJECT', message: 'Lane must be an object.', path });
      return [];
    }

    const id = getRequiredString(item, 'id', errors, `${path}.id`);
    const title = getRequiredString(item, 'title', errors, `${path}.title`);
    const description = getOptionalString(item, 'description', errors, `${path}.description`);
    const order = getOptionalNumber(item, 'order', errors, `${path}.order`);
    const metadata = getOptionalMetadata(item, 'metadata', errors, `${path}.metadata`);

    if (!id || !title) {
      return [];
    }

    return [{ id, title, description, order, metadata }];
  });
}

function parseNodes(items: unknown[], errors: ParseIssue[]): FlowNode[] {
  return items.flatMap((item, index) => {
    const path = `nodes[${index}]`;
    if (!isRecord(item)) {
      errors.push({ code: 'NODE_MUST_BE_OBJECT', message: 'Node must be an object.', path });
      return [];
    }

    const id = getRequiredString(item, 'id', errors, `${path}.id`);
    const type = getRequiredEnum<NodeType>(item, 'type', NODE_TYPES, errors, `${path}.type`, 'INVALID_NODE_TYPE');
    const text = getRequiredString(item, 'text', errors, `${path}.text`);
    const laneId = getRequiredString(item, 'lane', errors, `${path}.lane`);
    const description = getOptionalString(item, 'description', errors, `${path}.description`);
    const locked = getOptionalBoolean(item, 'locked', errors, `${path}.locked`);
    const metadata = getOptionalMetadata(item, 'metadata', errors, `${path}.metadata`);

    if (!id || !type || !text || !laneId) {
      return [];
    }

    return [{ id, type, text, laneId, description, locked, metadata }];
  });
}

function parseEdges(items: unknown[], errors: ParseIssue[]): FlowEdge[] {
  return items.flatMap((item, index) => {
    const path = `edges[${index}]`;
    if (!isRecord(item)) {
      errors.push({ code: 'EDGE_MUST_BE_OBJECT', message: 'Edge must be an object.', path });
      return [];
    }

    const id = getRequiredString(item, 'id', errors, `${path}.id`);
    const fromNodeId = getRequiredString(item, 'from', errors, `${path}.from`);
    const toNodeId = getRequiredString(item, 'to', errors, `${path}.to`);
    const label = getOptionalString(item, 'label', errors, `${path}.label`);
    const pathType = getRequiredEnum<PathType>(item, 'path_type', PATH_TYPES, errors, `${path}.path_type`, 'INVALID_PATH_TYPE');
    const metadata = getOptionalMetadata(item, 'metadata', errors, `${path}.metadata`);

    if (!id || !fromNodeId || !toNodeId || !pathType) {
      return [];
    }

    return [{ id, fromNodeId, toNodeId, label, pathType, metadata }];
  });
}

function parseLayoutConfig(layout: UnknownRecord, errors: ParseIssue[]): LayoutConfig {
  const lock = getOptionalRecord(layout, 'lock', errors, 'layout.lock');

  return {
    laneWidthMode: getOptionalEnum(layout, 'lane_width_mode', new Set(['auto']), errors, 'layout.lane_width_mode'),
    pathPriority: getOptionalEnum(layout, 'path_priority', new Set(['main_first']), errors, 'layout.path_priority'),
    branchPolicy: getOptionalEnum(layout, 'branch_policy', new Set(['main_plus_side_branch']), errors, 'layout.branch_policy'),
    returnPathChannel: getOptionalEnum(layout, 'return_path_channel', new Set(['bottom']), errors, 'layout.return_path_channel'),
    externalNodePolicy: getOptionalEnum(layout, 'external_node_policy', new Set(['weak_layout']), errors, 'layout.external_node_policy'),
    lock: lock
      ? {
          mainPath: getOptionalBoolean(lock, 'main_path', errors, 'layout.lock.main_path')
        }
      : undefined
  };
}

function getRecord(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): UnknownRecord | undefined {
  if (!(key in source)) {
    errors.push({ code: 'REQUIRED_FIELD_MISSING', message: `Missing required field: ${path}.`, path });
    return undefined;
  }

  const value = source[key];
  if (!isRecord(value)) {
    errors.push({ code: 'FIELD_MUST_BE_OBJECT', message: `Field must be an object: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getOptionalRecord(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): UnknownRecord | undefined {
  if (!(key in source) || source[key] === undefined || source[key] === null) {
    return undefined;
  }

  const value = source[key];
  if (!isRecord(value)) {
    errors.push({ code: 'FIELD_MUST_BE_OBJECT', message: `Field must be an object: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getArray(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): unknown[] | undefined {
  if (!(key in source)) {
    errors.push({ code: 'REQUIRED_FIELD_MISSING', message: `Missing required field: ${path}.`, path });
    return undefined;
  }

  const value = source[key];
  if (!Array.isArray(value)) {
    errors.push({ code: 'FIELD_MUST_BE_ARRAY', message: `Field must be an array: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getRequiredString(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): string | undefined {
  if (!(key in source)) {
    errors.push({ code: 'REQUIRED_FIELD_MISSING', message: `Missing required field: ${path}.`, path });
    return undefined;
  }

  const value = source[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push({ code: 'FIELD_MUST_BE_NON_EMPTY_STRING', message: `Field must be a non-empty string: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getOptionalString(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): string | undefined {
  if (!(key in source) || source[key] === undefined || source[key] === null) {
    return undefined;
  }

  const value = source[key];
  if (typeof value !== 'string') {
    errors.push({ code: 'FIELD_MUST_BE_STRING', message: `Field must be a string: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getOptionalNumber(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): number | undefined {
  if (!(key in source) || source[key] === undefined || source[key] === null) {
    return undefined;
  }

  const value = source[key];
  if (typeof value !== 'number') {
    errors.push({ code: 'FIELD_MUST_BE_NUMBER', message: `Field must be a number: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getOptionalBoolean(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): boolean | undefined {
  if (!(key in source) || source[key] === undefined || source[key] === null) {
    return undefined;
  }

  const value = source[key];
  if (typeof value !== 'boolean') {
    errors.push({ code: 'FIELD_MUST_BE_BOOLEAN', message: `Field must be a boolean: ${path}.`, path });
    return undefined;
  }

  return value;
}

function getRequiredEnum<T extends string>(
  source: UnknownRecord,
  key: string,
  allowed: ReadonlySet<string>,
  errors: ParseIssue[],
  path: string,
  invalidCode: string
): T | undefined {
  const value = getRequiredString(source, key, errors, path);
  if (!value) {
    return undefined;
  }

  if (!allowed.has(value)) {
    errors.push({ code: invalidCode, message: `Invalid value for ${path}: ${value}.`, path });
    return undefined;
  }

  return value as T;
}

function getOptionalEnum<T extends string>(
  source: UnknownRecord,
  key: string,
  allowed: ReadonlySet<string>,
  errors: ParseIssue[],
  path: string
): T | undefined {
  if (!(key in source) || source[key] === undefined || source[key] === null) {
    return undefined;
  }

  const value = source[key];
  if (typeof value !== 'string' || !allowed.has(value)) {
    errors.push({ code: 'INVALID_ENUM_VALUE', message: `Invalid value for ${path}: ${String(value)}.`, path });
    return undefined;
  }

  return value as T;
}

function getOptionalDirection(diagram: UnknownRecord, errors: ParseIssue[]): Direction {
  const direction = getOptionalEnum<Direction>(diagram, 'direction', new Set(['LR']), errors, 'diagram.direction');
  return direction ?? 'LR';
}

function getOptionalMetadata(source: UnknownRecord, key: string, errors: ParseIssue[], path: string): Record<string, unknown> | undefined {
  return getOptionalRecord(source, key, errors, path);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
