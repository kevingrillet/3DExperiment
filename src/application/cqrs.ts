// =====================================================================
//  Noyau CQRS (côté lecture).
//
//  - Une Query est un objet sérialisable décrivant une intention de
//    LECTURE. Son paramètre de type porte le type du résultat attendu.
//  - Un QueryHandler exécute une query précise.
//  - Le QueryBus route une query vers son handler (résolution par `type`).
//
//  Le côté ÉCRITURE (commands) vit dans application/viewer/ : ce sont
//  des intentions de mutation de l'état UI, traitées par un reducer.
//  CQRS « partiel » assumé : pas de write-side serveur (app statique).
// =====================================================================

export interface Query<TResult> {
  readonly type: string;
  /** Marqueur de type fantôme — jamais lu à l'exécution. */
  readonly __result?: TResult;
}

export interface QueryHandler<TQuery extends Query<TResult>, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

type AnyQueryHandler = QueryHandler<Query<unknown>, unknown>;

export class QueryBus {
  private readonly handlers = new Map<string, AnyQueryHandler>();

  register<TResult, TQuery extends Query<TResult>>(
    type: string,
    handler: QueryHandler<TQuery, TResult>,
  ): void {
    this.handlers.set(type, handler as unknown as AnyQueryHandler);
  }

  ask<TResult>(query: Query<TResult>): Promise<TResult> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`Aucun handler enregistré pour la query « ${query.type} »`);
    }
    return handler.execute(query) as Promise<TResult>;
  }
}
