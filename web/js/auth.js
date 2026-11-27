/**
 * Módulo de autenticación solo-frontend con Google Identity Services (GIS) para Didaktikos.
 *
 * NOTA DE SEGURIDAD:
 * Esta implementación decodifica el payload del JWT (credential) directamente en el navegador
 * únicamente para fines de UX local (mostrar nombre, avatar y persistir estado en el navegador).
 * NO verifica la firma criptográfica del token ni utiliza Client Secret (el cual nunca debe
 * exponerse en código frontend). Por lo tanto, NO constituye autenticación de seguridad real.
 * Si en el futuro se requiere control de acceso o persistencia segura en servidor, se deberá
 * enviar el `credential` a un endpoint backend/serverless (`data-login_uri`) que verifique
 * la firma del JWT contra el Client ID oficial de Google.
 */
(function () {
  const STORAGE_KEY = "didaktikos.auth";
  const GOOGLE_CLIENT_ID = "804801707494-0lkbdmrv5pagfat99l15v7c3c6ud04t2.apps.googleusercontent.com";

  let statusTimer = null;

  function t(key) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key);
    }
    const fallback = {
      auth_logout: "Cerrar sesión",
      auth_signed_in_as: "Sesión iniciada como",
      auth_offline: "Login Google sin conexión",
      auth_file_hint: "Login Google requiere HTTP/HTTPS",
      auth_err_invalid_credential: "Credencial de Google inválida o expirada.",
      auth_err_storage: "No se pudo guardar la sesión local.",
      auth_err_popup: "No se pudo completar el inicio de sesión con Google."
    };
    return fallback[key] || key;
  }

  /**
   * Decodifica el payload (segundo segmento) de un JWT usando base64url + UTF-8.
   * No verifica la firma criptográfica; uso exclusivo de UX local.
   */
  function decodeJwtPayload(token) {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;

    try {
      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64.length % 4;
      if (pad === 2) base64 += "==";
      else if (pad === 3) base64 += "=";
      else if (pad === 1) return null;

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const json = new TextDecoder("utf-8").decode(bytes);
      const payload = JSON.parse(json);

      if (!payload || typeof payload !== "object" || !payload.sub) {
        return null;
      }
      return payload;
    } catch (_) {
      return null;
    }
  }

  function isTokenExpired(payload) {
    if (!payload || typeof payload.exp !== "number") return false;
    return Date.now() / 1000 >= payload.exp;
  }

  function saveSession(user) {
    const serialized = JSON.stringify(user);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (_) {
      try {
        sessionStorage.setItem(STORAGE_KEY, serialized);
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  function loadSession() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      raw = null;
    }
    if (!raw) {
      try {
        raw = sessionStorage.getItem(STORAGE_KEY);
      } catch (_) {
        raw = null;
      }
    }
    if (!raw) return null;

    try {
      const user = JSON.parse(raw);
      if (!user || !user.sub) return null;
      if (isTokenExpired(user)) {
        clearSession();
        return null;
      }
      return user;
    } catch (_) {
      clearSession();
      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }

  function getInitials(name, email) {
    const source = (name || email || "U").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  }

  function showStatus(message, isError = false) {
    const statusEl = document.getElementById("ddk_auth_status");
    if (!statusEl) return;

    if (statusTimer) {
      clearTimeout(statusTimer);
      statusTimer = null;
    }

    if (!message) {
      statusEl.textContent = "";
      statusEl.hidden = true;
      statusEl.classList.remove("is-error");
      return;
    }

    statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.classList.toggle("is-error", Boolean(isError));

    statusTimer = setTimeout(() => {
      statusEl.hidden = true;
    }, 5500);
  }

  function updateAuthUI(user) {
    const signedOutBox = document.getElementById("ddk_auth_signed_out");
    const signedInBox = document.getElementById("ddk_auth_signed_in");
    const avatarEl = document.getElementById("ddk_auth_avatar");
    const initialsEl = document.getElementById("ddk_auth_initials");
    const nameEl = document.getElementById("ddk_auth_name");

    if (!signedOutBox || !signedInBox) return;

    if (user) {
      signedOutBox.hidden = true;
      signedInBox.hidden = false;

      const displayName = user.name || user.email || "Usuario";
      if (nameEl) {
        nameEl.textContent = displayName;
        nameEl.title = user.email ? `${displayName} (${user.email})` : displayName;
      }
      if (initialsEl) {
        initialsEl.textContent = getInitials(user.name, user.email);
      }
      if (avatarEl) {
        if (user.picture) {
          avatarEl.hidden = false;
          if (initialsEl) initialsEl.hidden = true;
          avatarEl.src = user.picture;
          avatarEl.alt = displayName;
        } else {
          avatarEl.hidden = true;
          avatarEl.removeAttribute("src");
          if (initialsEl) initialsEl.hidden = false;
        }
      }
    } else {
      signedInBox.hidden = true;
      signedOutBox.hidden = false;
    }
  }

  function updateGisAvailability() {
    const offlineBadge = document.getElementById("ddk_auth_offline_badge");
    const gsiBtn = document.getElementById("ddk_google_signin_btn");
    if (!offlineBadge || !gsiBtn) return;

    const isFileProtocol = window.location.protocol === "file:";
    const hasGsi = Boolean(window.google && window.google.accounts && window.google.accounts.id);
    const hasRenderedBtn = gsiBtn.childElementCount > 0;

    if (!navigator.onLine || window.__ddkGisLoadError || (!hasGsi && !hasRenderedBtn)) {
      offlineBadge.hidden = false;
      offlineBadge.textContent = isFileProtocol && navigator.onLine
        ? t("auth_file_hint")
        : t("auth_offline");
      gsiBtn.hidden = !hasRenderedBtn;
    } else {
      offlineBadge.hidden = true;
      gsiBtn.hidden = false;
    }
  }

  /**
   * Callback oficial invocado por Google Identity Services (data-callback).
   */
  function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      showStatus(t("auth_err_popup"), true);
      return;
    }

    const payload = decodeJwtPayload(response.credential);
    if (!payload || isTokenExpired(payload)) {
      showStatus(t("auth_err_invalid_credential"), true);
      return;
    }

    const user = {
      sub: payload.sub,
      email: payload.email || "",
      name: payload.name || payload.email || "",
      picture: payload.picture || "",
      exp: typeof payload.exp === "number" ? payload.exp : null,
      iat: typeof payload.iat === "number" ? payload.iat : null,
      loggedInAt: Date.now()
    };

    const saved = saveSession(user);
    if (!saved) {
      showStatus(t("auth_err_storage"), true);
    } else {
      showStatus("");
    }

    updateAuthUI(user);
    window.dispatchEvent(new CustomEvent("didaktikos:authchange", { detail: { user } }));
  }

  function logout() {
    clearSession();
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (_) {}

    updateAuthUI(null);
    updateGisAvailability();
    showStatus("");
    window.dispatchEvent(new CustomEvent("didaktikos:authchange", { detail: { user: null } }));
  }

  // Exponer callback global requerido por data-callback en el marcado GIS
  window.didaktikosHandleGoogleCredential = handleGoogleCredentialResponse;
  window.DidaktikosAuth = {
    CLIENT_ID: GOOGLE_CLIENT_ID,
    STORAGE_KEY,
    getUser: loadSession,
    logout,
    decodeJwtPayload
  };

  document.addEventListener("DOMContentLoaded", () => {
    const avatarEl = document.getElementById("ddk_auth_avatar");
    const initialsEl = document.getElementById("ddk_auth_initials");
    if (avatarEl) {
      avatarEl.addEventListener("error", () => {
        avatarEl.hidden = true;
        if (initialsEl) initialsEl.hidden = false;
      });
    }

    const logoutBtn = document.getElementById("ddk_auth_logout_btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }

    const gsiScript = document.getElementById("ddk_gsi_script");
    if (gsiScript) {
      gsiScript.addEventListener("error", () => {
        window.__ddkGisLoadError = true;
        updateGisAvailability();
      });
      gsiScript.addEventListener("load", () => {
        window.__ddkGisLoadError = false;
        setTimeout(updateGisAvailability, 300);
      });
    }

    window.addEventListener("online", () => {
      window.__ddkGisLoadError = false;
      updateGisAvailability();
    });
    window.addEventListener("offline", updateGisAvailability);
    window.addEventListener("sim:langchange", updateGisAvailability);

    const existingUser = loadSession();
    updateAuthUI(existingUser);

    // Esperar brevemente a que GIS async renderice el botón; si no, degradar limpiamente
    setTimeout(updateGisAvailability, 2500);
  });
})();
