/**
 * engine/driver.js
 * Lógica del piloto automático (Ahorro, Equilibrado, Ataque) con lookahead de frenado
 * Fuente: §7.4 del prompt
 */

export const DRIVER_STYLES = {
  ahorro: {
    id: 'ahorro',
    nombre: 'Ahorro',
    desc: 'Aceleración suave, levanta pedal con anticipación, maximiza freno regenerativo',
    aggression: 0.65,
    pwrFactor: 0.75,
    brakeDecel: 4.5,
    lookaheadM: 200.0,
    targetSocFinal: 0.28
  },
  equilibrado: {
    id: 'equilibrado',
    nombre: 'Equilibrado',
    desc: 'Ritmo balanceado de carrera, referencia de calibración',
    aggression: 0.85,
    pwrFactor: 0.92,
    brakeDecel: 6.5,
    lookaheadM: 160.0,
    targetSocFinal: 0.18
  },
  ataque: {
    id: 'ataque',
    nombre: 'Ataque',
    desc: 'Todo el pulso disponible, frenadas al límite, máxima degradación térmica',
    aggression: 1.0,
    pwrFactor: 1.0,
    brakeDecel: 8.5,
    lookaheadM: 120.0,
    targetSocFinal: 0.12
  }
};

/**
 * Decide acelerador [0, 1] o freno [0, 1] usando lookahead sobre los waypoints del circuito
 */
export function decideDriverInput({
  circuit,
  sDistM,
  vCarMs,
  styleKey = 'equilibrado',
  skillFactor = 1.0, // variación 0.97 - 1.03
  socActual = 0.5
}) {
  const style = DRIVER_STYLES[styleKey] || DRIVER_STYLES.equilibrado;
  const waypoints = circuit.waypoints;
  const N = waypoints.length;
  const totalM = circuit.longitud_m;

  // 1. Obtener waypoint actual y velocidad límite de la curva local
  const currentIdx = Math.floor((sDistM % totalM) / (totalM / N)) % N;
  const currentWp = waypoints[currentIdx];
  const localVmax = currentWp[4] * skillFactor;

  // 2. Lookahead sobre los siguientes waypoints para anticipar la frenada
  const lookaheadDist = style.lookaheadM;
  const numStepsAhead = Math.min(N - 1, Math.ceil(lookaheadDist / (totalM / N)));

  let minAllowedV = localVmax;
  const aBrakeMax = style.brakeDecel;

  for (let step = 1; step <= numStepsAhead; step++) {
    const nextIdx = (currentIdx + step) % N;
    const nextWp = waypoints[nextIdx];
    const distToWp = step * (totalM / N);
    const nextVmax = nextWp[4] * skillFactor;

    // v_allowed^2 = v_target^2 + 2 * a_brake * dist
    const vAllowed = Math.sqrt(nextVmax * nextVmax + 2 * aBrakeMax * distToWp);
    if (vAllowed < minAllowedV) {
      minAllowedV = vAllowed;
    }
  }

  // 3. Estrategia de conservación si SOC está bajo
  let pwrMultiplier = style.pwrFactor;
  if (socActual < 0.15) {
    pwrMultiplier *= Math.max(0.35, socActual / 0.15);
  }

  // 4. Determinar si acelera, rueda por inercia o frena
  const speedDiff = minAllowedV - vCarMs;

  if (speedDiff < -1.0) {
    // Exceso de velocidad respecto a la curva -> Frenada
    const brakeIntensity = Math.min(1.0, Math.abs(speedDiff) / (styleKey === 'ataque' ? 6.0 : 8.0));
    return {
      throttle: 0.0,
      brake: Math.max(0.25, brakeIntensity),
      targetSpeedMs: minAllowedV
    };
  } else if (speedDiff > 0.0) {
    // Aceleración: ataque exige 100% pulso de acelerador sin modular
    const throttle = styleKey === 'ataque' ? 1.0 : Math.min(1.0, (speedDiff / 8.0) * pwrMultiplier);
    return {
      throttle: Math.max(0.15, throttle),
      brake: 0.0,
      targetSpeedMs: minAllowedV
    };
  } else {
    // Mantenimiento de velocidad en recta o curva
    return {
      throttle: (styleKey === 'ataque' ? 0.40 : 0.18) * pwrMultiplier,
      brake: 0.0,
      targetSpeedMs: minAllowedV
    };
  }
}
