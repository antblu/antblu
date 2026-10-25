# Repository Guidelines

## Project Structure & Module Organization

This repository hosts Anthony Bluemel’s buildless portfolio. Edit `portfolio/dist/` directly: it contains the website source, despite the directory name.

- `index.html`: page content, project cards, blog, and architecture stories.
- `app.js`: theme, navigation, filters, dialogs, and contact interactions.
- `stack.js`, `emiliany.js`, `clouds.js`: explorer, case-study enhancements, and WebGL background.
- `styles.css`: base layout; `brand.css`: branding, theme, and feature overrides.
- `assets/`: local images, logos, and asset licenses.

Supporting documentation lives in `portfolio/README.md`, `BRANDING.md`, and `VERIFICATION.md`. Root `Dockerfile` and `nginx.conf` serve the site; `.github/workflows/` handles container builds and runner selection. There is no separate application source or test directory.

## Build, Test, and Development Commands

Run from the repository root:

```sh
python3 -m http.server 4173 --directory portfolio/dist
node --check portfolio/dist/app.js
git diff --check
```

Preview at `http://localhost:4173`. Syntax-check each changed JavaScript file using `node --check`; check whitespace using `git diff --check`. No package installation or compilation is required.

For container verification, supply the Nginx tag configured as `ANTBLU_NGINX_IMAGE_TAG` in `antblu/antalos`’s `apps/variables.yaml`:

```sh
docker build --build-arg NGINX_IMAGE_TAG=<configured-tag> -t antblu:local .
docker run --rm -p 8080:8080 antblu:local
```

The container exposes `/healthz`. CI builds pull requests and publishes images from `main`.

## Coding Style & Naming Conventions

Use plain HTML, CSS, and browser JavaScript. Match existing compact CSS and two-space indentation in expanded JavaScript. Use single-quoted JavaScript strings, semicolons, `const` by default, camelCase identifiers, and lowercase hyphenated classes and asset filenames. No formatter or linter is configured. Preserve semantic HTML, keyboard access, reduced-motion support, relative asset paths, and progressive enhancement.

## Testing Guidelines

No automated test harness or coverage threshold is configured. Follow `portfolio/VERIFICATION.md`: check navigation, filters, dialogs, contact validation, email drafts, clipboard fallback, and changed feature interactions. Review both themes and desktop/mobile layouts, including 320px width. Check overflow, missing assets, and console errors. Record results and unverified behavior; previous Playwright checks are documentation, not an included runnable suite.

## Commit & Pull Request Guidelines

History uses concise imperative subjects, such as `Publish portfolio as a containerized static website`; follow that style. Keep commits focused. PRs should explain behavior changes, link relevant issues, list verification, and include screenshots for visual edits. Preserve asset attribution and original portraits. Keep credentials out of browser assets; the contact form opens an email draft locally.
