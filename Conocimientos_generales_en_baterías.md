# Conocimientos generales en baterías

**Documento de referencia para el diseño y la simulación de una batería de potencia**
Curso: Seminario de Electromovilidad · ITZacatepec
Base documental: `9-11动力电池基本概念与工作原理（11.2版96页）_单语(1).pptx` (100 diapositivas, Dr. Liu Xinlei) + investigación complementaria con fuentes citadas al final.

---

## 0. Cómo usar este documento

| Si eres… | empieza por | y usa |
|---|---|---|
| Alumno que va a construir el simulador | §1 (conceptos) y §2 (parámetros) | §7 (modelo) y §12 (casos de validación) |
| Quien define la interfaz | §11 (pantallas) | §6 (cargas) y §8 (fallas) |
| Quien valida resultados | §12 | §3 y §4 (datos de materiales y celdas) |

**Convenciones**

- Todos los valores son **típicos de ingeniería**; los rangos amplios se dan como `mín–máx`.
- `V` = volts, `A` = amperes, `Ah` = amperios-hora, `Wh` = vatios-hora, `C` = capacidad nominal en Ah, `C-rate` = régimen en 1/h.
- Se distingue **celda** (lo que se compra) de **pack** (lo que se instala): el pack pesa y ocupa más.
- Los datos marcados con 🔎 provienen de las fuentes del §13; los marcados con 📐 son estimaciones de ingeniería para arrancar el modelo.

---

# PARTE 1 · CONTEXTO Y CONCEPTOS (del material 9-11)

## 1.1 Qué es una batería de potencia

Es el dispositivo que **almacena energía química y la entrega como energía eléctrica**, reversiblemente. En un vehículo de nueva energía es la fuente de energía (BEV), el complemento de potencia (HEV) o el apoyo de la pila de combustible (FCEV).

**La idea que ordena todo:** una batería **no guarda electrones**, guarda una reacción. Los iones viajan por dentro (electrolito + separador); los electrones circulan por fuera (el circuito externo). Cargar es forzar la reacción al revés.

### Clasificación (tres familias)

| Familia | Fenómeno | Ejemplos | ¿Se usa en tracción? |
|---|---|---|---|
| **Química** | Reacción química | Plomo-ácido, Ni-Cd, NiMH, iones de litio, pila de combustible | **Sí** |
| **Física** | Energía física (luz, calor, adsorción) | Panel solar, supercondensador, volante de inercia | Solo como apoyo |
| **Biológica** | Reacción bioquímica | Batería microbiana, enzimática | No |

### Clasificación de las químicas

| Criterio | Categorías |
|---|---|
| **Por forma de trabajo** | Primaria (un solo uso) · Acumulador (recargable) · Pila de combustible (reactivo continuo) · De reserva (se activa al usarse) |
| **Por electrolito** | Ácida (H₂SO₄) · Alcalina (KOH) · Neutra (salina) · Orgánica (Li-ion) · Inorgánica no acuosa · Sólida |
| **Por características** | Alta capacidad · sellada · alta potencia · libre de mantenimiento · antiexplosión |
| **Por materiales de electrodo** | Zn-Mn · Ni-Cd/NiMH · plomo-ácido · iones de litio |

**Qué usa cada vehículo** (del original):

| Vehículo | Batería |
|---|---|
| BEV | Iones de litio |
| HEV | Iones de litio y NiMH |
| FCEV | Pila de combustible + batería de apoyo |
| Otros (baja velocidad, especiales) | Plomo-ácido o iones de litio |

## 1.2 Las tres dimensiones de evaluación

| Dimensión | Pregunta | Indicadores |
|---|---|---|
| **Función** | ¿Se puede usar? | Voltaje, capacidad, energía, potencia, vida de ciclo, resistencia interna, curvas de carga/descarga |
| **Masa / confiabilidad** | ¿Cuánto tiempo se puede usar? | Capacidad de descarga a temperatura ambiente, energía descargable, vida de ciclo estándar y en condiciones reales |
| **Seguridad** | ¿Me atrevo a usarla? | 12 ensayos en 4 categorías |

**Los 12 ensayos de seguridad**

| Categoría | Ensayos | Criterio |
|---|---|---|
| Abuso eléctrico | Cortocircuito externo · sobrecarga · sobredescarga | Sin incendio ni explosión con V/I anormal |
| Entorno térmico | Calentamiento · ciclos de temperatura · choque térmico | Sin fuga térmica |
| Esfuerzo mecánico | Extrusión · vibración · impacto | Estructura intacta, sin fugas |
| Adaptación ambiental | Inmersión · niebla salina · gran altitud | Seguro con humedad, corrosión y baja presión |

## 1.3 Tabla maestra de magnitudes

| Magnitud | Símbolo / unidad | Fórmula o definición | Nota para el simulador |
|---|---|---|---|
| Voltaje terminal | `Vt` (V) | `Voc − I·Rint` (descarga) | Es lo que se mide |
| Voltaje de circuito abierto | `Voc` (V) | función del SOC | Tabla `Voc(SOC)` por química |
| Voltaje nominal | `Vnom` (V/celda) | 2,0 Pb · 1,2 NiCd/NiMH · 3,2 LFP · 3,7 NCM | |
| Corte de carga | `Vmax` (V/celda) | 2,7 Pb · 4,25 NCM · 3,65 LFP · 1,5 NiMH | Alarma + corte |
| Corte de descarga | `Vmin` (V/celda) | 1,6 Pb · 3,0 NCM · 2,5 LFP · 1,0 NiMH | **Alarma crítica** |
| Capacidad | `Cn` (Ah) | `I·t` | Se mide a 0,2C |
| Energía | `E` (Wh) | `Cn · Vnom` | |
| Potencia | `P` (W) | `Vt · I` | |
| C-rate | `1/h` | `I / Cn` | **Parámetro clave** |
| SOC | % | fracción de carga disponible | Estado |
| DOD | % | `100 − SOC` | Impacta la vida |
| Vida de ciclo | ciclos | siempre con su DOD | `400 ciclos @100 % DOD` |
| Autodescarga | %/mes | pérdida sin carga | Depende de química y T |
| Eficiencia de salida | % | `E_descarga / E_carga` | 85 % Pb · 95-98 % Li |
| Resistencia interna | `Rint` (Ω) | `ΔV/ΔI` | Aumenta con frío y edad |
| Fuga térmica | — | reacción exotérmica en cadena en una celda | Estado de falla |
| Propagación | — | contagio a celdas vecinas | Estado de falla |

