import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@hey-api/openapi-ts';
import config from '../openapi-ts.config';
import { compareTrees, describeDrift, fetchDocument, normalise, parseDocument } from './api-contract-lib';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONFIG_FILE = join(ROOT, 'openapi-ts.config.ts');
const SNAPSHOT = join(ROOT, 'openapi', 'openapi.json');
const GENERATED = join(ROOT, 'src', 'api', 'generated');
const PRODUCTION_URL = process.env.API_CONTRACT_URL || 'https://api.versemate.org/openapi/json';

async function generate(outputPath: string) {
  const base = await config;
  await createClient({
    ...base,
    configFile: CONFIG_FILE,
    input: SNAPSHOT,
    logs: { level: 'silent' },
    output: { ...base.output, path: outputPath },
  });
}

const fetchProduction = () => fetchDocument(PRODUCTION_URL);

async function main(command: string | undefined) {
  if (command === 'fetch') {
    writeFileSync(SNAPSHOT, normalise(await fetchProduction()));
    console.log(`wrote ${relative(ROOT, SNAPSHOT)} from ${PRODUCTION_URL}`);
    return 0;
  }
  if (command === 'generate') {
    parseDocument(readFileSync(SNAPSHOT, 'utf8'), SNAPSHOT);
    await generate(GENERATED);
    console.log(`regenerated ${relative(ROOT, GENERATED)} from ${relative(ROOT, SNAPSHOT)}`);
    return 0;
  }
  if (command === 'check') {
    const text = readFileSync(SNAPSHOT, 'utf8');
    if (text !== normalise(parseDocument(text, SNAPSHOT))) {
      console.error(`${relative(ROOT, SNAPSHOT)} is not normalised: refresh it with api:fetch`);
      return 1;
    }
    const scratch = mkdtempSync(join(tmpdir(), 'api-contract-'));
    try {
      await generate(scratch);
      const differences = compareTrees(scratch, GENERATED);
      if (differences.length > 0) {
        console.error(`${relative(ROOT, GENERATED)} does not match a regeneration from the snapshot. Run api:generate.`);
        for (const line of differences) console.error(`  ${line}`);
        return 1;
      }
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
    console.log('the generated client matches the snapshot');
    return 0;
  }
  if (command === 'diff-production') {
    const snapshot = parseDocument(readFileSync(SNAPSHOT, 'utf8'), SNAPSHOT);
    const production = await fetchProduction();
    const drift = describeDrift(snapshot, production);
    if (drift.length > 0) {
      console.error(`production's API document differs from ${relative(ROOT, SNAPSHOT)}. Run api:fetch, then api:generate, and fix what the type-check reports.`);
      for (const line of drift) console.error(`  ${line}`);
      return 1;
    }
    console.log(`the snapshot matches ${PRODUCTION_URL}`);
    return 0;
  }
  console.error('usage: bun scripts/api-contract.ts <fetch|generate|check|diff-production>');
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv[2])
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
