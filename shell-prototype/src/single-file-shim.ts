// The single-file build is often opened inside a sandboxed viewer frame (address about:srcdoc, origin "null"),
// where react-router's `new URL(path, window.origin)` throws "Invalid URL". Give it a usable origin.
if (import.meta.env.VITE_SINGLE_FILE && window.origin === 'null') {
  Object.defineProperty(window, 'origin', { value: 'http://localhost', configurable: true });
}
export {};