## 1.4 Estructura: celda → módulo → pack → sistema

| Nivel | Contiene | Añade |
|---|---|---|
| **Celda** | Electrodos, separador, electrolito, carcasa | La química |
| **Módulo** | Celdas en serie/paralelo, soportes, colectores, sensores | Tensión y manipulación |
| **Pack** | Módulos, BMS, contactores, fusible, interruptor de mantenimiento, gestión térmica, conectores HV/LV | **Seguridad y refrigeración** |
| **Sistema** | Uno o más packs + unidad de control + circuitos | Gestión y comunicación |

## 1.5 Agrupación

- **Serie:** sube el **voltaje**; la capacidad **no** cambia. `V = Ns · Vcelda`
- **Paralelo:** sube la **capacidad**; el voltaje no cambia. `Cn = Np · Ccelda`
- **Mixto:** `NsS × NpP`. Convención: primero paralelo, luego serie.

> El **C-rate no cambia al agrupar**: es una propiedad intensiva. `C-rate del pack = C-rate de la celda`.

## 1.6 Las familias químicas, en una tabla

| | Plomo-ácido | NiMH | Li-ion | Pila de combustible |
|---|---|---|---|---|
| Electrodo + | PbO₂ | Ni(OH)₂ | Óxido metálico litado | Ánodo H₂ |
| Electrodo − | Pb esponjoso | Aleación que almacena H₂ | Grafito | Cátodo O₂ |
| Electrolito | H₂SO₄ | KOH | Orgánico + sal de litio | Membrana sólida (PEM) |
| V/celda | 2,0 | 1,2 | 3,2–3,7 | ≈0,7 |
| Papel | Arranque y bajo costo | Híbridos | BEV/PHEV | Pesados y flotas |
| Se recarga | Sí | Sí | Sí | **No: se rellena** |

**Cátodos del litio:** LFP (olivino, 3,2 V, seguro y barato) · LMO (espinela, 3–4 V) · LCO (en capas, electrónica de consumo) · NCM/NCA (en capas, 3,7 V, máxima energía).

## 1.7 Fuga térmica y propagación

1. Una celda se dispara (sobrecarga, cortocircuito interno, calor externo, impacto).
2. Reacción exotérmica en cadena: **fuga térmica**.
3. El calor calienta las vecinas: **propagación**.

Cadena de defensa: BMS que corta → separador resistente → barreras térmicas → química estable (LFP) → diseño del pack (cell-to-pack).

---

# PARTE 2 · DATOS PARA EL SIMULADOR

## 2. Diccionario de parámetros

### 2.1 Entradas de diseño

| Parámetro | Símbolo | Unidad | Rango típico | Default sugerido |
|---|---|---|---|---|
| Aplicación | `app` | — | urbano, sedán, bus, camión, scooter, respaldo | `urbano` |
| Energía objetivo | `E_target` | kWh | 1–600 | 40 |
| Voltaje de bus | `V_pack` | V | 48 / 96 / 144 / 300–400 / 800 | 400 |
| Potencia pico | `P_peak` | kW | 5–400 | 100 |
| Potencia continua | `P_cont` | kW | 3–250 | 50 |
| Química | `chem` | — | Pb, NiMH, LFP, LMO, NCM, LTO | LFP |
| Formato de celda | `form` | — | 18650, 21700, prismática, pouch | prismática |
| C-rate de descarga continua | `C_dis` | 1/h | 0,2–5 | 1 |
| C-rate de descarga pico | `C_peak` | 1/h | 0,5–20 | 3 |
| C-rate de carga máxima | `C_chg` | 1/h | 0,05–3 | 0,5 |
| SOC inicial | `SOC0` | % | 5–100 | 90 |
| SOC mínimo operativo | `SOC_min` | % | 0–20 | 10 |
| SOC máximo operativo | `SOC_max` | % | 80–100 | 90 |
| Temperatura ambiente | `T_amb` | °C | −30–50 | 25 |
| Refrigeración | `cool` | — | ninguna, aire, líquido | líquido |
| Precio de energía | `cost` | $/kWh | 80–1000 | 108 🔎 |

### 2.2 Parámetros internos calculados

| Parámetro | Fórmula | Unidad |
|---|---|---|
| Celdas en serie | `Ns = round(V_pack / V_celda)` (siempre hacia arriba) | — |
| Celdas en paralelo | `Np = round(Cn_pack / C_celda)` | — |
| Capacidad del pack | `Cn = Np · C_celda` | Ah |
| Energía del pack | `E = Ns · Np · V_celda · C_celda / 1000` | kWh |
| Corriente de 1C | `I_1C = Cn` | A |
| Corriente de trabajo | `I = C-rate · Cn` | A |
| Resistencia del pack | `Rint = Ns · R_celda / Np` | Ω |
| Masa de celdas | `m_cells = Ns · Np · m_celda` | kg |
| Masa del pack | `m_pack ≈ m_cells · 1,20` (1,15–1,35) | kg |
| Volumen del pack | `V_pack ≈ V_cells / PF` con `PF` = factor de empaquetado | L |
| Densidad energética del pack | `E / m_pack` | Wh/kg |
| Potencia disponible | `P = C-rate · Cn · Vt` | W |
| Capacidad térmica | `Cth ≈ m_pack · cp` con `cp ≈ 900` J/(kg·K) | J/K |
| Conductancia térmica | `UA = 20–60` (aire) · `80–300` (líquido) | W/K |

