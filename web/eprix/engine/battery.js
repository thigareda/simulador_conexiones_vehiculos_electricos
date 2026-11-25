/**
 * engine/battery.js
 * Modelo electroquímico y térmico de la batería de tracción.
 * Fuentes: [F31·s14], [F31·s15], [F31·s20], [F31·s21], [F31·s22], [F31·s24], [F31·s25], [F31·s26], [F31·s34], [F30·s31], [F30·s32]
 */

/**
 * Armado de pack de batería (primero paralelo y luego serie [F31·s33, F31·s34])
 * Test obligatorio del corpus: pack(350 V, 50 Ah, celda 3.7 V, 25 Ah) -> 95S2P, 351.5 V, 50 Ah [F31·s34]
 */
export function assemblePack({
  vTarget = 350.0,
  capTargetAh = 50.0,
  vCelda = 3.7,
  capCeldaAh = 25.0
}) {
  const celdasSerie = Math.round(vTarget / vCelda);
  const vNominal = +(celdasSerie * vCelda).toFixed(2);
  const celdasParalelo = Math.max(1, Math.round(capTargetAh / capCeldaAh));
  const capacidadAh = +(celdasParalelo * capCeldaAh).toFixed(2);
  const totalCeldas = celdasSerie * celdasParalelo;
  const configStr = `${celdasSerie}S${celdasParalelo}P`;

  return {
    celdasSerie,
    celdasParalelo,
    vNominal,
    capacidadAh,
    totalCeldas,
    configStr
  };
}

/**
 * Relación C-rate, corriente y calor instantáneo Joule [F31·s24]:
 * I = C_rate · Cn
 * ΔV = I · Rint
 * Q_punto = I² · Rint
 */
export function calcCRateElectrical({ cRate, capacidadAh, rintOhm }) {
  const corrienteA = cRate * capacidadAh;
  const caidaTensionV = corrienteA * rintOhm;
  const calorInstantaneoW = corrienteA * corrienteA * rintOhm;

  return {
    cRate,
    corrienteA,
    caidaTensionV,
    calorInstantaneoW
  };
}

/**
 * Freno regenerativo: mapa de tres límites [F30·s31, F30·s32]
 * - SOC > 0.80: Cancelada (0) [F30·s32]
 * - SOC 0.70–0.80: Limitada por corriente de carga del BMS [F30·s32]
 * - SOC < 0.70: Libre (1.0) [F30·s32]
 * - T >= 55 °C: Detenida por protección [F30·s32]
 * - v < 1 m/s: Sin par, el freno hidráulico hace el trabajo [F30·s31]
 */
export function calcRegenFactor({ soc, tempC = 25.0, vMs = 20.0 }) {
  if (vMs < 1.0) return 0.0;
  if (tempC >= 55.0) return 0.0;
  if (soc > 0.80) return 0.0;
  if (soc >= 0.70) {
    // Escala lineal de 1.0 a 0.70 bajando a 0.0 a 0.80
    return (0.80 - soc) / 0.10;
  }
  return 1.0;
}

/**
 * Derating en frío para recarga / regeneración [F31·s21]:
 * A 0 °C la celda no admite 1C; se reduce a <= 0.3C para prevenir depósito de litio.
 */
export function calcColdChargeLimitCRate(tempC, nominalChargeCRate = 2.0) {
  if (tempC <= 0.0) {
    return 0.3; // A: [F31·s21]
  }
  if (tempC < 15.0) {
    // Transición suave entre 0.3C a 0 °C y el valor nominal a 15 °C
    const frac = tempC / 15.0;
    return 0.3 + frac * (nominalChargeCRate - 0.3);
  }
  return nominalChargeCRate;
}

/**
 * Factor de reducción de potencia por alta temperatura [F31·s24]:
 * - T <= 45 °C: 100 % (sin derating)
 * - 45 °C < T <= 55 °C: Caída lineal de 1.0 a 0.30
 * - 55 °C < T < 60 °C: Caída lineal de 0.30 a 0.0
 * - T >= 60 °C: 0.0 (corte por protección térmica / DNF)
 * Monótona decreciente para T > 45 °C
 */
