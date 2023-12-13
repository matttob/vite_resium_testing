import { useState, useEffect, useRef,FC} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { ArcGISTiledElevationTerrainProvider,CesiumTerrainProvider,HeadingPitchRoll,Matrix4,Transforms, Cartesian3, Color, viewerCesiumInspectorMixin ,viewerCesium3DTilesInspectorMixin, IonResource, Ion, WebMapServiceImageryProvider, DefaultProxy, WebMapTileServiceImageryProvider, Credit,TextureMinificationFilter, TextureMagnificationFilter} from 'cesium'
import { Viewer,Scene, Entity , GeoJsonDataSource, KmlDataSource,CameraFlyTo, Cesium3DTileset, ScreenSpaceEventHandler,PointGraphics,EntityDescription ,BillboardGraphics,ImageryLayer,useCesium} from 'resium'
import './App.css'
import { CustomSwitcher } from 'react-custom-switcher'
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";



// Date slider options
const CustomSwitcheroptionsPrimary = [
  {
    label:  <div style={{ fontSize: 15,color: 'white', whiteSpace: "nowrap" ,fontFamily: 'Inter'}}>2022</div>,
    value: 2022,
    color: "#32a871"
  },
  {
    label: <div style={{ fontSize: 15,color: 'white', whiteSpace: "nowrap" ,fontFamily: 'Inter'}}>2023</div>,
    value: 2023,
    color: "#32a871"
  }];

//Cesium ion api access token
Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjM5M2JiYy03ODhiLTQ2YmUtODhkNC0yNTdlZTQ2Y2RkOGMiLCJpZCI6MTU4OTgxLCJpYXQiOjE2OTY0MzgyNjJ9.4DRtmcWO-nxpnuMP8hNoq8AYgyy3ZQYYfxuZQ_p0W1w";

// Bathymetry image provider details
const emodnet_provider = new WebMapServiceImageryProvider({
  url : 'https://ows.emodnet-bathymetry.eu/wms',
  layers :  'mean_multicolour',
  proxy: new DefaultProxy('/proxy/'),
  minimumLevel: '0',
});


// define tileset entity marker positions   currently hard wired but clearly need to be derived from tileset data
const ard_position = Cartesian3.fromDegrees( -5.43545876445209,  56.45732764483844, 0);
const creran_position = Cartesian3.fromDegrees( -5.341055193857732, 56.51942835664191, 10);

