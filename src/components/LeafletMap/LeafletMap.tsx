import React, {FC, useEffect} from 'react'
//import { MapContainer, TileLayer } from 'react-leaflet'
//import {useDispatch, useSelector} from 'react-redux'
//import { setMapPointerAction, setMapLayersAction } from '../../store/reducers/mapReducer';
//import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';

//import $ from 'jquery'

import L from 'leaflet';
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import 'react-leaflet'

import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  

import './leafletMapStyle.css'

//=================================================================

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

//=================================================================

const LeafletMap: FC = () => {    
    
    const {setMapPointerAction, 
           addMapLayerAction,
           updateLayerAfterCuttingAction,
           removeMapLayerAction
          } = useActions()

    const setMapPointer = (map: L.DrawMap) => {
        setMapPointerAction(map)
    }  
    
     //MAP INIT BEGIN
     useEffect(()=>{        

        let osmUrl = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        osm = L.tileLayer(osmUrl, {
          maxZoom: 18,
          attribution: osmAttrib
        });
    
        let map = L.map('map').setView([19.04469, 72.9258], 12).addLayer(osm);

        var options: any = {
            position: 'topleft',    
            drawPolygon: true,  
            drawPolyline: true,  
            drawCircle: true,  
            drawCircleMarker: false,
            editPolygon: true,  
            deleteLayer: true,    
            drawRectangle: true, 
            drawMarker: false    
        };       
        map.pm.addControls(options);

        //-------------------------------------------------------------

        //Cut mode
        map.on('pm:cut', (event: any) => {
            console.log('pm:cut= ' ,event);

            event.layer.on('pm:remove', (event: any) => {
                console.log('pm:remove= ' ,event);

                removeMapLayerAction(event.layer._leaflet_id)
            });            

            let prev_leaflet_id: number = event.originalLayer._leaflet_id

            let new_obj: object = {
                layer_id: event.layer._leaflet_id, 
                layer: event.layer,
                shape: event.shape,
                typeEvent: event.type,
                isSavedInBd: false
            }

            updateLayerAfterCuttingAction([new_obj, prev_leaflet_id])
        }); 


        map.on('pm:create', function(event: any) {
            console.log('pm:create-event',  event)
            console.log('e1.shape = ', event.shape)          


            if(event.shape === "Polygon" || event.shape === "Rectangle" || event.shape === "Line" || event.shape === "Circle") {
                const obj: object = {
                    layer_id: event.layer._leaflet_id, 
                    layer: event.layer,
                    shape: event.shape,
                    typeEvent: event.type,
                    isSavedInBd: false
                }
                addMapLayerAction(obj)            

                event.layer.on('pm:remove', (event: any) => {
                    console.log('pm:remove= ' ,event);

                    removeMapLayerAction(event.layer._leaflet_id)
                });
            }           
        });
        
        //...................................

        setMapPointer(map)        
    }, [])    
    //MAP INIT END 


    return (        
        <div id="map"  className="a__leaflet-map" >                   
                         
        </div>                
    )
}

export default LeafletMap


//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

/* map.on('pm:create', function(e1: any) {
    console.log('pm:create event',  e1)
    console.log('Layers = ', map.pm.getGeomanLayers(false))            
  
    e1.layer.on('click', function(e2: any){
        console.log('click on ', e2)
  
        let latlng = e2.latlng
        console.log('LatLng=', latlng)

        //e2.target.remove()                
  
        L.marker(latlng).addTo(map);                
    })            
  }); */


  /* <MapContainer 
                center={[51.505, -0.09]} 
                zoom={13} 
                scrollWheelZoom={true} 
                whenCreated={setMapPointer} 
                doubleClickZoom={false} 
                zoomControl={false}
                //ref={mapRef}                           
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
               
            </MapContainer> */

