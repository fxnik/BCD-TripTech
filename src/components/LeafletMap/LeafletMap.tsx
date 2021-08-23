import { FC, useEffect } from "react";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import {IMapRegion} from '../../store/reducers/mapReducer'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "./leafletMapStyle.css";

//-----------------------

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

//-----------------------

const LeafletMap: FC = () => {
  const { currentRegionId, mapPointer, onMapRegions } = useTypedSelector(
    (state) => state.app
  );

  const {
    setMapPointerAction,
    addLayerToRegionAction,
    updateRegionAfterCuttingAction,
    removeRegionItemAction,
    CallChangeIndicatorFunctionAction,        
  } = useActions();

  const setMapPointer = (map: L.DrawMap) => {
    setMapPointerAction(map);
  };

  //-----------------

  useEffect(() => {
    let googleStreets = L.tileLayer(
      "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }
    );

    let map = L.map("map")
      .setView([19.04469, 72.9258], 12)
      .addLayer(googleStreets);

    var options: any = {
      position: "topleft",
      drawPolygon: true,
      drawPolyline: true,
      drawCircle: true,
      drawCircleMarker: false,
      editPolygon: true,
      deleteLayer: true,
      drawRectangle: true,
      drawMarker: false,
    };
    map.pm.addControls(options);

    setMapPointer(map);
  }, []);

  //------------------------

  useEffect(() => {
    mapPointer?.on("pm:create", function (event: any) {
      if (event.shape === "Polygon") {
        let polygon: any = L.polygon(
          event.layer._latlngs,
          event.layer.options
        ).addTo(mapPointer);
        polygon.pm._shape = "Polygon";
        event.layer.remove();

        polygon.on("pm:remove", (event: any) => {
          console.log("pm:remove= ", event);

          removeRegionItemAction(polygon._leaflet_id);
        });

        CallChangeIndicatorFunctionAction();

        onMapRegions.forEach((obj: IMapRegion) => { 
          if (obj.leaflet_id === currentRegionId) {
            obj.regionLayer.addLayer(polygon);            
          }          
        });
        addLayerToRegionAction(polygon);

      } else if (event.shape === "Rectangle") {
        let rectangle: any = L.rectangle(
          event.layer._latlngs,
          event.layer.options
        ).addTo(mapPointer);
        rectangle.pm._shape = "Rectangle";
        event.layer.remove();

        rectangle.on("pm:remove", (event: any) => {
          removeRegionItemAction(rectangle._leaflet_id);
        });

        CallChangeIndicatorFunctionAction();

        onMapRegions.forEach((obj: IMapRegion) => { //==============>>>
          if (obj.leaflet_id === currentRegionId) {
            obj.regionLayer.addLayer(rectangle);            
          }          
        });

        addLayerToRegionAction(rectangle);      

      } else if (event.shape === "Line") {
        let polyline: any = L.polyline(
          event.layer._latlngs,
          event.layer.options
        ).addTo(mapPointer);
        polyline.pm._shape = "Line";
        event.layer.remove();

        polyline.on("pm:remove", (event: any) => {
          removeRegionItemAction(polyline._leaflet_id);
        });

        CallChangeIndicatorFunctionAction();

        onMapRegions.forEach((obj: IMapRegion) => { 
          if (obj.leaflet_id === currentRegionId) {
            obj.regionLayer.addLayer(polyline);            
          }          
        });
        addLayerToRegionAction(polyline);

      } else if (event.shape === "Circle") {
        let circle: any = L.circle(
          event.layer._latlng,
          event.layer.options
        ).addTo(mapPointer);
        circle.pm._shape = "Circle";
        event.layer.remove();

        circle.on("pm:remove", (event: any) => {
          removeRegionItemAction(circle._leaflet_id);
        });

        CallChangeIndicatorFunctionAction();

        onMapRegions.forEach((obj: IMapRegion) => { 
          if (obj.leaflet_id === currentRegionId) {
            obj.regionLayer.addLayer(circle);            
          }          
        });
        addLayerToRegionAction(circle);
      }
    });

    return () => {
      mapPointer?.off("pm:create");
    };
  }, [mapPointer, onMapRegions, currentRegionId]);

  //------------------

  useEffect(() => {
    mapPointer?.on("pm:cut", (event: any) => {
      CallChangeIndicatorFunctionAction();

      let new_layer_arr: any[] = [];

      if (event.originalLayer.pm._shape === "Line") {
        let polyline: any;

        for (let layer of Object.keys(event.layer._layers)) {
          polyline = L.polyline(
            event.layer._layers[layer]._latlngs,
            event.originalLayer.options
          ).addTo(mapPointer);
          polyline.pm._shape = "Line";

          polyline.on("pm:remove", (event: any) => {
            removeRegionItemAction(event.layer._leaflet_id);
          });

          new_layer_arr.push(polyline);
        }

        let prev_leaflet_id: number = event.originalLayer._leaflet_id;
        event.layer.remove();

        //----------------
        onMapRegions.forEach((obj: IMapRegion) => {
          if (obj.leaflet_id === currentRegionId) {
            obj.regionLayer.removeLayer(prev_leaflet_id);  
            
            new_layer_arr.forEach((element) => {
              obj.regionLayer.addLayer(element);              
            });
          }
          return obj;
        });
        //----------------
        updateRegionAfterCuttingAction([new_layer_arr, prev_leaflet_id]);
      }

      //------------------------

      if (
        event.originalLayer.pm._shape === "Polygon" ||
        event.originalLayer.pm._shape === "Rectangle"
      ) {
        let polygon: any;

        if (event.layer.feature.geometry.type === "Polygon") {
          polygon = L.polygon(
            event.layer._latlngs,
            event.originalLayer.options
          ).addTo(mapPointer);
          polygon.pm._shape = "Polygon";

          polygon.on("pm:remove", (event: any) => {
            removeRegionItemAction(event.layer._leaflet_id);
          });

          new_layer_arr.push(polygon);
        }

        //-------------------------

        if (event.layer.feature.geometry.type === "MultiPolygon") {
          for (let i = 0; i < event.layer._latlngs.length; i++) {
            polygon = L.polygon(
              event.layer._latlngs[i],
              event.originalLayer.options
            ).addTo(mapPointer);
            polygon.pm._shape = "Polygon";

            polygon.on("pm:remove", (event: any) => {
              removeRegionItemAction(event.layer._leaflet_id);
            });

            new_layer_arr.push(polygon);
          }
        }

        //--------------------

        let prev_leaflet_id: number = event.originalLayer._leaflet_id;
        event.layer.remove();

        //----------------
        onMapRegions.forEach((obj: IMapRegion) => {
          if (obj.leaflet_id === currentRegionId) {
            obj.regionLayer.removeLayer(prev_leaflet_id);  
            
            new_layer_arr.forEach((element) => {
              obj.regionLayer.addLayer(element);              
            });
          }
          return obj;
        });
        //----------------

        updateRegionAfterCuttingAction([new_layer_arr, prev_leaflet_id]);
      }
    });

    return () => {
      mapPointer?.off("pm:cut");
    };
  }, [mapPointer, onMapRegions, currentRegionId]);

  //-----------------------

  useEffect(() => {
    if (currentRegionId === -1 && mapPointer?.pm.controlsVisible())
      mapPointer?.pm.toggleControls();

    if (currentRegionId !== -1 && !mapPointer?.pm.controlsVisible())
      mapPointer?.pm.toggleControls();
  }, [currentRegionId, mapPointer]);

  //-----------------------

  useEffect(() => {
    onMapRegions.forEach((obj) => {
      if (currentRegionId !== -1 && currentRegionId === obj.leaflet_id) {
        mapPointer?.addLayer(obj.regionLayer);
      } else {
        mapPointer?.removeLayer(obj.regionLayer);
      }
    });
  }, [currentRegionId, onMapRegions, mapPointer]);

  //----------------------

  return <div id="map" className="a__leaflet-map"></div>;
};

export default LeafletMap;

//----------------------------------

/* let osmUrl = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        osm = L.tileLayer(osmUrl, {
          maxZoom: 18,
          attribution: osmAttrib
        });
        let map = L.map('map').setView([19.04469, 72.9258], 12).addLayer(osm); */

//Hybrid map
/* let googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
        });       
        let map = L.map('map').setView([19.04469, 72.9258], 12).addLayer(googleHybrid);  */

//satellite
/* let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
        });
        let map = L.map('map').setView([19.04469, 72.9258], 12).addLayer(googleSat); */

//Terrain
/* let googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
        });
        let map = L.map('map').setView([19.04469, 72.9258], 12).addLayer(googleTerrain); */
