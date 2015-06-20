'use strict';

var RadReveal = require('rad-reveal');
var ele;
var viewer;
var pins = [];

if(typeof Cesium == 'undefined') {
    //headjs 0.96 which ships with reveal.js doesn't support CSS loading...
    var cssElement = document.createElement('link');
    cssElement.setAttribute('rel', 'stylesheet');
    cssElement.setAttribute('href', 'node_modules/cesiumjs/Build/Cesium/Widgets/widgets.css');
    document.head.appendChild(cssElement);

    head.js('node_modules/cesiumjs/Build/Cesium/Cesium.js'); //todo: how to do this right?
}

function initialize(config) {
    ele = document.createElement('div');
    ele.className = 'rad-geo-container';
    ele.style.backgroundColor = 'black';
    ele.id = 'rad-geo-cesiumjs-container'
    document.body.appendChild(ele);
    runOnceCesium(10, config); 
}

//TODO: best way?
function runOnceCesium(count, config) {
    if(typeof Cesium == 'undefined') {
        if(count <= 0) {
            alert('Cesium could not be loaded?');
            return;
        } else {
            return setTimeout(function() { runOnceCesium(count--, config); }, 100);
        }
    }

    var options = {
        animation: false,
        timeline: false,
        geocoder: false,
        navigationHelpButton: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        homeButton: false,
        sceneModePicker: false
    }

    setupMapStyles();

    if(config) {/*rethink
        if(typeof config.imageryProviderClass == 'string') {
            var className = config.imageryProviderClass;
            var ipConfig = config.imageryProviderConfig;
            
            if(className == 'BingMapsImageryProvider') {
                options.imageryProvider = getBingMapsImageryProvider(ipConfig.mapStyle);
            } else {
                throw new Error('Unknown imageryProviderClass');
            }
        } else if(typeof config.imageryProvider == 'object') {
            options.imageryProvider = config.imageryProvider;
        }
    */}

    viewer = new Cesium.Viewer(ele.id, options);
    document.querySelector('.cesium-infoBox-iframe').setAttribute('sandbox', 'allow-same-origin allow-popups allow-forms allow-scripts');
}

function show(slideObj) {
    if(typeof Cesium == 'undefined' || viewer == null) {
        setTimeout(function() {
            show(slideObj);
        }, 100);
        return;
    }

    var gotoData = slideObj.data.geo['goto'];
    var pinData = slideObj.data.geo.pin;
    var zoomData = slideObj.data.geo.zoom;
    var speedData = slideObj.data.geo.speed;
    var styleData = slideObj.data.geo.style;
    
    if(styleData) {
        doStyle(styleData);
    }

    if(gotoData == 'pin' && pinData) { 
        doGoto(pinData, zoomData, speedData);
    } else if(gotoData) {
        doGoto(gotoData, zoomData, speedData);
    } else if(zoomData) {
        doGoto([], zoomData, speedData);
    }

    if(pinData) {
        console.log('pin');
        console.log(pinData);
        doPin(pinData);
    } else {
        console.log('clear');
        clearPins();
    }

    //TODO: need animated opacity
    ele.style.display = 'block';
    
}

function hide() {
    //TODO: need animated opacity
    ele.style.display = 'none';
} 

var createdImageryProviderLayers = {};
var imageryProviders = { };
var mapStyles = {};

function setupMapStyles() {
    imageryProviders = {
        NASA_BLACKMARBLE: function() {
            return new Cesium.TileMapServiceImageryProvider({
                url : '//cesiumjs.org/tilesets/imagery/blackmarble',
                maximumLevel : 8,
                credit : 'Black Marble imagery courtesy NASA Earth Observatory'
            });
        }
    };
    Object.keys(Cesium.BingMapsStyle).forEach(function(mapStyle) {
        imageryProviders['BING_' + mapStyle] = function() { return getBingMapsImageryProvider(mapStyle); }
    });


    Object.keys(imageryProviders).forEach(function(imagery) {
        ['SCENE2D', 'SCENE3D', 'COLUMBUS_VIEW'].forEach(function(sceneMode) {
            mapStyles[sceneMode + '_' + imagery] = { sceneMode: sceneMode, imagery: imagery };
        });
    });
}

var currentSceneMode = 'SCENE3D';

function changeSceneMode(sceneMode) {
    if(currentSceneMode === sceneMode) {
        return;
    }

    //var sceneTransitioner = new Cesium.SceneTransitioner(viewer.scene);
    
    if(sceneMode == 'SCENE2D') {
        viewer.scene.morphTo2D(2);
    } else if(sceneMode == 'SCENE3D') {
        viewer.scene.morphTo3D(2);
    } else if(sceneMode == 'COLUMBUS_VIEW') {
        viewer.scene.morphToColumbusView(2);
    }

    currentSceneMode = sceneMode;
}

