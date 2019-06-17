var sample = arr => arr[ Math.floor( Math.random() * arr.length ) ];

var el = document.getElementById('data');
var html = Array.from( el.children ).map( node => node.outerHTML );
var bpm = Number( el.dataset.bpm );
var voice = sample( el.dataset.voices.split(',') );

module.exports = { html, bpm, voice };