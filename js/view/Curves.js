var m = require('mithril');

var getPoints = curve => curve.points.map( point => [ point.x, point.y ]);

var scalePoint = scale => point => [ point[ 0 ] * scale[ 0 ], point[ 1 ] * scale[ 1 ] ];

var svgCurve = points => {
    var pt = point => point[ 0 ] + ' ' + point[ 1 ];
    var cmd = ( cmd, ...points ) => cmd + ' ' + points.map( pt ).join(' ');
    var [ from, cp1, cp2, to ] = points;
    return cmd( 'M', from ) + ' ' + cmd( 'C', cp1, cp2, to );
}

var pathdata = ( curves, scale ) => curves.map( curve => {
    return svgCurve( getPoints( curve ).map( scalePoint( scale ) ) );
}).join(' ')

module.exports = {
    
    view: ({ attrs: { size, cellSize, curves } }) => {
        
        var width = size[ 0 ] * cellSize[ 0 ];
        var height = size[ 1 ] * cellSize[ 1 ];
        
        return m( 'svg.curves', { width, height },
            curves.length > 0 && m( 'path', {
                d: pathdata( curves, cellSize ),
                fill: 'none',
                stroke: 'black',
                strokeWidth: 1
            })
        )
        
    }
    
}