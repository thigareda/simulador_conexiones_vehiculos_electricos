/**
 * tools/build-circuits.mjs
 * Muestrea los trazados SVG de los 4 circuitos, calcula longitud acumulada (s),
 * curvatura de Menger (kappa) y velocidad máxima de paso por curva (vmax),
 * generando web/eprix/data/circuits.generated.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CIRCUITS_DIR = path.resolve(__dirname, '../assets/circuits');
const OUTPUT_FILE = path.resolve(__dirname, '../data/circuits.generated.js');

const CIRCUIT_CONFIGS = [
  { id: 'monaco', file: 'monaco.svg', name: 'Inspirado en Mónaco', defaultKm: 3.50, tamb_c: 24 },
  { id: 'dubai', file: 'dubai.svg', name: 'Inspirado en Dubái', defaultKm: 4.60, tamb_c: 34 },
  { id: 'mexico', file: 'mexico.svg', name: 'Inspirado en Hermanos Rodríguez (México)', defaultKm: 4.30, tamb_c: 22 },
  { id: 'paul-ricard', file: 'paul-ricard.svg', name: 'Inspirado en Paul Ricard', defaultKm: 5.20, tamb_c: 27 }
];

const NUM_SAMPLES = 800; // Muestras de waypoints por circuito
const A_LAT = 12.0;       // m/s^2 aceleración lateral máxima admisible (C: parámetro de diseño)
const V_MIN_KMH = 40.0;   // km/h acotación inferior
const V_MAX_KMH = 320.0;  // km/h acotación superior

/**
 * Parser de rutas SVG simples (soporta M, L, C, Z con coordenadas absolutas)
 */
function parseSvgPath(dStr) {
  const commands = [];
  const regex = /([MLCZ])([^MLCZ]*)/gi;
  let match;

  while ((match = regex.exec(dStr)) !== null) {
    const type = match[1].toUpperCase();
    const args = match[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    commands.push({ type, args });
  }

  // Desglosar en curvas y líneas con coordenadas continuas
  const segments = [];
  let currX = 0;
  let currY = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      currX = cmd.args[0];
      currY = cmd.args[1];
      startX = currX;
      startY = currY;
    } else if (cmd.type === 'L') {
      const x = cmd.args[0];
      const y = cmd.args[1];
      segments.push({
        type: 'line',
        p0: [currX, currY],
        p1: [x, y]
      });
      currX = x;
      currY = y;
    } else if (cmd.type === 'C') {
      for (let i = 0; i < cmd.args.length; i += 6) {
        const cp1 = [cmd.args[i], cmd.args[i + 1]];
        const cp2 = [cmd.args[i + 2], cmd.args[i + 3]];
        const end = [cmd.args[i + 4], cmd.args[i + 5]];
        segments.push({
          type: 'cubic',
          p0: [currX, currY],
          p1: cp1,
          p2: cp2,
          p3: end
        });
        currX = end[0];
        currY = end[1];
      }
    } else if (cmd.type === 'Z') {
      if (Math.hypot(currX - startX, currY - startY) > 1e-4) {
        segments.push({
          type: 'line',
          p0: [currX, currY],
          p1: [startX, startY]
        });
      }
      currX = startX;
      currY = startY;
    }
  }

  return segments;
}

/**
 * Evalúa punto y longitud aproximada de segmentos
 */
function sampleSegment(seg, steps = 40) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (seg.type === 'line') {
      const x = seg.p0[0] + t * (seg.p1[0] - seg.p0[0]);
      const y = seg.p0[1] + t * (seg.p1[1] - seg.p0[1]);
      pts.push([x, y]);
    } else if (seg.type === 'cubic') {
      const mt = 1 - t;
      const x = mt * mt * mt * seg.p0[0] + 3 * mt * mt * t * seg.p1[0] + 3 * mt * t * t * seg.p2[0] + t * t * t * seg.p3[0];
      const y = mt * mt * mt * seg.p0[1] + 3 * mt * mt * t * seg.p1[1] + 3 * mt * t * t * seg.p2[1] + t * t * t * seg.p3[1];
      pts.push([x, y]);
    }
  }
  return pts;
}

