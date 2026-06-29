import type { Query, QueryHandler } from '../cqrs';
import { resolveDesign, type Design } from '../../domain/design';
import type { Lang } from '../../i18n/messages';
import type { DesignRepository } from '../../infrastructure/designRepository';

export interface GetDesignQuery extends Query<Design | null> {
  type: 'GetDesign';
  id: string;
  lang: Lang;
}

export const getDesign = (id: string, lang: Lang): GetDesignQuery => ({
  type: 'GetDesign',
  id,
  lang,
});

export class GetDesignHandler implements QueryHandler<GetDesignQuery, Design | null> {
  constructor(private readonly repo: DesignRepository) {}

  async execute(query: GetDesignQuery): Promise<Design | null> {
    const catalog = await this.repo.getCatalog();
    const raw = catalog.designs.find((d) => d.id === query.id);
    return raw ? resolveDesign(raw, query.lang) : null;
  }
}
