import { useState, useEffect, useRef,FC} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Cartesian3, Color, viewerCesiumInspectorMixin ,viewerCesium3DTilesInspectorMixin, IonResource, Ion, WebMapServiceImageryProvider, DefaultProxy, WebMapTileServiceImageryProvider, Credit,TextureMinificationFilter, TextureMagnificationFilter} from 'cesium'
import { Viewer,Scene, Entity , GeoJsonDataSource, KmlDataSource,CameraFlyTo, Cesium3DTileset, ScreenSpaceEventHandler,PointGraphics,EntityDescription ,BillboardGraphics,ImageryLayer,useCesium} from 'resium'
import './App.css'
import { CustomSwitcher } from 'react-custom-switcher'


const optionsPrimary = [
  {
    label:  <div style={{ fontSize: 15,color: 'white', whiteSpace: "nowrap" ,fontFamily: 'Inter'}}>2022</div>,
    value: 2022,
    color: "#32a871"
  },
  {
    label: <div style={{ fontSize: 15,color: 'white', whiteSpace: "nowrap" ,fontFamily: 'Inter'}}>2023</div>,
    value: 2023,
    color: "#32a871"
  }

];



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
    // viewer.forceResize();
    viewer.animation.container.style.visibility = "hidden"
    viewer.timeline.container.style.visibility = "hidden"
    viewer._toolbar.style.visibility = "hidden"
    viewer.scene.enableCollisionDetection = false
    console.log(viewer._fullscreenButton._container)
    // viewer._cesiumWidget.hidden = true
    // viewer.baseLayerPicker = false
    // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // dealing with actual tiles
     // viewer.extend(viewerCesium3DTilesInspectorMixin);
    tileset._root.transform[14] = tileset._root.transform[14] -13 ;
    tileset.description = "Survey Name : Ardmucknish Bay 2023"
    
  };

  const handleReady_diver = tileset => {
    // crude way to modify vertical coordinate of model position
    // tileset._root.transform[14] = tileset._root.transform[14] - 50 ;
    tileset.description = "Survey Name : Ardmucknish Bay 2022"
  };

  const handleReady_creran = tileset => {
    tileset._root.transform[14] = tileset._root.transform[14] +50 ;
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
        <label htmlFor="checkbox" style={{ color: 'white' , fontFamily: 'Inter'}}> Bathymetry </label>
      </div>
    )
  }
  

  const [sliderYear, setSliderYear] = useState([2023])
  const [dateSliderContainerVis, setDateSliderContainerVis] = useState(false)

  function handleCreranClick() {
    setDateSliderContainerVis(false)
  }

  function handleArdBayClick() {
    setDateSliderContainerVis(true)
  }

  const handleclickAnywhereHandler = (e) => {
  var clickAnywhereHandler = new ScreenSpaceEventHandler(viewer.canvas);

  clickAnywhereHandler.setInputAction(function(movement) {
  console.log(movement.position); // position of click
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);}
  

  // define tileset marker positions     
  const ard_position = Cartesian3.fromDegrees( -5.43545876445209,  56.45732764483844, 0);
  const creran_position = Cartesian3.fromDegrees( -5.341055193857732, 56.51942835664191, 10);


  // initiate cesium viewer variable
  let viewer;

  return (
    <div >
      
    <div className="map-container">

      <Viewer full ref={e => {viewer = e && e.cesiumElement}}>

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
        show = {sliderYear == 2023?  true : false}
        />
        <Cesium3DTileset 
        id="crack_DIVER"
        url={IonResource.fromAssetId(2310560)} 
        onReady={handleReady_diver}
        onMouseEnter={handleHover}
        onMouseLeave={handleNoHover} 
        show = {sliderYear == 2022?  true : false}
        /> 
         <GeoJsonDataSource data={"./22_Alcyionium.json"} 
         show = {sliderYear == 2022?  true : false}/>
        <Entity position={ard_position} name="Ard Bay"
        onClick = {handleArdBayClick}>
          <BillboardGraphics image="./alcyonium_digitatum_icon_red.png" scale={0.02} />
          {/* <EntityDescription>
            <h1>Ardmucknish Bay.</h1>
            <p>Alcyonium digitatum</p>
          </EntityDescription> */}
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
        <Entity position={creran_position} name="Creran"
        onClick = {handleCreranClick}>
          <BillboardGraphics image="./serp_icon_red.png" scale={0.02} />
          <EntityDescription>
            <h1>Creran</h1>
            <p>Serpula vermiclaris</p>
          </EntityDescription>
        </Entity>
        </Scene>

      </Viewer>

      {dateSliderContainerVis && <div className='date-slider-container'>
        <CustomSwitcher
        className="date-slider"
        options={optionsPrimary}
        value={2023}
        containerWidth={200}
        callback={(currentValue) => setSliderYear(currentValue)}></CustomSwitcher>
        </div>}






    </div>
 
    <div className="nav-bar-top">
    </div>

    <img src="./new_logo_draft.png" alt=" "  className="trito-logo"/>
    
    <div className="logo-text">
      Hydrophis
    </div>

    <div className="nav-bar-text">
      <div>LOGIN</div> 
      <div>CONTACT</div> 
      <div>ABOUT</div>   
    </div>

    <div className="bathy-checkBox">
        <Checkbox/>
        </div>

       

    {isHovering && <div className="info-div"> </div>}
    {isHovering && <div  className="info-div-text" >
      <h2>Model Vital Stats</h2>
       {hoverBox} </div> }

   

    </div>
  );
}

export default App;


 

        




