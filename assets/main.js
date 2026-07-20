/* Shaikh Amir Hussain — portfolio interactions
   Vanilla JS, no dependencies. Progressive-enhancement + reduced-motion aware. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* leading+trailing throttle, ~60fps ceiling by default. Deliberately not
     requestAnimationFrame: rAF is throttled/paused in backgrounded or
     non-foreground tabs by design, which is fine for real users but means
     these two scroll handlers (progress bar + statusline %) would silently
     stop updating in exactly the states where that'd be hardest to notice.
     A time-based cap gives the same "don't do this on every single scroll
     tick" win without that dependency. */
  function throttle(fn, wait) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now();
      var remaining = wait - (now - last);
      if (remaining <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn();
      } else if (!timer) {
        timer = setTimeout(function () { last = Date.now(); timer = null; fn(); }, remaining);
      }
    };
  }

  /* ---- ambient code wallpaper (faint, behind everything, same on every page) ---- */
  (function () {
    var snippets = [
      'const growth = automate("data");',
      'SELECT insight FROM chaos WHERE noise = 0;',
      'df.clean().model().decide()',
      'await ship(draftly)',
      'zap.trigger("revenue")',
      'git push origin impact',
      'function buildBusiness(data, ai) { return momentum; }',
      'if (manualWork) { automate(); }',
      'model.fit(data).predict(future)',
      'export const impact = data + ai;'
    ];
    var text = "", i = 0;
    while (text.length < 9000) { text += snippets[i % snippets.length] + "    "; i++; }
    var bg = document.createElement("div");
    bg.className = "code-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.textContent = text;
    document.body.appendChild(bg);
  })();

  /* ---- hero typewriter: fixed prefix, rotating role — types, holds 3s, deletes, next ---- */
  (function () {
    var el = $("#heroType");
    if (!el) return;
    var words = ["AI Developer by obsession.", "Problem Solver by nature.", "Automation Builder by choice.", "Data Storyteller by trade."];
    if (reduce) { el.textContent = words[0]; return; }
    var w = 0, c = 0, deleting = false;
    function tick() {
      var word = words[w];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      var delay = deleting ? 32 : 62;
      if (!deleting && c === word.length) { delay = 3000; deleting = true; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 900);
  })();

  /* ---- year ---- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---- sticky header + scroll progress + back-to-top ---- */
  /* throttled: without this, every native scroll tick (which can fire far
     more often than 60fps on trackpads/high-refresh displays) runs a full
     style read+write on the main thread — a real source of scroll jank. */
  var bar = $(".topbar"), prog = $(".progress"), toTop = $(".totop");
  function onScroll() {
    var t = window.pageYOffset || document.documentElement.scrollTop;
    if (bar) bar.classList.toggle("stuck", t > 8);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (t / h) * 100 : 0) + "%";
    }
    if (toTop) toTop.classList.toggle("show", t > 700);
  }
  window.addEventListener("scroll", throttle(onScroll, 16), { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---- mobile nav ---- */
  var toggle = $(".nav-toggle"), nav = $("#nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- reveal on scroll + trigger chart/stat animations ---- */
  var reveal = $$(".reveal");
  var heroH1 = $(".hero h1");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveal.forEach(function (el) { io.observe(el); });
    if (heroH1) io.observe(heroH1);
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
    if (heroH1) heroH1.classList.add("in");
  }

  /* ---- count-up numbers — re-plays every time the number scrolls back into view ---- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-dec") | 0);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    if (el._countRaf) cancelAnimationFrame(el._countRaf);
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = (target * easeOut(p)).toFixed(dec);
      if (p < 1) el._countRaf = requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec);
    }
    el._countRaf = requestAnimationFrame(step);
  }
  var nums = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          countUp(e.target);
        } else if (!reduce) {
          if (e.target._countRaf) cancelAnimationFrame(e.target._countRaf);
          var dec = (e.target.getAttribute("data-dec") | 0);
          e.target.textContent = (0).toFixed(dec);
        }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io2.observe(el); });
  } else {
    nums.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---- active nav link via section observer ---- */
  var links = $$(".nav a.navlink");
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute("href"); if (id && id.charAt(0) === "#") map[id.slice(1)] = a;
  });
  var secs = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          if (map[e.target.id]) map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { io3.observe(s); });
  }

  /* ---- tiny parallax on hero chart ---- */
  var chart = $(".chartwrap");
  if (chart && finePointer && !reduce) {
    chart.addEventListener("mousemove", function (e) {
      var r = chart.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var yy = (e.clientY - r.top) / r.height - 0.5;
      chart.style.transform = "perspective(900px) rotateY(" + x * 5 + "deg) rotateX(" + (-yy * 5) + "deg)";
    });
    chart.addEventListener("mouseleave", function () { chart.style.transform = ""; });
  }

  /* ---- 3D tilt for card panels (dispatch/case/help/tl-chart) ---- */
  if (finePointer && !reduce) {
    $$(".dispatch, .case, .help, .tl-chart").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (px * 5) + "deg) rotateX(" + (-py * 5) + "deg) translateY(-6px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---- layered parallax on hero's floating chips ---- */
  /* transform, not margin: margin changes force a layout reflow on every
     mousemove tick; transform is compositor-only and stays smooth */
  var heroEl = $(".hero");
  var chips = $$(".chip");
  if (heroEl && chips.length && finePointer && !reduce) {
    heroEl.addEventListener("mousemove", function (e) {
      var r = heroEl.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      chips.forEach(function (c, i) {
        var depth = i % 2 === 0 ? 16 : 24;
        c.style.transform = "translate(" + (px * -depth) + "px," + (py * -depth) + "px)";
      });
    });
    heroEl.addEventListener("mouseleave", function () {
      chips.forEach(function (c) { c.style.transform = ""; });
    });
  }

  /* ---- gallery lightbox (only for tiles with a real image) ---- */
  var lb = $("#lightbox"), lbImg = $("#lbImg");
  if (lb && lbImg) {
    function openLb(src, alt) {
      lbImg.src = src; lbImg.alt = alt || "";
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    $$(".gtile[data-full]").forEach(function (t) {
      t.addEventListener("click", function () {
        var im = $("img", t);
        openLb(t.getAttribute("data-full"), im ? im.alt : "");
      });
    });
    var lbClose = $(".lb-close", lb);
    if (lbClose) lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---- interactive "diagnose your problem" mini-game ---- */
  var fixitOut = $("#fixitOut");
  if (fixitOut) {
    function escapeHtml(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    var FIXIT = {
      spreadsheets: { a: "I replace the spreadsheet maze with a single Power BI or Tableau dashboard your team actually opens.", proof: "+46% sales lift at Nexford University" },
      crm: { a: "I standardize the pipeline — clear stage definitions, funnel metrics, one shared source of truth instead of ten versions of it.", proof: "+45% pipeline visibility at Confidential" },
      ai: { a: "I design and ship the AI layer — from prompt-engineered workflows to a shipped product like Draftly.", proof: "Built & maintain Draftly in the open" },
      manual: { a: "I map the repetitive steps and automate them with Zapier, Make or Power Automate — hours back every week.", proof: "−65% reporting effort at Confidential" },
      marketing: { a: "I audit the campaigns, cut the underperforming creatives and put the budget where it's actually converting.", proof: "+22% blended ROAS at Confidential" },
      scattered: { a: "I unify every source — CRM, analytics, exports — into one trusted reporting layer.", proof: "+40% data accuracy at HSI" },
      analytics: { a: "I wire up Google Analytics and competitor tracking so you see the real signal, not vanity metrics.", proof: "+40% lead generation at HSI" },
      growth: { a: "I dig into the data for the signal everyone else is missing, and turn it into a plan.", proof: "+150% LinkedIn engagement at HSI" }
    };
    function renderFixit(question, answer, proof) {
      fixitOut.innerHTML =
        '<span class="q">$ diagnosis: ' + question + '</span>' +
        '<span class="a">' + answer + '</span>' +
        (proof ? '<span class="proof">' + proof + '</span>' : "") +
        '<a class="fixit-cta" href="#contact">Let\'s fix this <span class="arr">→</span></a>';
    }
    $$(".fixit-pick").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".fixit-pick").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var d = FIXIT[btn.getAttribute("data-fix")];
        if (!d) return;
        renderFixit(escapeHtml(btn.textContent), d.a, d.proof);
      });
    });

    var fixitInput = $("#fixitInput"), fixitSubmit = $("#fixitSubmit");
    if (fixitInput && fixitSubmit) {
      function runCustom() {
        var val = fixitInput.value.trim();
        if (!val) { fixitInput.focus(); return; }
        $$(".fixit-pick").forEach(function (b) { b.classList.remove("active"); });
        renderFixit(
          'diagnose --input="' + escapeHtml(val) + '"',
          "Whatever the exact tool, the shape of the fix is usually the same: map it to the data, automate the repeat work, and put the answer in front of whoever makes the call. Tell me the details and I'll show you the plan.",
          null
        );
      }
      fixitSubmit.addEventListener("click", runCustom);
      fixitInput.addEventListener("keydown", function (e) { if (e.key === "Enter") runCustom(); });
    }
  }

  /* ---- live session statusline: shows the section being read + scroll % ---- */
  /* the section-tracking half runs on an IntersectionObserver, not a scroll
     handler — the old version called getBoundingClientRect() on every
     section on every scroll tick, forcing a synchronous layout each time.
     The scroll handler left only does two cheap reads, throttled. */
  (function () {
    var page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
    var rl = document.createElement("div");
    rl.className = "readline";
    rl.setAttribute("aria-hidden", "true");
    rl.innerHTML = '<span class="rl-dot"></span><span class="rl-path"></span><span class="rl-pct"></span><span class="rl-caret"></span>';
    document.body.appendChild(rl);
    var pathEl = $(".rl-path", rl), pctEl = $(".rl-pct", rl);
    var marks = $$("section[id], article[id]");
    var current = "";

    function setPath() { pathEl.textContent = "~/" + page + (current ? "#" + current : ""); }
    setPath();

    if (marks.length && "IntersectionObserver" in window) {
      var ioRL = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) current = e.target.id; });
        setPath();
      }, { rootMargin: "-40% 0px -55% 0px" });
      marks.forEach(function (s) { ioRL.observe(s); });
    }

    function updatePct() {
      var t = window.pageYOffset || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? Math.round((t / h) * 100) : 0;
      pctEl.textContent = pct + "%";
    }
    window.addEventListener("scroll", throttle(updatePct, 16), { passive: true });
    updatePct();
  })();

  /* ---- section labels type themselves in as they scroll into view ---- */
  (function () {
    var labels = $$(".idx, .tool-cat .ci");
    if (!labels.length || reduce || !("IntersectionObserver" in window)) return;
    /* labels keep their full text until the observer actually fires — if it
       never does (headless renderers, prerender), nothing ships blank */
    function typeIn(el) {
      var full = el.textContent, i = 0;
      el.textContent = "";
      (function step() {
        i++;
        el.textContent = full.slice(0, i);
        if (i < full.length) setTimeout(step, 26);
      })();
    }
    var ioT = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { typeIn(e.target); ioT.unobserve(e.target); }
      });
    }, { threshold: 0.5, rootMargin: "0px 0px -4% 0px" });
    labels.forEach(function (el) { ioT.observe(el); });
  })();
})();
