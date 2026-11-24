# Anthony Bluemel — Portfolio

Responsive, buildless HTML/CSS/JavaScript portfolio adapted from the supplied Tomasz Gajda community Figma design. Source: https://www.figma.com/design/zzVHnk9ILrRuqvXXNmJ61O/?node-id=1-2

Serve `dist/` using `python3 -m http.server 4173 --directory dist`.

The homepage is organized for prospective employers: role and evidence summary → about → professional experience → selected projects → technical skills, education, and coursework → Emiliany case study → infrastructure lab → service inventory → career goals → contact. The hero links directly to experience, projects, and contact. Projects use the interactive carousel, with Antalos and Emiliany first; category filters and project dialogs remain available. The Blog menu item opens the Drupal journal at https://blog.antblu.net.

- Personal details: `dist/index.html`.
- Project details and interactions: `dist/app.js`.
- Responsive design: `dist/styles.css`.
- Figma assets are downloaded locally to `dist/assets/`.
- Portrait: Anthony’s supplied IMG_4275.HEIC (JPEG-encoded), stored as dist/assets/anthony-bluemel.jpg. The displayed portrait is a transparent cutout at dist/assets/anthony-bluemel-cutout.png; the original is retained separately.
- Branding: Antalos blue/cyan/navy palette in dist/brand.css; user-supplied antblu logo in dist/assets/antblu-logo.png.
- Original GitHub project links were verified as public during implementation. The original cards use decorative artwork from the reference; the Emiliany feature uses assets from its source project and links to its storefront, source, documentation, and deployment configuration.
- The Sites deployment starts owner-private. This does not publish changes to the existing GitHub repository.

Button verification covers desktop/mobile navigation, all project filters, each modal and its close actions, GitHub destinations, native form validation, mailto drafts, and clipboard fallback. Ticket creation does not confirm outbound email delivery.

Dark mode follows the visitor’s system preference until the header’s Dark mode toggle is used. The choice is saved locally and synchronized across tabs. Theme colors are in `dist/brand.css`; the initial theme is applied in the document head to avoid a light flash.

Blog: the main menu links directly to [blog.antblu.net](https://blog.antblu.net). The former example article and its dedicated styles and interactions have been removed. Nginx redirects `/blog`, `/blog/`, `/blog/index.html`, and `/blog.html` to the Drupal site. `dist/blog/index.html` is only a redirect fallback for static hosts. Maintain blog content in Drupal and its theme in the Antalos repository under `apps/drupal/image/antalos_journal/`.

Antalos explorer (`/services#stack`): searchable, category-filtered inventory of Kubernetes applications, Debian workloads, and archived templates, with draggable cards on desktop and a static mobile grid. Drag a handle or use arrow keys (Shift for larger steps); Home restores that card. Reset cards restores all positions. Each card links to the application website or its official project page. The markup lives in `dist/services/index.html` and the interaction lives in `dist/stack.js`. Inventory is a November 2026 source snapshot, not live cluster status; template cards are labeled as archived.

Emiliany case study (`#emiliany`): a featured application card leads to a brand composition, bilingual storefront links, and three selectable architecture journeys (page request, release, connected services). Content lives in `dist/index.html`, progressive enhancement in `dist/emiliany.js`, and theme/responsive styles in `dist/brand.css`. All stories remain visible without JavaScript. Native disclosure controls explain availability, configuration ownership, and integration tradeoffs. The composition is illustrative, not a captured screenshot. Architecture describes source reviewed in October 2026, not verified production health or activation. No backend, store, or cluster configuration changes are required to serve this feature.

Experience (`#resume`) and technical skills (`#skills`): the experience timeline leads with Vector Digital, followed by the part-time Emiliany role. Education, the earned certificate, and coursework labs follow the toolkit and practical tool examples in the skills section. Infrastructure project evidence appears in selected projects and the lab section. A plain-text resume is retained at `dist/assets/documents/anthony-bluemel-resume.txt`; the page does not show a download button. The Emiliany role is Principal System Engineer, part time, October 2026–Present. Source worksheet prompts and job-posting requirements are not portfolio content. The main navigation prioritizes Experience, Projects, Skills, and Infrastructure.

Homelab (`#homelab`): physical hardware, a static network topology, seven documented VLAN roles, VM placement, and four supplied build photos. Content lives in `dist/index.html`, styles in `dist/homelab.css`, and optimized photos plus source notes in `dist/assets/homelab/`. Native image links open larger photos without JavaScript. The section uses the owner's inventory workbook as a documented snapshot; it does not poll the private Homelable dashboard. Hardware worksheet discrepancies and photo attribution are recorded in the asset README.

### Featured Emiliany components

The featured build uses a small React island with locally bundled Base UI Tabs and
Accordion. Edit its content in `dist/index.html`, behavior in `dist/emiliany.js`
and styles in `dist/emiliany.css`. Serving remains buildless; only library upgrades
need the optional bundle workflow in [components/README.md](components/README.md).

## Consulting pages

The portfolio now links to a buildless consulting area. Service pages, the demo,
and the consultation form are directory indexes under `dist/`. Nginx serves
their canonical URLs directly and supplies the JavaScript MIME type for modules.
The Python preview redirects directory URLs to their trailing-slash equivalents.

- `dist/services/pricing.mjs` owns implementation ranges, hosting cost examples,
  and editable provider allowances. Rerender consulting HTML after updating a
  range to refresh the static price fallbacks.
- `dist/services/applications.mjs` lists catalog modules, deployment requirements,
  edition qualifications, and upstream license links.
- `dist/services/comparisons.mjs` lists US commercial plans, sources, verification
  dates, actual billing periods, and seat rules. Annual amounts are full annual
  charges. Use an empty price list for a plan that requires a quote or cannot be
  represented by a flat rate.
- `dist/services/tco.mjs` projects ownership costs and sustained break-even.
  It normalizes annual expenses to monthly accrual and records replacements at
  anniversaries inside the selected term. Run `node --test portfolio/tests/tco.test.mjs`
  from the repository root.
- `dist/services/site-content.mjs` holds consulting copy, handoff checks, and
  the sample restore scenario. Run `node portfolio/render-consulting.mjs`
  from the repository root to refresh the HTML served to visitors.
  Pass `--check` to verify generated markup without writing files.
- `dist/services/site-config.mjs` lists optional public sandboxes. The restore
  exercise uses sample snapshots, file contents, and a scripted response.
- Both contact forms submit to Zammad through the website proxy. Visitors can
  also open an email draft or copy the message. Calculator summaries transfer
  within the same browser tab.
- The privacy and terms pages describe contact submissions and one-time
  implementation estimates.

From the repository root:

```sh
python3 -m http.server 4173 --directory portfolio/dist
node --test portfolio/tests/tco.test.mjs
git diff --check
```

Use the configured Nginx tag in Antalos for a production-shaped local preview:

```sh
docker build --build-arg NGINX_IMAGE_TAG=<configured-tag> -t antblu:local .
docker run --rm -p 8080:8080 antblu:local
```

The existing website image workflow builds pull requests and publishes from
`main`. The Antalos deployment supplies the upstream address independently
of browser assets.

Services regression checks (optional component-development dependencies):

```sh
node --test portfolio/tests/*.test.mjs
node portfolio/tests/services-browser.mjs
```

Start the static preview on port 4173 before the browser check. Override
`ANTBLU_PREVIEW` for another URL and `CHROME_PATH` for another Chromium executable.
The browser check uses the pinned Playwright in `portfolio/components/` and does
not submit a contact request. Screenshots are written under `/tmp/`.
