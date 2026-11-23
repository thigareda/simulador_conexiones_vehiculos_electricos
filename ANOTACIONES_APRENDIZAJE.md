# Anotaciones Técnicas de Aprendizaje y Mantenimiento: Simulador de Electromovilidad (BEV y HEV)

Este documento constituye la referencia técnica canónica sobre el modelo de funcionamiento, la topología eléctrica y mecánica, las reglas de validación y la trazabilidad histórica del **Simulador de Conexiones de Vehículos Eléctricos e Híbridos**. Su propósito es preservar íntegramente el conocimiento de ingeniería contenido tanto en la aplicación web autónoma (`web/`) como en el proyecto heredado de escritorio C# WinForms (`BIZ/`, `Page*.cs`) antes de la depuración de artefactos legacy, sirviendo además como fuente directa para el visor integrado de notas del navegador.

---

## 1. Alcance Real y Arquitectura General del Simulador

### 1.1 Naturaleza Pedagógica y Modelo de Grafo Topológico

El simulador es un **entrenador topológico de cableado y diagramas de bloques funcionales**, no un simulador físico continuo. Tanto el motor web (`web/js/simulator.js`, clase `WiringSimulator`) como el motor original en C# (`BIZ/DeviceSystemBase.cs`, clase `DeviceSystemBase`) operan sobre un grafo estático compuesto por:

- **Nodos de componente (`devices`)**: rectángulos posicionados en coordenadas fijas dentro de un lienzo (`canvasWidth x canvasHeight` en SVG, o coordenadas `Rectangle` en WinForms).
- **Vértices de conexión (`terminals`)**: puntos discretos sobre los bordes de cada dispositivo con coordenadas absolutas `(dev.x + pin.relX, dev.y + pin.relY)`.
- **Aristas de referencia (`answers`)**: conjunto cerrado de **57 conexiones esperadas** distribuidas en 5 módulos independientes, cada una tipificada por un par de terminales, un tipo de línea (`type`) y un color hexadecimal (`color`).

El catálogo global (`SIMULATOR_DATA` en `web/js/data.js`) organiza los 5 módulos de la siguiente manera:

| Clave Web | Código Legacy | Resolución (`viewBox`) | Tipos de Cable | Dispositivos | Terminales | Conexiones (`answers`) |
|---|---|---|---|---:|---:|---:|
| `bevWiring` | `Page3` | `1440 x 860` | 5 | 16 | 42 | 22 |
| `bevPrinciples` | `Page4` | `1280 x 760` | 7 | 16 | 34 | 17 |
| `hybridSeries` | `Page6` | `1200 x 700` | 3 | 7 | 12 | 6 |
| `hybridParallel` | `Page7` | `1200 x 700` | 3 | 6 | 10 | 5 |
| `hybridCombined` | `Page8` | `1200 x 720` | 3 | 7 | 14 | 7 |
| **Total** | — | — | **21** | **52** | **112** | **57** |

### 1.2 Demarcación Honesta de Límites de Alcance

Para evitar suposiciones erróneas durante el mantenimiento futuro o la enseñanza en laboratorio, se documentan explícitamente las simplificaciones y omisiones del modelo real implementado en el código:

1. **Ausencia de motor físico continuo**: No existe bucle de resolución de voltajes, corrientes, potencia instantánea, estado de carga (`SOC`), temperatura, revoluciones por minuto (`RPM`), par motor, frecuencia trifásica ni modulación `PWM`. La validación verifica exclusivamente la equivalencia topológica (conectividad por pares y tipo/color de línea).
2. **Contactor único solo en el polo positivo HV (`ZLJCQ`)**: En `bevWiring`, la batería de tracción (`DLDY`) conmuta únicamente su rama positiva (`DLDY_2 -> JJKG_1 -> JJKG_2 -> ZLJCQ_1 -> ZLJCQ_4 -> RDQ3_1`). La rama negativa (`DLDY_1 -> DXLJQ2_2 -> DXLJQ2_3 -> DDJKZQ_2` y `DXLJQ2_1 -> DCDCZHQ_4`) permanece conectada de forma directa sin contactor negativo (`HV-`).
3. **Ausencia de circuito de precarga**: No existe contactor ni resistencia de precarga en paralelo con `ZLJCQ` para limitar la corriente de irrupción (*inrush*) hacia los capacitores del bus DC del inversor (`DDJKZQ`).
4. **Ausencia de lazos de seguridad `HVIL` e `IMD`**: No se modelan bucles de interbloqueo de alta tensión (*High-Voltage Interlock Loop*, `HVIL`) ni monitores de aislamiento (*Insulation Monitoring Device*, `IMD`).
5. **Flujo unidireccional batería-inversor en `bevPrinciples`**: La conexión de potencia entre la batería de tracción y el inversor (`GLZHQ_B -> XDC_T`, línea 335 de `web/js/data.js`) se define como `LDArrow` unidireccional (`"Batería => Inversor"`), a pesar de que el enlace entre el inversor y el motor sí es bidireccional (`GLZHQ_R <=> SXGYDJ_L`, tipo `LRDArrow`, `"Inversor <=> Motor Trifásico"`). El diagrama lógico de principios no representa el retorno regenerativo desde el inversor hacia la batería ni hacia la toma de carga.
6. **Puerto compartido de grado 3 (`DDJKZQ_6`)**: De los 112 terminales del sistema, **111 tienen grado 1** (una sola conexión esperada). El único nodo multipuerto es `DDJKZQ_6` (*Puerto de Arnés de Señales* del controlador en `bevWiring`), con **grado 3**, al concentrar en un solo terminal las líneas de `JSTB`, `DWKG` y `YB`.
7. **Simplificaciones en módulos BEV e Híbridos (`HEV`)**:
   - `bevWiring` omite bloques explícitos de `VCU`, `BMS` y `OBC` (presentes en `bevPrinciples`), concentrando las señales de usuario en el arnés `DDJKZQ_6`.
   - `hybridSeries`, `hybridParallel` y `hybridCombined` omiten embragues explícitos de desacople, batería auxiliar de 12V, circuitos de refrigeración/gestión térmica, líneas de control/CAN y flechas diferenciadas de frenado regenerativo.

---

## 2. Tren Motriz Eléctrico BEV (`bevWiring` / `Page3` y `bevPrinciples` / `Page4`)

El bloque de vehículos 100 % eléctricos (`BEV`) se divide en dos prácticas complementarias: el **cableado físico punto a punto** (`bevWiring`, herencia de `Page3`) y el **diagrama lógico de principios de funcionamiento y flujo** (`bevPrinciples`, herencia de `Page4`).

### 2.1 Módulo `bevWiring` (`Page3`): Modelo Físico de Cableado Práctico

En `bevWiring` (`viewBox` `1440 x 860`) el estudiante debe interconectar 16 componentes físicos reales mediante 42 terminales y 22 cables clasificados en 5 circuitos eléctricos. En un vehículo eléctrico real, esta arquitectura representa:

- **Cadena de alimentación de tracción HV+**: `DLDY` (batería HV) $\rightarrow$ `JJKG` (interruptor manual de servicio/emergencia MSD) $\rightarrow$ `ZLJCQ` (contactor principal DC activado por 12V) $\rightarrow$ `RDQ3` (fusible maestro HV) $\rightarrow$ `DXLJQ1` (regleta distribuidora positiva), desde donde se bifurca hacia `RDQ2` $\rightarrow$ `DDJKZQ` (inversor/controlador) y hacia `RDQ1` $\rightarrow$ `DCDCZHQ` (convertidor DC-DC).
- **Retorno de potencia HV-**: `DLDY` $\rightarrow$ `DXLJQ2` (regleta distribuidora negativa), recolectando además los retornos negativos de `DDJKZQ` y `DCDCZHQ` sin pasar por masa de chasis.
- **Tracción trifásica AC**: `DDJKZQ` convierte el bus DC (`+` / `-`) en tres fases `U`, `V`, `W` hacia el motor eléctrico trifásico `DDJ`.
- **Subsistema auxiliar de 12V y excitación de contactor**: `DCDCZHQ` recarga la batería auxiliar `DY12V`, la cual alimenta la llave/relé `JDQKG` para excitar la bobina de `ZLJCQ` y cerrar su retorno a masa `DY12V`.
- **Arnés de señales de conducción**: `JSTB` (acelerador), `DWKG` (selector de marchas) y `YB` (tablero) convergen en `DDJKZQ_6`.

#### Catálogo de Tipos de Cable de `bevWiring`

| `id` | Nombre en Interfaz | Color Hex | Tipo (`type`) | Grosor (`lineWidth`) | Descripción |
|---|---|---|---|---:|---|
| `hv_pos` | Alimentación Alta Tensión (+) | `#e63946` | `Line` | 4 | Circuito de potencia HV positivo (rojo) |
| `hv_neg` | Alimentación Alta Tensión (-) | `#1d2a3a` | `Line` | 4 | Circuito de potencia HV negativo (negro) |
| `lv_pos` | Alimentación Baja Tensión (+12V) | `#9b5de5` | `Line` | 3 | Circuito auxiliar positivo de 12V (morado) |
| `lv_neg` | Retorno Baja Tensión (-12V / Tierra) | `#6c757d` | `Line` | 3 | Circuito auxiliar negativo/retorno de 12V (gris) |
| `mcu_harness` | Arnés de Señales del Controlador | `#0077b6` | `Line` | 3 | Señales de control de pedales, selector y tablero (azul) |

#### Dispositivos y Terminales de `bevWiring` (16 dispositivos, 42 terminales)

