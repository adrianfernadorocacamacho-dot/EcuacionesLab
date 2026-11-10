"""
DiferencialLab - Backend Educativo con Python, Flask y SymPy
Laboratorio Interactivo de Ecuaciones Diferenciales
"""

import sys
import os
import random
import re
import math
from flask import Flask, jsonify, request, send_from_directory
import sympy as sp
import numpy as np

app = Flask(__name__, static_folder=None)

# ==============================================================================
# BASE DE DATOS: CURIOSIDADES Y DATOS FASCINANTES DE ECUACIONES DIFERENCIALES
# ==============================================================================
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

# ==============================================================================
# BASE DE DATOS: BANCO DE PREGUNTAS COMPLETO (32 PREGUNTAS CATEGORIZADAS)
# ==============================================================================
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

# ==============================================================================
# MOTOR MATEMÁTICO: RESOLUTOR SIMBÓLICO Y PEDAGÓGICO
# ==============================================================================
def build_pedagogical_steps(eq, sol_gen, sol_part, x, y, x0, y0, y1, order):
    """
    Genera un desglose detallado y pedagógico paso a paso diseñado especialmente
    para estudiantes que están aprendiendo ecuaciones diferenciales.
    """
    steps = []
    
    # PASO 1: Identificación y variables
    steps.append({
        'num': 1,
        'titulo': 'Identificación de Variables y Forma Estándar',
        'descripcion': f'En esta ecuación diferencial identificamos:\n• Variable independiente: x (representa la entrada o el tiempo).\n• Función incógnita a determinar: y(x).\n• Derivada: representa la tasa instantánea de cambio de y respecto a x.\n\nEscribimos la ecuación en su forma matemática canónica:\n\n{sp.latex(eq)}',
        'tipo': 'setup'
    })
    
    # PASO 2: Clasificación pedagógica
    if order == 1:
        tipo_str = 'Ecuación Diferencial Ordinaria (EDO) de 1er Orden (involucra solo la primera derivada dy/dx)'
    elif order == 2:
        tipo_str = 'Ecuación Diferencial Ordinaria (EDO) de 2º Orden (involucra la segunda derivada d²y/dx²)'
    else:
        tipo_str = f'Ecuación Diferencial Ordinaria (EDO) de orden {order}'
        
    steps.append({
        'num': 2,
        'titulo': 'Clasificación y Tipo de Ecuación',
        'descripcion': f'Se clasifica como una {tipo_str}. El orden indica cuántas veces consecutivas se ha derivado la función incógnita.',
        'tipo': 'clasificacion'
    })
    
    diff_y = y(x).diff(x)
    diff2_y = y(x).diff(x, 2)
    
    if order == 1:
        try:
            dydx_sol = sp.solve(eq, diff_y)
            if dydx_sol:
                dydx = dydx_sol[0]
                has_y = y(x) in dydx.atoms(sp.Function)
                
                # CASO 1: Integración Directa (dy/dx = f(x))
                if not has_y:
                    steps.append({
                        'num': 3,
                        'titulo': 'Método de Integración Directa',
                        'descripcion': f'Como el miembro derecho depende únicamente de x, multiplicamos ambos miembros por el diferencial dx para aislar variables:\n\ndy = \\left({sp.latex(dydx)}\\right)dx',
                        'tipo': 'metodo'
                    })
                    f_int = sp.integrate(dydx, x)
                    steps.append({
                        'num': 4,
                        'titulo': 'Integración Indefinida de Ambos Miembros',
                        'descripcion': f'Aplicamos el operador integral ∫ a ambos lados de la igualdad:\n\n\\int dy = \\int \\left({sp.latex(dydx)}\\right)dx',
                        'tipo': 'integracion'
                    })
                    steps.append({
                        'num': 5,
                        'titulo': 'Cálculo de Antiderivadas y Constante C',
                        'descripcion': f'La integral de dy es simplemente y(x). Integrando el miembro derecho con las reglas del cálculo y sumando la constante C:\n\ny(x) = {sp.latex(f_int)} + C',
                        'tipo': 'algebra'
                    })
                else:
                    # CASO 2: Lineal en y: dy/dx = A*y + B => dy/dx + (-A)*y = B
                    A = dydx.diff(y(x))
                    B = sp.simplify(dydx - A*y(x))
                    is_linear_y = (y(x) not in A.atoms(sp.Function)) and (y(x) not in B.atoms(sp.Function))
                    
                    if is_linear_y and B == 0:
                        # Variables separables dy/y = A dx
                        steps.append({
                            'num': 3,
                            'titulo': 'Método de Separación de Variables',
                            'descripcion': f'Reordenamos la ecuación dividiendo entre y(x) y multiplicando por dx para agrupar variables:\n\n\\frac{{dy}}{{y}} = \\left({sp.latex(A)}\\right)dx',
                            'tipo': 'metodo'
                        })
                        int_A = sp.integrate(A, x)
                        steps.append({
                            'num': 4,
                            'titulo': 'Integración de Ambos Miembros',
                            'descripcion': f'Integramos ambos lados de la igualdad:\n\n\\int \\frac{{dy}}{{y}} = \\int \\left({sp.latex(A)}\\right)dx \\implies \\ln|y| = {sp.latex(int_A)} + c',
                            'tipo': 'integracion'
                        })
                        steps.append({
                            'num': 5,
                            'titulo': 'Despeje Exponencial de y(x)',
                            'descripcion': f'Aplicamos la función exponencial e^(·) a ambos lados para despejar y (e^ln|y| = |y|) y renombramos e^c como la constante C:\n\ny(x) = C \\cdot e^{{{sp.latex(int_A)}}}',
                            'tipo': 'algebra'
                        })
                    elif is_linear_y:
                        P = -A
                        Q = B
                        steps.append({
                            'num': 3,
                            'titulo': 'Forma Canónica Lineal de 1er Orden',
                            'descripcion': f'Escribimos la ecuación en la forma estándar y\' + P(x)y = Q(x), identificando:\n• P(x) = {sp.latex(P)}\n• Q(x) = {sp.latex(Q)}\n\n\\frac{{dy}}{{dx}} + \\left({sp.latex(P)}\\right)y = {sp.latex(Q)}',
                            'tipo': 'metodo'
                        })
                        int_P = sp.integrate(P, x)
                        mu = sp.exp(int_P)
                        steps.append({
                            'num': 4,
                            'titulo': 'Cálculo del Factor Integrante μ(x)',
                            'descripcion': f'El factor integrante μ(x) permite condensar el miembro izquierdo en la derivada de un producto. Se calcula mediante μ(x) = e^(∫ P(x) dx):\n\n\\mu(x) = e^{{\\int \\left({sp.latex(P)}\\right)dx}} = {sp.latex(mu)}',
                            'tipo': 'factor'
                        })
                        steps.append({
                            'num': 5,
                            'titulo': 'Multiplicación por μ(x) y Regla del Producto',
                            'descripcion': f'Multiplicamos toda la ecuación diferencial por μ(x). El lado izquierdo se convierte en la derivada d/dx[μ(x)·y(x)]:\n\n\\frac{{d}}{{dx}}\\left[{sp.latex(mu)} \\cdot y(x)\\right] = {sp.latex(sp.simplify(mu*Q))}',
                            'tipo': 'producto'
                        })
                        int_mu_Q = sp.integrate(mu * Q, x)
                        steps.append({
                            'num': 6,
                            'titulo': 'Integración y Despeje de y(x)',
                            'descripcion': f'Integramos con respecto a x y dividimos entre el factor integrante μ(x):\n\n{sp.latex(mu)} \\cdot y(x) = {sp.latex(int_mu_Q)} + C \\implies y(x) = \\frac{{{sp.latex(int_mu_Q)} + C}}{{{sp.latex(mu)}}}',
                            'tipo': 'despeje'
                        })
                    else:
                        steps.append({
                            'num': 3,
                            'titulo': 'Resolución por Separación e Integración Simbólica',
                            'descripcion': f'Separamos los diferenciales y resolvemos las integrales simbólicas correspondientes:\n\n{sp.latex(sol_gen)}',
                            'tipo': 'metodo'
                        })
        except Exception:
            pass
            
    elif order == 2:
        # Segundo orden
        try:
            lhs_diff = eq.lhs - eq.rhs
            a_coeff = lhs_diff.coeff(diff2_y)
            b_coeff = lhs_diff.coeff(diff_y)
            c_coeff = lhs_diff.coeff(y(x))
            
            if a_coeff != 0 and (diff2_y not in b_coeff.atoms(sp.Derivative)) and (diff_y not in c_coeff.atoms(sp.Derivative)):
                r = sp.Symbol('r')
                char_eq = sp.Eq(a_coeff*r**2 + b_coeff*r + c_coeff, 0)
                roots = sp.solve(char_eq, r)
                
                steps.append({
                    'num': 3,
                    'titulo': 'Planteamiento de la Ecuación Característica',
                    'descripcion': f'Para una EDO lineal homogénea con coeficientes constantes a·y\'\' + b·y\' + c·y = 0, proponemos una solución exponencial y = e^(rx). Al sustituir sus derivadas y\' = r e^(rx) e y\'\' = r² e^(rx), obtenemos el polinomio característico:\n\n{sp.latex(char_eq)}',
                    'tipo': 'caracteristica'
                })
                
                roots_str = ', '.join([sp.latex(rt) for rt in roots])
                steps.append({
                    'num': 4,
                    'titulo': 'Cálculo de las Raíces Características',
                    'descripcion': f'Resolvemos la ecuación cuadrática en r:\n\nr = {roots_str}',
                    'tipo': 'raices'
                })
                
                # Explicar la naturaleza de las raíces
                disc = b_coeff**2 - 4*a_coeff*c_coeff
                if disc < 0:
                    steps.append({
                        'num': 5,
                        'titulo': 'Raíces Complejas Conjugadas y Fórmula de Euler',
                        'descripcion': f'Como el discriminante es negativo, las raíces son números imaginarios/complejos de la forma α ± βi. Aplicando la fórmula de Euler (e^(iθ) = cos θ + i sin θ), la solución real se escribe combinando senos y cosenos:\n\ny(x) = C_1 \\cos(\\beta x) + C_2 \\sin(\\beta x)',
                        'tipo': 'euler'
                    })
                elif disc > 0:
                    steps.append({
                        'num': 5,
                        'titulo': 'Raíces Reales Distintas',
                        'descripcion': f'Como las dos raíces r₁ y r₂ son números reales distintos, la solución general es la superposición de dos exponenciales e^(r₁x) y e^(r₂x):\n\ny(x) = C_1 e^{{r_1 x}} + C_2 e^{{r_2 x}}',
                        'tipo': 'superposicion'
                    })
                else:
                    steps.append({
                        'num': 5,
                        'titulo': 'Raíz Real Repetida',
                        'descripcion': f'Al repetirse la raíz r, multiplicamos la segunda solución por x para asegurar que sean linealmente independientes:\n\ny(x) = (C_1 + C_2 x) e^{{r x}}',
                        'tipo': 'repetida'
                    })
        except Exception:
            pass

    # PASO: Solución General
    steps.append({
        'num': len(steps) + 1,
        'titulo': 'Solución General de la EDO (Familia de Curvas)',
        'descripcion': f'La familia infinita de curvas solución que satisfacen la ecuación diferencial es:\n\n{sp.latex(sol_gen)}\n\n💡 *Nota para estudiantes:* Cada valor posible de la constante C representa una curva diferente en el plano cartesiano.',
        'tipo': 'general'
    })
    
    # PASO: Condiciones iniciales PVI
    if sol_part is not None and y0 is not None:
        cond_desc = f'y({x0}) = {y0}' + (f', y\'({x0}) = {y1}' if y1 is not None and order > 1 else '')
        
        # Detalle de sustitución
        try:
            sx0 = sp.nsimplify(x0)
            sy0 = sp.nsimplify(y0)
            sub_lhs = sol_gen.rhs.subs(x, sx0)
            pvi_eq_latex = f'{sp.latex(sub_lhs)} = {sp.latex(sy0)}'
        except Exception:
            pvi_eq_latex = ''
            
        steps.append({
            'num': len(steps) + 1,
            'titulo': 'Aplicación del Problema de Valor Inicial (PVI)',
            'descripcion': f'Una condición inicial fija un punto exacto por donde debe pasar la curva. Al sustituir las condiciones {cond_desc} en la solución general:\n\n{pvi_eq_latex}',
            'tipo': 'pvi_eval'
        })
        
        steps.append({
            'num': len(steps) + 1,
            'titulo': 'Solución Particular Única',
            'descripcion': f'Despejando las constantes arbitrarias y reemplazándolas en la solución general, obtenemos la solución particular única que cumple las condiciones dadas:\n\n{sp.latex(sol_part)}',
            'tipo': 'particular'
        })
        
    return steps

