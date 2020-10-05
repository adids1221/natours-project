const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpZHMxMjIxIiwiYSI6ImNrZndpYXI2NTFndTkzNnN2amEzZDE5aG4ifQ.ssAyeia0i1QqWMa6W341Gw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/adids1221/ckfwjmc3j04kt19uewksas4vy',
    scrollZoom: false
    /* center: [-118.209343, 33.978464],
    zoom: 10,
    interactive: false */
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //Create a marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add a marker - using the location coordinates
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat(loc.coordinates)
        .addTo(map);

    //Add popup
    new mapboxgl.Popup({
        offset: 30
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

//Make the map fit the bounds after adding all the locations
map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }
});
