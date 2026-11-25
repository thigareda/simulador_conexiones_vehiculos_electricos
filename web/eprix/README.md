# E-Prix Didaktikos (v2, Fundamentado)

Módulo didáctico interactivo de simulación de carreras eléctricas en circuito cerrado para la plataforma educativa **Didaktikos** (didaktikos.com.mx).

---

## 1. Misión Pedagógica y Principios Rectores

El objetivo de **E-Prix Didaktikos** es permitir al estudiante comprender de forma tangible e intuitiva:
1. **La química de la batería importa:** LFP no se calienta igual que NCM, NiMH entrega grandes pulsos pero es pesada, y el Plomo-ácido sufre las consecuencias de su baja energía específica y alto efecto Peukert.
2. **El C-rate calienta:** Al exigir el doble de corriente ($2C$), el calentamiento instantáneo Joule ($Q = I^2 \cdot R_{\text{int}}$) se cuadruplica ($4\times$).
3. **El SOC debe administrarse:** Correr a fondo en modo «Ataque» agota la batería antes de meta o provoca derating térmico, mientras que levantar el pedal y gestionar el SOC permite cruzar la bandera a cuadros con potencia intacta.
4. **El freno regenerativo tiene límites técnicos:** Cancelado si $\text{SOC} > 80\%$, limitado entre $70\text{--}80\%$, detenido a $T \ge 55\,{^\circ}\text{C}$ o a velocidades muy bajas ($v < 1\,\text{m/s}$), donde los frenos hidráulicos son la garantía física de seguridad.

---

## 2. Cómo Ejecutar

### Modo Standalone Autónomo (Recomendado)
El módulo no requiere ningún paso de compilación, empaquetador ni servidor backend.

1. Abrir directamente en cualquier navegador web moderno:
   - Doble clic en `web/eprix/eprix.html` (protocolo `file://`).
   - O usando cualquier servidor HTTP local:
     ```bash
     python3 -m http.server 8000
     # Navegar a: http://localhost:8000/web/eprix/eprix.html
     ```

2. Reproducibilidad determinista por URL:
   - Puede fijarse la semilla PRNG mediante el parámetro `?seed=`:
     `http://localhost:8000/web/eprix/eprix.html?seed=1234`

---

## 3. Cómo Ejecutar las Pruebas Automatizadas

La suite de pruebas se ejecuta de forma nativa con Node.js (v22+) sin dependencias externas:

```bash
node --test web/eprix/tests/*.test.mjs
```

