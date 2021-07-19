import { type } from 'os'
import {combineReducers} from 'redux'
import { mapReducer } from './mapReducer'


export const rootReducer = combineReducers({
    map: mapReducer    
})

export type RootState = ReturnType<typeof rootReducer>