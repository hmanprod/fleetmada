import { readFileSync } from 'fs';

export function getTestPassword(): string {
  const raw = readFileSync(__dirname + '/.pw.tmp', 'utf-8');
  return raw.replace('TEST_PW=', '').trim();
}
