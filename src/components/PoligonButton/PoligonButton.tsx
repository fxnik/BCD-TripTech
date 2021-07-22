import React, {FC, useEffect} from 'react'
//import {useDispatch, useSelector} from 'react-redux'

//import * as L from "leaflet";
import { useTypedSelector } from '../../hooks/useTypedSelector';
//import { useActions } from '../../hooks/useActions';

import L from 'leaflet';
import 'react-leaflet'

//import 'leaflet.pm';
//import 'leaflet.pm/dist/leaflet.pm.css';

import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  






//import './poligonButtonStyle.css'

//==================================================================


const PoligonButton: FC = () => {
    const {mapPointer: map } = useTypedSelector(state => state.map)
    //const {fetchTodos, setTodoPage} = useActions()
    
    
    
        /* useEffect(()=>{
      var options = {
        position: 'topright',    
        drawPolygon: true,  
        drawPolyline: false,  
        drawCircle: true,  
        drawCircleMarker: false,
        editPolygon: true,  
        deleteLayer: true,    
        drawRectangle: true, 
        drawMarker:false     
    };
    
    // add leaflet.pm controls to the map
    map.pm.addControls(options);
    }, [])     */
    
    

    const onDoubleClick = () => {     
      
        map?.flyTo([44.15, -133.23], 7, 
        {
          animate: true,
          duration: 15
        } 
       ); 
       
    }   

    
    return (
        <div className="a__poligon-button" onDoubleClick={onDoubleClick}>                    
            <span title="Draw a poligon"><i className="fas fa-draw-polygon"></i></span>                                        
        </div>
    )
}

export default PoligonButton


//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

/* 
const setClick = () => {
        var circle: any;       

         map!.on('dblclick', function(e: any) { 
            circle = L.circle(e.latlng, 100).addTo(map!);       
            

            circle.on('mousedown', function (e: any) { 
                //L.DomEvent.stopPropagation(e);               
                map!.dragging.disable();

                map!.on('mousemove', function (e: any) {
                    circle.setLatLng(e.latlng);
                  }); 
                  
                
            });

            circle.on('mouseup', function(e: any){ 
                map!.dragging.enable();                   
                map!.removeEventListener('mousemove');
            })
            
            
            //map!.removeEventListener('click');           
         })

         
    }
*/


//map.options.doubleClickZoom  = false

/* 
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

/* 
 circle.on({
  mousedown: function () {
    map.on('mousemove', function(e) {
      circle.setLatLng(e.latlng);
    });
  },
  click: function () {
    map.removeEventListener();
  }
});
*/

//====================================

/* 
        var drawnItems = new L.FeatureGroup();
        map!.addLayer(drawnItems);
        
        // Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems
          }
        });
        
        map!.addControl(drawControl);

        map!.on(L.Draw.Event.CREATED, function (e: any) {
            console.clear();
            var type = e.layerType
            var layer = e.layer;
            
          
            // Do whatever else you need to. (save to db, add to map etc)
            
            drawnItems.addLayer(layer);
            
            console.log("Coordinates:");
            
            if (type == "marker" || type == "circle" || type == "circlemarker"){
              console.log([layer.getLatLng().lat, layer.getLatLng().lng]);
            }
            else {
              var objects = layer.getLatLngs()[0];
              for (var i = 0; i < objects.length; i++){
                console.log([objects[i].lat,objects[i].lng]);
              }
            }
            
            
          });
*/