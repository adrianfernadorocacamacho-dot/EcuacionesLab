/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DEL JUEGO DE TRIVIA
 * Gamificación interactiva, vidas, cronómetro y feedback en pantalla (DDD)
 */

export class TriviaController {
  constructor({ triviaService, backendApiAdapter, audioController }) {
    this.triviaService = triviaService;
    this.api = backendApiAdapter;
    this.audio = audioController;

    this.preguntas = [];
    this.indicePregunta = 0;
    this.respondidaActual = false;
    this.temporizadorInterval = null;
    this.segundosRestantes = 20;

    this.mejorPuntaje = Number(localStorage.getItem("dl_best_score")) || 0;
  }

  inicializar() {
    this._cargarMejorPuntaje();
    this._actualizarInsigniasUI();

    // Selección de modo de juego
    document.querySelectorAll(".game-mode-card").forEach(card => {
      card.addEventListener("click", () => {
        this.iniciarPartida(card.dataset.mode);
      });
    });

    // Botón siguiente pregunta
    document.getElementById("nextQuestion")?.addEventListener("click", () => {
      if (this.audio) this.audio.click();
      this.indicePregunta++;
      this.renderizarPreguntaActual();
    });

    // Salir del juego
    document.getElementById("btnExitGame")?.addEventListener("click", () => {
      clearInterval(this.temporizadorInterval);
      if (this.audio) this.audio.click();
      const gameArea = document.getElementById("activeGameArea");
      const modeSelection = document.getElementById("gameModeSelection");
      if (gameArea) gameArea.style.display = "none";
      if (modeSelection) modeSelection.style.display = "grid";
    });

    // Jugar de nuevo
    document.getElementById("btnPlayAgain")?.addEventListener("click", () => {
      const modo = this.triviaService.estadoActual?.modo || "desafio";
      this.iniciarPartida(modo);
    });

    // Volver a modos
    document.getElementById("btnBackToModes")?.addEventListener("click", () => {
      if (this.audio) this.audio.click();
      const resScreen = document.getElementById("gameResultScreen");
      const modeSelection = document.getElementById("gameModeSelection");
      if (resScreen) resScreen.style.display = "none";
      if (modeSelection) modeSelection.style.display = "grid";
    });
  }

  _cargarMejorPuntaje() {
    const elScore = document.getElementById("statBestScore");
    const elProgress = document.getElementById("progressScore");
    const elText = document.getElementById("progressText");
    if (elScore) elScore.textContent = this.mejorPuntaje;
    if (elProgress) elProgress.textContent = `${Math.min(100, Math.round(this.mejorPuntaje / 10))}%`;
    if (elText) elText.textContent = `Récord guardado: ${this.mejorPuntaje} pts`;
  }

  _actualizarInsigniasUI() {
    const logros = JSON.parse(localStorage.getItem("dl_achievements") || "[]");
    if (logros.includes("novato")) document.getElementById("badge-1")?.classList.replace("locked", "unlocked");
    if (logros.includes("racha")) document.getElementById("badge-2")?.classList.replace("locked", "unlocked");
    if (logros.includes("rayo")) document.getElementById("badge-3")?.classList.replace("locked", "unlocked");
    if (logros.includes("maestro")) document.getElementById("badge-4")?.classList.replace("locked", "unlocked");
  }

  _desbloquearLogro(id) {
    const logros = JSON.parse(localStorage.getItem("dl_achievements") || "[]");
    if (!logros.includes(id)) {
      logros.push(id);
      localStorage.setItem("dl_achievements", JSON.stringify(logros));
      this._actualizarInsigniasUI();
      if (this.audio) this.audio.celebrar();
    }
  }

