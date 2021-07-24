import L from 'leaflet'

//-----------------------------------------

interface IAppState {
    mapPointer: L.DrawMap | null; 
    viewPanelIsOpened: boolean;
    unsavedLayersIsOpened: boolean;
    savedLayersIsOpened: boolean;
    mapLayers: any[];
}


export enum AppActionTypes {
    SET_MAP_POINTER = "SET_MAP_POINTER",
    SET_VIEW_PANEL_IS_OPENED = "SET_VIEW_PANEL_IS_OPENED",
    SET_UNSAVED_LAYERS_IS_OPENED = "SET_UNSAVED_LAYERS_IS_OPENED",
    SET_SAVED_LAYERS_IS_OPENED = "SET_SAVED_LAYERS_IS_OPENED",
    ADD_MAP_LAYER = "ADD_MAP_LAYERS",
    REMOVE_MAP_LAYER = "REMOVE_MAP_LAYERS",
    UPDATE_LAYER_AFTER_CUTTING = "UPDATE_LAYER_AFTER_CUTTING"
}


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

interface IAddMapLayerAction {
    type: AppActionTypes.ADD_MAP_LAYER
    payload: object;
}

interface IRemoveMapLayerAction {
    type: AppActionTypes.REMOVE_MAP_LAYER
    payload: number;
}

interface IUpdateLayerAfterCuttingAction {
    type: AppActionTypes.UPDATE_LAYER_AFTER_CUTTING
    payload: [object, number];
}

export type AppAction =  ISetMapPointerAction
                       | ISetViewPanelIsOpenedAction
                       | ISetUnsavedLayersIsOpenedAction
                       | ISetSavedLayersIsOpenedAction
                       | IAddMapLayerAction
                       | IRemoveMapLayerAction
                       | IUpdateLayerAfterCuttingAction;

//======================================================

const initialState: IAppState = {
    mapPointer: null,
    viewPanelIsOpened: false,
    unsavedLayersIsOpened: true,
    savedLayersIsOpened: false,
    mapLayers: []
}

//------------------------------------------------------

export const mapReducer = (state = initialState, action: AppAction)=> {
    switch (action.type) {
      case AppActionTypes.SET_MAP_POINTER:
          return {...state, mapPointer: action.payload}   
          
      case AppActionTypes.SET_VIEW_PANEL_IS_OPENED:
          return {...state, viewPanelIsOpened: action.payload} 
          
      case AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED:
          return {...state, unsavedLayersIsOpened: action.payload}

      case AppActionTypes.SET_SAVED_LAYERS_IS_OPENED:
          return {...state, savedLayersIsOpened: action.payload}
          
      case AppActionTypes.ADD_MAP_LAYER:
          return {...state, mapLayers: [action.payload, ...state.mapLayers]}

      case AppActionTypes.REMOVE_MAP_LAYER:
          return {...state, 
                     mapLayers: state.mapLayers.filter((obj)=> {
                      return obj.layer_id !== action.payload
                     })
                 }

      case AppActionTypes.UPDATE_LAYER_AFTER_CUTTING:
          let prev_layer_id = action.payload[1]
          let new_obj = action.payload[0]

          let new_obj_arr = state.mapLayers.filter((obj)=> {
                return obj.layer_id !== prev_layer_id
          })          

          return {...state, mapLayers: [new_obj, ...new_obj_arr]}

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

export const addMapLayerAction = (payload: object): AppAction => ({
    type: AppActionTypes.ADD_MAP_LAYER, 
    payload: payload
})

export const removeMapLayerAction = (payload: number): AppAction => ({
    type: AppActionTypes.REMOVE_MAP_LAYER, 
    payload: payload
})

export const updateLayerAfterCuttingAction = (payload: [object, number]): AppAction => ({
    type: AppActionTypes.UPDATE_LAYER_AFTER_CUTTING, 
    payload: payload
})
