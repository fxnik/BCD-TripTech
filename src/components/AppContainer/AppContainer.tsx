import React ,{ FC } from 'react'
import './appContainerStyle.css'

//----------------------------------------

const AppContainer: FC = ({children}) => {    

    return (
        <div className="a__app-container">
            {children}
        </div>
    )
}

export default AppContainer
