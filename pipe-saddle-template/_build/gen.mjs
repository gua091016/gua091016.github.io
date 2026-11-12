// 새들 템플릿 검색 노출용 정적 페이지 생성기.
//   node pipe-saddle-template/_build/gen.mjs   (저장소 루트에서)
// 만드는 것:
//   - pipe-saddle-template/<branch>-inch-on-<run>-inch/index.html  (규격별 랜딩, 영어)
//   - pipe-saddle-template/index.html 의 <!--SIZES--> 구간 (규격 링크 목록)
//   - pipe-saddle-template/ko/index.html  (생성기 한국어 정적 버전)
//   - /sitemap.xml, /robots.txt
// _build 폴더는 밑줄로 시작해서 GitHub Pages(Jekyll)가 배포하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = path.resolve(HERE, '..');
const ROOT = path.resolve(TOOL, '..');
const ORIGIN = 'https://gua091016.github.io';
const BASE = '/pipe-saddle-template/';
const TODAY = new Date().toISOString().slice(0, 10);

const DUMMY_APP = 'https://play.google.com/store/apps/details?id=com.gua091016.dummy&referrer=utm_source%3Dsaddle_size';
const ISO_APP = 'https://play.google.com/store/apps/details?id=com.gua091016.pipecuttingcalculator&referrer=utm_source%3Dsaddle_size';

// [라벨, NPS(인치), OD mm] — 생성기 PIPES 와 같은 값 (ASME B36.10)
const PIPES = [
  ['1/2"', 0.5, 21.3], ['3/4"', 0.75, 26.7], ['1"', 1, 33.4], ['1-1/4"', 1.25, 42.2], ['1-1/2"', 1.5, 48.3],
  ['2"', 2, 60.3], ['2-1/2"', 2.5, 73.0], ['3"', 3, 88.9], ['4"', 4, 114.3], ['5"', 5, 141.3], ['6"', 6, 168.3],
  ['8"', 8, 219.1], ['10"', 10, 273.1], ['12"', 12, 323.9], ['14"', 14, 355.6], ['16"', 16, 406.4],
  ['18"', 18, 457.0], ['20"', 20, 508.0], ['24"', 24, 610.0],
];
const RUNS = [2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24];
const BRANCHES = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 10, 12];
const pipe = nps => PIPES.find(p => p[1] === nps);
const slugNps = nps => pipe(nps)[0].replace('"', '').split('/').join('-'); // 1-1/2" → 1-1-2
const slug = (b, r) => `${slugNps(b)}-inch-on-${slugNps(r)}-inch`;
const words = lbl => lbl.replace('"', ' inch');                  // 4" → 4 inch
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// saddle_math.dart 와 같은 식
function saddle(runOd, brOd) {
  const R = runOd / 2, r = brOd / 2;
  const seat = phi => { const s = r * Math.sin(phi); const v = R * R - s * s; return v <= 0 ? 0 : Math.sqrt(v); };
  const seatMin = seat(Math.PI / 2);
  return { circ: Math.PI * brOd, depth: R - seatMin, ord: phi => seat(phi) - seatMin };
}
function inch(mm) {
  const s16 = Math.round(mm / 25.4 * 16);
  const whole = Math.floor(s16 / 16); let n = s16 % 16, d = 16;
  while (n && n % 2 === 0) { n /= 2; d /= 2; }
  return (n ? (whole ? whole + ' ' : '') + n + '/' + d : String(whole)) + '"';
}
const mm = v => v.toFixed(1) + ' mm';

