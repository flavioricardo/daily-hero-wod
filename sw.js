if(!self.define){let e,i={};const n=(n,o)=>(n=new URL(n+".js",o).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(o,r)=>{const s=e||("document"in self?document.currentScript.src:"")||location.href;if(i[s])return;let t={};const d=e=>n(e,s),a={module:{uri:s},exports:t,require:d};i[s]=Promise.all(o.map((e=>a[e]||d(e)))).then((e=>(r(...e),t)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-DIpAziTy.js",revision:null},{url:"assets/workbox-window.prod.es5-B9K5rw8f.js",revision:null},{url:"index.html",revision:"06ebf4805b6f1a889026b45864159b05"},{url:"apple-touch-icon.png",revision:"6a3ab5a2310c5c2d922ce1cd893c9af9"},{url:"favicon.svg",revision:"7fca0098290d1cd0bb3f147785367938"},{url:"pwa-icon-192.png",revision:"241a74b5a2d5626f7bb67cbc788d8d44"},{url:"pwa-icon-512-maskable.png",revision:"d87b6fe9d44682782b9d90519a002ae6"},{url:"pwa-icon-512.png",revision:"d87b6fe9d44682782b9d90519a002ae6"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"manifest.webmanifest",revision:"3235ca50765a9daaa4c4ba5fb437b960"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
