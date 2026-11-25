# Fase 0: Reconocimiento Técnico del Repositorio Didaktikos

**Fecha:** 25 de noviembre de 2026  
**Módulo:** E-Prix Didaktikos (v2, fundamentado)  
**Autor:** Antigravity / Senior Simulation Engineer  

---

## 1. Stack y Build

- **Entorno de ejecución:** Web frontend vanilla (HTML5, CSS3, JavaScript ES6+ nativo sin transpilación ni empaquetado).
- **Archivos de configuración / Build:**
  - `package.json`: No existe en la raíz del repositorio.
  - `vite.config.*`, `webpack.config.*`: No existen.
  - Scripts disponibles en raíz: `iniciar_simulador.bat` (lanzador local con servidor Python `http.server 8000`), `rea.cmd`.
- **Estrategia de ejecución y pruebas:**
  - Ejecución en navegador: Compatible directamente vía `file://` o mediante cualquier servidor HTTP estático (`python3 -m http.server`, `npx serve`).
  - Suite de pruebas automatizadas: Se ejecutan directamente con `node --test` utilizando Node.js nativo (v22+) y módulos ESM (`.mjs` o `type: module`).

---

## 2. Router y Vistas

- **Mecanismo de enrutamiento:**
  - No utiliza hash (`#`) ni `history.pushState` con router externo.
  - Se gestiona mediante alternancia de clases CSS (`.active`) sobre contenedores `<section class="app-view">` identificados por `id`:
    - `#view_home`: Pantalla de bienvenida y cuadrícula de módulos principales (`.modules-grid`).
    - `#view_bev_menu`: Submenú con opciones de cableado y principios BEV.
    - `#view_hev_menu`: Submenú de configuraciones híbridas (serie, paralelo, combinado).
    - `#view_simulator`: Lienzo SVG interactivo y panel lateral para ejercicios de conexiones.
    - `#view_notes`: Visor canónico de documentación técnica de aprendizaje (`ANOTACIONES_APRENDIZAJE.md`).
- **Controlador de vistas (`web/js/app.js`):**
  - Objeto `views = { home, bevMenu, hevMenu, simulator, notes }`.
  - Función `switchView(viewName)` que remueve y agrega la clase `active`, actualiza la barra superior (`nav-btn.active`) y controla la visibilidad del botón `#nav_back`.
- **Integración del nuevo módulo:**
  - El módulo `E-Prix Didaktikos` se implementa de manera **completamente autónoma y standalone** en `web/eprix/eprix.html`.
  - Para la plataforma integrada, se documenta en `INTEGRATION.md` la tarjeta para `#view_home`, la pestaña de navegación y la sección o enlace correspondiente sin modificar destructivamente el flujo existente.

---

## 3. Catálogo de Vehículos

- **Inspección de `web/js/data.js`:**
  - Contiene la constante global `SIMULATOR_DATA` con la especificación de componentes topológicos para 5 módulos de cableado (`bevWiring`, `bevPrinciples`, `hybridSeries`, `hybridParallel`, `hybridCombined`).
  - **No contiene** un catálogo de modelos de vehículos ni especificaciones dinámicas de masa, potencia o químicas de celda para simulación física.
- **Acción adoptada (conforme a las reglas de la Fase 0):**
  - Dado que no existe catálogo previo de vehículos de carrera en `data.js`, se implementa el producto cartesiano canónico estipulado en el prompt (§4.1): 4 plataformas (Urbano, Sedán, Camioneta, Utilitario) × 4 químicas de batería (LFP, NCM, NiMH, Plomo-ácido), generando 16 combinaciones calibradas con identificadores normalizados (`urbano-lfp`, `sedan-ncm`, etc.) con masa base, coeficientes aerodinámicos y tren motriz parametrizado rigurosamente.

---

## 4. Tarjetas del Home (`web/index.html`)

