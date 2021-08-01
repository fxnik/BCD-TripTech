import { type } from 'os'
import {combineReducers} from 'redux'
import { mapReducer } from './mapReducer'
import { authReducer } from './authReducer'

//====================================================

export const rootReducer = combineReducers({
    app: mapReducer, 
    auth: authReducer   
})

export type RootState = ReturnType<typeof rootReducer>