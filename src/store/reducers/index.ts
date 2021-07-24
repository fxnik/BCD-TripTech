import { type } from 'os'
import {combineReducers} from 'redux'
import { mapReducer } from './mapReducer'

//====================================================

export const rootReducer = combineReducers({
    app: mapReducer    
})

export type RootState = ReturnType<typeof rootReducer>