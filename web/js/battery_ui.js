/**
 * Battery Design Lab — Controlador de Interfaz de Usuario y Gráficos
 * Didaktikos — Plataforma Educativa de Electromovilidad
 *
 * Maneja las 5 pestañas:
 *  1. Diseño y Configuración del Pack
 *  2. Consumos Auxiliares y Autonomía
 *  3. Prueba Dinámica de Carga / Descarga (Chart.js)
 *  4. Inyección de Fallas y Matriz de Alarmas del BMS
 *  5. Comparador de Diseños y Recomendación Inteligente
 */
(function () {
  "use strict";

  const t = (k, ...args) => (window.I18N ? window.I18N.t(k, ...args) : k);
  const pickLabel = (item) => {
    const lang = window.I18N ? window.I18N.getLang() : "es";
    if (lang === "zh") return item.labelZh || item.labelYue || item.labelEs;
    if (lang === "en") return item.labelEn || item.labelEs;
    return item.labelEs;
  };

  // Estado del Laboratorio
  const labState = {
    currentTab: "design",
    design: {
      appId: "urbano",
      chemId: "LFP",
      cellId: "PRISM_LFP_100",
      coolingId: "liquid",
      eTargetKWh: 40,
      vBusV: 400,
      pPeakKW: 100,
      pContKW: 50,
      socInitialPct: 90,
      tAmbC: 25
    },
    packCalculated: null,
    aux: {
      speedKmH: 90,
      baseConsumptionWhKm: 150,
      loads: []
    },
    sim: {
      running: false,
      speedMult: 1,
      profile: "cc", // cc, cp, cccv, pulse, drive
      cRate: 1.0,
      simTimeS: 0,
      dt: 1, // segundo por paso
      state: null,
      history: {
        t: [],
        v: [],
        i: [],
        temp: [],
        soc: []
      },
      charts: {
        v: null,
        i: null,
        temp: null,
        soc: null
      }
    },
    faults: {},
    bypassRunaway: false,
    bmsLogs: [],
    savedDesigns: []
  };

  let animationTimer = null;

  // ---------------------------------------------------------------------------
  // Inicialización General
  // ---------------------------------------------------------------------------
  function initBatteryLab() {
    const container = document.getElementById("view_battery_lab");
    if (!container) return;

    // Inicializar cargas auxiliares por defecto desde Physics
    if (window.BatteryPhysics && labState.aux.loads.length === 0) {
      labState.aux.loads = window.BatteryPhysics.DEFAULT_AUX_CATALOG.map((item) => ({
        ...item,
        enabled: item.defaultDuty > 0,
        dutyPct: item.defaultDuty
      }));
    }

    bindTabs();
    bindDesignInputs();
    bindAuxInputs();
    bindSimulationControls();
    bindFaultsControls();
    bindResultsControls();
    bindTutorialModal();

    // Calcular diseño inicial
    recalculateDesign();
    initSimCharts();
    renderAuxLoads();
    renderFaultsCatalog();

    window.addEventListener("sim:langchange", () => {
      recalculateDesign();
      renderAuxLoads();
      renderFaultsCatalog();
      renderComparatorTable();
    });
  }

  // ---------------------------------------------------------------------------
  // Pestañas (Tabs)
  // ---------------------------------------------------------------------------
  function bindTabs() {
    const tabBtns = document.querySelectorAll(".battery-tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        switchTab(target);
        if (window.sounds) sounds.playClick();
      });
    });
  }

  function switchTab(tabId) {
    labState.currentTab = tabId;
    document.querySelectorAll(".battery-tab-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".battery-tab-pane").forEach((p) => {
      p.classList.toggle("active", p.id === `tab_pane_${tabId}`);
    });

    if (tabId === "simulation") {
      setTimeout(() => {
        resizeCharts();
      }, 50);
    }
  }

  // ---------------------------------------------------------------------------
  // Pestaña 1: Diseño y Dimensionamiento
  // ---------------------------------------------------------------------------
  function bindDesignInputs() {
    const appSelect = document.getElementById("bat_app_select");
    const chemSelect = document.getElementById("bat_chem_select");
    const cellSelect = document.getElementById("bat_cell_select");
    const coolingSelect = document.getElementById("bat_cooling_select");

    // Llenar select de aplicaciones
    if (appSelect && window.BatteryData) {
      appSelect.innerHTML = "";
      Object.keys(BatteryData.APPLICATIONS).forEach((k) => {
        const app = BatteryData.APPLICATIONS[k];
        const opt = document.createElement("option");
        opt.value = app.id;
        opt.textContent = pickLabel(app);
        appSelect.appendChild(opt);
      });
      appSelect.value = labState.design.appId;

      appSelect.addEventListener("change", () => {
        const app = BatteryData.APPLICATIONS[appSelect.value];
        if (app) {
          labState.design.appId = app.id;
          labState.design.eTargetKWh = app.eKWh;
          labState.design.vBusV = app.vPackV;
          labState.design.pPeakKW = app.pPeakKW;
          labState.design.pContKW = app.pContKW;
          labState.design.chemId = app.chemId;
          labState.design.cellId = app.cellId;
          labState.design.coolingId = app.cooling;
          syncDesignInputsToDOM();
          recalculateDesign();
        }
      });
    }

    // Llenar select de químicas
    if (chemSelect && window.BatteryData) {
      chemSelect.innerHTML = "";
      Object.keys(BatteryData.CHEMISTRIES).forEach((k) => {
        const chem = BatteryData.CHEMISTRIES[k];
        if (chem.selectable === false) return;
        const opt = document.createElement("option");
        opt.value = chem.id;
        opt.textContent = pickLabel(chem);
        chemSelect.appendChild(opt);
      });
      chemSelect.value = labState.design.chemId;

      chemSelect.addEventListener("change", () => {
        labState.design.chemId = chemSelect.value;
        updateAvailableCells();
        recalculateDesign();
      });
    }

    // Llenar select de refrigeración
    if (coolingSelect && window.BatteryData) {
      coolingSelect.innerHTML = "";
      Object.keys(BatteryData.COOLING).forEach((k) => {
        const c = BatteryData.COOLING[k];
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = pickLabel(c);
        coolingSelect.appendChild(opt);
      });
      coolingSelect.value = labState.design.coolingId;

      coolingSelect.addEventListener("change", () => {
        labState.design.coolingId = coolingSelect.value;
        recalculateDesign();
      });
    }

    // Sliders sincronizados con numeric inputs
    bindSyncedSliderAndNumber("bat_energy_range", "bat_energy_num", "bat_energy_val", (val) => {
      labState.design.eTargetKWh = val;
      recalculateDesign();
    });

    bindSyncedSliderAndNumber("bat_vbus_range", "bat_vbus_num", "bat_vbus_val", (val) => {
      labState.design.vBusV = val;
      recalculateDesign();
    });

    bindSyncedSliderAndNumber("bat_ppeak_range", "bat_ppeak_num", "bat_ppeak_val", (val) => {
      labState.design.pPeakKW = val;
      recalculateDesign();
    });

    bindSyncedSliderAndNumber("bat_pcont_range", "bat_pcont_num", "bat_pcont_val", (val) => {
      labState.design.pContKW = val;
      recalculateDesign();
    });

    bindSyncedSliderAndNumber("bat_soc_init_range", "bat_soc_init_num", "bat_soc_init_val", (val) => {
      labState.design.socInitialPct = val;
      recalculateDesign();
    });

    bindSyncedSliderAndNumber("bat_tamb_range", "bat_tamb_num", "bat_tamb_val", (val) => {
      labState.design.tAmbC = val;
      recalculateDesign();
    });

    updateAvailableCells();
  }

  function updateAvailableCells() {
    const cellSelect = document.getElementById("bat_cell_select");
    if (!cellSelect || !window.BatteryData) return;

    cellSelect.innerHTML = "";
    const activeChem = labState.design.chemId;

    Object.keys(BatteryData.CELLS).forEach((k) => {
      const cell = BatteryData.CELLS[k];
      if (cell.chems && cell.chems.includes(activeChem)) {
        const opt = document.createElement("option");
        opt.value = cell.id;
        opt.textContent = `${pickLabel(cell)} (${cell.capacityAh} Ah)`;
        cellSelect.appendChild(opt);
      }
    });

    // Si la celda seleccionada no está disponible para esta química, tomar la primera
    if (!Array.from(cellSelect.options).some((o) => o.value === labState.design.cellId)) {
      if (cellSelect.options.length > 0) {
        labState.design.cellId = cellSelect.options[0].value;
      }
    }
    cellSelect.value = labState.design.cellId;

    cellSelect.onchange = () => {
      labState.design.cellId = cellSelect.value;
      recalculateDesign();
    };
  }

  function bindSyncedSliderAndNumber(rangeId, numId, labelValId, onChange) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    const labelVal = document.getElementById(labelValId);

    if (range && num) {
      range.addEventListener("input", () => {
        num.value = range.value;
        if (labelVal) labelVal.textContent = range.value;
        onChange(Number(range.value));
      });

      num.addEventListener("change", () => {
        let v = Number(num.value);
        if (range.min && v < Number(range.min)) v = Number(range.min);
        if (range.max && v > Number(range.max)) v = Number(range.max);
        num.value = v;
        range.value = v;
        if (labelVal) labelVal.textContent = v;
        onChange(v);
      });
    }
  }

  function syncDesignInputsToDOM() {
    const d = labState.design;
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    const setTxt = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };

    setVal("bat_app_select", d.appId);
    setVal("bat_chem_select", d.chemId);
    setVal("bat_cooling_select", d.coolingId);

    setVal("bat_energy_range", d.eTargetKWh);
    setVal("bat_energy_num", d.eTargetKWh);
    setTxt("bat_energy_val", d.eTargetKWh);

    setVal("bat_vbus_range", d.vBusV);
    setVal("bat_vbus_num", d.vBusV);
    setTxt("bat_vbus_val", d.vBusV);

    setVal("bat_ppeak_range", d.pPeakKW);
    setVal("bat_ppeak_num", d.pPeakKW);
    setTxt("bat_ppeak_val", d.pPeakKW);

    setVal("bat_pcont_range", d.pContKW);
    setVal("bat_pcont_num", d.pContKW);
    setTxt("bat_pcont_val", d.pContKW);

    updateAvailableCells();
  }

  function recalculateDesign() {
    if (!window.BatteryPhysics) return;

    const pack = BatteryPhysics.dimensionPack({
      chemId: labState.design.chemId,
      cellId: labState.design.cellId,
      coolingId: labState.design.coolingId,
      eTargetKWh: labState.design.eTargetKWh,
      vBusV: labState.design.vBusV,
      pPeakKW: labState.design.pPeakKW,
      pContKW: labState.design.pContKW
    });

    labState.packCalculated = pack;

    // Actualizar métricas HUD del diseño
    setTxtSafe("hud_ns_np", `${pack.ns}S ${pack.np}P`);
    setTxtSafe("hud_total_cells", `${pack.totalCells}`);
    setTxtSafe("hud_v_nom", `${pack.vNom.toFixed(1)} V`);
    setTxtSafe("hud_cap_ah", `${pack.capAh.toFixed(1)} Ah`);
    setTxtSafe("hud_e_real", `${pack.eRealKWh.toFixed(1)} kWh`);
    setTxtSafe("hud_mass_pack", `${pack.massPackKg.toFixed(1)} kg`);
    setTxtSafe("hud_density_whkg", `${pack.densityWhKg.toFixed(0)} Wh/kg`);
    setTxtSafe("hud_density_whl", `${pack.densityWhL.toFixed(0)} Wh/L`);
    setTxtSafe("hud_cost_total", `$${Math.round(pack.costTotal).toLocaleString()}`);
    setTxtSafe("hud_cost_kwh", `$${pack.costPerKWh}/kWh`);
    setTxtSafe("hud_rint", `${(pack.rintPack * 1000).toFixed(2)} mΩ`);

    // Indicadores de semáforo
    updateCheckIndicator("check_pcont", pack.checks.okPowerCont);
    updateCheckIndicator("check_ppeak", pack.checks.okPowerPeak);
    updateCheckIndicator("check_energy", pack.checks.okEnergy);

    renderPackSvg();
    resetSimulationState();
    recalculateAux();
  }

  function setTxtSafe(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function updateCheckIndicator(id, isOk) {
    const el = document.getElementById(id);
    if (!el) return;
    const dot = el.querySelector(".check-dot");
    if (dot) {
      dot.className = `check-dot ${isOk ? "ok" : "fail"}`;
    }
  }

  // ---------------------------------------------------------------------------
  // Renderizado SVG Interactivo del Pack
  // ---------------------------------------------------------------------------
  function renderPackSvg() {
    const svgContainer = document.getElementById("pack_svg_container");
    if (!svgContainer || !labState.packCalculated) return;

    const pack = labState.packCalculated;
    const ns = Math.min(pack.ns, 64); // visualización escalada para no saturar DOM
    const np = Math.min(pack.np, 8);

    const width = 840;
    const height = 380;
    const padding = 20;

    const cols = Math.min(16, ns);
    const rows = Math.ceil(ns / cols);

    const cellWidth = Math.max(16, (width - padding * 2 - cols * 6) / cols);
    const cellHeight = Math.max(20, (height - padding * 2 - rows * 10) / rows);

    let cellsHtml = "";
    let cellIdx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cellIdx >= ns) break;
        const x = padding + c * (cellWidth + 6);
        const y = padding + r * (cellHeight + 10);

        // Coloración de la celda según temperatura o falla
        const isHotCell = (cellIdx === 0 && labState.faults.F_CELL_RINT);
        const isRunaway = (cellIdx === 0 && (labState.faults.F_CELL_RUNAWAY || labState.sim.state?.thermalRunawayActive));
        const isShort = (cellIdx === 0 && labState.faults.F_CELL_SHORT);

        let fill = "#00f5d4";
        let stroke = "#00b4d8";
        let extraClass = "cell-rect";

        if (isRunaway) {
          fill = "#e63946";
          stroke = "#ffbe0b";
          extraClass += " cell-hot";
        } else if (isHotCell) {
          fill = "#f77f00";
          stroke = "#e63946";
          extraClass += " cell-hot";
        } else if (isShort) {
          fill = "#4a4e69";
          stroke = "#22223b";
        }

        cellsHtml += `
          <g class="cell-group" data-cell-index="${cellIdx}">
            <rect class="${extraClass}" x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" rx="4"
                  fill="${fill}" stroke="${stroke}" stroke-width="1.5" opacity="0.9"/>
            <circle cx="${x + cellWidth / 2}" cy="${y + 4}" r="2.5" fill="#f8f9fa"/>
            <text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 3}" fill="#0a0e17" font-size="8"
                  font-weight="700" text-anchor="middle" font-family="monospace">${cellIdx + 1}</text>
          </g>
        `;
        cellIdx++;
      }
    }

    // Busbars y tubería de enfriamiento
    const coolantColor = labState.design.coolingId === "liquid" ? "#00b4d8" : "#64748b";

    svgContainer.innerHTML = `
      <svg class="battery-svg-canvas" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Fondo chasis del pack -->
        <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="12"
              fill="#0d131f" stroke="#223049" stroke-width="2"/>
        
        <!-- Líneas de refrigeración inferior -->
        <path d="M 20 ${height - 18} L ${width - 20} ${height - 18}" stroke="${coolantColor}"
              stroke-width="4" stroke-dasharray="6,4" fill="none" opacity="0.75"/>
        
        <!-- Contactores principales HV -->
        <g transform="translate(${width - 80}, 20)">
          <rect x="0" y="0" width="55" height="28" rx="4" fill="#1b2438" stroke="#3a4b6e" stroke-width="1"/>
          <circle cx="15" cy="14" r="6" fill="${labState.sim.state?.bms?.contactorOpen ? '#e63946' : '#2ec4b6'}"/>
          <text x="28" y="18" fill="#f8f9fa" font-size="9" font-family="monospace">HV±</text>
        </g>

        <!-- Celdas -->
        ${cellsHtml}
      </svg>
    `;

    // Interacción al hacer clic en celdas
    svgContainer.querySelectorAll(".cell-group").forEach((grp) => {
      grp.addEventListener("click", () => {
        const idx = Number(grp.getAttribute("data-cell-index"));
        showCellDetails(idx);
        if (window.sounds) sounds.playClick();
      });
    });
  }

  function showCellDetails(cellIndex) {
    const pack = labState.packCalculated;
    if (!pack) return;
    const chem = BatteryData.CHEMISTRIES[labState.design.chemId];
    const cell = BatteryData.CELLS[labState.design.cellId];

    const vNom = cell.vnom || chem.vnom;
    let rCell = cell.rintOhm;
    let tempC = labState.design.tAmbC;

    if (cellIndex === 0 && labState.faults.F_CELL_RINT) {
      rCell *= labState.faults.F_CELL_RINT.magnitude || 10;
      tempC += 25;
    }

    const modal = document.getElementById("device_modal");
    if (!modal) return;
    document.getElementById("modal_title").textContent = `Celda #${cellIndex + 1} (${chem.labelEs})`;
    document.getElementById("modal_type").textContent = `${cell.labelEs} · ${cell.capacityAh} Ah`;
    document.getElementById("modal_desc").innerHTML = `
      <p><strong>Tensión Nominal:</strong> ${vNom} V</p>
      <p><strong>Resistencia Interna:</strong> ${(rCell * 1000).toFixed(2)} mΩ</p>
      <p><strong>Temperatura Estimada:</strong> ${tempC.toFixed(1)} °C</p>
      <p><strong>Masa:</strong> ${(cell.massKg * 1000).toFixed(0)} g</p>
      <p><strong>Química:</strong> ${chem.labelEs} (${chem.safety})</p>
    `;
    document.getElementById("modal_terminals").innerHTML = "";
    modal.classList.add("active");
  }

  // ---------------------------------------------------------------------------
  // Pestaña 2: Cargas Auxiliares y Autonomía (V3)
  // ---------------------------------------------------------------------------
  function bindAuxInputs() {
    bindSyncedSliderAndNumber("aux_speed_range", "aux_speed_num", "aux_speed_val", (val) => {
      labState.aux.speedKmH = val;
      recalculateAux();
    });

    bindSyncedSliderAndNumber("aux_base_whkm_range", "aux_base_whkm_num", "aux_base_whkm_val", (val) => {
      labState.aux.baseConsumptionWhKm = val;
      recalculateAux();
    });
  }

  function renderAuxLoads() {
    const grid = document.getElementById("aux_loads_grid");
    if (!grid) return;

    grid.innerHTML = "";
    labState.aux.loads.forEach((load, idx) => {
      const card = document.createElement("div");
      card.className = `aux-load-card ${load.enabled ? "active" : ""}`;
      card.innerHTML = `
        <div class="aux-load-top">
          <span class="aux-load-name">${load.name}</span>
          <label class="aux-toggle-switch">
            <input type="checkbox" ${load.enabled ? "checked" : ""} data-load-idx="${idx}">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem;">
          <span class="aux-load-power">${load.powerW} W (${load.hv ? "HV" : "12V"})</span>
          <span style="color: var(--text-muted); font-family: monospace;">Ciclo: <strong id="duty_lbl_${idx}">${load.dutyPct}%</strong></span>
        </div>
        <input type="range" class="range-input" min="0" max="100" step="5" value="${load.dutyPct}" data-duty-idx="${idx}">
      `;

      // Evento toggle switch
      const toggle = card.querySelector("input[type=checkbox]");
      toggle.addEventListener("change", () => {
        load.enabled = toggle.checked;
        card.classList.toggle("active", load.enabled);
        recalculateAux();
        if (window.sounds) sounds.playClick();
      });

      // Evento slider duty cycle
      const range = card.querySelector("input[type=range]");
      range.addEventListener("input", () => {
        load.dutyPct = Number(range.value);
        const lbl = document.getElementById(`duty_lbl_${idx}`);
        if (lbl) lbl.textContent = `${load.dutyPct}%`;
        if (load.dutyPct > 0 && !load.enabled) {
          load.enabled = true;
          toggle.checked = true;
          card.classList.add("active");
        }
        recalculateAux();
      });

      grid.appendChild(card);
    });
  }

  function recalculateAux() {
    if (!window.BatteryPhysics || !labState.packCalculated) return;

    const activeLoads = labState.aux.loads
      .filter((l) => l.enabled)
      .map((l) => ({ powerW: l.powerW, dutyPct: l.dutyPct }));

    const res = BatteryPhysics.calcAuxConsumption({
      baseConsumptionWhKm: labState.aux.baseConsumptionWhKm,
      packEnergyWh: labState.packCalculated.eRealKWh * 1000,
      speedKmH: labState.aux.speedKmH,
      loads: activeLoads
    });

    setTxtSafe("aux_power_total", `${Math.round(res.totalAuxPowerW)} W`);
    setTxtSafe("aux_added_whkm", `+${res.auxWhKm.toFixed(1)} Wh/km`);
    setTxtSafe("aux_total_whkm", `${res.totalWhKm.toFixed(1)} Wh/km`);
    setTxtSafe("aux_range_km", `${Math.round(res.rangeKm)} km`);
    setTxtSafe("aux_range_drop", `${res.rangeDropPct > 0 ? `-${res.rangeDropPct.toFixed(1)}%` : "0%"}`);
  }

  // ---------------------------------------------------------------------------
  // Pestaña 3: Prueba Dinámica de Carga y Descarga (Chart.js)
  // ---------------------------------------------------------------------------
  function bindSimulationControls() {
    const btnPlay = document.getElementById("sim_btn_play");
    const btnStep = document.getElementById("sim_btn_step");
    const btnReset = document.getElementById("sim_btn_reset");

    if (btnPlay) {
      btnPlay.addEventListener("click", () => {
        toggleSimulation();
        if (window.sounds) sounds.playClick();
      });
    }

    if (btnStep) {
      btnStep.addEventListener("click", () => {
        stepSimulation();
        if (window.sounds) sounds.playClick();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        resetSimulationState();
        if (window.sounds) sounds.playClick();
      });
    }

    // Selector de perfil
    const profileSelect = document.getElementById("sim_profile_select");
    if (profileSelect) {
      profileSelect.addEventListener("change", () => {
        labState.sim.profile = profileSelect.value;
        resetSimulationState();
      });
    }

    // Slider C-rate
    bindSyncedSliderAndNumber("sim_crate_range", "sim_crate_num", "sim_crate_val", (val) => {
      labState.sim.cRate = val;
    });

    // Multiplicador de velocidad (1x, 5x, 20x)
    document.querySelectorAll(".sim-speed-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sim-speed-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        labState.sim.speedMult = Number(btn.getAttribute("data-mult") || 1);
        if (window.sounds) sounds.playClick();
      });
    });
  }

  function initSimCharts() {
    if (typeof Chart === "undefined") return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#64748b", font: { size: 10 } }
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#64748b", font: { size: 10 } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    };

    // 1. Gráfica de Voltaje
    const ctxV = document.getElementById("chart_voltage")?.getContext("2d");
    if (ctxV) {
      labState.sim.charts.v = new Chart(ctxV, {
        type: "line",
        data: {
          labels: [],
          datasets: [{ data: [], borderColor: "#00f5d4", borderWidth: 2, tension: 0.1, pointRadius: 0 }]
        },
        options: commonOptions
      });
    }

    // 2. Gráfica de Corriente
    const ctxI = document.getElementById("chart_current")?.getContext("2d");
    if (ctxI) {
      labState.sim.charts.i = new Chart(ctxI, {
        type: "line",
        data: {
          labels: [],
          datasets: [{ data: [], borderColor: "#00b4d8", borderWidth: 2, tension: 0.1, pointRadius: 0 }]
        },
        options: commonOptions
      });
    }

    // 3. Gráfica de Temperatura
    const ctxT = document.getElementById("chart_temp")?.getContext("2d");
    if (ctxT) {
      labState.sim.charts.temp = new Chart(ctxT, {
        type: "line",
        data: {
          labels: [],
          datasets: [{ data: [], borderColor: "#f77f00", borderWidth: 2, tension: 0.1, pointRadius: 0 }]
        },
        options: commonOptions
      });
    }

    // 4. Gráfica de SOC
    const ctxSoc = document.getElementById("chart_soc")?.getContext("2d");
    if (ctxSoc) {
      labState.sim.charts.soc = new Chart(ctxSoc, {
        type: "line",
        data: {
          labels: [],
          datasets: [{ data: [], borderColor: "#2ec4b6", borderWidth: 2, tension: 0.1, pointRadius: 0 }]
        },
        options: commonOptions
      });
    }
  }

  function resizeCharts() {
    Object.values(labState.sim.charts).forEach((chart) => {
      if (chart) chart.resize();
    });
  }

  function resetSimulationState() {
    labState.sim.running = false;
    labState.sim.simTimeS = 0;
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
    }

    const pack = labState.packCalculated;
    if (!pack) return;

    labState.sim.state = {
      timeS: 0,
      socPct: labState.design.socInitialPct,
      dodPct: 100 - labState.design.socInitialPct,
      vPack: pack.vNom,
      currentA: 0,
      powerW: 0,
      tempPackC: labState.design.tAmbC,
      tempCellMaxC: labState.design.tAmbC,
      tempCellMinC: labState.design.tAmbC,
      targetCurrentA: 0,
      tAmbC: labState.design.tAmbC,
      isolationOhmPerV: labState.faults.F_PACK_ISO ? 80 : 1000,
      bms: { contactorOpen: false, highestLevel: 0, action: "normal" }
    };

    labState.sim.history = { t: [], v: [], i: [], temp: [], soc: [] };
    updateCharts();
    updateSimTelemetryDOM();

    const btnPlay = document.getElementById("sim_btn_play");
    if (btnPlay) btnPlay.textContent = "▶ Iniciar";

    const runawayAlert = document.getElementById("runaway_alert_screen");
    if (runawayAlert) runawayAlert.classList.remove("active");
  }

  function toggleSimulation() {
    labState.sim.running = !labState.sim.running;
    const btnPlay = document.getElementById("sim_btn_play");
    if (btnPlay) {
      btnPlay.textContent = labState.sim.running ? "⏸ Pausar" : "▶ Reanudar";
    }

    if (labState.sim.running) {
      const intervalMs = Math.max(25, 200 / labState.sim.speedMult);
      animationTimer = setInterval(() => {
        stepSimulation();
      }, intervalMs);
    } else {
      if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
      }
    }
  }

  function stepSimulation() {
    if (!window.BatteryPhysics || !labState.packCalculated) return;

    const pack = labState.packCalculated;
    const dt = labState.sim.dt;
    const tCurrent = labState.sim.simTimeS;

    // Determinar corriente requerida según perfil de prueba
    let targetCurrent = 0;
    const cRate = labState.sim.cRate;
    const baseCurrent = cRate * pack.capAh;

    switch (labState.sim.profile) {
      case "cc":
        // Descarga a corriente constante
        targetCurrent = baseCurrent;
        break;
      case "cp":
        // Descarga a potencia constante
        targetCurrent = (pack.pAt1C_KW * 1000 * cRate) / Math.max(1, labState.sim.state.vPack);
        break;
      case "pulse":
        // Pulsos: 10s aceleración (2C), 10s reposo, 5s frenado (-0.5C)
        const cycleT = tCurrent % 30;
        if (cycleT < 10) targetCurrent = baseCurrent * 2;
        else if (cycleT < 20) targetCurrent = 0;
        else targetCurrent = -baseCurrent * 0.5; // regeneración
        break;
      case "cccv":
        // Carga CC-CV: carga a corriente constante hasta Vmax, luego reduce corriente
        if (labState.sim.state.vPack < pack.vMax * 0.99) {
          targetCurrent = -baseCurrent;
        } else {
          targetCurrent = -baseCurrent * Math.max(0.1, (pack.vMax - labState.sim.state.vPack) / (pack.vMax * 0.05));
        }
        break;
      case "drive":
        // Ciclo urbano sintético con variaciones dinámicas
        const wave = Math.sin(tCurrent / 10) + Math.cos(tCurrent / 25);
        targetCurrent = baseCurrent * (0.8 + 0.6 * wave);
        break;
    }

    labState.sim.state.targetCurrentA = targetCurrent;

    // Ejecutar paso de física
    const nextState = BatteryPhysics.simulateStep(
      labState.sim.state,
      pack,
      dt,
      labState.faults,
      labState.bypassRunaway
    );

    labState.sim.state = nextState;
    labState.sim.simTimeS += dt;

    // Procesar alertas y eventos BMS
    if (nextState.bms && nextState.bms.alarms.length > 0) {
      nextState.bms.alarms.forEach((alarm) => {
        logBmsEvent(alarm.level, `${alarm.desc} [${alarm.value} ${alarm.unit}]`);
      });
    }

    // Alerta de Fuga Térmica
    const runawayAlert = document.getElementById("runaway_alert_screen");
    if (runawayAlert) {
      runawayAlert.classList.toggle("active", Boolean(nextState.bms?.thermalRunawayActive));
    }

    // Almacenar en historial (hasta 120 puntos)
    const h = labState.sim.history;
    h.t.push(`${labState.sim.simTimeS}s`);
    h.v.push(nextState.vPack.toFixed(1));
    h.i.push(nextState.currentA.toFixed(1));
    h.temp.push(nextState.tempPackC.toFixed(1));
    h.soc.push(nextState.socPct.toFixed(1));

    if (h.t.length > 120) {
      h.t.shift();
      h.v.shift();
      h.i.shift();
      h.temp.shift();
      h.soc.shift();
    }

    updateCharts();
    updateSimTelemetryDOM();

    // Detener si los contactores se abren o el pack se vacía totalmente
    if (nextState.bms.contactorOpen || nextState.socPct <= 0) {
      if (labState.sim.running) {
        toggleSimulation();
      }
    }
  }

  function updateCharts() {
    const h = labState.sim.history;
    const charts = labState.sim.charts;

    if (charts.v) {
      charts.v.data.labels = h.t;
      charts.v.data.datasets[0].data = h.v;
      charts.v.update();
    }
    if (charts.i) {
      charts.i.data.labels = h.t;
      charts.i.data.datasets[0].data = h.i;
      charts.i.update();
    }
    if (charts.temp) {
      charts.temp.data.labels = h.t;
      charts.temp.data.datasets[0].data = h.temp;
      charts.temp.update();
    }
    if (charts.soc) {
      charts.soc.data.labels = h.t;
      charts.soc.data.datasets[0].data = h.soc;
      charts.soc.update();
    }
  }

  function updateSimTelemetryDOM() {
    const s = labState.sim.state;
    if (!s) return;

    setTxtSafe("telem_time", `${s.timeS || 0} s`);
    setTxtSafe("telem_v", `${s.vPack.toFixed(1)} V`);
    setTxtSafe("telem_i", `${s.currentA.toFixed(1)} A`);
    setTxtSafe("telem_p", `${(s.powerW / 1000).toFixed(1)} kW`);
    setTxtSafe("telem_t", `${s.tempPackC.toFixed(1)} °C`);
    setTxtSafe("telem_soc", `${s.socPct.toFixed(1)} %`);

    // Actualizar badge de acción del BMS
    const bmsBadge = document.getElementById("bms_status_badge");
    if (bmsBadge && s.bms) {
      bmsBadge.className = `bms-status-badge ${s.bms.action}`;
      bmsBadge.textContent = s.bms.action.replace("_", " ");
    }
  }

  // ---------------------------------------------------------------------------
  // Pestaña 4: Inyección de Fallas & Consola BMS
  // ---------------------------------------------------------------------------
  function bindFaultsControls() {
    const bypassCheck = document.getElementById("bypass_runaway_toggle");
    if (bypassCheck) {
      bypassCheck.addEventListener("change", () => {
        labState.bypassRunaway = bypassCheck.checked;
        if (window.sounds) sounds.playClick();
      });
    }

    const btnClearLogs = document.getElementById("btn_clear_bms_logs");
    if (btnClearLogs) {
      btnClearLogs.addEventListener("click", () => {
        labState.bmsLogs = [];
        renderBmsLogs();
        if (window.sounds) sounds.playClick();
      });
    }
  }

  function renderFaultsCatalog() {
    const container = document.getElementById("fault_groups_container");
    if (!container || !window.BatteryData) return;

    container.innerHTML = "";
    BatteryData.FAULT_GROUPS.forEach((grp) => {
      const card = document.createElement("div");
      card.className = "fault-group-card";
      const grpTitle = pickLabel(grp);
      card.innerHTML = `<div class="fault-group-title">${grpTitle}</div>`;

      // Fallas de este grupo
      Object.keys(BatteryData.FAULTS).forEach((k) => {
        const fault = BatteryData.FAULTS[k];
        if (fault.group !== grp.id) return;

        const isChecked = Boolean(labState.faults[fault.id]);
        const item = document.createElement("div");
        item.className = `fault-item ${isChecked ? "active" : ""}`;
        item.innerHTML = `
          <div class="fault-item-header">
            <span class="fault-label">${pickLabel(fault)}</span>
            <input type="checkbox" data-fault-id="${fault.id}" ${isChecked ? "checked" : ""}>
          </div>
          <span class="fault-effect-desc">${fault.effectEs}</span>
        `;

        const check = item.querySelector("input[type=checkbox]");
        check.addEventListener("change", () => {
          if (check.checked) {
            labState.faults[fault.id] = { active: true, magnitude: fault.magDefault || 1 };
            logBmsEvent(2, `Falla inyectada: ${fault.labelEs}`);
          } else {
            delete labState.faults[fault.id];
            logBmsEvent(1, `Falla retirada: ${fault.labelEs}`);
          }
          item.classList.toggle("active", check.checked);
          renderPackSvg();
          if (window.sounds) sounds.playClick();
        });

        card.appendChild(item);
      });

      container.appendChild(card);
    });
  }

  function logBmsEvent(level, msg) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, level, msg };
    labState.bmsLogs.unshift(entry);
    if (labState.bmsLogs.length > 50) labState.bmsLogs.pop();
    renderBmsLogs();
  }

  function renderBmsLogs() {
    const logBox = document.getElementById("bms_log_terminal");
    if (!logBox) return;

    if (labState.bmsLogs.length === 0) {
      logBox.innerHTML = '<div style="color: var(--text-dim);">No hay eventos de alarma registrados. BMS en estado nominal.</div>';
      return;
    }

    logBox.innerHTML = labState.bmsLogs.map((e) => `
      <div class="bms-log-entry">
        <span class="log-time">[${e.timestamp}]</span>
        <span class="log-level ${BatteryData?.LEVEL_CLASS[e.level] || 'alerta'}">NIVEL ${e.level}</span>
        <span class="log-msg">${e.msg}</span>
      </div>
    `).join("");
  }

  // ---------------------------------------------------------------------------
  // Pestaña 5: Comparador de Diseños y Exportación CSV
  // ---------------------------------------------------------------------------
  function bindResultsControls() {
    const btnSaveDesign = document.getElementById("btn_save_design_comparison");
    const btnExportCsv = document.getElementById("btn_export_csv");

    if (btnSaveDesign) {
      btnSaveDesign.addEventListener("click", () => {
        saveCurrentDesignToComparison();
        if (window.sounds) sounds.playClick();
      });
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener("click", () => {
        exportSimulationCsv();
        if (window.sounds) sounds.playClick();
      });
    }
  }

  function saveCurrentDesignToComparison() {
    if (!labState.packCalculated) return;
    if (labState.savedDesigns.length >= 4) {
      labState.savedDesigns.shift(); // máximo 4
    }

    const designSnapshot = {
      name: `${labState.design.appId.toUpperCase()} (${labState.design.chemId})`,
      chem: labState.design.chemId,
      config: `${labState.packCalculated.ns}S ${labState.packCalculated.np}P`,
      cells: labState.packCalculated.totalCells,
      energy: `${labState.packCalculated.eRealKWh.toFixed(1)} kWh`,
      mass: `${labState.packCalculated.massPackKg.toFixed(1)} kg`,
      density: `${labState.packCalculated.densityWhKg.toFixed(0)} Wh/kg`,
      cost: `$${Math.round(labState.packCalculated.costTotal).toLocaleString()}`,
      rint: `${(labState.packCalculated.rintPack * 1000).toFixed(2)} mΩ`
    };

    labState.savedDesigns.push(designSnapshot);
    renderComparatorTable();
  }

  function renderComparatorTable() {
    const tbody = document.getElementById("comparator_tbody");
    if (!tbody) return;

    if (labState.savedDesigns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">Guarda tu diseño actual para compararlo aquí (hasta 4 diseños).</td></tr>`;
      return;
    }

    tbody.innerHTML = labState.savedDesigns.map((d) => `
      <tr>
        <td style="font-weight: 700; color: var(--accent-cyan);">${d.name}</td>
        <td>${d.chem}</td>
        <td style="font-family: monospace;">${d.config}</td>
        <td>${d.cells}</td>
        <td style="font-weight: 600;">${d.energy}</td>
        <td>${d.mass}</td>
        <td>${d.density}</td>
        <td>${d.cost}</td>
        <td style="font-family: monospace;">${d.rint}</td>
      </tr>
    `).join("");
  }

  function exportSimulationCsv() {
    const h = labState.sim.history;
    if (!h.t || h.t.length === 0) {
      alert("No hay datos de simulación para exportar. Inicia una corrida primero.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Tiempo (s),Tension (V),Corriente (A),Temperatura (C),SOC (%)\n";
    for (let i = 0; i < h.t.length; i++) {
      const timeVal = h.t[i].replace("s", "");
      csvContent += `${timeVal},${h.v[i]},${h.i[i]},${h.temp[i]},${h.soc[i]}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `battery_simulation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ---------------------------------------------------------------------------
  // Modal de Tutorial y Guía Rápida
  // ---------------------------------------------------------------------------
  function bindTutorialModal() {
    const modal = document.getElementById("battery_tutorial_modal");
    const btnOpen = document.getElementById("btn_battery_tutorial");
    const btnClose = document.getElementById("battery_tutorial_close");
    const btnApplyExample = document.getElementById("btn_apply_tutorial_example");

    if (btnOpen && modal) {
      btnOpen.addEventListener("click", () => {
        modal.classList.add("active");
        if (window.sounds) sounds.playClick();
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener("click", () => {
        modal.classList.remove("active");
        if (window.sounds) sounds.playClick();
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    }

    // Navegación entre paneles del tutorial
    const tutNavBtns = document.querySelectorAll(".tut-nav-btn");
    tutNavBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tutNavBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tut-target");
        document.querySelectorAll(".tut-pane").forEach((pane) => {
          pane.style.display = (pane.id === targetId) ? "block" : "none";
        });
        if (window.sounds) sounds.playClick();
      });
    });

    // Carga automática del ejemplo didáctico (Caso V1 BEV 40 kWh)
    if (btnApplyExample) {
      btnApplyExample.addEventListener("click", () => {
        labState.design.appId = "urbano";
        labState.design.chemId = "LFP";
        labState.design.cellId = "PRISM_LFP_100";
        labState.design.coolingId = "liquid";
        labState.design.eTargetKWh = 40;
        labState.design.vBusV = 400;
        labState.design.pPeakKW = 100;
        labState.design.pContKW = 50;
        labState.design.socInitialPct = 90;
        labState.design.tAmbC = 25;

        syncDesignInputsToDOM();
        recalculateDesign();
        switchTab("design");
        if (modal) modal.classList.remove("active");
        if (window.sounds) sounds.playSuccess();
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Exposición Global del Módulo
  // ---------------------------------------------------------------------------
  window.BatteryLab = {
    init: initBatteryLab,
    switchTab,
    recalculateDesign,
    pause: () => {
      labState.sim.running = false;
      if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
      }
    },
    reset: resetSimulationState
  };

  document.addEventListener("DOMContentLoaded", initBatteryLab);
})();
