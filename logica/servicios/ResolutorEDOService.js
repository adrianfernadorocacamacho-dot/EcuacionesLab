/**
 * DOMAIN / LÓGICA - SERVICIO RESOLUTOR DE EDOs
 * Solvers analíticos y numéricos puros (DDD). Cero dependencias con el DOM.
 */

import { Punto2D, PasoSolucion } from "../modelos/Ecuacion.js";

export class ResolutorEDOService {
  /**
   * Resuelve analíticamente familias clave de EDOs cuando se opera offline o sin backend
   */
  resolverAnalitico({ tipo = "exp", a = 2, b = 4, x0 = 0, y0 = 1, y1 = 0 }) {
    let titulo = "";
    let eqLatex = "";
    let answerLatex = "";
    let pasos = [];
    let puntos = [];

    if (tipo === "exp") {
      titulo = "Crecimiento / Decaimiento Exponencial";
      eqLatex = `\\frac{dy}{dx} = ${a}y`;
      const C = Number((y0 / Math.exp(a * x0)).toFixed(3));
      answerLatex = `y(x) = ${C}\\,e^{${a}x}`;
      pasos = [
        new PasoSolucion(1, "Identificación de Variables y Forma Estándar", `Ecuación diferencial de variables separables:\n\n\\frac{dy}{dx} = ${a}y`),
        new PasoSolucion(2, "Clasificación de la Ecuación", "Ecuación Diferencial Ordinaria (EDO) de 1er Orden homogénea lineal."),
        new PasoSolucion(3, "Separación de Variables", `Dividimos entre y y multiplicamos por dx para aislar variables:\n\n\\frac{dy}{y} = ${a}\\,dx`),
        new PasoSolucion(4, "Integración de Ambos Miembros", `Integramos ambos lados de la igualdad:\n\n\\int \\frac{dy}{y} = \\int ${a}\\,dx \\implies \\ln|y| = ${a}x + c`),
        new PasoSolucion(5, "Despeje Exponencial y Solución General", `Aplicamos la función exponencial e^(·) y renombramos e^c como C:\n\ny(x) = C\\,e^{${a}x}`),
        new PasoSolucion(6, "Aplicación del Problema de Valor Inicial (PVI)", `Sustituimos la condición inicial y(${x0}) = ${y0}:\n\n${y0} = C\\,e^{${a}(${x0})} \\implies C = ${C}`),
        new PasoSolucion(7, "Solución Particular Única", `Reemplazando el valor de la constante hallada:\n\n${answerLatex}`)
      ];
      for (let x = 0; x <= 5; x += 0.05) {
        puntos.push(new Punto2D(x, C * Math.exp(a * x)));
      }
    } else if (tipo === "cooling") {
      titulo = "Ley de Enfriamiento de Newton";
      eqLatex = `\\frac{dy}{dx} = -${a}(y - ${b})`;
      const C = y0 - b;
      answerLatex = `y(x) = ${b} + (${C})\\,e^{-${a}x}`;
      pasos = [
        new PasoSolucion(1, "Identificación del Modelo Térmico", `La tasa de cambio de temperatura es proporcional a la diferencia con el ambiente (Ta = ${b}°C):\n\n\\frac{dy}{dx} = -${a}(y - ${b})`),
        new PasoSolucion(2, "Clasificación de la Ecuación", "EDO de 1er Orden separable con asíntota horizontal hacia la temperatura ambiente."),
        new PasoSolucion(3, "Separación de Variables", `Dividimos entre (y - ${b}) y multiplicamos por dx:\n\n\\frac{dy}{y - ${b}} = -${a}\\,dx`),
        new PasoSolucion(4, "Integración Indefinida", `Integramos ambos miembros:\n\n\\int \\frac{dy}{y - ${b}} = \\int -${a}\\,dx \\implies \\ln|y - ${b}| = -${a}x + c`),
        new PasoSolucion(5, "Solución General de la Temperatura", `Despejamos la función y(x) aplicando exponenciales:\n\ny(x) = ${b} + C\\,e^{-${a}x}`),
        new PasoSolucion(6, "Aplicación de la Condición Inicial", `Evaluamos para y(0) = ${y0}°C para hallar la constante C:\n\n${y0} = ${b} + C \\implies C = ${C}`),
        new PasoSolucion(7, "Solución Particular de Enfriamiento", `Función exacta de la temperatura en el tiempo:\n\n${answerLatex}`)
      ];
      for (let x = 0; x <= 5; x += 0.05) {
        puntos.push(new Punto2D(x, b + C * Math.exp(-a * x)));
      }
    } else if (tipo === "linear") {
      titulo = "Ecuación Lineal de 1er Orden";
      eqLatex = `y' + ${a}y = ${b}`;
      const yp = a !== 0 ? b / a : 0;
      const C = y0 - yp;
      answerLatex = `y(x) = ${yp} + (${C})\\,e^{-${a}x}`;
      pasos = [
        new PasoSolucion(1, "Identificación de la Forma Canónica", `Ecuación lineal estándar y' + P(x)y = Q(x) con P(x) = ${a} y Q(x) = ${b}:\n\n\\frac{dy}{dx} + ${a}y = ${b}`),
        new PasoSolucion(2, "Cálculo del Factor Integrante μ(x)", `Calculamos el factor integrante μ(x) = e^(∫ ${a} dx):\n\n\\mu(x) = e^{${a}x}`),
        new PasoSolucion(3, "Multiplicación y Derivada del Producto", `Multiplicamos por μ(x) reconociendo la derivada del producto d/dx[μ·y]:\n\n\\frac{d}{dx}\\left[y \\cdot e^{${a}x}\\right] = ${b}e^{${a}x}`),
        new PasoSolucion(4, "Integración de Ambos Lados", `Integramos con respecto a x:\n\ny \\cdot e^{${a}x} = \\frac{${b}}{${a}}e^{${a}x} + C`),
        new PasoSolucion(5, "Solución General", `Dividimos entre el factor integrante e^(${a}x):\n\ny(x) = ${yp} + C\\,e^{-${a}x}`),
        new PasoSolucion(6, "Evaluación de la Condición Inicial", `Sustituyendo y(0) = ${y0}:\n\n${y0} = ${yp} + C \\implies C = ${C}`),
        new PasoSolucion(7, "Solución Particular Única", `Reemplazando el valor de la constante:\n\n${answerLatex}`)
      ];
      for (let x = 0; x <= 5; x += 0.05) {
        puntos.push(new Punto2D(x, yp + C * Math.exp(-a * x)));
      }
    } else if (tipo === "harmonic") {
      titulo = "Oscilador Armónico Libre (2º Orden)";
      eqLatex = `y'' + ${a}y = 0`;
      const w = Math.sqrt(Math.max(0.1, a));
      answerLatex = `y(x) = ${y0}\\cos(${w.toFixed(2)}x) + ${(y1/w).toFixed(2)}\\sin(${w.toFixed(2)}x)`;
      pasos = [
        new PasoSolucion(1, "Identificación del Oscilador de 2º Orden", `EDO lineal homogénea con coeficientes constantes que modela movimiento armónico:\n\n\\frac{d^2y}{dx^2} + ${a}y = 0`),
        new PasoSolucion(2, "Planteamiento de la Ecuación Característica", `Proponemos y = e^(rx). Sustituyendo obtenemos la ecuación cuadrática:\n\nr^2 + ${a} = 0`),
        new PasoSolucion(3, "Cálculo de Raíces Complejas Conjugadas", `Despejando r obtenemos raíces imaginarias:\n\nr = \\pm ${w.toFixed(2)}i`),
        new PasoSolucion(4, "Aplicación de la Fórmula de Euler y Solución General", `Las raíces imaginarias producen oscilaciones reales con senos y cosenos:\n\ny(x) = C_1\\cos(${w.toFixed(2)}x) + C_2\\sin(${w.toFixed(2)}x)`),
        new PasoSolucion(5, "Aplicación del PVI (Posición y Velocidad)", `Evaluando y(0) = ${y0} e y'(0) = ${y1}:\n\nC_1 = ${y0}, \\quad C_2 = ${(y1/w).toFixed(2)}`),
        new PasoSolucion(6, "Solución Particular Oscilatoria", `Trayectoria armónica exacta:\n\n${answerLatex}`)
      ];
      for (let x = 0; x <= 5; x += 0.05) {
        puntos.push(new Punto2D(x, y0 * Math.cos(w * x) + (y1 / w) * Math.sin(w * x)));
      }
    } else {
      // Tipo potencial
      titulo = "Ecuación Potencial";
      const pow = Math.floor(b) + 1;
      eqLatex = `y' = ${a}x^{${Math.floor(b)}}`;
      answerLatex = `y(x) = \\frac{${a}}{${pow}}x^{${pow}} + ${y0}`;
      pasos = [
        new PasoSolucion(1, "Identificación de Integración Directa", `La derivada solo depende de una potencia de x:\n\n\\frac{dy}{dx} = ${a}x^{${Math.floor(b)}}`),
        new PasoSolucion(2, "Separación de Diferenciales", `Multiplicamos por dx:\n\ndy = ${a}x^{${Math.floor(b)}}\\,dx`),
        new PasoSolucion(3, "Integración por Regla de la Potencia", `Aplicamos ∫ x^n dx = x^(n+1)/(n+1):\n\ny(x) = \\int ${a}x^{${Math.floor(b)}} dx = \\frac{${a}}{${pow}}x^{${pow}} + C`),
        new PasoSolucion(4, "Evaluación de Condición Inicial", `Evaluando y(0) = ${y0}:\n\nC = ${y0}`),
        new PasoSolucion(5, "Solución Particular", `Resultado final:\n\n${answerLatex}`)
      ];
      for (let x = 0; x <= 5; x += 0.05) {
        puntos.push(new Punto2D(x, (a / pow) * Math.pow(x, pow) + y0));
      }
    }

    return {
      equation_input: titulo,
      latex_eq: eqLatex,
      steps: pasos,
      latex_particular: answerLatex,
      plot_points: puntos
    };
  }

  /**
   * Método de Runge-Kutta de 4to Orden (RK4) puro
   */
  resolverRK4(f, x0, y0, xFin, h = 0.05) {
    const puntos = [new Punto2D(x0, y0)];
    let x = x0;
    let y = y0;
    while (x < xFin) {
      const k1 = f(x, y);
      const k2 = f(x + 0.5 * h, y + 0.5 * h * k1);
      const k3 = f(x + 0.5 * h, y + 0.5 * h * k2);
      const k4 = f(x + h, y + h * k3);
      y += (h / 6.0) * (k1 + 2 * k2 + 2 * k3 + k4);
      x += h;
      puntos.push(new Punto2D(x, y));
    }
    return puntos;
  }
}

