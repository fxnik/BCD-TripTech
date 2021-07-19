import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMapPointerAction } from '../store/reducers/mapReducer'


export const useActions = () => {
    const dispatch = useDispatch()    
    return bindActionCreators({setMapPointerAction, }, dispatch)
}