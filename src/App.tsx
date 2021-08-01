import React, { FC } from 'react';

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
  const { isAuthorized } = useTypedSelector(state => state.auth)

  //let userData: string = localStorage.getItem('userData')?.token;

  //if(JSON.parse())

  if(!isAuthorized) return <AuthForm />

  return (
     <AppContainer>
         <LeafletMap />
         <ViewPanel />
         <ToggleButton />        
                

     </AppContainer>
  );
} 



export default App;


