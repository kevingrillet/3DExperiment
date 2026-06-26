// =====================================================================
//  Generateur du blueprint (SVG) — Pied baby-foot Monneret
//  Usage : node scripts/gen_blueprint.mjs [output/blueprint.svg]
//  (parametres synchronises a la main avec pied_babyfoot_monneret.scad)
// =====================================================================
import fs from 'fs';
import path from 'path';

// ---- parametres (synchro .scad) ----
const L = 101,
  W = 28,
  Hthin = 6,
  Hthick = 35,
  hole_d = 5;
const border = 2,
  recess_depth = 5,
  cong = 2,
  fillet_int = 2;
const cb_d = 10,
  cb_cham = 1.5,
  o5_depth = 10;
const a = Math.atan((Hthick - Hthin) / L),
  sa = Math.sin(a),
  ca = Math.cos(a);
const ztop = (x) => Hthin + (x / L) * (Hthick - Hthin);
const z_center = (Hthin + Hthick) / 2,
  axis_len = z_center / ca;

const s = 3.2; // px / mm
const R = cong * s; // rayon d'arrondi exterieur (R2) en px
let svg = '';
const P = (...x) => {
  svg += x.join(' ') + '\n';
};
const line = (x1, y1, x2, y2, st = '#111', w = 1.6, dash = '') =>
  P(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${st}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`,
  );
const pline = (pts, st = '#111', w = 1.6, dash = '') =>
  P(
    `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${st}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`,
  );
const circ = (cx, cy, r, st = '#111', w = 1.6, fill = 'none') =>
  P(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${st}" stroke-width="${w}"/>`);
