/**
 * Dev Tools Configuration
 * ========================
 * Internal development dashboard for the SamMD site.
 *
 * HOW TO ADD A NEW PAGE:
 * 1. Add an entry to the NAV_CONFIG array below
 * 2. Create an HTML file in /dev/ matching the path
 * 3. Include dev-layout.js in your page
 *
 * That's it. The sidebar, routing, and active states are automatic.
 */

var DEV_CONFIG = {
  siteName: 'SamMD Dev Tools',
  version: '1.0.0',

  // Navigation sections and items
  nav: [
    {
      section: 'Inspect',
      items: [
        { name: 'Components', path: '/sammd/dev/', icon: 'grid', description: 'Browse all reusable components' },
        { name: 'Routes Map', path: '/sammd/dev/routes.html', icon: 'map', description: 'All site pages and routes' },
        { name: 'Design Tokens', path: '/sammd/dev/tokens.html', icon: 'palette', description: 'Colors, typography, spacing' }
      ]
    },
    {
      section: 'Tools',
      items: [
        { name: 'API Tester', path: '/sammd/dev/api-tester.html', icon: 'zap', description: 'Test API endpoints' },
        { name: 'Feature Flags', path: '/sammd/dev/flags.html', icon: 'flag', description: 'Toggle features on/off' }
      ]
    },
    {
      section: 'Data',
      items: [
        { name: 'Database', path: '/sammd/dev/database.html', icon: 'database', description: 'Browse site data' },
        { name: 'Logs & Analytics', path: '/sammd/dev/logs.html', icon: 'activity', description: 'View event logs' }
      ]
    }
  ],

  // SVG icon paths (feather-style)
  icons: {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    palette: '<circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>'
  }
};

// Helper to render an icon SVG
function devIcon(name, size) {
  size = size || 18;
  var path = DEV_CONFIG.icons[name] || '';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}