| Dispositivo (`id`) | Nombre Web | Caja `(x, y, w, h)` | Color Ref. | Imagen (`web/img/`) | Terminales (`id`: `name` / `label` @ `(relX, relY)` $\rightarrow$ abs `(x, y)`) |
|---|---|---|---|---|---|
| `DCDCZHQ` | Convertidor DC-DC | `(100, 120, 300, 100)` | `#2a6f97` | `img/dcdc_converter.png` | `DCDCZHQ_1`: Entrada HV (+) / `Entrada +` @ `(300, 50)` $\rightarrow$ `(400, 170)`; `DCDCZHQ_4`: Entrada HV (-) / `Entrada -` @ `(300, 80)` $\rightarrow$ `(400, 200)`; `DCDCZHQ_2`: Salida 12V (+) / `Salida +` @ `(100, 100)` $\rightarrow$ `(200, 220)`; `DCDCZHQ_3`: Salida 12V (-) / `Salida -` @ `(130, 100)` $\rightarrow$ `(230, 220)` |
| `RDQ1` | Fusible 1 (DC-DC) | `(550, 170, 120, 50)` | `#4a5568` | `img/fuse.png` | `RDQ1_1`: Salida Fusible 1 / `Salida` @ `(0, 25)` $\rightarrow$ `(550, 195)`; `RDQ1_2`: Entrada Fusible 1 / `Entrada` @ `(120, 25)` $\rightarrow$ `(670, 195)` |
| `DXLJQ1` | Regleta Distribuidora Positiva | `(750, 170, 130, 70)` | `#2d3748` | `img/wire_connector.png` | `DXLJQ1_1`: Salida a DC-DC / `Salida` @ `(0, 20)` $\rightarrow$ `(750, 190)`; `DXLJQ1_2`: Entrada Principal (+) / `Entrada +` @ `(65, 70)` $\rightarrow$ `(815, 240)`; `DXLJQ1_3`: Salida a Controlador / `Salida` @ `(130, 20)` $\rightarrow$ `(880, 190)` |
| `RDQ2` | Fusible 2 (Controlador) | `(950, 170, 120, 50)` | `#4a5568` | `img/fuse.png` | `RDQ2_1`: Entrada Fusible 2 / `Entrada` @ `(0, 25)` $\rightarrow$ `(950, 195)`; `RDQ2_2`: Salida Fusible 2 / `Salida` @ `(120, 45)` $\rightarrow$ `(1070, 215)` |
| `DY12V` | Batería Auxiliar de 12V | `(200, 300, 130, 70)` | `#3182ce` | `img/battery_12v.png` | `DY12V_1`: Alimentación de Control (+) / `Aux +` @ `(0, 20)` $\rightarrow$ `(200, 320)`; `DY12V_2`: Terminal Positivo (+) / `+` @ `(25, 0)` $\rightarrow$ `(225, 300)`; `DY12V_3`: Terminal Negativo (-) / `-` @ `(105, 0)` $\rightarrow$ `(305, 300)`; `DY12V_4`: Retorno a Bobina Contactor (-) / `GND` @ `(130, 20)` $\rightarrow$ `(330, 320)` |
| `DXLJQ2` | Regleta Distribuidora Negativa | `(850, 270, 130, 63)` | `#2d3748` | `img/wire_connector.png` | `DXLJQ2_1`: Retorno DC-DC (-) / `DC-DC (-)` @ `(0, 20)` $\rightarrow$ `(850, 290)`; `DXLJQ2_2`: Retorno Batería Tracción (-) / `Bat. Trac (-)` @ `(65, 63)` $\rightarrow$ `(915, 333)`; `DXLJQ2_3`: Retorno Controlador (-) / `Controlador (-)` @ `(130, 20)` $\rightarrow$ `(980, 290)` |
| `JDQKG` | Interruptor de Relé (Llave) | `(455, 350, 60, 60)` | `#4a5568` | `img/relay_switch.png` | `JDQKG_1`: Entrada de Control Relé / `Entrada` @ `(10, 60)` $\rightarrow$ `(465, 410)`; `JDQKG_2`: Salida a Contactor / `Salida` @ `(50, 60)` $\rightarrow$ `(505, 410)` |
| `DLDY` | Batería de Tracción (HV) | `(80, 530, 140, 60)` | `#e53e3e` | `img/traction_battery.png` | `DLDY_1`: Polo Negativo (-) / `-` @ `(15, 60)` $\rightarrow$ `(95, 590)`; `DLDY_2`: Polo Positivo (+) / `+` @ `(140, 10)` $\rightarrow$ `(220, 540)` |
| `JJKG` | Interruptor de Emergencia | `(320, 500, 70, 70)` | `#c53030` | `img/emergency_switch.png` | `JJKG_1`: Entrada desde Batería (+) / `Entrada` @ `(0, 35)` $\rightarrow$ `(320, 535)`; `JJKG_2`: Salida a Contactor / `Salida` @ `(70, 35)` $\rightarrow$ `(390, 535)` |
| `ZLJCQ` | Contactor de Corriente Directa (DC) | `(500, 500, 140, 80)` | `#2b6cb0` | `img/dc_contactor.png` | `ZLJCQ_1`: Contacto de Potencia Entrada (+) / `Potencia In` @ `(0, 20)` $\rightarrow$ `(500, 520)`; `ZLJCQ_2`: Bobina Control (+12V) / `Bobina +` @ `(35, 0)` $\rightarrow$ `(535, 500)`; `ZLJCQ_3`: Bobina Control (-12V) / `Bobina -` @ `(105, 0)` $\rightarrow$ `(605, 500)`; `ZLJCQ_4`: Contacto de Potencia Salida (+) / `Potencia Out` @ `(140, 20)` $\rightarrow$ `(640, 520)` |
| `RDQ3` | Fusible 3 (Línea Principal HV) | `(750, 500, 120, 50)` | `#4a5568` | `img/fuse.png` | `RDQ3_1`: Entrada Fusible 3 / `Entrada` @ `(0, 25)` $\rightarrow$ `(750, 525)`; `RDQ3_2`: Salida Fusible 3 / `Salida` @ `(65, 0)` $\rightarrow$ `(815, 500)` |
| `DDJKZQ` | Controlador de Motor (Inversor MCU) | `(950, 550, 180, 100)` | `#2b6cb0` | `img/motor_controller.png` | `DDJKZQ_1`: Fase de Potencia W / `W` @ `(30, 0)` $\rightarrow$ `(980, 550)`; `DDJKZQ_2`: Alimentación DC (-) / `-` @ `(60, 0)` $\rightarrow$ `(1010, 550)`; `DDJKZQ_3`: Fase de Potencia V / `V` @ `(90, 0)` $\rightarrow$ `(1040, 550)`; `DDJKZQ_4`: Alimentación DC (+) / `+` @ `(120, 0)` $\rightarrow$ `(1070, 550)`; `DDJKZQ_5`: Fase de Potencia U / `U` @ `(150, 0)` $\rightarrow$ `(1100, 550)`; `DDJKZQ_6`: Puerto de Arnés de Señales / `Arnés` @ `(90, 100)` $\rightarrow$ `(1040, 650)` |
| `DDJ` | Motor Eléctrico Trifásico | `(1170, 400, 200, 120)` | `#2c5282` | `img/electric_motor.png` | `DDJ_1`: Terminal Fase U / `U` @ `(100, 0)` $\rightarrow$ `(1270, 400)`; `DDJ_2`: Terminal Fase V / `V` @ `(130, 0)` $\rightarrow$ `(1300, 400)`; `DDJ_3`: Terminal Fase W / `W` @ `(160, 0)` $\rightarrow$ `(1330, 400)` |
| `JSTB` | Pedal de Acelerador | `(200, 700, 80, 100)` | `#718096` | `img/accelerator_pedal.png` | `JSTB`: Salida Señal Acelerador / `Señal` @ `(80, 15)` $\rightarrow$ `(280, 715)` |
| `DWKG` | Selector de Marchas | `(500, 700, 100, 100)` | `#718096` | `img/gear_switch.png` | `DWKG`: Salida Señal Marcha / `Señal` @ `(100, 15)` $\rightarrow$ `(600, 715)` |
| `YB` | Tablero de Instrumentos | `(800, 700, 100, 50)` | `#718096` | `img/dashboard.png` | `YB`: Entrada Señal Tablero / `Señal` @ `(100, 15)` $\rightarrow$ `(900, 715)` |

#### Conexiones Oficiales de `bevWiring` (22 conexiones `answers`)

| # | `from` | `to` | `color` | `type` | Descripción Oficial (`name`) | Circuito Funcional |
|---:|---|---|---|---|---|---|
| 1 | `DCDCZHQ_1` | `RDQ1_1` | `#e63946` | `Line` | Entrada DC-DC a Fusible 1 | HV (+) |
| 2 | `DCDCZHQ_4` | `DXLJQ2_1` | `#1d2a3a` | `Line` | Negativo DC-DC a Distribuidor Negativo | HV (-) |
| 3 | `DCDCZHQ_3` | `DY12V_3` | `#6c757d` | `Line` | Salida Negativa DC-DC a Batería 12V (-) | LV (-12V / GND) |
| 4 | `DCDCZHQ_2` | `DY12V_2` | `#9b5de5` | `Line` | Salida Positiva DC-DC a Batería 12V (+) | LV (+12V) |
| 5 | `DY12V_1` | `JDQKG_1` | `#9b5de5` | `Line` | Batería 12V a Entrada Relé de Control | LV (+12V) |
| 6 | `DY12V_4` | `ZLJCQ_3` | `#6c757d` | `Line` | Masa Batería 12V a Bobina Contactor (-) | LV (-12V / GND) |
| 7 | `JDQKG_2` | `ZLJCQ_2` | `#9b5de5` | `Line` | Salida Relé a Bobina Contactor (+) | LV (+12V) |
| 8 | `RDQ1_2` | `DXLJQ1_1` | `#e63946` | `Line` | Entrada Fusible 1 a Distribuidor Positivo | HV (+) |
| 9 | `DXLJQ1_3` | `RDQ2_1` | `#e63946` | `Line` | Distribuidor Positivo a Fusible 2 | HV (+) |
| 10 | `RDQ2_2` | `DDJKZQ_4` | `#e63946` | `Line` | Salida Fusible 2 a Entrada (+) Controlador | HV (+) |
| 11 | `DDJKZQ_1` | `DDJ_3` | `#e63946` | `Line` | Fase W Controlador a Fase W Motor | Potencia Trifásica (en catálogo `hv_pos`) |
| 12 | `DDJKZQ_3` | `DDJ_2` | `#e63946` | `Line` | Fase V Controlador a Fase V Motor | Potencia Trifásica (en catálogo `hv_pos`) |
| 13 | `DDJKZQ_5` | `DDJ_1` | `#e63946` | `Line` | Fase U Controlador a Fase U Motor | Potencia Trifásica (en catálogo `hv_pos`) |
| 14 | `DXLJQ1_2` | `RDQ3_2` | `#e63946` | `Line` | Distribuidor Positivo a Fusible Principal 3 | HV (+) |
| 15 | `ZLJCQ_4` | `RDQ3_1` | `#e63946` | `Line` | Salida Contactor DC a Entrada Fusible 3 | HV (+) |
| 16 | `JJKG_2` | `ZLJCQ_1` | `#e63946` | `Line` | Salida Emergencia a Entrada Contactor DC | HV (+) |
| 17 | `DLDY_2` | `JJKG_1` | `#e63946` | `Line` | Batería Tracción (+) a Entrada Emergencia | HV (+) |
| 18 | `DLDY_1` | `DXLJQ2_2` | `#1d2a3a` | `Line` | Batería Tracción (-) a Distribuidor Negativo | HV (-) |
| 19 | `DXLJQ2_3` | `DDJKZQ_2` | `#1d2a3a` | `Line` | Distribuidor Negativo a Entrada (-) Controlador | HV (-) |
| 20 | `JSTB` | `DDJKZQ_6` | `#0077b6` | `Line` | Pedal Acelerador a Arnés del Controlador | Arnés MCU |
| 21 | `DWKG` | `DDJKZQ_6` | `#0077b6` | `Line` | Selector de Marchas a Arnés del Controlador | Arnés MCU |
| 22 | `YB` | `DDJKZQ_6` | `#0077b6` | `Line` | Tablero a Arnés del Controlador | Arnés MCU |

### 2.2 Módulo `bevPrinciples` (`Page4`): Modelo Lógico y Flujo de Energía

El módulo `bevPrinciples` (`viewBox` `1280 x 760`) abstrae el vehículo eléctrico en **16 bloques funcionales**, **34 terminales** y **17 relaciones lógicas** que distinguen entre señales de control unidireccionales/bidireccionales (bus CAN), flujo de potencia eléctrica y acoplamiento mecánico. Ningún bloque de `bevPrinciples` utiliza imagen externa ni descripción personalizada en `data.js`; se renderizan como cajas rectangulares uniformes.

#### Catálogo de Tipos de Flujo de `bevPrinciples`

| `id` | Nombre en Interfaz | Color Hex | Tipo (`type`) | Grosor (`lineWidth`) | Descripción |
|---|---|---|---|---:|---|
| `sig_right` | Señal de Control (Derecha ->) | `#1d2a3a` | `RSArrow` | 3 | Flujo de datos/comando hacia la derecha |
| `sig_left` | Señal de Control (<- Izquierda) | `#1d2a3a` | `LSArrow` | 3 | Flujo de datos/comando hacia la izquierda |
| `sig_bi` | Señal de Control (Bidireccional <->) | `#1d2a3a` | `LRSArrow` | 3 | Comunicación bus CAN bidireccional |
| `pwr_right` | Potencia Eléctrica (Derecha =>) | `#1d2a3a` | `RDArrow` | 4 | Flujo de potencia eléctrica hacia la derecha |
| `pwr_left` | Potencia Eléctrica (<= Izquierda) | `#1d2a3a` | `LDArrow` | 4 | Flujo de potencia eléctrica hacia la izquierda |
| `pwr_bi` | Potencia Eléctrica (Bidireccional <=>) | `#1d2a3a` | `LRDArrow` | 4 | Flujo de potencia bidireccional (tracción y regeneración) |
| `mech` | Conexión Mecánica (Doble Línea ==) | `#1d2a3a` | `DLine` | 4 | Eje o acoplamiento mecánico de torsión |

