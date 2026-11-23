/**
 * Motor interactivo del Simulador de Cableado de Electromovilidad
 */
class WiringSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.config = null;
    this.lines = []; // Líneas conectadas por el usuario: { from, to, color, type, id }
    this.history = []; // Pila de historial para Deshacer
    this.selectedPin = null; // Primer terminal seleccionado
    this.selectedCable = null; // Cable activo del catálogo
    this.isDeleteMode = false;
    this.isShowingSolution = false;
    this.lastValidation = null;

    this.onStatusChange = options.onStatusChange || (() => {});
    this.onInfoClick = options.onInfoClick || (() => {});
  }

  loadModule(moduleKey) {
    this.moduleKey = moduleKey;
    this.config = SIMULATOR_DATA[moduleKey];
    this.lines = [];
    this.history = [];
    this.selectedPin = null;
    this.isDeleteMode = false;
    this.isShowingSolution = false;
    this.lastValidation = null;

    if (!this.config) {
      console.error(`Módulo ${moduleKey} no encontrado`);
      return;
    }

    // Seleccionar por defecto el primer cable
    this.selectedCable = this.config.cableTypes[0];
    this.render();
  }

  setCableType(cableId) {
    const cable = this.config.cableTypes.find(c => c.id === cableId);
    if (cable) {
      this.selectedCable = cable;
      this.isDeleteMode = false;
      this.updateControlsUI();
    }
  }

  setDeleteMode(enable) {
    this.isDeleteMode = enable;
    if (enable) {
      this.selectedPin = null;
    }
    this.updateControlsUI();
    this.renderLines();
  }

  t(key, ...args) {
    return window.I18N ? window.I18N.t(key, ...args) : key;
  }

  undo() {
    if (this.history.length === 0) return;
    const lastAction = this.history.pop();
    if (lastAction.action === "add") {
      this.lines = this.lines.filter(l => l.id !== lastAction.line.id);
      sounds.playDisconnect();
    } else if (lastAction.action === "remove") {
      this.lines.push(lastAction.line);
      sounds.playConnect();
    }
    this.lastValidation = null;
    this.renderLines();
    this.onStatusChange({ state: "ready", message: this.t("sim_status_undo") });
  }

  clear() {
    if (this.lines.length === 0) return;
    this.lines = [];
    this.history = [];
    this.selectedPin = null;
    this.lastValidation = null;
    sounds.playDisconnect();
    this.renderLines();
    this.onStatusChange({ state: "ready", message: this.t("sim_status_cleared") });
  }

  toggleSolution() {
    this.isShowingSolution = !this.isShowingSolution;
    this.renderLines();
    if (this.isShowingSolution) {
      this.onStatusChange({ state: "info", message: this.t("sim_status_solution_on") });
    } else {
      this.onStatusChange({ state: "ready", message: this.t("sim_status_solution_off") });
    }
  }

  validate() {
    const answers = this.config.answers;
    const userLines = this.lines;

    if (userLines.length === 0) {
      sounds.playError();
      const res = {
        success: false,
        totalAnswers: answers.length,
        userTotal: 0,
        correctCount: 0,
        missingCount: answers.length,
        errors: [this.t("sim_status_no_cables_err")]
      };
      this.lastValidation = res;
      this.renderLines();
      this.onStatusChange({ state: "error", message: this.t("sim_status_no_cables_msg"), details: res });
      return res;
    }

    let correctCount = 0;
    const errors = [];
    const matchedAnswers = new Set();

    // Comprobar cada cable del usuario
    userLines.forEach(uLine => {
      // Buscar en answers si existe un match sin importar el orden de terminales (A->B o B->A)
      const matchedIdx = answers.findIndex((ans, idx) => {
        if (matchedAnswers.has(idx)) return false;
        const matchesTerminals = (uLine.from === ans.from && uLine.to === ans.to) ||
                                 (uLine.from === ans.to && uLine.to === ans.from);
        return matchesTerminals;
      });

      if (matchedIdx === -1) {
        errors.push(this.t("sim_err_wrong_conn", this.getTerminalName(uLine.from), this.getTerminalName(uLine.to)));
      } else {
        const expected = answers[matchedIdx];
        // Comprobar tipo o color
        const typeMatch = uLine.type === expected.type;
        const colorMatch = uLine.color.toLowerCase() === expected.color.toLowerCase();

        if (!typeMatch || !colorMatch) {
          errors.push(this.t("sim_err_wrong_type", this.getTerminalName(uLine.from), this.getTerminalName(uLine.to)));
        } else {
          matchedAnswers.add(matchedIdx);
          correctCount++;
        }
      }
    });

    const missingCount = answers.length - matchedAnswers.size;
    if (missingCount > 0) {
      errors.push(this.t("sim_err_missing", missingCount));
    }

    const success = (correctCount === answers.length && userLines.length === answers.length);

    const result = {
      success,
      totalAnswers: answers.length,
      userTotal: userLines.length,
      correctCount,
      missingCount,
      errors
    };

    this.lastValidation = result;
    this.renderLines();

    if (success) {
      sounds.playSuccess();
      this.onStatusChange({
        state: "success",
        message: this.t("sim_status_success"),
        details: result
      });
    } else {
      sounds.playError();
      this.onStatusChange({
        state: "error",
        message: this.t("sim_status_fail", correctCount, answers.length),
        details: result
      });
    }

    return result;
  }

  getTerminalName(pinId) {
    for (const dev of this.config.devices) {
      const pin = dev.terminals.find(t => t.id === pinId);
      if (pin) {
        const dText = window.I18N ? window.I18N.getDeviceText(this.moduleKey, dev.id, dev) : dev;
        const tText = window.I18N ? window.I18N.getTerminalText(this.moduleKey, dev.id, pin.id, pin) : pin;
        return `${dText.name} [${tText.name || tText.label}]`;
      }
    }
    return pinId;
  }

  getTerminalPosition(pinId) {
    for (const dev of this.config.devices) {
      const pin = dev.terminals.find(t => t.id === pinId);
      if (pin) {
        return {
          x: dev.x + pin.relX,
          y: dev.y + pin.relY,
          device: dev,
          pin
        };
      }
    }
    return null;
  }

  onPinClick(pinId) {
    sounds.playClick();
    if (this.isDeleteMode) {
      // Eliminar cables asociados a este terminal
      const toRemove = this.lines.filter(l => l.from === pinId || l.to === pinId);
      if (toRemove.length > 0) {
        toRemove.forEach(l => {
          this.history.push({ action: "remove", line: l });
        });
        this.lines = this.lines.filter(l => l.from !== pinId && l.to !== pinId);
        sounds.playDisconnect();
        this.lastValidation = null;
        this.renderLines();
        this.onStatusChange({ state: "ready", message: this.t("sim_status_removed_pin", this.getTerminalName(pinId)) });
      }
      return;
    }

    if (!this.selectedPin) {
      this.selectedPin = pinId;
      this.highlightPin(pinId, true);
      this.onStatusChange({ state: "ready", message: this.t("sim_status_start_pin", this.getTerminalName(pinId)) });
    } else {
      if (this.selectedPin === pinId) {
        // Deseleccionar el mismo punto
        this.highlightPin(this.selectedPin, false);
        this.selectedPin = null;
        this.onStatusChange({ state: "ready", message: this.t("sim_status_cancel_pin") });
        return;
      }

      // Crear cable entre selectedPin y pinId
      const p1 = this.selectedPin;
      const p2 = pinId;
      this.highlightPin(this.selectedPin, false);
      this.selectedPin = null;

      // Verificar si ya existe este cable
      const exists = this.lines.some(l => (l.from === p1 && l.to === p2) || (l.from === p2 && l.to === p1));
      if (exists) {
        this.onStatusChange({ state: "warning", message: this.t("sim_status_exists") });
        return;
      }

      const newLine = {
        id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        from: p1,
        to: p2,
        color: this.selectedCable ? this.selectedCable.color : "#e63946",
        type: this.selectedCable ? this.selectedCable.type : "Line",
        lineWidth: this.selectedCable ? this.selectedCable.lineWidth : 4
      };

      this.lines.push(newLine);
      this.history.push({ action: "add", line: newLine });
      this.lastValidation = null;
      sounds.playConnect();
      this.renderLines();
      this.onStatusChange({ state: "ready", message: this.t("sim_status_connected", this.getTerminalName(p1), this.getTerminalName(p2)) });
    }
  }

  highlightPin(pinId, active) {
    const el = document.getElementById(`pin_circle_${pinId}`);
    if (el) {
      if (active) {
        el.classList.add("pin-active");
      } else {
        el.classList.remove("pin-active");
      }
    }
  }

  render() {
    const w = this.config.canvasWidth;
    const h = this.config.canvasHeight;

    this.container.innerHTML = `
      <div class="sim-wrapper">
        <div class="sim-canvas-container" id="canvas_box">
          <svg id="sim_svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- Marcadores de Flechas para Conexiones de Señal y Potencia -->
              <marker id="arrow_right" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d2a3a" />
              </marker>
              <marker id="arrow_left" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 10 1 L 0 5 L 10 9 z" fill="#1d2a3a" />
              </marker>
              <marker id="arrow_right_green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#2ec4b6" />
              </marker>
              <marker id="arrow_left_green" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 10 1 L 0 5 L 10 9 z" fill="#2ec4b6" />
              </marker>
              <!-- Filtro de sombra elegante -->
              <filter id="box_shadow" x="-5%" y="-5%" width="115%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="transparent" />
            <g id="layer_grid"></g>
            <g id="layer_cables"></g>
            <g id="layer_devices"></g>
            <g id="layer_pins"></g>
          </svg>
        </div>
      </div>
    `;

    this.renderDevices();
    this.renderLines();
  }

  renderDevices() {
    const devicesLayer = document.getElementById("layer_devices");
    const pinsLayer = document.getElementById("layer_pins");
    devicesLayer.innerHTML = "";
    pinsLayer.innerHTML = "";

    this.config.devices.forEach(dev => {
      // Grupo de dispositivo
      const gDev = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gDev.setAttribute("class", "device-group");
      gDev.setAttribute("transform", `translate(${dev.x}, ${dev.y})`);

      // Rectángulo de fondo
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", dev.width);
      rect.setAttribute("height", dev.height);
      rect.setAttribute("rx", "8");
      rect.setAttribute("class", "device-rect");
      rect.setAttribute("filter", "url(#box_shadow)");
      gDev.appendChild(rect);

      // Si tiene imagen, colocarla
      if (dev.image) {
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("href", dev.image);
        img.setAttribute("x", "5");
        img.setAttribute("y", "5");
        img.setAttribute("width", dev.width - 10);
        img.setAttribute("height", dev.height - 10);
        img.setAttribute("preserveAspectRatio", "xMidYMid meet");
        gDev.appendChild(img);
      }

      // Etiqueta del dispositivo
      const dText = window.I18N ? window.I18N.getDeviceText(this.moduleKey, dev.id, dev) : dev;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", dev.width / 2);
      text.setAttribute("y", dev.image ? dev.height + 18 : dev.height / 2 + 5);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "device-title");
      text.textContent = dText.name;
      gDev.appendChild(text);

      // Botón o clic de información técnica
      gDev.addEventListener("click", (e) => {
        // Si no hizo clic en un pin
        if (!e.target.classList.contains("pin-circle")) {
          this.onInfoClick(dev);
        }
      });

      devicesLayer.appendChild(gDev);

      // Renderizar terminales (pins)
      dev.terminals.forEach(pin => {
        const pinX = dev.x + pin.relX;
        const pinY = dev.y + pin.relY;

        const gPin = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gPin.setAttribute("class", "pin-group");
        gPin.setAttribute("transform", `translate(${pinX}, ${pinY})`);

        // Círculo interactivo externo (área de clic amplia)
        const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        hit.setAttribute("r", "16");
        hit.setAttribute("fill", "transparent");
        hit.setAttribute("class", "pin-hit-area");
        gPin.appendChild(hit);

        // Círculo visual
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", "8");
        circle.setAttribute("class", "pin-circle");
        circle.setAttribute("id", `pin_circle_${pin.id}`);
        gPin.appendChild(circle);

        // Texto o etiqueta del terminal
        const tText = window.I18N ? window.I18N.getTerminalText(this.moduleKey, dev.id, pin.id, pin) : pin;
        if (tText.label) {
          const pText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          pText.setAttribute("class", "pin-label");
          // Posición según ubicación relativa
          const offsetX = pin.relX === 0 ? -12 : (pin.relX >= dev.width ? 12 : 0);
          const offsetY = pin.relY === 0 ? -12 : (pin.relY >= dev.height ? 16 : -10);
          pText.setAttribute("x", offsetX);
          pText.setAttribute("y", offsetY);
          pText.setAttribute("text-anchor", offsetX < 0 ? "end" : (offsetX > 0 ? "start" : "middle"));
          pText.textContent = tText.label;
          gPin.appendChild(pText);
        }

        gPin.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onPinClick(pin.id);
        });

        pinsLayer.appendChild(gPin);
      });
    });
  }

  renderLines() {
    const cablesLayer = document.getElementById("layer_cables");
    if (!cablesLayer) return;
    cablesLayer.innerHTML = "";

    const linesToDraw = this.isShowingSolution ? this.config.answers : this.lines;

    linesToDraw.forEach((line, index) => {
      const p1 = this.getTerminalPosition(line.from);
      const p2 = this.getTerminalPosition(line.to);
      if (!p1 || !p2) return;

      const pathData = this.calculateOrthogonalPath(p1, p2);
      const isCorrect = this.isShowingSolution || (this.lastValidation && this.isLineCorrect(line));
      const isFailed = !this.isShowingSolution && this.lastValidation && !this.isLineCorrect(line);

      const gLine = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gLine.setAttribute("class", `cable-group ${this.isDeleteMode ? 'delete-target' : ''}`);

      let strokeColor = line.color;
      if (this.lastValidation && !this.isShowingSolution) {
        strokeColor = isCorrect ? "#2ec4b6" : "#e63946";
      }

      if (line.type === "DLine") {
        // Doble línea mecánica
        const pA = this.createPath(pathData, strokeColor, 5, "round", 4);
        const pB = this.createPath(pathData, "#ffffff", 2, "round", 0);
        gLine.appendChild(pA);
        gLine.appendChild(pB);
      } else {
        // Línea normal o con flechas
        const p = this.createPath(pathData, strokeColor, line.lineWidth || 4, "round");
        
        // Flechas según tipo
        if (line.type === "RSArrow" || line.type === "RDArrow") {
          p.setAttribute("marker-end", isCorrect ? "url(#arrow_right_green)" : "url(#arrow_right)");
        } else if (line.type === "LSArrow" || line.type === "LDArrow") {
          p.setAttribute("marker-start", isCorrect ? "url(#arrow_left_green)" : "url(#arrow_left)");
        } else if (line.type === "LRSArrow" || line.type === "LRDArrow") {
          p.setAttribute("marker-end", isCorrect ? "url(#arrow_right_green)" : "url(#arrow_right)");
          p.setAttribute("marker-start", isCorrect ? "url(#arrow_left_green)" : "url(#arrow_left)");
        }

        if (isCorrect && !this.isShowingSolution) {
          p.classList.add("cable-animated");
        }

        gLine.appendChild(p);
      }

      // Zona transparente de clic para eliminar fácil en modo borrado
      const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hitPath.setAttribute("d", pathData);
      hitPath.setAttribute("fill", "none");
      hitPath.setAttribute("stroke", "transparent");
      hitPath.setAttribute("stroke-width", "20");
      hitPath.setAttribute("class", "cable-hit-area");
      hitPath.addEventListener("click", () => {
        if (this.isDeleteMode && !this.isShowingSolution) {
          this.lines = this.lines.filter(l => l.id !== line.id);
          this.history.push({ action: "remove", line });
          sounds.playDisconnect();
          this.lastValidation = null;
          this.renderLines();
          this.onStatusChange({ state: "ready", message: this.t("sim_status_line_removed") });
        }
      });
      gLine.appendChild(hitPath);

      cablesLayer.appendChild(gLine);
    });
  }

  isLineCorrect(uLine) {
    const answers = this.config.answers;
    return answers.some(ans => {
      const matchTerm = (uLine.from === ans.from && uLine.to === ans.to) ||
                        (uLine.from === ans.to && uLine.to === ans.from);
      const matchType = uLine.type === ans.type;
      const matchColor = uLine.color.toLowerCase() === ans.color.toLowerCase();
      return matchTerm && matchType && matchColor;
    });
  }

  createPath(d, color, width, cap = "round", offset = 0) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("stroke-linecap", cap);
    path.setAttribute("stroke-linejoin", "round");
    return path;
  }

  calculateOrthogonalPath(p1, p2) {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    // Si están alineados horizontal o verticalmente
    if (Math.abs(x1 - x2) < 12) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    if (Math.abs(y1 - y2) < 12) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    // Ruta en codo (Manhattan con redondeo suave)
    const midX = x1 + (x2 - x1) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  updateControlsUI() {
    // Actualizar botones de cables
    document.querySelectorAll(".cable-select-btn").forEach(btn => {
      const id = btn.getAttribute("data-cable-id");
      if (!this.isDeleteMode && this.selectedCable && this.selectedCable.id === id) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const delBtn = document.getElementById("btn_delete_mode");
    if (delBtn) {
      if (this.isDeleteMode) {
        delBtn.classList.add("active-danger");
      } else {
        delBtn.classList.remove("active-danger");
      }
    }
  }
}
