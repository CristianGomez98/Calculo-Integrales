/* =========================================================
   Métodos Numéricos — lógica matemática compartida
   Usada por los módulos 1 (Riemann), 2 (Trapecio),
   3 (Punto Medio) y 4 (Simpson).
   ========================================================= */

// ---------- Banco de funciones de ejemplo ----------
// Cada función incluye su antiderivada para poder calcular
// el valor EXACTO de la integral y comparar contra la aproximación.
const FUNCTIONS = {
  poly: {
    label: 'f(x) = x² + 1',
    fn: x => x * x + 1,
    antiderivative: x => (x ** 3) / 3 + x
  },
  sin: {
    label: 'f(x) = sin(x) + 2',
    fn: x => Math.sin(x) + 2,
    antiderivative: x => -Math.cos(x) + 2 * x
  },
  sqrt: {
    label: 'f(x) = √x',
    fn: x => Math.sqrt(Math.max(x, 0)),
    antiderivative: x => (2 / 3) * Math.pow(Math.max(x, 0), 1.5)
  },
  rational: {
    label: 'f(x) = 1 / (1 + x²)',
    fn: x => 1 / (1 + x * x),
    antiderivative: x => Math.atan(x)
  }
};

// ---------- Métodos numéricos ----------

// riemannSum: calcula el área aproximada bajo la curva usando rectángulos.
// Parámetros:
//   fn   -> la función matemática, ej: x => x*x  (equivale a f(x) = x²)
//   a, b -> los límites del intervalo [a, b]
//   n    -> en cuántos "pedacitos" (subintervalos) dividimos el intervalo
//   mode -> 'left', 'right' o 'midpoint': de qué lado de cada pedacito tomamos la altura
function riemannSum(fn, a, b, n, mode) {
  const h = (b - a) / n; // h = ancho de cada rectángulo (todos miden lo mismo)
  let sum = 0;           // aquí vamos acumulando la suma de las áreas
  for (let i = 0; i < n; i++) {
    // Para cada uno de los n rectángulos, decidimos en qué punto "x" medimos la altura:
    let x;
    if (mode === 'left') x = a + i * h;           // el borde izquierdo del rectángulo i
    else if (mode === 'right') x = a + (i + 1) * h; // el borde derecho del rectángulo i
    else x = a + (i + 0.5) * h;                    // el punto justo en la mitad (midpoint)

    sum += fn(x) * h; // área del rectángulo = altura (fn(x)) × ancho (h)
  }
  return sum; // esta es la aproximación total del área bajo la curva
}

// trapezoidalRule: en vez de rectángulos, usa trapecios (más ajustados a la curva).
function trapezoidalRule(fn, a, b, n) {
  const h = (b - a) / n;
  // La fórmula del trapecio suma los extremos una sola vez, y los puntos
  // intermedios DOS veces (porque cada uno se comparte entre dos trapecios vecinos).
  let sum = fn(a) + fn(b); // extremos: se cuentan una sola vez
  for (let i = 1; i < n; i++) sum += 2 * fn(a + i * h); // puntos internos: se cuentan doble
  return (sum * h) / 2; // fórmula final: (h/2) × [suma de arriba]
}

// simpsonRule: usa parábolas en vez de líneas rectas (más precisa aún).
// OJO: Simpson necesita que "n" sea PAR (cada parábola necesita 2 subintervalos).
function simpsonRule(fn, a, b, n) {
  if (n % 2 !== 0) n += 1; // si nos dan un n impar, lo subimos al par siguiente
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    // Los puntos en posición IMPAR se multiplican por 4, los PARES (internos) por 2.
    // Este patrón 1-4-2-4-2-...-4-1 es la "firma" característica de Simpson.
    sum += (i % 2 === 0 ? 2 : 4) * fn(x);
  }
  return (sum * h) / 3;
}

// Interpolación de Lagrange para 3 puntos (usada al dibujar las parábolas de Simpson)
function quadraticThroughPoints(p0, p1, p2) {
  return x => {
    const L0 = ((x - p1.x) * (x - p2.x)) / ((p0.x - p1.x) * (p0.x - p2.x));
    const L1 = ((x - p0.x) * (x - p2.x)) / ((p1.x - p0.x) * (p1.x - p2.x));
    const L2 = ((x - p0.x) * (x - p1.x)) / ((p2.x - p0.x) * (p2.x - p1.x));
    return p0.y * L0 + p1.y * L1 + p2.y * L2;
  };
}

// ---------- Utilidades de graficación (Plotly.js) ----------

