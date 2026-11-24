import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ReadingScreen from './ReadingScreen';
import BibleRoute from '@/components/routes/BibleRoute';
import { AppProvider } from '@/contexts/AppContext';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

export function renderAt(entry: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <AppProvider>
          <LocationProbe />
          <Routes>
            <Route path="/bible/:bookSlug/:chapterNumber" element={<BibleRoute />} />
            <Route path="/read" element={<ReadingScreen />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

export async function nextArrow() {
  return (await screen.findAllByTestId('next-chapter-button'))[0];
}

export async function previousArrow() {
  return (await screen.findAllByTestId('previous-chapter-button'))[0];
}

export function location() {
  return screen.getByTestId('location').textContent;
}
