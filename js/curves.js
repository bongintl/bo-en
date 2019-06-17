var Bezier = require('bezier-js');

var CONTROL_POINT_OFFSET = 4/5;

var flatten = arr => arr.reduce( ( a, b ) => a.concat( b ) );

var translateX = d => point => [ point[ 0 ] + d, point[ 1 ] ];

var pairwise = arr => {
    
    var ret = [];
    
    for ( var i = 0; i <= arr.length - 2; i++ ) {
        
        ret.push( [ arr[ i ], arr[ i + 1 ] ] );
        
    }
    
    return ret;
    
}

var zip = ( a1, a2 ) => a1.map( ( x, i ) => [ x, a2[ i ] ] );

var split = ( lessPoints, morePoints ) => {
    
    var connections = lessPoints.map( point => ({ point, connections: 0 }) );
    
    var distance = point => connection => {
        return Math.abs( point[ 1 ] - connection.point[ 1 ] );
    }
    
    var nearest = ( point, connections ) => {
        return connections.slice().sort( distance( point ) )[ 0 ];
    }
    
    var nearestEmpty = point => {
        return nearest( point, connections.filter( c => c.connections === 0 ));
    }
    
    var select = point => {
        return nearestEmpty( point ) || nearest( point, connections );
    }
    
    return morePoints.map( point => {
        var to = select( point );
        to.connections++;
        return [ point, to.point ];
    })
    
}

var plot = ([ fromPoints, toPoints ]) => {
    if ( fromPoints.length === toPoints.length ) {
        return zip( fromPoints, toPoints );
    } else if ( fromPoints.length > toPoints.length ) {
        return split( toPoints, fromPoints )
    } else {
        return split( fromPoints, toPoints ).map( line => line.reverse() );
    }
    
}

var sortByY = ( a, b ) => {
    if ( a[ 1 ] === b[ 1 ] ) return 0;
    if ( a[ 1 ] < b[ 1 ] ) return  -1;
    return 1;
}

module.exports = ( size, points ) => {
    if ( points.length === 0 ) return [];
    var columns = [];
    points.forEach( point => {
        var x = point[ 0 ];
        if ( !columns[ x ] ) columns[ x ] = [];
        columns[ x ].push( point );
    });
    // sparse to dense
    columns = Object.values( columns ).map( column => column.sort( sortByY ) );
    
    var firstColumn = columns[ 0 ];
    var lastColumn = columns[ columns.length - 1 ];
    
    var looped = [
        lastColumn.map( translateX( -size[ 0 ] ) ),
        ...columns,
        firstColumn.map( translateX( size[ 0 ] ) )
    ]
    
    var pairs = pairwise( looped );
    
    var lines = flatten( pairs.map( plot ) );
    
    return lines.map( ([ from, to ]) => {
        
        var offset = ( to[ 0 ] - from[ 0 ] ) * CONTROL_POINT_OFFSET;
        
        var cp1 = translateX( offset )( from );
        var cp2 = translateX( -offset )( to )
        
        return new Bezier(
            from[ 0 ], from[ 1 ],
            cp1[ 0 ], cp1[ 1 ],
            cp2[ 0 ], cp2[ 1 ],
            to[ 0 ], to[ 1 ]
        )
        
    });
    
}