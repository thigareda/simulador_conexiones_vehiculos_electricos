# Conocimiento Acumulado — Simulador de Electromovilidad, REA y Sistema Didaktikos

**Última actualización:** 2026-11-28  
**Proyecto:** Simulador de Conexiones de Componentes para Vehículos Eléctricos e Híbridos  
**Directorio raíz:** `c:\Users\thigareda\Mi unidad\Mi trabajo escolar\ITZ\Cursos tomados\2026 Puebla - Electromovilidad\Simulador`  

---

## 1. Arquitectura General del Proyecto
- **Naturaleza:** Aplicación web 100% frontend estática (vanilla HTML5 + SVG/Canvas interactivo + CSS3 + JavaScript ES6+), sin dependencias de backend ni frameworks pesados.
- **Entorno de ejecución:** Funciona completamente offline por protocolo `file://` y servida bajo servidores HTTP locales (`http://localhost`) o hosting de producción (`https://www.didaktikos.com.mx`).
- **Puntos de entrada:**
  - `index.html` (raíz): Redirección inmediata hacia `web/index.html`.
  - `iniciar_simulador.bat` (raíz): Script batch que lanza automáticamente `web/index.html` en el navegador web predeterminado del sistema operativo.
  - `web/index.html`: Interfaz principal del simulador (vistas: Inicio, Menú BEV, Menú HEV, Lienzo Interactivo del Simulador, Visor de Documentación Técnica y Anotaciones).
  - `ANOTACIONES_APRENDIZAJE.md` (raíz): Documento técnico maestro de 69.6 KB con el análisis profundo del modelo de funcionamiento, topología y diagramas de interbloqueo.
- **Estructura limpia del directorio de trabajo:**
  ```text
  Simulador/
  ├── ANOTACIONES_APRENDIZAJE.md    # Documento técnico maestro de funcionamiento y topología
  ├── index.html                    # Redireccionador a la aplicación web
  ├── iniciar_simulador.bat         # Lanzador directo en Windows
  ├── rea/                          # Herramienta REA (Reverse Engineer Anything) compilada
  ├── rea.cmd                       # Wrapper ejecutable para invocar REA desde terminal
  ├── conocimiento_acumulado.md     # Registro integral de conocimiento y decisiones
  └── web/                          # Sistema web completo e interactivo
      ├── css/
      │   └── style.css             # Estilos automotrices EV (modo oscuro/claro y visor)
      ├── img/                      # Activos gráficos originales y mapeados en ASCII
      ├── js/
      │   ├── app.js                # Controlador de navegación de vistas y eventos UI
      │   ├── audio.js              # Sintetizador de audio nativo (Web Audio API)
      │   ├── data.js               # Modelos de datos, dispositivos, terminales y respuestas
      │   ├── notes_data.js         # Payload de anotaciones técnicas para consulta offline
      │   ├── notes_renderer.js     # Renderizador Markdown nativo sin dependencias
      │   └── simulator.js          # Motor SVG de cableado, ruteo ortogonal y validación
      └── index.html                # Aplicación web interactiva SPA
  ```

---

## 2. Instalación, Parche y Compilación de REA (Reverse Engineer Anything)
- **Repositorio oficial:** `https://github.com/morluto/rea` (clonado en subdirectorio `rea/`).
- **Problema de compatibilidad de Node detectado:**
  - `rea` define en su `package.json` un rango estricto de motores: `"engines": { "node": "^22.23.4 || ^24.22.1 || >=26.12.1" }`.
  - El entorno Windows local ejecuta Node.js `v24.19.0`.
  - `scripts/lib/runtime-admission.mjs` y `scripts/rea.mjs` rechazan activamente la ejecución si la versión de Node no cumple estrictamente con `packageJson.engines.node`.
- **Solución técnica implementada:**
  1. Instalación de dependencias forzada en `rea/`: `cmd.exe /c "cd rea && npm install --force"`.
  2. Ajuste de compatibilidad en `rea/package.json`:
     ```json
     "engines": {
       "node": "^22.23.4 || >=24.19.0"
     }
     ```
  3. Compilación de artefactos TypeScript y catálogo de herramientas: `cmd.exe /c "cd rea && npm run compile"`.
  4. Creación del script lanzador de conveniencia en la raíz `rea.cmd`:
     ```cmd
     @echo off
     node "%~dp0rea\scripts\rea.mjs" %*
     ```
  5. Verificación de CLI: `rea.cmd --version` devuelve exitosamente `6.10.1`.

---

## 3. Ingeniería Inversa del Simulador Legacy C# (.NET Framework 4.8)
Se analizó exhaustivamente el proyecto legacy de Windows Forms (`SynapticsPointingDeviceDriver.sln`, `SynapticsPointingDeviceDriver.csproj`) y las clases en `BIZ/`:
- **Page 1 (`Page1.cs`):** Menú de inicio de alto nivel con dos ramas principales:
  - Botón 1 (`纯电动汽车`): Vehículo Eléctrico Puro (BEV) -> Page 2.
  - Botón 2 (`混合动力电动汽车`): Vehículo Eléctrico Híbrido (HEV) -> Page 5.
