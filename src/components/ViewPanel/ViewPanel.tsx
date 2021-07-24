import React, {FC, useEffect} from 'react'
//import {useDispatch, useSelector} from 'react-redux'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';

import L from 'leaflet';
import 'react-leaflet'
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'; 

import MapLayer from '../MapLayer/MapLayer'

import './viewPanelStyle.css'
//import { setUnsavedLayersIsOpenedAction } from '../../store/reducers/mapReducer';

//==================================================================


const ViewPanel: FC = () => {
    const { 
            viewPanelIsOpened, 
            unsavedLayersIsOpened,
            savedLayersIsOpened,
            mapLayers 
          } = useTypedSelector(state => state.app)

    const { setUnsavedLayersIsOpenedAction, setSavedLayersIsOpenedAction } = useActions() 

    //.........................................................    
    
    const unsavedLayersOnClickHandler = ()=>{
        if(unsavedLayersIsOpened) return

        setUnsavedLayersIsOpenedAction(!unsavedLayersIsOpened)
        setSavedLayersIsOpenedAction(!savedLayersIsOpened)
    }

    const savedLayersOnClickHandler = ()=>{
        if(savedLayersIsOpened) return

        setUnsavedLayersIsOpenedAction(!unsavedLayersIsOpened)
        setSavedLayersIsOpenedAction(!savedLayersIsOpened)
    }

    //.........................................................
    
    return (
        <div className={viewPanelIsOpened ? "a__view-panel a__is-opened": "a__view-panel"} >                    
           
           <div className="a__top-box">
               <div className={unsavedLayersIsOpened ? "a__unsavedLayersBtn a__active" : "a__unsavedLayersBtn"} 
                    title="map layers"
                    onClick={unsavedLayersOnClickHandler}
               >
                  <i className="fas fa-map-marked-alt"></i>
               </div>

               <div className={savedLayersIsOpened ? "a__savedLayersBtn a__active" : "a__savedLayersBtn"} 
                    title="db layers"
                    onClick={savedLayersOnClickHandler}
               >
                  <i className="fas fa-database"></i>
               </div>
           </div> 

           {/* ======================================================= */}

           <div className={unsavedLayersIsOpened ? "a__unsavedLayersContainer a__active" : "a__unsavedLayersContainer" }>
               
               {mapLayers.map((o, i)=>{
                   return <MapLayer  obj={o} key={i}/>
               })}
           </div>

           <div className={savedLayersIsOpened ? "a__savedLayersContainer a__active" : "a__savedLayersContainer" }>
               db
           </div>


        </div>
    )
}

export default ViewPanel


//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

