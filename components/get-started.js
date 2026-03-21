/**
 * Get Started / CTA Component
 * Renders the "Ready to Move Without Pain?" call-to-action section.
 *
 * Usage: Add <div id="get-started-component"></div> where you want the section,
 * then include this script: <script src="components/get-started.js"></script>
 *
 * Or it will auto-inject before the locations section or footer.
 */
(function() {
  'use strict';

  var html = '<section class="section contact reveal" id="contact">' +
    '<div class="container">' +
    '<div class="contact-content">' +
    '<div class="contact-text">' +
    '<p class="section-label">Get Started</p>' +
    '<h2>Ready to Move <span class="text-accent">Without Pain?</span></h2>' +
    '<p>Take the first step toward recovery. Schedule a consultation with Dr. Elguizaoui to discuss your condition and explore your treatment options.</p>' +
    '<ul class="contact-benefits">' +
    '<li>Personalized treatment plans tailored to your goals</li>' +
    '<li>Minimally invasive approaches for faster recovery</li>' +
    '<li>Multiple convenient NYC locations</li>' +
    '<li>Same-week appointments available for urgent concerns</li>' +
    '</ul>' +
    '</div>' +
    '<div class="contact-actions">' +
    '<div class="contact-card">' +
    '<h3>Book Online</h3>' +
    '<p>Schedule your appointment through Zocdoc for instant confirmation.</p>' +
    '<a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" class="btn btn-primary btn-lg btn-block">Book on Zocdoc</a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</section>';

  // Inject HTML
  var placeholder = document.getElementById('get-started-component');
  if (placeholder) {
    placeholder.outerHTML = html;
  } else if (!document.getElementById('contact')) {
    // Auto-inject before locations or footer
    var locations = document.getElementById('locations');
    var footer = document.querySelector('footer.footer');
    var target = locations || footer;
    if (target) {
      target.insertAdjacentHTML('beforebegin', html);
    }
  }
})();
