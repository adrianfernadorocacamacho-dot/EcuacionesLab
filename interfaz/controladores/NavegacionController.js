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
      "formularios"
    ];
    this.etiquetas = {
      inicio: "Inicio",
      resolver: "Calculadora Paso a Paso",
      aprender: "Aprende & Curiosidades",
      curiosidades: "Aprende & Curiosidades",
      practicar: "Trivia & Juego",
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

    // Menú móvil y telón de fondo (backdrop)
    const mobileBtn = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");

    const cerrarMenu = () => {
      if (sidebar) sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("active");
      document.body.style.overflow = "";
    };

    const toggleMenu = () => {
      if (!sidebar) return;
      const estaAbierto = sidebar.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("active", estaAbierto);
      document.body.style.overflow = estaAbierto ? "hidden" : "";
    };

    if (mobileBtn) {
      mobileBtn.addEventListener("click", toggleMenu);
    }
    if (backdrop) {
      backdrop.addEventListener("click", cerrarMenu);
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrarMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) cerrarMenu();
    });
  }

  irA(vista) {
    if (vista === "curiosidades" || vista === "visualizar" || vista === "aplicaciones") {
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

    // Cerrar barra lateral y telón de fondo en móvil
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
    document.body.style.overflow = "";

    // Desplazamiento suave hacia arriba
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Notificar al hook de la vista correspondiente
    if (typeof this.onCambioVista[vista] === "function") {
      this.onCambioVista[vista]();
    }
  }
}
