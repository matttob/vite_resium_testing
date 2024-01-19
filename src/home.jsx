

import { useState, useEffect, useRef} from 'react'

import {Math,NearFarScalar, Rectangle,ArcGISTiledElevationTerrainProvider,CesiumTerrainProvider,HeadingPitchRoll,Matrix4,Transforms, Cartesian3, Color, viewerCesiumInspectorMixin ,viewerCesium3DTilesInspectorMixin, IonResource, Ion, WebMapServiceImageryProvider, DefaultProxy, WebMapTileServiceImageryProvider, Credit,TextureMinificationFilter, TextureMagnificationFilter} from 'cesium'
import { Viewer,Scene, Entity , GeoJsonDataSource, KmlDataSource,CameraFlyTo, Cesium3DTileset, ScreenSpaceEventHandler,PointGraphics,EntityDescription ,BillboardGraphics,ImageryLayer,useCesium} from 'resium'
import './home.css'
import { CustomSwitcher } from 'react-custom-switcher'
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import tileset_ids from "./s3_tile_ids.js"
import * as turf from '@turf/turf'



// // Deal with test geojson file
async function geoJsonTranslateHeight(geoJsonPath,heightAdjust) {
  var info = await fetch(geoJsonPath)
  .then(res => {
  return res.json();
  }).then(data => {
  return data;
  });
  return turf.transformTranslate(info, 0, 0, { zTranslation: heightAdjust});
}

var transparent_ocean = false


var tileMarkerPositions =[]

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
// Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjM5M2JiYy03ODhiLTQ2YmUtODhkNC0yNTdlZTQ2Y2RkOGMiLCJpZCI6MTU4OTgxLCJpYXQiOjE2OTY0MzgyNjJ9.4DRtmcWO-nxpnuMP8hNoq8AYgyy3ZQYYfxuZQ_p0W1w";

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

// const terrainProvider = await ArcGISTiledElevationTerrainProvider.fromUrl("https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer", {
//   token: "KED1aF_I4UzXOHy3BnhwyBHU4l5oY6rO6walkmHoYqGp4XyIWUd5YZUC1ZrLAzvV40pR6gBXQayh0eFA8m6vPg.."
// });


