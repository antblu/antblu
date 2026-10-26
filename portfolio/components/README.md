# Emiliany React components

The site still serves directly from `portfolio/dist/`; no build is needed to run it.
`dist/emiliany.js` is editable browser JavaScript. It uses React 19.2.0 and the
[Base UI 1.9.0 Tabs](https://base-ui.com/react/components/tabs) and
[Accordion](https://base-ui.com/react/components/accordion) primitives, with custom
styles in `dist/emiliany.css`. The editorial content lives once in `dist/index.html`;
the React island reads it to create the interactive journeys. All four journeys
remain available when JavaScript or the vendor bundle cannot load.

The pinned dependencies are bundled locally in `dist/assets/vendor/`. There are no
runtime CDN requests. Only when updating those dependencies, run from this folder:

```sh
npm ci
npm run build
```

Commit the lockfile, regenerated bundle and license notices together. Retain full
MIT notices in `dist/assets/vendor/LICENSES.txt`; refresh them when dependencies
change. The esbuild `LEGAL.txt` includes additional preserved source notices.
Playwright is a development-only dependency for browser verification, not part of
the shipped bundle. `node_modules/` is ignored.
