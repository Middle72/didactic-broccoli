import { spawn } from 'node:child_process';
import path from 'node:path';

// Astro 7 auto-daemonizes `astro dev` when it detects an agentic/CLI
// environment (e.g. Claude Code). That breaks tooling that expects to manage
// the dev server process directly, so force foreground mode here.
const astroBin = path.resolve(import.meta.dirname, '../node_modules/astro/bin/astro.mjs');

const child = spawn(process.execPath, [astroBin, 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '1' },
});

child.on('exit', (code) => process.exit(code ?? 0));