function svgPreview(s) {
  const C = s.circ, H = s.depth + 30, N = 240;
  const pts = [];
  for (let k = 0; k <= N; k++) { const phi = 2 * Math.PI * k / N; pts.push(`${(phi / (2 * Math.PI) * C).toFixed(1)},${s.ord(phi).toFixed(1)}`); }
  const st = [];
  for (let i = 0; i <= 16; i++) { const phi = 2 * Math.PI * i / 16, x = (C * i / 16).toFixed(1); st.push(`<line x1="${x}" y1="${s.ord(phi).toFixed(1)}" x2="${x}" y2="${H.toFixed(1)}"/>`); }
  return `<svg viewBox="-4 -4 ${(C + 8).toFixed(1)} ${(H + 8).toFixed(1)}" role="img" aria-label="Saddle template outline">
<rect x="0" y="0" width="${C.toFixed(1)}" height="${H.toFixed(1)}" fill="#fff"/>
<g stroke="#b9c4cf" stroke-width="${(C / 600).toFixed(2)}">${st.join('')}</g>
<polyline points="${pts.join(' ')}" fill="none" stroke="#d1341f" stroke-width="${(C / 250).toFixed(2)}"/>
<line x1="0" y1="${H.toFixed(1)}" x2="${C.toFixed(1)}" y2="${H.toFixed(1)}" stroke="#142235" stroke-width="${(C / 400).toFixed(2)}"/>
</svg>`;
}

const CSS = `
  :root { --ink:#142235; --muted:#5d6d80; --line:#dce6ef; --paper:#f5f8fb; --surface:#fff; --blue:#0d6f94; --blue-ink:#fff; }
  @media (prefers-color-scheme: dark) { :root { --ink:#e6edf5; --muted:#9aabbd; --line:#2a3a4c; --paper:#0f1720; --surface:#17222e; --blue:#3fb2d9; --blue-ink:#06202b; } }
  * { box-sizing: border-box; }
  body { margin:0; color:var(--ink); background:var(--paper); font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; line-height:1.6; }
  a { color:var(--blue); }
  .wrap { width:min(980px, calc(100% - 32px)); margin:0 auto; }
  nav.crumb { font-size:14px; padding:16px 0 4px; color:var(--muted); }
  h1 { font-size:clamp(24px,4vw,36px); line-height:1.2; margin:6px 0 10px; }
  .lead { color:var(--muted); font-size:17px; margin:0 0 18px; }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:18px; margin-bottom:18px; }
  .cta { display:inline-block; background:var(--blue); color:var(--blue-ink); font-weight:800; padding:12px 20px; border-radius:11px; text-decoration:none; font-size:17px; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin:0 0 14px; }
  .stat { border:1px solid var(--line); border-radius:10px; padding:9px 11px; }
  .stat b { display:block; font-size:19px; }
  .stat span { color:var(--muted); font-size:13px; }
  svg { width:100%; height:auto; display:block; border:1px solid var(--line); border-radius:10px; background:#fff; }
  .tablewrap { overflow-x:auto; }
  table { border-collapse:collapse; width:100%; font-size:14px; font-variant-numeric:tabular-nums; }
  th, td { border-bottom:1px solid var(--line); padding:5px 8px; text-align:right; white-space:nowrap; }
  th:first-child, td:first-child { text-align:left; }
  th { color:var(--muted); }
  h2 { font-size:21px; margin:0 0 10px; }
  .links { display:flex; flex-wrap:wrap; gap:6px 16px; font-size:14px; }
  .apps { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
  .apps p { margin:4px 0 8px; color:var(--muted); font-size:14px; }
  footer { color:var(--muted); font-size:14px; padding:20px 0 40px; }
`;

