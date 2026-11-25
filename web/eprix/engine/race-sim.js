/**
 * engine/race-sim.js
 * Simulador de carrera por coche: integración continua con dt fijo (1/120 s)
 * Ecuaciones de 7.2, 7.3, 7.4 y reglas de carrera de 7.5
 */

import {
  calcRollingResistance,
  calcAerodynamicDrag,
  calcGripLimit,
  calcAcceleration,
  GRAVITY
} from './physics.js';

import {
  createBatteryState,
  stepBattery,
  calcThermalDerateFactor,
  calcRegenFactor,
  calcColdChargeLimitCRate
} from './battery.js';

import { decideDriverInput } from './driver.js';

export const P_AUX_W = 400.0;           // Potencia auxiliar 12V (ordenadores, bombas, VCU) [F30·s17]
export const ETA_TRANSMISION = 0.95;    // Eficiencia de transmisión reductora de una marcha fija [F30·s10]

/**
 * Inicializa el estado de carrera para un coche
 */
export function createCarRaceState(carSpec, chemSpec, driverStyleKey = 'equilibrado', skillFactor = 1.0, tambC = 25.0) {
  return {
    car: carSpec,
    chem: chemSpec,
    driverStyleKey,
    skillFactor,
    // Dinámica
    sM: 0.0,             // posición sobre la longitud de arco (m)
    vMs: 0.0,            // velocidad instantánea (m/s)
    aMs2: 0.0,           // aceleración instantánea (m/s^2)
    lap: 1,              // vuelta actual (1 a 4)
    lapTimes: [],        // tiempos por vuelta [t1, t2, ...]
    currentLapTimeS: 0.0,
    totalTimeS: 0.0,
    finished: false,
    finishTimeS: null,
    // Estadísticas
    vMaxMs: 0.0,
    vMinMs: 999.0,
    distanciaTotalM: 0.0,
    // Batería
    battery: createBatteryState(carSpec, tambC),
    // Potencia y derates
    pDisponibleW: carSpec.motor.p_pico_kw * 1000.0,
    pMotorW: 0.0,
    fTracN: 0.0,
    fBrakeN: 0.0,
    throttle: 0.0,
    brake: 0.0,
    // Ledgers de energía acumulada en kWh
    ledger: {
      eBatDischargeKwh: 0.0,
      eWheelKwh: 0.0,
      eHeatJouleKwh: 0.0,
      eRegenKwh: 0.0,
      eAuxKwh: 0.0,
      ePowertrainLossKwh: 0.0,
      eBrakeFrictionKwh: 0.0
    }
  };
}

/**
 * Ejecuta un paso de integración fija dt = 1/120 s para un coche
 */