### Salida Real de `node --test`:
```
TAP version 13
# Subtest: AC-02: Armado de pack(350 V, 50 Ah, celda 3.7 V / 25 Ah) -> 95S2P, 351.5 V, 50 Ah [F31·s34]
ok 1 - AC-02: Armado de pack(350 V, 50 Ah, celda 3.7 V / 25 Ah) -> 95S2P, 351.5 V, 50 Ah [F31·s34]
# Subtest: AC-03: Duplicar C-rate duplica I y caída de tensión, y cuadruplica el calor instantáneo [F31·s24]
ok 2 - AC-03: Duplicar C-rate duplica I y caída de tensión, y cuadruplica el calor instantáneo [F31·s24]
# Subtest: AC-04: Freno regenerativo: mapa de tres límites [F30·s31, F30·s32]
ok 3 - AC-04: Freno regenerativo: mapa de tres límites [F30·s31, F30·s32]
# Subtest: AC-05: Derating en frío: a 0 °C la carga permitida es <= 0.3C [F31·s21]
ok 4 - AC-05: Derating en frío: a 0 °C la carga permitida es <= 0.3C [F31·s21]
# Subtest: AC-06: T > 45 °C reduce P_disponible de forma monótona [F31·s24]
ok 5 - AC-06: T > 45 °C reduce P_disponible de forma monótona [F31·s24]
# Subtest: AC-07: La curva N(DOD) cumple N(0.5) / N(1.0) ≈ 2.5 [F31·s26]
ok 6 - AC-07: La curva N(DOD) cumple N(0.5) / N(1.0) ≈ 2.5 [F31·s26]
# Subtest: Data: Catálogo de 16 combinaciones exactas (4 plataformas x 4 químicas)
ok 7 - Data: Catálogo de 16 combinaciones exactas (4 plataformas x 4 químicas)
# Subtest: Data: Citas canónicas y anti-alucinación [F30·s01-s50], [F31·s01-s69]
ok 8 - Data: Citas canónicas y anti-alucinación [F30·s01-s50], [F31·s01-s69]
# Subtest: Data: 4 Circuitos generados y waypoints válidos
ok 9 - Data: 4 Circuitos generados y waypoints válidos
# Subtest: Data: Las 5 trampas didácticas canónicas (§3.9)
ok 10 - Data: Las 5 trampas didácticas canónicas (§3.9)
# Subtest: AC-01: Cálculo canónico de autonomía de 232 ± 1 km con datos de 3.8 [F30·s25]
ok 11 - AC-01: Cálculo canónico de autonomía de 232 ± 1 km con datos de 3.8 [F30·s25]
# Subtest: Física: Límites de adherencia y aceleración F_grip = 0.55 · m · g
ok 12 - Física: Límites de adherencia y aceleración F_grip = 0.55 · m · g
# Subtest: AC-08: Determinismo PRNG: Misma semilla -> misma clasificación y mismos tiempos (± 0.01 s)
ok 13 - AC-08: Determinismo PRNG: Misma semilla -> misma clasificación y mismos tiempos (± 0.01 s)
# Subtest: AC-09: 4 vueltas completas en < 8 min (< 480 s) de simulación a 1x en circuito de referencia
ok 14 - AC-09: 4 vueltas completas en < 8 min (< 480 s) de simulación a 1x en circuito de referencia
# Subtest: AC-13, AC-14, AC-15: Calibración, equilibrio, terminación, spread <= 35%, plomo más lento y victorias por química
ok 15 - AC-13, AC-14, AC-15: Calibración, equilibrio, terminación, spread <= 35%, plomo más lento y victorias por química
1..15
# tests 15
# pass 15
# fail 0
```

---

## 4. Estado de los 18 Criterios de Aceptación (AC-01 a AC-18)

| ID | Criterio de Aceptación | Método de Comprobación | Estado |
|---|---|---|---|
| **AC-01** | `autonomia()` devuelve $232 \pm 1\,\text{km}$ con los datos canónicos de §3.8 | Test unitario (`tests/physics.test.mjs`) | **CONFORME** |
| **AC-02** | `pack(350 V, 50 Ah, celda 3.7 V / 25 Ah)` devuelve `95S2P, 351.5 V, 50 Ah` | Test unitario (`tests/battery.test.mjs`) | **CONFORME** |
| **AC-03** | Duplicar C-rate duplica corriente $I$ y $\Delta V$, y cuadruplica calor instantáneo $Q$ | Test unitario (`tests/battery.test.mjs`) | **CONFORME** |
| **AC-04** | Regen = 0 con SOC 0.85; limitada con SOC 0.75; libre con SOC 0.50 | Test unitario (`tests/battery.test.mjs`) | **CONFORME** |
| **AC-05** | A 0 °C la tasa de recarga admisible es $\le 0.3C$ | Test unitario (`tests/battery.test.mjs`) | **CONFORME** |
| **AC-06** | $T > 45\,{^\circ}\text{C}$ reduce $P_{\text{disponible}}$ de forma monótona | Test unitario (`tests/battery.test.mjs`) | **CONFORME** |
| **AC-07** | Curva $N(\text{DOD})$ cumple $N(0.5)/N(1.0) \approx 2.5$ ($2^{1.322}$) | Test unitario (`tests/battery.test.mjs`) | **CONFORME** |
| **AC-08** | Misma semilla PRNG $\rightarrow$ idéntica clasificación y tiempos ($\pm 0.01\,\text{s}$) | Test de integración (`tests/race.test.mjs`) | **CONFORME** |
| **AC-09** | 4 vueltas completas en $< 8\,\text{min}$ ($< 480\,\text{s}$) de simulación a 1× | Test de integración (`tests/race.test.mjs`) | **CONFORME** |
| **AC-10** | Exactamente 4 coches distintos; botón de inicio bloqueado con 3, 5 o duplicados | Validación en UI (`validateGrid()`) | **CONFORME** |
| **AC-11** | Controles de selección de circuito y coches bloqueados durante la carrera | Guardas `if (state.isRacing) return` | **CONFORME** |
| **AC-12** | 60 FPS promedio con 4 coches; sin frames $> 33\,\text{ms}$ en 10 s | Medición Canvas 2D / `requestAnimationFrame` | **CONFORME** |
| **AC-13** | Swing de SOC oscila entre 45 % y 80 % en 4 vueltas (piloto equilibrado) | `calibrate.mjs`: rango obtenido [46.0%, 75.2%] | **CONFORME** |
| **AC-14** | 16 combinaciones terminan; spread $\le 35\,\%$ y plomo es el más lento en los 4 circuitos | `calibrate.mjs`: spread 26.68 %, plomo último en 4/4 | **CONFORME** |
| **AC-15** | Cada química gana al menos una métrica en la tabla de resultados | LFP (vida/SOH), NCM (tiempo), NiMH (vuelta rápida/regen), Plomo (costo/calor) | **CONFORME** |
| **AC-16** | Sin errores de consola; cero peticiones de red externas (todo local) | Verificado en DevTools | **CONFORME** |
| **AC-17** | Contraste de colores $\ge 4.5:1$, foco visible y navegación por teclado | WCAG AA / tecla Esc para pausar | **CONFORME** |
| **AC-18** | `eprix.html` abre standalone sin el resto del sitio web | Verificado con protocolo `file://` y HTTP | **CONFORME** |

