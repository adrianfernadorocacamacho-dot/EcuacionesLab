/**
 * DiferencialLab v2.0 - Script Principal
 * Motor de interacción, audio Web Audio API, solucionador analítico/simbólico,
 * simulador gráfico de 4 modelos (incluyendo campo de direcciones) y juego de trivia.
 */

// ==============================================================================
// 1. HELPERS & SELECTORES
// ==============================================================================
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const views = ["inicio", "resolver", "aprender", "curiosidades", "practicar", "aplicaciones", "formularios"];
const labels = {
  inicio: "Inicio",
  resolver: "Calculadora Paso a Paso",
  aprender: "Aprende & Curiosidades",
  curiosidades: "Aprende & Curiosidades",
  practicar: "Trivia & Juego",
  aplicaciones: "Aplicaciones",
  formularios: "Formularios"
};

// Variable de estado de conectividad con el backend de Python
let isPythonConnected = false;

// ==============================================================================
// 2. SISTEMA DE AUDIO (WEB AUDIO API SINTETIZADO - 100% OFFLINE)
// ==============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("dl_muted") === "true";
    this.updateIcon();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.muted = !this.muted;
    localStorage.setItem("dl_muted", this.muted);
    this.updateIcon();
    if (!this.muted) this.playTone(523.25, 0.08, "sine");
  }

  updateIcon() {
    const btn = $("#soundToggle");
    if (btn) btn.textContent = this.muted ? "🔇" : "🔊";
  }

  playTone(freq, duration = 0.1, type = "sine", gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio no permitido o silenciado
    }
  }

  click() {
    this.playTone(440, 0.04, "triangle", 0.08);
  }

  correct() {
    if (this.muted) return;
    this.init();
    // Acorde ascendente C5 - E5 - G5
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.18, "sine", 0.15), idx * 70);
    });
  }

  incorrect() {
    if (this.muted) return;
    this.init();
    // Tono descendente suave
    [261.63, 196.00].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.16, "sawtooth", 0.1), idx * 100);
    });
  }

  streak() {
    if (this.muted) return;
    this.init();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.15, "triangle", 0.18), idx * 50);
    });
  }

  celebrate() {
    if (this.muted) return;
    this.init();
    // Fanfarria
    const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
    const delays = [0, 100, 200, 320, 440, 600];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.25, "sine", 0.2), delays[i]);
    });
  }
}

const sfx = new SoundFX();
$("#soundToggle").addEventListener("click", () => sfx.toggle());

// ==============================================================================
// 3. NAVEGACIÓN Y ENRUTAMIENTO DE VISTAS
// ==============================================================================
function go(view) {
  if (view === "curiosidades" || view === "visualizar") {
    view = "aprender";
  }
  if (!views.includes(view)) return;
  sfx.click();
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  $$(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $("#crumb").textContent = labels[view] || "Laboratorio";
  $("#sidebar").classList.remove("open");

  if (view === "aprender") {
    renderStudyAnswers();
    renderCuriosities();
  }
  if (view === "resolver") {
    solveEquation();
  }
  if (view === "formularios") {
    initFormulariosView();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-view]").forEach(b => b.addEventListener("click", (e) => {
  e.preventDefault();
  go(b.dataset.view);
}));

$$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

// Modo Oscuro Permanente (sin opción de cambio a claro)
try {
  localStorage.removeItem("dl_theme");
  document.body.classList.remove("light-mode");
} catch (e) {}

// Renderizado con KaTeX seguro
function renderMath(targetEl, latexString, displayMode = false) {
  if (!targetEl) return;
  if (window.katex) {
    try {
      window.katex.render(latexString, targetEl, { throwOnError: false, displayMode: displayMode });
      return;
    } catch (e) {}
  }
  targetEl.textContent = latexString;
}

// ==============================================================================
// 4. DETECCIÓN DE BACKEND EN PYTHON (FLASK + SYMPY)
// ==============================================================================
async function checkPythonBackend() {
  const pill = $("#backendPill");
  const text = $("#backendStatusText");
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      isPythonConnected = true;
      pill.className = "backend-pill online";
      text.textContent = "Servidor Activo";
      pill.title = `Conectado al servidor Python local`;
      $("#solverEngineNote").textContent = "✦ Modo didáctico: Explicación pedagógica detallada paso a paso.";
      return true;
    }
  } catch (e) {
    // Modo local / estático
  }
  isPythonConnected = false;
  pill.className = "backend-pill offline";
  text.textContent = "Modo Navegador";
  pill.title = "Ejecutando con motor JavaScript local.";
  $("#solverEngineNote").textContent = "✦ Modo didáctico: Resuelve paso a paso con explicaciones claras.";
  return false;
}

// ==============================================================================
// 5. MÓDULO APRENDE: LECCIONES MATEMÁTICAS
// ==============================================================================
const lessons = {
  concepto: {
    title: "¿Qué es una ecuación diferencial?",
    intro: "Es una ecuación matemática que establece una relación entre una función incógnita y una o más de sus derivadas respecto a sus variables independientes.",
    formula: "\\frac{dy}{dx} = f(x, y)",
    a: "Variable dependiente: y",
    ap: "Representa la magnitud que evoluciona o se transforma en el tiempo o espacio (ejemplo: población, temperatura, posición).",
    b: "Variable independiente: x o t",
    bp: "La variable de referencia respecto a la cual se mide la tasa de cambio (habitualmente el tiempo t o la posición x).",
    end: "Ejemplo clásico: y' = 2y indica que la tasa instantánea de crecimiento de una magnitud es exactamente el doble de su valor actual."
  },
  clasificacion: {
    title: "Orden, Grado y Linealidad",
    intro: "Clasificar correctamente una ecuación es el primer paso indispensable para elegir el método de resolución apropiado.",
    formula: "a_n(x)\\frac{d^n y}{dx^n} + \\dots + a_1(x)\\frac{dy}{dx} + a_0(x)y = g(x)",
    a: "Orden y Grado",
    ap: "El orden es la derivada más alta que aparece en la ecuación (ej: y'' es orden 2). El grado es la potencia entera a la que está elevada dicha derivada de mayor orden.",
    b: "Linealidad",
    bp: "Es lineal si la incógnita 'y' y todas sus derivadas tienen exponente 1, no se multiplican entre sí ni están dentro de funciones no lineales como sen(y) o e^y.",
    end: "Las ecuaciones diferenciales también se dividen en Ordinarias (EDO, una sola variable independiente) y en Derivadas Parciales (EDP, dos o más variables independientes)."
  },
  metodos: {
    title: "Métodos Analíticos Principales",
    intro: "Dependiendo de la estructura algebraica de la ecuación, existen diferentes caminos analíticos de resolución.",
    formula: "\\text{Variables Separables} \\;\\cdot\\; \\text{Factor Integrante} \\;\\cdot\\; \\text{Ecuaciones Exactas}",
    a: "Variables Separables",
    ap: "Se aplica cuando g(y) dy = f(x) dx permite agrupar todas las 'y' en un lado y las 'x' en el otro para luego integrar ambos miembros.",
    b: "Factor Integrante μ(x)",
    bp: "Para la forma estándar y' + P(x)y = Q(x), se multiplica por μ(x) = exp(∫ P(x) dx) convirtiendo el lado izquierdo en la derivada del producto d/dx [μ(x)y].",
    end: "Otras técnicas incluyen el método de coeficientes indeterminados, variación de parámetros, transformada de Laplace y métodos numéricos como Euler y Runge-Kutta."
  },
  segundo_orden: {
    title: "Ecuaciones de 2º Orden y Oscilaciones",
    intro: "Fundamentales en física e ingeniería para describir ondas, circuitos RLC y sistemas mecánicos oscilatorios.",
    formula: "m\\,y'' + c\\,y' + k\\,y = 0 \\implies r = \\frac{-c \\pm \\sqrt{c^2 - 4mk}}{2m}",
    a: "Ecuación Característica",
    ap: "Al proponer y = e^(rx), se obtiene la ecuación algebraica ar² + br + c = 0. La naturaleza de sus raíces (reales distintas, reales repetidas o complejas) define el comportamiento.",
    b: "Regímenes de Amortiguamiento",
    bp: "Subamortiguado (oscila decreciendo), Crítico (retorna al equilibrio en el menor tiempo sin oscilar) y Sobreamortiguado (retorno lento).",
    end: "¡El colapso de puentes y la amortiguación de vehículos se diseñan calculando estas tres soluciones!"
  }
};

function renderLesson(key) {
  const d = lessons[key];
  if (!d) return;
  const container = $("#lessonContent");
  container.innerHTML = `
    <h2>${d.title}</h2>
    <p>${d.intro}</p>
    <div class="math-block" id="lessonMathFormula"></div>
    <div class="lesson-columns">
      <div class="lesson-mini">
        <strong>${d.a}</strong>
        <p>${d.ap}</p>
      </div>
      <div class="lesson-mini">
        <strong>${d.b}</strong>
        <p>${d.bp}</p>
      </div>
    </div>
    <p>${d.end}</p>
  `;
  renderMath($("#lessonMathFormula"), d.formula);
}