function getBingMapsImageryProvider(mapStyle) {
    //TODO: what to do here?
    var lsKey = 'rad-geo-cesium-bingMapsApi-defaultKey';
    var bingKey = localStorage.getItem(lsKey);
    if(bingKey) {
        Cesium.BingMapsApi.defaultKey = bingKey;
    } else {
        console.log('Once you have a bing maps key, set it using `localStorage.setItem(\'' + lsKey + '\', \'your-key\');`.  Meanwhile, some functionality may not be available.');
    }

    return new Cesium.BingMapsImageryProvider({
        url : '//dev.virtualearth.net',
        key : bingKey,
        mapStyle : Cesium.BingMapsStyle[mapStyle]
    });
}

function doStyle(styleData) {
    var layers = viewer.scene.imageryLayers;
    var layer = createdImageryProviderLayers[mapStyles[styleData].imagery];
    if(!layer) {
        var imageryProvider = imageryProviders[mapStyles[styleData].imagery];
        layer = layers.addImageryProvider(imageryProvider());
        createdImageryProviderLayers[mapStyles[styleData].imagery] = layer;
    } else {
        layers.raiseToTop(layer);
    }
    changeSceneMode(mapStyles[styleData].sceneMode);
}

function doPin(pinData) {
    if(pinData == 'keep') {
        return; //all we need to do is not clear the pins!
    }
    
    clearPins();

    var pinBuilder = new Cesium.PinBuilder(); //todo : cache

    pinData.forEach(function(coord) {
        var colorSplit = (coord.color || 'WHITE/RED').split('/');
        var colorPin = colorSplit.pop();
        var colorText = (colorSplit.length ? colorSplit[0] : 'WHITE');
        var pin = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat),
            billboard: {
                image: pinBuilder.fromColor(Cesium.Color[colorPin], 48).toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            },
            label: new Cesium.LabelGraphics({
                text: (coord.label || ''),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 0,
                fillColor: Cesium.Color[colorText],
                pixelOffset: new Cesium.Cartesian2(0, 20),
                style: Cesium.LabelStyle.FILL_AND_OUTLINE
            })
        });
        pins.push(pin);
    });
}

function clearPins() {
    pins.forEach(function(pin) {
        viewer.entities.remove(pin);
    });
    pins = [];
}

function doGoto(gotoData, zoomData, speedData) {
    if(gotoData == 'keep') {
        throw new Error('we don\'t yet support goto=pins pins=keep');
    }

    var heightMeters = Number(zoomData);
    var zoomDefaulted = (typeof zoomData == 'undefined');
    if(zoomDefaulted || isNaN(heightMeters)) {
        heightMeters = 1000000; //TODO: s/be config
        zoomDefaulted = true;
    }

    var speedMs = Number(speedData);
    if((typeof speedData == 'undefined') || isNaN(speedMs)) {
        speedMs = 2000; //TODO: s/be config
    }

    var destination;

    if(gotoData.length == 0) {
        var center = viewer.camera.positionCartographic;
        destination = Cesium.Cartesian3.fromRadians(center.longitude, center.latitude, heightMeters);
    } else if(gotoData.length == 1) {
        destination = Cesium.Cartesian3.fromDegrees(gotoData[0].lon, gotoData[0].lat, heightMeters);
    } else {
        var cartos = gotoData.map(function(coord) {
            return new Cesium.Cartographic.fromDegrees(coord.lon, coord.lat, heightMeters);
        });
        var rectangle = Cesium.Rectangle.fromCartographicArray(cartos);
        var center = Cesium.Rectangle.center(rectangle);
        var destination;
        if(zoomDefaulted) {
            //figure out how high this rectangle view would be, then zoom out a bit so the points aren't on the very edge
            heightMeters = (4/3) * Cesium.Ellipsoid.WGS84.cartesianToCartographic(viewer.camera.getRectangleCameraCoordinates(rectangle)).height;
        }

        destination = Cesium.Cartesian3.fromRadians(center.longitude, center.latitude, heightMeters);
    }
    
    viewer.camera.flyTo({ destination: destination, duration: speedMs / 1000 });
} 

function doZoom(zoom) {
    zoom = Number(zoom);
    if(isNaN(zoom)) {
        console.log('invalid zoom ' + zoom);
        return;
    } 
    var zoomMeters = Math.pow(10, Math.abs(zoom));
    
/*
        viewer.camera.flyTo({ 
            destination: rectangle,
    if(zoom < 0) {
        viewer.camera.zoomOut(zoomMeters);
    } else {
        viewer.camera.zoomIn(zoomMeters);
    }*/ 
}

var messageCount = 0;
var messages = [];

function proto(name) {
    return function(options) {
        console.log(JSON.stringify([name, options]));
    }
}


module.exports = {
    initialize: initialize,
    show: show,
    hide: hide
}