/* base.js · común a todas las páginas. Sin dependencias.
   - Respaldo de las animaciones al bajar (IntersectionObserver) cuando el navegador no tiene animation-timeline.
   - Pilas de carteles (.stack): cada cartel se pega arriba; si es más alto que la pantalla, se pega cuando ya se ha visto entero.
   - Contadores [data-count].
   - Botones [data-copy]: montan el correo al pulsar y lo copian. En el HTML nunca hay una dirección ni un mailto. */
(function () {
  var de = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Respaldo de [data-r] y [data-p]
  if (de.classList.contains('io') && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-r],[data-p]').forEach(function (el) { io.observe(el); });
  } else if (de.classList.contains('io')) {
    de.classList.remove('io');
  }

  // 2. Pilas de carteles
  var stacks = document.querySelectorAll('.stack > *');
  if (stacks.length) {
    var fit = function () {
      var h = window.innerHeight;
      stacks.forEach(function (el) {
        el.style.setProperty('--stick', Math.min(0, h - el.offsetHeight) + 'px');
      });
    };
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(fit);
      stacks.forEach(function (el) { ro.observe(el); });
    }
    addEventListener('resize', fit, { passive: true });
    fit();
  }

  // 3. Contadores: cuentan hasta su cifra la primera vez que se ven
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var fmt;
    try { fmt = new Intl.NumberFormat('es-ES', { useGrouping: 'always' }); } catch (e) { fmt = new Intl.NumberFormat('es-ES'); }
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, fin = el.textContent, t0 = performance.now(), d = 1400;
        (function step(t) {
          var p = Math.min(1, (t - t0) / d);
          p = 1 - Math.pow(1 - p, 3);
          el.textContent = p < 1 ? fmt.format(Math.round(to * p)) : fin;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { cio.observe(el); });
  }

  // 4. Copiar el correo
  var mail = ['sergiore2007', 'gmail.com'].join('@');
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.hidden = false;
    var label = b.textContent;
    var out = document.getElementById(b.dataset.copy); // data-copy="id del role=status donde se avisa"
    var say = function (t) { if (out) out.textContent = t; };
    b.addEventListener('click', function () {
      var ok = function () {
        b.textContent = 'Copiado';
        say('Correo copiado: ' + mail);
        setTimeout(function () { b.textContent = label; }, 2600);
      };
      var ko = function () { say('No he podido copiarlo. Es ' + mail); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(mail).then(ok, ko);
      else ko();
    });
  });
})();
