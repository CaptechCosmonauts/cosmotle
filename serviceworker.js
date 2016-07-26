this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('cosmotleCacheV1').then(function(cache) {
      return cache.addAll([
        '/',  
        '/index.html',
        '/app/styles/cosmonauts.png',
        '/app/styles/cosmotle.css',
        '/app/styles/error-triangle.svg',
        '/app/styles/tortilla-yellow.svg',
        '/app/styles/skeleton.css',
        '/node_modules/angular/angular.min.js',
        '/node_modules/angular-route/angular-route.min.js',
        '/node_modules/angular-cookies/angular-cookies.min.js',

      ]);
    })
  );
});

this.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response)
        return response;

      return fetch(event.request).then(function(response){
        return response;
      });
    })
  );
  
});