/**
 * Dev Tools Layout
 * ================
 * Shared layout for all /dev/ pages. Creates sidebar navigation
 * and main content area automatically.
 *
 * Usage: Include config.js then this file in any /dev/ page:
 *   <script src="config.js"></script>
 *   <script src="dev-layout.js"></script>
 *
 * The page content should be inside <main id="dev-content">...</main>
 */
(function() {
  'use strict';

  var currentPath = window.location.pathname;
  var collapsed = localStorage.getItem('dev-sidebar-collapsed') === 'true';

  function buildSidebar() {
    var html = '<aside class="dev-sidebar' + (collapsed ? ' collapsed' : '') + '" id="devSidebar">';

    // Header
    html += '<div class="dev-sidebar-header">';
    html += '<a href="/sammd/dev/" class="dev-logo">';
    html += '<span class="dev-logo-icon">&#9670;</span>';
    html += '<span class="dev-logo-text">' + DEV_CONFIG.siteName + '</span>';
    html += '</a>';
    html += '<button class="dev-collapse-btn" id="devCollapseBtn" title="Toggle sidebar">' + devIcon('chevronLeft', 16) + '</button>';
    html += '</div>';

    // Nav sections
    DEV_CONFIG.nav.forEach(function(section) {
      html += '<div class="dev-nav-section">';
      html += '<div class="dev-nav-section-label">' + section.section + '</div>';
      section.items.forEach(function(item) {
        var isActive = currentPath === item.path || (currentPath.endsWith('/dev/') && item.path.endsWith('/dev/')) || (currentPath.endsWith('/dev/index.html') && item.path.endsWith('/dev/'));
        html += '<a href="' + item.path + '" class="dev-nav-item' + (isActive ? ' active' : '') + '" title="' + item.name + '">';
        html += '<span class="dev-nav-icon">' + devIcon(item.icon, 18) + '</span>';
        html += '<span class="dev-nav-label">' + item.name + '</span>';
        html += '</a>';
      });
      html += '</div>';
    });

    // Version
    html += '<div class="dev-sidebar-footer">';
    html += '<span class="dev-badge">DEV</span>';
    html += '<span class="dev-version">v' + DEV_CONFIG.version + '</span>';
    html += '</div>';

    html += '</aside>';
    return html;
  }

  function buildTopBar() {
    return '<div class="dev-topbar" id="devTopbar">' +
      '<button class="dev-menu-btn" id="devMenuBtn">' + devIcon('menu', 20) + '</button>' +
      '<span class="dev-badge">DEV</span>' +
      '<a href="/sammd/" class="dev-back-link">Back to site &rarr;</a>' +
      '</div>';
  }

  // Wrap existing content
  var content = document.getElementById('dev-content');
  if (!content) return;

  var wrapper = document.createElement('div');
  wrapper.className = 'dev-layout';
  wrapper.innerHTML = buildSidebar() + buildTopBar() + '<div class="dev-main" id="devMain"></div>';

  content.parentNode.insertBefore(wrapper, content);
  document.getElementById('devMain').appendChild(content);

  // Sidebar toggle
  var sidebar = document.getElementById('devSidebar');
  var collapseBtn = document.getElementById('devCollapseBtn');
  var menuBtn = document.getElementById('devMenuBtn');

  collapseBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('dev-sidebar-collapsed', sidebar.classList.contains('collapsed'));
  });

  menuBtn.addEventListener('click', function() {
    sidebar.classList.toggle('mobile-open');
  });
})();