**Factores de empaquetado `PF`** (volumen de celdas / volumen del pack): cilíndricas `0,55–0,65`; prismáticas `0,60–0,75`; pouch `0,55–0,70`.

---

## 3. Base de datos de materiales

> Valores de celda salvo donde se indique. `k` = exponente de Peukert. `Cp` = calor específico.

| Química | Vnom (V/celda) | Wh/kg | Wh/L | W/kg | Ciclos (80 % cap.) | Autodescarga (%/mes) | η coulómbica | Carga (C máx) | Descarga cont. / pico (C) | T operación (°C) | Vida calendario | Costo pack ($/kWh) | k | Cp (J/kg·K) | Seguridad | Efecto memoria |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Plomo-ácido inundada** | 2,0 | 30–40 | 60–80 | 150–250 | 300–500 | 4–6 (hasta 10–20 con calor) | 80–85 % | 0,1–0,2 | 1 / 5–10 | −20…50 | 2–4 años | 90–150 📐 | 1,30 | 700 | Media (H₂, ácido) | No |
| **Plomo-ácido AGM/VRLA** | 2,0 | 35–45 | 80–110 | 200–300 | 400–600 | 3–5 🔎 | 85–90 % | 0,1–0,3 | 1–3 / 5–10 | −20…50 | 3–5 años | 100–170 📐 | 1,25 | 700 | Media | No |
| **Ni-Cd** | 1,2 | 40–60 | 80–120 | 150–300 | 1 000–2 000 | 15–20 | 80 % | 0,1–0,3 | 1–5 / 10 | −20…60 | 5–8 años | 300–500 📐 | 1,10 | 800 | Media (Cd tóxico) | **Sí** |
| **NiMH** | 1,2 | 70–95 | 140–200 | 200–400 | 500–1 000 | **20–30** | 85 % | 0,3–1 | 3–10 / 10 | −10…45 | 5–8 años | 300–500 📐 | 1,15 | 800 | Alta (térmica) | Leve |
| **LFP** | 3,2 | 100–180 🔎 | 250–350 | 200–500 | **2 000–6 000** | **1–3** 🔎 | 95–98 % | 0,5–1 (hasta 3) | 1–3 / 5 | −20…60 | 8–15 años | **81** 🔎 | 1,02 | 900–1 100 | **Alta** | No |
| **LMO** | 3,7 | 100–150 | 200–280 | 300–600 | 500–1 000 | 3 | 95 % | 0,5–1 | 2–10 / 20 | −20…55 | 5–8 años | 100–140 📐 | 1,03 | 850 | Media | No |
| **NCM / NCA** | 3,6–3,7 | 150–250 🔎 | 300–700 | 300–1 000 | 1 000–2 500 | 2–5 🔎 | 95 % | 0,5–1 (hasta 2–3) | 2–5 / 10 | −20…55 | 8–12 años | **128** 🔎 | 1,03 | 900–1 100 | Media | No |
| **LTO** | 2,3–2,4 | 60–90 | 120–200 | 1 000–4 000 | **10 000–20 000** | 2–3 | 98 % | 5–10 | 10–30 / 50 | −30…55 | 15–20 años | 200–450 📐 | 1,01 | 900 | **Muy alta** | No |
| **Supercondensador** | 2,7 | 5–10 | 10–20 | **5 000–10 000** | 500 000+ | 1–2 (tras la caída inicial) | 95–98 % | 100+ | 100+ | −40…65 | 10–15 años | 3 000–10 000 📐 | 1,00 | 800 | Alta | No |

**Notas de uso**

- El **plomo** muestra dos cifras de autodescarga porque las hojas de datos VRLA declaran **<3 %/mes a 25 °C** 🔎, mientras que las mediciones en servicio y a mayor temperatura llegan a **10–20 %/mes** 🔎. Para el simulador: `3 %/mes` base, multiplicando por **2 cada +10 °C**.
- El **NiMH es el peor en autodescarga** (20–30 %/mes): es la causa clásica de «no arranca tras vacaciones».
- El **LFP es el mejor en ciclos y el más seguro**, pero el más pesado por kWh frente a NCM.
- El **LTO** es el rey de la potencia y los ciclos, y el peor en energía y costo.

### 3.1 Corrección de autodescarga por temperatura (Arrhenius simplificado)

```
k_T   = 2 ^ ((T − 25) / 10)
self_discharge_diario = (tasa_mensual / 30) × k_T
```

Ejemplo: LFP al 2 %/mes a 25 °C → a 45 °C: `2 × 2^2 = 8 %/mes`.

---

## 4. Catálogo de celdas comerciales

| Formato | Medidas | Vnom | Capacidad | Masa | Rint típica | Energía | Wh/kg (celda) | Uso típico |
|---|---|---|---|---|---|---|---|---|
| **18650** | ⌀18 × 65 mm | 3,6–3,7 V | 2,5–3,5 Ah | 45–48 g | 25–40 mΩ | 9–13 Wh | 200–250 | Tesla S/X, portátiles, power banks |
| **21700** | ⌀21 × 70 mm | 3,6–3,7 V | 4,0–5,0 Ah 🔎 | 65–70 g 🔎 | **4–25 mΩ** 🔎 | 14–18,5 Wh 🔎 | 220–272 🔎 | Tesla 3/Y, e-bikes, herramientas |
| **26650** | ⌀26 × 65 mm | 3,6–3,7 V | 4,5–5,5 Ah | 85–95 g | 15–25 mΩ | 17–20 Wh | 200–240 | Motos eléctricas, respaldo |
| **32650** | ⌀32 × 65 mm | 3,6–3,7 V | 6,0–6,5 Ah | 135–145 g | 10–20 mΩ | 22–24 Wh | 160–180 | Packs de gran capacidad |
| **Prismática LFP 100 Ah** | ≈ 175 × 130 × 50 mm 📐 | 3,2 V | 100 Ah | ≈ 2,0 kg 📐 | 0,4–0,7 mΩ | 320 Wh | 160 | Solar, BEV urbano |
| **Prismática LFP 280 Ah** | **205 × 174 × 72 mm** 🔎 | **3,2 V** | **280 Ah** 🔎 | **5,25–5,30 kg** 🔎 | **≤0,25 mΩ** 🔎 | **896 Wh** | **≈170** 🔎 | Solar, buses, camiones |
| **Pouch NMC** | variable | 3,6–3,7 V | 20–60 Ah 📐 | según diseño | 0,5–1,5 mΩ | — | 230–260 📐 | BEV premium, drones |