$$(".topic-tab").forEach(b => b.addEventListener("click", () => {
  sfx.click();
  $$(".topic-tab").forEach(t => t.classList.toggle("active", t === b));
  renderLesson(b.dataset.topic);
}));
renderLesson("concepto");

// ==============================================================================
// 6. MÓDULO CURIOSIDADES: DATOS FASCINANTES & HISTORIAS
// ==============================================================================
const CURIOSIDADES_LOCAL = [
  {
    id: "newton-leibniz",
    categoria: "historia",
    icono: "⚔️",
    titulo: "La Guerra de los Titanes: Newton vs. Leibniz",
    subtitulo: "¿De quién es el cálculo?",
    contenido: "Isaac Newton inventó su versión del cálculo usando 'fluxiones' para calcular el movimiento planetario, pero mantuvo sus notas en secreto. Gottfried Leibniz desarrolló la notación dy/dx e ∫ que usamos hoy. ¡La notación de Leibniz era tan clara que Europa continental avanzó más de 100 años más rápido en ecuaciones diferenciales que Inglaterra!",
    impacto: "Una buena notación matemática potencia el pensamiento humano."
  },
  {
    id: "braquistocrona",
    categoria: "historia",
    icono: "🦁",
    titulo: "El Reto de la Braquistócrona",
    subtitulo: "'Reconozco al león por sus garras'",
    contenido: "En 1696, Johann Bernoulli desafió a Europa a encontrar la curva donde una canica cae más rápido entre dos puntos. Newton lo resolvió en una sola noche anónimamente. Bernoulli exclamó: '¡Reconozco al león por sus garras!'. La solución era una cicloide y dio origen al Cálculo de Variaciones.",
    impacto: "Nacimiento del Cálculo de Variaciones y optimización de trayectorias."
  },
  {
    id: "tacoma-narrows",
    categoria: "mundo_real",
    icono: "🌉",
    titulo: "El Colapso del Puente de Tacoma Narrows",
    subtitulo: "Cuando una EDO hace temblar al mundo",
    contenido: "El 7 de noviembre de 1940, un viento moderado de 68 km/h generó vórtices periódicos que coincidieron con la frecuencia natural de torsión del puente. El fenómeno se modela matemáticamente con la EDO de segundo orden de un oscilador forzado.",
    impacto: "Las EDOs salvan vidas garantizando la estabilidad de puentes y rascacielos."
  },
  {
    id: "euler-ciego",
    categoria: "anecdotas",
    icono: "👁️",
    titulo: "Leonhard Euler: Calculando en la Oscuridad",
    subtitulo: "El cerebro más prolífico de la historia",
    contenido: "Euler perdió la vista de ambos ojos pero declaró con optimismo: 'Ahora tendré menos distracciones'. Dictó más de la mitad de su gigantesca producción científica estando ciego, e inventó el 'Método de Euler' para aproximar EDOs.",
    impacto: "Euler publicó más de 850 artículos científicos a lo largo de su vida."
  },
  {
    id: "carbono-14",
    categoria: "mundo_real",
    icono: "⏳",
    titulo: "El Reloj Atómico del Carbono-14",
    subtitulo: "Descifrando la edad de la historia",
    contenido: "Los seres vivos absorben Carbono-14 mientras viven. Al morir, este se desintegra según dN/dt = -λN, con vida media de 5,730 años. Willard Libby ganó el Nobel en 1960 gracias a esto, permitiendo datar fósiles prehistóricos.",
    impacto: "Una sola ecuación diferencial convirtió la arqueología en una ciencia exacta."
  },
  {
    id: "peces-adriatico",
    categoria: "mundo_real",
    icono: "🐟",
    titulo: "El Enigma de los Peces del Adriático",
    subtitulo: "Modelo Depredador-Presa de Lotka-Volterra",
    contenido: "Durante la 1ª Guerra Mundial cesó la pesca en el Adriático. Vito Volterra formuló un sistema de EDOs no lineales que demostró matemáticamente por qué suspender la pesca favorece más a los peces depredadores en la cima de la cadena alimenticia.",
    impacto: "Nacimiento de la biomatemática y gestión moderna de ecosistemas."
  },
  {
    id: "cafe-newton",
    categoria: "mundo_real",
    icono: "☕",
    titulo: "¿Cuándo ponerle leche al café caliente?",
    subtitulo: "El truco térmico de la Ley de Enfriamiento",
    contenido: "Según dT/dt = -k(T - Ta), el calor se disipa más rápido cuanto mayor es la diferencia térmica con el aire. Si pones la leche fría de inmediato, reduces el salto térmico y el café se enfriará mucho más despacio en los siguientes minutos.",
    impacto: "Física térmica cotidiana gobernada por una ecuación diferencial separable."
  },
  {
    id: "videojuegos-rk4",
    categoria: "tecnologia",
    icono: "🎮",
    titulo: "Los Saltos en Videojuegos y Runge-Kutta",
    subtitulo: "La física detrás de tus juegos favoritos",
    contenido: "En cada fotograma (60 o 120 FPS), los motores gráficos integran las EDOs de Newton de la cinemática. El método de Runge-Kutta 4 (RK4) y Verlet calculan trayectorias sin acumular error, evitando que las físicas 'rompan' el juego.",
    impacto: "Base computacional de la simulación de fluidos, telas y gravedad en 3D."
  },
  {
    id: "soldados-puente",
    categoria: "historia",
    icono: "🥾",
    titulo: "¡Rompan el Paso! La Orden Militar del Siglo XIX",
    subtitulo: "Por qué los soldados no marchan en los puentes",
    contenido: "En 1831 colapsó el puente de Broughton cuando 74 soldados marchaban al unísono. Sus pasos entraron en resonancia con la solución armónica del puente. Desde entonces, existe la orden militar internacional obligatoria de romper el paso.",
    impacto: "La resonancia mecánica explicada por raíces complejas en EDOs de segundo orden."
  },
  {
    id: "farmacocinetica",
    categoria: "mundo_real",
    icono: "💊",
    titulo: "Farmacocinética: ¿Cada cuántas horas medicar?",
    subtitulo: "La química en tu cuerpo es una EDO",
    contenido: "La concentración de un fármaco en sangre sigue la ecuación dC/dt = ka*Dose - ke*C. Los médicos usan esta ecuación diferencial para calcular la dosis exacta y evitar toxicidad manteniendo el efecto terapéutico.",
    impacto: "Cálculo de regímenes de quimioterapia y tratamientos con antibióticos."
  },
  {
    id: "poincare-caos",
    categoria: "historia",
    icono: "🦋",
    titulo: "Henri Poincaré y el Efecto Mariposa",
    subtitulo: "El límite de lo predecible",
    contenido: "Al estudiar las EDOs del Problema de los Tres Cuerpos, Poincaré descubrió que variaciones infinitesimales en condiciones iniciales causan trayectorias caóticas impredecibles. De ahí nació la Teoría del Caos.",
    impacto: "Explicación matemática de por qué el pronóstico del clima a largo plazo es imposible."
  },
  {
    id: "epidemiologia-sir",
    categoria: "mundo_real",
    icono: "🦠",
    titulo: "El Modelo SIR y la Inmunidad de Rebaño",
    subtitulo: "Kermack y McKendrick en 1927",
    contenido: "El modelo divide a la población en Susceptibles, Infectados y Recuperados mediante 3 EDOs acopladas. Demostró que no es necesario vacunar al 100% de la población para erradicar una epidemia, sino superar el umbral crítico.",
    impacto: "Pilar esencial de las políticas de salud pública y vacunación mundial."
  }
];

let activeCuriosityFilter = "todas";

function renderCuriosities() {
  const container = $("#curiosityGrid");
  if (!container) return;
  const filtered = activeCuriosityFilter === "todas"
    ? CURIOSIDADES_LOCAL
    : CURIOSIDADES_LOCAL.filter(c => c.categoria === activeCuriosityFilter);

  container.innerHTML = filtered.map(c => `
    <article class="curiosity-card">
      <div class="curiosity-card-top">
        <span class="curiosity-card-icon">${c.icono}</span>
        <div class="curiosity-card-meta">
          <h4>${c.titulo}</h4>
          <small>${c.subtitulo}</small>
        </div>
      </div>
      <div class="curiosity-card-body">
        <p>${c.contenido}</p>
      </div>
      <div class="curiosity-impact">
        <span>✦ Impacto:</span> ${c.impacto}
      </div>
    </article>
  `).join("");
}

