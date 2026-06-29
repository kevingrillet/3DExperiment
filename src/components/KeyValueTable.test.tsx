import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyValueTable } from './KeyValueTable';

describe('KeyValueTable', () => {
  it('affiche le titre et chaque ligne', () => {
    render(
      <KeyValueTable
        title="Cotes"
        rows={[
          { label: 'Longueur', value: '101 mm' },
          { label: 'Largeur', value: '28 mm' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Cotes' })).toBeInTheDocument();
    expect(screen.getByText('Longueur')).toBeInTheDocument();
    expect(screen.getByText('101 mm')).toBeInTheDocument();
    expect(screen.getByText('Largeur')).toBeInTheDocument();
  });

  it('ne rend rien quand il n’y a aucune ligne', () => {
    const { container } = render(<KeyValueTable title="Cotes" rows={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
