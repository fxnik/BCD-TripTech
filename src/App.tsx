import React, { FC, useEffect } from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,  
  Redirect 
} from "react-router-dom";

import { useHistory } from "react-router-dom";

import AppContainer from './components/AppContainer/AppContainer'
import LeafletMap from './components/LeafletMap/LeafletMap'
import ViewPanel from './components/ViewPanel/ViewPanel'
import ToggleButton from './components/ToggleButton/ToggleButton'
import AuthForm from './components/AuthForm/AuthForm'

import { useTypedSelector } from './hooks/useTypedSelector';
import { useActions } from './hooks/useActions';

import './App.css';

//----------------------------------------------------------

const App: FC = () => {
  let history = useHistory();
  const { isAuthorized } = useTypedSelector(state => state.auth)
  const { setUserIsAuthorizedAction, } = useActions() 
  
  //console.log('isAuthorized= ', isAuthorized)

  /**
   *  to find out if user is already authorized 
   *  to cancel showing authorization form
   */
  useEffect(()=>{
    let userData: string | null = localStorage.getItem('userData') 
    if(userData) setUserIsAuthorizedAction(true)        
  }, [])
  
  //------------------------------------------

  return (
     <Router>       
        <Switch>

          <Route exact  path="/" >
             {isAuthorized ? <Redirect to="/map" /> : <Redirect to="/auth" />}
          </Route>

          <Route path="/auth">
            {isAuthorized ? <Redirect to="/map" /> : <AuthForm />}             
          </Route>

          <Route path="/map" >
              {isAuthorized ? 
                <AppContainer>
                  <LeafletMap />
                  <ViewPanel />
                  <ToggleButton />  

                </AppContainer>
              : 
              <Redirect to="/auth" />}             
          </Route>
          
        </Switch>      
    </Router>

    
  );
}

export default App;