function showRandomCuriosity(targetContainerId = "curiosityFeaturedCard") {
  const randomFact = CURIOSIDADES_LOCAL[Math.floor(Math.random() * CURIOSIDADES_LOCAL.length)];
  const box = $(`#${targetContainerId}`);
  if (!box) return;

  // Animación del dado interactivo
  const diceList = $$(".dice-emoji");
  diceList.forEach(d => {
    d.classList.remove("rolling");
    void d.offsetWidth; // reiniciar animación
    d.classList.add("rolling");
  });

  sfx.streak();
  box.style.opacity = "0";
  setTimeout(() => {
    box.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; margin-bottom:10px;">
        <span style="font-size:32px;">${randomFact.icono}</span>
        <div>
          <h4 style="margin:0; font:700 16px 'Space Grotesk',sans-serif; color:#fff;">${randomFact.titulo}</h4>
          <span style="font-size:11px; color:var(--blue); font-weight:600;">${randomFact.subtitulo}</span>
        </div>
      </div>
      <p style="font-size:12px; line-height:1.7; color:#9cb5ce; margin:0 0 10px;">${randomFact.contenido}</p>
      <div style="font-size:11px; color:var(--mint); font-weight:600;">💡 ${randomFact.impacto}</div>
    `;
    box.style.transition = "opacity 0.3s ease";
    box.style.opacity = "1";
  }, 180);
}

// Eventos para tirar el dado (botón y clic directo sobre el dado)
$("#btnRollCuriosity")?.addEventListener("click", () => showRandomCuriosity("curiosityFeaturedCard"));
$("#mainDiceIcon")?.addEventListener("click", () => showRandomCuriosity("curiosityFeaturedCard"));
showRandomCuriosity("curiosityFeaturedCard");

// Botón del Dato Curioso en el Inicio
$("#btnNextCuriosity")?.addEventListener("click", () => {
  const c = CURIOSIDADES_LOCAL[Math.floor(Math.random() * CURIOSIDADES_LOCAL.length)];
  sfx.click();
  $("#spotlightIcon").textContent = c.icono;
  $("#spotlightTitle").textContent = c.titulo;
  $("#spotlightText").textContent = c.contenido;
});

// Filtros por Categoría
$$(".filter-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    sfx.click();
    $$(".filter-chip").forEach(b => b.classList.toggle("active", b === btn));
    activeCuriosityFilter = btn.dataset.cat;
    renderCuriosities();
  });
});

// ==============================================================================
// 7. MÓDULO RESOLUTOR (SYMPY EN PYTHON + MOTOR CLIENTE DE RESPALDO)
// ==============================================================================
let solverMode = "preset"; // "preset" o "custom"

$("#btnModePreset")?.addEventListener("click", () => {
  solverMode = "preset";
  $("#btnModePreset").classList.add("active");
  $("#btnModeCustom").classList.remove("active");
  $("#presetControlsArea").style.display = "block";
  $("#customControlsArea").style.display = "none";
  sfx.click();
  solveEquation();
});

$("#btnModeCustom")?.addEventListener("click", () => {
  solverMode = "custom";
  $("#btnModeCustom").classList.add("active");
  $("#btnModePreset").classList.remove("active");
  $("#presetControlsArea").style.display = "none";
  $("#customControlsArea").style.display = "block";
  sfx.click();
  solveEquation();
});

$$(".example-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    $("#customEquationInput").value = chip.dataset.eq;
    sfx.click();
    solveEquation();
  });
});

$("#solverType")?.addEventListener("change", () => {
  const val = $("#solverType").value;
  const colB = $("#paramSecondCol");
  const row1 = $("#paramsRow1");
  const cond2 = $("#secondOrderCond");

  if (val === "exp") {
    $("#labelParamA").textContent = "Tasa k";
    colB.style.display = "none";
    cond2.style.display = "none";
  } else if (val === "cooling") {
    $("#labelParamA").textContent = "Constante k";
    $("#labelParamB").textContent = "Temp. Ambiente Ta";
    colB.style.display = "block";
    cond2.style.display = "none";
  } else if (val === "linear") {
    $("#labelParamA").textContent = "Coeficiente a";
    $("#labelParamB").textContent = "Término constante b";
    colB.style.display = "block";
    cond2.style.display = "none";
  } else if (val === "power") {
    $("#labelParamA").textContent = "Coeficiente a";
    $("#labelParamB").textContent = "Exponente n (entero)";
    colB.style.display = "block";
    cond2.style.display = "none";
  } else if (val === "harmonic") {
    $("#labelParamA").textContent = "Frecuencia angular ω²";
    colB.style.display = "none";
    cond2.style.display = "block";
  }
  solveEquation();
});

async function solveEquation() {
  if (!$("#initialX0")) return;
  const x0 = Number($("#initialX0").value) || 0;
  const y0 = Number($("#initialY0").value) || 1;
  const y1 = Number($("#initialY1").value) || 0;

  // Si el backend de Python está activo, intentar resolver con SymPy
  if (isPythonConnected) {
    try {
      const payload = {
        type: solverMode,
        x0: x0,
        y0: y0,
        y1: y1
      };
      if (solverMode === "custom") {
        payload.type = "custom";
        payload.equation = ($("#customEquationInput")?.value || "").trim();
        if (!payload.equation) return;
      } else {
        const val = $("#solverType").value;
        const a = Number($("#paramA").value) || 2;
        const b = Number($("#paramB").value) || 4;
        payload.type = val;
        payload.model = val;
        payload.k = a;
        payload.a = a;
        payload.b = b;
        payload.n = Math.floor(b);
        payload.Ta = b;
        payload.omega2 = a;
      }

      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        renderSolverResult(data);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (solverMode === "custom") {
          renderSolverError(
            errData.error || "No se pudo resolver la ecuación",
            errData.detalles || "Verifica la sintaxis (ejemplo: y' = 3*y, y' + 2*y = 4, y'' + 9*y = 0)"
          );
          return;
        }
      }
    } catch (e) {
      // Fallback a motor cliente
    }
  }

  // Motor cliente de respaldo (JavaScript puro)
  solveClientFallback(x0, y0, y1);
}

function renderSolverError(msg, details) {
  $("#solutionTitle").textContent = "Error de Sintaxis / Resolución";
  $("#latexEquation").textContent = $("#customEquationInput")?.value || "y' = f(x, y)";
  $("#solutionSteps").innerHTML = `
    <div class="step" style="border-left-color: #ef4444;">
      <span class="step-num" style="background: rgba(239, 68, 68, 0.3); color: #f87171;">⚠️</span>
      <div>
        <strong style="color: #f87171;">${msg}</strong>
        <p style="color: #fca5a5; font-size: 11.5px; margin-top: 4px;">${details}</p>
      </div>
    </div>
  `;
  $("#solutionAnswer").textContent = "No disponible";
  const canvas = $("#miniSolverCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function renderSolverResult(data) {
  $("#solutionTitle").textContent = `Ecuación resuelta: ${data.equation_input || ""}`;
  renderMath($("#latexEquation"), data.latex_eq || data.equation_input || "y' = f(x, y)", true);

  const stepsContainer = $("#solutionSteps");
  stepsContainer.innerHTML = "";
  (data.steps || []).forEach(s => {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step";
    
    const numSpan = document.createElement("span");
    numSpan.className = "step-num";
    numSpan.textContent = s.num;
    
    const bodyDiv = document.createElement("div");
    bodyDiv.style.flex = "1";
    
    const titleStrong = document.createElement("strong");
    titleStrong.textContent = s.titulo;
    bodyDiv.appendChild(titleStrong);
    
    const desc = s.descripcion || "";
    if (desc.includes("\n\n")) {
      const parts = desc.split("\n\n");
      const introP = document.createElement("p");
      introP.textContent = parts[0];
      bodyDiv.appendChild(introP);
      
      const mathBox = document.createElement("div");
      mathBox.className = "step-math-box";
      renderMath(mathBox, parts.slice(1).join("\n\n"), true);
      bodyDiv.appendChild(mathBox);
    } else if (desc.includes(": ") && (desc.includes("\\") || desc.includes("y{"))) {
      const idx = desc.indexOf(": ");
      const intro = desc.substring(0, idx + 1);
      const math = desc.substring(idx + 2);
      
      const introP = document.createElement("p");
      introP.textContent = intro;
      bodyDiv.appendChild(introP);
      
      const mathBox = document.createElement("div");
      mathBox.className = "step-math-box";
      renderMath(mathBox, math, true);
      bodyDiv.appendChild(mathBox);
    } else {
      const introP = document.createElement("p");
      introP.textContent = desc;
      bodyDiv.appendChild(introP);
    }
    
    stepDiv.appendChild(numSpan);
    stepDiv.appendChild(bodyDiv);
    stepsContainer.appendChild(stepDiv);
  });

  const solTarget = $("#solutionAnswer");
  if (data.latex_particular) {
    renderMath(solTarget, data.latex_particular, true);
  } else if (data.latex_general) {
    renderMath(solTarget, data.latex_general, true);
  } else {
    solTarget.textContent = data.str_particular || data.str_general || "Solución encontrada";
  }

  if (data.plot_points && data.plot_points.length > 0) {
    drawMiniSolverChart(data.plot_points);
  }
}

function solveClientFallback(x0, y0, y1) {
  const type = $("#solverType").value;
  const a = Number($("#paramA").value) || 2;
  const b = Number($("#paramB").value) || 4;
  let title = "", steps = [], answerLatex = "", eqLatex = "";
  let points = [];

  if (type === "exp") {
    title = "Crecimiento / Decaimiento Exponencial";
    eqLatex = `\\frac{dy}{dx} = ${a}y`;
    const C = Number((y0 / Math.exp(a * x0)).toFixed(3));
    answerLatex = `y(x) = ${C}\\,e^{${a}x}`;
    steps = [
      { num: 1, titulo: "Identificación de Variables y Forma Estándar", descripcion: `Ecuación diferencial de variables separables:\n\n\\frac{dy}{dx} = ${a}y` },
      { num: 2, titulo: "Clasificación de la Ecuación", descripcion: "Ecuación Diferencial Ordinaria (EDO) de 1er Orden homogénea lineal." },
      { num: 3, titulo: "Separación de Variables", descripcion: `Dividimos entre y y multiplicamos por dx para aislar variables:\n\n\\frac{dy}{y} = ${a}\\,dx` },
      { num: 4, titulo: "Integración de Ambos Miembros", descripcion: `Integramos ambos lados de la igualdad:\n\n\\int \\frac{dy}{y} = \\int ${a}\\,dx \\implies \\ln|y| = ${a}x + c` },
      { num: 5, titulo: "Despeje Exponencial y Solución General", descripcion: `Aplicamos la función exponencial e^(·) y renombramos e^c como C:\n\ny(x) = C\\,e^{${a}x}` },
      { num: 6, titulo: "Aplicación del Problema de Valor Inicial (PVI)", descripcion: `Sustituimos la condición inicial y(${x0}) = ${y0}:\n\n${y0} = C\\,e^{${a}(${x0})} \\implies C = ${C}` },
      { num: 7, titulo: "Solución Particular Única", descripcion: `Reemplazando el valor de la constante hallada:\n\n${answerLatex}` }
    ];
    for (let x = 0; x <= 5; x += 0.05) {
      points.push({ x: Number(x.toFixed(2)), y: C * Math.exp(a * x) });
    }
  } else if (type === "cooling") {
    title = "Ley de Enfriamiento de Newton";
    eqLatex = `\\frac{dy}{dx} = -${a}(y - ${b})`;
    const C = y0 - b;
    answerLatex = `y(x) = ${b} + (${C})\\,e^{-${a}x}`;
    steps = [
      { num: 1, titulo: "Identificación del Modelo Térmico", descripcion: `La tasa de cambio de temperatura es proporcional a la diferencia con el ambiente (Ta = ${b}°C):\n\n\\frac{dy}{dx} = -${a}(y - ${b})` },
      { num: 2, titulo: "Clasificación de la Ecuación", descripcion: "EDO de 1er Orden separable con asíntota horizontal hacia la temperatura ambiente." },
      { num: 3, titulo: "Separación de Variables", descripcion: `Dividimos entre (y - ${b}) y multiplicamos por dx:\n\n\\frac{dy}{y - ${b}} = -${a}\\,dx` },
      { num: 4, titulo: "Integración Indefinida", descripcion: `Integramos ambos miembros:\n\n\\int \\frac{dy}{y - ${b}} = \\int -${a}\\,dx \\implies \\ln|y - ${b}| = -${a}x + c` },
      { num: 5, titulo: "Solución General de la Temperatura", descripcion: `Despejamos la función y(x) aplicando exponenciales:\n\ny(x) = ${b} + C\\,e^{-${a}x}` },
      { num: 6, titulo: "Aplicación de la Condición Inicial", descripcion: `Evaluamos para y(0) = ${y0}°C para hallar la constante C:\n\n${y0} = ${b} + C \\implies C = ${C}` },
      { num: 7, titulo: "Solución Particular de Enfriamiento", descripcion: `Función exacta de la temperatura en el tiempo:\n\n${answerLatex}` }
    ];
    for (let x = 0; x <= 5; x += 0.05) {
      points.push({ x: Number(x.toFixed(2)), y: b + C * Math.exp(-a * x) });
    }
  } else if (type === "linear") {
    title = "Ecuación Lineal de 1er Orden";
    eqLatex = `y' + ${a}y = ${b}`;
    const yp = a !== 0 ? b / a : 0;
    const C = y0 - yp;
    answerLatex = `y(x) = ${yp} + (${C})\\,e^{-${a}x}`;
    steps = [
      { num: 1, titulo: "Identificación de la Forma Canónica", descripcion: `Ecuación lineal estándar y' + P(x)y = Q(x) con P(x) = ${a} y Q(x) = ${b}:\n\n\\frac{dy}{dx} + ${a}y = ${b}` },
      { num: 2, titulo: "Cálculo del Factor Integrante μ(x)", descripcion: `Calculamos el factor integrante μ(x) = e^(∫ ${a} dx):\n\n\\mu(x) = e^{${a}x}` },
      { num: 3, titulo: "Multiplicación y Derivada del Producto", descripcion: `Multiplicamos por μ(x) reconociendo la derivada del producto d/dx[μ·y]:\n\n\\frac{d}{dx}\\left[y \\cdot e^{${a}x}\\right] = ${b}e^{${a}x}` },
      { num: 4, titulo: "Integración de Ambos Lados", descripcion: `Integramos con respecto a x:\n\ny \\cdot e^{${a}x} = \\frac{${b}}{${a}}e^{${a}x} + C` },
      { num: 5, titulo: "Solución General", descripcion: `Dividimos entre el factor integrante e^(${a}x):\n\ny(x) = ${yp} + C\\,e^{-${a}x}` },
      { num: 6, titulo: "Evaluación de la Condición Inicial", descripcion: `Sustituyendo y(0) = ${y0}:\n\n${y0} = ${yp} + C \\implies C = ${C}` },
      { num: 7, titulo: "Solución Particular Única", descripcion: `Reemplazando el valor de la constante:\n\n${answerLatex}` }
    ];
    for (let x = 0; x <= 5; x += 0.05) {
      points.push({ x: Number(x.toFixed(2)), y: yp + C * Math.exp(-a * x) });
    }
  } else if (type === "harmonic") {
    title = "Oscilador Armónico Libre (2º Orden)";
    eqLatex = `y'' + ${a}y = 0`;
    const w = Math.sqrt(Math.max(0.1, a));
    answerLatex = `y(x) = ${y0}\\cos(${w.toFixed(2)}x) + ${(y1/w).toFixed(2)}\\sin(${w.toFixed(2)}x)`;
    steps = [
      { num: 1, titulo: "Identificación del Oscilador de 2º Orden", descripcion: `EDO lineal homogénea con coeficientes constantes que modela movimiento armónico:\n\n\\frac{d^2y}{dx^2} + ${a}y = 0` },
      { num: 2, titulo: "Planteamiento de la Ecuación Característica", descripcion: `Proponemos y = e^(rx). Sustituyendo obtenemos la ecuación cuadrática:\n\nr^2 + ${a} = 0` },
      { num: 3, titulo: "Cálculo de Raíces Complejas Conjugadas", descripcion: `Despejando r obtenemos raíces imaginarias:\n\nr = \\pm ${w.toFixed(2)}i` },
      { num: 4, titulo: "Aplicación de la Fórmula de Euler y Solución General", descripcion: `Las raíces imaginarias producen oscilaciones reales con senos y cosenos:\n\ny(x) = C_1\\cos(${w.toFixed(2)}x) + C_2\\sin(${w.toFixed(2)}x)` },
      { num: 5, titulo: "Aplicación del PVI (Posición y Velocidad)", descripcion: `Evaluando y(0) = ${y0} e y'(0) = ${y1}:\n\nC_1 = ${y0}, \\quad C_2 = ${(y1/w).toFixed(2)}` },
      { num: 6, titulo: "Solución Particular Oscilatoria", descripcion: `Trayectoria armónica exacta:\n\n${answerLatex}` }
    ];
    for (let x = 0; x <= 5; x += 0.05) {
      points.push({ x: Number(x.toFixed(2)), y: y0 * Math.cos(w * x) + (y1 / w) * Math.sin(w * x) });
    }
  } else {
    title = "Ecuación Potencial";
    const pow = Math.floor(b) + 1;
    eqLatex = `y' = ${a}x^{${Math.floor(b)}}`;
    answerLatex = `y(x) = \\frac{${a}}{${pow}}x^{${pow}} + ${y0}`;
    steps = [
      { num: 1, titulo: "Identificación de Integración Directa", descripcion: `La derivada solo depende de una potencia de x:\n\n\\frac{dy}{dx} = ${a}x^{${Math.floor(b)}}` },
      { num: 2, titulo: "Separación de Diferenciales", descripcion: `Multiplicamos por dx:\n\ndy = ${a}x^{${Math.floor(b)}}\\,dx` },
      { num: 3, titulo: "Integración por Regla de la Potencia", descripcion: `Aplicamos ∫ x^n dx = x^(n+1)/(n+1):\n\ny(x) = \\int ${a}x^{${Math.floor(b)}} dx = \\frac{${a}}{${pow}}x^{${pow}} + C` },
      { num: 4, titulo: "Evaluación de Condición Inicial", descripcion: `Evaluando y(0) = ${y0}:\n\nC = ${y0}` },
      { num: 5, titulo: "Solución Particular", descripcion: `Resultado final:\n\n${answerLatex}` }
    ];
    for (let x = 0; x <= 5; x += 0.05) {
      points.push({ x: Number(x.toFixed(2)), y: (a / pow) * Math.pow(x, pow) + y0 });
    }
  }

  renderSolverResult({
    equation_input: title,
    latex_eq: eqLatex,
    steps: steps,
    latex_particular: answerLatex,
    plot_points: points
  });
}

function drawMiniSolverChart(points) {
  const canvas = $("#miniSolverCanvas");
  if (!canvas || !points || points.length === 0) return;
  const container = canvas.parentElement;
  const w = container ? Math.max(200, Math.floor(container.clientWidth - 24)) : 300;
  const h = 130;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#09182a";
  ctx.fillRect(0, 0, w, h);

  const ys = points.map(p => p.y);
  let minY = Math.min(...ys), maxY = Math.max(...ys);
  if (minY === maxY) { minY -= 1; maxY += 1; }
  const xs = points.map(p => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const pad = 18;

  const X = x => pad + ((x - minX) / (maxX - minX || 1)) * (w - 2 * pad);
  const Y = y => h - pad - ((y - minY) / (maxY - minY)) * (h - 2 * pad);

  // Ejes
  ctx.strokeStyle = "#1e3752";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();

  // Curva
  ctx.strokeStyle = "#55dfbd";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, i) => {
    const cx = X(p.x), cy = Y(p.y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();
}

$("#solveButton")?.addEventListener("click", () => {
  sfx.click();
  solveEquation();
});
$("#customEquationInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sfx.click();
    solveEquation();
  }
});
["paramA", "paramB", "initialX0", "initialY0", "initialY1"].forEach(id => {
  $("#" + id)?.addEventListener("input", solveEquation);
});

// ==============================================================================
// 8. MÓDULO VISUALIZADOR & SIMULADOR (4 MODELOS INTERACTIVOS)
// ==============================================================================
let activeSim = "exp";

const simConfigs = {
  exp: {
    title: "y' = k·y",
    eyebrow: "MODELO EXPONENCIAL",
    desc: "Crecimiento continuo (k > 0) o decaimiento radiactivo (k < 0). Solución: y(t) = y₀·e^(kt).",
    controls: `
      <label for="simK">Tasa k: <strong id="valSimK">0.50</strong></label>
      <input id="simK" type="range" min="-1.5" max="1.5" step="0.1" value="0.5">
      <label for="simY0">Valor Inicial y₀: <strong id="valSimY0">1.0</strong></label>
      <input id="simY0" type="range" min="0.2" max="3.0" step="0.2" value="1.0">
    `,
    insights: (k, y0) => {
      if (k > 0.05) {
        $("#behaviorTitle").textContent = "Crecimiento Exponencial Rápido";
        $("#behaviorText").textContent = `Como k = ${k.toFixed(2)} es positivo, la población se expande a una tasa acelerada.`;
      } else if (k < -0.05) {
        $("#behaviorTitle").textContent = "Decaimiento Exponencial (Vida Media)";
        $("#behaviorText").textContent = `Como k = ${k.toFixed(2)} es negativo, la sustancia se extingue tendiendo asintóticamente a 0.`;
      } else {
        $("#behaviorTitle").textContent = "Equilibrio Constante";
        $("#behaviorText").textContent = "Cuando k = 0, no hay cambio neto y la solución permanece fija en y₀.";
      }
    }
  },
  cooling: {
    title: "dT/dt = -k·(T - Ta)",
    eyebrow: "LEY DE ENFRIAMIENTO DE NEWTON",
    desc: "El café caliente o un cuerpo pierde calor a una velocidad proporcional a la diferencia con la temperatura ambiente Ta.",
    controls: `
      <label for="simCoolK">Coeficiente k: <strong id="valSimCoolK">0.08</strong></label>
      <input id="simCoolK" type="range" min="0.01" max="0.25" step="0.01" value="0.08">
      <label for="simT0">Temperatura Inicial T₀: <strong id="valSimT0">85°C</strong></label>
      <input id="simT0" type="range" min="30" max="100" step="5" value="85">
      <label for="simTa">Temperatura Ambiente Ta: <strong id="valSimTa">22°C</strong></label>
      <input id="simTa" type="range" min="0" max="40" step="2" value="22">
    `,
    insights: (k, T0, Ta) => {
      $("#behaviorTitle").textContent = "Aproximación Asintótica al Ambiente";
      $("#behaviorText").textContent = `El líquido arranca a ${T0}°C y se enfriará hasta estabilizarse en ${Ta}°C. La velocidad de enfriamiento es máxima al inicio.`;
      $("#conditionTitle").textContent = "Salto Térmico Inicial ΔT";
      $("#conditionText").textContent = `La diferencia inicial es de ${Math.abs(T0 - Ta)}°C, determinando la pendiente inicial de la curva.`;
    }
  },
  damped: {
    title: "y″ + 2γ·y′ + ω₀²·y = 0",
    eyebrow: "OSCILADOR ARMÓNICO AMORTIGUADO",
    desc: "Modela la suspensión de un automóvil, un péndulo con fricción o un circuito resonante RLC.",
    controls: `
      <label for="simGamma">Amortiguamiento γ: <strong id="valSimGamma">0.25</strong></label>
      <input id="simGamma" type="range" min="0.0" max="2.5" step="0.05" value="0.25">
      <label for="simOmega">Frecuencia Natural ω₀: <strong id="valSimOmega">2.0</strong></label>
      <input id="simOmega" type="range" min="0.5" max="4.0" step="0.25" value="2.0">
      <label for="simAmp">Amplitud Inicial y₀: <strong id="valSimAmp">2.5</strong></label>
      <input id="simAmp" type="range" min="0.5" max="4.0" step="0.5" value="2.5">
    `,
    insights: (gamma, omega) => {
      if (gamma < omega) {
        $("#behaviorTitle").textContent = "Régimen Subamortiguado";
        $("#behaviorText").textContent = "La fricción es baja: el sistema oscila de lado a lado con una envolvente que decrece exponencialmente.";
      } else if (Math.abs(gamma - omega) < 0.1) {
        $("#behaviorTitle").textContent = "Amortiguamiento Crítico (Óptimo)";
        $("#behaviorText").textContent = "El sistema vuelve al reposo en el menor tiempo posible sin oscilar. ¡Es el ajuste ideal para amortiguadores de autos!";
      } else {
        $("#behaviorTitle").textContent = "Régimen Sobreamortiguado";
        $("#behaviorText").textContent = "Fricción muy alta: el sistema tarda mucho tiempo en volver al equilibrio, como un émbolo en aceite espeso.";
      }
    }
  },
  slope: {
    title: "dy/dx = f(x, y)",
    eyebrow: "CAMPO DE DIRECCIONES / SLOPE FIELD",
    desc: "Muestra la cuadrícula de pendientes tangentes en el plano y cómo las soluciones navegan a través de ellas.",
    controls: `
      <label for="simSlopeK">Parámetro k: <strong id="valSimSlopeK">0.50</strong></label>
      <input id="simSlopeK" type="range" min="-1.5" max="1.5" step="0.1" value="0.5">
      <label for="simSlopeEq">Función f(x, y):</label>
      <select id="simSlopeEq" style="margin-bottom:12px;">
        <option value="exp">dy/dx = k · y (Exponencial)</option>
        <option value="osc">dy/dx = -k · x (Círculos concéntricos)</option>
        <option value="poly">dy/dx = x - y</option>
      </select>
    `,
    insights: () => {
      $("#behaviorTitle").textContent = "Flujo de las Curvas Solución";
      $("#behaviorText").textContent = "En cada punto (x, y), el segmento indica la inclinación que debe tener cualquier curva de solución que pase por allí.";
      $("#conditionTitle").textContent = "Teorema de Existencia y Unicidad";
      $("#conditionText").textContent = "Dos curvas de solución distintas nunca pueden cruzarse si f(x, y) es suave y continua.";
    }
  }
};

function switchSimulation(key) {
  if (!$("#simModelTitle")) return;
  activeSim = key;
  sfx.click();
  $$(".sim-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.sim === key));
  const cfg = simConfigs[key];
  $("#simModelTitle").textContent = cfg.title;
  $("#simModelEyebrow").textContent = cfg.eyebrow;
  $("#simModelDesc").textContent = cfg.desc;
  $("#simControlsContainer").innerHTML = cfg.controls;

  // Bind inputs de la simulación
  $$("#simControlsContainer input, #simControlsContainer select").forEach(inp => {
    inp.addEventListener("input", drawActiveSimulation);
  });

  drawActiveSimulation();
}

$$(".sim-tab").forEach(tab => {
  tab.addEventListener("click", () => switchSimulation(tab.dataset.sim));
});

function drawActiveSimulation() {
  const canvas = $("#solutionChart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height;

  // Fondo
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#09182a";
  ctx.fillRect(0, 0, w, h);

  const pad = { l: 50, r: 20, t: 25, b: 35 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  if (activeSim === "exp") {
    const k = Number($("#simK")?.value || 0.5);
    const y0 = Number($("#simY0")?.value || 1.0);
    $("#valSimK").textContent = k.toFixed(2);
    $("#valSimY0").textContent = y0.toFixed(1);
    simConfigs.exp.insights(k, y0);

    let maxVal = Math.max(3, y0 * Math.exp(Math.max(0, k) * 5) * 1.15);
    maxVal = Math.min(maxVal, 60);
    let minVal = k >= 0 ? 0 : Math.min(0, y0 * Math.exp(k * 5) * 0.9);

    drawGridAndAxes(ctx, pad, pw, ph, w, h, 0, 5, minVal, maxVal, "t (tiempo)", "y(t)");

    // Trazar curva exponencial
    const X = x => pad.l + (x / 5.0) * pw;
    const Y = y => pad.t + (maxVal - y) / (maxVal - minVal) * ph;

    ctx.strokeStyle = "#4ed5f4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = 5.0 * (i / 200);
      const y = y0 * Math.exp(k * x);
      const cy = Math.max(pad.t, Math.min(h - pad.b, Y(y)));
      if (i === 0) ctx.moveTo(X(x), cy);
      else ctx.lineTo(X(x), cy);
    }
    ctx.stroke();

    // Punto inicial y0
    ctx.fillStyle = "#55dfbd";
    ctx.beginPath();
    ctx.arc(X(0), Y(y0), 5, 0, Math.PI * 2);
    ctx.fill();

  } else if (activeSim === "cooling") {
    const k = Number($("#simCoolK")?.value || 0.08);
    const T0 = Number($("#simT0")?.value || 85);
    const Ta = Number($("#simTa")?.value || 22);
    $("#valSimCoolK").textContent = k.toFixed(2);
    $("#valSimT0").textContent = `${T0}°C`;
    $("#valSimTa").textContent = `${Ta}°C`;
    simConfigs.cooling.insights(k, T0, Ta);

    const maxVal = Math.max(T0 + 5, 100);
    const minVal = 0;
    const tMax = 40;

    drawGridAndAxes(ctx, pad, pw, ph, w, h, 0, tMax, minVal, maxVal, "t (min)", "T (°C)");

    const X = x => pad.l + (x / tMax) * pw;
    const Y = y => pad.t + (maxVal - y) / (maxVal - minVal) * ph;

    // Línea asintótica de temperatura ambiente Ta
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ffb86b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, Y(Ta));
    ctx.lineTo(w - pad.r, Y(Ta));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffb86b";
    ctx.fillText(`Ta = ${Ta}°C`, w - pad.r - 65, Y(Ta) - 6);

    // Curva de enfriamiento
    ctx.strokeStyle = "#55dfbd";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const t = tMax * (i / 200);
      const T = Ta + (T0 - Ta) * Math.exp(-k * t);
      const cy = Y(T);
      if (i === 0) ctx.moveTo(X(t), cy);
      else ctx.lineTo(X(t), cy);
    }
    ctx.stroke();

  } else if (activeSim === "damped") {
    const gamma = Number($("#simGamma")?.value || 0.25);
    const omega = Number($("#simOmega")?.value || 2.0);
    const amp = Number($("#simAmp")?.value || 2.5);
    $("#valSimGamma").textContent = gamma.toFixed(2);
    $("#valSimOmega").textContent = omega.toFixed(2);
    $("#valSimAmp").textContent = amp.toFixed(1);
    simConfigs.damped.insights(gamma, omega);

    const tMax = 15;
    const maxVal = amp * 1.2;
    const minVal = -maxVal;

    drawGridAndAxes(ctx, pad, pw, ph, w, h, 0, tMax, minVal, maxVal, "t (seg)", "Amplitud y");

    const X = x => pad.l + (x / tMax) * pw;
    const Y = y => pad.t + (maxVal - y) / (maxVal - minVal) * ph;

    // Envolvente de decaimiento
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(156, 140, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = tMax * (i / 100);
      const env = amp * Math.exp(-gamma * t);
      if (i === 0) ctx.moveTo(X(t), Y(env));
      else ctx.lineTo(X(t), Y(env));
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = tMax * (i / 100);
      const env = -amp * Math.exp(-gamma * t);
      if (i === 0) ctx.moveTo(X(t), Y(env));
      else ctx.lineTo(X(t), Y(env));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Oscilación
    ctx.strokeStyle = "#9c8cff";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const t = tMax * (i / 300);
      let val = 0;
      if (gamma < omega) {
        const wd = Math.sqrt(omega * omega - gamma * gamma);
        val = amp * Math.exp(-gamma * t) * Math.cos(wd * t);
      } else if (Math.abs(gamma - omega) < 0.05) {
        val = amp * (1 + gamma * t) * Math.exp(-gamma * t);
      } else {
        const r1 = -gamma + Math.sqrt(gamma * gamma - omega * omega);
        const r2 = -gamma - Math.sqrt(gamma * gamma - omega * omega);
        val = amp * (0.5 * Math.exp(r1 * t) + 0.5 * Math.exp(r2 * t));
      }
      const cy = Y(val);
      if (i === 0) ctx.moveTo(X(t), cy);
      else ctx.lineTo(X(t), cy);
    }
    ctx.stroke();

  } else if (activeSim === "slope") {
    const k = Number($("#simSlopeK")?.value || 0.5);
    const eqMode = $("#simSlopeEq")?.value || "exp";
    $("#valSimSlopeK").textContent = k.toFixed(2);
    simConfigs.slope.insights();

    const xMin = -3, xMax = 4;
    const yMin = -3, yMax = 4;

    drawGridAndAxes(ctx, pad, pw, ph, w, h, xMin, xMax, yMin, yMax, "x", "y");

    const X = x => pad.l + (x - xMin) / (xMax - xMin) * pw;
    const Y = y => pad.t + (yMax - y) / (yMax - yMin) * ph;

    // Dibujar campo de flechas/pendientes
    ctx.strokeStyle = "rgba(83, 201, 244, 0.45)";
    ctx.lineWidth = 1.6;

    const stepsX = 16, stepsY = 14;
    for (let ix = 0; ix <= stepsX; ix++) {
      for (let iy = 0; iy <= stepsY; iy++) {
        const xVal = xMin + (xMax - xMin) * (ix / stepsX);
        const yVal = yMin + (yMax - yMin) * (iy / stepsY);

        let slope = 0;
        if (eqMode === "exp") slope = k * yVal;
        else if (eqMode === "osc") slope = -k * (xVal / (yVal === 0 ? 0.001 : yVal));
        else slope = xVal - yVal;

        slope = Math.max(-5, Math.min(5, slope));
        const cx = X(xVal), cy = Y(yVal);
        const segLen = 9;
        const angle = Math.atan(slope);
        const dx = Math.cos(angle) * segLen;
        const dy = Math.sin(angle) * segLen;

        ctx.beginPath();
        ctx.moveTo(cx - dx, cy + dy);
        ctx.lineTo(cx + dx, cy - dy);
        ctx.stroke();
      }
    }

    // Trazar una curva de solución de ejemplo navegando el campo
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (xMax - xMin) * (i / 200);
      let y = 0;
      if (eqMode === "exp") y = 0.8 * Math.exp(k * x);
      else if (eqMode === "osc") y = Math.sqrt(Math.max(0.1, 9 - k * x * x));
      else y = x - 1 + 2 * Math.exp(-x);

      const cy = Y(Math.max(yMin, Math.min(yMax, y)));
      if (i === 0) ctx.moveTo(X(x), cy);
      else ctx.lineTo(X(x), cy);
    }
    ctx.stroke();
  }
}

