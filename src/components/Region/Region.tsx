import React, {FC, useState, useEffect} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { useHttp } from '../../hooks/useHttp'
import L from 'leaflet'

import {IRegion} from '../../types/types'
import RegionItem from '../RegionItem/RegionItem'

import './regionStyle.css'

//--------------------------------------

const Region: FC<IRegion> = ({obj}) => {
    const { mapPointer: map, 
            currentRegionId } = useTypedSelector(state => state.app)

    const { removeRegionAction, 
            setCurrentRegionIdAction } = useActions()

    const {request} = useHttp()
    const [isOpend, setIsOpend] = useState(false)
    const [regionInfo, setRegionInfo] = useState('Новый регион')
    const [isNarrowed, setIsNarrowed] = useState(false)    
    const [isFromDb, setIsFromBd] = useState(false) 
    const [isChanged, setIsChanged] = useState(false)    

    //--------------------------------------------------------------

    /**
     * if region comes from database
     */
    useEffect(()=>{
        if(obj.info){
            setRegionInfo(obj.info)
            setIsFromBd(true)            
        }        
    }, [])    

    //--------------------------------------------------------------

    /**
     * it runs for forbidding editing information 
     * about region if region is not currently edited
     */
    useEffect(()=>{
        if(isOpend){
            setIsOpend(state => false)            
        }
    }, [currentRegionId])

    //--------------------------------------------------------------

    const removeRegionHandler = (obj: any) => {
        let answer:boolean = window.confirm("Вы действительно хотите удалить с карты этот регион? ");
        if(!answer) return 

        obj.regionLayer.remove()
        removeRegionAction(obj.leaflet_id)        
    }  

    //------------------------------

    const setRegionNameHandler = (event: React.ChangeEvent<HTMLTextAreaElement>)=> {
        setIsChanged(state => true)
        setRegionInfo(event.target.value) 
    }
    //------------------------------

    const stopRegionEditing = ()=>{
        let answer:boolean = window.confirm("Вы действительно хотите остановить редактирование?");
        if(!answer) return         

        console.log('остановить редактирование')
        setCurrentRegionIdAction(-1)
    }

    //------------------------------

    const startRegionEditing = (obj: any)=>{
        let answer:boolean = window.confirm("Вы действительно хотите начать редактирование?");
        if(!answer) return         

        console.log('начать редактирование', obj.leaflet_id)
        setCurrentRegionIdAction(obj.leaflet_id)
    }

    //------------------------------

    const saveRegionToDataBaseHandler = async (obj: any) => {
        console.log('сохранить в бд')

        let answer:boolean = window.confirm("Вы действительно хотите сохранить регион ?");
        if(!answer) return  

        let userData: string | null = localStorage.getItem('userData')
        let token: string;

        if(userData) token = JSON.parse(userData).token
        else {
            alert('Токен доступа отсутствует. Пройдите авторизацию')
            return
        }       

        //----------------------------------

        try {
            let regionGeoJson: any = {
                "type": "FeatureCollection",
                "features": []
            }
    
            let layers: any[] = obj.regionLayer.getLayers()

            //console.log('obj.regionLayer.getLayers() = ', layers)           

            let arr: any[] = obj.regionItemInfo 

            //console.log('obj.regionItemInfo=', obj.regionItemInfo)
    
            for(let i=0; i< obj.regionItemInfo.length; i++){    
                for(let j=0; j < layers.length; j++){
                    if(layers[j]._leaflet_id === arr[i][0]) {
                        let geo_json = layers[j].toGeoJSON() 
                        geo_json.properties["information"] = arr[i][1]  
                        
                        if (layers[j] instanceof L.Circle) 
                           geo_json.properties["radius"] = layers[j].getRadius();
                          
                        regionGeoJson.features.push(geo_json)
                    }
                }
            }
    
            console.log('regionGeoJson= ', regionGeoJson)  
            
            var data:any;

            if(isFromDb) {
                let body: object = {
                    uuid: obj.uuid,
                    info: regionInfo,
                    geo_json: JSON.stringify([regionInfo, regionGeoJson])
                }            
    
                data = await request('http://127.0.0.1:8000/api/update_region', 
                                            'post',
                                            body, 
                                            {'Authorization': `Bearer ${token}`}) 

                /* data = await request('http://45.84.226.158:5050/api/update_region', 
                                    'post',
                                    body, 
                                    {'Authorization': `Bearer ${token}`}) */  
            }
            else{
                let body: object = {
                    info: regionInfo,
                    geo_json: JSON.stringify([regionInfo, regionGeoJson])
                }            
    
                data = await request('http://127.0.0.1:8000/api/add_region', 
                                          'post',
                                           body, 
                                           {'Authorization': `Bearer ${token}`})

                /* data = await request('http://45.84.226.158:5050/api/add_region', 
                                    'post',
                                    body, 
                                    {'Authorization': `Bearer ${token}`}) */   
            }
                  
            console.log('data= ', data)

            if(data.isError) {
                alert('Error: ' + data.message)
            } else if (data.message === 'done'){
                setIsChanged(state => false)
                obj.regionLayer.remove()
                removeRegionAction(obj.leaflet_id)

                alert('Регион сохранен в базу данных')
            }             

        } catch(e) {
            alert('Error: ' + e.message)
            throw e 
        }  
    }
    
    //----------------------------------------------------------------------------

    return (
        <div className="a__region" >

            <div className="a__region-header">
                <span className={"a__idicators"}>

                   <i className={obj.leaflet_id === currentRegionId ? "fas fa-dot-circle a__active": "fas fa-dot-circle"} 
                      title="сейчас редактируется"
                   ></i> 

                   <i className={isChanged ? "fas fa-dot-circle a__active" : "fas fa-dot-circle"} 
                      title="имеются несохраненные изменения"
                   ></i>  

                   <i className={isFromDb ? "fas fa-dot-circle a__active": "fas fa-dot-circle"}  
                      title="загружен из бд" 
                   ></i>
                </span>
                <span>{regionInfo}</span>
            </div>

            <div className={"a__tool-panel"}>

                <div className="a__btn a__remove-btn" 
                     title="Удалить регион с панели редактирования"
                     onClick={()=>removeRegionHandler(obj)}
                >
                   <i className="fas fa-trash-alt"></i>
                </div>

                {obj.leaflet_id === currentRegionId ? 
                    <div className="a__btn a__pencil-btn" 
                        title="Добавить информацию о регионе"
                        onClick={()=>setIsOpend(state => !state)}
                    >
                       <i className="fas fa-pencil-alt"></i>
                    </div>
                    :
                    <div className="a__btn a__pencil-btn" 
                        title="Добавить информацию о регионе"
                        onClick={()=>alert('Начните редактирование этого региона')}
                    >
                       <i className="fas fa-pencil-alt"></i>
                    </div>                    
                }

                {currentRegionId === -1 ?
                  <div className="a__btn a__save-btn" 
                     title="Сохранить регион в бд"
                     onClick={()=>saveRegionToDataBaseHandler(obj)}
                  >
                     <i className="fas fa-save" style={{color:"green"}}></i>
                  </div>
                  :
                  <div className="a__btn a__save-btn" 
                     title="Сохранить регион в бд"
                     onClick={()=>alert('Завершите редактирование региона.')}
                  >
                     <i className="fas fa-save" style={{color:"Brown"}}></i>
                  </div>
                }
                <div className="a__btn a__narrow-btn" 
                     title={isNarrowed? "Развернуть": "Свернуть"}
                     onClick={()=>setIsNarrowed(state => !state)}
                >
                   {isNarrowed? <i className="fas fa-arrow-down"></i> : <i className="fas fa-arrow-up"></i>}
                </div>

                {currentRegionId === -1 ?
                    <div className="a__btn a__start-editing-btn" 
                        title="Начать редактирование"
                        onClick={()=>startRegionEditing(obj)}
                    >
                      <i className="fas fa-play" style={{color:"green"}}></i>
                    </div>
                    :
                    <div className="a__btn a__start-editing-btn" 
                        title="Начать редактирование"
                        onClick={()=>alert('Регион уже редактируется')}
                    >
                      <i className="fas fa-play" style={{color:"Brown"}}></i>
                    </div>
                }

                {currentRegionId === obj.leaflet_id ?
                    <div className="a__btn a__stop-editing-btn" 
                        title="Остановить редактирование"
                        onClick={()=>stopRegionEditing()}
                    >
                      <i className="fas fa-stop" style={{color:"green"}}></i>
                    </div>
                    :
                    <div className="a__btn a__stop-editing-btn" 
                        title="Остановить редактирование"
                        onClick={()=>alert('Регион уже не редактируется')}
                    >
                      <i className="fas fa-stop" style={{color:"Brown"}}></i>
                    </div>
                }

            </div>

            <div className={isOpend ? "a__comments a__opened" : "a__comments"}>
                    <span>Information:</span>
                    <textarea value={regionInfo} 
                              onChange={setRegionNameHandler} 
                              rows={3}
                    />                                      
            </div>

            <div className={isNarrowed ? "a__region-items a__narrowed" : "a__region-items"}>
                {
                    obj.regionLayer.getLayers().map((layer:any, i:number)=>{                        
                        let new_arr: any[] = obj.regionItemInfo.filter((arr)=>{
                            return arr[0] === layer._leaflet_id
                        })
                        
                        return <RegionItem 
                                  layer={layer} 
                                  key={layer._leaflet_id} 
                                  info={new_arr[0]? new_arr[0]: undefined}
                                  region_id={obj.leaflet_id}
                                  signaler={()=>setIsChanged(state=>true)}
                               />
                    })
                }
            </div>

            

        </div>
    )
}

export default Region
