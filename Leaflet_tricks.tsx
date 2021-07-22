c/* onst onDoubleClick = () => {
    map.flyTo([44.15, -133.23], 7, 
        {
          animate: true,
          duration: 5
        }
    ); 

    

    let polygon = L.polygon([
        [46.01, -130.01],
        [40.81, -128.76],
        [44.15, -133.23]
    ],{
        color: 'blue',
        fillColor: 'yellow',
        fillOpacity: 0.5
    }).addTo(map);

    polygon.on('contextmenu', function () {
        alert('contextmenu')
    });

    let marker1 = L.marker([46.01, -130.01]).addTo(map);
    let marker2 = L.marker([40.81, -128.76]).addTo(map);
    let marker3 = L.marker([44.15, -133.23]).addTo(map);

    let circle = L.circle([46.01, -130.01], 25000, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.4
    }).addTo(map);


    const basemapsDict = {
        osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        hot: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        cycle: "https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
      }

      @import url("~leaflet/dist/leaflet.css");
      @import url("~react-leaflet-markercluster/dist/styles.css");
      @import url("~antd/dist/antd.css");


      import MarkerClusterGroup from "react-leaflet-markercluster";

      var markers = L.markerClusterGroup();
      markers.clearLayers();
      L.geoJson()
      markers.addLayer(layer);
	  markers.addTo(myMap); */

      //===============================================================

      /* 
       var circle = L.circle([51.505, -0.09], 100).addTo(map!);

        circle.on({
          mousedown: function () {
            map!.dragging.disable();

            map!.on('mousemove', function (e: any) {
              circle.setLatLng(e.latlng);
            });
          }
       }); 
       map!.on('mouseup',function(e){
         map!.dragging.enable();
         map!.removeEventListener('mousemove');
       }) 
      */
      



      