#### Bloques Funcionales y Terminales de `bevPrinciples` (16 bloques, 34 terminales)

| Bloque (`id`) | Nombre Web | Caja `(x, y, w, h)` | Color Ref. | Terminales (`id`: `name` @ `(relX, relY)` $\rightarrow$ abs `(x, y)`) |
|---|---|---|---|---|
| `ZDTB` | Pedal de Freno | `(128, 182, 90, 30)` | `#ff8c00` | `ZDTB`: Salida Señal @ `(90, 15)` $\rightarrow$ `(218, 197)` |
| `JSTB` | Pedal de Acelerador | `(128, 225, 90, 30)` | `#e0a800` | `JSTB`: Salida Señal @ `(90, 15)` $\rightarrow$ `(218, 240)` |
| `DKDY` | Unidad de Control Electrónico (VCU) | `(267, 185, 110, 70)` | `#28a745` | `DKDY_L1`: Entrada Freno @ `(0, 20)` $\rightarrow$ `(267, 205)`; `DKDY_L2`: Entrada Acelerador @ `(0, 50)` $\rightarrow$ `(267, 235)`; `DKDY_R`: Control a Inversor @ `(110, 35)` $\rightarrow$ `(377, 220)`; `DKDY_B`: Bus a BMS @ `(55, 70)` $\rightarrow$ `(322, 255)` |
| `GLZHQ` | Convertidor de Potencia (Inversor) | `(432, 186, 110, 70)` | `#d39e00` | `GLZHQ_L`: Control VCU @ `(0, 35)` $\rightarrow$ `(432, 221)`; `GLZHQ_R`: Potencia Trifásica @ `(110, 35)` $\rightarrow$ `(542, 221)`; `GLZHQ_B`: Potencia DC Batería @ `(55, 70)` $\rightarrow$ `(487, 256)` |
| `SXGYDJ` | Motor de Inducción Trifásico | `(608, 180, 110, 76)` | `#dc3545` | `SXGYDJ_L`: Entrada Potencia @ `(0, 38)` $\rightarrow$ `(608, 218)`; `SXGYDJ_R`: Eje Mecánico @ `(110, 38)` $\rightarrow$ `(718, 218)` |
| `JXCDZZ` | Transmisión Mecánica | `(768, 198, 110, 50)` | `#007bff` | `JXCDZZ_L`: Entrada Motor @ `(0, 25)` $\rightarrow$ `(768, 223)`; `JXCDZZ_T`: Eje Rueda 1 @ `(55, 0)` $\rightarrow$ `(823, 198)`; `JXCDZZ_B`: Eje Rueda 2 @ `(55, 50)` $\rightarrow$ `(823, 248)` |
| `CL1` | Rueda Delantera / Izq. | `(785, 110, 76, 26)` | `#6f42c1` | `CL1`: Eje @ `(38, 26)` $\rightarrow$ `(823, 136)` |
| `CL2` | Rueda Trasera / Der. | `(785, 311, 76, 26)` | `#6f42c1` | `CL2`: Eje @ `(38, 0)` $\rightarrow$ `(823, 311)` |
| `NLGLXT` | Sistema de Gestión de Energía (BMS) | `(267, 375, 110, 70)` | `#fd7e14` | `NLGLXT_T`: Bus a VCU @ `(55, 0)` $\rightarrow$ `(322, 375)`; `NLGLXT_R`: Bus Batería @ `(110, 35)` $\rightarrow$ `(377, 410)`; `NLGLXT_B`: Bus Cargador @ `(55, 70)` $\rightarrow$ `(322, 445)` |
| `XDC` | Batería de Tracción (HV) | `(433, 375, 110, 70)` | `#17a2b8` | `XDC_T`: Potencia a Inversor @ `(55, 0)` $\rightarrow$ `(488, 375)`; `XDC_L`: Monitoreo BMS @ `(0, 35)` $\rightarrow$ `(433, 410)`; `XDC_R`: Potencia a Auxiliares @ `(110, 35)` $\rightarrow$ `(543, 410)`; `XDC_B`: Carga de Batería @ `(55, 70)` $\rightarrow$ `(488, 445)` |
| `FZDLY` | Fuente de Energía Auxiliar (DC-DC) | `(599, 375, 110, 70)` | `#d39e00` | `FZDLY_L`: Alimentación HV @ `(0, 35)` $\rightarrow$ `(599, 410)`; `FZDLY_R`: Potencia Dirección @ `(110, 35)` $\rightarrow$ `(709, 410)`; `FZDLY_B`: Potencia Climatización @ `(55, 70)` $\rightarrow$ `(654, 445)` |
| `DLZXDY` | Dirección Asistida Eléctrica (EPS) | `(767, 375, 110, 70)` | `#dc3545` | `DLZXDY_L`: Alimentación EPS @ `(0, 35)` $\rightarrow$ `(767, 410)`; `DLZXDY_R`: Entrada Volante @ `(110, 35)` $\rightarrow$ `(877, 410)` |
| `ZXP` | Volante de Dirección | `(947, 385, 80, 50)` | `#fd7e14` | `ZXP`: Sensor Giro @ `(0, 25)` $\rightarrow$ `(947, 410)` |
| `CDXT` | Sistema de Carga a Bordo (OBC) | `(433, 508, 110, 70)` | `#dc3545` | `CDXT_L`: Control BMS @ `(0, 35)` $\rightarrow$ `(433, 543)`; `CDXT_T`: Salida a Batería @ `(55, 0)` $\rightarrow$ `(488, 508)`; `CDXT_B`: Entrada Red Externa @ `(55, 70)` $\rightarrow$ `(488, 578)` |
| `WDKZDY` | Gestión Térmica / Climatización | `(600, 508, 110, 70)` | `#17a2b8` | `WDKZDY`: Alimentación @ `(55, 0)` $\rightarrow$ `(655, 508)` |
| `WJDY` | Red Eléctrica Externa (Toma Carga) | `(438, 639, 100, 35)` | `#007bff` | `WJDY`: Corriente AC/DC @ `(50, 0)` $\rightarrow$ `(488, 639)` |

#### Conexiones Oficiales de `bevPrinciples` (17 conexiones `answers`)

| # | `from` | `to` | `color` | `type` | Descripción Oficial (`name`) | Orientación Geométrica Esperada (Legacy C#) |
|---:|---|---|---|---|---|---|
| 1 | `ZDTB` | `DKDY_L1` | `#1d2a3a` | `RSArrow` | Pedal Freno -> VCU | Derecha (`ZDTB` $\rightarrow$ `DKDY`) |
| 2 | `JSTB` | `DKDY_L2` | `#1d2a3a` | `RSArrow` | Pedal Acelerador -> VCU | Derecha (`JSTB` $\rightarrow$ `DKDY`) |
| 3 | `DKDY_R` | `GLZHQ_L` | `#1d2a3a` | `LRSArrow` | VCU <-> Inversor | Bidireccional (`DKDY` $\leftrightarrow$ `GLZHQ`) |
| 4 | `GLZHQ_R` | `SXGYDJ_L` | `#1d2a3a` | `LRDArrow` | Inversor <=> Motor Trifásico | Bidireccional (`GLZHQ` $\Leftrightarrow$ `SXGYDJ`) |
| 5 | `SXGYDJ_R` | `JXCDZZ_L` | `#1d2a3a` | `DLine` | Motor == Transmisión | Mecánico (desfase Y de 5px dibujado recto por umbral `< 12`) |
| 6 | `CL1` | `JXCDZZ_T` | `#1d2a3a` | `DLine` | Rueda 1 == Transmisión | Mecánico vertical |
| 7 | `JXCDZZ_B` | `CL2` | `#1d2a3a` | `DLine` | Transmisión == Rueda 2 | Mecánico vertical |
| 8 | `DKDY_B` | `NLGLXT_T` | `#1d2a3a` | `LRSArrow` | VCU <-> BMS | Bidireccional vertical (`DKDY` $\leftrightarrow$ `NLGLXT`) |
| 9 | `GLZHQ_B` | `XDC_T` | `#1d2a3a` | `LDArrow` | Batería => Inversor | En C#, `a = GLZHQ(B)` arriba $\rightarrow$ flecha arriba (`XDC => GLZHQ`) |
| 10 | `NLGLXT_R` | `XDC_L` | `#1d2a3a` | `LRSArrow` | BMS <-> Batería | Bidireccional (`NLGLXT` $\leftrightarrow$ `XDC`) |
| 11 | `XDC_R` | `FZDLY_L` | `#1d2a3a` | `RDArrow` | Batería => Fuente Auxiliar | Derecha (`XDC` $\Rightarrow$ `FZDLY`) |
| 12 | `FZDLY_R` | `DLZXDY_L` | `#1d2a3a` | `RDArrow` | Fuente Auxiliar => Dirección Eléctrica | Derecha (`FZDLY` $\Rightarrow$ `DLZXDY`) |
| 13 | `DLZXDY_R` | `ZXP` | `#1d2a3a` | `LSArrow` | Volante -> Dirección Eléctrica | Izquierda (`ZXP` $\rightarrow$ `DLZXDY`) |
| 14 | `NLGLXT_B` | `CDXT_L` | `#1d2a3a` | `LRSArrow` | BMS <-> Cargador On-Board | Bidireccional (`NLGLXT` $\leftrightarrow$ `CDXT`) |
| 15 | `XDC_B` | `CDXT_T` | `#1d2a3a` | `LDArrow` | Cargador => Batería | En C#, `a = XDC(B)` arriba $\rightarrow$ flecha arriba (`CDXT => XDC`) |
| 16 | `CDXT_B` | `WJDY` | `#1d2a3a` | `LDArrow` | Red Externa => Cargador | En C#, `a = CDXT(B)` arriba $\rightarrow$ flecha arriba (`WJDY => CDXT`) |
| 17 | `FZDLY_B` | `WDKZDY` | `#1d2a3a` | `RDArrow` | Fuente Auxiliar => Gestión Térmica | En C#, `c = WDKZDY(T)` abajo $\rightarrow$ flecha abajo (`FZDLY => WDKZDY`) |

---

## 3. Separación e Interacción Alta Tensión (HV) vs. Baja Tensión (LV)

Una de las competencias centrales evaluadas en `bevWiring` (`Page3`) es el **aislamiento estricto entre el bus de Alta Tensión (HV) y el circuito auxiliar de Baja Tensión (LV, 12V)**, así como la identificación de los dos únicos puntos físicos donde ambos dominios interactúan de forma controlada.

### 3.1 Trazado Completo de los 5 Dominios Eléctricos

1. **Bus Positivo de Alta Tensión (`hv_pos`, rojo `#e63946`, 4 px)**:
   - Tramo batería-contactor-fusible principal: `DLDY_2 -> JJKG_1` $\rightarrow$ `JJKG_2 -> ZLJCQ_1` $\rightarrow$ `ZLJCQ_4 -> RDQ3_1` $\rightarrow$ `RDQ3_2 -> DXLJQ1_2`.
   - Derivación hacia el convertidor DC-DC: `DXLJQ1_1 -> RDQ1_2` $\rightarrow$ `RDQ1_1 -> DCDCZHQ_1`.
   - Derivación hacia el inversor (`MCU`): `DXLJQ1_3 -> RDQ2_1` $\rightarrow$ `RDQ2_2 -> DDJKZQ_4`.
   - Fases trifásicas AC de potencia (`U`, `V`, `W`): `DDJKZQ_5 -> DDJ_1` (`U`), `DDJKZQ_3 -> DDJ_2` (`V`), `DDJKZQ_1 -> DDJ_3` (`W`). *Nota de diseño*: el simulador reutiliza el cable rojo `hv_pos` para las tres fases AC del motor porque `Page3System.cs:69-71` les asignó `Color.Red` y `LineType.Line`.
