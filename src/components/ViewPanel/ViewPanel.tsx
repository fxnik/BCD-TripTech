import React, {FC, useEffect} from 'react'
//import {useDispatch, useSelector} from 'react-redux'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { useHttp } from '../../hooks/useHttp'
import { useHistory } from "react-router-dom";

import L from 'leaflet';
import 'react-leaflet'
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'; 

import Region from '../Region/Region'

import './viewPanelStyle.css'

//==================================================================

const ViewPanel: FC = () => {
    const { 
            viewPanelIsOpened, 
            unsavedLayersIsOpened,
            savedLayersIsOpened,
            mapLayers,
            mapPointer: map,
            currentRegionId,
            onMapRegions
          } = useTypedSelector(state => state.app)

    const { setUnsavedLayersIsOpenedAction,
            setSavedLayersIsOpenedAction,
            setCurrentRegionIdAction,
            addNewRegionAction,
            setUserIsAuthorizedAction        
        } = useActions() 

    const {request} = useHttp()
    let history = useHistory();

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

    const createNewRegionHandler = () => {
        let layerGroup: any = L.layerGroup([ /*  L.circle([19.04469, 72.9258], {radius: 1000})  */ ])
        layerGroup.addTo(map!)        

        console.log('layerGroup=', layerGroup)
        console.log('layerGroup._leaflet_id=', layerGroup._leaflet_id)

        addNewRegionAction([
                             {
                                 leaflet_id: layerGroup._leaflet_id,
                                 regionLayer: layerGroup,
                                 name: "LayerGroup",
                                 description: "This region for ..."
                             },
                             layerGroup._leaflet_id
                           ])
    }

    const logOutHandler = async () => {
        console.log('sign out')

        let userData: string | null = localStorage.getItem('userData')
        let token: string;

        if(userData) token = JSON.parse(userData).token
        else return        

        try {
            const data = await request('http://127.0.0.1:8000/api/logout', 
                                      'post',
                                       {}, 
                                       {'Authorization': `Bearer ${token}`})  
            //const data = await request('http://45.84.226.158:5050/api/register', 'post', {...form})         
            console.log('data= ', data)
 
            if(data.message === 'token_deleted') {
                localStorage.removeItem('userData');
                setUserIsAuthorizedAction(false)
                //history.push("/auth");
            } else if(data.message === 'user_exists'){
                alert('User with such email is already exists')
            }
         } catch(e) {
             throw e 
         }      

    }

    //.........................................................
    
    return (
        <div className={viewPanelIsOpened ? "a__view-panel a__is-opened": "a__view-panel"} >                    
           
           <div className="a__top-box">
               <div className={unsavedLayersIsOpened ? "a__unsaved-layers-btn a__active" : "a__unsaved-layers-btn"} 
                    title="map layers"
                    onClick={unsavedLayersOnClickHandler}
               >
                  <i className="fas fa-map-marked-alt"></i>
               </div>

               <div className={savedLayersIsOpened ? "a__saved-layers-btn a__active" : "a__saved-layers-btn"} 
                    title="db layers"
                    onClick={savedLayersOnClickHandler}
               >
                  <i className="fas fa-database"></i>
               </div>

               {currentRegionId > 0 ? 
                  <div className={unsavedLayersIsOpened ? "a__create-region-btn" : "a__create-region-btn a__disabled"} 
                       title="create new region"
                       onClick={()=>{alert('Завершите редактирование региона')}}
                  >
                      <i className="fas fa-plus"></i>
                  </div>
                  :
                  <div className={unsavedLayersIsOpened ? "a__create-region-btn" : "a__create-region-btn a__disabled"} 
                       title="create new region"
                       onClick={createNewRegionHandler}
                  >
                     <i className="fas fa-plus"></i>
                  </div>   
               }

               <div className={"a__log-out-btn"} 
                    title="log out"
                    onClick={logOutHandler}
               >
                  <i className="fas fa-sign-out-alt"></i>
               </div>  


           </div> 

           {/* ======================================================= */}

           <div className={unsavedLayersIsOpened ? "a__unsaved-layers-container a__active" : "a__unsaved-layers-container" }>
               
                <div className="">
                    
                </div>


               { onMapRegions.map((o, i)=>{
                   return <Region  obj={o} key={i}/>
               })  }
           </div>

           <div className={savedLayersIsOpened ? "a__saved-layers-container a__active" : "a__saved-layers-container" }>
               db
           </div>


        </div>
    )
}

export default ViewPanel