export function calcThermalDerateFactor(tempC) {
  if (tempC <= 45.0) return 1.0;
  if (tempC <= 55.0) {
    return 1.0 - 0.70 * ((tempC - 45.0) / 10.0);
  }
  if (tempC < 60.0) {
    return 0.30 * ((60.0 - tempC) / 5.0);
  }
  return 0.0;
}

/**
 * Curva de vida de ciclo según DOD (Profundidad de Descarga) [F31·s26]:
 * N(DOD) = N100 · (1 / DOD)^1.322
 * Cumple con N(0.5)/N(1.0) = 2^1.322 ≈ 2.50
 */
export function calcCycleLifeN(dod, n100 = 2000) {
  const dodClamped = Math.max(0.01, Math.min(1.0, dod));
  return n100 * Math.pow(1.0 / dodClamped, 1.322); // B: confianza B [F31·s26]
}

/**
 * Tensión de circuito abierto Voc(SOC) [F31·s24]:
 * Interpolación lineal entre V_corte_descarga y V_corte_carga multiplicada por celdas en serie
 */
export function calcVoc(soc, celdasSerie, vCorteDescarga, vCorteCarga) {
  const vCell = vCorteDescarga + Math.max(0, Math.min(1, soc)) * (vCorteCarga - vCorteDescarga);
  return celdasSerie * vCell;
}

/**
 * Inicializa el estado dinámico de la batería
 */
export function createBatteryState(carSpec, tambC = 25.0) {
  const bat = carSpec.bateria;
  return {
    soc: bat.soc_inicial ?? 0.90,
    tempC: bat.temperatura_inicial_c ?? tambC,
    soh: 1.0,
    vt: bat.v_nominal,
    currentA: 0.0,
    powerW: 0.0,
    isLimitingPower: false,
    turtleModeActive: false,
    turtleTimerS: 0.0,
    isDnf: false,
    dnfReason: null,
    // Ledgers de energía acumulada en Joules
    energiaDescargaJ: 0.0,
    energiaRegenJ: 0.0,
    calorJouleJ: 0.0,
    calorDisipadoJ: 0.0,
    ahDescargados: 0.0,
    ahCargados: 0.0,
    tempMaxC: bat.temperatura_inicial_c ?? tambC
  };
}

/**
 * Paso de integración de la batería (dt en segundos)
 * Implementa las 5 ecuaciones canónicas de 7.3:
 * 1. I = P_bat / max(Vt, 1)
 * 2. Vt = Voc(SOC) - I · Rint
 * 3. SOC <- SOC - I_eff · dt / (3600 · Cn)
 * 4. T <- T + (I² · Rint - h · (T - Tamb)) · dt / Cth
 * 5. SOH <- SOH - ΔSOH_ciclo - ΔSOH_térmico
 */
