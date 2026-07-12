/* Shaikh Amir Hussain — GSAP motion layer
   Additive to main.js: page transitions, SplitText heading reveals, DrawSVG,
   pinned/scrubbed scroll storytelling, spring-smoothed cursor & magnetic buttons.
   Bails cleanly if the GSAP CDN fails; respects prefers-reduced-motion throughout. */
(function () {
  "use strict";
  if (!window.gsap) return;
  var gsap = window.gsap;
  var hasST = !!window.ScrollTrigger;
  var hasSplit = !!window.SplitText;
  var hasDraw = !!window.DrawSVGPlugin;
  if (hasST) gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) gsap.registerPlugin(SplitText);
  if (hasDraw) gsap.registerPlugin(DrawSVGPlugin);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- page transitions (all pages) ---- */
  function setupPageTransitions() {
    if (reduce) return;
    var overlay = document.createElement("div");
    overlay.className = "page-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<span class="pt-mark">Ami<span class="r">R</span></span>';
    document.body.appendChild(overlay);

    gsap.set(overlay, { yPercent: 0 });
    gsap.to(overlay, { yPercent: -100, duration: 1, ease: "power4.inOut", delay: .05 });
    // safety net: a backgrounded/throttled tab can stall the rAF-driven tween indefinitely —
    // never leave the curtain covering real content.
    setTimeout(function () { gsap.set(overlay, { yPercent: -100 }); }, 2200);

    $$("a[href]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target === "_blank" || a.hasAttribute("download")) return;
        var url;
        try { url = new URL(a.href, location.href); } catch (err) { return; }
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.hash) return;
        e.preventDefault();
        gsap.killTweensOf(overlay);
        var navigated = false;
        var go = function () { if (navigated) return; navigated = true; window.location.href = url.href; };
        gsap.to(overlay, { yPercent: 0, duration: .5, ease: "power3.inOut", onComplete: go });
        setTimeout(go, 900); // never let a stalled tween block navigation
      });
    });
  }

  /* ---- reveal a whole element (no SplitText) for markup containing gradient-text
     spans, where per-word splitting would break the background-clip:text sweep ---- */
  function fadeUpReveal(el, opts) {
    if (!el || reduce) return;
    gsap.set(el, { transition: "none", autoAlpha: 0, y: (opts && opts.y) || 22 });
    gsap.to(el, {
      autoAlpha: 1, y: 0, duration: 1, ease: "power2.out",
      delay: (opts && opts.delay) || 0
    });
  }

  /* ---- hero h1 (index): additive fade/rise layered on top of the existing
     untouched line-mask CSS reveal — never touches the gradient <em> ---- */
  var heroH1 = $(".hero h1");
  if (heroH1) fadeUpReveal(heroH1, { y: 14, delay: .1 });

  /* ---- subpage page-hero h1: currently static "reveal in" (no animation at all) —
     GSAP takes full ownership of the entrance since nothing else drives it ---- */
  var pageHeroH1 = $(".page-hero h1");
  if (pageHeroH1) fadeUpReveal(pageHeroH1, { y: 24, delay: .1 });

  /* ---- section heading word-stagger (safe: none of these contain grad-sweep) ---- */
  function splitHeadingReveal(selector) {
    if (!hasSplit || !hasST || reduce) return;
    $$(selector).forEach(function (h) {
      var split = new SplitText(h, { type: "words", wordsClass: "sw-word" });
      gsap.set(split.words, { yPercent: 45, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: h,
        start: "top 85%",
        once: true,
        onEnter: function () {
          gsap.to(split.words, { yPercent: 0, autoAlpha: 1, duration: .8, ease: "power4.out", stagger: .045 });
        }
      });
    });
  }
  function runHeadingSplits() {
    splitHeadingReveal(".sec-head h2");
    splitHeadingReveal(".xp h2");
    splitHeadingReveal(".tool-cat h2");
  }
  // splitting before the webfont swaps in mismeasures word widths — wait for it.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(runHeadingSplits);
  else runHeadingSplits();

  /* ---- hero chartcard: dynamic asymmetric entrance (settles to the normal grid
     position — only the motion is bold, layout stays responsive-safe) ---- */
  var chartwrap = $(".chartwrap");
  if (chartwrap && !reduce) {
    gsap.set(chartwrap, { transition: "none", autoAlpha: 0, x: 34, y: 26, rotate: -3.5, scale: .95 });
    gsap.to(chartwrap, { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 1.1, ease: "power3.out", delay: .3 });
  }

  /* ---- hero chart line: scrub-drawn with scroll instead of a fixed on-reveal keyframe ---- */
  (function heroChartDraw() {
    var trend = $(".plot .trend");
    var hero = $(".hero");
    if (!trend || !hero) return;
    if (!hasDraw || !hasST || reduce) return;
    trend.style.animation = "none";
    gsap.fromTo(trend, { drawSVG: "0%" }, {
      drawSVG: "100%", ease: "none",
      scrollTrigger: { trigger: hero, start: "top 75%", end: "bottom 55%", scrub: .6 }
    });
  })();

  /* ---- "How I can help": pinned horizontal scroll on desktop/tablet.
     Overflow is hidden via .pin-mode CSS while pinned, which passively neutralises
     main.js's native drag-scroll/scrollLeft handling for that element — no JS
     coordination needed there beyond the wheel-redirect guard added in main.js. ---- */
  (function setupHelpsPin() {
    var sec = $(".helps-sec"), track = $(".helps");
    if (!sec || !track || !hasST || reduce) return;
    var mm = gsap.matchMedia();
    mm.add("(min-width: 761px)", function () {
      document.documentElement.classList.add("pin-mode");
      track.scrollLeft = 0;
      var dist = track.scrollWidth - track.clientWidth;
      if (dist <= 40) { document.documentElement.classList.remove("pin-mode"); return; }
      var tween = gsap.to(track, {
        x: -dist, ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top top", end: "+=" + (dist + 400),
          pin: true, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
      return function () {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
        document.documentElement.classList.remove("pin-mode");
      };
    });
  })();

  /* ---- Stats band: counters scrub with the natural scroll pass (no pin —
     stacked pins made the page feel scroll-jacked and laggy).
     main.js's generic count-up excludes .stats [data-count] to avoid double-driving. ---- */
  (function setupStatsScrub() {
    var sec = $(".stats");
    var nums = $$(".stats [data-count]");
    if (!sec || !nums.length || !hasST || reduce) return;
    var counters = nums.map(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = +(el.getAttribute("data-dec") || 0);
      el.textContent = (0).toFixed(dec);
      return { el: el, target: target, dec: dec };
    });
    var obj = { p: 0 };
    gsap.to(obj, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: sec, start: "top 88%", end: "top 30%", scrub: .4 },
      onUpdate: function () {
        counters.forEach(function (c) { c.el.textContent = (c.target * obj.p).toFixed(c.dec); });
      }
    });
  })();

  /* ---- statement marquee: skew with scroll velocity ---- */
  (function marqueeSkew() {
    var band = $(".bigline");
    if (!band || !hasST || reduce) return;
    var proxy = { skew: 0 }, clamp = gsap.utils.clamp(-6, 6);
    ScrollTrigger.create({
      onUpdate: function (self) {
        var s = clamp(self.getVelocity() / -300);
        if (Math.abs(s) > Math.abs(proxy.skew)) {
          proxy.skew = s;
          gsap.to(proxy, {
            skew: 0, duration: .8, ease: "power3", overwrite: true,
            onUpdate: function () { band.style.transform = "skewX(" + proxy.skew + "deg)"; }
          });
        }
      }
    });
  })();

  /* ---- cursor + magnetic buttons: spring-smoothed via quickTo (migrated from main.js) ---- */
  if (finePointer && !reduce) {
    var dot = document.createElement("div"); dot.className = "cursor";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    var dotX = gsap.quickTo(dot, "x", { duration: .12, ease: "power3.out" });
    var dotY = gsap.quickTo(dot, "y", { duration: .12, ease: "power3.out" });
    var ringX = gsap.quickTo(ring, "x", { duration: .45, ease: "power3.out" });
    var ringY = gsap.quickTo(ring, "y", { duration: .45, ease: "power3.out" });
    window.addEventListener("mousemove", function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });
    $$("a, button, .tlist li, .gtile, .case, .bubble").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("big"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("big"); });
    });

    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || .3;
      var mx = gsap.quickTo(el, "x", { duration: .5, ease: "power3.out" });
      var my = gsap.quickTo(el, "y", { duration: .5, ease: "power3.out" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * strength);
        my((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener("mouseleave", function () { mx(0); my(0); });
    });
  }

  /* ---- "How I can help" card icons: quick path-draw on hover ---- */
  if (hasDraw && finePointer && !reduce) {
    $$(".help").forEach(function (card) {
      var shapes = $$(".help-ic svg path, .help-ic svg circle", card);
      if (!shapes.length) return;
      gsap.set(shapes, { drawSVG: "100%" });
      card.addEventListener("mouseenter", function () {
        gsap.fromTo(shapes, { drawSVG: "0%" }, { drawSVG: "100%", duration: .6, ease: "power2.out", stagger: .04 });
      });
    });
  }

  setupPageTransitions();
})();
