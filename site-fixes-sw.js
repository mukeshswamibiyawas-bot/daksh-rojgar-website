self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.mode === "navigate" &&
        url.origin === self.location.origin &&
        url.pathname.endsWith("/pdf-workbench.html")
    ) {
        event.respondWith((async () => {
            const response = await fetch(request);
            if (!response.ok) return response;

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("text/html")) return response;

            let html = await response.text();
            if (!html.includes("pdf-resize-real-fix.js")) {
                html = html.replace(
                    "</body>",
                    '<script src="pdf-resize-real-fix.js?v=20260911"></script>\n</body>'
                );
            }

            const headers = new Headers(response.headers);
            headers.set("content-type", "text/html; charset=utf-8");
            headers.set("cache-control", "no-cache");
            headers.delete("content-length");

            return new Response(html, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
        })());
    }
});
