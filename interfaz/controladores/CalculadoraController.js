/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DE LA CALCULADORA DIDÁCTICA
 * Conecta la interfaz del usuario con el servicio de resolución de EDOs (DDD)
 */

import { KatexAdapter } from "../adaptadores/KatexAdapter.js";
import { CanvasGraficadorAdapter } from "../adaptadores/CanvasGraficadorAdapter.js";

export class CalculadoraController {
  constructor({ resolutorService, backendApiAdapter, audioController }) {
    this.resolutor = resolutorService;
    this.api = backendApiAdapter;
    this.audio = audioController;
    this.modo = "preset"; // "preset" o "custom"
  }

  inicializar() {
    const btnPreset = document.getElementById("btnModePreset");
    const btnCustom = document.getElementById("btnModeCustom");
    const areaPreset = document.getElementById("presetControlsArea");
    const areaCustom = document.getElementById("customControlsArea");

    if (btnPreset && btnCustom) {
      btnPreset.addEventListener("click", () => {
        this.modo = "preset";
        btnPreset.classList.add("active");
        btnCustom.classList.remove("active");
        if (areaPreset) areaPreset.style.display = "block";
        if (areaCustom) areaCustom.style.display = "none";
        if (this.audio) this.audio.click();
        this.resolver();
      });

      btnCustom.addEventListener("click", () => {
        this.modo = "custom";
        btnCustom.classList.add("active");
        btnPreset.classList.remove("active");
        if (areaPreset) areaPreset.style.display = "none";
        if (areaCustom) areaCustom.style.display = "block";
        if (this.audio) this.audio.click();
        this.resolver();
      });
    }

    // Chips de ejemplos rápidos
    document.querySelectorAll(".example-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const input = document.getElementById("customEquationInput");
        if (input) input.value = chip.dataset.eq;
        if (this.audio) this.audio.click();
        this.resolver();
      });
    });

    // Selector de tipo de ecuación
    const solverType = document.getElementById("solverType");
    if (solverType) {
      solverType.addEventListener("change", () => {
        this._actualizarEtiquetasParametros(solverType.value);
        this.resolver();
      });
    }

    // Botón principal de resolver
    const btnResolver = document.getElementById("solveButton");
    if (btnResolver) {
      btnResolver.addEventListener("click", () => {
        if (this.audio) this.audio.click();
        this.resolver();
      });
    }

    // Enter en input de ecuación libre
    const customInput = document.getElementById("customEquationInput");
    if (customInput) {
      customInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (this.audio) this.audio.click();
          this.resolver();
        }
      });
    }

    // Inputs numéricos en tiempo real
    ["paramA", "paramB", "initialX0", "initialY0", "initialY1"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", () => this.resolver());
    });
  }

  _actualizarEtiquetasParametros(tipo) {
    const colB = document.getElementById("paramSecondCol");
    const cond2 = document.getElementById("secondOrderCond");
    const lblA = document.getElementById("labelParamA");
    const lblB = document.getElementById("labelParamB");

    if (tipo === "exp") {
      if (lblA) lblA.textContent = "Tasa k";
      if (colB) colB.style.display = "none";
      if (cond2) cond2.style.display = "none";
    } else if (tipo === "cooling") {
      if (lblA) lblA.textContent = "Constante k";
      if (lblB) lblB.textContent = "Temp. Ambiente Ta";
      if (colB) colB.style.display = "block";
      if (cond2) cond2.style.display = "none";
    } else if (tipo === "linear") {
      if (lblA) lblA.textContent = "Coeficiente a";
      if (lblB) lblB.textContent = "Término constante b";
      if (colB) colB.style.display = "block";
      if (cond2) cond2.style.display = "none";
    } else if (tipo === "power") {
      if (lblA) lblA.textContent = "Coeficiente a";
      if (lblB) lblB.textContent = "Exponente n (entero)";
      if (colB) colB.style.display = "block";
      if (cond2) cond2.style.display = "none";
    } else if (tipo === "harmonic") {
      if (lblA) lblA.textContent = "Frecuencia angular ω²";
      if (colB) colB.style.display = "none";
      if (cond2) cond2.style.display = "block";
    }
  }

  async resolver() {
    const x0 = Number(document.getElementById("initialX0")?.value) || 0;
    const y0 = Number(document.getElementById("initialY0")?.value) || 1;
    const y1 = Number(document.getElementById("initialY1")?.value) || 0;

    // Intentar resolver en backend (SymPy)
    if (this.api && this.api.estaConectado) {
      const payload = {
        type: this.modo,
        x0,
        y0,
        y1
      };
      if (this.modo === "custom") {
        payload.equation = (document.getElementById("customEquationInput")?.value || "").trim();
        if (!payload.equation) return;
      } else {
        const val = document.getElementById("solverType")?.value || "exp";
        const a = Number(document.getElementById("paramA")?.value) || 2;
        const b = Number(document.getElementById("paramB")?.value) || 4;
        payload.type = val;
        payload.model = val;
        payload.k = a;
        payload.a = a;
        payload.b = b;
        payload.n = Math.floor(b);
        payload.Ta = b;
        payload.omega2 = a;
      }

      const res = await this.api.resolverEcuacion(payload);
      if (res) {
        if (res.exito) {
          this.renderizarResultado(res.data);
          return;
        } else if (this.modo === "custom") {
          this.renderizarError(res.error, res.detalles);
          return;
        }
      }
    }

    // Fallback al servicio de dominio cliente
    const tipo = document.getElementById("solverType")?.value || "exp";
    const a = Number(document.getElementById("paramA")?.value) || 2;
    const b = Number(document.getElementById("paramB")?.value) || 4;
    const resultado = this.resolutor.resolverAnalitico({ tipo, a, b, x0, y0, y1 });
    this.renderizarResultado(resultado);
  }

  renderizarResultado(data) {
    const solTitle = document.getElementById("solutionTitle");
    if (solTitle) solTitle.textContent = `Ecuación resuelta: ${data.equation_input || ""}`;

    const eqBox = document.getElementById("latexEquation");
    if (eqBox) {
      KatexAdapter.renderizar(eqBox, data.latex_eq || data.equation_input || "y' = f(x, y)", true);
    }

    const stepsContainer = document.getElementById("solutionSteps");
    if (stepsContainer) {
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
          const parts = desc.split("\n\n").map(p => p.trim()).filter(Boolean);
          parts.forEach(part => {
            // Distinguir bloques de fórmula LaTeX pura de bloques de texto explicativo
            const esTextoPuro = part.includes("•") || part.startsWith("Nota") || part.startsWith("💡") || 
                                part.startsWith("Escribimos") || part.startsWith("Separamos") || 
                                part.startsWith("En esta") || part.startsWith("La familia") || 
                                part.startsWith("El factor") || part.startsWith("Reemplazamos") ||
                                part.startsWith("Sustituimos") || part.startsWith("Comprobamos");
            const tieneSintaxisMath = part.startsWith("\\") || part.includes("=") || part.includes("\\frac") || part.includes("y{") || part.includes("y(");
            
            if (tieneSintaxisMath && !esTextoPuro) {
              const mathBox = document.createElement("div");
              mathBox.className = "step-math-box";
              KatexAdapter.renderizar(mathBox, part, true);
              bodyDiv.appendChild(mathBox);
            } else {
              const p = document.createElement("p");
              p.textContent = part;
              bodyDiv.appendChild(p);
            }
          });
        } else if (desc.includes(": ") && (desc.includes("\\") || desc.includes("y{"))) {
          const idx = desc.indexOf(": ");
          const intro = desc.substring(0, idx + 1);
          const math = desc.substring(idx + 2);

          const introP = document.createElement("p");
          introP.textContent = intro;
          bodyDiv.appendChild(introP);

          const mathBox = document.createElement("div");
          mathBox.className = "step-math-box";
          KatexAdapter.renderizar(mathBox, math, true);
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
    }

    const solTarget = document.getElementById("solutionAnswer");
    if (solTarget) {
      if (data.latex_particular) {
        KatexAdapter.renderizar(solTarget, data.latex_particular, true);
      } else if (data.latex_general) {
        KatexAdapter.renderizar(solTarget, data.latex_general, true);
      } else {
        solTarget.textContent = data.str_particular || data.str_general || "Solución encontrada";
      }
    }

    if (data.plot_points && data.plot_points.length > 0) {
      const canvas = document.getElementById("miniSolverCanvas");
      CanvasGraficadorAdapter.graficarPuntos(canvas, data.plot_points);
    }
  }

  renderizarError(msg, details) {
    const solTitle = document.getElementById("solutionTitle");
    if (solTitle) solTitle.textContent = "Error de Sintaxis / Resolución";

    const eqBox = document.getElementById("latexEquation");
    if (eqBox) {
      eqBox.textContent = document.getElementById("customEquationInput")?.value || "y' = f(x, y)";
    }

    const stepsContainer = document.getElementById("solutionSteps");
    if (stepsContainer) {
      stepsContainer.innerHTML = `
        <div class="step" style="border-left-color: #ef4444;">
          <span class="step-num" style="background: rgba(239, 68, 68, 0.3); color: #f87171;">⚠️</span>
          <div>
            <strong style="color: #f87171;">${msg}</strong>
            <p style="color: #fca5a5; font-size: 11.5px; margin-top: 4px;">${details}</p>
          </div>
        </div>
      `;
    }

    const solTarget = document.getElementById("solutionAnswer");
    if (solTarget) solTarget.textContent = "No disponible";

    const canvas = document.getElementById("miniSolverCanvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