2. **Bus Negativo de Alta Tensión (`hv_neg`, negro/pizarra `#1d2a3a`, 4 px)**:
   - Retorno principal de la batería: `DLDY_1 -> DXLJQ2_2`.
   - Retorno del convertidor DC-DC: `DCDCZHQ_4 -> DXLJQ2_1`.
   - Retorno del controlador/inversor: `DXLJQ2_3 -> DDJKZQ_2`.
   - **Regla crítica de seguridad HV**: el bus `HV-` converge exclusivamente en la regleta aislada `DXLJQ2` y **nunca** se puentea hacia el chasis ni hacia el retorno negativo `LV-` de 12V (`DY12V_3`, `DY12V_4`).
3. **Alimentación Positiva de Baja Tensión (`lv_pos`, morado `#9b5de5`, 3 px)**:
   - Recarga desde el convertidor DC-DC hacia la batería auxiliar: `DCDCZHQ_2 -> DY12V_2`.
   - Alimentación de control hacia la llave/relé de encendido: `DY12V_1 -> JDQKG_1`.
   - Señal de activación hacia la bobina del contactor principal: `JDQKG_2 -> ZLJCQ_2`.
4. **Retorno Negativo / Masa de Baja Tensión (`lv_neg`, gris `#6c757d`, 3 px)**:
   - Retorno negativo de carga del convertidor DC-DC: `DCDCZHQ_3 -> DY12V_3`.
   - Retorno a masa de la bobina del contactor principal: `DY12V_4 -> ZLJCQ_3`.
5. **Arnés de Señales del Controlador (`mcu_harness`, azul `#0077b6`, 3 px)**:
   - Tres líneas de señal convergen en el puerto multiplexado `DDJKZQ_6`: `JSTB -> DDJKZQ_6` (pedal acelerador), `DWKG -> DDJKZQ_6` (selector de marchas) y `YB -> DDJKZQ_6` (tablero de instrumentos).

### 3.2 Fronteras de Interacción HV / LV

En la topología del simulador existen exactamente **dos componentes frontera** donde coexisten terminales HV y LV sin cortocircuito eléctrico directo:

| Componente Frontera | Lado Alta Tensión (HV) | Lado Baja Tensión (LV 12V) | Mecanismo de Aislamiento / Interacción |
|---|---|---|---|
| `DCDCZHQ` (Convertidor DC-DC) | `DCDCZHQ_1` (`Entrada +`, `#e63946`), `DCDCZHQ_4` (`Entrada -`, `#1d2a3a`) | `DCDCZHQ_2` (`Salida +`, `#9b5de5`), `DCDCZHQ_3` (`Salida -`, `#6c757d`) | Conversión electrónica reductora (HV DC $\rightarrow$ 12V DC) con aislamiento galvánico interno entre primario HV y secundario LV; sustituye al alternador convencional. |
| `ZLJCQ` (Contactor DC Principal) | `ZLJCQ_1` (`Potencia In`, `#e63946`), `ZLJCQ_4` (`Potencia Out`, `#e63946`) | `ZLJCQ_2` (`Bobina +`, `#9b5de5`), `ZLJCQ_3` (`Bobina -`, `#6c757d`) | Acoplamiento electromagnético: cuando `JDQKG` cierra el lazo de 12V entre `DY12V_1` y `DY12V_4`, la bobina energizada cierra mecánicamente los contactos de potencia HV+ (`ZLJCQ_1` $\leftrightarrow$ `ZLJCQ_4`) manteniendo aislamiento dieléctrico entre bobina y circuito de tracción. |

---

## 4. Inversor / Controlador (`DDJKZQ` y `GLZHQ`), Baterías (`DLDY`/`XDC` y `DY12V`), y Contactores e Interbloqueos (`ZLJCQ`, `JDQKG`, `JJKG`, `RDQ1..3`)

### 4.1 Inversor / Controlador de Motor (`DDJKZQ` y `GLZHQ`)

El inversor cumple un rol doble según la vista:

- **En `bevWiring` (`DDJKZQ`, `Controlador de Motor (Inversor MCU)`)**:
  - **Entrada DC**: recibe potencia HV+ protegida por `RDQ2` en `DDJKZQ_4` (`+`) y retorno HV- desde `DXLJQ2_3` en `DDJKZQ_2` (`-`).
  - **Etapa de potencia trifásica**: convierte la corriente continua del bus HV en corriente alterna trifásica hacia el motor `DDJ` mediante tres bornes dedicados: `DDJKZQ_5 -> DDJ_1` (Fase `U`), `DDJKZQ_3 -> DDJ_2` (Fase `V`) y `DDJKZQ_1 -> DDJ_3` (Fase `W`). En el código Web (`data.js:239-241`), los tres tramos utilizan `hv_pos` (`#e63946`, `Line`).
  - **Concentrador de señales `DDJKZQ_6`**: único terminal de grado 3 del simulador (`JSTB`, `DWKG`, `YB` $\rightarrow$ `DDJKZQ_6` con `mcu_harness` `#0077b6`). Modela la recepción de solicitud de par (`JSTB`), estado PRND (`DWKG`) y telemetría hacia el clúster (`YB`).
- **En `bevPrinciples` (`GLZHQ`, `Convertidor de Potencia (Inversor)`)**:
  - **Enlace de control con la VCU**: comunicación CAN bidireccional `DKDY_R <-> GLZHQ_L` (`LRSArrow`).
  - **Enlace con el motor de inducción trifásico (`SXGYDJ`)**: potencia eléctrica bidireccional `GLZHQ_R <=> SXGYDJ_L` (`LRDArrow`), modelando tanto la tracción (inversor DC $\rightarrow$ AC) como el frenado regenerativo (rectificador AC $\rightarrow$ DC).
  - **Detalle de modelado en enlace con batería**: la unión `GLZHQ_B -> XDC_T` emplea `LDArrow` (unidireccional batería $\Rightarrow$ inversor), omitiendo gráficamente el retorno de recarga regenerativa hacia `XDC` en ese segmento.
- **En módulos híbridos (`GLZHQ` en `Page6`/`Page7`/`Page8`)**: actúa como convertidor/inversor dual integrando la potencia proveniente de `XDC_R` (puerto `GLZHQ_L`), la generación eléctrica desde el generador (`FDIJ_B -> GLZHQ_T` en serie; `FDJ1_B -> GLZHQ_T` en combinado) y la alimentación hacia el motor eléctrico de tracción (`GLZHQ_R -> FDOJ2_L` o `DDJ_L`).

### 4.2 Baterías: Paquete HV (`DLDY` / `XDC`), Auxiliar 12V (`DY12V`) y Cadena de Carga (`NLGLXT`, `CDXT`, `WJDY`)

El simulador modela dos sistemas de almacenamiento complementarios:

1. **Batería de Tracción de Alta Tensión (`DLDY` en `bevWiring`; `XDC` en `bevPrinciples` y `HEV`)**:
   - Provee la energía primaria de propulsión HV (`DLDY_2` `+` y `DLDY_1` `-` en `bevWiring`).
   - En `bevPrinciples`, `XDC` concentra cuatro enlaces simultáneos: suministro al inversor (`XDC_T => GLZHQ_B` vía `LDArrow`), suministro a auxiliares (`XDC_R => FZDLY_L` vía `RDArrow`), supervisión/telemetría bidireccional con el **BMS** (`NLGLXT_R <-> XDC_L` vía `LRSArrow`) y entrada de recarga desde el **cargador a bordo OBC** (`CDXT_T => XDC_B` vía `LDArrow`).
   - El **BMS (`NLGLXT`)** coordina el ecosistema de energía comunicándose por bus bidireccional (`LRSArrow`) con la VCU (`DKDY_B <-> NLGLXT_T`), la batería (`NLGLXT_R <-> XDC_L`) y el cargador (`NLGLXT_B <-> CDXT_L`).
   - La **cadena de carga externa** sigue la ruta `WJDY` (Red Eléctrica Externa) $\Rightarrow$ `CDXT_B` / `CDXT` (Cargador a Bordo OBC, `LDArrow`) $\Rightarrow$ `CDXT_T` $\Rightarrow$ `XDC_B` (`LDArrow`), regulada por `NLGLXT`.
2. **Batería Auxiliar de 12V (`DY12V` en `bevWiring`)**:
   - Suministra energía de baja tensión a la lógica de activación (`DY12V_1 -> JDQKG_1` con `lv_pos`) y recibe el retorno de la bobina del contactor (`DY12V_4 -> ZLJCQ_3` con `lv_neg`).
   - Se recarga continuamente desde el convertidor DC-DC (`DCDCZHQ_2 -> DY12V_2` positivo y `DCDCZHQ_3 -> DY12V_3` negativo). En `bevPrinciples`, el bloque equivalente es `FZDLY` (`Fuente de Energía Auxiliar (DC-DC)`), que alimenta la dirección asistida (`FZDLY_R => DLZXDY_L`, comandada por `ZXP` vía `LSArrow`) y la gestión térmica/climatización (`FZDLY_B => WDKZDY`).

### 4.3 Contactores, Fusibles e Interbloqueos (`ZLJCQ`, `JDQKG`, `JJKG`, `RDQ1..3`)

La secuencia de energización y protección modelada en `bevWiring` responde a la siguiente jerarquía:

1. **Interruptor de Emergencia / MSD (`JJKG`)**: ubicado inmediatamente aguas abajo del polo positivo `DLDY_2` (`DLDY_2 -> JJKG_1`, `JJKG_2 -> ZLJCQ_1`). Representa el desconectador manual de servicio (*Manual Service Disconnect*) para mantenimiento seguro o corte de emergencia.
2. **Relé de Llave / Encendido (`JDQKG`)**: interruptor de baja tensión (12V) alimentado desde `DY12V_1`. Al cerrarse, envía +12V desde `JDQKG_2` hacia `ZLJCQ_2`, completando el circuito de excitación de la bobina gracias al retorno `ZLJCQ_3 -> DY12V_4`.
3. **Contactor Principal DC (`ZLJCQ`)**: solo cuando `JJKG` está cerrado y `JDQKG` energiza la bobina 12V (`ZLJCQ_2`/`ZLJCQ_3`), el contactor cierra el paso de alta tensión positiva desde `ZLJCQ_1` hacia `ZLJCQ_4`.
4. **Jerarquía de Fusibles (`RDQ3`, `RDQ1`, `RDQ2`)**:
   - `RDQ3` (*Fusible 3 - Línea Principal HV*): protege toda la troncal aguas abajo del contactor (`ZLJCQ_4 -> RDQ3_1`, `RDQ3_2 -> DXLJQ1_2`) antes de llegar a la regleta distribuidora positiva `DXLJQ1`.
   - `RDQ1` (*Fusible 1 - DC-DC*): protege la derivación hacia el convertidor auxiliar (`DXLJQ1_1 -> RDQ1_2`, `RDQ1_1 -> DCDCZHQ_1`).
   - `RDQ2` (*Fusible 2 - Controlador*): protege la alimentación de potencia hacia el inversor (`DXLJQ1_3 -> RDQ2_1`, `RDQ2_2 -> DDJKZQ_4`).

#### Interbloqueos del Mundo Real Omitidos por el Modelo

Para mantenimiento y uso docente debe tenerse presente que, a diferencia de un tren motriz BEV real de producción:

- **No hay contactor negativo (`HV-`)**: `DLDY_1` va directo a `DXLJQ2_2`, por lo que el polo negativo permanece acoplado al bus incluso con `ZLJCQ` abierto.
- **No hay circuito de precarga**: no existe relé ni resistencia limitadora en paralelo con `ZLJCQ` para cargar suavemente el banco de capacitores de `DDJKZQ` antes del cierre principal.
- **No hay `HVIL` ni `IMD`**: el simulador no verifica la continuidad de bucles de tapa/conector (`HVIL`) ni la resistencia de aislamiento respecto al chasis (`IMD`) antes de permitir el cierre de `JDQKG`/`ZLJCQ`.

