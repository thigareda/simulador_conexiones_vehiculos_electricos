/**
 * Controlador principal de la Aplicación Web de Electromovilidad
 */
document.addEventListener("DOMContentLoaded", () => {
  const simulator = new WiringSimulator("sim_canvas_container", {
    onStatusChange: handleStatusChange,
    onInfoClick: showDeviceModal
  });

  // Referencias DOM
  const views = {
    home: document.getElementById("view_home"),
    bevMenu: document.getElementById("view_bev_menu"),
    hevMenu: document.getElementById("view_hev_menu"),
    simulator: document.getElementById("view_simulator"),
    notes: document.getElementById("view_notes"),
    autonomy: document.getElementById("view_autonomy"),
    batteryLab: document.getElementById("view_battery_lab")
  };

  const navHomeBtn = document.getElementById("nav_home");
  const navBevBtn = document.getElementById("nav_bev");
  const navBatteryLabBtn = document.getElementById("nav_battery_lab");
  const navHevBtn = document.getElementById("nav_hev");
  const navNotesBtn = document.getElementById("nav_notes");
  const navBackBtn = document.getElementById("nav_back");

  const statusBar = document.getElementById("sim_status_bar");
  const statusText = document.getElementById("sim_status_text");
  const validationReport = document.getElementById("validation_report");

  let currentView = "home";
  let previousView = "home";
  let lastNonNotesView = "home";

  function switchView(viewName) {
    if (currentView === "autonomy" && viewName !== "autonomy" && window.AutonomyLab) {
      window.AutonomyLab.pause();
    }
    if (currentView === "batteryLab" && viewName !== "batteryLab" && window.BatteryLab) {
      window.BatteryLab.pause();
    }
    if (viewName === "notes" && currentView !== "notes") {
      lastNonNotesView = currentView;
    }
    previousView = currentView;
    currentView = viewName;

    Object.keys(views).forEach(k => {
      if (views[k]) {
        views[k].classList.remove("active");
      }
    });

    if (views[viewName]) {
      views[viewName].classList.add("active");
    }

    // Actualizar botones del navbar
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    if (viewName === "home" && navHomeBtn) navHomeBtn.classList.add("active");
    if ((viewName === "bevMenu" || viewName === "autonomy") && navBevBtn) navBevBtn.classList.add("active");
    if (viewName === "batteryLab" && navBatteryLabBtn) navBatteryLabBtn.classList.add("active");
    if (viewName === "hevMenu" && navHevBtn) navHevBtn.classList.add("active");
    if (viewName === "notes" && navNotesBtn) navNotesBtn.classList.add("active");

    if (viewName === "simulator") {
      navBackBtn.style.display = "inline-flex";
    } else {
      navBackBtn.style.display = (viewName === "home") ? "none" : "inline-flex";
    }

    sounds.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const t = (key, ...args) => (window.I18N ? window.I18N.t(key, ...args) : key);

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Fallback seguro de imágenes sin atributos inline onerror (compatible con CSP estricta)
  document.querySelectorAll("img[data-fallback-src]").forEach(img => {
    img.addEventListener("error", function onImgErr() {
      const fb = img.getAttribute("data-fallback-src");
      if (fb && img.getAttribute("src") !== fb) {
        img.setAttribute("src", fb);
      }
      img.removeEventListener("error", onImgErr);
    });
  });

  function updateSimulatorHeaderAndCables(moduleKey) {
    const cfg = SIMULATOR_DATA[moduleKey];
    if (!cfg) return;
    const modText = window.I18N ? window.I18N.getModuleText(moduleKey, cfg) : cfg;
    document.getElementById("sim_module_title").textContent = modText.title;
    document.getElementById("sim_module_subtitle").textContent = modText.subtitle;
    document.getElementById("sim_module_desc").textContent = modText.description;
    renderCablesList(cfg.cableTypes, moduleKey);
  }

  function openModule(moduleKey) {
    simulator.loadModule(moduleKey);

    // Actualizar textos del header del simulador y lista de cables
    updateSimulatorHeaderAndCables(moduleKey);

    // Limpiar reporte de validación anterior
    validationReport.innerHTML = "";
    handleStatusChange({ state: "ready", message: t("sim_status_ready_module") });

    switchView("simulator");
  }

  function renderCablesList(cables, moduleKey) {
    const listContainer = document.getElementById("cables_list");
    listContainer.innerHTML = "";

    const activeCableId = simulator.selectedCable ? simulator.selectedCable.id : (cables[0] && cables[0].id);

    cables.forEach((c) => {
      const cText = window.I18N ? window.I18N.getCableText(moduleKey, c.id, c) : c;
      const btn = document.createElement("button");
      btn.className = `cable-select-btn ${!simulator.isDeleteMode && c.id === activeCableId ? "active" : ""}`;
      btn.setAttribute("data-cable-id", c.id);

      const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(c.color) ? c.color : "#1d2a3a";
      btn.innerHTML = `
        <div class="cable-sample-line" style="background-color: ${safeColor};"></div>
        <div class="cable-info">
          <span class="cable-name">${escapeHtml(cText.name)}</span>
          <span class="cable-desc">${escapeHtml(cText.desc)}</span>
        </div>
      `;

      btn.addEventListener("click", () => {
        sounds.playClick();
        simulator.setCableType(c.id);
      });

      listContainer.appendChild(btn);
    });
  }

  function handleStatusChange(status) {
    statusBar.className = `status-bar status-${status.state}`;
    statusText.textContent = status.message;

    if (status.details && status.details.errors && status.details.errors.length > 0) {
      validationReport.innerHTML = `
        <div class="report-list">
          ${status.details.errors.map(err => `<div class="report-item err">• ${escapeHtml(err)}</div>`).join("")}
        </div>
      `;
    } else if (status.state === "success") {
      validationReport.innerHTML = `
        <div class="report-list">
          <div class="report-item" style="background: rgba(46,196,182,0.15); color: #2ec4b6;">
            ${escapeHtml(t("sim_status_success_detail"))}
          </div>
        </div>
      `;
    } else {
      validationReport.innerHTML = "";
    }
  }

  function showDeviceModal(device) {
    sounds.playClick();
    const modal = document.getElementById("device_modal");
    const modKey = simulator.moduleKey;
    const dText = window.I18N ? window.I18N.getDeviceText(modKey, device.id, device) : device;

    document.getElementById("modal_title").textContent = dText.name;
    document.getElementById("modal_desc").textContent = dText.desc || t("modal_default_desc");

    const img = document.getElementById("modal_img");
    if (device.image) {
      img.src = device.image;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }

    const terminalsContainer = document.getElementById("modal_terminals");
    if (device.terminals && device.terminals.length > 0) {
      terminalsContainer.innerHTML = `
        <div class="modal-terminals-title">${escapeHtml(t("modal_terminals_title"))}</div>
        ${device.terminals.map(term => {
          const tText = window.I18N ? window.I18N.getTerminalText(modKey, device.id, term.id, term) : term;
          return `
          <div class="terminal-item">
            <span><strong>${escapeHtml(tText.label || tText.name)}:</strong> ${escapeHtml(tText.name)}</span>
            <span style="color: var(--accent-cyan);">PIN ${escapeHtml(term.id)}</span>
          </div>
        `;
        }).join("")}
      `;
    } else {
      terminalsContainer.innerHTML = "";
    }

    modal.classList.add("active");
  }

  function goBackFromNotes() {
    const target = (lastNonNotesView && lastNonNotesView !== "notes" && views[lastNonNotesView])
      ? lastNonNotesView
      : "home";
    switchView(target);
  }

  function initNotesView() {
    const notesContent = document.getElementById("notes_content");
    const notesToc = document.getElementById("notes_toc");
    if (!notesContent || !notesToc) return;

    if (window.NotesRenderer && typeof window.NotesRenderer.renderInto === "function") {
      window.NotesRenderer.renderInto(notesContent, notesToc, window.LEARNING_NOTES_MD);
    } else {
      notesContent.innerHTML = '<div class="notes-fallback">No se pudo inicializar el visor de anotaciones de aprendizaje.</div>';
      notesToc.innerHTML = '<p class="notes-toc-empty">Índice no disponible.</p>';
    }

    notesToc.addEventListener("click", (e) => {
      if (e.target && e.target.closest && e.target.closest("a[data-note-target]")) {
        sounds.playClick();
      }
    });
  }

  // Event Listeners de Botones de Navegación
  if (navHomeBtn) navHomeBtn.addEventListener("click", () => switchView("home"));
  if (navBevBtn) navBevBtn.addEventListener("click", () => switchView("bevMenu"));
  if (navBatteryLabBtn) navBatteryLabBtn.addEventListener("click", () => switchView("batteryLab"));
  if (navHevBtn) navHevBtn.addEventListener("click", () => switchView("hevMenu"));
  if (navNotesBtn) navNotesBtn.addEventListener("click", () => switchView("notes"));

  if (navBackBtn) {
    navBackBtn.addEventListener("click", () => {
      if (currentView === "notes") {
        goBackFromNotes();
      } else if (currentView === "autonomy" || currentView === "batteryLab") {
        switchView("bevMenu");
      } else if (currentView === "simulator") {
        if (simulator.moduleKey && simulator.moduleKey.startsWith("bev")) {
          switchView("bevMenu");
        } else {
          switchView("hevMenu");
        }
      } else {
        switchView("home");
      }
    });
  }

  // Tarjetas del Menú Home
  document.getElementById("card_goto_bev")?.addEventListener("click", () => switchView("bevMenu"));
  document.getElementById("card_goto_battery_lab")?.addEventListener("click", () => switchView("batteryLab"));
  document.getElementById("card_goto_hev")?.addEventListener("click", () => switchView("hevMenu"));
  document.getElementById("card_goto_notes")?.addEventListener("click", () => switchView("notes"));

  // Controles del Laboratorio de Baterías
  document.getElementById("btn_battery_back")?.addEventListener("click", () => switchView("bevMenu"));

  // Controles de la vista de Anotaciones
  document.getElementById("btn_notes_back")?.addEventListener("click", goBackFromNotes);
  document.getElementById("btn_notes_back_bottom")?.addEventListener("click", goBackFromNotes);
  document.getElementById("btn_notes_top")?.addEventListener("click", () => {
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn_notes_top_bottom")?.addEventListener("click", () => {
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Tarjetas del Menú BEV
  document.getElementById("card_bev_wiring")?.addEventListener("click", () => openModule("bevWiring"));
  document.getElementById("card_bev_principles")?.addEventListener("click", () => openModule("bevPrinciples"));
  document.getElementById("card_bev_autonomy")?.addEventListener("click", () => switchView("autonomy"));
  document.getElementById("card_bev_battery_lab")?.addEventListener("click", () => switchView("batteryLab"));
  document.getElementById("btn_bev_back_home")?.addEventListener("click", () => switchView("home"));

  // Tarjetas del Menú HEV
  document.getElementById("card_hev_series")?.addEventListener("click", () => openModule("hybridSeries"));
  document.getElementById("card_hev_parallel")?.addEventListener("click", () => openModule("hybridParallel"));
  document.getElementById("card_hev_combined")?.addEventListener("click", () => openModule("hybridCombined"));
  document.getElementById("btn_hev_back_home")?.addEventListener("click", () => switchView("home"));

  // Botones de Acción del Simulador
  document.getElementById("btn_run_check")?.addEventListener("click", () => simulator.validate());
  document.getElementById("btn_undo")?.addEventListener("click", () => simulator.undo());
  document.getElementById("btn_clear")?.addEventListener("click", () => simulator.clear());
  document.getElementById("btn_solution")?.addEventListener("click", () => simulator.toggleSolution());

  const deleteModeBtn = document.getElementById("btn_delete_mode");
  if (deleteModeBtn) {
    deleteModeBtn.addEventListener("click", () => {
      sounds.playClick();
      simulator.setDeleteMode(!simulator.isDeleteMode);
    });
  }

  // Cerrar Modal
  document.getElementById("modal_close")?.addEventListener("click", () => {
    document.getElementById("device_modal").classList.remove("active");
  });
  document.getElementById("device_modal")?.addEventListener("click", (e) => {
    if (e.target.id === "device_modal") {
      document.getElementById("device_modal").classList.remove("active");
    }
  });

  // Atajos de teclado: Ctrl+Z para deshacer, Esc para cerrar modal/deseleccionar
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      if (currentView === "simulator") {
        e.preventDefault();
        simulator.undo();
      }
    }
    if (e.key === "Escape") {
      document.getElementById("device_modal")?.classList.remove("active");
      if (currentView === "simulator" && simulator.selectedPin) {
        simulator.highlightPin(simulator.selectedPin, false);
        simulator.selectedPin = null;
        handleStatusChange({ state: "ready", message: t("sim_status_cancel_esc") });
      }
    }
  });

  // Selector de idioma (ES / 廣東話)
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (window.I18N && lang) {
        sounds.playClick();
        window.I18N.setLang(lang);
      }
    });
  });

  window.addEventListener("sim:langchange", () => {
    if (simulator.moduleKey) {
      updateSimulatorHeaderAndCables(simulator.moduleKey);
      simulator.renderDevices();
      if (simulator.lastValidation) {
        simulator.validate();
      } else {
        simulator.renderLines();
      }
    }
  });

  // Aplicar idioma inicial, inicializar visor de anotaciones e iniciar en portada
  if (window.I18N) {
    window.I18N.applyTranslations();
  }
  initNotesView();
  switchView("home");
});