- **Page 2 (`Page2.cs`):** Menú BEV:
  - Botón 1 (`实训仿真系统`): Simulador de cableado físico de componentes de potencia y control -> Page 3 (`Page3System`).
  - Botón 2 (`工作原理学习系统`): Diagrama de bloques de principio de funcionamiento y flujos -> Page 4 (`Page4System`).
- **Page 3 (`Page3System.cs`):** Simulador de conexionado práctico BEV:
  - 16 dispositivos físicos: Convertidor DC-DC, 3 fusibles (RDQ1, RDQ2, RDQ3), 2 regletas de conexiones (DXLJQ1 positivo, DXLJQ2 negativo), Batería auxiliar 12V, Relé de encendido, Batería de tracción de alto voltaje (HV), Interruptor de desconexión de emergencia (MSD), Contactor principal DC de potencia, Inversor/Controlador de motor (MCU), Motor trifásico sincrónico/inducción, Pedal de acelerador, Selector de marchas (D/N/R) y Tablero de instrumentos.
  - 22 conexiones oficiales requeridas con código de colores estricto:
    - Alta Tensión (+) Rojo: 15 cables.
    - Alta Tensión (-) Negro: 3 cables.
    - Baja Tensión 12V (+) Morado: 3 cables.
    - Retorno 12V / Tierra (-) Gris: 2 cables.
    - Arnés de señales del motor Azul: 3 cables (acelerador, cambios, tablero hacia MCU).
- **Page 4 (`Page4System.cs`):** Principio de funcionamiento lógico BEV:
  - 16 bloques funcionales: Pedal de freno, Pedal de acelerador, ECU/VCU, Convertidor de potencia/Inversor, Motor trifásico, Transmisión mecánica, 2 Ruedas, BMS, Batería de tracción, Fuente auxiliar DC-DC, Dirección asistida eléctrica (EPS), Volante, Sistema de carga a bordo (OBC), Gestión térmica de batería y Red eléctrica externa.
  - 17 conexiones lógicas con tipología de flechas:
    - Señal unidireccional y bidireccional (`RSArrow`, `LSArrow`, `LRSArrow`).
    - Potencia eléctrica unidireccional y bidireccional (`RDArrow`, `LDArrow`, `LRDArrow`).
    - Acoplamiento mecánico en doble línea continua (`DLine`).
- **Page 5 (`Page5.Designer.cs`):** Menú HEV con tres opciones de arquitectura híbrida:
  - Botón 1 (`串联式`): Híbrido en Serie -> Page 6 (`Page6System`).
  - Botón 2 (`并联式`): Híbrido en Paralelo -> Page 7 (`Page7System`).
  - Botón 4 (`混联式`): Híbrido Combinado (Serie-Paralelo) -> Page 8 (`Page8System`).
- **Page 6 (`Page6System.cs`):** Híbrido en Serie:
  - 7 componentes: Tanque, Motor de combustión, Generador eléctrico, Batería de tracción, Inversor, Motor de tracción eléctrico, Transmisión/ruedas.
  - 6 conexiones: Combustible (línea roja), Mecánica (doble línea), Eléctrica (línea negra continua). El motor térmico sólo mueve al generador; las ruedas son impulsadas exclusivamente por el motor eléctrico.
- **Page 7 (`Page7System.cs`):** Híbrido en Paralelo:
  - 6 componentes: Tanque, Motor de combustión, Batería, Inversor, Motor eléctrico, Acoplador mecánico/transmisión.
  - 5 conexiones: Tanto el motor de combustión como el motor eléctrico entregan par mecánico a las ruedas mediante un acoplador común.
- **Page 8 (`Page8System.cs`):** Híbrido Combinado (Serie-Paralelo):
  - 7 componentes: Tanque, Motor de combustión, Generador MG1, Batería de tracción, Inversor dual, Motor eléctrico MG2, Divisor planetario de potencia (PSD) y transmisión.
  - 7 conexiones: Permite propulsión puramente eléctrica, propulsión híbrida directa y generación simultánea de electricidad.

---

## 4. Transformación al Sistema Web Autónomo (`web/`)
- **Adaptación lingüística:** Español latinoamericano técnico estandarizado para electromovilidad automotriz (eliminación de textos chinos de la interfaz original).
- **Activos visuales:** Se conservaron todas las imágenes originales de `Source/` en `web/img/` y se generaron duplicados con nombres ASCII canónicos para evitar problemas de codificación o mojibake en servidores y navegadores (`battery_12v.png`, `dcdc_converter.png`, `motor_controller.png`, `electric_motor.png`, `dc_contactor.png`, etc.).
- **Motor SVG interactivo (`web/js/simulator.js`):**
  - Manejo de terminales (*pins*) con áreas de clic expandidas y resaltado activo (`pin-active`).
  - Algoritmo de ruteo ortogonal estilo Manhattan para evitar cables diagonales confusos.
  - Soporte de doble línea para acoplamientos mecánicos y marcadores de flechas SVG vectoriales para flujos de potencia y señal.
  - Modos de interacción: Modo Conectar, Modo Eliminar cables, Pila de Deshacer (Undo), Limpiar lienzo y Ver Solución oficial.
  - Motor de validación estricta que compara terminales, tipo de cable y color contra las respuestas oficiales.
