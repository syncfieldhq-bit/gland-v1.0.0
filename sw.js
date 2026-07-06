/* ======================================================
 * G-LAND Service Worker
 * バージョンを変えるとキャッシュが自動更新される
 * ====================================================== */

// ⚠️アプリを更新したら必ずこの数字を上げる（キャッシュ破棄のため）
const CACHE_VERSION = 'gland-v2.0.30';

// キャッシュするファイルの一覧
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.png',
  './css/theme.css',
  './css/reset.css',
  './css/layout.css',
  './css/scoretable.css',
  './css/inputpanel.css',
  './css/modal.css',
  './css/views.css',
  './js/prototype_data.js',
  './js/lib/score_format.js',
  './js/lib/qrcode-mini.js',
  './js/ui/scoretable.js',
  './js/ui/inputpanel.js',
  './js/ui/timepicker.js',
  './js/ui/lockerpicker.js',
  './js/ui/qrmodal.js'
];

// インストール時: キャッシュを一括作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CACHE_URLS).catch(() => { /* 個別ファイル失敗は無視 */ }))
      .then(() => self.skipWaiting())
  );
});

// 有効化時: 古いバージョンのキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch: ネットワーク優先、失敗したらキャッシュにフォールバック
// ⇒ 最新版が優先されつつ、オフラインでも動く
// ⚠️ ただし ?join= 付き URL は常にネットワーク優先 + キャッシュしない
self.addEventListener('fetch', event => {
  // GET リクエストのみ処理
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const hasJoinParam = url.searchParams.has('join');

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ?join= 付きはキャッシュ更新しない（パラメータ付きURLがキャッシュされるのを防ぐ）
        if (!hasJoinParam) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});
