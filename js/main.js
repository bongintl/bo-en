var m = require("mithril");
var { state, emitter } = require("./state");

var View = require('./view/View');

var onresize = () => {
    var size = [ window.innerWidth, window.innerHeight ];
    emitter.emit( state.events.RESIZE, size );
};

window.addEventListener( "resize", onresize );
onresize();
m.mount( document.body, View( state, emitter ) );

emitter.emit( state.events.LOAD );