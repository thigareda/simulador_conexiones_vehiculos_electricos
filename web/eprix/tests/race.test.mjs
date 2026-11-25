/**
 * tests/race.test.mjs
 * Pruebas de integración del motor de carrera y determinismo.
 * Criterios de aceptación: AC-08, AC-09, AC-13, AC-14, AC-15
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CARS_DATA } from '../data/cars.js';
import { CIRCUITS } from '../data/circuits.js';
import { CHEMISTRY_DATA } from '../data/chemistry.js';
import { simulateFullRace, runCalibrationSuite } from '../tools/calibrate.mjs';

test('AC-08: Determinismo PRNG: Misma semilla -> misma clasificación y mismos tiempos (± 0.01 s)', () => {
  const circuit = CIRCUITS['monaco'];
  const carIds = ['sedan-ncm', 'urbano-lfp', 'camioneta-nimh', 'sedan-plomo'];
  const seed = 98765;

  const run1 = carIds.map(id => {
    const car = CARS_DATA[id];
    const chem = CHEMISTRY_DATA[car.quimica.toUpperCase()];
    return simulateFullRace(car, chem, circuit, 'equilibrado', seed);
  });

  const run2 = carIds.map(id => {
    const car = CARS_DATA[id];
    const chem = CHEMISTRY_DATA[car.quimica.toUpperCase()];
    return simulateFullRace(car, chem, circuit, 'equilibrado', seed);
  });

  for (let i = 0; i < carIds.length; i++) {
    const t1 = run1[i].totalTimeS;
    const t2 = run2[i].totalTimeS;
    assert.ok(
      Math.abs(t1 - t2) < 0.01,
      `AC-08: Tiempo idéntico esperado para ${carIds[i]}: run1=${t1}, run2=${t2}`
    );
    assert.equal(run1[i].socFinalPct, run2[i].socFinalPct, 'SOC final debe ser idéntico');
    assert.equal(run1[i].tempMaxC, run2[i].tempMaxC, 'Temp máxima debe ser idéntica');
  }
});

test('AC-09: 4 vueltas completas en < 8 min (< 480 s) de simulación a 1x en circuito de referencia', () => {
  const circuit = CIRCUITS['monaco'];
  const fastCar = CARS_DATA['sedan-ncm'];
  const chem = CHEMISTRY_DATA['NCM'];

  const res = simulateFullRace(fastCar, chem, circuit, 'equilibrado', 1234);

  assert.ok(res.finished, 'El coche debe terminar las 4 vueltas');
  assert.ok(
    res.totalTimeS < 480.0,
    `AC-09: La carrera debe durar < 8 min (< 480 s), duró: ${res.totalTimeS.toFixed(1)} s`
  );
  assert.ok(
    res.totalTimeS > 240.0,
    `La carrera debe durar un tiempo didáctico razonable (> 4 min), duró: ${res.totalTimeS.toFixed(1)} s`
  );
});

test('AC-13, AC-14, AC-15: Calibración, equilibrio, terminación, spread <= 35%, plomo más lento y victorias por química', () => {
  const cal = runCalibrationSuite();

  // AC-14: Todas las 16 combinaciones terminan carrera
  assert.ok(cal.allFinished, 'AC-14: Las 16 combinaciones deben terminar (0 DNF)');

  // AC-14: Spread entre el mejor y peor tiempo <= 35%
  assert.ok(
    cal.spreadPct <= 35.0,
    `AC-14: Spread entre mejor y peor tiempo debe ser <= 35 %, fue: ${cal.spreadPct.toFixed(2)} %`
  );

  // AC-14: El plomo debe ser el más lento en los 4 circuitos
  assert.ok(cal.plomoSlowestInAll, 'AC-14: El plomo debe ser el más lento en los 4 circuitos');

  // AC-13: Swing de SOC en 4 vueltas entre 45% y 80% (piloto equilibrado)
  assert.ok(
    cal.swingMin >= 45.0 && cal.swingMax <= 80.0,
    `AC-13: Swing de SOC debe estar entre 45 % y 80 %, obtenido: [${cal.swingMin} %, ${cal.swingMax} %]`
  );

  // AC-15: Cada química gana al menos una métrica
  for (const q of ['LFP', 'NCM', 'NiMH', 'Plomo']) {
    assert.ok(
      cal.wins[q].length > 0,
      `AC-15: La química ${q} debe ganar al menos una métrica de la tabla de resultados. Victorias: ${cal.wins[q].join(', ')}`
    );
  }
});
