import type { RawCatalog } from '../domain/design';

/** Accès en lecture au catalogue des pièces 3D (textes localisés bruts). */
export interface DesignRepository {
  getCatalog(): Promise<RawCatalog>;
}

/**
 * Implémentation HTTP : récupère le catalog.json statique généré par
 * @3dexperiment/generator. Les URLs d'assets (relatives) sont préfixées par la
 * base de déploiement pour fonctionner sous GitHub Pages. Les textes restent
 * localisés (objets par langue) : la résolution en une langue est faite plus haut,
 * côté queries, pour réagir au changement de langue sans re-télécharger.
 */
export class HttpDesignRepository implements DesignRepository {
  private cache: Promise<RawCatalog> | null = null;

  constructor(private readonly baseUrl: string) {}

  getCatalog(): Promise<RawCatalog> {
    this.cache ??= this.fetchCatalog();
    return this.cache;
  }

  private async fetchCatalog(): Promise<RawCatalog> {
    const response = await fetch(`${this.baseUrl}catalog.json`);
    if (!response.ok) {
      throw new Error(`Catalogue introuvable (HTTP ${response.status}).`);
    }
    const raw = (await response.json()) as RawCatalog;
    return this.resolveUrls(raw);
  }

  private resolveUrls(catalog: RawCatalog): RawCatalog {
    const abs = (u: string) => `${this.baseUrl}${u}`;
    return {
      ...catalog,
      designs: catalog.designs.map((d) => ({
        ...d,
        assets: {
          stl: abs(d.assets.stl),
          scad: abs(d.assets.scad),
          blueprint: d.assets.blueprint ? abs(d.assets.blueprint) : null,
        },
        photos: d.photos.map((p) => ({ ...p, url: abs(p.url) })),
      })),
    };
  }
}
