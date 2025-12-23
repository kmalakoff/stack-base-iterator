// Yield to I/O: runs after pending I/O callbacks complete
// setImmediate (Node 0.10+) or setTimeout fallback (Node 0.8)
// Use this when other code may have scheduled I/O that must run first
// For "avoid Zalgo" (just need async), use process.nextTick instead
export const defer: (fn: () => void) => void = typeof setImmediate !== 'undefined' ? setImmediate : (fn) => setTimeout(fn, 0);
