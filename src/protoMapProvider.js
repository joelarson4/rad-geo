var ele = document.createElement('div');

ele.style.width = '100%';
ele.style.height = '100%';
ele.style.position = 'absolute';
ele.style.backgroundColor = 'cyan';
ele.style.zIndex = '-1'; //revisit
ele.style.display = 'none';
ele.style.top = '0';
ele.style.left = '0';
document.body.appendChild(ele);
document.body.position = 'static';


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
        console.log([name, options]);
        messages.push((messageCount++) + ' ' + name + ' ' + JSON.stringify(options));
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
    initialize: proto('initialize'),
    setSpeed: proto('setSpeed'),
    setZoom: proto('setZoom'),
    setLoc: proto('setLoc'),
    setGoto: proto('setGoto'),
    show: show,
    hide: hide
}