const rrectSVG = (x, y, w, h, r, st = '#111', sw = 1.8) =>
  P(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="${st}" stroke-width="${sw}"/>`,
  );
const rawtxt = (x, y, t, sz, col, anc) =>
  P(
    `<text x="${x}" y="${y}" font-family="Segoe UI,Arial" font-size="${sz}" fill="${col}" text-anchor="${anc}">${t}</text>`,
  );
function txt(x, y, t, sz = 14, col = '#111', anc = 'middle') {
  const w = t.length * sz * 0.57 + 10,
    h = sz + 6;
  let bx = anc === 'middle' ? x - w / 2 : anc === 'start' ? x - 5 : x - w + 5;
  P(
    `<rect x="${bx}" y="${y - sz + 1}" width="${w}" height="${h}" fill="#ffffff" opacity="0.95" rx="3"/>`,
  );
  rawtxt(x, y, t, sz, col, anc);
}
const title = (x, y, t) => txt(x, y, t, 17, '#1330a0', 'start');
const DIM = '#c00';
function dim(x1, y1, x2, y2, label) {
  line(x1, y1, x2, y2, DIM, 1.4);
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.hypot(dx, dy) || 1,
    nx = (-dy / len) * 5,
    ny = (dx / len) * 5;
  line(x1 + nx, y1 + ny, x1 - nx, y1 - ny, DIM, 1.4);
  line(x2 + nx, y2 + ny, x2 - nx, y2 - ny, DIM, 1.4);
  txt((x1 + x2) / 2, (y1 + y2) / 2 + 4, label, 13, DIM, 'middle');
}
const leader = (x1, y1, x2, y2, col = '#555') => line(x1, y1, x2, y2, col, 1, '');
// polygone a coins arrondis (rayon r en px) -> path SVG (coins en quart-de-rond)
function roundedPoly(pts, r, st = '#111', sw = 1.8, fill = 'none') {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n],
      p1 = pts[i],
      p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]],
      v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1) || 1,
      l2 = Math.hypot(...v2) || 1;
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const A = [p1[0] + (v1[0] / l1) * rr, p1[1] + (v1[1] / l1) * rr];
    const B = [p1[0] + (v2[0] / l2) * rr, p1[1] + (v2[1] / l2) * rr];
    d +=
      (i === 0 ? `M ${A[0]} ${A[1]} ` : `L ${A[0]} ${A[1]} `) +
      `Q ${p1[0]} ${p1[1]} ${B[0]} ${B[1]} `;
  }
  d += 'Z';
  P(`<path d="${d}" fill="${fill}" stroke="${st}" stroke-width="${sw}"/>`);
}

// ====== VUE DE COTE ======
{
  const ox = 90,
    oyB = 215;
  const X = (x) => ox + x * s,
    Z = (z) => oyB - z * s;
  title(ox, 52, 'VUE DE CÔTÉ');
  roundedPoly(
    [
      [X(0), Z(0)],
      [X(L), Z(0)],
      [X(L), Z(Hthick)],
      [X(0), Z(Hthin)],
    ],
    R,
  );
  const x1 = border,
    x2 = L - border,
    floorZ = (X2) => ztop(X2) - recess_depth / ca;
  pline(
    [
      [X(x1), Z(ztop(x1))],
      [X(x1), Z(floorZ(x1))],
      [X(x2), Z(floorZ(x2))],
      [X(x2), Z(ztop(x2))],
    ],
    DIM,
    1.3,
    '6,3',
  );
  const cx = L / 2,
    cz = ztop(L / 2);
  line(X(cx), Z(cz), X(cx + (cz / ca) * sa), Z(0), '#0a0', 1.6, '5,3');
  dim(X(0) - 20, Z(0), X(0) - 20, Z(Hthin), '6');
  dim(X(L) + 20, Z(0), X(L) + 20, Z(Hthick), '35');
  dim(X(0), Z(0) + 30, X(L), Z(0) + 30, '101');
  leader(X(L * 0.3), Z(ztop(L * 0.3) - recess_depth * ca), X(L * 0.18), Z(Hthick) + 6);
  txt(X(L * 0.18), Z(Hthick) + 8, 'creux 5 mm ⊥ toit', 12, DIM);
}

// ====== VUE DE FACE ======
{
  const ox = 470,
    oyB = 215;
  const Y = (y) => ox + y * s,
    Z = (z) => oyB - z * s;
  title(ox, 52, 'VUE DE FACE');
  roundedPoly(
    [
      [Y(0), Z(0)],
      [Y(W), Z(0)],
      [Y(W), Z(Hthick)],
      [Y(W - border), Z(Hthick)],
      [Y(W - border), Z(Hthick - recess_depth)],
      [Y(border), Z(Hthick - recess_depth)],
      [Y(border), Z(Hthick)],
      [Y(0), Z(Hthick)],
    ],
    R,
  );
  dim(Y(0), Z(0) + 30, Y(W), Z(0) + 30, '28');
  dim(Y(W) + 22, Z(0), Y(W) + 22, Z(Hthick), '35');
  dim(Y(border), Z(Hthick - recess_depth) - 16, Y(W - border), Z(Hthick - recess_depth) - 16, '24');
  dim(Y(0) - 18, Z(Hthick - recess_depth), Y(0) - 18, Z(Hthick), '5');
}

// ====== DETAIL PERCAGE (axe vertical) ======
{
  const ox = 760,
    oyTop = 95,
    sd = 5;
  const U = (u) => ox + u * sd,
    V = (v) => oyTop + v * sd;
  title(720, 52, "DÉTAIL — perçage (le long de l'axe)");
  P(
    `<rect x="${U(-10)}" y="${V(0)}" width="${20 * sd}" height="${axis_len * sd}" fill="url(#hatch)" stroke="#111" stroke-width="1.5"/>`,
  );
  // Ø5 sur 10 mm (haut) -> epaulement leger -> Ø10 jusqu'au bout
  const h5 = hole_d / 2,
    hcb = cb_d / 2;
  const v1 = o5_depth,
    v2 = o5_depth + cb_cham,
    vb = axis_len;
  const hole = [
    [h5, 0],
    [h5, v1],
    [hcb, v2],
    [hcb, vb],
    [-hcb, vb],
    [-hcb, v2],
    [-h5, v1],
    [-h5, 0],
  ];
  P(
    `<polygon points="${hole.map((p) => [U(p[0]), V(p[1])].join(',')).join(' ')}" fill="#fff" stroke="#111" stroke-width="1.6"/>`,
  );
  rawtxt(U(0), V(0) - 8, 'TOIT (bois)', 11, '#0a0', 'middle');
  rawtxt(U(0), V(vb) + 16, 'DESSOUS (vis)', 11, '#0a0', 'middle');
  dim(U(-h5), V(v1 * 0.5), U(h5), V(v1 * 0.5), 'Ø5');
  dim(U(-hcb), V((v2 + vb) / 2), U(hcb), V((v2 + vb) / 2), 'Ø10');
  dim(U(11), V(0), U(11), V(v1), '10');
  leader(U(hcb), V((v1 + v2) / 2), U(13), V((v1 + v2) / 2));
  txt(U(13), V((v1 + v2) / 2), 'épaulement léger', 11, '#0a0', 'start');
}

// ====== VUE DE DESSUS ======
{
  const ox = 90,
    oy = 375;
  const X = (x) => ox + x * s,
    Y = (y) => oy + y * s;
  title(ox, 348, 'VUE DE DESSUS');
  rrectSVG(X(0), Y(0), L * s, W * s, cong * s, '#111', 1.8); // contour ext. arrondi R2
  rrectSVG(
    X(border),
    Y(border),
    (L - 2 * border) * s,
    (W - 2 * border) * s,
    fillet_int * s,
    DIM,
    1.6,
  ); // creux a coins arrondis
  circ(X(L / 2), Y(W / 2), (hole_d / 2) * s, '#111', 1.6);
  dim(X(0), Y(W) + 30, X(L), Y(W) + 30, '101');
  dim(X(0) - 20, Y(0), X(0) - 20, Y(W), '28');
  dim(X(border), Y(border) - 14, X(L - border), Y(border) - 14, 'creux ≈ 97');
  dim(X(L) + 20, Y(border), X(L) + 20, Y(W - border), '24');
  txt(X(L / 2), Y(W) + 12, 'bordure 2 mm tout autour', 12, DIM);
  leader(X(L / 2), Y(W / 2) - (hole_d / 2) * s, X(L / 2), Y(border) + 16);
  txt(X(L / 2), Y(border) + 14, 'Ø5', 12, '#111');
}

// ====== COUPE A-A ======
{
  const ox = 90,
    oyB = 745;
  const X = (x) => ox + x * s,
    Z = (z) => oyB - z * s;
  title(ox, 560, 'COUPE A-A (longitudinale)');
  const x1 = border,
    x2 = L - border,
    cx = L / 2;
  const floorZ = (X2) => ztop(X2) - recess_depth / ca; // fond parallele au toit, parois VERTICALES
  const body = [
    [X(0), Z(0)],
    [X(L), Z(0)],
    [X(L), Z(Hthick)],
    [X(x2), Z(ztop(x2))],
    [X(x2), Z(floorZ(x2))],
    [X(x1), Z(floorZ(x1))],
    [X(x1), Z(ztop(x1))],
    [X(0), Z(Hthin)],
  ];
  roundedPoly(body, R, '#111', 1.8, 'url(#hatch)'); // aretes exterieures + creux arrondis
  // perçage etage : Ø5 (du fond du creux, 10 mm) -> epaulement leger -> Ø10 jusqu'au dessous
  const cz = ztop(cx),
    ctr = (t) => [cx + t * sa, cz - t * ca],
    perp = [ca, sa];
  const off = (p, r, sg) => [p[0] + sg * r * perp[0], p[1] + sg * r * perp[1]];
  const cT = ctr(recess_depth),
    c5 = ctr(o5_depth),
    cc = ctr(o5_depth + cb_cham);
  const wz = (r, sg, zv) => {
    const t = (cz - zv + sg * r * sa) / ca;
    return [cx + t * sa + sg * r * ca, zv];
  };
  const Rm = wz(5, 1, 0),
    Lm = wz(5, -1, 0); // Ø10 calee au dessous (z=0)
  const bore = [
    off(cT, 2.5, 1),
    off(c5, 2.5, 1),
    off(cc, 5, 1),
    Rm,
    Lm,
    off(cc, 5, -1),
    off(c5, 2.5, -1),
    off(cT, 2.5, -1),
  ];
  P(
    `<polygon points="${bore.map((p) => [X(p[0]), Z(p[1])].join(',')).join(' ')}" fill="#fff" stroke="#111" stroke-width="1.6"/>`,
  );
  dim(X(x2) + 24, Z(ztop(x2)), X(x2) + 24, Z(floorZ(x2)), '5 ⊥');
  leader(X(c5[0]), Z(c5[1]), X(cx), Z(Hthick) - 28);
  txt(X(cx), Z(Hthick) - 30, 'Ø5 sur 10 mm + épaulement léger', 12, '#0a0');
  leader((X(Rm[0]) + X(Lm[0])) / 2, Z(0), X(cx) + 150, Z(0) + 22);
  txt(X(cx) + 152, Z(0) + 22, 'Ø10 jusqu au dessous', 12, '#0a0', 'start');
}

// ====== NOTES ======
{
  const x = 470,
    y = 370,
    w = 860,
    h = 160;
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f7f2" stroke="#888"/>`);
  title(x + 16, y + 28, 'RÉSUMÉ (synchro avec le .scad)');
  const lines = [
    '• Corps PLEIN — coin 101 × 28, h 6 → 35 mm, dessous plat, arêtes ext. R2',
    '• Creux : prof. 5 mm ⊥ toit, PAROIS VERTICALES, bordure 2 mm tout autour (≈ 97 × 24)',
    '• Lèvre du creux et coins légèrement arrondis',
    '• Perçage : Ø5 sur 10 mm (vers le bois) → épaulement léger → Ø10 jusqu au dessous (vis)',
  ];
  lines.forEach((t, i) => rawtxt(x + 18, y + 58 + i * 26, t, 14, '#222', 'start'));
}

const out = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1340" height="800" viewBox="0 0 1340 800">
<defs>
<pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
<line x1="0" y1="0" x2="0" y2="6" stroke="#c4c4c4" stroke-width="1"/>
</pattern>
</defs>
<rect x="0" y="0" width="1340" height="800" fill="#ffffff"/>
<text x="22" y="30" font-family="Segoe UI,Arial" font-size="20" font-weight="bold" fill="#1330a0">PIED BABY-FOOT MONNERET — blueprint (mm)</text>
${svg}
</svg>`;

const dst = process.argv[2] || 'output/blueprint.svg';
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, out);
console.log('Ecrit: ' + dst);
