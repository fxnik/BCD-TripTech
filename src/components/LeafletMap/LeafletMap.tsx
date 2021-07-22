import React, {FC, useEffect} from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import {useDispatch, useSelector} from 'react-redux'
import {setMapPointerAction} from '../../store/reducers/mapReducer'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';

//import $ from 'jquery'


import L from 'leaflet';
import 'leaflet/dist/leaflet.css'

import 'react-leaflet'

import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  

import './leafletMapStyle.css'

//==================================================================

const LeafletMap: FC = () => {    
    //const {mapPointer: map } = useTypedSelector(state => state.map)
    const {setMapPointerAction} = useActions()

    const setMapPointer = (map: any) => {
        setMapPointerAction(map)
    }  
    
    //============================= MAP INIT BEGIN =====================================================

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
            drawMarker:false     
        };        
        
        map.pm.addControls(options);

        console.log('getShapes= ',  map.pm.Draw.getShapes())

        setMapPointer(map)        
    }, [])
    
    //===========================  MAP INIT END ========================================================


    return (        
        <div id="map"  className="a__leaflet-map" >  
        
                  
              {/* <MapContainer 
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
               
            </MapContainer>  */}            
        </div>                
    )
}

export default LeafletMap


//===========================================

/* useEffect(()=>{
        var mapid = L.map('map',{
            //drawControl: true,
            doubleClickZoom: false
        }).setView([51.505, -0.09], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
        {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          
        }).addTo(mapid);

         setMapPointer(mapid)
    }, []) */
