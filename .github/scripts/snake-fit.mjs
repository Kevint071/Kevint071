// Ajusta el viewBox de los SVG de la serpiente para que la cuadrícula ocupe el mismo ancho visible
// que las tarjetas de estadísticas y racha (empiezan a 21px y terminan a 33px del borde, sobre 828px).
// Uso: node .github/scripts/snake-fit.mjs dist/a.svg dist/b.svg
import { readFileSync, writeFileSync } from "node:fs";

const BOX = 828, LEFT = 21, RIGHT = 33;
const ROOT = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)" width="[\d.]+" height="[\d.]+"/;

for (const file of process.argv.slice(2)) {
  const svg = readFileSync(file, "utf8");
  const m = svg.match(ROOT);
  if (!m) throw new Error(`${file}: no encuentro el viewBox de la raíz`);
  const [, , y, w, h] = m;
  const grid = Number(w) - 36; // ancho visible de la cuadrícula (snk deja 16px a la izquierda y 20px a la derecha)
  const total = (grid * BOX) / (BOX - LEFT - RIGHT);
  const left = (total * LEFT) / BOX;
  const fmt = (n) => Number(n.toFixed(2));
  writeFileSync(file, svg.replace(ROOT, `viewBox="${fmt(-left)} ${y} ${fmt(total)} ${h}" width="${fmt(total)}" height="${h}"`));
  console.log(`${file}: viewBox ${fmt(-left)} ${y} ${fmt(total)} ${h}`);
}
