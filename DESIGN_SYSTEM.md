# GymFlow — Sistema de Diseño UI/UX

> Documento de referencia para todas las decisiones visuales, de interacción y de experiencia de la aplicación móvil **GymFlow**.
> Versión: 1.0 · Ámbito: producto móvil (Expo / React Native) · Idioma de interfaz: español (rioplatense, tuteo).
> Este documento **no define funcionalidades**. Solo define cómo la app **se ve, se siente y se comporta** visualmente.

---

## 1. Filosofía y principios de diseño

GymFlow no es una app de fitness más. Es un **cuaderno de entrenamiento digital** pensado para gente que ya va al gimnasio y valora el rigor sobre la gamificación vacía. Cada decisión de diseño se somete a cinco principios, ordenados por prioridad:

1. **Claridad antes que estética.** El usuario mira la pantalla entre series, con pulso alto y pocos segundos. Si algo no se lee en 1.5s, está mal diseñado.
2. **Densidad controlada.** Mostrar mucha información sin ruido. Jerarquía tipográfica > tarjetas decoradas.
3. **Peso visual honesto.** Lo grande es importante, lo chico es soporte. Nada decorativo compite con datos.
4. **Energía sin estridencia.** La app transmite fuerza (tipografía condensada, negros profundos, un solo acento azul eléctrico) sin caer en el cliché fitness (neón morado, gradientes azul-violeta, íconos 3D).
5. **Confianza silenciosa.** Menos efectos, más precisión. Las transiciones existen para orientar, no para impresionar.

**Antipatrones prohibidos:**
- Gradientes morado → rosa → azul (cliché AI/fitness).
- Ilustraciones 3D tipo "Notion + gym".
- Tarjetas con emoji gigante como identidad.
- Copy motivacional genérico ("¡Vamos, campeón!").
- Fondos con imágenes de gimnasio saturadas con overlay morado.

---

## 2. Dirección estética: *Kinetic Editorial*

La identidad de GymFlow combina dos mundos:

- **Editorial deportivo** — rigor tipográfico de revista (*The Athletic*, *Monocle*, *Tempus*), grid estricto, uso del blanco/negro como material, números tratados como titulares.
- **Kinético atlético** — tipografía condensada masiva para cifras, un único color de acento azul de alto voltaje, transiciones cortas y funcionales, sensación de "marcador de estadio".

**Diferenciador memorable:** en GymFlow, **los números del entrenamiento son la portada**. Pesos, reps, RIR, PRs — se muestran en tipografía display a tamaños editoriales (48–96 px). No son estadísticas secundarias; son la identidad visual de cada pantalla.

**Referencias cruzadas (para el equipo):**
- Linear (rigor, velocidad percibida, dark mode maduro).
- Strava (tipografía de marcador, pero sin su saturación naranja).
- Are.na y Readwise (editorial sereno, tipografía protagonista).
- App de *The Athletic* (cifras como titulares, jerarquía editorial).

No se busca imitar a Nike Training Club, Gymshark ni MyFitnessPal. GymFlow se diferencia por la **sobriedad editorial con acento azul eléctrico**.

---

## 3. Sistema de color

La paleta actual del repo ([theme.ts](constants/theme.ts)) usa azul Material Design. Se propone una **reforma completa** hacia un sistema con dark-mode como ciudadano de primera clase y un azul cobalto propio, más editorial y menos genérico.

### 3.1 Paleta base

| Token semántico | Modo oscuro (primario) | Modo claro | Uso |
|---|---|---|---|
| `bg/canvas` | `#0B0B0D` (carbón) | `#F6F3EC` (papel crema) | Fondo raíz de pantalla |
| `bg/surface` | `#141417` | `#FFFFFF` | Tarjetas, sheets, modales |
| `bg/surface-alt` | `#1C1D21` | `#EFEBE1` | Filas alternas, inputs, agrupadores |
| `bg/elevated` | `#25272C` | `#FFFFFF` con sombra | Dropdowns, popovers, toasts |
| `border/subtle` | `#2A2C31` | `#E5DFD1` | Divisores internos |
| `border/strong` | `#3B3E44` | `#1A1A1A` | Bordes definitorios (botones outline) |
| `text/primary` | `#F2F1EC` | `#0B0B0D` | Títulos, cifras |
| `text/secondary` | `#A7A59D` | `#4A4A4E` | Labels, metadata |
| `text/muted` | `#6A6A70` | `#8A8780` | Placeholders, timestamps |
| `text/inverse` | `#0B0B0D` | `#F6F3EC` | Texto sobre botón primario |

### 3.2 Acento y señal

