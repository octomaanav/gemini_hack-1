import { describe, expect, it, vi } from 'vitest';
import { executeVoiceOSAction } from './executeAction';
import { loadAccessibilityPreferences } from '../../utils/accessibility';

describe('executeVoiceOSAction', () => {
  it('dispatches lesson-control for NEXT_MICROSECTION', async () => {
    const events: any[] = [];
    const handler = (e: any) => events.push(e.detail);
    window.addEventListener('lesson-control', handler as any);

    const res = await executeVoiceOSAction({
      action: 'NEXT_MICROSECTION' as any,
      args: {},
      navigate: vi.fn(),
      user: { profile: {} },
      locale: 'en-US',
    });

    window.removeEventListener('lesson-control', handler as any);
    expect(res.ok).toBe(true);
    expect(events[0]).toEqual({ action: 'next' });
  });

  it('toggles accessibility via localStorage', async () => {
    window.localStorage.setItem('accessibility-preferences', JSON.stringify({ focusMode: false }));
    const res = await executeVoiceOSAction({
      action: 'TOGGLE_ACCESSIBILITY' as any,
      args: { key: 'focusMode', value: 'toggle' },
      navigate: vi.fn(),
      user: { profile: {} },
      locale: 'en-US',
    });
    expect(res.ok).toBe(true);
    expect(loadAccessibilityPreferences().focusMode).toBe(true);
  });
});

