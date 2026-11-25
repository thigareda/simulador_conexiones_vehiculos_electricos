/**
 * tests/battery.test.mjs
 * Pruebas unitarias electroquímicas y térmicas de batería.
 * Criterios de aceptación: AC-02, AC-03, AC-04, AC-05, AC-06, AC-07
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assemblePack,
  calcCRateElectrical,
  calcRegenFactor,
  calcColdChargeLimitCRate,
  calcThermalDerateFactor,
  calcCycleLifeN
} from '../engine/battery.js';

test('AC-02: Armado de pack(350 V, 50 Ah, celda 3.7 V / 25 Ah) -> 95S2P, 351.5 V, 50 Ah [F31·s34]', () => {
  const pack = assemblePack({
    vTarget: 350.0,
    capTargetAh: 50.0,
    vCelda: 3.7,
    capCeldaAh: 25.0
  });

  assert.equal(pack.celdasSerie, 95, 'Debe tener 95 celdas en serie');
  assert.equal(pack.celdasParalelo, 2, 'Debe tener 2 ramas en paralelo');
  assert.equal(pack.configStr, '95S2P', 'Configuración debe ser 95S2P');
  assert.equal(pack.vNominal, 351.5, 'Tensión nominal debe ser 351.5 V');
  assert.equal(pack.capacidadAh, 50.0, 'Capacidad debe ser 50.0 Ah');
  assert.equal(pack.totalCeldas, 190, 'Total de celdas debe ser 190');
});

test('AC-03: Duplicar C-rate duplica I y caída de tensión, y cuadruplica el calor instantáneo [F31·s24]', () => {
  const capacidadAh = 60.0;
  const rintOhm = 0.050; // 50 mΩ

  const c1 = calcCRateElectrical({ cRate: 1.0, capacidadAh, rintOhm });
  const c2 = calcCRateElectrical({ cRate: 2.0, capacidadAh, rintOhm });

  // Corriente: I_2 / I_1 = 2
  assert.equal(c2.corrienteA, 2 * c1.corrienteA, 'Doble corriente al duplicar C-rate');

  // Caída de tensión: ΔV_2 / ΔV_1 = 2
  assert.equal(c2.caidaTensionV, 2 * c1.caidaTensionV, 'Doble caída de tensión al duplicar C-rate');

  // Calor instantáneo: Q_2 / Q_1 = 4 (I² · R)
  assert.equal(c2.calorInstantaneoW, 4 * c1.calorInstantaneoW, 'Cuádruple calor instantáneo al duplicar C-rate');
});

test('AC-04: Freno regenerativo: mapa de tres límites [F30·s31, F30·s32]', () => {
  // Con SOC = 0.85 (> 0.80) -> Regen = 0 (batería no admite más)
  const f85 = calcRegenFactor({ soc: 0.85, tempC: 25, vMs: 20 });
  assert.equal(f85, 0.0, 'AC-04: Regen debe ser 0 con SOC 0.85');

  // Con SOC = 0.75 (entre 0.70 y 0.80) -> Regen limitada por BMS (0.5)
  const f75 = calcRegenFactor({ soc: 0.75, tempC: 25, vMs: 20 });
  assert.ok(f75 > 0.0 && f75 < 1.0, 'AC-04: Regen debe ser limitada con SOC 0.75');
  assert.ok(Math.abs(f75 - 0.5) < 1e-6, `Factor debe ser aproximadamente 0.5 con SOC 0.75, fue ${f75}`);

  // Con SOC = 0.50 (< 0.70) -> Regen libre (1.0)
  const f50 = calcRegenFactor({ soc: 0.50, tempC: 25, vMs: 20 });
  assert.equal(f50, 1.0, 'AC-04: Regen debe ser libre (1.0) con SOC 0.50');

  // Baja velocidad (< 1 m/s) -> 0 (freno hidráulico) [F30·s31]
  const fLowV = calcRegenFactor({ soc: 0.50, tempC: 25, vMs: 0.5 });
  assert.equal(fLowV, 0.0, 'Regen debe ser 0 a baja velocidad (v < 1 m/s)');

  // Alta temperatura (>= 55 °C) -> 0 por protección [F30·s32]
  const fHot = calcRegenFactor({ soc: 0.50, tempC: 56, vMs: 20 });
  assert.equal(fHot, 0.0, 'Regen debe ser 0 con T >= 55 °C');
});

test('AC-05: Derating en frío: a 0 °C la carga permitida es <= 0.3C [F31·s21]', () => {
  const limit0C = calcColdChargeLimitCRate(0.0, 2.0);
  assert.ok(limit0C <= 0.3, `AC-05: A 0 °C la carga permitida debe ser <= 0.3C, fue ${limit0C}C`);

  const limitSubZero = calcColdChargeLimitCRate(-5.0, 2.0);
  assert.ok(limitSubZero <= 0.3, `Bajo 0 °C la carga permitida debe ser <= 0.3C, fue ${limitSubZero}C`);

  const limitWarm = calcColdChargeLimitCRate(25.0, 2.0);
  assert.equal(limitWarm, 2.0, 'A temperatura ambiente (25 °C) la carga permitida debe ser la nominal');
});

test('AC-06: T > 45 °C reduce P_disponible de forma monótona [F31·s24]', () => {
  // A 45 °C debe ser 100% (1.0)
  assert.equal(calcThermalDerateFactor(45.0), 1.0, 'A 45 °C debe estar al 100%');

  // Monótona decreciente para T > 45 °C
  const temps = [46, 48, 50, 52, 54, 55, 56, 58, 60, 65];
  let prevFactor = calcThermalDerateFactor(45.0);

  for (const t of temps) {
    const factor = calcThermalDerateFactor(t);
    assert.ok(
      factor < prevFactor || (prevFactor === 0 && factor === 0),
      `Monotonía violada en T=${t}: f(T)=${factor} no es menor que anterior=${prevFactor}`
    );
    prevFactor = factor;
  }

  // A 55 °C debe caer a 30% (0.30)
  assert.ok(Math.abs(calcThermalDerateFactor(55.0) - 0.30) < 0.01, 'A 55 °C debe ser 0.30');

  // A >= 60 °C debe cortar por protección a 0.0
  assert.equal(calcThermalDerateFactor(60.0), 0.0, 'A 60 °C debe cortar a 0.0');
});

test('AC-07: La curva N(DOD) cumple N(0.5) / N(1.0) ≈ 2.5 [F31·s26]', () => {
  const n100 = 2000;
  const nAt100 = calcCycleLifeN(1.0, n100);
  const nAt50 = calcCycleLifeN(0.5, n100);

  assert.equal(nAt100, n100, 'N(1.0) debe ser igual a N100');

  const ratio = nAt50 / nAt100;
  assert.ok(
    Math.abs(ratio - 2.5) < 0.01,
    `AC-07: N(0.5) / N(1.0) debe ser ≈ 2.5 (2^1.322), fue ${ratio.toFixed(4)}`
  );
});
