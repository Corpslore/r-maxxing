// Native features when the app runs inside the iOS wrapper (Capacitor), web fallbacks otherwise.
// Nothing here throws: a missing plugin just means the feature quietly isn't there.
//
// Plugins this expects in the wrapper: @capacitor/haptics, @capacitor/local-notifications,
// and an in-app review plugin that registers as `InAppReview` with `requestReview()`.

const cap = () => (typeof window === 'undefined' ? null : window.Capacitor);
export const isNative = () => !!cap()?.isNativePlatform?.();
const plugin = (name) => cap()?.Plugins?.[name] || null;

const VIBES = { light: 12, medium: 30, heavy: 50, success: [40, 40, 80], warning: [60, 40, 60] };

// iPhone browsers have no vibration API at all, so real haptics only arrive with the wrapper.
export function haptic(kind = 'light') {
  const H = isNative() && plugin('Haptics');
  if (H) {
    const done = kind === 'success' || kind === 'warning'
      ? H.notification({ type: kind.toUpperCase() })
      : H.impact({ style: { light: 'LIGHT', medium: 'MEDIUM', heavy: 'HEAVY' }[kind] || 'LIGHT' });
    done?.catch?.(() => {});
    return;
  }
  try {
    navigator.vibrate?.(VIBES[kind] ?? 12);
  } catch { /* Not supported. */ }
}

export const canNudge = () => isNative() && !!plugin('LocalNotifications');

// Replaces all pending nudges with `times` (Dates). Asks permission the first time.
export async function scheduleNudges(times, lines) {
  const LN = canNudge() && plugin('LocalNotifications');
  if (!LN) return false;
  try {
    const perm = await LN.checkPermissions();
    if (perm.display !== 'granted') {
      const asked = await LN.requestPermissions();
      if (asked.display !== 'granted') return false;
    }
    const pending = await LN.getPending();
    if (pending.notifications?.length) await LN.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    if (!times.length) return true;
    await LN.schedule({
      notifications: times.map((at, i) => ({ id: 1001 + i, title: 'R-MAXXING', body: lines[i % lines.length], schedule: { at } })),
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearNudges() {
  return scheduleNudges([], []);
}

// The system decides whether to show it (at most 3 times a year on iOS). Never from a button.
export function requestReview() {
  const R = isNative() && plugin('InAppReview');
  try {
    R?.requestReview?.()?.catch?.(() => {});
  } catch { /* Not available. */ }
}
