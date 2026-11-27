# Autenticación Google en Didaktikos (Solo Frontend)

## Credenciales y Client ID
- **Client ID OAuth 2.0 (Web):** `804801707494-0lkbdmrv5pagfat99l15v7c3c6ud04t2.apps.googleusercontent.com`
- **Origen de las credenciales:** `\Credentials\IDs de clientes de OAuth 2.0\client_secret_804801707494-0lkbdmrv5pagfat99l15v7c3c6ud04t2.apps.googleusercontent.com.json`
- **Scopes:** básicos por defecto de Google Identity Services (`openid`, `email`, `profile`).
- **Seguridad de secretos:** El `client_secret` **no** se utiliza ni se incluye en ningún archivo del frontend.

## Archivos involucrados
- `web/index.html`: Carga `<script src="https://accounts.google.com/gsi/client" async></script>`, declara el contenedor `#g_id_onload` (`data-client_id`, `data-callback="didaktikosHandleGoogleCredential"`, `data-auto_prompt="false"`) y el botón `.g_id_signin`, además del perfil logueado y botón de cierre de sesión en `.top-navbar`.
- `web/js/auth.js`: Decodifica el payload JWT (`base64url` + UTF-8), guarda la sesión en `localStorage` bajo la clave `didaktikos.auth` (con respaldo en `sessionStorage`), restaura sesión al cargar, maneja cierre de sesión y degradación offline.
- `web/css/didaktikos-theme-bridge.css`: Estilos del widget `.ddk-auth-widget` integrados con los tokens Didaktikos (tema claro y oscuro).
- `web/js/i18n.js`: Traducciones `auth_*` en `es`, `en` y `zh`.

## Cómo probar localmente

### 1. Modo `file://` (sin servidor)
1. Abre `web/index.html` directamente en el navegador (`file:///.../web/index.html`).
2. Todo el simulador (BEV, HEV, Lab de Baterías, Autonomía, Anotaciones y E-Prix) funciona sin conexión y sin servidor.
3. En `file://`, Google Identity Services puede mostrar el aviso de degradación (`Login Google requiere HTTP/HTTPS` o `Login Google sin conexión`) porque Google OAuth requiere un origen HTTP/HTTPS autorizado para emitir el popup.

### 2. Servidor estático local y producción (`https://www.didaktikos.com.mx`)
1. Inicia un servidor estático en la raíz del proyecto, por ejemplo:
   ```bash
   python -m http.server 8080
   ```
   y abre `http://localhost:8080/web/index.html` (nota: para probar el popup real de Google en local, `http://localhost:8080` debe estar autorizado en Google Cloud Console; en producción `https://www.didaktikos.com.mx` ya está registrado en `javascript_origins`).
2. Haz clic en el botón oficial de Google, selecciona cuenta y verifica que en la barra superior aparezcan tu avatar/iniciales, nombre y el botón **Cerrar sesión**.
3. Recarga la página y confirma que la sesión persiste desde `localStorage` (`didaktikos.auth`).
4. Haz clic en **Cerrar sesión** y confirma que `didaktikos.auth` se elimina y vuelve a mostrarse el botón de Google.

## Limitación de seguridad (flujo sin backend)
- Este sitio es 100% estático; `web/js/auth.js` decodifica el JWT en el navegador **sin verificar la firma criptográfica** de Google.
- Sirve únicamente para UX local (identidad visual y estado en navegador), **no** para proteger recursos privados ni validar identidad con garantías de seguridad.
- **Cómo escalar a login real:** crear un endpoint serverless (Cloud Functions, Netlify Functions o Vercel) que reciba el `credential` mediante `data-login_uri`, verifique la firma usando el Client ID y emita una sesión HttpOnly.