| Token | Valor | Dónde se usa (y **solo ahí**) |
|---|---|---|
| `accent/voltage` | `#2F6BFF` (azul cobalto eléctrico) | Botón primario, PR alcanzado, indicador de serie activa, subrayados editoriales |
| `accent/voltage-ink` | `#F6F3EC` | Texto que va **sobre** `accent/voltage` |
| `signal/danger` | `#FF3B2E` (rojo bermellón) | Errores de validación, confirmación destructiva |
| `signal/warning` | `#F5A524` (ámbar) | Advertencias, estados de borrador |
| `signal/success` | `#4ADE80` (verde ácido) | Confirmaciones discretas (toast), serie completada |

**Regla del acento.** El azul cobalto `#2F6BFF` nunca ocupa más del **8 % del área visible** de una pantalla. Es un reflector, no una moqueta. Si una pantalla tiene dos usos simultáneos del acento, uno de ellos está mal.

### 3.3 Paleta de datos (gráficos e historial)

Secuencia pensada para daltonismo y jerarquía clara sobre fondo oscuro:

1. `#2F6BFF` — serie actual / métrica foco
2. `#7AA8FF` — comparativa histórica
3. `#FF9B6A` — picos de volumen
4. `#B39CFF` — promedio móvil
5. `#4ADE80` — PR / récord

### 3.4 Reglas de contraste

- Todo texto cumple **WCAG AA** (4.5:1 para cuerpo, 3:1 para display ≥ 24 px bold).
- `text/primary` sobre `bg/canvas` en oscuro: ratio ≥ 15:1.
- `accent/voltage` **nunca** se usa como color de texto de cuerpo sobre fondo oscuro si es texto largo (falla legibilidad sostenida). Solo para titulares ≤ 6 palabras, cifras o elementos icónicos.
- Los bordes decorativos pueden bajar de 3:1; los bordes **funcionales** (inputs, focus) deben tener 3:1 mínimo.

### 3.5 Estrategia dark/light

- **Dark es el default.** Es coherente con el contexto (gimnasio, luz variable, pantalla cerca del rostro) y con la identidad editorial.
- **Light existe como modo paritario**, no como modo degradado. El modo claro usa **papel crema** (`#F6F3EC`), no blanco puro — esto evita el "glare" clínico y refuerza la personalidad editorial.
- La transición entre modos respeta las preferencias del sistema; cambia mediante crossfade de 180 ms, sin reanimar el contenido.

---

## 4. Tipografía

La tipografía es la identidad principal de GymFlow. Reemplaza al sistema por defecto de Expo.

### 4.1 Familias

| Rol | Fuente | Licencia | Justificación |
|---|---|---|---|
| **Display / números** | **Anton** | SIL OFL (gratis, Google Fonts) | Condensada, alto contraste, se comporta como titular de periódico deportivo. Evita el cliché de Bebas Neue y las display modernas saturadas. |
| **Cuerpo** | **Manrope** | SIL OFL | Humanista, excelente legibilidad a 13–17 px, personalidad suficiente sin convertirse en Inter/Roboto genérica. |
| **Datos tabulares** | **JetBrains Mono** | Apache 2.0 | Cifras tabulares, ideal para pesos/reps alineados en columnas y timers. |
| **Editorial acento (opcional, pantallas hero)** | **Fraunces** | SIL OFL | Serif variable con carácter, usada con moderación en pantallas vacías o headers narrativos (ej: "Bienvenido de nuevo"). |

Todas se cargan con `expo-font` al arrancar. No se usa `system`/`ui-sans-serif` salvo como fallback.

### 4.2 Escala tipográfica

Escala modular base 16 px, razón 1.25 (Major Third), con desvíos editoriales en los extremos:

| Token | Tamaño | Line-height | Uso |
|---|---|---|---|
| `display-2xl` | 72 px | 1.0 | Cifras hero (PR, peso levantado) |
| `display-xl` | 56 px | 1.02 | Titulares de pantalla vacía / onboarding |
| `display-lg` | 44 px | 1.05 | Titulares de sección (Historial, Rutinas) |
| `display-md` | 32 px | 1.1 | Titulares de tarjeta |
| `heading-lg` | 22 px | 1.2 | H1 de pantalla |
| `heading-md` | 18 px | 1.25 | H2 / card title |
| `heading-sm` | 16 px | 1.3 | H3 / subtítulos |
| `body-lg` | 17 px | 1.45 | Texto principal |
| `body-md` | 15 px | 1.5 | Texto secundario, descripciones |
| `body-sm` | 13 px | 1.45 | Metadata, captions |
| `label` | 12 px | 1.3 | Etiquetas uppercase, chips |
| `micro` | 11 px | 1.2 | Timestamps, legales |

