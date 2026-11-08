/* caso.js · solo páginas de caso. Mini juego «De TikTok al marcador»: la regla de los 600 ms. */
(function () {
  var box = document.getElementById('try');
  if (!box) return;
  box.hidden = false;
  var MIN = 600, MAX = 1500;
  var rng = document.getElementById('ms'), out = document.getElementById('ms-out'),
      res = document.getElementById('try-res'), gauge = document.getElementById('gauge'),
      live = document.getElementById('try-live'), board = document.getElementById('board-wrap'),
      ds = [document.getElementById('d1'), document.getElementById('d2'), document.getElementById('d3')];
  var count = 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function msg(ms) {
    return ms >= MIN ? ms + ' ms: se queda lo bastante. Cuenta.' : ms + ' ms: pasaste de largo. No cuenta.';
  }
  function update() {
    var ms = +rng.value;
    out.textContent = ms + ' ms';
    res.textContent = msg(ms);
    gauge.style.width = (ms / MAX * 100) + '%';
  }
  function show(flip) {
    var s = ('000' + count).slice(-3);
    board.setAttribute('aria-label', 'Marcador: ' + count + ' vídeos');
    ds.forEach(function (d, i) {
      if (d.textContent !== s[i]) {
        d.textContent = s[i];
        if (flip && !reduce) {
          d.classList.remove('flip'); void d.offsetWidth; d.classList.add('flip');
        }
      }
    });
  }
  rng.addEventListener('input', update);
  document.getElementById('watch').addEventListener('click', function () {
    var ms = +rng.value;
    if (ms >= MIN) {
      count = Math.min(999, count + 1);
      show(true);
      live.textContent = 'Cuenta. Marcador: ' + count;
    } else {
      live.textContent = 'No cuenta. Marcador: ' + count;
      res.textContent = ms + ' ms no llega a ' + MIN + '. El marcador sigue en ' + count + '.';
    }
  });
  document.getElementById('reset').addEventListener('click', function () {
    count = 0; show(false); live.textContent = 'Marcador a cero'; update();
  });
  update(); show(false);
})();
