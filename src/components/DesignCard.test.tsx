import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DesignCard } from './DesignCard';
import { sampleDesign } from '../test/fixtures';

describe('DesignCard', () => {
  it('affiche le titre et un lien vers la pièce', () => {
    render(
      <MemoryRouter>
        <DesignCard design={sampleDesign} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: sampleDesign.title })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/design/${sampleDesign.id}`);
  });

  it('affiche les tags', () => {
    render(
      <MemoryRouter>
        <DesignCard design={sampleDesign} />
      </MemoryRouter>,
    );
    for (const tag of sampleDesign.tags) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });
});