function sizePage(bN, rN) {
  const [bL, , bOd] = pipe(bN), [rL, , rOd] = pipe(rN);
  const s = saddle(rOd, bOd);
  const url = `${ORIGIN}${BASE}${slug(bN, rN)}/`;
  const gen = `${BASE}?run=${encodeURIComponent(rL)}&branch=${encodeURIComponent(bL)}&div=16`;
  const title = `${bL} on ${rL} Pipe Saddle Template – Printable Fishmouth PDF`;
  const desc = `Full-size saddle (fishmouth) cutting template for a ${words(bL)} branch on a ${words(rL)} header pipe. Depth ${mm(s.depth)} (${inch(s.depth)}), wrap ${mm(s.circ)} (${inch(s.circ)}). Free printable PDF and 16-point layout table.`;
  const rows = [];
  for (let i = 0; i <= 16; i++) {
    const phi = 2 * Math.PI * i / 16, o = s.ord(phi), a = s.circ * i / 16;
    rows.push(`<tr><td>${i + 1}</td><td>${+(i * 22.5).toFixed(1)}°</td><td>${mm(a)}</td><td>${inch(a)}</td><td>${mm(o)}</td><td>${inch(o)}</td></tr>`);
  }
  const sameRun = BRANCHES.filter(b => b <= rN && b !== bN).map(b => `<a href="${BASE}${slug(b, rN)}/">${pipe(b)[0]} on ${rL}</a>`);
  const sameBr = RUNS.filter(r => r >= bN && r !== rN).map(r => `<a href="${BASE}${slug(bN, r)}/">${bL} on ${pipe(r)[0]}</a>`);
  const ld = {
    '@context': 'https://schema.org', '@type': 'HowTo', name: `How to cut a ${words(bL)} pipe saddle for a ${words(rL)} header`,
    description: desc, tool: [{ '@type': 'HowToTool', name: 'Printed saddle template' }, { '@type': 'HowToTool', name: 'Soapstone or paint marker' }],
    step: [
      { '@type': 'HowToStep', text: 'Download the full-size PDF and print it at 100% (actual size). Check the 100 mm scale bar.' },
      { '@type': 'HowToStep', text: `Wrap the template around the ${words(bL)} branch pipe with the straight edge square to the pipe.` },
      { '@type': 'HowToStep', text: 'Point the SIDE (horn) marks to the sides of the header and trace the cut line.' },
      { '@type': 'HowToStep', text: 'Cut along the line and grind to fit before welding.' },
    ],
  };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://gua091016.github.io/pipe-saddle-template/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${CSS}</style>
<script src="/ga.js" defer></script>
</head>
<body>
<div class="wrap">
  <nav class="crumb"><a href="/">KOREAFITTER</a> › <a href="${BASE}">Pipe Saddle Template Generator</a> › ${esc(bL)} on ${esc(rL)}</nav>
  <h1>${esc(bL)} on ${esc(rL)} Pipe Saddle Template</h1>
  <p class="lead">Fishmouth cut for a <b>${esc(bL)} branch</b> (OD ${bOd.toFixed(1)} mm) on a <b>${esc(rL)} header</b> (OD ${rOd.toFixed(1)} mm) at 90°. Print the full-size template, wrap it on the branch and cut — or lay it out by hand with the table below.</p>

  <div class="card">
    <div class="stats">
      <div class="stat"><b>${mm(s.depth)}</b><span>Saddle depth · ${inch(s.depth)}</span></div>
      <div class="stat"><b>${mm(s.circ)}</b><span>Wrap length · ${inch(s.circ)}</span></div>
      <div class="stat"><b>${mm(s.circ / 16)}</b><span>16-point spacing · ${inch(s.circ / 16)}</span></div>
    </div>
    ${svgPreview(s)}
    <p style="margin:16px 0 0"><a class="cta" href="${gen}">Download the full-size PDF →</a></p>
  </div>

  <div class="card">
    <h2>16-point layout table</h2>
    <p class="lead" style="font-size:15px">Divide the branch circumference into 16 equal parts starting at a RUN AXIS line (0°). At each point, measure the drop from the horn tip line. 90° and 270° are the horns (sides of the header); 0° and 180° are the crotch (along the header).</p>
    <div class="tablewrap"><table>
      <tr><th>#</th><th>Angle</th><th>Around (mm)</th><th>Around (in)</th><th>Drop (mm)</th><th>Drop (in)</th></tr>
      ${rows.join('\n      ')}
    </table></div>
  </div>

  <div class="card apps">
    <div>
      <h2>Dummy Support Calculator</h2>
      <p>Elbow trunnions, beam dummies, elbow miter cuts and dummy-leg cut lengths from center height. Android, made by a working pipefitter.</p>
      <a href="${DUMMY_APP}" target="_blank" rel="noopener">Get it on Google Play →</a>
    </div>
    <div>
      <h2>Pipe ISO Calculator</h2>
      <p>ISO sketch to CL/CUT cut list, 2D offsets, parallel runs and elbow miter — with PDF/DXF export.</p>
      <a href="${ISO_APP}" target="_blank" rel="noopener">Get it on Google Play →</a>
    </div>
  </div>

  <div class="card">
    <h2>Other branch sizes on ${esc(rL)}</h2>
    <div class="links">${sameRun.join('')}</div>
    <h2 style="margin-top:16px">${esc(bL)} branch on other headers</h2>
    <div class="links">${sameBr.join('')}</div>
  </div>

  <footer>Outside-diameter layout per ASME B36.10. Always check the fit before welding. · <a href="${BASE}">Make a template for any size</a></footer>
</div>
</body>
</html>
`;
}

// ── 1) 규격별 페이지 ──
const combos = [];
for (const r of RUNS) for (const b of BRANCHES) if (b <= r) combos.push([b, r]);
for (const [b, r] of combos) {
  const dir = path.join(TOOL, slug(b, r));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), sizePage(b, r));
}

// ── 2) 생성기 페이지에 규격 링크 목록 주입 ──
let main = fs.readFileSync(path.join(TOOL, 'index.html'), 'utf8');
const list = RUNS.map(r => `<h3>${pipe(r)[0]} header</h3>` + BRANCHES.filter(b => b <= r)
  .map(b => `<a href="${BASE}${slug(b, r)}/">${pipe(b)[0]} on ${pipe(r)[0]}</a>`).join('')).join('\n');
main = main.replace(/<!--SIZES-->[\s\S]*?<!--\/SIZES-->/, `<!--SIZES--><div class="sizes">\n${list}\n</div><!--/SIZES-->`);
fs.writeFileSync(path.join(TOOL, 'index.html'), main);

// ── 3) 한국어 정적 버전 ──
const koSrc = main.match(/\n  ko: (\{[\s\S]*?\n  \}),\n\};/);
if (!koSrc) throw new Error('T.ko 를 못 찾음');
const KO = Function(`return ${koSrc[1]}`)();
const EN_TEXT = {};
let ko = main.replace(/(<[^>]*data-i18n="([^"]+)"[^>]*>)([^<]*)(<)/g, (m, open, key, text, close) => {
  EN_TEXT[key] = text;
  return KO[key] ? open + esc(KO[key]).replace(/&quot;/g, '"') + close : m;
});
const koUrl = `${ORIGIN}${BASE}ko/`;
ko = ko
  .replace('<html lang="en">', '<html lang="ko">')
  .replace(/<title>[^<]*<\/title>/, '<title>파이프 새들 템플릿 생성기 – 새들 전개도 실물 크기 PDF 무료 출력</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="주관·가지관 규격만 고르면 새들(피시마우스, 가지관 따내기) 전개도를 실제 크기 PDF로 무료 출력합니다. 1/2&quot;~24&quot;, mm·인치, 등분 전개 치수표 제공. 출력해서 파이프에 감고 그어서 자르면 끝.">')
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${koUrl}">`)
  .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="파이프 새들 템플릿 생성기 – 실물 크기 PDF">')
  .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="주관·가지관 규격 선택 → 실제 크기 새들 전개도 PDF 출력 → 파이프에 감고 절단. 무료, 가입 없음.">')
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${koUrl}">`)
  .replace('<script>\n// ───', `<script>window.FORCE_LANG = 'ko'; window.EN_TEXT = ${JSON.stringify(EN_TEXT)};</script>\n<script>\n// ───`);
fs.mkdirSync(path.join(TOOL, 'ko'), { recursive: true });
fs.writeFileSync(path.join(TOOL, 'ko', 'index.html'), ko);

// ── 4) sitemap.xml / robots.txt ──
const pages = [];
const walk = dir => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name.startsWith('.') || f.name.startsWith('_')) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f.name)) pages.push(p);
  }
};
walk(ROOT);
const urls = pages.map(p => {
  let u = '/' + path.relative(ROOT, p).split(path.sep).join('/');
  u = u.replace(/index\.html$/, '');
  const pri = u === '/' ? '1.0' : u === BASE ? '0.9' : /privacy|terms/.test(u) ? '0.2' : u.startsWith(BASE) ? '0.6' : '0.7';
  return `  <url><loc>${ORIGIN}${u}</loc><lastmod>${TODAY}</lastmod><priority>${pri}</priority></url>`;
}).sort();
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

console.log(`size pages: ${combos.length}, sitemap urls: ${urls.length}, ko keys: ${Object.keys(EN_TEXT).length}`);