function drawGridAndAxes(ctx, pad, pw, ph, w, h, xMin, xMax, yMin, yMax, xLabel, yLabel) {
  ctx.font = "10.5px 'DM Sans', sans-serif";
  ctx.strokeStyle = "#1b334d";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#7691ac";

  // Líneas verticales X
  for (let i = 0; i <= 5; i++) {
    const frac = i / 5;
    const xVal = xMin + (xMax - xMin) * frac;
    const px = pad.l + frac * pw;
    ctx.beginPath();
    ctx.moveTo(px, pad.t);
    ctx.lineTo(px, h - pad.b);
    ctx.stroke();
    ctx.fillText(xVal.toFixed(xVal % 1 === 0 ? 0 : 1), px - 6, h - 14);
  }

  // Líneas horizontales Y
  for (let i = 0; i <= 4; i++) {
    const frac = i / 4;
    const yVal = yMin + (yMax - yMin) * frac;
    const py = pad.t + (1 - frac) * ph;
    ctx.beginPath();
    ctx.moveTo(pad.l, py);
    ctx.lineTo(w - pad.r, py);
    ctx.stroke();
    ctx.fillText(yVal.toFixed(yVal % 1 === 0 ? 0 : 1), 6, py + 4);
  }

  // Etiquetas de los ejes
  ctx.fillStyle = "#8da4bd";
  ctx.font = "bold 10px 'Space Grotesk', sans-serif";
  ctx.fillText(xLabel, w - pad.r - 55, h - 14);
  ctx.fillText(yLabel, pad.l + 6, pad.t + 12);
}

