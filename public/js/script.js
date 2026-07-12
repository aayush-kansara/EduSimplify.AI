// EduSimplify AI — Minimal vanilla JS
// 1. Reveal sections on scroll
// 2. Add shadow to navbar on scroll

document.addEventListener('DOMContentLoaded', function () {

  // --- Reveal-on-scroll ---
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('es-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: no IntersectionObserver support
    revealEls.forEach(function (el) { el.classList.add('es-visible'); });
  }

  // --- Navbar shadow on scroll ---
  var navbar = document.getElementById('mainNav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.classList.add('es-scrolled');
    } else {
      navbar.classList.remove('es-scrolled');
    }
  });

});
