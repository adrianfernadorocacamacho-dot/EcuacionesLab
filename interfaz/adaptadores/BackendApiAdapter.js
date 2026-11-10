/**
 * INTERFAZ / ADAPTADORES - ADAPTADOR DE COMUNICACIÓN CON API REST FLASK
 * Infraestructura HTTP para consumir servicios de Python y SymPy (DDD)
 */

export class BackendApiAdapter {
  constructor() {
    this.estaConectado = false;
  }

  async verificarEstado() {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        this.estaConectado = true;
        return {
          online: true,
          pythonVersion: data.python_version,
          sympyVersion: data.sympy_version
        };
      }
    } catch (e) {
      // Servidor no disponible
    }
    this.estaConectado = false;
    return { online: false };
  }

  async resolverEcuacion(payload) {
    if (!this.estaConectado) return null;
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return { exito: true, data: await res.json() };
      } else {
        const errorData = await res.json().catch(() => ({}));
        return {
          exito: false,
          error: errorData.error || "Error al resolver la ecuación",
          detalles: errorData.detalles || "Verifica la sintaxis ingresada."
        };
      }
    } catch (e) {
      return null; // Fallback al motor de dominio cliente
    }
  }

  async obtenerPreguntas(cantidad = 10) {
    if (!this.estaConectado) return null;
    try {
      const res = await fetch(`/api/questions?count=${cantidad}`);
      if (res.ok) {
        const data = await res.json();
        return data.preguntas || null;
      }
    } catch (e) {}
    return null;
  }
}

