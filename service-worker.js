/**
 * Service Worker — GestSchool PWA
 * Met en cache tous les fichiers pour fonctionner hors-ligne.
 */
const CACHE_NAME = 'gestschool-v1.0.0';
const CACHE_FILES = [
  './',
  './index.html',
  './app.html',
  './offline.html',
  './manifest.json',

  // CSS
  './assets/css/style.css',
  './assets/css/responsive.css',
  './assets/css/print.css',
  './assets/css/setup.css',
  './assets/css/dashboard.css',
  './assets/css/eleves.css',
  './assets/css/enseignants.css',
  './assets/css/classes.css',
  './assets/css/matieres.css',
  './assets/css/notes.css',
  './assets/css/absences.css',
  './assets/css/paiements.css',
  './assets/css/bulletins.css',
  './assets/css/bulletinsLMD.css',
  './assets/css/annees.css',
  './assets/css/emploi.css',
  './assets/css/utilisateurs.css',
  './assets/css/parametres.css',
  './assets/css/rapports.css',
  './assets/css/rapportsLMD.css',
  './assets/css/superieur.css',

  // JS core
  './assets/js/core/storage.js',
  './assets/js/core/db.js',
  './assets/js/core/utils.js',
  './assets/js/core/auth.js',
  './assets/js/core/notifications.js',
  './assets/js/core/router.js',
  './assets/js/core/setup.js',

  // JS modules
  './assets/js/modules/dashboard.js',
  './assets/js/modules/eleves.js',
  './assets/js/modules/etudiants.js',
  './assets/js/modules/enseignants.js',
  './assets/js/modules/classes.js',
  './assets/js/modules/groupes.js',
  './assets/js/modules/matieres.js',
  './assets/js/modules/filieres.js',
  './assets/js/modules/niveaux.js',
  './assets/js/modules/ue.js',
  './assets/js/modules/ecue.js',
  './assets/js/modules/notes.js',
  './assets/js/modules/notesLMD.js',
  './assets/js/modules/absences.js',
  './assets/js/modules/paiements.js',
  './assets/js/modules/bulletins.js',
  './assets/js/modules/bulletinsLMD.js',
  './assets/js/modules/annees.js',
  './assets/js/modules/emploi.js',
  './assets/js/modules/utilisateurs.js',
  './assets/js/modules/parametres.js',
  './assets/js/modules/rapports.js',
  './assets/js/modules/rapportsLMD.js',
  './assets/js/app.js',

  // Images
  './assets/images/favicon.svg',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/apple-touch-icon.png'
];

// ─────────────────────────────────────────────
// INSTALLATION : mise en cache
// ─────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installation…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Mise en cache des fichiers');
      return cache.addAll(CACHE_FILES).catch(err => {
        console.warn('[SW] Certains fichiers n\'ont pas pu être cachés :', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────────
// ACTIVATION : nettoyage des anciens caches
// ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activation…');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Suppression ancien cache :', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────
// FETCH : servir depuis le cache d'abord
// ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes non-GET
  if (event.request.method !== 'GET') return;

  // Ne pas intercepter les CDN externes (Bootstrap, Chart.js…)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Cache hit → renvoyer, mais rafraîchir en arrière-plan
        fetch(event.request).then(fresh => {
          if (fresh && fresh.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, fresh.clone()));
          }
        }).catch(() => {});
        return cached;
      }

      // Pas en cache → chercher sur le réseau, mettre en cache si succès
      return fetch(event.request).then(response => {
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Hors-ligne et pas en cache → fallback
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
        return new Response('', {status: 404});
      });
    })
  );
});

// ─────────────────────────────────────────────
// MESSAGE : forcer la mise à jour
// ─────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});