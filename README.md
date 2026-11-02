# Umah Tani — 30 s promo (1080×1920, 30 fps, Indonesian)

Final file: `out/umah-tani-promo.mp4` (H.264 High + Opus, 30.000 s). Soundtrack alone: `out/audio.wav`.

Everything on screen is rebuilt as HTML/SVG/Canvas components (no screenshots are used as footage). Every visual is a pure
function of time (`window.renderFrame(frame)`), so any frame renders identically.

    npm run assets    # film-grain texture
    npm run audio     # synthesised score + SFX -> out/audio.wav
    npm run frames    # 900 PNG frames -> frames/   (headless Chrome, parallel; --from/--to/--force)
    npm run encode    # frames + audio -> out/umah-tani-promo.mp4 (WebCodecs + built-in MP4 muxer)
    node tools/verify.mjs   # decodes the MP4 in Chrome and diffs sampled frames against the PNGs
    node tools/shot.mjs 12.4 20 27   # single-frame previews -> out/preview/

Source: `src/js/scenes/s1..s5` (logo intro, marketplace, Tanya Tani AI, fertilizer recommendation, brand outro), shared UI kit in
`src/js/components.js`, `icons.js`, `art.js`, `logo.js`, `bg.js`, styles in `src/css`. Master timeline: `src/js/main.js`.

## Branding

`assets/logo/umah-tani-icon.svg` and `assets/logo/umah-tani-logo-long.svg` are the official logos and the single source of
truth. `src/js/logo.js` loads them at runtime and animates the original paths (nothing is redrawn or traced). The intro and
the outro share one logo build: the symbol morphs into the horizontal lockup in the outro. `src/js/bg.js` provides the shared
light/dark background (terrace contour lines and hills) used by all scenes.

## Story

Umah Tani is the seller of agricultural products and supplies; farmers are the customers. The marketplace scene shows
browsing the catalogue (seeds, fertilizer, AB Mix, growing media, tools) and buying. There is no farmer-to-farmer selling.
