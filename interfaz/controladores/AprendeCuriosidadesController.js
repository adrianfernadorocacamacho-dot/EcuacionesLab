/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DE APRENDE Y CURIOSIDADES
 * Módulo didáctico interactivo, guía de estudio y tirada de dados (DDD)
 */

import { KatexAdapter } from "../adaptadores/KatexAdapter.js";

const CURIOSITY_ICONS = {
  "⚔️": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="m14.5 17.5 5 5M4 4l7 7M14.5 6.5l3 3M4.5 16.5l3-3M2 22l4-4M19 5l3-3M16 8l2-2M8 16l-2 2"/></svg>`,
  "🦁": `<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/></svg>`,
  "🌉": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M4 19V5M20 19V5M2 19h20M4 9c4 4 12 4 16 0M4 14c4 2 12 2 16 0M12 9v10"/></svg>`,
  "👁️": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  "⏳": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`,
  "🐟": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M6.5 12c.94-2.07 2.84-3.5 5.5-3.5 3.5 0 7 3.5 10 3.5-3 0-6.5 3.5-10 3.5-2.66 0-4.56-1.43-5.5-3.5z"/><path d="M2 16l4.5-4L2 8"/></svg>`,
  "☕": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  "🎮": `<svg class="ui-icon" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="6"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/></svg>`,
  "🥾": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M4 17h16M4 21h16M4 17v-7a3 3 0 0 1 3-3h3l2 4h4a4 4 0 0 1 4 4v2"/></svg>`,
  "💊": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,
  "🦋": `<svg class="ui-icon" viewBox="0 0 24 24"><path d="M12 4v16M8 8a4 4 0 0 0-6 3 4 4 0 0 0 6 5M16 8a4 4 0 0 1 6 3 4 4 0 0 1-6 5"/></svg>`,
  "🦠": `<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`
};

