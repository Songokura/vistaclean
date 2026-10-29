/* JIECHI Казахстан. Ванильный JS: плиты и след прохода, меню, якоря, каталог, подбор, форма, языки. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var easeOut = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 2.4); };
  var VW = W.innerWidth, VH = W.innerHeight;
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";

  /* ---------- Языки: русский в разметке, казахский грузится отдельным файлом по выбору ---------- */
  var I18N = { ru: null };
  var LANG = "ru";
  /* подписи, которых нет в разметке: характеристики карточек, типы машин, служебные строки */
  var RU = {
    "sp.w": "Ширина уборки", "sp.p": "Производительность", "sp.t": "Баки чистой / грязной", "sp.a": "Автономность", "sp.bat": "Аккумулятор",
    "sp.bin": "Мусорный бак", "sp.wt": "Бак для воды", "sp.cab": "Кабина", "sp.avd": "Встроенный АВД", "sp.filt": "Фильтр",
    "f.type": "Тип", "f.w": "Ширина уборки", "f.sq": "Водосборная балка", "f.br": "Щёточный двигатель", "f.vac": "Вакуумный двигатель",
    "f.drv": "Привод хода", "f.p": "Производительность", "f.bat": "Аккумуляторы", "f.a": "Время работы", "f.t1": "Бак чистой воды",
    "f.t2": "Бак грязной воды", "f.m": "Масса", "f.dim": "Габариты", "f.ctrl": "Контроллер", "f.noise": "Уровень шума",
    "f.mb": "Основная щётка", "f.sb": "Боковые щётки", "f.bin": "Мусорный бак", "f.wt": "Бак для воды", "f.filt": "Фильтрующая площадь",
    "f.spd": "Скорость", "f.grade": "Преодолеваемый уклон", "f.avd": "Система высокого давления",
    "t.mini": "Мини-поломоечная, литий, 17 кг", "t.compact": "Компактная аккумуляторная", "t.hand": "Ручная аккумуляторная, однощёточная",
    "t.self": "Самоходная, однощёточная", "t.self2": "Самоходная, двухщёточная", "t.swscrub": "Самоходная подметально-моечная", "t.ridesw": "Райдер с предварительным подметанием", "t.bigsw": "Подметально-моечная с местом оператора", "c.req": "Цена по запросу", "t.ride": "Райдер с сиденьем, однощёточная",
    "t.ride2": "Райдер с сиденьем, двухщёточная", "t.ride2e": "Райдер, двухщёточная, электроподъём щёток",
    "t.sw": "Ручная подметальная машина", "t.swr": "Подметальная с местом оператора", "t.swc": "Подметальная с закрытой кабиной",
    "m.open": "Открыть меню", "m.close": "Закрыть меню", "pb.card": "Карточка в каталоге"
  };
  function snapshotRu() {
    [].forEach.call(doc.querySelectorAll("[data-i]"), function (el) {
      var k = el.getAttribute("data-i");
      if (!(k in RU)) RU[k] = el.innerHTML;
    });
    [].forEach.call(doc.querySelectorAll("[data-i-ph]"), function (el) {
      var k = el.getAttribute("data-i-ph");
      if (!(k in RU)) RU[k] = el.getAttribute("placeholder") || "";
    });
    [["data-i-al", "aria-label"], ["data-i-alt", "alt"]].forEach(function (p) {
      [].forEach.call(doc.querySelectorAll("[" + p[0] + "]"), function (el) {
        var k = el.getAttribute(p[0]);
        if (!(k in RU)) RU[k] = el.getAttribute(p[1]) || "";
      });
    });
    RU["meta.title"] = doc.title;
    var md = doc.querySelector('meta[name="description"]');
    RU["meta.desc"] = md ? md.getAttribute("content") : "";
    I18N.ru = RU;
  }
  function loadLang(lang, done) {
    if (I18N[lang] || lang !== "kk") return done();
    var s = doc.createElement("script");
    s.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
    s.onload = function () { if (W.SITE_KK) I18N.kk = W.SITE_KK; if (W.SITE_KK_WA) WA.kk = W.SITE_KK_WA; done(); };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }
  function applyLang(lang) {
    var d = I18N[lang];
    if (!d) lang = "ru", d = I18N.ru;
    LANG = lang;
    [].forEach.call(doc.querySelectorAll("[data-i]"), function (el) {
      var k = el.getAttribute("data-i");
      var v = d[k];
      if (v === undefined) v = RU[k];
      if (v !== undefined && el.innerHTML !== v) el.innerHTML = v;
    });
    [].forEach.call(doc.querySelectorAll("[data-i-ph]"), function (el) {
      var k = el.getAttribute("data-i-ph"), v = d[k] !== undefined ? d[k] : RU[k];
      if (v !== undefined) el.setAttribute("placeholder", v);
    });
    [["data-i-al", "aria-label"], ["data-i-alt", "alt"]].forEach(function (p) {
      [].forEach.call(doc.querySelectorAll("[" + p[0] + "]"), function (el) {
        var k = el.getAttribute(p[0]), v = d[k] !== undefined ? d[k] : RU[k];
        if (v !== undefined) el.setAttribute(p[1], plain(v));
      });
    });
    specLang(lang);
    if (d["meta.title"]) doc.title = d["meta.title"];
    var md = doc.querySelector('meta[name="description"]');
    if (md && d["meta.desc"]) md.setAttribute("content", d["meta.desc"]);
    root.setAttribute("lang", lang);
    [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("vista-lang", lang); } catch (e) {}
    fitText();
    renderPick();
  }
  /* ---------- Характеристики карточек: значения без data-i (тип, единицы, страны) ---------- */
  var SPEC_RU = [];
  function specNodes() {
    if (!SPEC_RU.length) {
      [].forEach.call(doc.querySelectorAll(".c-specs b, .c-full b"), function (el) { SPEC_RU.push([el, el.innerHTML]); });
    }
    return SPEC_RU;
  }
  function specKk(s) {
    var P = W.SITE_KK_SPEC || {};
    var plainS = s.replace(/&nbsp;/g, " ");
    if (P.phrases && P.phrases[plainS]) return P.phrases[plainS];
    (P.words || []).forEach(function (w) { s = s.split(w[0]).join(w[1]); });
    (P.units || []).forEach(function (u) { s = s.split(u[0]).join(u[1]); });
    if (P.upto) s = s.replace(/до(&nbsp;| )/g, P.upto + "$1");
    if (P.hour) s = s.replace(/(\d)(&nbsp;| )ч(?![А-яЁё])/g, "$1$2" + P.hour);
    return s;
  }
  function specLang(lang) {
    specNodes().forEach(function (p) {
      var v = lang === "kk" ? specKk(p[1]) : p[1];
      if (p[0].innerHTML !== v) p[0].innerHTML = v;
    });
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }
  [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });

  function t(key) {
    var d = I18N[LANG] || RU;
    return d[key] !== undefined ? d[key] : (RU[key] !== undefined ? RU[key] : key);
  }
  function plain(s) { return String(s).replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, ""); }

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата, совместимо с LeadBot) ---------- */
  var WA_NUM = "77713736473";
  var WA = {
    ru: {
      site: "Пишу с сайта JIECHI Казахстан.",
      "default": "Здравствуйте! {site} Интересует уборочная техника.",
      hero: "Здравствуйте! {site} Помогите подобрать поломоечную машину под объект: ",
      menu: "Здравствуйте! {site} Интересует уборочная техника.",
      polo: "Здравствуйте! {site} Интересуют поломоечные машины JIECHI, нужна цена и подбор под объект: ",
      raid: "Здравствуйте! {site} Интересуют поломоечные райдеры с сиденьем, нужна цена и подбор под объект: ",
      podm: "Здравствуйте! {site} Интересуют подметальные машины JIECHI, нужна цена и подбор под объект: ",
      model: "Здравствуйте! {site} Нужна цена и наличие:\n{model}\nОбъект: ",
      price: "Здравствуйте! {site} Пришлите, пожалуйста, актуальный прайс JIECHI.",
      podbor: "Здравствуйте! {site} Нужен расчёт под объект.\nТип: {obj}\nПлощадь: {area}\nРекомендованные модели: {models}\nПокрытие и загрязнения: ",
      pylesosy: "Здравствуйте! {site} Нужен промышленный пылесос. Задача: ",
      ozonatory: "Здравствуйте! {site} Интересуют озонаторы. Объект: ",
      avd: "Здравствуйте! {site} Нужен аппарат высокого давления. Задача: ",
      roboty: "Здравствуйте! {site} Интересуют роботы-уборщики. Объект: ",
      servis: "Здравствуйте! {site} Заявка в сервис-центр. Модель и неисправность: ",
      arenda: "Здравствуйте! {site} Интересует аренда уборочной техники. Объект и срок: ",
      kontakty: "Здравствуйте! {site} Интересует уборочная техника.",
      sticky: "Здравствуйте! {site} Помогите подобрать уборочную технику под объект: "
    },
    kk: null
  };
  function waText(key, vars) {
    var dict = WA[LANG] || WA.ru;
    var tpl = dict[key] || dict["default"];
    vars = vars || {};
    vars.site = dict.site;
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  }
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var vars = { model: a.getAttribute("data-model") || "" };
    if (key === "podbor") {
      vars.obj = plain(t("pb.o" + OBJ_IDX[pick.obj]));
      vars.area = plain(pick.area === "s1" ? t("pb.a1") : AREA_TXT[pick.area]);
      vars.models = (RECO[pick.obj] && RECO[pick.obj][pick.area] || []).map(function (id) { return "JIECHI " + CAT[id].m; }).join(", ");
    }
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(waText(key, vars)));
  }, true);

  /* ---------- fitText: строки заголовка героя ---------- */
  var h1 = doc.getElementById("h1");
  function fitLine(sel, prop, min) {
    var l = h1.querySelector(sel), avail = (h1.parentElement || h1).clientWidth;
    if (!l || !avail) return;
    h1.style.removeProperty(prop);
    var fs = parseFloat(getComputedStyle(l).fontSize), guard = 0;
    while (guard++ < 30 && l.scrollWidth > avail + 1 && fs > (min || 18)) { fs *= 0.95; h1.style.setProperty(prop, fs + "px"); }
  }
  function fitText() { if (!h1) return; fitLine(".l1", "--fs1", 11); fitLine(".l2", "--fs2"); }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.querySelector(".foot"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? t("m.close") : t("m.open"));
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("open"); });
      setTimeout(function () { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 340);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 68; };
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.classList.contains("pw")) return r;
    if (el.classList.contains("sec")) return r - HDR();
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    var tab = a.getAttribute("data-tab");
    if (tab) showCat(tab);
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
      var tg = doc.getElementById(id);
      if (tg) { if (!tg.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(tg.tagName)) tg.setAttribute("tabindex", "-1"); try { tg.focus({ preventScroll: true }); } catch (err2) {} }
    }
  });

  /* ---------- Плиты: пакетное чтение, запись только изменившегося ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false, lastTs = 0;
  var st = pws.map(function () { return { open: -1, out: {}, txts: null, on: null }; });
  /* геометрия плит: меряем один раз и при изменении страницы, а не на каждом кадре */
  var geo = null;
  function measure() {
    var y = W.pageYOffset;
    geo = { kont: kont ? kont.getBoundingClientRect().top + y : null, pw: pws.map(function (pw) {
      var r = pw.getBoundingClientRect(), nx = pw.nextElementSibling;
      return { top: r.top + y, h: r.height, nxt: nx ? nx.getBoundingClientRect().top + y : null };
    }) };
  }
  if ("ResizeObserver" in W) new ResizeObserver(function () { geo = null; onScroll(); }).observe(doc.body);
  function put(pw, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; pw.style.setProperty(k, v); } }
  function update(ts) {
    ticking = false;
    var now = typeof ts === "number" ? ts : performance.now();
    var dt = lastTs ? Math.min(64, now - lastTs) : 16.7; lastTs = now;
    var k = 1 - Math.pow(1 - 0.2, dt / 16.7);
    var H = VH, pageY = W.pageYOffset, i;
    if (!geo) measure();
    var kontTop = geo.kont === null ? null : geo.kont - pageY;
    var moving = false;
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], g = geo.pw[i], s = st[i];
      var r = { top: g.top - pageY, bottom: g.top + g.h - pageY, height: g.h };
      var nxt = { i: g.nxt === null ? null : g.nxt - pageY };
      var near = r.bottom > -H * 0.5 && r.top < H * 1.5;
      var isHero = pw.classList.contains("pw-hero");
      if (!near && !isHero && s.out["--enter"] !== undefined) { continue; }
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H ? clamp(-r.top / (r.height - H)) : 0;
      var exit = nxt.i !== null ? clamp(1 - nxt.i / H) : 0;
      var open;
      if (isHero) open = REDUCED ? 1 : easeOut(INTRO);
      else open = REDUCED ? 1 : easeOut(smooth((enter - 0.2) / 0.64));
      if (s.open < 0 || REDUCED || !near || isHero) s.open = open;
      else {
        s.open += (open - s.open) * k;
        if (Math.abs(open - s.open) > 0.002) moving = true; else s.open = open;
      }
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", (isHero ? easeOut(stay) : stay).toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      put(pw, s, "--open", s.open.toFixed(4));
      if (isHero) put(pw, s, "--intro", s.open.toFixed(4));
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      pw.classList.toggle("settled", enter >= 0.98);
      if (!s.txts) s.txts = pw.querySelectorAll(".txt");
      var on = isHero ? INTRO > 0.25 : enter > 0.62;
      if (s.on !== on) { s.on = on; for (var q = 0; q < s.txts.length; q++) s.txts[q].classList.toggle("on", on); }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.5) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
    if (moving) onScroll();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    geo = null;
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitText(); }
    else if (!TOUCH) VH = W.innerHeight;
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart) / 1400);
    update(ts);
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Каталог: вкладки и раскрытие характеристик ---------- */
  var cards = [].slice.call(doc.querySelectorAll("#cards .card"));
  var tabs = [].slice.call(doc.querySelectorAll(".tab"));
  var curCat = "ruch";
  function showCat(cat) {
    curCat = cat;
    tabs.forEach(function (b) { var on = b.getAttribute("data-cat") === cat; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    var n = 0;
    cards.forEach(function (c) { var on = c.getAttribute("data-cat") === cat; if (on) c.style.setProperty("--i", n++ % 8); c.classList.toggle("show", on); });
  }
  tabs.forEach(function (b) { b.addEventListener("click", function () { showCat(b.getAttribute("data-cat")); }); });
  showCat(curCat);
  doc.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest(".c-more") : null;
    if (!b) return;
    var box = doc.getElementById(b.getAttribute("aria-controls"));
    if (!box) return;
    var open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", open ? "false" : "true");
    if (open) { box.classList.remove("open"); setTimeout(function () { if (!box.classList.contains("open")) box.hidden = true; }, 420); }
    else { box.hidden = false; requestAnimationFrame(function () { box.classList.add("open"); }); }
  });
  /* показать карточку модели из подбора: вкладка, прокрутка, подсветка */
  function showModel(id) {
    var c = doc.getElementById("c-" + id);
    if (!c) return;
    showCat(c.getAttribute("data-cat"));
    goTo("c-" + id);
    c.classList.add("flash");
    setTimeout(function () { c.classList.remove("flash"); }, 2600);
  }

  /* ---------- Подбор под объект ---------- */
  var CAT = {
    m1mini: { m: "M-1 мини", c: "ruch", t: "t.mini", s: ["430 мм", "1 200 м²/ч"], p: "760 000" },
    am380tm: { m: "AM380TM", c: "ruch", t: "t.compact", s: ["380 мм", "2 000 м²/ч"], p: "940 000" },
    m1: { m: "M1", c: "ruch", t: "t.hand", s: ["530 мм", "3 000 м²/ч"], p: "1 245 000" },
    m3: { m: "M3", c: "ruch", t: "t.hand", s: ["530 мм", "3 500 м²/ч"], p: "1 320 000" },
    am730tm: { m: "AM730TM", c: "ruch", t: "t.hand", s: ["530 мм", "4 000 м²/ч"], p: "1 445 000" },
    am800tm: { m: "AM800TM", c: "ruch", t: "t.self", s: ["530 мм", "5 000 м²/ч"], p: "1 655 000" },
    am920tm: { m: "AM920TM", c: "ruch", t: "t.self2", s: ["760 мм", "6 000 м²/ч"], p: "2 500 000" },
    am980tm: { m: "AM980TM", c: "ruch", t: "t.self2", s: ["860 мм", "8 000 м²/ч"], p: "3 950 000" },
    s45b: { m: "S45B", c: "raid", t: "t.ride2", s: ["760 мм", "5 800 м²/ч"], p: "2 700 000" },
    s50b: { m: "S50B", c: "raid", t: "t.ride2", s: ["760 мм", "4 300 м²/ч"], p: "2 900 000" },
    s60: { m: "S60", c: "raid", t: "t.ride2e", s: ["800 мм", "5 500 м²/ч"], p: "3 600 000" },
    m7: { m: "M7", c: "raid", t: "t.ride2e", s: ["860 мм", "6 800 м²/ч"], p: "4 000 000" },
    s60b: { m: "S60B", c: "raid", t: "t.ride2e", s: ["900 мм", "7 300 м²/ч"], p: "4 300 000" },
    m10: { m: "M10", c: "raid", t: "t.ride2e", s: ["920 мм", "10 300 м²/ч"], p: "7 000 000" },
    m2b: { m: "M2B", c: "podm", t: "t.sw", s: ["1 100 мм", "4 200 м²/ч"], p: "1 055 000" },
    mn1250tm: { m: "MN1250 TM", c: "podm", t: "t.swr", s: ["1 250 мм", "8 000 м²/ч"], p: "2 450 000", ot: 1 },
    am1700tm: { m: "AM1700TM", c: "podm", t: "t.swr", s: ["1 800 мм", "12 000 м²/ч"], p: "4 500 000", ot: 1 },
    m12a: { m: "M12A", c: "podm", t: "t.swc", s: ["2 200 мм", "20 000 м²/ч"], p: "6 000 000", ot: 1 }
  };
  var RECO = {
    tc:      { s1: ["m1mini", "am380tm", "m1"], s2: ["m3", "am800tm", "am920tm"], s3: ["am920tm", "s45b", "s60"], s4: ["am980tm", "s60b", "m7"] },
    sklad:   { s1: ["m1", "m3", "m2b"], s2: ["am800tm", "s45b", "m2b"], s3: ["s45b", "s60", "mn1250tm"], s4: ["m7", "m10", "am1700tm"] },
    prom:    { s1: ["m3", "am730tm", "m2b"], s2: ["am920tm", "s45b", "m2b"], s3: ["am980tm", "s60", "mn1250tm"], s4: ["m10", "s60b", "am1700tm"] },
    parking: { s1: ["m3", "am730tm"], s2: ["am800tm", "s45b", "m2b"], s3: ["s50b", "s60", "mn1250tm"], s4: ["s60b", "m10", "m12a"] },
    bc:      { s1: ["m1mini", "am380tm", "m1"], s2: ["m1", "am730tm", "am800tm"], s3: ["am800tm", "am920tm", "s45b"], s4: ["am920tm", "s60", "s60b"] },
    med:     { s1: ["m1mini", "am380tm"], s2: ["m1", "am730tm", "am800tm"], s3: ["am800tm", "am920tm", "s45b"], s4: ["am920tm", "s60", "s60b"] }
  };
  var OBJ_IDX = { tc: 1, sklad: 2, prom: 3, parking: 4, bc: 5, med: 6 };
  var AREA_TXT = { s1: "до 1 000 м²", s2: "1 000-3 000 м²", s3: "3 000-8 000 м²", s4: "8 000+ м²" };
  var pick = { obj: "tc", area: "s2" };
  var pkRes = doc.getElementById("pkRes");
  function renderPick() {
    if (!pkRes) return;
    var ids = (RECO[pick.obj] && RECO[pick.obj][pick.area]) || [];
    pkRes.innerHTML = ids.map(function (id) {
      var c = CAT[id];
      var sv = LANG === "kk" ? [specKk(c.s[0]), specKk(c.s[1])] : c.s;
      return '<div class="pk-card"><b class="pk-m">JIESHI ' + c.m + '</b><span class="pk-t">' + t(c.t) + '</span><span class="pk-s">' + t("sp.w") + ": " + sv[0] + " · " + t("sp.p") + ": " + sv[1] + '</span><b class="pk-p">' + (c.ot ? "<i>" + t("c.ot") + "</i> " : "") + c.p.replace(/ /g, "&nbsp;") + "&nbsp;₸</b>" +
        '<a class="lnk" href="#c-' + id + '" data-show="' + id + '"><span>' + t("pb.card") + "</span> <i aria-hidden=\"true\">→</i></a></div>";
    }).join("");
  }
  function bindChips(boxId, key) {
    var box = doc.getElementById(boxId);
    if (!box) return;
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      pick[key] = b.getAttribute("data-v");
      [].forEach.call(box.querySelectorAll(".chip"), function (c) { var on = c === b; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
      renderPick();
    });
  }
  bindChips("pkObj", "obj"); bindChips("pkArea", "area");
  if (pkRes) pkRes.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-show]"); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    showModel(a.getAttribute("data-show"));
  });

  /* ---------- Конверсии Google Ads ---------- */
  var AW = "AW-17866151629/", CV = { tel: "Rll_CMHTlJ8dEM2tn8dC", form: "jI5PCMnYjZ8dEM2tn8dC", contact: "I4EwCLPFlZ8dEM2tn8dC" };
  var sentCv = {};
  function conv(kind) {
    if (typeof W.gtag !== "function") return;
    // один раз за сеанс на каждый тип; ценность задаётся в настройках конверсии в кабинете
    var key = "cv-" + kind;
    if (sentCv[kind]) return;
    try { if (W.sessionStorage.getItem(key)) return; W.sessionStorage.setItem(key, "1"); } catch (err) {}
    sentCv[kind] = 1;
    W.gtag("event", "conversion", { send_to: AW + CV[kind], transport_type: "beacon" });
  }
  W.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href") || "";
    if (/^tel:/i.test(h)) conv("tel");
    else if (/wa\.me|whatsapp/i.test(h)) conv("contact");
  }, true);

  /* ---------- Форма -> Telegram (LeadBot) ----------
     Заявка уходит в бота без WhatsApp; «спасибо» показываем только после ответа сервера.
     Не дошла - показываем телефон и WhatsApp как запасной канал. */
  var LB = "https://lead-bot.sultan-askarov-kz.workers.dev/e";
  function sendLead(fields) {
    if (W.LeadBot && W.LeadBot.submit) return W.LeadBot.submit(fields, { el: form, label: "Отправить заявку", section: "kontakty" });
    // трекер не загрузился (блокировщик) - шлём сами, без источника визита
    if (!W.fetch) return Promise.resolve({ ok: false });
    var body = JSON.stringify({ site: "vistaclean", type: "form", direct: 1, fields: fields, label: "Отправить заявку", section: "kontakty",
      page: location.pathname + location.hash, lang: root.lang, ts: new Date().toISOString() });
    return W.fetch(LB, { method: "POST", body: body, headers: { "content-type": "text/plain" } })
      .then(function (r) { return { ok: r.ok }; }, function () { return { ok: false }; });
  }
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr"), ffail = doc.getElementById("ffail");
  function showThanks() {
    form.hidden = true;
    if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, btn = form.querySelector('[type="submit"]');
      if (btn.disabled) return;
      if (f.website && f.website.value) { showThanks(); return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      if (ffail) ffail.hidden = true;
      // поля - на русском, как их увидит менеджер в Telegram, независимо от языка сайта
      var fields = { name: name, phone: phone, "Объект и задача": f.message.value.trim() };
      if (!fields["Объект и задача"]) delete fields["Объект и задача"];
      btn.disabled = true; form.classList.add("is-sending");
      sendLead(fields).then(function (r) {
        btn.disabled = false; form.classList.remove("is-sending");
        if (r && r.ok) { conv("form"); form.reset(); showThanks(); }
        else if (ffail) ffail.hidden = false;
      });
    });
  }

  /* ---------- Cookie-баннер: один раз, выбор помним в localStorage ---------- */
  var ck = doc.getElementById("cookie");
  if (ck) {
    var ckSeen = null; try { ckSeen = localStorage.getItem("vista-cookie"); } catch (err) {}
    if (!ckSeen) {
      setTimeout(function () { ck.hidden = false; requestAnimationFrame(function () { ck.classList.add("show"); }); }, 1200);
      doc.getElementById("cookie-ok").addEventListener("click", function () {
        try { localStorage.setItem("vista-cookie", "1"); } catch (err) {}
        ck.classList.remove("show");
        setTimeout(function () { ck.hidden = true; }, 300);
      });
    }
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  snapshotRu();
  var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
  var saved = null; try { saved = localStorage.getItem("vista-lang"); } catch (e) {}
  var lang0 = forced || saved || "ru";
  function start() {
    fitText();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      if (id.indexOf("c-") === 0) showModel(id.slice(2)); else goTo(id, true);
      setTimeout(function () { if (id.indexOf("c-") !== 0) goTo(id, true); update(); }, 60);
      setTimeout(function () { if (id.indexOf("c-") !== 0) goTo(id, true); update(); }, 500);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }
  setLang(lang0);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
