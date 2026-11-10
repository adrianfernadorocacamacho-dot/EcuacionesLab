/**
 * INTERFAZ - PUNTO DE ENTRADA PRINCIPAL (COMPOSITION ROOT)
 * Orquestador de la arquitectura DDD (Lógica de Dominio <-> Interfaz)
 */

// 1. IMPORTACIÓN DE LA CAPA DE LÓGICA (DOMINIO)
import { AudioService } from "../logica/servicios/AudioService.js";
import { ResolutorEDOService } from "../logica/servicios/ResolutorEDOService.js";
import { TriviaService } from "../logica/servicios/TriviaService.js";
import { BancoCuriosidadesRepository } from "../logica/repositorios/BancoCuriosidadesRepository.js";
import { BancoPreguntasRepository } from "../logica/repositorios/BancoPreguntasRepository.js";
import { BancoLeccionesRepository } from "../logica/repositorios/BancoLeccionesRepository.js";
import { BancoFormulariosRepository } from "../logica/repositorios/BancoFormulariosRepository.js";

// 2. IMPORTACIÓN DE LA CAPA DE INTERFAZ (ADAPTADORES Y CONTROLADORES)
import { BackendApiAdapter } from "./adaptadores/BackendApiAdapter.js";
import { AudioController } from "./controladores/AudioController.js";
import { CalculadoraController } from "./controladores/CalculadoraController.js";
import { AprendeCuriosidadesController } from "./controladores/AprendeCuriosidadesController.js";
import { TriviaController } from "./controladores/TriviaController.js";
import { FormulariosController } from "./controladores/FormulariosController.js";
import { NavegacionController } from "./controladores/NavegacionController.js";

// ==============================================================================
// COMPOSITION ROOT: INICIALIZACIÓN Y ENLACE DE DEPENDENCIAS (DDD)
// ==============================================================================

// Instancias del Dominio / Lógica
const audioService = new AudioService();
const resolutorEDOService = new ResolutorEDOService();
const curiosidadesRepo = new BancoCuriosidadesRepository();
const preguntasRepo = new BancoPreguntasRepository();
const leccionesRepo = new BancoLeccionesRepository();
const formulariosRepo = new BancoFormulariosRepository();
const triviaService = new TriviaService(preguntasRepo);

// Adaptadores de Infraestructura
const backendApiAdapter = new BackendApiAdapter();

// Controladores de Interfaz
const audioController = new AudioController(audioService);
const calculadoraController = new CalculadoraController({
  resolutorService: resolutorEDOService,
  backendApiAdapter,
  audioController
});
const aprendeController = new AprendeCuriosidadesController({
  curiosidadesRepo,
  leccionesRepo,
  preguntasRepo,
  audioController
});
const triviaController = new TriviaController({
  triviaService,
  backendApiAdapter,
  audioController
});
const formulariosController = new FormulariosController({
  formulariosRepo,
  audioController
});

const navegacionController = new NavegacionController({
  audioController,
  onCambioVista: {
    resolver: () => calculadoraController.resolver(),
    formularios: () => formulariosController.cambiarTabla("derivadas"),
    aprender: () => {
      aprendeController.renderizarLeccion("concepto");
      aprendeController.renderizarCuriosidades();
      aprendeController.renderizarGuiaEstudio();
    }
  }
});

// ==============================================================================
// ARRANQUE DE LA APLICACIÓN
// ==============================================================================

async function iniciarAplicacion() {
  // Asegurar tema oscuro permanente
  try {
    localStorage.removeItem("dl_theme");
    document.body.classList.remove("light-mode");
  } catch (e) {}

  // Inicializar controladores de la interfaz
  audioController.inicializar();
  navegacionController.inicializar();
  calculadoraController.inicializar();
  aprendeController.inicializar();
  triviaController.inicializar();
  formulariosController.inicializar();

  // Comprobar estado del servidor Python (SymPy)
  const pill = document.getElementById("backendPill");
  const text = document.getElementById("backendStatusText");
  const note = document.getElementById("solverEngineNote");

  const estado = await backendApiAdapter.verificarEstado();
  if (estado.online) {
    if (pill) pill.className = "backend-pill online";
    if (text) text.textContent = "Servidor Activo";
    if (pill) pill.title = `Conectado al servidor Python local con SymPy ${estado.sympyVersion}`;
    if (note) note.textContent = "✦ Modo didáctico: Explicación pedagógica detallada paso a paso.";
  } else {
    if (pill) pill.className = "backend-pill offline";
    if (text) text.textContent = "Modo Navegador";
    if (pill) pill.title = "Ejecutando con motor JavaScript local de respaldo.";
    if (note) note.textContent = "✦ Modo didáctico: Resuelve paso a paso con explicaciones claras.";
  }

  // Primera resolución pedagógica
  calculadoraController.resolver();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarAplicacion);
} else {
  iniciarAplicacion();
}

// Exportar para depuración o pruebas unitarias
export {
  audioService,
  resolutorEDOService,
  triviaService,
  curiosidadesRepo,
  preguntasRepo,
  leccionesRepo,
  formulariosRepo,
  calculadoraController,
  triviaController,
  formulariosController
};

