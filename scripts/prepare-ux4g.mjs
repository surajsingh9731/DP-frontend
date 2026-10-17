import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { UX4G } from './ux4g.config.mjs';
const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const input = read('node_modules/ux4g-web-components/styles/ux4g.css');
if (
  JSON.parse(read('node_modules/ux4g-web-components/package.json')).version !== UX4G.version ||
  createHash('sha256').update(input).digest('hex') !== UX4G.cssSha256
)
  throw new Error('UX4G source drift: review version, license and font adaptation before updating');
const original = postcss.parse(input),
  adapted = original.clone();
let fonts = 0,
  imports = 0;
adapted.walkAtRules('font-face', (rule) => {
  fonts++;
  rule.remove();
});
adapted.walkAtRules('import', (rule) => {
  if (!rule.params.includes('https://fonts.googleapis.com/'))
    throw new Error('Unexpected UX4G import');
  imports++;
  rule.remove();
});
if (fonts !== UX4G.fontFaces || imports !== UX4G.fontImports)
  throw new Error('UX4G font structure changed');
// A scoped stylesheet needs an explicit :scope token host; implicit :root does not match it.
adapted.walkRules((rule) => {
  rule.selector = rule.selector.replace(/:root\b/g, ':scope');
});
const fingerprint = (tree) => {
  const rules = [];
  tree.walkRules((r) =>
    rules.push([r.selector.replace(/:root\b/g, ':scope'), r.nodes.map((n) => n.toString())]),
  );
  return JSON.stringify(rules);
};
if (fingerprint(original) !== fingerprint(adapted))
  throw new Error('UX4G selectors/declarations changed');
if (/url\(\s*["']?https?:/i.test(adapted.toString()))
  throw new Error('Remote URL remains in adapted UX4G CSS');
const output = `/* Derived from ux4g-web-components@${UX4G.version}, MIT; see vendor/ux4g/UPSTREAM-README.md.
 * SHA256 ${UX4G.cssSha256}. Only seven font faces and one remote font import removed.
 * Only :root selectors mapped to :scope; all other selectors/declarations preserved. No runtime. */
@scope (${UX4G.scope}) { @layer ux4g {
${adapted.toString()}
} }
`;
const destination = new URL('src/styles/generated/ux4g.css', root);
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output)
    throw new Error('Generated UX4G CSS is stale; run npm run ui:prepare');
} else writeFileSync(destination, output);
console.log(
  `UX4G ${UX4G.version}: non-root selectors/declarations preserved, root mapped to scope, fonts local, ${Buffer.byteLength(output)} bytes (${fileURLToPath(destination)})`,
);
