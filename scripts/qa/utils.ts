import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function isoDateLocal(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function timeSlug(date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}${mm}${ss}`;
}

export function uniqueAuditDir(root: string): string {
  const date = isoDateLocal();
  const base = path.join(root, date);
  if (!fs.existsSync(base)) return base;
  return path.join(root, `${date}-${timeSlug()}`);
}

export function safeFileSlug(input: string): string {
  return input
    .replace(/^https?:\/\//, '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 180);
}

export function tryRun(
  command: string,
  opts?: { env?: Record<string, string | undefined>; cwd?: string }
) {
  const result = spawnSync(command, {
    shell: true,
    stdio: 'inherit',
    cwd: opts?.cwd ?? process.cwd(),
    env: { ...process.env, ...(opts?.env ?? {}) },
  });
  return result.status ?? 1;
}

export function writeJson(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function writeText(filePath: string, text: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, 'utf8');
}