- **Estructura HTML de una tarjeta en `.modules-grid`:**
  ```html
  <div class="module-card" id="card_goto_[id]">
    <img src="[ruta_imagen]" alt="[Alt]" class="card-img-preview" onerror="this.src='...'">
    <!-- O alternativamente icono banner: <div class="card-icon-banner">🏎️</div> -->
    <span class="card-tag" data-i18n="card_[id]_tag">[Etiqueta de Categoría]</span>
    <h2 class="card-title" data-i18n="card_[id]_title">[Título del Módulo]</h2>
    <p class="card-desc" data-i18n="card_[id]_desc">
      [Descripción concisa del objetivo pedagógico y simulación].
    </p>
    <div class="card-btn" data-i18n="card_[id]_btn">
      [Texto CTA] ➔
    </div>
  </div>
  ```
- **Comportamiento:** Clic asociado en `app.js` mediante `addEventListener("click", ...)`.

---

## 5. Tokens de Diseño Global (`web/css/style.css`)

Se preservan y consumen exactamente las variables CSS del `:root` corporativo:
- **Fondos:**
  - `--bg-primary: #0a0e17;`
  - `--bg-secondary: #131a29;`
  - `--bg-tertiary: #1c263b;`
  - `--bg-card: rgba(19, 26, 41, 0.85);`
- **Bordes y resplandores:**
  - `--border-color: rgba(255, 255, 255, 0.08);`
  - `--border-glow: rgba(0, 245, 212, 0.3);`
- **Acentos y estados:**
  - `--accent-cyan: #00f5d4;` (identidad principal / cian eléctrico)
  - `--accent-blue: #00b4d8;`
  - `--accent-electric: #4361ee;`
  - `--accent-purple: #7209b7;`
  - `--accent-orange: #f77f00;`
  - `--accent-red: #e63946;`
  - `--accent-green: #2ec4b6;`
- **Tipografía y textos:**
  - `--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`
  - `--text-main: #f8f9fa;`
  - `--text-muted: #94a3b8;`
  - `--text-dim: #64748b;`
- **Bordes y sombras:**
  - Radios: `--radius-sm: 6px;`, `--radius-md: 12px;`, `--radius-lg: 20px;`
  - Sombra: `--shadow-card: 0 10px 30px rgba(0, 0, 0, 0.5);`

En `eprix.css`, todas las clases estarán estrictamente acotadas bajo `.eprix` (o `:where(.eprix)`) para garantizar independencia y cero colisiones estilísticas.

---

## 6. Preflight de Fuentes de Conocimiento

| Archivo consultado | Estado en entorno | Acción tomada conforme a la regla de evidencia §2 |
|---|---|---|
| `9-11动力电池基本概念与工作原理（11.2版96页）_单语(1).pptx` | No presente en disco | Uso de las tablas verificadas en §3.1–§3.6 del prompt. |
| `9b. Bateria de potencia - conceptos y principio (version didactica).pptx` (F31) | No presente en disco | Referencia directa a las anclas verificadas `[F31·s01]`–`[F31·s69]` tabuladas en el prompt. |
| `4b. Estructura y funcionamiento de VNE - version didactica.pptx` (F30) | No presente en disco | Referencia directa a las anclas verificadas `[F30·s01]`–`[F30·s50]` tabuladas en el prompt. |
| `conocimientos_acumulados.md` | No presente en disco | Implementación rigurosa de las relaciones de síntesis especificadas en el prompt (§3 y §7). |
| `conocimientos_acumulados_grafos.md` | No presente en disco | Se integran los nodos canónicos G14 definidos en §11 (`MAT-LFP`, `MAT-NCM`, `MAT-PLOMO`, `MAT-NIMH`, `CON-CRATE`, `CON-DOD`, `CON-VENTANASOC`, `CON-DERATING`, `CON-EFECTO-PEUKERT`, `TEC-FRENO-REGENERATIVO`, `CMP-BMS`, `CMP-VCU`). |

---

## 7. Conclusión de la Fase 0

La estructura existente es limpia, modular y desacoplada. Se desarrollará el subsistema completo dentro de `web/eprix/` como módulo autocontenido de alto rendimiento (60 FPS, Canvas 2D / SVG LUT precalculado, integrador Runge-Kutta o Euler con paso fijo $dt = 1/120\,\text{s}$, determinismo PRNG mulberry32) y se proveerá `INTEGRATION.md` junto con los tests automatizados que certifican los criterios de aceptación AC-01 a AC-18.
