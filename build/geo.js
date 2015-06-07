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

//Developer note: we are not using jsdox to generate any markdown for this file; the API doesn't really suit it.  
//  Some JsDoc is still provided for developer use
'use strict';
var RadReveal = require('rad-reveal');

var mapProvider;
var config;
var lastShown;
var lastHidden;

/*TODO FIX THIS REMOVE IT!*/require('./cesiumMapProvider.js');


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

    mapProvider.initialize(config.mapProviderConfig);

    /*if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-geo')) {
                slide.element.setAttribute('data-rad-geo', config.fillSlides);
            }
        });
    }*/
}


/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function loadSlide(attrVal, slideObj, event, radEventName) {
    slideObj.data.geo = { };
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function showDisplay(attrVal, slideObj, event, radEventName) {
    if(slideObj == lastShown) { return; } //avoid repeats;
    lastShown = slideObj;

    mapProvider.show(slideObj);
}

function hideDisplay(attrVal, slideObj, event, radEventName) {
    if(slideObj == lastHidden) { return; } //avoid repeats;
    lastHidden = slideObj;

    mapProvider.hide(slideObj);
}

var REGEX_DECIMAL = /(-)?(\d)*(\.)?(\d)*/;

//value is something like "47.7717° N, 122.2044° W" or "47,-122" or "47.7N,122.2W,Bothell" or "47.7N,122.2W,Bothell\,WA"
// or a list of those seperated by Semicolons
function parseCoords(value) {
    var coords = [];
    var valueSplit = value.split(';');
    
    valueSplit.forEach(function(item) {
        item = item.replace('\\,', 'x002C'); 

        var itemSplit = item.split(',');
        var lat = Number(itemSplit[0].trim().match(REGEX_DECIMAL)[0]);
        if(itemSplit[0].toUpperCase().indexOf('S') > -1) { lat = -1 * Math.abs(lat); }

        var lon = Number(itemSplit[1].trim().match(REGEX_DECIMAL)[0]);
        if(itemSplit[1].toUpperCase().indexOf('W') > -1) { lon = -1 * Math.abs(lon); }

        var label = (itemSplit[2] || '').trim();
        label = label.replace('x002C', ',');

        var color = (itemSplit[3] || '').trim();

        coords.push({ lat: lat, lon: lon, label: label, original: item, color: color });
    });
    
    return coords;
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setGoto(attrVal, slideObj, event, radEventName) {
    var gotoData = (attrVal == 'pin' ? 'pin' : parseCoords(attrVal));
    slideObj.data.geo['goto'] = gotoData;
    if(typeof mapProvider.setGoto == 'function') {
        mapProvider.setGoto(gotoData);
    }
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setPin(attrVal, slideObj, event, radEventName) {
    var pinData = parseCoords(attrVal);
    slideObj.data.geo.pin = pinData;
    if(typeof mapProvider.setPins == 'function') {
        mapProvider.setPins(pinData);
    }
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setSpeed(attrVal, slideObj, event, radEventName) {
    var speed = 333;
    if(speed == 'slow') {
        speed = 1000;
    } else if(speed == 'medium') {
        speed = 333;
    } else if(speed == 'fast') {
        speed = 100;
    } else {
        speed = Number((attrVal.match(REGEX_DECIMAL) || [ '333' ])[0]);
        if(isNaN(speed)) {
            speed = 333;
        }
    } 
    slideObj.data.geo.speed = speed;
    if(typeof mapProvider.setSpeed == 'function') {
        mapProvider.setSpeed(speed);
    }
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setZoom(attrVal, slideObj, event, radEventName) {
    slideObj.data.geo.zoom = attrVal;
    if(typeof mapProvider.setZoom == 'function') {
        mapProvider.setZoom(attrVal);
    }
}

RadReveal.register('geo', initialize);

//TODO: need a * or need array on
RadReveal.on('data-rad-geo*', 'load', loadSlide);

RadReveal.on('data-rad-geo*', 'hide', hideDisplay);

RadReveal.on('data-rad-geo-goto', 'show', setGoto);
RadReveal.on('data-rad-geo-pin', 'show', setPin);
RadReveal.on('data-rad-geo-speed', 'show', setSpeed);
RadReveal.on('data-rad-geo-zoom', 'show', setZoom);

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