export function stepCarRace(state, circuit, totalLaps = 4, tambC = 25.0, dt = 1 / 120) {
  if (state.finished || state.battery.isDnf) {
    return state;
  }

  const car = state.car;
  const chem = state.chem;
  const batState = state.battery;
  const circuitLengthM = circuit.longitud_m;
  const totalRaceDistM = totalLaps * circuitLengthM;

  // 1. Derating de potencia disponible según temperatura, SOC y SOH (§7.2, §7.3)
  const fT = calcThermalDerateFactor(batState.tempC);

  let fSoc = 1.0;
  if (batState.soc < 0.05) {
    fSoc = 0.30; // Modo tortuga (30% potencia)
  } else if (batState.soc <= 0.15) {
    fSoc = 0.30 + 0.70 * ((batState.soc - 0.05) / 0.10);
  }

  const fSoh = Math.max(0.7, batState.soh);
  const pPicoMaxW = car.motor.p_pico_kw * 1000.0;
  state.pDisponibleW = pPicoMaxW * fT * fSoc * fSoh;

  // 2. Piloto decide acelerador y freno mediante lookahead (§7.4)
  const driverInput = decideDriverInput({
    circuit,
    sDistM: state.sM,
    vCarMs: state.vMs,
    styleKey: state.driverStyleKey,
    skillFactor: state.skillFactor,
    socActual: batState.soc
  });

  state.throttle = driverInput.throttle;
  state.brake = driverInput.brake;

  const etaMotor = car.motor.eta;
  const etaDrive = etaMotor * ETA_TRANSMISION;
  const fGrip = calcGripLimit(car.masa_kg);

  let pRequestedBatW = P_AUX_W; // base auxiliar permanente
  let fTracN = 0.0;
  let fBrakeN = 0.0;

  if (state.brake > 0.05) {
    // 3. Frenado: cálculo de frenada regenerativa y mecánica (§3.6, §7.2)
    // Desaceleración objetivo modulada por el pedal de freno
    const aBrakeTarget = state.brake * 8.5; // hasta 8.5 m/s^2
    const fBrakeTotalN = car.masa_kg * aBrakeTarget;
    fBrakeN = fBrakeTotalN;

    const pBrakeTotalW = fBrakeTotalN * state.vMs;

    // Límites de frenado regenerativo del corpus y estilo de conducción:
    const fRegenSoc = calcRegenFactor({
      soc: batState.soc,
      tempC: batState.tempC,
      vMs: state.vMs
    });

    // Modulación por estilo: Ahorro maximiza regen, Ataque frena tarde con hidráulico
    const fRegenStyle = state.driverStyleKey === 'ahorro' ? 1.0 : (state.driverStyleKey === 'ataque' ? 0.35 : 0.85);

    const cChargeMax = calcColdChargeLimitCRate(batState.tempC, car.bateria.c_continuo);
    const pChargePermitidaBatW = cChargeMax * car.bateria.capacidad_ah * batState.vt;
    const pRegenMaxMotorW = pPicoMaxW * 0.80; // límite de regeneración del motor (C)

    // Potencia mecánica absorbida por regenerador:
    // P_bat_regen = P_mec_regen · eta_trans · eta_motor
    const pRegenMecAvailable = pBrakeTotalW * fRegenSoc * fRegenStyle;
    const pRegenElecPotencial = pRegenMecAvailable * etaDrive;

    const pRegenElecActual = Math.min(
      pRegenElecPotencial,
      pRegenMaxMotorW * etaDrive,
      pChargePermitidaBatW
    );

    const pRegenMecActual = pRegenElecActual / Math.max(etaDrive, 0.5);
    const pFrictionMec = Math.max(0.0, pBrakeTotalW - pRegenMecActual);

    // Batería recibe potencia de recarga (negativa para stepBattery)
    pRequestedBatW = -pRegenElecActual + P_AUX_W;

    // Ledgers de frenado
    state.ledger.eBrakeFrictionKwh += (pFrictionMec * dt) / 3.6e6;
  } else {
    // 4. Tracción: cálculo de empuje motriz y demanda eléctrica
    const pPicoPermitidaW = state.pDisponibleW * state.throttle;
    const fTracDeseadaN = pPicoPermitidaW / Math.max(state.vMs, 2.0);
    fTracN = Math.min(fTracDeseadaN, fGrip);

    const pRuedaW = fTracN * state.vMs;
    const pMotorElecW = pRuedaW / etaDrive;

    pRequestedBatW = pMotorElecW + P_AUX_W;

    state.ledger.eWheelKwh += (pRuedaW * dt) / 3.6e6;
    state.ledger.ePowertrainLossKwh += ((pMotorElecW - pRuedaW) * dt) / 3.6e6;
  }

  state.fTracN = fTracN;
  state.ledger.eAuxKwh += (P_AUX_W * dt) / 3.6e6;

  // 5. Paso electroquímico y térmico de batería (§7.3)
  stepBattery(batState, car, chem, pRequestedBatW, state.vMs, tambC, dt);

  // Si la batería limitó la potencia máxima por C-rate o protección, recortar fTrac
  if (batState.isLimitingPower && fTracN > 0) {
    const pRuedaMaxW = Math.max(0.0, (batState.powerW - P_AUX_W) * etaDrive);
    fTracN = Math.min(fTracN, pRuedaMaxW / Math.max(state.vMs, 2.0));
    state.fTracN = fTracN;
  }

  // 6. Fuerzas de resistencia y dinámica longitudinal (§3.8, §7.2)
  const fResN = calcAerodynamicDrag(car.cd, car.area_m2, state.vMs) +
                calcRollingResistance(car.masa_kg);

  // Si hay freno activo, a = (-fBrake - fRes) / m; si tracción, a = (fTrac - fRes) / m
  let aMs2 = 0.0;
  if (fBrakeN > 0) {
    aMs2 = (-fBrakeN - fResN) / car.masa_kg;
  } else {
    aMs2 = (fTracN - fResN) / car.masa_kg;
  }

  // 7. Integración de velocidad y posición sobre la longitud de arco s (sin teletransporte)
  state.aMs2 = aMs2;
  state.vMs = Math.max(0.0, state.vMs + aMs2 * dt);
  const dsM = state.vMs * dt;
  state.sM += dsM;
  state.distanciaTotalM += dsM;

  // 8. Tiempos, vueltas y telemetría de velocidad
  state.currentLapTimeS += dt;
  state.totalTimeS += dt;

  if (state.vMs > state.vMaxMs) {
    state.vMaxMs = state.vMs;
  }
  if (state.vMs > 1.0 && state.vMs < state.vMinMs) {
    state.vMinMs = state.vMs;
  }

  // 9. Paso por meta y final de carrera
  const prevLap = state.lap;
  const currentLap = Math.min(totalLaps, Math.floor(state.sM / circuitLengthM) + 1);

  if (currentLap > prevLap) {
    state.lapTimes.push(+state.currentLapTimeS.toFixed(3));
    state.currentLapTimeS = 0.0;
    state.lap = currentLap;
  }

  if (state.sM >= totalRaceDistM) {
    state.finished = true;
    state.finishTimeS = +state.totalTimeS.toFixed(3);
    if (state.lapTimes.length < totalLaps) {
      state.lapTimes.push(+state.currentLapTimeS.toFixed(3));
    }
  }

  // 10. Actualización de ledgers energéticos
  state.ledger.eBatDischargeKwh = batState.energiaDescargaJ / 3.6e6;
  state.ledger.eRegenKwh = batState.energiaRegenJ / 3.6e6;
  state.ledger.eHeatJouleKwh = batState.calorJouleJ / 3.6e6;

  return state;
}
