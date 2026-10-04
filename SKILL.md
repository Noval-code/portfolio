---
name: offline-website-mirror
description: Use when asked to clone, mirror, or make an offline copy of a public web page - downloads all assets (including runtime-loaded ones), rewrites URLs to local paths, and verifies fidelity with a headless-browser diagnostic loop across device profiles
---

# Offline Website Mirror

Create a faithful offline copy of a public web page: download every asset,
rewrite URLs to local paths, and verify the result renders identically to the
live site. Written so an AI agent can follow it end to end.

> **Ethics & legal (read first):** Site content (photos, text, designs,
> trademarks) belongs to its owners. A local mirror is reasonable for
> **learning, personal archiving, or technical analysis** — the equivalent of
> the browser's "Save Page As". Do NOT republish it, host it publicly, or use
> it to impersonate the real site. Refuse requests that aim to phish or
> impersonate.

## The Big Picture

```
fetch HTML → inventory assets → download + rewrite URLs → headless verify
→ fix 404s (runtime assets) → REPEAT verify per device profile → package
```

Core principle: **never declare success because "the files downloaded".**
The only acceptable evidence is opening the page in a real (headless) browser
and observing: zero console errors, zero failed requests, and a screenshot
matching the live site. Repeat for **every device profile** — desktop and
mobile may load entirely different asset sets.

---

## Step 1 — Recon

```bash
mkdir <project-folder> && cd <project-folder>
curl -sI https://target-site.example/ | head -20     # inspect headers
curl -sL https://target-site.example/ -o index.html
grep -oE '(https?:)?//[a-zA-Z0-9.-]+/' index.html | sort | uniq -c | sort -rn
```

Headers reveal the platform (Webflow, Shopify, Next.js, etc. each leave
fingerprints). Classify the referenced domains:

- **Asset domains** (CDNs, cloud storage) → must be mirrored
- **Social/external links** (video platforms, store links) → leave as-is
- **Tracker domains** (analytics, cookie consent, marketing) → strip later

## Step 2 — The Mirror Script

Save as `mirror.js`, edit the `HOSTS` list to match the asset domains found in
Step 1, then run `node mirror.js index.html`. Requires Node 18+ (built-in
`fetch`), no dependencies.

What it does:
1. Extracts every asset URL from the HTML (regex per asset host).
2. Maps each URL to `assets/<hash8>_<basename>` (hash prevents collisions
   between identically-named files from different CDN directories).
3. Downloads with a parallel pool.
4. Re-scans every downloaded `.css`/`.js` for nested asset URLs (CSS pulls
   fonts/images via `url()`; JS embeds CDN base paths) and loops until no new
   URLs appear.
5. Rewrites all URLs: in HTML → `assets/<name>`; inside CSS/JS → `<name>`
   (sibling-relative).

```js
// mirror.js — offline mirror: download referenced assets, rewrite URLs to local paths.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const ASSETS = path.join(ROOT, 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

// EDIT ME: the asset domains discovered during recon
const HOSTS = [
  'cdn.example-platform.com',
  'assets.example-agency.io',
];

const hostAlt = HOSTS.map(h => h.replace(/\./g, '\\.')).join('|');
const urlRe = new RegExp(`https://(?:${hostAlt})/[^\\s"'<>\\\\]+`, 'g');

const urlToLocal = new Map();

function localNameFor(url) {
  if (urlToLocal.has(url)) return urlToLocal.get(url);
  const u = new URL(url);
  let base = decodeURIComponent(u.pathname.split('/').pop() || 'file');
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (base.length > 80) base = base.slice(-80);
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
  const name = `${hash}_${base}`;
  urlToLocal.set(url, name);
  return name;
}

function extractUrls(text) {
  const found = new Set();
  for (const m of text.matchAll(urlRe)) {
    // strip punctuation that belongs to surrounding markup, not the URL
    found.add(m[0].replace(/[),.;]+$/, ''));
  }
  return [...found];
}

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      // some CDNs enforce hotlink protection (Step 3)
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
      'Referer': 'https://target-site.example/',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function pool(items, worker, n = 12) {
  const q = [...items];
  let ok = 0, fail = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (q.length) {
      const it = q.shift();
      try { await worker(it); ok++; } catch (e) { fail++; console.error('FAIL', e.message); }
    }
  }));
  return { ok, fail };
}