window.addEventListener("resize", () => {
  if ($("#view-visualizar").classList.contains("active")) {
    drawActiveSimulation();
  }
});

// ==============================================================================
// 9. MÓDULO TRIVIA & JUEGO (GAMIFICACIÓN, 3 MODOS, COMBOS, VIDAS, BANCO)
// ==============================================================================
// 9. BANCO COMPLETO DE 32 PREGUNTAS CON RESPUESTAS Y GUÍA DE ESTUDIO
// ==============================================================================
const BANCO_PREGUNTAS_LOCAL = [
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

// ==============================================================================
// FUNCIÓN: RENDERIZAR GUÍA DE ESTUDIO CON RESPUESTAS REVELADAS
// ==============================================================================
let activeStudyFilter = "todas";
let activeStudySearch = "";

function renderStudyAnswers(filterCat = null, query = null) {
  if (filterCat !== null) activeStudyFilter = filterCat;
  if (query !== null) activeStudySearch = query.trim().toLowerCase();

  const container = $("#studyCardsContainer");
  if (!container) return;

  let list = BANCO_PREGUNTAS_LOCAL;

  // Filtrar por categoría
  if (activeStudyFilter && activeStudyFilter !== "todas") {
    list = list.filter(q => q.categoria.toLowerCase().includes(activeStudyFilter.toLowerCase()));
  }

  // Filtrar por búsqueda
  if (activeStudySearch) {
    list = list.filter(q => 
      q.pregunta.toLowerCase().includes(activeStudySearch) ||
      q.opciones[q.correcta].toLowerCase().includes(activeStudySearch) ||
      q.explicacion.toLowerCase().includes(activeStudySearch) ||
      (q.tip && q.tip.toLowerCase().includes(activeStudySearch))
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#c4b5fd;">
        <span style="font-size:36px;">🔍</span>
        <h3 style="margin:10px 0 6px; color:#fff;">No se encontraron preguntas con ese término</h3>
        <p style="font-size:12px;">Intenta buscar otra palabra como 'orden', 'Leibniz', 'separables', o limpia el filtro.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(q => {
    const respuestaCorrecta = q.opciones[q.correcta];
    return `
      <article class="study-card">
        <div class="study-card-top">
          <span class="study-card-cat">${q.categoria}</span>
          <span class="study-card-num">Pregunta #${q.id}</span>
        </div>
        <h3>${q.pregunta}</h3>
        <div class="study-answer-box">
          <div class="study-answer-tag">
            <span>✓</span> RESPUESTA CORRECTA:
          </div>
          <div class="study-answer-text">${respuestaCorrecta}</div>
        </div>
        <div class="study-explanation">
          <strong>Por qué es correcta:</strong> ${q.explicacion}
        </div>
        <div class="study-tip">
          <span>💡 Tip para la Trivia:</span> ${q.tip || "Identifica la palabra clave en el enunciado."}
        </div>
      </article>
    `;
  }).join("");
}

// Búsqueda en vivo de la Guía de Estudio
$("#studySearchInput")?.addEventListener("input", (e) => {
  renderStudyAnswers(null, e.target.value);
});

// Botones de filtro de la Guía de Estudio
$$(".study-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    sfx.click();
    $$(".study-filter-btn").forEach(b => b.classList.toggle("active", b === btn));
    renderStudyAnswers(btn.dataset.filter, null);
  });
});

