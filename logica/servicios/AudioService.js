/**
 * DOMAIN / LÓGICA - SERVICIO DE SÍNTESIS DE AUDIO
 * Generación procedural de ondas y arpegios con Web Audio API (DDD)
 */

export class AudioService {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _initContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleSilencio() {
    this.muted = !this.muted;
    if (!this.muted) {
      this.reproducirTono(523.25, 0.08, "sine");
    }
    return this.muted;
  }

  estaSilenciado() {
    return this.muted;
  }

  reproducirTono(freq, duration = 0.1, type = "sine", gainVal = 0.15) {
    if (this.muted) return;
    try {
      this._initContext();
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
      // Audio no permitido o dispositivo silenciado
    }
  }

  click() {
    this.reproducirTono(440, 0.04, "triangle", 0.08);
  }

  correcto() {
    if (this.muted) return;
    this._initContext();
    // Acorde ascendente C5 - E5 - G5
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      setTimeout(() => this.reproducirTono(freq, 0.18, "sine", 0.15), idx * 70);
    });
  }

  incorrecto() {
    if (this.muted) return;
    this._initContext();
    // Tono descendente suave
    [261.63, 196.00].forEach((freq, idx) => {
      setTimeout(() => this.reproducirTono(freq, 0.16, "sawtooth", 0.1), idx * 100);
    });
  }

  racha() {
    if (this.muted) return;
    this._initContext();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => this.reproducirTono(freq, 0.15, "triangle", 0.18), idx * 50);
    });
  }

  celebrar() {
    if (this.muted) return;
    this._initContext();
    // Fanfarria festiva
    const notas = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
    const retrasos = [0, 100, 200, 320, 440, 600];
    notas.forEach((n, i) => {
      setTimeout(() => this.reproducirTono(n, 0.25, "sine", 0.2), retrasos[i]);
    });
  }
}

