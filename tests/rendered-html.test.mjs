import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Elsewhere landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Elsewhere — Chapter One<\/title>/i);
  assert.match(html, /A different kind of retreat\./);
  assert.match(html, /The Elsewhere idea/);
  assert.match(html, /Retreats written/);
  assert.match(html, /Chapter One/);
  assert.match(html, /is being written\./);
  assert.match(html, /Be among the first to discover/);
  assert.match(html, /@MEET_ELSEWHERE/);
  assert.match(html, /© 2026 ELSEWHERE/);
  assert.doesNotMatch(html, /class="folio"/);
  assert.doesNotMatch(html, /brand-portal|hello\.elsewhere@outlook\.com/);
});

test("renders the progressive three-film sequence and accessible invitation", async () => {
  const response = await render();
  const html = await response.text();
  const films = html.match(/<video class="cinematic-film/g) ?? [];
  assert.equal(films.length, 3);
  assert.match(html, /13803509_1920_1080_30fps/);
  assert.match(html, /7707324-hd_1920_1080_25fps/);
  assert.match(html, /6959287-uhd_3840_2160_25fps/);
  assert.match(html, /<label class="sr-only" for="email">Email address<\/label>/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /apple-touch-icon/);
  assert.match(html, /property="og:image"/);
});
