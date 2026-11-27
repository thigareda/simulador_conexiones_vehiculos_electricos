/**
 * Controlador de Tema y Modo Oscuro Didaktikos (\Estilos-globales)
 * Compatible con file:// y HTTP. Persiste preferencias en localStorage.
 */
(function () {
  const THEME_KEY = "ddk_theme";
  const MODE_KEY = "ddk_mode";
  const VALID_THEMES = ["sky", "golden", "coral", "aquamarine", "purple"];

  function applyPreferences(theme, mode) {
    const safeTheme = VALID_THEMES.includes(theme) ? theme : "sky";
    const safeMode = mode === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", safeTheme);
    document.documentElement.setAttribute("data-mode", safeMode);

    document.querySelectorAll("[data-ddk-theme]").forEach(btn => {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-ddk-theme") === safeTheme));
    });

    const modeBtn = document.getElementById("ddk_mode_toggle");
    if (modeBtn) {
      modeBtn.setAttribute("aria-pressed", String(safeMode === "dark"));
      modeBtn.textContent = safeMode === "dark" ? "🌙 Oscuro" : "☀️ Claro";
    }
  }

  // Aplicar de inmediato para evitar parpadeo visual
  let savedTheme = "sky";
  let savedMode = "dark";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "sky";
    savedMode = localStorage.getItem(MODE_KEY) || "dark";
  } catch (_) {}
  applyPreferences(savedTheme, savedMode);

  document.addEventListener("DOMContentLoaded", () => {
    applyPreferences(savedTheme, savedMode);

    document.querySelectorAll("[data-ddk-theme]").forEach(btn => {
      btn.addEventListener("click", () => {
        savedTheme = btn.getAttribute("data-ddk-theme") || "sky";
        try { localStorage.setItem(THEME_KEY, savedTheme); } catch (_) {}
        applyPreferences(savedTheme, savedMode);
      });
    });

    const modeBtn = document.getElementById("ddk_mode_toggle");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        savedMode = savedMode === "dark" ? "light" : "dark";
        try { localStorage.setItem(MODE_KEY, savedMode); } catch (_) {}
        applyPreferences(savedTheme, savedMode);
      });
    }
  });
})();
