// Genera assets/languages-{dark,light}.svg con los lenguajes más usados en los repos públicos.
// Uso: node .github/scripts/languages.mjs [usuario]   (GITHUB_TOKEN opcional, sube el límite de la API)
import { mkdirSync, writeFileSync } from "node:fs";

const user = process.argv[2] ?? process.env.GITHUB_REPOSITORY_OWNER ?? "Kevint071";
const headers = { "User-Agent": "languages-card", Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
};

const COLORS = {
  TypeScript: "#3178c6", Python: "#3572A5", "C#": "#178600", JavaScript: "#f1e05a", CSS: "#663399",
  HTML: "#e34c26", "Vim Script": "#199f4b", PLpgSQL: "#336790", SCSS: "#c6538c", Shell: "#89e051",
  PowerShell: "#012456", "T-SQL": "#e38c00",
};
const FALLBACK = "#8b949e";

const repos = (await api(`/users/${user}/repos?per_page=100&type=owner`)).filter((r) => !r.fork);
const totals = {};
for (const r of repos) {
  const langs = await api(`/repos/${user}/${r.name}/languages`);
  for (const [k, v] of Object.entries(langs)) totals[k] = (totals[k] ?? 0) + v;
}
const sum = Object.values(totals).reduce((a, b) => a + b, 0);
if (!sum) throw new Error("Sin datos de lenguajes");

const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
const top = sorted.slice(0, 7).map(([name, bytes]) => ({ name, pct: (bytes / sum) * 100 }));
const rest = sorted.slice(7).reduce((a, [, v]) => a + v, 0);
if (rest / sum >= 0.001) top.push({ name: "Otros", pct: (rest / sum) * 100, color: FALLBACK });
top.forEach((l) => (l.color ??= COLORS[l.name] ?? FALLBACK));

const THEMES = {
  dark: { text: "#e6edf3", mute: "#8b949e", track: "#21262d", line: "#30363d", accent: "#58a6ff" },
  light: { text: "#1f2328", mute: "#59636e", track: "#eaeef2", line: "#d1d9e0", accent: "#0969da" },
};
const SANS = `-apple-system, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, 'SF Mono', 'Cascadia Code', Consolas, monospace`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const luma = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Una fila por lenguaje: nombre | barra proporcional al 100% | porcentaje alineado a la derecha.
// El lienzo (828) y los márgenes replican lo que se ve de las tarjetas de estadísticas y de racha
// (su contenido visible empieza a 21px y termina a 33px del borde), para que todo quede alineado.
const W = 828, PAD_L = 21, PAD_R = 33, CW = W - PAD_L - PAD_R;
const TOP = 44, ROW_H = 30, TRACK_X = 176, TRACK_W = CW - TRACK_X - 80, BAR_H = 6;
const H = TOP + top.length * ROW_H + 6;

mkdirSync("assets", { recursive: true });
for (const [mode, t] of Object.entries(THEMES)) {
  const rows = top
    .map((l, i) => {
      const y = TOP + i * ROW_H, cy = y + ROW_H / 2;
      const color = mode === "dark" && luma(l.color) < 0.08 ? "#6e7681" : l.color;
      const w = Math.max((l.pct / 100) * TRACK_W, 3);
      const delay = (0.25 + i * 0.09).toFixed(2);
      const pct = l.pct < 0.1 ? "<0.1" : l.pct.toFixed(1);
      return `<rect class="d" x="0" y="${y}" width="${CW}" height="1" fill="${t.line}" style="animation-delay:${(i * 0.06).toFixed(2)}s"/>
  <g class="a" style="animation-delay:${delay}s">
    <rect x="0" y="${cy - 4}" width="8" height="8" rx="2" fill="${color}"/>
    <text x="22" y="${cy + 5}" font-size="14" fill="${t.text}">${esc(l.name)}</text>
  </g>
  <rect x="${TRACK_X}" y="${cy - BAR_H / 2}" width="${TRACK_W}" height="${BAR_H}" rx="3" fill="${t.track}"/>
  <rect class="b" x="${TRACK_X}" y="${cy - BAR_H / 2}" width="${w.toFixed(2)}" height="${BAR_H}" rx="3" fill="${color}" style="animation-delay:${delay}s"/>
  <text class="a m" x="${CW}" y="${cy + 4.5}" font-size="13" fill="${t.mute}" text-anchor="end" style="animation-delay:${(0.25 + i * 0.09 + 0.5).toFixed(2)}s">${pct}%</text>`;
    })
    .join("\n  ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Lenguajes más usados: ${top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}">
  <style>
    text{font-family:${SANS}} .m{font-family:${MONO}}
    @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    .a{opacity:0;animation:in .6s cubic-bezier(.2,.7,.2,1) both}
    .d{transform-origin:left center;transform-box:fill-box;animation:draw .9s cubic-bezier(.2,.7,.2,1) both}
    .b{transform-origin:left center;transform-box:fill-box;animation:draw 1.1s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion:reduce){.a,.d,.b{animation:none;opacity:1}}
  </style>
  <g transform="translate(${PAD_L} 0)">
    <rect class="d" x="0" y="0" width="28" height="3" rx="1.5" fill="${t.accent}"/>
    <text class="a m" x="0" y="29" font-size="13" font-weight="600" letter-spacing="1.2" fill="${t.mute}" style="animation-delay:.1s">LENGUAJES MÁS USADOS</text>
    ${rows}
    <rect class="d" x="0" y="${TOP + top.length * ROW_H}" width="${CW}" height="1" fill="${t.line}" style="animation-delay:${(top.length * 0.06).toFixed(2)}s"/>
  </g>
</svg>
`;
  writeFileSync(`assets/languages-${mode}.svg`, svg);
}
console.log(top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", "));