---

## 5. Clasificación de Datos: Fuente Canónica vs Parámetros de Diseño

| Concepto | Nivel de Confianza | Fuente / Justificación |
|---|---|---|
| Tensiones de celda LFP (3.2 V nom, 3.65 V corte, 2.5 V min) | **A** | Diapositivas [F31·s14], [F31·s43] |
| Tensiones de celda NCM (3.7 V nom, 4.25 V corte, 3.0 V min) | **A** | Diapositivas [F31·s43], [F31·s44] |
| Tensiones de celda NiMH (1.2 V nom, 1.5 V corte, 1.0 V min) | **A** | Diapositiva [F31·s40] |
| Tensiones de celda Plomo (2.0 V nom, 2.7 V corte, 1.6 V min) | **A** | Diapositiva [F31·s36] |
| Derating en frío ($\le 0.3C$ a 0 °C) | **A** | Diapositiva [F31·s21] |
| Tres límites de freno regenerativo ($>80\%$, $70\text{--}80\%$, baja velocidad) | **A** | Diapositivas [F30·s31], [F30·s32] |
| Fórmula de resistencia al avance y aerodinámica ($C_d \cdot A \cdot U_a^2 / 21.15$) | **A** | Diapositiva [F30·s24] |
| Ejercicio de autonomía de 232 km ($1700\,\text{kg}, 4\,\text{m}^2, 50\,\text{kWh}$) | **A** | Diapositiva [F30·s25] |
| Curva de vida según DOD ($N(\text{DOD}) = N_{100} \cdot (1/\text{DOD})^{1.322}$) | **B** | Inferencia directa de $400\,\text{ciclos al } 100\% \leftrightarrow 1000\,\text{al } 50\%$ [F31·s26] |
| Efecto Peukert en litio vs plomo ($k = 1.02$ litio, $k = 1.30$ plomo) | **B** | Deducción matemática de [F31·s20] |
| Dimensiones y masas base de plataformas (Urbano, Sedán, Camioneta, Utilitario) | **C** | Parámetros de diseño del simulador (declarados en UI) |
| Densidad gravimétrica a nivel de pack ($120\,\text{Wh/kg}$ LFP, $200\,\text{Wh/kg}$ NCM) | **C** | Parámetros de diseño coherentes con rango de celda $150\text{--}250\,\text{Wh/kg}$ [F31·s16] |
| Límite de adherencia longitudinal ($F_{\text{grip}} = 0.55 \cdot m \cdot g$) | **C** | Parámetro de diseño para obligar a frenar en curvas |
| LTO (Titanato de Litio) | **C** | Unidad experimental externa, sin anclas F31 |
