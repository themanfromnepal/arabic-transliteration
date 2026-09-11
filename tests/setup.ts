// Registered via `setupFiles` in vitest.config.mts so component tests do not each repeat this
// import. Extends expect with the jest-dom matchers (toBeVisible, toHaveAttribute, and friends).
import '@testing-library/jest-dom';

// jsdom does not implement real media playback — HTMLMediaElement.prototype.play throws
// "not implemented" unless stubbed. This default stub simulates a successful play (dispatching
// `playing` the way a real browser would, asynchronously) and a synchronous pause, matching what
// useAudioPlayback listens for. Individual tests can override play() with a rejecting mock to
// exercise the error path.
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: function play(this: HTMLMediaElement) {
    queueMicrotask(() => this.dispatchEvent(new Event('playing')));
    return Promise.resolve();
  },
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: function pause(this: HTMLMediaElement) {
    this.dispatchEvent(new Event('pause'));
  },
});
