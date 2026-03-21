/**
 * Locations Component
 * Renders the locations section with Google Maps integration.
 *
 * Usage: Add <div id="locations-component"></div> where you want the section,
 * then include this script: <script src="components/locations.js"></script>
 *
 * Or it will auto-inject before the footer if no placeholder is found.
 */
(function() {
  'use strict';

  var LOCATIONS = [
    { id: 'map-ues', lat: 40.7720, lng: -73.9615, label: 'Upper East Side', address: '159 East 74th St, New York, NY', query: '159+East+74th+Street+New+York+NY', display: 'Upper East Side: 159 East 74th St' },
    { id: 'map-wv', lat: 40.7375, lng: -73.9990, label: 'West Village', address: '200 West 13th St, New York, NY', query: '200+West+13th+Street+New+York+NY', display: 'Greenwich Village: 200 West 13th St' },
    { id: 'map-bk', lat: 40.6860, lng: -73.9870, label: 'Brooklyn', address: '161 Atlantic Ave, Brooklyn, NY', query: '161+Atlantic+Avenue+Brooklyn+NY', display: 'Brooklyn Heights: 161 Atlantic Ave' }
  ];

  var ARROW_SVG = '<svg class="location-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';
  var BOOK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

  function buildHTML() {
    var cards = LOCATIONS.map(function(loc) {
      return '<div class="location-card" data-lat="' + loc.lat + '" data-lng="' + loc.lng + '" data-label="' + loc.label + '" data-address="' + loc.address + '" data-query="' + loc.query + '">' +
        '<div class="location-map" id="' + loc.id + '"></div>' +
        '<a href="https://www.google.com/maps/search/?api=1&query=' + loc.query + '" target="_blank" rel="noopener" class="location-label">' +
        '<span>' + loc.display + '</span>' + ARROW_SVG + '</a></div>';
    }).join('');

    return '<section class="section locations reveal" id="locations">' +
      '<div class="container">' +
      '<div class="locations-header"><div>' +
      '<h2>Dr. Elguizaoui sees patients at these New York Orthopedics locations</h2>' +
      '</div>' +
      '<a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" class="locations-book-btn">Book Appointment ' + BOOK_SVG + '</a>' +
      '</div>' +
      '<div class="locations-grid">' + cards + '</div>' +
      '</div></section>';
  }

  // Inject HTML
  var placeholder = document.getElementById('locations-component');
  if (placeholder) {
    placeholder.outerHTML = buildHTML();
  } else {
    // Auto-inject before footer if no placeholder
    var footer = document.querySelector('footer.footer');
    if (footer && !document.getElementById('locations')) {
      footer.insertAdjacentHTML('beforebegin', buildHTML());
    }
  }

  // Initialize Google Maps
  var ls = document.getElementById('locations');
  if (!ls) return;

  var mapsLoaded = false;

  var darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8888aa' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a5c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1e' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
  ];

  var lightMapStyle = [
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8fc' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4edda' }] }
  ];

  function getMapStyle() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? lightMapStyle : darkMapStyle;
  }

  window.initLocationMaps = function() {
    if (mapsLoaded) return;
    mapsLoaded = true;
    var cards = ls.querySelectorAll('.location-card');
    var maps = [];

    cards.forEach(function(card) {
      var lat = parseFloat(card.dataset.lat);
      var lng = parseFloat(card.dataset.lng);
      var label = card.dataset.label;
      var address = card.dataset.address;
      var mapDiv = card.querySelector('.location-map');

      var map = new google.maps.Map(mapDiv, {
        center: { lat: lat, lng: lng },
        zoom: 14,
        styles: getMapStyle(),
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        backgroundColor: '#1a1a2e'
      });

      var marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4F6BFF',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3
        }
      });

      var infoWindow = new google.maps.InfoWindow({
        content: '<div style="font-family:Inter,sans-serif;padding:4px 2px"><strong style="font-size:14px">' + label + '</strong><br><span style="color:#666;font-size:12px">' + address + '</span></div>'
      });

      marker.addListener('click', function() { infoWindow.open(map, marker); });
      maps.push(map);
    });

    // Update map styles when theme changes
    new MutationObserver(function() {
      var style = getMapStyle();
      maps.forEach(function(m) { m.setOptions({ styles: style }); });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  };

  // Lazy-load Google Maps API when section comes into view
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCDYVX9sM-Tkoun755-ZLP4KpjZGufBJbM&callback=initLocationMaps';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        obs.unobserve(ls);
      }
    });
  }, { rootMargin: '500px' });
  obs.observe(ls);
})();
