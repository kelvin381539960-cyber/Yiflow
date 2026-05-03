import { describe, expect, it } from 'vitest';
import { runCli, type CliIo } from '../packages/cli/src/index.js';

describe('runCli', () => {
  it('validates an example successfully', async () => {
    const io = createTestIo();
    const exitCode = await runCli(['validate', 'examples/approval-flow.swimflow.yaml'], io);

    expect(exitCode).toBe(0);
    expect(io.stdoutMessages.join('\n')).toContain('Status: valid');
    expect(io.stdoutMessages.join('\n')).toContain('Graph: approval_flow_basic');
  });

  it('renders an example SVG to the requested output path', async () => {
    const io = createTestIo();
    const exitCode = await runCli(['render', 'examples/approval-flow.swimflow.yaml', '-o', 'out.svg'], io);

    expect(exitCode).toBe(0);
    expect(io.writes['out.svg']).toContain('<svg');
    expect(io.writes['out.svg']).toContain('标准审批流程示例');
    expect(io.stdoutMessages.join('\n')).toContain('Status: success');
  });

  it('returns argument error when render output path is missing', async () => {
    const io = createTestIo();
    const exitCode = await runCli(['render', 'examples/approval-flow.swimflow.yaml'], io);

    expect(exitCode).toBe(2);
    expect(io.stderrMessages.join('\n')).toContain('Missing output file');
  });

  it('returns invalid status when parsing fails', async () => {
    const io = createTestIo();
    const exitCode = await runCli(['validate', 'examples/not-found.swimflow.yaml'], io);

    expect(exitCode).toBe(1);
    expect(io.stderrMessages.join('\n')).toContain('Status: invalid');
  });
});

interface TestIo extends CliIo {
  stdoutMessages: string[];
  stderrMessages: string[];
  writes: Record<string, string>;
}

function createTestIo(): TestIo {
  const stdoutMessages: string[] = [];
  const stderrMessages: string[] = [];
  const writes: Record<string, string> = {};

  return {
    stdoutMessages,
    stderrMessages,
    writes,
    stdout: (message: string) => {
      stdoutMessages.push(message);
    },
    stderr: (message: string) => {
      stderrMessages.push(message);
    },
    writeFile: async (filePath: string, content: string) => {
      writes[filePath] = content;
    }
  };
}
