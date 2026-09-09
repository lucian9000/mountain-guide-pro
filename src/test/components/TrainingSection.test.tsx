import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, it, expect } from 'vitest';
import TrainingSection from '@/components/experience/TrainingSection';

vi.mock('@/lib/queries/content', () => ({
  useTourPrices: () => ({ data: {} }),
  useTourPriceRows: () => ({ data: [
    {id: 'legacy-strength', name: 'Strength Training', tour_slug: null, price: 350},
    {id: 'custom', name: 'Custom Programs', tour_slug: null, price: 600},
  ] }),
}));

it('preserves legacy training booking by name and custom programme enquiries', () => {
  render(<MemoryRouter><TrainingSection /></MemoryRouter>);
  expect(screen.getByRole('link', {name: /Strength Training/})).toHaveAttribute('href', '/booking?tour=legacy-strength');
  expect(screen.getByRole('link', {name: /Custom Programs/})).toHaveAttribute('href', expect.stringContaining('https://wa.me/'));
});
