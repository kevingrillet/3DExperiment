import type { RawCatalog, RawDesign } from '../domain/design';
import type { DesignRepository } from '../infrastructure/designRepository';
import { QueryBus } from '../application/cqrs';
import { ListDesignsHandler } from '../application/queries/listDesigns';
import { GetDesignHandler } from '../application/queries/getDesign';
import { sampleDesign } from './fixtures';

/** Construit un QueryBus de test branché sur un catalogue en mémoire. */
export function makeTestBus(designs: RawDesign[] = [sampleDesign]): QueryBus {
  const catalog: RawCatalog = { generatedAt: '2026-01-01', count: designs.length, designs };
  const repo: DesignRepository = { getCatalog: () => Promise.resolve(catalog) };
  const bus = new QueryBus();
  bus.register('ListDesigns', new ListDesignsHandler(repo));
  bus.register('GetDesign', new GetDesignHandler(repo));
  return bus;
}