### 4.3 Reglas tipográficas

- **Display (Anton)** siempre en uppercase cuando se usa para titulares narrativos. En cifras, va en su forma nativa.
- **Tracking** negativo en display (-1 % a -2 %) para compactar visualmente los titulares.
- **Body (Manrope)** nunca en uppercase; sí puede usarse en `label` con `letter-spacing: 0.08em` y `font-weight: 600`.
- **Números de entrenamiento** (pesos, reps, series) siempre con `font-variant-numeric: tabular-nums` o equivalente en Manrope/JetBrains Mono para alineación vertical.
- **Ítalicas**: solo en Fraunces, para pantallas editoriales hero. No se usan en Anton ni en Manrope (no se incluyen los pesos itálicos en el bundle).
- **Pesos bundled:** Anton 400; Manrope 400, 500, 600, 700; JetBrains Mono 400, 500; Fraunces 400 italic, 700.
- **No se mezclan más de dos familias en una misma pantalla** (excepción: pantalla hero con Fraunces + Manrope).

### 4.4 Jerarquía editorial aplicada

Patrón recurrente de titular de pantalla:

```
┌─────────────────────────────────────┐
│  LUNES · PECHO Y TRÍCEPS           │  ← label 12px uppercase Manrope
│                                     │
│  SESIÓN                             │  ← display-lg Anton
│  N° 47                              │  ← display-2xl Anton
│                                     │
│  8 ejercicios · 52 min estimado     │  ← body-sm Manrope text/secondary
└─────────────────────────────────────┘
```

La cifra (N° 47) es el punto focal. La jerarquía se construye con **contraste de escala**, no con contraste de color.

---

## 5. Sistema de espaciado y grid

### 5.1 Escala base

Unidad base: **4 px**. Toda la UI se alinea a múltiplos de 4.

| Token | Valor | Uso |
|---|---|---|
| `space-0` | 0 | Colapsado |
| `space-1` | 4 px | Gap entre ícono y su label |
| `space-2` | 8 px | Padding interno mínimo |
| `space-3` | 12 px | Gap entre chips |
| `space-4` | 16 px | Padding estándar de card, gap de lista |
| `space-5` | 24 px | Separación entre secciones dentro de pantalla |
| `space-6` | 32 px | Separación entre bloques mayores |
| `space-7` | 48 px | Margen superior de headers editoriales |
| `space-8` | 64 px | Respiro en pantallas vacías / hero |

### 5.2 Márgenes de pantalla

- **Horizontal de pantalla:** 20 px (no 16; da aire editorial).
- **Safe area top:** respetar `useSafeAreaInsets()` + 8 px de respiro adicional.
- **Safe area bottom:** respetar inset + 12 px sobre la tab bar para FABs o botones primarios.

### 5.3 Grid

- Pantallas de tarjetas: **grid de 2 columnas** con gap de 12 px cuando la densidad lo permite (listas de músculos, rutinas prediseñadas).
- Pantallas de lista vertical: **una columna full-bleed** con divisores hair-line `1 px` en `border/subtle`.
- Pantallas editoriales (home, resumen): se permite **grid roto** — una card grande 1fr arriba, dos cards 1fr:1fr abajo. Asimetría intencionada.

### 5.4 Ritmo vertical

Todos los párrafos y bloques respetan un ritmo base de 8 px. Un título `heading-lg` (22 px / line-height 1.2) ocupa ~27 px; se redondea a múltiplo de 8 sumando margen inferior.

---

## 6. Elevación, profundidad y materiales

GymFlow **rechaza las sombras genéricas de Material**. Usa tres estrategias de profundidad:

### 6.1 Dark mode — profundidad por luminancia

En oscuro, **más claro = más cerca**. No hay sombras; hay capas de gris ascendente.

- Canvas: `#0B0B0D`
- Surface: `#141417` (+4 % L)
- Surface elevated: `#25272C` (+8 % L)
- Overlay de modal: `rgba(11,11,13,0.72)` con blur 20 (iOS) / `#0B0B0D` opaco con 72 % (Android sin blur).

### 6.2 Light mode — sombras tintadas sutiles

- `elevation-1`: `0 1px 2px rgba(26,26,26,0.04), 0 1px 1px rgba(26,26,26,0.03)` — tarjetas.
- `elevation-2`: `0 4px 12px rgba(26,26,26,0.06), 0 2px 4px rgba(26,26,26,0.04)` — menús, popovers.
- `elevation-3`: `0 12px 32px rgba(26,26,26,0.10)` — modales.

Las sombras **nunca** se multiplican ni llevan blur > 32. Son señales, no decoración.

### 6.3 Bordes como profundidad alternativa

