//import { type } from 'os'
import {createStore} from 'redux'
//import {mapReducer} from './reducers/mapReducer'
import {applyMiddleware} from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk' 
import { rootReducer } from './reducers'

//============================================================================

export const store = createStore(
                                  rootReducer, 
                                  composeWithDevTools(applyMiddleware(thunk))
                                )