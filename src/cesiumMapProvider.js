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

    proto('init')();
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

    if(config) {
        if(typeof config.imageryProviderClass == 'string') {
            var className = config.imageryProviderClass;
            var ipConfig = config.imageryProviderConfig;
            
            if(className == 'BingMapsImageryProvider') {
                //TODO: what to do here?
                var lsKey = 'rad-geo-cesium-bingMapsApi-defaultKey';
                var bingKey = localStorage.getItem(lsKey);
                if(bingKey) {
                    Cesium.BingMapsApi.defaultKey = bingKey;
                } else {
                    console.log('Once you have a bing maps key, set it using `localStorage.setItem(\'' + lsKey + '\', \'your-key\');`.  Meanwhile, some functionality may not be available.');
                }

                if(ipConfig && ipConfig.mapStyle) {
                    ipConfig = {
                        url : '//dev.virtualearth.net',
                        key : bingKey,
                        mapStyle : Cesium.BingMapsStyle[ipConfig.mapStyle]
                    };
                }

                options.imageryProvider = new Cesium[className](ipConfig);
            } else {
                throw new Error('Unknown imageryProviderClass');
            }
        } else if(typeof config.imageryProvider == 'object') {
            options.imageryProvider = config.imageryProvider;
        }
    }

    viewer = new Cesium.Viewer(ele.id, options);
    document.querySelector('.cesium-infoBox-iframe').setAttribute('sandbox', 'allow-same-origin allow-popups allow-forms allow-scripts');
}


function show(slideObj) {
    if(typeof Cesium == 'undefined') {
        setTimeout(function() {
            show(slideObj);
        }, 100);
        return;
    }

    var gotoData = slideObj.data.geo['goto'];
    var pinData = slideObj.data.geo.pin;

    if(gotoData) {
        if(gotoData == 'pin' && pinData) { 
            doGoto(pinData);
        } else {
            doGoto(gotoData);
        }
    }

    if(pinData) {
        doPin(pinData);
    }

    //TODO: need animated opacity
    ele.style.display = 'block';
    
}

function hide() {
    //TODO: need animated opacity
    ele.style.display = 'none';
} 

function doPin(coords) {
    var pinBuilder = new Cesium.PinBuilder(); //todo : cache

    pins.forEach(function(pin) {
        viewer.entities.remove(pin);
    });
    pins = [];

    coords.forEach(function(coord) {
        var colorSplit = (coord.color || 'BLACK/RED').split('/');
        var colorPin = colorSplit.pop();
        var colorText = (colorSplit.length ? colorSplit[0] : 'BLACK');
        var pin = viewer.entities.add({
            position : Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat),
            billboard : {
                image : pinBuilder.fromColor(Cesium.Color[colorPin], 48).toDataURL(),
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
            },
            label: new Cesium.LabelGraphics({
                text: coord.label || '', 
                outlineColor: Cesium.Color.WHITE, 
                outlineWidth: 4.0,
                fillColor: Cesium.Color[colorText],
                pixelOffset: new Cesium.Cartesian2(0, 20),
                style : Cesium.LabelStyle.FILL_AND_OUTLINE
            })
        });
        pins.push(pin);
    });
}

function doGoto(coords) {
    if(coords.length == 1) {
        viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(coords[0].lon, coords[0].lat, 2500000.0)
        });
    } else {
        var cartos = [];
        coords.forEach(function(coord) {
            cartos.push(new Cesium.Cartographic.fromDegrees(coord.lon, coord.lat, 250000.0));
        });
        var rectangle = Cesium.Rectangle.fromCartographicArray(cartos);

        viewer.camera.flyTo({ 
            destination: rectangle,
            complete: function() {
                //todo: revisit
                viewer.camera.zoomOut();        
            }
        });
    }
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
    setSpeed: proto('setSpeed'),
    setZoom: proto('setZoom'),
    show: show,
    hide: hide
}