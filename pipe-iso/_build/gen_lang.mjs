// Generates static localized landing pages for the Pipe ISO app: pipe-iso/<lang>/index.html
// Style is copied from pipe-iso/ja/index.html so the design stays identical.
// Run from repo root: node pipe-iso/_build/gen_lang.mjs
import fs from 'node:fs';

const ROOT = 'https://gua091016.github.io/pipe-iso/';
const PKG = 'com.gua091016.pipecuttingcalculator';
const ja = fs.readFileSync('pipe-iso/ja/index.html', 'utf8');
const style = ja.slice(ja.indexOf('<style>'), ja.indexOf('</style>') + 8);

const LANGS = ['en', 'es', 'pt', 'de', 'fr', 'id'];
const alt = () =>
  [...LANGS, 'ja'].map(l => `  <link rel="alternate" hreflang="${l}" href="${ROOT}${l}/">`).join('\n') +
  `\n  <link rel="alternate" hreflang="ko" href="${ROOT}">\n  <link rel="alternate" hreflang="x-default" href="${ROOT}">`;

const T = {
  en: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    title: 'Piping Isometric App for Pipe Fitters | Cut Length & Offset Calculator',
    desc: 'Draw a piping isometric on your phone, enter centerline (CL) dimensions and get the cut length of every pipe with elbow, tee and flange take-offs subtracted. Rolling offset, parallel offset, elbow miter, PDF and DXF export. mm or ft-in.',
    ogTitle: 'Piping isometric & pipe cut length calculator for pipe fitters',
    nav: ['Features', 'How it works', 'Download'],
    eyebrow: 'For pipe fitters, fabricators and piping supervisors',
    h1: 'Sketch the piping isometric,<br>get every pipe cut length',
    lead: 'Pipe ISO Calculator is a pipe fitter app for site and shop work: draw the line on an isometric grid, enter the CL dimensions, and the fitting take-offs are subtracted to give the CUT length of each pipe. It also covers 45° and rolling offsets, parallel pipe offsets and elbow miter cuts.',
    play: 'Get it on Google Play', top: 'Korean page',
    visual: 'ISO sketch, cut list and field calculators in one app',
    fh: 'Main features',
    f: [
      ['Pipe cut length (CUT)', 'Enter CL dimensions and get CUT lengths with ASME B16.9 butt-weld and B16.11 socket-weld/threaded take-offs, up to 24".'],
      ['Piping isometric sketch', 'Draw on an ISO grid, add elbows, tees, reducers, flanges, valves and olets, and check welds and the final cut list.'],
      ['Offsets and miters', '45°, rolling and 90°+45° offsets, parallel pipe offsets for 2–4 pipes, and elbow miter cutting.'],
    ],
    ah: 'Free and Pro',
    a: [
      ['Free', 'Elbow miter, 2D offsets and PDF/DXF export can each be used 5 times a week. Drawing and editing sketches and viewing the fitting table never use a credit.'],
      ['Pro', 'Removes the weekly limit. The available plans and local prices are shown in Google Play when you upgrade. No ads.'],
    ],
    note: 'Credits reset every Monday at 00:00 local time. Free PDFs have no watermark.',
    uh: 'Where it helps',
    u: [
      'Working out take-offs by hand on a crowded site is slow and easy to get wrong. Draw the line once, and the app keeps every CL and CUT dimension together.',
      'Share the sketch and cut list as a PDF with the shop, foreman or client, or export DXF to open the drawing in CAD. Units can be mm or feet-inch with 1/16" fractions.',
    ],
    kw: 'Search terms: pipe fitter calculator, piping isometric app, pipe cut length calculator, pipe offset calculator, rolling offset calculator',
    nh: 'Note',
    n: 'This app supports field checks. Always follow the approved drawings, specifications, applicable codes, manufacturer data and your supervisor before fabrication and welding.',
    priv: 'Privacy Policy', ui: 'App language: English (also available in 12 other languages).',
  },
  es: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    title: 'App de isométrico de tuberías | Calculadora de corte y offset para tuberos',
    desc: 'Dibuja el isométrico de tubería en el celular, ingresa las cotas a centro (CL) y obtén la longitud de corte de cada tubo con el descuento de codos, tees y bridas. Offset rodado, offset de tubos paralelos, codo gajo, PDF y DXF. mm o pies-pulgadas.',
    ogTitle: 'Isométrico de tuberías y calculadora de corte para tuberos',
    nav: ['Funciones', 'Cómo funciona', 'Descargar'],
    eyebrow: 'Para tuberos, pailería y supervisores de tubería',
    h1: 'Dibuja el isométrico de tubería<br>y obtén cada corte',
    lead: 'Pipe ISO Calculator es una app para tuberos en obra y taller: dibuja la línea en una cuadrícula isométrica, ingresa las cotas a centro (CL) y la app descuenta los accesorios para darte la longitud de corte (CUT) de cada tubo. También calcula offset a 45°, offset rodado, offset de tubos paralelos y cortes de codo gajo.',
    play: 'Ver en Google Play', top: 'Página en coreano',
    visual: 'Isométrico, lista de corte y cálculos de obra en una sola app',
    fh: 'Funciones principales',
    f: [
      ['Longitud de corte (CUT)', 'Ingresa las cotas CL y obtén el corte con los descuentos de accesorios ASME B16.9 a tope y B16.11 socket weld/roscados, hasta 24".'],
      ['Isométrico de tubería', 'Dibuja en la cuadrícula ISO, agrega codos, tees, reducciones, bridas, válvulas y olets, y revisa soldaduras y la lista de corte.'],
      ['Offsets y codo gajo', 'Offset a 45°, rodado y 90°+45°, offset de 2 a 4 tubos paralelos y corte de codo gajo (miter).'],
    ],
    ah: 'Gratis y Pro',
    a: [
      ['Gratis', 'El codo gajo, los offsets 2D y la exportación PDF/DXF se pueden usar 5 veces por semana cada uno. Dibujar, editar isométricos y ver la tabla de accesorios no consume usos.'],
      ['Pro', 'Quita el límite semanal. Los planes disponibles y el precio local se muestran en Google Play al mejorar. Sin anuncios.'],
    ],
    note: 'Los usos se reinician cada lunes a las 00:00 hora local. Los PDF gratuitos no llevan marca de agua.',
    uh: 'Dónde ayuda',
    u: [
      'Calcular descuentos a mano en obra toma tiempo y es fácil equivocarse. Dibuja la línea una vez y la app mantiene juntas todas las cotas CL y CUT.',
      'Comparte el isométrico y la lista de corte en PDF con el taller, el encargado o el cliente, o exporta DXF para abrirlo en CAD. Unidades en mm o pies-pulgadas con fracciones de 1/16".',
    ],
    kw: 'Búsquedas: app isométrico de tuberías, calculadora de tubería, calculadora para tubero, longitud de corte de tubo, calculadora de offset de tubería',
    nh: 'Aviso',
    n: 'La app ayuda a revisar en obra. Antes de fabricar y soldar, sigue siempre los planos aprobados, especificaciones, normas aplicables, datos del fabricante y a tu supervisor.',
    priv: 'Política de privacidad', ui: 'Idioma de la app: español.',
  },
  pt: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    title: 'App de isométrico de tubulação | Calculadora de corte e offset para encanador industrial',
    desc: 'Desenhe o isométrico de tubulação no celular, informe as cotas de centro (CL) e obtenha o comprimento de corte de cada tubo já descontando curvas, tês e flanges. Offset rolado, tubos paralelos, gomos de curva, PDF e DXF. mm ou pé-polegada.',
    ogTitle: 'Isométrico de tubulação e calculadora de corte de tubos',
    nav: ['Funções', 'Como funciona', 'Baixar'],
    eyebrow: 'Para encanadores industriais, caldeiraria e supervisores de tubulação',
    h1: 'Desenhe o isométrico de tubulação<br>e tenha cada corte',
    lead: 'Pipe ISO Calculator é um app para encanador industrial em obra e oficina: desenhe a linha numa grade isométrica, informe as cotas de centro (CL) e o app desconta as conexões para dar o comprimento de corte (CUT) de cada tubo. Também calcula offset de 45°, offset rolado, offset de tubos paralelos e corte de curva em gomos.',
    play: 'Ver no Google Play', top: 'Página em coreano',
    visual: 'Isométrico, lista de corte e cálculos de obra em um só app',
    fh: 'Principais funções',
    f: [
      ['Comprimento de corte (CUT)', 'Informe as cotas CL e obtenha o corte com descontos de conexões ASME B16.9 de topo e B16.11 encaixe/rosca, até 24".'],
      ['Isométrico de tubulação', 'Desenhe na grade ISO, inclua curvas, tês, reduções, flanges, válvulas e olets e confira soldas e a lista de corte.'],
      ['Offsets e gomos', 'Offset de 45°, rolado e 90°+45°, offset de 2 a 4 tubos paralelos e corte de curva em gomos.'],
    ],
    ah: 'Grátis e Pro',
    a: [
      ['Grátis', 'Curva em gomos, offsets 2D e exportação PDF/DXF podem ser usados 5 vezes por semana cada. Desenhar, editar isométricos e consultar a tabela de conexões não gasta usos.'],
      ['Pro', 'Remove o limite semanal. Os planos disponíveis e o preço local aparecem no Google Play ao assinar ou comprar. Sem anúncios.'],
    ],
    note: 'Os usos reiniciam toda segunda-feira às 00:00 no horário local. PDFs gratuitos não têm marca d’água.',
    uh: 'Onde ajuda',
    u: [
      'Calcular descontos à mão na obra é lento e fácil de errar. Desenhe a linha uma vez e o app mantém todas as cotas CL e CUT juntas.',
      'Compartilhe o isométrico e a lista de corte em PDF com a oficina, o encarregado ou o cliente, ou exporte DXF para abrir no CAD. Unidades em mm ou pé-polegada com frações de 1/16".',
    ],
    kw: 'Buscas: app isométrico de tubulação, calculadora de tubulação, calculadora de corte de tubo, offset de tubulação, encanador industrial',
    nh: 'Aviso',
    n: 'O app ajuda na conferência em campo. Antes de fabricar e soldar, siga sempre os desenhos aprovados, especificações, normas aplicáveis, dados do fabricante e seu supervisor.',
    priv: 'Política de privacidade', ui: 'Idioma do app: português.',
  },
  de: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    title: 'Rohrleitungs-Isometrie App | Zuschnitt- und Versatz-Rechner für Rohrschlosser',
    desc: 'Rohrleitungs-Isometrie auf dem Handy skizzieren, Mittenmaße (CL) eingeben und die Zuschnittlänge jedes Rohrs mit abgezogenen Bogen-, T-Stück- und Flanschmaßen erhalten. Raumversatz, Parallelversatz, Segmentbogen, PDF und DXF. mm oder Fuß-Zoll.',
    ogTitle: 'Rohrleitungs-Isometrie und Zuschnitt-Rechner für Rohrschlosser',
    nav: ['Funktionen', 'So funktioniert es', 'Download'],
    eyebrow: 'Für Rohrschlosser, Rohrleitungsbauer und Bauleiter',
    h1: 'Rohrleitungs-Isometrie skizzieren,<br>jeden Zuschnitt erhalten',
    lead: 'Pipe ISO Calculator ist eine App für Rohrschlosser auf der Baustelle und in der Werkstatt: Leitung auf dem Isometrie-Raster zeichnen, Mittenmaße (CL) eingeben, und die Formstückmaße werden abgezogen – Sie erhalten die Zuschnittlänge (CUT) jedes Rohrs. Dazu 45°-Versatz, Raumversatz, Parallelversatz und Segmentbogen-Zuschnitt.',
    play: 'Bei Google Play ansehen', top: 'Koreanische Seite',
    visual: 'Isometrie, Zuschnittliste und Baustellenrechner in einer App',
    fh: 'Hauptfunktionen',
    f: [
      ['Zuschnittlänge (CUT)', 'CL-Maße eingeben und Zuschnitte mit Abzügen für ASME B16.9 (Stumpfschweißen) und B16.11 (Muffe/Gewinde) bis 24" erhalten.'],
      ['Rohrleitungs-Isometrie', 'Auf dem ISO-Raster zeichnen, Bögen, T-Stücke, Reduzierungen, Flansche, Armaturen und Olets einfügen, Schweißnähte und Zuschnittliste prüfen.'],
      ['Versatz und Segmentbogen', '45°-, Raum- und 90°+45°-Versatz, Parallelversatz für 2–4 Rohre und Segmentbogen-Zuschnitt.'],
    ],
    ah: 'Kostenlos und Pro',
    a: [
      ['Kostenlos', 'Segmentbogen, 2D-Versatz und PDF/DXF-Export je 5-mal pro Woche. Skizzieren, Bearbeiten und die Formstücktabelle verbrauchen keine Nutzung.'],
      ['Pro', 'Hebt das Wochenlimit auf. Verfügbare Optionen und lokale Preise zeigt Google Play beim Upgrade. Keine Werbung.'],
    ],
    note: 'Die Nutzungen werden jeden Montag um 00:00 Uhr Ortszeit zurückgesetzt. Kostenlose PDFs ohne Wasserzeichen.',
    uh: 'Wobei es hilft',
    u: [
      'Abzüge auf der Baustelle von Hand zu rechnen dauert und führt leicht zu Fehlern. Einmal die Leitung zeichnen – alle CL- und CUT-Maße bleiben zusammen.',
      'Skizze und Zuschnittliste als PDF an Werkstatt, Vorarbeiter oder Kunden senden oder als DXF im CAD öffnen. Einheiten in mm oder Fuß-Zoll mit 1/16"-Brüchen.',
    ],
    kw: 'Suchbegriffe: Rohrleitung Isometrie App, Rohrleitung Rechner, Rohr Zuschnitt berechnen, Rohrversatz berechnen, Rohrschlosser App',
    nh: 'Hinweis',
    n: 'Die App unterstützt die Prüfung vor Ort. Vor Fertigung und Schweißen gelten stets freigegebene Zeichnungen, Spezifikationen, Normen, Herstellerangaben und die Bauleitung.',
    priv: 'Datenschutz', ui: 'App-Sprache: Deutsch.',
  },
  fr: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    title: 'Application isométrique tuyauterie | Calcul de coupe et décalage pour tuyauteur',
    desc: 'Dessinez l’isométrique de tuyauterie sur le téléphone, saisissez les cotes d’axe (CL) et obtenez la longueur de coupe de chaque tube, coudes, tés et brides déduits. Décalage tournant, tubes parallèles, coude à segments, PDF et DXF. mm ou pied-pouce.',
    ogTitle: 'Isométrique tuyauterie et calcul de coupe pour tuyauteurs',
    nav: ['Fonctions', 'Fonctionnement', 'Télécharger'],
    eyebrow: 'Pour tuyauteurs, chaudronniers et chefs de chantier tuyauterie',
    h1: 'Dessinez l’isométrique de tuyauterie,<br>obtenez chaque coupe',
    lead: 'Pipe ISO Calculator est une application pour tuyauteurs sur chantier et en atelier : tracez la ligne sur une grille isométrique, saisissez les cotes d’axe (CL), et les longueurs des raccords sont déduites pour donner la longueur de coupe (CUT) de chaque tube. Elle calcule aussi les décalages à 45°, tournants, de tubes parallèles et les coudes à segments.',
    play: 'Voir sur Google Play', top: 'Page en coréen',
    visual: 'Isométrique, liste de coupe et calculs de chantier dans une seule app',
    fh: 'Fonctions principales',
    f: [
      ['Longueur de coupe (CUT)', 'Saisissez les cotes CL et obtenez les coupes avec déduction des raccords ASME B16.9 bout à bout et B16.11 à emboîter/filetés, jusqu’à 24".'],
      ['Isométrique de tuyauterie', 'Tracez sur la grille ISO, ajoutez coudes, tés, réductions, brides, vannes et olets, puis vérifiez soudures et liste de coupe.'],
      ['Décalages et coudes à segments', 'Décalage 45°, tournant et 90°+45°, décalage de 2 à 4 tubes parallèles et coupe de coude à segments.'],
    ],
    ah: 'Gratuit et Pro',
    a: [
      ['Gratuit', 'Coude à segments, décalages 2D et export PDF/DXF : 5 fois par semaine chacun. Dessiner, modifier un isométrique et consulter le tableau des raccords ne consomment rien.'],
      ['Pro', 'Supprime la limite hebdomadaire. Les offres disponibles et le prix local s’affichent dans Google Play. Sans publicité.'],
    ],
    note: 'Les utilisations sont remises à zéro chaque lundi à 00:00, heure locale. Les PDF gratuits sont sans filigrane.',
    uh: 'Où elle aide',
    u: [
      'Calculer les déductions à la main sur chantier prend du temps et provoque des erreurs. Tracez la ligne une fois : toutes les cotes CL et CUT restent ensemble.',
      'Partagez l’isométrique et la liste de coupe en PDF avec l’atelier, le chef d’équipe ou le client, ou exportez en DXF pour la CAO. Unités en mm ou pied-pouce avec fractions de 1/16".',
    ],
    kw: 'Recherches : application isométrique tuyauterie, calcul tuyauterie, calcul longueur de coupe tube, calcul décalage tuyauterie, appli tuyauteur',
    nh: 'Remarque',
    n: 'L’application aide aux vérifications sur chantier. Avant fabrication et soudage, suivez toujours les plans approuvés, spécifications, normes, données fabricant et votre responsable.',
    priv: 'Politique de confidentialité', ui: 'Langue de l’app : français.',
  },
  id: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    title: 'Aplikasi Isometrik Pipa untuk Fitter | Kalkulator Potong & Offset Pipa',
    desc: 'Gambar isometrik pipa di HP, masukkan ukuran center (CL), lalu dapatkan panjang potong setiap pipa yang sudah dikurangi elbow, tee dan flange. Rolling offset, offset pipa paralel, elbow miter, PDF dan DXF. mm atau feet-inch.',
    ogTitle: 'Isometrik pipa dan kalkulator panjang potong untuk pipe fitter',
    nav: ['Fitur', 'Cara kerja', 'Unduh'],
    eyebrow: 'Untuk pipe fitter, fabrikasi dan supervisor piping',
    h1: 'Gambar isometrik pipa,<br>dapatkan setiap panjang potong',
    lead: 'Pipe ISO Calculator adalah aplikasi untuk pipe fitter di lapangan dan workshop: gambar jalur pada grid isometrik, masukkan ukuran center (CL), dan ukuran fitting dikurangi otomatis sehingga panjang potong (CUT) tiap pipa langsung keluar. Juga menghitung offset 45°, rolling offset, offset pipa paralel dan potongan elbow miter.',
    play: 'Lihat di Google Play', top: 'Halaman Korea',
    visual: 'Isometrik, cut list dan kalkulator lapangan dalam satu aplikasi',
    fh: 'Fitur utama',
    f: [
      ['Panjang potong (CUT)', 'Masukkan ukuran CL dan dapatkan panjang potong dengan pengurangan fitting ASME B16.9 butt weld dan B16.11 socket weld/ulir, hingga 24".'],
      ['Isometrik pipa', 'Gambar di grid ISO, tambahkan elbow, tee, reducer, flange, valve dan olet, lalu cek titik las dan cut list.'],
      ['Offset dan miter', 'Offset 45°, rolling dan 90°+45°, offset 2–4 pipa paralel, dan potongan elbow miter.'],
    ],
    ah: 'Gratis dan Pro',
    a: [
      ['Gratis', 'Elbow miter, offset 2D dan ekspor PDF/DXF masing-masing 5 kali per minggu. Menggambar, mengedit isometrik dan melihat tabel fitting tidak mengurangi kuota.'],
      ['Pro', 'Menghapus batas mingguan. Pilihan paket dan harga lokal ditampilkan di Google Play. Tanpa iklan.'],
    ],
    note: 'Kuota direset setiap Senin pukul 00:00 waktu setempat. PDF gratis tanpa watermark.',
    uh: 'Kapan berguna',
    u: [
      'Menghitung pengurangan fitting secara manual di lapangan lambat dan rawan salah. Gambar jalurnya sekali, semua ukuran CL dan CUT tersimpan bersama.',
      'Bagikan isometrik dan cut list sebagai PDF ke workshop, mandor atau klien, atau ekspor DXF untuk dibuka di CAD. Satuan mm atau feet-inch dengan pecahan 1/16".',
    ],
    kw: 'Kata kunci: aplikasi isometrik pipa, kalkulator pipa, kalkulator pipe fitter, panjang potong pipa, offset pipa',
    nh: 'Catatan',
    n: 'Aplikasi ini membantu pengecekan di lapangan. Sebelum fabrikasi dan pengelasan, selalu ikuti gambar yang disetujui, spesifikasi, standar, data pabrikan dan supervisor Anda.',
    priv: 'Kebijakan Privasi', ui: 'Bahasa aplikasi: Bahasa Indonesia.',
  },
};