---

## 5. Arquitecturas Híbridas: Serie (`hybridSeries` / `Page6`), Paralelo (`hybridParallel` / `Page7`) y Combinada (`hybridCombined` / `Page8`)

Los tres módulos híbridos comparten exactamente el mismo catálogo de 3 tipos de línea (`cableTypes`) en `web/js/data.js` (provenientes de `Page6System.cs`, `Page7System.cs` y `Page8System.cs`):

| `id` | Nombre en Interfaz | Color Hex | Tipo (`type`) | Grosor (`lineWidth`) | Significado Físico |
|---|---|---|---|---:|---|
| `elec` | Conexión Eléctrica (Línea Continua) | `#1d2a3a` | `Line` | 4 | Enlace de potencia eléctrica (DC o AC entre batería, generador, inversor y motor) |
| `mech` | Conexión Mecánica (Doble Línea) | `#1d2a3a` | `DLine` | 4 | Eje o acoplamiento mecánico de par/velocidad |
| `fuel` | Línea de Combustible (Fluido Rojo) | `#e63946` | `Line` | 4 | Suministro de combustible líquido desde el tanque `YX` al motor térmico |

### 5.1 Arquitectura Híbrida en Serie (`hybridSeries` / `Page6`)

En la configuración **en serie** (`viewBox` `1200 x 700`), el motor de combustión interna (`FDOJ`) **no tiene acoplamiento mecánico con las ruedas**. Toda la potencia térmica se transforma en electricidad mediante el generador (`FDIJ`), alimenta el convertidor/inversor (`GLZHQ`) —el cual también interactúa con la batería de tracción (`XDC`)— y propulsa las ruedas exclusivamente mediante el motor eléctrico de tracción (`FDOJ2`) acoplado a la transmisión (`CGZZ`).

#### Dispositivos y Terminales de `hybridSeries` (7 dispositivos, 12 terminales)

| `id` | Nombre Web | Caja `(x, y, w, h)` | Color Ref. | Terminales (`id`: `name` @ `(relX, relY)` $\rightarrow$ abs `(x, y)`) |
|---|---|---|---|---|
| `YX` | Tanque de Combustible | `(220, 140, 100, 60)` | `#ff8c00` | `YX_R`: Salida Combustible @ `(100, 30)` $\rightarrow$ `(320, 170)` |
| `FDOJ` | Motor de Combustión | `(420, 140, 100, 60)` | `#d63384` | `FDOJ_L`: Entrada Combustible @ `(0, 30)` $\rightarrow$ `(420, 170)`; `FDOJ_B`: Eje hacia Generador @ `(50, 60)` $\rightarrow$ `(470, 200)` |
| `FDIJ` | Generador Eléctrico | `(420, 290, 100, 60)` | `#28a745` | `FDIJ_T`: Eje desde Motor Térmico @ `(50, 0)` $\rightarrow$ `(470, 290)`; `FDIJ_B`: Salida Eléctrica AC @ `(50, 60)` $\rightarrow$ `(470, 350)` |
| `XDC` | Batería de Tracción | `(220, 440, 100, 60)` | `#17a2b8` | `XDC_R`: Potencia Batería @ `(100, 30)` $\rightarrow$ `(320, 470)` |
| `GLZHQ` | Convertidor / Inversor | `(420, 440, 100, 60)` | `#dc3545` | `GLZHQ_T`: Entrada desde Generador @ `(50, 0)` $\rightarrow$ `(470, 440)`; `GLZHQ_L`: Puerto Batería @ `(0, 30)` $\rightarrow$ `(420, 470)`; `GLZHQ_R`: Salida a Motor Eléctrico @ `(100, 30)` $\rightarrow$ `(520, 470)` |
| `FDOJ2` | Motor Eléctrico de Tracción | `(620, 440, 100, 60)` | `#e0a800` | `FDOJ2_L`: Entrada Eléctrica @ `(0, 30)` $\rightarrow$ `(620, 470)`; `FDOJ2_R`: Eje de Salida @ `(100, 30)` $\rightarrow$ `(720, 470)` |
| `CGZZ` | Transmisión / Ruedas | `(820, 440, 100, 60)` | `#dc3545` | `CGZZ_L`: Entrada Mecánica @ `(0, 30)` $\rightarrow$ `(820, 470)` |

#### Conexiones Oficiales de `hybridSeries` (6 conexiones)

| # | `from` | `to` | `color` | `type` | Descripción (`name`) |
|---:|---|---|---|---|---|
| 1 | `YX_R` | `FDOJ_L` | `#e63946` | `Line` | Tanque -> Motor Combustión (Combustible) |
| 2 | `FDOJ_B` | `FDIJ_T` | `#1d2a3a` | `DLine` | Motor Combustión == Generador (Mecánico) |
| 3 | `FDIJ_B` | `GLZHQ_T` | `#1d2a3a` | `Line` | Generador -> Convertidor (Eléctrico) |
| 4 | `XDC_R` | `GLZHQ_L` | `#1d2a3a` | `Line` | Batería <-> Convertidor (Eléctrico) |
| 5 | `GLZHQ_R` | `FDOJ2_L` | `#1d2a3a` | `Line` | Convertidor -> Motor Eléctrico (Eléctrico) |
| 6 | `FDOJ2_R` | `CGZZ_L` | `#1d2a3a` | `DLine` | Motor Eléctrico == Transmisión (Mecánico) |

**Nota sobre defecto heredado `FDOJ2` y errores tipográficos pinyin en `Page6`**: en `BIZ/Page6/Page6DeviceType.cs:22-23`, el componente `FDOJ2` llevaba erróneamente el atributo `[Description("发动机")]` ("Motor de Combustión"), idéntico a `FDOJ` (líneas 14-15), a pesar de recibir energía eléctrica de `GLZHQ` y entregar par mecánico a `CGZZ`. La versión Web corrige su etiqueta visible a `"Motor Eléctrico de Tracción"` conservando el `id` `"FDOJ2"` por trazabilidad. Igualmente se conservan las erratas pinyin originales `FDOJ` (por `FDJ`, *FāDòngJī*), `FDIJ` (por `FDJ`, *FāDiànJī*) y `CGZZ` (por `CDZZ`, *ChuánDòng ZhuāngZhì*).

### 5.2 Arquitectura Híbrida en Paralelo (`hybridParallel` / `Page7`)

En la configuración **en paralelo** (`viewBox` `1200 x 700`), no existe generador independiente: tanto el motor de combustión (`FDJ`) como el motor eléctrico (`DDJ`) entregan par mecánico directamente sobre un acoplador/transmisión sumador (`CDZZ`), permitiendo propulsión térmica pura, eléctrica pura o combinada (asistencia de par) y recarga vía `DDJ` $\rightarrow$ `GLZHQ` $\rightarrow$ `XDC` en frenado o carga activa.

#### Dispositivos y Terminales de `hybridParallel` (6 dispositivos, 10 terminales)

| `id` | Nombre Web | Caja `(x, y, w, h)` | Color Ref. | Terminales (`id`: `name` @ `(relX, relY)` $\rightarrow$ abs `(x, y)`) |
|---|---|---|---|---|
| `YX` | Tanque de Combustible | `(220, 140, 100, 60)` | `#ff8c00` | `YX_R`: Salida Combustible @ `(100, 30)` $\rightarrow$ `(320, 170)` |
| `FDJ` | Motor de Combustión | `(420, 140, 100, 60)` | `#d63384` | `FDJ_L`: Entrada Combustible @ `(0, 30)` $\rightarrow$ `(420, 170)`; `FDJ_R`: Eje Mecánico @ `(100, 30)` $\rightarrow$ `(520, 170)` |
| `XDC` | Batería de Tracción | `(220, 290, 100, 60)` | `#e0a800` | `XDC_R`: Terminal Potencia @ `(100, 30)` $\rightarrow$ `(320, 320)` |
| `GLZHQ` | Convertidor / Inversor | `(420, 290, 100, 60)` | `#dc3545` | `GLZHQ_L`: Conexión Batería @ `(0, 30)` $\rightarrow$ `(420, 320)`; `GLZHQ_R`: Conexión Motor @ `(100, 30)` $\rightarrow$ `(520, 320)` |
| `DDJ` | Motor Eléctrico | `(620, 290, 100, 60)` | `#17a2b8` | `DDJ_L`: Entrada Eléctrica @ `(0, 30)` $\rightarrow$ `(620, 320)`; `DDJ_R`: Eje Mecánico @ `(100, 30)` $\rightarrow$ `(720, 320)` |
| `CDZZ` | Acoplador Mecánico y Transmisión | `(820, 140, 100, 210)` | `#28a745` | `CDZZ_L1`: Entrada Motor Combustión @ `(0, 30)` $\rightarrow$ `(820, 170)`; `CDZZ_L2`: Entrada Motor Eléctrico @ `(0, 180)` $\rightarrow$ `(820, 320)` |

#### Conexiones Oficiales de `hybridParallel` (5 conexiones)

| # | `from` | `to` | `color` | `type` | Descripción (`name`) |
|---:|---|---|---|---|---|
| 1 | `YX_R` | `FDJ_L` | `#e63946` | `Line` | Tanque -> Motor Térmico (Combustible) |
| 2 | `FDJ_R` | `CDZZ_L1` | `#1d2a3a` | `DLine` | Motor Térmico == Acoplador (Mecánico) |
| 3 | `XDC_R` | `GLZHQ_L` | `#1d2a3a` | `Line` | Batería <-> Convertidor (Eléctrico) |
| 4 | `GLZHQ_R` | `DDJ_L` | `#1d2a3a` | `Line` | Convertidor <-> Motor Eléctrico (Eléctrico) |
| 5 | `DDJ_R` | `CDZZ_L2` | `#1d2a3a` | `DLine` | Motor Eléctrico == Acoplador (Mecánico) |

### 5.3 Arquitectura Híbrida Combinada / Serie-Paralelo (`hybridCombined` / `Page8`)

En la configuración **combinada** (`viewBox` `1200 x 720`, equivalente funcional del sistema *Power-Split Device / Toyota Hybrid Synergy Drive*), el motor térmico (`FDJ`) posee **dos salidas mecánicas**: una directa hacia el divisor planetario y transmisión (`FDJ_R -> CDZZ_L1`) y otra hacia el generador eléctrico `MG1` (`FDJ_B -> FDJ1_T`). El generador `FDJ1` alimenta al inversor dual (`GLZHQ_T`), el cual gestiona el flujo eléctrico bidireccional con la batería (`XDC_R -> GLZHQ_L`) y con el motor de tracción `MG2` (`GLZHQ_R -> DDJ_L`), cuyo eje también converge mecánicamente en el divisor planetario (`DDJ_R -> CDZZ_L2`). Esto habilita operación simultánea en modo serie (generación + tracción eléctrica) y en modo paralelo (tracción mecánica directa + eléctrica).

#### Dispositivos y Terminales de `hybridCombined` (7 dispositivos, 14 terminales)

