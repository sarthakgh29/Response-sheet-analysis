const state = { route: { name: 'upload', params: {} }, activeTab: 'overview' };
const listeners = new Set();
export function getState() { return state; }
export function setState(patch) { Object.assign(state, typeof patch === 'function' ? patch(state) : patch); listeners.forEach((l) => l(state)); }
export function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
