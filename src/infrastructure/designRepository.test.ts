import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpDesignRepository } from './designRepository';
import type { RawCatalog } from '../domain/design';
import { sampleDesign } from '../test/fixtures';

const rawCatalog: RawCatalog = {
  generatedAt: '2026-01-01',
  count: 1,
  designs: [sampleDesign],
};

function mockFetch(impl: () => Promise<Partial<Response>>) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn as unknown as typeof fetch);
  return fn;
}

describe('HttpDesignRepository', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('récupère le catalogue et préfixe les URLs d’assets par la base', async () => {
    mockFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(structuredClone(rawCatalog)) }),
    );
    const repo = new HttpDesignRepository('/base/');
    const catalog = await repo.getCatalog();

    expect(catalog.designs[0].assets.stl).toBe(`/base/${sampleDesign.assets.stl}`);
    expect(catalog.designs[0].assets.scad).toBe(`/base/${sampleDesign.assets.scad}`);
    expect(catalog.designs[0].assets.blueprint).toBe(`/base/${sampleDesign.assets.blueprint}`);
    expect(catalog.designs[0].photos[0].url).toBe(`/base/${sampleDesign.photos[0].url}`);
  });

  it('laisse blueprint à null quand la pièce n’en a pas', async () => {
    const sansBlueprint = structuredClone(rawCatalog);
    sansBlueprint.designs[0].assets.blueprint = null;
    mockFetch(() => Promise.resolve({ ok: true, json: () => Promise.resolve(sansBlueprint) }));
    const repo = new HttpDesignRepository('/');
    const catalog = await repo.getCatalog();
    expect(catalog.designs[0].assets.blueprint).toBeNull();
  });

  it('met le catalogue en cache (un seul fetch)', async () => {
    const fn = mockFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(structuredClone(rawCatalog)) }),
    );
    const repo = new HttpDesignRepository('/');
    await repo.getCatalog();
    await repo.getCatalog();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('lève une erreur explicite si le catalogue est introuvable', async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 404 }));
    const repo = new HttpDesignRepository('/');
    await expect(repo.getCatalog()).rejects.toThrow(/introuvable.*404/i);
  });
});
