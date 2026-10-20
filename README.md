# After Effect

A motion-graphics editor that runs entirely in the browser. Build layered compositions, animate them with keyframes, add photos and videos, and render the result to a video file. It is plain HTML, CSS and JavaScript, with projects stored as JSON. There is no build step, no framework and no server.

Repository: https://github.com/jalalkhan10061986/After_Effect

## Quick start

1. Download or clone the repository.
2. Open `index.html` in a modern browser (Chrome, Edge or Firefox recommended).
3. Press **Play** to see the sample scene, or click **New** to start from an empty composition.

```bash
git clone https://github.com/jalalkhan10061986/After_Effect.git
cd After_Effect
# open index.html in your browser, or serve the folder:
python3 -m http.server 8000   # then visit http://localhost:8000
```

The app works offline. The only online dependency is the IBM Plex Sans font from Google Fonts, which falls back to a system font when unavailable.

## Features

### Layers
- Shapes: rectangle, ellipse, star, triangle
- Text layers with adjustable size and stroke
- Photo layers and video layers
- Duplicate, delete, reorder, and show or hide any layer

### Keyframe animation
- Animate position X and Y, scale, rotation and opacity
- The ◆ stopwatch turns animation on for a property, and editing an animated value adds a keyframe automatically
- Drag keyframes in the timeline, and Shift-click or Alt-click one to delete it
- Seven easing curves: linear, ease in, ease out, ease in-out, bounce, elastic and hold
- Animation presets: Fade in, Fade out, Slide in, Pop, Spin, Drop bounce, Pulse, Wiggle, Ken Burns and Zoom out

### Photos and videos
- Add media with the **Photo…** and **Video…** buttons, by dragging files onto the preview, or by pasting an image
- Large photos are shrunk to 1600 px on the long side and stored inside the project
- Videos play in sync with the timeline and follow the playhead when you scrub
- Video controls: speed (0.25×–3×), trim start and volume
- Size controls: width and height with a keep-ratio lock, plus **Fit comp**, **Fill comp**, **Reset size** and **Center**
- On-canvas handles: drag a corner to scale and the round handle to rotate (hold Shift to snap to 15°)

### Look and effects
- Flip horizontally or vertically, corner radius, border colour and width
- Brightness, contrast, saturation, hue, grayscale and sepia
- Blur, glow and blend modes (Add, Multiply, Screen, Overlay and more)
- Composition background colour

### Timeline and playback
- Scrubbable playhead, frame stepping, loop, zoom, and adjustable composition length (1–30 seconds)
- Drag a layer's bar to move it, and drag its ends to set in and out points

### Project and export
- Undo and redo
- Autosave to the browser's local storage
- Import and export the whole project as JSON, including photos
- Render the composition to a WebM video

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Space | Play or pause |
| K | Add keyframes for every property at the playhead |
| ← / → | Step one frame back or forward |
| Delete | Delete the selected layer |
| Ctrl/Cmd + D | Duplicate the selected layer |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y (or Shift + Z) | Redo |

## Project structure

```
After_Effect/
├── index.html   # page layout and structure
├── style.css    # all styling, with light and dark themes
├── app.js       # editor logic: layers, keyframes, timeline, media, JSON, rendering
└── README.md
```

## Project JSON

A project is a single JSON object. Each layer stores its static settings plus a list of keyframes for every animatable property.

```json
{
  "name": "Untitled comp",
  "w": 960,
  "h": 540,
  "duration": 6,
  "fps": 30,
  "bg": "#101018",
  "layers": [
    {
      "id": 1,
      "name": "Star",
      "type": "star",
      "fill": "#ff5a36",
      "w": 130,
      "h": 130,
      "inT": 0,
      "out": 6,
      "blend": "lighter",
      "glow": 24,
      "props": {
        "x":       { "v": 150, "k": [{ "t": 0, "v": 150, "e": "easeInOut" }] },
        "y":       { "v": 420, "k": [] },
        "scale":   { "v": 100, "k": [] },
        "rot":     { "v": 0,   "k": [{ "t": 0, "v": 0, "e": "linear" }, { "t": 6, "v": 360, "e": "linear" }] },
        "opacity": { "v": 100, "k": [] }
      }
    }
  ]
}
```

- `props.<name>.v` is the static value, and `k` lists keyframes as time `t` in seconds, value `v` and easing `e`.
- Layer `type` is one of `rect`, `ellipse`, `star`, `triangle`, `text`, `image` or `video`.
- Photo layers carry a `src` field with the image as a data URL in exported JSON.

## Limitations

- **Videos are not saved in the project.** Browsers cannot keep video files inside JSON, so after a reload a video layer shows a placeholder. Select it and use **Re-link video file** to pick the file again. Keyframes and settings are preserved.
- **Rendered video has no sound.** The WebM export records the picture only.
- **Rendering needs `MediaRecorder` support.** Use a current version of Chrome, Edge or Firefox.
- **Canvas filters.** The colour and blur effects use the canvas `filter` property, which Safari does not fully support.
- Autosave uses local storage, which has a size limit, so projects with many large photos may stop autosaving. Export the JSON to keep a copy.

## Roadmap ideas

- Masks and cropping
- Gradients and richer text styling (fonts, alignment)
- Layer parenting
- Graph editor for easing curves
- Transitions between layers
- Audio in rendered video

## Contributing

Issues and pull requests are welcome. The project has no dependencies, so open `index.html`, edit the files and refresh the page. Please keep changes small and focused, and describe how you tested them.

## License

No license has been chosen yet. Add a `LICENSE` file (for example MIT) to state how others may use this code.
