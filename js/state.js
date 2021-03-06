var m = require("mithril");
var EventEmitter = require("events");
var curves = require('./curves');
var audio = require('./audio');
var { html, bpm, voice } = require("./data");

var BREAKPOINTS = [ 414, 768 ];
  
var emitter = new EventEmitter();

var state = {
    events: {
        LOAD: 'load',
        RESIZE: 'resize',
        PLACE_CURSOR: 'placeCursor',
        PLACE_NOTE: 'placeNote'
    },
    loaded: false,
    playing: false,
    size: [ 1, 1 ],
    face: [ -1, -1 ],
    notes: html.map( ( html, i ) => ({
        html,
        key: i,
        position: [ 0, 0 ],
        visible: false,
    })),
    sounds: [
        `./audio/${ voice }_1.mp3`,
        `./audio/${ voice }_2.mp3`,
        `./audio/${ voice }_3.mp3`,
        `./audio/${ voice }_4.mp3`,
        `./audio/${ voice }_5.mp3`,
        `./audio/${ voice }_6.mp3`,
        `./audio/${ voice }_7.mp3`
    ],
    cursor: false,
    clicks: 0,
    beatDuration: 1 / ( bpm / 60 ),
    startTime: 0,
    now: 0,
    audioUntil: 0,
};

var equal = ( v1, v2 ) => v1[ 0 ] === v2[ 0 ] && v1[ 1 ] === v2[ 1 ];
var rand = ( min, max ) => min + Math.floor( Math.random() * ( max - min ) );
var visibleNotes = () => state.notes.filter( n => n.visible );
var notePositions = () => {
    return visibleNotes()
        .map( n => n.position )
        .concat( state.cursor ? [ state.cursor ] : [] );
}

var updateCurves = () => {
    state.curves = curves( state.size, notePositions() );
}

var play = () => {
    state.startTime = audio.context.currentTime;
    state.playing = true;
    tick();
}

var tick = () => {
    var duration = state.beatDuration * state.size[ 0 ];
    var now = audio.context.currentTime - state.startTime;
    var start = state.audioUntil;
    var end = now + .05;
    var didSound = false;
    notePositions().forEach( position => {
        var t = position[ 0 ] * state.beatDuration;
        while ( t < start ) t += duration;
        if ( t < end ) {
            var y = state.size[ 1 ] - 1 - position[ 1 ];
            audio.play( state.sounds[ y ], t + state.startTime );
            didSound = true;
        }
    })
    if ( didSound ) moveFace();
    state.audioUntil = end;
    state.now = now % duration;
    m.redraw();
    requestAnimationFrame( tick );
}

var moveFace = () => {
    var filled = notePositions();
    while ( true ) {
        var position = [
            rand( 0, state.size[ 0 ] ),
            rand( 0, state.size[ 1 ] )
        ];
        if ( !filled.some( p => equal( position, p ) ) ) {
            return state.face = position;
        }
    }
}

var reset = () => {
    state.clicks = 0;
    state.notes.forEach( n => n.visible = false );
    state.face = [ -1, -1 ];
    state.cursor = 'ontouchstart' in window
        ? false
        : [
            Math.floor( state.size[ 0 ] / 2 ),
            Math.floor( state.size[ 1 ] / 2 )
        ];
    updateCurves();
}

emitter.on( state.events.LOAD, () => {
    Promise.all( state.sounds.map( audio.load ) ).then( buffers => {
        state.sounds = buffers;
        state.loaded = true;
        if ( audio.context.state === 'running' ) {
            play();
        } else {
            m.redraw();
        }
    })
})

emitter.on( state.events.RESIZE, viewport => {
    var prev = state.size;
    if ( viewport[ 0 ] <= BREAKPOINTS[ 0 ] ) {
        state.size = [ 4, 7 ];
    } else {
        state.size = [ 8, 7 ];
    }
    state.cellSize = [
        viewport[ 0 ] / state.size[ 0 ],
        viewport[ 1 ] / state.size[ 1 ]
    ];
    if ( !equal( prev, state.size ) ) reset();
    m.redraw();
});

emitter.on( state.events.PLACE_NOTE, position => {
    audio.unlock();
    if ( !state.playing ) play();
    if ( state.notes.some( note => equal( position, note.position ) ) ) return;
    var note = state.notes[ state.clicks % state.notes.length ];
    note.position = position;
    note.visible = true;
    state.clicks++;
    state.cursor = false;
    updateCurves();
})

emitter.on( state.events.PLACE_CURSOR, position => {
    if ( position !== false ) {
        var overlaps = visibleNotes()
            .some( note => equal( position, note.position ) );
        state.cursor = !overlaps && position;
    } else {
        state.cursor = position;
    }
    updateCurves();
})

module.exports = { state, emitter };