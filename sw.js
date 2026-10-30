// homon iPad ver.2.1 : 電波がなくても画面を開けるように、画面の部品だけを iPad にしまっておく。
// 名簿のデータはここには入れない(データは鍵をかけたまま IndexedDB に置く)。
const CACHE = 'homon-ipad-2.1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

// まずしまってあるものを使い、電波があれば裏で新しくする
self.addEventListener('fetch', (e) => {
	if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) {
		return;
	}
	e.respondWith(
		caches.open(CACHE).then((c) =>
			c.match(e.request, { ignoreSearch: true }).then((hit) => {
				const net = fetch(e.request)
					.then((res) => {
						if (res.ok) {
							c.put(e.request, res.clone());
						}
						return res;
					})
					.catch(() => hit);
				return hit || net;
			})
		)
	);
});
