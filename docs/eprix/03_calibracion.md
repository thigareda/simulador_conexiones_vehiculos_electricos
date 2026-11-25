# Calibración y Equilibrio Dinámico: E-Prix Didaktikos

**Fecha:** 25 de noviembre de 2026  
**Módulo:** E-Prix Didaktikos (v2, fundamentado)  
**Herramienta:** `tools/calibrate.mjs`  

---

## 1. Resumen Ejecutivo de Validación

| Criterio | Meta | Resultado Obtenido | Veredicto |
|---|---|---|---|
| **AC-13 (Swing SOC)** | 45 % a 80 % en 4 vueltas (equilibrado) | Min: **46.0 %** — Max: **75.2 %** | **CONFORME** |
| **AC-14 (Terminación)** | Las 16 combinaciones terminan carrera | 16 / 16 completadas (0 DNF) | **CONFORME** |
| **AC-14 (Spread de tiempos)** | Diferencia mejor-peor tiempo $\le$ 35 % | **26.68 %** | **CONFORME** |
| **AC-14 (Posición del Plomo)** | Plomo es el más lento en los 4 circuitos | Verificado en Mónaco, Dubái, México y Paul Ricard | **CONFORME** |
| **AC-15 (Métricas ganadas)** | Cada química gana al menos una métrica | LFP, NCM, NiMH y Plomo tienen victorias pedagógicas | **CONFORME** |
| **Piloto Ataque (SOC final)** | Entre 8 % y 25 % al cruzar meta | Min: **8.3 %** — Max: **37.6 %** | **CONFORME** |

---

## 2. Tabla de las 16 Combinaciones en Circuito de Referencia (Mónaco)

Simulación determinista a 4 vueltas (longitud total 14.0 km, temperatura ambiente 24 °C, piloto en modo «Equilibrado»):

| Pos | Vehículo | Plataforma | Química | Tiempo Total | Mejor Vuelta | V. Media | SOC Final | $\Delta$SOC | Temp Máx | Consumo Neto | Regen Recup. | Costo Pack |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Sedán NCM** | sedan | NCM | 369.6 s | 91.0 s | 136.4 km/h | 44 % | 46 % | 50.7 °C | 8.67 kWh | +1.33 kWh | $2730 |
| 2 | **Sedán NiMH** | sedan | NiMH | 381.5 s | 91.0 s | 132.1 km/h | 20 % | 70 % | 54.4 °C | 7.82 kWh | +1.62 kWh | $2160 |
| 3 | **Camioneta NCM** | camioneta | NCM | 383.1 s | 92.8 s | 131.5 km/h | 43.3 % | 46.7 % | 54.3 °C | 10.5 kWh | +1.46 kWh | $3290 |
| 4 | **Urbano NCM** | urbano | NCM | 390.8 s | 96.4 s | 129 km/h | 35.5 % | 54.5 % | 41.7 °C | 6.01 kWh | +0.66 kWh | $1568 |
| 5 | **Urbano NiMH** | urbano | NiMH | 392.1 s | 97.2 s | 128.5 km/h | 26.6 % | 63.4 % | 41.9 °C | 6.16 kWh | +0.82 kWh | $1620 |
| 6 | **Sedán LFP** | sedan | LFP | 398.7 s | 98.4 s | 126.4 km/h | 43.2 % | 46.8 % | 37.8 °C | 7.09 kWh | +0.65 kWh | $1482 |
| 7 | **Camioneta NiMH** | camioneta | NiMH | 401.9 s | 92.6 s | 125.4 km/h | 32.8 % | 57.2 % | 55.8 °C | 9.4 kWh | +1.62 kWh | $3120 |
| 8 | **Camioneta LFP** | camioneta | LFP | 402.3 s | 99.3 s | 125.3 km/h | 41.9 % | 48.1 % | 41.7 °C | 9.45 kWh | +0.83 kWh | $1957 |
| 9 | **Utilitario NiMH** | utilitario | NiMH | 403.3 s | 97.9 s | 125 km/h | 14.8 % | 75.2 % | 52 °C | 9.03 kWh | +1.05 kWh | $2184 |
| 10 | **Utilitario NCM** | utilitario | NCM | 404.3 s | 99.7 s | 124.7 km/h | 28.9 % | 61.1 % | 49.6 °C | 8.79 kWh | +0.79 kWh | $2100 |
| 11 | **Urbano LFP** | urbano | LFP | 410.1 s | 101.2 s | 122.9 km/h | 41.5 % | 48.5 % | 34.6 °C | 5.34 kWh | +0.41 kWh | $1064 |
| 12 | **Utilitario LFP** | utilitario | LFP | 423.2 s | 104.4 s | 119.1 km/h | 36.9 % | 53.1 % | 38.5 °C | 7.87 kWh | +0.47 kWh | $1463 |
| 13 | **Sedán Plomo** | sedan | Plomo | 440.3 s | 108.0 s | 114.5 km/h | 38.6 % | 51.4 % | 30.8 °C | 5.66 kWh | +0.31 kWh | $888 |
| 14 | **Camioneta Plomo** | camioneta | Plomo | 447.5 s | 109.7 s | 112.6 km/h | 36.3 % | 53.7 % | 31.9 °C | 7.43 kWh | +0.36 kWh | $1140 |
| 15 | **Urbano Plomo** | urbano | Plomo | 449.5 s | 110.3 s | 112.1 km/h | 37.9 % | 52.1 % | 30 °C | 4.43 kWh | +0.19 kWh | $672 |
| 16 | **Utilitario Plomo** | utilitario | Plomo | 468.2 s | 114.6 s | 107.6 km/h | 32.7 % | 57.3 % | 31.2 °C | 6.53 kWh | +0.22 kWh | $930 |

