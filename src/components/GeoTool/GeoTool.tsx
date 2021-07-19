import React, {FC, useEffect} from 'react'
import ReactDOM from 'react-dom';
import {  Marker, Popup } from 'react-leaflet'
import * as L from "leaflet";
import Draggable, {DraggableCore} from 'react-draggable';
import PoligonButton from '../PoligonButton/PoligonButton'

import './geoToolStyle.css'

//=======================================================

const GeoTool: FC = () => {     
    

    return (        
        <Draggable handle=".a__geo-tool" >
            
            <div className="a__geo-tool">                
                <PoligonButton />
                
                <div>                    
                    <span className="a__icon" title="Draw a polyline"><i className="fas fa-chart-line"></i></span>                                        
                </div>
                <div>                    
                    <span className="a__icon" title="Draw a rectangle"><i className="fas fa-vector-square"></i></span>                                       
                </div>
                <div>                    
                    <span className="a__icon"title="Draw a circle"><i className="far fa-circle"></i></span>                                        
                </div> 
                <div>                    
                    <span className="a__icon"title="Draw a marker"><i className="fas fa-map-marker-alt"></i></span>                                        
                </div>             
            </div>
                   
      </Draggable>           
    )
}

export default GeoTool
