import React, {FC, useEffect} from 'react';

//import {  Marker, Popup } from 'react-leaflet'
//import { EditControl } from "react-leaflet-draw";

import AppContainer from './components/AppContainer/AppContainer'
import LeafletMap from './components/LeafletMap/LeafletMap'
//import GeoTool from './components/GeoTool/GeoTool'

import './App.css';

//----------------------------------------------------------


const App: FC = () => {
  return (
     <AppContainer>
         <LeafletMap />
         
                

     </AppContainer>
  );
} 



export default App;


//=========================================

/* 
function App() {

  useEffect(() => {
      const map = L.map("map").setView([43,
          -83.37146759033203], 14);


      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);




      const drawControl = new L.Control.Draw({
          position: "topleft"
      });


      const drawn_items = L.featureGroup([]).addTo(map);

      const layer_group = L.featureGroup([]).addTo(map);
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, function (event) {
          let layer = event.layer;
          drawn_items.addLayer(layer);
      });
  })


  return (
      <div>
          <div id="map"/>
      </div>
  );
}

*/

//===========================================

/* 
  function App() {
  const [center, setCenter] = useState<any>({ lat: 24.4539, lng: 54.3773 });
  const [mapLayers, setMapLayers] = useState<any>([]);

  const ZOOM_LEVEL = 12;
  const mapRef = useRef();

  const _onCreate = (e:any) => {
    console.log(e);

    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const { _leaflet_id } = layer;

      setMapLayers((layers:any) => [
        ...layers,
        { id: _leaflet_id, latlngs: layer.getLatLngs()[0] },
      ]);
    }
  };

  const _onEdited = (e:any) => {
    console.log(e);
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).map(({ _leaflet_id, editing }:any) => {
      setMapLayers((layers:any) =>
        layers.map((l:any) =>
          l.id === _leaflet_id
            ? { ...l, latlngs: { ...editing.latlngs[0] } }
            : l
        )
      );
    });
  };

  const _onDeleted = (e:any) => {
    console.log(e);
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).map(({ _leaflet_id }:any) => {
      setMapLayers((layers:any) => layers.filter((l:any) => l.id !== _leaflet_id));
    });
  };

  return (
    <>
      <header title="React Leaflet - Polygon" />

      <div className="row">
        <div className="col text-center">
          <h2>React-leaflet - Create, edit and delete polygon on map</h2>

          <div className="col">
            <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef}>
              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={_onCreate}
                  onEdited={_onEdited}
                  onDeleted={_onDeleted}
                  draw={{
                    rectangle: false,
                    polyline: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                  }}
                />
              </FeatureGroup>

              <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>
            
          </div>
        </div>
      </div>
    </>
  );
  
}

*/
