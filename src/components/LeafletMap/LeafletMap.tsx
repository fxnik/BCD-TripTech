import React, {FC} from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import {useDispatch, useSelector} from 'react-redux'
import {setMapPointerAction} from '../../store/reducers/mapReducer'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';

import './leafletMapStyle.css'

//==================================================================

const LeafletMap: FC = () => {    
    const {mapPointer: map } = useTypedSelector(state => state.map)
    const {setMapPointerAction} = useActions()

    const setMapPointer = (map: L.Map) => {
        setMapPointerAction(map)
    }



    return (        
        <div className="a__leaflet-map">            
            <MapContainer 
                center={[51.505, -0.09]} 
                zoom={13} 
                scrollWheelZoom={true} 
                whenCreated={setMapPointer} 
                doubleClickZoom={false} 
                zoomControl={false}             
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
               
            </MapContainer>            
        </div>                
    )
}

export default LeafletMap
