import { act, cleanup, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import PageMetadata from '@/components/PageMetadata';
import type { RouteWithImages } from '@/lib/types/content';
import type { EventWithSpots } from '@/lib/types/db';

const queries = vi.hoisted(() => ({ route: vi.fn(), event: vi.fn() }));

// Keep React Query's real loading/error transitions and retained stale data;
// only substitute the query functions that would read backend content.
vi.mock('@/lib/queries/content', () => ({
  usePublishedRoute: (slug?: string) => useQuery({
    queryKey: ['public', 'route', slug],
    enabled: Boolean(slug),
    queryFn: () => queries.route(slug),
  }),
}));
vi.mock('@/lib/queries/events', () => ({
  usePublicEvent: (id: string | null) => useQuery({
    queryKey: ['public', 'event', id],
    enabled: Boolean(id),
    queryFn: () => queries.event(id),
  }),
}));
vi.mock('@/lib/images', () => ({
  publicImageUrl: (path: string) => `https://images.example.com/${path}`,
}));

const ORIGIN = 'https://summitfitadventures.com';
const LOGO = `${ORIGIN}/logo.jpeg`;
const route: Pick<RouteWithImages, 'name' | 'description' | 'images'> = {
  name: 'New Trail',
  description: 'Explore a beautiful new Cape trail.',
  images: [],
};
const event: Pick<EventWithSpots, 'title' | 'description' | 'image_url'> = {
  title: 'Sunset Summit',
  description: 'Join an upcoming sunset hike.',
  image_url: 'https://images.example.com/event.webp',
};
const dynamicPages = [
  { kind: 'route', path: '/routes/new-trail', id: 'new-trail', name: route.name, data: route, query: queries.route },
  { kind: 'event', path: '/events/future-event', id: 'future-event', name: event.title, data: event, query: queries.event },
] as const;
const clients: QueryClient[] = [];

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

function renderMetadata(path: string, client = newClient()) {
  clients.push(client);
  let navigate!: NavigateFunction;
  function NavigationHarness() {
    navigate = useNavigate();
    return <PageMetadata />;
  }
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NavigationHarness />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { client, router: { navigate } };
}

function expectImage(image: string) {
  expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', image);
  expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute('content', image);
}

function expectUnavailable(name?: string) {
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expectImage(LOGO);
  if (name) {
    expect(document.title).not.toContain(name);
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).not.toContain(name);
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).not.toContain(name);
  }
}

beforeEach(() => {
  queries.route.mockReset().mockImplementation(async (slug: string) => slug === 'new-trail' ? route : null);
  queries.event.mockReset().mockImplementation(async (id: string) => id === 'future-event' ? event : null);
  document.head.querySelectorAll('meta, link[rel="canonical"]').forEach(tag => tag.remove());
  document.title = '';
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach(client => client.clear());
  vi.restoreAllMocks();
});

