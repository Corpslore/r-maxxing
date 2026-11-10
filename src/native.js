// Native features when the app runs inside the iPhone app (Capacitor), web fallbacks otherwise.
// The iPhone build loads native-bridge.js first, which puts the plugins on window.RMX_NATIVE
// (see tools/native-entry.js). Nothing here throws: a missing plugin means the feature quietly isn't there.

const N = () => (typeof window === 'undefined' ? null : window.RMX_NATIVE || null);
export const isNative = () => !!N()?.isNative;
const plugin = (name) => (isNative() ? N()[name] || null : null);

const VIBES = { light: 12, medium: 30, heavy: 50, success: [40, 40, 80], warning: [60, 40, 60] };

// iPhone browsers have no vibration API at all, so real haptics only arrive with the app.
export function haptic(kind = 'light') {
  const H = plugin('Haptics');
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

// Dark text on the bright screens, light text on the dark ones.
let lastBar = null;
export function statusBar(lightBackground) {
  const SB = plugin('StatusBar');
  if (!SB || lastBar === lightBackground) return;
  lastBar = lightBackground;
  SB.setStyle({ style: lightBackground ? 'LIGHT' : 'DARK' })?.catch?.(() => {});
}

export const canNudge = () => !!plugin('LocalNotifications');

// Replaces all pending nudges with `times` (Dates). Asks permission the first time.
export async function scheduleNudges(times, lines) {
  const LN = plugin('LocalNotifications');
  if (!LN) return false;
  try {
    const perm = await LN.checkPermissions();
    if (perm.display !== 'granted') {
      if (!times.length) return true;
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
  try {
    plugin('InAppReview')?.requestReview?.()?.catch?.(() => {});
  } catch { /* Not available. */ }
}

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

// The real iOS share sheet with the card attached. Returns false only if it couldn't run at all.
export async function shareImage(blob, text, filename) {
  const Sh = plugin('Share');
  const FS = plugin('Filesystem');
  if (!Sh || !FS) return false;
  try {
    const data = await blobToBase64(blob);
    const { uri } = await FS.writeFile({ path: filename, data, directory: N().Directory.Cache });
    await Sh.share({ text, files: [uri] });
    return true;
  } catch (err) {
    // Closing the share sheet rejects too. That still counts as handled.
    return !/unimplemented|not implemented|unavailable/i.test(String(err?.message || err));
  }
}
