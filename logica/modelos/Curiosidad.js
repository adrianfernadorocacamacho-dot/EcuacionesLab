/**
 * DOMAIN / LÓGICA - MODELO DE CURIOSIDADES
 * Value Object para datos históricos y aplicaciones fascinantes (DDD)
 */

export class Curiosidad {
  constructor({ id, categoria, icono, titulo, subtitulo, contenido, impacto }) {
    this.id = id;
    this.categoria = categoria; // "historia", "mundo_real", "anecdotas", "tecnologia"
    this.icono = icono;
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.contenido = contenido;
    this.impacto = impacto;
    Object.freeze(this);
  }
}

