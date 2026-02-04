// fix-backend.js
// This rewrites all localhost backend calls to work on Railway
(function() {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('http://localhost')) {
      input = input.replace('http://localhost:3000', '');
    }
    return originalFetch(input, init);
  };
})();
