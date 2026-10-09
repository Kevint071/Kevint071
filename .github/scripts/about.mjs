// Genera assets/about-{dark,light}.svg: la sección "Sobre mí" con tipografía a la altura del resto de la página.
// Uso: node .github/scripts/about.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const THEMES = {
  dark: { text: "#e6edf3", mute: "#8b949e" },
  light: { text: "#1f2328", mute: "#59636e" },
};
const SANS = `-apple-system, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif`;
const EASE = "cubic-bezier(.2,.7,.2,1)";
const W = 820, H = 204, FS = 18, LH = 28;

// Un solo tamaño de texto; el primer párrafo va en el color principal y el resto en el atenuado.
const BODY = [
  { y: 20, strong: true, lines: ["Desarrollador Full Stack. Construyo aplicaciones web y APIs con arquitectura limpia."] },
  { y: 62, lines: ["Mis proyectos nacen de problemas reales: cuando una tarea se repite a mano, la", "convierto en una herramienta. Así hice un editor en lote de tareas de Azure DevOps."] },
  { y: 132, lines: ["Ahora exploro cómo trabajar con IA como un agente casi autónomo: partir de una", "especificación (OpenSpec), darle un proceso con planes y pruebas (Superpowers)", "y quedarme yo con el criterio y la revisión: el agente ejecuta, yo decido."] },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const plain = BODY.flatMap((b) => b.lines).join(" ");

mkdirSync("assets", { recursive: true });
for (const [mode, t] of Object.entries(THEMES)) {
  let n = 0;
  const body = BODY.flatMap(({ y, lines, strong }) =>
    lines.map((line, i) => `<text class="a" x="0" y="${y + i * LH}" font-size="${FS}" fill="${strong ? t.text : t.mute}" style="animation-delay:${(0.1 + n++ * 0.1).toFixed(2)}s">${esc(line)}</text>`)
  ).join("\n  ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(plain)}">
  <style>
    text{font-family:${SANS}}
    @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .a{opacity:0;animation:in .6s ${EASE} both}
    @media (prefers-reduced-motion:reduce){.a{animation:none;opacity:1}}
  </style>
  ${body}
</svg>
`;
  writeFileSync(`assets/about-${mode}.svg`, svg);
}
console.log("Generados assets/about-{dark,light}.svg");
