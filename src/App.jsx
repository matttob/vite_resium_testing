import { useState, useEffect, useRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Cartesian3, Color, viewerCesiumInspectorMixin ,viewerCesium3DTilesInspectorMixin, IonResource, Ion} from 'cesium'
import { Viewer, Entity , GeoJsonDataSource, KmlDataSource,CameraFlyTo, Cesium3DTileset, ScreenSpaceEventHandler } from 'resium'


import './App.css'



function App() {

  Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjM5M2JiYy03ODhiLTQ2YmUtODhkNC0yNTdlZTQ2Y2RkOGMiLCJpZCI6MTU4OTgxLCJpYXQiOjE2OTY0MzgyNjJ9.4DRtmcWO-nxpnuMP8hNoq8AYgyy3ZQYYfxuZQ_p0W1w";
  
  let viewer;
  const handleReady = tileset => {
    
    console.log(tileset.statistics)

  
   
  };

  return (
    <Viewer
      full
      ref={e => {
        viewer = e && e.cesiumElement;
      }}>
      <Cesium3DTileset 
      url={IonResource.fromAssetId(2300148)} 
      maximumScreenSpaceError = {1}
      skipLevelOfDetail = {false}
      onReady={handleReady}
      debugShowContentBoundingVolume = {true}

      />
    </Viewer>

  );
}

export default App;


 

        






