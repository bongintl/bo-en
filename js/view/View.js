var m = require("mithril");

var Curves = require("./Curves");
var Men = require("./Men");

var { symbols } = require("../data");

var isTouch = "ontouchstart" in window;

var sample = arr => arr[Math.floor(Math.random() * arr.length)];
var rand = (min, max) => min + Math.floor(Math.random() * (max - min));
var DEG2RAD = Math.PI / 180;

var translate = (cellSize, [x, y]) =>
  `translate(${x * cellSize[0]}px, ${y * cellSize[1]}px)`;

var popSymbol = (cellSize, position) => {
  const img = document.createElement("img");
  img.src = sample(symbols);
  Object.assign(img.style, {
    width: cellSize[0] + "px",
    height: cellSize[1] + "px",
    position: "absolute",
    pointerEvents: "none",
    left: 0,
    top: 0,
    zIndex: -1,
  });
  document.body.appendChild(img);

  const pos = [position[0] * cellSize[0], position[1] * cellSize[1]];
  const velocity = [rand(-500, 500), rand(-750, -1250)];
  let angle = rand(-10, 10) * DEG2RAD;
  const angvel = rand(-90, 90) * DEG2RAD;

  let then = Date.now() / 1000;
  const tick = () => {
    const now = Date.now() / 1000;
    const dt = now - then;
    then = now;

    pos[0] += velocity[0] * dt;
    pos[1] += velocity[1] * dt;
    velocity[1] += dt * 2000;
    angle += angvel * dt;

    img.style.transform = `
      translate(${pos[0]}px, ${pos[1]}px)
      rotate(${angle}rad)`;

    if (pos[1] > window.innerHeight) {
      img.remove();
    } else {
      requestAnimationFrame(tick);
    }
  };

  tick();
};

module.exports = (state, emitter) => ({
  oncreate: () => {
    emitter.on(state.events.NOTE_PLAYED, position => {
      popSymbol(state.cellSize, position);
    });
  },
  view: () => {
    var {
      loaded,
      playing,
      size,
      cellSize,
      notes,
      curves,
      cursor,
      face,
      now,
      beatDuration,
    } = state;

    if (!loaded) {
      return m(".center", "boading...");
    }

    var bind = event => e => {
      var ww = window.innerWidth;
      var wh = window.innerHeight;
      var x = Math.floor((e.clientX / ww) * size[0]);
      var y = Math.floor((e.clientY / wh) * size[1]);
      emitter.emit(event, [x, y]);
    };

    return m(
      ".main",
      {
        onclick: bind(state.events.PLACE_NOTE),
        onmousemove: !isTouch && bind(state.events.PLACE_CURSOR),
      },
      isTouch && notes.every(n => !n.visible) && m(".center", "touch me"),
      playing &&
        m(Men, {
          size,
          cellSize,
          curves,
          beatDuration,
          now,
        }),
      m(Curves, {
        size,
        cellSize,
        curves,
      }),
      cursor &&
        m(".cursor", {
          style: {
            transform: translate(cellSize, cursor),
          },
        }),
      notes
        .filter(n => n.visible)
        .map(({ position, key, html }) => {
          var style = {
            maxWidth: cellSize[0] + "px",
            transform: translate(cellSize, position),
          };
          return m("div", { key, style }, m.trust(html));
        }),
      m(".face", {
        style: {
          width: cellSize[0] + "px",
          height: cellSize[1] + "px",
          transform: translate(cellSize, face),
        },
      })
      // art.map(({ position, src, key }) => m('img.face', {
      //   key,
      //   src,
      //   style: {
      // 	  width: cellSize[ 0 ] * 0.9 + 'px',
      // 	  height: cellSize[ 1 ] * 0.9 + 'px',
      //     transform: translate(position),
      //     objectPosition: `${key * 100}% 0`
      //   }
      // }))
    );
  },
});
