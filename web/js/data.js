/**
 * Simulador de Sistemas de Electromovilidad (VE y Híbridos)
 * Datos, componentes, terminales y respuestas oficiales
 */

const SIMULATOR_DATA = {
  // Módulo 1: Práctica de Conexiones en Vehículo Eléctrico Puro (BEV)
  bevWiring: {
    id: "bevWiring",
    code: "Page3",
    title: "Simulador de Cableado y Conexiones Prácticas (BEV)",
    subtitle: "Conexión física de componentes de alta tensión, baja tensión y arnés de control",
    canvasWidth: 1440,
    canvasHeight: 860,
    description: "Conecta los componentes del tren motriz eléctrico (batería de tracción, contactor DC, convertidor DC-DC, fusibles, controlador/inversor y motor trifásico). Selecciona el tipo de cable adecuado para cada circuito.",
    cableTypes: [
      { id: "hv_pos", name: "Alimentación Alta Tensión (+)", color: "#e63946", type: "Line", lineWidth: 4, desc: "Circuito de potencia HV positivo (rojo)" },
      { id: "hv_neg", name: "Alimentación Alta Tensión (-)", color: "#1d2a3a", type: "Line", lineWidth: 4, desc: "Circuito de potencia HV negativo (negro)" },
      { id: "lv_pos", name: "Alimentación Baja Tensión (+12V)", color: "#9b5de5", type: "Line", lineWidth: 3, desc: "Circuito auxiliar positivo de 12V (morado)" },
      { id: "lv_neg", name: "Retorno Baja Tensión (-12V / Tierra)", color: "#6c757d", type: "Line", lineWidth: 3, desc: "Circuito auxiliar negativo/retorno de 12V (gris)" },
      { id: "mcu_harness", name: "Arnés de Señales del Controlador", color: "#0077b6", type: "Line", lineWidth: 3, desc: "Señales de control de pedales, selector y tablero (azul)" }
    ],
    devices: [
      {
        id: "DCDCZHQ",
        name: "Convertidor DC-DC",
        desc: "Reduce el alto voltaje de tracción a 12V DC para alimentar accesorios y cargar la batería auxiliar.",
        image: "img/dcdc_converter.png",
        x: 100, y: 120, width: 300, height: 100,
        color: "#2a6f97",
        terminals: [
          { id: "DCDCZHQ_1", name: "Entrada HV (+)", label: "Entrada +", relX: 300, relY: 50 },
          { id: "DCDCZHQ_4", name: "Entrada HV (-)", label: "Entrada -", relX: 300, relY: 80 },
          { id: "DCDCZHQ_2", name: "Salida 12V (+)", label: "Salida +", relX: 100, relY: 100 },
          { id: "DCDCZHQ_3", name: "Salida 12V (-)", label: "Salida -", relX: 130, relY: 100 }
        ]
      },
      {
        id: "RDQ1",
        name: "Fusible 1 (DC-DC)",
        desc: "Protección contra sobrecorriente de entrada al convertidor DC-DC.",
        image: "img/fuse.png",
        x: 550, y: 170, width: 120, height: 50,
        color: "#4a5568",
        terminals: [
          { id: "RDQ1_1", name: "Salida Fusible 1", label: "Salida", relX: 0, relY: 25 },
          { id: "RDQ1_2", name: "Entrada Fusible 1", label: "Entrada", relX: 120, relY: 25 }
        ]
      },
      {
        id: "DXLJQ1",
        name: "Regleta Distribuidora Positiva",
        desc: "Distribuye la línea positiva de alta tensión hacia el controlador y el convertidor DC-DC.",
        image: "img/wire_connector.png",
        x: 750, y: 170, width: 130, height: 70,
        color: "#2d3748",
        terminals: [
          { id: "DXLJQ1_1", name: "Salida a DC-DC", label: "Salida", relX: 0, relY: 20 },
          { id: "DXLJQ1_2", name: "Entrada Principal (+)", label: "Entrada +", relX: 65, relY: 70 },
          { id: "DXLJQ1_3", name: "Salida a Controlador", label: "Salida", relX: 130, relY: 20 }
        ]
      },
      {
        id: "RDQ2",
        name: "Fusible 2 (Controlador)",
        desc: "Protección de alta corriente para la entrada de potencia del inversor/controlador.",
        image: "img/fuse.png",
        x: 950, y: 170, width: 120, height: 50,
        color: "#4a5568",
        terminals: [
          { id: "RDQ2_1", name: "Entrada Fusible 2", label: "Entrada", relX: 0, relY: 25 },
          { id: "RDQ2_2", name: "Salida Fusible 2", label: "Salida", relX: 120, relY: 45 }
        ]
      },
      {
        id: "DY12V",
        name: "Batería Auxiliar de 12V",
        desc: "Suministra energía a los sistemas de control, computadoras, relés y contactores.",
        image: "img/battery_12v.png",
        x: 200, y: 300, width: 130, height: 70,
        color: "#3182ce",
        terminals: [
          { id: "DY12V_1", name: "Alimentación de Control (+)", label: "Aux +", relX: 0, relY: 20 },
          { id: "DY12V_2", name: "Terminal Positivo (+)", label: "+", relX: 25, relY: 0 },
          { id: "DY12V_3", name: "Terminal Negativo (-)", label: "-", relX: 105, relY: 0 },
          { id: "DY12V_4", name: "Retorno a Bobina Contactor (-)", label: "GND", relX: 130, relY: 20 }
        ]
      },
      {
        id: "DXLJQ2",
        name: "Regleta Distribuidora Negativa",
        desc: "Punto de unión común para el retorno de potencia negativo de alta tensión.",
        image: "img/wire_connector.png",
        x: 850, y: 270, width: 130, height: 63,
        color: "#2d3748",
        terminals: [
          { id: "DXLJQ2_1", name: "Retorno DC-DC (-)", label: "DC-DC (-)", relX: 0, relY: 20 },
          { id: "DXLJQ2_2", name: "Retorno Batería Tracción (-)", label: "Bat. Trac (-)", relX: 65, relY: 63 },
          { id: "DXLJQ2_3", name: "Retorno Controlador (-)", label: "Controlador (-)", relX: 130, relY: 20 }
        ]
      },
      {
        id: "JDQKG",
        name: "Interruptor de Relé (Llave)",
        desc: "Permite activar el circuito de control de 12V al encender el vehículo.",
        image: "img/relay_switch.png",
        x: 455, y: 350, width: 60, height: 60,
        color: "#4a5568",
        terminals: [
          { id: "JDQKG_1", name: "Entrada de Control Relé", label: "Entrada", relX: 10, relY: 60 },
          { id: "JDQKG_2", name: "Salida a Contactor", label: "Salida", relX: 50, relY: 60 }
        ]
      },
      {
        id: "DLDY",
        name: "Batería de Tracción (HV)",
        desc: "Almacenamiento de alto voltaje (paquete de baterías de iones de litio) para la propulsión.",
        image: "img/traction_battery.png",
        x: 80, y: 530, width: 140, height: 60,
        color: "#e53e3e",
        terminals: [
          { id: "DLDY_1", name: "Polo Negativo (-)", label: "-", relX: 15, relY: 60 },
          { id: "DLDY_2", name: "Polo Positivo (+)", label: "+", relX: 140, relY: 10 }
        ]
      },
      {
        id: "JJKG",
        name: "Interruptor de Emergencia",
        desc: "Desconecta manualmente la línea de alta tensión ante incidentes o servicio técnico (MSD).",
        image: "img/emergency_switch.png",
        x: 320, y: 500, width: 70, height: 70,
        color: "#c53030",
        terminals: [
          { id: "JJKG_1", name: "Entrada desde Batería (+)", label: "Entrada", relX: 0, relY: 35 },
          { id: "JJKG_2", name: "Salida a Contactor", label: "Salida", relX: 70, relY: 35 }
        ]
      },
      {
        id: "ZLJCQ",
        name: "Contactor de Corriente Directa (DC)",
        desc: "Relé de potencia electromagnético de alta tensión que conmuta el suministro de la batería principal.",
        image: "img/dc_contactor.png",
        x: 500, y: 500, width: 140, height: 80,
        color: "#2b6cb0",
        terminals: [
          { id: "ZLJCQ_1", name: "Contacto de Potencia Entrada (+)", label: "Potencia In", relX: 0, relY: 20 },
          { id: "ZLJCQ_2", name: "Bobina Control (+12V)", label: "Bobina +", relX: 35, relY: 0 },
          { id: "ZLJCQ_3", name: "Bobina Control (-12V)", label: "Bobina -", relX: 105, relY: 0 },
          { id: "ZLJCQ_4", name: "Contacto de Potencia Salida (+)", label: "Potencia Out", relX: 140, relY: 20 }
        ]
      },
      {
        id: "RDQ3",
        name: "Fusible 3 (Línea Principal HV)",
        desc: "Fusible maestro de protección del circuito principal de tracción.",
        image: "img/fuse.png",
        x: 750, y: 500, width: 120, height: 50,
        color: "#4a5568",
        terminals: [
          { id: "RDQ3_1", name: "Entrada Fusible 3", label: "Entrada", relX: 0, relY: 25 },
          { id: "RDQ3_2", name: "Salida Fusible 3", label: "Salida", relX: 65, relY: 0 }
        ]
      },
      {
        id: "DDJKZQ",
        name: "Controlador de Motor (Inversor MCU)",
        desc: "Convierte DC a AC trifásica y controla torque, velocidad y frenado regenerativo.",
        image: "img/motor_controller.png",
        x: 950, y: 550, width: 180, height: 100,
        color: "#2b6cb0",
        terminals: [
          { id: "DDJKZQ_1", name: "Fase de Potencia W", label: "W", relX: 30, relY: 0 },
          { id: "DDJKZQ_2", name: "Alimentación DC (-)", label: "-", relX: 60, relY: 0 },
          { id: "DDJKZQ_3", name: "Fase de Potencia V", label: "V", relX: 90, relY: 0 },
          { id: "DDJKZQ_4", name: "Alimentación DC (+)", label: "+", relX: 120, relY: 0 },
          { id: "DDJKZQ_5", name: "Fase de Potencia U", label: "U", relX: 150, relY: 0 },
          { id: "DDJKZQ_6", name: "Puerto de Arnés de Señales", label: "Arnés", relX: 90, relY: 100 }
        ]
      },
      {
        id: "DDJ",
        name: "Motor Eléctrico Trifásico",
        desc: "Motor síncrono o de inducción trifásico que transforma energía eléctrica en tracción mecánica.",
        image: "img/electric_motor.png",
        x: 1170, y: 400, width: 200, height: 120,
        color: "#2c5282",
        terminals: [
          { id: "DDJ_1", name: "Terminal Fase U", label: "U", relX: 100, relY: 0 },
          { id: "DDJ_2", name: "Terminal Fase V", label: "V", relX: 130, relY: 0 },
          { id: "DDJ_3", name: "Terminal Fase W", label: "W", relX: 160, relY: 0 }
        ]
      },
      {
        id: "JSTB",
        name: "Pedal de Acelerador",
        desc: "Sensor de posición de acelerador (APP) que envía la solicitud de par al controlador.",
        image: "img/accelerator_pedal.png",
        x: 200, y: 700, width: 80, height: 100,
        color: "#718096",
        terminals: [
          { id: "JSTB", name: "Salida Señal Acelerador", label: "Señal", relX: 80, relY: 15 }
        ]
      },
      {
        id: "DWKG",
        name: "Selector de Marchas",
        desc: "Palanca o mando selector de marcha (Park, Reverse, Neutral, Drive).",
        image: "img/gear_switch.png",
        x: 500, y: 700, width: 100, height: 100,
        color: "#718096",
        terminals: [
          { id: "DWKG", name: "Salida Señal Marcha", label: "Señal", relX: 100, relY: 15 }
        ]
      },
      {
        id: "YB",
        name: "Tablero de Instrumentos",
        desc: "Cluster digital que indica velocidad, nivel de carga (SOC), potencia y alertas.",
        image: "img/dashboard.png",
        x: 800, y: 700, width: 100, height: 50,
        color: "#718096",
        terminals: [
          { id: "YB", name: "Entrada Señal Tablero", label: "Señal", relX: 100, relY: 15 }
        ]
      }
    ],
    // Respuestas válidas de conexiones en Page3
    answers: [
      { from: "DCDCZHQ_1", to: "RDQ1_1", color: "#e63946", type: "Line", name: "Entrada DC-DC a Fusible 1" },
      { from: "DCDCZHQ_4", to: "DXLJQ2_1", color: "#1d2a3a", type: "Line", name: "Negativo DC-DC a Distribuidor Negativo" },
      { from: "DCDCZHQ_3", to: "DY12V_3", color: "#6c757d", type: "Line", name: "Salida Negativa DC-DC a Batería 12V (-)" },
      { from: "DCDCZHQ_2", to: "DY12V_2", color: "#9b5de5", type: "Line", name: "Salida Positiva DC-DC a Batería 12V (+)" },
      { from: "DY12V_1", to: "JDQKG_1", color: "#9b5de5", type: "Line", name: "Batería 12V a Entrada Relé de Control" },
      { from: "DY12V_4", to: "ZLJCQ_3", color: "#6c757d", type: "Line", name: "Masa Batería 12V a Bobina Contactor (-)" },
      { from: "JDQKG_2", to: "ZLJCQ_2", color: "#9b5de5", type: "Line", name: "Salida Relé a Bobina Contactor (+)" },
      { from: "RDQ1_2", to: "DXLJQ1_1", color: "#e63946", type: "Line", name: "Entrada Fusible 1 a Distribuidor Positivo" },
      { from: "DXLJQ1_3", to: "RDQ2_1", color: "#e63946", type: "Line", name: "Distribuidor Positivo a Fusible 2" },
      { from: "RDQ2_2", to: "DDJKZQ_4", color: "#e63946", type: "Line", name: "Salida Fusible 2 a Entrada (+) Controlador" },
      { from: "DDJKZQ_1", to: "DDJ_3", color: "#e63946", type: "Line", name: "Fase W Controlador a Fase W Motor" },
      { from: "DDJKZQ_3", to: "DDJ_2", color: "#e63946", type: "Line", name: "Fase V Controlador a Fase V Motor" },
      { from: "DDJKZQ_5", to: "DDJ_1", color: "#e63946", type: "Line", name: "Fase U Controlador a Fase U Motor" },
      { from: "DXLJQ1_2", to: "RDQ3_2", color: "#e63946", type: "Line", name: "Distribuidor Positivo a Fusible Principal 3" },
      { from: "ZLJCQ_4", to: "RDQ3_1", color: "#e63946", type: "Line", name: "Salida Contactor DC a Entrada Fusible 3" },
      { from: "JJKG_2", to: "ZLJCQ_1", color: "#e63946", type: "Line", name: "Salida Emergencia a Entrada Contactor DC" },
      { from: "DLDY_2", to: "JJKG_1", color: "#e63946", type: "Line", name: "Batería Tracción (+) a Entrada Emergencia" },
      { from: "DLDY_1", to: "DXLJQ2_2", color: "#1d2a3a", type: "Line", name: "Batería Tracción (-) a Distribuidor Negativo" },
      { from: "DXLJQ2_3", to: "DDJKZQ_2", color: "#1d2a3a", type: "Line", name: "Distribuidor Negativo a Entrada (-) Controlador" },
      { from: "JSTB", to: "DDJKZQ_6", color: "#0077b6", type: "Line", name: "Pedal Acelerador a Arnés del Controlador" },
      { from: "DWKG", to: "DDJKZQ_6", color: "#0077b6", type: "Line", name: "Selector de Marchas a Arnés del Controlador" },
      { from: "YB", to: "DDJKZQ_6", color: "#0077b6", type: "Line", name: "Tablero a Arnés del Controlador" }
    ]
  },

  // Módulo 2: Principio de Funcionamiento de Vehículo Eléctrico Puro (BEV)
  bevPrinciples: {
    id: "bevPrinciples",
    code: "Page4",
    title: "Sistema de Principio de Funcionamiento (BEV)",
    subtitle: "Diagrama de bloques funcionales, flujos de señales de control, potencia eléctrica y mecánica",
    canvasWidth: 1280,
    canvasHeight: 760,
    description: "Conecta las relaciones lógicas entre las unidades de control (VCU), convertidor de potencia, motor, transmisión, gestión de baterías (BMS) y auxiliares con sus respectivos tipos de flujo.",
    cableTypes: [
      { id: "sig_right", name: "Señal de Control (Derecha ->)", color: "#1d2a3a", type: "RSArrow", lineWidth: 3, desc: "Flujo de datos/comando hacia la derecha" },
      { id: "sig_left", name: "Señal de Control (<- Izquierda)", color: "#1d2a3a", type: "LSArrow", lineWidth: 3, desc: "Flujo de datos/comando hacia la izquierda" },
      { id: "sig_bi", name: "Señal de Control (Bidireccional <->)", color: "#1d2a3a", type: "LRSArrow", lineWidth: 3, desc: "Comunicación bus CAN bidireccional" },
      { id: "pwr_right", name: "Potencia Eléctrica (Derecha =>)", color: "#1d2a3a", type: "RDArrow", lineWidth: 4, desc: "Flujo de potencia eléctrica hacia la derecha" },
      { id: "pwr_left", name: "Potencia Eléctrica (<= Izquierda)", color: "#1d2a3a", type: "LDArrow", lineWidth: 4, desc: "Flujo de potencia eléctrica hacia la izquierda" },
      { id: "pwr_bi", name: "Potencia Eléctrica (Bidireccional <=>)", color: "#1d2a3a", type: "LRDArrow", lineWidth: 4, desc: "Flujo de potencia bidireccional (tracción y regeneración)" },
      { id: "mech", name: "Conexión Mecánica (Doble Línea ==)", color: "#1d2a3a", type: "DLine", lineWidth: 4, desc: "Eje o acoplamiento mecánico de torsión" }
    ],
    devices: [
      { id: "ZDTB", name: "Pedal de Freno", x: 128, y: 182, width: 90, height: 30, color: "#ff8c00", terminals: [{ id: "ZDTB", name: "Salida Señal", relX: 90, relY: 15 }] },
      { id: "JSTB", name: "Pedal de Acelerador", x: 128, y: 225, width: 90, height: 30, color: "#e0a800", terminals: [{ id: "JSTB", name: "Salida Señal", relX: 90, relY: 15 }] },
      { id: "DKDY", name: "Unidad de Control Electrónico (VCU)", x: 267, y: 185, width: 110, height: 70, color: "#28a745", terminals: [
        { id: "DKDY_L1", name: "Entrada Freno", relX: 0, relY: 20 },
        { id: "DKDY_L2", name: "Entrada Acelerador", relX: 0, relY: 50 },
        { id: "DKDY_R", name: "Control a Inversor", relX: 110, relY: 35 },
        { id: "DKDY_B", name: "Bus a BMS", relX: 55, relY: 70 }
      ] },
      { id: "GLZHQ", name: "Convertidor de Potencia (Inversor)", x: 432, y: 186, width: 110, height: 70, color: "#d39e00", terminals: [
        { id: "GLZHQ_L", name: "Control VCU", relX: 0, relY: 35 },
        { id: "GLZHQ_R", name: "Potencia Trifásica", relX: 110, relY: 35 },
        { id: "GLZHQ_B", name: "Potencia DC Batería", relX: 55, relY: 70 }
      ] },
      { id: "SXGYDJ", name: "Motor de Inducción Trifásico", x: 608, y: 180, width: 110, height: 76, color: "#dc3545", terminals: [
        { id: "SXGYDJ_L", name: "Entrada Potencia", relX: 0, relY: 38 },
        { id: "SXGYDJ_R", name: "Eje Mecánico", relX: 110, relY: 38 }
      ] },
      { id: "JXCDZZ", name: "Transmisión Mecánica", x: 768, y: 198, width: 110, height: 50, color: "#007bff", terminals: [
        { id: "JXCDZZ_L", name: "Entrada Motor", relX: 0, relY: 25 },
        { id: "JXCDZZ_T", name: "Eje Rueda 1", relX: 55, relY: 0 },
        { id: "JXCDZZ_B", name: "Eje Rueda 2", relX: 55, relY: 50 }
      ] },
      { id: "CL1", name: "Rueda Delantera / Izq.", x: 785, y: 110, width: 76, height: 26, color: "#6f42c1", terminals: [{ id: "CL1", name: "Eje", relX: 38, relY: 26 }] },
      { id: "CL2", name: "Rueda Trasera / Der.", x: 785, y: 311, width: 76, height: 26, color: "#6f42c1", terminals: [{ id: "CL2", name: "Eje", relX: 38, relY: 0 }] },
      { id: "NLGLXT", name: "Sistema de Gestión de Energía (BMS)", x: 267, y: 375, width: 110, height: 70, color: "#fd7e14", terminals: [
        { id: "NLGLXT_T", name: "Bus a VCU", relX: 55, relY: 0 },
        { id: "NLGLXT_R", name: "Bus Batería", relX: 110, relY: 35 },
        { id: "NLGLXT_B", name: "Bus Cargador", relX: 55, relY: 70 }
      ] },
      { id: "XDC", name: "Batería de Tracción (HV)", x: 433, y: 375, width: 110, height: 70, color: "#17a2b8", terminals: [
        { id: "XDC_T", name: "Potencia a Inversor", relX: 55, relY: 0 },
        { id: "XDC_L", name: "Monitoreo BMS", relX: 0, relY: 35 },
        { id: "XDC_R", name: "Potencia a Auxiliares", relX: 110, relY: 35 },
        { id: "XDC_B", name: "Carga de Batería", relX: 55, relY: 70 }
      ] },
      { id: "FZDLY", name: "Fuente de Energía Auxiliar (DC-DC)", x: 599, y: 375, width: 110, height: 70, color: "#d39e00", terminals: [
        { id: "FZDLY_L", name: "Alimentación HV", relX: 0, relY: 35 },
        { id: "FZDLY_R", name: "Potencia Dirección", relX: 110, relY: 35 },
        { id: "FZDLY_B", name: "Potencia Climatización", relX: 55, relY: 70 }
      ] },
      { id: "DLZXDY", name: "Dirección Asistida Eléctrica (EPS)", x: 767, y: 375, width: 110, height: 70, color: "#dc3545", terminals: [
        { id: "DLZXDY_L", name: "Alimentación EPS", relX: 0, relY: 35 },
        { id: "DLZXDY_R", name: "Entrada Volante", relX: 110, relY: 35 }
      ] },
      { id: "ZXP", name: "Volante de Dirección", x: 947, y: 385, width: 80, height: 50, color: "#fd7e14", terminals: [{ id: "ZXP", name: "Sensor Giro", relX: 0, relY: 25 }] },
      { id: "CDXT", name: "Sistema de Carga a Bordo (OBC)", x: 433, y: 508, width: 110, height: 70, color: "#dc3545", terminals: [
        { id: "CDXT_L", name: "Control BMS", relX: 0, relY: 35 },
        { id: "CDXT_T", name: "Salida a Batería", relX: 55, relY: 0 },
        { id: "CDXT_B", name: "Entrada Red Externa", relX: 55, relY: 70 }
      ] },
      { id: "WDKZDY", name: "Gestión Térmica / Climatización", x: 600, y: 508, width: 110, height: 70, color: "#17a2b8", terminals: [{ id: "WDKZDY", name: "Alimentación", relX: 55, relY: 0 }] },
      { id: "WJDY", name: "Red Eléctrica Externa (Toma Carga)", x: 438, y: 639, width: 100, height: 35, color: "#007bff", terminals: [{ id: "WJDY", name: "Corriente AC/DC", relX: 50, relY: 0 }] }
    ],
    answers: [
      { from: "ZDTB", to: "DKDY_L1", color: "#1d2a3a", type: "RSArrow", name: "Pedal Freno -> VCU" },
      { from: "JSTB", to: "DKDY_L2", color: "#1d2a3a", type: "RSArrow", name: "Pedal Acelerador -> VCU" },
      { from: "DKDY_R", to: "GLZHQ_L", color: "#1d2a3a", type: "LRSArrow", name: "VCU <-> Inversor" },
      { from: "GLZHQ_R", to: "SXGYDJ_L", color: "#1d2a3a", type: "LRDArrow", name: "Inversor <=> Motor Trifásico" },
      { from: "SXGYDJ_R", to: "JXCDZZ_L", color: "#1d2a3a", type: "DLine", name: "Motor == Transmisión" },
      { from: "CL1", to: "JXCDZZ_T", color: "#1d2a3a", type: "DLine", name: "Rueda 1 == Transmisión" },
      { from: "JXCDZZ_B", to: "CL2", color: "#1d2a3a", type: "DLine", name: "Transmisión == Rueda 2" },
      { from: "DKDY_B", to: "NLGLXT_T", color: "#1d2a3a", type: "LRSArrow", name: "VCU <-> BMS" },
      { from: "GLZHQ_B", to: "XDC_T", color: "#1d2a3a", type: "LDArrow", name: "Batería => Inversor" },
      { from: "NLGLXT_R", to: "XDC_L", color: "#1d2a3a", type: "LRSArrow", name: "BMS <-> Batería" },
      { from: "XDC_R", to: "FZDLY_L", color: "#1d2a3a", type: "RDArrow", name: "Batería => Fuente Auxiliar" },
      { from: "FZDLY_R", to: "DLZXDY_L", color: "#1d2a3a", type: "RDArrow", name: "Fuente Auxiliar => Dirección Eléctrica" },
      { from: "DLZXDY_R", to: "ZXP", color: "#1d2a3a", type: "LSArrow", name: "Volante -> Dirección Eléctrica" },
      { from: "NLGLXT_B", to: "CDXT_L", color: "#1d2a3a", type: "LRSArrow", name: "BMS <-> Cargador On-Board" },
      { from: "XDC_B", to: "CDXT_T", color: "#1d2a3a", type: "LDArrow", name: "Cargador => Batería" },
      { from: "CDXT_B", to: "WJDY", color: "#1d2a3a", type: "LDArrow", name: "Red Externa => Cargador" },
      { from: "FZDLY_B", to: "WDKZDY", color: "#1d2a3a", type: "RDArrow", name: "Fuente Auxiliar => Gestión Térmica" }
    ]
  },

  // Módulo 3: Vehículo Híbrido en Serie (HEV Series)
  hybridSeries: {
    id: "hybridSeries",
    code: "Page6",
    title: "Sistema Híbrido en Serie",
    subtitle: "El motor de combustión mueve únicamente al generador eléctrico; solo el motor eléctrico propulsa las ruedas",
    canvasWidth: 1200,
    canvasHeight: 700,
    description: "En la arquitectura en serie, el motor térmico no tiene acoplamiento mecánico a las ruedas. Genera electricidad para la batería y el motor de tracción eléctrico.",
    cableTypes: [
      { id: "elec", name: "Conexión Eléctrica (Línea Continua)", color: "#1d2a3a", type: "Line", lineWidth: 4, desc: "Flujo de potencia eléctrica" },
      { id: "mech", name: "Conexión Mecánica (Doble Línea)", color: "#1d2a3a", type: "DLine", lineWidth: 4, desc: "Acoplamiento de giro / torque mecánico" },
      { id: "fuel", name: "Línea de Combustible (Fluido Rojo)", color: "#e63946", type: "Line", lineWidth: 4, desc: "Suministro de gasolina/diésel desde el tanque" }
    ],
    devices: [
      { id: "YX", name: "Tanque de Combustible", x: 220, y: 140, width: 100, height: 60, color: "#ff8c00", terminals: [{ id: "YX_R", name: "Salida Combustible", relX: 100, relY: 30 }] },
      { id: "FDOJ", name: "Motor de Combustión", x: 420, y: 140, width: 100, height: 60, color: "#d63384", terminals: [
        { id: "FDOJ_L", name: "Entrada Combustible", relX: 0, relY: 30 },
        { id: "FDOJ_B", name: "Eje hacia Generador", relX: 50, relY: 60 }
      ] },
      { id: "FDIJ", name: "Generador Eléctrico", x: 420, y: 290, width: 100, height: 60, color: "#28a745", terminals: [
        { id: "FDIJ_T", name: "Eje desde Motor Térmico", relX: 50, relY: 0 },
        { id: "FDIJ_B", name: "Salida Eléctrica AC", relX: 50, relY: 60 }
      ] },
      { id: "XDC", name: "Batería de Tracción", x: 220, y: 440, width: 100, height: 60, color: "#17a2b8", terminals: [{ id: "XDC_R", name: "Potencia Batería", relX: 100, relY: 30 }] },
      { id: "GLZHQ", name: "Convertidor / Inversor", x: 420, y: 440, width: 100, height: 60, color: "#dc3545", terminals: [
        { id: "GLZHQ_T", name: "Entrada desde Generador", relX: 50, relY: 0 },
        { id: "GLZHQ_L", name: "Puerto Batería", relX: 0, relY: 30 },
        { id: "GLZHQ_R", name: "Salida a Motor Eléctrico", relX: 100, relY: 30 }
      ] },
      { id: "FDOJ2", name: "Motor Eléctrico de Tracción", x: 620, y: 440, width: 100, height: 60, color: "#e0a800", terminals: [
        { id: "FDOJ2_L", name: "Entrada Eléctrica", relX: 0, relY: 30 },
        { id: "FDOJ2_R", name: "Eje de Salida", relX: 100, relY: 30 }
      ] },
      { id: "CGZZ", name: "Transmisión / Ruedas", x: 820, y: 440, width: 100, height: 60, color: "#dc3545", terminals: [{ id: "CGZZ_L", name: "Entrada Mecánica", relX: 0, relY: 30 }] }
    ],
    answers: [
      { from: "YX_R", to: "FDOJ_L", color: "#e63946", type: "Line", name: "Tanque -> Motor Combustión (Combustible)" },
      { from: "FDOJ_B", to: "FDIJ_T", color: "#1d2a3a", type: "DLine", name: "Motor Combustión == Generador (Mecánico)" },
      { from: "FDIJ_B", to: "GLZHQ_T", color: "#1d2a3a", type: "Line", name: "Generador -> Convertidor (Eléctrico)" },
      { from: "XDC_R", to: "GLZHQ_L", color: "#1d2a3a", type: "Line", name: "Batería <-> Convertidor (Eléctrico)" },
      { from: "GLZHQ_R", to: "FDOJ2_L", color: "#1d2a3a", type: "Line", name: "Convertidor -> Motor Eléctrico (Eléctrico)" },
      { from: "FDOJ2_R", to: "CGZZ_L", color: "#1d2a3a", type: "DLine", name: "Motor Eléctrico == Transmisión (Mecánico)" }
    ]
  },

  // Módulo 4: Vehículo Híbrido en Paralelo (HEV Parallel)
  hybridParallel: {
    id: "hybridParallel",
    code: "Page7",
    title: "Sistema Híbrido en Paralelo",
    subtitle: "Tanto el motor de combustión como el motor eléctrico pueden entregar torque mecánico directamente a las ruedas",
    canvasWidth: 1200,
    canvasHeight: 700,
    description: "Ambos motores están acoplados mecánicamente a la transmisión mediante embragues o engranajes sumadores.",
    cableTypes: [
      { id: "elec", name: "Conexión Eléctrica (Línea Continua)", color: "#1d2a3a", type: "Line", lineWidth: 4, desc: "Flujo de potencia eléctrica" },
      { id: "mech", name: "Conexión Mecánica (Doble Línea)", color: "#1d2a3a", type: "DLine", lineWidth: 4, desc: "Acoplamiento de giro / torque mecánico" },
      { id: "fuel", name: "Línea de Combustible (Fluido Rojo)", color: "#e63946", type: "Line", lineWidth: 4, desc: "Suministro de combustible" }
    ],
    devices: [
      { id: "YX", name: "Tanque de Combustible", x: 220, y: 140, width: 100, height: 60, color: "#ff8c00", terminals: [{ id: "YX_R", name: "Salida Combustible", relX: 100, relY: 30 }] },
      { id: "FDJ", name: "Motor de Combustión", x: 420, y: 140, width: 100, height: 60, color: "#d63384", terminals: [
        { id: "FDJ_L", name: "Entrada Combustible", relX: 0, relY: 30 },
        { id: "FDJ_R", name: "Eje Mecánico", relX: 100, relY: 30 }
      ] },
      { id: "XDC", name: "Batería de Tracción", x: 220, y: 290, width: 100, height: 60, color: "#e0a800", terminals: [{ id: "XDC_R", name: "Terminal Potencia", relX: 100, relY: 30 }] },
      { id: "GLZHQ", name: "Convertidor / Inversor", x: 420, y: 290, width: 100, height: 60, color: "#dc3545", terminals: [
        { id: "GLZHQ_L", name: "Conexión Batería", relX: 0, relY: 30 },
        { id: "GLZHQ_R", name: "Conexión Motor", relX: 100, relY: 30 }
      ] },
      { id: "DDJ", name: "Motor Eléctrico", x: 620, y: 290, width: 100, height: 60, color: "#17a2b8", terminals: [
        { id: "DDJ_L", name: "Entrada Eléctrica", relX: 0, relY: 30 },
        { id: "DDJ_R", name: "Eje Mecánico", relX: 100, relY: 30 }
      ] },
      { id: "CDZZ", name: "Acoplador Mecánico y Transmisión", x: 820, y: 140, width: 100, height: 210, color: "#28a745", terminals: [
        { id: "CDZZ_L1", name: "Entrada Motor Combustión", relX: 0, relY: 30 },
        { id: "CDZZ_L2", name: "Entrada Motor Eléctrico", relX: 0, relY: 180 }
      ] }
    ],
    answers: [
      { from: "YX_R", to: "FDJ_L", color: "#e63946", type: "Line", name: "Tanque -> Motor Térmico (Combustible)" },
      { from: "FDJ_R", to: "CDZZ_L1", color: "#1d2a3a", type: "DLine", name: "Motor Térmico == Acoplador (Mecánico)" },
      { from: "XDC_R", to: "GLZHQ_L", color: "#1d2a3a", type: "Line", name: "Batería <-> Convertidor (Eléctrico)" },
      { from: "GLZHQ_R", to: "DDJ_L", color: "#1d2a3a", type: "Line", name: "Convertidor <-> Motor Eléctrico (Eléctrico)" },
      { from: "DDJ_R", to: "CDZZ_L2", color: "#1d2a3a", type: "DLine", name: "Motor Eléctrico == Acoplador (Mecánico)" }
    ]
  },

  // Módulo 5: Vehículo Híbrido Combinado (HEV Series-Parallel / Split)
  hybridCombined: {
    id: "hybridCombined",
    code: "Page8",
    title: "Sistema Híbrido Combinado (Serie-Paralelo)",
    subtitle: "Dispositivo repartidor de potencia (engranaje planetario): tracción mecánica directa y generación eléctrica simultánea",
    canvasWidth: 1200,
    canvasHeight: 720,
    description: "Combina las ventajas del sistema en serie y en paralelo mediante un divisor de potencia planetario (PSD, como en el sistema Toyota Hybrid Synergy Drive).",
    cableTypes: [
      { id: "elec", name: "Conexión Eléctrica (Línea Continua)", color: "#1d2a3a", type: "Line", lineWidth: 4, desc: "Flujo de potencia eléctrica" },
      { id: "mech", name: "Conexión Mecánica (Doble Línea)", color: "#1d2a3a", type: "DLine", lineWidth: 4, desc: "Acoplamiento de giro / torque mecánico" },
      { id: "fuel", name: "Línea de Combustible (Fluido Rojo)", color: "#e63946", type: "Line", lineWidth: 4, desc: "Suministro de combustible" }
    ],
    devices: [
      { id: "YX", name: "Tanque de Combustible", x: 220, y: 140, width: 100, height: 60, color: "#ff8c00", terminals: [{ id: "YX_R", name: "Salida Combustible", relX: 100, relY: 30 }] },
      { id: "FDJ", name: "Motor de Combustión", x: 420, y: 140, width: 100, height: 60, color: "#d63384", terminals: [
        { id: "FDJ_L", name: "Entrada Combustible", relX: 0, relY: 30 },
        { id: "FDJ_R", name: "Eje hacia Transmisión", relX: 100, relY: 30 },
        { id: "FDJ_B", name: "Eje hacia Generador", relX: 50, relY: 60 }
      ] },
      { id: "FDJ1", name: "Generador Eléctrico (MG1)", x: 420, y: 290, width: 100, height: 60, color: "#e0a800", terminals: [
        { id: "FDJ1_T", name: "Eje desde Motor Térmico", relX: 50, relY: 0 },
        { id: "FDJ1_B", name: "Salida Eléctrica a Inversor", relX: 50, relY: 60 }
      ] },
      { id: "XDC", name: "Batería de Tracción", x: 220, y: 440, width: 100, height: 60, color: "#e0a800", terminals: [{ id: "XDC_R", name: "Potencia Batería", relX: 100, relY: 30 }] },
      { id: "GLZHQ", name: "Convertidor / Inversor Dual", x: 420, y: 440, width: 100, height: 60, color: "#dc3545", terminals: [
        { id: "GLZHQ_T", name: "Entrada desde Generador", relX: 50, relY: 0 },
        { id: "GLZHQ_L", name: "Puerto Batería", relX: 0, relY: 30 },
        { id: "GLZHQ_R", name: "Salida a Motor Eléctrico", relX: 100, relY: 30 }
      ] },
      { id: "DDJ", name: "Motor Eléctrico (MG2)", x: 620, y: 440, width: 100, height: 60, color: "#17a2b8", terminals: [
        { id: "DDJ_L", name: "Entrada Eléctrica", relX: 0, relY: 30 },
        { id: "DDJ_R", name: "Eje hacia Transmisión", relX: 100, relY: 30 }
      ] },
      { id: "CDZZ", name: "Divisor Planetario y Transmisión", x: 820, y: 140, width: 100, height: 360, color: "#28a745", terminals: [
        { id: "CDZZ_L1", name: "Entrada Motor Térmico", relX: 0, relY: 30 },
        { id: "CDZZ_L2", name: "Entrada Motor Eléctrico", relX: 0, relY: 330 }
      ] }
    ],
    answers: [
      { from: "YX_R", to: "FDJ_L", color: "#e63946", type: "Line", name: "Tanque -> Motor Térmico (Combustible)" },
      { from: "FDJ_R", to: "CDZZ_L1", color: "#1d2a3a", type: "DLine", name: "Motor Térmico == Divisor (Mecánico)" },
      { from: "XDC_R", to: "GLZHQ_L", color: "#1d2a3a", type: "Line", name: "Batería <-> Inversor (Eléctrico)" },
      { from: "GLZHQ_R", to: "DDJ_L", color: "#1d2a3a", type: "Line", name: "Inversor <-> Motor Eléctrico (Eléctrico)" },
      { from: "DDJ_R", to: "CDZZ_L2", color: "#1d2a3a", type: "DLine", name: "Motor Eléctrico == Transmisión (Mecánico)" },
      { from: "FDJ_B", to: "FDJ1_T", color: "#1d2a3a", type: "DLine", name: "Motor Térmico == Generador MG1 (Mecánico)" },
      { from: "FDJ1_B", to: "GLZHQ_T", color: "#1d2a3a", type: "Line", name: "Generador MG1 -> Inversor (Eléctrico)" }
    ]
  }
};
