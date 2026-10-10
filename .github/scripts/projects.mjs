// Genera assets/row-<id>-{dark,light}.svg: una fila por proyecto con un glifo animado propio,
// y assets/link-{github,web}-{dark,light}.svg: los dos iconos enlazables que van a su derecha.
// Cada fila del README son tres imágenes en la misma línea, sin espacios entre ellas:
// fila (CW/W = 90.24%) + GitHub (IW/W = 4.88%) + demo (4.88%). GitHub no conserva enlaces dentro de un SVG,
// por eso cada icono es una imagen aparte con su propio <a>.
// Uso: node .github/scripts/projects.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const THEMES = {
  dark: { text: "#e6edf3", mute: "#8b949e", line: "#30363d", soft: "#161b22", ph: "#3d444d", bar: "#6e7681", accent: "#58a6ff", onAccent: "#0d1117" },
  light: { text: "#1f2328", mute: "#59636e", line: "#d1d9e0", soft: "#f6f8fa", ph: "#c4ccd4", bar: "#8c959f", accent: "#0969da", onAccent: "#ffffff" },
};
const SANS = `-apple-system, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, 'SF Mono', 'Cascadia Code', Consolas, monospace`;
const EASE = "cubic-bezier(.2,.7,.2,1)";
const W = 820, H = 136, GLYPH = 72, GY = 20, TX = 100;
const IW = 40, CW = W - 2 * IW; // ancho de cada icono enlazable y de la fila que queda a su izquierda
// Escala tipográfica única: 16 títulos, 14 texto, 13 meta (mono: etiquetas, estado).
const FS = { title: 16, body: 14, meta: 13 };

// Curva de un ciclo: cada paso es [porcentaje, valor]; se mantiene el valor hasta el siguiente paso.
const kf = (name, steps) =>
  `@keyframes ${name}{${steps.map(([p, v]) => `${p}%{${v}}`).join("")}}`;

// ---------- Glifos (caja de 72x72, cada uno cuenta qué hace el proyecto) ----------

// Edición en lote: se marcan las tareas hijas y el estado cambia en todas a la vez.
const taskEditor = (t) => {
  const rows = [31, 43, 55];
  const marks = [[8, 14], [20, 26], [32, 38]];
  const css = [
    ...rows.map((_, i) => {
      const [a, b] = marks[i];
      return kf(`ck${i}`, [[0, "stroke-dashoffset:9"], [a, "stroke-dashoffset:9"], [b, "stroke-dashoffset:0"], [88, "stroke-dashoffset:0"], [94, "stroke-dashoffset:9"], [100, "stroke-dashoffset:9"]]) +
        kf(`bx${i}`, [[0, "opacity:0"], [a, "opacity:0"], [b, "opacity:1"], [88, "opacity:1"], [94, "opacity:0"], [100, "opacity:0"]]) +
        `.ck${i}{stroke-dasharray:9;animation:ck${i} 7s ${EASE} infinite}.bx${i}{animation:bx${i} 7s ${EASE} infinite}`;
    }),
    kf("pl", [[0, `fill:${t.ph}`], [50, `fill:${t.ph}`], [57, `fill:${t.accent}`], [88, `fill:${t.accent}`], [95, `fill:${t.ph}`], [100, `fill:${t.ph}`]]),
    `.pl{animation:pl 7s ${EASE} infinite}`,
  ].join("");
  const body = `
    <rect x="12" y="12" width="34" height="5" rx="2.5" fill="${t.accent}"/>
    <path d="M15 19V55M15 31h6M15 43h6M15 55h6" fill="none" stroke="${t.bar}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
    ${rows.map((cy, i) => `<rect x="24" y="${cy - 4}" width="8" height="8" rx="2" fill="none" stroke="${t.bar}" stroke-width="1.2"/>
    <rect class="bx${i}" x="24" y="${cy - 4}" width="8" height="8" rx="2" fill="${t.accent}" opacity="0"/>
    <path class="ck${i}" d="M25.6 ${cy}l2 2 3-4" fill="none" stroke="${t.onAccent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dashoffset="9"/>
    <rect x="37" y="${cy - 2}" width="${[14, 11, 13][i]}" height="4" rx="2" fill="${t.ph}"/>
    <rect class="pl" x="55" y="${cy - 3}" width="9" height="6" rx="3" fill="${t.ph}"/>`).join("\n    ")}`;
  return { css, body };
};

