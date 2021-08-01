

interface IAuthState {
  isAuthorized: boolean;  
}

export enum AuthActionTypes {
  SET_USER_IS_AUTHORIZED = "USER_IS_AUTHORIZED"
}

interface ISetUserIsAuthorized {
  type: AuthActionTypes.SET_USER_IS_AUTHORIZED
  payload: boolean;
}

export type AuthAction =  ISetUserIsAuthorized;

//----------------------------------------------

const initialState: IAuthState = {
    isAuthorized: false    
}

export const authReducer = (state = initialState, action: AuthAction)=> {
    switch (action.type) {
      case AuthActionTypes.SET_USER_IS_AUTHORIZED:
          return {...state, isAuthorized: action.payload } 


        default:
          return state
    }
}

      
//------------------------- ACTION CREATORS --------------------------------------

export const setUserIsAuthorizedAction = (payload: boolean): AuthAction => ({
  type: AuthActionTypes.SET_USER_IS_AUTHORIZED, 
  payload: payload
})