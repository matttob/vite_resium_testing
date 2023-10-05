import { PointPrimitive, PointPrimitiveCollection, Viewer, useCesiumComponent } from 'resium';
import { Cartesian3, Color, PointPrimitiveCollection as PPC, ScreenSpaceEventHandler, ScreenSpaceEventType, defined as CesiumDefined} from 'cesium';
import { useEffect, useRef } from 'react';

const ingestStream = () => {
    const collectionRef = useRef(null);
    const viewRef = useRef(null);
    let pc: any;

    const addPoints = (pt) => {
        console.log('adding')
        if (pc === undefined) {
            if (collectionRef.current && collectionRef.current.cesiumElement) {
                pc = collectionRef.current.cesiumElement;
                globalThis.pointColl = pc;
                //TODO: add the else{} contents here when done editing them
            }
        } else {
            //adds point normally, ignores onClick
            pc.add({
                position: Cartesian3.fromDegrees(pt.LON, pt.LAT+2, pt.ALT_GEOM),
                color: { red: 1, green: 1, blue: 0, alpha: 1 },
                pixelSize: 60,
                onClick: () => {console.log('ow, clickage')},
                id: 'uniqueID'
            })
            
            //Adds onClick, but onClick does not fire with clicks
            const e = pc.add({
                position: Cartesian3.fromDegrees(pt.LON, pt.LAT, pt.ALT_GEOM),
                color: { red: 1, green: 1, blue: 0, alpha: 1 },
                pixelSize: 60,
                }
            );
            e.onClick = () => console.log('touched point')

            //adds point to (0,0,0) without onClick
            pc.add(JSXPoint_added)
            
        }
    };

    const ptconst = {
        LON: -80,
        LAT:43,
        ALT_GEOM: 100
    }

    const clickHandler = () => addPoints(ptconst)
    
    const JSXPoint_added = <PointPrimitive 
        position={ Cartesian3.fromDegrees(-77, 43, 100)} 
        color={Color.CYAN}
        pixelSize={30}
        onClick={clickHandler}
    />

    //onClick works, but there's no obvious reason when I inspect the PointPrimitiveCollection
    //or when I inspect PointPrimitiveCollection.get(0)
    const original = <PointPrimitive 
        position={ Cartesian3.fromDegrees(-75, 43, 100)} 
        color={Color.CYAN}
        pixelSize={30}
        onClick={clickHandler}
    />
    
    
    useEffect(() => {
        console.log('rendered')

    let handler;
    if (viewRef.current){
        console.log('making a listener')
        handler = new ScreenSpaceEventHandler(viewRef.current.cesiumElement.scene.canvas);
        handler.setInputAction(function(click) {
            const pickedObject = viewRef.current.cesiumElement.scene.pick(click.position);
            if (CesiumDefined(pickedObject) && pickedObject.id === 'uniqueID'){
                console.log(pickedObject.id)
            }
            console.log(pickedObject)
        }, ScreenSpaceEventType.LEFT_CLICK);
    
    }
    }, [
        //destroy the listener here
    ]); 
    
    
    

    return (
        <Viewer
                id="resiumContainer"
                full
                baseLayerPicker={false}
                geocoder={false}
                animation={false}
                timeline={false}
                navigationInstructionsInitiallyVisible={false}
                ref={viewRef}
            >
            <PointPrimitiveCollection  ref={collectionRef}>
                {original}
            </PointPrimitiveCollection>

        </Viewer>

    );
};

export default ingestStream;