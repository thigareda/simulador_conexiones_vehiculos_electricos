/**
 * data/cars.js
 * Catálogo congelado de las 16 combinaciones canónicas (4 plataformas x 4 químicas)
 * Generado y validado mediante tools/calibrate.mjs
 */

export const CARS_DATA = {
  "urbano-lfp": {
    "id": "urbano-lfp",
    "nombre": "Urbano LFP",
    "plataforma": "urbano",
    "quimica": "LFP",
    "masa_kg": 1418,
    "masa_base_kg": 1250,
    "m_pack_kg": 93.3,
    "cd": 0.3,
    "area_m2": 2.1,
    "motor": {
      "p_pico_kw": 80,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.31
    },
    "bateria": {
      "v_nominal": 348.8,
      "celdas_serie": 109,
      "celdas_paralelo": 1,
      "capacidad_ah": 32.11,
      "energia_kwh": 11.2,
      "rint_mohm": 60,
      "c_continuo": 3,
      "c_pulso": 6,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 84,
      "h_w_k": 15.73
    },
    "costo_pack_usd": 1064,
    "n100_ciclos": 4000,
    "evidencia": [
      "MAT-LFP",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s14]",
      "[F31·s16]",
      "[F31·s26]"
    ]
  },
  "urbano-ncm": {
    "id": "urbano-ncm",
    "nombre": "Urbano NCM",
    "plataforma": "urbano",
    "quimica": "NCM",
    "masa_kg": 1381,
    "masa_base_kg": 1250,
    "m_pack_kg": 56,
    "cd": 0.3,
    "area_m2": 2.1,
    "motor": {
      "p_pico_kw": 80,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.31
    },
    "bateria": {
      "v_nominal": 351.5,
      "celdas_serie": 95,
      "celdas_paralelo": 1,
      "capacidad_ah": 31.86,
      "energia_kwh": 11.2,
      "rint_mohm": 50,
      "c_continuo": 4,
      "c_pulso": 8,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 50.4,
      "h_w_k": 14.24
    },
    "costo_pack_usd": 1568,
    "n100_ciclos": 2000,
    "evidencia": [
      "MAT-NCM",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s44]",
      "[F31·s16]",
      "[F31·s24]"
    ]
  },
  "urbano-nimh": {
    "id": "urbano-nimh",
    "nombre": "Urbano NiMH",
    "plataforma": "urbano",
    "quimica": "NiMH",
    "masa_kg": 1494,
    "masa_base_kg": 1250,
    "m_pack_kg": 168.8,
    "cd": 0.3,
    "area_m2": 2.1,
    "motor": {
      "p_pico_kw": 80,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.31
    },
    "bateria": {
      "v_nominal": 350.4,
      "celdas_serie": 292,
      "celdas_paralelo": 1,
      "capacidad_ah": 38.53,
      "energia_kwh": 13.5,
      "rint_mohm": 120,
      "c_continuo": 5,
      "c_pulso": 10,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 151.88,
      "h_w_k": 18.75
    },
    "costo_pack_usd": 1620,
    "n100_ciclos": 1500,
    "evidencia": [
      "MAT-NIMH",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s40]",
      "[F31·s20]"
    ]
  },
  "urbano-plomo": {
    "id": "urbano-plomo",
    "nombre": "Urbano Plomo",
    "plataforma": "urbano",
    "quimica": "Plomo",
    "masa_kg": 1645,
    "masa_base_kg": 1250,
    "m_pack_kg": 320,
    "cd": 0.3,
    "area_m2": 2.1,
    "motor": {
      "p_pico_kw": 80,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.31
    },
    "bateria": {
      "v_nominal": 350,
      "celdas_serie": 175,
      "celdas_paralelo": 1,
      "capacidad_ah": 32,
      "energia_kwh": 11.2,
      "rint_mohm": 150,
      "c_continuo": 2,
      "c_pulso": 3.5,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 288,
      "h_w_k": 24.8
    },
    "costo_pack_usd": 672,
    "n100_ciclos": 500,
    "evidencia": [
      "MAT-PLOMO",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s36]",
      "[F31·s37]",
      "[F31·s20]",
      "[F31·s26]"
    ]
  },
  "sedan-lfp": {
    "id": "sedan-lfp",
    "nombre": "Sedán LFP",
    "plataforma": "sedan",
    "quimica": "LFP",
    "masa_kg": 1855,
    "masa_base_kg": 1650,
    "m_pack_kg": 130,
    "cd": 0.28,
    "area_m2": 2.2,
    "motor": {
      "p_pico_kw": 160,
      "eta": 0.93,
      "rpm_max": 15000,
      "rueda_r_m": 0.33
    },
    "bateria": {
      "v_nominal": 348.8,
      "celdas_serie": 109,
      "celdas_paralelo": 1,
      "capacidad_ah": 44.72,
      "energia_kwh": 15.6,
      "rint_mohm": 60,
      "c_continuo": 3,
      "c_pulso": 6,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 117,
      "h_w_k": 17.2
    },
    "costo_pack_usd": 1482,
    "n100_ciclos": 4000,
    "evidencia": [
      "MAT-LFP",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s14]",
      "[F31·s16]",
      "[F31·s26]"
    ]
  },
  "sedan-ncm": {
    "id": "sedan-ncm",
    "nombre": "Sedán NCM",
    "plataforma": "sedan",
    "quimica": "NCM",
    "masa_kg": 1823,
    "masa_base_kg": 1650,
    "m_pack_kg": 97.5,
    "cd": 0.28,
    "area_m2": 2.2,
    "motor": {
      "p_pico_kw": 160,
      "eta": 0.93,
      "rpm_max": 15000,
      "rueda_r_m": 0.33
    },
    "bateria": {
      "v_nominal": 351.5,
      "celdas_serie": 95,
      "celdas_paralelo": 1,
      "capacidad_ah": 55.48,
      "energia_kwh": 19.5,
      "rint_mohm": 50,
      "c_continuo": 4,
      "c_pulso": 8,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 87.75,
      "h_w_k": 15.9
    },
    "costo_pack_usd": 2730,
    "n100_ciclos": 2000,
    "evidencia": [
      "MAT-NCM",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s44]",
      "[F31·s16]",
      "[F31·s24]"
    ]
  },
  "sedan-nimh": {
    "id": "sedan-nimh",
    "nombre": "Sedán NiMH",
    "plataforma": "sedan",
    "quimica": "NiMH",
    "masa_kg": 1950,
    "masa_base_kg": 1650,
    "m_pack_kg": 225,
    "cd": 0.28,
    "area_m2": 2.2,
    "motor": {
      "p_pico_kw": 160,
      "eta": 0.93,
      "rpm_max": 15000,
      "rueda_r_m": 0.33
    },
    "bateria": {
      "v_nominal": 350.4,
      "celdas_serie": 292,
      "celdas_paralelo": 1,
      "capacidad_ah": 51.37,
      "energia_kwh": 18,
      "rint_mohm": 120,
      "c_continuo": 5,
      "c_pulso": 10,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 202.5,
      "h_w_k": 21
    },
    "costo_pack_usd": 2160,
    "n100_ciclos": 1500,
    "evidencia": [
      "MAT-NIMH",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s40]",
      "[F31·s20]"
    ]
  },
  "sedan-plomo": {
    "id": "sedan-plomo",
    "nombre": "Sedán Plomo",
    "plataforma": "sedan",
    "quimica": "Plomo",
    "masa_kg": 2148,
    "masa_base_kg": 1650,
    "m_pack_kg": 422.9,
    "cd": 0.28,
    "area_m2": 2.2,
    "motor": {
      "p_pico_kw": 160,
      "eta": 0.93,
      "rpm_max": 15000,
      "rueda_r_m": 0.33
    },
    "bateria": {
      "v_nominal": 350,
      "celdas_serie": 175,
      "celdas_paralelo": 1,
      "capacidad_ah": 42.29,
      "energia_kwh": 14.8,
      "rint_mohm": 150,
      "c_continuo": 2,
      "c_pulso": 3.5,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 380.57,
      "h_w_k": 28.91
    },
    "costo_pack_usd": 888,
    "n100_ciclos": 500,
    "evidencia": [
      "MAT-PLOMO",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s36]",
      "[F31·s37]",
      "[F31·s20]",
      "[F31·s26]"
    ]
  },
  "camioneta-lfp": {
    "id": "camioneta-lfp",
    "nombre": "Camioneta LFP",
    "plataforma": "camioneta",
    "quimica": "LFP",
    "masa_kg": 2397,
    "masa_base_kg": 2150,
    "m_pack_kg": 171.7,
    "cd": 0.34,
    "area_m2": 2.9,
    "motor": {
      "p_pico_kw": 220,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.36
    },
    "bateria": {
      "v_nominal": 348.8,
      "celdas_serie": 109,
      "celdas_paralelo": 1,
      "capacidad_ah": 59.06,
      "energia_kwh": 20.6,
      "rint_mohm": 60,
      "c_continuo": 3,
      "c_pulso": 6,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 154.5,
      "h_w_k": 18.87
    },
    "costo_pack_usd": 1957,
    "n100_ciclos": 4000,
    "evidencia": [
      "MAT-LFP",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s14]",
      "[F31·s16]",
      "[F31·s26]"
    ]
  },
  "camioneta-ncm": {
    "id": "camioneta-ncm",
    "nombre": "Camioneta NCM",
    "plataforma": "camioneta",
    "quimica": "NCM",
    "masa_kg": 2343,
    "masa_base_kg": 2150,
    "m_pack_kg": 117.5,
    "cd": 0.34,
    "area_m2": 2.9,
    "motor": {
      "p_pico_kw": 220,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.36
    },
    "bateria": {
      "v_nominal": 351.5,
      "celdas_serie": 95,
      "celdas_paralelo": 1,
      "capacidad_ah": 66.86,
      "energia_kwh": 23.5,
      "rint_mohm": 50,
      "c_continuo": 4,
      "c_pulso": 8,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 105.75,
      "h_w_k": 16.7
    },
    "costo_pack_usd": 3290,
    "n100_ciclos": 2000,
    "evidencia": [
      "MAT-NCM",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s44]",
      "[F31·s16]",
      "[F31·s24]"
    ]
  },
  "camioneta-nimh": {
    "id": "camioneta-nimh",
    "nombre": "Camioneta NiMH",
    "plataforma": "camioneta",
    "quimica": "NiMH",
    "masa_kg": 2550,
    "masa_base_kg": 2150,
    "m_pack_kg": 325,
    "cd": 0.34,
    "area_m2": 2.9,
    "motor": {
      "p_pico_kw": 220,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.36
    },
    "bateria": {
      "v_nominal": 350.4,
      "celdas_serie": 292,
      "celdas_paralelo": 1,
      "capacidad_ah": 74.2,
      "energia_kwh": 26,
      "rint_mohm": 120,
      "c_continuo": 5,
      "c_pulso": 10,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 292.5,
      "h_w_k": 25
    },
    "costo_pack_usd": 3120,
    "n100_ciclos": 1500,
    "evidencia": [
      "MAT-NIMH",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s40]",
      "[F31·s20]"
    ]
  },
  "camioneta-plomo": {
    "id": "camioneta-plomo",
    "nombre": "Camioneta Plomo",
    "plataforma": "camioneta",
    "quimica": "Plomo",
    "masa_kg": 2768,
    "masa_base_kg": 2150,
    "m_pack_kg": 542.9,
    "cd": 0.34,
    "area_m2": 2.9,
    "motor": {
      "p_pico_kw": 220,
      "eta": 0.92,
      "rpm_max": 15000,
      "rueda_r_m": 0.36
    },
    "bateria": {
      "v_nominal": 350,
      "celdas_serie": 175,
      "celdas_paralelo": 1,
      "capacidad_ah": 54.29,
      "energia_kwh": 19,
      "rint_mohm": 150,
      "c_continuo": 2,
      "c_pulso": 3.5,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 488.57,
      "h_w_k": 33.71
    },
    "costo_pack_usd": 1140,
    "n100_ciclos": 500,
    "evidencia": [
      "MAT-PLOMO",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s36]",
      "[F31·s37]",
      "[F31·s20]",
      "[F31·s26]"
    ]
  },
  "utilitario-lfp": {
    "id": "utilitario-lfp",
    "nombre": "Utilitario LFP",
    "plataforma": "utilitario",
    "quimica": "LFP",
    "masa_kg": 2053,
    "masa_base_kg": 1850,
    "m_pack_kg": 128.3,
    "cd": 0.38,
    "area_m2": 3.2,
    "motor": {
      "p_pico_kw": 120,
      "eta": 0.9,
      "rpm_max": 15000,
      "rueda_r_m": 0.34
    },
    "bateria": {
      "v_nominal": 348.8,
      "celdas_serie": 109,
      "celdas_paralelo": 1,
      "capacidad_ah": 44.15,
      "energia_kwh": 15.4,
      "rint_mohm": 60,
      "c_continuo": 3,
      "c_pulso": 6,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 115.5,
      "h_w_k": 17.13
    },
    "costo_pack_usd": 1463,
    "n100_ciclos": 4000,
    "evidencia": [
      "MAT-LFP",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s14]",
      "[F31·s16]",
      "[F31·s26]"
    ]
  },
  "utilitario-ncm": {
    "id": "utilitario-ncm",
    "nombre": "Utilitario NCM",
    "plataforma": "utilitario",
    "quimica": "NCM",
    "masa_kg": 2000,
    "masa_base_kg": 1850,
    "m_pack_kg": 75,
    "cd": 0.38,
    "area_m2": 3.2,
    "motor": {
      "p_pico_kw": 120,
      "eta": 0.9,
      "rpm_max": 15000,
      "rueda_r_m": 0.34
    },
    "bateria": {
      "v_nominal": 351.5,
      "celdas_serie": 95,
      "celdas_paralelo": 1,
      "capacidad_ah": 42.67,
      "energia_kwh": 15,
      "rint_mohm": 50,
      "c_continuo": 4,
      "c_pulso": 8,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 67.5,
      "h_w_k": 15
    },
    "costo_pack_usd": 2100,
    "n100_ciclos": 2000,
    "evidencia": [
      "MAT-NCM",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING"
    ],
    "citas": [
      "[F31·s43]",
      "[F31·s44]",
      "[F31·s16]",
      "[F31·s24]"
    ]
  },
  "utilitario-nimh": {
    "id": "utilitario-nimh",
    "nombre": "Utilitario NiMH",
    "plataforma": "utilitario",
    "quimica": "NiMH",
    "masa_kg": 2153,
    "masa_base_kg": 1850,
    "m_pack_kg": 227.5,
    "cd": 0.38,
    "area_m2": 3.2,
    "motor": {
      "p_pico_kw": 120,
      "eta": 0.9,
      "rpm_max": 15000,
      "rueda_r_m": 0.34
    },
    "bateria": {
      "v_nominal": 350.4,
      "celdas_serie": 292,
      "celdas_paralelo": 1,
      "capacidad_ah": 51.94,
      "energia_kwh": 18.2,
      "rint_mohm": 120,
      "c_continuo": 5,
      "c_pulso": 10,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 204.75,
      "h_w_k": 21.1
    },
    "costo_pack_usd": 2184,
    "n100_ciclos": 1500,
    "evidencia": [
      "MAT-NIMH",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s40]",
      "[F31·s20]"
    ]
  },
  "utilitario-plomo": {
    "id": "utilitario-plomo",
    "nombre": "Utilitario Plomo",
    "plataforma": "utilitario",
    "quimica": "Plomo",
    "masa_kg": 2368,
    "masa_base_kg": 1850,
    "m_pack_kg": 442.9,
    "cd": 0.38,
    "area_m2": 3.2,
    "motor": {
      "p_pico_kw": 120,
      "eta": 0.9,
      "rpm_max": 15000,
      "rueda_r_m": 0.34
    },
    "bateria": {
      "v_nominal": 350,
      "celdas_serie": 175,
      "celdas_paralelo": 1,
      "capacidad_ah": 44.29,
      "energia_kwh": 15.5,
      "rint_mohm": 150,
      "c_continuo": 2,
      "c_pulso": 3.5,
      "soc_inicial": 0.9,
      "soc_minimo": 0.1,
      "temperatura_inicial_c": 28,
      "cth_kj_k": 398.57,
      "h_w_k": 29.71
    },
    "costo_pack_usd": 930,
    "n100_ciclos": 500,
    "evidencia": [
      "MAT-PLOMO",
      "CON-CRATE",
      "CON-VENTANASOC",
      "CON-DERATING",
      "CON-EFECTO-PEUKERT"
    ],
    "citas": [
      "[F31·s36]",
      "[F31·s37]",
      "[F31·s20]",
      "[F31·s26]"
    ]
  }
};

export const CARS_LIST = Object.values(CARS_DATA);

export function getCarById(id) {
  return CARS_DATA[id] || null;
}