  async iniciarPartida(modo) {
    if (this.audio) this.audio.click();

    const modeSelection = document.getElementById("gameModeSelection");
    const resScreen = document.getElementById("gameResultScreen");
    const activeGameArea = document.getElementById("activeGameArea");

    if (modeSelection) modeSelection.style.display = "none";
    if (resScreen) resScreen.style.display = "none";
    if (activeGameArea) activeGameArea.style.display = "grid";

    // Inicializar servicio de dominio
    const partida = this.triviaService.crearPartida(modo);
    this.preguntas = partida.preguntas;
    this.indicePregunta = 0;

    // Intentar obtener preguntas desde API de Python si está disponible
    if (this.api && this.api.estaConectado) {
      const preguntasApi = await this.api.obtenerPreguntas(modo === "desafio" ? 10 : 25);
      if (preguntasApi && preguntasApi.length > 0) {
        this.preguntas = preguntasApi;
      }
    }

    const quizScore = document.getElementById("quizScore");
    const curStreak = document.getElementById("statCurrentStreak");
    if (quizScore) quizScore.textContent = "0";
    if (curStreak) curStreak.textContent = "0";

    // Configurar HUD según modo
    const badge = document.getElementById("gameModeBadge");
    const livesDisplay = document.getElementById("livesDisplay");
    const timerArea = document.getElementById("hudTimerArea");

    if (modo === "supervivencia") {
      if (badge) badge.textContent = "MODO SUPERVIVENCIA";
      if (livesDisplay) livesDisplay.style.display = "flex";
      if (timerArea) timerArea.style.display = "none";
      this._actualizarVidasUI(3);
    } else if (modo === "practica") {
      if (badge) badge.textContent = "PRÁCTICA LIBRE";
      if (livesDisplay) livesDisplay.style.display = "none";
      if (timerArea) timerArea.style.display = "none";
    } else {
      if (badge) badge.textContent = "DESAFÍO EXPRÉS";
      if (livesDisplay) livesDisplay.style.display = "none";
      if (timerArea) timerArea.style.display = "flex";
    }

    this.renderizarPreguntaActual();
  }

  _actualizarVidasUI(vidas) {
    const corazones = document.querySelectorAll("#livesDisplay .heart");
    corazones.forEach((h, i) => {
      h.classList.toggle("lost", i >= vidas);
    });
  }

  renderizarPreguntaActual() {
    clearInterval(this.temporizadorInterval);
    this.respondidaActual = false;

    if (this.indicePregunta >= this.preguntas.length) {
      this.finalizarPartida(true);
      return;
    }

    const q = this.preguntas[this.indicePregunta];
    const counter = document.getElementById("quizCounter");
    const progress = document.getElementById("quizProgressBar");
    const cat = document.getElementById("questionCategory");
    const diff = document.getElementById("questionDifficulty");
    const txt = document.getElementById("questionText");
    const optionsContainer = document.getElementById("answerOptions");

    if (counter) counter.textContent = `PREGUNTA ${this.indicePregunta + 1} DE ${this.preguntas.length}`;
    if (progress) progress.style.width = `${(this.indicePregunta / this.preguntas.length) * 100}%`;
    if (cat) cat.textContent = q.categoria;
    if (diff) {
      diff.textContent = q.dificultad.toUpperCase();
      diff.className = `question-difficulty ${q.dificultad}`;
    }
    if (txt) txt.textContent = q.pregunta;

    if (optionsContainer) {
      optionsContainer.innerHTML = q.opciones.map((opt, i) => `
        <button class="answer-option" data-idx="${i}">
          <span class="option-letter">${String.fromCharCode(65 + i)}</span>
          <span>${opt}</span>
        </button>
      `).join("");

      optionsContainer.querySelectorAll(".answer-option").forEach(btn => {
        btn.addEventListener("click", () => this.responder(Number(btn.dataset.idx)));
      });
    }

    const feedback = document.getElementById("feedback");
    if (feedback) {
      feedback.style.display = "none";
      feedback.className = "feedback";
    }

    const nextBtn = document.getElementById("nextQuestion");
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = this.indicePregunta === this.preguntas.length - 1
        ? "Ver Resultados Finales"
        : "Siguiente pregunta →";
    }

