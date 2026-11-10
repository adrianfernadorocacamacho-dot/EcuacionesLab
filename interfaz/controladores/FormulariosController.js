/**
 * INTERFAZ / CONTROLADORES - CONTROLADOR DE FORMULARIOS IMPRIMIBLES
 * Visor de láminas oficiales de Derivadas, Integrales y EDOs con zoom e impresión limpia (DDD)
 */

export class FormulariosController {
  constructor({ formulariosRepo, audioController }) {
    this.repo = formulariosRepo;
    this.audio = audioController;
    this.claveActual = "edo1";
    this.zoom = 1.0;
  }

  inicializar() {
    // Pestañas de Formularios (EDO Pág 1, EDO Pág 2, Derivadas, Integrales)
    document.querySelectorAll(".form-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.cambiarTabla(btn.dataset.form);
      });
    });

    // Botones de imprimir
    document.getElementById("btnPrintSheet")?.addEventListener("click", () => this.imprimir());
    document.getElementById("btnQuickPrint")?.addEventListener("click", () => this.imprimir());

    // Botones de zoom
    document.getElementById("btnZoomIn")?.addEventListener("click", () => {
      this.zoom = Math.min(2.5, this.zoom + 0.2);
      this._aplicarZoom();
    });

    document.getElementById("btnZoomOut")?.addEventListener("click", () => {
      this.zoom = Math.max(0.6, this.zoom - 0.2);
      this._aplicarZoom();
    });

    document.getElementById("btnZoomReset")?.addEventListener("click", () => {
      this.zoom = 1.0;
      this._aplicarZoom();
    });

    // Zoom con rueda de ratón en el contenedor de imagen
    const stage = document.getElementById("imageStage");
    if (stage) {
      stage.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.zoom = Math.min(2.5, this.zoom + 0.1);
        } else {
          this.zoom = Math.max(0.6, this.zoom - 0.1);
        }
        this._aplicarZoom();
      }, { passive: false });
    }

    // Inicializar estado en Formulario de EDOs (Página 1)
    this.cambiarTabla("edo1");
  }

  cambiarTabla(clave) {
    const lamina = this.repo.obtenerPorClave(clave);
    if (!lamina) return;

    this.claveActual = clave;
    if (this.audio) this.audio.click();

    // Actualizar botones de pestañas
    document.querySelectorAll(".form-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.form === clave);
    });

    // Actualizar imagen principal
    const img = document.getElementById("mainFormulaImg");
    if (img) {
      img.src = lamina.imagen + "?v=1";
      img.alt = lamina.titulo;
    }

    // Actualizar título de lámina
    const title = document.getElementById("toolbarSheetTitle");
    if (title) title.textContent = lamina.nombreLamina;

    // Actualizar enlace de descarga
    const dlLink = document.getElementById("btnDownloadActiveSheet");
    if (dlLink) {
      dlLink.href = lamina.imagen;
      dlLink.download = lamina.nombreDescarga;
    }

    // Restablecer zoom
    this.zoom = 1.0;
    this._aplicarZoom();
  }

  _aplicarZoom() {
    const viewport = document.getElementById("imageViewport");
    const display = document.getElementById("zoomLevelDisplay");
    if (viewport) {
      viewport.style.transform = `scale(${this.zoom})`;
    }
    if (display) {
      display.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  imprimir() {
    if (this.audio) this.audio.click();
    const lamina = this.repo.obtenerPorClave(this.claveActual);
    if (!lamina) return;

    // Ventana emergente limpia solo con la lámina para imprimir en alta resolución
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${lamina.titulo} - DiferencialLab</title>
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
        <img src="${lamina.imagen}" alt="${lamina.titulo}" onload="setTimeout(() => { window.print(); window.close(); }, 300);" />
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
