// Run only against a disposable Chromium profile at CDP port 9227 and local Vite at 4179.
// This script replaces local test-profile data; never connect your everyday browser.
// Start Vite: npm run dev -- --port 4179
// Start Chromium: chromium --headless --no-sandbox --remote-debugging-port=9227 --user-data-dir=/tmp/assessment-qa
// Run: node scripts/qa-touch-games.mjs
import { writeFile } from "node:fs/promises";
const pages = await (await fetch("http://127.0.0.1:9227/json/list")).json(),
  ws = new WebSocket(pages[0].webSocketDebuggerUrl);
await new Promise((ok, fail) => {
  ws.onopen = ok;
  ws.onerror = fail;
});
let n = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    const [ok, fail] = pend.get(m.id);
    pend.delete(m.id);
    m.error ? fail(Error(m.error.message)) : ok(m.result);
  }
};
const c = (method, params = {}) =>
  new Promise((ok, fail) => {
    const id = ++n;
    pend.set(id, [ok, fail]);
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (expression) => {
  const r = await c("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails)
    throw Error(
      r.exceptionDetails.exception?.description ?? r.exceptionDetails.text,
    );
  return r.result.value;
};
const sleep = (t) => new Promise((r) => setTimeout(r, t));
const until = async (expr, ms = 8000) => {
  for (let end = Date.now() + ms; Date.now() < end; ) {
    if (await ev(expr)) return;
    await sleep(100);
  }
  throw Error("timeout " + expr);
};
const rect = async (expr) => {
  await until(`!!(${expr})`);
  return await ev(
    `(()=>{const e=${expr};e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}})()`,
  );
};
const touch = async (p) => {
  await c("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: p.x, y: p.y }],
  });
  await c("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(120);
};
const button = (t) =>
  `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(t)})`;
const includes = (t) =>
  `[...document.querySelectorAll('button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
const aria = (t) => `document.querySelector('[aria-label="${t}"]')`;
const click = async (t) => touch(await rect(includes(t)));
const shot = async (name) => {
  const r = await c("Page.captureScreenshot", { format: "png" });
  await writeFile("/tmp/" + name + ".png", Buffer.from(r.data, "base64"));
};
await c("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await c("Emulation.setTouchEmulationEnabled", { enabled: true });
await c("Page.enable");
await c("Runtime.enable");
await c("Page.navigate", { url: "http://127.0.0.1:4179/" });
await until(
  "location.origin==='http://127.0.0.1:4179' && document.readyState==='complete'",
);
await ev(
  `(async()=>{const {emptyState}=await import('/src/engine/progress.ts');const s=emptyState();s.profile={name:'Test',avatar:'🦁',createdAt:1};s.settings.muted=true;s.stars=7;localStorage.setItem('learning-quest:v1',JSON.stringify(s));localStorage.setItem('learning-quest:v1:before-rollback','preserve me');localStorage.setItem('classroom_auth','true');for(const id of ['water-pipes','shape-builder','dots-boxes'])localStorage.removeItem('learning-quest:tinker:v1:'+id);return true})()`,
);
await c("Page.reload");
await until("(document.body?.innerText??'').includes('Hi, Test!')");
// Observe actual engine calls, without claiming that a physical device was audible.
await ev(
  `(async()=>{const {soundEngine}=await import('/src/utils/audio.ts');window.audioEvents=[];for(const name of ['playTap','playCorrectChime','playGentleBuzzer','speak']){const original=soundEngine[name].bind(soundEngine);soundEngine[name]=(...args)=>{window.audioEvents.push({name,muted:soundEngine.getIsMuted()});return original(...args);};}return true})()`,
);
await click("Brain Games");
await click("Logic Lab");
await click("First Link");
await until("!!document.querySelector('.gear-board')");
const dimensions = await ev(
  "(()=>{const b=document.querySelector('.gear-board'),r=b.getBoundingClientRect();return {width:r.width,screen:innerWidth,scroll:b.scrollWidth,client:b.clientWidth,page:document.documentElement.scrollWidth}})()",
);
if (
  dimensions.scroll > dimensions.client + 1 ||
  dimensions.page > dimensions.screen
)
  throw Error("Gear overflow " + JSON.stringify(dimensions));
await shot("gear-touch-before");
const from = await rect(aria("Small gear small")),
  to = await rect(aria("Peg b"));
await c("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: from.x, y: from.y }],
});
for (let i = 1; i <= 7; i++) {
  await c("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      {
        x: from.x + ((to.x - from.x) * i) / 7,
        y: from.y + ((to.y - from.y) * i) / 7,
      },
    ],
  });
  await sleep(30);
}
await c("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await until(
  "(document.body?.innerText??'').includes('🎉 All goals are turning!')",
);
await click("Sound off");
if (!(await ev("window.audioEvents.some(e=>e.name==='playTap'&&!e.muted)")))
  throw Error("Unmute tap missing");
await click("Sound on");
await shot("gear-touch-complete");
await click("Levels");
await click("Brain Games");
await click("Water Rescue");
await click("Flower rescue 1");
await until("!!document.querySelector('.water-board')");
await shot("water-touch");
for (let i = 0; i < 60; i++) {
  if (
    await ev(
      "(document.body?.innerText??'').includes('Your friend has water!')",
    )
  )
    break;
  await click("Show me");
  const p = await rect("document.querySelector('.water-board .hint-piece')");
  await touch(p);
}
await until(
  "(document.body?.innerText??'').includes('Your friend has water!')",
);
await click("Choose");
await click("Brain Games");
await click("Shape Builder");
await click("Little house");
await until("!!document.querySelector('.shape-board')");
await shot("shape-touch");
await ev(
  `(async()=>{const {shapeLevel}=await import('/src/logicLab/games/tinker/shapes.ts');window.targetCells=shapeLevel(0).cells;})()`,
);
for (let i = 0; i < (await ev("window.targetCells.length")); i++) {
  const code = await ev(`window.targetCells[${i}]`);
  if (!code) continue;
  await touch(await rect(aria(code === 5 ? "Square" : "Triangle")));
  if (code > 0 && code < 5) {
    for (let j = 0; j < 4; j++) {
      const angle = await ev(
        "document.querySelector('.inventory [aria-label=Triangle] path').getAttribute('transform')",
      );
      if (angle === `rotate(${(code - 1) * 90} 25 25)`) break;
      await touch(await rect(aria("Turn triangle")));
    }
  }
  await touch(
    await rect(`document.querySelector('.shape-board [data-target="${i}"]')`),
  );
}
await until("(document.body?.innerText??'').includes('You made the picture!')");
await click("Choose");
await click("Brain Games");
await click("Dots and Boxes");
await click("Two players");
await touch(await rect(button("▶ Play")));
await until("!!document.querySelector('.dots-board')");
await shot("dots-touch");
for (let i = 0; i < 12; i++) {
  await touch(
    await rect("document.querySelector('.line-target:not(:disabled)')"),
  );
}
await until(
  "(document.body?.innerText??'').includes('All the boxes are filled!')",
);
const save = await ev(
  "JSON.parse(localStorage.getItem('learning-quest:tinker:v1:dots-boxes'))",
);
if (save.moves.length !== 12) throw Error("Dots moves missing");
await click("Choose");
await click("Computer");
await touch(await rect(button("▶ Play")));
await touch(
  await rect("document.querySelector('.line-target:not(:disabled)')"),
);
await until(
  "JSON.parse(localStorage.getItem('learning-quest:tinker:v1:dots-boxes')).moves.length===2",
);
await c("Page.reload");
await until("(document.body?.innerText??'').includes('Hi, Test!')");
await click("Brain Games");
await click("Dots and Boxes");
await click("Continue saved game");
await until("document.querySelectorAll('.line-target:disabled').length===2");
const preservation = await ev(
  "[JSON.parse(localStorage.getItem('learning-quest:v1')).profile.name,JSON.parse(localStorage.getItem('learning-quest:v1')).stars,localStorage.getItem('learning-quest:v1:before-rollback')]",
);
if (JSON.stringify(preservation) !== JSON.stringify(["Test", 7, "preserve me"]))
  throw Error("Existing progress changed");
// Actual dot-to-dot drawing, then cancel a queued computer move by leaving.
await click("Choose");
await click("Two players");
await touch(await rect(button("▶ Play")));
const a = await rect(aria("Dot row 1 column 1")),
  b = await rect(aria("Dot row 1 column 2"));
await c("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: a.x, y: a.y }],
});
for (let step = 1; step <= 7; step++) {
  await sleep(35);
  await c("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: a.x + ((b.x - a.x) * step) / 7, y: a.y + ((b.y - a.y) * step) / 7 },
    ],
  });
}
await sleep(35);
await c("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await until(
  "JSON.parse(localStorage.getItem('learning-quest:tinker:v1:dots-boxes')).moves[0]==='h-0-0'",
);
await sleep(350);
await click("Choose");
await click("Computer");
await touch(await rect(button("▶ Play")));
await touch(
  await rect("document.querySelector('.line-target:not(:disabled)')"),
);
await click("Choose");
await sleep(900);
if (
  (await ev(
    "JSON.parse(localStorage.getItem('learning-quest:tinker:v1:dots-boxes')).moves.length",
  )) !== 1
)
  throw Error("Computer continued after leaving");
// Check the smallest viewport for overflow and hit targets; a 4x4 game remains optional.
await c("Emulation.setDeviceMetricsOverride", {
  width: 320,
  height: 700,
  deviceScaleFactor: 1,
  mobile: true,
});
await click("Two players");
await click("5 × 5");
await touch(await rect(button("▶ Play")));
const fit = await ev(
  "({width:innerWidth,page:document.documentElement.scrollWidth,min:Math.min(...[...document.querySelectorAll('.line-target,.dot-target')].map(e=>Math.min(e.getBoundingClientRect().width,e.getBoundingClientRect().height)))})",
);
if (fit.page > fit.width || fit.min < 48)
  throw Error("Small phone fit " + JSON.stringify(fit));
await shot("dots-320");
await touch(await rect(aria("Horizontal line row 6 column 5")));
await until(
  "JSON.parse(localStorage.getItem('learning-quest:tinker:v1:dots-boxes')).moves.includes('h-5-4')",
);
if ((await ev("document.querySelectorAll('.dot-target').length")) !== 36)
  throw Error("Expected 36 dots");
if ((await ev("document.querySelectorAll('.line-target').length")) !== 60)
  throw Error("Expected 60 lines");
await click("Choose");
await click("Computer");
await touch(await rect(button("▶ Play")));
await touch(await rect(aria("Horizontal line row 1 column 1")));
await until(
  "JSON.parse(localStorage.getItem('learning-quest:tinker:v1:dots-boxes')).moves.length===2",
);
await c("Page.reload");
await until("(document.body?.innerText??'').includes('Hi, Test!')");
await click("Brain Games");
await click("Dots and Boxes");
await click("Continue saved game");
await until("document.querySelectorAll('.line-target').length===60");
console.log(
  "PASS: 5x5 on 320px phone, far edge touch, both modes, computer turn, 36 dots/60 lines and reload resume.",
);
ws.close();
