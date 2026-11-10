"""
Banco de preguntas para la Trivia interactiva de DiferencialLab.
"""

BANCO_PREGUNTAS = [
    {
        "id": 1,
        "pregunta": "¿Qué es una Ecuación Diferencial Ordinaria (EDO)?",
        "opciones": [
            "Una ecuación que relaciona una función desconocida de una sola variable con sus derivadas",
            "Una ecuación que solo contiene números enteros y sumas algebraicas",
            "Una ecuación geométrica que describe únicamente líneas rectas",
            "Una función polinómica que no admite derivadas ni integrales"
        ],
        "correcta": 0,
        "categoria": "conceptos",
        "dificultad": "facil",
        "explicacion": "Una EDO relaciona una función incógnita y(x) de una sola variable independiente x con una o más de sus derivadas respecto a dicha variable."
    },
    {
        "id": 2,
        "pregunta": "¿Cuál es el orden de la ecuación: y''' + 5(y')⁴ - 2y = cos(x)?",
        "opciones": [
            "Tercer orden",
            "Cuarto orden",
            "Primer orden",
            "Segundo orden"
        ],
        "correcta": 0,
        "categoria": "clasificacion",
        "dificultad": "facil",
        "explicacion": "El orden de una ecuación diferencial viene dado por la derivada de mayor jerarquía presente en la ecuación. Aquí la mayor derivada es y''' (tercera derivada), por lo que el orden es 3."
    },
    {
        "id": 3,
        "pregunta": "¿Cuál es el grado de la ecuación diferencial: (y'')³ + 4(y')⁵ - y = 0?",
        "opciones": [
            "Grado 3",
            "Grado 5",
            "Grado 2",
            "Grado 1"
        ],
        "correcta": 0,
        "categoria": "clasificacion",
        "dificultad": "medio",
        "explicacion": "El grado es el exponente algebraico al que está elevada la derivada de mayor orden. La mayor derivada es y'' y su exponente es 3, por lo tanto el grado es 3."
    },
    {
        "id": 4,
        "pregunta": "¿Por qué la ecuación y' + sin(y) = x se clasifica como NO lineal?",
        "opciones": [
            "Porque la variable dependiente 'y' está dentro de una función no lineal (el seno)",
            "Porque tiene la variable x elevada al cuadrado",
            "Porque tiene una derivada de primer orden",
            "Porque no tiene término constante independiente"
        ],
        "correcta": 0,
        "categoria": "clasificacion",
        "dificultad": "medio",
        "explicacion": "Una EDO es lineal solo si la variable dependiente 'y' y todas sus derivadas aparecen con exponente 1 y no están dentro de funciones trigonométricas, exponenciales o multiplicadas entre sí."
    },
    {
        "id": 5,
        "pregunta": "¿Cuál es la solución general de la ecuación de crecimiento continuo: dy/dx = k·y?",
        "opciones": [
            "y(x) = C · e^(kx)",
            "y(x) = k·x + C",
            "y(x) = C · sin(kx)",
            "y(x) = C · x^k"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "facil",
        "explicacion": "Separando variables: dy/y = k dx. Integrando ambos miembros: ln|y| = kx + C1, lo que al despejar produce y(x) = C · e^(kx)."
    },
    {
        "id": 6,
        "pregunta": "En la ecuación lineal de 1er orden y' + P(x)y = Q(x), ¿cómo se calcula el factor integrante μ(x)?",
        "opciones": [
            "μ(x) = e^(∫ P(x) dx)",
            "μ(x) = ∫ Q(x) dx",
            "μ(x) = ln|P(x)|",
            "μ(x) = 1 / P(x)"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "medio",
        "explicacion": "El factor integrante de Euler se define como μ(x) = exp(∫ P(x) dx), el cual transforma el lado izquierdo en la derivada del producto d/dx [μ(x) · y]."
    },
    {
        "id": 7,
        "pregunta": "¿Qué representa geométricamente una 'condición inicial' como y(0) = 4?",
        "opciones": [
            "Fija un punto específico (0, 4) por el que debe pasar la curva de la solución particular",
            "Indica que la pendiente de la recta tangente siempre vale 4",
            "Significa que la ecuación carece de constante de integración",
            "Obliga a que la función sea periódica"
        ],
        "correcta": 0,
        "categoria": "conceptos",
        "dificultad": "facil",
        "explicacion": "La solución general representa una familia infinita de curvas. La condición inicial y(x0) = y0 selecciona la única curva particular que pasa por el punto (x0, y0)."
    },
    {
        "id": 8,
        "pregunta": "Según la Ley de Enfriamiento de Newton dT/dt = -k(T - Ta), ¿qué ocurre cuando T = Ta?",
        "opciones": [
            "dT/dt = 0, el objeto alcanza el equilibrio térmico con el entorno",
            "El objeto explota debido a la sobrepresión",
            "La tasa de enfriamiento se vuelve infinita",
            "La temperatura comienza a aumentar sin límite"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "facil",
        "explicacion": "Cuando la temperatura del objeto T iguala la temperatura ambiente Ta, la diferencia (T - Ta) es cero, por lo que dT/dt = 0 y el sistema queda en equilibrio térmico."
    },
    {
        "id": 9,
        "pregunta": "¿Cuál de las siguientes ecuaciones diferenciales es de VARIABLES SEPARABLES?",
        "opciones": [
            "dy/dx = (x² + 1) · (y - 3)",
            "dy/dx = x + y",
            "dy/dx = sin(x + y)",
            "y' + x²·y² = x + y"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "medio",
        "explicacion": "dy/dx = (x² + 1)·(y - 3) permite reagrupar todos los términos con 'y' a la izquierda dy/(y - 3) y todos los términos con 'x' a la derecha (x² + 1)dx."
    },
    {
        "id": 10,
        "pregunta": "Si la ecuación característica de ay'' + by' + cy = 0 tiene raíces complejas conjugadas r = α ± βi, ¿qué forma tiene la solución?",
        "opciones": [
            "y(x) = e^(αx) · [C1 cos(βx) + C2 sin(βx)]",
            "y(x) = C1 e^(αx) + C2 e^(βx)",
            "y(x) = (C1 + C2 x) · e^(αx)",
            "y(x) = C1 ln(αx) + C2 ln(βx)"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "avanzado",
        "explicacion": "Por la fórmula de Euler e^(iθ) = cos(θ) + i sin(θ), las raíces complejas dan lugar a soluciones oscilatorias moduladas por una exponencial e^(αx)."
    },
    {
        "id": 11,
        "pregunta": "¿Qué causó el colapso del puente de Tacoma Narrows en 1940 desde el punto de vista de las EDOs?",
        "opciones": [
            "Resonancia aeroelástica: la frecuencia del viento coincidió con la frecuencia natural de torsión",
            "Un terremoto que superó la resistencia máxima del concreto",
            "Corrosión química en los cables de acero principales",
            "Sobrepeso debido al tráfico vehicular excesivo"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "facil",
        "explicacion": "El viento generó vórtices periódicos cuya frecuencia coincidió con la frecuencia natural del puente, un fenómeno predicho por la ecuación de oscilador con excitación periódica."
    },
    {
        "id": 12,
        "pregunta": "¿Cuál es la vida media del Carbono-14 usada en la datación arqueológica basada en dN/dt = -λN?",
        "opciones": [
            "Aproximadamente 5,730 años",
            "Aproximadamente 100 años",
            "Aproximadamente 1 millón de años",
            "Aproximadamente 24 horas"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "medio",
        "explicacion": "El Carbono-14 tiene una vida media de 5,730 ± 40 años, lo que permite datar restos orgánicos de hasta 50,000 años de antigüedad con gran precisión."
    },
    {
        "id": 13,
        "pregunta": "En el modelo depredador-presa de Lotka-Volterra, si se suspende temporalmente la pesca, ¿qué ocurre con los depredadores?",
        "opciones": [
            "Aumentan proporcionalmente respecto a las presas",
            "Se extinguen de inmediato por falta de alimento",
            "Se transforman en herbívoros",
            "Su población permanece exactamente constante"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "medio",
        "explicacion": "Como descubrió Vito Volterra en el mar Adriático, reducir la pesca beneficia proporcionalmente más al depredador que a la presa en el ciclo de EDOs."
    },
    {
        "id": 14,
        "pregunta": "¿Cuál es la fórmula del Método de Euler para avanzar del punto (x_n, y_n) al siguiente paso?",
        "opciones": [
            "y_(n+1) = y_n + h · f(x_n, y_n)",
            "y_(n+1) = y_n · h + f(x_n, y_n)",
            "y_(n+1) = y_n + h² / 2",
            "y_(n+1) = f(x_n + h, y_n + h)"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "medio",
        "explicacion": "El método de Euler utiliza la aproximación de la recta tangente: nuevo_y = viejo_y + (paso h) × (pendiente en el punto actual)."
    },
    {
        "id": 15,
        "pregunta": "¿Qué es un 'campo de direcciones' o campo de pendientes de una EDO y' = f(x, y)?",
        "opciones": [
            "Una cuadrícula en el plano con pequeños segmentos que muestran la pendiente f(x,y) en cada punto",
            "Un mapa geográfico que muestra hacia dónde corre el agua",
            "Un diagrama que solo sirve para ecuaciones diferenciales de orden superior a 5",
            "Un conjunto de números imaginarios dispuestos en espiral"
        ],
        "correcta": 0,
        "categoria": "conceptos",
        "dificultad": "facil",
        "explicacion": "El campo de direcciones dibuja pequeñas líneas tangentes con inclinación m = f(x,y). Las curvas de solución fluyen suavemente siguiendo estas flechas."
    },
    {
        "id": 16,
        "pregunta": "En un circuito eléctrico en serie RL, la ecuación L·(di/dt) + R·i = E(t) es:",
        "opciones": [
            "Una EDO lineal de primer orden para la corriente i(t)",
            "Una ecuación no lineal de segundo orden",
            "Una ecuación algebraica que no depende del tiempo",
            "Una ecuación en derivadas parciales"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "facil",
        "explicacion": "Por la segunda ley de Kirchhoff, la caída de tensión en el inductor (L di/dt) más la del resistor (Ri) iguala la fuerza electromotriz E(t), formando una EDO lineal de 1er orden."
    },
    {
        "id": 17,
        "pregunta": "¿Quién introdujo la notación diferencial 'dy/dx' y el símbolo integral '∫' que utilizamos hoy?",
        "opciones": [
            "Gottfried Wilhelm Leibniz",
            "Isaac Newton",
            "René Descartes",
            "Arquímedes de Siracusa"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "facil",
        "explicacion": "Gottfried Leibniz introdujo 'd' por diferencial y '∫' como una 'S' alargada de 'summa'. Su notación facilitó enormemente el desarrollo del cálculo moderno."
    },
    {
        "id": 18,
        "pregunta": "Si y' = 3y con la condición inicial y(0) = 4, ¿cuál es la solución particular exacta?",
        "opciones": [
            "y(x) = 4 · e^(3x)",
            "y(x) = 3 · e^(4x)",
            "y(x) = 12x + 4",
            "y(x) = e^(3x) + 4"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "facil",
        "explicacion": "La solución general es y(x) = C e^(3x). Sustituyendo x = 0: y(0) = C e^0 = C = 4. Por lo tanto, y(x) = 4 e^(3x)."
    },
    {
        "id": 19,
        "pregunta": "¿Por qué los ejércitos tienen la orden estricta de 'romper el paso' al cruzar cualquier puente?",
        "opciones": [
            "Para evitar que la frecuencia de sus pisadas coincida con la frecuencia de resonancia del puente",
            "Para no desgastar las suelas de las botas militares",
            "Para evitar hacer ruido innecesario que alerte a tropas enemigas",
            "Porque los puentes están resbaladizos por el agua"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "facil",
        "explicacion": "En 1831 colapsó el puente de Broughton por el paso sincronizado de soldados. Romper el paso evita la resonancia destructiva modelada por EDOs de oscilación forzada."
    },
    {
        "id": 20,
        "pregunta": "En el modelo epidemiológico SIR, ¿qué representan las letras S, I, R?",
        "opciones": [
            "Susceptibles, Infectados y Recuperados",
            "Sanos, Inmunes y Reinfectados",
            "Síntomas, Inflamación y Respuesta",
            "Seguros, Incógnitos y Riesgosos"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "facil",
        "explicacion": "Kermack y McKendrick definieron: S = Susceptibles al contagio, I = Individuos Infectados y R = Recuperados (o inmunes/fallecidos)."
    },
    {
        "id": 21,
        "pregunta": "¿Qué condición en un oscilador amortiguado y'' + 2γy' + ω₀²y = 0 define el 'AMORTIGUAMIENTO CRÍTICO'?",
        "opciones": [
            "γ² = ω₀² (las raíces características son reales e iguales)",
            "γ² < ω₀² (hay oscilaciones subamortiguadas)",
            "γ² > ω₀² (retorno muy lento sobreamortiguado)",
            "γ = 0 (no hay nada de fricción)"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "avanzado",
        "explicacion": "El amortiguamiento crítico ocurre cuando γ = ω₀. Es el retorno más rápido posible al punto de equilibrio sin producir ninguna oscilación (usado en amortiguadores de autos y puertas de edificios)."
    },
    {
        "id": 22,
        "pregunta": "¿Qué matemático resolvió el problema de la Braquistócrona anónimamente en una noche?",
        "opciones": [
            "Isaac Newton",
            "Albert Einstein",
            "Carl Friedrich Gauss",
            "Alan Turing"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "medio",
        "explicacion": "Newton recibió el reto enviado por Johann Bernoulli y resolvió la ecuación diferencial antes del amanecer. Bernoulli lo reconoció de inmediato diciendo 'reconozco al león por sus garras'."
    },
    {
        "id": 23,
        "pregunta": "Al resolver la ecuación dy/dx = 3x² con condición inicial y(0) = 5, se obtiene:",
        "opciones": [
            "y(x) = x³ + 5",
            "y(x) = 6x + 5",
            "y(x) = 3x³ + 5",
            "y(x) = x³ / 3 + 5"
        ],
        "correcta": 0,
        "categoria": "metodos",
        "dificultad": "facil",
        "explicacion": "Integrando: y = ∫ 3x² dx = x³ + C. Con y(0) = 5, tenemos C = 5, dando la solución particular y(x) = x³ + 5."
    },
    {
        "id": 24,
        "pregunta": "¿Por qué los motores de videojuegos prefieren métodos como Runge-Kutta 4 (RK4) frente al método de Euler?",
        "opciones": [
            "Porque RK4 acumula muchísimo menos error numérico y mantiene estables las órbitas y colisiones",
            "Porque Euler requiere tarjetas gráficas con más de 128 GB de memoria RAM",
            "Porque RK4 solo funciona para gráficos en 2D",
            "Porque Euler solo calcula números negativos"
        ],
        "correcta": 0,
        "categoria": "tecnologia",
        "dificultad": "medio",
        "explicacion": "El método de Euler tiene un error local de orden O(h²), lo que hace que los planetas o vehículos 'se salgan de órbita' rápidamente. RK4 tiene orden O(h⁵), ofreciendo una precisión y estabilidad extraordinarias."
    },
    {
        "id": 25,
        "pregunta": "Si una función satisface y'(x) = 0 para todo x real, ¿qué forma tiene y(x)?",
        "opciones": [
            "y(x) = Constante",
            "y(x) = x",
            "y(x) = e^x",
            "y(x) = sin(x)"
        ],
        "correcta": 0,
        "categoria": "conceptos",
        "dificultad": "facil",
        "explicacion": "Si la tasa de cambio de una función es siempre cero, la función no varía; por lo tanto, es una función constante y(x) = C."
    },
    {
        "id": 26,
        "pregunta": "En farmacocinética, la tasa de eliminación renal de la mayoría de fármacos es proporcional a la concentración actual. ¿Qué modelo de EDO es?",
        "opciones": [
            "Cinética de primer orden: dC/dt = -k·C",
            "Cinética de grado cero: dC/dt = k·C³",
            "Ecuación trigonométrica de cuarto orden",
            "Ecuación logarítmica sin derivada"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "medio",
        "explicacion": "La eliminación típica en el cuerpo humano sigue una cinética lineal de 1er orden dC/dt = -k·C, lo que genera un decaimiento exponencial de la sustancia en sangre."
    },
    {
        "id": 27,
        "pregunta": "¿Qué descubrió Henri Poincaré al estudiar la EDO del Problema de los Tres Cuerpos?",
        "opciones": [
            "Que pequeñas diferencias en las condiciones iniciales causan trayectorias caóticas impredecibles (Teoría del Caos)",
            "Que la gravedad no existe en el espacio exterior",
            "Que la Luna gira en sentido contrario a la Tierra",
            "Que todas las órbitas planetarias son cuadrados perfectos"
        ],
        "correcta": 0,
        "categoria": "curiosidades",
        "dificultad": "medio",
        "explicacion": "Poincaré descubrió la sensibilidad extrema a las condiciones iniciales en sistemas dinámicos no lineales, sembrando los cimientos de la moderna Teoría del Caos."
    },
    {
        "id": 28,
        "pregunta": "¿Cuál es la ecuación diferencial que describe las oscilaciones de una cuerda de violín o guitarra?",
        "opciones": [
            "La ecuación de onda: ∂²u/∂t² = c² · ∂²u/∂x²",
            "La ley de Ohm estática: V = I · R",
            "La ecuación de Bernoulli para fluidos ideales",
            "La ley de gravitación universal de Newton"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "medio",
        "explicacion": "La ecuación de onda en derivadas parciales describe la vibración de cuerdas y ondas sonoras. Sus modos normales de vibración producen los armónicos musicales."
    },
    {
        "id": 29,
        "pregunta": "Si una solución general de una EDO de segundo orden es y = C1 cos(2x) + C2 sin(2x), ¿cuál es el período de la oscilación?",
        "opciones": [
            "T = π",
            "T = 2π",
            "T = π / 2",
            "T = 4π"
        ],
        "correcta": 0,
        "categoria": "conceptos",
        "dificultad": "avanzado",
        "explicacion": "La frecuencia angular es ω = 2 rad/s. El período se calcula como T = 2π / ω = 2π / 2 = π segundos."
    },
    {
        "id": 30,
        "pregunta": "¿Qué físico y matemático formuló la primera ley matemática del enfriamiento de los cuerpos?",
        "opciones": [
            "Isaac Newton",
            "Albert Einstein",
            "James Clerk Maxwell",
            "Galileo Galilei"
        ],
        "correcta": 0,
        "categoria": "historia",
        "dificultad": "facil",
        "explicacion": "Sir Isaac Newton publicó anónimamente en 1701 en las Philosophical Transactions su famosa ley empírica de enfriamiento conductivo y convectivo."
    },
    {
        "id": 31,
        "pregunta": "Si un modelo biológico de población incluye 'capacidad de carga' límite M, ¿cómo se llama la ecuación dP/dt = rP(1 - P/M)?",
        "opciones": [
            "Ecuación Logística de Verhulst",
            "Ecuación de Navier-Stokes",
            "Ecuación de Schrödinger",
            "Ecuación de Maxwell"
        ],
        "correcta": 0,
        "categoria": "aplicaciones",
        "dificultad": "medio",
        "explicacion": "Pierre François Verhulst propuso la ecuación logística en 1838 para modelar el crecimiento que se frena cuando los recursos del entorno se vuelven limitados."
    },
    {
        "id": 32,
        "pregunta": "¿Cuál es la derivada segunda respecto a x de la función y(x) = sin(3x)?",
        "opciones": [
            "-9 · sin(3x)",
            "9 · cos(3x)",
            "-3 · cos(3x)",
            "6 · sin(3x)"
        ],
        "correcta": 0,
        "categoria": "conceptos",
        "dificultad": "facil",
        "explicacion": "Primera derivada: y' = 3 cos(3x). Segunda derivada: y'' = 3 · (-3 sin(3x)) = -9 sin(3x). ¡Por eso cumple la EDO y'' + 9y = 0!"
    }
]
