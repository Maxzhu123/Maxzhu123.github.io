/* Progressive enhancements: theme toggle, sticky header, scroll spy, year.
   The page is fully readable with JavaScript disabled. */
(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "theme";

  /* ---------- Theme toggle ---------- */

  var toggle = document.querySelector("[data-theme-toggle]");

  function preferredTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch (e) {}
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  applyTheme(preferredTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      applyTheme(next);
    });
  }

  /* ---------- Sticky header hairline ---------- */

  var header = document.querySelector("[data-header]");

  if (header) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    document.body.insertBefore(sentinel, document.body.firstChild);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          header.dataset.stuck = entries[0].isIntersecting ? "false" : "true";
        },
        { threshold: 0 }
      ).observe(sentinel);
    }
  }

  /* ---------- Scrollable nav: fade the edge only while there is more to see ---------- */

  var nav = document.querySelector("[data-nav]");

  if (nav) {
    var updateNav = function () {
      var overflowing = nav.scrollWidth > nav.clientWidth + 1;
      var atEnd =
        nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1;

      if (overflowing) {
        nav.setAttribute("data-overflow", "true");
      } else {
        nav.removeAttribute("data-overflow");
      }

      if (overflowing && atEnd) {
        nav.setAttribute("data-at-end", "true");
      } else {
        nav.removeAttribute("data-at-end");
      }
    };

    updateNav();
    nav.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    window.addEventListener("load", updateNav);
  }

  /* ---------- Scroll spy ---------- */

  var links = Array.prototype.slice.call(
    document.querySelectorAll("[data-nav] .nav__link")
  );

  var sections = links
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#"
        ? document.querySelector(id)
        : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var visible = new Map();

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        var best = null;
        var bestRatio = 0;
        visible.forEach(function (ratio, section) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = section;
          }
        });

        links.forEach(function (link) {
          var match = best && link.getAttribute("href") === "#" + best.id;
          if (match) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---------- Footer year ---------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
