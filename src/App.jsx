import { useState, useEffect, useRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Cartesian3, Color, viewerCesiumInspectorMixin ,viewerCesium3DTilesInspectorMixin, IonResource, Ion} from 'cesium'
import { Viewer, Entity , GeoJsonDataSource, KmlDataSource,CameraFlyTo, Cesium3DTileset, ScreenSpaceEventHandler } from 'resium'




import './App.css'


// const position = Cartesian3.fromDegrees( -5.443517,  56.451267, 100);
// const pointGraphics = { pixelSize: 10 };

// const data = {
//   type: "Feature",
//   properties: {
//     name: "ard_bay",
//     amenity: "Ardmucknish Bay",
//     popupContent: "This is where we work",
//   },
//   geometry: {
//     type: "Point",
//     coordinates: [-104.99404, 39.75621],
//   },
// };

// const tileset = viewer.scene.primitives.add(
//   await Cesium.Cesium3DTileset.fromIonAssetId(2293352)
// );


// function App() {
  
//   const viewRef = useRef(null);

//   useEffect(() => {
//     console.log('rendered')

//     let handler;
//     if (viewRef.current){
//       console.log('making a listener')
//       handler = new ScreenSpaceEventHandler(viewRef.current.cesiumElement.scene.canvas);
//       handler.setInputAction(function(click) {
//           const pickedObject = viewRef.current.cesiumElement.scene.pick(click.position);
//           if (CesiumDefined(pickedObject) && pickedObject.id === 'uniqueID'){
//               console.log(pickedObject.id)
//           }
//           console.log(pickedObject)
//       }, ScreenSpaceEventType.LEFT_CLICK);

//     }
//     }, [
//       //destroy the listener here
//     ]); 

//   function clickTest() {
//     console.log("test")
//   }

//   return (
//     <>
//       <div className="cesium-container">
//       <Viewer>
//         <Entity position={position} point={pointGraphics} />
//         <CameraFlyTo destination={Cartesian3.fromDegrees(-5.43545876445209,  56.45732764483844, 1000)} />
//         <GeoJsonDataSource data={"./22_Alcyionium.json"} />

//       </Viewer>
    
//       </div>


//     </>

      
    
    


//   )
// }

// export default App



function App() {


  // let viewer; // This will be raw Cesium's Viewer object.

  // const handleReady = tileset => {
   
  //     viewer.zoomTo(tileset);
  //     console.log(tileset.show)
  //     tileset.tileLoad.addEventListener(function(tile) {
  //       console.log('A tile was loaded.');
  //   });

  // };
  Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjM5M2JiYy03ODhiLTQ2YmUtODhkNC0yNTdlZTQ2Y2RkOGMiLCJpZCI6MTU4OTgxLCJpYXQiOjE2OTY0MzgyNjJ9.4DRtmcWO-nxpnuMP8hNoq8AYgyy3ZQYYfxuZQ_p0W1w";
  

  let viewer;
  const handleReady = tileset => {
    console.log(tileset.statistics)
    viewer.zoomTo(tileset)
    viewer.scene.requestRenderMode = true;
    
  };




  return (
    <Viewer
    baseLayerPicker={false}
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
      {/* <CameraFlyTo destination={Cartesian3.fromDegrees(-5.43545876445209,  56.45732764483844, 1000)} /> */}
    </Viewer>

  );
}

export default App;


 

        






