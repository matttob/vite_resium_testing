import { useState, useEffect, useRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Cartesian3, Color, viewerCesiumInspectorMixin ,viewerCesium3DTilesInspectorMixin, IonResource, Ion, WebMapServiceImageryProvider, DefaultProxy, WebMapTileServiceImageryProvider, Credit,TextureMinificationFilter, TextureMagnificationFilter} from 'cesium'
import { Viewer,Scene, Entity , GeoJsonDataSource, KmlDataSource,CameraFlyTo, Cesium3DTileset, ScreenSpaceEventHandler,PointGraphics,EntityDescription ,BillboardGraphics,ImageryLayer,useCesium} from 'resium'
import './App.css'

//input cesium ion api access token
Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjM5M2JiYy03ODhiLTQ2YmUtODhkNC0yNTdlZTQ2Y2RkOGMiLCJpZCI6MTU4OTgxLCJpYXQiOjE2OTY0MzgyNjJ9.4DRtmcWO-nxpnuMP8hNoq8AYgyy3ZQYYfxuZQ_p0W1w";

function App() {
  const emodnet_provider = new WebMapServiceImageryProvider({
    url : 'https://ows.emodnet-bathymetry.eu/wms',
    layers :  'mean_multicolour',
    proxy: new DefaultProxy('/proxy/'),
    minimumLevel: '0',
  });

  const handleReady_rov = tileset => {
    // dealing with main viewer properties THIS NEEDS TO BE FIXED IN FUTURE
    //  SO AS NOT TO RELY ON THE ONREADY EVENT OF THE FIRST THING TO BE RENDERED 
    // TO THE VIEWER FOLLOWING: https://resium.reearth.io/guide
    viewer._cesiumWidget._creditContainer.style.display = "none"
    viewer.forceResize();
    viewer.animation.container.style.visibility = "hidden"
    viewer.timeline.container.style.visibility = "hidden"
    viewer.scene.enableCollisionDetection = false
    // dealing with actual tiles
     // viewer.extend(viewerCesium3DTilesInspectorMixin);
    tileset._root.transform[14] = tileset._root.transform[14] -13 ;
    tileset.description = "Survey Name : Ardmucknish Bay 2023"
    viewer.zoomTo(tileset)
  };

  const handleReady_diver = tileset => {
    // crude way to modify vertical coordinate of model position
    // tileset._root.transform[14] = tileset._root.transform[14] - 50 ;
    tileset.description = "Survey Name : Ardmucknish Bay 2022"
  };

  const handleReady_creran = tileset => {
    tileset._root.transform[14] = tileset._root.transform[14] + 13 ;
    tileset.description = "Survey Name : Creran"
  };

  // Show text ox based on user hovering over tileset
  const [isHovering, setIsHovering] = useState(false)
  const [hoverBox, setHoverBox] = useState("")

  const handleHover = (e) => {
    setIsHovering(true)
    setHoverBox((viewer.scene.pick(e.endPosition).content._tileset._url))
    setHoverBox((viewer.scene.pick(e.endPosition).content._tileset.description))
  }

  function handleNoHover() {
    setIsHovering(false)
  }
 
//  check box for turning on or off image layer of bathymetry
 const [isChecked, setIsChecked] = useState(false)
 const Checkbox = () => {
  const checkHandler = () => {
      setIsChecked(!isChecked)}

    return (
      <div>
        <input
          type="checkbox"
          id="checkbox"
          checked={isChecked}
          onChange={checkHandler}
        />
        <label htmlFor="checkbox">Show bathymetry </label>
      </div>
    )
  }
  

  // define tileset marker positions     
  const ard_position = Cartesian3.fromDegrees( -5.43545876445209,  56.45732764483844, 0);
  const creran_position = Cartesian3.fromDegrees( -5.341055193857732, 56.51942835664191, 10);


  // initiate cesium viewer variable
  let viewer;

  return (
    
    <div className="map-container">

      <Viewer ref={e => {viewer = e && e.cesiumElement}}>

      <Scene>

        <ImageryLayer
        id = "bathy_imagery_layer"
        imageryProvider={emodnet_provider}
        magnificationFilter={TextureMagnificationFilter.LINEAR}
        alpha = {1}
        show = {isChecked? true : false}
        />
        <Cesium3DTileset 
        id="crack_ROV"
        url={IonResource.fromAssetId(2300148)} 
        // below is syntax for loading tiles from local storage instead of cesium ion following: 
        // https://github.com/CesiumGS/3d-tiles-samples/blob/main/INSTRUCTIONS.md
        // url={" http://localhost:8003/tileset.json"} 
        onReady={handleReady_rov}
        onMouseEnter={handleHover}
        onMouseLeave={handleNoHover} 
        />
        <Cesium3DTileset 
        id="crack_DIVER"
        url={IonResource.fromAssetId(2310560)} 
        onReady={handleReady_diver}
        onMouseEnter={handleHover}
        onMouseLeave={handleNoHover} 
        />  
        <GeoJsonDataSource data={"./22_Alcyionium.json"} />
        <Entity position={ard_position} name="Ard Bay">
          <BillboardGraphics image="./alcyonium_digitatum_icon_red.png" scale={0.02} />
          <EntityDescription>
            <h1>Ardmucknish Bay.</h1>
            <p>Alcyonium digitatum</p>
          </EntityDescription>
        </Entity>
        <Cesium3DTileset 
        id="Creran"
        url={IonResource.fromAssetId(2311985)} 
        // debugShowBoundingVolume = {true}
        // onReady={handleReady}
        onMouseEnter={handleHover}
        onMouseLeave={handleNoHover} 
        onReady={handleReady_creran}
        /> 
        <Entity position={creran_position} name="Creran">
          <BillboardGraphics image="./serp_icon_red.png" scale={0.02} />
          <EntityDescription>
            <h1>Creran</h1>
            <p>Serpula vermiclaris</p>
          </EntityDescription>
        </Entity>
        </Scene>
      </Viewer>


      {isHovering && <div className="info-div"> {hoverBox} </div>}
      <img src="./Logo2.png" alt=" "  className="trito-logo"/>

      <div className="bathyCheckBox">
        <Checkbox/>
      </div>

    </div>
  );
}

export default App;


 

        






