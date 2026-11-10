// In-app purchases.
// - iPhone app: Apple's StoreKit through @capgo/native-purchases (loaded by native-bridge.js). No server,
//   no third party: the phone and Apple handle it, so the privacy label stays "Data Not Collected".
// - Testing on this computer: add ?store=mock to a localhost address for a fake store.
// - The public website: no store at all.

const N = () => (typeof window === 'undefined' ? null : window.RMX_NATIVE || null);
const P = () => (N()?.isNative ? N().NativePurchases || null : null);

const MOCK = typeof location !== 'undefined'
  && /^(localhost|127\.)/.test(location.hostname)
  && new URLSearchParams(location.search).get('store') === 'mock';
const MOCK_PRICES = { 'rmaxxing.pro': '$9.99 (test)', 'rmaxxing.tip.oj': '$1.99 (test)', 'rmaxxing.tip.sandwich': '$4.99 (test)', 'rmaxxing.tip.cart': '$9.99 (test)' };
const mockOwned = new Set();

export const storeAvailable = () => MOCK || !!P();
export const isMockStore = () => MOCK;

// [{ id, title, price }] for the ids the store knows about. Prices are the store's own, localized.
export async function loadProducts(ids) {
  if (MOCK) return ids.map((id) => ({ id, title: id, price: MOCK_PRICES[id] || '$0.99 (test)' }));
  const store = P();
  if (!store) return [];
  try {
    const { products } = await store.getProducts({ productIdentifiers: ids });
    return (products || []).map((p) => ({ id: p.identifier, title: p.title, price: p.priceString }));
  } catch {
    return [];
  }
}

// { ok } when paid, { cancelled } when the person backed out, { error } otherwise.
export async function buy(id) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    if (id === 'rmaxxing.pro') mockOwned.add(id);
    return { ok: true };
  }
  const store = P();
  if (!store) return { error: 'The store isn’t available here.' };
  try {
    await store.purchaseProduct({ productIdentifier: id, quantity: 1 });
    return { ok: true };
  } catch (err) {
    const msg = String(err?.message || err || '');
    if (/cancel/i.test(msg)) return { cancelled: true };
    return { error: msg || 'The purchase didn’t go through.' };
  }
}

// Product ids the person owns right now. Refunded purchases drop out. null if the store can't be reached.
export async function owned() {
  if (MOCK) return [...mockOwned];
  const store = P();
  if (!store) return [];
  try {
    const { purchases } = await store.getPurchases({ onlyCurrentEntitlements: true });
    return (purchases || []).filter((t) => !t.revocationDate).map((t) => t.productIdentifier);
  } catch {
    return null; // Unknown: callers keep what they had rather than taking Pro away offline.
  }
}

// Apple requires a Restore button for one-time purchases.
export async function restore() {
  const store = P();
  if (store) {
    try {
      await store.restorePurchases();
    } catch { /* Fall through to whatever is owned. */ }
  }
  return owned();
}