// sampleCurve: genera muchos puntos (x, y) de la función para poder dibujar
// una línea curva suave (200 puntos es más que suficiente para que se vea lisa).
function sampleCurve(fn, a, b, steps = 200) {
  const x = [], y = [];
  for (let i = 0; i <= steps; i++) {
    const xi = a + ((b - a) * i) / steps; // repartimos los puntos uniformemente entre a y b
    x.push(xi);
    y.push(fn(xi));
  }
  return { x, y };
}

// curveTrace: convierte los puntos anteriores al formato que entiende Plotly
// para dibujar una línea ("trace" = una serie de datos a graficar).
function curveTrace(curve) {
  return {
    x: curve.x, y: curve.y,
    mode: 'lines', name: 'f(x)',
    line: { color: '#0B4038', width: 2.5 },
    hoverinfo: 'skip' // no mostramos tooltip al pasar el mouse sobre la curva (solo es visual)
  };
}

// baseLayout: configuración visual común a todas las gráficas (márgenes, colores, ejes).
// "shapes" son las figuras extra que dibujamos ENCIMA de la curva (rectángulos o trapecios).
function baseLayout(curve, extraShapes) {
  const yMax = Math.max(...curve.y) * 1.15; // un poco de aire arriba de la curva más alta
  const yMin = Math.min(0, Math.min(...curve.y) * 1.1); // incluye el eje 0 aunque la curva sea toda positiva
  return {
    margin: { l: 44, r: 16, t: 16, b: 34 },
    font: { family: 'Inter, sans-serif', size: 12, color: '#1F2A24' },
    xaxis: { zeroline: true, gridcolor: '#EAE6D6' },
    yaxis: { range: [yMin, yMax], gridcolor: '#EAE6D6' },
    shapes: extraShapes || [],
    showlegend: false,
    plot_bgcolor: '#FFFDF8',
    paper_bgcolor: '#FFFDF8'
  };
}

// renderRectanglePlot: dibuja la curva + un rectángulo por cada subintervalo.
// La usan los módulos de Riemann (módulo 1) y Punto Medio (módulo 3).
function renderRectanglePlot(divId, fn, a, b, n, mode) {
  const curve = sampleCurve(fn, a, b);
  const h = (b - a) / n;
  const shapes = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h, x1 = x0 + h;               // los dos bordes del rectángulo i
    const sampleX = mode === 'left' ? x0 : mode === 'right' ? x1 : x0 + h / 2; // dónde medimos la altura
    const height = fn(sampleX);
    shapes.push({
      type: 'rect', x0, x1, y0: 0, y1: height, // un rectángulo va de y=0 hasta y=height
      fillcolor: 'rgba(15,92,82,0.28)', line: { color: '#0F5C52', width: 1 }
    });
  }
  // Plotly.newPlot(dónde, qué datos, cómo se ve, opciones) — dibuja (o redibuja) la gráfica.
  Plotly.newPlot(divId, [curveTrace(curve)], baseLayout(curve, shapes),
    { displayModeBar: false, responsive: true });
}

// renderTrapezoidPlot: igual que arriba, pero en vez de un rectángulo dibuja
// un trapecio (un polígono de 4 lados que sigue la inclinación de la curva).
function renderTrapezoidPlot(divId, fn, a, b, n) {
  const curve = sampleCurve(fn, a, b);
  const h = (b - a) / n;
  const shapes = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h, x1 = x0 + h;
    const y0 = fn(x0), y1 = fn(x1); // las dos alturas (izquierda y derecha) del trapecio
    shapes.push({
      type: 'path',
      // "path" es una ruta SVG: M = mover el "lápiz", L = dibujar línea, Z = cerrar la figura
      path: `M ${x0},0 L ${x0},${y0} L ${x1},${y1} L ${x1},0 Z`,
      fillcolor: 'rgba(15,92,82,0.28)', line: { color: '#0F5C52', width: 1 }
    });
  }
  Plotly.newPlot(divId, [curveTrace(curve)], baseLayout(curve, shapes),
    { displayModeBar: false, responsive: true });
}

