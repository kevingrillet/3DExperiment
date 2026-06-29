import type { Query, QueryHandler } from '../cqrs';
import { resolveDesignSummary, type DesignSummary } from '../../domain/design';
import type { Lang } from '../../i18n/messages';
import type { DesignRepository } from '../../infrastructure/designRepository';

export interface ListDesignsQuery extends Query<DesignSummary[]> {
  type: 'ListDesigns';
  lang: Lang;
}

export const listDesigns = (lang: Lang): ListDesignsQuery => ({ type: 'ListDesigns', lang });

export class ListDesignsHandler implements QueryHandler<ListDesignsQuery, DesignSummary[]> {
  constructor(private readonly repo: DesignRepository) {}

  async execute(query: ListDesignsQuery): Promise<DesignSummary[]> {
    const catalog = await this.repo.getCatalog();
    return catalog.designs.map((d) => resolveDesignSummary(d, query.lang));
  }
}
