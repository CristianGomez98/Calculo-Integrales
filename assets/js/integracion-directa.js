/* =========================================================
   Integración Directa — Módulo 5 (Área) y Módulo 6 (Antiderivadas)

   IMPORTANTE: este archivo reutiliza sampleCurve(), curveTrace() y
   baseLayout(), que ya están definidas en metodos-numericos.js.
   Por eso, en el HTML, metodos-numericos.js debe cargarse ANTES
   que este archivo.
   ========================================================= */

// ========== MÓDULO 5: Área bajo la curva y área entre curvas ==========

// renderAreaPlot: dibuja la curva completa (con un poco de contexto a los
// lados) y sombrea SOLO la porción entre a y b — esa porción sombreada
// es la que representa la integral definida.
function renderAreaPlot(divId, fn, a, b) {
  const margin = (b - a) * 0.25 || 0.5;
  const fullCurve = sampleCurve(fn, a - margin, b + margin, 200);
  const shaded = sampleCurve(fn, a, b, 100);
  const traces = [
    curveTrace(fullCurve), // la curva completa, de referencia
    {
      x: shaded.x, y: shaded.y, mode: 'lines', fill: 'tozeroy', // "tozeroy" = rellena hasta el eje x
      fillcolor: 'rgba(15,92,82,0.3)', line: { color: '#0F5C52', width: 2 },
      hoverinfo: 'skip', showlegend: false
    }
  ];
  Plotly.newPlot(divId, traces, baseLayout(fullCurve, []), { displayModeBar: false, responsive: true });
}

// Demo FIJA de área ENTRE DOS curvas: f(x) = x + 2 (una recta) y g(x) = x² (una parábola).
// Se cruzan en x = -1 y x = 2 (resolviendo x² = x + 2), por eso usamos
// ese intervalo exacto para la demostración — así evitamos tener que
// programar un buscador de intersecciones para funciones arbitrarias.
function renderAreaBetweenDemo(divId) {
  const f = x => x + 2;
  const g = x => x * x;
  const a = -1, b = 2;
  const margin = 0.6;
  const fCurve = sampleCurve(f, a - margin, b + margin, 150);
  const gCurve = sampleCurve(g, a - margin, b + margin, 150);
  const fShaded = sampleCurve(f, a, b, 100);
  const gShaded = sampleCurve(g, a, b, 100);

  const traces = [
    { ...curveTrace(fCurve), name: 'f(x) = x + 2' },
    { ...curveTrace(gCurve), name: 'g(x) = x²', line: { color: '#C99A2E', width: 2.5 } },
    // Truco para rellenar SOLO el área entre las dos curvas (no hasta el eje x):
    // 1) dibujamos g invisible (line width 0) como "base",
    // 2) dibujamos f con fill:'tonexty', que rellena hasta la curva anterior (g).
    { x: gShaded.x, y: gShaded.y, mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' },
    { x: fShaded.x, y: fShaded.y, mode: 'lines', fill: 'tonexty',
      fillcolor: 'rgba(15,92,82,0.3)', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' }
  ];
  const layout = baseLayout(fCurve, []);
  layout.showlegend = true;
  Plotly.newPlot(divId, traces, layout, { displayModeBar: false, responsive: true });
}

// Calcula el valor exacto del área entre las dos curvas del demo de arriba,
// usando el Teorema Fundamental del Cálculo sobre f(x)-g(x) = (x+2) - x².
function areaBetweenDemoValue() {
  const F = x => (x * x) / 2 + 2 * x; // antiderivada de (x + 2)
  const G = x => (x ** 3) / 3;        // antiderivada de x²
  const a = -1, b = 2;
  return (F(b) - G(b)) - (F(a) - G(a));
}

// Conecta los controles HTML del Módulo 5 con las funciones de arriba.
function initAreaVisualizer(config) {
  const $ = id => document.getElementById(id);
  const fnSelect = $(config.prefix + 'fn-select');
  const aInput = $(config.prefix + 'a-input');
  const bInput = $(config.prefix + 'b-input');
  const betweenCheckbox = $(config.prefix + 'between-checkbox');
  const areaEl = $(config.prefix + 'area-value');
  const singleControls = $(config.prefix + 'single-controls');

  function update() {
    const showBetween = betweenCheckbox.checked;
    // Si el usuario activa "área entre curvas", ocultamos los controles
    // de función/a/b de la curva simple (porque el demo usa valores fijos):
    singleControls.style.display = showBetween ? 'none' : 'flex';

    if (showBetween) {
      renderAreaBetweenDemo(config.plotId);
      areaEl.textContent = areaBetweenDemoValue().toFixed(4);
    } else {
      const def = FUNCTIONS[fnSelect.value]; // FUNCTIONS viene de metodos-numericos.js
      const a = parseFloat(aInput.value);
      const b = parseFloat(bInput.value);
      renderAreaPlot(config.plotId, def.fn, a, b);
      // El área EXACTA se calcula con el Teorema Fundamental del Cálculo:
      const area = def.antiderivative(b) - def.antiderivative(a);
      areaEl.textContent = area.toFixed(4);
    }
  }

  [fnSelect, aInput, bInput, betweenCheckbox].forEach(el => el.addEventListener('input', update));
  update(); // dibuja apenas carga la página
}

// ========== MÓDULO 6: Integración directa (fórmulas básicas) ==========

// Banco de funciones "clásicas" de integración directa, cada una con su
// antiderivada ya calculada a mano (F), y el dominio donde se ve mejor graficada.
const BASIC_FUNCTIONS = {
  power: { label: 'f(x) = 3x²',        domain: [-2, 3],   fn: x => 3 * x * x,   F: x => x ** 3 },
  exp:   { label: 'f(x) = eˣ',         domain: [-2, 2],   fn: x => Math.exp(x), F: x => Math.exp(x) },
  cos:   { label: 'f(x) = cos(x)',     domain: [-6.3, 6.3], fn: x => Math.cos(x), F: x => Math.sin(x) },
  invx:  { label: 'f(x) = 1/x (x>0)',  domain: [0.3, 4],  fn: x => 1 / x,       F: x => Math.log(x) }
};

// Dibuja f(x) y su antiderivada F(x) juntas, en el mismo plano, para que
// se vea visualmente la relación entre una función y su "familia" de área acumulada.
function renderDerivativePairPlot(divId, def) {
  const [a, b] = def.domain;
  const curveF = sampleCurve(def.fn, a, b, 200);
  const curveAntideriv = sampleCurve(def.F, a, b, 200);
  const traces = [
    { ...curveTrace(curveF), name: 'f(x)' },
    { ...curveTrace(curveAntideriv), name: 'F(x)', line: { color: '#C99A2E', width: 2.5 } }
  ];
  const layout = baseLayout(curveF, []);
  // El rango de Y debe acomodar AMBAS curvas (f y F), no solo f:
  const allY = curveF.y.concat(curveAntideriv.y);
  layout.yaxis.range = [Math.min(0, Math.min(...allY) * 1.1), Math.max(...allY) * 1.15];
  layout.showlegend = true;
  Plotly.newPlot(divId, traces, layout, { displayModeBar: false, responsive: true });
}

// Conecta el selector de función del Módulo 6 con la gráfica de arriba.
function initAntiderivativeVisualizer(config) {
  const fnSelect = document.getElementById(config.prefix + 'fn-select');
  function update() {
    const def = BASIC_FUNCTIONS[fnSelect.value];
    renderDerivativePairPlot(config.plotId, def);
  }
  fnSelect.addEventListener('input', update);
  update();
}
