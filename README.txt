# DiferencialLab 2.0 - Laboratorio Interactivo de Ecuaciones Diferenciales

Laboratorio web educativo y gamificado potenciado por Python, SymPy y Flask
para aprender, resolver, visualizar y jugar con ecuaciones diferenciales ordinarias (EDO).

=====================================================================
CÓMO INICIAR EL LABORATORIO
=====================================================================

Opción 1: Con Servidor Python (Recomendado - Activa SymPy Completo)
1. Haz doble clic en el archivo "iniciar_laboratorio.bat".
   O desde la terminal ejecuta:
   python app.py
2. Se iniciará el servidor Flask local y se abrirá en tu navegador:
   http://127.0.0.1:5000

Opción 2: Modo Navegador Directo (Offline / Standalone)
1. Haz doble clic en "index.html" para abrirlo directamente en Chrome, Edge o Firefox.
2. Funciona al 100% con su motor interno en JavaScript, banco de 32 preguntas y curiosidades.

=====================================================================
NOVEDADES DE LA VERSIÓN 2.0
=====================================================================

1. Curiosidades e Historias Fascinantes
- Ruleta de curiosidades interactiva con giro y sonido.
- Newton vs Leibniz, reto de la Braquistócrona de los Bernoulli.
- El colapso del puente de Tacoma Narrows por resonancia mecánica.
- Datación con Carbono-14, física de saltos en videojuegos con RK4.
- Ley de enfriamiento de Newton en una taza de café caliente.
- Farmacocinética y dosificación de medicamentos.

2. Trivia & Juego de Preguntas (DiferencialTrivia)
- Banco amplio de 32 preguntas aleatorias categorizadas.
- 3 Modos: Desafío Exprés (Contrarreloj 20s), Supervivencia (3 vidas), Práctica Libre.
- Sistema de combo con multiplicadores (x1.5, x2, x3) y rachas de fuego.
- Sonidos sintetizados en tiempo real con Web Audio API.
- Medallas y logros desbloqueables guardados en tu navegador.

3. Resolutor Simbólico con Python y SymPy
- Procedimiento paso a paso detallado y formateado con KaTeX.
- Modo guiado para familias clásicas (exponencial, Newton, lineal, oscilador, potencia).
- Modo entrada libre para escribir cualquier ecuación con SymPy.
- Cálculo de constante con condiciones iniciales y mini gráfica de la solución.

4. Visualizador & Simulador Dinámico (4 Modelos)
- Crecimiento / Desintegración Exponencial.
- Ley de Enfriamiento de Newton con asíntota ambiente Ta.
- Oscilador Armónico Amortiguado (regímenes subamortiguado, crítico, sobreamortiguado).
- Campo de Direcciones (Slope Field) con cuadrícula de pendientes y flujo de solución.
