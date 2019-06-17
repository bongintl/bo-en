var m = require('mithril');

var WIDTH = 26;
var FRAMES = 5;

var flatten = arr => arr.reduce( ( a, b ) => a.concat( b ), [] );

module.exports = {
    
    view: ({ attrs: { curves, size, cellSize, beatDuration, now } }) => {
        
        if ( curves.length === 0 ) return;
        
        var x = now / beatDuration;
        
        var line = {
            p1: { x, y: -1 },
            p2: { x, y: size[ 1 ] + 1 }
        }
        
        var intersecting = curves.filter( curve => {
            
            var x0 = curve.compute( 0 ).x;
            var x1 = curve.compute( 1 ).x;
            
            return x0 <= x && x1 >= x;
            
        })
        
        var intersections = flatten( intersecting.map( curve => {
            
            return curve.intersects( line ).map( t => {
                
                var { x, y } = curve.compute( t );
                
                var { x: nx, y: ny } = curve.normal( t );
                
                var angle = Math.atan2( ny, nx ) - Math.PI / 2;
                
                return { position: [ x, y ], angle };
                
            })
            
        }))
        
        var wrapped = [
            ...intersections.map(({ position, angle }) => ({
                position: [ position[ 0 ] - size[ 0 ], position[ 1 ] ],
                angle
            })),
            ...intersections,
            ...intersections.map(({ position, angle }) => ({
                position: [ position[ 0 ] + size[ 0 ], position[ 1 ] ],
                angle
            })),
        ]
        
        var frame = FRAMES - ( Math.floor( now * 8 ) % FRAMES ) - 1;
        var backgroundPosition = `${ -WIDTH * frame }px 0`;
        
        return wrapped.map( ({ position, angle }, i ) => {
            
            var x = position[ 0 ] * cellSize[ 0 ];
            var y = position[ 1 ] * cellSize[ 1 ];
            
            var translate = `translate( ${ x }px, ${ y }px )`;
            var rotate = `rotate( ${ angle }rad )`;
            
            var style = {
                transform: translate + ' ' + rotate,
                backgroundPosition
            }
            
            return m('.man', { style, key: i } );
            
        });

    }
    
}