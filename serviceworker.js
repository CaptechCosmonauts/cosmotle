// this.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open('cosmotleCacheV2').then(function(cache) {
//       return cache.addAll([
//         '/',  
//         '/index.html',
//         '/app/styles/cosmonauts.jpeg',
//         '/app/styles/cosmotle.css',
//         '/app/styles/error-triangle.svg',
//         '/app/styles/tortilla-yellow.svg',
//         '/app/styles/skeleton.css',
//         '/node_modules/angular/angular.min.js',
//         '/node_modules/angular-route/angular-route.min.js',
//         '/node_modules/angular-cookies/angular-cookies.min.js',

//       ]);
//     })
//   );
// });

// this.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request).then(function(response){
//       if(response)
//         return response;

//       return fetch(event.request).then(function(response){
//         return response;
//       });
//     })
//   );
  
// });

console.log('Started ', this);

this.addEventListener('install', function(event){
  this.skipWaiting();

  console.log('SW Install Event', event);
});

this.addEventListener('activate', function(event){
  console.log('SW Activated Event', event);
});

this.addEventListener('push', function(event){
  console.log('SW Push Event', event);

  var title = 'Cosmotle Notification';  
  var body = 'No one gets to eat Chipoltle today!';  
  var icon = '/app/styles/cosmonauts.jpeg';  
  var tag = 'cosmotle-notification-tag';

  fetch('/calendar').then(function(response){
    var dateObj = new Date(Date.now());
    var day = dateObj.getDate();
    var month = dateObj.getMonth() + 1;
    response.json().then(function(data){
      for(i = 0; i < data.length; i++){
        if(month === Number(data[i].month) && day === Number(data[i].date)){
          body = data[i].name + ' gets to eat Chipoltle today!';
          this.registration.showNotification(title, {  
            body: body,  
            icon: icon,  
            tag: tag  
          });  
        }
      }
    });

  });
  // event.waitUntil(

  // );  
})