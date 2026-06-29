import { describe, expect, it } from 'vitest';
import { createQueryBus, createDefaultQueryBus } from './container';
import { QueryBus } from './cqrs';
import { listDesigns } from './queries/listDesigns';
import type { DesignRepository } from '../infrastructure/designRepository';
import type { RawCatalog } from '../domain/design';
import { sampleDesign } from '../test/fixtures';

const catalog: RawCatalog = { generatedAt: '', count: 1, designs: [sampleDesign] };
const repo: DesignRepository = { getCatalog: () => Promise.resolve(catalog) };

describe('container (composition root)', () => {
  it('câble les handlers de queries sur le bus', async () => {
    const bus = createQueryBus(repo);
    const result = await bus.ask(listDesigns('fr'));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(sampleDesign.id);
  });

  it('createDefaultQueryBus renvoie un QueryBus prêt à l’emploi', () => {
    expect(createDefaultQueryBus()).toBeInstanceOf(QueryBus);
  });
});
