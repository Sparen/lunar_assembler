import L from 'leaflet';

export function init() {
  const map = new L.Map('map');
  map.setView([50, 20], 18);
  var mapLink: string = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);
}
