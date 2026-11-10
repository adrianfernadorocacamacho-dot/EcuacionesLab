/**
 * DOMAIN / LÓGICA - REPOSITORIO DE FORMULARIOS OFICIALES
 * Metadatos de láminas HD de derivadas, integrales y ecuaciones diferenciales para impresión (DDD)
 */

import { LaminaFormulario } from "../modelos/Formulario.js";

export class BancoFormulariosRepository {
  constructor() {
    this._laminas = {
      derivadas: new LaminaFormulario({
        clave: "derivadas",
        titulo: "Tabla de Derivadas",
        nombreLamina: "Lámina Oficial: TABLA DE DERIVADAS",
        imagen: "tabla_derivadas.jpg",
        nombreDescarga: "DiferencialLab_Tabla_Derivadas.jpg",
        formulasCount: 32
      }),
      integrales: new LaminaFormulario({
        clave: "integrales",
        titulo: "Tabla de Integrales",
        nombreLamina: "Lámina Oficial: TABLA DE INTEGRALES",
        imagen: "tabla_integrales.jpg",
        nombreDescarga: "DiferencialLab_Tabla_Integrales.jpg",
        formulasCount: 53
      }),
      edo1: new LaminaFormulario({
        clave: "edo1",
        titulo: "Formulario EDO: Separables y Homogéneas",
        nombreLamina: "Lámina Oficial: FORMULARIO DE EDOs (Pág. 1 - Sustituciones y Clasificación)",
        imagen: "tabla_edo_p1.jpg",
        nombreDescarga: "DiferencialLab_Formulario_EDO_Parte1.jpg",
        formulasCount: 15
      }),
      edo2: new LaminaFormulario({
        clave: "edo2",
        titulo: "Formulario EDO: Exactas y Factor Integrante",
        nombreLamina: "Lámina Oficial: FORMULARIO DE EDOs (Pág. 2 - Exactitud y Factor Integrante)",
        imagen: "tabla_edo_p2.jpg",
        nombreDescarga: "DiferencialLab_Formulario_EDO_Parte2.jpg",
        formulasCount: 18
      })
    };
  }

  obtenerPorClave(clave) {
    return this._laminas[clave] || null;
  }

  obtenerTodas() {
    return Object.values(this._laminas);
  }
}
