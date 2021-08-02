import React, {FC} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import L from 'leaflet'

import './regionItemStyle.css'

//----------------------------------------------------

const RegionItem: FC<any> = ({layer}) => {
    const { removeRegionItemAction } = useActions()
    const { mapPointer: map } = useTypedSelector(state => state.app)

    //----------------------------------------------

    const removeRegionItemHandler = (layer:any)=>{ 
        let answer:boolean = window.confirm("Вы действительно хотите удалить этот елемент? ");
        if(!answer) return 

        removeRegionItemAction(layer._leaflet_id)
    }

    const findRegionItemHandler = (layer: any)=>{
        let itemType =  layer instanceof L.Rectangle ? 'Rectangle': 
                        layer instanceof L.Polygon ? 'Polygon': 
                        layer instanceof L.Polyline ? 'Polyline':
                        layer instanceof L.Circle ? 'Circle': '';  

        if(itemType === "Polygon" || itemType === "Rectangle") map!.setView(layer._latlngs[0][0], map!.getZoom())        

        if(itemType === "Polyline") map!.setView(layer._latlngs[0], map!.getZoom())

        if(itemType=== "Circle") map!.setView(layer._latlng, map!.getZoom()) 
    }

    const setNewStyleRegionItemHandler = (layer: any) => {
        layer.setStyle({
            color: 'red'
        });
    }

    const setPrevStyleRegionItemHandler = (layer: any) => {
        layer.setStyle({
            color: "#3388ff"
        });        
    }

    //------------------------------------------------

    let itemType = layer instanceof L.Rectangle ? 'Rectangle': 
                   layer instanceof L.Polygon ? 'Polygon': 
                   layer instanceof L.Polyline ? 'Polyline':
                   layer instanceof L.Circle ? 'Circle': '';  

    //------------------------------------------------

    return (
        <div className={"a__region-item"} 
             onMouseOver={()=>setNewStyleRegionItemHandler(layer)}
             onMouseOut={()=>setPrevStyleRegionItemHandler(layer)}             
             >
            <div className="a__region-item-header">
                {itemType}{/* layer._leaflet_id */}               
            </div>

            <div className="a__tool-panel">
                <div className="a__btn a__remove-btn" 
                     title="remove region item"
                     onClick={()=>removeRegionItemHandler(layer)}
                >
                   <i className="fas fa-trash-alt"></i>
                </div>

                <div className="a__btn a__find-element-btn" 
                     title="find element"
                     onClick={()=>findRegionItemHandler(layer)}
                >
                   <i className="fas fa-search-location"></i>
                </div>

                <div className="a__btn a__find-pencil-btn" 
                     title="add comments"
                     onClick={()=>alert('pencil')}
                >
                   <i className="fas fa-pencil-alt"></i>
                </div>

            </div>

                                
            
        </div>
    )
}

export default RegionItem
