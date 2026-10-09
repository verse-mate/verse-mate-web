import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import RetainedRecording from './RetainedRecording';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('a session VerseMate holds the recording for', () => {
  it('mints NOTHING until playback starts', async () => {
    // Minting on render would sign one URL per session on every page load.
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

    // And it SAYS so. The re-mint budget ran out, so the broken player has to
    // go: leaving it mounted showed a dead black rectangle with no explanation.
    expect(await screen.findByText(/Recording unavailable/)).toBeInTheDocument();
    expect(screen.queryByTestId('coach-recording-player-r1')).toBeNull();
  });

  it('loads a new player for every mint, even when the new address reads the same as the last', async () => {
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValue({ url: 'https://storage.test/same.mp4', expiresInSeconds: 86400 });
    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    const first = await screen.findByTestId('coach-recording-player-r1');

    fireEvent.error(first);
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('coach-recording-player-r1')).not.toBe(first));
    expect(first.isConnected).toBe(false);

    fireEvent.error(screen.getByTestId('coach-recording-player-r1'));
    expect(await screen.findByText(/Recording unavailable/)).toBeInTheDocument();
    expect(mint).toHaveBeenCalledTimes(2);
  });

  it('a DIFFERENT session does not inherit the previous one\'s recording', async () => {
    // The detail view keeps this component mounted in the same position when
    // the leader moves between sessions, so React reuses the instance. With no
    // reset, session two rendered session one's minted address.
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValue({ url: 'https://storage.test/first.mp4', expiresInSeconds: 86400 });

    const { rerender } = render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');

    rerender(<RetainedRecording reportId="r2" hasRetained />);
    expect(screen.queryByTestId('coach-recording-player-r1')).toBeNull();
    expect(screen.queryByTestId('coach-recording-player-r2')).toBeNull();
    expect(screen.getByTestId('coach-recording-play-r2')).toBeInTheDocument();
    expect(mint).toHaveBeenCalledTimes(1);
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

describe('a mint that resolves after the session changed', () => {
  function deferred() {
    let resolve!: (v: { url: string; expiresInSeconds: number }) => void;
    const promise = new Promise<{ url: string; expiresInSeconds: number }>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  }

  it('is dropped, so the new session never plays the old recording', async () => {
    const pending = deferred();
    vi.spyOn(coachService, 'mintRecordingUrl').mockReturnValueOnce(pending.promise);

    const { rerender } = render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    rerender(<RetainedRecording reportId="r2" hasRetained />);

    pending.resolve({ url: 'https://storage.test/r1.mp4', expiresInSeconds: 86400 });
    await pending.promise;
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.queryByTestId('coach-recording-player-r2')).toBeNull();
    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByTestId('coach-recording-play-r2')).toHaveTextContent('Play the recording');
  });

  it('a re-mint that resolves after the switch is dropped too', async () => {
    const remint = deferred();
    vi.spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValueOnce({ url: 'https://storage.test/r1-stale.mp4', expiresInSeconds: 86400 })
      .mockReturnValueOnce(remint.promise);

    const { rerender } = render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    fireEvent.error(await screen.findByTestId('coach-recording-player-r1'));
    rerender(<RetainedRecording reportId="r2" hasRetained />);

    remint.resolve({ url: 'https://storage.test/r1-fresh.mp4', expiresInSeconds: 86400 });
    await remint.promise;
    await new Promise((r) => setTimeout(r, 0));

    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByTestId('coach-recording-play-r2')).toBeInTheDocument();
  });
});

describe('a playing recording in a session replay', () => {
  it('is blocked from the replay, so its signed address is never recorded', async () => {
    vi.spyOn(coachService, 'mintRecordingUrl').mockResolvedValue({
      url: 'https://storage.test/rec.mp4?sig=1',
      expiresInSeconds: 86400,
    });
    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));

    expect(await screen.findByTestId('coach-recording-player-r1')).toHaveClass('ph-no-capture');
  });

  it('blocks an attached link from the replay too', () => {
    render(<RetainedRecording reportId="r1" hasRetained attachedUrl="https://drive.test/rec?token=1" />);
    expect(screen.getByTestId('coach-recording-attached-r1')).toHaveClass('ph-no-capture');
  });
});