def parse_and_solve_ode(eq_str, x0=0, y0=None, y1=None):
    """
    Parsea una ecuación diferencial en notación estándar y la resuelve con SymPy.
    Retorna la solución general, particular (si hay condiciones) y pasos explicativos.
    """
    x = sp.Symbol('x')
    y = sp.Function('y')
    
    clean_str = eq_str.strip()
    if '=' in clean_str:
        lhs_str, rhs_str = clean_str.split('=', 1)
    else:
        lhs_str, rhs_str = clean_str, '0'
        
    def transform_part(s):
        s = s.replace("d2y/dx2", "y(x).diff(x, 2)")
        s = s.replace("dy/dx", "y(x).diff(x)")
        s = s.replace("y''", "y(x).diff(x, 2)")
        s = s.replace("y'", "y(x).diff(x)")
        # Reemplazar y por y(x) cuando sea variable aislada
        s = re.sub(r'\by\b(?!\()', 'y(x)', s)
        # Soporte para potencias tipo ^ -> **
        s = s.replace('^', '**')
        return s

    lhs_expr_str = transform_part(lhs_str)
    rhs_expr_str = transform_part(rhs_str)
    
    local_dict = {
        'x': x, 'y': y,
        'exp': sp.exp, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan,
        'ln': sp.log, 'log': sp.log, 'e': sp.E, 'pi': sp.pi,
        'sqrt': sp.sqrt
    }
    
    lhs = sp.nsimplify(sp.parse_expr(lhs_expr_str, local_dict=local_dict))
    rhs = sp.nsimplify(sp.parse_expr(rhs_expr_str, local_dict=local_dict))
    eq = sp.Eq(lhs, rhs)
    
    # Clasificación y orden de la ecuación
    derivs = [d for d in eq.atoms(sp.Derivative) if d.expr == y(x)]
    order = max([len(d.variables) for d in derivs], default=1)
    
    # Resolver solución general
    sol_gen = sp.dsolve(eq, y(x))
    
    # Aplicar condiciones iniciales si se proporcionan
    ics = {}
    sx0 = sp.nsimplify(x0)
    if y0 is not None:
        ics[y(sx0)] = sp.nsimplify(y0)
    if y1 is not None and order > 1:
        ics[y(x).diff(x).subs(x, sx0)] = sp.nsimplify(y1)
        
    sol_part = None
    if ics:
        try:
            sol_part = sp.dsolve(eq, y(x), ics=ics)
        except Exception:
            try:
                # Fallback: sustituir en sol_gen y despejar constantes
                constants = list(sol_gen.free_symbols - {x})
                eq_ics = []
                if y0 is not None:
                    eq_ics.append(sp.Eq(sol_gen.rhs.subs(x, sx0), sp.nsimplify(y0)))
                if y1 is not None and order > 1:
                    eq_ics.append(sp.Eq(sol_gen.rhs.diff(x).subs(x, sx0), sp.nsimplify(y1)))
                c_sol = sp.solve(eq_ics, constants)
                if isinstance(c_sol, dict):
                    sol_part = sp.Eq(y(x), sol_gen.rhs.subs(c_sol))
                elif isinstance(c_sol, list) and len(c_sol) > 0:
                    sol_part = sp.Eq(y(x), sol_gen.rhs.subs(c_sol[0]))
            except Exception:
                sol_part = None

    # Generar pasos explicativos detallados y pedagógicos para estudiantes
    steps = build_pedagogical_steps(eq, sol_gen, sol_part, x, y, x0, y0, y1, order)

    # Generar puntos muestrales para graficar
    plot_points = []
    active_sol = sol_part if sol_part is not None else sol_gen
    try:
        rhs_func = active_sol.rhs
        # Si aún quedan constantes C1, sustituimos C1=1 para ilustrar
        free_symbols = rhs_func.free_symbols - {x}
        subs_dict = {sym: 1.0 for sym in free_symbols}
        eval_expr = rhs_func.subs(subs_dict)
        f_num = sp.lambdify(x, eval_expr, modules=['numpy', 'math'])
        
        xs = np.linspace(float(x0), float(x0) + 5.0, 100)
        for val_x in xs:
            try:
                val_y = float(f_num(val_x))
                if not math.isnan(val_y) and not math.isinf(val_y) and abs(val_y) < 1e5:
                    plot_points.append({"x": round(float(val_x), 3), "y": round(float(val_y), 4)})
            except Exception:
                continue
    except Exception:
        plot_points = []

    return {
        "latex_eq": sp.latex(eq),
        "latex_general": sp.latex(sol_gen),
        "str_general": str(sol_gen),
        "latex_particular": sp.latex(sol_part) if sol_part is not None else None,
        "str_particular": str(sol_part) if sol_part is not None else None,
        "order": order,
        "steps": steps,
        "plot_points": plot_points
    }