// Finanzas: ingresos (acento) frente a gastos (neutro) que crecen por grupo.
const finver = (t) => {
  const pairs = [[12, 30, 18], [32, 22, 26], [52, 38, 20]];
  const css =
    kf("gr", [[0, "transform:scaleY(0)"], [14, "transform:scaleY(1)"], [86, "transform:scaleY(1)"], [97, "transform:scaleY(0)"], [100, "transform:scaleY(0)"]]) +
    `.gr{transform-box:fill-box;transform-origin:bottom;animation:gr 6s ${EASE} infinite}`;
  const body = `
    <path d="M9 60H63" stroke="${t.bar}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
    ${pairs.map(([x, inc, exp], i) => `<rect class="gr" x="${x}" y="${60 - inc}" width="6" height="${inc}" rx="1.5" fill="${t.accent}" style="animation-delay:${(i * 0.18).toFixed(2)}s"/>
    <rect class="gr" x="${x + 8}" y="${60 - exp}" width="6" height="${exp}" rx="1.5" fill="${t.bar}" style="animation-delay:${(i * 0.18 + 0.09).toFixed(2)}s"/>`).join("\n    ")}`;
  return { css, body };
};

// Taskev: un marcador de foco recorre la lista y va cerrando lo hecho.
const taskev = (t) => {
  const rows = [16, 30, 44, 58];
  const leave = [22, 48, 74, 90];
  const css =
    kf("fm", [[0, "transform:translateY(0)"], [20, "transform:translateY(0)"], [26, "transform:translateY(14px)"], [46, "transform:translateY(14px)"], [52, "transform:translateY(28px)"], [72, "transform:translateY(28px)"], [78, "transform:translateY(42px)"], [92, "transform:translateY(42px)"], [99, "transform:translateY(0)"], [100, "transform:translateY(0)"]]) +
    `.fm{animation:fm 9s cubic-bezier(.4,0,.2,1) infinite}` +
    rows.map((_, i) => {
      const a = leave[i], b = a + 5;
      return kf(`d${i}`, [[0, "opacity:0"], [a, "opacity:0"], [b, "opacity:1"], [96, "opacity:1"], [100, "opacity:0"]]) +
        kf(`s${i}`, [[0, "opacity:1"], [a, "opacity:1"], [b, "opacity:.4"], [96, "opacity:.4"], [100, "opacity:1"]]) +
        `.d${i}{animation:d${i} 9s ${EASE} infinite}.s${i}{animation:s${i} 9s ${EASE} infinite}`;
    }).join("");
  const body = `
    <rect class="fm" x="5" y="${rows[0] - 7}" width="2.5" height="14" rx="1.25" fill="${t.accent}"/>
    ${rows.map((cy, i) => `<rect x="13" y="${cy - 4}" width="8" height="8" rx="2" fill="none" stroke="${t.bar}" stroke-width="1.2"/>
    <rect class="d${i}" x="13" y="${cy - 4}" width="8" height="8" rx="2" fill="${t.accent}" opacity="0"/>
    <path class="d${i}" d="M14.6 ${cy}l2 2 3-4" fill="none" stroke="${t.onAccent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
    <rect class="s${i}" x="27" y="${cy - 2}" width="${[30, 24, 33, 20][i]}" height="4" rx="2" fill="${t.ph}"/>`).join("\n    ")}`;
  return { css, body };
};