function getCuriosityIconSvg(icon) {
  return CURIOSITY_ICONS[icon] || `<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
}

export class AprendeCuriosidadesController {
  constructor({ curiosidadesRepo, leccionesRepo, preguntasRepo, audioController }) {
    this.curiosidadesRepo = curiosidadesRepo;
    this.leccionesRepo = leccionesRepo;
    this.preguntasRepo = preguntasRepo;
    this.audio = audioController;
    this.filtroCuriosidades = "todas";
    this.filtroGuia = "todas";
    this.busquedaGuia = "";
  }

  inicializar() {
    // Pestañas de lecciones teóricas
    document.querySelectorAll(".topic-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        if (this.audio) this.audio.click();
        document.querySelectorAll(".topic-tab").forEach(t => t.classList.toggle("active", t === tab));
        this.renderizarLeccion(tab.dataset.topic);
      });
    });

    // Filtros de curiosidades
    document.querySelectorAll(".filter-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.audio) this.audio.click();
        document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("active", b === btn));
        this.filtroCuriosidades = btn.dataset.cat;
        this.renderizarCuriosidades();
      });
    });

    // Tirar el dado 3D
    document.getElementById("btnRollCuriosity")?.addEventListener("click", () => {
      this.mostrarCuriosidadAleatoria("curiosityFeaturedCard");
    });
    document.getElementById("mainDiceIcon")?.addEventListener("click", () => {
      this.mostrarCuriosidadAleatoria("curiosityFeaturedCard");
    });

    // Siguiente dato curioso en la vista de Inicio
    document.getElementById("btnNextCuriosity")?.addEventListener("click", () => {
      const c = this.curiosidadesRepo.obtenerAleatoria();
      if (this.audio) this.audio.click();
      const icon = document.getElementById("spotlightIcon");
      const title = document.getElementById("spotlightTitle");
      const text = document.getElementById("spotlightText");
      if (icon) icon.innerHTML = getCuriosityIconSvg(c.icono);
      if (title) title.textContent = c.titulo;
      if (text) text.textContent = c.contenido;
    });

    // Búsqueda en vivo de la Guía de Estudio
    document.getElementById("studySearchInput")?.addEventListener("input", (e) => {
      this.busquedaGuia = e.target.value;
      this.renderizarGuiaEstudio();
    });

    // Filtros de categoría de la Guía de Estudio
    document.querySelectorAll(".study-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.audio) this.audio.click();
        document.querySelectorAll(".study-filter-btn").forEach(b => b.classList.toggle("active", b === btn));
        this.filtroGuia = btn.dataset.filter;
        this.renderizarGuiaEstudio();
      });
    });

    // Carga inicial
    this.renderizarLeccion("concepto");
    this.renderizarCuriosidades();
    this.renderizarGuiaEstudio();
    this.mostrarCuriosidadAleatoria("curiosityFeaturedCard");
  }

  renderizarLeccion(clave) {
    const leccion = this.leccionesRepo.obtenerPorClave(clave);
    if (!leccion) return;
    const container = document.getElementById("lessonContent");
    if (!container) return;

    container.innerHTML = `
      <h2>${leccion.title}</h2>
      <p>${leccion.intro}</p>
      <div class="math-block" id="lessonMathFormula"></div>
      <div class="lesson-columns">
        <div class="lesson-mini">
          <strong>${leccion.a}</strong>
          <p>${leccion.ap}</p>
        </div>
        <div class="lesson-mini">
          <strong>${leccion.b}</strong>
          <p>${leccion.bp}</p>
        </div>
      </div>
      <p>${leccion.end}</p>
    `;

    const mathBlock = document.getElementById("lessonMathFormula");
    KatexAdapter.renderizar(mathBlock, leccion.formula);
  }

  renderizarCuriosidades() {
    const container = document.getElementById("curiosityGrid");
    if (!container) return;

    const lista = this.curiosidadesRepo.obtenerPorCategoria(this.filtroCuriosidades);
    container.innerHTML = lista.map(c => `
      <article class="curiosity-card">
        <div class="curiosity-card-top">
          <span class="curiosity-card-icon">${getCuriosityIconSvg(c.icono)}</span>
          <div class="curiosity-card-meta">
            <h4>${c.titulo}</h4>
            <small>${c.subtitulo}</small>
          </div>
        </div>
        <div class="curiosity-card-body">
          <p>${c.contenido}</p>
        </div>
        <div class="curiosity-impact">
          <span><svg class="ui-icon spark-icon" viewBox="0 0 24 24"><path d="M12 2l2.4 6.9L21.3 11l-6.9 2.1L12 20l-2.4-6.9L2.7 11l6.9-2.1z"/></svg> Impacto:</span> ${c.impacto}
        </div>
      </article>
    `).join("");
  }

  mostrarCuriosidadAleatoria(targetContainerId = "curiosityFeaturedCard") {
    const c = this.curiosidadesRepo.obtenerAleatoria();
    const box = document.getElementById(targetContainerId);
    if (!box || !c) return;

    // Animación de rotación del dado
    document.querySelectorAll(".dice-emoji").forEach(d => {
      d.classList.remove("rolling");
      void d.offsetWidth;
      d.classList.add("rolling");
    });

    if (this.audio) this.audio.racha();
    box.style.opacity = "0";

    setTimeout(() => {
      box.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:10px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; color:#c084fc;">${getCuriosityIconSvg(c.icono)}</span>
          <div>
            <h4 style="margin:0; font:700 16px 'Space Grotesk',sans-serif; color:#fff;">${c.titulo}</h4>
            <span style="font-size:11px; color:var(--blue); font-weight:600;">${c.subtitulo}</span>
          </div>
        </div>
        <p style="font-size:12px; line-height:1.7; color:#9cb5ce; margin:0 0 10px;">${c.contenido}</p>
        <div style="font-size:11px; color:var(--mint); font-weight:600; display:flex; align-items:center; gap:6px;">
          <svg class="ui-icon" viewBox="0 0 24 24" style="color:var(--mint);"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>
          <span>${c.impacto}</span>
        </div>
      `;
      box.style.transition = "opacity 0.3s ease";
      box.style.opacity = "1";
    }, 180);
  }

  renderizarGuiaEstudio() {
    const container = document.getElementById("studyCardsContainer");
    if (!container) return;

    let lista = this.preguntasRepo.buscar(this.busquedaGuia);
    if (this.filtroGuia && this.filtroGuia !== "todas") {
      lista = lista.filter(q => q.categoria.toLowerCase().includes(this.filtroGuia.toLowerCase()));
    }

    if (lista.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#c4b5fd;">
          <div style="margin-bottom:12px; display:inline-flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:50%; background:rgba(139,92,246,0.15); color:#a78bfa;">
            <svg class="ui-icon" viewBox="0 0 24 24" width="28" height="28"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 style="margin:6px 0 6px; color:#fff;">No se encontraron preguntas con ese término</h3>
          <p style="font-size:12px;">Intenta buscar otra palabra como 'orden', 'Leibniz', 'separables', o limpia el filtro.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = lista.map(q => {
      const respuestaCorrecta = q.opciones[q.correcta];
      return `
        <article class="study-card">
          <div class="study-card-top">
            <span class="study-card-cat">${q.categoria}</span>
            <span class="study-card-num">Pregunta #${q.id}</span>
          </div>
          <h3>${q.pregunta}</h3>
          <div class="study-answer-box">
            <div class="study-answer-tag">
              <span><svg class="ui-icon" viewBox="0 0 24 24" style="stroke-width:2.5;"><polyline points="20 6 9 17 4 12"/></svg></span> RESPUESTA CORRECTA:
            </div>
            <div class="study-answer-text">${respuestaCorrecta}</div>
          </div>
          <div class="study-explanation">
            <strong>Por qué es correcta:</strong> ${q.explicacion}
          </div>
          <div class="study-tip">
            <span><svg class="ui-icon" viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg> Tip para la Trivia:</span> ${q.tip || "Identifica la palabra clave en el enunciado."}
          </div>
        </article>
      `;
    }).join("");
  }
}

