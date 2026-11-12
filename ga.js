// 사이트 공통 방문 집계 (GA4 속성 "gua091016.github.io 웹사이트")
// 페이지 조회 + Play 링크 클릭(play_click). PDF 다운로드는 생성기에서 pdf_download 이벤트를 직접 보냄.
(function () {
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
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="play.google.com"]') : null;
    if (!a) return;
    var m = a.href.match(/[?&]id=([\w.]+)/);
    gtag('event', 'play_click', { app_id: m ? m[1] : '', page_path: location.pathname });
  }, true);
})();
