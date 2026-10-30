#!/usr/bin/env node
/**
 * Lists every component in a rendered page and whether its datasource content resolved.
 *
 * The Sitecore MCP's get_page_html output is usually too large to read inline, so the tool
 * saves it to a file. Pass that file (or a saved page source) here:
 *
 *   node .claude/skills/sitecore-site-recreation/scripts/check-rendered-page.mjs <file> [...]
 *
 * "FAIL" means the layout service returned "isContentResolved": false. The component's
 * Integrated GraphQL query returned nothing, almost always because it exceeded the complexity
 * limit (see references/kit-config.md). Exit code 1 if any component failed.
 */
import { readFileSync } from 'node:fs';

let failed = 0;
for (const file of process.argv.slice(2)) {
  // The layout JSON is embedded with several levels of escaping; drop all backslashes.
  const text = readFileSync(file, 'utf8').split('\\').join('');
  const pattern = /"componentName":"([^"]+)","dataSource":"([^"]*)","isContentResolved":(true|false)/g;
  const seen = new Set();
  console.log(`== ${file}`);
  for (const [, name, dataSource, resolved] of text.matchAll(pattern)) {
    const key = `${name}|${dataSource}`;
    if (seen.has(key) || name === 'PartialDesignDynamicPlaceholder') continue;
    seen.add(key);
    if (resolved === 'false') failed++;
    console.log(`${resolved === 'true' ? 'ok  ' : 'FAIL'} ${name.padEnd(28)} ${dataSource.split('/').pop()}`);
  }
  if (!seen.size) console.log('No components found. Is this a get_page_html result?');
}
process.exitCode = failed ? 1 : 0;