(async () => {
  const pages = process.argv.slice(2);
  const pending = new Map();
  const done = new Set();

  for (const p of pages) {
    const text = fs.readFileSync(path.join(ROOT, p), 'utf8');
    for (const u of extractUrls(text)) pending.set(u, localNameFor(u));
  }
  console.log(`Found ${pending.size} unique asset URLs in HTML`);

  let round = 1;
  while (pending.size) {
    const batch = [...pending.entries()].filter(([u]) => !done.has(u));
    pending.clear();
    console.log(`Round ${round++}: downloading ${batch.length} files...`);
    const { ok, fail } = await pool(batch, async ([url, name]) => {
      const dest = path.join(ASSETS, name);
      if (!fs.existsSync(dest)) await download(url, dest);
      done.add(url);
      if (/\.(css|js)$/i.test(new URL(url).pathname)) {
        for (const u of extractUrls(fs.readFileSync(dest, 'utf8'))) {
          if (!done.has(u)) pending.set(u, localNameFor(u));
        }
      }
    });
    console.log(`  ok=${ok} fail=${fail}, discovered ${pending.size} more`);
  }

  for (const p of pages) {
    let text = fs.readFileSync(path.join(ROOT, p), 'utf8');
    for (const [url, name] of urlToLocal) text = text.split(url).join('assets/' + name);
    fs.writeFileSync(path.join(ROOT, p), text);
  }
  for (const [url, name] of urlToLocal) {
    if (!/\.(css|js)$/i.test(new URL(url).pathname)) continue;
    const f = path.join(ASSETS, name);
    if (!fs.existsSync(f)) continue;
    let txt = fs.readFileSync(f, 'utf8'), changed = false;
    for (const [u2, n2] of urlToLocal) {
      if (txt.includes(u2)) { txt = txt.split(u2).join(n2); changed = true; }
    }
    if (changed) fs.writeFileSync(f, txt);
  }
  console.log(`Done. ${urlToLocal.size} assets mapped.`);
})();
```

## Step 3 — Pitfall #1: Hotlink Protection (HTTP 403)

Some CDNs reject requests without a browser identity. On 403, retry with a
**browser User-Agent + the origin site as Referer** (the script above already
sends both; for one-off downloads):

```bash
curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126" \
     -e "https://target-site.example/" -o file.js "https://cdn.../file.js"
