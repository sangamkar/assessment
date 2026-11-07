// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

const confetti = vi.fn();
const chime = vi.fn();
vi.mock('canvas-confetti', () => ({ default: (...args: unknown[]) => confetti(...args) }));
vi.mock('../src/utils/audio', () => ({ soundEngine: { playCorrectChime: () => chime(), speak: vi.fn() } }));

import { Results } from '../src/ui/Results';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Results celebration', () => {
  it('plays once when the parent rerenders with fresh props', () => {
    const root = createRoot(document.createElement('div'));
    const render = () => root.render(<Results correct={8} total={8} mode="quest" onHome={() => {}} doneToday={{ streak: 2, stars: 5, onStickers: () => {} }} />);
    act(render);
    act(render);
    act(render);
    expect(confetti).toHaveBeenCalledTimes(1);
    expect(chime).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
  });
});