/**
 * Remuestreo de una curva cerrada a N puntos equidistantes en longitud de arco
 */
function resampleEquidistant(rawPoints, targetN) {
  // Calcular longitudes de arco acumuladas
  const arcLengths = [0];
  for (let i = 1; i < rawPoints.length; i++) {
    const d = Math.hypot(rawPoints[i][0] - rawPoints[i - 1][0], rawPoints[i][1] - rawPoints[i - 1][1]);
    arcLengths.push(arcLengths[i - 1] + d);
  }
  const totalLength = arcLengths[arcLengths.length - 1];
  const step = totalLength / targetN;

  const resampled = [];
  let currIdx = 0;

  for (let i = 0; i < targetN; i++) {
    const targetDist = i * step;
    while (currIdx < arcLengths.length - 1 && arcLengths[currIdx + 1] < targetDist) {
      currIdx++;
    }
    const segLen = arcLengths[currIdx + 1] - arcLengths[currIdx];
    const frac = segLen > 1e-9 ? (targetDist - arcLengths[currIdx]) / segLen : 0;
    const pA = rawPoints[currIdx];
    const pB = rawPoints[currIdx + 1] || rawPoints[0];
    const x = pA[0] + frac * (pB[0] - pA[0]);
    const y = pA[1] + frac * (pB[1] - pA[1]);
    resampled.push([x, y]);
  }

  return { points: resampled, svgLength: totalLength };
}

/**
 * Curvatura de Menger para 3 puntos: kappa = 4*Area / (|AB| * |BC| * |CA|)
 */
function mengerCurvature(pA, pB, pC) {
  const area2 = Math.abs((pB[0] - pA[0]) * (pC[1] - pA[1]) - (pB[1] - pA[1]) * (pC[0] - pA[0]));
  const dAB = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
  const dBC = Math.hypot(pC[0] - pB[0], pC[1] - pB[1]);
  const dCA = Math.hypot(pA[0] - pC[0], pA[1] - pC[1]);
  const denom = dAB * dBC * dCA;
  if (denom < 1e-9) return 0;
  return (2 * area2) / denom;
}

/**
 * Suavizado de curvaturas y cálculo de vmax con lookahead de frenado
 */
function computeWaypoints(points, lengthKm) {
  const N = points.length;
  const lengthM = lengthKm * 1000;
  const dsM = lengthM / N; // metros por muestra

  // 1. Curvatura en SVG units y conversión a física (1/m)
  // Escala física: metros por unidad SVG
  // Longitud total en SVG = N * distancia media entre puntos
  let totalSvgDist = 0;
  for (let i = 0; i < N; i++) {
    const next = points[(i + 1) % N];
    totalSvgDist += Math.hypot(next[0] - points[i][0], next[1] - points[i][1]);
  }
  const metersPerSvgUnit = lengthM / totalSvgDist;

  const rawKappas = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    // Usar ventana de 3 puntos con paso 2 para filtrar ruido de muestreo
    const prev = points[(i - 2 + N) % N];
    const curr = points[i];
    const next = points[(i + 2) % N];
    const kSvg = mengerCurvature(prev, curr, next);
    // kappa en 1/metro = k_svg / metersPerSvgUnit
    rawKappas[i] = kSvg / metersPerSvgUnit;
  }

  // Suavizado gaussiano ligero sobre curvaturas
  const smoothKappas = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    let wSum = 0;
    for (let k = -2; k <= 2; k++) {
      const idx = (i + k + N) % N;
      const w = Math.exp(-(k * k) / 2);
      sum += rawKappas[idx] * w;
      wSum += w;
    }
    smoothKappas[i] = sum / wSum;
  }

  // 2. Velocidad límite instantánea por aceleración lateral: vmax = sqrt(a_lat / kappa)
  const vCornerLimit = new Float64Array(N);
  const vMinMs = V_MIN_KMH / 3.6;
  const vMaxMs = V_MAX_KMH / 3.6;

  for (let i = 0; i < N; i++) {
    const kappa = Math.max(smoothKappas[i], 1e-5);
    const vLimit = Math.sqrt(A_LAT / kappa);
    vCornerLimit[i] = Math.min(vMaxMs, Math.max(vMinMs, vLimit));
  }

  // 3. Pasar backwards para respetar la desaceleración máxima admisible antes de cada curva
  // v_prev^2 <= v_curr^2 + 2 * a_brake * ds (con a_brake = 8 m/s^2 típicamente)
  const A_BRAKE = 8.5; // m/s^2 deceleración de frenado
  const vmaxProfile = new Float64Array(vCornerLimit);

  // Dos pasadas backwards circulares para converger
  for (let pass = 0; pass < 2; pass++) {
    for (let i = N - 1; i >= 0; i--) {
      const nextIdx = (i + 1) % N;
      const maxAllowed = Math.sqrt(vmaxProfile[nextIdx] * vmaxProfile[nextIdx] + 2 * A_BRAKE * dsM);
      if (maxAllowed < vmaxProfile[i]) {
        vmaxProfile[i] = Math.max(vMinMs, maxAllowed);
      }
    }
  }

  // Generar array final de waypoints: [[x, y, s, kappa, vmax], ...]
  // x, y en SVG; s en metros; kappa en 1/m; vmax en m/s
  const waypoints = [];
  for (let i = 0; i < N; i++) {
    const s = +(i * dsM).toFixed(2);
    const x = +points[i][0].toFixed(2);
    const y = +points[i][1].toFixed(2);
    const kappa = +smoothKappas[i].toFixed(6);
    const vmax = +vmaxProfile[i].toFixed(2);
    waypoints.push([x, y, s, kappa, vmax]);
  }

  return waypoints;
}

