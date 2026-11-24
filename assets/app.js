// Vice Secret Story v3 — videolu sahne, belirme/eğilme animasyonları, sayaçlar, okuma çubuğu,
// YouTube gömme, arşiv araması, harita filtresi, checklist ve çerez tercihi. localStorage hataları sayfayı bozmaz.
(function () {
  var hareketAz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  function depoOku(a, v) { try { var x = localStorage.getItem(a); return x === null ? v : x; } catch (e) { return v; } }
  function depoYaz(a, v) { try { localStorage.setItem(a, v); } catch (e) {} }

  // ── belirme (scroll reveal)
  var belirenler = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !hareketAz) {
    var gozcu = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add('gorundu'); gozcu.unobserve(g.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    belirenler.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; gozcu.observe(el); });
  } else { belirenler.forEach(function (el) { el.classList.add('gorundu'); }); }

  // ── kart eğilme (yalnız fareli cihazlarda)
  if (!hareketAz && window.matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(function (k) {
      k.addEventListener('pointermove', function (e) {
        var r = k.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        k.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); k.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      k.addEventListener('pointerleave', function () { k.style.setProperty('--ry', '0deg'); k.style.setProperty('--rx', '0deg'); });
    });
  }

  // ── sayaçlar
  $$('[data-say]').forEach(function (el) {
    var hedef = +el.getAttribute('data-say'); if (hareketAz || !hedef) return;
    var t0 = null;  // sayı, animasyon gerçekten başlayana kadar doğru değerde kalır (arka plan sekmesi, tarayıcı botları)
    function adim(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(hedef * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(adim); }
    setTimeout(function () { requestAnimationFrame(adim); }, 400);
  });

  // ── okuma ilerleme çubuğu (rehber sayfalarında)
  var cubuk = $('.ilerleme');
  if (cubuk && document.body.classList.contains('sir')) {
    var guncelle = function () { var h = document.documentElement, m = h.scrollHeight - h.clientHeight; cubuk.style.width = (m > 0 ? h.scrollTop / m * 100 : 0) + '%'; };
    window.addEventListener('scroll', guncelle, { passive: true }); guncelle();
  }

  // ── videolu sahne
  var sahne = $('.slaytlar');
  if (sahne) {
    var slaytlar = $$('.slayt', sahne), noktalar = $$('.nokta', sahne), aktif = 0, zaman = null;
    var sure = +sahne.getAttribute('data-otomatik') || 7000; if (/[?&]durdur\b/.test(location.search)) hareketAz = true;
    sahne.style.setProperty('--sure', sure + 'ms');
    function videoAyarla(i, oyna) {
      var v = $('video', slaytlar[i]); if (!v) return;
      if (oyna) { if (!v.src) v.src = v.getAttribute('data-src'); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else { v.pause(); }
    }
    function git(i, elle) {
      i = (i + slaytlar.length) % slaytlar.length;
      videoAyarla(aktif, false);
      slaytlar[aktif].classList.remove('aktif'); noktalar[aktif].classList.remove('aktif');
      noktalar.forEach(function (n, j) { n.classList.toggle('gecti', j < i); });
      aktif = i;
      slaytlar[aktif].classList.add('aktif');
      var n = noktalar[aktif]; n.classList.remove('aktif'); void n.offsetWidth; n.classList.add('aktif');
      videoAyarla(aktif, true);
      if (elle) basla();
    }
    function basla() { clearInterval(zaman); if (!hareketAz) zaman = setInterval(function () { if (!sahne.classList.contains('durdu')) git(aktif + 1); }, sure); }
    noktalar.forEach(function (n, i) { n.addEventListener('click', function () { git(i, true); }); });
    var on = $('.onceki', sahne), so = $('.sonraki', sahne);
    if (on) on.addEventListener('click', function () { git(aktif - 1, true); });
    if (so) so.addEventListener('click', function () { git(aktif + 1, true); });
    sahne.addEventListener('mouseenter', function () { sahne.classList.add('durdu'); });
    sahne.addEventListener('mouseleave', function () { sahne.classList.remove('durdu'); });
    var x0 = null;
    sahne.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    sahne.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) git(aktif + (dx < 0 ? 1 : -1), true); x0 = null; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) videoAyarla(aktif, false); else videoAyarla(aktif, true); });
    videoAyarla(0, true); basla();
  }

  // ── tıklayınca yüklenen YouTube
  function oynat(el) {
    var id = el.getAttribute('data-id'); if (!id || el.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';
    f.title = 'Video guide'; f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
    el.innerHTML = ''; el.appendChild(f);
  }
  $$('.yt').forEach(function (el) {
    el.addEventListener('click', function () { oynat(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oynat(el); } });
  });

  // ── arşiv araması + kategori filtresi
  var ara = $('#ara'), arsiv = $('#arsiv');
  if (ara && arsiv) {
    var kartlar = $$('.dosya', arsiv), cipler = $$('.filtre .cip'), bos = $('#bos'), secili = '';
    function uygula() {
      var q = ara.value.trim().toLowerCase(), gorunen = 0;
      kartlar.forEach(function (k) {
        var ok = (!secili || (' ' + k.getAttribute('data-kat') + ' ').indexOf(' ' + secili + ' ') > -1) && (!q || k.getAttribute('data-ara').indexOf(q) > -1);
        k.hidden = !ok; if (ok) { gorunen++; k.classList.add('gorundu'); }
      });
      if (bos) bos.hidden = gorunen > 0;
    }
    cipler.forEach(function (c) { c.addEventListener('click', function () { secili = c.getAttribute('data-kat') || ''; cipler.forEach(function (x) { x.classList.toggle('aktif', x === c); }); uygula(); }); });
    ara.addEventListener('input', uygula);
    var p = new URLSearchParams(location.search); if (p.has('q')) { ara.value = p.get('q'); ara.focus(); }
    uygula();
  }

  // ── harita sayfası: filtre, liste ↔ iğne vurgusu, #slug ile açılış
  var haritaSayfa = document.body.classList.contains('harita-sayfa');
  if (haritaSayfa) {
    var pinler = $$('.harita-buyuk .pin'), satirlar = $$('.harita-satir'), hcip = $$('.harita-filtre .cip');
    function sec(slug) {
      pinler.forEach(function (p) { p.classList.toggle('secili', p.getAttribute('href').indexOf('/' + slug + '/') > -1); });
      satirlar.forEach(function (s) { s.classList.toggle('secili', s.getAttribute('data-pin') === slug); });
    }
    satirlar.forEach(function (s) { s.addEventListener('mouseenter', function () { sec(s.getAttribute('data-pin')); }); });
    pinler.forEach(function (p) { p.addEventListener('mouseenter', function () { var m = p.getAttribute('href').match(/secrets\/([^/]+)/); if (m) sec(m[1]); }); });
    hcip.forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.getAttribute('data-kat') || '';
        hcip.forEach(function (x) { x.classList.toggle('aktif', x === c); });
        pinler.forEach(function (p) { p.classList.toggle('gizli', !!k && (' ' + p.getAttribute('data-kat') + ' ').indexOf(' ' + k + ' ') < 0); });
        satirlar.forEach(function (s) { s.hidden = !!k && (' ' + s.getAttribute('data-kat') + ' ').indexOf(' ' + k + ' ') < 0; });
      });
    });
    if (location.hash) {
      var slug = location.hash.slice(1); sec(slug);
      var hb = $('.harita-buyuk'); if (hb && hb.getBoundingClientRect().top < 0) hb.scrollIntoView({ block: 'start' });
    }
  }

  // ── checklist (bu cihazda saklanır)
  var bulunan = [];
  try { bulunan = JSON.parse(depoOku('vss_bulunan', '[]')) || []; } catch (e) { bulunan = []; }
  var kutular = $$('[data-bulundu]');
  function ciz() {
    var toplam = $$('.kontrol-satir').length || $$('.dosya').length || 6;
    var adet = bulunan.length;
    $$('[data-bulunan]').forEach(function (el) { el.textContent = adet; });
    var c = $('[data-cubuk]'); if (c) c.style.width = Math.min(100, adet / Math.max(1, toplam) * 100) + '%';
    var halka = $('[data-halka] .dolu');
    if (halka) { var tum = +(document.querySelector('[data-halka] b').textContent.split('/')[1]) || toplam; halka.style.strokeDashoffset = 327 - 327 * Math.min(1, adet / Math.max(1, tum)); }
    kutular.forEach(function (k) { var s = k.getAttribute('data-bulundu'); k.checked = bulunan.indexOf(s) > -1; var satir = k.closest('.kontrol-satir'); if (satir) satir.classList.toggle('tamam', k.checked); });
  }
  kutular.forEach(function (k) {
    k.addEventListener('change', function () {
      var s = k.getAttribute('data-bulundu'), i = bulunan.indexOf(s);
      if (k.checked && i < 0) bulunan.push(s); if (!k.checked && i > -1) bulunan.splice(i, 1);
      depoYaz('vss_bulunan', JSON.stringify(bulunan)); ciz();
    });
  });
  var sifirla = $('[data-sifirla]');
  if (sifirla) sifirla.addEventListener('click', function () { bulunan = []; depoYaz('vss_bulunan', '[]'); ciz(); });
  ciz();

  // ── çerez tercihi
  var bant = $('#cerez');
  if (bant && !depoOku('vss_consent', null)) bant.hidden = false;
  function cerezSec(v) { depoYaz('vss_consent', v); if (bant) bant.hidden = true; if (v === 'no') location.reload(); }
  var ck = $('#cerez-kabul'), cr = $('#cerez-red'), ca = $('#cerez-ayar');
  if (ck) ck.addEventListener('click', function () { cerezSec('yes'); });
  if (cr) cr.addEventListener('click', function () { cerezSec('no'); });
  if (ca) ca.addEventListener('click', function (e) { e.preventDefault(); if (bant) bant.hidden = false; });
})();
