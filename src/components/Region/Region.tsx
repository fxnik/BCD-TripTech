import React, {FC, useState} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import L from 'leaflet'

import {IMapRegion} from '../../store/reducers/mapReducer'
import RegionItem from '../RegionItem/RegionItem'

import './regionStyle.css'


//--------------------------------------

interface IRegion {
   obj:IMapRegion;
   key: number; 
}

//--------------------------------------

const Region: FC<IRegion> = ({obj}) => {
    const { mapPointer: map, 
            currentRegionId } = useTypedSelector(state => state.app)

    const { removeRegionAction, 
            setCurrentRegionIdAction } = useActions()

    const [isOpend, setIsOpend] = useState(false)
    const [regionName, setRegionName] = useState('New region')
    const [isNarrowed, setIsNarrowed] = useState(false)

    //--------------------------------------------------------------

    const removeRegionHandler = (obj: any) => {
        let answer:boolean = window.confirm("Вы действительно хотите удалить с карты этот регион? ");
        if(!answer) return 

        obj.regionLayer.remove()
        removeRegionAction(obj.leaflet_id)        
    }

    const setRegionNameHandler = (event: React.ChangeEvent<HTMLInputElement>)=> {
        setRegionName(event.target.value)
    }

    const stopRegionEditing = ()=>{
        let answer:boolean = window.confirm("Вы действительно хотите остановить редактирование?");
        if(!answer) return 

        //map?.pm.toggleControls();

        console.log('stop editing')
        setCurrentRegionIdAction(-1)
    }

    const startRegionEditing = (obj: any)=>{
        let answer:boolean = window.confirm("Вы действительно хотите начать редактирование?");
        if(!answer) return 

        //map?.pm.toggleControls();

        console.log('start editing', obj.leaflet_id)
        setCurrentRegionIdAction(obj.leaflet_id)
    }




    
    //----------------------------------------------------------------------------

    return (
        <div className="a__region" >

            <div className="a__region-header">
                <span className={"a__saved-idicator"}>
                   <i className="fas fa-dot-circle" title="current editing"></i>
                   <i className="fas fa-dot-circle" title="changes saved in db"></i>
                   <i className="fas fa-dot-circle" title="from db"></i>
                </span>
                <span>{regionName}</span>
            </div>

            <div className={"a__tool-panel"}>
                <div className="a__btn a__remove-btn" 
                     title="remove region"
                     onClick={()=>removeRegionHandler(obj)}
                >
                   <i className="fas fa-trash-alt"></i>
                </div>

                <div className="a__btn a__pencil-btn" 
                     title="set region name"
                     onClick={()=>setIsOpend(state => !state)}
                >
                   <i className="fas fa-pencil-alt"></i>
                </div>

                <div className="a__btn a__save-btn" 
                     title="save region to db"
                     onClick={()=>console.log(obj.regionLayer.toGeoJSON())}
                >
                   <i className="fas fa-save"></i>
                </div>

                <div className="a__btn a__narrow-btn" 
                     title={isNarrowed? "increase frame": "decrease frame"}
                     onClick={()=>setIsNarrowed(state => !state)}
                >
                   {isNarrowed? <i className="fas fa-arrow-down"></i> : <i className="fas fa-arrow-up"></i>}
                </div>

                {currentRegionId === -1 ?
                    <div className="a__btn a__start-editing-btn" 
                        title="start editing"
                        onClick={()=>startRegionEditing(obj)}
                    >
                      <i className="fas fa-play" style={{color:"green"}}></i>
                    </div>
                    :
                    <div className="a__btn a__start-editing-btn" 
                        title="start editing"
                        onClick={()=>alert('no access to start')}
                    >
                      <i className="fas fa-play" style={{color:"red"}}></i>
                    </div>
                }

                {currentRegionId === obj.leaflet_id ?
                    <div className="a__btn a__stop-editing-btn" 
                        title="stop editing"
                        onClick={()=>stopRegionEditing()}
                    >
                      <i className="fas fa-stop" style={{color:"green"}}></i>
                    </div>
                    :
                    <div className="a__btn a__stop-editing-btn" 
                        title="stop editing"
                        onClick={()=>alert('no access to stop')}
                    >
                      <i className="fas fa-stop" style={{color:"red"}}></i>
                    </div>
                }

            </div>

            <div className={isOpend ? "a__comments a__opened" : "a__comments"}>
                    <span>Region name:</span>
                    <input type="text" value={regionName} onChange={setRegionNameHandler}/>                 
            </div>

            <div className={isNarrowed ? "a__region-items a__narrowed" : "a__region-items"}>
                {
                    obj.regionLayer.getLayers().map((layer:any, i:number)=>{
                        return <RegionItem layer={layer} key={i} />
                    })
                }
            </div>

            

        </div>
    )
}

export default Region
