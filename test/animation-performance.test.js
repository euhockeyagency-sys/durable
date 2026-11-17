const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (p) => fs.readFileSync(path.join(__dirname, "..", "public", p), "utf8");

test("site.js uses one rAF-throttled scroll listener and no per-scroll layout reads", () => {
  const js = read("site.js");
  const scrollListeners = js.match(/addEventListener\('scroll'/g) || [];
  assert.equal(scrollListeners.length, 1, "expected a single scroll listener");
  assert.match(js, /requestAnimationFrame\(\(\)=>\{scrollQueued=false/);
  assert.doesNotMatch(js, /addEventListener\('scroll',show/);
  assert.doesNotMatch(js, /bar\.style\.width/);
  assert.match(js, /scaleX\(/);
});

test("hero traces pause when hidden and stop after a burst", () => {
  const js = read("site.js");
  assert.match(js, /visibilitychange',setRun/);
  assert.match(js, /burstEnd=performance\.now\(\)\+15000/);
  assert.match(js, /Math\.min\(devicePixelRatio\|\|1,1\.5\)/);
});

test("decorative CSS loops are compositor-only and do not run forever", () => {
  const css = read("styles.css");
  const kf = css.slice(css.indexOf("@keyframes scroll-line"), css.indexOf("}", css.indexOf("100%", css.indexOf("@keyframes scroll-line"))) + 1);
  assert.doesNotMatch(kf, /transform-origin/);
  assert.match(css, /\.whatsapp-float:before\{animation-iteration-count:4\}/);
  assert.match(css, /\.scroll-cue i,\.cta:after\{animation-play-state:paused\}/);
});
