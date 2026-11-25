/**
 * Metadatos y acceso a waypoints de circuitos
 */
import { GENERATED_CIRCUITS } from './circuits.generated.js';

export const CIRCUITS = GENERATED_CIRCUITS;

export const CIRCUIT_LIST = Object.values(CIRCUITS).map(c => ({
  id: c.id,
  nombre: c.nombre,
  longitud_km: c.longitud_km,
  longitud_m: c.longitud_m,
  tamb_c: c.tamb_c,
  svg_file: c.svg_file,
  num_waypoints: c.num_waypoints
}));

/**
 * Obtiene el circuito por ID
 */
export function getCircuit(circuitId) {
  return CIRCUITS[circuitId] || CIRCUITS['monaco'];
}

/**
 * Búsqueda binaria o indexada del waypoint por coordenada de distancia s (0 a longitud_m)
 */
export function getWaypointAtDistance(circuit, s) {
  const waypoints = circuit.waypoints;
  const N = waypoints.length;
  const totalM = circuit.longitud_m;

  // Normalizar s al rango [0, totalM)
  let normS = s % totalM;
  if (normS < 0) normS += totalM;

  const idxExact = (normS / totalM) * N;
  const idx0 = Math.floor(idxExact) % N;
  const idx1 = (idx0 + 1) % N;
  const frac = idxExact - Math.floor(idxExact);

  const wp0 = waypoints[idx0];
  const wp1 = waypoints[idx1];

  // Interpolar [x, y, s, kappa, vmax]
  const x = wp0[0] + frac * (wp1[0] - wp0[0]);
  const y = wp0[1] + frac * (wp1[1] - wp0[1]);
  const kappa = wp0[3] + frac * (wp1[3] - wp0[3]);
  const vmax = wp0[4] + frac * (wp1[4] - wp0[4]);

  return { x, y, s: normS, kappa, vmax, idx: idx0 };
}
