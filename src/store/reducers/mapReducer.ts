import L from "leaflet";

export interface IMapRegion {
  leaflet_id: number;
  regionLayer: any;
  regionItemInfo: any[];
  uuid?: string;
  info?: string;
  checkedElementsId: number[];
  createdAfterCopying: boolean;
  createdAfterCutting: boolean;
  createdAfterGrouping: boolean;
  regionIsChecked?: boolean;
}

interface IAppState {
  mapPointer: L.DrawMap | null;
  viewPanelIsOpened: boolean;
  unsavedLayersIsOpened: boolean;
  savedLayersIsOpened: boolean;
  mapLayers: any[];
  currentRegionId: number;
  onMapRegions: IMapRegion[];
  regionHasUnsavedChanges: boolean;
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
  REMOVE_REGION_ITEM = "REMOVE_REGION_ITEM",
  UPDATE_REGION_ITEM_INFO = "UPDATE_REGION_ITEM_INFO",
  CALL_CHANGE_INDICATOR_FUNCTION = "CALL_CHANGE_INDICATOR_FUNCTION",
  ADD_CHECKED_ELEMENT_ID = "ADD_CHECKED_ELEMENT_ID",
  REMOVE_CHECKED_ELEMENT_ID = "REMOVE_CHECKED_ELEMENT_ID",
  REMOVE_REGION_ITEMS_AFTER_REGION_CUTTING_UP = "REMOVE_REGION_ITEMS_AFTER_REGION_CUTTING_UP",
  SET_CHECKED_REGION = "SET_CHECKED_REGION",
  UNSET_CHECKED_REGION = "UNSET_CHECKED_REGION",
}

//---------------------------

interface ISetMapPointerAction {
  type: AppActionTypes.SET_MAP_POINTER;
  payload: L.DrawMap;
}

interface ISetViewPanelIsOpenedAction {
  type: AppActionTypes.SET_VIEW_PANEL_IS_OPENED;
  payload: boolean;
}

interface ISetUnsavedLayersIsOpenedAction {
  type: AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED;
  payload: boolean;
}

interface ISetSavedLayersIsOpenedAction {
  type: AppActionTypes.SET_SAVED_LAYERS_IS_OPENED;
  payload: boolean;
}

interface IAddLayerToRegionAction {
  type: AppActionTypes.ADD_LAYER_TO_REGION;
  payload: L.Polygon | L.Polyline | L.Circle | L.Marker | L.Rectangle;
}

interface IRemoveRegionAction {
  type: AppActionTypes.REMOVE_REGION;
  payload: number;
}

interface IUpdateRegionAfterCuttingAction {
  type: AppActionTypes.UPDATE_REGION_AFTER_CUTTING;
  payload: [any[], number];
}

interface ISetCurrentRegionIdAction {
  type: AppActionTypes.SET_CURRENT_REGION_ID;
  payload: number;
}

interface IAddNewRegionAction {
  type: AppActionTypes.ADD_NEW_REGION;
  payload: [IMapRegion, number];
}

interface IRemoveRegionItemAction {
  type: AppActionTypes.REMOVE_REGION_ITEM;
  payload: number;
}

interface IUpdateRegionItemInfoAction {
  type: AppActionTypes.UPDATE_REGION_ITEM_INFO;
  payload: [number, string];
}

interface ICallChangeIndicatorFunctionAction {
  type: AppActionTypes.CALL_CHANGE_INDICATOR_FUNCTION;
  payload: void;
}

interface IAddCheckedElementIdAction {
  type: AppActionTypes.ADD_CHECKED_ELEMENT_ID;
  payload: number;
}

interface IRemoveCheckedElementIdAction {
  type: AppActionTypes.REMOVE_CHECKED_ELEMENT_ID;
  payload: number;
}

interface IRemoveRegionItemsAfterRegionCuttingUpAction { 
  type: AppActionTypes.REMOVE_REGION_ITEMS_AFTER_REGION_CUTTING_UP;
  payload: void;
}

interface ISetCheckedRegionAction { 
  type: AppActionTypes.SET_CHECKED_REGION;
  payload: number;
}

interface IUnsetCheckedRegionAction { 
  type: AppActionTypes.UNSET_CHECKED_REGION;
  payload: number;
}

export type AppAction =
  | ISetMapPointerAction
  | ISetViewPanelIsOpenedAction
  | ISetUnsavedLayersIsOpenedAction
  | ISetSavedLayersIsOpenedAction
  | IAddLayerToRegionAction
  | IRemoveRegionAction
  | IUpdateRegionAfterCuttingAction
  | ISetCurrentRegionIdAction
  | IAddNewRegionAction
  | IRemoveRegionItemAction
  | IUpdateRegionItemInfoAction
  | ICallChangeIndicatorFunctionAction
  | IAddCheckedElementIdAction
  | IRemoveCheckedElementIdAction
  | IRemoveRegionItemsAfterRegionCuttingUpAction
  | ISetCheckedRegionAction
  | IUnsetCheckedRegionAction;

