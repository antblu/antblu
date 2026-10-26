# Anthony Bluemel — Portfolio

Responsive, buildless HTML/CSS/JavaScript portfolio adapted from the supplied Tomasz Gajda community Figma design. Source: https://www.figma.com/design/zzVHnk9ILrRuqvXXNmJ61O/?node-id=1-2

Serve `dist/` using `python3 -m http.server 4173 --directory dist`.

- Personal details: `dist/index.html`.
- Project details and interactions: `dist/app.js`.
- Responsive design: `dist/styles.css`.
- Figma assets are downloaded locally to `dist/assets/`.
- Portrait: Anthony’s supplied IMG_4275.HEIC (JPEG-encoded), stored as dist/assets/anthony-bluemel.jpg. The displayed portrait is a transparent cutout at dist/assets/anthony-bluemel-cutout.png; the original is retained separately.
- Branding: Antalos blue/cyan/navy palette in dist/brand.css; user-supplied antblu logo in dist/assets/antblu-logo.png.
- The contact form submits to the built-in Zammad form channel through same-origin `/api/v1/form_config` and `/api/v1/form_submit` proxies and displays the returned ticket number. Name, email, message, and optional phone are included. No API credentials are shipped to the browser. The container reads `CONTACT_UPSTREAM` from deployment configuration; its default is intentionally unavailable for static previews. The form channel must be enabled; keep its honeypot and rate limits enabled. A configured CAPTCHA requires adding its challenge UI before submissions can resume. The visible email address remains a fallback option.
- Original GitHub project links were verified as public during implementation. The original cards use decorative artwork from the reference; the Emiliany feature uses assets from its source project and links to its storefront, source, documentation, and deployment configuration.
- The Sites deployment starts owner-private. This does not publish changes to the existing GitHub repository.

Button verification covers desktop/mobile navigation, all project filters, each modal and its close actions, GitHub destinations, native form validation, mailto drafts, and clipboard fallback. Ticket creation does not confirm outbound email delivery.

Dark mode follows the visitor’s system preference until the header’s Dark mode toggle is used. The choice is saved locally and synchronized across tabs. Theme colors are in `dist/brand.css`; the initial theme is applied in the document head to avoid a light flash.

Blog: the `#blog` section contains a short example article, sticky desktop table of contents, collapsible mobile contents menu, and active-section tracking. Edit article content and anchor links in `dist/index.html`; styling lives in `dist/brand.css`.

Antalos explorer (`#stack`): searchable, category-filtered inventory of 40 application directories, with draggable cards on desktop and a static mobile grid. Drag a handle or use arrow keys (Shift for larger steps); Home restores that card. Reset cards restores all positions. Data lives in `dist/index.html`; interaction lives in `dist/stack.js`. Inventory is a dated source snapshot, not live cluster status.

Emiliany case study (`#emiliany`): a featured application card leads to a brand composition, bilingual storefront links, and three selectable architecture journeys (page request, release, connected services). Content lives in `dist/index.html`, progressive enhancement in `dist/emiliany.js`, and theme/responsive styles in `dist/brand.css`. All stories remain visible without JavaScript. Native disclosure controls explain availability, configuration ownership, and integration tradeoffs. The composition is illustrative, not a captured screenshot. Architecture describes source reviewed in October 2026, not verified production health or activation. No backend, store, or cluster configuration changes are required to serve this feature.

Resume (`#resume`) and career milestones (`#goals`): the web resume covers professional experience, projects, education, earned certificates, and technical skills. A plain-text resume is retained at `dist/assets/documents/anthony-bluemel-resume.txt`; the page does not show a download button. The Emiliany role is Principal System Engineer, part time, October 2026–Present. Eight planned milestones retain the dates supplied in the career development plan, and the native disclosure lists ongoing commitments. Future certification and role targets are separate from earned credentials. Source worksheet prompts and job-posting requirements are not portfolio content. The main navigation switches to a collapsible menu at 1000px to accommodate Resume and Goals links.

Homelab (`#homelab`): physical hardware, a static network topology, seven documented VLAN roles, VM placement, and four supplied build photos. Content lives in `dist/index.html`, styles in `dist/homelab.css`, and optimized photos plus source notes in `dist/assets/homelab/`. Native image links open larger photos without JavaScript. The section uses the owner's inventory workbook as a documented snapshot; it does not poll the private Homelable dashboard. Hardware worksheet discrepancies and photo attribution are recorded in the asset README.
