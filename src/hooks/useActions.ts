import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMapPointerAction, 
         setViewPanelIsOpenedAction,
         setUnsavedLayersIsOpenedAction,
         setSavedLayersIsOpenedAction,
         addLayerToRegionAction,
         removeRegionAction,
         updateRegionAfterCuttingAction,
         setCurrentRegionIdAction,
         addNewRegionAction,
         removeRegionItemAction,
         updateRegionItemInfoAction
       } from '../store/reducers/mapReducer'

import {setUserIsAuthorizedAction,

       } from '../store/reducers/authReducer'

       

export const useActions = () => {
    const dispatch = useDispatch()
        
    return bindActionCreators({
                                setMapPointerAction, 
                                setViewPanelIsOpenedAction,
                                setUnsavedLayersIsOpenedAction,
                                setSavedLayersIsOpenedAction,
                                addLayerToRegionAction,
                                removeRegionAction,
                                updateRegionAfterCuttingAction,
                                setCurrentRegionIdAction,
                                addNewRegionAction,
                                removeRegionItemAction,
                                updateRegionItemInfoAction,

                                //-----------------------------
                                setUserIsAuthorizedAction
                              }, dispatch)
}