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
         removeRegionItemAction
       } from '../store/reducers/mapReducer'


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
                                removeRegionItemAction
                              }, dispatch)
}