describe('a recording longer than the address lifetime', () => {
  const HOUR = 3600;
  const T0 = new Date('2026-01-01T10:00:00Z').getTime();

  function playerAt(position: number, paused: boolean) {
    const player = screen.getByTestId('coach-recording-player-r1') as HTMLVideoElement;
    Object.defineProperty(player, 'currentTime', { value: position, writable: true, configurable: true });
    Object.defineProperty(player, 'paused', { value: paused, configurable: true });
    Object.defineProperty(player, 'readyState', { value: HTMLMediaElement.HAVE_METADATA, configurable: true });
    return player;
  }

  function unloadedPlayer() {
    const player = screen.getByTestId('coach-recording-player-r1') as HTMLVideoElement;
    Object.defineProperty(player, 'readyState', { value: HTMLMediaElement.HAVE_NOTHING, configurable: true });
    return player;
  }

  async function expectResumedAt(url: string, position: number) {
    await waitFor(() =>
      expect(screen.getByTestId('coach-recording-player-r1')).toHaveAttribute('src', url),
    );
    const player = playerAt(0, true);
    fireEvent.loadedMetadata(player);
    expect(player.currentTime).toBe(position);
    return player;
  }

  it('is watched through three expiries, resuming each time where it stopped', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(T0);
    const mint = vi.spyOn(coachService, 'mintRecordingUrl');
    for (const n of [1, 2, 3, 4]) {
      mint.mockResolvedValueOnce({ url: `https://storage.test/rec-${n}.mp4`, expiresInSeconds: HOUR });
    }

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');

    vi.setSystemTime(T0 + (HOUR + 5) * 1000);
    fireEvent.error(playerAt(HOUR, false));
    const second = await expectResumedAt('https://storage.test/rec-2.mp4', HOUR);
    expect(second).toHaveAttribute('autoplay');

    vi.setSystemTime(T0 + (2 * HOUR + 10) * 1000);
    fireEvent.error(playerAt(2 * HOUR, true));
    const third = await expectResumedAt('https://storage.test/rec-3.mp4', 2 * HOUR);
    expect(third).not.toHaveAttribute('autoplay');

    vi.setSystemTime(T0 + (3 * HOUR + 15) * 1000);
    fireEvent.error(playerAt(2 * HOUR + 100, false));
    const fourth = await expectResumedAt('https://storage.test/rec-4.mp4', 2 * HOUR + 100);
    expect(fourth).toHaveAttribute('autoplay');

    expect(mint).toHaveBeenCalledTimes(4);
    expect(screen.queryByText(/Recording unavailable/)).toBeNull();
  });

  it('a failure before the address expired still stops after one retry, even after expiries', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(T0);
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValue({ url: 'https://storage.test/rec.mp4', expiresInSeconds: HOUR });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');

    vi.setSystemTime(T0 + (HOUR + 5) * 1000);
    fireEvent.error(playerAt(HOUR, false));
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(2));

    vi.setSystemTime(T0 + (HOUR + 60) * 1000);
    fireEvent.error(playerAt(HOUR + 50, false));
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(3));
    await expectResumedAt('https://storage.test/rec.mp4', HOUR + 50);

    fireEvent.error(playerAt(HOUR + 50, false));
    expect(await screen.findByText(/Recording unavailable/)).toBeInTheDocument();
    expect(mint).toHaveBeenCalledTimes(3);
    expect(screen.queryByTestId('coach-recording-player-r1')).toBeNull();
  });

  async function failAndReload() {
    const before = playerAt(0, false);
    fireEvent.error(before);
    await waitFor(() => expect(screen.getByTestId('coach-recording-player-r1')).not.toBe(before));
  }

  it('an address that is spent before it loads stops after three new ones, and says so', async () => {
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValue({ url: 'https://storage.test/spent.mp4', expiresInSeconds: 0 });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');

    for (let n = 0; n < 3; n++) await failAndReload();
    fireEvent.error(playerAt(0, false));

    expect(await screen.findByText(/Recording unavailable/)).toBeInTheDocument();
    expect(screen.queryByTestId('coach-recording-player-r1')).toBeNull();
    expect(mint).toHaveBeenCalledTimes(4);
  });

  it('keeps the position it was resuming to when the new address is spent before the player loads', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(T0);
    vi.spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValueOnce({ url: 'https://storage.test/rec-1.mp4', expiresInSeconds: HOUR })
      .mockResolvedValueOnce({ url: 'https://storage.test/spent.mp4', expiresInSeconds: 0 })
      .mockResolvedValueOnce({ url: 'https://storage.test/rec-3.mp4', expiresInSeconds: HOUR });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');

    vi.setSystemTime(T0 + (HOUR + 5) * 1000);
    fireEvent.error(playerAt(HOUR, true));
    await waitFor(() => expect(screen.getByTestId('coach-recording-player-r1')).toHaveAttribute('src', 'https://storage.test/spent.mp4'));
    fireEvent.error(unloadedPlayer());
    const resumed = await expectResumedAt('https://storage.test/rec-3.mp4', HOUR);
    expect(resumed).not.toHaveAttribute('autoplay');
  });

  it('a press after the cap ran out starts a fresh budget', async () => {
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValue({ url: 'https://storage.test/spent.mp4', expiresInSeconds: 0 });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');
    for (let n = 0; n < 3; n++) await failAndReload();
    fireEvent.error(playerAt(0, false));
    fireEvent.click(await screen.findByText(/Recording unavailable/));
    await screen.findByTestId('coach-recording-player-r1');
    await failAndReload();
    expect(mint).toHaveBeenCalledTimes(6);
  });

  it('a tab left open past the lifetime plays from where it stood when pressed', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(T0);
    const mint = vi
      .spyOn(coachService, 'mintRecordingUrl')
      .mockResolvedValueOnce({ url: 'https://storage.test/stale.mp4', expiresInSeconds: HOUR })
      .mockResolvedValueOnce({ url: 'https://storage.test/fresh.mp4', expiresInSeconds: HOUR });

    render(<RetainedRecording reportId="r1" hasRetained />);
    fireEvent.click(screen.getByTestId('coach-recording-play-r1'));
    await screen.findByTestId('coach-recording-player-r1');

    vi.setSystemTime(T0 + 5 * HOUR * 1000);
    fireEvent.error(playerAt(42, false));
    await expectResumedAt('https://storage.test/fresh.mp4', 42);
    expect(mint).toHaveBeenCalledTimes(2);
  });
});
