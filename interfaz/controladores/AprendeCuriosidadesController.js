/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DE APRENDE Y CURIOSIDADES
 * Módulo didáctico interactivo, guía de estudio y tirada de dados (DDD)
 */

import { KatexAdapter } from "../adaptadores/KatexAdapter.js";

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
      if (icon) icon.textContent = c.icono;
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
          <span class="curiosity-card-icon">${c.icono}</span>
          <div class="curiosity-card-meta">
            <h4>${c.titulo}</h4>
            <small>${c.subtitulo}</small>
          </div>
        </div>
        <div class="curiosity-card-body">
          <p>${c.contenido}</p>
        </div>
        <div class="curiosity-impact">
          <span>✦ Impacto:</span> ${c.impacto}
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
          <span style="font-size:32px;">${c.icono}</span>
          <div>
            <h4 style="margin:0; font:700 16px 'Space Grotesk',sans-serif; color:#fff;">${c.titulo}</h4>
            <span style="font-size:11px; color:var(--blue); font-weight:600;">${c.subtitulo}</span>
          </div>
        </div>
        <p style="font-size:12px; line-height:1.7; color:#9cb5ce; margin:0 0 10px;">${c.contenido}</p>
        <div style="font-size:11px; color:var(--mint); font-weight:600;">💡 ${c.impacto}</div>
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
          <span style="font-size:36px;">🔍</span>
          <h3 style="margin:10px 0 6px; color:#fff;">No se encontraron preguntas con ese término</h3>
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
              <span>✓</span> RESPUESTA CORRECTA:
            </div>
            <div class="study-answer-text">${respuestaCorrecta}</div>
          </div>
          <div class="study-explanation">
            <strong>Por qué es correcta:</strong> ${q.explicacion}
          </div>
          <div class="study-tip">
            <span>💡 Tip para la Trivia:</span> ${q.tip || "Identifica la palabra clave en el enunciado."}
          </div>
        </article>
      `;
    }).join("");
  }
}

