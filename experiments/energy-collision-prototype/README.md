# Energy collision animation prototype

This is an isolated visual experiment. It is not imported by Astro, included in the
production routes, copied to `public/`, or required by the website build.

The sequence uses original SVG hand silhouettes and CSS-generated energy effects:

- a blue-white, jagged lightning charge entering from the upper-left;
- a dense, rotating blue energy sphere entering from the lower-right;
- a fast initial approach followed by a slower final convergence;
- a center collision at about three seconds;
- a radial whiteout that expands across the viewport and then contracts to reveal the page.
- optional synthesized lightning, rotation, and impact audio generated with the Web Audio API.

No Naruto artwork, video, audio, character likeness, or downloaded third-party asset is
included. The visual language was researched from descriptions of Chidori as concentrated
lightning chakra and Rasengan as a compact, multi-axis rotating chakra sphere. It is a
technique-inspired study, not a reproduction of a specific scene.

## Run it

Open `index.html` directly in a browser. If the browser restricts local assets, serve only
this directory:

```bash
python3 -m http.server 8080 --directory experiments/energy-collision-prototype
```

Then open `http://localhost:8080` and stop the server with `Ctrl+C` when finished.

The animation plays once on load without sound because browsers block unsolicited audio.
Replay it with the button to hear the synthesized effects, or add `?autoplay=0` to start with
the full user-triggered audiovisual sequence. Press `Escape` to skip a running sequence. The
sound control is keyboard accessible, and the prototype uses a shorter, low-motion preview
when the operating system requests reduced motion.

## Files

- `index.html` contains the standalone test page and original inline SVG artwork.
- `styles.css` contains the scene, effects, timing, responsive layout, and reduced-motion mode.
- `animation.js` controls replay, automatic playback, Escape handling, and status messages.

## Visual references

These references were used only to understand the broad visual properties of the fictional
techniques; no assets were copied:

- Chidori overview: <https://naruto.fandom.com/wiki/Chidori>
- Rasengan visual overview: <https://naruto.jycsd.com/guides/jutsu/rasengan>
- Official Naruto site article showing a rotating Rasengan variant: <https://naruto-official.com/en/news/01_1708>
- YouTube search reference for the diagonal clash: <https://www.youtube.com/watch?v=dAKV36wRF6c>

Before any future production integration, review whether an anime-specific reference fits
the portfolio's professional tone and rename the effects generically if the site will be used
commercially.
