// fix-backend.js
(function() {
  // --- Override fetch ---
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string') {
      // Replace localhost:3000 with relative path
      input = input.replace(/http:\/\/localhost:3000/, '');
    }
    return originalFetch(input, init);
  };

  // --- Override axios (if used) ---
  if (window.axios) {
    const originalAxiosRequest = window.axios.request;
    window.axios.request = function(config) {
      if (typeof config.url === 'string') {
        config.url = config.url.replace(/http:\/\/localhost:3000/, '');
      }
      return originalAxiosRequest.call(this, config);
    };
  }
})();
