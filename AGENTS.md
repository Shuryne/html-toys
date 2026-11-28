# HTML Toys maintenance

## Local preview

Run `sh scripts/dev.sh` with Node.js and Python 3 installed, then open
`http://localhost:8787`. The script refreshes the gallery media metadata and
links `prompts/` at `public/prompts`.

## Gallery content

- `public/index.html` is the gallery entry point. `public/assets/gallery.js`
  handles browsing and comparisons. `public/assets/home.js` handles language,
  prompts, and embedded works.
- Use lowercase, hyphen-separated prompt IDs such as `koi-pond`. Add matching
  prompts at `prompts/zh/<prompt-id>.md` and `prompts/en/<prompt-id>.md`, then
  register the prompt in `PROMPTS` in `public/assets/toys.js`. The list order
  determines the gallery order.
- Use lowercase model IDs that include the model, version, and tier, such as
  `opus-5.5-max`. Register models in `MODELS` in the same file. The `name` is
  the credit shown below the work, `short` is the filter label, and `color`
  identifies the model in the gallery.

## Adding a work

1. Save the HTML as `public/works/<prompt-id>/<model-id>.html`.
2. Save a 1200-pixel-wide WebP cover with a 16:10 aspect ratio at
   `public/covers/<prompt-id>/<model-id>.webp`. Optional 384-, 576-, and
   864-pixel-wide versions use the suffix `-<width>.webp`.
3. Add the work to the prompt's `runs` in `public/assets/toys.js`. Supply
   `title`, `medium`, and `blurb` in Chinese and English. Use the work's title
   in `title`.
4. Run `node scripts/prepare-gallery.mjs` to refresh the image preloads and
   media metadata in `public/index.html`.

Follow the existing works' use of `parent.Home?.prepareWork(window)` before the
animation starts so the gallery can pause and resize embedded works. Call
`window.ToyEmbed?.ready?.()` when the first frame is ready to replace the cover.
Use `window.ToyEmbed?.pixelRatio` to size Canvas or WebGL in the embed.

When copying Cloudpost Railway, keep `gpt-6.2-astra-max-fallback.mp4` next to its
HTML file in `public/works/sky-brick-isles/`. The page loads it if WebGL fails.

## Cloudflare Pages

- Build command is `node scripts/prepare-gallery.mjs && cp -r prompts public/prompts`.
- Output directory is `public`.

The 1200 × 630 social preview image is `public/og.jpg`. If a sharing service
requires an absolute URL, use `https://html-toys.shuryne.com/og.jpg` for the
`og:image` value in `public/index.html`.
