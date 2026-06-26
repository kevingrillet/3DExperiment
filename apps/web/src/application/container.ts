// Composition root : câble les handlers de queries sur un QueryBus.
import { QueryBus } from './cqrs';
import { ListDesignsHandler } from './queries/listDesigns';
import { GetDesignHandler } from './queries/getDesign';
import { HttpDesignRepository, type DesignRepository } from '../infrastructure/designRepository';

export function createQueryBus(repo: DesignRepository): QueryBus {
  const bus = new QueryBus();
  bus.register('ListDesigns', new ListDesignsHandler(repo));
  bus.register('GetDesign', new GetDesignHandler(repo));
  return bus;
}

/** Bus par défaut, branché sur le catalogue statique servi sous BASE_URL. */
export function createDefaultQueryBus(): QueryBus {
  return createQueryBus(new HttpDesignRepository(import.meta.env.BASE_URL));
}