Para definir cards sin sombra (el patrón editorial), usar `1 px solid border/subtle`. Más honesto que una sombra tenue, y funciona igual en light y dark.

### 6.4 Radios

| Token | Valor | Uso |
|---|---|---|
| `radius-none` | 0 | Bloques editoriales, headers de pantalla |
| `radius-sm` | 6 px | Chips, badges |
| `radius-md` | 12 px | Inputs, botones |
| `radius-lg` | 20 px | Cards principales |
| `radius-xl` | 28 px | Sheets modales |
| `radius-full` | 9999 px | Avatares, toggles circulares |

**Principio:** radios grandes no son "modernos". La app combina radios medios (12–20) con bordes rectos (0) en headers editoriales. La mezcla crea la identidad.

---

## 7. Iconografía

### 7.1 Set base

- **Lucide React Native** como set primario (línea consistente, 1.5 px, terminaciones redondeadas).
- Tamaño base **20 px** (no 24). Combinado con la tipografía condensada, 24 px se siente pesado.
- Dentro de botones: 18 px. En navegación: 22 px. En hero/feature: 28–32 px.

### 7.2 Reglas

- Un ícono **nunca** reemplaza una palabra si la palabra cabe en el espacio. Label + ícono > solo ícono.
- No se usan íconos duotono, rellenos ni con gradientes. Solo línea.
- Los íconos activos en la nav bar se destacan con **el label en `text/primary` + subrayado de 2 px en `accent/voltage`**, no pintando el ícono.

### 7.3 Iconos de músculos / ejercicios

Para pantallas de músculos y ejercicios, GymFlow **no usa ilustraciones anatómicas coloreadas** (cliché). Usa:
- Siluetas anatómicas monocromáticas en `text/primary` sobre `surface`, trazo 1.5 px, estilo técnico (inspiración: manuales de anatomía editorial).
- Se encarga al equipo un pack de 12 músculos base coherente. Entre tanto, se usan placeholders de Lucide con label tipográfico fuerte.

---

## 8. Imágenes y tratamiento visual

- **Sin fotografías de stock.** Si se requiere imagen de ejercicio, usar ilustración técnica mono-color o GIFs de demostración con fondo neutro (no gimnasio real).
- **Proporciones fijas:** 16:9 para cards horizontales, 4:5 para cards de rutina, 1:1 para avatares.
- Todas las imágenes llevan un **grano sutil** (opacity 4 %, blend-mode overlay) aplicado por CSS/RN para unificar con la estética editorial. Opcional, activable por flag de tema.
- **Ratio de carga:** se muestra un skeleton `bg/surface-alt` con shimmer lento (2.4 s, no el clásico 1 s frenético).

---

## 9. Componentes

Catálogo mínimo del sistema. Cada componente tiene variantes, estados y reglas de uso. Los componentes actuales en [components/ui/](components/ui/) deben refactorizarse a este sistema.

### 9.1 Botón

Variantes:
- **Primary** — `accent/voltage` de fondo, `accent/voltage-ink` de texto, peso 700, uppercase, tracking 0.04em, altura 52 px, radio 12, padding horizontal 20.
- **Secondary** — fondo `bg/surface-alt`, texto `text/primary`, borde `border/strong` 1 px.
- **Ghost** — sin fondo ni borde, texto `text/primary` con subrayado en hover/press.
- **Destructive** — texto `signal/danger`, borde 1 px `signal/danger`, fondo transparente. Solo para acciones destructivas explícitas.

Estados: `default` → `pressed` (escala 0.98, duración 120 ms) → `disabled` (opacidad 0.35, sin press feedback) → `loading` (spinner 16 px en lugar del label, botón conserva su ancho).

Reglas:
- Máximo **un botón primary por pantalla**. Nunca dos acciones de igual peso visual.
- El botón primary vive en la **base de la pantalla**, anclado con safe area, cuando es la acción definitoria.
- El texto del botón es un **verbo en imperativo** ("Guardar rutina", no "Listo").

### 9.2 Input

- Altura 52 px, radio 12, padding horizontal 16.
- Fondo `bg/surface-alt`, borde `border/subtle` 1 px.
- Focus: borde `accent/voltage` 2 px (inset, no fuera), label flotante sube con transición de 180 ms ease-out.
- Label flotante en `label` (12 px, uppercase, tracking 0.08em).
- Error: borde `signal/danger`, mensaje debajo en `body-sm` rojo, con ícono `AlertCircle` 14 px a la izquierda del mensaje.

### 9.3 Card