describe('public page metadata', () => {
  it('uses event metadata then removes it on private navigation without remounting', async () => {
    const { router } = renderMetadata('/events/future-event');
    await waitFor(() => expect(document.title).toBe('Sunset Summit | SummitFit Adventures'));
    expectImage(event.image_url!);
    await act(() => router.navigate('/login?redirect=/booking'));
    expect(document.title).toBe('Sign In | SummitFit Adventures');
    expectUnavailable(event.title);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `${ORIGIN}/login`);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).not.toBe(event.description);
  });

  it('gives news a distinct title and canonical without tracking parameters', () => {
    renderMetadata('/news?utm_source=test#announcements');
    expect(document.title).toBe("What's New | SummitFit Adventures");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `${ORIGIN}/news`);
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', document.title);
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  });

  it('uses route facts and resets them on navigation without remounting', async () => {
    const { router } = renderMetadata('/routes/new-trail');
    await waitFor(() => expect(document.title).toBe('New Trail | SummitFit Adventures'));
    expectImage(`${ORIGIN}/hero-mountain.webp`);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', route.description);
    await act(() => router.navigate('/privacy'));
    expect(document.title).toBe('Privacy Policy | SummitFit Adventures');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).not.toContain('new Cape trail');
    expectImage(LOGO);
  });

  it('keeps successful preview pages noindex', async () => {
    renderMetadata('/routes/new-trail?preview=1');
    await waitFor(() => expect(document.title).toBe('New Trail | SummitFit Adventures'));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  it.each(['https://', 'http://[', 'javascript:alert(1)', 'data:image/png;base64,AAAA', 'ftp://images.example.com/event.webp', 'file:///event.webp'])(
    'falls back to the logo without crashing for event image %s', (image_url) => {
      const client = newClient();
      client.setQueryData(['public', 'event', 'future-event'], { ...event, image_url });
      // React logs render failures before propagating them to the assertion.
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderMetadata('/events/future-event', client)).not.toThrow();
      expect(document.title).toBe('Sunset Summit | SummitFit Adventures');
      expectImage(LOGO);
    },
  );

  it.each([
    ['https://images.example.com/event.webp', 'https://images.example.com/event.webp'],
    ['http://images.example.com/event.webp', 'http://images.example.com/event.webp'],
    ['/event.webp', `${ORIGIN}/event.webp`],
    ['//images.example.com/event.webp', 'https://images.example.com/event.webp'],
  ])('resolves supported image %s to an absolute HTTP(S) URL', (image_url, expected) => {
    const client = newClient();
    client.setQueryData(['public', 'event', 'future-event'], { ...event, image_url });
    renderMetadata('/events/future-event', client);
    expectImage(expected);
  });

  describe.each(dynamicPages)('$kind query states', ({ kind, path, id, name, data, query }) => {
    it('noindexes loading metadata, then indexes resolved content on the same page', async () => {
      let resolve!: (value: typeof data) => void;
      query.mockReturnValueOnce(new Promise<typeof data>(done => { resolve = done; }));
      renderMetadata(path);
      expect(document.title).toBe(`Loading ${kind} | SummitFit Adventures`);
      expectUnavailable(name);
      await act(async () => { resolve(data); });
      await waitFor(() => expect(document.title).toBe(`${name} | SummitFit Adventures`));
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    });

    it.each(['missing', 'error'] as const)('noindexes %s content', async (state) => {
      if (state === 'missing') query.mockResolvedValueOnce(null);
      else query.mockRejectedValueOnce(new Error('Content unavailable'));
      const { client } = renderMetadata(path);
      await waitFor(() => expect(client.getQueryState(['public', kind, id])?.status).toBe(state === 'missing' ? 'success' : 'error'));
      await waitFor(() => expect(document.title).toBe(`${kind === 'route' ? 'Route' : 'Event'} not found | SummitFit Adventures`));
      expectUnavailable(name);
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `${ORIGIN}${path}`);
    });

    it('clears successful metadata when a refetch fails with stale data still cached', async () => {
      const { client } = renderMetadata(path);
      await waitFor(() => expect(document.title).toBe(`${name} | SummitFit Adventures`));
      expectImage(kind === 'route' ? `${ORIGIN}/hero-mountain.webp` : event.image_url!);
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', data.description);
      query.mockRejectedValueOnce(new Error('Refetch failed'));
      await act(async () => { await client.refetchQueries({ queryKey: ['public', kind, id], exact: true }); });
      expect(client.getQueryState(['public', kind, id])).toMatchObject({ status: 'error', data });
      await waitFor(() => expect(document.title).toBe(`${kind === 'route' ? 'Route' : 'Event'} not found | SummitFit Adventures`));
      expectUnavailable(name);
      for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
        expect(document.querySelector(selector)?.getAttribute('content')).not.toBe(data.description);
      }
    });

    it('resets metadata when navigating from successful content to another loading item', async () => {
      const { router } = renderMetadata(path);
      await waitFor(() => expect(document.title).toBe(`${name} | SummitFit Adventures`));
      let resolve!: (value: null) => void;
      query.mockReturnValueOnce(new Promise<null>(done => { resolve = done; }));
      await act(() => router.navigate(`${path}-missing`));
      expect(document.title).toBe(`Loading ${kind} | SummitFit Adventures`);
      expectUnavailable(name);
      await act(async () => { resolve(null); });
      await waitFor(() => expect(document.title).toBe(`${kind === 'route' ? 'Route' : 'Event'} not found | SummitFit Adventures`));
      expectUnavailable(name);
    });
  });
});
