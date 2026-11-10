/**
 * DOMAIN / LÓGICA - MODELO DE ECUACIÓN DIFERENCIAL
 * Value Objects y Entidades para representar EDOs y sus soluciones (DDD)
 */

export class CondicionInicial {
  constructor(x0 = 0, y0 = 1, y1 = 0) {
    this.x0 = Number(x0) || 0;
    this.y0 = Number(y0) || 1;
    this.y1 = Number(y1) || 0;
    Object.freeze(this);
  }
}

export class Punto2D {
  constructor(x, y) {
    this.x = Number(Number(x).toFixed(2));
    this.y = Number(Number(y).toFixed(3));
    Object.freeze(this);
  }
}

export class PasoSolucion {
  constructor(num, titulo, descripcion) {
    this.num = Number(num);
    this.titulo = String(titulo);
    this.descripcion = String(descripcion);
    Object.freeze(this);
  }
}

export class EcuacionDiferencial {
  constructor({
    tipo = "exp",
    params = {},
    condicionInicial = new CondicionInicial(),
    expresionLibre = ""
  } = {}) {
    this.tipo = tipo; // "exp", "cooling", "linear", "harmonic", "power", "custom"
    this.params = { ...params };
    this.condicionInicial = condicionInicial;
    this.expresionLibre = expresionLibre;
    Object.freeze(this);
  }
}

