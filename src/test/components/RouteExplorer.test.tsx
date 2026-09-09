import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import RouteExplorer from '@/components/experience/RouteExplorer';

vi.mock('@/lib/queries/content', () => ({
  usePublishedRoutes: () => ({ data: [
    { id: 'new-route', slug: 'ernests-new-trail', name: "Ernest’s new trail", description: 'A newly published trail.', difficulty: 'easy', duration_hours: 2, distance_km: 4, elevation_m: 250, price_cents: 90000, images: [] },
    { id: 'steep-route', slug: 'steep-trail', name: 'Steep trail', description: 'Scrambling route.', difficulty: 'extreme', duration_hours: 6, distance_km: 8, elevation_m: 1000, price_cents: 150000, images: [] },
  ], isLoading: false, error: null, refetch: vi.fn() }),
  useTourPrices: () => ({ data: { 'ernests-new-trail': { id: 'price-new', price: 950, price_group: null } } }),
  useTourPriceRows: () => ({ data: [{ id: 'legacy-price', tour_slug: null, name: 'STEEP TRAIL', price: 1800, price_group: null }] }),
}));

describe('Managed route explorer', () => {
  it('uses the bookable legacy name-matched price rather than stale route pricing', () => {
    render(<MemoryRouter><RouteExplorer /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Steep trail/i })).toHaveTextContent(/R1\s?800/);
  });
  it('discovers a newly added route and links to its own page', () => {
    render(<MemoryRouter><RouteExplorer /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Ernest’s new trail/i })).toHaveAttribute('href', '/routes/ernests-new-trail');
    expect(screen.getByText(/R950/)).toBeInTheDocument();
  });
  it('filters by difficulty and can clear a search with no results', () => {
    render(<MemoryRouter><RouteExplorer /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
    expect(screen.queryByRole('link', { name: /Steep trail/i })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nothing matches' } });
    expect(screen.getByText('No trails match your search.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('link', { name: /Steep trail/i })).toBeInTheDocument();
  });
});
