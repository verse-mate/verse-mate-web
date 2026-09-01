import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import RetainedRecording from './RetainedRecording';

afterEach(() => vi.restoreAllMocks());

describe('a session VerseMate holds the recording for', () => {
  it('mints NOTHING until playback starts', async () => {
    // Minting on render would sign one URL per session on every page load,
    // each live for a day.
    const mint = vi.spyOn(coachService, 'mintRecordingUrl');
    render(<RetainedRecording reportId="r1" hasRetained />);
    expect(screen.getByTestId('coach-recording-play-r1')).toBeInTheDocument();
    expect(mint).not.toHaveBeenCalled();
  });

  it('mints when the leader presses play, and shows the player', async () => {
    vi.spyOn(coachService, 'mintRecordingUrl').mockResolvedValue({
      url: 'https://storage.test/rec.mp4',
      expiresInSeconds: 86400,
    });
    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));

    const player = await screen.findByTestId('coach-recording-player-r1');
    expect(player).toHaveAttribute('src', 'https://storage.test/rec.mp4');
  });

  it('a FAILED load re-mints once — a tab left open past the lifetime still plays', async () => {
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValueOnce({ url: 'https://storage.test/stale.mp4', expiresInSeconds: 86400 })
      .mockResolvedValueOnce({ url: 'https://storage.test/fresh.mp4', expiresInSeconds: 86400 });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    const player = await screen.findByTestId('coach-recording-player-r1');

    fireEvent.error(player);
    await waitFor(() =>
      expect(screen.getByTestId('coach-recording-player-r1')).toHaveAttribute(
        'src',
        'https://storage.test/fresh.mp4',
      ),
    );
    expect(mint).toHaveBeenCalledTimes(2);
  });

  it('does NOT re-mint forever when the recording itself is broken', async () => {
    // Looping would hammer the endpoint on a failure a fresh address cannot fix.
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValue({ url: 'https://storage.test/broken.mp4', expiresInSeconds: 86400 });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    const player = await screen.findByTestId('coach-recording-player-r1');

    fireEvent.error(player);
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(2));
    fireEvent.error(screen.getByTestId('coach-recording-player-r1'));
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(2));
  });

  it('a refused mint says so rather than showing a dead player', async () => {
    vi.spyOn(coachService, 'mintRecordingUrl').mockResolvedValue(null);
    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    expect(
      await screen.findByText(/Recording unavailable/),
    ).toBeInTheDocument();
  });
});

describe('sessions without retained material', () => {
  it('renders NOTHING rather than an empty player', () => {
    // An empty player suggests the recording is broken rather than absent.
    const { container } = render(
      <RetainedRecording reportId="r1" hasRetained={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("an admin's pasted link takes precedence over anything retained", async () => {
    // They attached it deliberately, usually because it is the better copy.
    const mint = vi.spyOn(coachService, 'mintRecordingUrl');
    render(
      <RetainedRecording
        reportId="r1"
        hasRetained
        attachedUrl="https://drive.example/admin"
      />,
    );
    expect(screen.getByTestId('coach-recording-attached-r1')).toHaveAttribute(
      'href',
      'https://drive.example/admin',
    );
    expect(screen.queryByTestId('coach-recording-play-r1')).toBeNull();
    expect(mint).not.toHaveBeenCalled();
  });

  it('a whitespace-only attached link is not a link', () => {
    render(
      <RetainedRecording reportId="r1" hasRetained={false} attachedUrl="   " />,
    );
    expect(screen.queryByTestId('coach-recording-attached-r1')).toBeNull();
  });
});
