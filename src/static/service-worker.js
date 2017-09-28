self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('main')  
    .then(cache => cache.addAll([
      '/assets/css/normalize.css',
      '/assets/css/fonts.css',
      '/assets/css/base.css',
      '/assets/css/global.css',
    ]))
  )
})

self.addEventListener('fetch', event => {
  const request = event.request

  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
  )
})