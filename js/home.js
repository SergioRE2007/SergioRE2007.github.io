/* home.js · solo la portada: pestañas de documentos, mesa de revisión y respaldos de la banda y las palabras. */
(function () {
  var de = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = de.classList.contains('io');

  // Respaldo sin animation-timeline: la banda corre con el scroll y las palabras de los pasos entran con IO
  if (io) {
    var tk = false;
    addEventListener('scroll', function () {
      if (tk) return; tk = true;
      requestAnimationFrame(function () { de.style.setProperty('--sy', Math.round(scrollY)); tk = false; });
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      var wio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); wio.unobserve(e.target); } });
      }, { threshold: 0.3 });
      document.querySelectorAll('.word').forEach(function (el) { wio.observe(el); });
    }
  }

  // Pestañas de la carpeta de documentos (patrón de pestañas de ARIA, con flechas, Inicio y Fin)
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = [].slice.call(box.querySelectorAll('[role="tab"]'));
    var show = function (i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        if (on) panel.removeAttribute('data-off'); else panel.setAttribute('data-off', '');
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, k = e.key, to = null;
        if (k === 'ArrowRight') to = (i + 1) % n;
        else if (k === 'ArrowLeft') to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); show(to, true); }
      });
    });
    show(0);
  });

  // Mesa de revisión: 31 hallazgos, el escéptico los juzga uno a uno y al final decides tú
  var mesa = document.getElementById('mesa');
  if (!mesa) return;
  var dots = [].slice.call(mesa.querySelectorAll('.mesa-dots li'));
  var verdict = dots.map(function (d) { return d.classList.contains('ok'); });
  var out = mesa.querySelector('.mesa-out');
  var run = mesa.querySelector('[data-mesa="run"]');
  var yes = mesa.querySelector('[data-mesa="yes"]');
  var no = mesa.querySelector('[data-mesa="no"]');
  var timers = [];
  var bars = function (a, b) { mesa.style.setProperty('--ok', a / 20); mesa.style.setProperty('--no', b / 11); };
  var swap = function (from, to) { var f = document.activeElement === from; from.hidden = true; to.hidden = false; if (f) to.focus(); };

  var pending = function (msg) {
    timers.forEach(clearTimeout); timers = [];
    dots.forEach(function (d) { d.className = ''; });
    bars(0, 0);
    mesa.dataset.state = 'pend';
    out.textContent = msg;
    run.textContent = 'Pasar los escépticos';
    run.removeAttribute('aria-disabled');
  };

  pending('31 hallazgos sin juzgar. Suelta a los escépticos.');
  run.hidden = false;

  run.addEventListener('click', function () {
    if (mesa.dataset.state === 'run') return;
    pending('Los escépticos están revisando los 31 hallazgos.');
    mesa.dataset.state = 'run';
    // aria-disabled y no disabled: el botón conserva el foco mientras corren los escépticos
    run.setAttribute('aria-disabled', 'true');
    var a = 0, b = 0;
    var finish = function () {
      mesa.dataset.state = 'decide';
      out.innerHTML = '<b>20</b> confirmados. <b>11</b> descartados. Ahora decides tú: ¿entran los arreglos?';
      run.hidden = true; yes.hidden = false; no.hidden = false;
      yes.focus();
    };
    dots.forEach(function (d, i) {
      timers.push(setTimeout(function () {
        d.classList.add(verdict[i] ? 'ok' : 'no');
        if (!reduce) { d.classList.add('hit'); timers.push(setTimeout(function () { d.classList.remove('hit'); }, 220)); }
        if (verdict[i]) a++; else b++;
        bars(a, b);
        if (i === dots.length - 1) finish();
      }, reduce ? 0 : 75 * (i + 1)));
    });
  });

  yes.addEventListener('click', function () {
    mesa.dataset.state = 'final';
    out.innerHTML = 'Fusionado. Los <b>20</b> arreglos entran y los <b>11</b> descartados se quedan fuera. Así salió la web de Reelometer.';
    no.hidden = true;
    run.textContent = 'Otra vez';
    run.removeAttribute('aria-disabled');
    swap(yes, run);
  });

  no.addEventListener('click', function () {
    yes.hidden = true;
    pending('Devuelto. Vuelta a empezar con pautas nuevas.');
    swap(no, run);
  });
})();
