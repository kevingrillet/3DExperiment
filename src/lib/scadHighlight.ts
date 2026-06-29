/**
 * Coloration syntaxique OpenSCAD — tokeniseur maison, sans dépendance.
 *
 * `tokenizeScad` découpe le code en jetons typés ; le rendu (couleurs + numéros de
 * ligne) est fait par le composant `SourceViewer`. Volontairement simple : OpenSCAD
 * a une syntaxe proche du C, suffisante à couvrir avec quelques règles.
 */
export type ScadTokenType =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'builtin'
  | 'special'
  | 'function'
  | 'punct'
  | 'plain';

export interface ScadToken {
  type: ScadTokenType;
  value: string;
}

/** Mots-clés du langage. */
const KEYWORDS = new Set([
  'module',
  'function',
  'if',
  'else',
  'for',
  'let',
  'each',
  'use',
  'include',
  'true',
  'false',
  'undef',
  'return',
]);

/** Opérations, primitives et fonctions intégrées les plus courantes. */
const BUILTINS = new Set([
  'union',
  'difference',
  'intersection',
  'hull',
  'minkowski',
  'render',
  'children',
  'translate',
  'rotate',
  'scale',
  'resize',
  'mirror',
  'multmatrix',
  'color',
  'offset',
  'linear_extrude',
  'rotate_extrude',
  'projection',
  'surface',
  'import',
  'cube',
  'sphere',
  'cylinder',
  'polyhedron',
  'square',
  'circle',
  'polygon',
  'text',
  'echo',
  'assert',
  'concat',
  'len',
  'str',
  'chr',
  'ord',
  'search',
  'lookup',
  'abs',
  'sign',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'floor',
  'round',
  'ceil',
  'ln',
  'log',
  'pow',
  'sqrt',
  'exp',
  'min',
  'max',
  'norm',
  'cross',
  'rands',
]);

// 1: commentaire · 2: chaîne · 3: variable spéciale ($fn…) · 4: nombre ·
// 5: identifiant · 6: ponctuation. Les espaces/sauts de ligne tombent dans les
// « trous » entre jetons et sont émis tels quels (type `plain`).
const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|(\$[A-Za-z_]\w*)|(\b\d+\.?\d*(?:[eE][+-]?\d+)?\b|\.\d+)|([A-Za-z_]\w*)|([{}()[\];,=+\-*/%<>!&|.:?#@])/g;

export function tokenizeScad(code: string): ScadToken[] {
  const tokens: ScadToken[] = [];
  let pos = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code))) {
    if (m.index > pos) tokens.push({ type: 'plain', value: code.slice(pos, m.index) });
    const [full, comment, string, special, number, ident, punct] = m;
    if (comment !== undefined) tokens.push({ type: 'comment', value: full });
    else if (string !== undefined) tokens.push({ type: 'string', value: full });
    else if (special !== undefined) tokens.push({ type: 'special', value: full });
    else if (number !== undefined) tokens.push({ type: 'number', value: full });
    else if (ident !== undefined) {
      let type: ScadTokenType;
      if (KEYWORDS.has(ident)) type = 'keyword';
      else if (BUILTINS.has(ident)) type = 'builtin';
      else {
        // Fonction/module si l'identifiant est suivi d'une parenthèse ouvrante.
        let j = TOKEN_RE.lastIndex;
        while (j < code.length && /\s/.test(code[j])) j++;
        type = code[j] === '(' ? 'function' : 'plain';
      }
      tokens.push({ type, value: full });
    } else if (punct !== undefined) tokens.push({ type: 'punct', value: full });
    pos = TOKEN_RE.lastIndex;
  }
  if (pos < code.length) tokens.push({ type: 'plain', value: code.slice(pos) });
  return tokens;
}

/**
 * Réorganise les jetons en lignes (pour l'affichage avec numéros de ligne) : un
 * jeton à cheval sur plusieurs lignes (commentaire de bloc, espaces) est scindé.
 */
export function tokenizeScadLines(code: string): ScadToken[][] {
  const lines: ScadToken[][] = [[]];
  for (const token of tokenizeScad(code)) {
    const parts = token.value.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part !== '') lines[lines.length - 1].push({ type: token.type, value: part });
    });
  }
  return lines;
}
