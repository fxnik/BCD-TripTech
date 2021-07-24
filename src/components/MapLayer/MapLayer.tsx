import React, {FC, useEffect} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import L from 'leaflet'

import './mapLayerStyle.css'


//--------------------------------------------------------------


const MapLayer: FC<any> = ({obj}) => {
    //const { mapPointer: map } = useTypedSelector(state => state.app)

    const { removeMapLayerAction } = useActions() 

    

    const dbClickRemoveHandler = () => {
        obj.layer.remove()
        removeMapLayerAction(obj.layer_id) 
    }
    

    return (
        <div className={"a__map-layer"} onDoubleClick={dbClickRemoveHandler}>
            {obj.shape} - {obj.layer_id}
        </div>
    )
}

export default MapLayer
