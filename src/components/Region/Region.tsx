import React, {FC, useEffect} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import L from 'leaflet'

import {IMapRegion} from '../../store/reducers/mapReducer'
import RegionItem from '../RegionItem/RegionItem'

import './regionStyle.css'


//-----------------

interface IRegion {
   obj:IMapRegion;
   key: number; 
}

//--------------------------------------
const Region: FC<IRegion> = ({obj}) => {
    const { mapPointer: map } = useTypedSelector(state => state.app)
    const { removeRegionAction } = useActions()

    //--------------------------------------------

    const removeRegionHandler = (obj: any) => {
        let answer:boolean = window.confirm("Вы действительно хотите удалить с карты этот регион? ");
        if(!answer) return 

        obj.regionLayer.remove()
        removeRegionAction(obj.leaflet_id)        
    }
    
    //----------------------------------------------------------------------------

    return (
        <div className={"a__region"} >
            <div className="a__region-header">
                <span className={"a__saved-idicator"}>
                   <i className="fas fa-dot-circle"></i>
                </span>
                <span>{'New region'}</span>
            </div>

            <div className={"a__tool-panel"}>
                <div className="a__btn a__remove-btn" 
                     title="remove region"
                     onClick={()=>removeRegionHandler(obj)}
                >
                   <i className="fas fa-trash-alt"></i>
                </div>

                <div className="a__btn a__pencil-btn" 
                     title="add comments"
                     onClick={()=>console.log(obj.regionLayer.toGeoJSON())}
                >
                   <i className="fas fa-pencil-alt"></i>
                </div>
            </div>

            {
               obj.regionLayer.getLayers().map((layer:any, i:number)=>{
                   return <RegionItem layer={layer} key={i} />
               })
            }

        </div>
    )
}

export default Region