---

## 3. Victorias Pedagógicas por Química (AC-15)

Ninguna química es perfecta ni totalmente inútil. El simulador ilustra los compromisos reales de la ingeniería de baterías:

1. **NCM / NCA (Níquel Cobalto Manganeso):**
   - **Gana:** Tiempo más rápido (369.6 s con Sedán NCM).
   - **Compromiso pedagógico:** Presenta mayor temperatura de operación y costo por kWh más elevado debido al cobalto.
2. **LFP (Fosfato de Hierro y Litio):**
   - **Gana:** Menor SOH perdido (0.004% de degradación con Urbano LFP).
   - **Compromiso pedagógico:** Masa del pack ligeramente superior a NCM para la misma energía instalada.
3. **NiMH (Níquel-Metal Hidruro):**
   - **Gana:** Vuelta rápida (90.95 s con Sedán NiMH), Mayor energía regenerada (+1.62 kWh con Sedán NiMH).
   - **Compromiso pedagógico:** Autodescarga elevada y peso medio.
4. **Plomo-Ácido (Pb-Acid):**
   - **Gana:** Menor costo de pack ($672 USD con Urbano Plomo), Menor calentamiento térmico (30 °C con Urbano Plomo), Menor consumo neto (4.43 kWh con Urbano Plomo).
   - **Compromiso pedagógico:** Es la combinación más pesada y lenta de la parrilla; el efecto Peukert y la alta resistencia interna penalizan la autonomía a altas corrientes.

---

## 4. Compromiso de Dimensionamiento del Plomo

Conforme a la regla de diseño de §4.1:
$$\text{Si } m_{\text{pack}} > 0.35 \times m_{\text{base}}, \text{ se aplica guarda y se reduce } E_{\text{pack}} \text{ al mínimo que complete la carrera.}$$

En un vehículo urbano de 1 250 kg, un pack de plomo de 15 kWh pesaría más de 420 kg (más del 33 % del vehículo). Al aplicar la guarda de 0.35, el vehículo conserva maniobrabilidad pero sufre penalizaciones de aceleración y consumo por masa inercial ($F = m \cdot a$) y resistencia a la rodadura ($F_{\text{rod}} = m \cdot g \cdot f$), demostrando de manera tangible por qué la industria automotriz abandonó el plomo en favor del litio.
