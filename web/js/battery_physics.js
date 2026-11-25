/**
 * Battery Design Lab — Motor físico y de simulación
 * Fuente de verdad: Conocimientos_generales_en_baterías.md
 *
 * Módulo UMD puro (sin DOM): ejecutable en Node.js para pruebas automatizadas
 * o en el navegador mediante window.BatteryPhysics.
 *
 * Cumple estrictamente con las ecuaciones de §2, §5.1, §6, §7, §8, §9 y los
 * 7 casos de validación (V1 a V7) de la Sección 12.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    const BatteryData = require("./battery_data.js");
    module.exports = factory(BatteryData);
  } else {
    root.BatteryPhysics = factory(root.BatteryData);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (BatteryData) {
  "use strict";

  if (!BatteryData) {
    throw new Error("BatteryPhysics requires BatteryData");
  }

  const {
    PACK_MASS_FACTOR,
    CP_PACK_J_KG_K,
    PACKING_FACTOR,
    COOLING,
    CHEMISTRIES,
    CELLS,
    BMS_ALARMS,
    FAULT_MODEL
  } = BatteryData;

  // ---------------------------------------------------------------------------
  // §5.1 Dimensionamiento del Pack (V1)
  // ---------------------------------------------------------------------------
  function dimensionPack(params) {
    const chem = CHEMISTRIES[params.chemId] || CHEMISTRIES.LFP;
    const cell = CELLS[params.cellId] || CELLS.PRISM_LFP_100;
    const cooling = COOLING[params.coolingId] || COOLING.liquid;
    const vCell = cell.vnom || chem.vnom;

    const eTargetKWh = Number(params.eTargetKWh);
    const vBusV = Number(params.vBusV);
    const pPeakKW = Number(params.pPeakKW);
    const pContKW = Number(params.pContKW);

    // 1. Ns = ceil(V_bus / V_celda) (§5.1)
    const ns = Math.ceil(vBusV / vCell);

    // 2. Capacidad objetivo (Ah) = E_target (Wh) / (Ns * V_celda) (§5.1)
    const targetCapAh = (eTargetKWh * 1000) / (ns * vCell);

    // 3. Np = ceil(Capacidad_objetivo / C_celda) (§5.1)
    const np = Math.max(1, Math.ceil(targetCapAh / cell.capacityAh));

    // 4. Parámetros totales del pack
    const totalCells = ns * np;
    const vNom = ns * vCell;
    const vMin = ns * chem.vmin;
    const vMax = ns * chem.vmax;
    const capAh = np * cell.capacityAh;
    const eRealKWh = (vNom * capAh) / 1000;

    // 5. Masa y volumen
    const massCellsKg = totalCells * cell.massKg;
    const massPackKg = massCellsKg * PACK_MASS_FACTOR;
    const volCellsL = totalCells * cell.volumeL;
    const pf = PACKING_FACTOR[cell.shape] || 0.65;
    const volPackL = volCellsL / pf;

    // 6. Densidades y costo
    const densityWhKg = (eRealKWh * 1000) / massPackKg;
    const densityWhL = (eRealKWh * 1000) / volPackL;
    const costTotal = eRealKWh * chem.costPerKWh;

    // 7. Resistencia y térmica
    const rintPack = (ns / np) * cell.rintOhm;
    const cThJK = massPackKg * CP_PACK_J_KG_K;
    const ua = cooling.ua;

    // 8. Corrientes y C-rates requeridos
    const iContReq = (pContKW * 1000) / vNom;
    const cContReq = capAh > 0 ? iContReq / capAh : 0;

    const iPeakReq = (pPeakKW * 1000) / vNom;
    const cPeakReq = capAh > 0 ? iPeakReq / capAh : 0;

    // 9. Potencia a C-rates de diseño
    const pAt1C_KW = (1 * capAh * vNom) / 1000;
    const pAt2C_KW = (2 * capAh * vNom) / 1000;

    // 10. Verificaciones de viabilidad (§5.1)
    const maxContC = chem.dischargeContC[1];
    const maxPeakC = chem.dischargePeakC[1];
    const maxChemPowerKW = (massCellsKg * chem.wKg[1]) / 1000;

    const okPowerCont = cContReq <= maxContC;
    const okPowerPeak = cPeakReq <= maxPeakC && pPeakKW <= maxChemPowerKW;
    const okEnergy = eRealKWh >= eTargetKWh * 0.98; // tolerancia por redondeo entero
    const okAll = okPowerCont && okPowerPeak && okEnergy;

    return {
      ns,
      np,
      totalCells,
      vNom,
      vMin,
      vMax,
      capAh,
      eRealKWh,
      massCellsKg,
      massPackKg,
      volCellsL,
      volPackL,
      densityWhKg,
      densityWhL,
      costTotal,
      costPerKWh: chem.costPerKWh,
      rintPack,
      cThJK,
      ua,
      iContReq,
      cContReq,
      iPeakReq,
      cPeakReq,
      pAt1C_KW,
      pAt2C_KW,
      maxContC,
      maxPeakC,
      maxChemPowerKW,
      checks: {
        okPowerCont,
        okPowerPeak,
        okEnergy,
        okAll
      }
    };
  }

  // ---------------------------------------------------------------------------
  // §7.3 Curvas Voc(SOC)
  // ---------------------------------------------------------------------------
  function calcVocCell(chemId, socPct) {
    const chem = CHEMISTRIES[chemId] || CHEMISTRIES.LFP;
    const soc = Math.max(0, Math.min(100, socPct));
    const s = soc / 100; // fracción 0..1

    if (chemId === "LFP") {
      // Voc ≈ 3,20 + 0,06·(SOC/100) en meseta (10-90%)
      if (soc < 10) {
        return chem.vmin + (3.20 + 0.06 * 0.1 - chem.vmin) * (soc / 10);
      } else if (soc > 90) {
        return (3.20 + 0.06 * 0.9) + (chem.vmax - (3.20 + 0.06 * 0.9)) * ((soc - 90) / 10);
      }
      return 3.20 + 0.06 * s;
    }

    if (chemId === "NCM" || chemId === "LMO") {
      // Voc ≈ 3,55 + 0,55·(SOC/100)
      if (soc < 10) {
        return chem.vmin + (3.55 + 0.55 * 0.1 - chem.vmin) * (soc / 10);
      } else if (soc > 90) {
        return (3.55 + 0.55 * 0.9) + (chem.vmax - (3.55 + 0.55 * 0.9)) * ((soc - 90) / 10);
      }
      return 3.55 + 0.55 * s;
    }

    if (chemId === "PB_FLOODED" || chemId === "PB_AGM") {
      // Voc celda = (11,6 + 0,10·(SOC/100)·10) / 6 = (11,6 + 1,0·s) / 6
      return (11.6 + 1.0 * s) / 6;
    }

    if (chemId === "NIMH" || chemId === "NICD") {
      // Voc ≈ 1,20 + 0,15·s
      return 1.20 + 0.15 * s;
    }

    // Default con a y b
    if (chem.voc) {
      return chem.voc.a + chem.voc.b * s;
    }
    return chem.vnom;
  }

  // ---------------------------------------------------------------------------
  // §7.4 Factor de resistencia interna con temperatura
  // Rint(T) = Rint_25 · (1 + 0,02 · max(0, 25 − T))
  // ---------------------------------------------------------------------------
  function calcRintTempFactor(tempC) {
    return 1 + 0.02 * Math.max(0, 25 - tempC);
  }

  function calcRintTemp(rint25, tempC) {
    return rint25 * calcRintTempFactor(tempC);
  }

  // ---------------------------------------------------------------------------
  // §7.2 / V2 Régimen de descarga y calentamiento
  // ---------------------------------------------------------------------------
  function calcDischargeRegime(params) {
    // params: { packVoltageV, capAh, rintOhm, cThJK, massKg, cRate, ua }
    const vNom = params.packVoltageV;
    const capAh = params.capAh;
    const rint = params.rintOhm;
    const cTh = params.cThJK || (params.massKg * CP_PACK_J_KG_K);
    const cRate = params.cRate;
    const ua = params.ua !== undefined ? params.ua : 0; // en V2 es adiabático (UA = 0)

    const currentA = cRate * capAh;
    const vDrop = currentA * rint;
    const vTerminal = vNom - vDrop;
    const powerW = currentA * vTerminal;
    const powerKW = powerW / 1000;
    const qGenW = currentA * currentA * rint;
    const qGenKW = qGenW / 1000;

    // Duración de la descarga completa a este C-rate: t (s) = 3600 / cRate
    const tDischargeS = 3600 / cRate;

    // En condición adiabática (UA = 0): ΔT = Q_gen * t / C_th
    // Si UA > 0: solución analítica del balance térmico T(t) - Tamb = (Q_gen/UA)*(1 - exp(-UA*t/Cth))
    let deltaTK = 0;
    if (ua === 0) {
      deltaTK = (qGenW * tDischargeS) / cTh;
    } else {
      deltaTK = (qGenW / ua) * (1 - Math.exp((-ua * tDischargeS) / cTh));
    }

    return {
      cRate,
      currentA,
      vDrop,
      vTerminal,
      powerKW,
      qGenKW,
      tDischargeS,
      deltaTK
    };
  }

  // ---------------------------------------------------------------------------
  // §6 / V3 Cargas auxiliares y autonomía
  // ---------------------------------------------------------------------------
  const DEFAULT_AUX_CATALOG = [
    { id: "ac", name: "Climatización (A/C)", powerW: 3000, defaultDuty: 60, hv: true },
    { id: "ptc", name: "Calefactor PTC", powerW: 4000, defaultDuty: 0, hv: true },
    { id: "heatpump", name: "Bomba de calor", powerW: 1500, defaultDuty: 0, hv: true },
    { id: "seats", name: "Calefacción de asientos", powerW: 120, defaultDuty: 0, hv: false },
    { id: "defrost", name: "Desempañador térmico", powerW: 250, defaultDuty: 0, hv: false },
    { id: "audio", name: "Sistema de audio", powerW: 60, defaultDuty: 80, hv: false },
    { id: "screen", name: "Pantalla e infoentretenimiento", powerW: 40, defaultDuty: 100, hv: false },
    { id: "lights", name: "Faros LED y luces", powerW: 80, defaultDuty: 50, hv: false },
    { id: "wipers", name: "Limpiaparabrisas", powerW: 100, defaultDuty: 0, hv: false },
    { id: "adas", name: "Computadora ADAS / Sensores", powerW: 150, defaultDuty: 100, hv: false },
    { id: "usb", name: "Cargadores USB / Accesorios", powerW: 50, defaultDuty: 40, hv: false },
    { id: "parasitic", name: "Consumo parásito de reposo", powerW: 15, defaultDuty: 100, hv: false }
  ];

  function calcAuxConsumption(options) {
    const baseWhKm = options.baseConsumptionWhKm || 150;
    const packEnergyWh = options.packEnergyWh || 60000;
    const speedKmH = options.speedKmH || 90;
    const activeLoads = options.loads || [];

    // Suma de potencia efectiva de cargas auxiliares: W_aux = sum(P_i * duty_i / 100)
    let totalAuxPowerW = 0;
    activeLoads.forEach((load) => {
      const duty = load.dutyPct !== undefined ? load.dutyPct : 0;
      totalAuxPowerW += load.powerW * (duty / 100);
    });

    // Consumo auxiliar por km = P_aux_W / speed_km_h (Wh/km)
    const auxWhKm = speedKmH > 0 ? totalAuxPowerW / speedKmH : 0;
    const totalWhKm = baseWhKm + auxWhKm;
    const rangeKm = totalWhKm > 0 ? packEnergyWh / totalWhKm : 0;
    const rangeDropPct = baseWhKm > 0 ? ((baseWhKm / totalWhKm) - 1) * -100 : 0;

    return {
      baseWhKm,
      auxWhKm,
      totalWhKm,
      rangeKm,
      rangeDropPct,
      totalAuxPowerW,
      speedKmH
    };
  }

  // ---------------------------------------------------------------------------
  // §3.1 / V5 Autodescarga y descarga en almacenamiento
  // ---------------------------------------------------------------------------
  function calcSelfDischarge(options) {
    // options: { chemId, eKWh, capAh, months, tempC, parasiticDrainA, days }
    const chem = CHEMISTRIES[options.chemId] || CHEMISTRIES.LFP;
    const tempC = options.tempC !== undefined ? options.tempC : 25;
    const months = options.months !== undefined ? options.months : 6;

    // Factor Arrhenius: 2^((T - 25) / 10) (§7.6 y V5)
    const arrheniusFactor = Math.pow(2, (tempC - 25) / 10);
    const baseMonthlyPct = chem.selfDischargeMonthly;
    const effectiveMonthlyPct = baseMonthlyPct * arrheniusFactor;

    // Pérdida acumulada por química en N meses:
    const totalLossPct = effectiveMonthlyPct * months;
    const eKWh = options.eKWh || 40;
    const lossKWh = eKWh * (totalLossPct / 100);

    // Caso batería de plomo con corriente parásita (V5):
    let parasiticAhLoss = 0;
    let parasiticLossPct = 0;
    if (options.parasiticDrainA && options.days && options.capAh) {
      const dailyAh = options.parasiticDrainA * 24;
      parasiticAhLoss = dailyAh * options.days;
      parasiticLossPct = (parasiticAhLoss / options.capAh) * 100;
    }

    return {
      baseMonthlyPct,
      effectiveMonthlyPct,
      arrheniusFactor,
      months,
      totalLossPct,
      lossKWh,
      remainingKWh: Math.max(0, eKWh - lossKWh),
      parasiticAhLoss,
      parasiticLossPct
    };
  }

  // ---------------------------------------------------------------------------
  // §8.1 / V6 Falla de celda con resistencia alta
  // ---------------------------------------------------------------------------
  function calcFaultCellRint(params) {
    // params: { healthyRintOhm, faultMult, currentA, ns }
    const rHealthy = params.healthyRintOhm;
    const mult = params.faultMult || 10;
    const rFault = rHealthy * mult;
    const currentA = params.currentA;

    const heatHealthyW = currentA * currentA * rHealthy;
    const heatFaultW = currentA * currentA * rFault;
    const packVoltageDropV = currentA * (rFault - rHealthy);

    return {
      heatHealthyW,
      heatFaultW,
      heatRatio: heatHealthyW > 0 ? heatFaultW / heatHealthyW : mult,
      packVoltageDropV
    };
  }

  // ---------------------------------------------------------------------------
  // §9.3 / V7 Recuperación de frenado
  // ---------------------------------------------------------------------------
  function calcRegenBraking(params) {
    // params: { vehicleMassKg, speedKmH, etaRegen, packCapAh, packVoltageV, maxCRate }
    const massKg = params.vehicleMassKg || 1700;
    const speedKmH = params.speedKmH || 60;
    const speedMS = speedKmH / 3.6; // 60 km/h = 16.6667 m/s (en V7 redondeado a 16.7)
    const etaRegen = params.etaRegen !== undefined ? params.etaRegen : 0.60;

    // E_cinetica = 0.5 * m * v² (J)
    const eKineticJ = 0.5 * massKg * Math.pow(speedMS, 2);
    // E_recuperada = E_cinetica * eta_regen
    const eRegenJ = eKineticJ * etaRegen;
    const eRegenKJ = eRegenJ / 1000;
    const eRegenKWh = eRegenJ / 3.6e6;

    // Potencia máxima de regeneración (limitada por C-rate de carga)
    const maxC = params.maxCRate || 0.8;
    const capAh = params.packCapAh || 150;
    const vPack = params.packVoltageV || 400;

    const iRegenMaxA = maxC * capAh;
    const pRegenMaxW = iRegenMaxA * vPack;
    const pRegenMaxKW = pRegenMaxW / 1000;

    // Tiempo necesario para absorber la energía a potencia máxima:
    const timeAbsorbS = pRegenMaxW > 0 ? eRegenJ / pRegenMaxW : 0;

    return {
      eKineticJ,
      eKineticKJ: eKineticJ / 1000,
      eRegenJ,
      eRegenKJ,
      eRegenKWh,
      iRegenMaxA,
      pRegenMaxKW,
      timeAbsorbS
    };
  }

  // ---------------------------------------------------------------------------
  // §7.6 Envejecimiento (SOH por ciclos y calendario)
  // ---------------------------------------------------------------------------
  function calcDegradation(params) {
    const chem = CHEMISTRIES[params.chemId] || CHEMISTRIES.LFP;
    const cyclesNominal = chem.cyclesNominal || 3000;
    const dod = params.dodPct !== undefined ? params.dodPct : 80;
    const cyclesEquiv = (params.cyclesCount || 0) * (dod / 100);
    const cRate = params.cRate || 1;
    const years = params.yearsInService || 0;
    const avgTempC = params.avgTempC !== undefined ? params.avgTempC : 25;

    // Estrés por C-rate: (1 + 0.1 * max(0, C_rate - 1)) (§7.6)
    const cRateStress = 1 + 0.1 * Math.max(0, cRate - 1);

    // Pérdida por ciclo = 20% * (ciclos_equiv / ciclos_nom)^0.8 * estrés
    const cycleRatio = cyclesNominal > 0 ? cyclesEquiv / cyclesNominal : 0;
    const fadeCyclePct = 20 * Math.pow(cycleRatio, 0.8) * cRateStress;

    // Pérdida por calendario = calFadePerYear * años * 2^((T - 25)/10)
    const calRate = chem.calFadePerYear || 2;
    const arrhenius = Math.pow(2, (avgTempC - 25) / 10);
    const fadeCalPct = calRate * years * arrhenius;

    const totalFade = fadeCyclePct + fadeCalPct;
    const soh = Math.max(0, Math.min(100, 100 - totalFade));

    // Resistencia interna envejecida: Rint = Rint0 * (1 + 0.6*(1 - SOH/100)) (§7.2)
    const rintGrowthFactor = 1 + 0.6 * (1 - soh / 100);

    return {
      soh,
      fadeCyclePct,
      fadeCalPct,
      totalFade,
      rintGrowthFactor,
      isEol: soh <= 70 // Fin de primera vida útil automotriz (§9.2)
    };
  }

  // ---------------------------------------------------------------------------
  // §8 & §9 Evaluador de Fallas y Matriz de Alarmas BMS
  // ---------------------------------------------------------------------------
  function evaluateBmsState(state, packConfig, activeFaults, bypassRunaway) {
    // state: {
    //   socPct, vPack, currentA, tempPackC, tempCellMaxC, tempCellMinC,
    //   cellVoltages: [], dTdtKPerS, isolationOhmPerV, sohPct
    // }
    const alarms = [];
    const chem = CHEMISTRIES[packConfig.chemId] || CHEMISTRIES.LFP;
    const faults = activeFaults || {};

    let contactorOpen = false;
    let deratePower = false;
    let limpMode = false;
    let highestLevel = 0;

    function addAlarm(signal, level, value, unit, desc) {
      if (level > highestLevel) highestLevel = level;
      alarms.push({
        signal,
        level,
        levelClass: BatteryData.LEVEL_CLASS[level],
        value,
        unit,
        desc
      });
      if (level === 3) contactorOpen = true;
      if (level === 2) limpMode = true;
      if (level === 1) deratePower = true;
    }

    // 1. Inyección directa de fallas que fuerzan estado
    if (faults.F_PACK_CONTACTOR || faults.F_SYS_DCDC || faults.F_PACK_MSD) {
      addAlarm("contactors", 3, 0, "A", "Contacto abierto o corte de red 12 V / MSD");
    }

    if (faults.F_SYS_CAN) {
      addAlarm("canBus", 2, 0, "baud", "Pérdida de comunicación CAN: limp mode activado");
    }

    if (faults.F_SYS_DERATE) {
      addAlarm("derate", 1, 50, "%", "Límite de potencia por firmware al 50%");
    }

    if (faults.F_PACK_ISO) {
      addAlarm("isolation", 3, FAULT_MODEL.isoFaultOhmPerV, "Ω/V", "Falla de aislamiento crítica (< 100 Ω/V)");
    }

    // 2. Verificación de SOC (§9.2: 20% alerta, 10% falla, 5% crítico)
    const soc = state.socPct;
    if (soc <= BMS_ALARMS.soc.thresholds[2]) {
      addAlarm("soc", 3, soc, "%", "SOC crítico (≤ 5%): corte de tracción inminente");
    } else if (soc <= BMS_ALARMS.soc.thresholds[1]) {
      addAlarm("soc", 2, soc, "%", "SOC bajo (≤ 10%): advertencia de carga inmediata");
    } else if (soc <= BMS_ALARMS.soc.thresholds[0]) {
      addAlarm("soc", 1, soc, "%", "SOC reserva (≤ 20%): alerta en panel");
    }

    // 3. Verificación de Tensión de Celda (mínima y máxima)
    const vCells = state.cellVoltages || [state.vPack / packConfig.ns];
    const vMinCell = Math.min(...vCells);
    const vMaxCell = Math.max(...vCells);

    if (vMinCell <= chem.vmin) {
      addAlarm("vCellDis", 3, vMinCell, "V", `Subtensión severa de celda (≤ ${chem.vmin} V)`);
    } else if (vMinCell <= chem.vmin * 1.02) {
      addAlarm("vCellDis", 1, vMinCell, "V", `Alerta de tensión mínima de celda próxima al corte`);
    }

    if (vMaxCell >= chem.vmax) {
      addAlarm("vCellChg", 3, vMaxCell, "V", `Sobretensión severa de celda (≥ ${chem.vmax} V)`);
    } else if (vMaxCell >= chem.vmax * 0.98) {
      addAlarm("vCellChg", 1, vMaxCell, "V", `Alerta de tensión máxima de celda`);
    }

    // 4. Desequilibrio entre celdas (mV)
    const imbalanceMv = (vMaxCell - vMinCell) * 1000;
    if (imbalanceMv >= BMS_ALARMS.imbalance.thresholds[2]) {
      addAlarm("imbalance", 3, imbalanceMv.toFixed(0), "mV", "Desequilibrio crítico entre celdas (≥ 150 mV)");
    } else if (imbalanceMv >= BMS_ALARMS.imbalance.thresholds[1]) {
      addAlarm("imbalance", 2, imbalanceMv.toFixed(0), "mV", "Desequilibrio alto (≥ 50 mV)");
    } else if (imbalanceMv >= BMS_ALARMS.imbalance.thresholds[0]) {
      addAlarm("imbalance", 1, imbalanceMv.toFixed(0), "mV", "Desequilibrio incipiente (≥ 30 mV)");
    }

    // 5. Temperatura máxima y gradiente térmico ΔT
    const tMax = state.tempCellMaxC !== undefined ? state.tempCellMaxC : state.tempPackC;
    const tMin = state.tempCellMinC !== undefined ? state.tempCellMinC : state.tempPackC;
    const deltaT = tMax - tMin;

    if (tMax >= BMS_ALARMS.temp.thresholds[2]) {
      addAlarm("temp", 3, tMax.toFixed(1), "°C", "Sobretemperatura crítica (≥ 60 °C): corte térmico");
    } else if (tMax >= BMS_ALARMS.temp.thresholds[1]) {
      addAlarm("temp", 2, tMax.toFixed(1), "°C", "Temperatura alta (≥ 55 °C): reducción de potencia");
    } else if (tMax >= BMS_ALARMS.temp.thresholds[0]) {
      addAlarm("temp", 1, tMax.toFixed(1), "°C", "Alerta térmica (≥ 45 °C): refrigeración máxima");
    }

    if (deltaT >= BMS_ALARMS.dTcells.thresholds[2]) {
      addAlarm("dTcells", 3, deltaT.toFixed(1), "K", "ΔT térmico crítico entre celdas (≥ 8 K)");
    } else if (deltaT >= BMS_ALARMS.dTcells.thresholds[1]) {
      addAlarm("dTcells", 2, deltaT.toFixed(1), "K", "ΔT alto entre celdas (≥ 5 K)");
    } else if (deltaT >= BMS_ALARMS.dTcells.thresholds[0]) {
      addAlarm("dTcells", 1, deltaT.toFixed(1), "K", "ΔT térmico incipiente (≥ 3 K)");
    }

    // 6. Tasa de aumento térmico dT/dt (K/s)
    if (state.dTdtKPerS !== undefined) {
      if (state.dTdtKPerS >= BMS_ALARMS.dTdt.thresholds[2]) {
        // 1 K/s -> indicio certero de fuga térmica (§9.2)
        addAlarm("dTdt", 3, state.dTdtKPerS.toFixed(2), "K/s", "Disparo térmico en progreso (dT/dt ≥ 1 K/s)");
      } else if (state.dTdtKPerS >= BMS_ALARMS.dTdt.thresholds[1]) {
        addAlarm("dTdt", 2, (state.dTdtKPerS * 60).toFixed(1), "K/min", "Aumento térmico anómalo (≥ 0.5 K/min)");
      }
    }

    // 7. Aislamiento eléctrico (Ω/V)
    const iso = state.isolationOhmPerV !== undefined ? state.isolationOhmPerV : 1000;
    if (iso <= BMS_ALARMS.isolation.thresholds[2]) {
      addAlarm("isolation", 3, iso, "Ω/V", "Pérdida crítica de aislamiento (≤ 100 Ω/V)");
    } else if (iso <= BMS_ALARMS.isolation.thresholds[1]) {
      addAlarm("isolation", 2, iso, "Ω/V", "Aislamiento degradado (≤ 200 Ω/V)");
    } else if (iso <= BMS_ALARMS.isolation.thresholds[0]) {
      addAlarm("isolation", 1, iso, "Ω/V", "Alerta de aislamiento (≤ 500 Ω/V)");
    }

    // 8. Sobrecorriente
    const maxI = packConfig.capAh * chem.dischargePeakC[1];
    const currentRatio = maxI > 0 ? Math.abs(state.currentA) / maxI : 0;
    if (currentRatio >= BMS_ALARMS.overcurrent.thresholds[2]) {
      addAlarm("overcurrent", 3, currentRatio.toFixed(2), "×Imax", "Sobrecorriente destructiva (≥ 1.5×Imax): corte");
    } else if (currentRatio >= BMS_ALARMS.overcurrent.thresholds[1]) {
      addAlarm("overcurrent", 2, currentRatio.toFixed(2), "×Imax", "Sobrecorriente de alarma (≥ 1.25×Imax)");
    } else if (currentRatio >= BMS_ALARMS.overcurrent.thresholds[0]) {
      addAlarm("overcurrent", 1, currentRatio.toFixed(2), "×Imax", "Alerta de corriente elevada (≥ 1.1×Imax)");
    }

    // 9. SOH
    if (state.sohPct !== undefined) {
      if (state.sohPct <= BMS_ALARMS.soh.thresholds[2]) {
        addAlarm("soh", 3, state.sohPct.toFixed(0), "%", "Batería en fin de vida automotriz (SOH ≤ 60%)");
      } else if (state.sohPct <= BMS_ALARMS.soh.thresholds[1]) {
        addAlarm("soh", 2, state.sohPct.toFixed(0), "%", "SOH degradado (≤ 70%)");
      } else if (state.sohPct <= BMS_ALARMS.soh.thresholds[0]) {
        addAlarm("soh", 1, state.sohPct.toFixed(0), "%", "Aviso de envejecimiento (SOH ≤ 80%)");
      }
    }

    // Manejo de Fuga Térmica y Bypass para fines pedagógicos
    let thermalRunawayActive = false;
    if (faults.F_CELL_RUNAWAY || tMax >= 80 || (state.dTdtKPerS && state.dTdtKPerS >= 1)) {
      thermalRunawayActive = true;
      if (bypassRunaway) {
        // En bypass pedagógico, se anula la desconexión del BMS para ilustrar la propagación descontrolada
        contactorOpen = false;
      }
    }

    const action = contactorOpen
      ? "open_contactors"
      : limpMode
      ? "limp"
      : deratePower
      ? "derate"
      : "normal";

    return {
      alarms,
      highestLevel,
      contactorOpen,
      deratePower,
      limpMode,
      action,
      thermalRunawayActive
    };
  }

  // ---------------------------------------------------------------------------
  // §7.2 Bucle de simulación temporal dinámico
  // ---------------------------------------------------------------------------
  function simulateStep(state, config, dt, activeFaults, bypassRunaway) {
    const faults = activeFaults || {};
    const chem = CHEMISTRIES[config.chemId] || CHEMISTRIES.LFP;
    const cell = CELLS[config.cellId] || CELLS.PRISM_LFP_100;

    let targetCurrentA = state.targetCurrentA !== undefined ? state.targetCurrentA : 0;
    const tAmbC = state.tAmbC !== undefined ? state.tAmbC : 25;

    // Evaluación previa del BMS
    const bms = evaluateBmsState(state, config, faults, bypassRunaway);

    // Ajuste de corriente según decisión BMS
    let currentA = targetCurrentA;
    if (bms.contactorOpen) {
      currentA = 0;
    } else if (bms.limpMode) {
      currentA = currentA * FAULT_MODEL.limpFactor;
    } else if (bms.deratePower) {
      currentA = currentA * FAULT_MODEL.firmwareDerateFactor;
    }

    // Resistencia con temperatura
    const rFactor = calcRintTempFactor(state.tempPackC);
    let rPack = config.rintPack * rFactor;

    // Inyección de falla de conexión floja en módulo o fuga
    if (faults.F_MOD_BUS) {
      rPack += faults.F_MOD_BUS.magnitude || 0.003;
    }

    // Tensión Voc
    const vocPack = config.ns * calcVocCell(config.chemId, state.socPct);
    const vDrop = currentA * rPack;
    let vt = Math.max(config.vMin, vocPack - vDrop);

    // Si cortocircuito en celda/módulo o circuito abierto
    if (faults.F_MOD_OPEN || faults.F_CELL_OPEN) {
      vt -= (cell.vnom || chem.vnom);
    }

    const powerW = vt * currentA;

    // Actualización coulómbica de SOC: dAh = I * dt / 3600
    const dAh = (currentA * dt) / 3600;
    const eta = chem.etaCoul || 0.96;
    let deltaSoc = 0;
    if (currentA >= 0) {
      // Descarga
      deltaSoc = -(100 * dAh) / (config.capAh * eta);
    } else {
      // Carga
      deltaSoc = -(100 * dAh * eta) / config.capAh;
    }

    // Descuento por autodescarga si corriente es nula
    if (Math.abs(currentA) < 0.01) {
      let selfMonthly = chem.selfDischargeMonthly;
      if (faults.F_CELL_SELF) {
        selfMonthly *= faults.F_CELL_SELF.magnitude || 20;
      }
      const selfHourly = selfMonthly / (30 * 24);
      deltaSoc -= (selfHourly * dt) / 3600;
    }

    const nextSoc = Math.max(0, Math.min(100, state.socPct + deltaSoc));
    const nextDod = 100 - nextSoc;

    // Térmica del Pack
    let ua = config.ua;
    if (faults.F_PACK_COOLANT) {
      ua *= FAULT_MODEL.coolantLeakUaFactor;
    }

    let qGenW = currentA * currentA * rPack;

    // Si hay fuga térmica en celda
    if (faults.F_CELL_RUNAWAY) {
      qGenW += (currentA * currentA * cell.rintOhm * FAULT_MODEL.runawayCellFactor) + 500; // término exotérmico
    }

    const qCoolW = ua * (state.tempPackC - tAmbC);
    const dTdtKPerS = (qGenW - qCoolW) / config.cThJK;
    const nextTempPackC = state.tempPackC + dTdtKPerS * dt;

    // Modelado de celda fallada / caliente si hay celda con Rint alta
    let tempHotCellC = nextTempPackC;
    let tempColdCellC = nextTempPackC;
    if (faults.F_CELL_RINT) {
      const mult = faults.F_CELL_RINT.magnitude || 10;
      const faultCalc = calcFaultCellRint({
        healthyRintOhm: cell.rintOhm,
        faultMult: mult,
        currentA: currentA / config.np,
        ns: config.ns
      });
      // La celda defectuosa calienta a mayor velocidad localmente
      const cellMass = cell.massKg;
      const cellCp = chem.cpMid || 900;
      const cellCth = cellMass * cellCp;
      const dTCellHot = (faultCalc.heatFaultW / cellCth) * dt;
      tempHotCellC = (state.tempCellMaxC || state.tempPackC) + dTCellHot;
    }

    // Array de voltajes simulados de celdas para visualizador
    const cellVoltages = [];
    const avgVCell = vt / config.ns;
    for (let i = 0; i < Math.min(config.ns, 128); i++) {
      let vC = avgVCell;
      if (i === 0 && faults.F_CELL_RINT) {
        vC -= (currentA / config.np) * (cell.rintOhm * ((faults.F_CELL_RINT.magnitude || 10) - 1));
      }
      if (i === 0 && faults.F_CELL_SHORT) {
        vC = 0;
      }
      cellVoltages.push(vC);
    }

    return {
      timeS: (state.timeS || 0) + dt,
      socPct: nextSoc,
      dodPct: nextDod,
      vPack: vt,
      currentA,
      powerW,
      tempPackC: nextTempPackC,
      tempCellMaxC: tempHotCellC,
      tempCellMinC: tempColdCellC,
      qGenW,
      qCoolW,
      dTdtKPerS,
      cellVoltages,
      bms
    };
  }

  return {
    dimensionPack,
    calcVocCell,
    calcRintTempFactor,
    calcRintTemp,
    calcDischargeRegime,
    calcAuxConsumption,
    calcSelfDischarge,
    calcFaultCellRint,
    calcRegenBraking,
    calcDegradation,
    evaluateBmsState,
    simulateStep,
    DEFAULT_AUX_CATALOG
  };
});