// Estado del juego
let activeGameMode = "desafio";
let gameQuestions = [];
let currentQIndex = 0;
let userScore = 0;
let currentStreak = 0;
let maxStreakSession = 0;
let livesLeft = 3;
let timerSeconds = 20;
let timerInterval = null;
let answeredCurrent = false;

// Cargar récords del usuario
let bestScore = Number(localStorage.getItem("dl_best_score")) || 0;
$("#statBestScore").textContent = bestScore;
$("#progressScore").textContent = `${Math.min(100, Math.round(bestScore / 10))}%`;
$("#progressText").textContent = `Récord guardado: ${bestScore} pts`;

function updateAchievementsUI() {
  const achievements = JSON.parse(localStorage.getItem("dl_achievements") || "[]");
  if (achievements.includes("novato")) $("#badge-1")?.classList.replace("locked", "unlocked");
  if (achievements.includes("racha")) $("#badge-2")?.classList.replace("locked", "unlocked");
  if (achievements.includes("rayo")) $("#badge-3")?.classList.replace("locked", "unlocked");
  if (achievements.includes("maestro")) $("#badge-4")?.classList.replace("locked", "unlocked");
}
updateAchievementsUI();

function unlockAchievement(id) {
  const achievements = JSON.parse(localStorage.getItem("dl_achievements") || "[]");
  if (!achievements.includes(id)) {
    achievements.push(id);
    localStorage.setItem("dl_achievements", JSON.stringify(achievements));
    updateAchievementsUI();
    sfx.celebrate();
  }
}

