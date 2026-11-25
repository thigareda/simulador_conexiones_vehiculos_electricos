/**
 * engine/physics.js
 * Ecuaciones de resistencia al avance y dinámica longitudinal del vehículo eléctrico.
 * Fuentes: [F30·s24], [F30·s25], [F30·s17], [F30·s10]
 */

export const GRAVITY = 9.8; // m/s^2 aceleración de la gravedad [F30·s24]
export const DEFAULT_F_ROLL = 0.015; // coeficiente de resistencia a la rodadura f [F30·s25]

/**
 * Resistencia a la rodadura: F_rodadura = m · g · f [F30·s24]
 */
export function calcRollingResistance(m, f = DEFAULT_F_ROLL, g = GRAVITY) {
  return m * g * f;
}

/**
 * Resistencia aerodinámica canónica del corpus:
 * F_aero = Cd · A · Ua² / 21.15 con Ua en km/h, resultado en Newtons [F30·s24]
 */
export function calcAerodynamicDrag(cd, area, vMs) {
  const uaKmh = vMs * 3.6;
  return (cd * area * (uaKmh * uaKmh)) / 21.15;
}

/**
 * Fuerza de resistencia total sobre pista plana (pendiente = 0):
 * F_res = F_rodadura + F_aero [F30·s24]
 */
export function calcTotalResistance(m, cd, area, vMs, f = DEFAULT_F_ROLL, g = GRAVITY) {
  const fRod = calcRollingResistance(m, f, g);
  const fAero = calcAerodynamicDrag(cd, area, vMs);
  return fRod + fAero;
}

/**
 * Límite de adherencia para evitar aceleraciones irreales:
 * F_grip = 0.55 · m · g // C: parámetro de diseño, no proviene de F30/F31
 */
export function calcGripLimit(m, g = GRAVITY) {
  return 0.55 * m * g; // C: parámetro de diseño
}

/**
 * Fuerza tractiva disponible a partir de la potencia motriz y la velocidad:
 * F_trac = min(P_disponible / max(v, 2), F_grip)
 */
export function calcTractionForce(pDisponibleW, vMs, m) {
  const fGrip = calcGripLimit(m);
  const fIdeal = pDisponibleW / Math.max(vMs, 2.0);
  return Math.min(fIdeal, fGrip);
}

/**
 * Aceleración longitudinal: a = (F_trac - F_res) / m [F30·s24]
 */
export function calcAcceleration(fTrac, fRes, m) {
  return (fTrac - fRes) / m;
}

/**
 * Ejercicio canónico de autonomía de 232 km según datos de 3.8 [F30·s25]:
 * m = 1 700 kg, A = 4 m², Cd = 0.35, f = 0.015, Ua = 60 km/h
 * η_transmisión = 0.92, η_motor+MCU = 0.90, η_descarga = 0.95
 * Batería = 50 kWh, usable = 80 %
 * Salidas esperadas: F = 488.2 N, E_rueda = 31.5 kWh, Autonomía ≈ 232 km
 */
export function calcAutonomiaCorpus({
  m = 1700,
  a = 4.0,
  cd = 0.35,
  f = 0.015,
  g = 9.8,
  uaKmh = 60.0,
  etaTrans = 0.92,
  etaMotorMcu = 0.90,
  etaBatDescarga = 0.95,
  capacidadBateriaKwh = 50.0,
  socUsableFrac = 0.80
} = {}) {
  const vMs = uaKmh / 3.6;
  const fRod = calcRollingResistance(m, f, g);
  const fAero = calcAerodynamicDrag(cd, a, vMs);
  const fTotal = fRod + fAero;

  // Eficiencia en cascada de la cadena de tracción [F30·s25]
  const etaTotal = etaTrans * etaMotorMcu * etaBatDescarga;

  // Energía útil disponible de la batería
  const energiaUsableKwh = capacidadBateriaKwh * socUsableFrac;

  // Consumo específico en bornes de batería por kilómetro:
  // Trabajo mecánico = F_total · 1 000 m = F_total kJ / 3600 = F_total / 3600 kWh a las ruedas
  const consumoKwhKmRueda = fTotal / 3600.0;
  const consumoKwhKmBat = consumoKwhKmRueda / etaTotal;

  const autonomiaKm = energiaUsableKwh / consumoKwhKmBat;
  const energiaMecanicaTotalKwh = (autonomiaKm * fTotal * 1000) / 3.6e6;

  return {
    fRod,
    fAero,
    fTotal,
    etaTotal,
    energiaUsableKwh,
    consumoKwhKmBat,
    energiaMecanicaTotalKwh,
    autonomiaKm
  };
}
