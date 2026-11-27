/**
 * Paquete de idiomas (Español / English / 中文 - Chino Mandarín)
 * Simulador de Conexiones de Vehículos Eléctricos e Híbridos
 */
(function () {
  const STORAGE_KEY = "simulador_lang";
  const SUPPORTED_LANGS = ["es", "en", "zh"];

  const UI_TRANSLATIONS = {
    es: {
      page_title: "Simulador de Conexiones de Vehículos Eléctricos e Híbridos",
      brand_title: "Simulador EV & HEV",
      brand_subtitle: "Electromovilidad & Conexiones",
      nav_home: "Inicio",
      nav_bev: "Vehículos Eléctricos (BEV)",
      nav_battery_lab: "🧪 Lab de Baterías",
      nav_hev: "Vehículos Híbridos (HEV)",
      nav_notes: "📘 Anotaciones",
      nav_eprix: "🏎️ E-Prix",
      nav_back: "⬅ Volver",
      lang_label: "Idioma",

      card_battery_tag: "Diseño & Pruebas",
      card_battery_title: "Battery Design Lab",
      card_battery_desc: "Diseña packs de baterías electroquímicos (LFP, NCM, LTO, Pb, NiMH), dimensiona Ns/Np, evalúa térmicamente, inyecta fallas y analiza la respuesta del BMS con simulación de fuga térmica.",
      card_battery_btn: "Entrar al Laboratorio ➔",
      bat_title: "🧪 Laboratorio de Diseño y Pruebas de Baterías",
      bat_subtitle: "Dimensionamiento Ns/Np, modelo electrotérmico dinámico, cargas auxiliares, inyección de fallas y telemetría BMS en tiempo real.",
      bat_btn_tutorial: "📖 Tutorial / Guía Rápida",

      home_badge: "Plataforma de Simulación & Práctica",
      home_title: "Sistema de Aprendizaje y Práctica del Sistema de Accionamiento Eléctrico",
      home_desc: "Entorno interactivo para el estudio y práctica del conexionado de componentes de alta tensión, sistemas auxiliares, arneses de control y principios de funcionamiento en vehículos eléctricos puros e híbridos.",
      card_bev_tag: "100% Eléctrico (BEV)",
      card_bev_title: "Vehículo Eléctrico Puro",
      card_bev_desc: "Simulador de conexiones prácticas de componentes de tracción de alta tensión (batería, inversor, motor trifásico, contactores, convertidor DC-DC) y diagrama de principios de funcionamiento.",
      card_bev_btn: "Explorar Módulos BEV ➔",
      card_hev_tag: "Híbridos (HEV)",
      card_hev_title: "Vehículo Eléctrico Híbrido",
      card_hev_desc: "Estudio interactivo de arquitecturas de propulsión híbrida: configuración en Serie, configuración en Paralelo y configuración Combinada (Serie-Paralelo con divisor planetario).",
      card_hev_btn: "Explorar Módulos HEV ➔",
      card_eprix_tag: "Competición & Electroquímica",
      card_eprix_title: "E-Prix Didaktikos",
      card_eprix_desc: "Simulador de carreras eléctricas top-down: 4 vehículos compiten 4 vueltas donde la química de la batería, el C-rate y el freno regenerativo deciden la victoria.",
      card_eprix_btn: "Iniciar E-Prix ➔",
      card_notes_tag: "Documentación & Mantenimiento",
      card_notes_title: "Anotaciones de Aprendizaje",
      card_notes_desc: "Guía técnica completa del simulador: arquitecturas BEV, separación HV/LV, inversor, baterías, contactores y sistemas híbridos serie, paralelo y combinado.",
      card_notes_btn: "Consultar Anotaciones ➔",

      bev_badge: "Módulos BEV",
      bev_title: "Sistema de Tracción de Vehículo Eléctrico Puro",
      bev_desc: "Selecciona una modalidad de aprendizaje: simulación de cableado práctico entre componentes reales o el análisis del principio de funcionamiento lógico y flujo de energía.",
      bev_wiring_tag: "Simulación Práctica",
      bev_wiring_title: "Simulador de Cableado Físico",
      bev_wiring_desc: "Conecta los terminales del convertidor DC-DC, relé, contactor DC, fusibles de alta tensión, controlador de motor, batería de tracción y motor eléctrico trifásico.",
      bev_wiring_btn: "Iniciar Práctica de Cableado ➔",
      bev_principles_tag: "Principio de Operación",
      bev_principles_title: "Diagrama de Flujo y Principios",
      bev_principles_desc: "Establece las relaciones de control (VCU, BMS), flujo de potencia eléctrica bidireccional y enlaces mecánicos hacia la transmisión y las ruedas motrices.",
      bev_principles_btn: "Iniciar Diagrama Lógico ➔",
      btn_back_home: "⬅ Volver al Menú Principal",

      hev_badge: "Módulos HEV",
      hev_title: "Sistema de Tracción de Vehículos Eléctricos Híbridos",
      hev_desc: "Analiza y realiza las conexiones de potencia, mecánicas y de combustible en las tres principales arquitecturas de propulsión híbrida automotriz.",
      hev_series_tag: "Arquitectura 1",
      hev_series_title: "Híbrido en Serie",
      hev_series_desc: "El motor térmico acciona un generador para cargar la batería o suministrar electricidad al motor de tracción eléctrico.",
      hev_series_btn: "Abrir Híbrido en Serie ➔",
      hev_parallel_tag: "Arquitectura 2",
      hev_parallel_title: "Híbrido en Paralelo",
      hev_parallel_desc: "Tanto el motor de combustión como el motor eléctrico están acoplados mecánicamente a las ruedas mediante la transmisión.",
      hev_parallel_btn: "Abrir Híbrido en Paralelo ➔",
      hev_combined_tag: "Arquitectura 3",
      hev_combined_title: "Híbrido Combinado",
      hev_combined_desc: "Sistema serie-paralelo con engranaje planetario divisor de potencia (PSD). Permite tracción mecánica y generación simultánea.",
      hev_combined_btn: "Abrir Híbrido Combinado ➔",

      sim_btn_run: "▶ Ejecutar / Probar",
      sim_btn_run_title: "Comprobar si el circuito está correctamente conectado",
      sim_btn_undo: "↩ Deshacer",
      sim_btn_undo_title: "Deshacer última conexión (Ctrl+Z)",
      sim_btn_delete: "🗑 Modo Eliminar",
      sim_btn_delete_title: "Activa el modo para eliminar cables al hacer clic en ellos",
      sim_btn_clear: "🧹 Limpiar Todo",
      sim_btn_clear_title: "Borrar todas las conexiones del lienzo",
      sim_btn_solution: "👁 Ver Solución",
      sim_btn_solution_title: "Mostrar/Ocultar diagrama con las conexiones correctas",
      sim_sidebar_cables: "⚡ Tipo de Cable / Conexión",
      sim_sidebar_desc: "📋 Descripción Técnica",
      sim_sidebar_help: "💡 Instrucciones Rápidas",
      sim_help_1: "Selecciona el tipo de cable en la lista superior.",
      sim_help_2: "Haz clic sobre el primer terminal (resaltará en amarillo).",
      sim_help_3: "Haz clic en el terminal de destino para trazar la línea.",
      sim_help_4: "Presiona <strong>\"Ejecutar / Probar\"</strong> para verificar el sistema.",
      sim_help_5: "Haz clic sobre cualquier componente para ver su ficha técnica.",
      sim_status_initial: "Sistema listo. Selecciona dos terminales para conectar.",
      sim_status_ready_module: "Selecciona un tipo de cable y haz clic en dos terminales para unirlos.",
      sim_status_cancel_esc: "Selección de terminal cancelada.",
      sim_status_undo: "Acción deshecha.",
      sim_status_cleared: "Lienzo limpiado.",
      sim_status_solution_on: "Mostrando diagrama de conexiones oficial.",
      sim_status_solution_off: "Modo edición de conexiones activo.",
      sim_status_no_cables_err: "Aún no se ha realizado ninguna conexión en el sistema.",
      sim_status_no_cables_msg: "Fallo: No hay cables conectados.",
      sim_err_wrong_conn: "Conexión incorrecta entre {0} y {1}.",
      sim_err_wrong_type: "Conexión entre {0} y {1} tiene tipo de cable o color incorrecto.",
      sim_err_wrong_dir: "Conexión entre {0} y {1} tiene la dirección de flujo invertida.",
      sim_err_missing: "Faltan {0} conexiones por realizar en el circuito.",
      sim_status_success: "¡Éxito! Todas las conexiones del sistema son 100% correctas. El vehículo opera adecuadamente.",
      sim_status_success_detail: "✔ Circuito validado exitosamente. Todos los módulos y arneses tienen continuidad nominal.",
      sim_status_fail: "Fallo en la prueba ({0}/{1} correctas). Revisa los circuitos señalados.",
      sim_status_removed_pin: "Cable(s) eliminado(s) de {0}.",
      sim_status_start_pin: "Punto inicial seleccionado: {0}. Ahora selecciona el terminal destino.",
      sim_status_cancel_pin: "Selección cancelada.",
      sim_status_exists: "Ya existe un cable entre estos dos terminales.",
      sim_status_connected: "Cable conectado: {0} -> {1}.",
      sim_status_line_removed: "Cable eliminado.",

      notes_badge: "Referencia Técnica Canónica",
      notes_title: "Anotaciones de Aprendizaje y Mantenimiento",
      notes_subtitle: "Arquitectura eléctrica y lógica de funcionamiento BEV & HEV del simulador autónomo.",
      notes_btn_back: "⬅ Volver",
      notes_btn_back_title: "Volver a la vista anterior",
      notes_btn_top: "⬆ Subir",
      notes_btn_top_title: "Ir al inicio del documento",
      notes_toc_header: "📑 Índice de Contenidos",
      notes_btn_back_bottom: "⬅ Volver a la vista anterior",
      notes_btn_top_bottom: "⬆ Volver arriba",
      notes_fallback: "No se pudo inicializar el visor de anotaciones de aprendizaje.",
      notes_toc_empty: "Índice no disponible.",
      notes_lang_notice: "",

      modal_badge: "Ficha Técnica",
      modal_default_desc: "Componente del sistema de electromovilidad.",
      modal_terminals_title: "Terminales y Conexiones:",

      bev_autonomy_tag: "Dinámica Vehicular & SOC",
      bev_autonomy_title: "Laboratorio Virtual de Autonomía y Consumo (BEV)",
      bev_autonomy_desc: "Simula la autonomía real y el consumo energético variando masa, aerodinámica, pendientes de ruta y ciclos de conducción (NEDC, WLTC, CLTC).",
      bev_autonomy_btn: "Abrir Laboratorio de Autonomía ➔",
      auto_title: "Laboratorio Virtual de Autonomía y Consumo (BEV)",
      auto_subtitle: "Cálculo físico de dinámica vehicular, consumo energético y autonomía por ciclos y pendientes.",
      auto_btn_reset: "↺ Reiniciar",
      auto_hud_cycle: "Ciclo:",
      auto_hud_slope: "Pendiente:",
      auto_hud_time: "Tiempo:",
      auto_route_progress: "Progreso de Ruta:",
      auto_seg_current: "Tramo:",
      auto_tele_title: "📊 Telemetría en Tiempo Real",
      auto_tele_speed: "Velocidad",
      auto_tele_cons: "Consumo Inst.",
      auto_tele_soc: "Batería (SOC)",
      auto_tele_energy: "Energía Rest.",
      auto_tele_est: "Autonomía Est. / Consumo Medio",
      auto_tele_forces: "Desglose de Fuerzas (Ft = Fa + Fr + Fp + Fi)",
      auto_veh_title: "🚗 Perfil de Vehículo y Parámetros Físicos",
      auto_param_mass: "Masa (kg)",
      auto_param_bat: "Batería (kWh)",
      auto_param_af: "Área Frontal Af (m²)",
      auto_param_crr: "Rodadura (Crr)",
      auto_cycle_title: "📈 Ciclo de Conducción",
      auto_route_title: "🛣 Editor de Ruta (Pendientes)",
      auto_btn_add_seg: "+ Añadir Tramo",
      auto_res_badge: "Resultados de Simulación",
      auto_res_title: "Resumen de Autonomía y Consumo",
      auto_res_dist: "Autonomía Real Alcanzada",
      auto_res_cons: "Consumo Medio",
      auto_res_est: "Autonomía Total Estimada",
      auto_res_reached: "¿Llegó a destino?",

      auth_logout: "Cerrar sesión",
      auth_signed_in_as: "Sesión iniciada como",
      auth_offline: "Login Google sin conexión",
      auth_file_hint: "Login Google requiere HTTP/HTTPS",
      auth_err_invalid_credential: "Credencial de Google inválida o expirada.",
      auth_err_storage: "No se pudo guardar la sesión local.",
      auth_err_popup: "No se pudo completar el inicio de sesión con Google."
    },

    en: {
      page_title: "Electric & Hybrid Vehicle Wiring Simulator",
      brand_title: "EV & HEV Simulator",
      brand_subtitle: "Electromobility & Wiring",
      nav_home: "Home",
      nav_bev: "Electric Vehicles (BEV)",
      nav_battery_lab: "🧪 Battery Lab",
      nav_hev: "Hybrid Vehicles (HEV)",
      nav_notes: "📘 Study Notes",
      nav_eprix: "🏎️ E-Prix",
      nav_back: "⬅ Back",
      lang_label: "Language",

      card_battery_tag: "Design & Testing",
      card_battery_title: "Battery Design Lab",
      card_battery_desc: "Design electrochemical battery packs (LFP, NCM, LTO, Pb, NiMH), size Ns/Np, evaluate thermal behavior, inject faults, and analyze BMS response including thermal runaway.",
      card_battery_btn: "Enter Laboratory ➔",
      bat_title: "🧪 Battery Design & Testing Lab",
      bat_subtitle: "Ns/Np sizing, dynamic electro-thermal model, auxiliary loads, fault injection, and real-time BMS telemetry.",
      bat_btn_tutorial: "📖 Tutorial / Quick Guide",

      home_badge: "Simulation & Practice Platform",
      home_title: "Electric Drive System Learning and Practice Platform",
      home_desc: "Interactive environment for studying and practicing high-voltage component wiring, auxiliary systems, control harnesses, and operating principles in pure electric and hybrid vehicles.",
      card_bev_tag: "100% Electric (BEV)",
      card_bev_title: "Battery Electric Vehicle",
      card_bev_desc: "Practical wiring simulator for high-voltage traction components (battery, inverter, 3-phase motor, contactors, DC-DC converter) and operating principles diagram.",
      card_bev_btn: "Explore BEV Modules ➔",
      card_hev_tag: "Hybrids (HEV)",
      card_hev_title: "Hybrid Electric Vehicle",
      card_hev_desc: "Interactive study of hybrid propulsion architectures: Series, Parallel, and Combined (Series-Parallel with planetary power-split device).",
      card_hev_btn: "Explore HEV Modules ➔",
      card_eprix_tag: "Racing & Electrochemistry",
      card_eprix_title: "E-Prix Didaktikos",
      card_eprix_desc: "Top-down electric racing simulator: 4 vehicles race 4 laps where battery chemistry, C-rate, and regenerative braking decide victory.",
      card_eprix_btn: "Start E-Prix ➔",
      card_notes_tag: "Documentation & Maintenance",
      card_notes_title: "Study Notes",
      card_notes_desc: "Complete technical guide: BEV architectures, HV/LV isolation, inverter, batteries, contactors, and series, parallel, and combined hybrid systems.",
      card_notes_btn: "Read Study Notes ➔",

      bev_badge: "BEV Modules",
      bev_title: "Battery Electric Vehicle Traction System",
      bev_desc: "Select a learning mode: practical physical wiring simulation between real components or logical operating principles and energy flow analysis.",
      bev_wiring_tag: "Practical Simulation",
      bev_wiring_title: "Physical Wiring Simulator",
      bev_wiring_desc: "Connect the terminals of the DC-DC converter, relay, DC contactor, high-voltage fuses, motor controller, traction battery, and three-phase electric motor.",
      bev_wiring_btn: "Start Wiring Practice ➔",
      bev_principles_tag: "Operating Principle",
      bev_principles_title: "Flow & Principles Diagram",
      bev_principles_desc: "Establish control relationships (VCU, BMS), bidirectional electric power flow, and mechanical links to the transmission and drive wheels.",
      bev_principles_btn: "Start Logic Diagram ➔",
      btn_back_home: "⬅ Back to Main Menu",

      hev_badge: "HEV Modules",
      hev_title: "Hybrid Electric Vehicle Traction Systems",
      hev_desc: "Analyze and complete power, mechanical, and fuel connections across the three main automotive hybrid propulsion architectures.",
      hev_series_tag: "Architecture 1",
      hev_series_title: "Series Hybrid",
      hev_series_desc: "The internal combustion engine drives a generator to charge the battery or supply electricity to the electric traction motor.",
      hev_series_btn: "Open Series Hybrid ➔",
      hev_parallel_tag: "Architecture 2",
      hev_parallel_title: "Parallel Hybrid",
      hev_parallel_desc: "Both the combustion engine and the electric motor are mechanically coupled to the wheels through the transmission.",
      hev_parallel_btn: "Open Parallel Hybrid ➔",
      hev_combined_tag: "Architecture 3",
      hev_combined_title: "Combined Hybrid",
      hev_combined_desc: "Series-parallel system with a planetary power-split device (PSD), enabling simultaneous mechanical traction and generation.",
      hev_combined_btn: "Open Combined Hybrid ➔",

      sim_btn_run: "▶ Run / Test",
      sim_btn_run_title: "Check if the circuit is properly wired",
      sim_btn_undo: "↩ Undo",
      sim_btn_undo_title: "Undo last connection (Ctrl+Z)",
      sim_btn_delete: "🗑 Delete Mode",
      sim_btn_delete_title: "Enable mode to remove wires by clicking them",
      sim_btn_clear: "🧹 Clear All",
      sim_btn_clear_title: "Remove all connections from the canvas",
      sim_btn_solution: "👁 Show Solution",
      sim_btn_solution_title: "Show/Hide official wiring diagram",
      sim_sidebar_cables: "⚡ Wire / Connection Type",
      sim_sidebar_desc: "📋 Technical Description",
      sim_sidebar_help: "💡 Quick Instructions",
      sim_help_1: "Select the wire type from the list above.",
      sim_help_2: "Click the first terminal (it will highlight in yellow).",
      sim_help_3: "Click the destination terminal to draw the line.",
      sim_help_4: "Press <strong>\"Run / Test\"</strong> to verify the system.",
      sim_help_5: "Click any component to view its technical datasheet.",
      sim_status_initial: "System ready. Select two terminals to connect.",
      sim_status_ready_module: "Select a wire type and click two terminals to connect them.",
      sim_status_cancel_esc: "Terminal selection canceled.",
      sim_status_undo: "Action undone.",
      sim_status_cleared: "Canvas cleared.",
      sim_status_solution_on: "Showing official wiring diagram.",
      sim_status_solution_off: "Connection editing mode active.",
      sim_status_no_cables_err: "No connections have been made in the system yet.",
      sim_status_no_cables_msg: "Test failed: No wires connected.",
      sim_err_wrong_conn: "Incorrect connection between {0} and {1}.",
      sim_err_wrong_type: "Connection between {0} and {1} has the wrong wire type or color.",
      sim_err_wrong_dir: "Connection between {0} and {1} has reversed flow direction.",
      sim_err_missing: "{0} connection(s) are still missing in the circuit.",
      sim_status_success: "Success! All system connections are 100% correct. The vehicle operates properly.",
      sim_status_success_detail: "✔ Circuit validated successfully. All modules and harnesses have nominal continuity.",
      sim_status_fail: "Test failed ({0}/{1} correct). Check the highlighted circuits.",
      sim_status_removed_pin: "Wire(s) removed from {0}.",
      sim_status_start_pin: "Start terminal selected: {0}. Now select the target terminal.",
      sim_status_cancel_pin: "Selection canceled.",
      sim_status_exists: "A wire already exists between these two terminals.",
      sim_status_connected: "Wire connected: {0} -> {1}.",
      sim_status_line_removed: "Wire removed.",

      notes_badge: "Canonical Technical Reference",
      notes_title: "Learning & Maintenance Notes",
      notes_subtitle: "Electrical architecture and BEV & HEV operating logic of the standalone simulator.",
      notes_btn_back: "⬅ Back",
      notes_btn_back_title: "Return to previous view",
      notes_btn_top: "⬆ Top",
      notes_btn_top_title: "Go to top of document",
      notes_toc_header: "📑 Table of Contents",
      notes_btn_back_bottom: "⬅ Return to previous view",
      notes_btn_top_bottom: "⬆ Back to top",
      notes_fallback: "Could not initialize the study notes viewer.",
      notes_toc_empty: "Index unavailable.",
      notes_lang_notice: "💡 Note: Simulator UI, components, and wiring checks are in English; the full technical reference document below remains in Spanish to preserve canonical terminology.",

      modal_badge: "Technical Datasheet",
      modal_default_desc: "Electromobility system component.",
      modal_terminals_title: "Terminals & Connections:",

      bev_autonomy_tag: "Vehicle Dynamics & SOC",
      bev_autonomy_title: "Virtual Range & Energy Consumption Lab (BEV)",
      bev_autonomy_desc: "Simulate real-world driving range and energy consumption by varying mass, aerodynamics, road grades, and driving cycles (NEDC, WLTC, CLTC).",
      bev_autonomy_btn: "Open Range Lab ➔",
      auto_title: "Virtual Range & Energy Consumption Lab (BEV)",
      auto_subtitle: "Physical calculation of vehicle dynamics, energy consumption, and range across driving cycles and road grades.",
      auto_btn_reset: "↺ Reset",
      auto_hud_cycle: "Cycle:",
      auto_hud_slope: "Grade:",
      auto_hud_time: "Time:",
      auto_route_progress: "Route Progress:",
      auto_seg_current: "Segment:",
      auto_tele_title: "📊 Real-Time Telemetry",
      auto_tele_speed: "Speed",
      auto_tele_cons: "Inst. Cons.",
      auto_tele_soc: "Battery (SOC)",
      auto_tele_energy: "Energy Left",
      auto_tele_est: "Est. Range / Avg. Consumption",
      auto_tele_forces: "Force Breakdown (Ft = Fa + Fr + Fp + Fi)",
      auto_veh_title: "🚗 Vehicle Profile & Physical Parameters",
      auto_param_mass: "Mass (kg)",
      auto_param_bat: "Battery (kWh)",
      auto_param_af: "Frontal Area Af (m²)",
      auto_param_crr: "Rolling Res. (Crr)",
      auto_cycle_title: "📈 Driving Cycle",
      auto_route_title: "🛣 Route Editor (Grades)",
      auto_btn_add_seg: "+ Add Segment",
      auto_res_badge: "Simulation Results",
      auto_res_title: "Range & Consumption Summary",
      auto_res_dist: "Actual Distance Reached",
      auto_res_cons: "Average Consumption",
      auto_res_est: "Estimated Total Range",
      auto_res_reached: "Reached destination?",

      auth_logout: "Sign out",
      auth_signed_in_as: "Signed in as",
      auth_offline: "Google Sign-In offline",
      auth_file_hint: "Google Sign-In requires HTTP/HTTPS",
      auth_err_invalid_credential: "Invalid or expired Google credential.",
      auth_err_storage: "Could not save local session.",
      auth_err_popup: "Could not complete Google Sign-In."
    },

    zh: {
      page_title: "纯电动及混合动力汽车接线模拟器",
      brand_title: "EV & HEV 模拟器",
      brand_subtitle: "电动出行与电路接线",
      nav_home: "主页",
      nav_bev: "纯电动汽车 (BEV)",
      nav_battery_lab: "🧪 电池实验室",
      nav_hev: "混合动力汽车 (HEV)",
      nav_notes: "📘 学习笔记",
      nav_eprix: "🏎️ E-Prix",
      nav_back: "⬅ 返回",
      lang_label: "语言",

      card_battery_tag: "设计与测试",
      card_battery_title: "电池设计与测试实验室 (Battery Design Lab)",
      card_battery_desc: "设计电化学电池包（LFP、NCM、LTO、铅酸、镍氢），计算 Ns/Np 串并联、热管理评估、故障注入及热失控条件下的 BMS 实时响应分析。",
      card_battery_btn: "进入实验室 ➔",
      bat_title: "🧪 电池设计与测试实验室 (Battery Design Lab)",
      bat_subtitle: "Ns/Np 串并联匹配、电热动态模型、辅助负载、故障注入与 BMS 实时遥测。",
      bat_btn_tutorial: "📖 教程 / 快速指南",

      home_badge: "仿真与实训平台",
      home_title: "电驱动系统学习与接线实训平台",
      home_desc: "交互式教学环境，用于学习和练习纯电动汽车（BEV）及混合动力汽车（HEV）的高压部件接线、辅助系统、控制线束与工作原理。",
      card_bev_tag: "100% 纯电动 (BEV)",
      card_bev_title: "纯电动汽车",
      card_bev_desc: "高压牵引部件接线实训模拟器（动力电池、逆变器、三相电动机、直流接触器、DC-DC 转换器）及系统工作原理图。",
      card_bev_btn: "探索 BEV 模块 ➔",
      card_hev_tag: "混合动力 (HEV)",
      card_hev_title: "混合动力电动汽车",
      card_hev_desc: "交互式学习三大混动推进架构：串联式（Series）、并联式（Parallel）以及混联式（带行星齿轮功率分流装置的串并联系统）。",
      card_hev_btn: "探索 HEV 模块 ➔",
      card_eprix_tag: "竞速与电化学",
      card_eprix_title: "Didaktikos 电动大奖赛",
      card_eprix_desc: "俯视角电动汽车竞速模拟器：4辆赛车角逐4圈，电池化学体系、充放电倍率（C-rate）与再生制动共同决定胜负。",
      card_eprix_btn: "开始 E-Prix 赛事 ➔",
      card_notes_tag: "技术文档与维护",
      card_notes_title: "学习笔记",
      card_notes_desc: "模拟器完整技术指南：BEV 架构、高低压隔离、逆变器、电池、接触器，以及串联、并联与混联混动系统。",
      card_notes_btn: "查阅学习笔记 ➔",

      bev_badge: "BEV 模块",
      bev_title: "纯电动汽车牵引系统",
      bev_desc: "请选择学习模式：真实部件间的物理接线仿真，或逻辑控制原理与能量流向分析。",
      bev_wiring_tag: "实操仿真",
      bev_wiring_title: "物理接线模拟器",
      bev_wiring_desc: "连接 DC-DC 转换器、继电器、直流接触器、高压熔断器、电机控制器、动力电池与三相电动机的各个端子。",
      bev_wiring_btn: "开始接线实训 ➔",
      bev_principles_tag: "工作原理",
      bev_principles_title: "能量流向与原理图",
      bev_principles_desc: "建立整车控制（VCU、BMS）信号关系、双向电能流向以及通往传动系统与驱动车轮的机械连接。",
      bev_principles_btn: "开始原理图练习 ➔",
      btn_back_home: "⬅ 返回主菜单",

      hev_badge: "HEV 模块",
      hev_title: "混合动力电动汽车牵引系统",
      hev_desc: "分析并完成三种主要汽车混动推进架构中的电力、机械与燃油管路连接。",
      hev_series_tag: "架构 1",
      hev_series_title: "串联式混动",
      hev_series_desc: "热机驱动发电机为电池充电，或直接向电驱动电机供电以驱动车辆。",
      hev_series_btn: "打开串联式混动 ➔",
      hev_parallel_tag: "架构 2",
      hev_parallel_title: "并联式混动",
      hev_parallel_desc: "内燃机与电动机均通过传动系统与车轮实现机械耦合，可共同或独立输出动力。",
      hev_parallel_btn: "打开并联式混动 ➔",
      hev_combined_tag: "架构 3",
      hev_combined_title: "混联式混动",
      hev_combined_desc: "带行星齿轮功率分流装置（PSD）的串并联系统，可同时实现机械牵引与发电。",
      hev_combined_btn: "打开混联式混动 ➔",

      sim_btn_run: "▶ 运行 / 测试",
      sim_btn_run_title: "检查电路接线是否全部正确",
      sim_btn_undo: "↩ 撤销",
      sim_btn_undo_title: "撤销上一步连接 (Ctrl+Z)",
      sim_btn_delete: "🗑 删除模式",
      sim_btn_delete_title: "启用删除模式，点击导线即可将其移除",
      sim_btn_clear: "🧹 全部清除",
      sim_btn_clear_title: "清除画布上的所有连接",
      sim_btn_solution: "👁 查看标准答案",
      sim_btn_solution_title: "显示或隐藏官方标准接线图",
      sim_sidebar_cables: "⚡ 导线 / 连接类型",
      sim_sidebar_desc: "📋 技术说明",
      sim_sidebar_help: "💡 快速操作指南",
      sim_help_1: "在上方列表中选择所需的导线类型。",
      sim_help_2: "点击第一个端子（将以黄色高亮显示）。",
      sim_help_3: "点击目标端子即可绘制连接线。",
      sim_help_4: "点击<strong>“运行 / 测试”</strong>以验证整个系统。",
      sim_help_5: "点击任意部件可查看其技术参数卡。",
      sim_status_initial: "系统就绪，请选择两个端子进行连接。",
      sim_status_ready_module: "请选择一种导线类型，然后点击两个端子将其连接。",
      sim_status_cancel_esc: "已取消端子选择。",
      sim_status_undo: "已撤销操作。",
      sim_status_cleared: "画布已清空。",
      sim_status_solution_on: "正在显示官方标准接线图。",
      sim_status_solution_off: "接线编辑模式已激活。",
      sim_status_no_cables_err: "系统中尚未建立任何连接。",
      sim_status_no_cables_msg: "测试失败：尚未连接任何导线。",
      sim_err_wrong_conn: "{0} 与 {1} 之间的连接不正确。",
      sim_err_wrong_type: "{0} 与 {1} 之间的导线类型或颜色有误。",
      sim_err_wrong_dir: "{0} 与 {1} 之间的信号或功率流向相反。",
      sim_err_missing: "电路中还有 {0} 条连接尚未完成。",
      sim_status_success: "成功！所有系统接线 100% 正确，车辆运行正常。",
      sim_status_success_detail: "✔ 电路验证通过！所有模块和线束均保持正常导通。",
      sim_status_fail: "测试未通过（正确 {0}/{1} 条）。请检查标出的线路。",
      sim_status_removed_pin: "已移除 {0} 上的导线。",
      sim_status_start_pin: "已选择起点：{0}。现在请选择目标端子。",
      sim_status_cancel_pin: "已取消选择。",
      sim_status_exists: "这两个端子之间已经存在导线。",
      sim_status_connected: "已连接导线：{0} -> {1}。",
      sim_status_line_removed: "导线已删除。",

      notes_badge: "规范技术参考",
      notes_title: "学习与维护技术笔记",
      notes_subtitle: "独立仿真器的 BEV 与 HEV 电气架构及运行逻辑。",
      notes_btn_back: "⬅ 返回",
      notes_btn_back_title: "返回上一视图",
      notes_btn_top: "⬆ 顶部",
      notes_btn_top_title: "返回文档顶部",
      notes_toc_header: "📑 目录索引",
      notes_btn_back_bottom: "⬅ 返回上一视图",
      notes_btn_top_bottom: "⬆ 返回顶部",
      notes_fallback: "无法初始化学习笔记查看器。",
      notes_toc_empty: "目录不可用。",
      notes_lang_notice: "💡 提示：模拟器界面、部件和接线验证已切换为简体中文（普通话）；下方完整长篇技术参考文档暂时保留西班牙语原文以确保术语一致。",

      modal_badge: "技术参数卡",
      modal_default_desc: "电驱动系统部件。",
      modal_terminals_title: "端子与连接：",

      bev_autonomy_tag: "车辆动力学与 SOC",
      bev_autonomy_title: "纯电动汽车续航与能耗虚拟实验室 (BEV)",
      bev_autonomy_desc: "通过调节整备质量、空气动力学、路线坡度与驾驶循环（NEDC、WLTC、CLTC），仿真真实续航里程与电能消耗。",
      bev_autonomy_btn: "打开续航实验室 ➔",
      auto_title: "纯电动汽车续航与能耗虚拟实验室 (BEV)",
      auto_subtitle: "基于车辆动力学物理模型计算不同驾驶循环与坡度下的能耗和续航。",
      auto_btn_reset: "↺ 重置",
      auto_hud_cycle: "循环：",
      auto_hud_slope: "坡度：",
      auto_hud_time: "时间：",
      auto_route_progress: "路线进度：",
      auto_seg_current: "路段：",
      auto_tele_title: "📊 实时遥测数据",
      auto_tele_speed: "车速",
      auto_tele_cons: "瞬时能耗",
      auto_tele_soc: "电池电量 (SOC)",
      auto_tele_energy: "剩余电能",
      auto_tele_est: "预估续航 / 平均能耗",
      auto_tele_forces: "受力分解 (Ft = Fa + Fr + Fp + Fi)",
      auto_veh_title: "🚗 车辆配置与物理参数",
      auto_param_mass: "质量 (kg)",
      auto_param_bat: "电池容量 (kWh)",
      auto_param_af: "迎风面积 Af (m²)",
      auto_param_crr: "滚阻系数 (Crr)",
      auto_cycle_title: "📈 驾驶循环",
      auto_route_title: "🛣 路线编辑器（坡度）",
      auto_btn_add_seg: "+ 添加路段",
      auto_res_badge: "仿真结果",
      auto_res_title: "续航与能耗总结",
      auto_res_dist: "实际行驶里程",
      auto_res_cons: "平均能耗",
      auto_res_est: "预估总续航里程",
      auto_res_reached: "是否到达终点？",

      auth_logout: "退出登录",
      auth_signed_in_as: "已登录：",
      auth_offline: "Google 登录离线不可用",
      auth_file_hint: "Google 登录需要 HTTP/HTTPS",
      auth_err_invalid_credential: "Google 凭据无效或已过期。",
      auth_err_storage: "无法保存本地会话。",
      auth_err_popup: "无法完成 Google 登录。"
    }
  };

  // Traducciones al Inglés (en) y Chino Mandarín Simplificado (zh) para los 5 módulos de SIMULATOR_DATA
  const MODULE_TRANSLATIONS = {
    en: {
      bevWiring: {
        title: "BEV Physical Wiring Simulator",
        subtitle: "Practical wiring of HV, LV components and control harnesses",
        description: "Connect the traction system components (traction battery, DC contactor, DC-DC converter, fuses, motor controller/inverter, and 3-phase motor). Select the proper wire type for each line.",
        cableTypes: {
          hv_pos: { name: "High Voltage Positive (+)", desc: "HV positive power line (Red)" },
          hv_neg: { name: "High Voltage Negative (-)", desc: "HV negative return line (Black)" },
          lv_pos: { name: "Low Voltage Auxiliary (+12V)", desc: "12V auxiliary positive supply (Purple)" },
          lv_neg: { name: "Low Voltage Return (-12V / GND)", desc: "12V negative / ground return (Gray)" },
          mcu_harness: { name: "Controller Signal Harness", desc: "Accelerator pedal, gear selector & dashboard signals (Blue)" }
        },
        devices: {
          DCDCZHQ: {
            name: "DC-DC Converter",
            desc: "Steps down HV traction battery DC power to 12V DC for auxiliary loads and 12V battery charging.",
            terminals: {
              DCDCZHQ_1: { name: "HV Input (+)", label: "In +" },
              DCDCZHQ_4: { name: "HV Input (-)", label: "In -" },
              DCDCZHQ_2: { name: "12V Output (+)", label: "Out +" },
              DCDCZHQ_3: { name: "12V Output (-)", label: "Out -" }
            }
          },
          RDQ1: {
            name: "Fuse 1 (DC-DC)",
            desc: "Overcurrent protection fuse for the DC-DC converter HV input.",
            terminals: { RDQ1_1: { name: "Fuse 1 Out", label: "Out" }, RDQ1_2: { name: "Fuse 1 In", label: "In" } }
          },
          DXLJQ1: {
            name: "Positive Busbar",
            desc: "Distributes HV positive power to the motor controller and DC-DC converter.",
            terminals: { DXLJQ1_1: { name: "Out to DC-DC", label: "Out" }, DXLJQ1_2: { name: "Main Power In (+)", label: "In +" }, DXLJQ1_3: { name: "Out to Controller", label: "Out" } }
          },
          RDQ2: {
            name: "Fuse 2 (Controller)",
            desc: "High-current fuse protecting the inverter/motor controller HV input.",
            terminals: { RDQ2_1: { name: "Fuse 2 In", label: "In" }, RDQ2_2: { name: "Fuse 2 Out", label: "Out" } }
          },
          DY12V: {
            name: "12V Auxiliary Battery",
            desc: "Supplies 12V power to control systems, ECU, relays, and contactor coils.",
            terminals: {
              DY12V_1: { name: "Control Supply (+)", label: "Aux +" },
              DY12V_2: { name: "Positive Terminal (+)", label: "+" },
              DY12V_3: { name: "Negative Terminal (-)", label: "-" },
              DY12V_4: { name: "Contactor Coil Return (-)", label: "GND" }
            }
          },
          DXLJQ2: {
            name: "Negative Busbar",
            desc: "Common junction busbar for the HV negative return circuit.",
            terminals: {
              DXLJQ2_1: { name: "DC-DC Return (-)", label: "DC-DC (-)" },
              DXLJQ2_2: { name: "Battery Negative (-)", label: "Battery (-)" },
              DXLJQ2_3: { name: "Controller Return (-)", label: "MCU (-)" }
            }
          },
          JDQKG: {
            name: "Relay Switch (Ignition)",
            desc: "Closes the 12V control circuit on ignition to energize the HV contactor.",
            terminals: { JDQKG_1: { name: "Relay Control In", label: "In" }, JDQKG_2: { name: "Out to Contactor", label: "Out" } }
          },
          DLDY: {
            name: "Traction Battery (HV)",
            desc: "Stores high-voltage electrical energy (Li-ion pack) to propel the vehicle.",
            terminals: { DLDY_1: { name: "Negative (-)", label: "-" }, DLDY_2: { name: "Positive (+)", label: "+" } }
          },
          JJKG: {
            name: "Emergency Disconnect Switch",
            desc: "Manual service disconnect (MSD) to isolate HV during emergencies or maintenance.",
            terminals: { JJKG_1: { name: "Battery Input (+)", label: "In" }, JJKG_2: { name: "Out to Contactor", label: "Out" } }
          },
          ZLJCQ: {
            name: "DC Contactor",
            desc: "High-voltage electromagnetic power relay that connects or disconnects the traction battery.",
            terminals: {
              ZLJCQ_1: { name: "HV Power In (+)", label: "Pwr In" },
              ZLJCQ_2: { name: "Control Coil (+12V)", label: "Coil +" },
              ZLJCQ_3: { name: "Control Coil (-12V)", label: "Coil -" },
              ZLJCQ_4: { name: "HV Power Out (+)", label: "Pwr Out" }
            }
          },
          RDQ3: {
            name: "Fuse 3 (HV Main)",
            desc: "Main traction high-voltage circuit protection fuse.",
            terminals: { RDQ3_1: { name: "Fuse 3 In", label: "In" }, RDQ3_2: { name: "Fuse 3 Out", label: "Out" } }
          },
          DDJKZQ: {
            name: "Motor Controller (MCU Inverter)",
            desc: "Converts DC to 3-phase AC to control torque, speed, and regenerative braking.",
            terminals: {
              DDJKZQ_1: { name: "Phase W", label: "W" },
              DDJKZQ_2: { name: "DC Link (-)", label: "-" },
              DDJKZQ_3: { name: "Phase V", label: "V" },
              DDJKZQ_4: { name: "DC Link (+)", label: "+" },
              DDJKZQ_5: { name: "Phase U", label: "U" },
              DDJKZQ_6: { name: "Signal Harness Port", label: "Harness" }
            }
          },
          DDJ: {
            name: "Three-Phase Electric Motor",
            desc: "3-phase AC synchronous or induction motor converting electrical energy into mechanical torque.",
            terminals: { DDJ_1: { name: "Phase U", label: "U" }, DDJ_2: { name: "Phase V", label: "V" }, DDJ_3: { name: "Phase W", label: "W" } }
          },
          JSTB: { name: "Accelerator Pedal", desc: "Accelerator Pedal Position (APP) sensor sending torque demand.", terminals: { JSTB: { name: "Pedal Signal Out", label: "Signal" } } },
          DWKG: { name: "Gear Selector Switch", desc: "Drive mode selector (P Park, R Reverse, N Neutral, D Drive).", terminals: { DWKG: { name: "Gear Signal Out", label: "Signal" } } },
          YB: { name: "Instrument Cluster", desc: "Digital dashboard displaying speed, SOC, power, and warnings.", terminals: { YB: { name: "Cluster Signal In", label: "Signal" } } }
        }
      },
      bevPrinciples: {
        title: "BEV Operating Principles System",
        subtitle: "Block diagram: control signals, power flow, and mechanical drive",
        description: "Establish logical connections and energy flow between VCU, inverter, motor, transmission, BMS, and auxiliary systems.",
        cableTypes: {
          sig_right: { name: "Control Signal (Right ->)", desc: "Data / control command flowing right" },
          sig_left: { name: "Control Signal (<- Left)", desc: "Data / control command flowing left" },
          sig_bi: { name: "Control Signal (Bidirectional <->)", desc: "Bidirectional CAN bus communication" },
          pwr_right: { name: "Power Flow (Right =>)", desc: "Electric power flowing right" },
          pwr_left: { name: "Power Flow (<= Left)", desc: "Electric power flowing left" },
          pwr_bi: { name: "Power Flow (Bidirectional <=>)", desc: "Bidirectional power (drive & regeneration)" },
          mech: { name: "Mechanical Link (Double ==)", desc: "Drive shaft or mechanical torque coupling" }
        },
        devices: {
          ZDTB: { name: "Brake Pedal", terminals: { ZDTB: { name: "Signal Out" } } },
          JSTB: { name: "Accelerator Pedal", terminals: { JSTB: { name: "Signal Out" } } },
          DKDY: { name: "Vehicle Control Unit (VCU)", terminals: { DKDY_L1: { name: "Brake In" }, DKDY_L2: { name: "Throttle In" }, DKDY_R: { name: "Inverter Control" }, DKDY_B: { name: "BMS Bus" } } },
          GLZHQ: { name: "Power Converter (Inverter)", terminals: { GLZHQ_L: { name: "VCU Control" }, GLZHQ_R: { name: "3-Phase Power" }, GLZHQ_B: { name: "Battery DC Power" } } },
          SXGYDJ: { name: "3-Phase Induction Motor", terminals: { SXGYDJ_L: { name: "Power In" }, SXGYDJ_R: { name: "Drive Shaft" } } },
          JXCDZZ: { name: "Mechanical Transmission", terminals: { JXCDZZ_L: { name: "Motor In" }, JXCDZZ_T: { name: "Wheel 1 Half-Shaft" }, JXCDZZ_B: { name: "Wheel 2 Half-Shaft" } } },
          CL1: { name: "Front / Left Wheel", terminals: { CL1: { name: "Axle" } } },
          CL2: { name: "Rear / Right Wheel", terminals: { CL2: { name: "Axle" } } },
          NLGLXT: { name: "Energy Management (BMS)", terminals: { NLGLXT_T: { name: "To VCU" }, NLGLXT_R: { name: "To Battery" }, NLGLXT_B: { name: "To Charger" } } },
          XDC: { name: "Traction Battery (HV)", terminals: { XDC_T: { name: "To Inverter" }, XDC_L: { name: "BMS Monitor" }, XDC_R: { name: "To Auxiliary" }, XDC_B: { name: "Charging" } } },
          FZDLY: { name: "Auxiliary Power (DC-DC)", terminals: { FZDLY_L: { name: "HV Supply" }, FZDLY_R: { name: "Steering Supply" }, FZDLY_B: { name: "HVAC Supply" } } },
          DLZXDY: { name: "Electric Power Steering (EPS)", terminals: { DLZXDY_L: { name: "EPS Power" }, DLZXDY_R: { name: "Steering Input" } } },
          ZXP: { name: "Steering Wheel", terminals: { ZXP: { name: "Angle Sensor" } } },
          CDXT: { name: "On-Board Charger (OBC)", terminals: { CDXT_L: { name: "BMS Control" }, CDXT_T: { name: "Out to Battery" }, CDXT_B: { name: "Grid Input" } } },
          WDKZDY: { name: "Thermal / HVAC System", terminals: { WDKZDY: { name: "Power In" } } },
          WJDY: { name: "External Grid (Charge Port)", terminals: { WJDY: { name: "AC / DC Power" } } }
        }
      },
      hybridSeries: {
        title: "Series Hybrid System",
        subtitle: "ICE drives generator only; electric motor exclusively drives wheels",
        description: "In a series hybrid, the combustion engine has no mechanical link to the wheels and only generates electricity for the battery and traction motor.",
        cableTypes: {
          elec: { name: "Electrical Link (Solid)", desc: "Electric power path" },
          mech: { name: "Mechanical Link (Double)", desc: "Mechanical shaft / torque coupling" },
          fuel: { name: "Fuel Line (Red)", desc: "Fuel delivery from tank" }
        },
        devices: {
          YX: { name: "Fuel Tank", terminals: { YX_R: { name: "Fuel Out" } } },
          FDOJ: { name: "Combustion Engine (ICE)", terminals: { FDOJ_L: { name: "Fuel In" }, FDOJ_B: { name: "Shaft to Generator" } } },
          FDIJ: { name: "Generator", terminals: { FDIJ_T: { name: "From ICE Shaft" }, FDIJ_B: { name: "AC Power Out" } } },
          XDC: { name: "Traction Battery", terminals: { XDC_R: { name: "Battery Power" } } },
          GLZHQ: { name: "Converter / Inverter", terminals: { GLZHQ_T: { name: "From Generator" }, GLZHQ_L: { name: "Battery Port" }, GLZHQ_R: { name: "To Motor" } } },
          FDOJ2: { name: "Traction Electric Motor", terminals: { FDOJ2_L: { name: "Power In" }, FDOJ2_R: { name: "Output Shaft" } } },
          CGZZ: { name: "Transmission / Wheels", terminals: { CGZZ_L: { name: "Mechanical In" } } }
        }
      },
      hybridParallel: {
        title: "Parallel Hybrid System",
        subtitle: "Both ICE and electric motor deliver mechanical torque to the wheels",
        description: "Both powertrains are mechanically coupled to the transmission via clutches or gear couplers.",
        cableTypes: {
          elec: { name: "Electrical Link (Solid)", desc: "Electric power path" },
          mech: { name: "Mechanical Link (Double)", desc: "Mechanical shaft / torque coupling" },
          fuel: { name: "Fuel Line (Red)", desc: "Fuel supply" }
        },
        devices: {
          YX: { name: "Fuel Tank", terminals: { YX_R: { name: "Fuel Out" } } },
          FDJ: { name: "Combustion Engine (ICE)", terminals: { FDJ_L: { name: "Fuel In" }, FDJ_R: { name: "Mechanical Out" } } },
          XDC: { name: "Traction Battery", terminals: { XDC_R: { name: "Power Terminal" } } },
          GLZHQ: { name: "Converter / Inverter", terminals: { GLZHQ_L: { name: "To Battery" }, GLZHQ_R: { name: "To Motor" } } },
          DDJ: { name: "Electric Motor", terminals: { DDJ_L: { name: "Power In" }, DDJ_R: { name: "Mechanical Out" } } },
          CDZZ: { name: "Mechanical Coupler & Transmission", terminals: { CDZZ_L1: { name: "ICE In" }, CDZZ_L2: { name: "Motor In" } } }
        }
      },
      hybridCombined: {
        title: "Combined Hybrid System (Series-Parallel)",
        subtitle: "Planetary power-split device: simultaneous direct drive and generation",
        description: "Combines series and parallel advantages via a planetary Power-Split Device (PSD).",
        cableTypes: {
          elec: { name: "Electrical Link (Solid)", desc: "Electric power path" },
          mech: { name: "Mechanical Link (Double)", desc: "Mechanical shaft / torque coupling" },
          fuel: { name: "Fuel Line (Red)", desc: "Fuel supply" }
        },
        devices: {
          YX: { name: "Fuel Tank", terminals: { YX_R: { name: "Fuel Out" } } },
          FDJ: { name: "Combustion Engine (ICE)", terminals: { FDJ_L: { name: "Fuel In" }, FDJ_R: { name: "Shaft to PSD" }, FDJ_B: { name: "Shaft to Generator" } } },
          FDJ1: { name: "Generator (MG1)", terminals: { FDJ1_T: { name: "From ICE Shaft" }, FDJ1_B: { name: "Power to Inverter" } } },
          XDC: { name: "Traction Battery", terminals: { XDC_R: { name: "Battery Power" } } },
          GLZHQ: { name: "Bidirectional Inverter", terminals: { GLZHQ_T: { name: "From Generator" }, GLZHQ_L: { name: "Battery Port" }, GLZHQ_R: { name: "To Motor" } } },
          DDJ: { name: "Traction Motor (MG2)", terminals: { DDJ_L: { name: "Power In" }, DDJ_R: { name: "Shaft to Transmission" } } },
          CDZZ: { name: "Planetary PSD & Transmission", terminals: { CDZZ_L1: { name: "ICE In" }, CDZZ_L2: { name: "Motor In" } } }
        }
      }
    },

    zh: {
      bevWiring: {
        title: "纯电动汽车物理接线模拟器 (BEV)",
        subtitle: "高压、低压部件与控制线束的物理接线实训",
        description: "连接电动汽车电驱动系统部件（动力电池、直流接触器、DC-DC 转换器、熔断器、电机控制器/逆变器与三相电动机）。请为每条线路选择正确的导线类型。",
        cableTypes: {
          hv_pos: { name: "高压供电正极 (+)", desc: "高压动力正极线路（红色）" },
          hv_neg: { name: "高压供电负极 (-)", desc: "高压动力负极回路（黑色）" },
          lv_pos: { name: "低压辅助供电 (+12V)", desc: "12V 低压辅助正极线路（紫色）" },
          lv_neg: { name: "低压回路 (-12V / 接地)", desc: "12V 低压负极/接地回路（灰色）" },
          mcu_harness: { name: "控制器信号线束", desc: "加速踏板、档位开关与仪表盘控制信号（蓝色）" }
        },
        devices: {
          DCDCZHQ: {
            name: "DC-DC 转换器",
            desc: "将高压动力电池直流电降压至 12V 直流电，为车载辅助设备供电并为 12V 蓄电池充电。",
            terminals: {
              DCDCZHQ_1: { name: "高压输入 (+)", label: "输入 +" },
              DCDCZHQ_4: { name: "高压输入 (-)", label: "输入 -" },
              DCDCZHQ_2: { name: "12V 输出 (+)", label: "输出 +" },
              DCDCZHQ_3: { name: "12V 输出 (-)", label: "输出 -" }
            }
          },
          RDQ1: { name: "熔断器 1 (DC-DC)", desc: "DC-DC 转换器高压输入端的过流保护熔断器。", terminals: { RDQ1_1: { name: "熔断器 1 输出", label: "输出" }, RDQ1_2: { name: "熔断器 1 输入", label: "输入" } } },
          DXLJQ1: { name: "正极分电排", desc: "将高压正极电源分配至电机控制器与 DC-DC 转换器。", terminals: { DXLJQ1_1: { name: "输出至 DC-DC", label: "输出" }, DXLJQ1_2: { name: "主电源输入 (+)", label: "输入 +" }, DXLJQ1_3: { name: "输出至控制器", label: "输出" } } },
          RDQ2: { name: "熔断器 2 (控制器)", desc: "保护逆变器/电机控制器高压输入的大电流熔断器。", terminals: { RDQ2_1: { name: "熔断器 2 输入", label: "输入" }, RDQ2_2: { name: "熔断器 2 输出", label: "输出" } } },
          DY12V: {
            name: "12V 辅助蓄电池",
            desc: "为控制系统、车载电脑、继电器及接触器线圈提供 12V 电源。",
            terminals: {
              DY12V_1: { name: "控制供电 (+)", label: "辅助 +" },
              DY12V_2: { name: "正极端子 (+)", label: "+" },
              DY12V_3: { name: "负极端子 (-)", label: "-" },
              DY12V_4: { name: "接触器线圈负极回路 (-)", label: "GND" }
            }
          },
          DXLJQ2: {
            name: "负极分电排",
            desc: "高压负极电源回路的公共汇流排。",
            terminals: { DXLJQ2_1: { name: "DC-DC 负极回路 (-)", label: "DC-DC (-)" }, DXLJQ2_2: { name: "动力电池负极 (-)", label: "动力电池 (-)" }, DXLJQ2_3: { name: "控制器负极回路 (-)", label: "控制器 (-)" } }
          },
          JDQKG: { name: "继电器开关（点火开关）", desc: "接通 12V 控制线路以吸合高压接触器。", terminals: { JDQKG_1: { name: "继电器控制输入", label: "输入" }, JDQKG_2: { name: "输出至接触器", label: "输出" } } },
          DLDY: { name: "动力电池 (HV)", desc: "储存高压电能（锂离子电池组）以驱动车辆行驶。", terminals: { DLDY_1: { name: "负极 (-)", label: "-" }, DLDY_2: { name: "正极 (+)", label: "+" } } },
          JJKG: { name: "紧急断电开关", desc: "发生紧急情况或维修保养时手动切断高压回路（MSD）。", terminals: { JJKG_1: { name: "电池正极输入 (+)", label: "输入" }, JJKG_2: { name: "输出至接触器", label: "输出" } } },
          ZLJCQ: {
            name: "直流接触器 (DC)",
            desc: "高压电磁功率继电器，负责接通或切断主动力电池供电。",
            terminals: { ZLJCQ_1: { name: "高压功率输入 (+)", label: "功率输入" }, ZLJCQ_2: { name: "控制线圈 (+12V)", label: "线圈 +" }, ZLJCQ_3: { name: "控制线圈 (-12V)", label: "线圈 -" }, ZLJCQ_4: { name: "高压功率输出 (+)", label: "功率输出" } }
          },
          RDQ3: { name: "熔断器 3（高压主线）", desc: "主驱动高压回路的总保护熔断器。", terminals: { RDQ3_1: { name: "熔断器 3 输入", label: "输入" }, RDQ3_2: { name: "熔断器 3 输出", label: "输出" } } },
          DDJKZQ: {
            name: "电机控制器（逆变器 MCU）",
            desc: "将直流电转换为三相交流电，控制转矩、转速及能量回收制动。",
            terminals: {
              DDJKZQ_1: { name: "功率相线 W", label: "W" }, DDJKZQ_2: { name: "直流电源 (-)", label: "-" },
              DDJKZQ_3: { name: "功率相线 V", label: "V" }, DDJKZQ_4: { name: "直流电源 (+)", label: "+" },
              DDJKZQ_5: { name: "功率相线 U", label: "U" }, DDJKZQ_6: { name: "信号线束接口", label: "线束" }
            }
          },
          DDJ: { name: "三相电动机", desc: "三相交流同步或感应电动机，将电能转化为机械驱动力。", terminals: { DDJ_1: { name: "U 相端子", label: "U" }, DDJ_2: { name: "V 相端子", label: "V" }, DDJ_3: { name: "W 相端子", label: "W" } } },
          JSTB: { name: "加速踏板", desc: "加速踏板位置传感器（APP），向控制器发送加速转矩指令。", terminals: { JSTB: { name: "踏板信号输出", label: "信号" } } },
          DWKG: { name: "档位开关", desc: "档位选择器（P 驻车、R 倒车、N 空档、D 前进）。", terminals: { DWKG: { name: "档位信号输出", label: "信号" } } },
          YB: { name: "仪表盘", desc: "数字仪表，显示车速、电量（SOC）、功率与系统告警。", terminals: { YB: { name: "仪表信号输入", label: "信号" } } }
        }
      },
      bevPrinciples: {
        title: "纯电动汽车工作原理系统 (BEV)",
        subtitle: "功能框图：控制信号、电力流向与机械传动关系",
        description: "建立整车控制器（VCU）、功率转换器、电动机、传动系统、电池管理系统（BMS）与辅助系统之间的逻辑连接及能量流向。",
        cableTypes: {
          sig_right: { name: "控制信号（向右 ->）", desc: "向右传输的数据/控制指令" },
          sig_left: { name: "控制信号（<- 向左）", desc: "向左传输的数据/控制指令" },
          sig_bi: { name: "控制信号（双向 <->）", desc: "双向 CAN 总线通信" },
          pwr_right: { name: "电力流向（向右 =>）", desc: "向右输出的电能流向" },
          pwr_left: { name: "电力流向（<= 向左）", desc: "向左输出的电能流向" },
          pwr_bi: { name: "电力流向（双向 <=>）", desc: "双向电力流（驱动与再生制动）" },
          mech: { name: "机械连接（双线 ==）", desc: "传动轴或机械转矩耦合" }
        },
        devices: {
          ZDTB: { name: "制动踏板", terminals: { ZDTB: { name: "信号输出" } } },
          JSTB: { name: "加速踏板", terminals: { JSTB: { name: "信号输出" } } },
          DKDY: { name: "整车控制器 (VCU)", terminals: { DKDY_L1: { name: "制动输入" }, DKDY_L2: { name: "加速输入" }, DKDY_R: { name: "控制逆变器" }, DKDY_B: { name: "连接 BMS 总线" } } },
          GLZHQ: { name: "功率转换器（逆变器）", terminals: { GLZHQ_L: { name: "VCU 控制" }, GLZHQ_R: { name: "三相电力" }, GLZHQ_B: { name: "电池直流电力" } } },
          SXGYDJ: { name: "三相感应电动机", terminals: { SXGYDJ_L: { name: "电力输入" }, SXGYDJ_R: { name: "机械传动轴" } } },
          JXCDZZ: { name: "机械传动装置", terminals: { JXCDZZ_L: { name: "电动机输入" }, JXCDZZ_T: { name: "车轮 1 半轴" }, JXCDZZ_B: { name: "车轮 2 半轴" } } },
          CL1: { name: "前/左车轮", terminals: { CL1: { name: "车轴" } } },
          CL2: { name: "后/右车轮", terminals: { CL2: { name: "车轴" } } },
          NLGLXT: { name: "能量管理系统 (BMS)", terminals: { NLGLXT_T: { name: "连接 VCU" }, NLGLXT_R: { name: "连接电池" }, NLGLXT_B: { name: "连接充电机" } } },
          XDC: { name: "动力电池 (HV)", terminals: { XDC_T: { name: "供电至逆变器" }, XDC_L: { name: "BMS 监控" }, XDC_R: { name: "供电至辅助系统" }, XDC_B: { name: "电池充电" } } },
          FZDLY: { name: "辅助电源 (DC-DC)", terminals: { FZDLY_L: { name: "高压供电" }, FZDLY_R: { name: "转向供电" }, FZDLY_B: { name: "空调温控供电" } } },
          DLZXDY: { name: "电动助力转向 (EPS)", terminals: { DLZXDY_L: { name: "EPS 供电" }, DLZXDY_R: { name: "方向盘输入" } } },
          ZXP: { name: "方向盘", terminals: { ZXP: { name: "转角传感器" } } },
          CDXT: { name: "车载充电机 (OBC)", terminals: { CDXT_L: { name: "BMS 控制" }, CDXT_T: { name: "输出至电池" }, CDXT_B: { name: "外部电网输入" } } },
          WDKZDY: { name: "热管理/空调系统", terminals: { WDKZDY: { name: "电源输入" } } },
          WJDY: { name: "外部电网（充电口）", terminals: { WJDY: { name: "交流/直流电" } } }
        }
      },
      hybridSeries: {
        title: "串联式混动系统",
        subtitle: "内燃机仅驱动发电机发电；完全由电动机驱动车轮",
        description: "在串联式架构中，内燃机与车轮之间没有机械连接，仅负责发电以供给动力电池和驱动电动机。",
        cableTypes: { elec: { name: "电力连接（实线）", desc: "电能传输路径" }, mech: { name: "机械连接（双线）", desc: "机械转动/转矩耦合" }, fuel: { name: "燃油管路（红色）", desc: "由油箱输送汽油/柴油" } },
        devices: {
          YX: { name: "油箱", terminals: { YX_R: { name: "燃油输出" } } },
          FDOJ: { name: "内燃机", terminals: { FDOJ_L: { name: "燃油输入" }, FDOJ_B: { name: "传动轴至发电机" } } },
          FDIJ: { name: "发电机", terminals: { FDIJ_T: { name: "来自内燃机传动轴" }, FDIJ_B: { name: "交流电力输出" } } },
          XDC: { name: "动力电池", terminals: { XDC_R: { name: "电池电力" } } },
          GLZHQ: { name: "转换器/逆变器", terminals: { GLZHQ_T: { name: "来自发电机输入" }, GLZHQ_L: { name: "电池接口" }, GLZHQ_R: { name: "输出至电动机" } } },
          FDOJ2: { name: "驱动电动机", terminals: { FDOJ2_L: { name: "电力输入" }, FDOJ2_R: { name: "动力输出轴" } } },
          CGZZ: { name: "传动系统/车轮", terminals: { CGZZ_L: { name: "机械输入" } } }
        }
      },
      hybridParallel: {
        title: "并联式混动系统",
        subtitle: "内燃机与电动机均可直接向车轮输出机械转矩",
        description: "两套动力装置均通过离合器或齿轮耦合器与传动系统实现机械连接。",
        cableTypes: { elec: { name: "电力连接（实线）", desc: "电能传输路径" }, mech: { name: "机械连接（双线）", desc: "机械转动/转矩耦合" }, fuel: { name: "燃油管路（红色）", desc: "燃油供应" } },
        devices: {
          YX: { name: "油箱", terminals: { YX_R: { name: "燃油输出" } } },
          FDJ: { name: "内燃机", terminals: { FDJ_L: { name: "燃油输入" }, FDJ_R: { name: "机械输出轴" } } },
          XDC: { name: "动力电池", terminals: { XDC_R: { name: "电力端子" } } },
          GLZHQ: { name: "转换器/逆变器", terminals: { GLZHQ_L: { name: "连接电池" }, GLZHQ_R: { name: "连接电动机" } } },
          DDJ: { name: "电动机", terminals: { DDJ_L: { name: "电力输入" }, DDJ_R: { name: "机械输出轴" } } },
          CDZZ: { name: "机械耦合器及传动系统", terminals: { CDZZ_L1: { name: "内燃机输入" }, CDZZ_L2: { name: "电动机输入" } } }
        }
      },
      hybridCombined: {
        title: "混联式混动系统（串并联）",
        subtitle: "行星齿轮功率分流装置：同时支持直接机械驱动与发电",
        description: "结合串联与并联优势，通过行星齿轮功率分流装置（PSD）灵活分配动力。",
        cableTypes: { elec: { name: "电力连接（实线）", desc: "电能传输路径" }, mech: { name: "机械连接（双线）", desc: "机械转动/转矩耦合" }, fuel: { name: "燃油管路（红色）", desc: "燃油供应" } },
        devices: {
          YX: { name: "油箱", terminals: { YX_R: { name: "燃油输出" } } },
          FDJ: { name: "内燃机", terminals: { FDJ_L: { name: "燃油输入" }, FDJ_R: { name: "传动轴至分流器" }, FDJ_B: { name: "传动轴至发电机" } } },
          FDJ1: { name: "发电机 (MG1)", terminals: { FDJ1_T: { name: "来自内燃机传动轴" }, FDJ1_B: { name: "电力输出至逆变器" } } },
          XDC: { name: "动力电池", terminals: { XDC_R: { name: "电池电力" } } },
          GLZHQ: { name: "双向转换器/逆变器", terminals: { GLZHQ_T: { name: "来自发电机输入" }, GLZHQ_L: { name: "电池接口" }, GLZHQ_R: { name: "输出至电动机" } } },
          DDJ: { name: "驱动电动机 (MG2)", terminals: { DDJ_L: { name: "电力输入" }, DDJ_R: { name: "传动轴至传动系统" } } },
          CDZZ: { name: "行星齿轮分流器及传动系统", terminals: { CDZZ_L1: { name: "内燃机输入" }, CDZZ_L2: { name: "电动机输入" } } }
        }
      }
    }
  };

  let currentLang = "es";
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "yue") {
      saved = "zh";
      localStorage.setItem(STORAGE_KEY, "zh");
    }
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      currentLang = saved;
    }
  } catch (_) {}

  function formatStr(template, args) {
    if (!template || !args || args.length === 0) return template;
    return template.replace(/\{(\d+)\}/g, (match, idx) => {
      const i = Number(idx);
      return args[i] !== undefined ? args[i] : match;
    });
  }

  function t(key, ...args) {
    const dict = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS.es;
    const raw = dict[key] !== undefined ? dict[key] : (UI_TRANSLATIONS.es[key] || key);
    return formatStr(raw, args);
  }

  function getModuleText(moduleKey, fallbackCfg) {
    const fb = fallbackCfg || (window.SIMULATOR_DATA && window.SIMULATOR_DATA[moduleKey]) || {};
    const m = MODULE_TRANSLATIONS[currentLang]?.[moduleKey];
    if (m) {
      return {
        title: m.title || fb.title || "",
        subtitle: m.subtitle || fb.subtitle || "",
        description: m.description || fb.description || ""
      };
    }
    return { title: fb.title || "", subtitle: fb.subtitle || "", description: fb.description || "" };
  }

  function getCableText(moduleKey, cableId, fallbackCable) {
    const fb = fallbackCable || {};
    const c = MODULE_TRANSLATIONS[currentLang]?.[moduleKey]?.cableTypes?.[cableId];
    if (c) {
      return { name: c.name || fb.name || "", desc: c.desc || fb.desc || "" };
    }
    return { name: fb.name || "", desc: fb.desc || "" };
  }

  function getDeviceText(moduleKey, deviceId, fallbackDevice) {
    const fb = fallbackDevice || {};
    const d = MODULE_TRANSLATIONS[currentLang]?.[moduleKey]?.devices?.[deviceId];
    if (d) {
      return { name: d.name || fb.name || "", desc: d.desc || fb.desc || "" };
    }
    return { name: fb.name || "", desc: fb.desc || "" };
  }

  function getTerminalText(moduleKey, deviceId, termId, fallbackTerm) {
    const fb = fallbackTerm || {};
    const tr = MODULE_TRANSLATIONS[currentLang]?.[moduleKey]?.devices?.[deviceId]?.terminals?.[termId];
    if (tr) {
      return {
        name: tr.name || fb.name || "",
        label: tr.label !== undefined ? tr.label : fb.label
      };
    }
    return { name: fb.name || "", label: fb.label };
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : (currentLang === "en" ? "en" : "es");
    document.title = t("page_title");

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(key);
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      el.setAttribute("title", t(key));
    });

    document.querySelectorAll(".lang-btn").forEach(btn => {
      const lang = btn.getAttribute("data-lang");
      btn.classList.toggle("active", lang === currentLang);
    });

    const noticeEl = document.getElementById("notes_lang_notice");
    if (noticeEl) {
      const msg = t("notes_lang_notice");
      noticeEl.textContent = msg;
      noticeEl.style.display = msg ? "block" : "none";
    }
  }

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
    applyTranslations();
    window.dispatchEvent(new CustomEvent("sim:langchange", { detail: { lang } }));
  }

  window.I18N = {
    get currentLang() { return currentLang; },
    getLang: () => currentLang,
    setLang,
    t,
    applyTranslations,
    getModuleText,
    getCableText,
    getDeviceText,
    getTerminalText
  };
})();
