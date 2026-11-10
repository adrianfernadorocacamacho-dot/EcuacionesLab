/**
 * DOMAIN / LÓGICA - MODELO DE LECCIONES TEÓRICAS
 * Value Object para los conceptos didácticos de EDOs (DDD)
 */

export class Leccion {
  constructor({ clave, title, intro, formula, a, ap, b, bp, end }) {
    this.clave = clave;
    this.title = title;
    this.intro = intro;
    this.formula = formula;
    this.a = a;
    this.ap = ap;
    this.b = b;
    this.bp = bp;
    this.end = end;
    Object.freeze(this);
  }
}

