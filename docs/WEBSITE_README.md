# Mikveh project website

The Mikveh website is a responsive, static project page stored in the repository's `docs/` directory. It introduces the Chrome extension, explains its features and data flow, and provides Git-based installation instructions.

## Preview locally

From the repository root, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/docs/` in a browser. No build step or package installation is required. The website uses local HTML, CSS, JavaScript, configuration, and the shared icon assets in the repository-level `icons/` directory. It does not load external fonts or scripts and does not request verse data from the Bible API.

## Publish with GitHub Pages

In the repository's GitHub Pages settings, choose **Deploy from a branch**, select the intended branch, and set the folder to **`/docs`**. The website entry point is `docs/index.html`. The shared extension icons remain in the repository-level `icons/` directory and are referenced with `../icons/` paths.

Add the official HTTPS repository address to `docs/config.js` when it has been published:

```js
window.MIKVEH_CONFIG = {
  repositoryUrl: 'https://github.com/OWNER/REPOSITORY'
};
```

The installation block intentionally contains only a Git clone command. There is no Chrome Web Store button or direct ZIP download link.

## Website files

- `index.html` — website content and semantic page structure.
- `styles.css` — responsive layout, monochrome palette, preview components, and theme styles.
- `script.js` — System/Light/Dark theme persistence, responsive navigation, and clone-command copy control.
- `config.js` — placeholder for the official repository URL.
- `DESIGN_CREDITS.md` — reference and asset notes.
- `../icons/` — shared Mikveh extension icon artwork used by the website.

## Product accuracy

The website describes the current extension source: random verse on popup open, reference search, a new random verse action, copy, and System/Light/Dark themes. It identifies the World English Bible (WEB) as the current translation and `bible-api.com` as the external verse service. The site does not advertise features that are not in the extension, such as verse history, favourites, bookmarks, or a translation selector.
