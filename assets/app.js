// Vice Secret Story — tıklayınca yüklenen YouTube gömme + çerez tercihi (localStorage hatalarına dayanıklı)
(function () {
  function oynat(el) {
    var id = el.getAttribute('data-id');
    if (!id || el.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';
    f.title = 'Video';
    f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    el.innerHTML = '';
    el.appendChild(f);
  }
  document.querySelectorAll('.yt').forEach(function (el) {
    el.addEventListener('click', function () { oynat(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oynat(el); } });
  });

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
