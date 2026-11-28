# Conocimiento Acumulado — Simulador Didaktikos y Sistema de Estilos

**Última actualización:** 2026-11-28

---

## 1. Arquitectura del Proyecto
- **Naturaleza:** Aplicación web 100% frontend estática (vanilla HTML5 + CSS3 + JavaScript ES6+), sin backend ni frameworks.
- **Producción:** `https://www.didaktikos.com.mx`
- **Entradas principales:**
  - `index.html`: redirección inicial hacia `web/index.html` con identidad visual Didaktikos.
  - `iniciar_simulador.bat`: abre `web\index.html` directamente en el navegador por `file://`.
  - `web/index.html`: aplicación principal (vistas: Inicio, BEV, Lab de Baterías, HEV, Anotaciones, Autonomía, E-Prix).
  - `web/eprix/eprix.html` y `web/eprix/eprix.bundle.js`: módulo E-Prix en ES Modules compilado a IIFE para compatibilidad con `file://`.
- **Estilos y temas:** `web/vendor/didaktikos/css/didaktikos-tokens.css`, `didaktikos-components.css` y puente `web/css/didaktikos-theme-bridge.css` (5 temas de rango + modo claro/oscuro).
- **Internacionalización (i18n):** `web/js/i18n.js` propio con `data-i18n`, `data-i18n-html`, `data-i18n-title` y soporte trilingüe para `es` (Español), `en` (English) y `zh` (Chino Mandarín Simplificado `zh-CN`).
- **Gráficas:** Chart.js vendorizado en `web/js/vendor/chart.umd.js` (funciona offline).

---

## 2. Sistema de Diseño Global Didaktikos (`\Estilos-globales`)
- **Ubicación:** `..\Estilos-globales` (hermana de `\Simulador` y `\Didaktikos estilos`).
- **Estética Canónica:** Se adoptó exclusivamente la **variante gamificada** de las capturas de Didaktikos (*Super Creativos*): HUD superior de juego, barra inferior con mascota robot, tipografía *sticker* con contorno grueso (`Fredoka` + `paint-order: stroke fill`), tipografía display (`Bruno Ace`) y cuerpo (`Nunito`).
- **Paleta Oficial de 5 Colores y Rangos:**
  - **Sky** (`#7CDBD5`) — Rango *Novato*
  - **Golden** (`#F9BE02`) — Rango *Principiante*
  - **Bright Coral** (`#F53240`) — Rango *Intermedio*
  - **Aquamarine** (`#02C8A7`) — Rango *Avanzado*
  - **Royal Purple** (`#914499`) — Rango *Experto*
- **Modo Oscuro Espacial (`data-mode="dark"`):** Base violeta-índigo profundo (`#1A132B` / `#281D42` / `#362759`) derivada del encabezado `#542454` y la temática espacial del cohete `D`.
- **Entregables en `\Estilos-globales`:**
  - Documentación: `01_ANALISIS_DIDAKTIKOS.md`, `02_SISTEMA_DE_DISENO.md`, `PROMPT_AGENTE_ESTILOS.md`.
  - Tokens y CSS: `tokens/design-tokens.json`, `css/didaktikos-tokens.css`, `css/didaktikos-components.css`.
  - Activos híbridos: `scripts/extract_assets.py` (24 PNGs `RGBA` sin fondo `#E5E5E5`) + 30 SVGs vectoriales (`logos/`, `simbolos/`, `iconos-ui/`, `iconos-robotica/` con 5 íconos adaptados y `patrones/patron-robots-espacial.svg`).
  - Catálogo interactivo: `index.html`.

---

## 3. Rediseño Total de `\Simulador` con `\Estilos-globales`
- **Sincronización autocontenida (`web/vendor/didaktikos/`):** Se copiaron 16 archivos esenciales (tokens CSS, logos, mascota robot, escudos, patrón espacial y avatar) dentro de `Simulador/web/vendor/didaktikos/` para que funcione tanto por `file://` como servido por HTTP sin rutas rotas fuera de la raíz.
- **Puente CSS y Controlador de Tema:**
  - `web/css/didaktikos-theme-bridge.css`: Mapea `--bg-*`, `--accent-*`, `--text-*` y `--eprix-*` hacia `--ddk-*`, estiliza el HUD superior, tarjetas, botones cápsula y contraste en ambos modos.
  - `web/js/theme.js`: Controla los 5 temas (`sky`, `golden`, `coral`, `aquamarine`, `purple`) y el toggle `🌙 Oscuro / ☀️ Claro` persistidos en `localStorage` (`ddk_theme`, `ddk_mode`).
- **Puntos de entrada actualizados:** `index.html`, `web/index.html` y `web/eprix/eprix.html`.

---

