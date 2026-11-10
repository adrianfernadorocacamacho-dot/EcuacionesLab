/**
 * INTERFAZ / ADAPTADORES - ADAPTADOR DE GRAFICACIÓN EN CANVAS 2D
 * Renderiza curvas numéricas y analíticas en elementos HTML5 <canvas> (DDD)
 */

export class CanvasGraficadorAdapter {
  static graficarPuntos(canvasElement, puntos, options = {}) {
    if (!canvasElement || !puntos || puntos.length === 0) return;

    const container = canvasElement.parentElement;
    const w = container ? Math.max(200, Math.floor(container.clientWidth - 24)) : 300;
    const h = options.height || 130;
    canvasElement.width = w;
    canvasElement.height = h;

    const ctx = canvasElement.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    // Fondo
    ctx.fillStyle = options.bgColor || "#09182a";
    ctx.fillRect(0, 0, w, h);

    const ys = puntos.map(p => p.y);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    const xs = puntos.map(p => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const pad = 18;

    const toX = x => pad + ((x - minX) / (maxX - minX || 1)) * (w - 2 * pad);
    const toY = y => h - pad - ((y - minY) / (maxY - minY)) * (h - 2 * pad);

    // Ejes cartesianos
    ctx.strokeStyle = "#1a3556";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    // Línea del eje cero si aplica
    if (minY < 0 && maxY > 0) {
      const yZero = toY(0);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.beginPath();
      ctx.moveTo(pad, yZero);
      ctx.lineTo(w - pad, yZero);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Trazo de la curva de solución
    ctx.strokeStyle = options.lineColor || "#60a5fa";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    puntos.forEach((p, i) => {
      const px = toX(p.x);
      const py = toY(p.y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Punto inicial destacado
    const p0 = puntos[0];
    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(toX(p0.x), toY(p0.y), 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Etiquetas de rangos
    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    ctx.fillText(`y:${maxY.toFixed(1)}`, pad + 2, pad + 10);
    ctx.fillText(`y:${minY.toFixed(1)}`, pad + 2, h - pad - 3);
    ctx.fillText(`x:${minX.toFixed(1)}`, pad, h - 3);
    ctx.fillText(`x:${maxX.toFixed(1)}`, w - pad - 26, h - 3);
  }
}