    // Temporizador para modo desafío
    const modo = this.triviaService.estadoActual?.modo;
    if (modo === "desafio") {
      this.segundosRestantes = 20;
      const elTimer = document.getElementById("timerSeconds");
      if (elTimer) elTimer.textContent = "20s";
      this.temporizadorInterval = setInterval(() => {
        this.segundosRestantes--;
        if (elTimer) elTimer.textContent = `${this.segundosRestantes}s`;
        if (this.segundosRestantes <= 0) {
          clearInterval(this.temporizadorInterval);
          this.responder(-1); // Tiempo agotado
        }
      }, 1000);
    }
  }

  responder(indiceOpcion) {
    if (this.respondidaActual) return;
    this.respondidaActual = true;
    clearInterval(this.temporizadorInterval);

    const q = this.preguntas[this.indicePregunta];
    const resultado = this.triviaService.procesarRespuesta(q, indiceOpcion, this.segundosRestantes);

    const botones = document.querySelectorAll(".answer-option");
    botones.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correcta) b.classList.add("correct");
      if (i === indiceOpcion && !resultado.esCorrecta) b.classList.add("incorrect");
    });

    const feedback = document.getElementById("feedback");
    if (feedback) feedback.style.display = "block";

    const curStreak = document.getElementById("statCurrentStreak");
    const quizScore = document.getElementById("quizScore");
    const comboBadge = document.getElementById("comboBadge");
    const comboMult = document.getElementById("comboMultiplier");

    if (resultado.esCorrecta) {
      if (curStreak) curStreak.textContent = resultado.rachaActual;
      if (quizScore) quizScore.textContent = resultado.puntajeTotal;

      if (resultado.rachaActual >= 2) {
        if (comboBadge) comboBadge.style.display = "block";
        if (comboMult) comboMult.textContent = `x${resultado.multiplicador} COMBO`;
        if (this.audio) this.audio.racha();
      } else {
        if (this.audio) this.audio.correcto();
      }

      if (feedback) {
        feedback.className = "feedback good";
        feedback.innerHTML = `<strong>¡Excelente! Respuesta Correcta (+${resultado.puntosObtenidos} pts).</strong><br>${resultado.explicacion}`;
      }

      this._desbloquearLogro("novato");
      if (resultado.rachaActual >= 5) this._desbloquearLogro("racha");
      if (this.segundosRestantes >= 16) this._desbloquearLogro("rayo");
    } else {
      if (curStreak) curStreak.textContent = "0";
      if (comboBadge) comboBadge.style.display = "none";
      if (this.audio) this.audio.incorrecto();

      if (feedback) {
        feedback.className = "feedback bad";
        const msg = resultado.esTiempoAgotado ? "¡Tiempo agotado!" : "Respuesta incorrecta.";
        feedback.innerHTML = `<strong>${msg}</strong><br>${resultado.explicacion}`;
      }

      if (this.triviaService.estadoActual?.modo === "supervivencia") {
        this._actualizarVidasUI(resultado.vidasRestantes);
        if (!resultado.sigueVivo) {
          setTimeout(() => this.finalizarPartida(false), 1200);
          return;
        }
      }
    }

    const nextBtn = document.getElementById("nextQuestion");
    if (nextBtn) nextBtn.disabled = false;

    const progress = document.getElementById("quizProgressBar");
    if (progress) {
      progress.style.width = `${((this.indicePregunta + 1) / this.preguntas.length) * 100}%`;
    }
  }

  finalizarPartida() {
    clearInterval(this.temporizadorInterval);

    const activeGameArea = document.getElementById("activeGameArea");
    const resScreen = document.getElementById("gameResultScreen");
    if (activeGameArea) activeGameArea.style.display = "none";
    if (resScreen) resScreen.style.display = "block";

    const resumen = this.triviaService.obtenerResumenFinal();
    if (!resumen) return;

    if (resumen.puntaje > this.mejorPuntaje) {
      this.mejorPuntaje = resumen.puntaje;
      localStorage.setItem("dl_best_score", this.mejorPuntaje);
      this._cargarMejorPuntaje();
      const progressText = document.getElementById("progressText");
      if (progressText) progressText.textContent = `¡Nuevo récord: ${this.mejorPuntaje} pts!`;
    }

    const resScore = document.getElementById("resScore");
    const resCorrect = document.getElementById("resCorrect");
    const resMaxStreak = document.getElementById("resMaxStreak");
    const resAccuracy = document.getElementById("resAccuracy");
    const celebrationEmoji = document.getElementById("resultCelebrationEmoji");
    const resultTitle = document.getElementById("resultTitle");

    if (resScore) resScore.textContent = resumen.puntaje;
    if (resCorrect) resCorrect.textContent = `${resumen.aciertos} / ${resumen.total}`;
    if (resMaxStreak) resMaxStreak.textContent = resumen.rachaMaxima;
    if (resAccuracy) resAccuracy.textContent = `${resumen.precision}%`;

    if (resumen.esMaestro) {
      this._desbloquearLogro("maestro");
      if (this.audio) this.audio.celebrar();
      if (celebrationEmoji) celebrationEmoji.textContent = "🏆";
      if (resultTitle) resultTitle.textContent = "¡Dominio Magistral de EDOs!";
    } else {
      if (this.audio) this.audio.correcto();
      if (celebrationEmoji) celebrationEmoji.textContent = "🎉";
      if (resultTitle) resultTitle.textContent = "¡Buen Trabajo y Esfuerzo!";
    }
  }
}

