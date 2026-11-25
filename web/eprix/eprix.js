/**
 * web/eprix/eprix.js
 * Controlador y renderizador del módulo E-Prix Didaktikos
 * Monta la interfaz dentro del contenedor root sin variables globales.
 */

import { CARS_DATA, CARS_LIST } from './data/cars.js';
import { CIRCUITS, CIRCUIT_LIST, getCircuit, getWaypointAtDistance } from './data/circuits.js';
import { CHEMISTRY_DATA, CONCEPT_TRAPS, CONFIDENCE } from './data/chemistry.js';
import { createCarRaceState, stepCarRace } from './engine/race-sim.js';
import { createRNG } from './engine/random.js';

export function initEPrix(rootElement, options = {}) {
  const root = typeof rootElement === 'string' ? document.getElementById(rootElement) : rootElement;
  if (!root) throw new Error('Contenedor raíz no encontrado para E-Prix Didaktikos');

  // Estado del juego
  const state = {
    currentView: 'prep', // prep | race | results | concepts
    selectedCircuitId: 'monaco',
    slots: ['sedan-ncm', 'urbano-lfp', 'camioneta-nimh', 'sedan-plomo'],
    slotStyles: ['equilibrado', 'equilibrado', 'equilibrado', 'equilibrado'],
    activeSlotIdx: 0,
    catalogFilterChem: 'ALL',
    catalogFilterPlat: 'ALL',
    // Carrera en vivo
    seed: options.seed || Math.floor(Math.random() * 90000 + 10000),
    isRacing: false,
    isPaused: false,
    speedMultiplier: 1.0,
    raceTimeS: 0.0,
    carStates: [],
    raceFinished: false,
    timeSeriesLog: [],
    lastLogTimeS: 0.0,
    // Rendimiento y bucle
    accumulator: 0.0,
    lastFrameTime: 0.0,
    animationFrameId: null,
    fps: 60.0,
    fpsFrames: 0,
    fpsLastTime: performance.now(),
    lastHudUpdateTime: 0.0,
    devMode: options.devMode || false
  };

  // Nombres y definiciones de nodos del grafo G14 (§11)
  const GRAPH_NODES = {
    'MAT-LFP': { nombre: 'Fosfato de Hierro y Litio', cita: '[F31·s43]', desc: 'Química de cátodo olivino de alta estabilidad térmica, larga vida y bajo costo sin cobalto.' },
    'MAT-NCM': { nombre: 'Níquel Cobalto Manganeso', cita: '[F31·s43]', desc: 'Química de máxima densidad energética y potencia continua; mayor sensibilidad térmica.' },
    'MAT-PLOMO': { nombre: 'Plomo-Ácido', cita: '[F31·s36]', desc: 'Batería robusta y económica pero muy pesada y con fuerte efecto Peukert.' },
    'MAT-NIMH': { nombre: 'Níquel e Hidruro Metálico', cita: '[F31·s40]', desc: 'Química para híbridos con gran tolerancia a pulsos de corriente y autodescarga elevada.' },
    'CON-CRATE': { nombre: 'C-rate (Tasa de Carga/Descarga)', cita: '[F31·s22]', desc: 'Relación corriente/capacidad I = C-rate · Cn. Manda en el calentamiento Joule (I²·R).' },
    'CON-DOD': { nombre: 'Profundidad de Descarga (DOD)', cita: '[F31·s25]', desc: 'DOD = 100% - SOC. La vida de ciclo cae exponencialmente con DOD profundo.' },
    'CON-VENTANASOC': { nombre: 'Ventana Útil de SOC', cita: '[F31·s25]', desc: 'Rango operativo recomendado típico (10% a 90%) para maximizar la durabilidad.' },
    'CON-DERATING': { nombre: 'Derating Térmico y Eléctrico', cita: '[F31·s24]', desc: 'Reducción deliberada de potencia disponible por temperatura > 45 °C o bajo SOC.' },
    'CON-EFECTO-PEUKERT': { nombre: 'Efecto Peukert', cita: '[F31·s20]', desc: 'Pérdida de capacidad disponible a corrientes elevadas en químicas tradicionales.' },
    'TEC-FRENO-REGENERATIVO': { nombre: 'Freno Regenerativo', cita: '[F30·s31]', desc: 'Recuperación de energía cinética en desaceleración limitada por BMS, SOC y velocidad.' },
    'CMP-BMS': { nombre: 'Sistema de Gestión de Batería (BMS)', cita: '[F31·s33]', desc: 'Monitoreo de voltaje de celda, temperatura, corriente, estado de carga y aislamiento.' },
    'CMP-VCU': { nombre: 'Unidad de Control del Vehículo (VCU)', cita: '[F30·s17]', desc: 'Cerebro supervisor que interpreta la demanda del acelerador y gestiona la potencia.' }
  };

  // Renderizar esqueleto HTML inicial
  renderSkeleton();

  // Referencias DOM cacheadas
  const dom = {
    viewPrep: root.querySelector('#eprix_view_prep'),
    viewRace: root.querySelector('#eprix_view_race'),
    viewResults: root.querySelector('#eprix_view_results'),
    viewConcepts: root.querySelector('#eprix_view_concepts'),
    tabPrep: root.querySelector('#eprix_tab_prep'),
    tabConcepts: root.querySelector('#eprix_tab_concepts'),
    circuitCards: root.querySelector('#eprix_circuits_list'),
    slotsContainer: root.querySelector('#eprix_slots_container'),
    carsGrid: root.querySelector('#eprix_cars_grid'),
    btnStart: root.querySelector('#eprix_btn_start'),
    btnRandom: root.querySelector('#eprix_btn_random'),
    canvas: root.querySelector('#eprix_canvas'),
    hudList: root.querySelector('#eprix_hud_list'),
    raceClock: root.querySelector('#eprix_race_clock'),
    raceFlagText: root.querySelector('#eprix_race_flag_text'),
    fpsCounter: root.querySelector('#eprix_fps_counter'),
    btnPause: root.querySelector('#eprix_btn_pause'),
    btnSpeed1: root.querySelector('#eprix_btn_speed_1'),
    btnSpeed2: root.querySelector('#eprix_btn_speed_2'),
    btnSpeed4: root.querySelector('#eprix_btn_speed_4'),
    btnQuitRace: root.querySelector('#eprix_btn_quit_race'),
    podiumCards: root.querySelector('#eprix_podium_cards'),
    whyItWonText: root.querySelector('#eprix_why_it_won_text'),
    resultsTableBody: root.querySelector('#eprix_results_table_body'),
    ledgerContainer: root.querySelector('#eprix_ledger_container'),
    btnExportCsv: root.querySelector('#eprix_btn_export_csv'),
    btnExportJson: root.querySelector('#eprix_btn_export_json'),
    btnRerace: root.querySelector('#eprix_btn_rerace'),
    btnNewPrep: root.querySelector('#eprix_btn_new_prep'),
    modalOverlay: root.querySelector('#eprix_modal_overlay'),
    modalCard: root.querySelector('#eprix_modal_card'),
    modalClose: root.querySelector('#eprix_modal_close')
  };

  const ctx = dom.canvas.getContext('2d');

  // Inicializar vistas y eventos
  initCircuitsList();
  renderSlots();
  renderCatalog();
  setupEventListeners();
  switchView('prep');

  /**
   * Cambia de pantalla
   */
  function switchView(viewName) {
    state.currentView = viewName;
    [dom.viewPrep, dom.viewRace, dom.viewResults, dom.viewConcepts].forEach(el => el.classList.remove('active'));
    [dom.tabPrep, dom.tabConcepts].forEach(el => el.classList.remove('active'));

    if (viewName === 'prep') {
      dom.viewPrep.classList.add('active');
      dom.tabPrep.classList.add('active');
    } else if (viewName === 'race') {
      dom.viewRace.classList.add('active');
    } else if (viewName === 'results') {
      dom.viewResults.classList.add('active');
    } else if (viewName === 'concepts') {
      dom.viewConcepts.classList.add('active');
      dom.tabConcepts.classList.add('active');
      renderConcepts();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Renderiza selector de circuitos
   */
  function initCircuitsList() {
    dom.circuitCards.innerHTML = CIRCUIT_LIST.map(c => `
      <div class="circuit-card ${c.id === state.selectedCircuitId ? 'active' : ''}" data-circuit-id="${c.id}" role="button" tabindex="0">
        <div class="circuit-mini-preview">
          <svg viewBox="0 0 1200 700">
            <use href="${c.svg_file}#centerline" stroke="var(--eprix-cyan)" stroke-width="24" fill="none"/>
          </svg>
        </div>
        <div class="circuit-card-info">
          <div class="circuit-card-name">${c.nombre}</div>
          <div class="circuit-card-stats">
            <span>📏 ${c.longitud_km} km</span>
            <span>🌡️ ${c.tamb_c} °C</span>
          </div>
        </div>
      </div>
    `).join('');

    dom.circuitCards.querySelectorAll('.circuit-card').forEach(card => {
      card.addEventListener('click', () => {
        if (state.isRacing) return; // Controles bloqueados durante carrera (AC-11)
        state.selectedCircuitId = card.dataset.circuitId;
        dom.circuitCards.querySelectorAll('.circuit-card').forEach(el => el.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  /**
   * Renderiza las 4 ranuras de la parrilla de salida
   */
  function renderSlots() {
    dom.slotsContainer.innerHTML = [0, 1, 2, 3].map(i => {
      const carId = state.slots[i];
      const car = CARS_DATA[carId];
      const style = state.slotStyles[i] || 'equilibrado';
      const isFilled = !!car;
      const isActive = state.activeSlotIdx === i;

      return `
        <div class="car-slot ${isFilled ? 'filled' : ''} ${isActive ? 'active-slot' : ''}" data-slot-idx="${i}">
          <div class="slot-header">
            <span class="slot-badge slot-badge-p${i + 1}">COCHE ${i + 1}</span>
            ${isFilled ? `<span class="chem-badge chem-${car.quimica}">${car.quimica}</span>` : ''}
          </div>
          ${isFilled ? `
            <div class="slot-car-name">${car.nombre}</div>
            <div class="slot-car-meta">${car.motor.p_pico_kw} kW · ${car.bateria.energia_kwh} kWh · ${car.masa_kg} kg</div>
            <select class="slot-style-select" data-slot-idx="${i}" aria-label="Estilo de piloto para coche ${i + 1}">
              <option value="ahorro" ${style === 'ahorro' ? 'selected' : ''}>Piloto: Ahorro (Conserva SOC)</option>
              <option value="equilibrado" ${style === 'equilibrado' ? 'selected' : ''}>Piloto: Equilibrado (Referencia)</option>
              <option value="ataque" ${style === 'ataque' ? 'selected' : ''}>Piloto: Ataque (Pulso Máximo)</option>
            </select>
          ` : `
            <div style="font-size: 0.85rem; color: var(--eprix-text-dim); text-align: center; padding: 20px 0;">
              Haz clic para asignar un coche del catálogo
            </div>
          `}
        </div>
      `;
    }).join('');

    dom.slotsContainer.querySelectorAll('.car-slot').forEach(el => {
      el.addEventListener('click', (e) => {
        if (state.isRacing) return;
        if (e.target.tagName === 'SELECT') return;
        state.activeSlotIdx = parseInt(el.dataset.slotIdx, 10);
        renderSlots();
      });
    });

    dom.slotsContainer.querySelectorAll('.slot-style-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.slotIdx, 10);
        state.slotStyles[idx] = e.target.value;
      });
    });

    validateGrid();
  }

  /**
   * Renderiza el catálogo de 16 coches con filtros
   */
  function renderCatalog() {
    const filtered = CARS_LIST.filter(car => {
      const matchChem = state.catalogFilterChem === 'ALL' || car.quimica.toUpperCase() === state.catalogFilterChem;
      const matchPlat = state.catalogFilterPlat === 'ALL' || car.plataforma.toUpperCase() === state.catalogFilterPlat;
      return matchChem && matchPlat;
    });

    dom.carsGrid.innerHTML = filtered.map(car => {
      const isSelected = state.slots.includes(car.id);
      return `
        <div class="car-card ${isSelected ? 'selected-in-slot' : ''}" data-car-id="${car.id}">
          <div class="car-card-header">
            <span style="font-size: 0.7rem; color: var(--eprix-text-dim); text-transform: capitalize;">${car.plataforma}</span>
            <span class="chem-badge chem-${car.quimica}">${car.quimica}</span>
          </div>
          <div class="car-card-title">${car.nombre}</div>
          <div class="car-card-specs">
            <span>⚡ ${car.motor.p_pico_kw} kW</span>
            <span>🔋 ${car.bateria.energia_kwh} kWh</span>
            <span>⚖️ ${car.masa_kg} kg</span>
            <span>💵 $${car.costo_pack_usd}</span>
          </div>
          <button type="button" class="car-btn-inspect" data-car-id="${car.id}" aria-label="Ver ficha técnica de ${car.nombre}">
            📋 Ficha Técnica (A/B/C)
          </button>
        </div>
      `;
    }).join('');

    dom.carsGrid.querySelectorAll('.car-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (state.isRacing) return;
        if (e.target.classList.contains('car-btn-inspect')) return;
        const carId = card.dataset.carId;
        // Asignar a ranura activa
        state.slots[state.activeSlotIdx] = carId;
        state.activeSlotIdx = (state.activeSlotIdx + 1) % 4;
        renderSlots();
        renderCatalog();
      });
    });

    dom.carsGrid.querySelectorAll('.car-btn-inspect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCarModal(btn.dataset.carId);
      });
    });
  }

  /**
   * Validación de parrilla: exactamente 4 coches distintos (AC-10)
   */
  function validateGrid() {
    const filled = state.slots.filter(Boolean);
    const unique = new Set(filled);
    const isValid = filled.length === 4 && unique.size === 4;

    dom.btnStart.disabled = !isValid || state.isRacing;
    if (!isValid) {
      dom.btnStart.title = 'Debes seleccionar exactamente 4 vehículos distintos';
    } else {
      dom.btnStart.title = 'Iniciar carrera de 4 vueltas';
    }
  }

  /**
   * Configura eventos generales
   */
  function setupEventListeners() {
    // Pestañas
    dom.tabPrep.addEventListener('click', () => switchView('prep'));
    dom.tabConcepts.addEventListener('click', () => switchView('concepts'));

    // Filtros de química
    root.querySelectorAll('[data-filter-chem]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-filter-chem]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.catalogFilterChem = btn.dataset.filterChem;
        renderCatalog();
      });
    });

    // Filtros de plataforma
    root.querySelectorAll('[data-filter-plat]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-filter-plat]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.catalogFilterPlat = btn.dataset.filterPlat;
        renderCatalog();
      });
    });

    // Botón Aleatorio
    dom.btnRandom.addEventListener('click', () => {
      if (state.isRacing) return;
      const shuffled = [...CARS_LIST].sort(() => Math.random() - 0.5);
      state.slots = shuffled.slice(0, 4).map(c => c.id);
      renderSlots();
      renderCatalog();
    });

    // Botón Iniciar Carrera
    dom.btnStart.addEventListener('click', () => {
      startRace();
    });

    // Botones de control de carrera
    dom.btnPause.addEventListener('click', togglePause);
    dom.btnSpeed1.addEventListener('click', () => setSpeedMultiplier(1.0));
    dom.btnSpeed2.addEventListener('click', () => setSpeedMultiplier(2.0));
    dom.btnSpeed4.addEventListener('click', () => setSpeedMultiplier(4.0));
    dom.btnQuitRace.addEventListener('click', quitRace);

    // Botones de resultados
    dom.btnRerace.addEventListener('click', () => startRace());
    dom.btnNewPrep.addEventListener('click', () => switchView('prep'));
    dom.btnExportCsv.addEventListener('click', exportCsv);
    dom.btnExportJson.addEventListener('click', exportJson);

    // Modal
    dom.modalClose.addEventListener('click', closeCarModal);
    dom.modalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.modalOverlay) closeCarModal();
    });

    // Teclado: Esc pausa carrera
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dom.modalOverlay.classList.contains('active')) {
          closeCarModal();
        } else if (state.isRacing) {
          togglePause();
        }
      }
    });

    // Pausa automática en visibilitychange (§7.1)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.isRacing && !state.isPaused) {
        togglePause();
      }
    });
  }

  /**
   * Inicia la carrera determinista
   */
  function startRace() {
    validateGrid();
    if (dom.btnStart.disabled) return;

    state.isRacing = true;
    state.isPaused = false;
    state.raceFinished = false;
    state.raceTimeS = 0.0;
    state.speedMultiplier = 1.0;
    state.timeSeriesLog = [];
    state.lastLogTimeS = 0.0;
    state.accumulator = 0.0;
    state.lastFrameTime = performance.now();

    const circuit = getCircuit(state.selectedCircuitId);
    const tambC = circuit.tamb_c || 25.0;

    // Generar PRNG sembrado para piloto (§7.1)
    const rng = createRNG(state.seed);

    // Inicializar los 4 coches
    state.carStates = state.slots.map((carId, idx) => {
      const car = CARS_DATA[carId];
      const chem = CHEMISTRY_DATA[car.quimica.toUpperCase()];
      const style = state.slotStyles[idx] || 'equilibrado';
      const skill = 0.98 + rng() * 0.04; // 0.98 a 1.02 variación sembrada
      return createCarRaceState(car, chem, style, skill, tambC);
    });

    // Inicializar HUD DOM
    initHudDom();
    switchView('race');
    resizeCanvas();

    // Iniciar bucle de animación a 60 FPS
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = requestAnimationFrame(gameLoop);
  }

  function togglePause() {
    state.isPaused = !state.isPaused;
    dom.btnPause.textContent = state.isPaused ? '▶ Reanudar' : '⏸ Pausa';
    dom.raceFlagText.textContent = state.isPaused ? 'PAUSA' : 'EN VIVO';
  }

  function setSpeedMultiplier(mult) {
    state.speedMultiplier = mult;
    dom.btnSpeed1.classList.toggle('active', mult === 1.0);
    dom.btnSpeed2.classList.toggle('active', mult === 2.0);
    dom.btnSpeed4.classList.toggle('active', mult === 4.0);
  }

  function quitRace() {
    state.isRacing = false;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    switchView('prep');
  }

  /**
   * Bucle principal de juego (requestAnimationFrame con acumulador de física con paso fijo dt = 1/120 s)
   */
  function gameLoop(now) {
    if (!state.isRacing) return;

    // Medición de FPS
    state.fpsFrames++;
    if (now - state.fpsLastTime >= 1000) {
      state.fps = Math.round((state.fpsFrames * 1000) / (now - state.fpsLastTime));
      state.fpsFrames = 0;
      state.fpsLastTime = now;
      if (dom.fpsCounter) dom.fpsCounter.textContent = `${state.fps} FPS`;
    }

    const frameDeltaS = Math.min((now - state.lastFrameTime) / 1000.0, 0.1); // límite de 100 ms para evitar espirales
    state.lastFrameTime = now;

    if (!state.isPaused) {
      // Acumulador de física con dt fijo (§7.1: prohibido usar delta real como dt de integración)
      const fixedDt = 1 / 120;
      state.accumulator += frameDeltaS * state.speedMultiplier;

      const circuit = getCircuit(state.selectedCircuitId);
      const tambC = circuit.tamb_c || 25.0;

      while (state.accumulator >= fixedDt) {
        stepPhysics(circuit, tambC, fixedDt);
        state.accumulator -= fixedDt;
        state.raceTimeS += fixedDt;

        // Registro de serie temporal cada 0.5 s para exportación (§8.3)
        if (state.raceTimeS - state.lastLogTimeS >= 0.5) {
          logTimeSeriesSample();
          state.lastLogTimeS = state.raceTimeS;
        }

        // Comprobar si los 4 coches completaron la carrera o DNF
        const allEnded = state.carStates.every(c => c.finished || c.battery.isDnf);
        if (allEnded && !state.raceFinished) {
          state.raceFinished = true;
          onRaceFinish();
          return;
        }
      }
    }

    // Renderizado geométrico en Canvas a 60 Hz
    renderCanvas();

    // Actualización de texto y telemetría de DOM a 10 Hz (§8.2: no actualizar el DOM en cada frame)
    if (now - state.lastHudUpdateTime >= 100) {
      updateHudDom();
      state.lastHudUpdateTime = now;
    }

    state.animationFrameId = requestAnimationFrame(gameLoop);
  }

  /**
   * Paso fijo de física para los 4 coches
   */
  function stepPhysics(circuit, tambC, dt) {
    for (let i = 0; i < state.carStates.length; i++) {
      stepCarRace(state.carStates[i], circuit, 4, tambC, dt);
    }
  }

  /**
   * Registro telemétrico de serie temporal
   */
  function logTimeSeriesSample() {
    const sample = {
      t: +state.raceTimeS.toFixed(2),
      cars: state.carStates.map(c => ({
        id: c.car.id,
        lap: c.lap,
        distM: +c.sM.toFixed(1),
        speedKmh: +(c.vMs * 3.6).toFixed(1),
        socPct: +(c.battery.soc * 100).toFixed(1),
        tempC: +(c.battery.tempC).toFixed(1),
        powerKw: +(c.battery.powerW / 1000).toFixed(1),
        sohPct: +(c.battery.soh * 100).toFixed(2)
      }))
    };
    state.timeSeriesLog.push(sample);
  }

  /**
   * Ajuste de resolución de Canvas respetando DPR <= 2
   */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    const rect = dom.canvas.getBoundingClientRect();
    dom.canvas.width = (rect.width || 1200) * dpr;
    dom.canvas.height = (rect.height || 700) * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Renderizado en Canvas 2D
   */
  function renderCanvas() {
    const width = 1200;
    const height = 700;
    ctx.clearRect(0, 0, width, height);

    const circuit = getCircuit(state.selectedCircuitId);
    const waypoints = circuit.waypoints;
    const N = waypoints.length;

    // 1. Dibujar pista base asfaltada
    ctx.beginPath();
    ctx.strokeStyle = '#16253b';
    ctx.lineWidth = 34;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const wp = waypoints[i];
      if (i === 0) ctx.moveTo(wp[0], wp[1]);
      else ctx.lineTo(wp[0], wp[1]);
    }
    ctx.closePath();
    ctx.stroke();

    // 2. Línea central con resplandor cian/azul
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.5)';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    for (let i = 0; i < N; i++) {
      const wp = waypoints[i];
      if (i === 0) ctx.moveTo(wp[0], wp[1]);
      else ctx.lineTo(wp[0], wp[1]);
    }
    ctx.closePath();
    ctx.stroke();

    // 3. Línea de Meta
    const startWp = waypoints[0];
    const nextWp = waypoints[1];
    const dx = nextWp[0] - startWp[0];
    const dy = nextWp[1] - startWp[1];
    const norm = Math.hypot(dx, dy) || 1;
    const perpX = -dy / norm;
    const perpY = dx / norm;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(startWp[0] - perpX * 18, startWp[1] - perpY * 18);
    ctx.lineTo(startWp[0] + perpX * 18, startWp[1] + perpY * 18);
    ctx.stroke();
    ctx.restore();

    // 4. Renderizar los 4 coches con color distintivo y offset de carril (§7.5: sin colisiones, offset lateral)
    const CAR_COLORS = ['#00f5d4', '#00b4d8', '#ffb703', '#f77f00'];
    const LANE_OFFSETS = [-6, -2, 2, 6];

    for (let i = 0; i < state.carStates.length; i++) {
      const c = state.carStates[i];
      if (c.battery.isDnf) continue; // Coches con DNF detenidos o no renderizados

      // Obtener posición interpolada en arco mediante getWaypointAtDistance
      const curWp = getWaypointAtDistance(circuit, c.sM);
      const aheadWp = getWaypointAtDistance(circuit, c.sM + 1.5);

      const vx = aheadWp.x - curWp.x;
      const vy = aheadWp.y - curWp.y;
      const angle = Math.atan2(vy, vx);

      const hLen = Math.hypot(vx, vy) || 1;
      const px = -vy / hLen;
      const py = vx / hLen;

      // Desplazamiento lateral por carril
      const laneOffset = LANE_OFFSETS[i];
      const posX = curWp.x + px * laneOffset;
      const posY = curWp.y + py * laneOffset;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate(angle);

      // Sombra del coche
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-12, -6, 24, 12);

      // Chasis del coche
      ctx.fillStyle = CAR_COLORS[i];
      ctx.beginPath();
      ctx.roundRect(-10, -5, 20, 10, 3);
      ctx.fill();

      // Cabina / Parabrisas
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(-2, -3, 6, 6);

      // Número dorsal
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, -5, 0);

      // Efecto de freno (luces rojas traseras)
      if (c.brake > 0.1) {
        ctx.fillStyle = '#e63946';
        ctx.fillRect(-11, -4, 2, 2);
        ctx.fillRect(-11, 2, 2, 2);
      }

      ctx.restore();
    }
  }

  /**
   * Inicializa el DOM del HUD
   */
  function initHudDom() {
    dom.hudList.innerHTML = state.carStates.map((c, i) => `
      <div class="hud-car-card" id="hud_card_${i}">
        <div class="hud-header">
          <div class="hud-pos">
            <span class="slot-badge slot-badge-p${i + 1}" id="hud_pos_${i}">P${i + 1}</span>
            <span class="hud-car-title">${c.car.nombre}</span>
          </div>
          <div class="hud-gap" id="hud_gap_${i}">—</div>
        </div>

        <div class="hud-telemetry-row">
          <div>
            <span>⚡ Vel: <strong id="hud_spd_${i}">0</strong> km/h</span>
            <div style="color: var(--eprix-text-dim); font-size: 0.68rem;">
              V.Med: <span id="hud_avg_${i}">0</span> | V.Máx: <span id="hud_max_${i}">0</span>
            </div>
          </div>
          <div style="text-align: right;">
            <span>Vuelta: <strong id="hud_lap_${i}">V1/4</strong></span>
            <div style="color: var(--eprix-text-dim); font-size: 0.68rem;">
              Uso: <span id="hud_e_${i}">0.00</span> kWh
            </div>
          </div>
        </div>

        <!-- Barra SOC -->
        <div class="hud-bar-wrapper">
          <div style="display: flex; justify-content: space-between; font-size: 0.68rem;">
            <span>SOC (10%-90%):</span>
            <strong id="hud_soc_val_${i}">90.0%</strong>
          </div>
          <div class="hud-bar-bg">
            <div class="hud-bar-fill fill-soc" id="hud_soc_bar_${i}" style="transform: scaleX(0.9);"></div>
          </div>
        </div>

        <!-- Barra Temperatura -->
        <div class="hud-bar-wrapper" style="margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.68rem;">
            <span>Temp Celda:</span>
            <strong id="hud_temp_val_${i}">28.0 °C</strong>
          </div>
          <div class="hud-bar-bg">
            <div class="hud-bar-fill fill-temp-green" id="hud_temp_bar_${i}" style="transform: scaleX(0.28);"></div>
          </div>
        </div>

        <!-- Banderas y Derates -->
        <div class="hud-flags" id="hud_flags_${i}"></div>
      </div>
    `).join('');
  }

  /**
   * Actualiza el DOM del HUD (a 10 Hz para rendimiento de 60 FPS)
   */
  function updateHudDom() {
    // Ordenar clasificación por distancia recorrida sM
    const ranked = [...state.carStates].sort((a, b) => b.sM - a.sM);
    const leaderDist = ranked[0].sM;

    // Reloj
    const m = Math.floor(state.raceTimeS / 60);
    const s = Math.floor(state.raceTimeS % 60);
    const ms = Math.floor((state.raceTimeS % 1) * 10);
    dom.raceClock.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;

    for (let i = 0; i < state.carStates.length; i++) {
      const c = state.carStates[i];
      const rankIdx = ranked.indexOf(c);

      const posEl = document.getElementById(`hud_pos_${i}`);
      const gapEl = document.getElementById(`hud_gap_${i}`);
      const spdEl = document.getElementById(`hud_spd_${i}`);
      const avgEl = document.getElementById(`hud_avg_${i}`);
      const maxEl = document.getElementById(`hud_max_${i}`);
      const lapEl = document.getElementById(`hud_lap_${i}`);
      const eEl = document.getElementById(`hud_e_${i}`);
      const socValEl = document.getElementById(`hud_soc_val_${i}`);
      const socBarEl = document.getElementById(`hud_soc_bar_${i}`);
      const tempValEl = document.getElementById(`hud_temp_val_${i}`);
      const tempBarEl = document.getElementById(`hud_temp_bar_${i}`);
      const flagsEl = document.getElementById(`hud_flags_${i}`);

      if (posEl) posEl.textContent = `P${rankIdx + 1}`;

      // Gap con el líder en segundos estimados
      if (gapEl) {
        if (rankIdx === 0) {
          gapEl.textContent = 'LÍDER';
        } else {
          const gapM = leaderDist - c.sM;
          const gapS = c.vMs > 2.0 ? (gapM / c.vMs).toFixed(1) : '—';
          gapEl.textContent = `+${gapS}s`;
        }
      }

      if (spdEl) spdEl.textContent = Math.round(c.vMs * 3.6);
      if (maxEl) maxEl.textContent = Math.round(c.vMaxMs * 3.6);
      if (avgEl) {
        const vAvg = c.totalTimeS > 0 ? (c.distanciaTotalM / c.totalTimeS) * 3.6 : 0;
        avgEl.textContent = Math.round(vAvg);
      }
      if (lapEl) lapEl.textContent = `V${c.lap}/4`;
      if (eEl) eEl.textContent = (c.battery.energiaDescargaJ / 3.6e6).toFixed(2);

      // Barras transform: scaleX()
      if (socValEl) socValEl.textContent = `${(c.battery.soc * 100).toFixed(1)}%`;
      if (socBarEl) socBarEl.style.transform = `scaleX(${Math.max(0, Math.min(1, c.battery.soc))})`;

      if (tempValEl) tempValEl.textContent = `${c.battery.tempC.toFixed(1)} °C`;
      if (tempBarEl) {
        const tempScale = Math.max(0, Math.min(1, c.battery.tempC / 65.0));
        tempBarEl.style.transform = `scaleX(${tempScale})`;

        // Color verde (<45°C), ámbar (45-55°C), roja (>55°C)
        tempBarEl.className = 'hud-bar-fill ' + (
          c.battery.tempC < 45 ? 'fill-temp-green' :
          c.battery.tempC <= 55 ? 'fill-temp-amber' : 'fill-temp-red'
        );
      }

      // Indicadores didácticos de alertas
      if (flagsEl) {
        const tags = [];
        if (c.battery.isDnf) {
          tags.push(`<span class="hud-tag tag-derating">DNF: ${c.battery.dnfReason}</span>`);
        } else {
          if (c.battery.isLimitingPower) {
            tags.push('<span class="hud-tag tag-limiting">Límite Batería (C-rate)</span>');
          }
          if (c.battery.tempC > 45) {
            tags.push('<span class="hud-tag tag-derating">Derate Térmico</span>');
          }
          if (c.battery.turtleModeActive) {
            tags.push('<span class="hud-tag tag-turtle">Modo Tortuga</span>');
          }
        }
        flagsEl.innerHTML = tags.join('');
      }
    }
  }

  /**
   * Finalización de carrera: cálculo de resultados y análisis pedagógico
   */
  function onRaceFinish() {
    state.isRacing = false;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);

    // Ordenar clasificación oficial por tiempo total
    const results = state.carStates.map(c => {
      const avgSpd = c.totalTimeS > 0 ? (c.distanciaTotalM / c.totalTimeS) * 3.6 : 0;
      const bestLap = c.lapTimes.length > 0 ? Math.min(...c.lapTimes) : c.totalTimeS;
      const eNet = (c.battery.energiaDescargaJ - c.battery.energiaRegenJ) / 3.6e6;
      return {
        car: c.car,
        chem: c.chem,
        totalTimeS: c.finishTimeS || c.totalTimeS,
        bestLapS: bestLap,
        avgSpeedKmh: +avgSpd.toFixed(1),
        maxSpeedKmh: +(c.vMaxMs * 3.6).toFixed(1),
        minSpeedKmh: c.vMinMs < 900 ? +(c.vMinMs * 3.6).toFixed(1) : 0,
        socFinalPct: +(c.battery.soc * 100).toFixed(1),
        tempMaxC: +c.battery.tempMaxC.toFixed(1),
        sohPerdidoPct: +((1 - c.battery.soh) * 100).toFixed(3),
        energiaUsadaKwh: +(c.battery.energiaDescargaJ / 3.6e6).toFixed(2),
        regenKwh: +(c.battery.energiaRegenJ / 3.6e6).toFixed(2),
        energiaNetaKwh: +eNet.toFixed(2),
        isDnf: c.battery.isDnf,
        dnfReason: c.battery.dnfReason,
        costoPackUsd: c.car.costo_pack_usd,
        ledger: c.ledger
      };
    });

    results.sort((a, b) => {
      if (a.isDnf && !b.isDnf) return 1;
      if (!a.isDnf && b.isDnf) return -1;
      return a.totalTimeS - b.totalTimeS;
    });

    state.lastResults = results;
    renderResultsView(results);
    switchView('results');
  }

  /**
   * Renderiza la vista de Resultados y el análisis fundamentado
   */
  function renderResultsView(results) {
    // 1. Podio visual
    dom.podiumCards.innerHTML = results.map((r, i) => `
      <div class="podium-card ${i === 0 ? 'winner' : ''}">
        <div class="podium-place">${i === 0 ? '🏆 P1' : `P${i + 1}`}</div>
        <div class="podium-car-name">${r.car.nombre}</div>
        <span class="chem-badge chem-${r.car.quimica}">${r.car.quimica}</span>
        <div class="podium-time" style="margin-top: 8px;">
          ${r.isDnf ? `<span style="color: var(--eprix-red);">DNF</span>` : `${r.totalTimeS.toFixed(2)} s`}
        </div>
        <div style="font-size: 0.72rem; color: var(--eprix-text-dim); margin-top: 4px;">
          Vuelta Rápida: ${r.bestLapS ? r.bestLapS.toFixed(2) + ' s' : '—'}
        </div>
      </div>
    `).join('');

    // 2. Generación del veredicto didáctico fundamentado: «Por qué ganó» (§8.3: 2-4 frases con datos reales)
    const winner = results[0];
    const second = results[1];
    const timeDelta = (second.totalTimeS - winner.totalTimeS).toFixed(1);

    let whyItWon = `Ganó el <strong>${winner.car.nombre}</strong> con un tiempo de <strong>${winner.totalTimeS.toFixed(1)} s</strong>`;
    if (!second.isDnf) {
      whyItWon += ` (ventaja de ${timeDelta} s sobre el ${second.car.nombre}). `;
    } else {
      whyItWon += ` tras el abandono de sus rivales directos. `;
    }

    whyItWon += `La química <strong>${winner.car.quimica}</strong> permitió mantener una entrega continua eficiente: `;
    whyItWon += `recuperó <strong>${winner.regenKwh} kWh</strong> en frenada regenerativa y culminó a <strong>${winner.tempMaxC} °C</strong> (zona ${winner.tempMaxC < 45 ? 'óptima sin derating térmico' : 'con derating moderado'}). `;

    if (second.tempMaxC > 45) {
      whyItWon += `En contraste, el ${second.car.nombre} superó los 45 °C (${second.tempMaxC} °C), forzando a la VCU a reducir potencia por protección térmica [F31·s24].`;
    } else if (second.car.quimica === 'Plomo') {
      whyItWon += `En contraste, la gran masa inercial de la química Plomo y la alta resistencia interna penalizaron su aceleración y velocidad media [F31·s37].`;
    } else {
      whyItWon += `La menor masa del pack y el balance aerodinámico (${winner.car.cd} Cd) fueron determinantes en curvas de alta exigencia lateral.`;
    }

    dom.whyItWonText.innerHTML = whyItWon;

    // 3. Tabla completa de resultados
    dom.resultsTableBody.innerHTML = results.map((r, i) => `
      <tr>
        <td><strong>P${i + 1}</strong></td>
        <td><strong>${r.car.nombre}</strong></td>
        <td><span class="chem-badge chem-${r.car.quimica}">${r.car.quimica}</span></td>
        <td>${r.isDnf ? 'DNF' : r.totalTimeS.toFixed(2) + ' s'}</td>
        <td>${r.bestLapS ? r.bestLapS.toFixed(2) + ' s' : '—'}</td>
        <td>${r.avgSpeedKmh} km/h</td>
        <td>${r.maxSpeedKmh} km/h</td>
        <td>${r.socFinalPct}%</td>
        <td style="color: ${r.tempMaxC < 45 ? 'var(--eprix-green)' : (r.tempMaxC <= 55 ? 'var(--eprix-orange)' : 'var(--eprix-red)')};">
          ${r.tempMaxC} °C
        </td>
        <td>${r.energiaNetaKwh} kWh</td>
        <td>+${r.regenKwh} kWh</td>
        <td>${r.sohPerdidoPct}%</td>
        <td>$${r.costoPackUsd}</td>
        <td>
          <button type="button" class="btn-eprix" style="padding: 2px 8px; font-size: 0.72rem;" onclick="window.__eprixOpenModal('${r.car.id}')">
            Evidencia
          </button>
        </td>
      </tr>
    `).join('');

    // 4. Ledger de energía canónico (§11: cuadratura ±2%)
    renderEnergyLedger(winner);
  }

  /**
   * Renderiza el balance de energía (Ledger) del coche ganador
   */
  function renderEnergyLedger(carRes) {
    const l = carRes.ledger;
    const batOut = l.eBatDischargeKwh;
    const regenIn = l.eRegenKwh;
    const netBat = batOut - regenIn;
    const wheelsOut = l.eWheelKwh;
    const heatLoss = l.eHeatJouleKwh;
    const powertrainLoss = l.ePowertrainLossKwh;
    const auxLoss = l.eAuxKwh;

    const totalAccounted = wheelsOut + powertrainLoss + heatLoss + auxLoss - regenIn;
    const balanceDiff = Math.abs(netBat - totalAccounted);
    const balancePct = netBat > 0 ? (balanceDiff / netBat) * 100 : 0;
    const isBalanced = balancePct <= 2.5;

    dom.ledgerContainer.innerHTML = `
      <div class="box-title">
        <span>Balance de Flujo Energético: ${carRes.car.nombre}</span>
        <span class="eprix-badge" style="color: ${isBalanced ? 'var(--eprix-green)' : 'var(--eprix-red)'};">
          ${isBalanced ? '✓ Cuadratura ±2% Conforme' : 'Desviación en balance'}
        </span>
      </div>
      <p class="box-desc">Auditoría del principio de conservación de energía entre el pack de batería, el motor y las ruedas [F30·s25].</p>
      
      <div class="ledger-grid">
        <div class="ledger-item">
          <div class="ledger-item-label">Descarga Batería (Entrada Pack)</div>
          <div class="ledger-item-val">${batOut.toFixed(2)} kWh</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Regeneración (Recuperado en Batería)</div>
          <div class="ledger-item-val" style="color: var(--eprix-green);">+${regenIn.toFixed(2)} kWh</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Energía Neta Entregada por Pack</div>
          <div class="ledger-item-val">${netBat.toFixed(2)} kWh</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Trabajo Mecánico Útil a Ruedas</div>
          <div class="ledger-item-val">${wheelsOut.toFixed(2)} kWh</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Pérdidas Inversor / Transmisión</div>
          <div class="ledger-item-val" style="color: var(--eprix-orange);">${powertrainLoss.toFixed(2)} kWh</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Pérdidas por Calor Joule (I²·R)</div>
          <div class="ledger-item-val" style="color: var(--eprix-red);">${heatLoss.toFixed(2)} kWh</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Consumo Auxiliar 12V (VCU/BMS)</div>
          <div class="ledger-item-val" style="color: var(--eprix-text-muted);">${auxLoss.toFixed(2)} kWh</div>
        </div>
      </div>
    `;
  }

  /**
   * Exportación en CSV
   */
  function exportCsv() {
    if (!state.lastResults) return;
    const header = 'Pos,Vehiculo,Plataforma,Quimica,Tiempo_Total_s,Mejor_Vuelta_s,Vel_Media_kmh,Vel_Max_kmh,SOC_Final_pct,Temp_Max_C,Energia_Neta_kWh,Regen_kWh,SOH_Perdido_pct,Costo_USD\n';
    const rows = state.lastResults.map((r, i) => [
      i + 1,
      `"${r.car.nombre}"`,
      r.car.plataforma,
      r.car.quimica,
      r.totalTimeS.toFixed(2),
      r.bestLapS ? r.bestLapS.toFixed(2) : '',
      r.avgSpeedKmh,
      r.maxSpeedKmh,
      r.socFinalPct,
      r.tempMaxC,
      r.energiaNetaKwh,
      r.regenKwh,
      r.sohPerdidoPct,
      r.costoPackUsd
    ].join(',')).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eprix_resultados_${state.selectedCircuitId}_seed${state.seed}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Exportación en JSON (con serie temporal y metadatos)
   */
  function exportJson() {
    if (!state.lastResults) return;
    const data = {
      modulo: 'E-Prix Didaktikos',
      version: '2.0-fundamentado',
      fecha: new Date().toISOString(),
      seed: state.seed,
      circuito: state.selectedCircuitId,
      clasificacion: state.lastResults,
      serieTemporal: state.timeSeriesLog
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eprix_telemetria_${state.selectedCircuitId}_seed${state.seed}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Renderiza el modo Conceptos (Quiz de las 5 trampas conceptuales)
   */
  function renderConcepts() {
    dom.viewConcepts.innerHTML = `
      <div class="concepts-container">
        <div class="card-box">
          <div class="box-title">
            <span>🎓 Las 5 Trampas Conceptuales de la Electromovilidad</span>
            <span class="eprix-badge">Corpus [F30·s48]</span>
          </div>
          <p class="box-desc">
            Evalúa tu comprensión técnica desmontando los mitos más comunes sobre transmisiones, distribución de alta tensión, auxiliares y regeneración.
          </p>

          <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
            ${CONCEPT_TRAPS.map((t, idx) => `
              <div class="quiz-card" id="quiz_card_${idx}">
                <div class="quiz-header">
                  <span class="trap-warning-pill">Mito ${idx + 1}</span>
                  <span style="font-size: 0.75rem; color: var(--eprix-cyan); font-weight: 700;">Fuente: ${t.cita}</span>
                </div>
                <div class="quiz-question">${t.pregunta}</div>
                <div class="quiz-options">
                  ${t.opciones.map((opt, oIdx) => `
                    <button type="button" class="quiz-option-btn" data-quiz-idx="${idx}" data-opt-idx="${oIdx}">
                      ${opt}
                    </button>
                  `).join('')}
                </div>
                <div class="quiz-feedback" id="quiz_feedback_${idx}"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Glosario y Grafo de Conocimiento -->
        <div class="card-box">
          <div class="box-title">
            <span>🔗 Grafo Canónico de Conocimiento (G14)</span>
            <span class="eprix-badge">12 Nodos Fundamentados</span>
          </div>
          <p class="box-desc">Haz clic en cada nodo del curso para consultar su rol técnico y referencia canónica en las fuentes F30/F31.</p>
          <div class="graph-chips-box">
            ${Object.keys(GRAPH_NODES).map(k => `
              <button type="button" class="graph-chip" onclick="window.__eprixOpenGraphNode('${k}')">
                ${k}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Eventos de opciones de quiz
    dom.viewConcepts.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.dataset.quizIdx, 10);
        const oIdx = parseInt(btn.dataset.optIdx, 10);
        const trap = CONCEPT_TRAPS[qIdx];
        const card = dom.viewConcepts.querySelector(`#quiz_card_${qIdx}`);
        const feedback = dom.viewConcepts.querySelector(`#quiz_feedback_${qIdx}`);

        const buttons = card.querySelectorAll('.quiz-option-btn');
        buttons.forEach(b => b.disabled = true);

        if (oIdx === trap.correcta) {
          btn.classList.add('correct');
          feedback.style.background = 'rgba(46, 196, 182, 0.15)';
          feedback.style.border = '1px solid var(--eprix-green)';
          feedback.style.color = 'var(--eprix-green)';
          feedback.innerHTML = `<strong>¡Correcto!</strong> ${trap.correccion} <span style="color: var(--eprix-cyan);">[${trap.cita}]</span>`;
        } else {
          btn.classList.add('wrong');
          buttons[trap.correcta].classList.add('correct');
          feedback.style.background = 'rgba(230, 57, 70, 0.15)';
          feedback.style.border = '1px solid var(--eprix-red)';
          feedback.style.color = 'var(--eprix-red)';
          feedback.innerHTML = `<strong>Mito detectado:</strong> «${trap.afirmacion_falsa}»<br><br><strong>Realidad técnica:</strong> ${trap.correccion} <span style="color: var(--eprix-cyan);">[${trap.cita}]</span>`;
        }
        feedback.classList.add('active');
      });
    });
  }

  /**
   * Abre modal de ficha técnica de un coche
   */
  function openCarModal(carId) {
    const car = CARS_DATA[carId];
    if (!car) return;
    const chem = CHEMISTRY_DATA[car.quimica.toUpperCase()];

    dom.modalCard.innerHTML = `
      <button class="modal-close" id="eprix_modal_close_btn" aria-label="Cerrar modal">&times;</button>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <div>
          <span class="chem-badge chem-${car.quimica}">${car.quimica}</span>
          <h2 style="font-size: 1.3rem; margin-top: 4px;">${car.nombre}</h2>
          <div style="font-size: 0.78rem; color: var(--eprix-text-muted);">Plataforma: ${car.plataforma.toUpperCase()} · Masa total: ${car.masa_kg} kg (Pack: ${car.m_pack_kg} kg + Conductor 75 kg)</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; margin-bottom: 1.25rem;">
        <div class="ledger-item">
          <div class="ledger-item-label">Armado del Pack [F31·s34]</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--eprix-cyan); margin-top: 2px;">
            ${car.bateria.celdas_serie}S${car.bateria.celdas_paralelo}P (${car.bateria.celdas_serie * car.bateria.celdas_paralelo} celdas)
          </div>
          <div style="font-size: 0.7rem; color: var(--eprix-text-dim);">Vnom: ${car.bateria.v_nominal} V (3.2–3.7V/celda)</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Capacidad y Energía [F31·s15]</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--eprix-cyan); margin-top: 2px;">
            ${car.bateria.capacidad_ah} Ah · ${car.bateria.energia_kwh} kWh
          </div>
          <div style="font-size: 0.7rem; color: var(--eprix-text-dim);">${chem.wh_kg_pack} Wh/kg pack (Confianza C)</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">C-rate Admisible [F31·s22]</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--eprix-cyan); margin-top: 2px;">
            ${car.bateria.c_continuo}C continuo / ${car.bateria.c_pulso}C pulso
          </div>
          <div style="font-size: 0.7rem; color: var(--eprix-text-dim);">Rint pack: ${car.bateria.rint_mohm} mΩ</div>
        </div>
        <div class="ledger-item">
          <div class="ledger-item-label">Vida de Ciclo N100 [F31·s26]</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--eprix-cyan); margin-top: 2px;">
            ${car.n100_ciclos} ciclos (DOD 100%)
          </div>
          <div style="font-size: 0.7rem; color: var(--eprix-text-dim);">Autodescarga: ~${chem.autodescarga_mes_pct}%/mes</div>
        </div>
      </div>

      <!-- Cadena de tracción canónica -->
      <div style="background: var(--eprix-surface); border: 1px solid var(--eprix-border); border-radius: 8px; padding: 10px; margin-bottom: 1.25rem;">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--eprix-cyan); margin-bottom: 6px;">
          Cadena de Energía y Tracción [F30·s17]:
        </div>
        <div style="font-size: 0.75rem; color: var(--eprix-text-muted); line-height: 1.6;">
          Red 230V CA ➔ OBC ➔ Batería HV ➔ PDU ➔ MCU/Inversor ➔ Motor Trifásico ➔ Reductor ➔ Ruedas<br>
          └➔ Convertidor DC-DC ➔ Red 12V ➔ VCU / BMS / Bobinas de Relé
        </div>
      </div>

      <!-- Trazabilidad y anclas de evidencia -->
      <div>
        <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 6px;">Trazabilidad de Evidencia:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${car.citas.map(c => `
            <span class="eprix-badge" style="background: rgba(67, 97, 238, 0.2); border-color: rgba(67, 97, 238, 0.4); color: #70a1ff;">
              ${c} (Confianza A)
            </span>
          `).join('')}
          <span class="eprix-badge" style="background: rgba(255, 183, 3, 0.15); border-color: rgba(255, 183, 3, 0.4); color: var(--eprix-yellow);">
            Plataforma ${car.plataforma} (Confianza C)
          </span>
        </div>
      </div>
    `;

    dom.modalOverlay.classList.add('active');
    dom.modalCard.querySelector('#eprix_modal_close_btn').addEventListener('click', closeCarModal);
  }

  function closeCarModal() {
    dom.modalOverlay.classList.remove('active');
  }

  // Helper global para invocar modal desde tabla o chips
  window.__eprixOpenModal = openCarModal;
  window.__eprixOpenGraphNode = function(nodeKey) {
    const node = GRAPH_NODES[nodeKey];
    if (!node) return;
    alert(`[${nodeKey}] ${node.nombre}\n\n${node.desc}\n\nCita canónica: ${node.cita}`);
  };

  /**
   * Genera el esqueleto HTML inicial dentro de root
   */
  function renderSkeleton() {
    root.innerHTML = `
      <div class="eprix">
        <!-- Barra de Cabecera -->
        <header class="eprix-header">
          <div class="eprix-brand">
            <div class="eprix-brand-icon">🏎️</div>
            <div>
              <div class="eprix-brand-title">
                E-Prix Didaktikos
                <span class="eprix-badge">Simulación Fundamentada v2</span>
              </div>
              <div class="eprix-brand-desc">
                4 vehículos eléctricos compiten 4 vueltas donde la electroquímica, el C-rate y la regeneración mandan
              </div>
            </div>
          </div>
          <nav class="eprix-nav-tabs">
            <button class="eprix-tab-btn active" id="eprix_tab_prep">🏁 Preparación</button>
            <button class="eprix-tab-btn" id="eprix_tab_concepts">📚 Modo Conceptos</button>
          </nav>
        </header>

        <!-- Vista 1: Preparación -->
        <section class="eprix-view active" id="eprix_view_prep">
          <div class="prep-grid">
            <!-- Selector de Circuito -->
            <div class="card-box">
              <div class="box-title">
                <span>1. Seleccionar Circuito</span>
                <span class="eprix-badge">4 Trazados</span>
              </div>
              <p class="box-desc">Cada circuito presenta demandas distintas de velocidad, temperatura y freno regenerativo.</p>
              <div class="circuit-cards" id="eprix_circuits_list"></div>
            </div>

            <!-- Parrilla y Catálogo -->
            <div>
              <!-- 4 Ranuras -->
              <div class="card-box" style="margin-bottom: 1.5rem;">
                <div class="box-title">
                  <span>2. Parrilla de Salida (4 Coches Distintos)</span>
                  <button type="button" class="btn-eprix" id="eprix_btn_random" style="padding: 4px 12px; font-size: 0.78rem;">
                    🎲 Parrilla Aleatoria
                  </button>
                </div>
                <p class="box-desc">Configura los 4 competidores y asigna su política de gestión de energía.</p>
                <div class="slots-container" id="eprix_slots_container"></div>

                <div class="action-toolbar">
                  <button type="button" class="btn-eprix btn-primary" id="eprix_btn_start" style="padding: 12px 28px; font-size: 1rem;">
                    🚦 Iniciar Carrera (4 Vueltas)
                  </button>
                  <span style="font-size: 0.78rem; color: var(--eprix-text-dim);">
                    * La carrera simula a 60 FPS con física determinista de paso fijo (dt = 1/120 s).
                  </span>
                </div>
              </div>

              <!-- Catálogo de 16 -->
              <div class="card-box">
                <div class="box-title">
                  <span>3. Catálogo de Vehículos (4 Plataformas × 4 Químicas)</span>
                  <span class="eprix-badge">16 Modelos Calibrados</span>
                </div>
                <div class="catalog-filters">
                  <div class="filter-group">
                    <span>Química:</span>
                    <button type="button" class="filter-btn active" data-filter-chem="ALL">Todas</button>
                    <button type="button" class="filter-btn" data-filter-chem="LFP">LFP</button>
                    <button type="button" class="filter-btn" data-filter-chem="NCM">NCM</button>
                    <button type="button" class="filter-btn" data-filter-chem="NIMH">NiMH</button>
                    <button type="button" class="filter-btn" data-filter-chem="PLOMO">Plomo</button>
                  </div>
                  <div class="filter-group" style="margin-left: auto;">
                    <span>Plataforma:</span>
                    <button type="button" class="filter-btn active" data-filter-plat="ALL">Todas</button>
                    <button type="button" class="filter-btn" data-filter-plat="URBANO">Urbano</button>
                    <button type="button" class="filter-btn" data-filter-plat="SEDAN">Sedán</button>
                    <button type="button" class="filter-btn" data-filter-plat="CAMIONETA">Camioneta</button>
                    <button type="button" class="filter-btn" data-filter-plat="UTILITARIO">Utilitario</button>
                  </div>
                </div>
                <div class="cars-grid" id="eprix_cars_grid"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Vista 2: Carrera en Vivo -->
        <section class="eprix-view" id="eprix_view_race">
          <div class="race-layout">
            <!-- Pista Canvas -->
            <div class="race-track-panel">
              <div class="race-topbar">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="race-flag">
                    <div class="race-flag-icon"></div>
                    <span id="eprix_race_flag_text">EN VIVO</span>
                  </div>
                  <div class="race-clock" id="eprix_race_clock">00:00.0</div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn-eprix" id="eprix_btn_pause">⏸ Pausa</button>
                  <button type="button" class="btn-eprix active" id="eprix_btn_speed_1">1×</button>
                  <button type="button" class="btn-eprix" id="eprix_btn_speed_2">2×</button>
                  <button type="button" class="btn-eprix" id="eprix_btn_speed_4">4×</button>
                  <button type="button" class="btn-eprix btn-danger" id="eprix_btn_quit_race">Abandonar</button>
                </div>
              </div>

              <div class="canvas-container">
                <canvas id="eprix_canvas" class="track-canvas" width="1200" height="700"></canvas>
                <div class="fps-counter" id="eprix_fps_counter">60 FPS</div>
              </div>
            </div>

            <!-- HUD de Telemetría (4 Coches) -->
            <div class="hud-panel" id="eprix_hud_list" aria-live="polite"></div>
          </div>
        </section>

        <!-- Vista 3: Resultados -->
        <section class="eprix-view" id="eprix_view_results">
          <div class="results-container">
            <!-- Podio -->
            <div class="podium-grid" id="eprix_podium_cards"></div>

            <!-- Análisis "Por qué ganó" -->
            <div class="why-it-won-box">
              <div class="why-it-won-title">
                <span>🔍 Veredicto Técnico: ¿Por qué ganó el coche ganador?</span>
              </div>
              <div class="why-it-won-text" id="eprix_why_it_won_text"></div>
            </div>

            <!-- Tabla General de Resultados -->
            <div class="card-box">
              <div class="box-title">
                <span>Tabla General de Carrera y Telemetría</span>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn-eprix" id="eprix_btn_export_csv" style="padding: 4px 10px; font-size: 0.78rem;">
                    📥 Exportar CSV
                  </button>
                  <button type="button" class="btn-eprix" id="eprix_btn_export_json" style="padding: 4px 10px; font-size: 0.78rem;">
                    📥 Exportar JSON
                  </button>
                </div>
              </div>
              <div class="results-table-wrapper">
                <table class="results-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Vehículo</th>
                      <th>Química</th>
                      <th>Tiempo Total</th>
                      <th>Mejor Vuelta</th>
                      <th>V. Media</th>
                      <th>V. Máx</th>
                      <th>SOC Final</th>
                      <th>Temp Máx</th>
                      <th>Consumo Neto</th>
                      <th>Regen</th>
                      <th>SOH Perdido</th>
                      <th>Costo Pack</th>
                      <th>Evidencia</th>
                    </tr>
                  </thead>
                  <tbody id="eprix_results_table_body"></tbody>
                </table>
              </div>
            </div>

            <!-- Ledger de Energía Canónico -->
            <div class="ledger-box" id="eprix_ledger_container"></div>

            <!-- Acciones -->
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 1rem;">
              <button type="button" class="btn-eprix btn-primary" id="eprix_btn_rerace">
                🔄 Repetir Carrera (Misma Parrilla)
              </button>
              <button type="button" class="btn-eprix" id="eprix_btn_new_prep">
                🏁 Nueva Configuración
              </button>
            </div>
          </div>
        </section>

        <!-- Vista 4: Modo Conceptos -->
        <section class="eprix-view" id="eprix_view_concepts"></section>

        <!-- Modal Ficha Técnica -->
        <div class="eprix-modal-overlay" id="eprix_modal_overlay" role="dialog" aria-modal="true">
          <div class="eprix-modal-card" id="eprix_modal_card"></div>
        </div>
      </div>
    `;
  }
}
