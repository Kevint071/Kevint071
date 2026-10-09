// Genera assets/row-<id>-{dark,light}.svg: una fila por proyecto con un glifo animado propio.
// Uso: node .github/scripts/projects.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const THEMES = {
  dark: { text: "#e6edf3", mute: "#8b949e", line: "#30363d", soft: "#161b22", ph: "#3d444d", bar: "#6e7681", accent: "#58a6ff", ok: "#3fb950", onAccent: "#0d1117" },
  light: { text: "#1f2328", mute: "#59636e", line: "#d1d9e0", soft: "#f6f8fa", ph: "#c4ccd4", bar: "#8c959f", accent: "#0969da", ok: "#1a7f37", onAccent: "#ffffff" },
};
const SANS = `-apple-system, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, 'SF Mono', 'Cascadia Code', Consolas, monospace`;
const EASE = "cubic-bezier(.2,.7,.2,1)";
const W = 820, H = 136, GLYPH = 72, GY = 20, TX = 100;
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
    desc: ["Edita en lote las Tasks hijas de un PBI: estado, responsable y horas de varias a la vez,", "sin abrir cada Work Item. El token de acceso va en cookies httpOnly, fuera del alcance del cliente."],
    tags: ["Next.js", "TypeScript", "Azure DevOps"],
    status: "Demo en línea",
    glyph: taskEditor,
  },
  {
    id: "finver",
    name: "Finver",
    desc: ["Control financiero familiar: ingresos y gastos organizados por grupos,", "con un análisis básico de lo que entra y lo que sale."],
    tags: ["Next.js", "TypeScript"],
    status: "Demo en línea",
    glyph: finver,
  },
  {
    id: "taskev",
    name: "Taskev",
    desc: ["Gestor de tareas pensado para responder qué toca hacer ahora: ordena por prioridad y", "progreso, y separa lo que vence hoy, lo atrasado y lo bloqueado."],
    tags: ["Next.js", "React", "TypeScript", "PostgreSQL"],
    status: "Demo en línea",
    glyph: taskev,
  },
  {
    id: "diezapp",
    name: "DiezApp + Diezapp-api",
    desc: ["App local para calcular diezmos: reparte un monto neto, guarda el historial, resume por mes", "y exporta a PDF. Su API hace de proxy OAuth para conectar con Google Drive."],
    tags: ["Python", "Flet", "SQLite", "Next.js (API)"],
    status: "API en línea",
    glyph: diezapp,
  },
];

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
    const statusW = Math.round(p.status.length * CHAR);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.name)}: ${esc(p.desc.join(" "))} ${p.tags.join(", ")}.">
  <style>
    text{font-family:${SANS}} .m{font-family:${MONO}}
    @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes nudge{0%,100%{transform:translate(0,0)}50%{transform:translate(2.5px,-2.5px)}}
    .a{opacity:0;animation:in .6s ${EASE} both}
    .d{transform-origin:left center;transform-box:fill-box;animation:draw .9s ${EASE} both}
    .nu{animation:nudge 2.8s ease-in-out infinite}
    ${g.css}
    @media (prefers-reduced-motion:reduce){.a,.d,.nu{animation:none}.glyph *{animation-play-state:paused!important;animation-delay:-4.2s!important}.a,.d{animation:none;opacity:1}}
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
  <g class="a" style="animation-delay:.4s">
    <circle cx="${W - 34 - statusW - 10}" cy="29.5" r="3.5" fill="${t.ok}" opacity=".4"><animate attributeName="r" values="3.5;8;8" keyTimes="0;.6;1" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".45;0;0" keyTimes="0;.6;1" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="${W - 34 - statusW - 10}" cy="29.5" r="3.5" fill="${t.ok}"/>
    <text class="m" x="${W - 34}" y="34" font-size="${FS.meta}" fill="${t.mute}" text-anchor="end">${esc(p.status)}</text>
  </g>
  <g transform="translate(${W - 15} 21)"><g class="nu" fill="none" stroke="${t.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M0 14 14 0"/><path d="M4 0h10v10"/></g></g>
  <rect class="d" x="0" y="${H - 1}" width="${W}" height="1" fill="${t.line}" style="animation-delay:.1s"/>
</svg>
`;
    writeFileSync(`assets/row-${p.id}-${mode}.svg`, svg);
  }
}
console.log(`Generadas ${PROJECTS.length * 2} filas en assets/`);
