# Harmonix Motion

Source code and outputs for the 22-second Harmonix arbitrage explainer.

## Outputs

- [Final 1080p MP4](output/Harmonix-Arbitrage-1080p.mp4) — 1920×1080, 24 fps, AAC audio.
- [Interactive HTML preview](output/Harmonix-Arbitrage-Preview.html) — download and open locally; play/pause, timeline, four scene shortcuts and text editor.
- [Source choreography](src/motion.js).

The checked-in video uses the supplied Aeonik TRIAL font. The public HTML uses bundled Inter fallback. To match the video font when rebuilding, add your own Aeonik Regular font to `assets/fonts-local/` (ignored by Git).

## Run

Install Node.js 20+ and FFmpeg, then:

```sh
npm install
npm run build
npm run render:720p
npm run render:1080p
```

FFmpeg must be on PATH, or set `FFMPEG_PATH` to its executable. Render scripts work on Windows/macOS/Linux and do not use machine-specific paths. `npm run build` generates a self-contained HTML file; no server is required.

## Editing

Edit `src/motion.js` for animation, colors, chart geometry and timing. Edit `src/preview-template.html` for preview controls and editable text. Run `npm run build` after source changes. The HTML editor can save an edited HTML, but those edits are not automatically imported into MP4 rendering; update the source text before rendering.

## Timeline

| Time | Scene |
|---|---|
|0–2s|Centered Harmonix intro; white ARBITRAGE TRADING|
|2–11s|$HYPE PRICE; static chart drawn progressively; paired BUY/SELL; all gaps become particles|
|11–18s|PRICE GAP − COSTS = NET PROFIT; accumulation into a bag|
|18–22s|Bag dissolves into particles; logo forms; COMING SOON|

Background: animated 5×5 Harmonix mesh palette, deforming control points with clamped bicubic interpolation; CPU raster port based on the brand kit's Aurora implementation. Quintic easing, deterministic frame rendering.

Brand source: https://github.com/maxvu159/harmonix-brand-kit (snapshot 24f1ba2). Workflow reference: https://github.com/maxvu159/motion-studio. Logos belong to Harmonix. Inter licence is in `assets/fonts/OFL.txt`; Aeonik binaries are not redistributed. See [NOTICE.md](NOTICE.md).

Market names, prices, executions and profits are illustrative and not live quotes or a profit guarantee.
