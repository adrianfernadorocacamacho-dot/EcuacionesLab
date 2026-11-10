/**
 * DOMAIN / LÓGICA - SERVICIO DE TRIVIA Y GAMIFICACIÓN
 * Lógica pura de evaluación, control de estados y puntuaciones (DDD)
 */

import { EstadoJuegoTrivia } from "../modelos/Trivia.js";

export class TriviaService {
  constructor(bancoRepository) {
    this.bancoRepo = bancoRepository;
    this.estadoActual = null;
  }

  crearPartida(modo = "desafio") {
    this.estadoActual = new EstadoJuegoTrivia(modo);
    const cantidad = modo === "desafio" ? 10 : 25;
    const preguntas = this.bancoRepo.obtenerMuestraAleatoria(cantidad);
    return {
      estado: this.estadoActual,
      preguntas: preguntas
    };
  }

  procesarRespuesta(pregunta, indiceOpcion, tiempoRestante = 0) {
    if (!this.estadoActual || !pregunta) return null;

    const esCorrecta = pregunta.esRespuestaCorrecta(indiceOpcion);

    if (esCorrecta) {
      const res = this.estadoActual.registrarAcierto(tiempoRestante);
      return {
        esCorrecta: true,
        puntosObtenidos: res.puntosObtenidos,
        multiplicador: res.multiplicador,
        rachaActual: res.nuevaRacha,
        puntajeTotal: this.estadoActual.puntaje,
        explicacion: pregunta.explicacion
      };
    } else {
      const res = this.estadoActual.registrarFallo();
      return {
        esCorrecta: false,
        puntosObtenidos: 0,
        multiplicador: 1.0,
        rachaActual: 0,
        puntajeTotal: this.estadoActual.puntaje,
        vidasRestantes: res.vidasRestantes,
        sigueVivo: res.sigueVivo,
        explicacion: pregunta.explicacion,
        esTiempoAgotado: indiceOpcion === -1
      };
    }
  }

  obtenerResumenFinal() {
    if (!this.estadoActual) return null;
    const precision = this.estadoActual.calcularPrecision();
    const esMaestro = precision >= 80;

    return {
      puntaje: this.estadoActual.puntaje,
      aciertos: this.estadoActual.aciertos,
      total: this.estadoActual.preguntasRespondidas,
      rachaMaxima: this.estadoActual.rachaMaxima,
      precision: precision,
      esMaestro: esMaestro
    };
  }
}

