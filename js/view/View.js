var m = require("mithril");

var Curves = require('./Curves');
var Men = require('./Men');

var isTouch = 'ontouchstart' in window;

module.exports = ( state, emitter ) => ({
	
	view: () => {
		
		var {
			loaded,
			playing,
			size,
			cellSize,
			notes,
			curves,
			cursor,
			art,
			now,
			beatDuration
		} = state;
		
		if ( !loaded ) {
			return m( '.center', 'boading...' );
		}
		
		var bind = event => e => {
			var ww = window.innerWidth;
			var wh = window.innerHeight;
			var x = Math.floor( e.clientX / ww * size[ 0 ] );
			var y = Math.floor( e.clientY / wh * size[ 1 ] );
			emitter.emit( event, [ x, y ] );
		}
		
		var translate = ([ x, y ]) => `translate(${ x * cellSize[ 0 ] }px, ${ y * cellSize[ 1 ] }px)`;

		return m('.main', 
			{
				onclick: bind( state.events.PLACE_NOTE ),
				onmousemove: !isTouch && bind( state.events.PLACE_CURSOR )
			},
			isTouch && notes.every( n => !n.visible ) && m( '.center', 'touch me' ),
			playing && m( Men, {
				size,
				cellSize,
				curves,
				beatDuration,
				now
			}),
			m( Curves, {
				size,
				cellSize,
				curves
			}),
			cursor && m('.cursor', { style: {
				transform: translate( cursor )
			}}),
			notes
				.filter( n => n.visible )
				.map( ({ position, key, html }) => {
					var style = {
						maxWidth: cellSize[ 0 ] + 'px',
						transform: translate( position )
					}
					return m( 'div', { key, style }, m.trust( html ) )
				}),
			// m('.face', { style: {
			// 	width: cellSize[ 0 ] + 'px',
			// 	height: cellSize[ 1 ] + 'px',
			// 	transform: translate( face )
      // }})
      art.map(({ position, src, key }) => m('img.face', {
        key,
        src,
        style: {
				  width: cellSize[ 0 ] * 0.9 + 'px',
				  height: cellSize[ 1 ] * 0.9 + 'px',
          transform: translate(position),
          objectPosition: `${key * 100}% 0`
        }
      }))
			
		);
		
	}
	
});
