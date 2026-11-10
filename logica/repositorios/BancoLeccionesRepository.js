/**
 * DOMAIN / LÓGICA - REPOSITORIO DE LECCIONES TEÓRICAS
 * Contenido conceptual para el módulo didáctico de EDOs (DDD)
 */

import { Leccion } from "../modelos/Leccion.js";

export class BancoLeccionesRepository {
  constructor() {
    this._lecciones = {
      concepto: new Leccion({
        clave: "concepto",
        title: "¿Qué es una ecuación diferencial?",
        intro: "Es una ecuación matemática que establece una relación entre una función incógnita y una o más de sus derivadas respecto a sus variables independientes.",
        formula: "\\frac{dy}{dx} = f(x, y)",
        a: "Variable dependiente: y",
        ap: "Representa la magnitud que evoluciona o se transforma en el tiempo o espacio (ejemplo: población, temperatura, posición).",
        b: "Variable independiente: x o t",
        bp: "La variable de referencia respecto a la cual se mide la tasa de cambio (habitualmente el tiempo t o la posición x).",
        end: "Ejemplo clásico: y' = 2y indica que la tasa instantánea de crecimiento de una magnitud es exactamente el doble de su valor actual."
      }),
      clasificacion: new Leccion({
        clave: "clasificacion",
        title: "Orden, Grado y Linealidad",
        intro: "Clasificar correctamente una ecuación es el primer paso indispensable para elegir el método de resolución apropiado.",
        formula: "a_n(x)\\frac{d^n y}{dx^n} + \\dots + a_1(x)\\frac{dy}{dx} + a_0(x)y = g(x)",
        a: "Orden y Grado",
        ap: "El orden es la derivada más alta que aparece en la ecuación (ej: y'' es orden 2). El grado es la potencia entera a la que está elevada dicha derivada de mayor orden.",
        b: "Linealidad",
        bp: "Es lineal si la incógnita 'y' y todas sus derivadas tienen exponente 1, no se multiplican entre sí ni están dentro de funciones no lineales como sen(y) o e^y.",
        end: "Las ecuaciones diferenciales también se dividen en Ordinarias (EDO, una sola variable independiente) y en Derivadas Parciales (EDP, dos o más variables independientes)."
      }),
      metodos: new Leccion({
        clave: "metodos",
        title: "Métodos Analíticos Principales",
        intro: "Dependiendo de la estructura algebraica de la ecuación, existen diferentes caminos analíticos de resolución.",
        formula: "\\text{Variables Separables} \\;\\cdot\\; \\text{Factor Integrante} \\;\\cdot\\; \\text{Ecuaciones Exactas}",
        a: "Variables Separables",
        ap: "Se aplica cuando g(y) dy = f(x) dx permite agrupar todas las 'y' en un lado y las 'x' en el otro para luego integrar ambos miembros.",
        b: "Factor Integrante μ(x)",
        bp: "Para la forma estándar y' + P(x)y = Q(x), se multiplica por μ(x) = exp(∫ P(x) dx) convirtiendo el lado izquierdo en la derivada del producto d/dx [μ(x)y].",
        end: "Otras técnicas incluyen el método de coeficientes indeterminados, variación de parámetros, transformada de Laplace y métodos numéricos como Euler y Runge-Kutta."
      }),
      segundo_orden: new Leccion({
        clave: "segundo_orden",
        title: "Ecuaciones de 2º Orden y Oscilaciones",
        intro: "Fundamentales en física e ingeniería para describir ondas, circuitos RLC y sistemas mecánicos oscilatorios.",
        formula: "m\\,y'' + c\\,y' + k\\,y = 0 \\implies r = \\frac{-c \\pm \\sqrt{c^2 - 4mk}}{2m}",
        a: "Ecuación Característica",
        ap: "Al proponer y = e^(rx), se obtiene la ecuación algebraica ar² + br + c = 0. La naturaleza de sus raíces (reales distintas, reales repetidas o complejas) define el comportamiento.",
        b: "Regímenes de Amortiguamiento",
        bp: "Subamortiguado (oscila decreciendo), Crítico (retorna al equilibrio en el menor tiempo sin oscilar) y Sobreamortiguado (retorno lento).",
        end: "¡El colapso de puentes y la amortiguación de vehículos se diseñan calculando estas tres soluciones!"
      })
    };
  }

  obtenerPorClave(clave) {
    return this._lecciones[clave] || null;
  }

  obtenerTodas() {
    return Object.values(this._lecciones);
  }
}

