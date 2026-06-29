import { describe, expect, it } from 'vitest';
import type { RawCatalog, RawDesign } from '../../domain/design';
import type { DesignRepository } from '../../infrastructure/designRepository';
import { QueryBus } from '../cqrs';
import { ListDesignsHandler, listDesigns } from './listDesigns';
import { GetDesignHandler, getDesign } from './getDesign';
import { sampleDesign } from '../../test/fixtures';

// Un Design (résolu, chaînes simples) est structurellement un RawDesign.
const catalog: RawCatalog = { generatedAt: '2026-01-01', count: 1, designs: [sampleDesign] };
const repo: DesignRepository = { getCatalog: () => Promise.resolve(catalog) };

function makeBus(repository: DesignRepository = repo): QueryBus {
  const bus = new QueryBus();
  bus.register('ListDesigns', new ListDesignsHandler(repository));
  bus.register('GetDesign', new GetDesignHandler(repository));
  return bus;
}

describe('queries (CQRS, côté lecture)', () => {
  it('ListDesigns renvoie le résumé de chaque pièce', async () => {
    const result = await makeBus().ask(listDesigns('fr'));
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: sampleDesign.id, title: sampleDesign.title });
    // un résumé ne porte pas les assets
    expect(result[0]).not.toHaveProperty('assets');
  });

  it('GetDesign renvoie la pièce complète', async () => {
    const result = await makeBus().ask(getDesign(sampleDesign.id, 'fr'));
    expect(result?.assets.stl).toBe(sampleDesign.assets.stl);
  });

  it('GetDesign renvoie null si inconnue', async () => {
    expect(await makeBus().ask(getDesign('inexistant', 'fr'))).toBeNull();
  });

  it('lève si aucun handler enregistré', () => {
    expect(() => new QueryBus().ask(listDesigns('fr'))).toThrow(/handler/i);
  });

  it('résout les textes localisés selon la langue de la query', async () => {
    const localized: RawDesign = {
      id: 'demo',
      title: { fr: 'Pièce démo', en: 'Demo part' },
      subtitle: { fr: 'Sous-titre', en: 'Subtitle' },
      description: { fr: 'Description FR', en: 'Description EN' },
      tags: [{ fr: 'réparation', en: 'repair' }, 'OpenSCAD'],
      dimensions: [{ label: { fr: 'Longueur', en: 'Length' }, value: '10 mm' }],
      printing: [],
      assets: { stl: 'a.stl', scad: 'a.scad', blueprint: null },
      photos: [{ url: 'p.jpg', caption: { fr: 'Vue', en: 'View' } }],
    };
    const bus = makeBus({
      getCatalog: () => Promise.resolve({ generatedAt: '', count: 1, designs: [localized] }),
    });

    const en = await bus.ask(getDesign('demo', 'en'));
    expect(en?.title).toBe('Demo part');
    expect(en?.tags).toEqual(['repair', 'OpenSCAD']);
    expect(en?.dimensions[0]).toEqual({ label: 'Length', value: '10 mm' });
    expect(en?.photos[0].caption).toBe('View');

    const fr = await bus.ask(getDesign('demo', 'fr'));
    expect(fr?.title).toBe('Pièce démo');
    expect(fr?.dimensions[0].label).toBe('Longueur');
  });
});
