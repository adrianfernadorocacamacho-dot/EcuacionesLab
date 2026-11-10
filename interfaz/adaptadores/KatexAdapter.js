/**
 * INTERFAZ / ADAPTADORES - ADAPTADOR DE RENDERIZADO KaTeX
 * Renderizado matemático seguro para elementos del DOM (DDD)
 */

export class KatexAdapter {
  static renderizar(elementoDom, formulaLatex, displayMode = false) {
    if (!elementoDom) return;
    if (window.katex) {
      try {
        window.katex.render(formulaLatex, elementoDom, {
          throwOnError: false,
          displayMode: displayMode
        });
        return;
      } catch (e) {
        // Fallback a texto en caso de error de parseo KaTeX
      }
    }
    elementoDom.textContent = formulaLatex;
  }
}

