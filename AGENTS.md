# Repository Guidelines

## Project Structure & Module Organization

This repository contains Anthony Bluemel’s buildless portfolio website. The editable website lives directly in `portfolio/dist/`; despite its name, this directory is the source served to browsers.

- `index.html`: page structure, personal details, project cards, and contact form.
- `app.js`: navigation, project filters, dialogs, and email/clipboard interactions.
- `styles.css`: base layout and responsive styling.
- `brand.css`: branding overrides, loaded after the base stylesheet.
- `assets/`: local images, portraits, logos, and SVGs.

Read `portfolio/README.md` for behavior, `portfolio/BRANDING.md` for asset provenance, and `portfolio/VERIFICATION.md` for the existing browser verification checklist. There is no separate source tree or automated test suite.

## Build, Test, and Development Commands

Run from the repository root:

```sh
python3 -m http.server 4173 --directory portfolio/dist
```

Open `http://localhost:4173` to preview the site. No dependency installation, compilation, or package scripts are required. If Node.js is available, `node --check portfolio/dist/app.js` checks JavaScript syntax; it does not test browser behavior.

## Coding Style & Naming Conventions

Use plain HTML, CSS, and browser JavaScript. Follow the existing compact formatting, two-space indentation in expanded HTML/JavaScript blocks, single-quoted JavaScript strings, and semicolons. Use `const` by default, camelCase for JavaScript identifiers, and lowercase hyphenated CSS classes and asset names.

Keep branding changes in `brand.css` where practical. Preserve semantic HTML, accessible labels, keyboard controls, reduced-motion support, and relative asset URLs. Avoid introducing a framework or build pipeline for routine edits.

## Testing Guidelines

No test framework or coverage threshold is configured. Follow `portfolio/VERIFICATION.md`: check navigation, filters, dialog dismissal, form validation, email draft encoding, and clipboard fallback. Review desktop and mobile layouts, including 320px width, and check for overflow, missing assets, and console errors. Playwright was used for previous verification; no runnable harness is included. Record relevant checks and results when behavior changes.

## Commit & Pull Request Guidelines

Git history currently contains only `Initial commit`, so no established commit convention exists. Use concise imperative subjects, such as `Fix mobile navigation focus`. Keep changes focused.

Pull requests should explain the change, list verification performed, link relevant issues, and include desktop/mobile screenshots for visual edits. Preserve original portrait assets and design attribution. The contact form opens a local email draft; describe any proposed change to that behavior explicitly.
