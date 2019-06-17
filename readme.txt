Editing
=======

Content management is done in index.html, in the <div id="data">.
Edit the <h1> and <a> elements inside. Add as many as you want.
(The &#8203; character is an invisible line break, so that long words fit in the small boxes).

The data-bpm attribute controls playback speed.

The data-voices attribute controls which voices can be loaded.
A voice is 7 mp3 files in the audio folder, named ID_1.mp3...ID_7.mp3. The ID goes in data-voices.
For example if you have A_1.mp3...A_7.mp3, set data-voices="A".
Enter multiple voices separated by commas (like data-voices="A,B,C") and one will be selected at random.


Publishing
==========

Upload:

/audio,
/fonts,
/img,
bundle.js,
index.html,
style.css

to a normal web server. Or upload everything, it doesn't really matter.