| `id` | Nombre Web | Caja `(x, y, w, h)` | Color Ref. | Terminales (`id`: `name` @ `(relX, relY)` $\rightarrow$ abs `(x, y)`) |
|---|---|---|---|---|
| `YX` | Tanque de Combustible | `(220, 140, 100, 60)` | `#ff8c00` | `YX_R`: Salida Combustible @ `(100, 30)` $\rightarrow$ `(320, 170)` |
| `FDJ` | Motor de Combustión | `(420, 140, 100, 60)` | `#d63384` | `FDJ_L`: Entrada Combustible @ `(0, 30)` $\rightarrow$ `(420, 170)`; `FDJ_R`: Eje hacia Transmisión @ `(100, 30)` $\rightarrow$ `(520, 170)`; `FDJ_B`: Eje hacia Generador @ `(50, 60)` $\rightarrow$ `(470, 200)` |
| `FDJ1` | Generador Eléctrico (MG1) | `(420, 290, 100, 60)` | `#e0a800` | `FDJ1_T`: Eje desde Motor Térmico @ `(50, 0)` $\rightarrow$ `(470, 290)`; `FDJ1_B`: Salida Eléctrica a Inversor @ `(50, 60)` $\rightarrow$ `(470, 350)` |
| `XDC` | Batería de Tracción | `(220, 440, 100, 60)` | `#e0a800` | `XDC_R`: Potencia Batería @ `(100, 30)` $\rightarrow$ `(320, 470)` |
| `GLZHQ` | Convertidor / Inversor Dual | `(420, 440, 100, 60)` | `#dc3545` | `GLZHQ_T`: Entrada desde Generador @ `(50, 0)` $\rightarrow$ `(470, 440)`; `GLZHQ_L`: Puerto Batería @ `(0, 30)` $\rightarrow$ `(420, 470)`; `GLZHQ_R`: Salida a Motor Eléctrico @ `(100, 30)` $\rightarrow$ `(520, 470)` |
| `DDJ` | Motor Eléctrico (MG2) | `(620, 440, 100, 60)` | `#17a2b8` | `DDJ_L`: Entrada Eléctrica @ `(0, 30)` $\rightarrow$ `(620, 470)`; `DDJ_R`: Eje hacia Transmisión @ `(100, 30)` $\rightarrow$ `(720, 470)` |
| `CDZZ` | Divisor Planetario y Transmisión | `(820, 140, 100, 360)` | `#28a745` | `CDZZ_L1`: Entrada Motor Térmico @ `(0, 30)` $\rightarrow$ `(820, 170)`; `CDZZ_L2`: Entrada Motor Eléctrico @ `(0, 330)` $\rightarrow$ `(820, 470)` |

#### Conexiones Oficiales de `hybridCombined` (7 conexiones)

| # | `from` | `to` | `color` | `type` | Descripción (`name`) |
|---:|---|---|---|---|---|
| 1 | `YX_R` | `FDJ_L` | `#e63946` | `Line` | Tanque -> Motor Térmico (Combustible) |
| 2 | `FDJ_R` | `CDZZ_L1` | `#1d2a3a` | `DLine` | Motor Térmico == Divisor (Mecánico) |
| 3 | `XDC_R` | `GLZHQ_L` | `#1d2a3a` | `Line` | Batería <-> Inversor (Eléctrico) |
| 4 | `GLZHQ_R` | `DDJ_L` | `#1d2a3a` | `Line` | Inversor <-> Motor Eléctrico (Eléctrico) |
| 5 | `DDJ_R` | `CDZZ_L2` | `#1d2a3a` | `DLine` | Motor Eléctrico == Transmisión (Mecánico) |
| 6 | `FDJ_B` | `FDJ1_T` | `#1d2a3a` | `DLine` | Motor Térmico == Generador MG1 (Mecánico) |
| 7 | `FDJ1_B` | `GLZHQ_T` | `#1d2a3a` | `Line` | Generador MG1 -> Inversor (Eléctrico) |

---

## 6. Motor de Simulación, Validación y Paridad Legacy C# vs. Web

### 6.1 Arquitectura del Motor Web (`WiringSimulator`, `app.js`, `audio.js`, `style.css`)

1. **Ciclo de vida y estado (`web/js/simulator.js:4-92`)**:
   - `loadModule(moduleKey)` reinicia `lines = []`, `history = []`, `selectedPin = null`, `isDeleteMode = false`, `isShowingSolution = false`, `lastValidation = null`, selecciona `config.cableTypes[0]` y llama a `render()`.
   - `setCableType(cableId)` cambia `selectedCable`, desactiva `isDeleteMode` y actualiza los botones de interfaz con `updateControlsUI()`.
   - `setDeleteMode(enable)` activa o desactiva el modo borrado, limpia `selectedPin` al activar, actualiza botones y re-renderiza las líneas.
2. **Conexión libre y doble modo de eliminación (`onPinClick` y `renderLines`, `simulator.js:206-266, 470-488`)**:
   - En modo edición (`!isDeleteMode`), el primer clic marca el terminal origen (`.pin-active`, amarillo `#ffbe0b`), clic repetido cancela selección, y el segundo clic sobre un terminal distinto verifica que no exista ya un cable no dirigido entre ambos (`lines.some(l => (l.from === p1 && l.to === p2) || (l.from === p2 && l.to === p1))`). Si no existe, añade `{ id, from: p1, to: p2, color, type, lineWidth }` y registra `{ action: "add", line }` en `history`.
   - En modo eliminar (`isDeleteMode`), hacer clic sobre un **terminal** elimina **todos** los cables conectados a ese pin (comportamiento clave para el puerto compartido `DDJKZQ_6`, que puede tener hasta 3 cables) registrando cada uno en `history` con `{ action: "remove", line }`; hacer clic sobre el área transparente de un **cable** (`.cable-hit-area`, `stroke-width="20"`) elimina únicamente ese cable individual.
3. **Deshacer (`undo`), Limpiar (`clear`) y Solución (`toggleSolution`)**:
   - `undo()` (`simulator.js:58-71`, accesible con `Ctrl+Z`/`Cmd+Z` en `app.js:220-225`) revierte la última acción `"add"` o `"remove"` de `this.history`.
   - `clear()` (`simulator.js:73-82`) vacía tanto `this.lines` como `this.history` de forma irreversible.
   - `toggleSolution()` (`simulator.js:84-92`) conmuta `this.isShowingSolution`, dibujando `this.config.answers` sin sobrescribir `this.lines`.
4. **Enrutado ortogonal SVG (`calculateOrthogonalPath`, `simulator.js:515-532`)**:
   - Si `|x1 - x2| < 12` o `|y1 - y2| < 12`, traza segmento recto `M x1 y1 L x2 y2`.
   - En caso contrario, calcula `midX = x1 + (x2 - x1) / 2` y traza un codo Manhattan de 3 segmentos (`M x1 y1 L midX y1 L midX y2 L x2 y2`).
5. **Validación topológica (`validate()`, `simulator.js:94-181`)**:
   - Si `userLines.length === 0`, falla inmediatamente con `"Aún no se ha realizado ninguna conexión en el sistema."`.
   - Recorre cada `uLine` buscando en `answers` (usando un `Set` `matchedAnswers` para evitar emparejamientos dobles) una entrada con los mismos terminales en **cualquier orden** (`from/to` o `to/from`). Si existe par, exige igualdad estricta de `uLine.type === expected.type` e igualdad insensible a mayúsculas de `uLine.color.toLowerCase() === expected.color.toLowerCase()`.
   - Calcula `missingCount = answers.length - matchedAnswers.size` y declara éxito únicamente cuando `correctCount === answers.length && userLines.length === answers.length`.
   - Al validar, `renderLines()` colorea en verde agua (`#2ec4b6` + animación `.cable-animated` en líneas simples/flechas) los cables válidos y en rojo (`#e63946`) los inválidos.
6. **Controlador SPA, modal técnico y síntesis de audio (`app.js`, `audio.js`)**:
   - `app.js` gestiona las 4 vistas (`view_home`, `view_bev_menu`, `view_hev_menu`, `view_simulator`), la ficha técnica modal `#device_modal` al hacer clic en cualquier dispositivo (ocultando `#modal_img` cuando `device.image` no existe) y la tecla `Escape` para cerrar modal o cancelar selección de pin.
   - `audio.js` (`SoundEffects`) genera efectos sonoros procedurales mediante `AudioContext` (`playClick`, `playConnect`, `playDisconnect`, `playSuccess` en arpegio Do-Mi-Sol-Do, `playError` en onda diente de sierra 260/220 Hz) sin depender de archivos `.mp3` externos.

### 6.2 Funcionamiento del Motor Legacy C# (`DeviceSystemBase.cs`)

El proyecto WinForms original (`SynapticsPointingDeviceDriver.sln`, .NET Framework 4.8) se basa en una arquitectura de **líneas pre-pobladas ocultas**:

- Cada terminal es una instancia separada de `DeviceBase` (`BIZ/DeviceBase.cs`) asociada a un `CheckBox` de `16x16` px posicionado alrededor del rectángulo (`SurroundType`) y con `Tag = index`.
- Las subclases `Page3System`, `Page4System`, `Page6System`, `Page7System` y `Page8System` llaman a `Add(dev1, dir1, dev2, dir2, color, lineType)` que inserta **simultáneamente** el mismo objeto lógico en `lines` y en `answers`, inicializándose cada `LineBase` con `Visible = false` (`BIZ/LineBase.cs:31`).
- En `CheckBox_CheckedChanged` (`BIZ/DeviceSystemBase.cs:218-269`), cuando `count >= 2` terminales marcados, el motor busca el par exacto `(Device1, Device2)` dentro de `lines`. Si lo halla y `IsAdd && LineType != LineType.None`, guarda una instantánea en `history`, asigna `LineColor` y `LineType`, activa `Visible = true` y desmarca ambos `CheckBox`. Si `!IsAdd` (modo eliminar), establece `Visible = false`.
- **Bloqueo en pares no válidos**: si el usuario marca dos terminales que no forman parte de `lines` (o no seleccionó tipo de línea), el bucle termina sin acción y **no desmarca los `CheckBox`**, dejando `count >= 2` bloqueado hasta desmarcarlos manualmente.
- `Run()` (`DeviceSystemBase.cs:812-872`) exige que todas las `lines` tengan `Visible == true` y coincidan en `LineType` y `LineColor` con `answers`, añadiendo `"成功"` (rojo) o `"失败"` (negro) en `Messages` sin limpiar mensajes previos.

### 6.3 Catálogo Completo de Paridad, Correcciones y Discrepancias (C# vs. Web)

La auditoría cruzada confirma **100 % de paridad topológica (57/57 aristas, 52/52 dispositivos, 112/112 terminales)** entre `BIZ/Page3..Page8` y `web/js/data.js`, con las siguientes diferencias, correcciones y defectos conocidos:

