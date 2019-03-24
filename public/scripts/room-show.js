/* eslint-disable prefer-template */
/* eslint-disable no-undef */
/* eslint-disable no-var */
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: room.geometry.coordinates,
    zoom: 3
  }),
  // create a HTML element for our room location/marker
  el = document.createElement('div');
el.className = 'marker';

// make a marker for our location and add to the map
new mapboxgl.Marker(el)
  .setLngLat(room.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }) // add popups
      .setHTML('<h3>' + room.name + '</h3><p>' + room.location + '</p>')
  )
  .addTo(map);
