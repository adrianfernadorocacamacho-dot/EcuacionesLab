/**
 * DOMAIN / LÓGICA - MODELO DE TRIVIA Y JUEGO
 * Entidades y Value Objects de la dinámica de aprendizaje gamificado (DDD)
 */

export class PreguntaTrivia {
  constructor({ id, pregunta, opciones, correcta, categoria, dificultad, explicacion, tip }) {
    this.id = id;
    this.pregunta = pregunta;
    this.opciones = Object.freeze([...opciones]);
    this.correcta = correcta;
    this.categoria = categoria;
    this.dificultad = dificultad; // "facil", "medio", "dificil"
    this.explicacion = explicacion;
    this.tip = tip || "";
    Object.freeze(this);
  }

  esRespuestaCorrecta(indiceOpcion) {
    return Number(indiceOpcion) === this.correcta;
  }
}

export class EstadoJuegoTrivia {
  constructor(modo = "desafio") {
    this.modo = modo; // "desafio", "supervivencia", "practica"
    this.puntaje = 0;
    this.rachaActual = 0;
    this.rachaMaxima = 0;
    this.vidas = modo === "supervivencia" ? 3 : Infinity;
    this.indicePreguntaActual = 0;
    this.preguntasRespondidas = 0;
    this.aciertos = 0;
    this.activo = true;
  }

  registrarAcierto(tiempoRestante = 0) {
    this.rachaActual++;
    if (this.rachaActual > this.rachaMaxima) {
      this.rachaMaxima = this.rachaActual;
    }
    this.aciertos++;
    this.preguntasRespondidas++;

    // Multiplicador de combo por racha
    let multiplicador = 1.0;
    if (this.rachaActual >= 5) multiplicador = 3.0;
    else if (this.rachaActual >= 3) multiplicador = 2.0;
    else if (this.rachaActual >= 2) multiplicador = 1.5;

    // Bonificación por velocidad en modo desafío
    const bonoTiempo = this.modo === "desafio" ? Math.max(0, tiempoRestante) * 5 : 0;
    const puntosObtenidos = Math.round((100 + bonoTiempo) * multiplicador);
    this.puntaje += puntosObtenidos;

    return {
      puntosObtenidos,
      multiplicador,
      nuevaRacha: this.rachaActual
    };
  }

  registrarFallo() {
    this.rachaActual = 0;
    this.preguntasRespondidas++;

    if (this.modo === "supervivencia") {
      this.vidas = Math.max(0, this.vidas - 1);
      if (this.vidas <= 0) {
        this.activo = false;
      }
    }

    return {
      vidasRestantes: this.vidas,
      sigueVivo: this.activo
    };
  }

  calcularPrecision() {
    if (this.preguntasRespondidas === 0) return 0;
    return Math.min(100, Math.round((this.aciertos / this.preguntasRespondidas) * 100));
  }
}

