/* Klayver Paz · portfolio — scene runner, showcase, reveal. No dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); };

  /* ---------- Generated drawings (calendar, map, contour lines) ---------- */
  each('.mm-cal', function (cal) {
    var h = '';
    for (var d = 0; d < 35; d++) h += '<i class="' + (d >= 30 ? 'x' : '') + '" style="--i:' + d + '">' + (d < 30 ? d + 1 : '') + '</i>';
    cal.innerHTML = h;
  });

  each('.mp-svg', function (map) {
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var out = '<path class="mp-river" d="M-10 74 C 25 62, 50 88, 86 74 S 140 52, 172 60"/>';
    for (var x = 6; x < 160; x += 13) { var j = (rnd() - .5) * 4; out += '<line class="mp-st" x1="' + (x + j) + '" y1="-2" x2="' + (x - j) + '" y2="102"/>'; }
    for (var y = 5; y < 100; y += 11) { var k = (rnd() - .5) * 4; out += '<line class="mp-st" x1="-2" y1="' + (y + k) + '" x2="162" y2="' + (y - k) + '"/>'; }
    out += '<line class="mp-st av" x1="-5" y1="95" x2="165" y2="8"/><line class="mp-st av" x1="20" y1="-5" x2="70" y2="105"/>';
    var spotsA = [[52, 38, 1], [110, 64, .75], [124, 24, .45]];
    var spotsB = [[52, 38, .45], [110, 64, 1], [124, 24, .95]];
    var val = function (sp, cx, cy) { var s = 0; sp.forEach(function (p) { var dx = cx - p[0], dy = cy - p[1]; s += p[2] * Math.exp(-(dx * dx + dy * dy) / (2 * 17 * 17)); }); return Math.min(1, s); };
    var ramp = [[29, 63, 143], [57, 123, 255], [146, 117, 232], [231, 236, 250]];
    var color = function (v) { var t = Math.min(.999, Math.max(0, (v - .12) / .88)) * 3, i = Math.floor(t), f = t - i, a = ramp[i], c = ramp[i + 1]; return 'rgb(' + Math.round(a[0] + (c[0] - a[0]) * f) + ',' + Math.round(a[1] + (c[1] - a[1]) * f) + ',' + Math.round(a[2] + (c[2] - a[2]) * f) + ')'; };
    ['a', 'b'].forEach(function (g) {
      out += '<g class="mp-heat ' + g + '">';
      for (var r = 0; r < 10; r++) for (var c = 0; c < 16; c++) {
        var v = val(g === 'a' ? spotsA : spotsB, c * 10 + 5, r * 10 + 5);
        if (v < .12) continue;
        out += '<rect x="' + (c * 10 + .5) + '" y="' + (r * 10 + .5) + '" width="9" height="9" rx="1" fill="' + color(v) + '" style="--o:' + (0.28 + v * .6).toFixed(2) + ';--d:' + (c + r) + '"/>';
      }
      out += '</g>';
    });
    var pts = function (cls, n, sp, spread) {
      var s = '';
      for (var i = 0; i < n; i++) {
        var p = sp[i % sp.length]; var px = p[0] + (rnd() - .5) * spread, py = p[1] + (rnd() - .5) * spread * .8;
        s += cls === 'h'
          ? '<circle class="mp-pt h" style="--i:' + i + '" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="1.4" fill="#E7ECFA"/>'
          : '<rect class="mp-pt c" style="--i:' + i + '" x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" width="2" height="2" fill="#9DBBFF"/>';
      }
      return s;
    };
    out += pts('h', 20, [[52, 38], [110, 64], [124, 24]], 34);
    out += pts('c', 26, [[60, 45], [105, 60], [30, 20], [130, 30]], 40);
    map.innerHTML = out;
  });

  each('[data-topo]', function (host) {
    var sv = '<svg class="topo" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    [[1180, 380, 0], [1500, 920, 2.1], [760, 1080, 4.2]].forEach(function (c) {
      for (var k = 1; k <= 16; k++) {
        var r = k * 36, d = '';
        for (var a = 0; a <= 120; a++) {
          var th = a / 120 * Math.PI * 2;
          var rr = r * (1 + .13 * Math.sin(3 * th + c[2] + k * .16) + .07 * Math.sin(5 * th - c[2] * 1.3 + k * .1));
          d += (a ? 'L' : 'M') + (c[0] + rr * Math.cos(th)).toFixed(1) + ' ' + (c[1] + rr * .78 * Math.sin(th)).toFixed(1);
        }
        sv += '<path class="' + (k % 5 === 0 ? 'm' : '') + '" d="' + d + 'Z"/>';
      }
    });
    host.insertAdjacentHTML('beforeend', sv + '</svg>');
  });

  /* ---------- Counters and per-step values ---------- */
  var fmt = function (v, dec) { return dec ? v.toFixed(dec) : String(Math.round(v)); };
  function countTo(el, instant) {
    var to = parseFloat(el.getAttribute('data-to')), dec = +el.getAttribute('data-dec') || 0, dur = +el.getAttribute('data-dur') || 900;
    if (el._raf) cancelAnimationFrame(el._raf);
    if (instant || RM) { el.textContent = fmt(to, dec); return; }
    var t0 = performance.now();
    var tick = function (now) { var p = Math.min(1, (now - t0) / dur); var e = dur > 3000 ? p : 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e, dec); if (p < 1) el._raf = requestAnimationFrame(tick); };
    el._raf = requestAnimationFrame(tick);
  }
  function applyStep(scene, k, instant) {
    each('[data-to]', function (el) { var at = +el.getAttribute('data-at') || 1; if (at === k || (instant && at <= k)) countTo(el, instant); }, scene);
    each('[data-set]', function (el) {
      var v = null;
      el.getAttribute('data-set').split(',').forEach(function (pair) { var p = pair.split(':'); if (+p[0] <= k) v = p[1]; });
      if (v !== null) el.textContent = v;
    }, scene);
    /* RAG scene: row i is searched at step i+2 and done after it */
    if (scene.classList.contains('mo-rag')) {
      each('.rg-list li', function (li, i) { li.classList.toggle('work', k === i + 2); li.classList.toggle('done', k > i + 2); }, scene);
    }
  }
  function resetScene(scene) {
    each('[data-to]', function (el) { if (el._raf) cancelAnimationFrame(el._raf); el.textContent = '0'; }, scene);
    each('[data-set]', function (el) { el.textContent = el.getAttribute('data-zero') || '0'; }, scene);
    each('.rg-list li', function (li) { li.classList.remove('work', 'done'); }, scene);
  }

  /* ---------- Showcase: copies of the case scenes ---------- */
  var shStage = document.getElementById('sh-stage');
  var shInfo = [];
  if (shStage) each('.work-case', function (c) {
    var src = c.querySelector('.scene');
    if (!src) return;
    var copy = src.cloneNode(true);
    copy.setAttribute('data-managed', '');
    each('[id]', function (el) { el.removeAttribute('id'); }, copy);
    shStage.appendChild(copy);
    var link = c.querySelector('.more');
    shInfo.push({ title: c.querySelector('h3').textContent, tag: c.querySelector('.tag').textContent, href: link ? link.getAttribute('href') : '#work' });
  });

  /* ---------- Scenes: timed steps, loop while visible ---------- */
  var scenes = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
  scenes.forEach(function (sc) {
    var steps = (sc.getAttribute('data-steps') || '').split(',').map(Number);
    var hold = +sc.getAttribute('data-hold') || 3500;
    var once = sc.hasAttribute('data-once');
    var timers = [];
    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var setStep = function (k, instant) { for (var i = 1; i <= steps.length; i++) sc.classList.toggle('s' + i, i <= k); applyStep(sc, k, instant); };
    var start = function (onDone) {
      clear(); sc.classList.add('no-anim'); sc.classList.remove('is-out'); setStep(0); resetScene(sc); void sc.offsetWidth; sc.classList.remove('no-anim');
      var t = 0;
      steps.forEach(function (d, i) { t += d; timers.push(setTimeout(function () { setStep(i + 1); }, t)); });
      if (once) { sc._done = true; return; }
      t += hold;
      if (onDone) { timers.push(setTimeout(onDone, t)); return; }
      timers.push(setTimeout(function () { sc.classList.add('is-out'); }, t));
      timers.push(setTimeout(function () { start(); }, t + 650));
    };
    sc._final = function () { clear(); sc.classList.add('no-anim'); sc.classList.remove('is-out'); setStep(steps.length, true); void sc.offsetWidth; sc.classList.remove('no-anim'); sc._done = true; };
    sc._run = function () { start(); };
    sc._play = function (cb) { start(cb); };
    sc._stop = clear;
    sc._total = steps.reduce(function (a, b) { return a + b; }, 0) + hold;
  });
  var free = scenes.filter(function (sc) { return !sc.hasAttribute('data-managed'); });
  if (RM || !('IntersectionObserver' in window)) {
    free.forEach(function (sc) { sc._final(); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var sc = en.target, keep = sc.hasAttribute('data-once');
        if (en.isIntersecting) { if (!sc._live && !(sc._done && keep)) { sc._live = true; sc._run(); } }
        else if (sc._live) { sc._live = false; if (!(sc._done && keep)) sc._stop(); }
      });
    }, { threshold: 0.35 });
    free.forEach(function (sc) { io.observe(sc); });
  }

  /* ---------- Showcase: cycles through the cases ---------- */
  var show = document.getElementById('showcase');
  if (show && shStage && shStage.children.length) {
    var shScenes = Array.prototype.slice.call(shStage.children);
    var shBars = show.querySelectorAll('.sh-bars button');
    var tagEl = show.querySelector('[data-sh-tag]'), titleEl = show.querySelector('[data-sh-title]'), nEl = show.querySelector('[data-sh-n]'), goEl = show.querySelector('[data-sh-go]');
    var cur = 0, shLive = false;
    var showOne = function (i) {
      cur = (i + shScenes.length) % shScenes.length;
      shScenes.forEach(function (s2, n) { s2.classList.toggle('is-active', n === cur); if (n !== cur) s2._stop(); });
      tagEl.textContent = shInfo[cur].tag;
      titleEl.textContent = shInfo[cur].title;
      nEl.textContent = '0' + (cur + 1);
      goEl.setAttribute('href', shInfo[cur].href);
      Array.prototype.forEach.call(shBars, function (b) { b.style.setProperty('--t', '0s'); b.style.setProperty('--p', '0'); });
      void show.offsetWidth;
      Array.prototype.forEach.call(shBars, function (b, n) { b.style.setProperty('--p', n < cur ? '1' : '0'); b.setAttribute('aria-current', String(n === cur)); });
      var sc = shScenes[cur];
      if (RM || !shLive) { sc._final(); if (shBars[cur]) shBars[cur].style.setProperty('--p', '1'); return; }
      sc._play(function () { showOne(cur + 1); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (shBars[cur]) { shBars[cur].style.setProperty('--t', sc._total + 'ms'); shBars[cur].style.setProperty('--p', '1'); } }); });
    };
    Array.prototype.forEach.call(shBars, function (b, n) { b.addEventListener('click', function () { showOne(n); }); });
    if (!RM && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !shLive) { shLive = true; showOne(cur); }
          else if (!en.isIntersecting && shLive) { shLive = false; shScenes[cur]._stop(); }
        });
      }, { threshold: 0.3 }).observe(show);
    } else { showOne(0); }
  }

  /* ---------- Section reveal ---------- */
  var reveal = document.querySelectorAll('[data-reveal]');
  if (RM || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveal, function (el) { el.classList.add('is-in'); });
  } else {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io2.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(reveal, function (el) { io2.observe(el); });
  }

  /* ---------- Header ---------- */
  var head = document.querySelector('.site-header');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
