var context = new ( window.AudioContext || window.webkitAudioContext )();
    
var unlocked = false;

var unlock = () => {
    if ( unlocked ) return;
    // Play silence to unlock the audio context in safari
    var buffer = context.createBuffer(1, 1, 22050);
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.start( 0 );
    unlocked = true;
}

var load = url => new Promise( resolve => {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => resolve( request.response );
    request.send();
}).then( response => new Promise( resolve => {
    context.decodeAudioData( response, resolve )
}))

var play = ( buffer, time ) => {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect( context.destination );
    source.start( time );
    return source;
}

module.exports = { context, unlock, load, play };