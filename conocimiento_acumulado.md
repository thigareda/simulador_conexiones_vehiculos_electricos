# Conocimiento Acumulado · Plataforma Didaktikos y Módulos de Electromovilidad

**Repositorio:** `simulador_conexiones_vehiculos_electricos`  
**Plataforma Web:** [didaktikos.com.mx](https://didaktikos.com.mx)  
**Fecha de consolidación:** Noviembre de 2026  
**Fuentes Canónicas Primarias:**
- `4b. Estructura y funcionamiento de VNE - version didactica.pptx` (F30, 50 diapositivas, anclas `[F30·s01]` a `[F30·s50]`).
- `9b. Bateria de potencia - conceptos y principio (version didactica).pptx` (F31, 69 diapositivas, anclas `[F31·s01]` a `[F31·s69]`).
- `9-11动力电池基本概念与工作原理（11.2版96页）_单语(1).pptx` (F32, referencia complementaria original).

---

## 1. Jerarquía de Verdad y Reglas de Evidencia

Para preservar la integridad pedagógica e ingenieril del simulador, toda cifra, constante y comportamiento se rige bajo la siguiente escala de confianza visible en el código y en la interfaz:

1. **Grado A (Explícito):** Dato textual extraído directamente de las fuentes canónicas F30 y F31 con su respectiva cita ancla (ej. `[F31·s43]`, `[F30·s25]`).
2. **Grado B (Inferencia directa):** Deducción matemática reproducible a partir de dos o más pasajes explícitos (ej. derivación de la ley de ciclos $N(\text{DOD})$ o multiplicaciones en cascada de eficiencias $\eta_{\text{total}}$).
3. **Grado C (Parámetro de diseño / Dato externo):** Parámetros de aproximación vehicular, masas de carrocería, coeficientes aerodinámicos o químicas fuera del corpus canónico (ej. Titanato de Litio - LTO). Debe estar documentado explícitamente como `// C: parámetro de diseño, no proviene de F30/F31` y no portar citas inventadas.

### Reglas Anti-Alucinación
- No citar anclas inexistentes: F30 abarca exclusivamente de `s01` a `s50`; F31 abarca de `s01` a `s69`.
- No presentar umbrales de laboratorio (ej. $0.70/0.80$ de SOC o corte a $45\,{^\circ}\text{C}$) como normas universales inflexibles: el corpus los define como rangos representativos y típicos `[F30·s32][F31·s21]`.
- LTO (Titanato de Litio) es un dato externo de apoyo comparativo, no mencionado en la fuente F31.

---

## 2. Fundamentos Electroquímicos y Modelado de Baterías

### 2.1 Químicas de Celdas de Tracción

| Química | Tensión Nominal ($V_{\text{nom}}$) | Corte de Carga ($V_{\text{max}}$) | Corte de Descarga ($V_{\text{min}}$) | Densidad Pack ($Wh/kg$) | Resistencia Interna ($R_{\text{int}}$) | Ciclos $N_{100}$ | Carácter y Aplicación | Confianza / Cita |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **LFP** ($\text{LiFePO}_4$) | $3.2\text{ V}$ | $3.65\text{ V}$ | $2.5\text{--}3.0\text{ V}$ | $110\text{--}130$ | $60\text{ m}\Omega$ | $4\,000$ | Máxima estabilidad térmica, económica, larga vida; energía moderada. | A `[F31·s43]` |
| **NCM / NCA** | $3.7\text{ V}$ | $4.25\text{ V}$ | $3.0\text{ V}$ | $180\text{--}220$ | $50\text{ m}\Omega$ | $2\,000$ | Máxima energía gravimétrica y potencia; mayor sensibilidad térmica. | A `[F31·s43]` |
| **LMO** | $3.7\text{ V}$ | $4.20\text{ V}$ | $3.0\text{ V}$ | $140\text{--}170$ | $70\text{ m}\Omega$ | $1\,000$ | Segura y de bajo costo; degradación acelerada a alta temperatura. | A `[F31·s43]` |
| **NiMH** | $1.2\text{ V}$ | $1.50\text{ V}$ | $1.0\text{ V}$ | $70\text{--}95$ | $120\text{ m}\Omega$ | $1\,500$ | Muy robusta para híbridos (HEV); autodescarga alta ($\sim 20\%$/mes). | A `[F31·s40]` |
| **Plomo-Ácido** | $2.0\text{ V}$ | $2.70\text{ V}$ | $1.6\text{ V}$ | $30\text{--}40$ | $150\text{ m}\Omega$ | $500$ | Económica y funcional en amplio rango ($-40$ a $60\,{^\circ}\text{C}$); muy pesada. | A `[F31·s36]` |
| **LTO** (Titanato) | $2.4\text{ V}$ | $2.80\text{ V}$ | $1.5\text{ V}$ | $60\text{--}80$ | $40\text{ m}\Omega$ | $>15\,000$ | Carga ultrarrápida (hasta 10C), altísima vida; baja energía específica. | C (Externo) |

### 2.2 Distinción Crítica: Capacidad vs. Energía y Armado de Pack
- **Capacidad ($Ah$):** Cantidad de carga transportable $Q = I \times t$ `[F31·s15]`.
- **Energía ($kWh$):** Trabajo eléctrico total $E = Q \times V_{\text{nominal}}$.
  $$\text{Ejemplo canónico: } 100\text{ Ah} \times 355\text{ V} = 35.5\text{ kWh} \quad \text{vs.} \quad 100\text{ Ah} \times 12\text{ V} = 1.2\text{ kWh}$$
- **La energía específica domina la masa del vehículo `[F31·s16]`:**
  - $60\text{ kWh}$ con tecnología NCM ($150\text{ Wh/kg}$) pesan $\approx 400\text{ kg}$.
  - $60\text{ kWh}$ con tecnología Plomo ($40\text{ Wh/kg}$) pesan $\approx 1\,500\text{ kg}$.
- **C-rate es intensivo:** La agrupación de celdas en paralelo incrementa la capacidad y la corriente admisible en idéntica proporción; la agrupación en serie incrementa el voltaje sin alterar la tasa de descarga horaria `[F31·s22]`.
- **Secuencia de conexión y BMS:** Se agrupa primero en paralelo y luego en serie ($N_s S N_p P$); el BMS supervisa cada rama en paralelo y cada nodo en serie `[F31·s33]`.
  $$\text{Caso canónico [F31·s34]: Pack de } 350\text{ V, } 50\text{ Ah con celdas de } 3.7\text{ V, } 25\text{ Ah} \implies 95S2P \text{ (190 celdas, } 351.5\text{ V, } 50\text{ Ah)}.$$

### 2.3 Ecuaciones del Modelo Electrotérmico de 6 Estados
1. **Demanda de Corriente:**
   $$I(t) = \frac{P_{\text{bat}}}{\max(V_t, 1.0)}$$
2. **Caída de Tensión y Tensión Terminal:**
   $$V_t = V_{oc}(SOC) - I \cdot R_{\text{int}}$$
   *Donde $V_{oc}(SOC)$ es la curva lineal/sigmoidal de circuito abierto entre $V_{\text{min}}$ y $V_{\text{max}}$.*
3. **Evolución del Estado de Carga (Coulomb Counting):**
   $$SOC(t + dt) = SOC(t) - \frac{I \cdot dt}{3600 \cdot C_n}$$
4. **Efecto Joule y Calentamiento Cuadrático `[F31·s24]`:**
   $$Q = I^2 \cdot R_{\text{int}} \cdot dt$$
   *Al duplicar el C-rate se duplica la corriente, se duplica la caída óhmica, pero se cuadruplica la tasa de generación de calor.*
5. **Evolución Térmica con Disipación por Convección Forzada:**
   $$\frac{dT}{dt} = \frac{I^2 \cdot R_{\text{int}} - h(v) \cdot (T - T_{\text{amb}})}{C_{\text{th}}}$$
   *Con $C_{\text{th}}$ proporcional a la masa del pack y $h(v) = h_0 + h_1 \cdot v$ dependiente del flujo de aire exterior.*
6. **Efecto Peukert (Plomo-Ácido y NiMH) `[F31·s20]`:**
   $$C_{\text{disp}} \approx C_n \cdot \left(\frac{I_{\text{nom}}}{I}\right)^{k - 1} \quad (k \approx 1.25 \text{ en Plomo, } 1.15 \text{ en NiMH, } 1.00 \text{ en Litio})$$

### 2.4 Límites Operativos, Degradación y Derating
- **Ventana Útil de SOC `[F31·s25]`:** $10\%$ a $90\%$ para preservar la durabilidad química del cátodo y ánodo.
- **Relación Vida de Ciclo vs. Profundidad de Descarga (DOD) `[F31·s26]`:**
  $$N(\text{DOD}) = N_{100} \cdot \left(\frac{1}{\text{DOD}}\right)^{1.322}$$
  *Deducción Grado B: $400$ ciclos al $100\%$ DOD equivalen energéticamente a $1\,000$ ciclos al $50\%$ DOD ($1\,000 / 400 = 2.5 = 2^{1.322}$).*
- **Degradación Térmica (Arrhenius) `[F31·s49]`:** La pérdida de salud ($SOH$) en celdas de litio se duplica por cada $10\,{^\circ}\text{C}$ de incremento sobre los $25\,{^\circ}\text{C}$:
  $$\Delta SOH_{\text{térmico}} = k_T \cdot 2^{\frac{T - 25}{10}} \cdot dt$$
- **Crecimiento de Resistencia Interna por Envejecimiento (C):**
  $$R_{\text{int}}(SOH) = R_{\text{int},0} \cdot \left[1 + 0.8 \cdot (1 - SOH)\right]$$
- **Curva de Derating de Potencia por Alta Temperatura `[F31·s24]`:**
  - $T \le 45\,{^\circ}\text{C}$: $100\%$ potencia nominal disponible.
  - $45\,{^\circ}\text{C} < T \le 55\,{^\circ}\text{C}$: caída lineal controlada hasta el $30\%$.
  - $55\,{^\circ}\text{C} < T < 60\,{^\circ}\text{C}$: caída lineal al $0\%$.
  - $T \ge 60\,{^\circ}\text{C}$: disparo de corte por protección del BMS (DNF).
- **Derating en Frío Extremo `[F31·s21]`:** A $T \le 0\,{^\circ}\text{C}$ la corriente de carga máxima se restringe estrictamente a $\le 0.3\text{C}$ para inhibir la deposición irreversible de litio metálico (*lithium plating*).

---

## 3. Dinámica Vehicular, Tracción y Freno Regenerativo

### 3.1 Cadena Cinemática de Potencia `[F30·s17]`
$$\text{Red AC} \longrightarrow \text{OBC} \longrightarrow \text{Batería} \longrightarrow \text{PDU} \longrightarrow \text{MCU (Inversor)} \longrightarrow \text{Motor} \longrightarrow \text{Reductor} \longrightarrow \text{Ruedas}$$
$$\text{Batería HV} \longrightarrow \text{DC/DC} \longrightarrow \text{Red } 12\text{ V (Batería auxiliar, BMS, VCU, relés y contactores)}$$

- Las eficiencias de los componentes se multiplican en cascada `[F30·s25]`:
  $$\eta_{\text{total}} = \eta_{\text{batería}} \cdot \eta_{\text{MCU+Motor}} \cdot \eta_{\text{transmisión}}$$
- El motor síncrono de imanes permanentes ofrece par máximo desde $0\text{ rpm}$ y opera hasta más de $12\,000\text{--}15\,000\text{ rpm}$ mediante una sola relación reductora fija `[F30·s10][F30·s20]`.

### 3.2 Fuerzas Resistentes y Adherencia
1. **Resistencia a la Rodadura:** $F_{\text{rod}} = m \cdot g \cdot f$
2. **Resistencia Aerodinámica:** $F_{\text{aero}} = \frac{C_d \cdot A \cdot U_a^2}{21.15}$ ($U_a$ en $\text{km/h}$, $F$ en $\text{N}$) `[F30·s24]`
3. **Resistencia por Pendiente:** $F_{\text{pend}} = m \cdot g \cdot \sin\theta$
4. **Fuerza de Inercia:** $F_{\text{inercia}} = m \cdot a$
5. **Límite de Agarre y Tracción (C):** $F_{\text{grip}} = 0.55 \cdot m \cdot g$ (impide aceleraciones físicas inverosímiles y demanda desaceleración previa a las curvas).

### 3.3 Caso Canónico de Validación de Autonomía (232 km) `[F30·s25]`
- **Parámetros:** $m = 1\,700\text{ kg}$, $A = 4.0\text{ m}^2$, $C_d = 0.35$, $f = 0.015$, $v = 60\text{ km/h}$.
- **Eficiencias:** $\eta_{\text{transmisión}} = 0.92$, $\eta_{\text{motor+MCU}} = 0.90$, $\eta_{\text{descarga}} = 0.95$.
- **Batería:** $50\text{ kWh}$, usable al $80\%$ ($40\text{ kWh}$).
- **Resultados analíticos calculados:**
  - $F_{\text{rod}} = 1700 \times 9.8 \times 0.015 = 249.9\text{ N}$
  - $F_{\text{aero}} = \frac{0.35 \times 4.0 \times 60^2}{21.15} = 238.3\text{ N}$
  - $F_{\text{total}} = 488.2\text{ N}$
  - Potencia a las ruedas: $P_w = 488.2 \times (60 / 3.6) = 8.137\text{ kW}$
  - Autonomía teórica resultante: **$232.0\text{ km}$** (verificado en suite de pruebas).

### 3.4 Mapa de 3 Límites del Freno Regenerativo `[F30·s31][F30·s32]`
| Condición de la Batería / Vehículo | Recuperación Permitida | Justificación Técnica Canónica |
| :--- | :---: | :--- |
| **$SOC > 0.80$** | **Cancelada ($0\%$)** | Protección electroquímica: la batería no absorbe energía para evitar sobretensión. |
| **$SOC \in [0.70, 0.80]$** | **Modulada linealmente** | La corriente máxima aceptada disminuye proporcionalmente por consigna del BMS. |
| **$SOC < 0.70$** | **Libre ($100\%$)** | La batería acepta toda la potencia de regeneración del motor/inversor. |
| **$T > 45\,{^\circ}\text{C}$** | **Restringida / Anulada** | Disparo de protección térmica para no intensificar la degradación interna. |
| **$v < 5\text{ km/h}$** | **Nula ($0\%$)** | Ausencia de par electromagnético por baja velocidad; el freno hidráulico detiene el auto. |

*Beneficio didáctico representativo: $+10\text{ a }30\%$ de autonomía en ciclo urbano y reducción del $-15\%$ en consumo energético neto `[F30·s19]`.*

---

## 4. Las Cinco Trampas Conceptuales del Corpus Didaktikos `[F30·s48]`

El módulo incorpora un banco interactivo de preguntas de desafío para desmontar estos mitos automotrices frecuentes:

1. **"El motor eléctrico necesita una transmisión manual o automática de múltiples marchas"**
   * *Falso:* Desarrolla par máximo continuo desde $0\text{ rpm}$ hasta su régimen base y alcanza más de $12\,000\text{ rpm}$, haciendo suficiente una sola relación reductora fija.
2. **"La alta tensión de la batería se conecta directamente al motor trifásico"**
   * *Falso:* En medio se ubica la Unidad de Distribución de Potencia (PDU) con contactores y fusibles, seguida del inversor/MCU que convierte corriente continua en alterna trifásica.
3. **"Al tener un banco de tracción de 400 V o más, se prescinde de la batería auxiliar de 12 V"**
   * *Falso:* Por seguridad intrínseca, los relés de alta tensión, contactores principales, módulos BMS y VCU son de bajo voltaje ($12\text{ V}$). Sin la red de $12\text{ V}$, el sistema de tracción no puede cerrar sus circuitos.
4. **"El freno regenerativo puede reemplazar totalmente el sistema de frenado hidráulico"**
   * *Falso:* A velocidades cercanas a cero el motor-generador pierde el par inducido; además, ante fallas eléctricas o batería llena ($SOC > 80\%$), el freno hidráulico es el garante mecánico de detención.
5. **"Todos los vehículos híbridos (HEV) operan bajo el mismo principio de funcionamiento"**
   * *Falso:* Varían sustancialmente entre Híbridos en Serie (el motor térmico solo mueve un generador), Híbridos en Paralelo (ambos motores entregan par al eje motriz) e Híbridos Combinados (con divisor planetario de potencia o PSD).

---

## 5. Arquitectura del Módulo E-Prix Didaktikos

### 5.1 Las 16 Combinaciones Evaluadas
Producto cartesiano de 4 Plataformas $\times$ 4 Químicas:

- **Plataformas:** Urbano ($1\,250\text{ kg}$, $80\text{ kW}$), Sedán ($1\,650\text{ kg}$, $160\text{ kW}$), Camioneta ($2\,150\text{ kg}$, $220\text{ kW}$), Utilitario ($1\,850\text{ kg}$, $120\text{ kW}$).
- **Químicas:** LFP, NCM, NiMH, Plomo-Ácido.
- **Calibración didáctica de packs:** Packs dimensionados entre $11.2\text{ y }27.2\text{ kWh}$ para que 4 vueltas de carrera produzcan un consumo didáctico significativo (swing de SOC del $45\%$ al $80\%$ en modo equilibrado).
- **Guarda de Plomo-Ácido:** Se acotó la masa del pack a $m_{\text{pack}} \le 0.35 \cdot m_{\text{base}}$ ($11.2\text{--}19.5\text{ kWh}$) para evitar sobrepesos inmanejables de más de $700\text{ kg}$, asegurando que el plomo complete la carrera pero resulte ser el vehículo más lento en las 4 pistas.

### 5.2 Circuitos Derivados de SVG Analítico
- **Pistas:** Mónaco ($3.5\text{ km}$), Dubái ($4.6\text{ km}$), México ($4.3\text{ km}$), Paul Ricard ($5.2\text{ km}$).
- **Algoritmo de Muestreo:** Herramienta `tools/build-circuits.mjs` extrae el `centerline` del SVG, deriva curvatura geométrica mediante círculos de Menger ($3$ puntos consecutivos) y calcula la velocidad límite de paso:
  $$v_{\text{max}} = \sqrt{\frac{a_{\text{lat}}}{\kappa}} \quad (a_{\text{lat}} = 12\text{ m/s}^2, \text{ acotada a } [40, 320]\text{ km/h})$$
- Genera $800$ waypoints precalculados en `circuits.generated.js` con pasadas hacia atrás para cálculo de lookahead de frenado.

### 5.3 Motor de Simulación Determinista
- Paso fijo estricto: $dt = 1/120\text{ s}$ independiente de la tasa de refresco del monitor.
- Desacoplamiento de renderizado: Gráficos Canvas 2D a $60\text{ Hz}$ con interpolación lineal de estado ($\alpha$), y DOM HUD actualizado a $10\text{ Hz}$ para optimizar consumo de CPU.
- Semilla pseudoaleatoria determinista: Algoritmo Mulberry32 para reproducir idénticamente los resultados de carrera (`?seed=1234`).
- Auditoría de balance energético: Ledger contable que verifica la conservación de energía (Entrada Batería = Salida a Ruedas + Calor Joule + Fricción - Regeneración) dentro de un margen de error menor al $\pm 2\%$.

---

## 6. Arquitectura del Laboratorio de Diseño de Baterías (Battery Design Lab)

Valida empíricamente los 7 casos analíticos del curso (§12):
- **V1 (BEV Urbano 40 kWh):** $Ns = 125$ celdas LFP en serie, $Np = 1$, masa pack $300\text{ kg}$, densidad $133\text{ Wh/kg}$, potencia $80\text{ kW}$ a 2C.
- **V2 (Regímenes 0.5C, 1C, 2C):** Salto de corriente de $75\text{ A}$ a $300\text{ A}$, incremento de calentamiento de $+9\text{ K}$ a $+36\text{ K}$ ($4\times$).
- **V3 (Impacto Auxiliares):** Reducción de autonomía por A/C de $400\text{ km}$ a $353\text{ km}$ ($-12\%$) y con calefactor PTC a $305\text{ km}$ ($-24\%$).
- **V4 (Arranque en Frío con Plomo 12 V):** Aumento de resistencia interna de $5\text{ m}\Omega$ a $9.5\text{ m}\Omega$ a $-20\,{^\circ}\text{C}$, manteniendo tensión terminal por encima de $9.15\text{ V}$.
- **V5 (Autodescarga en Reposo):** Comparación de autodescarga a 6 meses: LFP ($12\%$ a $25\,{^\circ}\text{C}$, $24\%$ a $35\,{^\circ}\text{C}$), Plomo-ácido ($60\%$ en 30 días), NiMH ($>100\%$ en 6 meses).
- **V6 (Falla de Celda por Resistencia Alta):** Inyección de falla óhmica ($R \times 10$) produciendo $225\text{ W}$ de calor frente a $22.5\text{ W}$ en celdas sanas, disparando gradiente térmico $\Delta T$ en el BMS.
- **V7 (Recuperación de Frenada):** Absorción de $142\text{ kJ}$ ($0.039\text{ kWh}$) a una potencia de carga de $48\text{ kW}$ ($0.8\text{C}$) en $\approx 3\text{ segundos}$.

---

## 7. Soluciones de Integración en el Repositorio

1. **Manejo de ES Modules dinámicos en scripts clásicos:**
   - La función dinámica `import()` llamada desde un script clásico no modular (`web/js/app.js`) resuelve rutas de acuerdo a la URL del documento base (`document.baseURI` = `web/index.html`), no de la carpeta del archivo JS.
   - La solución implementa un importador multiruta resiliente con captura de errores:
     ```javascript
     const tryImports = [
       () => import("./eprix/eprix.js"),
       () => import("eprix/eprix.js"),
       () => import("../eprix/eprix.js")
     ];
     ```
2. **Eliminación de dependencias de enlaces simbólicos:**
   - Se reemplazaron symlinks en `web/assets` por directorios reales de activos SVG para garantizar compatibilidad con servidores Apache/Nginx convencionales y entornos Git en Windows.
3. **Múltiples vías de acceso:**
   - Integrado en vista modular: `#view_eprix` gestionado por el enrutador de Didaktikos.
   - Botón directo en la barra de navegación superior: `#nav_eprix`.
   - Tarjeta en la cuadrícula del home: `#card_goto_eprix` con acceso directo en pestaña independiente (`↗`).
   - Modo standalone en pantalla completa: `web/eprix/eprix.html`.