Variantes:
- **Card/flat** — `bg/surface`, borde 1 px `border/subtle`, sin sombra, radio 20.
- **Card/feature** — la misma pero con un **acento lateral izquierdo** de 3 px `accent/voltage` cuando representa contenido activo o destacado.
- **Card/data** — fondo `bg/surface`, sin borde, separadores internos de 1 px. Cifras en Anton display, labels en `label` uppercase.

La card de datos es el **componente firma** de GymFlow:

```
╔══════════════════════════════════════╗
║  PESO ACUMULADO ESTA SEMANA          ║  label uppercase
║                                      ║
║  12,480                              ║  display-2xl Anton
║  KG                                  ║  label uppercase en segunda línea
║                                      ║
║  ───────────────────────────         ║  divisor hair-line
║  +18 % vs. semana anterior           ║  body-sm con micro-indicador
╚══════════════════════════════════════╝
```

### 9.4 Chip / Badge

- Altura 28 px, padding horizontal 10 px, radio 6.
- Texto `label` (12 px) en Manrope 500.
- Variantes: `neutral` (fondo `bg/surface-alt`, texto `text/secondary`), `accent` (fondo `accent/voltage`, texto `accent/voltage-ink`), `outline` (solo borde).
- Nunca llevan ícono relleno. Si llevan ícono, es 14 px Lucide a la izquierda.

### 9.5 Tab bar (navegación inferior)

- Altura 64 px + safe area.
- Fondo `bg/surface` con **borde superior** de 1 px `border/subtle` (no sombra).
- 3–4 tabs máximo.
- Tab activa: label `text/primary` peso 600 + barra de 2 px `accent/voltage` **arriba** del ícono (ancho = ancho del label). Nunca pintar el ícono.
- Íconos 22 px, label 11 px uppercase tracking 0.04em.
- Haptic feedback suave al cambiar de tab (`expo-haptics` light impact).

### 9.6 Header de pantalla

Dos variantes:
- **Header editorial** (pantallas principales): título display-lg Anton, eyebrow label uppercase arriba, margen top 32 px desde la safe area. Sin fondo, sin borde inferior.
- **Header funcional** (pantallas secundarias, con back): altura 56 px, back a la izquierda (ícono 22 px), título centrado en `heading-md`, acción opcional a la derecha.

### 9.7 Lista

- Ítem con altura mínima 64 px (touch target generoso).
- Padding vertical 16, horizontal 20.
- Divisor hair-line entre ítems, no sobre el primero ni después del último.
- Chevron derecho solo si la fila navega a otra pantalla. Si es un toggle o selector, el control se muestra explícito a la derecha.

### 9.8 Modal / Bottom sheet

- Se prefieren **bottom sheets** sobre modales centrados. Son más naturales en móvil y más coherentes con la estética editorial.
- Radio superior `radius-xl` (28), inferior 0.
- Handle superior: pill de 4 × 36 px en `border/strong`, centrada, 10 px del borde.
- Overlay con blur 20 sobre el canvas (iOS) o opacidad 72 % (Android).
- Cierre por drag-down con resistencia elástica al sobrepasar el tope.

### 9.9 Toast

- Aparece desde el **top**, no desde el bottom (libera el área del botón primario).
- 48 px alto, radio 12, sombra `elevation-2` en light.
- Duración 3.2 s; 4.8 s si lleva acción.
- Variantes: `neutral`, `success`, `danger`, `warning` — diferenciadas por una **barra lateral izquierda** de 3 px del color de señal, no por tintar el fondo entero.

### 9.10 Skeleton / loading

- Rectángulos `bg/surface-alt` con shimmer diagonal 45°, duración 2.4 s, ease-in-out.
- Nunca spinners sobre toda la pantalla salvo en transiciones post-autenticación.
- Los skeletons respetan la **forma real** del contenido que reemplazan (mismo tamaño y posición), no bloques genéricos.

### 9.11 Empty states

- Ilustración **monocromática de línea** 1.5 px, no ilustración coloreada.
- Titular en `heading-lg` Anton uppercase.
- Descripción en `body-md` a dos líneas máximo.
- Un único CTA `button/primary`.
- Copy honesto: "Aún no hay rutinas acá", no "¡Empezá tu viaje!".

---

## 10. Patrones de navegación

### 10.1 Estructura global

- **Tab bar inferior** con 3 secciones: `Inicio`, `Rutinas`, `Historial`. Un cuarto slot reservado para `Perfil` si se incorpora.
- **Stack por tab** — cada tab mantiene su propio historial de navegación (patrón expo-router existente).
- **Modales** (crear rutina, detalle de ejercicio) como presentación vertical sobre el stack activo.

### 10.2 Back y gestos

