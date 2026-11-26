/**
 * web/eprix/tools/build-bundle.mjs
 * Empaqueta los módulos ESM de E-Prix Didaktikos en un bundle clásico IIFE
 * (web/eprix/eprix.bundle.js) compatible con protocolo file:// y HTTP sin CORS.
 *
 * Uso: node web/eprix/tools/build-bundle.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EPRIX_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(EPRIX_DIR, 'eprix.bundle.js');

const MODULE_ORDER = [
  'data/chemistry.js',
  'data/cars.js',
  'data/circuits.generated.js',
  'data/circuits.js',
  'engine/random.js',
  'engine/battery.js',
  'engine/physics.js',
  'engine/driver.js',
  'engine/race-sim.js',
  'eprix.js'
];

function stripModuleSyntax(source) {
  // Eliminar sentencias import (una línea o multilínea)
  let out = source.replace(/^import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
  // Convertir `export const` / `export function` / `export let` en declaraciones locales
  out = out.replace(/^export\s+(?=(const|let|var|function|class)\b)/gm, '');
  return out.trim();
}

const chunks = MODULE_ORDER.map((relPath) => {
  const fullPath = path.join(EPRIX_DIR, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const transformed = stripModuleSyntax(raw);
  return `// === ${relPath} ===\n${transformed}`;
});

const bundle = `/**
 * web/eprix/eprix.bundle.js
 * Bundle clásico autogenerado por web/eprix/tools/build-bundle.mjs
 * Permite ejecutar E-Prix Didaktikos tanto por HTTP como directamente por file://
 */
(function (global) {
  'use strict';

${chunks.join('\n\n')}

  global.initEPrix = initEPrix;
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(OUTPUT_FILE, bundle, 'utf8');
console.log(`✓ Bundle generado: ${OUTPUT_FILE} (${(bundle.length / 1024).toFixed(1)} KB)`);
