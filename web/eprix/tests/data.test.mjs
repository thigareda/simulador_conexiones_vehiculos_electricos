/**
 * tests/data.test.mjs
 * Validación del modelo de datos congelado, trazabilidad al grafo y citas canónicas.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CARS_DATA, CARS_LIST } from '../data/cars.js';
import { CHEMISTRY_DATA, CONCEPT_TRAPS } from '../data/chemistry.js';
import { CIRCUITS, CIRCUIT_LIST } from '../data/circuits.js';

test('Data: Catálogo de 16 combinaciones exactas (4 plataformas x 4 químicas)', () => {
  assert.equal(CARS_LIST.length, 16, 'Deben existir exactamente 16 combinaciones de coches');

  const platforms = new Set();
  const chemistries = new Set();

  for (const car of CARS_LIST) {
    platforms.add(car.plataforma);
    chemistries.add(car.quimica);

    // Validación de campos derivados (§6)
    const chemSpec = CHEMISTRY_DATA[car.quimica.toUpperCase()];
    assert.ok(chemSpec, `Química ${car.quimica} debe existir en CHEMISTRY_DATA`);

    // v_nominal = celdas_serie * v_celda
    const vExpected = +(car.bateria.celdas_serie * chemSpec.v_nominal_celda).toFixed(2);
    assert.equal(car.bateria.v_nominal, vExpected, `v_nominal debe derivarse de celdas_serie * v_celda para ${car.id}`);

    // energia_kwh = capacidad_ah * v_nominal / 1000
    const eExpected = +((car.bateria.capacidad_ah * car.bateria.v_nominal) / 1000.0).toFixed(2);
    assert.equal(car.bateria.energia_kwh, eExpected, `energia_kwh debe derivarse de capacidad_ah * v_nominal para ${car.id}`);

    // masa_kg debe incluir masa_base + m_pack + 75 kg conductor
    const mExpected = Math.round(car.masa_base_kg + car.m_pack_kg + 75);
    assert.equal(car.masa_kg, mExpected, `masa_kg debe ser suma de base, pack y conductor para ${car.id}`);
  }

  assert.equal(platforms.size, 4, 'Deben existir 4 plataformas distintas');
  assert.equal(chemistries.size, 4, 'Deben existir 4 químicas distintas (LFP, NCM, NiMH, Plomo)');
});

test('Data: Citas canónicas y anti-alucinación [F30·s01-s50], [F31·s01-s69]', () => {
  const f30Regex = /^\[F30·s([0-4][0-9]|50)\]$/;
  const f31Regex = /^\[F31·s([0-5][0-9]|6[0-9])\]$/;

  for (const car of CARS_LIST) {
    for (const cita of car.citas) {
      const isValid = f30Regex.test(cita) || f31Regex.test(cita);
      assert.ok(isValid, `Cita no permitida o fuera de rango en ${car.id}: ${cita}`);
    }
  }

  // Verificar que LTO no posee anclas F30/F31
  const lto = CHEMISTRY_DATA['LTO'];
  assert.equal(lto.citas.length, 0, 'LTO no debe tener citas F31 conforme a regla de diseño');
});

test('Data: 4 Circuitos generados y waypoints válidos', () => {
  assert.equal(CIRCUIT_LIST.length, 4, 'Deben existir exactamente 4 circuitos');

  for (const c of CIRCUIT_LIST) {
    const full = CIRCUITS[c.id];
    assert.ok(full.waypoints.length >= 600, `Circuito ${c.id} debe tener waypoints densos (>= 600)`);
    assert.ok(c.longitud_km >= 3.5 && c.longitud_km <= 5.5, `Longitud de ${c.id} debe estar entre 3.5 y 5.5 km`);

    // Cada waypoint: [x, y, s, kappa, vmax]
    for (const wp of full.waypoints) {
      assert.equal(wp.length, 5, 'Cada waypoint debe ser [x, y, s, kappa, vmax]');
      assert.ok(wp[4] >= 11.0 && wp[4] <= 89.0, 'vmax debe estar acotada entre 40 y 320 km/h (11 a 89 m/s)');
    }
  }
});

test('Data: Las 5 trampas didácticas canónicas (§3.9)', () => {
  assert.equal(CONCEPT_TRAPS.length, 5, 'Deben existir exactamente 5 trampas conceptuales');
  for (const trap of CONCEPT_TRAPS) {
    assert.ok(trap.afirmacion_falsa, 'Debe incluir la afirmación errónea');
    assert.ok(trap.correccion, 'Debe incluir la corrección técnica fundamentada');
    assert.ok(trap.cita, 'Debe incluir cita al corpus F30/F31');
    assert.equal(trap.opciones.length, 3, 'El quiz debe tener 3 opciones');
    assert.ok(trap.correcta >= 0 && trap.correcta <= 2, 'Índice de respuesta válida');
  }
});
