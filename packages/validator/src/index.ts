import type { Graph } from '../../core/src/index.js';

export interface ValidationIssue {
  code: string;
  message: string;
  target?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function validateGraphPlaceholder(_graph: Graph): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [
      {
        code: 'VALIDATOR_NOT_IMPLEMENTED',
        message: 'Validator v0.1 is not implemented yet. This placeholder exists for YF-P3-001 only.'
      }
    ]
  };
}
