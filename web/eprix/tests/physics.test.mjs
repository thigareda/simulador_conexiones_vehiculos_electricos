/**
 * tests/physics.test.mjs
 * Validación de ecuaciones de resistencia y dinámica longitudinal.
 * Criterio de aceptación AC-01: autonomia() devuelve 232 ± 1 km con datos de 3.8 [F30·s25]
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calcRollingResistance,
  calcAerodynamicDrag,
  calcTotalResistance,
  calcAutonomiaCorpus,
  calcTractionForce,
  calcAcceleration
} from '../engine/physics.js';

test('AC-01: Cálculo canónico de autonomía de 232 ± 1 km con datos de 3.8 [F30·s25]', () => {
  // Parámetros canónicos de F30·s24 y F30·s25:
  // m = 1 700 kg, A = 4 m², Cd = 0.35, f = 0.015, g = 9.8 m/s^2, Ua = 60 km/h
  // η_transmisión = 0.92, η_motor+MCU = 0.90, Batería 50 kWh, descarga 0.95, usable 80%
  const res = calcAutonomiaCorpus({
    m: 1700,
    a: 4.0,
    cd: 0.35,
    f: 0.015,
    g: 9.8,
    uaKmh: 60.0,
    etaTrans: 0.92,
    etaMotorMcu: 0.90,
    etaBatDescarga: 0.95,
    capacidadBateriaKwh: 50.0,
    socUsableFrac: 0.80
  });

  // Resistencia a la rodadura: 1700 * 9.8 * 0.015 = 249.9 N
  assert.ok(Math.abs(res.fRod - 249.9) < 0.2, `F_rodadura debe ser ~249.9 N, fue ${res.fRod}`);

  // Resistencia aerodinámica: 0.35 * 4 * (60^2) / 21.15 = 238.3 N
  assert.ok(Math.abs(res.fAero - 238.3) < 0.2, `F_aero debe ser ~238.3 N, fue ${res.fAero}`);

  // Fuerza de resistencia total: 488.2 N
  assert.ok(Math.abs(res.fTotal - 488.2) < 0.2, `F_total debe ser ~488.2 N, fue ${res.fTotal}`);

  // Eficiencia en cascada: 0.92 * 0.90 * 0.95 = 0.7866
  assert.ok(Math.abs(res.etaTotal - 0.7866) < 0.001, `η_total debe ser ~0.7866, fue ${res.etaTotal}`);

  // Trabajo a las ruedas para la autonomía: ~31.5 kWh
  assert.ok(Math.abs(res.energiaMecanicaTotalKwh - 31.5) < 0.5, `E_ruedas debe ser ~31.5 kWh, fue ${res.energiaMecanicaTotalKwh}`);

  // Autonomía: 232 ± 1 km
  assert.ok(
    res.autonomiaKm >= 231.0 && res.autonomiaKm <= 233.0,
    `AC-01: Autonomía esperada 232 ± 1 km, obtenida: ${res.autonomiaKm.toFixed(2)} km`
  );
});

test('Física: Límites de adherencia y aceleración F_grip = 0.55 · m · g', () => {
  const m = 1500;
  const pDisponibleW = 100000; // 100 kW
  // A muy baja velocidad v = 1 m/s (clamped to max(v, 2) = 2 m/s):
  // F_ideal = 100000 / 2 = 50000 N
  // F_grip = 0.55 * 1500 * 9.8 = 8085 N
  const fTrac = calcTractionForce(pDisponibleW, 1.0, m);
  assert.equal(fTrac, 0.55 * 1500 * 9.8, 'F_trac debe quedar acotada exactamente por F_grip');

  const fRes = 300;
  const a = calcAcceleration(fTrac, fRes, m);
  assert.ok(a > 0 && a < 6.0, `Aceleración debe ser físicamente realista, fue ${a}`);
});