// DiezApp: un monto neto que se reparte en porciones.
const diezapp = (t) => {
  const r = 19, C = 2 * Math.PI * r;
  const parts = [[0.24, t.accent], [0.36, t.bar], [0.4, t.ph]];
  let start = 0;
  const segs = parts.map(([share, color], i) => {
    const len = share * C, off = -start * C;
    start += share;
    return { len, off, color, i };
  });
  const css =
    segs.map(({ len, i }) => {
      const a = 6 + i * 17, b = a + 15;
      return kf(`sg${i}`, [[0, `stroke-dasharray:0 ${C.toFixed(2)}`], [a, `stroke-dasharray:0 ${C.toFixed(2)}`], [b, `stroke-dasharray:${len.toFixed(2)} ${C.toFixed(2)}`], [88, `stroke-dasharray:${len.toFixed(2)} ${C.toFixed(2)}`], [95, `stroke-dasharray:0 ${C.toFixed(2)}`], [100, `stroke-dasharray:0 ${C.toFixed(2)}`]]) +
        `.sg${i}{animation:sg${i} 6.5s ${EASE} infinite}`;
    }).join("");
  const body = `
    <g transform="rotate(-90 36 36)" fill="none" stroke-width="8">
    ${segs.map(({ off, color, i }) => `<circle class="sg${i}" cx="36" cy="36" r="${r}" stroke="${color}" stroke-dasharray="0 ${C.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/>`).join("\n    ")}
    </g>
    <text class="m" x="36" y="40.5" font-size="13" font-weight="600" fill="${t.mute}" text-anchor="middle">%</text>`;
  return { css, body };
};

// ---------- Proyectos ----------

const PROJECTS = [
  {
    id: "azure-devops-task-editor",
    name: "azure-devops-task-editor",
    desc: ["Edita en lote las Tasks hijas de un PBI: estado, responsable y horas de varias a la vez,", "sin abrir cada Work Item. El token va en cookies httpOnly, fuera del alcance del cliente."],
    tags: ["Next.js", "TypeScript", "Azure DevOps"],
    glyph: taskEditor,
  },
  {
    id: "finver",
    name: "Finver",
    desc: ["Control financiero familiar: ingresos y gastos organizados por grupos,", "con un análisis básico de lo que entra y lo que sale."],
    tags: ["Next.js", "TypeScript"],
    glyph: finver,
  },
  {
    id: "taskev",
    name: "Taskev",
    desc: ["Gestor de tareas pensado para responder qué toca hacer ahora: ordena por prioridad y", "progreso, y separa lo que vence hoy, lo atrasado y lo bloqueado."],
    tags: ["Next.js", "React", "TypeScript", "PostgreSQL"],
    glyph: taskev,
  },
  {
    id: "diezapp",
    name: "DiezApp + Diezapp-api",
    desc: ["App local para calcular diezmos: reparte un monto neto, guarda el historial, resume por mes", "y exporta a PDF. Su API hace de proxy OAuth para conectar con Google Drive."],
    tags: ["Python", "Flet", "SQLite", "Next.js (API)"],
    glyph: diezapp,
  },
];

// ---------- Iconos enlazables ----------

const GITHUB = `<path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>`;
// Ventana de navegador: la app desplegada, funcionando.
const WEB = `<g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x=".65" y="1.65" width="14.7" height="12.7" rx="2"/><path d="M.65 5.35h14.7"/><path d="m6.5 7.8 3.2 2.1-3.2 2.1z" fill="currentColor"/></g><circle cx="3" cy="3.5" r=".7" fill="currentColor"/><circle cx="5.2" cy="3.5" r=".7" fill="currentColor"/>`;

// Separador inferior. Todas las imágenes de la fila dibujan la misma línea de W de ancho, desplazada a su
// posición, para que al animarse crezca de izquierda a derecha como una sola.
const divider = (t, x) =>
  `<rect class="d" x="${-x}" y="${H - 1}" width="${W}" height="1" fill="${t.line}" style="animation-delay:.1s"/>`;

const icon = (t, x, label, glyph) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IW}" height="${H}" viewBox="0 0 ${IW} ${H}" role="img" aria-label="${label}">
  <style>
    @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    .a{opacity:0;animation:in .6s ${EASE} both}
    .d{transform-origin:left center;transform-box:fill-box;animation:draw .9s ${EASE} both}
    @media (prefers-reduced-motion:reduce){.a,.d{animation:none;opacity:1}}
  </style>
  <g class="a" style="animation-delay:.4s">
    <rect x="4.5" y="13.5" width="${IW - 9}" height="31" rx="6" fill="${t.soft}" stroke="${t.line}"/>
    <g transform="translate(12 21)" color="${t.text}">${glyph}</g>
  </g>
  ${divider(t, x)}
</svg>
`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const CHAR = 7.8; // ancho aproximado de un carácter mono de 13px

mkdirSync("assets", { recursive: true });
for (const p of PROJECTS) {
  for (const [mode, t] of Object.entries(THEMES)) {
    const g = p.glyph(t);
    let cx = TX;
    const chips = p.tags
      .map((tag, i) => {
        const w = Math.round(tag.length * CHAR + 20);
        const out = `<g class="a" style="animation-delay:${(0.5 + i * 0.07).toFixed(2)}s"><rect x="${cx + 0.5}" y="92.5" width="${w}" height="24" rx="4" fill="none" stroke="${t.line}"/><text class="m" x="${cx + 0.5 + w / 2}" y="108.5" font-size="${FS.meta}" fill="${t.mute}" text-anchor="middle">${esc(tag)}</text></g>`;
        cx += w + 8;
        return out;
      })
      .join("\n  ");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}" role="img" aria-label="${esc(p.name)}: ${esc(p.desc.join(" "))} ${p.tags.join(", ")}.">
  <style>
    text{font-family:${SANS}} .m{font-family:${MONO}}
    @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    .a{opacity:0;animation:in .6s ${EASE} both}
    .d{transform-origin:left center;transform-box:fill-box;animation:draw .9s ${EASE} both}
    ${g.css}
    @media (prefers-reduced-motion:reduce){.a,.d{animation:none}.glyph *{animation-play-state:paused!important;animation-delay:-4.2s!important}.a,.d{animation:none;opacity:1}}
  </style>
  <g class="a" style="animation-delay:.05s" transform="translate(0 ${GY})">
    <rect x=".5" y=".5" width="${GLYPH - 1}" height="${GLYPH - 1}" rx="8" fill="${t.soft}" stroke="${t.line}"/>
    <g class="glyph">${g.body}
    </g>
  </g>
  <text class="a" x="${TX}" y="34" font-size="${FS.title}" font-weight="600" fill="${t.text}" style="animation-delay:.15s">${esc(p.name)}</text>
  <text class="a" x="${TX}" y="58" font-size="${FS.body}" fill="${t.mute}" style="animation-delay:.25s">${esc(p.desc[0])}</text>
  <text class="a" x="${TX}" y="78" font-size="${FS.body}" fill="${t.mute}" style="animation-delay:.32s">${esc(p.desc[1])}</text>
  ${chips}
  ${divider(t, 0)}
</svg>
`;
    writeFileSync(`assets/row-${p.id}-${mode}.svg`, svg);
  }
}
for (const [mode, t] of Object.entries(THEMES)) {
  writeFileSync(`assets/link-github-${mode}.svg`, icon(t, CW, "Código en GitHub", GITHUB));
  writeFileSync(`assets/link-web-${mode}.svg`, icon(t, CW + IW, "Ver la demo", WEB));
}
console.log(`Generadas ${PROJECTS.length * 2} filas y 4 iconos en assets/`);
