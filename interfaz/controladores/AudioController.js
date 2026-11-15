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
      this.botonToggle.innerHTML = silenciado
        ? `<svg class="ui-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
        : `<svg class="ui-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
      this.botonToggle.title = silenciado ? "Activar Sonido" : "Desactivar Sonido";
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