export function stepBattery(state, carSpec, chemSpec, pRequestedW, vCarMs, tambC, dt) {
  if (state.isDnf) return state;

  const bat = carSpec.bateria;
  const cnAh = bat.capacidad_ah;
  const ns = bat.celdas_serie;

  // 1. Resistencia interna ajustada por envejecimiento: Rint = Rint0 · (1 + 0.8 · (1 - SOH)) // C
  const rintOhm = (bat.rint_mohm / 1000.0) * (1.0 + 0.8 * (1.0 - state.soh));

  // 2. Tensión en circuito abierto Voc(SOC)
  const voc = calcVoc(state.soc, ns, chemSpec.v_corte_descarga, chemSpec.v_corte_carga);

  // 3. Límites de potencia de la batería
  // Máximo pulso admisible de descarga
  const pMaxPulseW = bat.c_pulso * cnAh * Math.max(state.vt, voc * 0.85);

  let pActualW = pRequestedW;
  state.isLimitingPower = false;

  if (pRequestedW > 0) {
    // Tracción / Descarga
    if (pActualW > pMaxPulseW) {
      pActualW = pMaxPulseW;
      state.isLimitingPower = true;
    }
  } else if (pRequestedW < 0) {
    // Regeneración / Recarga
    const maxChargeCRate = calcColdChargeLimitCRate(state.tempC, bat.c_continuo);
    const pMaxChargeW = maxChargeCRate * cnAh * state.vt;
    if (Math.abs(pActualW) > pMaxChargeW) {
      pActualW = -pMaxChargeW;
    }
  }

  // 4. Corriente de batería: I = P_bat / max(Vt, 1)
  const currentA = pActualW / Math.max(state.vt, 1.0);
  state.currentA = currentA;
  state.powerW = pActualW;

  // 5. Tensión en bornes: Vt = Voc - I · Rint
  state.vt = Math.max(voc * 0.5, voc - currentA * rintOhm);

  // 6. Efecto Peukert para plomo y NiMH [F31·s20]: k=1.30 en plomo, 1.15 en NiMH
  let currentEffA = currentA;
  if (currentA > 0 && chemSpec.peukert_k && chemSpec.peukert_k > 1.02) {
    const iNom = cnAh; // corriente 1C de referencia
    const ratio = Math.max(0.1, currentA / iNom);
    currentEffA = currentA * Math.pow(ratio, chemSpec.peukert_k - 1.0);
  }

  // 7. Integración de SOC: SOC <- SOC - I_eff · dt / (3600 · Cn)
  const dSoc = (currentEffA * dt) / (3600.0 * cnAh);
  state.soc = Math.max(0.0, Math.min(1.0, state.soc - dSoc));

  // Ledger de Ah
  if (currentA > 0) {
    state.ahDescargados += (currentA * dt) / 3600.0;
    state.energiaDescargaJ += pActualW * dt;
  } else if (currentA < 0) {
    state.ahCargados += (-currentA * dt) / 3600.0;
    state.energiaRegenJ += (-pActualW) * dt;
  }

  // 8. Térmica: Caldera Joule y Disipación por flujo de aire
  // Cth en J/K: proporcional a la masa del pack (~900 J/(kg·K))
  const cthJK = bat.cth_kj_k * 1000.0;
  // Disipación h(v): h = h0 + hv · vCarMs
  const hWK = bat.h_w_k * (1.0 + 0.05 * vCarMs);

  const qJouleW = currentA * currentA * rintOhm;
  const qDissW = hWK * (state.tempC - tambC);

  state.calorJouleJ += qJouleW * dt;
  state.calorDisipadoJ += qDissW * dt;

  const dTemp = ((qJouleW - qDissW) * dt) / cthJK;
  state.tempC += dTemp;
  if (state.tempC > state.tempMaxC) {
    state.tempMaxC = state.tempC;
  }

  // 9. Degradación SOH: Cíclico y Térmico [F31·s26, F31·s49]
  const dodActual = 1.0 - state.soc;
  const nDod = calcCycleLifeN(dodActual, chemSpec.n100_ciclos);
  const dAh = Math.abs(currentA * dt) / 3600.0;
  const dSohCiclo = dAh / (2.0 * cnAh * nDod);

  // Térmico: k_T · 2^((T-25)/10) · dt [F31·s49]
  const kT = 4.0e-8; // C: calibrado para perder <2% SOH a 35 °C y hasta ~5% a 55 °C
  const dSohTermico = kT * Math.pow(2.0, (state.tempC - 25.0) / 10.0) * dt;

  state.soh = Math.max(0.5, state.soh - dSohCiclo - dSohTermico);

  // 10. Protección, modo tortuga y DNF (§7.5)
  if (state.tempC >= 60.0) {
    state.isDnf = true;
    state.dnfReason = `Sobrecalentamiento crítico de batería (${state.tempC.toFixed(1)} °C ≥ 60 °C)`;
    return state;
  }

  if (state.soc <= 0.0) {
    state.isDnf = true;
    state.dnfReason = 'Agotamiento total de carga (SOC = 0.0 %)';
    return state;
  }

  if (state.soc < 0.05) {
    state.turtleModeActive = true;
    state.turtleTimerS += dt;
    if (state.turtleTimerS > 3.0 && state.soc <= 0.01) {
      state.isDnf = true;
      state.dnfReason = 'Batería agotada tras modo tortuga prolongado';
      return state;
    }
  } else {
    state.turtleModeActive = false;
    state.turtleTimerS = 0.0;
  }

  return state;
}
