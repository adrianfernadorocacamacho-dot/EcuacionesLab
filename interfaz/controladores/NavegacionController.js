/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DE NAVEGACIÓN Y ENRUTAMIENTO
 * Controla la activación de vistas, migas de pan y menú lateral móvil (DDD)
 */

export class NavegacionController {
  constructor({ audioController, onCambioVista = {} }) {
    this.audio = audioController;
    this.onCambioVista = onCambioVista;
    this.vistasValidas = [
      "inicio",
      "resolver",
      "aprender",
      "curiosidades",
      "practicar",
      "aplicaciones",
      "formularios"
    ];
    this.etiquetas = {
      inicio: "Inicio",
      resolver: "Calculadora Paso a Paso",
      aprender: "Aprende & Curiosidades",
      curiosidades: "Aprende & Curiosidades",
      practicar: "Trivia & Juego",
      aplicaciones: "Aplicaciones Reales",
      formularios: "Formularios Oficiales"
    };
  }

  inicializar() {
    // Escuchar botones con data-view
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.irA(btn.dataset.view);
      });
    });

    // Escuchar botones con data-go
    document.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.irA(btn.dataset.go);
      });
    });

    // Menú móvil
    const mobileBtn = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
      });
    }
  }

  irA(vista) {
    if (vista === "curiosidades" || vista === "visualizar") {
      vista = "aprender";
    }
    if (!this.vistasValidas.includes(vista)) return;

    if (this.audio) this.audio.click();

    // Activar sección
    document.querySelectorAll(".view").forEach(v => {
      v.classList.toggle("active", v.id === `view-${vista}`);
    });

    // Actualizar barra de navegación
    document.querySelectorAll(".nav-link").forEach(b => {
      b.classList.toggle("active", b.dataset.view === vista);
    });

    // Actualizar miga de pan
    const crumb = document.getElementById("crumb");
    if (crumb) {
      crumb.textContent = this.etiquetas[vista] || "Laboratorio";
    }

    // Cerrar barra lateral en móvil
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.remove("open");
    }

    // Desplazamiento suave hacia arriba
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Notificar al hook de la vista correspondiente
    if (typeof this.onCambioVista[vista] === "function") {
      this.onCambioVista[vista]();
    }
  }
}

