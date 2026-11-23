/**
 * Paquete de idiomas (Español / 廣東話 - Chino Cantonés)
 * Simulador de Conexiones de Vehículos Eléctricos e Híbridos
 */
(function () {
  const STORAGE_KEY = "simulador_lang";
  const SUPPORTED_LANGS = ["es", "yue"];

  const UI_TRANSLATIONS = {
    es: {
      page_title: "Simulador de Conexiones de Vehículos Eléctricos e Híbridos",
      brand_title: "Simulador EV & HEV",
      brand_subtitle: "Electromovilidad & Conexiones",
      nav_home: "Inicio",
      nav_bev: "Vehículos Eléctricos (BEV)",
      nav_hev: "Vehículos Híbridos (HEV)",
      nav_notes: "📘 Anotaciones",
      nav_back: "⬅ Volver",
      lang_label: "Idioma",

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
      modal_terminals_title: "Terminales y Conexiones:"
    },

    yue: {
      page_title: "電動車及混能車接線模擬器",
      brand_title: "EV & HEV 模擬器",
      brand_subtitle: "電動出行及電路接線",
      nav_home: "主頁",
      nav_bev: "純電動車 (BEV)",
      nav_hev: "混合動力車 (HEV)",
      nav_notes: "📘 學習筆記",
      nav_back: "⬅ 返回",
      lang_label: "語言",

      home_badge: "模擬及實習平台",
      home_title: "電動驅動系統學習與接線實習平台",
      home_desc: "互動式教學環境，俾你學習同實習純電動車（BEV）同混合動力車（HEV）嘅高壓部件接線、輔助系統、控制線束同埋運作原理。",
      card_bev_tag: "100% 純電動 (BEV)",
      card_bev_title: "純電動車",
      card_bev_desc: "實習高壓驅動部件接線（動力電池、逆變器、三相電動機、直流接觸器、DC-DC 轉換器）同埋系統運作原理圖。",
      card_bev_btn: "進入 BEV 模組 ➔",
      card_hev_tag: "混合動力 (HEV)",
      card_hev_title: "混合動力電動車",
      card_hev_desc: "互動學習三大混能驅動架構：串聯式（Series）、並聯式（Parallel）同埋混聯式（串並聯行星齒輪分流系統）。",
      card_hev_btn: "進入 HEV 模組 ➔",
      card_notes_tag: "技術文檔及維護",
      card_notes_title: "學習筆記",
      card_notes_desc: "模擬器完整技術指南：BEV 架構、高低壓隔離、逆變器、電池、接觸器，以及串聯、並聯同混聯混能系統。",
      card_notes_btn: "查閱學習筆記 ➔",

      bev_badge: "BEV 模組",
      bev_title: "純電動車驅動系統",
      bev_desc: "揀選學習模式：實體部件接線模擬，或者分析邏輯控制原理同能量流向。",
      bev_wiring_tag: "實戰模擬",
      bev_wiring_title: "實體接線模擬器",
      bev_wiring_desc: "連接 DC-DC 轉換器、繼電器、直流接觸器、高壓熔斷器、電機控制器、動力電池同三相電動機嘅各個端子。",
      bev_wiring_btn: "開始接線實習 ➔",
      bev_principles_tag: "運作原理",
      bev_principles_title: "能量流向及原理圖",
      bev_principles_desc: "建立整車控制（VCU、BMS）訊號關係、雙向電力流向，以及去到傳動系統同車輪嘅機械連接。",
      bev_principles_btn: "開始原理圖練習 ➔",
      btn_back_home: "⬅ 返回主選單",

      hev_badge: "HEV 模組",
      hev_title: "混合動力電動車驅動系統",
      hev_desc: "分析並完成三種主要汽車混能驅動架構入面嘅電力、機械同燃油連接。",
      hev_series_tag: "架構 1",
      hev_series_title: "串聯式混能",
      hev_series_desc: "內燃機只係帶動發電機幫電池充電或者供電俾驅動電動機，由電動機單獨驅動車輪。",
      hev_series_btn: "開啟串聯式混能 ➔",
      hev_parallel_tag: "架構 2",
      hev_parallel_title: "並聯式混能",
      hev_parallel_desc: "內燃機同電動機都透過傳動系統機械耦合去到車輪，可以一齊或者分別輸出動力。",
      hev_parallel_btn: "開啟並聯式混能 ➔",
      hev_combined_tag: "架構 3",
      hev_combined_title: "混聯式混能",
      hev_combined_desc: "串並聯系統配合行星齒輪動力分流裝置（PSD），可以同時進行機械驅動同發電。",
      hev_combined_btn: "開啟混聯式混能 ➔",

      sim_btn_run: "▶ 執行 / 測試",
      sim_btn_run_title: "檢查電路係咪全部接駁正確",
      sim_btn_undo: "↩ 復原",
      sim_btn_undo_title: "復原上一步接線 (Ctrl+Z)",
      sim_btn_delete: "🗑 刪除模式",
      sim_btn_delete_title: "開啟刪除模式，撳電線或者端子就可以移除接線",
      sim_btn_clear: "🧹 全部清除",
      sim_btn_clear_title: "清除畫布上面所有接線",
      sim_btn_solution: "👁 睇標準答案",
      sim_btn_solution_title: "顯示／隱藏官方標準接線圖",
      sim_sidebar_cables: "⚡ 電線 / 連接類型",
      sim_sidebar_desc: "📋 技術說明",
      sim_sidebar_help: "💡 快速操作指引",
      sim_help_1: "喺上面清單揀選要嘅電線類型。",
      sim_help_2: "撳第一個端子（會變黃色高亮）。",
      sim_help_3: "再撳目標端子就可以拉線連接。",
      sim_help_4: "撳 <strong>「執行 / 測試」</strong> 檢查成個系統啱唔啱。",
      sim_help_5: "撳任何部件可以睇佢嘅技術資料卡。",
      sim_status_initial: "系統就緒，請揀選兩個端子進行連接。",
      sim_status_ready_module: "請先揀選電線類型，再撳兩個端子將佢哋連埋一齊。",
      sim_status_cancel_esc: "已取消端子選擇。",
      sim_status_undo: "已復原上一步操作。",
      sim_status_cleared: "已清除畫布所有接線。",
      sim_status_solution_on: "而家顯示緊官方標準接線圖。",
      sim_status_solution_off: "已返去接線編輯模式。",
      sim_status_no_cables_err: "系統入面仲未有任何接線。",
      sim_status_no_cables_msg: "測試失敗：仲未接駁任何電線。",
      sim_err_wrong_conn: "{0} 同 {1} 之間嘅接線唔啱。",
      sim_err_wrong_type: "{0} 同 {1} 之間嘅電線類型或者顏色唔啱。",
      sim_err_missing: "電路仲爭 {0} 條接線未完成。",
      sim_status_success: "成功！所有系統接線 100% 正確，車輛可以正常運作。",
      sim_status_success_detail: "✔ 電路驗證通過！所有模組同線束導通正常。",
      sim_status_fail: "測試未通過（啱咗 {0}/{1} 條）。請檢查標示咗嘅線路。",
      sim_status_removed_pin: "已移除 {0} 嘅相關接線。",
      sim_status_start_pin: "已揀選起點：{0}。而家請揀選目標端子。",
      sim_status_cancel_pin: "已取消選擇。",
      sim_status_exists: "呢兩個端子之間已經有線連住咗。",
      sim_status_connected: "已接駁：{0} -> {1}。",
      sim_status_line_removed: "已刪除該條電線。",

      notes_badge: "標準技術參考",
      notes_title: "學習及維護技術筆記",
      notes_subtitle: "純電動車（BEV）及混能車（HEV）模擬器嘅電氣架構同運作邏輯。",
      notes_btn_back: "⬅ 返回",
      notes_btn_back_title: "返回上一個畫面",
      notes_btn_top: "⬆ 返頂",
      notes_btn_top_title: "返去文檔最頂",
      notes_toc_header: "📑 目錄索引",
      notes_btn_back_bottom: "⬅ 返回上一個畫面",
      notes_btn_top_bottom: "⬆ 返回頂部",
      notes_fallback: "無法初始化學習筆記檢視器。",
      notes_toc_empty: "暫時冇目錄。",
      notes_lang_notice: "💡 提示：模擬器介面、部件同接線驗證已經切換為廣東話；以下完整長篇技術參考文檔暫時保留西班牙文原文以確保技術術語一致。",

      modal_badge: "技術資料卡",
      modal_default_desc: "電動車系統部件。",
      modal_terminals_title: "端子及接線定義："
    }
  };

  // Traducciones al Chino Cantonés (廣東話) para los 5 módulos de SIMULATOR_DATA
  const MODULE_TRANSLATIONS_YUE = {
    bevWiring: {
      title: "純電動車實體接線模擬器 (BEV)",
      subtitle: "高壓、低壓部件同埋控制線束嘅實體接線實習",
      description: "接駁電動車驅動系統部件（動力電池、直流接觸器、DC-DC 轉換器、熔斷器、電機控制器／逆變器同三相電動機）。請為每條線路揀選正確嘅電線類型。",
      cableTypes: {
        hv_pos: { name: "高壓供電正極 (+)", desc: "高壓動力正極線路（紅色）" },
        hv_neg: { name: "高壓供電負極 (-)", desc: "高壓動力負極線路（黑色）" },
        lv_pos: { name: "低壓輔助供電 (+12V)", desc: "12V 低壓輔助正極線路（紫色）" },
        lv_neg: { name: "低壓迴路 (-12V / 接地)", desc: "12V 低壓負極／接地迴路（灰色）" },
        mcu_harness: { name: "控制器訊號線束", desc: "油門踏板、波棍同儀錶板控制訊號（藍色）" }
      },
      devices: {
        DCDCZHQ: {
          name: "DC-DC 轉換器",
          desc: "將高壓動力電池直流電降壓到 12V 直流電，供電俾車內輔助設備同幫 12V 電池充電。",
          terminals: {
            DCDCZHQ_1: { name: "高壓輸入 (+)", label: "輸入 +" },
            DCDCZHQ_4: { name: "高壓輸入 (-)", label: "輸入 -" },
            DCDCZHQ_2: { name: "12V 輸出 (+)", label: "輸出 +" },
            DCDCZHQ_3: { name: "12V 輸出 (-)", label: "輸出 -" }
          }
        },
        RDQ1: {
          name: "熔斷器 1 (DC-DC)",
          desc: "DC-DC 轉換器高壓輸入端嘅過流保護熔斷器。",
          terminals: {
            RDQ1_1: { name: "熔斷器 1 輸出", label: "輸出" },
            RDQ1_2: { name: "熔斷器 1 輸入", label: "輸入" }
          }
        },
        DXLJQ1: {
          name: "正極分電排",
          desc: "將高壓正極電源分流去電機控制器同 DC-DC 轉換器。",
          terminals: {
            DXLJQ1_1: { name: "輸出至 DC-DC", label: "輸出" },
            DXLJQ1_2: { name: "主電源輸入 (+)", label: "輸入 +" },
            DXLJQ1_3: { name: "輸出至控制器", label: "輸出" }
          }
        },
        RDQ2: {
          name: "熔斷器 2 (控制器)",
          desc: "保護逆變器／電機控制器高壓輸入嘅大電流熔斷器。",
          terminals: {
            RDQ2_1: { name: "熔斷器 2 輸入", label: "輸入" },
            RDQ2_2: { name: "熔斷器 2 輸出", label: "輸出" }
          }
        },
        DY12V: {
          name: "12V 輔助電池",
          desc: "為控制系統、車載電腦、繼電器同接觸器線圈提供 12V 電源。",
          terminals: {
            DY12V_1: { name: "控制供電 (+)", label: "輔助 +" },
            DY12V_2: { name: "正極端子 (+)", label: "+" },
            DY12V_3: { name: "負極端子 (-)", label: "-" },
            DY12V_4: { name: "接觸器線圈負極迴路 (-)", label: "GND" }
          }
        },
        DXLJQ2: {
          name: "負極分電排",
          desc: "高壓負極電源迴路嘅公共匯流接點。",
          terminals: {
            DXLJQ2_1: { name: "DC-DC 負極迴路 (-)", label: "DC-DC (-)" },
            DXLJQ2_2: { name: "動力電池負極 (-)", label: "動力電池 (-)" },
            DXLJQ2_3: { name: "控制器負極迴路 (-)", label: "控制器 (-)" }
          }
        },
        JDQKG: {
          name: "繼電器開關（匙膽）",
          desc: "著車時接通 12V 控制線路，啟動高壓接觸器。",
          terminals: {
            JDQKG_1: { name: "繼電器控制輸入", label: "輸入" },
            JDQKG_2: { name: "輸出至接觸器", label: "輸出" }
          }
        },
        DLDY: {
          name: "動力電池 (HV)",
          desc: "儲存高壓電能（鋰離子電池組）以驅動車輛行駛。",
          terminals: {
            DLDY_1: { name: "負極 (-)", label: "-" },
            DLDY_2: { name: "正極 (+)", label: "+" }
          }
        },
        JJKG: {
          name: "緊急斷電開關",
          desc: "發生緊急情況或者維修保養時手動切斷高壓迴路（MSD）。",
          terminals: {
            JJKG_1: { name: "電池正極輸入 (+)", label: "輸入" },
            JJKG_2: { name: "輸出至接觸器", label: "輸出" }
          }
        },
        ZLJCQ: {
          name: "直流接觸器 (DC)",
          desc: "高壓電磁功率繼電器，負責接通或切斷主動力電池供電。",
          terminals: {
            ZLJCQ_1: { name: "高壓功率輸入 (+)", label: "功率輸入" },
            ZLJCQ_2: { name: "控制線圈 (+12V)", label: "線圈 +" },
            ZLJCQ_3: { name: "控制線圈 (-12V)", label: "線圈 -" },
            ZLJCQ_4: { name: "高壓功率輸出 (+)", label: "功率輸出" }
          }
        },
        RDQ3: {
          name: "熔斷器 3（高壓主線）",
          desc: "主驅動高壓迴路嘅總保護熔斷器。",
          terminals: {
            RDQ3_1: { name: "熔斷器 3 輸入", label: "輸入" },
            RDQ3_2: { name: "熔斷器 3 輸出", label: "輸出" }
          }
        },
        DDJKZQ: {
          name: "電機控制器（逆變器 MCU）",
          desc: "將直流電轉換成三相交流電，控制扭力、轉速同動能回收煞車。",
          terminals: {
            DDJKZQ_1: { name: "功率相線 W", label: "W" },
            DDJKZQ_2: { name: "直流電源 (-)", label: "-" },
            DDJKZQ_3: { name: "功率相線 V", label: "V" },
            DDJKZQ_4: { name: "直流電源 (+)", label: "+" },
            DDJKZQ_5: { name: "功率相線 U", label: "U" },
            DDJKZQ_6: { name: "訊號線束接口", label: "線束" }
          }
        },
        DDJ: {
          name: "三相電動機",
          desc: "三相交流同步或感應電動機，將電能轉化為機械驅動力。",
          terminals: {
            DDJ_1: { name: "U 相端子", label: "U" },
            DDJ_2: { name: "V 相端子", label: "V" },
            DDJ_3: { name: "W 相端子", label: "W" }
          }
        },
        JSTB: {
          name: "油門踏板",
          desc: "加速踏板位置感應器（APP），向控制器發送加速扭力指令。",
          terminals: {
            JSTB: { name: "油門訊號輸出", label: "訊號" }
          }
        },
        DWKG: {
          name: "波棍／檔位開關",
          desc: "波檔選擇器（P 停車、R 後波、N 空波、D 前進）。",
          terminals: {
            DWKG: { name: "檔位訊號輸出", label: "訊號" }
          }
        },
        YB: {
          name: "儀錶板",
          desc: "數碼儀錶，顯示車速、電量（SOC）、功率同系統警示。",
          terminals: {
            YB: { name: "儀錶訊號輸入", label: "訊號" }
          }
        }
      }
    },

    bevPrinciples: {
      title: "純電動車運作原理系統 (BEV)",
      subtitle: "功能方塊圖：控制訊號、電力流向同機械傳動關係",
      description: "建立整車控制器（VCU）、功率轉換器、電動機、傳動系統、電池管理系統（BMS）同輔助系統之間嘅邏輯連接同能量流向。",
      cableTypes: {
        sig_right: { name: "控制訊號（向右 ->）", desc: "向右傳輸嘅數據／控制指令" },
        sig_left: { name: "控制訊號（<- 向左）", desc: "向左傳輸嘅數據／控制指令" },
        sig_bi: { name: "控制訊號（雙向 <->）", desc: "雙向 CAN 總線通訊" },
        pwr_right: { name: "電力流向（向右 =>）", desc: "向右輸出嘅電能流向" },
        pwr_left: { name: "電力流向（<= 向左）", desc: "向左輸出嘅電能流向" },
        pwr_bi: { name: "電力流向（雙向 <=>）", desc: "雙向電力流（驅動及動能回收）" },
        mech: { name: "機械連接（雙線 ==）", desc: "傳動軸或機械扭力耦合" }
      },
      devices: {
        ZDTB: { name: "煞車踏板", terminals: { ZDTB: { name: "訊號輸出" } } },
        JSTB: { name: "油門踏板", terminals: { JSTB: { name: "訊號輸出" } } },
        DKDY: {
          name: "整車控制器 (VCU)",
          terminals: {
            DKDY_L1: { name: "煞車輸入" },
            DKDY_L2: { name: "油門輸入" },
            DKDY_R: { name: "控制逆變器" },
            DKDY_B: { name: "連接 BMS 總線" }
          }
        },
        GLZHQ: {
          name: "功率轉換器（逆變器）",
          terminals: {
            GLZHQ_L: { name: "VCU 控制" },
            GLZHQ_R: { name: "三相電力" },
            GLZHQ_B: { name: "電池直流電力" }
          }
        },
        SXGYDJ: {
          name: "三相感應電動機",
          terminals: {
            SXGYDJ_L: { name: "電力輸入" },
            SXGYDJ_R: { name: "機械傳動軸" }
          }
        },
        JXCDZZ: {
          name: "機械傳動裝置",
          terminals: {
            JXCDZZ_L: { name: "電動機輸入" },
            JXCDZZ_T: { name: "車輪 1 半軸" },
            JXCDZZ_B: { name: "車輪 2 半軸" }
          }
        },
        CL1: { name: "前／左車輪", terminals: { CL1: { name: "車軸" } } },
        CL2: { name: "後／右車輪", terminals: { CL2: { name: "車軸" } } },
        NLGLXT: {
          name: "能量管理系統 (BMS)",
          terminals: {
            NLGLXT_T: { name: "連接 VCU" },
            NLGLXT_R: { name: "連接電池" },
            NLGLXT_B: { name: "連接充電器" }
          }
        },
        XDC: {
          name: "動力電池 (HV)",
          terminals: {
            XDC_T: { name: "供電至逆變器" },
            XDC_L: { name: "BMS 監控" },
            XDC_R: { name: "供電至輔助系統" },
            XDC_B: { name: "電池充電" }
          }
        },
        FZDLY: {
          name: "輔助電源 (DC-DC)",
          terminals: {
            FZDLY_L: { name: "高壓供電" },
            FZDLY_R: { name: "轉向供電" },
            FZDLY_B: { name: "冷氣溫控供電" }
          }
        },
        DLZXDY: {
          name: "電動輔助轉向 (EPS)",
          terminals: {
            DLZXDY_L: { name: "EPS 供電" },
            DLZXDY_R: { name: "軚盤輸入" }
          }
        },
        ZXP: { name: "軚盤", terminals: { ZXP: { name: "轉角感應器" } } },
        CDXT: {
          name: "車載充電機 (OBC)",
          terminals: {
            CDXT_L: { name: "BMS 控制" },
            CDXT_T: { name: "輸出至電池" },
            CDXT_B: { name: "外部電網輸入" }
          }
        },
        WDKZDY: { name: "熱管理／冷氣系統", terminals: { WDKZDY: { name: "電源輸入" } } },
        WJDY: { name: "外部電網（充電口）", terminals: { WJDY: { name: "交流／直流電" } } }
      }
    },

    hybridSeries: {
      title: "串聯式混能系統",
      subtitle: "內燃機只係帶動發電機發電；純粹由電動機驅動車輪",
      description: "喺串聯式架構入面，內燃機同車輪之間冇機械連接，佢只負責發電俾動力電池同驅動電動機。",
      cableTypes: {
        elec: { name: "電力連接（實線）", desc: "電能傳輸路徑" },
        mech: { name: "機械連接（雙線）", desc: "機械轉動／扭力耦合" },
        fuel: { name: "燃油管路（紅色）", desc: "由油缸輸送電油／柴油" }
      },
      devices: {
        YX: { name: "油缸", terminals: { YX_R: { name: "燃油輸出" } } },
        FDOJ: {
          name: "內燃機",
          terminals: {
            FDOJ_L: { name: "燃油輸入" },
            FDOJ_B: { name: "傳動軸至發電機" }
          }
        },
        FDIJ: {
          name: "發電機",
          terminals: {
            FDIJ_T: { name: "來自內燃機傳動軸" },
            FDIJ_B: { name: "交流電力輸出" }
          }
        },
        XDC: { name: "動力電池", terminals: { XDC_R: { name: "電池電力" } } },
        GLZHQ: {
          name: "轉換器／逆變器",
          terminals: {
            GLZHQ_T: { name: "來自發電機輸入" },
            GLZHQ_L: { name: "電池接口" },
            GLZHQ_R: { name: "輸出至電動機" }
          }
        },
        FDOJ2: {
          name: "驅動電動機",
          terminals: {
            FDOJ2_L: { name: "電力輸入" },
            FDOJ2_R: { name: "動力輸出軸" }
          }
        },
        CGZZ: { name: "傳動系統／車輪", terminals: { CGZZ_L: { name: "機械輸入" } } }
      }
    },

    hybridParallel: {
      title: "並聯式混能系統",
      subtitle: "內燃機同電動機都可以直接向車輪輸出機械扭力",
      description: "兩副動力裝置都透過離合器或者齒輪耦合器機械連接去傳動系統。",
      cableTypes: {
        elec: { name: "電力連接（實線）", desc: "電能傳輸路徑" },
        mech: { name: "機械連接（雙線）", desc: "機械轉動／扭力耦合" },
        fuel: { name: "燃油管路（紅色）", desc: "燃油供應" }
      },
      devices: {
        YX: { name: "油缸", terminals: { YX_R: { name: "燃油輸出" } } },
        FDJ: {
          name: "內燃機",
          terminals: {
            FDJ_L: { name: "燃油輸入" },
            FDJ_R: { name: "機械輸出軸" }
          }
        },
        XDC: { name: "動力電池", terminals: { XDC_R: { name: "電力端子" } } },
        GLZHQ: {
          name: "轉換器／逆變器",
          terminals: {
            GLZHQ_L: { name: "連接電池" },
            GLZHQ_R: { name: "連接電動機" }
          }
        },
        DDJ: {
          name: "電動機",
          terminals: {
            DDJ_L: { name: "電力輸入" },
            DDJ_R: { name: "機械輸出軸" }
          }
        },
        CDZZ: {
          name: "機械耦合器及傳動系統",
          terminals: {
            CDZZ_L1: { name: "內燃機輸入" },
            CDZZ_L2: { name: "電動機輸入" }
          }
        }
      }
    },

    hybridCombined: {
      title: "混聯式混能系統（串並聯）",
      subtitle: "行星齒輪動力分流裝置：同時支援直接機械驅動同發電",
      description: "結合串聯同並聯嘅優點，透過行星齒輪動力分流裝置（PSD，例如 Toyota Hybrid Synergy Drive）靈活分配動力。",
      cableTypes: {
        elec: { name: "電力連接（實線）", desc: "電能傳輸路徑" },
        mech: { name: "機械連接（雙線）", desc: "機械轉動／扭力耦合" },
        fuel: { name: "燃油管路（紅色）", desc: "燃油供應" }
      },
      devices: {
        YX: { name: "油缸", terminals: { YX_R: { name: "燃油輸出" } } },
        FDJ: {
          name: "內燃機",
          terminals: {
            FDJ_L: { name: "燃油輸入" },
            FDJ_R: { name: "傳動軸至分流器" },
            FDJ_B: { name: "傳動軸至發電機" }
          }
        },
        FDJ1: {
          name: "發電機 (MG1)",
          terminals: {
            FDJ1_T: { name: "來自內燃機傳動軸" },
            FDJ1_B: { name: "電力輸出至逆變器" }
          }
        },
        XDC: { name: "動力電池", terminals: { XDC_R: { name: "電池電力" } } },
        GLZHQ: {
          name: "雙向轉換器／逆變器",
          terminals: {
            GLZHQ_T: { name: "來自發電機輸入" },
            GLZHQ_L: { name: "電池接口" },
            GLZHQ_R: { name: "輸出至電動機" }
          }
        },
        DDJ: {
          name: "驅動電動機 (MG2)",
          terminals: {
            DDJ_L: { name: "電力輸入" },
            DDJ_R: { name: "傳動軸至傳動系統" }
          }
        },
        CDZZ: {
          name: "行星齒輪分流器及傳動系統",
          terminals: {
            CDZZ_L1: { name: "內燃機輸入" },
            CDZZ_L2: { name: "電動機輸入" }
          }
        }
      }
    }
  };

  let currentLang = "es";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
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
    if (currentLang === "yue" && MODULE_TRANSLATIONS_YUE[moduleKey]) {
      const m = MODULE_TRANSLATIONS_YUE[moduleKey];
      return {
        title: m.title || fb.title || "",
        subtitle: m.subtitle || fb.subtitle || "",
        description: m.description || fb.description || ""
      };
    }
    return {
      title: fb.title || "",
      subtitle: fb.subtitle || "",
      description: fb.description || ""
    };
  }

  function getCableText(moduleKey, cableId, fallbackCable) {
    const fb = fallbackCable || {};
    if (currentLang === "yue") {
      const c = MODULE_TRANSLATIONS_YUE[moduleKey]?.cableTypes?.[cableId];
      if (c) {
        return { name: c.name || fb.name || "", desc: c.desc || fb.desc || "" };
      }
    }
    return { name: fb.name || "", desc: fb.desc || "" };
  }

  function getDeviceText(moduleKey, deviceId, fallbackDevice) {
    const fb = fallbackDevice || {};
    if (currentLang === "yue") {
      const d = MODULE_TRANSLATIONS_YUE[moduleKey]?.devices?.[deviceId];
      if (d) {
        return { name: d.name || fb.name || "", desc: d.desc || fb.desc || "" };
      }
    }
    return { name: fb.name || "", desc: fb.desc || "" };
  }

  function getTerminalText(moduleKey, deviceId, termId, fallbackTerm) {
    const fb = fallbackTerm || {};
    if (currentLang === "yue") {
      const tr = MODULE_TRANSLATIONS_YUE[moduleKey]?.devices?.[deviceId]?.terminals?.[termId];
      if (tr) {
        return {
          name: tr.name || fb.name || "",
          label: tr.label !== undefined ? tr.label : fb.label
        };
      }
    }
    return { name: fb.name || "", label: fb.label };
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang === "yue" ? "zh-HK" : "es";
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

    // Actualizar botones del selector de idioma
    document.querySelectorAll(".lang-btn").forEach(btn => {
      const lang = btn.getAttribute("data-lang");
      btn.classList.toggle("active", lang === currentLang);
    });

    // Aviso en vista de notas cuando está en cantonés
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
