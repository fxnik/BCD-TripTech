
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';

import './toggleButtonStyle.css';

//--------------------

const ToggleButton = () => {
    const { viewPanelIsOpened } = useTypedSelector(state => state.app)
    const { setViewPanelIsOpenedAction } = useActions()

    const toggleViewPanel = () => {
        setViewPanelIsOpenedAction(!viewPanelIsOpened) 
    }
    
    return (
        <div className={ viewPanelIsOpened? "a__toggle-button a__is-active": "a__toggle-button"} 
             onClick={toggleViewPanel}
             title="open/close"
        >
            <i className="fas fa-exchange-alt"></i>
        </div>
    )
}

export default ToggleButton
