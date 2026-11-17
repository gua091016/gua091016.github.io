// 사이트 공통 방문 집계 (GA4 속성 "gua091016.github.io 웹사이트")
// 페이지 조회 + Play 링크 클릭(play_click). PDF 다운로드는 생성기에서 pdf_download 이벤트를 직접 보냄.
(function () {
  if (window.__koreafitterAnalyticsLoaded) return;
  window.__koreafitterAnalyticsLoaded = true;
  var ID = 'G-MB5S3903VW';
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID);
  // Preserve existing source tags while identifying the page behind an install.
  document.querySelectorAll('a[href*="play.google.com/store/apps/details"]').forEach(function (a) {
    var target = new URL(a.href, location.href);
    if (target.hostname !== 'play.google.com' || target.pathname !== '/store/apps/details' ||
        target.searchParams.get('id') !== 'com.gua091016.pipecuttingcalculator') return;
    var referrer = new URLSearchParams(target.searchParams.get('referrer') || '');
    if (!referrer.has('utm_source')) referrer.set('utm_source', 'koreafitter_website');
    if (!referrer.has('utm_medium')) referrer.set('utm_medium', 'referral');
    if (!referrer.has('utm_campaign')) referrer.set('utm_campaign', 'pipe_iso_website');
    if (!referrer.has('utm_content')) referrer.set('utm_content', location.pathname);
    target.searchParams.set('referrer', referrer.toString());
    a.href = target.href;
  });
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="play.google.com"]') : null;
    if (!a) return;
    var target = new URL(a.href, location.href);
    if (target.hostname !== 'play.google.com' || target.pathname !== '/store/apps/details') return;
    var appId = target.searchParams.get('id');
    if (!appId) return;
    gtag('event', 'play_click', {
      app_id: appId,
      page_path: location.pathname,
      transport_type: 'beacon'
    });
  }, true);
})();