for (const l of LANGS) {
  const t = T[l];
  const url = `${ROOT}${l}/`;
  const play = `https://play.google.com/store/apps/details?id=${PKG}&amp;hl=${l}&amp;referrer=utm_source%3Dsite_${l}`;
  const css = style.replace(/font-family:[^;]*;/, `font-family: ${t.font};`).replace('</style>', `    .hero > div { min-width: 0; }
    .app-visual img { max-width: 100%; }
    h1 { overflow-wrap: anywhere; }
    footer a { margin: 0 2px; }
  </style>`);
  const html = `<!DOCTYPE html>
<html lang="${l}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <meta name="description" content="${t.desc}">
  <link rel="canonical" href="${url}">
${alt()}
  <meta property="og:title" content="${t.ogTitle}">
  <meta property="og:description" content="${t.desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ROOT}assets/app-${l}.jpg">
  ${css}
  <script type="application/ld+json">
  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Pipe ISO Calculator', operatingSystem: 'Android', applicationCategory: 'UtilitiesApplication', inLanguage: l, description: t.desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url, downloadUrl: `https://play.google.com/store/apps/details?id=${PKG}` })}
  </script>
  <script src="/ga.js" defer></script>
</head>
<body>
  <header>
    <nav class="nav">
      <div class="brand">
        <span class="logo-mark">ISO</span>
        <span>Pipe ISO Calculator</span>
      </div>
      <div class="nav-links">
        <a href="#features">${t.nav[0]}</a>
        <a href="#use">${t.nav[1]}</a>
        <a href="#download">${t.nav[2]}</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">${t.eyebrow}</p>
        <h1>${t.h1}</h1>
        <p class="lead">${t.lead}</p>
        <div class="actions" id="download">
          <a class="button primary" href="${play}">${t.play}</a>
          <a class="button" href="../">${t.top}</a>
        </div>
      </div>
      <div class="app-visual">
        <img src="../assets/app-${l}.jpg" alt="Pipe ISO Calculator app screen" width="540" height="960" style="width:100%;height:auto;border-radius:8px">
        <p>${t.visual}</p>
      </div>
    </section>

    <section id="features">
      <h2>${t.fh}</h2>
      <div class="grid">
${t.f.map(([h, p]) => `        <div class="card">\n          <h3>${h}</h3>\n          <p>${p}</p>\n        </div>`).join('\n')}
      </div>
    </section>

    <section id="access">
      <h2>${t.ah}</h2>
      <div class="article">
${t.a.map(([h, p]) => `        <div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('\n')}
      </div>
      <p>${t.note} ${t.ui}</p>
    </section>

    <section id="use">
      <h2>${t.uh}</h2>
      <div class="article">
        <div>
${t.u.map(p => `          <p>${p}</p>`).join('\n')}
        </div>
        <div class="keyword-box">
          <p>${t.kw}</p>
        </div>
      </div>
    </section>

    <section>
      <h2>${t.nh}</h2>
      <div class="card">
        <p>${t.n}</p>
      </div>
    </section>
  </main>

  <footer>
    <div class="inner">
      <span>© 2026 Koreafitter. Pipe ISO Calculator.</span>
      <span>${[...LANGS, 'ja'].map(x => `<a href="../${x}/">${x.toUpperCase()}</a>`).join(' · ')} · <a href="../">KO</a></span>
      <a href="../privacy.html">${t.priv}</a>
    </div>
  </footer>
</body>
</html>
`;
  fs.mkdirSync(`pipe-iso/${l}`, { recursive: true });
  fs.writeFileSync(`pipe-iso/${l}/index.html`, html.replace(/\r?\n/g, '\r\n'));
  console.log(l, html.length);
}