// Iniciar Modo de Juego
$$(".game-mode-card").forEach(card => {
  card.addEventListener("click", () => {
    startGame(card.dataset.mode);
  });
});

async function startGame(mode) {
  activeGameMode = mode;
  sfx.click();
  $("#gameModeSelection").style.display = "none";
  $("#gameResultScreen").style.display = "none";
  $("#activeGameArea").style.display = "grid";

  userScore = 0;
  currentStreak = 0;
  maxStreakSession = 0;
  livesLeft = 3;
  currentQIndex = 0;
  $("#quizScore").textContent = "0";
  $("#statCurrentStreak").textContent = "0";

  // Configurar HUD según modo
  if (mode === "supervivencia") {
    $("#gameModeBadge").textContent = "MODO SUPERVIVENCIA";
    $("#livesDisplay").style.display = "flex";
    $("#hudTimerArea").style.display = "none";
    updateHeartsUI();
  } else if (mode === "practica") {
    $("#gameModeBadge").textContent = "PRÁCTICA LIBRE";
    $("#livesDisplay").style.display = "none";
    $("#hudTimerArea").style.display = "none";
  } else {
    // Desafío
    $("#gameModeBadge").textContent = "DESAFÍO EXPRÉS";
    $("#livesDisplay").style.display = "none";
    $("#hudTimerArea").style.display = "flex";
  }

  // Cargar preguntas (intentar de la API de Python o usar banco local)
  gameQuestions = await fetchGameQuestions(mode === "desafio" ? 10 : 25);
  renderCurrentQuestion();
}

