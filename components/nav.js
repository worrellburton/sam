/**
 * Navigation Component
 * Renders the site navigation bar with mega menu, theme toggle, and mobile nav.
 *
 * Usage: <script src="components/nav.js"></script>
 * Place at the top of <body>. Optionally set window.NAV_PREFIX = '../' for subdirectory pages.
 *
 * The script auto-detects if it's in a subdirectory by checking if the script src contains '../'.
 */
(function() {
  'use strict';

  // Auto-detect path prefix
  var prefix = window.NAV_PREFIX || '';
  if (!prefix) {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('components/nav.js') !== -1) {
        if (scripts[i].src.indexOf('../components/') !== -1) prefix = '../';
        break;
      }
    }
  }

  var p = prefix; // shorthand

  var html = '<nav class="nav" id="nav">' +
    '<div class="container nav-container">' +
    '<a href="' + p + 'index.html" class="nav-logo"><span class="logo-name">Sam Elguizaoui, M.D.</span></a>' +
    '<button class="nav-toggle" id="navToggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>' +
    '<ul class="nav-links" id="navLinks">' +
    '<li><a href="' + p + 'about.html">About</a></li>' +
    '<li class="nav-mega-wrap">' +
    '<a href="javascript:void(0)" class="nav-mega-toggle">Services <svg class="dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
    '<div class="mega-menu" id="megaMenu">' +
    '<button class="mega-back-btn" id="megaBackBtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back</button>' +
    '<div class="mega-menu-inner">' +
    '<div class="mega-col">' +
    '<h4 class="mega-heading">Treatments</h4>' +
    '<a href="' + p + 'sports-medicine.html" class="mega-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="4" r="2"/><path d="M4 17l4-2 3-5 4 2 3-4"/><path d="M8 15l-2 6"/><path d="M15 10l2 6"/><path d="M11 10l-3 5"/></svg><div><span>Sports Medicine</span><small>Athletic injury care &bull; Return to sport</small></div></a>' +
    '<a href="' + p + 'arthroscopic-surgery.html" class="mega-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><div><span>Arthroscopic Surgery</span><small>Minimally invasive &bull; Faster recovery</small></div></a>' +
    '<a href="' + p + 'regenerative-medicine.html" class="mega-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg><div><span>Regenerative Medicine</span><small>PRP therapy &bull; Biologic treatments</small></div></a>' +
    '</div>' +
    '<div class="mega-col">' +
    '<h4 class="mega-heading">Specialties</h4>' +
    '<a href="' + p + 'joint-preservation.html" class="mega-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><div><span>Joint Preservation</span><small>Save your natural joints</small></div></a>' +
    '<a href="' + p + 'cartilage-repair.html" class="mega-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><div><span>Cartilage Repair</span><small>Repair &bull; Transplant &bull; Restoration</small></div></a>' +
    '<a href="' + p + 'shoulder-knee-surgery.html" class="mega-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg><div><span>Shoulder &amp; Knee Surgery</span><small>ACL &bull; Rotator cuff &bull; Meniscus</small></div></a>' +
    '</div>' +
    '<div class="mega-col mega-cta-col">' +
    '<div class="mega-cta-card">' +
    '<h4>Ready to get started?</h4>' +
    '<p>Book a consultation with Dr. Elguizaoui today.</p>' +
    '<a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" class="btn btn-primary btn-block">Book on Zocdoc</a>' +
    '<a href="tel:+19179059370" class="mega-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> +1-917-905-9370</a>' +
    '</div></div></div></div></li>' +
    '<li><a href="' + p + 'reviews.html">Reviews</a></li>' +
    '<li><a href="' + p + 'faq.html">FAQ</a></li>' +
    '<li><a href="' + p + 'blog.html">Blog</a></li>' +
    '<li class="nav-buttons">' +
    '<a href="' + p + 'contact.html" class="nav-btn-contact">Contact Us</a>' +
    '<a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" class="nav-btn-book">Book Now</a>' +
    '<button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">' +
    '<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
    '<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
    '</button></li></ul></div></nav>';

  // Insert at beginning of body
  var placeholder = document.getElementById('nav-component');
  if (placeholder) {
    placeholder.outerHTML = html;
  } else if (!document.getElementById('nav')) {
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  // Initialize nav behaviors
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    // Sticky nav with hide on scroll
    var lastScrollY = 0, ticking = false;
    function updateNav() {
      var sy = window.scrollY;
      nav.classList.toggle('scrolled', sy > 50);
      if (sy > lastScrollY && sy > 200) nav.classList.add('nav-hidden');
      else nav.classList.remove('nav-hidden');
      lastScrollY = sy;
      ticking = false;
    }
    window.addEventListener('scroll', function() {
      if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
    }, { passive: true });

    // Theme toggle
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }

    // Mobile nav toggle
    var toggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (toggle && navLinks) {
      toggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        toggle.classList.toggle('active');
      });
    }

    // Mega menu toggle for tablet
    var megaToggle = document.querySelector('.nav-mega-toggle');
    var megaWrap = document.querySelector('.nav-mega-wrap');
    if (megaToggle) {
      megaToggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.innerWidth <= 1024) {
          megaWrap.classList.toggle('open');
        }
      });
    }

    // Mega back button
    var megaBack = document.getElementById('megaBackBtn');
    if (megaBack) {
      megaBack.addEventListener('click', function() {
        megaWrap.classList.remove('open');
      });
    }
  }

  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
