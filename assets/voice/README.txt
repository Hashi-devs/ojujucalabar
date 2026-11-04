Put recorded voice lines here, one file per line, named by the line id (for example o_who.m4a).
Any common audio format works: m4a, mp3, ogg, opus, wav, aac, amr, 3gp, webm, flac.
Then run: python3 build3d.py
The build trims the silence, evens out the volume, shrinks each file, and the game adds the ghost effects.
The list of line ids and words is in src/story.js (LINES) and in the main README.