- Gesto swipe-from-left activado en iOS para volver (nativo de React Navigation).
- En Android, botón back físico respetado.
- En headers funcionales, el ícono back es `ArrowLeft` 22 px (no `ChevronLeft` — el arrow es más editorial).

### 10.3 Transiciones entre pantallas

- Stack push: slide horizontal iOS estándar (280 ms).
- Modal up: slide vertical con spring suave (damping 20, stiffness 180).
- Tab switch: **sin animación** de contenido (cambio inmediato), solo la barra activa de la tab desliza.

### 10.4 Profundidad máxima

Máximo **3 niveles de navegación** desde una tab. Si un flujo requiere más, se resuelve con bottom sheets, no con más stacks.

---

## 11. Motion y micro-interacciones

La app tiene **motion contenido**. No hay animaciones decorativas.

### 11.1 Principios

- **Funcional** — la animación existe para orientar (de dónde viene, a dónde va) o para dar feedback (qué acaba de pasar).
- **Rápida** — nada supera los 320 ms salvo page-load inicial.
- **Coherente** — todos los easings son de la misma familia (ver abajo).

### 11.2 Curvas de animación

- `ease-out-standard` — `cubic-bezier(0.2, 0, 0, 1)` — default para entradas.
- `ease-in-standard` — `cubic-bezier(0.4, 0, 1, 1)` — default para salidas.
- `spring-soft` — damping 22, stiffness 210, mass 1 — bottom sheets, drags.
- `spring-tight` — damping 28, stiffness 380, mass 1 — botones, chips.

### 11.3 Duraciones

| Nombre | ms | Uso |
|---|---|---|
| `instant` | 80 | Feedback de press |
| `fast` | 160 | Toggles, tabs |
| `normal` | 240 | Transiciones de componente |
| `slow` | 320 | Page transitions |
| `editorial` | 520 | Page load inicial, staggered reveal |

### 11.4 Page load editorial

Al entrar a una pantalla principal (Inicio, Rutinas, Historial) se ejecuta un **staggered reveal**:

1. Eyebrow label: fade + translateY(8) → 0, delay 0 ms, duración 240.
2. Título display: fade + translateY(16) → 0, delay 80 ms, duración 320.
3. Primera card: fade + translateY(24) → 0, delay 160 ms, duración 320.
4. Cards siguientes: mismo patrón, stagger de 60 ms.

Total: ≤ 520 ms. Nunca se bloquea la interacción durante el reveal.

### 11.5 Micro-interacciones clave

- **Press de botón**: escala 0.98, duración 120 ms, spring-tight.
- **Like / marcar favorito**: el ícono rellena en 180 ms con un pequeño bounce (overshoot 1.08 → 1.0).
- **Check de serie completada**: el número tachado aparece con un trazo que se dibuja en 220 ms (SVG stroke-dashoffset).
- **Cambio de peso en input numérico**: tick haptic suave cada incremento.
- **PR alcanzado** (único momento "celebratorio"): el número explota brevemente con scale 1.0 → 1.12 → 1.0 (spring), y una línea de `accent/voltage` barre detrás del número de izquierda a derecha en 420 ms.

### 11.6 Reduced motion

Cuando el sistema indica `prefers-reduced-motion`, todas las animaciones se reducen a **crossfade de 120 ms**. Los springs se reemplazan por ease-out lineal. Los staggers se colapsan a reveal simultáneo.

---

## 12. Estados de interfaz

Toda pantalla contempla cinco estados, diseñados explícitamente:

1. **Loading** — skeleton con forma real del contenido.
2. **Empty** — ilustración + titular + descripción + CTA.
3. **Error** — ícono `AlertTriangle` 32 px en `signal/danger`, titular "Algo no cargó", descripción específica, botón "Reintentar".
4. **Offline** — banner superior no intrusivo, fondo `bg/surface-alt`, texto `body-sm`, ícono `WifiOff`.
5. **Populated** — estado normal con datos.

Los diseños sin los cinco estados documentados no se aprueban.

---

## 13. Accesibilidad

GymFlow cumple **WCAG 2.2 AA** como mínimo.

### 13.1 Contraste

- Ya cubierto en § 3.4.
- El acento azul **nunca** se usa como indicador único de estado — siempre acompañado de ícono o label.

### 13.2 Touch targets

- Mínimo **44 × 44 pt** (Apple HIG) / **48 × 48 dp** (Material). Se toma el mayor: 48.
- Hit-slop extendido en íconos de 20 px para alcanzar el target efectivo.

### 13.3 Tipografía dinámica

- Todos los tamaños respetan `PixelRatio.getFontScale()` hasta 1.3× sin romper layout.
- A 1.5× (accesibilidad máxima) los titulares editoriales se permiten truncar con ellipsis, pero el body **nunca** se trunca.