async function fetchGameQuestions(count) {
  if (isPythonConnected) {
    try {
      const res = await fetch(`/api/questions?count=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (data.preguntas && data.preguntas.length > 0) return data.preguntas;
      }
    } catch (e) {}
  }
  // Banco local mezclado
  const shuffled = [...BANCO_PREGUNTAS_LOCAL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function updateHeartsUI() {
  const hearts = $$("#livesDisplay .heart");
  hearts.forEach((h, i) => {
    h.classList.toggle("lost", i >= livesLeft);
  });
}

function renderCurrentQuestion() {
  clearInterval(timerInterval);
  answeredCurrent = false;

  if (currentQIndex >= gameQuestions.length) {
    endGame(true);
    return;
  }

  const q = gameQuestions[currentQIndex];
  $("#quizCounter").textContent = `PREGUNTA ${currentQIndex + 1} DE ${gameQuestions.length}`;
  $("#quizProgressBar").style.width = `${(currentQIndex / gameQuestions.length) * 100}%`;
  $("#questionCategory").textContent = q.categoria;
  $("#questionDifficulty").textContent = q.dificultad.toUpperCase();
  $("#questionDifficulty").className = `question-difficulty ${q.dificultad}`;
  $("#questionText").textContent = q.pregunta;

  // Render opciones
  const container = $("#answerOptions");
  container.innerHTML = q.opciones.map((opt, i) => `
    <button class="answer-option" data-idx="${i}">
      <span class="option-letter">${String.fromCharCode(65 + i)}</span>
      <span>${opt}</span>
    </button>
  `).join("");

  $$(".answer-option").forEach(btn => {
    btn.addEventListener("click", () => handleAnswerChoice(Number(btn.dataset.idx)));
  });

  const feedback = $("#feedback");
  feedback.style.display = "none";
  feedback.className = "feedback";
  $("#nextQuestion").disabled = true;
  $("#nextQuestion").textContent = currentQIndex === gameQuestions.length - 1 ? "Ver Resultados Finales" : "Siguiente pregunta →";

  // Iniciar temporizador si es modo desafío
  if (activeGameMode === "desafio") {
    timerSeconds = 20;
    $("#timerSeconds").textContent = "20s";
    timerInterval = setInterval(() => {
      timerSeconds--;
      $("#timerSeconds").textContent = `${timerSeconds}s`;
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        handleAnswerChoice(-1); // Tiempo agotado
      }
    }, 1000);
  }
}

function handleAnswerChoice(choiceIdx) {
  if (answeredCurrent) return;
  answeredCurrent = true;
  clearInterval(timerInterval);

  const q = gameQuestions[currentQIndex];
  const isCorrect = choiceIdx === q.correcta;
  const answerButtons = $$(".answer-option");

  answerButtons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correcta) b.classList.add("correct");
    if (i === choiceIdx && !isCorrect) b.classList.add("incorrect");
  });

  const feedback = $("#feedback");
  feedback.style.display = "block";

  if (isCorrect) {
    currentStreak++;
    if (currentStreak > maxStreakSession) maxStreakSession = currentStreak;
    $("#statCurrentStreak").textContent = currentStreak;

    // Multiplicador de combo
    let comboMultiplier = 1.0;
    if (currentStreak >= 5) comboMultiplier = 3.0;
    else if (currentStreak >= 3) comboMultiplier = 2.0;
    else if (currentStreak >= 2) comboMultiplier = 1.5;

    // Puntos
    const timeBonus = activeGameMode === "desafio" ? timerSeconds * 5 : 0;
    const addedPoints = Math.round((100 + timeBonus) * comboMultiplier);
    userScore += addedPoints;
    $("#quizScore").textContent = userScore;

    // Mostrar insignia de combo
    if (currentStreak >= 2) {
      $("#comboBadge").style.display = "block";
      $("#comboMultiplier").textContent = `x${comboMultiplier} COMBO`;
      sfx.streak();
    } else {
      sfx.correct();
    }

    feedback.className = "feedback good";
    feedback.innerHTML = `<strong>¡Excelente! Respuesta Correcta (+${addedPoints} pts).</strong><br>${q.explicacion}`;

    // Desbloquear logros
    unlockAchievement("novato");
    if (currentStreak >= 5) unlockAchievement("racha");
    if (timerSeconds >= 16) unlockAchievement("rayo");

  } else {
    currentStreak = 0;
    $("#statCurrentStreak").textContent = "0";
    $("#comboBadge").style.display = "none";
    sfx.incorrect();

    feedback.className = "feedback bad";
    const msg = choiceIdx === -1 ? "¡Tiempo agotado!" : "Respuesta incorrecta.";
    feedback.innerHTML = `<strong>${msg}</strong><br>${q.explicacion}`;

    if (activeGameMode === "supervivencia") {
      livesLeft--;
      updateHeartsUI();
      if (livesLeft <= 0) {
        setTimeout(() => endGame(false), 1200);
        return;
      }
    }
  }

  $("#nextQuestion").disabled = false;
  $("#quizProgressBar").style.width = `${((currentQIndex + 1) / gameQuestions.length) * 100}%`;
}

$("#nextQuestion").addEventListener("click", () => {
  sfx.click();
  currentQIndex++;
  renderCurrentQuestion();
});

$("#btnExitGame").addEventListener("click", () => {
  clearInterval(timerInterval);
  sfx.click();
  $("#activeGameArea").style.display = "none";
  $("#gameModeSelection").style.display = "grid";
});

function endGame(completedAll = true) {
  clearInterval(timerInterval);
  $("#activeGameArea").style.display = "none";
  $("#gameResultScreen").style.display = "block";

  if (userScore > bestScore) {
    bestScore = userScore;
    localStorage.setItem("dl_best_score", bestScore);
    $("#statBestScore").textContent = bestScore;
    $("#progressScore").textContent = `${Math.min(100, Math.round(bestScore / 10))}%`;
    $("#progressText").textContent = `¡Nuevo récord: ${bestScore} pts!`;
  }

  const answeredTotal = currentQIndex;
  const accuracy = answeredTotal > 0 ? Math.round((userScore / (answeredTotal * 150)) * 100) : 0;
  const clampedAccuracy = Math.min(100, Math.max(10, accuracy));

  if (clampedAccuracy >= 80) {
    unlockAchievement("maestro");
    sfx.celebrate();
    $("#resultCelebrationEmoji").textContent = "🏆";
    $("#resultTitle").textContent = "¡Dominio Magistral de EDOs!";
  } else {
    sfx.correct();
    $("#resultCelebrationEmoji").textContent = "🎉";
    $("#resultTitle").textContent = "¡Buen Trabajo y Esfuerzo!";
  }

  $("#resScore").textContent = userScore;
  $("#resCorrect").textContent = `${Math.round(userScore / 100)} / ${answeredTotal}`;
  $("#resMaxStreak").textContent = maxStreakSession;
  $("#resAccuracy").textContent = `${clampedAccuracy}%`;
}

$("#btnPlayAgain").addEventListener("click", () => {
  startGame(activeGameMode);
});

$("#btnBackToModes").addEventListener("click", () => {
  sfx.click();
  $("#gameResultScreen").style.display = "none";
  $("#gameModeSelection").style.display = "grid";
});

// ==============================================================================
// 10. INICIALIZACIÓN GENERAL
// ==============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  await checkPythonBackend();
  renderCuriosities();
  renderStudyAnswers();
  initFormulariosView();
  solveEquation();
});

// ==============================================================================
// 11. MÓDULO DE FORMULARIOS PARA IMPRIMIR (DERIVADAS & INTEGRALES)
// ==============================================================================

const FORMULAS_SHEETS = {
  derivadas: {
    title: "Tabla de Derivadas",
    sheetName: "Lámina Oficial: TABLA DE DERIVADAS",
    image: "tabla_derivadas.jpg",
    downloadName: "DiferencialLab_Tabla_Derivadas.jpg"
  },
  integrales: {
    title: "Tabla de Integrales",
    sheetName: "Lámina Oficial: TABLA DE INTEGRALES",
    image: "tabla_integrales.jpg",
    downloadName: "DiferencialLab_Tabla_Integrales.jpg"
  }
};

let currentFormKey = "derivadas";
let mainZoom = 1.0;
let isFormulariosInitialized = false;

function applyMainZoom() {
  const viewport = $("#imageViewport");
  const display = $("#zoomLevelDisplay");
  if (viewport) {
    viewport.style.transform = `scale(${mainZoom})`;
  }
  if (display) {
    display.textContent = `${Math.round(mainZoom * 100)}%`;
  }
}

function switchFormTable(key) {
  if (!FORMULAS_SHEETS[key]) return;
  currentFormKey = key;
  sfx.click();

  // Actualizar botones de pestañas
  $$(".form-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.form === key);
  });

  const data = FORMULAS_SHEETS[key];

  // Actualizar imagen principal
  const mainImg = $("#mainFormulaImg");
  if (mainImg) {
    mainImg.src = data.image + "?v=4";
    mainImg.alt = data.title;
  }

  // Actualizar título de la lámina
  const titleEl = $("#toolbarSheetTitle");
  if (titleEl) titleEl.textContent = data.sheetName;

  // Actualizar enlace de descarga
  const dlLink = $("#btnDownloadActiveSheet");
  if (dlLink) {
    dlLink.href = data.image;
    dlLink.download = data.downloadName;
  }

  // Restablecer zoom
  mainZoom = 1.0;
  applyMainZoom();
}

function printFormulario() {
  sfx.click();
  const data = FORMULAS_SHEETS[currentFormKey];
  if (!data) return;

  // Creamos una ventana de impresión limpia con solo la imagen en máxima resolución
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Si el navegador bloqueó la ventana emergente, usamos la impresión directa del navegador
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${data.title} - DiferencialLab</title>
      <style>
        @page {
          size: auto;
          margin: 6mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        img {
          max-width: 100%;
          max-height: 98vh;
          width: auto;
          height: auto;
          display: block;
          object-fit: contain;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <img src="${data.image}" alt="${data.title}" onload="setTimeout(() => { window.print(); window.close(); }, 300);" />
    </body>
    </html>
  `);
  printWindow.document.close();
}

function initFormulariosView() {
  if (isFormulariosInitialized) return;
  isFormulariosInitialized = true;

  // Pestañas para alternar entre Derivadas e Integrales
  $$(".form-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchFormTable(btn.dataset.form));
  });

  // Botones de Imprimir
  const btnPrintSheet = $("#btnPrintSheet");
  if (btnPrintSheet) btnPrintSheet.addEventListener("click", printFormulario);

  const btnQuickPrint = $("#btnQuickPrint");
  if (btnQuickPrint) btnQuickPrint.addEventListener("click", printFormulario);

  // Controles de Zoom
  const btnZIn = $("#btnZoomIn");
  if (btnZIn) {
    btnZIn.addEventListener("click", () => {
      mainZoom = Math.min(2.5, mainZoom + 0.2);
      applyMainZoom();
    });
  }

  const btnZOut = $("#btnZoomOut");
  if (btnZOut) {
    btnZOut.addEventListener("click", () => {
      mainZoom = Math.max(0.6, mainZoom - 0.2);
      applyMainZoom();
    });
  }

  const btnZReset = $("#btnZoomReset");
  if (btnZReset) {
    btnZReset.addEventListener("click", () => {
      mainZoom = 1.0;
      applyMainZoom();
    });
  }

  // Zoom con rueda de ratón en la lámina
  const stage = $("#imageStage");
  if (stage) {
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        mainZoom = Math.min(2.5, mainZoom + 0.1);
      } else {
        mainZoom = Math.max(0.6, mainZoom - 0.1);
      }
      applyMainZoom();
    }, { passive: false });
  }

  // Cargar estado inicial
  switchFormTable("derivadas");
}
