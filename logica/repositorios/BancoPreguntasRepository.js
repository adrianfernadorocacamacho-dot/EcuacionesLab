/**
 * DOMAIN / LÓGICA - REPOSITORIO DE PREGUNTAS DE TRIVIA
 * Colección de 32 preguntas clasificadas por categoría y nivel (DDD)
 */

import { PreguntaTrivia } from "../modelos/Trivia.js";

const RAW_PREGUNTAS = [
  {
    id: 1,
    pregunta: "¿Qué define a una Ecuación Diferencial Ordinaria (EDO)?",
    opciones: [
      "Una ecuación que relaciona una función incógnita de una sola variable con sus derivadas",
      "Una ecuación que solo contiene números enteros y sumas algebraicas",
      "Una ecuación geométrica que describe únicamente líneas rectas",
      "Una función polinómica que no admite derivadas ni integrales"
    ],
    correcta: 0,
    categoria: "Conceptos Básicos",
    dificultad: "facil",
    explicacion: "Una EDO relaciona una función incógnita y(x) con sus derivadas respecto a una sola variable independiente.",
    tip: "EDO = una sola variable independiente (como x o t). Si tiene varias (como x e y), se llama EDP."
  },
  {
    id: 2,
    pregunta: "¿Cuál es el orden de la ecuación: y''' + 5(y')⁴ - 2y = cos(x)?",
    opciones: [
      "Tercer orden",
      "Cuarto orden",
      "Primer orden",
      "Segundo orden"
    ],
    correcta: 0,
    categoria: "Clasificación",
    dificultad: "facil",
    explicacion: "El orden viene dado por la mayor derivada presente. Aquí la mayor derivada es y''' (orden 3).",
    tip: "Cuenta cuántas comillas tiene la mayor derivada. y''' tiene 3 comillas = orden 3."
  },
  {
    id: 3,
    pregunta: "¿Cuál es el grado de la ecuación diferencial: (y'')³ + 4(y')⁵ - y = 0?",
    opciones: [
      "Grado 3",
      "Grado 5",
      "Grado 2",
      "Grado 1"
    ],
    correcta: 0,
    categoria: "Clasificación",
    dificultad: "medio",
    explicacion: "El grado es el exponente algebraico de la derivada de mayor orden (y'' tiene exponente 3).",
    tip: "¡Cuidado! El orden lo da y'', y su potencia es 3. El grado es 3, no 5."
  },
  {
    id: 4,
    pregunta: "¿Por qué la ecuación y' + sin(y) = x se clasifica como NO lineal?",
    opciones: [
      "Porque la variable dependiente 'y' está dentro de la función trigonométrica no lineal seno",
      "Porque tiene la variable x en el lado derecho",
      "Porque tiene una derivada de primer orden",
      "Porque carece de coeficiente constante"
    ],
    correcta: 0,
    categoria: "Clasificación",
    dificultad: "medio",
    explicacion: "Es lineal si y y sus derivadas aparecen con exponente 1 y nunca dentro de funciones trigonométricas o exponenciales.",
    tip: "Si la incógnita 'y' está atrapada dentro de sen(y), cos(y) o e^y, la EDO es automáticamente NO lineal."
  },
  {
    id: 5,
    pregunta: "¿Cuál es la solución general de la ecuación de crecimiento continuo: dy/dx = k·y?",
    opciones: [
      "y(x) = C · e^(kx)",
      "y(x) = k·x + C",
      "y(x) = C · sin(kx)",
      "y(x) = C · x^k"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "facil",
    explicacion: "Separando variables: dy/y = k dx. Integrando ambos miembros: ln|y| = kx + C, por lo que y = C e^(kx).",
    tip: "Derivada proporcional a la función actual = siempre da una exponencial C·e^(kx)."
  },
  {
    id: 6,
    pregunta: "En la EDO lineal y' + P(x)y = Q(x), ¿cómo se calcula el factor integrante μ(x)?",
    opciones: [
      "μ(x) = e^(∫ P(x) dx)",
      "μ(x) = ∫ Q(x) dx",
      "μ(x) = ln|P(x)|",
      "μ(x) = 1 / P(x)"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "medio",
    explicacion: "El factor integrante μ(x) = exp(∫ P dx) convierte el miembro izquierdo en la derivada del producto d/dx[μ(x)y].",
    tip: "Fórmula de Euler: e elevado a la integral del coeficiente P(x) de la y."
  },
  {
    id: 7,
    pregunta: "¿Qué representa geométricamente una 'condición inicial' como y(0) = 4?",
    opciones: [
      "Fija un punto específico (0, 4) por el que debe pasar la curva de la solución particular",
      "Indica que la pendiente siempre vale 4",
      "Significa que la ecuación no tiene constantes de integración",
      "Obliga a que la función sea periódica"
    ],
    correcta: 0,
    categoria: "Conceptos Básicos",
    dificultad: "facil",
    explicacion: "La condición inicial selecciona la única curva particular que pasa por las coordenadas (0, 4).",
    tip: "Es como una coordenada GPS (x0, y0) que fija una única curva entre infinitas posibles."
  },
  {
    id: 8,
    pregunta: "Según la Ley de Enfriamiento de Newton dT/dt = -k(T - Ta), ¿qué ocurre cuando T = Ta?",
    opciones: [
      "dT/dt = 0, el objeto alcanza el equilibrio térmico con el entorno",
      "El objeto explota debido a la sobrepresión",
      "La tasa de enfriamiento se vuelve infinita",
      "La temperatura comienza a aumentar sin límite"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "facil",
    explicacion: "Cuando T = Ta, la diferencia es cero y no hay transferencia neta de calor (dT/dt = 0).",
    tip: "Si el objeto tiene la misma temperatura que la habitación, ya no se enfría ni se calienta."
  },
  {
    id: 9,
    pregunta: "¿Cuál de las siguientes ecuaciones es de VARIABLES SEPARABLES?",
    opciones: [
      "dy/dx = (x² + 1) · (y - 3)",
      "dy/dx = x + y",
      "dy/dx = sin(x + y)",
      "y' + x²·y² = x + y"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "medio",
    explicacion: "dy/dx = (x² + 1)(y - 3) permite pasar (y - 3) dividiendo a la izquierda dy/(y - 3) = (x² + 1)dx.",
    tip: "Si puedes factorizar dy = f(x) · g(y) dx como multiplicación, es separable."
  },
  {
    id: 10,
    pregunta: "Si la ecuación característica ay'' + by' + cy = 0 tiene raíces complejas r = α ± βi, ¿qué forma tiene la solución?",
    opciones: [
      "y(x) = e^(αx) · [C1 cos(βx) + C2 sin(βx)]",
      "y(x) = C1 e^(αx) + C2 e^(βx)",
      "y(x) = (C1 + C2 x) · e^(αx)",
      "y(x) = C1 ln(αx) + C2 ln(βx)"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "avanzado",
    explicacion: "Por la fórmula de Euler, las raíces complejas generan ondas trigonométricas senos y cosenos moduladas por e^(αx).",
    tip: "Parte imaginaria i siempre genera cosenos y senos (oscilaciones)."
  },
  {
    id: 11,
    pregunta: "¿Qué causó el colapso del puente de Tacoma Narrows en 1940?",
    opciones: [
      "Resonancia aeroelástica: la frecuencia del viento coincidió con la frecuencia natural de torsión",
      "Un terremoto que superó la resistencia del concreto",
      "Corrosión química en los cables de acero principales",
      "Sobrepeso por tráfico vehicular excesivo"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "facil",
    explicacion: "Los vórtices del viento coincidieron con la frecuencia natural del puente, un fenómeno predicho por osciladores forzados.",
    tip: "Vórtices de viento + frecuencia propia = Resonancia destructiva de segundo orden."
  },
  {
    id: 12,
    pregunta: "¿Cuál es la vida media del Carbono-14 usada en la datación arqueológica basada en dN/dt = -λN?",
    opciones: [
      "Aproximadamente 5,730 años",
      "Aproximadamente 100 años",
      "Aproximadamente 1 millón de años",
      "Aproximadamente 24 horas"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "medio",
    explicacion: "La vida media del C-14 es 5,730 años, lo que permite datar restos orgánicos de hasta 50,000 años.",
    tip: "Aprende el número: 5,730 años para que el Carbono-14 se reduzca a la mitad."
  },
  {
    id: 13,
    pregunta: "¿Quién introdujo la notación diferencial 'dy/dx' y el símbolo integral '∫'?",
    opciones: [
      "Gottfried Wilhelm Leibniz",
      "Isaac Newton",
      "René Descartes",
      "Arquímedes de Siracusa"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "facil",
    explicacion: "Leibniz introdujo 'd' por diferencial y '∫' por summa, facilitando el desarrollo del cálculo en Europa.",
    tip: "Leibniz = dy/dx e integral alargada. Newton = notación con puntos (ẋ, ẏ)."
  },
  {
    id: 14,
    pregunta: "En el modelo epidemiológico SIR, ¿qué representan las letras S, I, R?",
    opciones: [
      "Susceptibles, Infectados y Recuperados",
      "Sanos, Inmunes y Reinfectados",
      "Síntomas, Inflamación y Respuesta",
      "Seguros, Incógnitos y Riesgosos"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "facil",
    explicacion: "Kermack y McKendrick definieron: S = Susceptibles, I = Infectados y R = Recuperados/Inmunes.",
    tip: "S = sanos en riesgo (Susceptibles), I = con el virus (Infectados), R = curados (Recuperados)."
  },
  {
    id: 15,
    pregunta: "¿Qué matemático famoso resolvió el reto de la braquistócrona anónimamente en una noche?",
    opciones: [
      "Isaac Newton",
      "Albert Einstein",
      "Carl Friedrich Gauss",
      "Alan Turing"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "medio",
    explicacion: "Newton resolvió la EDO de la braquistócrona en una sola noche y Bernoulli lo reconoció de inmediato diciendo 'reconozco al león por sus garras'.",
    tip: "Newton lo resolvió tras llegar de la Real Casa de la Moneda en 12 horas."
  },
  {
    id: 16,
    pregunta: "En un circuito eléctrico en serie RL, la ecuación L·(di/dt) + R·i = E(t) es:",
    opciones: [
      "Una EDO lineal de primer orden para la corriente i(t)",
      "Una ecuación no lineal de segundo orden",
      "Una ecuación algebraica que no depende del tiempo",
      "Una ecuación en derivadas parciales"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "facil",
    explicacion: "Por la segunda ley de Kirchhoff, la caída de tensión en el inductor (L di/dt) más la del resistor (Ri) iguala la fem E(t).",
    tip: "Tiene di/dt (primera derivada) y la incógnita 'i' no tiene potencias -> Lineal de 1er orden."
  },
  {
    id: 17,
    pregunta: "Si y' = 3y con la condición inicial y(0) = 4, ¿cuál es la solución particular exacta?",
    opciones: [
      "y(x) = 4 · e^(3x)",
      "y(x) = 3 · e^(4x)",
      "y(x) = 12x + 4",
      "y(x) = e^(3x) + 4"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "facil",
    explicacion: "La solución general es y(x) = C e^(3x). Evaluando x=0: y(0) = C = 4 -> y(x) = 4 e^(3x).",
    tip: "El valor y(0) se convierte directamente en el coeficiente que multiplica a la exponencial."
  },
  {
    id: 18,
    pregunta: "¿Por qué los ejércitos tienen la orden estricta de 'romper el paso' al cruzar cualquier puente?",
    opciones: [
      "Para evitar que la frecuencia de sus pisadas coincida con la frecuencia de resonancia del puente",
      "Para no desgastar las suelas de las botas militares",
      "Para evitar hacer ruido innecesario que alerte a tropas enemigas",
      "Porque los puentes están resbaladizos por el agua"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "facil",
    explicacion: "En 1831 colapsó el puente de Broughton por el paso sincronizado de soldados. Romper el paso evita la resonancia destructiva.",
    tip: "Pisadas sincronizadas = fuerza periódica que puede igualar la frecuencia natural del puente."
  },
  {
    id: 19,
    pregunta: "¿Qué condición en un oscilador amortiguado y'' + 2γy' + ω₀²y = 0 define el 'AMORTIGUAMIENTO CRÍTICO'?",
    opciones: [
      "γ² = ω₀² (las raíces características son reales e iguales)",
      "γ² < ω₀² (hay oscilaciones subamortiguadas)",
      "γ² > ω₀² (retorno muy lento sobreamortiguado)",
      "γ = 0 (no hay nada de fricción)"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "avanzado",
    explicacion: "El amortiguamiento crítico ocurre cuando γ = ω₀. Es el retorno más rápido posible al equilibrio sin oscilar.",
    tip: "Crítico = equilibrio perfecto (γ = ω0), retorno ultrarrápido sin tambaleo."
  },
  {
    id: 20,
    pregunta: "Al resolver la ecuación dy/dx = 3x² con condición inicial y(0) = 5, se obtiene:",
    opciones: [
      "y(x) = x³ + 5",
      "y(x) = 6x + 5",
      "y(x) = 3x³ + 5",
      "y(x) = x³ / 3 + 5"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "facil",
    explicacion: "Integrando: y = ∫ 3x² dx = x³ + C. Con y(0) = 5, tenemos C = 5 -> y = x³ + 5.",
    tip: "La integral de 3x² es x³, y sumas la constante inicial C = 5."
  },
  {
    id: 21,
    pregunta: "¿Por qué los motores de videojuegos usan Runge-Kutta 4 (RK4) frente al método de Euler?",
    opciones: [
      "Porque RK4 acumula muchísimo menos error numérico y mantiene estables las físicas",
      "Porque Euler requiere más de 128 GB de memoria RAM",
      "Porque RK4 solo funciona en dos dimensiones",
      "Porque Euler solo calcula números negativos"
    ],
    correcta: 0,
    categoria: "Tecnología",
    dificultad: "medio",
    explicacion: "Euler tiene error local O(h²), mientras que RK4 tiene orden O(h⁵), otorgando estabilidad a físicas 3D.",
    tip: "RK4 evalúa 4 pendientes intermedias por paso, reduciendo el error drásticamente."
  },
  {
    id: 22,
    pregunta: "Si una función satisface y'(x) = 0 para todo x real, ¿qué forma tiene y(x)?",
    opciones: [
      "y(x) = Constante",
      "y(x) = x",
      "y(x) = e^x",
      "y(x) = sin(x)"
    ],
    correcta: 0,
    categoria: "Conceptos Básicos",
    dificultad: "facil",
    explicacion: "Si la tasa de cambio de una función es siempre cero, la función no varía; por lo tanto, es una función constante y(x) = C.",
    tip: "Derivada cero = recta horizontal sin inclinación = constante."
  },
  {
    id: 23,
    pregunta: "En farmacocinética, la tasa de eliminación renal de la mayoría de fármacos es proporcional a la concentración actual. ¿Qué modelo es?",
    opciones: [
      "Cinética de primer orden: dC/dt = -k·C",
      "Cinética de grado cero: dC/dt = k·C³",
      "Ecuación trigonométrica de cuarto orden",
      "Ecuación logarítmica sin derivada"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "medio",
    explicacion: "La eliminación típica en el cuerpo sigue una cinética lineal de 1er orden dC/dt = -kC, generando decaimiento exponencial.",
    tip: "Eliminación proporcional a la cantidad presente = cinética de primer orden."
  },
  {
    id: 24,
    pregunta: "¿Qué descubrió Henri Poincaré al estudiar la EDO del Problema de los Tres Cuerpos?",
    opciones: [
      "Que pequeñas diferencias en las condiciones iniciales causan trayectorias caóticas impredecibles (Teoría del Caos)",
      "Que la gravedad no existe en el espacio exterior",
      "Que la Luna gira en sentido contrario a la Tierra",
      "Que todas las órbitas planetarias son cuadrados perfectos"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "medio",
    explicacion: "Poincaré descubrió la sensibilidad extrema a las condiciones iniciales, sembrando las bases de la Teoría del Caos.",
    tip: "Sensibilidad a condiciones iniciales = Efecto mariposa = Teoría del Caos."
  },
  {
    id: 25,
    pregunta: "¿Cuál es la ecuación diferencial que describe las oscilaciones de una cuerda de violín o guitarra?",
    opciones: [
      "La ecuación de onda: ∂²u/∂t² = c² · ∂²u/∂x²",
      "La ley de Ohm estática: V = I · R",
      "La ecuación de Bernoulli para fluidos ideales",
      "La ley de gravitación universal de Newton"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "medio",
    explicacion: "La ecuación de onda en derivadas parciales describe la vibración de cuerdas y ondas sonoras.",
    tip: "Vibración de cuerdas e instrumentos musicales = Ecuación de Onda."
  },
  {
    id: 26,
    pregunta: "Si una solución general es y = C1 cos(2x) + C2 sin(2x), ¿cuál es el período T de la oscilación?",
    opciones: [
      "T = π",
      "T = 2π",
      "T = π / 2",
      "T = 4π"
    ],
    correcta: 0,
    categoria: "Conceptos Básicos",
    dificultad: "avanzado",
    explicacion: "La frecuencia angular es ω = 2 rad/s. El período se calcula como T = 2π / ω = 2π / 2 = π.",
    tip: "Fórmula de período: T = 2π / ω. Aquí ω = 2, por eso 2π / 2 = π."
  },
  {
    id: 27,
    pregunta: "¿Qué físico y matemático formuló la primera ley matemática del enfriamiento de los cuerpos?",
    opciones: [
      "Isaac Newton",
      "Albert Einstein",
      "James Clerk Maxwell",
      "Galileo Galilei"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "facil",
    explicacion: "Sir Isaac Newton publicó en 1701 su famosa ley empírica de enfriamiento conductivo y convectivo.",
    tip: "Sir Isaac Newton formuló dT/dt = -k(T - Ta)."
  },
  {
    id: 28,
    pregunta: "Si un modelo biológico incluye 'capacidad de carga' límite M, ¿cómo se llama la ecuación dP/dt = rP(1 - P/M)?",
    opciones: [
      "Ecuación Logística de Verhulst",
      "Ecuación de Navier-Stokes",
      "Ecuación de Schrödinger",
      "Ecuación de Maxwell"
    ],
    correcta: 0,
    categoria: "Aplicaciones",
    dificultad: "medio",
    explicacion: "Pierre François Verhulst propuso la ecuación logística en 1838 para modelar el crecimiento que se frena con recursos finitos.",
    tip: "Crecimiento con freno o asíntota máxima M = Modelo Logístico de Verhulst."
  },
  {
    id: 29,
    pregunta: "¿Cuál es la derivada segunda respecto a x de la función y(x) = sin(3x)?",
    opciones: [
      "-9 · sin(3x)",
      "9 · cos(3x)",
      "-3 · cos(3x)",
      "6 · sin(3x)"
    ],
    correcta: 0,
    categoria: "Conceptos Básicos",
    dificultad: "facil",
    explicacion: "Primera derivada: y' = 3 cos(3x). Segunda derivada: y'' = 3 · (-3 sin(3x)) = -9 sin(3x).",
    tip: "Regla de la cadena dos veces: 3 sale dos veces al cuadrado (3² = 9) y la derivada del seno dos veces cambia de signo a negativo."
  },
  {
    id: 30,
    pregunta: "En el modelo depredador-presa de Lotka-Volterra, ¿qué ocurre si cesa temporalmente la pesca?",
    opciones: [
      "Aumentan proporcionalmente los peces depredadores respecto a las presas",
      "Se extinguen de inmediato los depredadores",
      "Las presas se convierten en carnívoras",
      "Las poblaciones se congelan en un valor constante"
    ],
    correcta: 0,
    categoria: "Curiosidades",
    dificultad: "medio",
    explicacion: "Como descubrió Vito Volterra en el Adriático, suspender la pesca beneficia más a los depredadores en el ciclo de EDOs.",
    tip: "Menos pesca = más alimento para depredadores = aumenta el ratio de depredadores."
  },
  {
    id: 31,
    pregunta: "¿Cuál es la fórmula del Método de Euler para avanzar del punto (x_n, y_n) al siguiente paso?",
    opciones: [
      "y_(n+1) = y_n + h · f(x_n, y_n)",
      "y_(n+1) = y_n · h + f(x_n, y_n)",
      "y_(n+1) = y_n + h² / 2",
      "y_(n+1) = f(x_n + h, y_n + h)"
    ],
    correcta: 0,
    categoria: "Métodos",
    dificultad: "medio",
    explicacion: "El método de Euler utiliza la aproximación lineal: nuevo_y = viejo_y + (paso h) × (pendiente en el punto).",
    tip: "y_{nuevo} = y_{viejo} + h * f(x, y)."
  },
  {
    id: 32,
    pregunta: "¿Qué representa el campo de direcciones (o de pendientes) de una EDO y' = f(x, y)?",
    opciones: [
      "Una cuadrícula en el plano con pequeños segmentos que muestran la pendiente f(x,y) en cada punto",
      "Un mapa que indica el norte magnético",
      "Un gráfico que solo existe para ecuaciones de orden 5",
      "Una espiral de números complejos"
    ],
    correcta: 0,
    categoria: "Conceptos Básicos",
    dificultad: "facil",
    explicacion: "El campo de direcciones dibuja segmentos con inclinación m = f(x,y) por donde fluyen las curvas de solución.",
    tip: "Visualízalo como pequeñas flechas de corriente que guían la trayectoria de la curva solución."
  }
];

export class BancoPreguntasRepository {
  constructor() {
    this._preguntas = RAW_PREGUNTAS.map(p => new PreguntaTrivia(p));
  }

  obtenerTodas() {
    return [...this._preguntas];
  }

  obtenerPorId(id) {
    return this._preguntas.find(p => p.id === Number(id));
  }

  obtenerPorCategoria(categoria) {
    if (!categoria || categoria === "todas") return this.obtenerTodas();
    return this._preguntas.filter(p => p.categoria.toLowerCase().includes(categoria.toLowerCase()));
  }

  obtenerMuestraAleatoria(cantidad = 10) {
    const barajadas = [...this._preguntas].sort(() => 0.5 - Math.random());
    return barajadas.slice(0, cantidad);
  }

  buscar(termino) {
    if (!termino) return this.obtenerTodas();
    const q = termino.trim().toLowerCase();
    return this._preguntas.filter(p =>
      p.pregunta.toLowerCase().includes(q) ||
      p.opciones[p.correcta].toLowerCase().includes(q) ||
      p.explicacion.toLowerCase().includes(q) ||
      (p.tip && p.tip.toLowerCase().includes(q))
    );
  }
}
