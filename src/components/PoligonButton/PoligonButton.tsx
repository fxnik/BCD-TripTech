import React, {FC} from 'react'
//import {useDispatch, useSelector} from 'react-redux'
import 'react-leaflet'
//import * as L from "leaflet";
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';

//import MarkerClusterGroup from "react-leaflet-markercluster";

//import './poligonButtonStyle.css'


//==================================================================


const PoligonButton: FC = () => {
    const {mapPointer: map } = useTypedSelector(state => state.map)
    //const {fetchTodos, setTodoPage} = useActions()   
    

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


//map.options.doubleClickZoom  = false