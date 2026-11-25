/**
 * Constantes y Parámetros de Química de Baterías
 * Corpus: [F31] Batería de potencia - conceptos y principios
 * Jerarquía de evidencia:
 *   A = Explícito en la fuente [F31]
 *   B = Inferencia directa o cálculo reproducible
 *   C = Parámetro de diseño o dato externo declarado
 */

export const CONFIDENCE = {
  A: { id: 'A', label: 'Explícito en la fuente', desc: 'Dato extraído directamente de diapositivas F30/F31' },
  B: { id: 'B', label: 'Inferencia directa', desc: 'Deducido de múltiples pasajes o fórmula canónica' },
  C: { id: 'C', label: 'Parámetro de diseño', desc: 'Ajuste de simulación, dato externo o condición de borde' }
};

export const CHEMISTRY_DATA = {
  LFP: {
    id: 'LFP',
    nombre: 'Fosfato de Hierro y Litio (LiFePO₄)',
    v_nominal_celda: 3.2,       // A: [F31·s43]
    v_corte_carga: 3.65,        // A: [F31·s14]
    v_corte_descarga: 2.5,      // A: [F31·s14] (rango fuente: 2.5–3.0 V)
    wh_kg_pack: 120,            // C: nivel pack (coherente con rango de celda 150-250 Wh/kg [F31·s16])
    c_continuo: 3.0,            // C: parámetro de diseño para celda de potencia
    c_pulso_10s: 6.0,           // C: pulso máximo admisible 10 s
    rint_pack_ref_mohm: 60,     // C: resistencia interna de referencia del pack
    n100_ciclos: 4000,          // C: ciclos al 100% DOD (larga vida característica LFP)
    costo_kwh_usd: 95,          // C: costo referencial de química económica
    peukert_k: 1.02,            // B: litio presenta efecto Peukert prácticamente despreciable [F31·s20]
    autodescarga_mes_pct: 3,    // A: litio <5%/mes [F31·s26]
    perfil: 'Muy segura, barata, larga vida de ciclo; densidad gravimétrica moderada',
    citas: ['[F31·s43]', '[F31·s14]', '[F31·s16]', '[F31·s26]'],
    nodos_grafo: ['MAT-LFP', 'CON-CRATE', 'CON-VENTANASOC']
  },
  NCM: {
    id: 'NCM',
    nombre: 'Níquel Cobalto Manganeso (NCM/NCA)',
    v_nominal_celda: 3.7,       // A: [F31·s43]
    v_corte_carga: 4.25,        // A: [F31·s44]
    v_corte_descarga: 3.0,      // A: [F31·s44]
    wh_kg_pack: 200,            // C: nivel pack (alta densidad energética)
    c_continuo: 4.0,            // C: parámetro de diseño
    c_pulso_10s: 8.0,           // C: alta capacidad de entrega de potencia instantánea
    rint_pack_ref_mohm: 50,     // C: menor resistencia interna por celda
    n100_ciclos: 2000,          // C: ciclos estándar a 100% DOD
    costo_kwh_usd: 140,         // C: costo más elevado por cobalto/níquel
    peukert_k: 1.01,            // B: despreciable en litio [F31·s20]
    autodescarga_mes_pct: 4,    // A: litio <5%/mes [F31·s26]
    perfil: 'Máxima energía específica y aceleración; mayor calentamiento y sensibilidad térmica',
    citas: ['[F31·s43]', '[F31·s44]', '[F31·s16]', '[F31·s24]'],
    nodos_grafo: ['MAT-NCM', 'CON-CRATE', 'CON-DERATING']
  },
  NIMH: {
    id: 'NiMH',
    nombre: 'Níquel e Hidruro Metálico (Ni-MH)',
    v_nominal_celda: 1.2,       // A: [F31·s40]
    v_corte_carga: 1.5,         // A: [F31·s40]
    v_corte_descarga: 1.0,      // A: [F31·s40]
    wh_kg_pack: 80,             // A: dentro del rango 70–95 Wh/kg [F31·s40]
    c_continuo: 5.0,            // C: química de alto pulso típica en vehículos híbridos
    c_pulso_10s: 10.0,          // C: alta capacidad de corriente de pico
    rint_pack_ref_mohm: 120,    // C: resistencia moderada-alta
    n100_ciclos: 1500,          // C: ciclos de durabilidad
    costo_kwh_usd: 120,         // C: parámetro de costo
    peukert_k: 1.15,            // B: efecto Peukert relevante en altas descargas [F31·s20]
    autodescarga_mes_pct: 20,   // A: ~20%/mes autodescarga característica [F31·s40]
    perfil: 'Alta seguridad intrínseca, excelente entrega de corriente de pulso; pesada y alta autodescarga',
    citas: ['[F31·s40]', '[F31·s20]'],
    nodos_grafo: ['MAT-NIMH', 'CON-EFECTO-PEUKERT']
  },
  PLOMO: {
    id: 'Plomo',
    nombre: 'Plomo-Ácido (Pb-Acid)',
    v_nominal_celda: 2.0,       // A: [F31·s36]
    v_corte_carga: 2.7,         // A: [F31·s36]
    v_corte_descarga: 1.6,      // A: [F31·s36]
    wh_kg_pack: 35,             // A: rango fuente 30–40 Wh/kg [F31·s37]
    c_continuo: 2.0,            // C: baja tolerancia a tasas de descarga continuas elevadas
    c_pulso_10s: 3.5,           // C: pulso máximo
    rint_pack_ref_mohm: 150,    // C: alta resistencia interna y fuerte calentamiento Joule
    n100_ciclos: 500,           // C: vida de ciclo reducida a DOD profundo
    costo_kwh_usd: 60,          // C: la química más económica por kWh instalado
    peukert_k: 1.30,            // A/B: k ≈ 1.2–1.4 en plomo [F31·s20]
    autodescarga_mes_pct: 30,   // A: ~30%/mes [F31·s26]
    perfil: 'Económica y robusta de −40 a 60 °C; extremadamente pesada, baja eficiencia de ciclo',
    citas: ['[F31·s36]', '[F31·s37]', '[F31·s20]', '[F31·s26]'],
    nodos_grafo: ['MAT-PLOMO', 'CON-EFECTO-PEUKERT', 'CON-DOD']
  },
  LTO: {
    id: 'LTO',
    nombre: 'Titanato de Litio (Li₄Ti₅O₁₂) [Experimental]',
    v_nominal_celda: 2.4,       // C: dato externo al corpus (fuera de F30/F31)
    v_corte_carga: 2.8,         // C: dato externo al corpus
    v_corte_descarga: 1.5,      // C: dato externo al corpus
    wh_kg_pack: 70,             // C: 60–80 Wh/kg dato externo al corpus
    c_continuo: 6.0,            // C: excelente tasa C
    c_pulso_10s: 12.0,          // C: pulso extremo
    rint_pack_ref_mohm: 45,     // C: bajísima resistencia interna
    n100_ciclos: 15000,         // C: longevidad extraordinaria
    costo_kwh_usd: 280,         // C: costo muy alto
    peukert_k: 1.01,            // C: despreciable
    autodescarga_mes_pct: 2,    // C: baja
    perfil: 'Dato externo al corpus (C). Vida ultra-larga y carga ultrarrápida; baja densidad gravimétrica',
    citas: [],                  // Sin anclas F31 conforme a la regla anti-alucinación §2
    nodos_grafo: []
  }
};