```

## Step 4 — Pitfall #2: Runtime Base URLs Inside JS

Minified bundles often store a **base URL as a constant** and assemble full
paths at runtime:

```js
var base = "https://cdn.example.com/gl";
loadTexture(base + "/textures/" + fmt + "/diffuse." + fmt)
```

Consequences:
- Global rewriting can **corrupt these constants** (replacing a base URL with
  a single filename). After rewriting, search the JS for leftover CDN domains
  and inspect context: `grep -oE '.{40}cdn-domain.{40}' assets/*.js`
- Replace base URLs with paths **relative to the page, not to the JS file**
  (e.g. `"assets/gl"`) — `fetch()` inside JS resolves against the page URL.
- Full asset paths **cannot be predicted from code alone** (template variables
  select format/size at runtime) — Step 7 is how you find them.

## Step 5 — Pitfall #3 (MOST CRITICAL): Subresource Integrity

If the HTML carries `integrity="sha384-..."` on `<link>`/`<script>` tags, the
browser **hard-blocks** any file whose content changed — and your CSS/JS
content ALWAYS changes because the URLs inside were rewritten. Symptom: the
page renders as a completely unstyled mess ("all the photos are scattered").

```bash
sed -i 's/ integrity="[^"]*"//g; s/ crossorigin="anonymous"//g' index.html
```

While there, strip what is useless offline:
- `<link rel="preconnect|dns-prefetch">` pointing at CDNs
- Tracker scripts (analytics, marketing, cookie consent) — no visual impact
- Leftover dev-mode scripts (e.g. references to the original developer's
  `localhost:<port>`)

## Step 6 — Serve Over HTTP, Never file://

`fetch()`/XHR (used by animation runtimes, WebGL loaders, etc.) is blocked by
CORS on `file://`. Always test through a static server:
`npx http-server -p 8123`

## Step 7 — The Headless Verification Loop (the heart of the method)

Use `puppeteer-core` with an already-installed Chrome/Edge (no browser
download). The diagnostic must capture **console errors**, **failed requests
(status ≥ 400)** — that list is your shopping list — and a **screenshot** to
compare against the live site.

Save as `diag.js`; run `npm i puppeteer-core` once, then
`node diag.js <url> <screenshot.png>`:

```js
// diag.js — desktop diagnostic: console errors, failed requests, screenshot
const puppeteer = require('puppeteer-core');

(async () => {
  const [url, shot] = process.argv.slice(2);
  const browser = await puppeteer.launch({
    // EDIT ME if Chrome lives elsewhere (or point at msedge.exe)
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push(('[pageerror] ' + e.message).slice(0, 300)));
  page.on('requestfailed', r => failed.push(`${r.failure()?.errorText} ${r.url()}`.slice(0, 200)));
  page.on('response', r => { if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url()}`.slice(0, 200)); });
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) { errors.push('[goto] ' + e.message); }
  await new Promise(r => setTimeout(r, 6000));   // let intro animations settle
  await page.screenshot({ path: shot });
  console.log('== CONSOLE ERRORS ==');
  [...new Set(errors)].slice(0, 25).forEach(e => console.log(e));
  console.log('== FAILED REQUESTS ==');
  [...new Set(failed)].slice(0, 30).forEach(e => console.log(e));
  await browser.close();
})();
```

**The loop:**

```
1. Run the diagnostic → collect the list of 404 URLs
2. Download those files from the origin
   (original path = the 404 path minus your local prefix)
3. Repeat until: zero errors, zero failed requests
4. Screenshot the LIVE site the same way → compare side by side
```

The 404 list is the only reliable way to discover **runtime-loaded assets**
whose paths are assembled by JS (textures, 3D models, animation files, WASM
decoders).

## Step 8 — Pitfall #4: Different Assets Per Device

**You must repeat the loop per device profile.** Real-world case: on desktop a
site loaded `.webp` textures, but on mobile its JS switched to `.ktx2`
GPU-compressed textures plus a `basis_transcoder.js/.wasm` decoder — none of
which ever appeared during desktop testing. The mobile version hung on its
loading screen forever.

Save as `diag-mobile.js` (same usage as `diag.js`):

```js
// diag-mobile.js — mobile-emulation diagnostic
const puppeteer = require('puppeteer-core');

(async () => {
  const [url, shot] = process.argv.slice(2);
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.emulate({
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  });
  const errors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push(('[pageerror] ' + e.message).slice(0, 300)));
  page.on('requestfailed', r => failed.push(`${r.failure()?.errorText} ${r.url()}`.slice(0, 200)));
  page.on('response', r => { if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url()}`.slice(0, 200)); });
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) { errors.push('[goto] ' + e.message); }
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: shot });
  console.log('== CONSOLE ERRORS ==');
  [...new Set(errors)].slice(0, 25).forEach(e => console.log(e));
  console.log('== FAILED REQUESTS ==');
  [...new Set(failed)].slice(0, 30).forEach(e => console.log(e));
  await browser.close();
})();
```

Minimum profile checklist:
- [ ] Desktop (1440×900 viewport, Chrome UA)
- [ ] Mobile (390×844, `isMobile: true`, `hasTouch: true`, iPhone UA)
- [ ] (Optional) Tablet; other engines if the site sniffs browsers

Also watch for other runtime-selected format variants: `avif` vs `webp`,
`draco`-compressed 3D models, responsive `srcset` size variants.

## Step 9 — Static Cross-Check

Verify every local reference resolves on disk:

```js
// check-refs.js — verify HTML references and CSS url() targets exist
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const refs = new Set();
for (const m of html.matchAll(/(?:src|href|srcset|poster)="([^"]+)"/g)) {
  for (const part of m[1].split(',')) {
    const u = part.trim().split(' ')[0];
    if (u.startsWith('assets/')) refs.add(decodeURIComponent(u));
  }
}
let miss = 0;
for (const r of refs) if (!fs.existsSync(r)) { miss++; console.log('MISSING', r); }
console.log('HTML refs:', refs.size, 'missing:', miss);
for (const f of fs.readdirSync('assets').filter(f => f.endsWith('.css'))) {
  const css = fs.readFileSync('assets/' + f, 'utf8');
  for (const m of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
    const u = m[2];
    if (/^(data:|#|https?:)/.test(u)) continue;
    if (!fs.existsSync('assets/' + u.split('?')[0])) console.log('CSS MISSING', f, u);
  }
}
```

## Step 10 (Optional) — Package as a Framework Project (Astro example)

- Layout: assets → `public/assets/` (the `assets/...` paths stay valid from
  the root page); split the HTML into `src/fragments/head.html` + `body.html`.
- **Never paste mirrored HTML directly into an `.astro` template** — mirrored
  markup is full of `{` characters in inline scripts, which Astro parses as
  template expressions. Instead:

  ```astro
  ---
  import headHtml from '../fragments/head.html?raw';
  import bodyHtml from '../fragments/body.html?raw';
  ---
  <html lang="en">{/* copy the original <html> attributes here */}
    <head><Fragment set:html={headHtml} /></head>
    <body><Fragment set:html={bodyHtml} /></body>
  </html>
  ```

- Set `compressHTML: false` in `astro.config.mjs` — site JS may depend on
  exact DOM structure/whitespace.
- After building, **repeat Steps 7–8** against `astro preview`.
- Remember: `preview` serves `dist/` — changes in `public/` need a rebuild.

## Symptom → Cause → Fix

| Symptom | Cause | Fix |
|---|---|---|
| Page renders unstyled chaos | SRI `integrity` blocks modified CSS | Strip `integrity` attributes |
| Downloads return 403 | Hotlink protection | Browser UA + Referer |
| 3D/animation features dead | Runtime assets not mirrored | Headless loop; download the 404 list |
| Mobile stuck on loading screen | Per-device asset paths (ktx2/basis, etc.) | Re-run diagnostic with mobile emulation |
| Animations dead on file:// | fetch blocked by CORS | Always serve over HTTP |
| Base URL in JS corrupted | Global rewrite hit a constant | Grep for leftover domains; use page-relative paths |
| 404s after framework build | Preview serving stale dist | Rebuild after adding assets |

## Definition of Done

The mirror is complete ONLY when, on **every device profile**:
1. Zero console errors, zero failed requests (headless diagnostic)
2. Local screenshot ≈ live-site screenshot (animation-frame differences OK)
3. No references to the original asset domains remain:
   `grep -rE 'cdn-domain|asset-domain' index.html assets/ | wc -l` → 0