> **Lectura del código:** `18650` = 18 mm de diámetro × 65 mm de largo, `0` = cilíndrica. **No indica la química.**
> Una celda de 21700 puede ser LFP o NCM; el código solo describe la geometría.

---

## 5. Motor de configuración del pack

### 5.1 Algoritmo

```
1. Elegir V_celda y C_celda según química y formato.
2. Ns = ceil(V_pack / V_celda)          → fija el voltaje
3. Np = ceil(Cn_objetivo / C_celda)     → fija la capacidad
   con Cn_objetivo = E_target · 1000 / (Ns · V_celda)
4. Verificar potencia:  P = C_peak · Cn · (Ns · V_celda) ≥ P_peak
   Si no, subir Np (más potencia) o cambiar de química (más W/kg).
5. Verificar masa y volumen; si no caben, subir densidad energética (química) o PF.
```

### 5.2 Configuraciones de referencia

| Aplicación | Voltaje | Química | Configuración | Energía | Potencia |
|---|---|---|---|---|---|
| Scooter / e-bike | 48 V | NCM 21700 | 13S4P (13×3,7 = 48,1 V) | 0,7–1,0 kWh | 2–4 kW |
| Cuadriciclo / urbano pequeño | 96 V | LFP prismática | 30S1P (30×3,2 = 96 V) | 9,6 kWh (100 Ah) | 15–30 kW |
| **BEV urbano** | **400 V** | **LFP 100 Ah** | **125S1P** (125×3,2 = 400 V) | **40 kWh** | 80–100 kW |
| BEV sedán largo alcance | 400 V | NCM 21700 | 96S46P (96×3,7 = 355 V) | 75–100 kWh | 150–250 kW |
| BEV 800 V | 800 V | NCM prismática | 192S2P | 100–120 kWh | 250–400 kW |
| Autobús urbano | 600 V | LFP 280 Ah | 190S2P | 300–350 kWh | 200–300 kW |
| Híbrido (HEV) | 200–300 V | NiMH o LFP | 60S2P | 1,5–3 kWh | 30–60 kW |
| Respaldo / solar | 48 V | LFP 280 Ah | 15S1P | 13,4 kWh | 5–10 kW |
| Arranque (SLI) | 12 V | Pb AGM | 6S1P (6×2,0 = 12 V) | 0,7 kWh (60 Ah) | 3–5 kW pico |

### 5.3 Comprobaciones que el simulador debe hacer siempre

- `V_pack_real = Ns · V_celda` y avisar si difiere >5 % del objetivo.
- `P_cont = C_dis · Cn · V_pack_real` frente a `P_cont` requerida.
- `m_pack` frente a la masa admisible.
- `E / m_pack` frente a la densidad mínima del pliego.
- Número total de celdas `Ns · Np` (coste y complejidad del BMS).

---

## 6. Catálogo de consumos (cargas)

> Los consumos del vehículo se descuentan del pack. Los de 12 V se descuentan de la batería auxiliar, que a su vez se recarga desde el pack vía DC/DC.

### 6.1 Cargas de alta tensión (las que comen autonomía)

| Carga | Potencia típica | Ciclo de servicio | Nota |
|---|---|---|---|
| **Aire acondicionado eléctrico** | **3–6 kW** 🔎 | 40–80 % en verano | Compresor propio; enfría con el coche parado |
| **Calefacción PTC** | **3–6 kW** 🔎 | 30–70 % en invierno | Resistencia: COP ≈ 1 |
| **Bomba de calor** | 1,5–3 kW eléctricos | 30–70 % | **COP 2,8–3,5** a 5–10 °C 🔎 |
| Calefacción de asientos | 50–100 W por asiento | 20–40 % | Barata en energía |
| Desempañado / luneta térmica | 150–300 W | 10–30 % | |
| Bomba de refrigeración de batería | 50–200 W | 20–60 % | |
| Bomba de refrigeración del motor | 100–300 W | Continuo en marcha | |
| **DC/DC (400 V → 12 V)** | **1–3 kW** (5 kW comercial) | Según carga de 12 V | Alimenta toda la electrónica |
| Dirección eléctrica (EPS) | 300–800 W de pico · 50–150 W medio | 20–40 % | |

### 6.2 Cargas de 12 V (electrónica y confort)

| Carga | Potencia | Corriente a 12 V | Ciclo |
|---|---|---|---|
| Radio / equipo de sonido | **15–30 W** medio · 100–200 W pico 🔎 | 1–2,5 A | 50 % |
| **GPS / telemetría** | **2–10 W** | 0,2–0,8 A | Continuo con contacto |
| **Bluetooth / manos libres** | **0,1–1 W** | 10–80 mA | Continuo |
| Pantalla / head unit | 10–30 W | 1–2,5 A | Continuo |
| Faros LED | **10–25 W** por lado 🔎 | 0,8–2 A | 30–60 % (noche) |
| Faros halógenos | 55 W por lado 🔎 | 4,5 A | 30–60 % |
| Limpiaparabrisas | 100–200 W | 8–16 A | 10 % |
| Cámaras / ADAS | 10–30 W | 1–2,5 A | Continuo |
| Cargador USB | 10–60 W | 1–5 A | 30 % |
| Alarma / inmovilizador (parásita) | **0,3–0,7 W** | 20–50 mA | **24 h** |
| Cierre centralizado / luces de cortesía | 5–20 W | — | esporádico |

