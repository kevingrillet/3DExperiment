import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhotoGallery } from './PhotoGallery';

describe('PhotoGallery', () => {
  it('affiche un message quand il n’y a aucune photo', () => {
    render(<PhotoGallery photos={[]} />);
    expect(screen.getByText('Aucune photo de référence.')).toBeInTheDocument();
  });

  it('rend chaque photo avec son alt et sa légende', () => {
    render(
      <PhotoGallery
        photos={[
          { url: 'a.jpg', caption: 'Plan coté' },
          { url: 'b.jpg', caption: 'Vue de face' },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Plan coté' })).toHaveAttribute('src', 'a.jpg');
    expect(screen.getByText('Plan coté')).toBeInTheDocument();
    expect(screen.getByText('Vue de face')).toBeInTheDocument();
  });
});