const terrainProvider = await ArcGISTiledElevationTerrainProvider.fromUrl("https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer", {
  token: "KED1aF_I4UzXOHy3BnhwyBHU4l5oY6rO6walkmHoYqGp4XyIWUd5YZUC1ZrLAzvV40pR6gBXQayh0eFA8m6vPg.."
});

  
function App() {


  const viewer_ref = useRef(null);

  const [viewerReady, setViewerReady] = useState(false)
  

  function computeTransform(latitude, longitude, height) {
    var offset = height;
    var cartesianOffset = Cartesian3.fromDegrees(longitude, latitude, offset);
    return Transforms.headingPitchRollToFixedFrame(cartesianOffset, new HeadingPitchRoll());
}



// Add custom terrain
  // const terrainProvider = new CesiumTerrainProvider({
  //       url:" http://localhost:8003/tileset.json"
  //     });
  
  useEffect(() => {
    setTimeout(() => {
    if (viewer_ref.current && viewer_ref.current.cesiumElement) {
        viewer_ref.current.cesiumElement._cesiumWidget._creditContainer.style.display = "none"
        viewer_ref.current.cesiumElement.animation.container.style.visibility = "hidden"
        viewer_ref.current.cesiumElement.timeline.container.style.visibility = "hidden"
        // viewer_ref.current.cesiumElement._toolbar.style.visibility = "hidden"
        // viewer_ref.current.cesiumElement.scene.terrainProvider = terrainProvider


        
        const globe = viewer_ref.current.cesiumElement.scene.globe;
        const baseLayer = viewer_ref.current.cesiumElement.scene.imageryLayers.get(0);

        
        globe.showGroundAtmosphere = false;
        globe.baseColor = Color.TRANSPARENT;
        globe.translucency.enabled = true;
        globe.undergroundColor = undefined;
      
        // Set oceans on Bing base layer to transparent
        baseLayer.colorToAlpha = new Color(0.0, 0.016, 0.059);
        baseLayer.colorToAlphaThreshold = 0.2;
        // baseLayer.colorToAlphaThreshold = 0.2;
        viewer_ref.current.cesiumElement.scene.enableCollzisionDetection = false
        
        
        const outerCoreRadius = 6300000;
        const outerCore = viewer_ref.current.cesiumElement.entities.add({
          name: "Outer Core",
          position: Cartesian3.ZERO,
          ellipsoid: {
            radii: new Cartesian3(
              outerCoreRadius,
              outerCoreRadius,
              outerCoreRadius
            ),
            material: Color.GREY,
          },
        });




        setViewerReady(true)
      }}, 1); }, []);



  const handleReady_rov = tileset => {

   
    // tileset._root.transform[14] = 0 ;
    var position = Matrix4.getTranslation(tileset._root.transform, new Cartesian3());
    var cartographicPosition = viewer_ref.current.cesiumElement.scene.globe.ellipsoid.cartesianToCartographic(position);

    
       // Position the tileset
       var longitude = -5.43545876445209;  
       var latitude = 56.45732764483844;
       var height = -15;
       tileset._root.transform = Matrix4.IDENTITY;
       tileset._root.transform = computeTransform(latitude, longitude, height); // or set tileset._root.transform directly
      position = Matrix4.getTranslation(tileset._root.transform, new Cartesian3());
      cartographicPosition = viewer_ref.current.cesiumElement.scene.globe.ellipsoid.cartesianToCartographic(position);
  
    // tileset.description = "Survey Name : Ardmucknish Bay 2023"
    //     //  let c3d_layers
    //     //  c3d_layers = viewer_ref.current.cesiumElement.scene.primitives._primitives.filter(pr => pr.constructor.name=='Cesium3DTileset')
    //     //  console.log(c3d_layers[0]._root._header.transform)


    //      var heightOffset = 20.0;
    //      var boundingSphere = tileset.boundingSphere;
    //      var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    //      var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    //       console.log(surface)
    //      var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
    //      var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    //      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

        //  viewer_ref.current.cesiumElement.scene.clampToHeightMostDetailed(c3d_layers[0]._root._header.boundingVolume)
  };

  // const handleReady_rov_local = tileset => {
  //   tileset._root.transform[14] = tileset._root.transform[14] +10;
  //   tileset.description = "Survey Name : Ardmucknish Bay 2023"
  // };


  const handleReady_diver = tileset => {
    tileset._root.transform[14] = tileset._root.transform[14] ;
    tileset.description = "Survey Name : Ardmucknish Bay 2022"

  };

  const handleReady_creran = tileset => {
    tileset._root.transform[14] = tileset._root.transform[14] +50 ;
    tileset.description = "Survey Name : Creran"
  };

  const [isHovering, setIsHovering] = useState(false)
  const handleHover = (mousePosIn) => {  
    setIsHovering(true)

  }

  function handleNoHover() {
    setIsHovering(false)
  }

  // control info slide out pane
  const [InfoText, setInfoText] = useState("")

  const [isInfo, setIsInfo] = useState({
    isInfoPaneOpen: false,
    isInfoPaneOpenLeft: false,
  });


  const handleModelRightClick = (mousePosIn) => {  
    setInfoText((viewer_ref.current.cesiumElement.scene.pick(mousePosIn.position).content._tileset.description))
    setIsInfo({ isPaneOpenLeft: true })
    // console.log(viewer_ref.current.cesiumElement.scene.pick(mousePosIn.position).content._tileset._root.transform)

  };

//  check box for turning on or off bathymetry image layer 
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
  

  // date slider state
  const [sliderYear, setSliderYear] = useState([])
  const [dateSliderContainerVis, setDateSliderContainerVis] = useState(false)
  // crude way to link date slider to tileset. Currently on for a single survey (2 tile sets ) and off for another
   // date slider on
  function handleArdBayClick() {
    setDateSliderContainerVis(true)
  }
  // date slider off
  function handleCreranClick() {
    setDateSliderContainerVis(false)
  }


  return (
  <div >
      
    <div className="map-container" style={{visibility: viewerReady ? 'visible' : 'hidden' }}   >
      <Viewer ref={viewer_ref}>
        <Scene>
          <ImageryLayer
            id = "bathy_imagery_layer"
            imageryProvider={emodnet_provider}
            magnificationFilter={TextureMagnificationFilter.LINEAR}
            alpha = {1}
            show = {isChecked? true : false}
          />
          <Entity position={ard_position} name="Ard Bay"
            onClick = {handleArdBayClick}>
            <BillboardGraphics image="./alcyonium_digitatum_icon_red.png" scale={0.02} />
          </Entity>
          {/* <Cesium3DTileset 
            id="crack_ROV_local"
            // below is syntax for loading tiles from local storage instead of cesium ion following:  // https://github.com/CesiumGS/3d-tiles-samples/blob/main/INSTRUCTIONS.md
            url={" http://localhost:8003/tileset.json"} 
            onReady={handleReady_rov_local}
            onMouseEnter={handleHover}
            onMouseLeave={handleNoHover}
            onRightClick = {handleModelRightClick}
            show = {sliderYear == 2023?  true : false}
          /> */}
            <Cesium3DTileset 
            id="crack_ROV"
            url={IonResource.fromAssetId(2300148)} 
            // below is syntax for loading tiles from local storage instead of cesium ion following: 
            // url={" http://localhost:8003/tileset.json"} 
            onReady={handleReady_rov}
            onMouseEnter={handleHover}
            onMouseLeave={handleNoHover}
            onRightClick = {handleModelRightClick}
            show = {sliderYear == 2023?  true : false}
          />
          <Cesium3DTileset 
            id="crack_DIVER"
            url={IonResource.fromAssetId(2310560)} 
            onReady={handleReady_diver}
            onMouseEnter={handleHover}
            onMouseLeave={handleNoHover} 
            onRightClick = {handleModelRightClick}
            show = {sliderYear == 2022?  true : false}
          /> 
          <GeoJsonDataSource data={"./22_Alcyionium.json"} 
            show = {sliderYear == 2022?  true : false}
          />
          <Entity position={creran_position} name="Creran"
            onClick = {handleCreranClick}>
            <BillboardGraphics image="./serp_icon_red.png" scale={0.02} />
            <EntityDescription>
              <h1>Creran</h1>
              <p>Serpula vermiclaris</p>
            </EntityDescription>
          </Entity>
          <Cesium3DTileset 
            id="Creran"
            url={IonResource.fromAssetId(2311985)} 
            onMouseEnter={handleHover}
            onMouseLeave={handleNoHover} 
            onReady={handleReady_creran}
          /> 
        </Scene>
      </Viewer>

      {dateSliderContainerVis && <div className='date-slider-container'>
      <CustomSwitcher
        className="date-slider"
        options={CustomSwitcheroptionsPrimary}
          // value={2023}
        containerWidth={200}
        callback={(currentValue) => setSliderYear(currentValue)}> 
      </CustomSwitcher>
      </div>}

    </div>
 
    {/* <div className="nav-bar-top">
    </div>

    <img src="./new_logo_draft.png" alt=" "  className="trito-logo"/>
    
    <div className="logo-text">
      Hydrophis
    </div>

    <div className="nav-bar-text">
      <div>LOGIN</div> 
      <div>CONTACT</div> 
      <div>ABOUT</div>   
    </div> */}

    <div className="bathy-checkBox">
        <Checkbox/>
    </div>

    <SlidingPane className =  "my-sliding-pane"
      // closeIcon={<div>Some div containing custom close icon.</div>}
      isOpen={isInfo.isPaneOpenLeft}
      title="Model Vital Stats"
      from="left"
      width="500px"
      onRequestClose={() => setIsInfo({isPaneOpenLeft: false })}>
      <div  >{InfoText}</div>
    </SlidingPane>

</div>
  );
}

export default App;



