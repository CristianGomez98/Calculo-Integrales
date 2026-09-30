# Cálculo Integral · Plataforma Interactiva

Plataforma web estática (sin backend) que sirve como guía interactiva del curso de Cálculo Integral, organizada en 14 módulos repartidos en 3 fases.

## Arquitectura

Sitio multi-página estático: cada módulo es una carpeta independiente con su propio `index.html`, lo que permite desarrollarlos y evaluarlos por separado sin acoplar el código entre ellos.

```
proyecto-calculo-integral/
├── index.html                          # Página principal: navegación a los 14 módulos
├── README.md
├── assets/
│   ├── css/style.css                   # Sistema de diseño compartido (única hoja de estilos)
│   ├── js/metodos-numericos.js         # Riemann, Trapecio, Punto Medio y Simpson + utilidades Plotly
│   └── js/integracion-directa.js       # Área bajo la curva, área entre curvas y antiderivadas (usa las utilidades de metodos-numericos.js)
├── modulo-01-sumas-riemann/            # Teoría + visualizador + 2 ejemplos ✅
│   └── index.html
├── modulo-02-regla-trapecio/           # Teoría + visualizador + 2 ejemplos ✅
├── modulo-03-regla-punto-medio/        # Teoría + visualizador + 2 ejemplos ✅
├── modulo-04-regla-simpson/            # Teoría + visualizador + 2 ejemplos ✅
├── modulo-05-integral-definida-area/   # TFC + visualizador (área + área entre curvas) + 2 ejemplos ✅
├── modulo-06-integracion-directa/      # Fórmulas básicas + visualizador f/F + 4 ejemplos ✅
├── modulo-07-sustitucion-potencias/     # Fase 2 — placeholder
├── modulo-08-exponenciales/             # Fase 2 — placeholder
├── modulo-09-logaritmicas/              # Fase 2 — placeholder
├── modulo-10-trigonometricas/           # Fase 2 — placeholder
├── modulo-11-trigonometricas-inversas/  # Fase 2 — placeholder
├── modulo-12-hiperbolicas-inversas/     # Fase 3 — placeholder
├── modulo-13-trinomio-cuadratico/       # Fase 3 — placeholder
└── modulo-14-integracion-partes/        # Fase 3 — placeholder
```

## Stack tecnológico

| Capa | Herramienta | Motivo |
|---|---|---|
| Estructura/lógica | HTML5 + CSS3 + JavaScript vanilla | No requiere backend ni build step |
| Fórmulas matemáticas | [KaTeX](https://katex.org/) (CDN) | Renderizado rápido de LaTeX en el navegador |
| Gráficas interactivas | [Plotly.js](https://plotly.com/javascript/) (a integrar en módulos 1-6) | Curva de aprendizaje baja, ideal para visualizadores de área/curvas |
| Hosting | GitHub Pages | Despliegue gratuito y directo desde el repositorio |

## Convenciones

- **Una carpeta por módulo**, nombrada `modulo-NN-slug-descriptivo`.
- Cada página de módulo enlaza a `../assets/css/style.css` (una sola fuente de estilos para todo el sitio).
- Los módulos de Fase 2 y 3 (7 al 14) muestran el mensaje **"Próximamente - Fase 2/3"** mientras no se desarrollen.
- KaTeX ya está enlazado en cada página de módulo (CDN de cdnjs), listo para usarse en cuanto se agregue contenido matemático.

## Estado actual

**Entregable 1 — Estructura base**
- [x] Repositorio con los 14 módulos como carpetas independientes
- [x] `index.html` con navegación funcional a los 14 módulos, agrupados por fase
- [x] Módulos 7-14 con placeholder "Próximamente - Fase 2/3"
- [x] Diseño responsive (probado en móvil y escritorio)
- [x] KaTeX enlazado y listo para renderizar fórmulas

**Entregable 2 — Módulos 1-4 (Métodos numéricos)**
- [x] Módulo 1 · Sumas de Riemann: teoría, visualizador (izquierda/derecha/punto medio) y 2 ejemplos
- [x] Módulo 2 · Regla del Trapecio: teoría, visualizador y 2 ejemplos
- [x] Módulo 3 · Regla del Punto Medio: teoría, visualizador y 2 ejemplos
- [x] Módulo 4 · Regla de Simpson: teoría, visualizador (n forzado par) y 2 ejemplos
- [x] Lógica matemática centralizada en `assets/js/metodos-numericos.js` (compartida entre los 4 módulos, sin duplicar código)
- [x] Todos los ejemplos verificados numéricamente contra el motor JS real (no solo calculados a mano)

**Entregable 3 — Módulos 5-6 (Área e integración directa)**
- [x] Módulo 5 · Integral Definida / Área bajo la Curva: TFC, visualizador (área simple + demo de área entre curvas) y 2 ejemplos
- [x] Módulo 6 · Integración Directa: fórmulas básicas, visualizador f(x)/F(x) y 4 ejemplos (potencia, exponencial, trigonométrica, racional)
- [x] Lógica matemática en `assets/js/integracion-directa.js` (reutiliza `sampleCurve`/`curveTrace`/`baseLayout` de `metodos-numericos.js`)
- [x] Todos los ejemplos verificados numéricamente (incluyendo comprobación de derivadas por diferencias finitas)

## Estado final del proyecto

**Fase 1 completa al 100%** — los 3 entregables (estructura base, módulos 1-4, módulos 5-6) están terminados, probados en GitHub Pages y funcionando en producción.

**Pendiente para fases futuras del curso**
- [ ] Fase 2 — Módulos 7-11 (sustitución, exponenciales, logarítmicas, trigonométricas, trigonométricas inversas)
- [ ] Fase 3 — Módulos 12-14 (hiperbólicas inversas, trinomio cuadrático, integración por partes)

## Cómo contribuir / continuar el desarrollo

1. Clonar el repositorio y abrir `index.html` en el navegador (no requiere servidor).
2. Para desarrollar un módulo, editar únicamente el `index.html` de su carpeta; los estilos base ya están disponibles vía `../assets/css/style.css`.
3. Para agregar una gráfica interactiva, incluir Plotly desde CDN dentro del `<head>` del módulo correspondiente:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js"></script>
   ```
4. Para escribir fórmulas matemáticas, usar `$...$` (en línea) o `$$...$$` (bloque); KaTeX las renderiza automáticamente al cargar la página.
5. Mantener el mismo patrón de encabezado/pie de página (`.site-header`, `.site-footer`) para conservar la identidad visual del sitio.