/**
 * 5 Trampas conceptuales didácticas (Falso / Verdadero con anclas del corpus F30/F31)
 */
export const CONCEPT_TRAPS = [
  {
    id: 'trap_1',
    afirmacion_falsa: 'El motor eléctrico necesita una caja de cambios de múltiples velocidades para funcionar eficientemente.',
    correccion: 'Falso: El motor eléctrico entrega su par máximo desde 0 rpm y puede alcanzar hasta ~15 000 rpm de forma continua, por lo que una transmisión reductora de una sola relación fija es suficiente.',
    cita: '[F30·s10]',
    pregunta: '¿Por qué la mayoría de los vehículos eléctricos puros emplean un reductor de relación fija en lugar de una caja de cambios convencional?',
    opciones: [
      'Porque el motor eléctrico entrega par máximo desde 0 rpm y tiene un amplio rango útil hasta ~15 000 rpm.',
      'Porque una caja de cambios aumentaría el voltaje del inversor de manera peligrosa.',
      'Porque la batería de tracción se descargaría más rápido al cambiar de velocidad mecánica.'
    ],
    correcta: 0
  },
  {
    id: 'trap_2',
    afirmacion_falsa: 'La corriente de alta tensión viaja directamente desde los bornes de la batería hacia las bobinas del motor de tracción.',
    correccion: 'Falso: En medio se interpone la PDU (Unidad de Distribución de Potencia) con fusibles y contactores, y la MCU/Inversor para conmutar la CC de la batería en corriente alterna trifásica.',
    cita: '[F30·s17]',
    pregunta: '¿Qué componente esencial se encuentra entre el pack de batería de alta tensión y el motor trifásico?',
    opciones: [
      'Un generador térmico de combustión acoplado en serie.',
      'La PDU (distribución y protección) y la MCU/Inversor (conversión CC a CA trifásica).',
      'Un convertidor DC-DC de 12V conectado directamente a las fases del estator.'
    ],
    correcta: 1
  },
  {
    id: 'trap_3',
    afirmacion_falsa: 'Si el vehículo ya cuenta con un pack de tracción de 400 V, la batería convencional de 12 V es innecesaria y se puede eliminar.',
    correccion: 'Falso: Sin el circuito de baja tensión de 12 V no es posible energizar la electrónica de control (VCU, BMS) ni cerrar los contactores principales de alta tensión por razones de seguridad.',
    cita: '[F30·s17]',
    pregunta: '¿Cuál es la función crítica de la batería auxiliar de 12 V en un vehículo eléctrico con tracción de alta tensión?',
    opciones: [
      'Aumentar la potencia máxima del motor durante aceleraciones a fondo.',
      'Alimentar las unidades de control (VCU, BMS) y energizar las bobinas de los contactores de alta tensión.',
      'Enfriar directamente el pack de batería cuando la temperatura supera 45 °C.'
    ],
    correcta: 1
  },
  {
    id: 'trap_4',
    afirmacion_falsa: 'El sistema de freno regenerativo es capaz de detener el vehículo por completo en cualquier situación sin ayuda de los frenos hidráulicos.',
    correccion: 'Falso: A velocidades muy bajas o cercanas a cero el motor no genera suficiente contra-electromotriz ni par de frenado; el sistema hidráulico por fricción es indispensable para la seguridad y detención total.',
    cita: '[F30·s31]',
    pregunta: '¿Por qué un vehículo eléctrico siempre mantiene un sistema de frenos hidráulicos convencionales?',
    opciones: [
      'Porque a velocidades muy bajas el motor no puede desarrollar par regenerativo suficiente para detener el vehículo.',
      'Porque la normativa prohíbe que el motor genere energía durante la desaceleración.',
      'Porque el frenado regenerativo solo funciona si la batería está cargada al 100% de SOC.'
    ],
    correcta: 0
  },
  {
    id: 'trap_5',
    afirmacion_falsa: 'Todos los vehículos híbridos (HEV) funcionan exactamente bajo el mismo principio y componentes.',
    correccion: 'Falso: Los vehículos híbridos varían profundamente en arquitectura mecánica (Serie, Paralelo o Combinado con engranaje planetario), grado de hibridación (micro, suave, pleno) y capacidad de recarga externa (PHEV).',
    cita: '[F30·s48]',
    pregunta: '¿En qué se diferencian principalmente las arquitecturas de vehículos híbridos (HEV)?',
    opciones: [
      'Solo en el color de los cables de alta tensión.',
      'En su conexión mecánica y de potencia (Serie, Paralelo, Combinado), grado de hibridación y presencia de toma de recarga.',
      'En que los híbridos en serie no poseen batería eléctrica.'
    ],
    correcta: 1
  }
];