- **Efectos de sonido nativos (`web/js/audio.js`):**
  - Implementación de sintetizador de audio con Web Audio API pura (`AudioContext`).
  - Sonidos diferenciados para clic, conexión de cable, desconexión/eliminación, error/advertencia y fanfarria de validación exitosa (Do-Mi-Sol-Do).
- **Visor de Documentación Técnica integrado:**
  - Renderizador Markdown nativo (`web/js/notes_renderer.js`) con soporte completo de encabezados, tablas, listas, citas y bloques de código.
  - Datos precargados en `web/js/notes_data.js` para permitir la lectura completa de las anotaciones de aprendizaje bajo protocolo `file://` sin restricciones de CORS.

---

## 5. Proceso Multi-Agente Teamwork y Verificación de Calidad
La ejecución de la solicitud de planificación y limpieza fue orquestada por el equipo autónomo `teamwork`:
- **Entrevista de alineación:**
  - Propósito definido: Documentación técnica interna del proyecto para mantenimiento futuro.
  - Ubicación de notas: Markdown en raíz (`ANOTACIONES_APRENDIZAJE.md`) y visor integrado en web.
  - Archivos a conservar: `web/`, `index.html`, `iniciar_simulador.bat`, `ANOTACIONES_APRENDIZAJE.md`, `rea/` y `rea.cmd`.
  - Archivos a eliminar: Exclusivamente código legacy de C# / Visual Studio.
  - Restricción estricta: No eliminar ningún archivo antes de validar el análisis y la autonomía del sistema web.
- **Hito 1 (M1 - Análisis y Anotaciones):**
  - Generación de `ANOTACIONES_APRENDIZAJE.md` (69,665 bytes).
  - Aprobado por 2 Revisores, 2 Challengers y Auditor Forense.
- **Hito 2 (M2 - Integración Web y Pruebas Headless):**
  - Integración de `#view_notes`, `#nav_notes`, `notes_renderer.js` y `notes_data.js`.
  - Verificación exitosa en Chromium headless bajo `file://` y `http://` en 4 resoluciones (1440x900, 1024x768, 768x1024, 375x812) sin desbordamiento ni errores de consola.
- **Hito 3 (M3 - Depuración Selectiva):**
  - Eliminación segura de las 6 carpetas legacy: `.vs`, `bin`, `obj`, `BIZ`, `Properties`, `Source`.
  - Eliminación segura de los 14 archivos legacy: `Page2.cs`, `Page5.Designer.cs`, `Page6.Designer.cs`, `Page6.resx`, `Page7.cs`, `Page7.Designer.cs`, `Page7.resx`, `Page8.cs`, `Page8.Designer.cs`, `Page8.resx`, `Program.cs`, `SynapticsPointingDeviceDriver.csproj`, `SynapticsPointingDeviceDriver.csproj.user`, `SynapticsPointingDeviceDriver.sln`.
  - Confirmación independiente por Victory Auditor (`VICTORY CONFIRMED`).

---

## 6. Sistema de Diseño Global Didaktikos (`\Estilos-globales`) y Producción
- **Ubicación de referencia:** Directorio hermano `..\Estilos-globales`.
- **Estética Didaktikos Gamificada:**
  - HUD superior de juego, barra inferior con mascota robot, tipografía *sticker* (`Fredoka` con borde grueso), display (`Bruno Ace`) y cuerpo (`Nunito`).
  - Paleta oficial: Sky (`#7CDBD5`), Golden (`#F9BE02`), Bright Coral (`#F53240`), Aquamarine (`#02C8A7`) y Royal Purple (`#914499`).
  - Modo Oscuro Espacial (`#1A132B` / `#281D42` / `#362759`).
- **Internacionalización trilingüe:**
  - Soporte completo para Español (`es`), Inglés (`en`) y Chino Mandarín Simplificado (`zh`, `zh-CN`).
  - Eliminación total de dialectos incompatibles como cantonés (`yue`).
- **Diagnóstico en servidor de producción (`https://www.didaktikos.com.mx`):**
  - Recursos estáticos devuelven HTTP 200.
  - La cabecera CSP del servidor requiere permitir `https://fonts.googleapis.com` y `https://fonts.gstatic.com` o servir tipografías localmente desde `web/vendor/didaktikos/fonts/`.

---

## 7. Verificación de Workflows Legacy (`/migrate-workflows`)
- **Escaneo de configuración global:** `%USERPROFILE%\.gemini\config\{global_workflows,workflows}` y `workflows.json`.
- **Escaneo de configuración de workspace:** Directorios `.agents`, `_agents`, `.agent`, `_agent`.
- **Resultado:** No existen archivos de workflows obsoletos pendientes de migración. La configuración global y del espacio de trabajo está limpia y adaptada a la especificación moderna de *skills*.
