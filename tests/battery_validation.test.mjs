/**
 * Test Suite: Validación de los 7 casos de referencia (§12)
 * Fuente: Conocimientos_generales_en_baterías.md
 *
 * Ejecutable directamente con: node tests/battery_validation.test.mjs
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const BatteryData = require("../web/js/battery_data.js");
const BatteryPhysics = require("../web/js/battery_physics.js");

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     Details: ${JSON.stringify(details)}`);
    failedCount++;
  }
}

function approx(val, expected, tolerance = 0.02) {
  return Math.abs(val - expected) <= Math.abs(expected * tolerance) + 1e-4;
}

console.log("==================================================================");
console.log("  INICIANDO SUITE DE VALIDACIÓN: BATTERY DESIGN LAB (§12)");
console.log("==================================================================\n");

// -----------------------------------------------------------------------------
// V1 · BEV urbano 40 kWh (400 V, LFP 100 Ah)
// -----------------------------------------------------------------------------
console.log("▶ V1: Configuración de un BEV urbano de 40 kWh");
{
  const result = BatteryPhysics.dimensionPack({
    chemId: "LFP",
    cellId: "PRISM_LFP_100",
    coolingId: "liquid",
    eTargetKWh: 40,
    vBusV: 400,
    pPeakKW: 100,
    pContKW: 50
  });

  assert(result.ns === 125, "V1.1: Celdas en serie Ns = ceil(400 / 3.2) = 125", { ns: result.ns });
  assert(result.np === 1, "V1.2: Celdas en paralelo Np = 1", { np: result.np });
  assert(result.totalCells === 125, "V1.3: Total de celdas = 125", { totalCells: result.totalCells });
  assert(approx(result.eRealKWh, 40, 0.01), "V1.4: Energía real = 40 kWh", { eRealKWh: result.eRealKWh });
  assert(approx(result.massCellsKg, 250, 0.01), "V1.5: Masa celdas = 250 kg", { massCellsKg: result.massCellsKg });
  assert(approx(result.massPackKg, 300, 0.01), "V1.6: Masa pack (factor 1.20) = 300 kg", { massPackKg: result.massPackKg });
  assert(Math.round(result.densityWhKg) === 133, "V1.7: Densidad pack = 133 Wh/kg", { densityWhKg: result.densityWhKg });
  assert(approx(result.pAt2C_KW, 80, 0.01), "V1.8: Potencia a 2C = 80 kW", { pAt2C_KW: result.pAt2C_KW });
}

// -----------------------------------------------------------------------------
// V2 · Corrida a tres regímenes (60 kWh: 150 Ah, 400 V, Rint 0.08 Ω, 400 kg, adiabático UA=0)
// -----------------------------------------------------------------------------
console.log("\n▶ V2: Corrida a tres regímenes (60 kWh, Rint 0.08 Ω, 400 kg, UA = 0)");
{
  const basePack = {
    packVoltageV: 400,
    capAh: 150,
    rintOhm: 0.08,
    massKg: 400,
    cThJK: 400 * 900, // 360 kJ/K
    ua: 0
  };

  // Régimen 0.5C (75 A)
  const reg05 = BatteryPhysics.calcDischargeRegime({ ...basePack, cRate: 0.5 });
  assert(reg05.currentA === 75, "V2.1: Corriente a 0.5C = 75 A", { currentA: reg05.currentA });
  assert(reg05.vTerminal === 394, "V2.2: Tensión terminal a 0.5C = 394 V", { vTerminal: reg05.vTerminal });
  assert(approx(reg05.powerKW, 29.55, 0.01), "V2.3: Potencia a 0.5C ≈ 29.5 kW", { powerKW: reg05.powerKW });
  assert(approx(reg05.qGenKW, 0.45, 0.01), "V2.4: Calor I²R a 0.5C = 0.45 kW", { qGenKW: reg05.qGenKW });
  assert(approx(reg05.deltaTK, 9, 0.01), "V2.5: ΔT a 0.5C = +9 K", { deltaTK: reg05.deltaTK });

  // Régimen 1C (150 A)
  const reg1 = BatteryPhysics.calcDischargeRegime({ ...basePack, cRate: 1 });
  assert(reg1.currentA === 150, "V2.6: Corriente a 1C = 150 A", { currentA: reg1.currentA });
  assert(reg1.vTerminal === 388, "V2.7: Tensión terminal a 1C = 388 V", { vTerminal: reg1.vTerminal });
  assert(approx(reg1.powerKW, 58.2, 0.01), "V2.8: Potencia a 1C ≈ 58 kW", { powerKW: reg1.powerKW });
  assert(approx(reg1.qGenKW, 1.8, 0.01), "V2.9: Calor I²R a 1C = 1.8 kW", { qGenKW: reg1.qGenKW });
  assert(approx(reg1.deltaTK, 18, 0.01), "V2.10: ΔT a 1C = +18 K", { deltaTK: reg1.deltaTK });

  // Régimen 2C (300 A)
  const reg2 = BatteryPhysics.calcDischargeRegime({ ...basePack, cRate: 2 });
  assert(reg2.currentA === 300, "V2.11: Corriente a 2C = 300 A", { currentA: reg2.currentA });
  assert(reg2.vTerminal === 376, "V2.12: Tensión terminal a 2C = 376 V", { vTerminal: reg2.vTerminal });
  assert(approx(reg2.powerKW, 112.8, 0.01), "V2.13: Potencia a 2C ≈ 113 kW", { powerKW: reg2.powerKW });
  assert(approx(reg2.qGenKW, 7.2, 0.01), "V2.14: Calor I²R a 2C = 7.2 kW", { qGenKW: reg2.qGenKW });
  assert(approx(reg2.deltaTK, 36, 0.01), "V2.15: ΔT a 2C = +36 K", { deltaTK: reg2.deltaTK });
}

// -----------------------------------------------------------------------------
// V3 · Autonomía con y sin aire acondicionado (60 kWh, base 150 Wh/km a 90 km/h)
// -----------------------------------------------------------------------------
console.log("\n▶ V3: Autonomía con y sin aire acondicionado");
{
  // 1. Sin cargas auxiliares
  const baseRun = BatteryPhysics.calcAuxConsumption({
    baseConsumptionWhKm: 150,
    packEnergyWh: 60000,
    speedKmH: 90,
    loads: []
  });
  assert(approx(baseRun.rangeKm, 400, 0.01), "V3.1: Autonomía sin cargas = 400 km", { rangeKm: baseRun.rangeKm });

  // 2. Con A/C 3 kW al 60% a 90 km/h
  const acRun = BatteryPhysics.calcAuxConsumption({
    baseConsumptionWhKm: 150,
    packEnergyWh: 60000,
    speedKmH: 90,
    loads: [{ id: "ac", powerW: 3000, dutyPct: 60 }]
  });
  assert(approx(acRun.totalWhKm, 170, 0.01), "V3.2: Consumo total con A/C = 170 Wh/km", { totalWhKm: acRun.totalWhKm });
  assert(Math.round(acRun.rangeKm) === 353, "V3.3: Autonomía con A/C = 353 km (-12%)", { rangeKm: acRun.rangeKm });

  // 3. Con A/C 3 kW al 60% y PTC 4 kW al 60% a la vez
  const acPtcRun = BatteryPhysics.calcAuxConsumption({
    baseConsumptionWhKm: 150,
    packEnergyWh: 60000,
    speedKmH: 90,
    loads: [
      { id: "ac", powerW: 3000, dutyPct: 60 },
      { id: "ptc", powerW: 4000, dutyPct: 60 }
    ]
  });
  assert(Math.round(acPtcRun.totalWhKm) === 197, "V3.4: Consumo total con A/C + PTC = 197 Wh/km", { totalWhKm: acPtcRun.totalWhKm });
  assert(Math.round(acPtcRun.rangeKm) === 305, "V3.5: Autonomía con A/C + PTC = 305 km (-24%)", { rangeKm: acPtcRun.rangeKm });
}

// -----------------------------------------------------------------------------
// V4 · Arranque con plomo-ácido a 25 °C, 0 °C y -20 °C
// -----------------------------------------------------------------------------
console.log("\n▶ V4: Arranque con plomo-ácido (12 V, 300 A, 5 mΩ base)");
{
  const rBase = 0.005; // 5 mΩ a 25 °C
  const current = 300;

  // 25 °C
  const r25 = BatteryPhysics.calcRintTemp(rBase, 25);
  const vt25 = 12 - current * r25;
  assert(approx(r25, 0.005, 0.001), "V4.1: Rint a 25 °C = 5 mΩ", { r25 });
  assert(approx(vt25, 10.5, 0.01), "V4.2: Tensión terminal a 25 °C = 10.5 V", { vt25 });

  // 0 °C
  const r0 = BatteryPhysics.calcRintTemp(rBase, 0);
  const vt0 = 12 - current * r0;
  assert(approx(r0, 0.0075, 0.001), "V4.3: Rint a 0 °C = 7.5 mΩ", { r0 });
  assert(approx(vt0, 9.75, 0.01), "V4.4: Tensión terminal a 0 °C = 9.75 V", { vt0 });

  // -20 °C
  const rNeg20 = BatteryPhysics.calcRintTemp(rBase, -20);
  const vtNeg20 = 12 - current * rNeg20;
  assert(approx(rNeg20, 0.0095, 0.001), "V4.5: Rint a -20 °C = 9.5 mΩ", { rNeg20 });
  assert(approx(vtNeg20, 9.15, 0.01), "V4.6: Tensión terminal a -20 °C = 9.15 V", { vtNeg20 });
}

// -----------------------------------------------------------------------------
// V5 · Descarga en desuso
// -----------------------------------------------------------------------------
console.log("\n▶ V5: Descarga en desuso");
{
  // LFP 40 kWh, 2%/mes, 6 meses a 25 °C
  const lfp25 = BatteryPhysics.calcSelfDischarge({
    chemId: "LFP",
    eKWh: 40,
    months: 6,
    tempC: 25
  });
  assert(lfp25.totalLossPct === 12, "V5.1: Pérdida LFP 6 meses @ 25 °C = 12%", { totalLossPct: lfp25.totalLossPct });
  assert(approx(lfp25.lossKWh, 4.8, 0.01), "V5.2: Pérdida energía = 4.8 kWh", { lossKWh: lfp25.lossKWh });

  // LFP 40 kWh a 35 °C (Arrhenius factor 2)
  const lfp35 = BatteryPhysics.calcSelfDischarge({
    chemId: "LFP",
    eKWh: 40,
    months: 6,
    tempC: 35
  });
  assert(lfp35.arrheniusFactor === 2, "V5.3: Factor Arrhenius @ 35 °C = 2", { arrheniusFactor: lfp35.arrheniusFactor });
  assert(lfp35.totalLossPct === 24, "V5.4: Pérdida LFP 6 meses @ 35 °C = 24%", { totalLossPct: lfp35.totalLossPct });

  // Pb 60 Ah + parásita 50 mA durante 30 días
  const pbPar = BatteryPhysics.calcSelfDischarge({
    chemId: "PB_AGM",
    capAh: 60,
    parasiticDrainA: 0.05,
    days: 30
  });
  assert(approx(pbPar.parasiticAhLoss, 36, 0.01), "V5.5: Pérdida parásita Pb 30 días = 36 Ah", { parasiticAhLoss: pbPar.parasiticAhLoss });
  assert(approx(pbPar.parasiticLossPct, 60, 0.01), "V5.6: Porcentaje perdido = 60%", { parasiticLossPct: pbPar.parasiticLossPct });

  // NiMH 1.2 kWh, 25%/mes, 6 meses
  const nimh = BatteryPhysics.calcSelfDischarge({
    chemId: "NIMH",
    eKWh: 1.2,
    months: 6,
    tempC: 25
  });
  assert(nimh.totalLossPct > 100, "V5.7: NiMH en 6 meses se agota (> 100% descarga)", { totalLossPct: nimh.totalLossPct });
}

// -----------------------------------------------------------------------------
// V6 · Falla de una celda con resistencia alta (R×10)
// -----------------------------------------------------------------------------
console.log("\n▶ V6: Falla de una celda con resistencia alta");
{
  const faultCalc = BatteryPhysics.calcFaultCellRint({
    healthyRintOhm: 0.00025, // 0.25 mΩ
    faultMult: 10,           // 2.5 mΩ
    currentA: 300,
    ns: 125
  });

  assert(approx(faultCalc.heatHealthyW, 22.5, 0.01), "V6.1: Calor en celda sana = 22.5 W", { heatHealthyW: faultCalc.heatHealthyW });
  assert(approx(faultCalc.heatFaultW, 225.0, 0.01), "V6.2: Calor en celda fallada = 225 W", { heatFaultW: faultCalc.heatFaultW });
  assert(approx(faultCalc.packVoltageDropV, 0.675, 0.01), "V6.3: Caída extra de tensión pack ≈ 0.7 V (0.675 V)", { packVoltageDropV: faultCalc.packVoltageDropV });
}

// -----------------------------------------------------------------------------
// V7 · Recuperación de frenado
// -----------------------------------------------------------------------------
console.log("\n▶ V7: Recuperación de frenado");
{
  const regen = BatteryPhysics.calcRegenBraking({
    vehicleMassKg: 1700,
    speedKmH: 60,
    etaRegen: 0.60,
    packCapAh: 150,
    packVoltageV: 400,
    maxCRate: 0.8
  });

  assert(Math.round(regen.eRegenKJ) === 142, "V7.1: Energía recuperada ≈ 142 kJ", { eRegenKJ: regen.eRegenKJ });
  assert(approx(regen.eRegenKWh, 0.039, 0.05), "V7.2: Energía en kWh ≈ 0.039 kWh", { eRegenKWh: regen.eRegenKWh });
  assert(approx(regen.pRegenMaxKW, 48, 0.01), "V7.3: Potencia de carga a 0.8C = 48 kW", { pRegenMaxKW: regen.pRegenMaxKW });
  assert(Math.round(regen.timeAbsorbS) === 3, "V7.4: Tiempo de absorción de la energía ≈ 3 s", { timeAbsorbS: regen.timeAbsorbS });
}

// -----------------------------------------------------------------------------
// Resumen final
// -----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`  RESUMEN DE PRUEBAS: ${passedCount} PASADAS | ${failedCount} FALLIDAS`);
console.log("==================================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("  🎉 Todos los 7 casos de validación coinciden exactamente con §12.");
}
