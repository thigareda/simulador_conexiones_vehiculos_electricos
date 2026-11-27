/**
 * Laboratorio Virtual de Autonomía y Consumo (BEV)
 * Motor físico de dinámica vehicular, ciclos de conducción (NEDC, WLTC, CLTC)
 * y visualización animada en SVG a 60 FPS con telemetría a 10 FPS.
 */
(function () {
  const RHO_AIR = 1.225; // kg/m³
  const GRAVITY = 9.81;  // m/s²
  const DRIVETRAIN_EFF = 0.90;
  const REGEN_EFF = 0.65;
  const AUX_POWER_W = 400; // Consumo auxiliar base (electrónica/BMS)

  const pickL = (es, en, zh) => {
    const lang = window.I18N ? window.I18N.getLang() : "es";
    return lang === "zh" ? zh : (lang === "en" ? en : es);
  };

  // Perfiles de vehículos con parámetros por defecto
  const VEHICLE_PROFILES = {
    sedan: {
      id: "sedan",
      nameEs: "Carro Sedán",
      nameEn: "Sedan Car",
      nameZh: "纯电动轿车",
      mass: 1650,
      cd: 0.24,
      af: 2.25,
      crr: 0.010,
      batteryKwh: 60
    },
    suv: {
      id: "suv",
      nameEs: "Camioneta (SUV)",
      nameEn: "SUV",
      nameZh: "纯电动 SUV",
      mass: 2150,
      cd: 0.31,
      af: 2.75,
      crr: 0.012,
      batteryKwh: 82
    },
    van: {
      id: "van",
      nameEs: "Utilitario de Volteo (Van)",
      nameEn: "Utility Van",
      nameZh: "轻型电动厢式货车 (Van)",
      mass: 2850,
      cd: 0.36,
      af: 3.40,
      crr: 0.014,
      batteryKwh: 95
    }
  };

  // Siluetas Cartoon SVG laterales completas (fondo transparente, ojos expresivos y ruedas animables)
  function getVehicleInnerSVG(type, isStage = false) {
    const wheel = (cx, cy, r) => `
      <g class="veh-wheel" transform="translate(${cx}, ${cy})">
        <circle r="${r}" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
        <circle r="${r * 0.62}" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
        <g class="${isStage ? "wheel-spokes" : ""}">
          <line x1="-${r * 0.56}" y1="0" x2="${r * 0.56}" y2="0" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round"/>
          <line x1="0" y1="-${r * 0.56}" x2="0" y2="${r * 0.56}" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round"/>
        </g>
        <circle r="4" fill="#facc15" stroke="#0f172a" stroke-width="1.5"/>
      </g>
    `;

    const cartoonEyes = (x, y) => `
      <g class="cartoon-eyes" transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="0" rx="7" ry="8.5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <circle cx="2.5" cy="0" r="3.4" fill="#0f172a"/>
        <circle cx="3.8" cy="-2" r="1.3" fill="#ffffff"/>
        <ellipse cx="14" cy="0" rx="6.5" ry="8" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <circle cx="16.5" cy="0" r="3.2" fill="#0f172a"/>
        <circle cx="17.8" cy="-2" r="1.2" fill="#ffffff"/>
      </g>
    `;

    if (type === "van") {
      return `
        <g class="veh-body-group">
          <!-- Caja trasera tipo volteo cartoon cargando baterías -->
          <rect x="24" y="20" width="22" height="16" rx="3" fill="#22c55e" stroke="#0f172a" stroke-width="2.2"/>
          <text x="35" y="32" text-anchor="middle" font-size="10" fill="#ffffff">⚡</text>
          <rect x="50" y="18" width="22" height="18" rx="3" fill="#06b6d4" stroke="#0f172a" stroke-width="2.2"/>
          <text x="61" y="31" text-anchor="middle" font-size="10" fill="#ffffff">⚡</text>
          <rect x="76" y="22" width="22" height="14" rx="3" fill="#facc15" stroke="#0f172a" stroke-width="2.2"/>
          <path d="M 14 34 L 122 34 L 122 84 L 14 84 Z" fill="#f59e0b" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
          <line x1="42" y1="36" x2="42" y2="82" stroke="#b45309" stroke-width="3"/>
          <line x1="72" y1="36" x2="72" y2="82" stroke="#b45309" stroke-width="3"/>
          <line x1="100" y1="36" x2="100" y2="82" stroke="#b45309" stroke-width="3"/>
          <!-- Cabina delantera cartoon -->
          <path d="M 126 30 L 176 30 Q 190 30 198 52 L 206 62 L 206 84 L 126 84 Z" fill="#0ea5e9" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
          <!-- Ventana cabina -->
          <path d="M 136 38 L 172 38 L 188 58 L 136 58 Z" fill="#e0f2fe" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
          ${cartoonEyes(162, 48)}
          <!-- Faro y luz trasera -->
          <ellipse cx="203" cy="70" rx="5" ry="6" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
          <rect x="12" y="64" width="6" height="12" rx="2" fill="#ef4444" stroke="#0f172a" stroke-width="2"/>
          <!-- Parachoques -->
          <rect x="10" y="80" width="200" height="8" rx="4" fill="#475569" stroke="#0f172a" stroke-width="2.2"/>
        </g>
        ${wheel(54, 88, 18)}
        ${wheel(168, 88, 18)}
      `;
    }

    if (type === "suv") {
      return `
        <g class="veh-body-group">
          <!-- Baca / portaequipajes cartoon -->
          <path d="M 52 24 L 128 24" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
          <line x1="64" y1="24" x2="64" y2="30" stroke="#0f172a" stroke-width="3"/>
          <line x1="116" y1="24" x2="116" y2="30" stroke="#0f172a" stroke-width="3"/>
          <!-- Carrocería SUV naranja vibrante -->
          <path d="M 18 82 L 20 56 Q 24 46 38 44 L 50 28 L 136 28 Q 146 28 162 48 L 196 52 Q 208 55 208 68 L 206 82 Z" fill="#f97316" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
          <!-- Brillo cartoon -->
          <path d="M 56 34 L 130 34" stroke="#fdba74" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
          <!-- Ventanas -->
          <path d="M 54 35 L 96 35 L 96 54 L 40 54 Z" fill="#e0f2fe" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
          <path d="M 103 35 L 134 35 L 154 54 L 103 54 Z" fill="#e0f2fe" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
          ${cartoonEyes(126, 45)}
          <!-- Rayo EV en la puerta -->
          <polygon points="88,60 80,71 86,71 82,80 94,68 88,68" fill="#facc15" stroke="#0f172a" stroke-width="1.5"/>
          <!-- Faro y luz trasera -->
          <ellipse cx="202" cy="65" rx="6" ry="5" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
          <rect x="16" y="60" width="7" height="11" rx="2" fill="#ef4444" stroke="#0f172a" stroke-width="2"/>
          <!-- Parachoques -->
          <rect x="14" y="79" width="196" height="8" rx="4" fill="#334155" stroke="#0f172a" stroke-width="2.2"/>
        </g>
        ${wheel(58, 88, 19)}
        ${wheel(166, 88, 19)}
      `;
    }

    // Default: sedan cartoon eléctrico cian/azul
    return `
      <g class="veh-body-group">
        <!-- Carrocería Sedán cartoon redondeada -->
        <path d="M 16 82 Q 16 62 32 58 L 58 54 L 82 32 Q 92 28 134 28 Q 148 28 168 50 L 198 56 Q 210 60 208 74 L 206 82 Z" fill="#06b6d4" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
        <!-- Brillo cartoon en el techo -->
        <path d="M 88 34 L 132 34" stroke="#a5f3fc" stroke-width="3" stroke-linecap="round"/>
        <!-- Ventanas -->
        <path d="M 66 53 L 86 36 L 114 36 L 114 53 Z" fill="#e0f2fe" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M 121 36 L 138 36 L 159 53 L 121 53 Z" fill="#e0f2fe" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
        ${cartoonEyes(134, 45)}
        <!-- Rayo EV en la puerta -->
        <polygon points="108,59 100,70 106,70 102,79 114,67 108,67" fill="#facc15" stroke="#0f172a" stroke-width="1.5"/>
        <!-- Sonrisa / parrilla EV -->
        <path d="M 192 73 Q 200 77 206 72" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Faro y luz trasera -->
        <ellipse cx="202" cy="64" rx="6" ry="4.5" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
        <rect x="16" y="64" width="7" height="9" rx="2" fill="#ef4444" stroke="#0f172a" stroke-width="2"/>
      </g>
      ${wheel(58, 88, 18)}
      ${wheel(164, 88, 18)}
    `;
  }

  function getVehicleSVG(type, isStage = false) {
    if (isStage) {
      return getVehicleInnerSVG(type, true);
    }
    return `<svg viewBox="0 0 220 112" xmlns="http://www.w3.org/2000/svg">${getVehicleInnerSVG(type, false)}</svg>`;
  }

  // Perfiles de velocidad-tiempo [segundos, km/h] para cada ciclo de conducción
  const DRIVING_CYCLES = {
    NEDC: {
      name: "NEDC",
      descEs: "Ciclo Europeo (urbano + extraurbano suave)",
      descEn: "European Cycle (urban + smooth extra-urban)",
      descZh: "欧洲标准循环（市区 + 平缓郊区）",
      duration: 240,
      points: [
        [0, 0], [10, 0], [16, 15], [26, 15], [32, 0],
        [45, 0], [58, 32], [80, 32], [90, 0],
        [102, 0], [122, 50], [140, 50], [152, 35], [165, 35], [174, 0],
        [182, 0], [202, 70], [218, 100], [230, 120], [240, 0]
      ]
    },
    WLTC: {
      name: "WLTC",
      descEs: "Ciclo Mundial Armonizado (dinámico, hasta 131 km/h)",
      descEn: "Worldwide Harmonized Cycle (dynamic, up to 131 km/h)",
      descZh: "全球统一轻型车循环（动态，最高 131 km/h）",
      duration: 240,
      points: [
        [0, 0], [8, 0], [18, 34], [28, 22], [38, 48], [48, 0],
        [56, 0], [72, 62], [88, 42], [102, 76], [116, 28], [126, 0],
        [134, 0], [154, 92], [170, 78], [188, 118], [206, 131], [224, 85], [240, 0]
      ]
    },
    CLTC: {
      name: "CLTC",
      descEs: "Ciclo de Prueba de China (más paradas urbanas)",
      descEn: "China Light-Duty Test Cycle (more urban stops)",
      descZh: "中国轻型汽车行驶工况（较多市区启停）",
      duration: 240,
      points: [
        [0, 0], [12, 0], [22, 28], [32, 18], [42, 38], [52, 0],
        [66, 0], [78, 45], [92, 25], [104, 55], [116, 0],
        [128, 0], [144, 65], [160, 48], [176, 82], [192, 60], [210, 105], [226, 70], [240, 0]
      ]
    }
  };

  function sampleCycleSpeedMs(cycleKey, tSec) {
    const cycle = DRIVING_CYCLES[cycleKey] || DRIVING_CYCLES.WLTC;
    const tMod = ((tSec % cycle.duration) + cycle.duration) % cycle.duration;
    const pts = cycle.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const [t0, v0] = pts[i];
      const [t1, v1] = pts[i + 1];
      if (tMod >= t0 && tMod <= t1) {
        const ratio = t1 === t0 ? 0 : (tMod - t0) / (t1 - t0);
        const vKmh = v0 + (v1 - v0) * ratio;
        const accelMs2 = t1 === t0 ? 0 : ((v1 - v0) / 3.6) / (t1 - t0);
        return { vMs: vKmh / 3.6, vKmh, accelMs2 };
      }
    }
    return { vMs: 0, vKmh: 0, accelMs2: 0 };
  }

  const DEATH_ANIMATIONS = ["angel", "ko_face", "grayscale", "meteor", "deflate"];

  // Estado global de simulación requerido
  const simState = {
    running: false,
    finished: false,
    speedMultiplier: 20,
    deathAnim: null,
    deathProgress: 0,
    deathModalShown: false,
    vehicleId: "sedan",
    cycleKey: "WLTC",
    params: { ...VEHICLE_PROFILES.sedan },
    route: [
      { id: 1, distanceKm: 8, slopePct: 0 },
      { id: 2, distanceKm: 10, slopePct: 4.5 },
      { id: 3, distanceKm: 7, slopePct: -3.5 },
      { id: 4, distanceKm: 10, slopePct: 1.5 }
    ],
    t: 0,
    distanceM: 0,
    energyUsedWh: 0,
    remainingKwh: VEHICLE_PROFILES.sedan.batteryKwh,
    soc: 100,
    currentSpeedKmh: 0,
    instantConsKwh100: 0,
    avgConsKwh100: 0,
    estimatedRangeKm: 0,
    currentSlopePct: 0,
    currentSegIndex: 0,
    forces: { fAero: 0, fRoll: 0, fGrade: 0, fInertia: 0, fTotal: 0, powerKw: 0 },
    parallaxX: 0,
    wheelAngle: 0
  };
  window.simState = simState;

  let rafId = null;
  let lastFrameTs = 0;
  let lastHudTs = 0;
  let nextSegId = 5;

  function clamp(val, min, max) {
    const n = Number(val);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getTotalRouteKm() {
    return simState.route.reduce((acc, s) => acc + Math.max(0.5, Number(s.distanceKm) || 0), 0);
  }

  function getCurrentSegmentInfo(distKm) {
    let acc = 0;
    for (let i = 0; i < simState.route.length; i++) {
      const seg = simState.route[i];
      if (distKm <= acc + seg.distanceKm || i === simState.route.length - 1) {
        return { index: i, seg };
      }
      acc += seg.distanceKm;
    }
    return { index: 0, seg: { distanceKm: 1, slopePct: 0 } };
  }

  function stepPhysics(dtSim) {
    const totalDistM = getTotalRouteKm() * 1000;
    if (simState.distanceM >= totalDistM || simState.remainingKwh <= 0) {
      finishSimulation();
      return;
    }

    const { vMs, vKmh, accelMs2 } = sampleCycleSpeedMs(simState.cycleKey, simState.t);
    const { index, seg } = getCurrentSegmentInfo(simState.distanceM / 1000);
    simState.currentSegIndex = index;
    simState.currentSlopePct = seg.slopePct;

    const theta = Math.atan(seg.slopePct / 100);
    const m = simState.params.mass;
    const cd = simState.params.cd;
    const af = simState.params.af;
    const crr = simState.params.crr;

    // Ecuaciones de dinámica vehicular (Diapositivas 22-24)
    const fAero = 0.5 * RHO_AIR * cd * af * vMs * vMs;
    const fRoll = vMs > 0.05 ? crr * m * GRAVITY * Math.cos(theta) : 0;
    const fGrade = m * GRAVITY * Math.sin(theta);
    const fInertia = m * accelMs2;
    const fTotal = fAero + fRoll + fGrade + fInertia;

    // Potencia en las ruedas y consumo eléctrico
    const pWheelsW = fTotal * vMs;
    let pBatW;
    if (pWheelsW >= 0) {
      pBatW = (pWheelsW / DRIVETRAIN_EFF) + AUX_POWER_W;
    } else {
      pBatW = (pWheelsW * REGEN_EFF) + AUX_POWER_W;
    }

    const dWh = (pBatW * dtSim) / 3600;
    simState.energyUsedWh = Math.max(0, simState.energyUsedWh + dWh);
    simState.remainingKwh = Math.max(0, simState.params.batteryKwh - simState.energyUsedWh / 1000);
    simState.soc = clamp((simState.remainingKwh / simState.params.batteryKwh) * 100, 0, 100);

    simState.t += dtSim;
    simState.distanceM = Math.min(totalDistM, simState.distanceM + vMs * dtSim);
    simState.currentSpeedKmh = vKmh;

    // Consumo instantáneo (kWh/100km)
    if (vKmh > 1.5) {
      simState.instantConsKwh100 = clamp((pBatW / 1000) / (vKmh / 100), -40, 99.9);
    } else {
      simState.instantConsKwh100 = 0;
    }

    // Consumo medio y autonomía total estimada
    const distKm = simState.distanceM / 1000;
    if (distKm > 0.05 && simState.energyUsedWh > 0) {
      simState.avgConsKwh100 = (simState.energyUsedWh / 1000) / (distKm / 100);
      simState.estimatedRangeKm = simState.avgConsKwh100 > 0.5
        ? simState.params.batteryKwh / (simState.avgConsKwh100 / 100)
        : 0;
    }

    simState.forces = {
      fAero, fRoll, fGrade, fInertia, fTotal,
      powerKw: pBatW / 1000
    };

    if (simState.distanceM >= totalDistM || simState.remainingKwh <= 0.001) {
      finishSimulation();
    }
  }

  function finishSimulation() {
    simState.running = false;
    simState.finished = true;
    simState.currentSpeedKmh = 0;
    updatePlayButton();
    updateTelemetryDOM();

    const batteryDied = simState.remainingKwh <= 0.001;
    if (batteryDied) {
      const chosen = DEATH_ANIMATIONS[Math.floor(Math.random() * DEATH_ANIMATIONS.length)];
      simState.deathAnim = chosen;
      simState.deathProgress = 0;
      simState.deathModalShown = false;
      if (window.sounds) sounds.playError();
    } else {
      updateStageAnimation(0);
      showResultsModal();
    }
  }

  function resetDeathFX() {
    simState.deathAnim = null;
    simState.deathProgress = 0;
    simState.deathModalShown = false;

    const slot = document.getElementById("auto_vehicle_slot");
    if (slot) {
      slot.classList.remove("veh-grayscale");
      slot.removeAttribute("transform");
    }
    const eyes = document.querySelector("#auto_vehicle_slot .cartoon-eyes");
    if (eyes) eyes.setAttribute("opacity", "1");

    ["auto_death_angel", "auto_death_ko", "auto_death_meteor", "auto_death_boom", "auto_death_deflate_fx"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("opacity", "0");
    });
  }

  function updateDeathAnimation(rawDt) {
    if (!simState.deathAnim) return;
    simState.deathProgress += rawDt;
    const p = simState.deathProgress;

    // Ocultar vectores de fuerza y efectos normales
    ["vec_traction", "vec_traction_lbl", "vec_drag", "vec_drag_lbl", "vec_grade", "vec_grade_lbl", "auto_fx_wind", "auto_fx_sweat", "auto_fx_sparks", "auto_fx_regen"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("opacity", "0");
    });

    const bubble = document.getElementById("auto_comic_bubble");
    const bubbleText = document.getElementById("auto_comic_text");
    const setBubble = (msg) => {
      if (bubble && bubbleText) {
        bubble.setAttribute("opacity", "1");
        bubbleText.textContent = msg;
      }
    };

    if (simState.deathAnim === "angel") {
      const angel = document.getElementById("auto_death_angel");
      if (angel) {
        const lift = Math.min(p * 65, 165);
        const sway = Math.sin(p * 5) * 12;
        const alpha = p > 2.0 ? Math.max(0, 1 - (p - 2.0) * 1.5) : 0.95;
        angel.setAttribute("opacity", alpha.toFixed(2));
        angel.setAttribute("transform", `translate(${(110 + sway).toFixed(1)}, ${(20 - lift).toFixed(1)})`);
      }
      setBubble(pickL("¡Adiós mundo cruel! 😇", "Goodbye cruel world! 😇", "飞向天堂啦 😇!"));
    } else if (simState.deathAnim === "ko_face") {
      const eyes = document.querySelector("#auto_vehicle_slot .cartoon-eyes");
      if (eyes) eyes.setAttribute("opacity", "0");
      const ko = document.getElementById("auto_death_ko");
      if (ko) ko.setAttribute("opacity", "1");
      setBubble(pickL("¡Batería K.O.! 😵", "Battery K.O.! 😵", "没电晕倒了 😵!"));
    } else if (simState.deathAnim === "grayscale") {
      const slot = document.getElementById("auto_vehicle_slot");
      if (slot) slot.classList.add("veh-grayscale");
      setBubble(pickL("Sin color... sin vida 🗿", "No power... turned to stone 🗿", "变成石像了 🗿!"));
    } else if (simState.deathAnim === "meteor") {
      const meteor = document.getElementById("auto_death_meteor");
      const boom = document.getElementById("auto_death_boom");
      const slot = document.getElementById("auto_vehicle_slot");
      const tFall = clamp(p / 0.55, 0, 1);
      if (meteor) {
        const mx = 260 + (115 - 260) * tFall;
        const my = -180 + (32 - (-180)) * tFall;
        meteor.setAttribute("opacity", tFall < 1 ? "1" : "0.95");
        meteor.setAttribute("transform", `translate(${mx.toFixed(1)}, ${my.toFixed(1)})`);
      }
      if (tFall >= 1) {
        if (boom) {
          const s = p < 1.1 ? 1 + Math.sin((p - 0.55) * 14) * 0.15 : 0;
          boom.setAttribute("opacity", s > 0 ? "1" : "0");
          boom.setAttribute("transform", `translate(115, 30) scale(${Math.max(0.1, s).toFixed(2)})`);
        }
        if (slot) {
          const shake = p < 1.1 ? Math.sin(p * 55) * 3 : 0;
          slot.setAttribute("transform", `translate(${shake.toFixed(1)}, 14) scale(1.06, 0.84)`);
        }
      }
      setBubble(pickL("¡Meteorito! 💥☄️", "Meteorite! 💥☄️", "陨石撞击 💥!"));
    } else if (simState.deathAnim === "deflate") {
      const slot = document.getElementById("auto_vehicle_slot");
      const fx = document.getElementById("auto_death_deflate_fx");
      const tDef = clamp(p / 1.1, 0, 1);
      const sx = 1 + 0.18 * tDef;
      const sy = 1 - 0.62 * tDef;
      const ty = 66 * tDef;
      if (slot) {
        slot.setAttribute("transform", `translate(0, ${ty.toFixed(1)}) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`);
      }
      if (fx) {
        fx.setAttribute("opacity", tDef < 0.95 ? "1" : "0");
      }
      setBubble(pickL("¡Me desinflé! 💨", "Deflated! 💨", "漏气啦 💨!"));
    }

    if (p >= 2.3 && !simState.deathModalShown) {
      simState.deathModalShown = true;
      showResultsModal();
    }
  }

  function animationLoop(ts) {
    if (!lastFrameTs) lastFrameTs = ts;
    const rawDt = Math.min(0.05, (ts - lastFrameTs) / 1000);
    lastFrameTs = ts;

    if (simState.running && !simState.finished) {
      // Sub-stepping para mantener precisión física en 20x, 50x y 100x
      const totalSimDt = rawDt * simState.speedMultiplier;
      const steps = Math.max(1, Math.ceil(totalSimDt / 0.15));
      const subDt = totalSimDt / steps;
      for (let i = 0; i < steps; i++) {
        if (!simState.running) break;
        stepPhysics(subDt);
      }

      // Animación visual a 60 FPS
      updateStageAnimation(rawDt);

      // Actualización del DOM numérico a 10 FPS (cada 100 ms)
      if (ts - lastHudTs >= 100) {
        updateTelemetryDOM();
        lastHudTs = ts;
      }
    } else if (simState.deathAnim) {
      updateDeathAnimation(rawDt);
    }

    rafId = requestAnimationFrame(animationLoop);
  }

  function updateStageAnimation(rawDt) {
    const speedKmh = simState.currentSpeedKmh;
    const vPxPerSec = speedKmh * 4.2 * Math.min(simState.speedMultiplier, 4);
    simState.parallaxX += vPxPerSec * rawDt;
    simState.wheelAngle = (simState.wheelAngle + vPxPerSec * rawDt * 2.5) % 360;

    // Inclinación visual proporcional a la pendiente (en grados)
    const visualTiltDeg = clamp(-simState.currentSlopePct * 1.15, -14, 14);

    const roadGroup = document.getElementById("auto_road_group");
    if (roadGroup) {
      roadGroup.setAttribute("transform", `rotate(${visualTiltDeg.toFixed(2)}, 400, 265)`);
    }

    // Capas parallax (nubes, montañas, colinas, árboles/postes, línea de carretera)
    const laneDash = document.getElementById("auto_lane_dash");
    if (laneDash) {
      laneDash.setAttribute("stroke-dashoffset", (simState.parallaxX % 64).toFixed(1));
    }

    const cloudsLayer = document.getElementById("auto_bg_clouds");
    if (cloudsLayer) {
      const cx = -((simState.parallaxX * 0.04) % 800);
      cloudsLayer.setAttribute("transform", `translate(${cx.toFixed(1)}, 0)`);
    }

    const mtnLayer = document.getElementById("auto_bg_mountains");
    if (mtnLayer) {
      const mx = -((simState.parallaxX * 0.12) % 800);
      mtnLayer.setAttribute("transform", `translate(${mx.toFixed(1)}, 0)`);
    }

    const hillLayer = document.getElementById("auto_bg_hills");
    if (hillLayer) {
      const hx = -((simState.parallaxX * 0.30) % 800);
      hillLayer.setAttribute("transform", `translate(${hx.toFixed(1)}, 0)`);
    }

    const propsLayer = document.getElementById("auto_bg_props");
    if (propsLayer) {
      const px = -((simState.parallaxX * 0.85) % 800);
      propsLayer.setAttribute("transform", `translate(${px.toFixed(1)}, 0)`);
    }

    // Rebote cartoon de suspensión + cabeceo al acelerar/frenar
    const bodyGroup = document.querySelector("#auto_vehicle_slot .veh-body-group");
    if (bodyGroup) {
      const bounceY = speedKmh > 1 ? Math.sin(simState.parallaxX * 0.14) * 2.4 : 0;
      const accelPitch = clamp(-simState.forces.fInertia / 1200, -3.5, 3.5);
      bodyGroup.setAttribute("transform", `translate(0, ${bounceY.toFixed(2)}) rotate(${accelPitch.toFixed(2)}, 110, 75)`);
    }

    // Rotación de ruedas del vehículo
    const spokes = document.querySelectorAll("#auto_vehicle_slot .wheel-spokes");
    spokes.forEach(s => {
      s.setAttribute("transform", `rotate(${simState.wheelAngle.toFixed(1)})`);
    });

    // Efectos cómicos y educativos basados en la física real
    const fxWind = document.getElementById("auto_fx_wind");
    if (fxWind) fxWind.setAttribute("opacity", speedKmh > 40 ? clamp((speedKmh - 40) / 50, 0.25, 0.95).toFixed(2) : "0");

    const fxSweat = document.getElementById("auto_fx_sweat");
    if (fxSweat) {
      const sweating = simState.currentSlopePct >= 2.5 && speedKmh > 2;
      fxSweat.setAttribute("opacity", sweating ? "1" : "0");
      if (sweating) {
        const dropY = (simState.parallaxX * 0.08) % 10;
        fxSweat.setAttribute("transform", `translate(0, ${dropY.toFixed(1)})`);
      }
    }

    const fxSparks = document.getElementById("auto_fx_sparks");
    if (fxSparks) fxSparks.setAttribute("opacity", simState.forces.fInertia > 600 && speedKmh > 2 ? "1" : "0");

    const fxRegen = document.getElementById("auto_fx_regen");
    if (fxRegen) {
      const isRegen = simState.forces.powerKw < -0.5;
      fxRegen.setAttribute("opacity", isRegen ? "1" : "0");
      if (isRegen) {
        const floatY = -((simState.parallaxX * 0.08) % 12);
        fxRegen.setAttribute("transform", `translate(0, ${floatY.toFixed(1)})`);
      }
    }

    // Bocadillo cómico educativo
    const bubble = document.getElementById("auto_comic_bubble");
    const bubbleText = document.getElementById("auto_comic_text");
    if (bubble && bubbleText) {
      let msg = "";
      if (simState.soc < 20 && simState.running) {
        msg = pickL("¡Poca batería 🪫!", "Low battery 🪫!", "电量不足 🪫!");
      } else if (simState.forces.powerKw < -0.8) {
        msg = pickL("¡Regenerando ⚡!", "Regenerating ⚡!", "能量回收中 ⚡!");
      } else if (simState.currentSlopePct >= 3 && speedKmh > 2) {
        msg = pickL("¡Uf, qué subida 💦!", "Steep climb 💦!", "好陡的上坡 💦!");
      } else if (speedKmh >= 95) {
        msg = pickL("¡Mucho aire 💨!", "High air drag 💨!", "风阻很大 💨!");
      } else if (!simState.running && simState.distanceM === 0) {
        msg = pickL("¡Listo para rodar!", "Ready to roll! 🚗", "准备出发! 🚗");
      }
      bubble.setAttribute("opacity", msg ? "1" : "0");
      if (msg) bubbleText.textContent = msg;
    }

    // Vectores de fuerza educativos en vivo (Ft, Fa+Fr, Fp)
    const setVec = (lineId, lblId, startX, dir, magN) => {
      const line = document.getElementById(lineId);
      const lbl = document.getElementById(lblId);
      if (!line || !lbl) return;
      const absN = Math.abs(magN);
      if (absN < 80 || speedKmh < 0.5) {
        line.setAttribute("opacity", "0");
        lbl.setAttribute("opacity", "0");
        return;
      }
      const len = clamp(absN / 45, 22, 75);
      const endX = startX + dir * len;
      line.setAttribute("x1", startX);
      line.setAttribute("x2", endX.toFixed(1));
      line.setAttribute("opacity", "0.95");
      lbl.setAttribute("x", ((startX + endX) / 2).toFixed(1));
      lbl.setAttribute("opacity", "0.95");
    };

    setVec("vec_traction", "vec_traction_lbl", 214, 1, Math.max(0, simState.forces.fTotal));
    setVec("vec_drag", "vec_drag_lbl", 6, -1, simState.forces.fAero + simState.forces.fRoll);
    setVec("vec_grade", "vec_grade_lbl", 6, simState.forces.fGrade >= 0 ? -1 : 1, simState.forces.fGrade);
  }

  function updateTelemetryDOM() {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const totalKm = getTotalRouteKm();
    const distKm = simState.distanceM / 1000;
    const pct = totalKm > 0 ? clamp((distKm / totalKm) * 100, 0, 100) : 0;

    setText("tele_speed", simState.currentSpeedKmh.toFixed(1));
    setText("tele_cons", simState.instantConsKwh100.toFixed(1));
    setText("tele_soc", simState.soc.toFixed(1));
    setText("tele_kwh", simState.remainingKwh.toFixed(2));
    setText("tele_est_range", simState.estimatedRangeKm > 0 ? `${simState.estimatedRangeKm.toFixed(0)} km` : "--");
    setText("tele_avg_cons", simState.avgConsKwh100 > 0 ? `${simState.avgConsKwh100.toFixed(1)} kWh/100km` : "--");

    setText("hud_slope", `${simState.currentSlopePct >= 0 ? "+" : ""}${simState.currentSlopePct.toFixed(1)}%`);
    setText("hud_cycle", simState.cycleKey);
    setText("hud_time", `${Math.floor(simState.t / 60)}m ${Math.floor(simState.t % 60)}s`);
    setText("route_dist_label", `${distKm.toFixed(2)} / ${totalKm.toFixed(1)} km`);
    setText("route_seg_label", `#${simState.currentSegIndex + 1} / ${simState.route.length}`);

    // Indicador visual de batería cartoon en el HUD del escenario
    setText("hud_bat_pct", `${simState.soc.toFixed(0)}%`);
    setText("hud_bat_kwh", `${simState.remainingKwh.toFixed(1)} kWh`);
    const hudBatFill = document.getElementById("hud_bat_fill");
    const hudBatPill = document.getElementById("hud_battery_pill");
    if (hudBatFill) {
      hudBatFill.style.width = `${simState.soc.toFixed(1)}%`;
      hudBatFill.style.backgroundColor = simState.soc <= 15 ? "#ef4444" : (simState.soc <= 35 ? "#f59e0b" : "#22c55e");
    }
    if (hudBatPill) {
      hudBatPill.classList.toggle("low-bat", simState.soc <= 15);
    }

    // Fuerzas físicas
    setText("f_aero_val", `${simState.forces.fAero.toFixed(0)} N`);
    setText("f_roll_val", `${simState.forces.fRoll.toFixed(0)} N`);
    setText("f_grade_val", `${simState.forces.fGrade.toFixed(0)} N`);
    setText("f_inertia_val", `${simState.forces.fInertia.toFixed(0)} N`);
    setText("f_total_val", `${simState.forces.fTotal.toFixed(0)} N`);
    setText("f_power_val", `${simState.forces.powerKw.toFixed(1)} kW`);

    // Barras visuales
    const barSpeed = document.getElementById("bar_speed");
    if (barSpeed) barSpeed.style.width = `${clamp((simState.currentSpeedKmh / 140) * 100, 0, 100)}%`;

    const barSoc = document.getElementById("bar_soc");
    if (barSoc) {
      barSoc.style.width = `${simState.soc}%`;
      barSoc.style.background = simState.soc < 20 ? "#e63946" : (simState.soc < 40 ? "#f77f00" : "");
    }

    const barCons = document.getElementById("bar_cons");
    if (barCons) barCons.style.width = `${clamp((Math.abs(simState.instantConsKwh100) / 50) * 100, 0, 100)}%`;

    const progFill = document.getElementById("route_progress_fill");
    const progMarker = document.getElementById("route_progress_marker");
    if (progFill) progFill.style.width = `${pct}%`;
    if (progMarker) progMarker.style.left = `${pct}%`;
  }

  function renderVehicleSlot() {
    const slot = document.getElementById("auto_vehicle_slot");
    if (slot) {
      slot.innerHTML = getVehicleSVG(simState.vehicleId, true);
    }
  }

  function renderVehicleSelector() {
    const container = document.getElementById("auto_vehicle_profiles");
    if (!container) return;

    container.innerHTML = Object.values(VEHICLE_PROFILES).map(v => `
      <button type="button" class="vehicle-card-btn ${simState.vehicleId === v.id ? "active" : ""}" data-veh-id="${v.id}">
        ${getVehicleSVG(v.id, false)}
        <span class="vehicle-card-name">${pickL(v.nameEs, v.nameEn, v.nameZh)}</span>
        <span class="vehicle-card-meta">${v.mass} kg · ${v.batteryKwh} kWh</span>
      </button>
    `).join("");

    container.querySelectorAll(".vehicle-card-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-veh-id");
        if (!VEHICLE_PROFILES[id]) return;
        simState.vehicleId = id;
        simState.params = { ...VEHICLE_PROFILES[id] };
        syncParamsToInputs();
        resetSimulation();
        renderVehicleSelector();
        renderVehicleSlot();
        if (window.sounds) sounds.playClick();
      });
    });
  }

  function syncParamsToInputs() {
    const map = [
      ["param_mass", simState.params.mass],
      ["param_cd", simState.params.cd],
      ["param_af", simState.params.af],
      ["param_crr", simState.params.crr],
      ["param_bat", simState.params.batteryKwh]
    ];
    map.forEach(([baseId, val]) => {
      const rng = document.getElementById(`${baseId}_range`);
      const num = document.getElementById(`${baseId}_num`);
      if (rng) rng.value = val;
      if (num) num.value = val;
    });
  }

  function bindParamControl(baseId, key, min, max, resetBat = false) {
    const rng = document.getElementById(`${baseId}_range`);
    const num = document.getElementById(`${baseId}_num`);
    if (!rng || !num) return;

    const onChange = (raw) => {
      const clamped = clamp(raw, min, max);
      simState.params[key] = clamped;
      rng.value = clamped;
      num.value = clamped;
      if (resetBat && !simState.running && simState.distanceM === 0) {
        simState.remainingKwh = clamped;
        simState.soc = 100;
        updateTelemetryDOM();
      }
    };

    rng.addEventListener("input", (e) => onChange(e.target.value));
    num.addEventListener("change", (e) => onChange(e.target.value));
  }

  function renderRouteEditor() {
    const list = document.getElementById("auto_route_list");
    const track = document.getElementById("route_segments_track");
    if (!list || !track) return;

    const lblSeg = pickL("Tramo", "Segment", "路段");
    const lblDist = pickL("Dist. (km)", "Dist. (km)", "距离 (km)");
    const lblSlope = pickL("Pend. (%)", "Grade (%)", "坡度 (%)");

    list.innerHTML = simState.route.map((seg, idx) => {
      const safeId = Number(seg.id) || 0;
      const safeDist = clamp(seg.distanceKm, 0.5, 200);
      const safeSlope = clamp(seg.slopePct, -15, 15);
      return `
      <div class="route-seg-card" data-seg-id="${safeId}">
        <div class="route-seg-header">
          <span>${escapeHtml(lblSeg)} #${idx + 1}</span>
          ${simState.route.length > 1 ? `<button type="button" class="route-seg-del" data-del-seg="${safeId}" title="Eliminar">&times;</button>` : ""}
        </div>
        <label class="route-seg-field">
          <span>${escapeHtml(lblDist)}</span>
          <input type="number" min="0.5" max="200" step="0.5" value="${safeDist}" data-seg-dist="${safeId}">
        </label>
        <label class="route-seg-field">
          <span>${escapeHtml(lblSlope)}</span>
          <input type="number" min="-15" max="15" step="0.5" value="${safeSlope}" data-seg-slope="${safeId}">
        </label>
      </div>
    `;
    }).join("");

    // Renderizar barras proporcionales en la barra de progreso
    const totalKm = getTotalRouteKm();
    const barsHtml = simState.route.map(seg => {
      const w = totalKm > 0 ? (seg.distanceKm / totalKm) * 100 : 100;
      const cls = seg.slopePct > 0.5 ? "slope-up" : (seg.slopePct < -0.5 ? "slope-down" : "slope-flat");
      return `<div class="route-seg-bar ${cls}" style="width:${w.toFixed(2)}%;" title="${seg.distanceKm} km (${seg.slopePct}%)"></div>`;
    }).join("");

    track.innerHTML = `
      ${barsHtml}
      <div class="route-progress-fill" id="route_progress_fill"></div>
      <div class="route-progress-marker" id="route_progress_marker"></div>
    `;

    // Bind eventos de edición
    list.querySelectorAll("[data-del-seg]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-del-seg"));
        if (simState.route.length <= 1) return;
        simState.route = simState.route.filter(s => s.id !== id);
        renderRouteEditor();
        updateTelemetryDOM();
      });
    });

    list.querySelectorAll("[data-seg-dist]").forEach(inp => {
      inp.addEventListener("change", () => {
        const id = Number(inp.getAttribute("data-seg-dist"));
        const seg = simState.route.find(s => s.id === id);
        if (seg) {
          seg.distanceKm = clamp(inp.value, 0.5, 200);
          inp.value = seg.distanceKm;
          renderRouteEditor();
          updateTelemetryDOM();
        }
      });
    });

    list.querySelectorAll("[data-seg-slope]").forEach(inp => {
      inp.addEventListener("change", () => {
        const id = Number(inp.getAttribute("data-seg-slope"));
        const seg = simState.route.find(s => s.id === id);
        if (seg) {
          seg.slopePct = clamp(inp.value, -15, 15);
          inp.value = seg.slopePct;
          renderRouteEditor();
          updateTelemetryDOM();
        }
      });
    });
  }

  function renderCycleSelector() {
    const container = document.getElementById("auto_cycle_selector");
    if (!container) return;

    container.innerHTML = Object.keys(DRIVING_CYCLES).map(key => {
      const c = DRIVING_CYCLES[key];
      return `
        <button type="button" class="cycle-btn ${simState.cycleKey === key ? "active" : ""}" data-cycle-key="${key}">
          <strong>${c.name}</strong>
          <span>${pickL(c.descEs, c.descEn, c.descZh)}</span>
        </button>
      `;
    }).join("");

    container.querySelectorAll(".cycle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        simState.cycleKey = btn.getAttribute("data-cycle-key");
        renderCycleSelector();
        updateTelemetryDOM();
        if (window.sounds) sounds.playClick();
      });
    });
  }

  function updatePlayButton() {
    const btn = document.getElementById("btn_auto_play");
    if (!btn) return;
    if (simState.running) {
      btn.textContent = pickL("⏸ Pausar", "⏸ Pause", "⏸ 暂停");
    } else {
      btn.textContent = pickL("▶ Iniciar", "▶ Start", "▶ 开始模拟");
    }
  }

  function resetSimulation() {
    resetDeathFX();
    simState.running = false;
    simState.finished = false;
    simState.t = 0;
    simState.distanceM = 0;
    simState.energyUsedWh = 0;
    simState.remainingKwh = simState.params.batteryKwh;
    simState.soc = 100;
    simState.currentSpeedKmh = 0;
    simState.instantConsKwh100 = 0;
    simState.avgConsKwh100 = 0;
    simState.estimatedRangeKm = 0;
    simState.currentSlopePct = simState.route[0] ? simState.route[0].slopePct : 0;
    simState.currentSegIndex = 0;
    simState.forces = { fAero: 0, fRoll: 0, fGrade: 0, fInertia: 0, fTotal: 0, powerKw: 0 };
    simState.parallaxX = 0;
    simState.wheelAngle = 0;

    updatePlayButton();
    updateStageAnimation(0);
    updateTelemetryDOM();
  }

  function showResultsModal() {
    const modal = document.getElementById("autonomy_results_modal");
    if (!modal) return;

    const totalKm = getTotalRouteKm();
    const distKm = simState.distanceM / 1000;
    const reached = distKm >= totalKm - 0.02 && simState.remainingKwh > 0;

    document.getElementById("res_dist_val").textContent = `${distKm.toFixed(2)} km`;
    document.getElementById("res_cons_val").textContent = `${simState.avgConsKwh100.toFixed(2)} kWh/100km`;
    document.getElementById("res_range_val").textContent = `${simState.estimatedRangeKm.toFixed(1)} km`;

    const statusEl = document.getElementById("res_reached_val");
    if (reached) {
      statusEl.textContent = pickL("✔ Sí, llegó a destino", "✔ Yes, reached destination", "✔ 成功到达终点");
      statusEl.className = "result-box-val result-status-ok";
      if (window.sounds) sounds.playSuccess();
    } else {
      statusEl.textContent = pickL("✖ No (batería agotada)", "✖ No (battery depleted)", "✖ 电量耗尽（未到达终点）");
      statusEl.className = "result-box-val result-status-fail";
      if (window.sounds) sounds.playError();
    }

    modal.classList.add("active");
  }

  function initAutonomyLab() {
    if (!document.getElementById("view_autonomy")) return;

    renderVehicleSelector();
    renderVehicleSlot();
    renderCycleSelector();
    renderRouteEditor();
    syncParamsToInputs();

    bindParamControl("param_mass", "mass", 1000, 5000);
    bindParamControl("param_cd", "cd", 0.18, 0.60);
    bindParamControl("param_af", "af", 1.5, 5.0);
    bindParamControl("param_crr", "crr", 0.005, 0.030);
    bindParamControl("param_bat", "batteryKwh", 20, 150, true);

    document.getElementById("btn_auto_play")?.addEventListener("click", () => {
      if (simState.finished) resetSimulation();
      simState.running = !simState.running;
      updatePlayButton();
      if (window.sounds) sounds.playClick();
    });

    document.getElementById("btn_auto_reset")?.addEventListener("click", () => {
      resetSimulation();
      if (window.sounds) sounds.playClick();
    });

    document.querySelectorAll(".speed-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mult = Number(btn.getAttribute("data-speed")) || 1;
        simState.speedMultiplier = mult;
        document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (window.sounds) sounds.playClick();
      });
    });

    document.getElementById("btn_add_segment")?.addEventListener("click", () => {
      if (simState.route.length >= 25) return;
      simState.route.push({ id: nextSegId++, distanceKm: 5, slopePct: 0 });
      renderRouteEditor();
      updateTelemetryDOM();
      if (window.sounds) sounds.playClick();
    });

    document.getElementById("auto_modal_close")?.addEventListener("click", () => {
      document.getElementById("autonomy_results_modal")?.classList.remove("active");
    });
    document.getElementById("autonomy_results_modal")?.addEventListener("click", (e) => {
      if (e.target.id === "autonomy_results_modal") {
        document.getElementById("autonomy_results_modal").classList.remove("active");
      }
    });

    // Actualizar textos dinámicos al cambiar idioma (ES / 廣東話)
    window.addEventListener("sim:langchange", () => {
      renderVehicleSelector();
      renderCycleSelector();
      renderRouteEditor();
      updatePlayButton();
    });

    resetSimulation();
    if (!rafId) {
      rafId = requestAnimationFrame(animationLoop);
    }
  }

  window.AutonomyLab = {
    init: initAutonomyLab,
    reset: resetSimulation,
    pause: () => {
      simState.running = false;
      updatePlayButton();
    }
  };

  document.addEventListener("DOMContentLoaded", initAutonomyLab);
})();
