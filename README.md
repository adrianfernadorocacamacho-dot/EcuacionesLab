# DiferencialLab 2.0 - Laboratorio Interactivo de Ecuaciones Diferenciales

Laboratorio web educativo y gamificado potenciado por **Python, SymPy y Flask** para aprender, resolver, visualizar y jugar con ecuaciones diferenciales ordinarias (EDO).

---

## 🚀 Cómo Iniciar el Laboratorio

### Opción 1: Con Servidor Python (Recomendado - Activa SymPy Completo)
1. Haz doble clic en el archivo `iniciar_laboratorio.bat`.
   * O desde la terminal / consola:
     ```bash
     python app.py
     ```
2. Se iniciará el servidor Flask local y se abrirá automáticamente en tu navegador:
   `http://127.0.0.1:5000`

### Opción 2: Modo Navegador Directo (Offline / Standalone)
1. Haz doble clic en `index.html` para abrirlo directamente en Google Chrome, Edge o Firefox.
2. Funcionará al 100% con su motor matemático interno en JavaScript, banco de 32 preguntas y curiosidades sin necesidad de instalar nada.

---

## 🌟 Novedades de la Versión 2.0

### 1. ✦ Curiosidades, Historias y Anécdotas
- **Ruleta de Curiosidades Interactiva**: Descubre con un clic historias insólitas y misterios de las ecuaciones diferenciales con efectos de sonido.
- **Categorías Temáticas**:
  - ⚔️ *Historia & Rivalidades*: La disputa entre Newton y Leibniz, el desafío de la Braquistócrona de los Bernoulli.
  - 🌉 *En el Mundo Real*: El colapso por resonancia del puente de Tacoma Narrows, el reloj atómico del Carbono-14, la física térmica del café caliente y la farmacocinética médica.
  - 🎮 *Tecnología & Videojuegos*: Por qué Unreal y Unity usan el método de Runge-Kutta 4 (RK4) para saltos y físicas.
  - 💡 *Anécdotas Científicas*: Euler dictando matemáticas ciego, Henri Poincaré y el nacimiento de la Teoría del Caos.

### 2. ◈ Trivia & Juego de Preguntas (DiferencialTrivia)
- **Banco de 32 Preguntas Aleatorias**: Preguntas pedagógicas y entretenidas sobre conceptos, clasificación, orden, grado, métodos, física y curiosidades históricas.
- **3 Modos de Juego**:
  - ⏱️ **Modo Desafío Exprés**: 10 preguntas con temporizador animado de 20 segundos y bonificación por velocidad.
  - ❤️ **Modo Supervivencia**: Empiezas con 3 vidas. Cada error te cuesta un corazón. ¿Hasta qué ronda podrás llegar?
  - 🎓 **Modo Práctica Libre**: Aprende a tu ritmo con explicaciones pedagógicas detalladas en cada opción.
- **Rachas y Multiplicadores de Combo**: ¡x1.5, x2 y x3 COMBO con fuego y efectos especiales!
- **Efectos de Sonido Sintetizados (Web Audio API)**: Acordes musicales al acertar, alertas de fallo y fanfarria de récord sin requerir archivos de audio externos.
- **Sistema de Logros y Medallas**: Desbloquea trofeos que se guardan en tu navegador (`Novato`, `Racha de Fuego`, `Rayo Veloz`, `Maestro de EDOs`).

### 3. ƒ Resolutor Simbólico con Python y SymPy
- **Resolución Analítica Paso a Paso**: Procedimiento completo con justificación matemática y renderizado en KaTeX.
- **Modelos Guiados**: Crecimiento/decaimiento, Ley de enfriamiento de Newton, ecuaciones lineales de 1er orden, potencia y osciladores armónicos de 2º orden.
- **Modo Entrada Libre (SymPy)**: Escribe cualquier ecuación diferencial directamente (ejemplo: `y' + 2*y = 4`, `y'' + 9*y = 0`) para resolverla con el motor simbólico de SymPy.
- **Condiciones Iniciales**: Evaluación automática de soluciones particulares y previsualización de su curva.

### 4. ⌁ Visualizador & Simulador Dinámico (4 Modelos)
- **Crecimiento / Desintegración Exponencial**: Control de $k$ e $y_0$.
- **Ley de Enfriamiento de Newton**: Simula la temperatura de una taza de café caliente enfriándose hacia la temperatura ambiente con recta asintótica.
- **Oscilador Armónico Amortiguado**: Control de fricción $\gamma$ y frecuencia $\omega_0$ ilustrando los regímenes subamortiguado, crítico y sobreamortiguado.
- **Campo de Direcciones (Slope Field)**: Cuadrícula interactiva de vectores tangentes en el plano $xy$ con la curva de solución navegando a través de ellos.

---

## 📁 Archivos del Proyecto
- `app.py`: Servidor backend en Python con Flask, SymPy y las APIs REST (`/api/status`, `/api/solve`, `/api/curiosities`, `/api/questions`, `/api/simulate`).
- `iniciar_laboratorio.bat`: Lanzador de un solo clic para Windows.
- `index.html`: Estructura HTML5 moderna y accesible.
- `styles.css`: Sistema de diseño con glassmorphism, temas claro/oscuro y diseño responsivo para móviles y PC.
- `script.js`: Controlador dinámico, sintetizador Web Audio, simulador Canvas y motor de juego.
- `README.txt` / `README.md`: Documentación completa del proyecto.