# ==============================================================================
# RUTAS DE LA API REST (FLASK)
# ==============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTERFAZ_DIR = os.path.join(BASE_DIR, "interfaz")

@app.route("/")
def index():
    return send_from_directory(INTERFAZ_DIR, "index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    interfaz_file = os.path.join(INTERFAZ_DIR, filename)
    if os.path.exists(interfaz_file) and os.path.isfile(interfaz_file):
        return send_from_directory(INTERFAZ_DIR, filename)
    root_file = os.path.join(BASE_DIR, filename)
    if os.path.exists(root_file) and os.path.isfile(root_file):
        return send_from_directory(BASE_DIR, filename)
    return ("Not found", 404)

@app.route("/api/status", methods=["GET"])
def get_status():
    """Retorna el estado del backend de Python y las versiones activas."""
    return jsonify({
        "status": "online",
        "engine": "Python SymPy + Flask",
        "python_version": sys.version.split()[0],
        "sympy_version": sp.__version__,
        "numpy_version": np.__version__,
        "curiosidades_count": len(CURIOSIDADES),
        "preguntas_count": len(BANCO_PREGUNTAS)
    })

@app.route("/api/curiosities", methods=["GET"])
def get_curiosities():
    """Retorna todas las curiosidades o filtradas por categoría."""
    categoria = request.args.get("categoria")
    if categoria and categoria != "todas":
        filtered = [c for c in CURIOSIDADES if c["categoria"] == categoria]
        return jsonify(filtered)
    return jsonify(CURIOSIDADES)

@app.route("/api/curiosities/random", methods=["GET"])
def get_random_curiosity():
    """Retorna un dato curioso aleatorio."""
    return jsonify(random.choice(CURIOSIDADES))

@app.route("/api/questions", methods=["GET"])
def get_questions():
    """
    Retorna preguntas para el juego.
    Soporta modos: 'desafio' (10 preguntas aleatorias), 'supervivencia' (todas en orden aleatorio), 'practica'.
    """
    count = request.args.get("count", default=None, type=int)
    categoria = request.args.get("categoria", default=None)
    
    lista = list(BANCO_PREGUNTAS)
    if categoria and categoria != "todas":
        lista = [q for q in lista if q["categoria"] == categoria]
        
    random.shuffle(lista)
    
    if count and count > 0:
        lista = lista[:count]
        
    # Mezclar las opciones aleatoriamente para evitar patrones
    preparadas = []
    for q in lista:
        opciones_originales = list(q["opciones"])
        correcta_texto = opciones_originales[q["correcta"]]
        
        # Mezclar opciones
        shuffled_opts = list(opciones_originales)
        random.shuffle(shuffled_opts)
        nueva_correcta = shuffled_opts.index(correcta_texto)
        
        preparadas.append({
            "id": q["id"],
            "pregunta": q["pregunta"],
            "opciones": shuffled_opts,
            "correcta": nueva_correcta,
            "categoria": q["categoria"],
            "dificultad": q["dificultad"],
            "explicacion": q["explicacion"]
        })
        
    return jsonify({
        "total": len(preparadas),
        "preguntas": preparadas
    })

@app.route("/api/solve", methods=["POST"])
def solve_ode_endpoint():
    """
    Resuelve una EDO ingresada por el usuario o seleccionada de los modelos preseteados.
    """
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
        
    model_type = data.get("type", "preset")
    if model_type == "preset":
        model_type = data.get("model", "exp")
    x0 = float(data.get("x0", 0.0))
    y0 = float(data.get("y0", 1.0)) if data.get("y0") is not None else None
    y1 = float(data.get("y1", 0.0)) if data.get("y1") is not None else None
    
    eq_str = ""
    if model_type == "custom":
        eq_str = data.get("equation", "").strip()
        if not eq_str:
            return jsonify({"error": "Por favor escribe una ecuación diferencial válida"}), 400
    elif model_type == "exp":
        k = float(data.get("k", 2.0))
        eq_str = f"y' = {k}*y"
    elif model_type == "cooling":
        k = float(data.get("k", 0.5))
        Ta = float(data.get("Ta", 20.0))
        eq_str = f"y' = -{k}*(y - {Ta})"
    elif model_type == "linear":
        a = float(data.get("a", 2.0))
        b = float(data.get("b", 4.0))
        eq_str = f"y' + {a}*y = {b}"
    elif model_type == "harmonic":
        omega2 = float(data.get("omega2", 4.0))
        eq_str = f"y'' + {omega2}*y = 0"
    elif model_type == "damped":
        gamma = float(data.get("gamma", 1.0))
        omega2 = float(data.get("omega2", 5.0))
        eq_str = f"y'' + {2*gamma}*y' + {omega2}*y = 0"
    elif model_type == "power":
        a = float(data.get("a", 1.0))
        n = int(data.get("n", 2))
        eq_str = f"y' = {a}*x**{n}"
    else:
        eq_str = "y' = 2*y"

    try:
        resultado = parse_and_solve_ode(eq_str, x0=x0, y0=y0, y1=y1)
        resultado["equation_input"] = eq_str
        return jsonify(resultado)
    except Exception as e:
        return jsonify({
            "error": f"No se pudo resolver la ecuación: {str(e)}",
            "detalles": "Verifica la sintaxis (ejemplo: y' = 3*y, y' + 2*y = 4, y'' + 9*y = 0)"
        }), 400

@app.route("/api/simulate", methods=["GET"])
def simulate_endpoint():
    """
    Genera datos numéricos precisos para simulaciones interactivas:
    - newton_cooling: T(t) = Ta + (T0 - Ta) * exp(-k * t)
    - exponential: y(t) = y0 * exp(k * t)
    - damped_oscillator: oscilador libre amortiguado
    - slope_field: campo de pendientes dy/dx = f(x, y) en cuadrícula
    """
    sim_type = request.args.get("type", "exponential")
    
    if sim_type == "newton_cooling":
        T0 = float(request.args.get("T0", 85.0))
        Ta = float(request.args.get("Ta", 22.0))
        k = float(request.args.get("k", 0.08))
        t_max = float(request.args.get("t_max", 40.0))
        
        ts = np.linspace(0, t_max, 120)
        points = [{"t": round(float(t), 2), "T": round(float(Ta + (T0 - Ta) * np.exp(-k * t)), 2)} for t in ts]
        return jsonify({"type": "newton_cooling", "Ta": Ta, "T0": T0, "k": k, "data": points})
        
    elif sim_type == "damped_oscillator":
        gamma = float(request.args.get("gamma", 0.2))
        omega0 = float(request.args.get("omega0", 2.0))
        y0 = float(request.args.get("y0", 3.0))
        t_max = float(request.args.get("t_max", 20.0))
        
        ts = np.linspace(0, t_max, 200)
        points = []
        
        if gamma < omega0:
            # Subamortiguado
            omega_d = np.sqrt(omega0**2 - gamma**2)
            for t in ts:
                val = y0 * np.exp(-gamma * t) * np.cos(omega_d * t)
                points.append({"t": round(float(t), 2), "y": round(float(val), 3)})
            regime = "subamortiguado"
        elif abs(gamma - omega0) < 1e-4:
            # Crítico
            for t in ts:
                val = y0 * (1.0 + gamma * t) * np.exp(-gamma * t)
                points.append({"t": round(float(t), 2), "y": round(float(val), 3)})
            regime = "critico"
        else:
            # Sobreamortiguado
            r1 = -gamma + np.sqrt(gamma**2 - omega0**2)
            r2 = -gamma - np.sqrt(gamma**2 - omega0**2)
            c1 = y0 * r2 / (r2 - r1)
            c2 = y0 - c1
            for t in ts:
                val = c1 * np.exp(r1 * t) + c2 * np.exp(r2 * t)
                points.append({"t": round(float(t), 2), "y": round(float(val), 3)})
            regime = "sobreamortiguado"
            
        return jsonify({
            "type": "damped_oscillator",
            "regime": regime,
            "gamma": gamma,
            "omega0": omega0,
            "data": points
        })
        
    elif sim_type == "slope_field":
        # Retorna el campo de pendientes en una cuadrícula
        eq_type = request.args.get("eq", "exp")
        k = float(request.args.get("k", 0.5))
        
        x_min, x_max = -3, 5
        y_min, y_max = -3, 5
        grid_points = []
        
        for ix in np.linspace(x_min, x_max, 15):
            for iy in np.linspace(y_min, y_max, 13):
                if eq_type == "exp":
                    slope = k * iy
                elif eq_type == "linear":
                    slope = -k * iy
                elif eq_type == "oscillator":
                    slope = -0.8 * ix
                elif eq_type == "cooling":
                    slope = -k * (iy - 1.0)
                else:
                    slope = k * iy
                    
                # Limitar pendientes extremas
                slope = max(-10.0, min(10.0, float(slope)))
                grid_points.append({"x": round(float(ix), 2), "y": round(float(iy), 2), "slope": round(slope, 3)})
                
        return jsonify({"type": "slope_field", "points": grid_points})
        
    else:
        # Default exponencial
        k = float(request.args.get("k", 0.5))
        y0 = float(request.args.get("y0", 1.0))
        ts = np.linspace(0, 5.0, 100)
        points = [{"t": round(float(t), 2), "y": round(float(y0 * np.exp(k * t)), 3)} for t in ts]
        return jsonify({"type": "exponential", "k": k, "y0": y0, "data": points})


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    port = int(os.environ.get("PORT", 5000))
    host = "0.0.0.0"
    print("=" * 65)
    print(" INICIANDO DIFERENCIALLAB - SERVIDOR EDUCATIVO EN PYTHON")
    import flask
    print(f" SymPy v{sp.__version__} | Flask v{flask.__version__} | NumPy v{np.__version__}")
    print(f" Servidor activo en: http://{host}:{port}")
    print(" Abre esa direccion en tu navegador para interactuar.")
    print("=" * 65)
    app.run(host=host, port=port, debug=False)