> **Dato clave para el simulador:** una carga parásita de **50 mA** consume **1,2 Ah al día**; en 30 días son **36 Ah**, más de la mitad de una batería de 60 Ah. Es la causa real de que un coche aparcado no arranque.

### 6.3 Consumo de tracción (para calcular autonomía)

```
Consumo_total (Wh/km) = consumo_base + Σ(P_carga · ciclo) / v_media
Autonomía (km)        = E_utilizable (Wh) / Consumo_total
```

Ejemplo: 150 Wh/km base + A/C de 3 kW al 60 % a 90 km/h → `150 + (3000·0,6)/90 = 170 Wh/km`. Con 60 kWh útiles: **353 km** en vez de 400 km (−12 %).

---

## 7. Modelo de simulación

### 7.1 Variables de estado

| Variable | Unidad | Inicialización |
|---|---|---|
| `SOC` | % | `SOC0` |
| `DOD` | % | `100 − SOC0` |
| `T` | °C | `T_amb` |
| `Q_through` | Ah | 0 (para envejecimiento) |
| `SOH` | % | 100 |
| `Vt`, `I`, `P` | V, A, W | calculadas |

### 7.2 Bucle de simulación (paso `dt`, típico 1 s)

```python
# 1. Corriente impuesta por el perfil (C-rate, potencia o corriente)
I = perfil(t)                    # A  (positiva = descarga)
P_dem = P_traccion(t) + P_cargas(t)
I = P_dem / Vt if modo_potencia else I

# 2. Límites del BMS
I = min(I, C_dis_max * Cn, I_por_temperatura(T), I_por_SOC(SOC))
I = max(I, -C_chg_max * Cn)

# 3. Tensión terminal
Voc = Voc_table(SOC, chem)                  # tabla o polinomio
Vt  = Voc - I * Rint * factor_R(T, SOH)     # descarga: signo negativo
Vt  = max(Vt, Vmin_corte)                   # recorte

# 4. Potencia
P = Vt * I

# 5. SOC y DOD
dAh = I * dt / 3600
SOC = SOC - 100 * dAh / (Cn * eta_coulombica)
DOD = 100 - SOC

# 6. Descuento por autodescarga (solo si I ≈ 0)
SOC = SOC - 100 * (self_discharge_diario/24) * (dt/3600)

# 7. Térmico
Q_gen = I**2 * Rint                      # W
Q_cool = UA * (T - T_amb)                # W
T = T + (Q_gen - Q_cool) * dt / Cth

# 8. Envejecimiento (por ciclo y calendario)
fade_ciclo = f(DOD, C-rate, T)
fade_cal   = g(T, SOC_medio, tiempo)
SOH = 100 - fade_ciclo - fade_cal
Cn_efectiva = Cn * SOH/100
Rint = Rint0 * (1 + 0.6*(1 - SOH/100))   # la resistencia crece al envejecer

# 9. Alarmas y corte
if Vt <= Vmin_corte or T >= T_corte or SOC <= SOC_min:
    detener_o_derate()
```

### 7.3 Curva `Voc(SOC)` — aproximación utilizable

| Química | Tramo | Modelo |
|---|---|---|
| LFP | 10–90 % | `Voc ≈ 3,20 + 0,06·SOC` (meseta muy plana) |
| NCM | 10–90 % | `Voc ≈ 3,55 + 0,55·SOC` |
| Pb | 20–100 % | `Voc ≈ 11,6 + 0,10·(SOC/100)·10` (12 V) |
| NiMH | 10–90 % | `Voc ≈ 1,20 + 0,15·SOC` |

> En el LFP la meseta es tan plana que **no se puede estimar el SOC solo con el voltaje**: el simulador debe llevar la cuenta por `Ah` (culombimetría) y usar el voltaje solo como corrector.

### 7.4 Factor de resistencia con temperatura

```
Rint(T) = Rint_25 · (1 + 0,02 · max(0, 25 − T))
```

A 0 °C la resistencia se multiplica por ≈1,5; a −20 °C, por ≈1,9. Eso explica la caída de tensión y la potencia limitada en frío.

### 7.5 Eficiencia de ida y vuelta

| Química | η ida y vuelta |
|---|---|
| Pb | 80–85 % |
| NiMH | 85 % |
| LFP | 95–97 % |
| NCM | 95 % |
| LTO | 97–98 % |

En el simulador: `E_cargada = E_descargada / η`.

### 7.6 Envejecimiento (para «descarga en desuso» y vida útil)

| Modo | Regla práctica |
|---|---|
| **Ciclos** | `fade = 20 % × (ciclos_equivalentes / ciclos_nominales)^0,8` |
| **Calendario** | `fade = 2 %/año × 2^((T − 25)/10)` para LFP/NCM; `4 %/año` para Pb |
| **Estrés por C-rate** | `fade × (1 + 0,1·(C-rate − 1))` |
| **Estrés por DOD** | `ciclos_equivalentes = Σ (DOD/100)` |

**Ejemplo:** 40 kWh LFP guardados 12 meses a 35 °C → `2 % × 2^1 = 4 %` de pérdida sin haberlos usado.

---

## 8. Inyección de fallas (las casillas del simulador)

### 8.1 Nivel celda

| Falla | Marca en la casilla | Efecto en el modelo |
|---|---|---|
| Resistencia alta | `F_CELL_RINT` | `R_celda × 5–20` → punto caliente, caída de tensión local |
| Pérdida de capacidad | `F_CELL_CAP` | `C_celda × 0,7–0,9` → desequilibrio progresivo |
| Autodescarga alta | `F_CELL_SELF` | `self_discharge × 20` → se vacía en días |
| Cortocircuito interno | `F_CELL_SHORT` | `Voc_celda = 0`; vecinas sobrecargadas |
| Circuito abierto | `F_CELL_OPEN` | `R_celda = ∞`; el string pierde una celda |
| Disparo térmico | `F_CELL_RUNAWAY` | `Q_gen × 100` en esa celda + propagación con retardo |

