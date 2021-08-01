import L from 'leaflet'

//-----------------------------------------
export interface IMapRegion {
    leaflet_id: number;
    regionLayer: any;
    name: string;
    description: string;
}

interface IAppState {
    mapPointer: L.DrawMap | null; 
    viewPanelIsOpened: boolean;
    unsavedLayersIsOpened: boolean;
    savedLayersIsOpened: boolean;

    mapLayers: any[];

    currentRegionId: number;
    onMapRegions: IMapRegion[];
}


export enum AppActionTypes {
    SET_MAP_POINTER = "SET_MAP_POINTER",
    SET_VIEW_PANEL_IS_OPENED = "SET_VIEW_PANEL_IS_OPENED",
    SET_UNSAVED_LAYERS_IS_OPENED = "SET_UNSAVED_LAYERS_IS_OPENED",
    SET_SAVED_LAYERS_IS_OPENED = "SET_SAVED_LAYERS_IS_OPENED",
    ADD_LAYER_TO_REGION = "ADD_LAYER_TO_REGION",
    REMOVE_REGION = "REMOVE_REGION",
    UPDATE_REGION_AFTER_CUTTING = "UPDATE_REGION_AFTER_CUTTING",
    SET_CURRENT_REGION_ID = "SET_CURRENT_REGION_ID",
    ADD_NEW_REGION = "ADD_NEW_REGION",
    REMOVE_REGION_ITEM = "REMOVE_REGION_ITEM"
}

//-----------------------------------------------------------------

interface ISetMapPointerAction {
    type: AppActionTypes.SET_MAP_POINTER
    payload: L.DrawMap;
}

interface ISetViewPanelIsOpenedAction {
    type: AppActionTypes.SET_VIEW_PANEL_IS_OPENED
    payload: boolean;
}

interface ISetUnsavedLayersIsOpenedAction {
    type: AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED
    payload: boolean;
}

interface ISetSavedLayersIsOpenedAction {
    type: AppActionTypes.SET_SAVED_LAYERS_IS_OPENED
    payload: boolean;
}

interface IAddLayerToRegionAction {
    type: AppActionTypes.ADD_LAYER_TO_REGION
    payload: L.Polygon | L.Polyline | L.Circle | L.Marker | L.Rectangle;
}

interface IRemoveRegionAction {
    type: AppActionTypes.REMOVE_REGION
    payload: number;
}

interface IUpdateRegionAfterCuttingAction {
    type: AppActionTypes.UPDATE_REGION_AFTER_CUTTING
    payload: [any[], number];
}

interface ISetCurrentRegionIdAction {
    type: AppActionTypes.SET_CURRENT_REGION_ID
    payload: number;
}

interface IAddNewRegionAction {
    type: AppActionTypes.ADD_NEW_REGION
    payload: [IMapRegion, number];
}

interface IRemoveRegionItemAction {
    type: AppActionTypes.REMOVE_REGION_ITEM;
    payload: number;
}


export type AppAction =  ISetMapPointerAction
                       | ISetViewPanelIsOpenedAction
                       | ISetUnsavedLayersIsOpenedAction
                       | ISetSavedLayersIsOpenedAction
                       | IAddLayerToRegionAction
                       | IRemoveRegionAction
                       | IUpdateRegionAfterCuttingAction
                       | ISetCurrentRegionIdAction
                       | IAddNewRegionAction
                       | IRemoveRegionItemAction;

//======================================================

const initialState: IAppState = {
    mapPointer: null,
    viewPanelIsOpened: false,
    unsavedLayersIsOpened: true,
    savedLayersIsOpened: false,
    mapLayers: [],
    currentRegionId: -1,
    onMapRegions: []
}

//------------------------------------------------------

