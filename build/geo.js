require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function initialize(config, slides) {
    ele = document.createElement('div');
    ele.className = 'rad-geo-container';
    ele.style.backgroundColor = 'black';
    ele.id = 'rad-geo-cesiumjs-container'
    document.body.appendChild(ele);
    runOnceCesium(10, config, slides); 
}

//TODO: best way?
function runOnceCesium(count, config, slides) {
    if(typeof Cesium == 'undefined') {
        if(count <= 0) {
            alert('Cesium could not be loaded?');
            return;
        } else {
            return setTimeout(function() { runOnceCesium(count--, config, slides); }, 100);
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

   /* wait for https://groups.google.com/forum/#!topic/cesium-dev/VeLx_HaKM_A

    if(slides) {
        var slideObj = null; //first geo slide
        for(var si = 0; si < slides.length; si++) {
            if(slides[si].data.geo) {
                slideObj = slides[si];
                break;
            }
        }
        var gotoData = slideObj.data.geo['goto'];
        var pinData = slideObj.data.geo.pin;
        var zoomData = slideObj.data.geo.zoom;
        var destination;
        if(gotoData == 'pin' && pinData) { 
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = getDestinationFromCoords(pinData, 1000000);
            Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
        } else if(gotoData) {
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = getDestinationFromCoords(gotoData, 1000000);
            Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
        } 
        console.log(Cesium.Camera.DEFAULT_VIEW_RECTANGLE);
        slideObj.data.geo = {};

        if(zoomData) {

        }

    }*/

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
    var kmlData = slideObj.data.geo.kml;
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
        doPin(pinData);
    } else {
        clearPins();
    }

    if(kmlData) {
        doKml(kmlData);
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

    var zoomNumber = Number(zoomData);
    var zoomDefaulted = (typeof zoomData == 'undefined');
    if(zoomDefaulted || isNaN(zoomNumber)) {
        zoomNumber = 6; //TODO: s/be config
        zoomDefaulted = true;
    }

    var heightMeters = Math.pow(10, Math.abs(zoomNumber));

    var speedMs = Number(speedData);
    if((typeof speedData == 'undefined') || isNaN(speedMs)) {
        speedMs = 2000; //TODO: s/be config
    }

    var destination = getDestinationFromCoords(gotoData, heightMeters);
    
    viewer.camera.flyTo({ destination: destination, duration: speedMs / 1000 });
} 

function doKml(kmlData) {
    viewer.dataSources.add(Cesium.KmlDataSource.load(kmlData));
}

function getDestinationFromCoords(coords, heightMeters) {
    var destination;
    if(coords.length == 0) {
        var center = viewer.camera.positionCartographic;
        destination = Cesium.Cartesian3.fromRadians(center.longitude, center.latitude, heightMeters);
    } else if(coords.length == 1) {
        destination = Cesium.Cartesian3.fromDegrees(coords[0].lon, coords[0].lat, heightMeters);
    } else {
        var cartos = coords.map(function(coord) {
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
    return destination;
}

module.exports = {
    initialize: initialize,
    show: show,
    hide: hide
}
},{"rad-reveal":"rad-reveal"}],"/Users/larsonj/Sites/radReveal/rad-geo/src/geo.js":[function(require,module,exports){
/*!
 * rad-geo
 * http://joelarson4.github.io/rad-geo
 * MIT licensed
 *
 * Copyright (C) 2015 Joe Larson
 */

/** 
 * @overview
 * rad-geo is a Reveal.js RadReveal add-on that helps you display maps in your presentation
 * Please see [project README](https://github.com/joelarson4/rad-geo) for an overview.
 *
 * This is not a true CommonJS module, you cannot `require()` it.  It should be loaded as a Reveal.js dependency.
 *
 *```javascript
 * Reveal.initialize({
 *    ...
 *    dependencies: [
 *        { src: '<some path>/geo.min.js', radName: 'geo' }
 *    ...
 *```
 *
 * @module geo
 */

//Developer note: jsdoc is for reference only, we are not generating documentation from it.
'use strict';
var RadReveal = require('rad-reveal');

var DECIMAL_REGEX = /(-)?(\d)*(\.)?(\d)*/;

var mapProvider;
var config;
var lastShown;
var lastHidden;

/*TODO FIX THIS REMOVE IT!*/require('./cesiumMapProvider.js');


//utilities

/**
 * This function converts a simple comma seperated string with latitude and longitude, an optional label,
 * and optional extensions into a regular coordinate object.  Multiple coordinates can be given seperated by
 * semicolons.  Examples of valid input:
 * 
 * [] "40,116"
 * [] "40,116,Beijing"
 * [] "40,116,Beijing\,China" - The \, is used to escape the comma in the label
 * [] "40,116,Beijing,GREEN" - When using cesiumMapProvider the 4th element GREEN is the color that will be used for the pin
 * [] "39.9167° N, 116.3833° E" - Copied directly from google results of searching for "Beijing lat long"
 * [] "33.4500° S, 70.6667° W, Santiago"
 * [] "-33.45,-70.67" - Negative lat is South, negative lon is West
 * [] "-33.45,-70.67,Santiago;-23.55,-46.63,São Paulo;-12.04,-77.03,Lima" - Using semicolons for multiple coords
 *
 * @private
 */
function parseCoords(value) {
    var coords = [];
    var valueSplit = value.split(';');
    
    valueSplit.forEach(function(item) {
        item = item.replace('\\,', 'x002C'); 

        var itemSplit = item.split(',');
        var lat = Number(itemSplit[0].trim().match(DECIMAL_REGEX)[0]);
        if(itemSplit[0].toUpperCase().indexOf('S') > -1) { lat = -1 * Math.abs(lat); }

        var lon = Number(itemSplit[1].trim().match(DECIMAL_REGEX)[0]);
        if(itemSplit[1].toUpperCase().indexOf('W') > -1) { lon = -1 * Math.abs(lon); }

        var label = (itemSplit[2] || '').trim();
        label = label.replace('x002C', ',');

        var color = (itemSplit[3] || '').trim();

        coords.push({ lat: lat, lon: lon, label: label, original: item, color: color });
    });
    
    return coords;
}


//slide functionality

/** 
 * Runs when RadReveal initializes.
 *
 * @param {object} config - configuration object set in radConfig.  See README for details.
 * @param {array} slides - all the slide objects
 * @private
 */
function initialize(inputConfig, slides) {
    config = inputConfig || {};

    var mpModule = config.mapProviderModule;

    if(typeof mpModule == 'string') {
        mapProvider = require(mpModule);
    } else if(typeof mpModule == 'object') {
        mapProvider = mpModule;
    } else {
        mapProvider = require('./protoMapProvider.js');
    }

    mapProvider.initialize(config.mapProviderConfig, slides);

    /*if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-geo')) {
                slide.element.setAttribute('data-rad-geo', config.fillSlides);
            }
        });
    }*/
}


/** 
 * Initializes the slide object on load to add a `data.geo` object.
 *
 * @param {object} ignored - not used
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function loadSlide(ignored, slideObj) {
    slideObj.data.geo = { };
}


/** 
 * Triggered by any `data-rad-geo*` attribute, this triggers the display of the map.
 *
 * @param {object} ignored - not used
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function showDisplay(ignored, slideObj) {
    if(slideObj == lastShown) { return; } //avoid repeats;
    lastShown = slideObj;

    mapProvider.show(slideObj);
}

/** 
 * Triggered whenever leaving a slide that has rad-geo to go to a slide that does not have rad-geo.
 * 
 * @param {object} ignored - not used
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function hideDisplay(ignored, slideObj) {
    if(slideObj == lastHidden) { return; } //avoid repeats;
    lastHidden = slideObj;

    mapProvider.hide(slideObj);
}

/** 
 * Triggered by the `data-rad-geo-goto` attribute, this sets the map goto to be used.
 *
 * @param {string} attrVal - goto to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setGoto(attrVal, slideObj) {
    var gotoData = (attrVal == 'pin' ? 'pin' : parseCoords(attrVal));
    slideObj.data.geo['goto'] = gotoData;
    if(typeof mapProvider.setGoto == 'function') {
        mapProvider.setGoto(gotoData);
    }
}

/** 
 * Triggered by the `data-rad-geo-kml` attribute, this sets the kml to be used.
 *
 * @param {string} attrVal - kml to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setKml(attrVal, slideObj) {
    slideObj.data.geo.kml = attrVal;
    if(typeof mapProvider.setKml == 'function') {
        mapProvider.setKml(attrVal);
    }
}

/** 
 * Triggered by the `data-rad-geo-pin` attribute, this sets the map pin to be used.
 *
 * @param {string} attrVal - pin to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setPin(attrVal, slideObj) {
    var pinData = (attrVal == 'keep' ? 'keep' : parseCoords(attrVal));
    slideObj.data.geo.pin = pinData;
    if(typeof mapProvider.setPins == 'function') {
        mapProvider.setPins(pinData);
    }
}

/** 
 * Triggered by the `data-rad-geo-speed` attribute, this sets the map speed to be used.
 *
 * @param {string} attrVal - speed to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setSpeed(attrVal, slideObj) {
    var speed = 2000;
    if(attrVal == 'slow') {
        speed = 5000;
    } else if(attrVal == 'medium') {
        speed = 2000;
    } else if(attrVal == 'fast') {
        speed = 500;
    } else if(attrVal == 'instant') {
        speed = 0;
    } else {
        speed = Number((attrVal.match(DECIMAL_REGEX) || [ '2000' ])[0]);
        if(isNaN(speed)) {
            speed = 2000;
        }
    } 
    slideObj.data.geo.speed = speed;
    if(typeof mapProvider.setSpeed == 'function') {
        mapProvider.setSpeed(speed);
    }
}



/** 
 * Triggered by the `data-rad-geo-zoom` attribute, this sets the map zoom to be used.
 *
 * @param {string} attrVal - zoom to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setZoom(attrVal, slideObj) {
    slideObj.data.geo.zoom = attrVal;
    if(typeof mapProvider.setZoom == 'function') {
        mapProvider.setZoom(attrVal);
    }
}

/** 
 * Triggered by the `data-rad-geo-style` attribute, this sets the map style to be used.
 *
 * @param {string} attrVal - style to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setStyle(attrVal, slideObj) {
    slideObj.data.geo.style = attrVal;
    if(typeof mapProvider.setStyle == 'function') {
        mapProvider.setStyle(attrVal);
    }
}

RadReveal.register('geo', initialize);


RadReveal.on('data-rad-geo*', 'load', loadSlide);

RadReveal.on('data-rad-geo*', 'hide', hideDisplay);

RadReveal.on('data-rad-geo-goto', 'show', setGoto);
RadReveal.on('data-rad-geo-pin', 'show', setPin);
RadReveal.on('data-rad-geo-speed', 'show', setSpeed);
RadReveal.on('data-rad-geo-zoom', 'show', setZoom);
RadReveal.on('data-rad-geo-style', 'show', setStyle);
RadReveal.on('data-rad-geo-kml', 'show', setKml);

RadReveal.on('data-rad-geo*', 'show', showDisplay);






},{"./cesiumMapProvider.js":1,"./protoMapProvider.js":2,"rad-reveal":"rad-reveal"}],2:[function(require,module,exports){
'use strict';
var ele;
alert('fixme!');
function initialize() {
    ele = document.createElement('div');
    ele.className = 'rad-geo-container';
    ele.style.backgroundColor = 'cyan';
    document.body.appendChild(ele);
    proto('init')();
}


function show() {
    //TODO: need animated opacity
    ele.style.display = 'block';
    proto('show')();
}

function hide() {
    //TODO: need animated opacity
    ele.style.display = 'none';
    proto('hide')();
}

var messageCount = 0;
var messages = [];

function proto(name) {
    return function(options) {
        messages.push((messageCount++) + ' ' + name + ' ' + ( options ? JSON.stringify(options) : '' ));
        if(messages.length > 10) {
            messages.shift();
        }
        ele.innerHTML = messages.join('<br>');
        if(options && typeof options.callback == 'function') {
            options.callback();
        }
    }
}

module.exports = {
    initialize: initialize,
    setSpeed: proto('setSpeed'),
    setZoom: proto('setZoom'),
    setLoc: proto('setLoc'),
    setGoto: proto('setGoto'),
    show: show,
    hide: hide
}
},{}]},{},["/Users/larsonj/Sites/radReveal/rad-geo/src/geo.js"]);