### 8.2 Nivel módulo

| Falla | Marca | Efecto |
|---|---|---|
| Celda abierta en serie | `F_MOD_OPEN` | `V_modulo − V_celda`; el pack pierde ~3,2 V |
| Celda en corto | `F_MOD_SHORT` | `V_modulo − V_celda` permanente; vecinas se sobrecargan |
| Sensor de temperatura ciego | `F_MOD_NTC` | Lectura fija → se pierde la detección térmica |
| Conexión floja | `F_MOD_BUS` | `R_modulo + 1–5 mΩ` → calor local y caída |

### 8.3 Nivel pack

| Falla | Marca | Efecto |
|---|---|---|
| Contactor abierto | `F_PACK_CONTACTOR` | `I = 0`; el coche no arranca |
| Fusible abierto | `F_PACK_FUSE` | Igual, pero aparece tras un pico |
| Fuga de refrigerante | `F_PACK_COOLANT` | `UA × 0,2` → subida de T |
| Falla de aislamiento | `F_PACK_ISO` | Alarma de seguridad; corte por norma |
| Interruptor de mantenimiento abierto | `F_PACK_MSD` | `I = 0` |

### 8.4 Nivel sistema

| Falla | Marca | Efecto |
|---|---|---|
| Pérdida de CAN | `F_SYS_CAN` | Sin datos al VCU → *limp mode* |
| DC/DC caído | `F_SYS_DCDC` | Se muere la red de 12 V → contactores se abren |
| Cargador (OBC) caído | `F_SYS_OBC` | Solo carga en CC |
| Deriva del sensor de corriente | `F_SYS_SHUNT` | SOC mal calculado (error creciente) |
| Firmware con límite | `F_SYS_DERATE` | `P_max × 0,5` |

### 8.5 Cómo debe reaccionar el simulador a cada falla

1. **Detectar** (¿qué señal cambia primero?).
2. **Clasificar** (alerta / falla / crítico).
3. **Actuar** (derate / corte / apertura de contactores).
4. **Registrar** en el log con marca de tiempo.

> Regla de oro: una falla de **celda** casi nunca se ve en el voltaje del pack; se ve en el **desequilibrio** y en el **punto caliente**. Eso es exactamente lo que hay que modelar.

---

## 9. Indicadores de peligro y umbrales

### 9.1 Descarga profunda

| Química | V/celda de corte | Equivalente 12 V | Consecuencia de pasarse |
|---|---|---|---|
| Pb | **1,75** (1,6 extremo) | **10,5 V** 🔎 | Sulfatación; por debajo de 10,5 V se acelera y puede ser irreversible |
| LFP | **2,5** | — | Pérdida de capacidad y riesgo de disolución del colector de cobre si se insiste 🔎 |
| NCM | **3,0** | — | Al sobredescargar, el ánodo sube por encima de ~3,5 V frente a Li y el cobre del colector se disuelve → autodescarga y cortocircuito interno 🔎 |
| NiMH | **1,0** | — | Inversión de polaridad en la celda más débil |
| LTO | 1,5 | — | Menos crítico |

### 9.2 Tabla de alarmas

| Señal | Precaución | Alarma | Crítico / corte |
|---|---|---|---|
| **SOC** | ≤ 20 % | ≤ 10 % | ≤ 5 % (o `SOC_min`) |
| **V celda** (descarga) | −2 % del corte | −1 % del corte | `Vmin` |
| **V celda** (carga) | +2 % | +1 % | `Vmax` |
| **Desequilibrio** | > 30 mV | > 50 mV | > 150 mV |
| **Temperatura** | 45 °C | 55 °C | 60 °C (descarga) / 45 °C (carga) |
| **ΔT entre celdas** | 3 K | 5 K | 8 K |
| **dT/dt** | — | 0,5 K/min | **1 K/s → fuga térmica** |
| **Aislamiento** | 500 Ω/V | 200 Ω/V | **100 Ω/V** |
| **Sobrecorriente** | 1,1·I_max | 1,25·I_max | 1,5·I_max (corte) |
| **SOH** | 80 % | 70 % | 60 % (fin de vida útil) |

### 9.3 Semáforo de la recuperación (recuperación de frenado)

| SOC | Recuperación |
|---|---|
| > 0,80 | **Cancelada**: la batería no absorbe más |
| 0,70–0,80 | **Limitada** por la corriente máxima de carga |
| < 0,70 | **Libre** |
| T alta | **Detenida** por protección |

---

## 10. Motor de selección: qué batería para qué aplicación

| Aplicación | Prioridad | Química | Configuración | Potencia | Enfriamiento |
|---|---|---|---|---|---|
| **e-bike / scooter** | Masa y costo | NCM 21700 | 13S3P–13S4P | 1–3 kW | Aire |
| **Urbano pequeño** | Costo y ciclos | **LFP** | 30S1P | 15–30 kW | Líquido |
| **Sedán** | Autonomía | NCM | 96S40P+ | 150–250 kW | Líquido |
| **Deportivo** | Potencia | NCM alta potencia / LTO | 192S2P | 300–600 kW | Líquido reforzado |
| **Autobús** | Ciclos y costo/kWh | LFP 280 Ah | 190S2P | 200–300 kW | Líquido |
| **Camión largo recorrido** | Energía a bordo | FCEV o LFP grande | — | 300–500 kW | Líquido |
| **Híbrido** | Potencia y vida | NiMH o **LFP** | 60S2P | 30–60 kW | Aire/líquido |
| **Respaldo / solar** | Costo y ciclos | LFP | 15S1P | 5–10 kW | Aire |
| **Arranque** | Costo y frío | Pb AGM | 6S1P | 3–5 kW pico | No |

**Regla de decisión**

```
Si prioridad = autonomía      → NCM/NCA (más Wh/kg)
Si prioridad = costo/ciclos   → LFP
Si prioridad = potencia       → NCM de alta potencia o LTO
Si prioridad = costo mínimo   → Pb
Si prioridad = temperatura extrema (−30 °C) → LTO
Si prioridad = seguridad máxima → LFP o LTO
```

