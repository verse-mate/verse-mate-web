import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TopicEventsScreen from './TopicEventsScreen';

const topics = vi.hoisted(() => ({ list: [] as { id: string; name: string; category: string; description: string }[] | null }));
const fetchTopicDetails = vi.hoisted(() => vi.fn());

vi.mock('@/services/bibleService', () => ({
  fetchTopicIndex: async () => topics.list,
  fetchTopicDetails,
}));
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { version: 'NASB1995' }, dispatch: vi.fn() }),
}));
const topicView = vi.hoisted(() => ({ insightTab: 'summary', setInsightTab: vi.fn(), setTopic: vi.fn(), setDetails: vi.fn() }));
vi.mock('@/contexts/TopicViewContext', () => ({ useTopicView: () => topicView }));
vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => true }));
vi.mock('./NotFound', () => ({ default: () => <div>page not found</div> }));

function open(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/topic/:categorySlug/:topicSlug" element={<TopicEventsScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TopicEventsScreen on a topic URL', () => {
  beforeEach(() => {
    topics.list = [{ id: '7', name: 'Birth of Jesus', category: 'EVENT', description: '' }];
    fetchTopicDetails.mockReset();
    fetchTopicDetails.mockResolvedValue({ topic: null, sections: [], explanation: { summary: '', byline: '', detailed: '' } });
  });

  it('shows the not-found screen for a topic that does not exist', async () => {
    open('/topic/events/no-such-topic');

    expect(await screen.findByText('page not found')).toBeTruthy();
    expect(fetchTopicDetails).not.toHaveBeenCalled();
  });

  it('shows the not-found screen for an unknown category', async () => {
    open('/topic/nonsense/birth-of-jesus');

    expect(await screen.findByText('page not found')).toBeTruthy();
  });

  it('does not call a topic missing when the topic list could not be loaded', async () => {
    topics.list = null;
    open('/topic/events/birth-of-jesus');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText('page not found')).toBeNull();
  });

  it('loads a topic that exists', async () => {
    open('/topic/events/birth-of-jesus');

    await waitFor(() => expect(fetchTopicDetails).toHaveBeenCalledWith('7', 'NASB1995'));
    expect(screen.queryByText('page not found')).toBeNull();
  });
});
