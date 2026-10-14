/**
 * Runs the widget state-machine test.
 *
 * Swift only allows top-level code in a file called main.swift, so the .swift test is copied to a
 * temp main.swift before compiling. That is the entire reason this wrapper exists — it is not
 * doing anything clever.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'euph-mood-'));
copyFileSync('scripts/widget-mood-test.swift', join(dir, 'main.swift'));
const bin = join(dir, 'moodtest');
try {
  execFileSync('xcrun', ['swiftc', '-O', 'targets/widget/mood.swift', join(dir, 'main.swift'), '-o', bin], { stdio: 'inherit' });
  execFileSync(bin, { stdio: 'inherit', cwd: process.cwd() });
} catch {
  process.exit(1);
}