export const mapReducer = (state = initialState, action: AppAction)=> {
    switch (action.type) {
      case AppActionTypes.SET_MAP_POINTER:
          return {...state, mapPointer: action.payload} 
          
      //----------------------------------------------------------          
      case AppActionTypes.SET_VIEW_PANEL_IS_OPENED:
          return {...state, viewPanelIsOpened: action.payload} 

      //----------------------------------------------------------    
      case AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED:
          return {...state, unsavedLayersIsOpened: action.payload}

      //----------------------------------------------------------
      case AppActionTypes.SET_SAVED_LAYERS_IS_OPENED:
          return {...state, savedLayersIsOpened: action.payload}

      //----------------------------------------------------------    
      case AppActionTypes.ADD_LAYER_TO_REGION:
          let newOnMapRegions =  state.onMapRegions.map((obj:IMapRegion)=>{
             if(obj.leaflet_id === state.currentRegionId){
               obj.regionLayer.addLayer(action.payload)
               //console.log('new item= ', obj)
             }
             return obj
          })
          return {...state, onMapRegions: [...newOnMapRegions]}

      //----------------------------------------------------------
      case AppActionTypes.REMOVE_REGION:
          return {...state, 
                      onMapRegions: state.onMapRegions.filter((obj)=> {
                      return obj.leaflet_id !== action.payload
                     }),
                     currentRegionId: action.payload === state.currentRegionId ? -1 
                     : state.currentRegionId 
                 }
      //----------------------------------------------------------
      case AppActionTypes.UPDATE_REGION_AFTER_CUTTING:
          let prev_layer_id = action.payload[1]
          let new_layer_arr = action.payload[0]

          let newMapRegions =  state.onMapRegions.map((obj:IMapRegion)=>{
            if(obj.leaflet_id === state.currentRegionId){
              obj.regionLayer.removeLayer(prev_layer_id)

              new_layer_arr.forEach((element)=>{
                obj.regionLayer.addLayer(element)
              })             
            }
            return obj
          })
          return {...state, onMapRegions: [...newMapRegions]} 

       //----------------------------------------------------------
       case AppActionTypes.SET_CURRENT_REGION_ID:
          return {...state, currentRegionId: action.payload } 

       //----------------------------------------------------------  
       case AppActionTypes.ADD_NEW_REGION:
          let newCurrentRegionId = action.payload[1]          
          let newRegionObj = action.payload[0]
          return {
                   ...state,                  
                   onMapRegions: [...state.onMapRegions, newRegionObj]
                 }

       //---------------------------------------------------------
        case AppActionTypes.REMOVE_REGION_ITEM:
          let newArr =  state.onMapRegions.map((obj:IMapRegion)=>{
            if(obj.leaflet_id === state.currentRegionId){
              obj.regionLayer.removeLayer(action.payload)
            }
            return obj
          })
          return {...state, onMapRegions: [...newArr]} 

      default:
          return state
    }
}


//------------------------- ACTION CREATORS --------------------------------------

export const setMapPointerAction = (payload: L.DrawMap): AppAction => ({
    type: AppActionTypes.SET_MAP_POINTER, 
    payload: payload
})

export const setViewPanelIsOpenedAction = (payload: boolean): AppAction => ({
    type: AppActionTypes.SET_VIEW_PANEL_IS_OPENED, 
    payload: payload
})

export const setUnsavedLayersIsOpenedAction = (payload: boolean): AppAction => ({
    type: AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED, 
    payload: payload
})

export const setSavedLayersIsOpenedAction = (payload: boolean): AppAction => ({
    type: AppActionTypes.SET_SAVED_LAYERS_IS_OPENED, 
    payload: payload
})

export const addLayerToRegionAction = (payload: L.Polygon | L.Polyline | L.Circle | L.Marker | L.Rectangle): AppAction => ({
    type: AppActionTypes.ADD_LAYER_TO_REGION, 
    payload: payload
})

export const removeRegionAction = (payload: number): AppAction => ({
    type: AppActionTypes.REMOVE_REGION, 
    payload: payload
})

export const updateRegionAfterCuttingAction = (payload: [object[], number]): AppAction => ({
    type: AppActionTypes.UPDATE_REGION_AFTER_CUTTING, 
    payload: payload
})

export const setCurrentRegionIdAction = (payload: number): AppAction => ({
    type: AppActionTypes.SET_CURRENT_REGION_ID, 
    payload: payload
})

export const addNewRegionAction = (payload: [IMapRegion, number]): AppAction => ({
    type: AppActionTypes.ADD_NEW_REGION, 
    payload: payload
})

export const removeRegionItemAction = (payload: number): AppAction => ({
    type: AppActionTypes.REMOVE_REGION_ITEM, 
    payload: payload
})

