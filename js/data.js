var sample = arr => arr[Math.floor(Math.random() * arr.length)];

var el = document.getElementById("data");
var html = Array.from(el.children).map(node => node.outerHTML);
var bpm = Number(el.dataset.bpm);
var voice = sample(el.dataset.voices.split(","));

const symbols = Array(19)
  .fill(0)
  .map((_, i) => `./img/art${i + 1}.svg`);

module.exports = { html, bpm, voice, symbols };