### 13.4 Labels y roles

- Todo botón sin texto lleva `accessibilityLabel`.
- Toda imagen decorativa: `accessibilityElementsHidden` + `importantForAccessibility="no"`.
- Toda imagen informativa: `accessibilityLabel` con descripción real.
- Los estados activos (tab, toggle) se anuncian con `accessibilityState={{ selected: true }}`.

### 13.5 Navegación por screen reader

- Orden de foco sigue la lectura visual (top → bottom, left → right).
- Los headers usan `accessibilityRole="header"`.
- Los grupos visuales usan `accessible={true}` con label compuesto cuando la combinación es lo informativo (ej: "Press de banca, 80 kg, 8 repeticiones").

### 13.6 Reducción de motion

- Ya cubierto en § 11.6.

### 13.7 Color-blind safe

- La paleta de datos (§ 3.3) se testea en deuteranopía, protanopía y tritanopía.
- Los gráficos siempre combinan color + forma (línea sólida vs. punteada vs. gruesa).

---

## 14. Tono de voz y microcopy

### 14.1 Reglas de voz

- **Tuteo / voseo rioplatense.** "Tu rutina", "tus ejercicios", "guardá" si se usa voseo, "guarda" si se usa tuteo. Elegir **uno** y sostenerlo en toda la app. Recomendación: **tuteo neutro** (más amplio en hispanohablantes).
- **Directo, sin condescendencia.** "Guardar rutina" en lugar de "¡Guardá tu rutina ahora!".
- **Sin exclamaciones.** Cero. Ni en errores, ni en celebraciones.
- **Sin emoji en la UI.** Emoji solo admisible en contenido generado por el usuario (notas), nunca en microcopy del sistema.
- **Errores específicos, nunca genéricos.** No "Ocurrió un error"; sí "No pudimos guardar la rutina. Revisá tu conexión y probá de nuevo.".

### 14.2 Patrones de copy

| Situación | Mal | Bien |
|---|---|---|
| Empty state | "¡Empezá tu viaje fitness!" | "Aún no hay rutinas acá." |
| Confirmación | "¡Genial! Rutina guardada 💪" | "Rutina guardada." |
| Error de red | "Ocurrió un error" | "Sin conexión. Los cambios se guardarán cuando vuelvas a estar online." |
| CTA principal | "¡Empezar ahora!" | "Crear rutina" |
| Onboarding | "Tu viaje comienza aquí" | "Registrá lo que levantaste. Nada más." |

### 14.3 Formato de datos

- **Pesos**: enteros o un decimal (72.5 kg). Unidad siempre con espacio (72.5 kg, no 72.5kg).
- **Reps**: entero sin unidad ("12" no "12 reps") cuando el contexto ya implica repeticiones.
- **Tiempo**: `mm:ss` para < 1 h, `h:mm` para ≥ 1 h. Nunca "0h 47m".
- **Fechas relativas**: "hoy", "ayer", "hace 3 días", hasta 7 días; luego fecha absoluta "12 abr".
- **Porcentajes**: con signo explícito en comparaciones ("+18 %", "−3 %"), con espacio antes del %.

---

## 15. Guía por pantalla

Solo tratamiento visual y jerarquía; no se describen flujos ni funcionalidad.

### 15.1 `(auth)/login` y `(auth)/register`

- Fondo `bg/canvas`.
- **Hero superior editorial**: logotipo discreto arriba (28 px), y debajo un titular display-xl Anton en dos líneas: "REGISTRÁ / LO QUE LEVANTÁS." (login) o "EMPEZÁ / EN SERIO." (registro). El split es intencional.
- Formulario abajo, full-width menos 20 px de margen lateral, con inputs 52 px y gap 16.
- Botón primary anclado al fondo con safe area.
- Link secundario ("¿Ya tenés cuenta?") en `body-md`, `text/secondary`, subrayado.
- Sin ilustración de gimnasio. Sin gradiente. Fondo liso.

### 15.2 `(tabs)/index` — Inicio

Pantalla editorial por excelencia.

- Eyebrow: fecha + día de rutina en label uppercase.
- Hero: cifra del día (sesiones acumuladas, volumen total de la semana) en display-2xl Anton.
- Grid roto: una card grande de "próximo entrenamiento" (altura 180), debajo dos cards 1:1 de métricas rápidas.
- Al final, lista de últimos 3 entrenamientos en formato fila densa con divisor hair-line.
- Page load con staggered reveal (§ 11.4).

### 15.3 `(tabs)/rutinas`

