# FORM

A black-and-white stretching practice with a hand-drawn stick figure, a seven-second setup, and audible transitions. [Start a session](https://mervive.com/stretch/) or [browse the directory](https://mervive.com/stretch/?view=directory).

## Run locally

From the repository root, run:

    python -m http.server 8000 --directory dist

Open http://localhost:8000. Everything runs in the browser. There is no build step or API key. Practice notes and preferences use local storage.

## How it works

- `app.js` controls timers, transitions and sound cues.
- `poses.js` and `atlas-poses.js` draw the figure on canvas.
- `catalog.js`, `directory.js` and `library.js` define and display the exercises, evidence, and routines.
- [Movement references](MODEL_REFERENCES.md) document technique sources and studio timing choices.

## License and sources

The original software is MIT licensed. Third-party videos, transcripts, linked guides, and exercise photos retain their respective rights. This edition links to the original videos and provides timestamped chapters. It omits the full third-party transcripts. Directory metadata identifies its Free Exercise DB source revision.
