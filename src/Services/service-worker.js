// First, ensure that your web app has a service worker registered

// Then, within your service worker, you can intercept fetch requests and respond with cached data
self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
  
        // Not in cache - return the result from the live server
        // and cache the result
        return fetch(event.request).then(function(response) {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
  
          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          var responseToCache = response.clone();
  
          caches.open('my-cache-name').then(function(cache) {
            cache.put(event.request, responseToCache);
          });
  
          return response;
        });
      })
    );
  });
  