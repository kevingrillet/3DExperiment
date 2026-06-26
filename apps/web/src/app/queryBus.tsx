import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { QueryBus } from '../application/cqrs';
import type { Query } from '../application/cqrs';
import { createDefaultQueryBus } from '../application/container';

const QueryBusContext = createContext<QueryBus | null>(null);

/** Fournit le QueryBus. `bus` injectable (tests, Storybook). */
export function QueryBusProvider({ bus, children }: { bus?: QueryBus; children: ReactNode }) {
  // useState à init paresseuse : valeur stable sur la durée de vie du provider et
  // lisible au render (contrairement à un ref, interdit au render par react-hooks).
  const [resolvedBus] = useState(() => bus ?? createDefaultQueryBus());
  return <QueryBusContext.Provider value={resolvedBus}>{children}</QueryBusContext.Provider>;
}

export function useQueryBus(): QueryBus {
  const bus = useContext(QueryBusContext);
  if (!bus) {
    throw new Error('useQueryBus doit être utilisé dans un <QueryBusProvider>.');
  }
  return bus;
}

export interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

/**
 * Exécute une query via le bus et expose son état (loading/data/error).
 * `deps` contrôle le re-déclenchement (comme useEffect).
 */
export function useQuery<R>(makeQuery: () => Query<R>, deps: unknown[]): AsyncState<R> {
  const bus = useQueryBus();
  const [state, setState] = useState<AsyncState<R>>({ loading: true });

  useEffect(() => {
    let active = true;
    // Repasse en « chargement » à chaque refetch (changement de `deps`). Ce setState
    // synchrone est volontaire ici (réinitialisation de l'état d'une query).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ loading: true });
    bus
      .ask(makeQuery())
      .then((data) => {
        if (active) setState({ loading: false, data });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      active = false;
    };
    // makeQuery est recréé à chaque rendu ; on pilote via `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