- Header editorial con título "RUTINAS" display-lg y chip count a la derecha ("12").
- Grid de 2 columnas con cards 4:5 para rutinas.
- Cada card: nombre de rutina en `heading-md` Anton, metadata en label uppercase (ej: "PECHO · 6 EJERCICIOS"), y una barra lateral izquierda `accent/voltage` si es la rutina activa esta semana.
- FAB o botón inferior anclado "Crear rutina" primary.

### 15.4 `crear-rutina`

- Header funcional con back.
- Título display-md "NUEVA RUTINA".
- Input de nombre sin label visible (placeholder en display-md Anton atenuado, tipo "Nombre de la rutina…"). Al enfocar, el placeholder sube como eyebrow.
- Lista de ejercicios añadidos en filas editoriales, draggables, con handle a la izquierda (ícono `GripVertical`).
- Botón "Agregar ejercicio" secondary, full-width, dashed 1.5 px `border/subtle`.
- CTA final "Guardar rutina" primary anclado.

### 15.5 `ejercicios/[musculo]`

- Header editorial: eyebrow "MÚSCULO", título display-lg Anton ("PECHO").
- Ilustración técnica mono-color de la anatomía del músculo, centrada, 140 px alto.
- Lista de ejercicios en filas con densidad media, cada fila muestra el nombre en `heading-sm`, variante principal en `body-sm text/secondary` y chevron derecho.

### 15.6 `variantes/[ejercicio]`

- Header funcional.
- Título display-md del ejercicio.
- Grid vertical de variantes como cards/flat con borde 1 px; cada card muestra nombre, una imagen/GIF técnico opcional y tags (nivel, equipamiento) como chips neutros.

### 15.7 `(tabs)/historial`

- Header editorial "HISTORIAL" display-lg.
- Gráfico de volumen semanal (alto 180 px) con la paleta de datos (§ 3.3). El eje Y vive sin axis line; solo labels discretos `body-sm text/muted`.
- Debajo, lista agrupada por semana. Cada grupo lleva un título label uppercase ("SEMANA 17 · ABR 21–27") y dentro filas de entrenamiento densas.
- Los PRs llevan un indicador `★` pequeño (14 px) en `accent/voltage` al lado del peso.

---

## 16. Do's and Don'ts

| ✅ Hacer | ❌ No hacer |
|---|---|
| Usar Anton para cifras a tamaño display | Usar Anton para cuerpo de texto |
| Dark mode como default | Asumir que light es "más accesible" |
| Un solo acento `#2F6BFF` por pantalla | Múltiples colores de marca compitiendo |
| Bordes 1 px como profundidad | Sombras Material genéricas |
| Cifras tabulares en datos | Proporcionales para listados numéricos |
| Copy directo en imperativo | Copy motivacional con exclamaciones |
| Empty states con ilustración de línea | Ilustraciones 3D o coloridas |
| 3 niveles máximos de navegación | Stacks profundos, modales sobre modales |
| Haptics suaves (light impact) | Haptics heavy en cada press |
| Papel crema en light | Blanco puro `#FFFFFF` en canvas |

---

## 17. Gobierno y evolución del sistema

- **Dueño del sistema**: Reynaldo (documentación/UX) + revisor técnico del equipo de desarrollo.
- **Fuente de verdad**: este documento + el archivo de tokens en [constants/theme.ts](constants/theme.ts). Si divergen, este documento manda y se corrige el código.
- **Cambios**: toda modificación al sistema (nuevo componente, nuevo token, nuevo patrón) se documenta primero aquí y luego se implementa. No se agregan componentes al código sin entrada correspondiente en este documento.
- **Revisión**: al cierre de cada sprint se revisa si el uso real divergió del sistema. Se actualizan los tokens o se corrige el uso.
- **Versionado**: SemVer. Cambios breaking (rename de token, cambio de escala) son major; incorporaciones son minor; correcciones y aclaraciones son patch.

---

## 18. Próximos pasos del sistema (no del producto)

1. **Migrar [constants/theme.ts](constants/theme.ts)** a los nuevos tokens (reemplazar la paleta azul Material por la paleta editorial descrita en § 3).
2. **Instalar y cargar las fuentes** (Anton, Manrope, JetBrains Mono, Fraunces) vía `expo-font` en el layout raíz.
3. **Refactorizar los componentes existentes** en [components/ui/](components/ui/) para alinearse con las especificaciones de § 9.
4. **Crear un archivo `tokens.ts`** con toda la escala tipográfica, de espaciado y de radios como objeto tipado.
5. **Documentar en Storybook (o equivalente RN)** cada componente con sus variantes y estados, como fuente viva del sistema.

---

*Fin del documento. Cualquier decisión visual que no esté contemplada acá se discute y se incorpora antes de implementarse.*
