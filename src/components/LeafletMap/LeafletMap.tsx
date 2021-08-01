import React, {FC, useEffect} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
    
    const { currentRegionId, 
            mapPointer,
            onMapRegions } = useTypedSelector(state => state.app)
    
    const {setMapPointerAction, 
           addLayerToRegionAction,
           updateRegionAfterCuttingAction,
           removeRegionItemAction
          } = useActions()

    const setMapPointer = (map: L.DrawMap) => {
        setMapPointerAction(map)
    }  

    //----------------------------------------------------------------
    
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
        //map.pm.toggleControls(); //invisible      

        //--------------------------

        setMapPointer(map)        
    }, [])    
    //MAP INIT END 

    //--------------------------------------------------------------------

    useEffect(()=>{
        mapPointer?.on('pm:create', function(event: any) {
            console.log('pm:create-event',  event)           
            
            /* event.layer.bindTooltip(event.shape + '-' + event.layer._leaflet_id.toString(),
                        {
                            permanent: false 
                        })
                       .openTooltip(); */


            if(event.shape === "Polygon" || event.shape === "Rectangle" || event.shape === "Line" || event.shape === "Circle") {
            
                event.layer.on('pm:remove', (event: any) => {
                  console.log('pm:remove= ' ,event);                

                  removeRegionItemAction(event.layer._leaflet_id)
                });  

                addLayerToRegionAction(event.layer) 
            }           
        });

        return ()=>{mapPointer?.off('pm:create')}

    }, [mapPointer])

    //--------------------------------------------------------------------

    useEffect(()=>{
        //Cut mode
        mapPointer?.on('pm:cut', (event: any) => {
            console.log('pm:cut event= ' ,event);

            //------------------------------------------------
            
            let new_layer_arr = []
            
            //------------------------------------------------

             if(event.originalLayer.pm._shape === "Line") {                
                let polyline:any;

                for(let layer of Object.keys(event.layer._layers)){
                    console.log('layer= ', event.layer._layers[layer])

                    polyline = L.polyline(event.layer._layers[layer]._latlngs, event.originalLayer.options).addTo(mapPointer);
                    
                    /* polyline.bindTooltip("Line" + '-' + polyline._leaflet_id.toString(),
                    {
                        permanent: false 
                    })
                    .openTooltip(); */

                    polyline.on('pm:remove', (event: any) => {
                        console.log('pm:remove= ' ,event);                     
                        
                        removeRegionItemAction(event.layer._leaflet_id)
                    }); 

                    new_layer_arr.push(polyline)
                } 

                let prev_leaflet_id: number = event.originalLayer._leaflet_id 
                event.layer.remove()
                updateRegionAfterCuttingAction([new_layer_arr, prev_leaflet_id])                 
            }            
            
            //-------------------------------------------------------------------

             if(event.originalLayer.pm._shape === "Polygon" || event.originalLayer.pm._shape === "Rectangle") {                
                let polygon:any;

                for(let i=0; i < (event.layer._latlngs).length; i++){ 
                    
                    polygon = L.polygon(event.layer._latlngs[i], event.originalLayer.options).addTo(mapPointer);

                    /* polygon.bindTooltip("Polygon" + '-' + polygon._leaflet_id.toString(),
                    {
                        permanent: false 
                    })
                    .openTooltip(); */

                    polygon.on('pm:remove', (event: any) => {
                        console.log('pm:remove= ' ,event);                       

                        removeRegionItemAction(event.layer._leaflet_id)
                    }); 

                    new_layer_arr.push(polygon)
                }     

                let prev_leaflet_id: number = event.originalLayer._leaflet_id 
                event.layer.remove()
                updateRegionAfterCuttingAction([new_layer_arr, prev_leaflet_id]) 
            }             
        }); 

        return ()=>{mapPointer?.off('pm:cut')}

    }, [mapPointer])

    //------------------------------------------

    useEffect(()=>{
        if(currentRegionId === -1 && mapPointer?.pm.controlsVisible()) 
            mapPointer?.pm.toggleControls();

        if(currentRegionId !== -1 && !mapPointer?.pm.controlsVisible()) 
            mapPointer?.pm.toggleControls(); 

        }, [currentRegionId, mapPointer])

    //----------------------------------------------

    useEffect(()=>{
        onMapRegions.forEach((obj)=>{
            if(currentRegionId !== -1 && currentRegionId === obj.leaflet_id) {
                mapPointer?.addLayer(obj.regionLayer);                
            } else {
                mapPointer?.removeLayer(obj.regionLayer);                
            }
        })

    }, [currentRegionId, onMapRegions, mapPointer])

    //--------------------------------------------------------------------

    return (        
        <div id="map"  className="a__leaflet-map" >                   
                         
        </div>                
    )
}

export default LeafletMap


