/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DE AUDIO
 * Maneja el botón de sonido de la barra superior y feedback sonoro (DDD)
 */

export class AudioController {
  constructor(audioService) {
    this.audioService = audioService;
    this.botonToggle = document.getElementById("soundToggle");
  }

  inicializar() {
    if (!this.botonToggle) return;
    this.botonToggle.addEventListener("click", () => {
      const silenciado = this.audioService.toggleSilencio();
      this.actualizarIcono(silenciado);
    });
  }

  actualizarIcono(silenciado) {
    if (this.botonToggle) {
      this.botonToggle.textContent = silenciado ? "🔇" : "🔊";
    }
  }

  click() {
    this.audioService.click();
  }

  correcto() {
    this.audioService.correcto();
  }

  incorrecto() {
    this.audioService.incorrecto();
  }

  racha() {
    this.audioService.racha();
  }

  celebrar() {
    this.audioService.celebrar();
  }
}