/**
 * Función principal constructora
 */
export function buildAllCircuits() {
  const result = {};

  for (const cfg of CIRCUIT_CONFIGS) {
    const svgPath = path.join(CIRCUITS_DIR, cfg.file);
    if (!fs.existsSync(svgPath)) {
      throw new Error(`No se encontró el SVG del circuito: ${svgPath}`);
    }
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // Extraer data-length-km y data-name si existen
    const lenMatch = svgContent.match(/data-length-km="([^"]+)"/);
    const nameMatch = svgContent.match(/data-name="([^"]+)"/);
    const lengthKm = lenMatch ? parseFloat(lenMatch[1]) : cfg.defaultKm;
    const name = nameMatch ? nameMatch[1] : cfg.name;

    // Extraer d del <path id="centerline" ...>
    const pathMatch = svgContent.match(/<path[^>]*id="centerline"[^>]*d="([^"]+)"/i) ||
                      svgContent.match(/<path[^>]*d="([^"]+)"[^>]*id="centerline"/i);
    if (!pathMatch) {
      throw new Error(`No se encontró <path id="centerline" d="..."> en ${cfg.file}`);
    }
    const dStr = pathMatch[1];

    const segments = parseSvgPath(dStr);
    const rawPoints = [];
    for (const seg of segments) {
      const pts = sampleSegment(seg, 30);
      for (const p of pts) rawPoints.push(p);
    }

    const { points } = resampleEquidistant(rawPoints, NUM_SAMPLES);
    const waypoints = computeWaypoints(points, lengthKm);

    result[cfg.id] = {
      id: cfg.id,
      nombre: name,
      longitud_km: lengthKm,
      longitud_m: lengthKm * 1000,
      tamb_c: cfg.tamb_c,
      svg_file: `assets/circuits/${cfg.file}`,
      num_waypoints: waypoints.length,
      waypoints
    };

    console.log(`✓ Circuito ${cfg.id} procesado: ${waypoints.length} waypoints, ${lengthKm} km`);
  }

  // Escribir archivo circuits.generated.js
  const outputCode = `/**
 * GENERADO AUTOMÁTICAMENTE POR tools/build-circuits.mjs
 * NO MODIFICAR MANUALMENTE.
 * Muestreo de centerline de circuitos SVG con curvatura Menger y límite vmax.
 * Cada waypoint: [x (svg), y (svg), s (metros), kappa (1/m), vmax (m/s)]
 */

export const GENERATED_CIRCUITS = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, outputCode, 'utf8');
  console.log(`Archivo generado con éxito: ${OUTPUT_FILE}`);
  return result;
}

// Ejecutar directamente si es invocado por CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildAllCircuits();
}
