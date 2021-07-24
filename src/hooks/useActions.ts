import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMapPointerAction, 
         setViewPanelIsOpenedAction,
         setUnsavedLayersIsOpenedAction,
         setSavedLayersIsOpenedAction,
         addMapLayerAction,
         removeMapLayerAction,
         updateLayerAfterCuttingAction
       } from '../store/reducers/mapReducer'


export const useActions = () => {
    const dispatch = useDispatch()
        
    return bindActionCreators({
                                setMapPointerAction, 
                                setViewPanelIsOpenedAction,
                                setUnsavedLayersIsOpenedAction,
                                setSavedLayersIsOpenedAction,
                                addMapLayerAction,
                                removeMapLayerAction,
                                updateLayerAfterCuttingAction
                              }, dispatch)
}