---

## 11. Especificación de la interfaz del simulador

### Pantalla 1 · Diseño

**Entradas:** aplicación (desplegable) · energía objetivo (kWh) · voltaje de bus (V) · potencia pico y continua (kW) · química · formato de celda · C-rate de carga y descarga · SOC inicial/mín/máx · temperatura ambiente · tipo de refrigeración.

**Salidas en vivo:**
- Configuración: `Ns`, `Np`, total de celdas, `V_pack`, `Cn`, `E`, `P_cont`, `P_peak`.
- Físico: masa de celdas, masa de pack, volumen, densidad (Wh/kg, Wh/L).
- Costo estimado ($/kWh y total).
- Semáforo: ¿cumple potencia? ¿cumple energía? ¿cumple masa?

### Pantalla 2 · Consumos

Casillas con su potencia y un control de ciclo de servicio (0–100 %): A/C · calefacción PTC · bomba de calor · asientos · desempañado · audio · GPS · Bluetooth · pantalla · faros · limpiadores · ADAS · USB · parásita.

**Salida:** consumo total (W y Wh/km), autonomía estimada, tiempo hasta `SOC_min`.

### Pantalla 3 · Prueba de carga y descarga

Perfiles: corriente constante · potencia constante · escalonado · **CC-CV** · pulsos · ciclo de conducción.

Salidas: curvas de `V(t)`, `I(t)`, `T(t)`, `SOC(t)`, `DOD(t)`; energía cargada/descargada; eficiencia; tiempo por fase.

### Pantalla 4 · Fallas

Cuatro grupos de casillas (celda / módulo / pack / sistema) + selector de magnitud y de instante de aparición. **Salida:** log de eventos, evolución de las señales y decisión del BMS.

### Pantalla 5 · Resultados

Tabla comparativa de hasta 4 diseños (energía, potencia, masa, costo, autonomía, ΔT, SOT) y recomendación automática.

---

## 12. Casos de validación

> Si tu simulador reproduce estas filas, el modelo está bien.

### V1 · Configuración de un BEV urbano de 40 kWh

| Paso | Cálculo | Resultado |
|---|---|---|
| Celdas en serie | `ceil(400 / 3,2)` | **125** |
| Capacidad objetivo | `40 000 Wh / 400 V` | 100 Ah |
| Celdas en paralelo | `ceil(100 / 100)` | **1** |
| Total de celdas | `125 × 1` | **125** |
| Energía real | `125 × 3,2 × 100 / 1000` | **40 kWh** |
| Masa de celdas | `125 × 2,0 kg` | 250 kg |
| Masa de pack | `× 1,20` | **300 kg** |
| Densidad del pack | `40 000 / 300` | **133 Wh/kg** |
| Potencia a 2C | `2 × 100 × 400` | **80 kW** |

### V2 · Corrida a tres regímenes (pack de 60 kWh: 150 Ah, 400 V, Rint 0,08 Ω, 400 kg, sin refrigerar)

| Régimen | Corriente | V terminal | Potencia | Calor I²R | ΔT por ciclo |
|---|---|---|---|---|---|
| 0,5C | 75 A | 394 V | 29,5 kW | 0,45 kW | **+9 K** |
| 1C | 150 A | 388 V | 58 kW | 1,8 kW | **+18 K** |
| 2C | 300 A | 376 V | 113 kW | 7,2 kW | **+36 K** |

`Cth = 400 kg × 900 J/(kg·K) = 360 kJ/K`; `ΔT = Q·t / Cth`.

### V3 · Autonomía con y sin aire acondicionado

| Escenario | Cálculo | Autonomía |
|---|---|---|
| Sin cargas | `60 000 Wh / 150 Wh/km` | **400 km** |
| Con A/C 3 kW al 60 % a 90 km/h | `150 + 1800/90 = 170 Wh/km` | **353 km** (−12 %) |
| Con A/C y PTC a la vez | `150 + (1800+2400)/90 = 197 Wh/km` | **305 km** (−24 %) |

### V4 · Arranque con plomo-ácido a 25 °C y a 0 °C

| Condición | Rint | Corriente | Caída | V terminal |
|---|---|---|---|---|
| 25 °C | 5 mΩ | 300 A | 1,5 V | **10,5 V** |
| 0 °C | 7,5 mΩ | 300 A | 2,25 V | **9,75 V** |
| −20 °C | 9,5 mΩ | 300 A | 2,85 V | **9,15 V** ← arranque difícil |

### V5 · Descarga en desuso

| Caso | Cálculo | Pérdida |
|---|---|---|
| LFP 40 kWh, 2 %/mes, 6 meses a 25 °C | `2 × 6` | **12 %** (4,8 kWh) |
| El mismo a 35 °C | `4 × 6` | **24 %** |
| Pb 60 Ah + parásita 50 mA, 30 días | `1,2 Ah/día × 30` | **36 Ah (60 %)** |
| NiMH 1,2 kWh, 25 %/mes, 6 meses | `25 × 6` | **>100 %** (se agota) |

### V6 · Falla de una celda con resistencia alta

Pack 125S, celda con `Rint` de 0,25 mΩ → 2,5 mΩ (×10), a 300 A:

| Magnitud | Valor |
|---|---|
| Calor en la celda sana | `300² × 0,00025` = **22,5 W** |
| Calor en la celda fallada | `300² × 0,0025` = **225 W** |
| Efecto en el voltaje del pack | ≈ 0,7 V (invisible) |
| Señal detectable | **ΔT local y desequilibrio**, no el voltaje total |

### V7 · Recuperación de frenado

`E_recuperable = ½ · m · v² · η_regen`. Vehículo de 1 700 kg a 60 km/h (16,7 m/s), η = 0,6:

```
E = 0,5 × 1700 × 16,7² × 0,6 ≈ 142 kJ ≈ 0,039 kWh por frenada
```

