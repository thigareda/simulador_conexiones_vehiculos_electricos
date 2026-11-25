/**
 * Mulberry32: PRNG sembrado determinista de 32 bits
 * Garantiza reproducibilidad exacta de carreras sin Math.random()
 */
export function createRNG(seed = 1234) {
  let s = (Math.floor(seed) >>> 0) || 1234;

  return function nextFloat() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Genera un número flotante en el rango [min, max)
 */
export function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}
