# Guía de Integración: E-Prix Didaktikos en Plataforma Didaktikos

Este documento detalla el procedimiento exacto y el diff mínimo necesario para integrar el módulo **E-Prix Didaktikos** dentro de la navegación principal del repositorio (`web/index.html` y `web/js/app.js`), preservando intacta la compatibilidad con los módulos existentes de cableado y principios (BEV y HEV).

---

## 1. Fragmento de Tarjeta para `view_home` (`web/index.html`)

Inserte este fragmento dentro del contenedor `<div class="modules-grid">` en `web/index.html` (inmediatamente después de la tarjeta de HEV o de Anotaciones). Sigue estrictamente la estructura, clases y tokens visuales de las tarjetas gemelas:

```html
        <!-- Tarjeta E-Prix Didaktikos (Módulo de Carreras y Baterías) -->
        <div class="module-card" id="card_goto_eprix">
          <div class="card-icon-banner" aria-hidden="true" style="font-size: 2.2rem; background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(67, 97, 238, 0.2)); border-radius: 8px; display: flex; align-items: center; justify-content: center; height: 140px;">🏎️</div>
          <span class="card-tag" style="background: rgba(0, 245, 212, 0.15); color: var(--accent-cyan); border-color: rgba(0, 245, 212, 0.3);">Competición & Electroquímica</span>
          <h2 class="card-title">E-Prix Didaktikos</h2>
          <p class="card-desc">
            Simula una carrera eléctrica top-down de 4 vueltas y descubre cómo la química de la batería, el C-rate y el freno regenerativo determinan la victoria.
          </p>
          <div class="card-btn">
            Iniciar E-Prix ➔
          </div>
        </div>
```

---

## 2. Botón de la Barra de Navegación Superior (`web/index.html`)

Dentro de `<nav class="nav-links">` en `web/index.html`, agregue el acceso directo:

```html
      <button class="nav-btn" id="nav_eprix">🏎️ E-Prix</button>
```

---

## 3. Punto Exacto de Registro en el Router (`web/js/app.js`)

Dado que el módulo `E-Prix Didaktikos` cuenta con su propia vista interactiva en pantalla completa optimizada a 60 FPS, puede integrarse de dos formas:

### Opción A: Navegación directa hacia el entorno autónomo (Recomendada)
En `web/js/app.js`, dentro del evento `DOMContentLoaded`:

```javascript
  // Acceso al módulo E-Prix Didaktikos
  const navEprixBtn = document.getElementById("nav_eprix");
  const cardEprix = document.getElementById("card_goto_eprix");

  if (navEprixBtn) {
    navEprixBtn.addEventListener("click", () => {
      window.location.href = "eprix/eprix.html";
    });
  }

  if (cardEprix) {
    cardEprix.addEventListener("click", () => {
      window.location.href = "eprix/eprix.html";
    });
  }
```

### Opción B: Montaje inline en `web/index.html` mediante contenedor `<section class="app-view" id="view_eprix">`
1. Añadir en `web/index.html`:
   ```html
   <section class="app-view" id="view_eprix">
     <div id="eprix_container_mount"></div>
   </section>
   ```
2. En `web/js/app.js`:
   ```javascript
   views.eprix = document.getElementById("view_eprix");
   ```
3. Importar dinámicamente `eprix/eprix.js`:
   ```javascript
   import("./eprix/eprix.js").then(m => m.initEPrix("eprix_container_mount"));
   ```

---

## 4. Diff Mínimo Exacto (Git Diff de Referencia)

```diff
--- a/web/index.html
+++ b/web/index.html
@@ -25,6 +25,7 @@
       <button class="nav-btn" id="nav_notes" data-i18n="nav_notes">📘 Anotaciones</button>
+      <button class="nav-btn" id="nav_eprix">🏎️ E-Prix</button>
       <button class="nav-btn" id="nav_back" style="display: none;" data-i18n="nav_back">⬅ Volver</button>
 
@@ -86,6 +87,20 @@
           </div>
         </div>
+
+        <!-- Tarjeta E-Prix Didaktikos -->
+        <div class="module-card" id="card_goto_eprix">
+          <div class="card-icon-banner" style="font-size: 2.2rem; height: 140px; display:flex; align-items:center; justify-content:center; background: rgba(0,245,212,0.1); border-radius:8px;">🏎️</div>
+          <span class="card-tag">Competición & Electroquímica</span>
+          <h2 class="card-title">E-Prix Didaktikos</h2>
+          <p class="card-desc">
+            Simula una carrera eléctrica y descubre cómo la química de la batería cambia el resultado.
+          </p>
+          <div class="card-btn">
+            Iniciar E-Prix ➔
+          </div>
+        </div>
       </div>
     </section>
```
