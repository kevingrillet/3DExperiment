#!/usr/bin/env node
// =====================================================================
//  Générateur STL — compile un fichier .scad en STL avec OpenSCAD (WASM).
//  Aucune installation système requise (OpenSCAD tourne en WebAssembly).
//
//  API     : await scadToStl(scadPath, outPath)
//  CLI     : node src/stl.mjs <source.scad> <sortie.stl>
// =====================================================================
import { createOpenSCAD } from 'openscad-wasm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Compile un fichier OpenSCAD en STL binaire.
 * @param {string} scadPath chemin du .scad
 * @param {string} outPath  chemin du .stl à écrire
 * @returns {Promise<number>} taille du fichier écrit (octets)
 */
export async function scadToStl(scadPath, outPath) {
  const code = fs.readFileSync(scadPath, 'utf8');
  const oscad = await createOpenSCAD({ printErr: (e) => process.stderr.write(e + '\n') });
  const stl = await oscad.renderToStl(code);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(stl, 'binary'));
  return fs.statSync(outPath).size;
}

// --- CLI ---
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const scadPath = process.argv[2];
  const outPath = process.argv[3];
  if (!scadPath || !outPath) {
    console.error('Usage : node src/stl.mjs <source.scad> <sortie.stl>');
    process.exit(1);
  }
  console.log(`Compilation de ${scadPath} (OpenSCAD WASM)…`);
  const size = await scadToStl(scadPath, outPath);
  console.log(`Écrit : ${outPath} (${size} octets)`);
}
