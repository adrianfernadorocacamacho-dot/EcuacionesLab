/**
 * DOMAIN / LÓGICA - MODELO DE FORMULARIOS OFICIALES
 * Value Object para láminas matemáticas oficiales imprimibles (DDD)
 */

export class LaminaFormulario {
  constructor({ clave, titulo, nombreLamina, imagen, nombreDescarga, formulasCount }) {
    this.clave = clave;
    this.titulo = titulo;
    this.nombreLamina = nombreLamina;
    this.imagen = imagen;
    this.nombreDescarga = nombreDescarga;
    this.formulasCount = formulasCount;
    Object.freeze(this);
  }
}