## 4. Internacionalización Trilingüe (`ES` / `EN` / `中文` Mandarín) y Lecciones Técnicas
- **Eliminación de Chino Cantonés:** Se eliminó por completo el paquete `yue` (`廣東話`, `labelYue`, `nameYue`, `descYue`) y se migró a **Chino Mandarín Simplificado (`zh`, `zh-CN`)** + **Inglés (`en`)** en:
  - `web/index.html` (`.lang-switcher`: `ES`, `EN`, `中文`).
  - `web/js/i18n.js` (`UI_TRANSLATIONS` + `MODULE_TRANSLATIONS` para los 5 módulos de `SIMULATOR_DATA`; migración automática de `localStorage` si contenía `"yue"` -> `"zh"`).
  - `web/js/autonomy.js` (perfiles de vehículos, ciclos `NEDC`/`WLTC`/`CLTC`, ruta, burbujas cómicas y resultados).
  - `web/js/battery_data.js` y `web/js/battery_ui.js` (`labelEn`, `labelZh`).
- **Bug resuelto en Lab de Baterías (`battery_ui.js`):** Los `<select>` de diseño (`#bat_app_select`, `#bat_chem_select`, `#bat_cooling_select`, `#bat_cell_select`) solo se poblaban al iniciar y no cambiaban al pulsar otro idioma. Se resolvió agregando `refreshDesignSelectLabels()` dentro del listener `sim:langchange`.
- **Contraste de `.lang-switcher`:** Se añadieron reglas explícitas en `didaktikos-theme-bridge.css` para garantizar legibilidad de `ES / EN / 中文` tanto en Modo Claro como en Modo Oscuro.

---

## 5. Diagnóstico en Producción (`https://www.didaktikos.com.mx/web/index.html`)
- **Estado general:** Todos los recursos locales CSS/JS/SVG/IMG devuelven `HTTP 200`; el selector de idioma (`ES`, `EN`, `中文`) y la navegación funcionan sin errores JS en consola. (Si un usuario ve que no cambia, se debe a caché HTTP del navegador -> `Ctrl+Shift+R`).
- **Bloqueo CSP pendiente de resolver en hosting:** La cabecera `Content-Security-Policy` (`style-src 'self' 'unsafe-inline'`) del servidor bloquea Google Fonts (`https://fonts.googleapis.com/css2`, `net::ERR_FAILED (csp)`).
  - **Solución recomendada:** Permitir `https://fonts.googleapis.com` (`style-src`) y `https://fonts.gstatic.com` (`font-src`) en la CSP del servidor, o descargar los `.woff2` de `Bruno Ace`, `Fredoka` y `Nunito` localmente en `web/vendor/didaktikos/fonts/`.

---

## 6. Credenciales OAuth 2.0 (Google Cloud Console)
- **Ubicación local:** `..\Credentials\IDs de clientes de OAuth 2.0\client_secret_804801707494-0lkbdmrv5pagfat99l15v7c3c6ud04t2.apps.googleusercontent.com.json` (fuera de `Simulador/`).
- **Client ID:** `804801707494-0lkbdmrv5pagfat99l15v7c3c6ud04t2.apps.googleusercontent.com`
- **Orígenes autorizados (`javascript_origins`):** `["https://www.didaktikos.com.mx"]`
- **Regla de seguridad:** Nunca incluir `client_secret` en archivos del frontend (`web/`).

---

## 7. Implementación de Login con Google (Solo Frontend) y Hallazgos
- **Archivos asociados en sesiones previas:** `web/js/auth.js`, widget `.ddk-auth-widget`, `README_AUTH.md`.
- **Limitaciones y lecciones técnicas:**
  1. **Sin verificación de firma:** en un sitio estático sin backend, decodificar el JWT en el navegador sirve solo para UX local (nombre/avatar/estado), no como seguridad real.
  2. **Sincronización de carga async de GIS:** usar el hook oficial `window.onGoogleLibraryLoad` + `renderButton` y margen de 6 s para evitar falsos avisos offline.
  3. **Incompatibilidad con `file://`:** Google Identity Services exige un origen `http://` o `https://` autorizado en Google Cloud Console.
- **Nueva dirección pendiente de definición:** Landing page promocional + flujo **Sign in / Sign up / Log in** (por definir: campos exactos de registro, auth local vs. backend como Firebase/Supabase, y si bloquea el acceso a los simuladores).

---

## 8. Verificación Técnica y Estado de Workflows Legacy (`/migrate-workflows`)
- **Pruebas unitarias verificadas:**
  - `node tests/battery_validation.test.mjs`: **48/48 pasadas**.
  - `web/eprix/tests/*.mjs`: **15/15 pasadas**.
- **Escaneo `/migrate-workflows`:** Revisadas rutas globales (`%USERPROFILE%\.gemini\config\{global_workflows,workflows}`, `workflows.json`) y de workspace (`.agents`, `_agents`, `.agent`, `_agent`).
  - **Resultado:** No existen workflows legacy pendientes de migrar; la configuración global y de workspace está limpia.
