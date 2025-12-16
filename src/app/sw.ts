import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst } from "serwist";

// This declares the value of `self.__SW_MANIFEST`
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ request }) => request.mode === "navigate",
            handler: new NetworkFirst({
                cacheName: "pages",
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }: { response: Response }) => {
                            if (response && response.status === 200) {
                                return response;
                            }
                            return null;
                        },
                    },
                ],
            }),
        },
        {
            matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
            handler: new CacheFirst({
                cacheName: "static-resources",
            }),
        },
        {
            matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
            handler: new StaleWhileRevalidate({
                cacheName: "images",
            }),
        },
        {
            matcher: ({ url }) => url.pathname === "/favicon.ico",
            handler: new StaleWhileRevalidate({
                cacheName: "static-misc",
            }),
        },
        ...defaultCache,
    ],
});

serwist.addEventListeners();
