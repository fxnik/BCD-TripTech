import React, { FC } from 'react';

//import {  Marker, Popup } from 'react-leaflet'
//import { EditControl } from "react-leaflet-draw";

import AppContainer from './components/AppContainer/AppContainer'
import LeafletMap from './components/LeafletMap/LeafletMap'
import ViewPanel from './components/ViewPanel/ViewPanel'
import ToggleButton from './components/ToggleButton/ToggleButton'

import './App.css';

//----------------------------------------------------------


const App: FC = () => {
  return (
     <AppContainer>
         <LeafletMap />
         <ViewPanel />
         <ToggleButton />        
                

     </AppContainer>
  );
} 



export default App;


