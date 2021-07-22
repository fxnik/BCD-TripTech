interface IMapState {
    mapPointer: any //L.Map | null;   
}


export enum MapActionTypes {
    SET_MAP_POINTER = "SET_MAP_POINTER"   
}


interface SetMapPointerAction {
    type: MapActionTypes.SET_MAP_POINTER
    payload: any //L.Map;
}


export type MapAction =  SetMapPointerAction; //| FetchSuccessAction 

//=============================================================================================

const initialState: IMapState = {
    mapPointer: null,
}

//-------------------------

export const mapReducer = (state = initialState, action: MapAction)=> {
    switch (action.type) {
      case MapActionTypes.SET_MAP_POINTER:
          return {...state, mapPointer: action.payload}      

      default:
          return state
    }
}


//================================= ACTION CREATORS ============================================

export const setMapPointerAction = (payload:  any /* L.Map */): MapAction => ({
    type: MapActionTypes.SET_MAP_POINTER, 
    payload: payload
})
