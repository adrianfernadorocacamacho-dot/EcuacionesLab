"""
Banco de curiosidades y anécdotas históricas sobre ecuaciones diferenciales.
"""

CURIOSIDADES = [
    {
        "id": "newton-leibniz",
        "categoria": "historia",
        "icono": "⚔️",
        "titulo": "La Guerra de los Titanes: Newton vs. Leibniz",
        "subtitulo": "¿De quién es el cálculo?",
        "contenido": "Isaac Newton inventó su versión del cálculo usando 'fluxiones' (derivadas con puntos como ẏ) para calcular el movimiento planetario, pero mantuvo sus notas en secreto. Gottfried Leibniz desarrolló de forma independiente el cálculo diferencial con la notación dy/dx e ∫ que usamos hoy en día. ¡La notación de Leibniz era tan clara y potente que Europa continental avanzó más de 100 años más rápido en ecuaciones diferenciales que Inglaterra!",
        "impacto": "La notación matemática no es solo estética: una buena notación potencia el pensamiento humano."
    },
    {
        "id": "braquistocrona",
        "categoria": "historia",
        "icono": "🦁",
        "titulo": "El Reto de la Braquistócrona",
        "subtitulo": "'Reconozco al león por sus garras'",
        "contenido": "En 1696, Johann Bernoulli desafió a todos los matemáticos de Europa a resolver un problema: ¿qué forma debe tener una rampa para que una canica ruede entre dos puntos en el menor tiempo posible? Newton, tras un agotador día de trabajo en la Real Casa de la Moneda, recibió el desafío a las 4:00 PM y a las 4:00 AM ya había resuelto la ecuación diferencial no lineal. Bernoulli recibió la solución anónima y dijo de inmediato: 'Ex ungue leonem' (Reconozco al león por sus garras). La solución no era una línea recta, sino una cicloide.",
        "impacto": "De este desafío nació una rama entera de las matemáticas: el Cálculo de Variaciones."
    },
    {
        "id": "tacoma-narrows",
        "categoria": "mundo_real",
        "icono": "🌉",
        "titulo": "El Colapso del Puente de Tacoma Narrows (1940)",
        "subtitulo": "Cuando una EDO hace temblar al mundo",
        "contenido": "El 7 de noviembre de 1940, con un viento de apenas 68 km/h, el puente colgante de Tacoma Narrows comenzó a retorcerse violentamente como una serpiente hasta partirse en pedazos. No fue derribado por la fuerza bruta del viento, sino por un fenómeno de resonancia aeroelástica: los vórtices del aire generaron una fuerza periódica que coincidió con la frecuencia natural de torsión del puente. Hoy en día, todo estudiante de ingeniería calcula la EDO de segundo orden my'' + cy' + ky = F(t) para garantizar que esto jamás vuelva a ocurrir.",
        "impacto": "Las ecuaciones diferenciales salvan vidas asegurando la estabilidad de puentes, rascacielos y aviones."
    },
    {
        "id": "euler-ciego",
        "categoria": "anecdotas",
        "icono": "👁️",
        "titulo": "Leonhard Euler: Calculando en la Oscuridad",
        "subtitulo": "El cerebro más prolífico de la historia",
        "contenido": "Leonhard Euler perdió la vista de su ojo derecho en 1735 y la del izquierdo en 1771. Lejos de rendirse, declaró con optimismo: 'Ahora tendré menos distracciones'. Euler poseía una memoria fotográfica y un cálculo mental prodigioso; dictó a sus secretarios más de la mitad de su gigantesca producción científica estando completamente ciego. Además, inventó el 'Método de Euler', el primer algoritmo numérico para aproximar soluciones de ecuaciones diferenciales.",
        "impacto": "Euler publicó más de 850 artículos y libros matemáticos a lo largo de su vida."
    },
    {
        "id": "carbono-14",
        "categoria": "mundo_real",
        "icono": "⏳",
        "titulo": "El Reloj Atómico del Carbono-14",
        "subtitulo": "Descifrando la edad de la historia",
        "contenido": "Todos los seres vivos respiran y absorben Carbono-14 mientras viven. En el instante de morir, el reloj se activa: el C-14 se desintegra siguiendo la sencilla EDO de primer orden dN/dt = -λN, con una vida media de 5,730 años. Willard Libby ganó el Premio Nobel de Química en 1960 gracias a este descubrimiento, permitiendo datar con precisión fósiles prehistóricos, momias egipcias e incluso los rollos del Mar Muerto.",
        "impacto": "Una sola ecuación diferencial de 3 variables convirtió la arqueología en una ciencia exacta."
    },
    {
        "id": "peces-adriatico",
        "categoria": "mundo_real",
        "icono": "🐟",
        "titulo": "El Enigma de los Peces de la 1ª Guerra Mundial",
        "subtitulo": "Modelo Depredador-Presa de Lotka-Volterra",
        "contenido": "Durante la Primera Guerra Mundial, la pesca en el Mar Adriático cesó por completo debido a las minas marinas. El biólogo Umberto D'Ancona observó algo desconcertante: cuando la pesca se detuvo, el porcentaje de peces depredadores (tiburones y rayas) aumentó dramáticamente mientras que las presas disminuyeron. Su suegro, el célebre matemático Vito Volterra, formuló un sistema de ecuaciones diferenciales acopladas que demostró que reducir la pesca favorece proporcionalmente a los depredadores en la cima de la cadena alimenticia.",
        "impacto": "Nacimiento de la biomatemática y la gestión moderna de pesquerías y ecosistemas."
    },
    {
        "id": "cafe-newton",
        "categoria": "mundo_real",
        "icono": "☕",
        "titulo": "¿Cuándo ponerle leche al café caliente?",
        "subtitulo": "El truco térmico de la Ley de Enfriamiento",
        "contenido": "Si tienes una taza de café hirviendo pero tienes que esperar 10 minutos para beberlo, ¿es mejor agregar la leche fría inmediatamente o justo antes de tomarlo? Según la Ley de Enfriamiento de Newton dT/dt = -k(T - Tamb), la tasa de pérdida de calor es directamente proporcional a la diferencia de temperatura con el aire. Si pones la leche fría de inmediato, reduces el salto térmico de golpe y el café perderá calor mucho más despacio en los siguientes minutos. ¡Llegará más caliente al minuto 10 si le pones la leche al principio!",
        "impacto": "La física térmica cotidiana modelada con una elegante ecuación diferencial separable."
    },
    {
        "id": "videojuegos-rk4",
        "categoria": "tecnologia",
        "icono": "🎮",
        "titulo": "Los Saltos en Videojuegos y Runge-Kutta",
        "subtitulo": "La física detrás de tus juegos favoritos",
        "contenido": "¿Cómo sabe el motor de un videojuego dónde caerá tu personaje tras saltar o disparar un misil? En cada fotograma (60 o 120 veces por segundo), la tarjeta gráfica y la CPU deben integrar las ecuaciones diferenciales de la dinámica de Newton: d²x/dt² = F_total / m. Motores de física como PhysX y Havok usan aproximaciones numéricas como Runge-Kutta y el integrador Verlet para que la tela, el agua y las colisiones se vean realistas sin ralentizar la pantalla.",
        "impacto": "Sin métodos numéricos de EDOs, no existirían simuladores de carreras, naves espaciales ni físicas creíbles en juegos."
    },
    {
        "id": "soldados-puente",
        "categoria": "historia",
        "icono": "🥾",
        "titulo": "¡Rompan el Paso! La Orden Militar del Siglo XIX",
        "subtitulo": "Por qué los soldados no marchan en los puentes",
        "contenido": "En abril de 1831, 74 soldados británicos cruzaban el puente colgante de Broughton marcando el paso con disciplina militar. La cadencia periódica de sus botas coincidió con la frecuencia propia de resonancia del puente (solución de la ecuación de oscilador armónico forzado y'' + ω²y = F cos(Ωt)). La estructura colapsó, arrojando a todos al río. Desde aquel día, los manuales militares de todo el mundo ordenan obligatoriamente 'romper el paso' antes de cruzar cualquier puente.",
        "impacto": "La resonancia mecánica es una consecuencia física directa de las raíces imaginarias en EDOs de segundo orden."
    },
    {
        "id": "farmacocinetica",
        "categoria": "mundo_real",
        "icono": "💊",
        "titulo": "Farmacocinética: ¿Cada cuántas horas tomar la medicina?",
        "subtitulo": "La química en tu cuerpo es una EDO",
        "contenido": "Cuando tomas un analgésico, la cantidad de fármaco en tu torrente sanguíneo C(t) depende de dos velocidades opuestas: la absorción gastrointestinal y la depuración hepática/renal. Esto se modela como dC/dt = ka*Dose - ke*C. Los médicos y farmacéuticos usan esta ecuación diferencial para calcular la dosis exacta y el intervalo (por ejemplo, cada 8 horas) para que la concentración se mantenga en la 'ventana terapéutica', aliviando el dolor sin resultar tóxica.",
        "impacto": "Las EDOs salvan vidas al diseñar regímenes de quimioterapia y tratamientos con antibióticos."
    },
    {
        "id": "poincare-caos",
        "categoria": "historia",
        "icono": "🦋",
        "titulo": "Henri Poincaré y el Efecto Mariposa",
        "subtitulo": "El límite de lo predecible",
        "contenido": "En 1887, el rey Óscar II de Suecia ofreció un jugoso premio a quien resolviera el 'Problema de los Tres Cuerpos' (las ecuaciones diferenciales de la gravedad para tres planetas interactuando). Henri Poincaré descubrió algo que revolucionó la ciencia: las ecuaciones no tenían solución analítica general y una variación infinitesimal en las condiciones iniciales provocaba órbitas completamente caóticas e impredecibles. Había nacido la Teoría del Caos.",
        "impacto": "Demostró que 'determinismo' no significa 'predecibilidad' a largo plazo, explicando por qué no podemos predecir el clima con semanas de antelación."
    },
    {
        "id": "epidemiologia-sir",
        "categoria": "mundo_real",
        "icono": "🦠",
        "titulo": "El Modelo SIR y la Inmunidad de Rebaño",
        "subtitulo": "Kermack y McKendrick en 1927",
        "contenido": "El modelo epidemiológico más influyente divide a la población en Susceptibles (S), Infectados (I) y Recuperados (R), conectados por tres ecuaciones diferenciales acopladas: dS/dt = -βSI, dI/dt = βSI - γI, dR/dt = γI. Este modelo matemático predice el famoso 'pico de la curva' y reveló por primera vez que no es necesario vacunar al 100% de la gente para frenar una epidemia: basta con alcanzar el umbral de inmunidad donde dI/dt se vuelve negativo.",
        "impacto": "Herramienta fundamental de la Organización Mundial de la Salud en la toma de decisiones sanitarias."
    }
]
