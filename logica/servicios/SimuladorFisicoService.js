/**
 * DOMAIN / LÓGICA - SERVICIO DE SIMULACIÓN FÍSICA
 * Modelos dinámicos físicos y matemáticos puros (DDD)
 */

import { Punto2D } from "../modelos/Ecuacion.js";

export class SimuladorFisicoService {
  /**
   * Genera curva de decaimiento o crecimiento exponencial y(t) = y0 * e^(kt)
   */
  simularExponencial(k, y0, tMax = 5, paso = 0.05) {
    const puntos = [];
    for (let t = 0; t <= tMax; t += paso) {
      puntos.push(new Punto2D(t, y0 * Math.exp(k * t)));
    }
    return puntos;
  }

  /**
   * Genera curva de enfriamiento térmico T(t) = Ta + (T0 - Ta) * e^(-kt)
   */
  simularEnfriamiento(k, T0, Ta, tMax = 60, paso = 0.5) {
    const puntos = [];
    for (let t = 0; t <= tMax; t += paso) {
      const T = Ta + (T0 - Ta) * Math.exp(-k * t);
      puntos.push(new Punto2D(t, T));
    }
    return puntos;
  }

  /**
   * Genera curva de oscilador armónico amortiguado:
   * y'' + 2*gamma*y' + omega0^2*y = 0
   */
  simularOsciladorAmortiguado(gamma, omega0, y0, tMax = 12, paso = 0.05) {
    const puntos = [];
    const omega2 = omega0 * omega0;
    const gamma2 = gamma * gamma;

    if (gamma2 < omega2) {
      // Subamortiguado
      const wd = Math.sqrt(omega2 - gamma2);
      for (let t = 0; t <= tMax; t += paso) {
        const envolvente = Math.exp(-gamma * t);
        const y = y0 * envolvente * (Math.cos(wd * t) + (gamma / wd) * Math.sin(wd * t));
        puntos.push(new Punto2D(t, y));
      }
    } else if (Math.abs(gamma2 - omega2) < 0.001) {
      // Amortiguamiento crítico
      for (let t = 0; t <= tMax; t += paso) {
        const y = y0 * (1 + gamma * t) * Math.exp(-gamma * t);
        puntos.push(new Punto2D(t, y));
      }
    } else {
      // Sobreamortiguado
      const r1 = -gamma + Math.sqrt(gamma2 - omega2);
      const r2 = -gamma - Math.sqrt(gamma2 - omega2);
      const c1 = (y0 * r2) / (r2 - r1);
      const c2 = y0 - c1;
      for (let t = 0; t <= tMax; t += paso) {
        const y = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
        puntos.push(new Punto2D(t, y));
      }
    }
    return puntos;
  }

  /**
   * Calcula el campo de pendientes para una grilla (x, y)
   */
  calcularCampoPendientes(tipo, k, xRango = [-4, 4], yRango = [-4, 4], paso = 0.5) {
    const segmentos = [];
    const fMap = {
      exp: (x, y) => k * y,
      osc: (x, y) => -k * x,
      poly: (x, y) => x - y
    };
    const f = fMap[tipo] || fMap.exp;

    for (let x = xRango[0]; x <= xRango[1]; x += paso) {
      for (let y = yRango[0]; y <= yRango[1]; y += paso) {
        const pendiente = f(x, y);
        segmentos.push({
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          pendiente: Number(pendiente.toFixed(3))
        });
      }
    }
    return segmentos;
  }
}