| Área | Comportamiento Legacy C# | Comportamiento Web (`web/`) | Impacto y Diagnóstico |
|---|---|---|---|
| Defecto de etiqueta `FDOJ2` (`Page6`) | `Page6DeviceType.cs:22-23` etiqueta `FDOJ2` como `"发动机"` (Motor de Combustión) | `data.js:377` lo corrige a `"Motor Eléctrico de Tracción"` manteniendo `id: "FDOJ2"` | Corrección semántica imprescindible; en C# confundía al alumno con un segundo ICE. |
| Error de etiqueta `DXLJQ2_3` (`Page3`) | `Page3System.cs:33` etiqueta el pin como `"电动机（-）"` (Motor `-`) aunque va a `DDJKZQ_2` | `data.js:99` corrige a `name: "Retorno Controlador (-)"`, `label: "Controlador (-)"` | Corrección física real: el motor trifásico AC no tiene bus DC negativo. |
| Paradigma de cableado | Líneas pre-pobladas ocultas (`Visible = false`); `CheckBox` atascados en pares no definidos | Cableado libre entre cualquier par de pines distintos con diagnóstico cable por cable | Mejora pedagógica sustancial en Web, habilitando detección de errores topológicos reales. |
| **Bug de dirección de flecha en `bevPrinciples`** | `DrawLine()` (`DeviceSystemBase.cs:576-665`) ordena geométricamente `a` (arriba/izq.) y `c` (abajo/der.) independiente del orden de clic | `simulator.js:454-461` fija `marker-end` / `marker-start` según el orden de clic `(from -> to)`, mientras `validate()` (`123-125`) ignora el orden | **Bug activo**: si el usuario conecta en orden inverso (ej. `DKDY_L1 -> ZDTB` con `RSArrow`), `validate()` aprueba aunque la flecha apunta al revés; si compensa eligiendo `LSArrow`, falla la validación. Especialmente sensible en `LDArrow` (`GLZHQ_B -> XDC_T`, `XDC_B -> CDXT_T`, `CDXT_B -> WJDY`) y `LSArrow` (`DLZXDY_R -> ZXP`). |
| Omisión CSS `.status-info` | Mensajes dibujados en `OnPaint` (`Color.Red` / `Color.Black`) | `toggleSolution()` (`simulator.js:88`) emite `state: "info"` $\rightarrow$ `status-info` (`app.js:106`), sin regla `.status-bar.status-info` en `style.css:530-553` | Al ver la solución, `#sim_status_bar` pierde el borde izquierdo de acento visual. |
| `dev.color` sin uso en SVG | `Page4/6/7/8` rellenan cada caja con `item.Back` (`Color.FromArgb`) | `data.js` define `color` en los 52 dispositivos, pero `simulator.js:333-340` nunca lo lee; `.device-rect` usa `#152033` fijo (`style.css:557`) | Diferencia puramente estética; facilita futura diferenciación por color de bloque si se desea. |
| `DLine` y parámetro `offset` | `DrawLine()` dibuja dos líneas paralelas separadas 10 px (`arrow = 10`, `±5 px`, `lines 688-782`) | `simulator.js:443-448` superpone un trazo de `5 px` y otro blanco central de `2 px` sobre la misma ruta; `offset` en `createPath()` (`504`) no se usa | Visualmente equivalente, pero debe saberse que `createPath(..., offset)` ignora el quinto parámetro. |
| `loadModule()` no llama `updateControlsUI()` | Cada `Form` se instancia nuevo | `loadModule()` (`simulator.js:20-38`) pone `isDeleteMode = false` sin llamar `updateControlsUI()` | Si el usuario cambia de módulo con Modo Eliminar activo, `#btn_delete_mode` conserva la clase roja `.active-danger` hasta el siguiente clic en cable o botón. |
| `onPinClick()` durante `isShowingSolution` | N/A (`ShowAllLines()` comentado) | `onPinClick()` (`simulator.js:206-266`) no bloquea clics cuando `isShowingSolution === true` | Los clics mientras se ve la solución modifican `this.lines` de forma oculta hasta cerrar la vista de solución. |
| Marcos `GroupBase` en `Page3`/`4`/`6`/`7`/`8` | `Page3/4/6/7/8` dibujan marcos titulados (`Page3System.cs:89` también define `"选线框"` vía `GroupBase`, con `"电力驱动系统"` comentado en la línea 96; `Page4/6/7/8` añaden marcos homólogos) | Web omite marcos `GroupBase` y traslada las opciones de línea al panel lateral `#cables_list` | Simplificación responsiva del lienzo SVG. |
| Alineación de `CDZZ` y cajas en `Page4`/`7`/`8` | `Page7.CDZZ` `h=200` con pines `L41/L44` (`y=165/315`); `Page8.CDZZ` pines `L81/L88` (`y=162/477`); `Page4` cajas pequeñas | Web ajusta `Page7.CDZZ` `h=210` y pines `CDZZ_L1/L2` a `y=170/320`; `Page8.CDZZ` a `y=170/470`; `Page4` amplía bloques (`SXGYDJ_R` `y=218` vs `JXCDZZ_L` `y=223`, 5 px rectos por umbral `< 12`) | Alineación horizontal exacta de aristas en paralelo y combinado. |
| Pines al borde y etiquetas nuevas en `Page3` | `CheckBox` `16x16` fuera del rectángulo (p. ej. `DDJ_1..3` escalonados `y=379,359,339`); 7 terminales con `""` | Pines sobre el borde exacto (`DDJ_1..3` en `relY=0`); añade etiquetas en español a los 7 pines vacíos (`DY12V_1`, `DY12V_4`, `ZLJCQ_1..4`, `DDJKZQ_6`) | Evita terminales anónimos en la interfaz y el modal técnico. |
| Audio de validación | `DeviceSystemBase.cs:860` hardcodea `@"""D:\zhuomian\SynapticsPointingDeviceDriver1\bin\Debug\Source\voice.mp3"""` con `SoundPlayer` (falla silenciosamente) | Web Audio API sintética en `web/js/audio.js` | Cero dependencias de archivos de audio locales. |
| Código muerto y archivos faltantes en `.csproj` | `Page6/7/8System.cs` crean variable muerta `t2`; `.csproj` declara 16 archivos ausentes en disco (15 `.cs`/`.resx`: `AttributeHelper.cs`, `Page1.*`, `Page2.Designer.cs/.resx`, `Page3.*`, `Page4.*`, `Page5.cs/.resx`, `Page6.cs`, más `App.config` en `SynapticsPointingDeviceDriver.csproj:163`) | No aplica en Web | El proyecto C# ya no era compilable desde fuente en disco; su lógica real residía únicamente en `BIZ/`. |

---

## 7. Guía de Mantenimiento Futuro y Trazabilidad Legacy C# -> Web

### 7.1 Mapa de Archivos del Repositorio Web Autónomo

Una vez completada la limpieza de los artefactos legacy C# / Visual Studio, la arquitectura operativa del proyecto queda integrada por los siguientes archivos y carpetas conservados:

| Ruta | Rol Técnico | Notas de Mantenimiento |
|---|---|---|
| `index.html` | Redirección de entrada raíz hacia `web/index.html` | Mantiene compatibilidad tanto por `file://` como por servidor HTTP. |
| `iniciar_simulador.bat` | Lanzador directo en Windows (`start "" "%~dp0web\index.html"`) | Permite ejecución sin servidor local ni instalación previa. |
| `ANOTACIONES_APRENDIZAJE.md` | Documento maestro de aprendizaje y mantenimiento (UTF-8 sin BOM, LF) | Fuente canónica; debe mantenerse sincronizado con `web/js/notes_data.js` en M2+. |
| `web/index.html` | Shell SPA con vistas (`view_home`, `view_bev_menu`, `view_hev_menu`, `view_simulator`, más `#view_notes` en M2) y modal `#device_modal` | Referencia scripts locales en orden: `data.js`, `audio.js`, `simulator.js`, (`notes_data.js`, `notes_renderer.js` en M2), `app.js`. |
| `web/css/style.css` | Hoja de estilos oscuros, animaciones SVG y diseño responsivo | Definir aquí `.status-bar.status-info` si se desea borde azul/cian al mostrar solución. |
| `web/js/data.js` | Base de datos declarativa `SIMULATOR_DATA` (5 módulos, 52 dispositivos, 112 pines, 57 respuestas) | Única fuente de verdad topológica de los simuladores. |
| `web/js/simulator.js` | Motor SVG `WiringSimulator`, rutas Manhattan, validación, deshacer y modo borrado | Contiene la lógica de renderizado de flechas, pines e interacción. |
| `web/js/app.js` | Controlador de navegación SPA, barra de estado, atajos (`Ctrl+Z`, `Esc`) y modal técnico | En `#nav_back` (`línea 168`) decide menú previo según `moduleKey.startsWith("bev")`. |
| `web/js/audio.js` | Sintetizador Web Audio API (`SoundEffects`, instancia global `sounds`) | Cero recursos externos; silenciable con `sounds.enabled = false`. |
| `web/js/notes_data.js` y `notes_renderer.js` | Contenido Markdown embebido (`window.LEARNING_NOTES_MD`) y renderizador con TOC (agregados en M2) | Evita bloqueos CORS de `fetch()` bajo protocolo `file://`. |
| `web/img/` | 32 archivos de imagen locales: 15 activos en inglés referenciados, 1 copia en inglés sin uso (`bg_pure_ev.jpg`) y 16 duplicados legacy en chino/código | Solo las 15 imágenes referenciadas en `web/index.html` y `web/js/data.js` son requeridas en ejecución. |
| `rea/` y `rea.cmd` | Herramienta externa `rea-agents` conservada | Independiente del simulador; no modificar durante mantenimiento del simulador. |

### 7.2 Recetas Paso a Paso para Extender el Simulador

#### Reglas de Coordenadas SVG y Etiquetado de Pines (`simulator.js:286, 400-404`)

El lienzo SVG usa origen `(0, 0)` en la esquina superior izquierda (`+x` derecha, `+y` abajo) con `preserveAspectRatio="xMidYMid meet"` y `viewBox` definido por `canvasWidth` y `canvasHeight`:

- `bevWiring`: `1440 x 860`
- `bevPrinciples`: `1280 x 760`
- `hybridSeries` y `hybridParallel`: `1200 x 700`
- `hybridCombined`: `1200 x 720`

La posición absoluta de un terminal es `(dev.x + pin.relX, dev.y + pin.relY)` y el anclaje automático de su etiqueta (`pin.label`) sigue estas reglas exactas en `simulator.js:400-404`:

```js
const offsetX = pin.relX === 0 ? -12 : (pin.relX >= dev.width ? 12 : 0);
const offsetY = pin.relY === 0 ? -12 : (pin.relY >= dev.height ? 16 : -10);
// text-anchor: offsetX < 0 ? "end" : (offsetX > 0 ? "start" : "middle")
```

#### Cómo Agregar un Tipo de Cable, Dispositivo, Conexión o Nuevo Módulo

1. **Agregar un tipo de cable**: en `SIMULATOR_DATA.<modulo>.cableTypes`, añadir `{ id, name, color, type, lineWidth, desc }`, donde `type` debe pertenecer a `"Line"`, `"DLine"`, `"RSArrow"`, `"LSArrow"`, `"LRSArrow"`, `"RDArrow"`, `"LDArrow"` o `"LRDArrow"`.
2. **Agregar un dispositivo y terminales**: en `SIMULATOR_DATA.<modulo>.devices`, insertar el objeto `{ id, name, x, y, width, height, color, terminals: [...] }`, opcionalmente con `desc` e `image` (guardando el recurso gráfico en `web/img/`). Asegurar que cada `terminal.id` sea único dentro del módulo y ubicar `relX`/`relY` sobre los bordes del rectángulo.
3. **Agregar una conexión válida**: en `SIMULATOR_DATA.<modulo>.answers`, añadir `{ from, to, color, type, name }` garantizando que `color` (comparado en minúsculas) y `type` coincidan exactamente con algún elemento de `cableTypes`. En módulos con flechas direccionales (`RSArrow`, `LSArrow`, `RDArrow`, `LDArrow`), ordenar `(from, to)` de forma consistente con la dirección visual esperada al hacer clic.
4. **Agregar un módulo completo**:
   - Definir una nueva clave en `SIMULATOR_DATA` (`web/js/data.js`).
   - Añadir la tarjeta HTML en `web/index.html` dentro de `#view_bev_menu` o `#view_hev_menu`.
   - Registrar su listener `openModule("<nuevaClave>")` en `web/js/app.js`.
   - Revisar la lógica de retorno en `#nav_back` (`web/js/app.js:168`), que actualmente envía a `bevMenu` solo si `simulator.moduleKey.startsWith("bev")` y a `hevMenu` en cualquier otro caso.
5. **Sincronizar anotaciones web**: tras actualizar `ANOTACIONES_APRENDIZAJE.md`, regenerar `web/js/notes_data.js` (`window.LEARNING_NOTES_MD`) para conservar la lectura offline bajo `file://`, respetando encabezados `h1`–`h4` sin saltos de nivel ni títulos duplicados, tablas GFM de una sola línea por celda y bloques cercados con triple acento grave.

### 7.3 Tablas de Trazabilidad Completa Legacy C# -> Web

#### Correspondencia de Formularios, Sistemas y Vistas

