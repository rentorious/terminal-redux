/* Terminal Redux docs — shared behaviour: theme toggle, nav filter, mobile menu, TOC scrollspy. */
(function () {
  // theme (the inline script in <head> already applied it; this only wires the button)
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  function sync() { if (btn) btn.textContent = root.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark'; }
  sync();
  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('tr-theme', next); } catch (e) {}
    sync();
  });

  // mobile sidebar
  var menu = document.getElementById('menuBtn');
  var nav = document.querySelector('aside.nav');
  if (menu && nav) menu.addEventListener('click', function () { nav.classList.toggle('open'); });

  // sidebar filter
  var search = document.getElementById('navSearch');
  if (search && nav) {
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      nav.querySelectorAll('a[data-title]').forEach(function (a) {
        a.classList.toggle('hidden', q !== '' && a.dataset.title.toLowerCase().indexOf(q) === -1);
      });
      nav.querySelectorAll('.group').forEach(function (g) {
        var links = [], n = g.nextElementSibling;
        while (n && !n.classList.contains('group')) { if (n.tagName === 'A') links.push(n); n = n.nextElementSibling; }
        g.classList.toggle('hidden', links.length > 0 && links.every(function (a) { return a.classList.contains('hidden'); }));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== search && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); if (nav) nav.classList.add('open'); search.focus();
      }
      if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; search.dispatchEvent(new Event('input')); search.blur(); }
    });
  }

  // task lists — remember what the reader has ticked, per page
  var tasks = document.querySelectorAll('li.task input[data-task]');
  if (tasks.length) {
    var storeKey = 'tr-tasks:' + location.pathname;
    var state = {};
    try { state = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (e) {}
    tasks.forEach(function (box) {
      var id = box.dataset.task;
      if (state[id]) box.checked = true;
      box.closest('li').classList.toggle('done', box.checked);
      box.addEventListener('change', function () {
        state[id] = box.checked;
        box.closest('li').classList.toggle('done', box.checked);
        try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (e) {}
      });
    });
  }

  // TOC scrollspy
  var toc = document.querySelector('aside.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) { links[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
    var heads = Object.keys(links).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target.id) : visible.delete(en.target.id); });
      var current = heads.filter(function (h) { return visible.has(h.id); })[0];
      if (!current) {
        for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top < 120) current = heads[i]; }
      }
      Object.keys(links).forEach(function (id) { links[id].classList.toggle('active', !!current && id === current.id); });
    }, { rootMargin: '-70px 0px -70% 0px', threshold: 0 });
    heads.forEach(function (h) { io.observe(h); });
  }
})();
