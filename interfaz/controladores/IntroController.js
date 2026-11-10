/**
 * CONTROLADOR: IntroController
 * Gestiona el ciclo de vida y la animación de la pantalla de bienvenida (Intro Overlay)
 */
export class IntroController {
  constructor(overlayId = "intro-overlay", skipBtnId = "skip-intro-btn") {
    this.overlay = document.getElementById(overlayId);
    this.skipBtn = document.getElementById(skipBtnId);
    this.dismissed = false;
  }

  descartar() {
    if (this.dismissed || !this.overlay) return;
    this.dismissed = true;
    this.overlay.classList.add("intro-dismissed");
    setTimeout(() => {
      try { this.overlay.remove(); } catch (e) {}
    }, 700);
  }
}
