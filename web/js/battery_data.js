/**
 * Battery Design Lab — Base de datos (fuente de verdad: Conocimientos_generales_en_baterías.md)
 *
 * Módulo UMD sin DOM: se carga como <script> (window.BatteryData) o con require() en Node.js.
 * Los datos marcados `assumed: true` NO aparecen en el documento y son estimaciones didácticas
 * necesarias para completar el modelo (se documentan en la UI y en el resumen final).
 *
 * Referencias de sección: §2 parámetros · §3 químicas · §4 celdas · §5 configuraciones ·
 * §7 modelo · §8 fallas · §9.2 alarmas del BMS.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BatteryData = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const mid = (r) => (r[0] + r[1]) / 2;

  // ---------------------------------------------------------------------------
  // §2.2 / §5.1 Constantes de empaquetado y térmicas
  // ---------------------------------------------------------------------------
  const PACK_MASS_FACTOR = 1.20;          // m_pack ≈ m_cells · 1,20 (§2.2)
  const CP_PACK_J_KG_K = 900;             // Cth ≈ m_pack · cp con cp ≈ 900 J/(kg·K) (§2.2)
  const PACKING_FACTOR = {                // PF = volumen de celdas / volumen del pack (§2.2)
    cyl: 0.60,                            // cilíndricas 0,55–0,65
    prism: 0.675,                         // prismáticas 0,60–0,75
    pouch: 0.625                          // pouch 0,55–0,70
  };

  // §2.2 Conductancia térmica UA (W/K): aire 20–60, líquido 80–300.
  const COOLING = {
    none:   { id: "none",   labelEs: "Ninguno", labelYue: "冇冷卻", ua: 5,   assumed: true,
              note: "Convección natural (supuesto 📐); en V2 se usa UA = 0 (adiabático)." },
    air:    { id: "air",    labelEs: "Aire",    labelYue: "空氣冷卻", ua: 40,  uaRange: [20, 60] },
    liquid: { id: "liquid", labelEs: "Líquido", labelYue: "液冷", ua: 150, uaRange: [80, 300] }
  };

  // ---------------------------------------------------------------------------
  // §3 Base de datos de materiales (valores de celda). Rangos como [mín, máx].
  // Campos: Vnom, Wh/kg, Wh/L, W/kg, ciclos, autodescarga %/mes, η coulómbica, C carga,
  // C descarga cont./pico, T operación, vida calendario, costo $/kWh, k Peukert, Cp.
  // vmin/vmax: §1.3 y §9.1. voc: §7.3 (Voc_celda = a + b·SOC, SOC en fracción 0–1).
  // ---------------------------------------------------------------------------
  const CHEMISTRIES = {
    PB_FLOODED: {
      id: "PB_FLOODED", labelEs: "Plomo-ácido inundada", labelYue: "鉛酸（開放式）",
      vnom: 2.0, whKg: [30, 40], whL: [60, 80], wKg: [150, 250], cycles: [300, 500],
      selfDischargeRange: [4, 6], selfDischargeMonthly: 5, etaCoul: 0.825, roundTrip: 0.825,
      chargeC: [0.1, 0.2], dischargeContC: [1, 1], dischargePeakC: [5, 10],
      tOp: [-20, 50], calendarYears: [2, 4], costRange: [90, 150], costPerKWh: 120, costAssumed: true,
      peukertK: 1.30, cp: [700, 700], safety: "Media (H₂, ácido)", memory: "No",
      vmin: 1.75, vmax: 2.7, voc: { a: 11.6 / 6, b: 1.0 / 6 }, calFadePerYear: 4
    },
    PB_AGM: {
      id: "PB_AGM", labelEs: "Plomo-ácido AGM/VRLA", labelYue: "鉛酸（AGM/VRLA）",
      vnom: 2.0, whKg: [35, 45], whL: [80, 110], wKg: [200, 300], cycles: [400, 600],
      selfDischargeRange: [3, 5], selfDischargeMonthly: 3, etaCoul: 0.875, roundTrip: 0.825,
      chargeC: [0.1, 0.3], dischargeContC: [1, 3], dischargePeakC: [5, 10],
      tOp: [-20, 50], calendarYears: [3, 5], costRange: [100, 170], costPerKWh: 135, costAssumed: true,
      peukertK: 1.25, cp: [700, 700], safety: "Media", memory: "No",
      vmin: 1.75, vmax: 2.7, voc: { a: 11.6 / 6, b: 1.0 / 6 }, calFadePerYear: 4
    },
    NICD: {
      id: "NICD", labelEs: "Ni-Cd", labelYue: "鎳鎘電池",
      vnom: 1.2, whKg: [40, 60], whL: [80, 120], wKg: [150, 300], cycles: [1000, 2000],
      selfDischargeRange: [15, 20], selfDischargeMonthly: 17.5, etaCoul: 0.80, roundTrip: 0.80,
      chargeC: [0.1, 0.3], dischargeContC: [1, 5], dischargePeakC: [10, 10],
      tOp: [-20, 60], calendarYears: [5, 8], costRange: [300, 500], costPerKWh: 400, costAssumed: true,
      peukertK: 1.10, cp: [800, 800], safety: "Media (Cd tóxico)", memory: "Sí",
      vmin: 1.0, vmax: 1.5, vminAssumed: true, voc: null, calFadePerYear: 2
    },
    NIMH: {
      id: "NIMH", labelEs: "NiMH", labelYue: "鎳氫電池",
      vnom: 1.2, whKg: [70, 95], whL: [140, 200], wKg: [200, 400], cycles: [500, 1000],
      selfDischargeRange: [20, 30], selfDischargeMonthly: 25, etaCoul: 0.85, roundTrip: 0.85,
      chargeC: [0.3, 1], dischargeContC: [3, 10], dischargePeakC: [10, 10],
      tOp: [-10, 45], calendarYears: [5, 8], costRange: [300, 500], costPerKWh: 400, costAssumed: true,
      peukertK: 1.15, cp: [800, 800], safety: "Alta (térmica)", memory: "Leve",
      vmin: 1.0, vmax: 1.5, voc: { a: 1.20, b: 0.15 }, calFadePerYear: 2
    },
    LFP: {
      id: "LFP", labelEs: "LFP (LiFePO₄)", labelYue: "磷酸鐵鋰 (LFP)",
      vnom: 3.2, whKg: [100, 180], whL: [250, 350], wKg: [200, 500], cycles: [2000, 6000],
      selfDischargeRange: [1, 3], selfDischargeMonthly: 2, etaCoul: 0.965, roundTrip: 0.96,
      chargeC: [0.5, 3], dischargeContC: [1, 3], dischargePeakC: [5, 5],
      tOp: [-20, 60], calendarYears: [8, 15], costRange: [81, 81], costPerKWh: 81,
      peukertK: 1.02, cp: [900, 1100], safety: "Alta", memory: "No",
      vmin: 2.5, vmax: 3.65, voc: { a: 3.20, b: 0.06 }, calFadePerYear: 2
    },
    LMO: {
      id: "LMO", labelEs: "LMO (LiMn₂O₄)", labelYue: "錳酸鋰 (LMO)",
      vnom: 3.7, whKg: [100, 150], whL: [200, 280], wKg: [300, 600], cycles: [500, 1000],
      selfDischargeRange: [3, 3], selfDischargeMonthly: 3, etaCoul: 0.95, roundTrip: 0.95,
      chargeC: [0.5, 1], dischargeContC: [2, 10], dischargePeakC: [20, 20],
      tOp: [-20, 55], calendarYears: [5, 8], costRange: [100, 140], costPerKWh: 120, costAssumed: true,
      peukertK: 1.03, cp: [850, 850], safety: "Media", memory: "No",
      vmin: 3.0, vmax: 4.2, vmaxAssumed: true, voc: null, calFadePerYear: 2
    },
    NCM: {
      id: "NCM", labelEs: "NCM / NCA", labelYue: "三元鋰 (NCM/NCA)",
      vnom: 3.7, whKg: [150, 250], whL: [300, 700], wKg: [300, 1000], cycles: [1000, 2500],
      selfDischargeRange: [2, 5], selfDischargeMonthly: 3.5, etaCoul: 0.95, roundTrip: 0.95,
      chargeC: [0.5, 1], dischargeContC: [2, 5], dischargePeakC: [10, 10],
      tOp: [-20, 55], calendarYears: [8, 12], costRange: [128, 128], costPerKWh: 128,
      peukertK: 1.03, cp: [900, 1100], safety: "Media", memory: "No",
      vmin: 3.0, vmax: 4.25, voc: { a: 3.55, b: 0.55 }, calFadePerYear: 2
    },
    LTO: {
      id: "LTO", labelEs: "LTO (Li₄Ti₅O₁₂)", labelYue: "鈦酸鋰 (LTO)",
      vnom: 2.35, whKg: [60, 90], whL: [120, 200], wKg: [1000, 4000], cycles: [10000, 20000],
      selfDischargeRange: [2, 3], selfDischargeMonthly: 2.5, etaCoul: 0.98, roundTrip: 0.975,
      chargeC: [5, 10], dischargeContC: [10, 30], dischargePeakC: [50, 50],
      tOp: [-30, 55], calendarYears: [15, 20], costRange: [200, 450], costPerKWh: 325, costAssumed: true,
      peukertK: 1.01, cp: [900, 900], safety: "Muy alta", memory: "No",
      vmin: 1.5, vmax: 2.8, vmaxAssumed: true, voc: null, calFadePerYear: 2
    },
    SUPERCAP: {
      id: "SUPERCAP", labelEs: "Supercondensador", labelYue: "超級電容",
      vnom: 2.7, whKg: [5, 10], whL: [10, 20], wKg: [5000, 10000], cycles: [500000, 500000],
      selfDischargeRange: [1, 2], selfDischargeMonthly: 1.5, etaCoul: 0.965, roundTrip: 0.965,
      chargeC: [100, 100], dischargeContC: [100, 100], dischargePeakC: [100, 100],
      tOp: [-40, 65], calendarYears: [10, 15], costRange: [3000, 10000], costPerKWh: 6500, costAssumed: true,
      peukertK: 1.00, cp: [800, 800], safety: "Alta", memory: "No",
      vmin: 1.35, vmax: 2.7, voc: null, calFadePerYear: 2, selectable: false
    }
  };

  // Voc_celda de las químicas sin curva en §7.3 (supuesto 📐): Voc(0,5) = Vnom, pendiente suave.
  Object.keys(CHEMISTRIES).forEach((k) => {
    const c = CHEMISTRIES[k];
    if (!c.voc) {
      c.voc = { a: c.vnom * 0.97, b: c.vnom * 0.06 };
      c.vocAssumed = true;
    }
    c.cyclesNominal = mid(c.cycles);
    c.cpMid = mid(c.cp);
    if (c.selectable === undefined) c.selectable = true;
  });

  // ---------------------------------------------------------------------------
  // §4 Catálogo de celdas comerciales (+ celdas genéricas 📐 para químicas sin formato en §4)
  // ---------------------------------------------------------------------------
  const cylVolumeL = (d, h) => (Math.PI * (d / 2) * (d / 2) * h) / 1e6;
  const boxVolumeL = (a, b, c) => (a * b * c) / 1e6;

  const CELLS = {
    C18650: {
      id: "C18650", labelEs: "18650 (⌀18×65 mm)", labelYue: "18650 圓柱 (⌀18×65 mm)", shape: "cyl",
      capacityAh: 3.0, massKg: 0.047, rintOhm: 0.032, volumeL: cylVolumeL(18, 65),
      chems: ["NCM", "LFP", "LMO"], note: "2,5–3,5 Ah · 45–48 g · 25–40 mΩ (valores medios)"
    },
    C21700: {
      id: "C21700", labelEs: "21700 (⌀21×70 mm)", labelYue: "21700 圓柱 (⌀21×70 mm)", shape: "cyl",
      capacityAh: 4.5, massKg: 0.068, rintOhm: 0.012, volumeL: cylVolumeL(21, 70),
      chems: ["NCM", "LFP", "LMO"], note: "4,0–5,0 Ah · 65–70 g · 4–25 mΩ (valores medios)"
    },
    C26650: {
      id: "C26650", labelEs: "26650 (⌀26×65 mm)", labelYue: "26650 圓柱 (⌀26×65 mm)", shape: "cyl",
      capacityAh: 5.0, massKg: 0.090, rintOhm: 0.020, volumeL: cylVolumeL(26, 65),
      chems: ["NCM", "LFP", "LMO"], note: "4,5–5,5 Ah · 85–95 g · 15–25 mΩ (valores medios)"
    },
    C32650: {
      id: "C32650", labelEs: "32650 (⌀32×65 mm)", labelYue: "32650 圓柱 (⌀32×65 mm)", shape: "cyl",
      capacityAh: 6.2, massKg: 0.140, rintOhm: 0.015, volumeL: cylVolumeL(32, 65),
      chems: ["NCM", "LFP", "LMO"], note: "6,0–6,5 Ah · 135–145 g · 10–20 mΩ (valores medios)"
    },
    PRISM_LFP_100: {
      id: "PRISM_LFP_100", labelEs: "Prismática LFP 100 Ah", labelYue: "方形 LFP 100 Ah", shape: "prism",
      capacityAh: 100, massKg: 2.0, rintOhm: 0.00055, volumeL: boxVolumeL(175, 130, 50),
      chems: ["LFP"], note: "≈175×130×50 mm 📐 · 2,0 kg 📐 · 0,4–0,7 mΩ · 320 Wh"
    },
    PRISM_LFP_280: {
      id: "PRISM_LFP_280", labelEs: "Prismática LFP 280 Ah", labelYue: "方形 LFP 280 Ah", shape: "prism",
      capacityAh: 280, massKg: 5.275, rintOhm: 0.00025, volumeL: boxVolumeL(205, 174, 72),
      chems: ["LFP"], note: "205×174×72 mm · 5,25–5,30 kg · ≤0,25 mΩ · 896 Wh"
    },
    POUCH_NMC_40: {
      id: "POUCH_NMC_40", labelEs: "Pouch NMC 40 Ah", labelYue: "軟包 NMC 40 Ah", shape: "pouch",
      capacityAh: 40, massKg: 0.60, rintOhm: 0.001, volumeL: 0.296,
      chems: ["NCM"], assumed: true, note: "20–60 Ah 📐 · 230–260 Wh/kg 📐 · 0,5–1,5 mΩ (valores medios)"
    },
    // Celdas genéricas (📐): derivadas de Wh/kg y Wh/L de §3 porque §4 no las lista.
    GEN_PB_AGM_60: {
      id: "GEN_PB_AGM_60", labelEs: "Celda Pb AGM 2 V · 60 Ah (genérica)", labelYue: "鉛酸 AGM 2 V · 60 Ah（通用）", shape: "prism",
      capacityAh: 60, massKg: 3.0, rintOhm: 0.005 / 6, volumeL: 1.26,
      chems: ["PB_AGM"], assumed: true, note: "Rint 5 mΩ por batería de 12 V (V4) ÷ 6 celdas"
    },
    GEN_PB_FLOODED_100: {
      id: "GEN_PB_FLOODED_100", labelEs: "Celda Pb inundada 2 V · 100 Ah (genérica)", labelYue: "鉛酸開放式 2 V · 100 Ah（通用）", shape: "prism",
      capacityAh: 100, massKg: 5.7, rintOhm: 0.0006, volumeL: 2.86,
      chems: ["PB_FLOODED"], assumed: true, note: "Genérica 📐 a partir de 30–40 Wh/kg"
    },
    GEN_NIMH_10: {
      id: "GEN_NIMH_10", labelEs: "Celda NiMH 1,2 V · 10 Ah (genérica)", labelYue: "鎳氫 1.2 V · 10 Ah（通用）", shape: "cyl",
      capacityAh: 10, massKg: 0.15, rintOhm: 0.008, volumeL: 0.0706,
      chems: ["NIMH"], assumed: true, note: "Genérica 📐 a partir de 70–95 Wh/kg"
    },
    GEN_NICD_5: {
      id: "GEN_NICD_5", labelEs: "Celda Ni-Cd 1,2 V · 5 Ah (genérica)", labelYue: "鎳鎘 1.2 V · 5 Ah（通用）", shape: "cyl",
      capacityAh: 5, massKg: 0.12, rintOhm: 0.010, volumeL: 0.06,
      chems: ["NICD"], assumed: true, note: "Genérica 📐 a partir de 40–60 Wh/kg"
    },
    GEN_LTO_40: {
      id: "GEN_LTO_40", labelEs: "Prismática LTO 2,35 V · 40 Ah (genérica)", labelYue: "方形 LTO 2.35 V · 40 Ah（通用）", shape: "prism",
      capacityAh: 40, massKg: 1.25, rintOhm: 0.0006, volumeL: 0.575,
      chems: ["LTO"], assumed: true, note: "Genérica 📐 a partir de 60–90 Wh/kg"
    }
  };

  // ---------------------------------------------------------------------------
  // §2.1 / §5.2 / §10 Perfiles de aplicación (defaults de diseño)
  // ---------------------------------------------------------------------------
  const APPLICATIONS = {
    urbano:   { id: "urbano",   labelEs: "BEV urbano",              labelYue: "城市純電車",
                eKWh: 40,  vPackV: 400, pPeakKW: 100, pContKW: 50,  chemId: "LFP", cellId: "PRISM_LFP_100", cooling: "liquid" },
    sedan:    { id: "sedan",    labelEs: "Sedán largo alcance",     labelYue: "長續航房車",
                eKWh: 80,  vPackV: 400, pPeakKW: 200, pContKW: 100, chemId: "NCM", cellId: "C21700",        cooling: "liquid" },
    bus:      { id: "bus",      labelEs: "Autobús urbano",          labelYue: "城市巴士",
                eKWh: 325, vPackV: 600, pPeakKW: 250, pContKW: 150, chemId: "LFP", cellId: "PRISM_LFP_280", cooling: "liquid" },
    camion:   { id: "camion",   labelEs: "Camión largo recorrido",  labelYue: "長途貨車",
                eKWh: 400, vPackV: 800, pPeakKW: 400, pContKW: 250, chemId: "LFP", cellId: "PRISM_LFP_280", cooling: "liquid" },
    scooter:  { id: "scooter",  labelEs: "Scooter / e-bike",        labelYue: "電動滑板車／電單車",
                eKWh: 0.8, vPackV: 48,  pPeakKW: 3,   pContKW: 1.5, chemId: "NCM", cellId: "C21700",        cooling: "air" },
    respaldo: { id: "respaldo", labelEs: "Respaldo / solar",        labelYue: "後備／太陽能",
                eKWh: 13.4, vPackV: 48, pPeakKW: 10,  pContKW: 5,   chemId: "LFP", cellId: "PRISM_LFP_280", cooling: "air" },
    arranque: { id: "arranque", labelEs: "Arranque (SLI 12 V)",     labelYue: "啟動電池 (SLI 12 V)",
                eKWh: 0.72, vPackV: 12, pPeakKW: 5,   pContKW: 3,   chemId: "PB_AGM", cellId: "GEN_PB_AGM_60", cooling: "none" }
  };
  const DESIGN_DEFAULTS = {
    cDis: 1, cPeak: 3, cChg: 0.5,        // §2.1
    socInitialPct: 90, socMinPct: 10, socMaxPct: 100, tAmbC: 25,
    baseConsumptionWhKm: 150             // V3 (§12)
  };

  // Límites de entrada (rango típico §2.1 ampliado para las aplicaciones de §5.2)
  const INPUT_LIMITS = {
    eKWh: [0.5, 600], vPackV: [12, 1000], pPeakKW: [1, 400], pContKW: [0.5, 250],
    cDis: [0.2, 5], cPeak: [0.5, 20], cChg: [0.05, 3],
    cRate: [0.2, 5], socInitialPct: [5, 100], socMinPct: [0, 20], socMaxPct: [80, 100],
    tAmbC: [-30, 50], storageTempC: [-20, 60], cyclesN: [1, 20000], dodPct: [10, 100],
    rintMult: [5, 20], baseConsumptionWhKm: [50, 400]
  };

  // ---------------------------------------------------------------------------
  // §8 Inyección de fallas
  // level: nivel (cell/module/pack/system). detect: detección por el BMS para fallas que no se
  // manifiestan en una señal de §9.2 (si falta, la detectan las señales del BMS).
  // magDefault: magnitud por defecto (p. ej. R×10).
  // ---------------------------------------------------------------------------
  const FAULT_GROUPS = [
    { id: "cell",   labelEs: "Celda",   labelYue: "電芯" },
    { id: "module", labelEs: "Módulo",  labelYue: "模組" },
    { id: "pack",   labelEs: "Pack",    labelYue: "電池包" },
    { id: "system", labelEs: "Sistema", labelYue: "系統" }
  ];

  const FAULTS = {
    // 8.1 Nivel celda
    F_CELL_RINT:    { id: "F_CELL_RINT", group: "cell", required: true, magDefault: 10, magRange: [5, 20],
                      labelEs: "Resistencia alta (R×10)", labelYue: "內阻偏高 (R×10)",
                      effectEs: "R_celda × 5–20 → punto caliente y caída de tensión local" },
    F_CELL_CAP:     { id: "F_CELL_CAP", group: "cell", magDefault: 0.8,
                      labelEs: "Pérdida de capacidad (×0,8)", labelYue: "容量衰減 (×0.8)",
                      effectEs: "C_celda × 0,7–0,9 → desequilibrio progresivo" },
    F_CELL_SELF:    { id: "F_CELL_SELF", group: "cell", magDefault: 20,
                      labelEs: "Autodescarga alta (×20)", labelYue: "自放電偏高 (×20)",
                      effectEs: "self_discharge × 20 → se vacía en días" },
    F_CELL_SHORT:   { id: "F_CELL_SHORT", group: "cell", required: true,
                      labelEs: "Cortocircuito interno", labelYue: "內部短路",
                      effectEs: "Voc_celda = 0; vecinas sobrecargadas" },
    F_CELL_OPEN:    { id: "F_CELL_OPEN", group: "cell", required: true,
                      labelEs: "Circuito abierto", labelYue: "斷路",
                      effectEs: "R_celda = ∞; el string pierde una celda" },
    F_CELL_RUNAWAY: { id: "F_CELL_RUNAWAY", group: "cell", required: true, thermal: true,
                      labelEs: "Disparo térmico", labelYue: "熱失控觸發",
                      effectEs: "Q_gen × 100 en esa celda + propagación con retardo" },
    // 8.2 Nivel módulo
    F_MOD_OPEN:     { id: "F_MOD_OPEN", group: "module", required: true,
                      labelEs: "Celda abierta en serie", labelYue: "串聯電芯斷路",
                      effectEs: "V_módulo − V_celda; el pack pierde ~3,2 V",
                      detect: { level: 2, delayS: 1 } },
    F_MOD_SHORT:    { id: "F_MOD_SHORT", group: "module",
                      labelEs: "Celda en corto", labelYue: "電芯短路",
                      effectEs: "V_módulo − V_celda permanente; vecinas se sobrecargan" },
    F_MOD_NTC:      { id: "F_MOD_NTC", group: "module", required: true, thermal: true,
                      labelEs: "Sensor NTC ciego", labelYue: "NTC 感測器失效",
                      effectEs: "Lectura fija → se pierde la detección térmica",
                      detect: { level: 2, delayS: 60 } },
    F_MOD_BUS:      { id: "F_MOD_BUS", group: "module", magDefault: 0.003,
                      labelEs: "Conexión floja (+3 mΩ)", labelYue: "接駁鬆脫 (+3 mΩ)",
                      effectEs: "R_módulo + 1–5 mΩ → calor local y caída" },
    // 8.3 Nivel pack
    F_PACK_CONTACTOR: { id: "F_PACK_CONTACTOR", group: "pack", required: true,
                      labelEs: "Contactor abierto", labelYue: "接觸器斷開",
                      effectEs: "I = 0; el coche no arranca", detect: { level: 3, delayS: 0 } },
    F_PACK_FUSE:    { id: "F_PACK_FUSE", group: "pack",
                      labelEs: "Fusible abierto (tras un pico)", labelYue: "保險絲熔斷（電流峰值後）",
                      effectEs: "Igual, pero aparece tras un pico" },
    F_PACK_COOLANT: { id: "F_PACK_COOLANT", group: "pack", required: true, thermal: true,
                      labelEs: "Fuga de refrigerante (UA×0,2)", labelYue: "冷卻液洩漏 (UA×0.2)",
                      effectEs: "UA × 0,2 → subida de T", detect: { level: 2, delayS: 5 } },
    F_PACK_ISO:     { id: "F_PACK_ISO", group: "pack", required: true,
                      labelEs: "Falla de aislamiento", labelYue: "絕緣故障",
                      effectEs: "Alarma de seguridad; corte por norma" },
    F_PACK_MSD:     { id: "F_PACK_MSD", group: "pack",
                      labelEs: "Interruptor de mantenimiento abierto", labelYue: "維修開關斷開",
                      effectEs: "I = 0", detect: { level: 3, delayS: 0 } },
    // 8.4 Nivel sistema
    F_SYS_CAN:      { id: "F_SYS_CAN", group: "system", required: true,
                      labelEs: "Pérdida de CAN", labelYue: "CAN 通訊中斷",
                      effectEs: "Sin datos al VCU → limp mode", detect: { level: 2, delayS: 0 } },
    F_SYS_DCDC:     { id: "F_SYS_DCDC", group: "system", required: true,
                      labelEs: "DC/DC caído", labelYue: "DC/DC 失效",
                      effectEs: "Se muere la red de 12 V → contactores se abren", detect: { level: 3, delayS: 0 } },
    F_SYS_SHUNT:    { id: "F_SYS_SHUNT", group: "system",
                      labelEs: "Deriva del sensor de corriente", labelYue: "電流感測器漂移",
                      effectEs: "SOC mal calculado (error creciente)" },
    F_SYS_DERATE:   { id: "F_SYS_DERATE", group: "system",
                      labelEs: "Firmware con límite (P×0,5)", labelYue: "韌體限功率 (P×0.5)",
                      effectEs: "P_max × 0,5", detect: { level: 1, delayS: 0 } }
  };
  // Parámetros del modelo de fallas (supuestos didácticos 📐, no están en el documento)
  const FAULT_MODEL = {
    shortInternalOhm: 0.05,       // R del cortocircuito interno (calor extra = Vcell²/R)
    runawayCellFactor: 100,       // Q_gen × 100 (§8.1)
    runawayExoKPerS: 1.2,         // autocalentamiento de la celda en disparo (>1 K/s)
    runawayExoDurationS: 60,      // duración del evento exotérmico contenido
    cellCouplingWKPerKg23: 0.4,   // G_celda→pack = 0,4·m_celda^(2/3) [W/K]
    limpFactor: 0.3,              // limp mode: I × 0,3
    firmwareDerateFactor: 0.5,    // §8.4
    coolantLeakUaFactor: 0.2,     // §8.3
    isoFaultOhmPerV: 80,          // < 100 Ω/V → crítico (§9.2)
    isoHealthyOhmPerV: 1000,
    baselineImbalanceMv: 5,
    effectiveSlopeMinVPerSoc: 0.5, // el LFP plano no mostraría desequilibrio por SOC
    fuseBlowMultiplier: 1.5       // el fusible falla si I ≥ 1,5·C_dis·Cn
  };

  // ---------------------------------------------------------------------------
  // §9.2 Tabla de alarmas del BMS.  Niveles: 1 = Precaución (Alerta), 2 = Alarma (Falla), 3 = Crítico
  // ---------------------------------------------------------------------------
  const BMS_ALARMS = {
    soc:        { unit: "%",    dir: "lte", thresholds: [20, 10, 5], labelEs: "SOC", labelYue: "SOC" },
    vCellDis:   { unit: "V",    dir: "lte", marginPct: [2, 1, 0], labelEs: "V celda (descarga)", labelYue: "電芯電壓（放電）" },
    vCellChg:   { unit: "V",    dir: "gte", marginPct: [2, 1, 0], labelEs: "V celda (carga)", labelYue: "電芯電壓（充電）" },
    imbalance:  { unit: "mV",   dir: "gte", thresholds: [30, 50, 150], labelEs: "Desequilibrio", labelYue: "電芯不平衡" },
    temp:       { unit: "°C",   dir: "gte", thresholds: [45, 55, 60], criticalCharge: 45, labelEs: "Temperatura", labelYue: "溫度" },
    dTcells:    { unit: "K",    dir: "gte", thresholds: [3, 5, 8], labelEs: "ΔT entre celdas", labelYue: "電芯溫差" },
    dTdt:       { unit: "K/s",  dir: "gte", thresholds: [null, 0.5 / 60, 1], labelEs: "dT/dt", labelYue: "升溫速率 dT/dt" },
    isolation:  { unit: "Ω/V",  dir: "lte", thresholds: [500, 200, 100], labelEs: "Aislamiento", labelYue: "絕緣" },
    overcurrent:{ unit: "×Imax",dir: "gte", thresholds: [1.1, 1.25, 1.5], labelEs: "Sobrecorriente", labelYue: "過電流" },
    soh:        { unit: "%",    dir: "lte", thresholds: [80, 70, 60], labelEs: "SOH", labelYue: "SOH" }
  };
  const LEVEL_CLASS = { 1: "alerta", 2: "falla", 3: "critico" };

  // §9.3 Semáforo de recuperación (informativo)
  const REGEN_BANDS = [
    { socMin: 0.80, status: "cancelada" },
    { socMin: 0.70, status: "limitada" },
    { socMin: 0.00, status: "libre" }
  ];

  return {
    PACK_MASS_FACTOR, CP_PACK_J_KG_K, PACKING_FACTOR, COOLING, CHEMISTRIES, CELLS, APPLICATIONS,
    DESIGN_DEFAULTS, INPUT_LIMITS, FAULT_GROUPS, FAULTS, FAULT_MODEL, BMS_ALARMS, LEVEL_CLASS, REGEN_BANDS
  };
});
