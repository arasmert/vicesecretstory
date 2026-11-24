// Vice Secret Story v2 — tıklayınca yüklenen YouTube gömme, arşiv araması/filtresi, çerez tercihi
(function () {
  function oynat(el) {
    var id = el.getAttribute('data-id');
    if (!id || el.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';
    f.title = 'Video guide';
    f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    el.innerHTML = '';
    el.appendChild(f);
  }
  document.querySelectorAll('.yt').forEach(function (el) {
    el.addEventListener('click', function () { oynat(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oynat(el); } });
  });

  // arşiv: arama + kategori filtresi (?q= ve #kategori ile de çalışır)
  var ara = document.getElementById('ara'), arsiv = document.getElementById('arsiv');
  if (ara && arsiv) {
    var kartlar = [].slice.call(arsiv.querySelectorAll('.dosya'));
    var cipler = [].slice.call(document.querySelectorAll('.filtre .cip'));
    var bos = document.getElementById('bos'), secili = '';
    function uygula() {
      var q = ara.value.trim().toLowerCase(), gorunen = 0;
      kartlar.forEach(function (k) {
        var ok = (!secili || (' ' + k.getAttribute('data-kat') + ' ').indexOf(' ' + secili + ' ') > -1) &&
                 (!q || k.getAttribute('data-ara').indexOf(q) > -1);
        k.hidden = !ok; if (ok) gorunen++;
      });
      if (bos) bos.hidden = gorunen > 0;
    }
    cipler.forEach(function (c) {
      c.addEventListener('click', function () {
        secili = c.getAttribute('data-kat') || '';
        cipler.forEach(function (x) { x.classList.toggle('aktif', x === c); });
        uygula();
      });
    });
    ara.addEventListener('input', uygula);
    var p = new URLSearchParams(location.search);
    if (p.has('q')) { ara.value = p.get('q'); ara.focus(); }
    uygula();
  }

  // çerez tercihi (localStorage kullanılamazsa da sayfa çalışır)
  var bant = document.getElementById('cerez');
  function oku() { try { return localStorage.getItem('vss_consent'); } catch (e) { return null; } }
  function kaydet(v) { try { localStorage.setItem('vss_consent', v); } catch (e) {} }
  if (bant && !oku()) bant.hidden = false;
  function sec(v) { kaydet(v); if (bant) bant.hidden = true; if (v === 'no') location.reload(); }
  var k = document.getElementById('cerez-kabul'), r = document.getElementById('cerez-red'), a = document.getElementById('cerez-ayar');
  if (k) k.addEventListener('click', function () { sec('yes'); });
  if (r) r.addEventListener('click', function () { sec('no'); });
  if (a) a.addEventListener('click', function (e) { e.preventDefault(); if (bant) bant.hidden = false; });
})();