//--------------------------

const initialState: IAppState = {
  mapPointer: null,
  viewPanelIsOpened: false,
  unsavedLayersIsOpened: true,
  savedLayersIsOpened: false,
  mapLayers: [],
  currentRegionId: -1,
  onMapRegions: [],
  regionHasUnsavedChanges: false,
};

//---------------------------

export const mapReducer = (state = initialState, action: AppAction) => {
  switch (action.type) {
    case AppActionTypes.SET_MAP_POINTER:
      return { ...state, mapPointer: action.payload };

    //--------------------
    case AppActionTypes.SET_VIEW_PANEL_IS_OPENED:
      return { ...state, viewPanelIsOpened: action.payload };

    //--------------------
    case AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED:
      return { ...state, unsavedLayersIsOpened: action.payload };

    //--------------------
    case AppActionTypes.SET_SAVED_LAYERS_IS_OPENED:
      return { ...state, savedLayersIsOpened: action.payload };

    //--------------------
    case AppActionTypes.ADD_LAYER_TO_REGION:
      let layer: any = action.payload;

      let newOnMapRegions = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {
          obj.regionItemInfo.push([layer._leaflet_id, "New element"]);
        }
        return obj;
      });
      return { ...state, onMapRegions: [...newOnMapRegions] };

    //-------------------
    case AppActionTypes.REMOVE_REGION:
      return {
        ...state,
        onMapRegions: state.onMapRegions.filter((obj) => {
          return obj.leaflet_id !== action.payload;
        }),
        currentRegionId:
          action.payload === state.currentRegionId ? -1 : state.currentRegionId,
      };

    //-------------------
    case AppActionTypes.UPDATE_REGION_AFTER_CUTTING:
      let prev_layer_id = action.payload[1];
      let new_layer_arr = action.payload[0];

      let newMapRegions = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {
          obj.regionItemInfo = obj.regionItemInfo.filter(
            (arr) => arr[0] !== prev_layer_id
          );

          new_layer_arr.forEach((element) => {
            obj.regionItemInfo.push([element._leaflet_id, "New element"]);
          });
        }
        return obj;
      });
      return { ...state, onMapRegions: [...newMapRegions] };

    //--------------------
    case AppActionTypes.SET_CURRENT_REGION_ID:
      return { ...state, currentRegionId: action.payload };

    //--------------------
    case AppActionTypes.ADD_NEW_REGION:
      let newCurrentRegionId = action.payload[1];
      let newRegionObj = action.payload[0];
      return {
        ...state,
        onMapRegions: [...state.onMapRegions, newRegionObj],
      };

    //--------------------
    case AppActionTypes.REMOVE_REGION_ITEM:
      let newRegionItemInfoArr;
      let newArr = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {
          newRegionItemInfoArr = obj.regionItemInfo.filter(
            (arr) => arr[0] !== action.payload
          );
          obj.regionItemInfo = newRegionItemInfoArr;
        }
        return obj;
      });

      return { ...state, onMapRegions: [...newArr] };

    //--------------------
    case AppActionTypes.UPDATE_REGION_ITEM_INFO:
      let layer_id = action.payload[0];
      let info_str = action.payload[1];

      let arr: any[] = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {
          obj.regionItemInfo.forEach((arr) => {
            if (arr[0] === layer_id) arr[1] = info_str;
          });
        }
        return obj;
      });

      return { ...state, onMapRegions: [...arr] };

    //---------------------
    case AppActionTypes.CALL_CHANGE_INDICATOR_FUNCTION:
      return {
        ...state,
        regionHasUnsavedChanges: !state.regionHasUnsavedChanges,
      };

    //---------------------
    case AppActionTypes.ADD_CHECKED_ELEMENT_ID:
      let add_id_arr: any[] = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {
          obj.checkedElementsId.push(action.payload);
          //console.log("-mapReducer- add obj.checkedElementsId= ", obj.checkedElementsId);
        }
        return obj;
      });

      return {
        ...state,
        onMapRegions: [...add_id_arr],
      };

    //---------------------
    case AppActionTypes.REMOVE_CHECKED_ELEMENT_ID:
      let remove_id_arr: any[] = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {
          obj.checkedElementsId = obj.checkedElementsId.filter(
            (element) => element !== action.payload
          );
          //console.log("-mapReducer- remove obj.checkedElementsId= ", obj.checkedElementsId);
        }
        return obj;
      });

      return {
        ...state,
        onMapRegions: [...remove_id_arr],
      };

    //------------------
    case AppActionTypes.REMOVE_REGION_ITEMS_AFTER_REGION_CUTTING_UP:
      let remove_items_arr = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === state.currentRegionId) {

          obj.checkedElementsId.forEach(id => {
            obj.regionItemInfo = obj.regionItemInfo.filter(
              (arr) => arr[0] !== id
            );
          }) 
          
          obj.checkedElementsId = []         
        }
        return obj;
      });

      return { ...state, onMapRegions: [...remove_items_arr] };

    //---------------------

    case AppActionTypes.SET_CHECKED_REGION:
      let set_checked_region_arr: any[] = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === action.payload) {
          obj.regionIsChecked = true 
          //console.log('SET obj.regionIsChecked=', obj.regionIsChecked)         
        }
        return obj;
      });

      return {
        ...state,
        onMapRegions: [...set_checked_region_arr],
      };

    //---------------------

    case AppActionTypes.UNSET_CHECKED_REGION:
      let unset_checked_region_arr: any[] = state.onMapRegions.map((obj: IMapRegion) => {
        if (obj.leaflet_id === action.payload) {
          obj.regionIsChecked = false
          //console.log('UNSET obj.regionIsChecked=', obj.regionIsChecked)          
        }
        return obj;
      });

      return {
        ...state,
        onMapRegions: [...unset_checked_region_arr],
      };

    //---------------------
    default:
      return state;
  }
};

