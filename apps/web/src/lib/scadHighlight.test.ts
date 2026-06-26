import { describe, expect, it } from 'vitest';
import { tokenizeScad, tokenizeScadLines, type ScadTokenType } from './scadHighlight';

/** Raccourci : type du premier jeton dont la valeur (trim) vaut `value`. */
function typeOf(code: string, value: string): ScadTokenType | undefined {
  return tokenizeScad(code).find((tok) => tok.value === value)?.type;
}

describe('tokenizeScad', () => {
  it('classe les commentaires (ligne et bloc)', () => {
    expect(typeOf('// hi', '// hi')).toBe('comment');
    expect(typeOf('/* a\nb */', '/* a\nb */')).toBe('comment');
  });

  it('classe chaînes, nombres et variables spéciales', () => {
    expect(typeOf('"abc"', '"abc"')).toBe('string');
    expect(typeOf('x = 12.5;', '12.5')).toBe('number');
    expect(typeOf('$fn = 64;', '$fn')).toBe('special');
  });

  it('distingue mots-clés, primitives intégrées et fonctions utilisateur', () => {
    expect(typeOf('module foo() {}', 'module')).toBe('keyword');
    expect(typeOf('cube([1,2,3]);', 'cube')).toBe('builtin');
    // appel d'un identifiant non intégré, suivi de '(' → fonction
    expect(typeOf('maPiece();', 'maPiece')).toBe('function');
    // identifiant simple (variable) → plain
    expect(typeOf('largeur = 10;', 'largeur')).toBe('plain');
  });

  it('ne perd aucun caractère (concaténation = source)', () => {
    const code = 'module foo(x=1) {\n  cube([x, 2, 3]); // ok\n}\n';
    expect(
      tokenizeScad(code)
        .map((t) => t.value)
        .join(''),
    ).toBe(code);
  });

  it('découpe en lignes en conservant le compte', () => {
    const lines = tokenizeScadLines('a;\nb;\n\nc;');
    expect(lines).toHaveLength(4);
    expect(lines[2]).toEqual([]); // ligne vide préservée
  });
});
