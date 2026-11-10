/**
 * DOMAIN / LÓGICA - REPOSITORIO DE FORMULARIOS OFICIALES
 * Metadatos de láminas HD de derivadas e integrales para impresión (DDD)
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