A 0,8C de carga (120 A en un pack de 150 Ah a 400 V = 48 kW), esa energía entra en **≈ 3 s**. Es lo que explica que la regeneración se limite por corriente de carga y no por energía.

---

## 13. Fuentes y notas de trazabilidad

**Del material del curso (9-11):** definiciones de capacidad, energía, C-rate, SOC/DOD, vida de ciclo, autodescarga, eficiencia, fuga térmica y propagación; clasificación de baterías; estructura celda/módulo/pack/sistema; serie/paralelo/mixto; voltajes nominales y de corte por química; ventajas y desventajas de plomo, NiMH y litio; estructura y sistema de la pila PEM.

**Investigación complementaria (valores numéricos):**

- Celda LFP prismática 280 Ah: 3,2 V, 280 Ah, 5,25–5,30 kg, 205×174×72 mm, `Rint ≤ 0,25 mΩ`, ~3 500 ciclos — [EVE 280 Ah (marketplace)](https://il.dhgate.com/product/4pcs-eve-grade-a-lfp-3-2v-3-2-v-280ah-lithium/776561485.html) · [ficha 280 Ah](https://www.bossgoo.com/product-detail/grade-a-lithium-iron-phosphate-lfp-64171493.html)
- Celda 21700: 4–5 Ah, 65–70 g, `Rint` 4–19 mΩ, 272 Wh/kg y 744 Wh/L en versiones tabless — [Murata US21700-VX40](https://chargerlab.com/murata-us21700-vx40-tabless-battery-50-charge-in-10-minutes) · [YFH-50Q](https://www.chargerlab.com/yfh-introduces-21700-tabless-battery-cell-yfh-50q/) · [21700-40P](http://www.redwaypower.com/product/21700-40p/)
- Autodescarga: LFP 1–3 %/mes; NMC/NCA 2–5 %/mes; plomo >3 %/mes en hoja de datos y 10–20 %/mes en servicio — [análisis comparativo de químicas](https://zenodo.org/records/15254095/files/Comparative%20Analysis%20of%20Lithium-Ion%20Cell%20Chemistries_%20NMC,%20LFP,%20LCO,%20LTO,%20LMO,%20and%20NCA.pdf) · [ficha VRLA](https://media.distrelec.com/Web/Downloads/_t/ds/1748856_4_eng_tds.pdf) · [resumen de autodescarga por química](https://bess-net.jp/glossary/self-discharge)
- Descarga profunda: sulfatación acelerada por debajo de 10,5 V en plomo — [Midtronics](https://www.midtronics.com/es/blog/is-deep-discharge-really-that-damaging/); disolución de cobre y cortocircuito interno en litio por sobredescarga — [Scientific Reports](https://www.nature.com/articles/srep30248) · [estudio de disolución de cobre](https://publications.diamond.ac.uk/pubman/downloadpublicationdocument?publicationDocumentId=5523)
- Cargas de 12 V: faros halógenos 8–9 A por par, LED 0,6–1 A por bombilla, radio 15–30 W, EPS 2–40 A — [AA1Car, cargas eléctricas](https://www.aa1car.com/library/electrical_amp_loads.pdf) · [tabla de consumos](https://lemzspb.ru/velichina-toka-v-bortovoy-seti-avtomobilya/)
- Climatización: PTC de 3 kW y bomba de calor con COP 2,8–3,5 — [estudio de sistemas de calefacción en VE](https://www.sciencedirect.com/science/article/pii/S2214157X24010815) · [COP y climatización](https://www.shapesbyhydro.com/en/sustainable_design/innovative-climate-systems-can-meet-e-mobility-heating-challenge/ToPdf?printview=true)
- Precio de packs 2025: media 108 $/kWh, LFP 81 $/kWh, NMC 128 $/kWh — [BloombergNEF vía The Battery Magazine](https://www.thebatterymagazine.com/global-lithium-ion-battery-pack-prices-fall-to-record-low-of-108-kwh-bloombergnef-reports/)
- Calor específico de celdas ~1 100 J/(kg·K) y flujo térmico de 0,5 W a 1C hasta 8,5 W a 6C — [NASA, thermal aspects of Li-ion cells](https://ntrs.nasa.gov/api/citations/20000112891/downloads/20000112891.pdf) · [J. Electrochem. Soc., gradientes térmicos](https://iopscience.iop.org/article/10.1149/2.0901813jes)
- Arquitecturas de 800 V y celdas de 4C en 2025 — [informe de arquitecturas de alta tensión](https://www.gii.tw/report/rinc1777126-new-energy-vehicle-1000v-high-voltage-architecture.html)

**Advertencia de uso:** los rangos marcados con 📐 son estimaciones para arrancar el modelo; sustitúyelos por la hoja de datos del proveedor cuando el simulador pase a diseño real. Ningún valor de este documento sustituye un ensayo de seguridad normalizado.

---

## Anexo · Checklist de implementación

- [ ] Base de datos de químicas cargada (§3) con sus 17 campos.
- [ ] Catálogo de celdas (§4) seleccionable por formato.
- [ ] Motor de configuración Ns/Np con redondeo hacia arriba y validación de potencia (§5).
- [ ] Catálogo de cargas HV y 12 V con ciclo de servicio (§6).
- [ ] Bucle de simulación con `dt` configurable (§7.2).
- [ ] Tabla `Voc(SOC)` por química (§7.3).
- [ ] Modelo térmico con `Cth` y `UA` (§2.2 y §7.2).
- [ ] Modelo de envejecimiento por ciclo y calendario (§7.6).
- [ ] Inyección de fallas en 4 niveles (§8).
- [ ] Motor de alarmas con 3 niveles por señal (§9.2).
- [ ] Autodescarga dependiente de temperatura (§3.1).
- [ ] Los 7 casos de validación pasando (§12).
- [ ] Exportación de resultados a CSV y gráficas de `V`, `I`, `T`, `SOC`.
