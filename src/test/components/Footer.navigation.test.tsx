import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect } from 'vitest';
import Footer from '@/components/Footer';

it('links homepage sections from a route detail page', () => {
  render(<MemoryRouter initialEntries={['/routes/gantouw']}><Footer /></MemoryRouter>);
  expect(screen.getByRole('link', {name: 'The Guide'})).toHaveAttribute('href', '/#about');
  expect(screen.getByRole('link', {name: 'Training'})).toHaveAttribute('href', '/#fitness');
});