// renderSimpsonPlot: dibuja una parábola (curva, no polígono) por cada PAR de subintervalos.
function renderSimpsonPlot(divId, fn, a, b, n) {
  if (n % 2 !== 0) n += 1;
  const curve = sampleCurve(fn, a, b);
  const h = (b - a) / n;
  const traces = [curveTrace(curve)];
  for (let i = 0; i < n; i += 2) { // avanzamos de 2 en 2 porque cada parábola cubre 2 subintervalos
    const x0 = a + i * h, x1 = x0 + h, x2 = x0 + 2 * h;
    const p0 = { x: x0, y: fn(x0) }, p1 = { x: x1, y: fn(x1) }, p2 = { x: x2, y: fn(x2) };
    const quad = quadraticThroughPoints(p0, p1, p2); // la parábola que pasa por esos 3 puntos
    const xs = [], ys = [];
    const steps = 20;
    for (let k = 0; k <= steps; k++) { // muestreamos la parábola para poder dibujarla como línea curva
      const x = x0 + ((x2 - x0) * k) / steps;
      xs.push(x); ys.push(quad(x));
    }
    traces.push({
      x: xs, y: ys, mode: 'lines', fill: 'tozeroy', // "tozeroy" rellena el área hasta el eje x
      fillcolor: 'rgba(201,154,46,0.28)', line: { color: '#C99A2E', width: 1.5 },
      hoverinfo: 'skip'
    });
  }
  Plotly.newPlot(divId, traces, baseLayout(curve, []),
    { displayModeBar: false, responsive: true });
}

// ---------- Inicializador genérico del visualizador ----------
// Esta función "conecta" los controles HTML (selects, inputs, slider) con las
// funciones matemáticas de arriba. La reutilizamos en los 4 módulos cambiando
// solo el objeto "config" — así no repetimos este código cuatro veces.
//
// config = {
//   prefix:     texto que va antes de cada id en el HTML (ej: 'r1-' -> 'r1-fn-select')
//   methodType: 'riemann' | 'trapezoid' | 'midpoint' | 'simpson'
//   hasMode:    true si el módulo tiene selector de tipo (izquierda/derecha/punto medio)
//   plotId:     el id del <div> donde Plotly va a dibujar
// }
function initVisualizer(config) {
  const $ = id => document.getElementById(id); // atajo para no escribir "document.getElementById" siempre

  // Buscamos en el HTML todos los controles que vamos a necesitar:
  const fnSelect = $(config.prefix + 'fn-select');
  const aInput = $(config.prefix + 'a-input');
  const bInput = $(config.prefix + 'b-input');
  const nSlider = $(config.prefix + 'n-slider');
  const nValueLabel = $(config.prefix + 'n-value');
  const modeSelect = config.hasMode ? $(config.prefix + 'mode-select') : null;
  const approxEl = $(config.prefix + 'approx-value');
  const exactEl = $(config.prefix + 'exact-value');
  const errorEl = $(config.prefix + 'error-value');

  // update(): se ejecuta cada vez que el usuario cambia algún control.
  // Lee los valores actuales, recalcula todo y vuelve a dibujar la gráfica.
  function update() {
    const def = FUNCTIONS[fnSelect.value]; // la función elegida (con su fórmula y antiderivada)
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    let n = parseInt(nSlider.value, 10);

    // Si el método es Simpson y el usuario dejó n impar, lo corregimos automáticamente:
    if (config.methodType === 'simpson' && n % 2 !== 0) {
      n += 1;
      nSlider.value = n;
    }
    nValueLabel.textContent = n; // mostramos el valor actual de n junto al slider

    const mode = modeSelect ? modeSelect.value : 'midpoint';

    // Elegimos qué fórmula usar según el tipo de módulo:
    let approx;
    if (config.methodType === 'riemann') approx = riemannSum(def.fn, a, b, n, mode);
    else if (config.methodType === 'trapezoid') approx = trapezoidalRule(def.fn, a, b, n);
    else if (config.methodType === 'midpoint') approx = riemannSum(def.fn, a, b, n, 'midpoint');
    else if (config.methodType === 'simpson') approx = simpsonRule(def.fn, a, b, n);

    // El valor EXACTO se obtiene evaluando la antiderivada en b y en a (Teorema Fundamental del Cálculo):
    const exact = def.antiderivative(b) - def.antiderivative(a);
    const error = Math.abs(exact - approx); // qué tan lejos quedó nuestra aproximación

    // Mostramos los tres números en pantalla, redondeados a 5 decimales:
    approxEl.textContent = approx.toFixed(5);
    exactEl.textContent = exact.toFixed(5);
    errorEl.textContent = error.toFixed(5);

    // Volvemos a dibujar la gráfica con los nuevos valores:
    if (config.methodType === 'trapezoid') renderTrapezoidPlot(config.plotId, def.fn, a, b, n);
    else if (config.methodType === 'simpson') renderSimpsonPlot(config.plotId, def.fn, a, b, n);
    else renderRectanglePlot(config.plotId, def.fn, a, b, n, mode); // riemann y midpoint comparten dibujo
  }

  // Le decimos a cada control: "cuando cambies, ejecuta update()":
  [fnSelect, aInput, bInput, nSlider, modeSelect].forEach(el => {
    if (el) el.addEventListener('input', update);
  });

  update(); // ejecutamos una vez al cargar la página, para que la gráfica aparezca de inmediato
}
