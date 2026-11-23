/**
 * Renderizador Markdown-a-HTML cero-dependencias para ANOTACIONES_APRENDIZAJE.md.
 * Compatible con file:// y http:// sin dependencias externas ni passthrough de HTML crudo.
 */
(function (global) {
  "use strict";

  var ARROW_MAP = [
    ["$\\Leftrightarrow$", "\u21d4"],
    ["$\\Rightarrow$", "\u21d2"],
    ["$\\Leftarrow$", "\u21d0"],
    ["$\\leftrightarrow$", "\u2194"],
    ["$\\rightarrow$", "\u2192"],
    ["$\\leftarrow$", "\u2190"]
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function replaceMathArrows(str) {
    var out = String(str);
    for (var i = 0; i < ARROW_MAP.length; i++) {
      out = out.split(ARROW_MAP[i][0]).join(ARROW_MAP[i][1]);
    }
    return out;
  }

  function isSafeUrl(url) {
    if (!url) return false;
    var cleaned = String(url).replace(/[\u0000-\u0020\u007f]+/g, "").trim();
    if (!cleaned) return false;
    if (/^[/\\]{2}/.test(cleaned)) return false;
    if (cleaned.charAt(0) === "#") return true;
    if (cleaned.charAt(0) === "/") return true;
    if (/^https?:\/\//i.test(cleaned)) return true;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned)) return false;
    return true;
  }

  function decodeBasicEntities(str) {
    return String(str)
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, "\"")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&");
  }

  function renderInline(raw) {
    var codeTokens = [];
    var text = String(raw || "");

    // 1. Tokenizar spans de código inline antes de matemáticas, escape HTML y énfasis
    text = text.replace(/``([\s\S]+?)``|`([^`\n]+?)`/g, function (_, dbl, sgl) {
      var code = dbl !== undefined ? dbl : sgl;
      if (dbl !== undefined && code.length >= 2 && code.charAt(0) === " " && code.charAt(code.length - 1) === " " && code.trim().length > 0) {
        code = code.slice(1, -1);
      }
      var token = "\u0000CODE_" + codeTokens.length + "\u0000";
      codeTokens.push("<code>" + escapeHtml(code) + "</code>");
      return token;
    });

    // 2. Convertir flechas LaTeX fuera de spans de código a Unicode
    text = replaceMathArrows(text);

    // 3. Escape estricto de HTML contra XSS
    text = escapeHtml(text);

    // 4. Enlaces seguros [texto](url)
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (full, label, escapedUrl) {
      var rawUrl = decodeBasicEntities(escapedUrl).trim();
      if (!isSafeUrl(rawUrl)) {
        return full;
      }
      var isExternal = /^https?:\/\//i.test(rawUrl);
      var attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + escapeHtml(rawUrl) + '"' + attrs + ">" + label + "</a>";
    });

    // 5. Negrita **...**
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");

    // 6. Cursiva *...* (sin afectar identificadores con _)
    text = text.replace(/(^|[^*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?!\*)/g, "$1<em>$2</em>");

    // 7. Restaurar spans de código inline
    text = text.replace(/\u0000CODE_(\d+)\u0000/g, function (_, idx) {
      return codeTokens[Number(idx)] || "";
    });

    return text;
  }

  function stripMarkdownForSlug(raw) {
    var text = String(raw || "");
    text = text.replace(/``([\s\S]+?)``|`([^`\n]+?)`/g, function (_, dbl, sgl) {
      var code = dbl !== undefined ? dbl : sgl;
      return code;
    });
    text = replaceMathArrows(text);
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, "$1");
    text = text.replace(/(^|[^*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?!\*)/g, "$1$2");
    return text.replace(/\s+/g, " ").trim();
  }

  function makeUniqueSlug(plainText, slugCounts) {
    var base = plainText
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "seccion";
    var prefixed = "note-" + base;
    var count = slugCounts.get(prefixed) || 0;
    slugCounts.set(prefixed, count + 1);
    return count === 0 ? prefixed : prefixed + "-" + count;
  }

  function splitTableRow(line) {
    var trimmed = String(line || "").trim();
    if (trimmed.charAt(0) === "|") {
      trimmed = trimmed.slice(1);
    }
    if (trimmed.length > 0 && trimmed.charAt(trimmed.length - 1) === "|") {
      var backslashes = 0;
      for (var k = trimmed.length - 2; k >= 0 && trimmed.charAt(k) === "\\"; k--) {
        backslashes++;
      }
      if (backslashes % 2 === 0) {
        trimmed = trimmed.slice(0, -1);
      }
    }

    var cells = [];
    var current = "";
    var inBacktick = false;
    for (var i = 0; i < trimmed.length; i++) {
      var ch = trimmed.charAt(i);
      if (ch === "\\" && i + 1 < trimmed.length && trimmed.charAt(i + 1) === "|") {
        current += "|";
        i++;
        continue;
      }
      if (ch === "`") {
        inBacktick = !inBacktick;
        current += ch;
        continue;
      }
      if (ch === "|" && !inBacktick) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  }

  function parseTableSeparator(line) {
    if (String(line || "").indexOf("|") === -1) return null;
    var cells = splitTableRow(line);
    if (cells.length === 0) return null;
    var aligns = [];
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (!/^:?-{3,}:?$/.test(cell)) return null;
      var left = cell.charAt(0) === ":";
      var right = cell.charAt(cell.length - 1) === ":";
      if (left && right) aligns.push("center");
      else if (right) aligns.push("right");
      else aligns.push("left");
    }
    return aligns;
  }

  function isBlockStart(lines, idx) {
    var line = lines[idx];
    if (/^\s*$/.test(line)) return true;
    if (/^\s*(```+|~~~+)([a-zA-Z0-9_-]*)\s*$/.test(line)) return true;
    if (/^(#{1,6})\s+(.*?)\s*#*$/.test(line)) return true;
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) return true;
    if (/^\s*>\s?/.test(line)) return true;
    if (/^(\s*)([-*+]|\d+\.)\s+(.*)$/.test(line)) return true;
    if (line.indexOf("|") !== -1 && idx + 1 < lines.length && parseTableSeparator(lines[idx + 1])) return true;
    return false;
  }

  function parseBlocks(lines, toc, slugCounts) {
    var htmlParts = [];
    var listStack = [];
    var i = 0;

    function closeListStack(minIndent) {
      while (listStack.length > 0) {
        var top = listStack[listStack.length - 1];
        if (minIndent !== undefined && top.indent < minIndent) {
          break;
        }
        if (top.liOpen) {
          htmlParts.push("</li>");
          top.liOpen = false;
        }
        htmlParts.push("</" + top.tag + ">");
        listStack.pop();
      }
    }

    while (i < lines.length) {
      var line = lines[i];

      // Línea en blanco
      if (/^\s*$/.test(line)) {
        closeListStack();
        i++;
        continue;
      }

      // Bloque de código fenced (``` o ~~~)
      var fenceMatch = line.match(/^\s*(```+|~~~+)([a-zA-Z0-9_-]*)\s*$/);
      if (fenceMatch) {
        closeListStack();
        var fenceStr = fenceMatch[1];
        var fenceChar = fenceStr.charAt(0);
        var fenceLen = fenceStr.length;
        var lang = fenceMatch[2] || "";
        var codeLines = [];
        i++;
        while (i < lines.length) {
          var closeLine = lines[i];
          var closeRegex = new RegExp("^\\s*" + fenceChar + "{" + fenceLen + ",}\\s*$");
          if (closeRegex.test(closeLine)) {
            i++;
            break;
          }
          codeLines.push(closeLine);
          i++;
        }
        var langAttr = lang ? ' class="language-' + escapeHtml(lang) + '"' : "";
        htmlParts.push("<pre><code" + langAttr + ">" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
        continue;
      }

      // Regla horizontal
      if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        closeListStack();
        htmlParts.push("<hr>");
        i++;
        continue;
      }

      // Encabezado (# .. ######)
      var headingMatch = line.match(/^(#{1,6})\s+(.*?)\s*#*$/);
      if (headingMatch) {
        closeListStack();
        var level = headingMatch[1].length;
        var rawHeading = headingMatch[2];
        var plainHeading = stripMarkdownForSlug(rawHeading);
        var headingId = makeUniqueSlug(plainHeading, slugCounts);
        if (toc && level <= 4) {
          toc.push({ level: level, text: plainHeading, id: headingId });
        }
        htmlParts.push("<h" + level + ' id="' + escapeHtml(headingId) + '">' + renderInline(rawHeading) + "</h" + level + ">");
        i++;
        continue;
      }

      // Cita en bloque (>)
      if (/^\s*>\s?/.test(line)) {
        closeListStack();
        var quoteLines = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        htmlParts.push("<blockquote>" + parseBlocks(quoteLines, toc, slugCounts) + "</blockquote>");
        continue;
      }

      // Tabla GFM
      if (line.indexOf("|") !== -1 && i + 1 < lines.length) {
        var aligns = parseTableSeparator(lines[i + 1]);
        if (aligns) {
          closeListStack();
          var headers = splitTableRow(line);
          var theadCells = [];
          for (var hIdx = 0; hIdx < aligns.length; hIdx++) {
            var hAlign = aligns[hIdx] !== "left" ? ' style="text-align:' + aligns[hIdx] + '"' : "";
            theadCells.push("<th" + hAlign + ">" + renderInline(headers[hIdx] || "") + "</th>");
          }
          i += 2;
          var bodyRows = [];
          while (i < lines.length && lines[i].indexOf("|") !== -1 && !/^\s*$/.test(lines[i])) {
            var rowCells = splitTableRow(lines[i]);
            var tds = [];
            for (var cIdx = 0; cIdx < aligns.length; cIdx++) {
              var cAlign = aligns[cIdx] !== "left" ? ' style="text-align:' + aligns[cIdx] + '"' : "";
              tds.push("<td" + cAlign + ">" + renderInline(rowCells[cIdx] !== undefined ? rowCells[cIdx] : "") + "</td>");
            }
            bodyRows.push("<tr>" + tds.join("") + "</tr>");
            i++;
          }
          htmlParts.push(
            '<div class="notes-table-wrap"><table><thead><tr>' +
            theadCells.join("") +
            "</tr></thead><tbody>" +
            bodyRows.join("") +
            "</tbody></table></div>"
          );
          continue;
        }
      }

      // Listas ordenadas y no ordenadas con soporte de anidamiento por pila
      var listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
      if (listMatch) {
        var indent = listMatch[1].replace(/\t/g, "    ").length;
        var marker = listMatch[2];
        var tag = /^\d+\.$/.test(marker) ? "ol" : "ul";
        var itemContent = listMatch[3];

        while (listStack.length > 0 && indent < listStack[listStack.length - 1].indent) {
          var closingTop = listStack.pop();
          if (closingTop.liOpen) {
            htmlParts.push("</li>");
          }
          htmlParts.push("</" + closingTop.tag + ">");
        }

        if (listStack.length === 0 || indent > listStack[listStack.length - 1].indent) {
          listStack.push({ tag: tag, indent: indent, liOpen: false });
          htmlParts.push("<" + tag + ">");
        } else if (listStack[listStack.length - 1].tag !== tag) {
          var swappedTop = listStack.pop();
          if (swappedTop.liOpen) {
            htmlParts.push("</li>");
          }
          htmlParts.push("</" + swappedTop.tag + ">");
          listStack.push({ tag: tag, indent: indent, liOpen: false });
          htmlParts.push("<" + tag + ">");
        } else if (listStack[listStack.length - 1].liOpen) {
          htmlParts.push("</li>");
          listStack[listStack.length - 1].liOpen = false;
        }

        htmlParts.push("<li>" + renderInline(itemContent));
        listStack[listStack.length - 1].liOpen = true;
        i++;
        continue;
      }

      // Párrafo contiguo
      closeListStack();
      var paraLines = [];
      while (i < lines.length && !isBlockStart(lines, i)) {
        paraLines.push(lines[i].trim());
        i++;
      }
      if (paraLines.length > 0) {
        htmlParts.push("<p>" + renderInline(paraLines.join(" ")) + "</p>");
      } else {
        i++;
      }
    }

    closeListStack();
    return htmlParts.join("\n");
  }

  function renderMarkdown(mdText) {
    var normalized = String(mdText || "").replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
    var lines = normalized.split("\n");
    var toc = [];
    var slugCounts = new Map();
    var html = parseBlocks(lines, toc, slugCounts);
    return { html: html, toc: toc };
  }

  function buildTocHtml(toc) {
    if (!Array.isArray(toc) || toc.length === 0) {
      return '<p class="notes-toc-empty">Sin secciones indexadas.</p>';
    }
    var items = [];
    for (var i = 0; i < toc.length; i++) {
      var item = toc[i];
      var safeId = escapeHtml(item.id);
      var safeText = escapeHtml(item.text);
      items.push(
        '<li class="notes-toc-item notes-toc-level-' + item.level + '">' +
        '<a class="notes-toc-link" href="#' + safeId + '" data-note-target="' + safeId + '">' +
        safeText +
        "</a></li>"
      );
    }
    return '<ul class="notes-toc-list">' + items.join("") + "</ul>";
  }

  function renderInto(contentEl, tocEl, mdText) {
    if (!mdText || !String(mdText).trim()) {
      if (contentEl) {
        contentEl.innerHTML = '<div class="notes-fallback">No se pudo cargar el contenido de las anotaciones de aprendizaje. Verifica que <code>js/notes_data.js</code> esté cargado correctamente.</div>';
      }
      if (tocEl) {
        tocEl.innerHTML = '<p class="notes-toc-empty">Índice no disponible.</p>';
      }
      return { toc: [] };
    }

    var result = renderMarkdown(mdText);
    if (contentEl) {
      contentEl.innerHTML = result.html;
    }
    if (tocEl) {
      tocEl.innerHTML = buildTocHtml(result.toc);
      if (tocEl.dataset && tocEl.dataset.notesTocBound !== "1") {
        tocEl.dataset.notesTocBound = "1";
        tocEl.addEventListener("click", function (e) {
          var link = e.target && e.target.closest ? e.target.closest("a[data-note-target]") : null;
          if (!link) return;
          e.preventDefault();
          var targetId = link.getAttribute("data-note-target");
          var targetEl = targetId ? document.getElementById(targetId) : null;
          var activeLinks = tocEl.querySelectorAll(".notes-toc-link.active");
          for (var i = 0; i < activeLinks.length; i++) {
            activeLinks[i].classList.remove("active");
          }
          link.classList.add("active");
          if (targetEl && typeof targetEl.scrollIntoView === "function") {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    }
    return { toc: result.toc };
  }

  global.NotesRenderer = {
    renderMarkdown: renderMarkdown,
    buildTocHtml: buildTocHtml,
    renderInto: renderInto
  };
})(window);
