/**
 * Sticky Bottom Bar Component
 * Shows Google rating, credentials marquee, and Book Now button.
 *
 * Usage: <script src="components/sticky-bar.js"></script>
 * Auto-detects subdirectory via script src path.
 */
(function() {
  'use strict';

  var prefix = window.NAV_PREFIX || '';
  if (!prefix) {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('components/sticky-bar.js') !== -1) {
        if (scripts[i].src.indexOf('../components/') !== -1) prefix = '../';
        break;
      }
    }
  }
  var p = prefix;

  var checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  var dotSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';

  var highlights = [
    '<span class="sticky-highlight">' + checkSvg + ' Board Certified</span>',
    '<span class="sticky-highlight">' + dotSvg + ' Jets Team Physician</span>',
    '<span class="sticky-highlight">' + dotSvg + ' NY Islanders Team Physician</span>',
    '<span>Lenox Hill Fellowship</span>',
    '<span>Minimally Invasive Surgery</span>',
    '<span>Ohio State Magna Cum Laude</span>'
  ];
  var trackContent = highlights.join('') + highlights.join('');

  var googleIcon = '<svg class="sticky-bar-google-icon" width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';

  var html = '<div class="sticky-bottom-bar" id="stickyBottomBar">' +
    '<div class="sticky-bar-info">' +
    '<div class="sticky-bar-rating">' +
    googleIcon +
    '<span class="sticky-bar-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>' +
    '<span class="sticky-bar-rating-text">4.8</span>' +
    '<span class="sticky-bar-review-count">(1,469 reviews)</span>' +
    '</div>' +
    '<div class="sticky-bar-divider"></div>' +
    '<div class="sticky-bar-marquee">' +
    '<div class="sticky-bar-track">' + trackContent + '</div>' +
    '</div></div>' +
    '<a href="' + p + 'book/" class="sticky-bar-btn">Book Now</a>' +
    '</div>';

  // Insert before closing body if no sticky bar exists
  if (!document.getElementById('stickyBottomBar')) {
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // Show on scroll
  var bar = document.getElementById('stickyBottomBar');
  if (bar) {
    var shown = false;
    window.addEventListener('scroll', function() {
      if (!shown && window.scrollY > 300) {
        bar.classList.add('visible');
        shown = true;
      } else if (shown && window.scrollY <= 300) {
        bar.classList.remove('visible');
        shown = false;
      }
    }, { passive: true });
  }
})();