function Home() {

  const viewer_ref = useRef(null);

  const [viewerReady, setViewerReady] = useState(false)
  

  function computeTransform(latitude, longitude, height) {
    var offset = height;
    var cartesianOffset = Cartesian3.fromDegrees(longitude, latitude, offset);
    return Transforms.headingPitchRollToFixedFrame(cartesianOffset, new HeadingPitchRoll());
}



// Add custom terrain
  // const customTerrainProvider = new CesiumTerrainProvider({
  //       url:" http://localhost:8003/tileset.json"
  //     });
  
  useEffect(() => {
    setTimeout(() => {
    if (viewer_ref.current && viewer_ref.current.cesiumElement) {
        viewer_ref.current.cesiumElement._cesiumWidget._creditContainer.style.display = "none"
        viewer_ref.current.cesiumElement.animation.container.style.visibility = "hidden"
        viewer_ref.current.cesiumElement.timeline.container.style.visibility = "hidden"
        viewer_ref.current.cesiumElement._toolbar.style.visibility = "hidden"


        viewer_ref.current.cesiumElement.scene.backgroundColor = Color.BLACK.clone();
        viewer_ref.current.cesiumElement.scene.screenSpaceCameraController.enableCollisionDetection = false;

        // add custom terrain
        // viewer_ref.current.cesiumElement.scene.terrainProvider = customTerrainProvider
 
        // create core globe sphere and set transparency high at high zoom levels
        const outerCoreRadius = 6320000.0;
        const outerCore = viewer_ref.current.cesiumElement.entities.add({
          name: "Outer Core",
          position: Cartesian3.ZERO,
          ellipsoid: {
            radii: new Cartesian3(
              outerCoreRadius,
              outerCoreRadius,
              outerCoreRadius
            ),
            material: Color.BLACK,
          },
        });
      
        const globe = viewer_ref.current.cesiumElement.scene.globe;
        globe._translucency._frontFaceAlphaByDistance = new NearFarScalar(
          400.0,
          0.0,
          800.0,
          1.0
        );
        globe._translucency._enabled = true
        globe._translucency._frontFaceAlphaByDistance._nearValue = 1;
        globe._translucency._frontFaceAlphaByDistance._farValue = true
        
        
        
        // Set oceans on Bing base layer to transparent
        if (transparent_ocean) {
        const globe = viewer_ref.current.cesiumElement.scene.globe;
        const baseLayer = viewer_ref.current.cesiumElement.scene.imageryLayers.get(0);
        globe.showGroundAtmosphere = false;
        globe.baseColor = Color.TRANSPARENT;
        globe.translucency.enabled = true;
        globe.undergroundColor = undefined;
        baseLayer.colorToAlpha = new Color(0.0, 0.016, 0.059);
        baseLayer.colorToAlphaThreshold = 0.2;}

      

      // finally show viewer when it has been available to ref  
        setViewerReady(true)
      }}, 1); }, []);

  const geoJsonReady = geo => {

  }

      
 const [tileMarkerAtt, setTileMarkerAtt] = useState([])

  const handleReady_tileset = tileset => {
    
    


    // match featureIdlabel from tileset to that of tileset object array in order to be able to apply tileset specfic attirbutes
    var verticalOffset
    const tileSetDetails = tileset_ids.map(tiles => {
      if (Object.values(tiles).includes(tileset.featureIdLabel)  ) {
        verticalOffset = -1*tiles.verticalOffset}
      })
    
      // Position the tileset
      var position = Matrix4.getTranslation(tileset._root.transform, new Cartesian3());
      var cartographicPosition = viewer_ref.current.cesiumElement.scene.globe.ellipsoid.cartesianToCartographic(position);
      tileset._root.transform = Matrix4.IDENTITY;
      tileset._root.transform = computeTransform(cartographicPosition.latitude/ Math.PI * 180, cartographicPosition.longitude/ Math.PI * 180, verticalOffset); // or set tileset._root.transform directly
      position = Matrix4.getTranslation(tileset._root.transform, new Cartesian3());
      cartographicPosition = viewer_ref.current.cesiumElement.scene.globe.ellipsoid.cartesianToCartographic(position);


     // add attributes to marker array
      var pos = {}
      const tileSetPosition = tileset_ids.map(tiles => {
    
        if (Object.values(tiles).includes(tileset.featureIdLabel)  ) {
        pos = {"name":tiles.name,
                    "cartoPosition" : position,
                    "longitude" : (cartographicPosition.longitude/ Math.PI * 180),
                    "latitude" : (cartographicPosition.latitude/ Math.PI * 180),
                    "markerType" : tiles.markerPath,
                    "id" : tiles.id,
                  "temporalGroupID" : tiles.temporalGroupID}}})
      
         
        tileMarkerPositions.push(pos)
        const key = 'id';
        const arrayUniqueByKey = [...new Map(tileMarkerPositions.map(item =>
          [item[key], item])).values()];
        
        setTileMarkerAtt(arrayUniqueByKey)
      
     
      
    // clamp tiles to terrain
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
    setInfoText((viewer_ref.current.cesiumElement.scene.pick(mousePosIn.position).content._tileset.featureIdLabel))
    setIsInfo({ isPaneOpenLeft: true })

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
  

  // date slider state visibility based on 
  const [sliderYear, setSliderYear] = useState([])
  const [dateSliderContainerVis, setDateSliderContainerVis] = useState(false)


  function handleBillboardClick(mousePosIn) { 
    const findMarker = tileMarkerAtt.map(markers => {
    if (viewer_ref.current.cesiumElement.scene.pick(mousePosIn.position).id._name === markers.name)
      {if (markers.temporalGroupID.length  > 0 )   
        {setDateSliderContainerVis(true)}
      else {{setDateSliderContainerVis(false)} }}
    })
  }



  const markerElements = tileMarkerAtt.map(markers => {
    return <Entity 
    key={markers.id}
    position={Cartesian3.fromDegrees(markers.longitude, markers.latitude,0)} 
    name={markers.name}
    onClick = {handleBillboardClick}>
    <BillboardGraphics image={markers.markerType} scale={0.02} />
  </Entity>
  })

  let sliderShow 
  const tileSetElements = tileset_ids.map(tiles => {
    if (tiles.temporalGroupID.length  > 0 )   
      {if (sliderYear == tiles.year) {sliderShow = true}
      else {sliderShow = false}}
    else {sliderShow = true}


    return <Cesium3DTileset 
    key={tiles.id}
    featureIdLabel={tiles.description}
    url={tiles.url} 
    onReady={handleReady_tileset}
    onMouseEnter={handleHover}
    onMouseLeave={handleNoHover}
    onRightClick = {handleModelRightClick}
    show = {sliderShow}
    />
  })

  const geoJsonElements = tileset_ids.map(geoJsons => {
    if (geoJsons.geojsonPath.length > 1)  {
    return  <GeoJsonDataSource data={geoJsonTranslateHeight(geoJsons.geojsonPath,geoJsons.geoJsonHeightAdjust)} 
    show = {sliderYear == geoJsons.year?  true : false}
    onLoad = {geoJsonReady}
    key={geoJsons.id}/> }
    else {
    
    }
  })



  return (
  <div >
      
    <div className="map-container" style={{visibility: viewerReady ? 'visible' : 'hidden' }}   >
      <Viewer skyBox = {false} ref={viewer_ref}>
        <Scene>
          <ImageryLayer
            id = "bathy_imagery_layer"
            imageryProvider={emodnet_provider}
            magnificationFilter={TextureMagnificationFilter.LINEAR}
            alpha = {1}
            show = {isChecked? true : false}
          />
          {markerElements}
          {tileSetElements}
          {geoJsonElements}
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

export default Home;



