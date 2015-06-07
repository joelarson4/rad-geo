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