//------------------------- ACTION CREATORS ----------------------------

export const setMapPointerAction = (payload: L.DrawMap): AppAction => ({
  type: AppActionTypes.SET_MAP_POINTER,
  payload: payload,
});

export const setViewPanelIsOpenedAction = (payload: boolean): AppAction => ({
  type: AppActionTypes.SET_VIEW_PANEL_IS_OPENED,
  payload: payload,
});

export const setUnsavedLayersIsOpenedAction = (
  payload: boolean
): AppAction => ({
  type: AppActionTypes.SET_UNSAVED_LAYERS_IS_OPENED,
  payload: payload,
});

export const setSavedLayersIsOpenedAction = (payload: boolean): AppAction => ({
  type: AppActionTypes.SET_SAVED_LAYERS_IS_OPENED,
  payload: payload,
});

export const addLayerToRegionAction = (
  payload: L.Polygon | L.Polyline | L.Circle | L.Marker | L.Rectangle
): AppAction => ({
  type: AppActionTypes.ADD_LAYER_TO_REGION,
  payload: payload,
});

export const removeRegionAction = (payload: number): AppAction => ({
  type: AppActionTypes.REMOVE_REGION,
  payload: payload,
});

export const updateRegionAfterCuttingAction = (
  payload: [object[], number]
): AppAction => ({
  type: AppActionTypes.UPDATE_REGION_AFTER_CUTTING,
  payload: payload,
});

export const setCurrentRegionIdAction = (payload: number): AppAction => ({
  type: AppActionTypes.SET_CURRENT_REGION_ID,
  payload: payload,
});

export const addNewRegionAction = (
  payload: [IMapRegion, number]
): AppAction => ({
  type: AppActionTypes.ADD_NEW_REGION,
  payload: payload,
});

export const removeRegionItemAction = (payload: number): AppAction => ({
  type: AppActionTypes.REMOVE_REGION_ITEM,
  payload: payload,
});

export const updateRegionItemInfoAction = (
  payload: [number, string]
): AppAction => ({
  type: AppActionTypes.UPDATE_REGION_ITEM_INFO,
  payload: payload,
});

export const CallChangeIndicatorFunctionAction = (
  payload: void
): AppAction => ({
  type: AppActionTypes.CALL_CHANGE_INDICATOR_FUNCTION,
  payload: payload,
});

export const addCheckedElementIdAction = (payload: number): AppAction => ({
  type: AppActionTypes.ADD_CHECKED_ELEMENT_ID,
  payload: payload,
});

export const removeCheckedElementIdAction = (payload: number): AppAction => ({
  type: AppActionTypes.REMOVE_CHECKED_ELEMENT_ID,
  payload: payload,
});

export const removeRegionItemsAfterRegionCuttingUpAction = (payload: void): AppAction => ({
  type: AppActionTypes.REMOVE_REGION_ITEMS_AFTER_REGION_CUTTING_UP,
  payload: payload,
});

export const setCheckedRegionAction = (payload: number): AppAction => ({
  type: AppActionTypes.SET_CHECKED_REGION,
  payload: payload,
});

export const unsetCheckedRegionAction = (payload: number): AppAction => ({
  type: AppActionTypes.UNSET_CHECKED_REGION,
  payload: payload,
});
