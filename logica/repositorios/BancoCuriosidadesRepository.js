/**
 * DOMAIN / LÓGICA - REPOSITORIO DE CURIOSIDADES
 * Colección de anécdotas e historias fascinantes de ecuaciones diferenciales (DDD)
 */

import { Curiosidad } from "../modelos/Curiosidad.js";

export class BancoCuriosidadesRepository {
  constructor() {
    this._datos = [
      new Curiosidad({
        id: "newton-leibniz",
        categoria: "historia",
        icono: "⚔️",
        titulo: "La Guerra de los Titanes: Newton vs. Leibniz",
        subtitulo: "¿De quién es el cálculo?",
        contenido: "Isaac Newton inventó su versión del cálculo usando 'fluxiones' para calcular el movimiento planetario, pero mantuvo sus notas en secreto. Gottfried Leibniz desarrolló la notación dy/dx e ∫ que usamos hoy. ¡La notación de Leibniz era tan clara que Europa continental avanzó más de 100 años más rápido en ecuaciones diferenciales que Inglaterra!",
        impacto: "Una buena notación matemática potencia el pensamiento humano."
      }),
      new Curiosidad({
        id: "braquistocrona",
        categoria: "historia",
        icono: "🦁",
        titulo: "El Reto de la Braquistócrona",
        subtitulo: "'Reconozco al león por sus garras'",
        contenido: "En 1696, Johann Bernoulli desafió a Europa a encontrar la curva donde una canica cae más rápido entre dos puntos. Newton lo resolvió en una sola noche anónimamente. Bernoulli exclamó: '¡Reconozco al león por sus garras!'. La solución era una cicloide y dio origen al Cálculo de Variaciones.",
        impacto: "Nacimiento del Cálculo de Variaciones y optimización de trayectorias."
      }),
      new Curiosidad({
        id: "tacoma-narrows",
        categoria: "mundo_real",
        icono: "🌉",
        titulo: "El Colapso del Puente de Tacoma Narrows",
        subtitulo: "Cuando una EDO hace temblar al mundo",
        contenido: "El 7 de noviembre de 1940, un viento moderado de 68 km/h generó vórtices periódicos que coincidieron con la frecuencia natural de torsión del puente. El fenómeno se modela matemáticamente con la EDO de segundo orden de un oscilador forzado.",
        impacto: "Las EDOs salvan vidas garantizando la estabilidad de puentes y rascacielos."
      }),
      new Curiosidad({
        id: "euler-ciego",
        categoria: "anecdotas",
        icono: "👁️",
        titulo: "Leonhard Euler: Calculando en la Oscuridad",
        subtitulo: "El cerebro más prolífico de la historia",
        contenido: "Euler perdió la vista de ambos ojos pero declaró con optimismo: 'Ahora tendré menos distracciones'. Dictó más de la mitad de su gigantesca producción científica estando ciego, e inventó el 'Método de Euler' para aproximar EDOs.",
        impacto: "Euler publicó más de 850 artículos científicos a lo largo de su vida."
      }),
      new Curiosidad({
        id: "carbono-14",
        categoria: "mundo_real",
        icono: "⏳",
        titulo: "El Reloj Atómico del Carbono-14",
        subtitulo: "Descifrando la edad de la historia",
        contenido: "Los seres vivos absorben Carbono-14 mientras viven. Al morir, este se desintegra según dN/dt = -λN, con vida media de 5,730 años. Willard Libby ganó el Nobel en 1960 gracias a esto, permitiendo datar fósiles prehistóricos.",
        impacto: "Una sola ecuación diferencial convirtió la arqueología en una ciencia exacta."
      }),
      new Curiosidad({
        id: "peces-adriatico",
        categoria: "mundo_real",
        icono: "🐟",
        titulo: "El Enigma de los Peces del Adriático",
        subtitulo: "Modelo Depredador-Presa de Lotka-Volterra",
        contenido: "Durante la 1ª Guerra Mundial cesó la pesca en el Adriático. Vito Volterra formuló un sistema de EDOs no lineales que demostró matemáticamente por qué suspender la pesca favorece más a los peces depredadores en la cima de la cadena alimenticia.",
        impacto: "Nacimiento de la biomatemática y gestión moderna de ecosistemas."
      }),
      new Curiosidad({
        id: "cafe-newton",
        categoria: "mundo_real",
        icono: "☕",
        titulo: "¿Cuándo ponerle leche al café caliente?",
        subtitulo: "El truco térmico de la Ley de Enfriamiento",
        contenido: "Según dT/dt = -k(T - Ta), el calor se disipa más rápido cuanto mayor es la diferencia térmica con el aire. Si pones la leche fría de inmediato, reduces el salto térmico y el café se enfriará mucho más despacio en los siguientes minutos.",
        impacto: "Física térmica cotidiana gobernada por una ecuación diferencial separable."
      }),
      new Curiosidad({
        id: "videojuegos-rk4",
        categoria: "tecnologia",
        icono: "🎮",
        titulo: "Los Saltos en Videojuegos y Runge-Kutta",
        subtitulo: "La física detrás de tus juegos favoritos",
        contenido: "En cada fotograma (60 o 120 FPS), los motores gráficos integran las EDOs de Newton de la cinemática. El método de Runge-Kutta 4 (RK4) y Verlet calculan trayectorias sin acumular error, evitando que las físicas 'rompan' el juego.",
        impacto: "Base computacional de la simulación de fluidos, telas y gravedad en 3D."
      }),
      new Curiosidad({
        id: "soldados-puente",
        categoria: "historia",
        icono: "🥾",
        titulo: "¡Rompan el Paso! La Orden Militar del Siglo XIX",
        subtitulo: "Por qué los soldados no marchan en los puentes",
        contenido: "En 1831 colapsó el puente de Broughton cuando 74 soldados marchaban al unísono. Sus pasos entraron en resonancia con la solución armónica del puente. Desde entonces, existe la orden militar internacional obligatoria de romper el paso.",
        impacto: "La resonancia mecánica explicada por raíces complejas en EDOs de segundo orden."
      }),
      new Curiosidad({
        id: "farmacocinetica",
        categoria: "mundo_real",
        icono: "💊",
        titulo: "Farmacocinética: ¿Cada cuántas horas medicar?",
        subtitulo: "La química en tu cuerpo es una EDO",
        contenido: "La concentración de un fármaco en sangre sigue la ecuación dC/dt = ka*Dose - ke*C. Los médicos usan esta ecuación diferencial para calcular la dosis exacta y evitar toxicidad manteniendo el efecto terapéutico.",
        impacto: "Cálculo de regímenes de quimioterapia y tratamientos con antibióticos."
      }),
      new Curiosidad({
        id: "poincare-caos",
        categoria: "historia",
        icono: "🦋",
        titulo: "Henri Poincaré y el Efecto Mariposa",
        subtitulo: "El límite de lo predecible",
        contenido: "Al estudiar las EDOs del Problema de los Tres Cuerpos, Poincaré descubrió que variaciones infinitesimales en condiciones iniciales causan trayectorias caóticas impredecibles. De ahí nació la Teoría del Caos.",
        impacto: "Explicación matemática de por qué el pronóstico del clima a largo plazo es imposible."
      }),
      new Curiosidad({
        id: "epidemiologia-sir",
        categoria: "mundo_real",
        icono: "🦠",
        titulo: "El Modelo SIR y la Inmunidad de Rebaño",
        subtitulo: "Kermack y McKendrick en 1927",
        contenido: "El modelo divide a la población en Susceptibles, Infectados y Recuperados mediante 3 EDOs acopladas. Demostró que no es necesario vacunar al 100% de la población para erradicar una epidemia, sino superar el umbral crítico.",
        impacto: "Pilar esencial de las políticas de salud pública y vacunación mundial."
      })
    ];
  }

  obtenerTodas() {
    return [...this._datos];
  }

  obtenerPorCategoria(categoria) {
    if (!categoria || categoria === "todas") return this.obtenerTodas();
    return this._datos.filter(c => c.categoria === categoria);
  }

  obtenerAleatoria() {
    const idx = Math.floor(Math.random() * this._datos.length);
    return this._datos[idx];
  }
}