| Clase / Form Legacy C# | Título Original (zh) | Clave Web / Vista (`web/`) | Título Web (es) |
|---|---|---|---|
| `Program.cs` (`Page1`) | — (Pantalla principal) | `index.html` $\rightarrow$ `web/index.html` (`#view_home`) | Sistema de Aprendizaje y Práctica del Sistema de Accionamiento Eléctrico |
| `Page2` (`Page2.cs`) | — (Submenú BEV) | `#view_bev_menu` | Sistema de Tracción de Vehículo Eléctrico Puro |
| `Page3` / `Page3System` | `电动汽车电驱动实训系统` | `SIMULATOR_DATA.bevWiring` (`Page3`) | Simulador de Cableado y Conexiones Prácticas (BEV) |
| `Page4` / `Page4System` | `纯电动工作原理学习系统` | `SIMULATOR_DATA.bevPrinciples` (`Page4`) | Sistema de Principio de Funcionamiento (BEV) |
| `Page5` (`Page5.Designer.cs`) | `混合动力电动汽车驱动系统` | `#view_hev_menu` | Sistema de Tracción de Vehículos Eléctricos Híbridos |
| `Page6` / `Page6System` | `串联式混合动力系统` | `SIMULATOR_DATA.hybridSeries` (`Page6`) | Sistema Híbrido en Serie |
| `Page7` / `Page7System` | `并联式混合动力系统` | `SIMULATOR_DATA.hybridParallel` (`Page7`) | Sistema Híbrido en Paralelo |
| `Page8` / `Page8System` | `混联式混合动力系统` | `SIMULATOR_DATA.hybridCombined` (`Page8`) | Sistema Híbrido Combinado (Serie-Paralelo) |

#### Correspondencia de Tipos de Línea (`BIZ/LineType.cs`) y Colores

| C# `LineType` + `Color` | Etiqueta C# (zh) | `cableTypes[].id` (Web) | `type` Web | Color Web | Módulos |
|---|---|---|---|---|---|
| `Line` + `Color.Red` | `高压电源正极` | `hv_pos` | `Line` | `#e63946` | `bevWiring` |
| `Line` + `Color.Black` | `高压电源负极` | `hv_neg` | `Line` | `#1d2a3a` | `bevWiring` |
| `Line` + `Color.Purple` | `低压电源正极` | `lv_pos` | `Line` | `#9b5de5` | `bevWiring` |
| `Line` + `Color.Gray` | `低压电源负极` | `lv_neg` | `Line` | `#6c757d` | `bevWiring` |
| `Line` + `Color.Blue` | `电动机控制器线束` | `mcu_harness` | `Line` | `#0077b6` | `bevWiring` |
| `RSArrow` + `Color.Black` | `信号连接` | `sig_right` | `RSArrow` | `#1d2a3a` | `bevPrinciples` |
| `LSArrow` + `Color.Black` | `信号连接` | `sig_left` | `LSArrow` | `#1d2a3a` | `bevPrinciples` |
| `LRSArrow` + `Color.Black` | `信号连接` | `sig_bi` | `LRSArrow` | `#1d2a3a` | `bevPrinciples` |
| `RDArrow` + `Color.Black` | `电力连接` | `pwr_right` | `RDArrow` | `#1d2a3a` | `bevPrinciples` |
| `LDArrow` + `Color.Black` | `电力连接` | `pwr_left` | `LDArrow` | `#1d2a3a` | `bevPrinciples` |
| `LRDArrow` + `Color.Black` | `电力连接` | `pwr_bi` | `LRDArrow` | `#1d2a3a` | `bevPrinciples` |
| `DLine` + `Color.Black` | `机械连接` | `mech` | `DLine` | `#1d2a3a` | `bevPrinciples`, `HEV` |
| `Line` + `Color.Black` | `电力连接` | `elec` | `Line` | `#1d2a3a` | `hybridSeries`, `Parallel`, `Combined` |
| `Line` + `Color.Red` | `液流连接` | `fuel` | `Line` | `#e63946` | `hybridSeries`, `Parallel`, `Combined` |

#### Correspondencia de Recursos Gráficos (`Source/` -> `web/img/`)

| Archivo Legacy (`Source/`) | Recurso Activo (`web/img/`) | Copia Legacy en `web/img/` | Uso en Web |
|---|---|---|---|
| `Source\12V电源.png` | `img/battery_12v.png` | `web/img/12V电源.png` | `bevWiring` (`DY12V`) |
| `Source\DC-DC转换器.png` | `img/dcdc_converter.png` | `web/img/DC-DC转换器.png` | `bevWiring` (`DCDCZHQ`) |
| `Source\仪表.png` | `img/dashboard.png` | `web/img/仪表.png` | `bevWiring` (`YB`) |
| `Source\加速踏板.png` | `img/accelerator_pedal.png` | `web/img/加速踏板.png` | `bevWiring` (`JSTB`) |
| `Source\动力电源.png` | `img/traction_battery.png` | `web/img/动力电源.png` | `bevWiring` (`DLDY`), `web/index.html` |
| `Source\档位开关.png` | `img/gear_switch.png` | `web/img/档位开关.png` | `bevWiring` (`DWKG`) |
| `Source\熔断器.png` | `img/fuse.png` | `web/img/熔断器.png` | `bevWiring` (`RDQ1`, `RDQ2`, `RDQ3`) |
| `Source\电动机.png` | `img/electric_motor.png` | `web/img/电动机.png` | `bevWiring` (`DDJ`), favicon, fallback |
| `Source\电动机控制器.png` | `img/motor_controller.png` | `web/img/电动机控制器.png` | `bevWiring` (`DDJKZQ`), `web/index.html` |
| `Source\电线连接器.png` | `img/wire_connector.png` | `web/img/电线连接器.png` | `bevWiring` (`DXLJQ1`, `DXLJQ2`) |
| `Source\直流接触器.png` | `img/dc_contactor.png` | `web/img/直流接触器.png` | `bevWiring` (`ZLJCQ`) |
| `Source\紧急开关.png` | `img/emergency_switch.png` | `web/img/紧急开关.png` | `bevWiring` (`JJKG`) |
| `Source\继电器开关.png` | `img/relay_switch.png` | `web/img/继电器开关.png` | `bevWiring` (`JDQKG`) |
| `Source\CDDQC.jpg` | `img/bg_pure_ev.jpg` (sin referencia) | `web/img/CDDQC.jpg` | Fondo legacy `Page1`/`Page2` (sin referencia activa en `web/index.html`) |
| `Source\HHDL.jpg` | `img/bg_hybrid_car.jpg` | `web/img/HHDL.jpg` | `web/index.html` tarjeta HEV |
| `Source\DDQC.jpg` | `img/bg_electric_car.jpg` | `web/img/DDQC.jpg` | `web/index.html` tarjeta BEV |

#### Diccionario Completo de Identificadores Pinyin (`Page3`..`Page8` -> Web)

| ID Pinyin | Significado Chino (`[Description]`) | Significado Técnico en Español | Módulos Donde Aparece |
|---|---|---|---|
| `DCDCZHQ` | `DC-DC转换器` | Convertidor DC-DC (`_1`..`_4`) | `bevWiring` |
| `RDQ1`, `RDQ2`, `RDQ3` | `熔断器` | Fusible 1 (DC-DC), Fusible 2 (MCU), Fusible 3 (Principal HV) | `bevWiring` |
| `DXLJQ1`, `DXLJQ2` | `电线连接器` | Regleta Distribuidora Positiva (`_1.._3`) y Negativa (`_1.._3`) | `bevWiring` |
| `DY12V` | `12V电源` | Batería Auxiliar de 12V (`_1.._4`) | `bevWiring` |
| `JDQKG` | `继电器开关` | Interruptor de Relé / Llave (`_1.._2`) | `bevWiring` |
| `DLDY` | `动力电源` | Batería de Tracción HV (`_1.._2`) | `bevWiring` |
| `JJKG` | `紧急开关` | Interruptor de Emergencia MSD (`_1.._2`) | `bevWiring` |
| `ZLJCQ` | `直流接触器` | Contactor de Corriente Directa DC (`_1.._4`) | `bevWiring` |
| `DDJKZQ` | `电动机控制器` | Controlador de Motor / Inversor MCU (`_1.._6`) | `bevWiring` |
| `DDJ` | `电动机` | Motor Eléctrico Trifásico (`_1.._3` en BEV; `_L/_R` en HEV; MG2 en combinado) | `bevWiring`, `hybridParallel`, `hybridCombined` |
| `JSTB` | `加速踏板` | Pedal de Acelerador | `bevWiring`, `bevPrinciples` |
| `DWKG` | `档位开关` | Selector de Marchas | `bevWiring` |
| `YB` | `仪表` | Tablero de Instrumentos | `bevWiring` |
| `ZDTB` | `制动踏板` | Pedal de Freno | `bevPrinciples` |
| `DKDY` | `电控单元` | Unidad de Control Electrónico VCU (`L1/L2` $\leftarrow$ `L21/L22`, `R`, `B`) | `bevPrinciples` |
| `GLZHQ` | `功率转换器` | Convertidor de Potencia / Inversor (`L/R/B` o `T/L/R`) | `bevPrinciples`, `hybridSeries`, `Parallel`, `Combined` |
| `SXGYDJ` | `三相感应电机` | Motor de Inducción Trifásico (`_L`, `_R`) | `bevPrinciples` |
| `JXCDZZ` | `机械传动装置` | Transmisión Mecánica (`L` $\leftarrow$ `L21`, `T`, `B`) | `bevPrinciples` |
| `CL1`, `CL2` | `车轮` | Rueda Delantera/Izq. y Rueda Trasera/Der. | `bevPrinciples` |
| `NLGLXT` | `能量管理系统` | Sistema de Gestión de Energía BMS (`_T`, `_R`, `_B`) | `bevPrinciples` |
| `XDC` | `蓄电池` | Batería de Tracción HV (`_T/_L/_R/_B` o `_R`) | `bevPrinciples`, `hybridSeries`, `Parallel`, `Combined` |
| `FZDLY` | `辅助动力源` | Fuente de Energía Auxiliar DC-DC (`_L`, `_R`, `_B`) | `bevPrinciples` |
| `DLZXDY` | `动力转向单元` | Dirección Asistida Eléctrica EPS (`_L`, `_R`) | `bevPrinciples` |
| `ZXP` | `转向盘` | Volante de Dirección | `bevPrinciples` |
| `CDXT` | `充电系统` | Sistema de Carga a Bordo OBC (`_L`, `_T`, `_B`) | `bevPrinciples` |
| `WDKZDY` | `温度控制单元` | Gestión Térmica / Climatización | `bevPrinciples` |
| `WJDY` | `外接电源` | Red Eléctrica Externa (Toma Carga) | `bevPrinciples` |
| `YX` | `油箱` | Tanque de Combustible (`_R`) | `hybridSeries`, `Parallel`, `Combined` |
| `FDOJ`, `FDJ` | `发动机` | Motor de Combustión Interna (`FDOJ` es errata pinyin de `FDJ`) | `hybridSeries` (`FDOJ`), `Parallel`/`Combined` (`FDJ`) |
| `FDIJ`, `FDJ1` | `发电机` | Generador Eléctrico (`FDIJ` errata en serie; `FDJ1` MG1 en combinado) | `hybridSeries` (`FDIJ`), `hybridCombined` (`FDJ1`) |
| `FDOJ2` | `发动机` *(defecto C#)* | Motor Eléctrico de Tracción (corregido en Web, ID preservado) | `hybridSeries` |
| `CGZZ`, `CDZZ` | `传动装置` | Transmisión / Acoplador / Divisor Planetario (`CGZZ` errata en serie; `L1/L2` $\leftarrow$ `L41/L44` o `L81/L88`) | `hybridSeries` (`CGZZ`), `Parallel`/`Combined` (`CDZZ`) |
