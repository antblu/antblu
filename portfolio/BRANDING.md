# antblu branding

Palette: Antalos blue #3488ff, bright blue #62a5ff, cyan #57d8ff, navy #070d16, and light surfaces #dcecff / #f5f9ff.

Logo: dist/assets/antblu-logo.png, copied unchanged from the user-supplied Antblu Blue Ant Logo.png. This replaces the generated logo.

Portrait: dist/assets/anthony-bluemel-cutout.png, background removed using the built-in image-generation tool. Original retained at dist/assets/anthony-bluemel.jpg.

## Original cutout prompt

Use case: background-extraction. Edit the supplied photo of Anthony into a clean transparent PNG cutout for his portfolio hero. Remove the entire room/background and all non-person objects: table, plate of food, utensils, bottle, plants and wall. Preserve the person exactly: facial identity, expression, hair, skin texture, pink shirt with navy trim, seated leaning pose and visible arms. Do not beautify, redraw, change clothes or invent a different pose. Keep the visible person, with a natural waist/forearm lower crop if needed to avoid filling occluded areas. Frame the person tightly with modest transparent margins, not the empty original room. True alpha transparency, no white or black backdrop, no shadow or text.
## Portrait retouch

Displayed asset: dist/assets/anthony-bluemel-retouched.png. Edited with the built-in image generation tool; original photo and cutout retained.

Final prompt: Use case: identity-preserve. Edit target: supplied transparent portfolio portrait of Anthony. Make only three subtle photographic retouches: tidy flyaway hairs and arrange existing short brown hair into a cleaner natural version of the same hairstyle; gently close the jaw so there is no dark open gap between upper and lower teeth, while keeping a warm natural tooth-showing smile; subtly lift the droopier upper eyelid to make eye openings and eyelids symmetrical, preserving eye color, gaze and natural shape. Preserve his recognizable identity, face proportions, skin texture, pose, clothing, arms, hands, lighting, colors, crop and framing. No other beautification or changes. Retain genuine alpha transparency and original canvas composition. No backdrop, text or watermark.

Cloud background: original buildless WebGL noise shader in `dist/clouds.js`, inspired by https://ui.aceternity.com/components/cloud-shader. Uses theme-aware colors, a CSS fallback, and a static frame for reduced motion.

Blog layout: original HTML/CSS/JavaScript implementation inspired by the public preview of https://ui.aceternity.com/blocks/blog-content-sections/blog-content-with-toc. Aceternity lists the block source as All-Access; no premium source code was copied. The cover is CSS artwork and the short deployment article is original example text.

Antalos explorer: original HTML/CSS/Pointer Events adaptation inspired by https://ui.aceternity.com/components/draggable-card. No React or Motion dependency; card illustrations are original CSS artwork. Inventory covers all 40 directories under the local Antalos `apps/` tree as of October 25, 2026, including platform services and bundled configuration/operator resources. Configuration links point to the public repository, not private administrative endpoints. Inventory does not imply live deployment or health.

Emiliany feature: original portfolio composition using the brand's olive/sage/ivory palette. Assets copied unchanged from the Emiliany source project: `public/brand/emiliany-logo.svg` → `dist/assets/emiliany/logo.svg`; `public/images/landing/rendered/autumn-equinox.png` → `dist/assets/emiliany/collection.png`; `public/images/categories/rings.webp` → `dist/assets/emiliany/rings.webp`. Existing brand artwork is preserved. The browser frame and architecture cards are portfolio HTML/CSS, not screenshots of the current public site. No new generated artwork or third-party component source is included.

Application logos update: 30 card images are unmodified Dashboard Icons assets from https://dashboardicons.com (28 SVGs and two PNGs), stored locally in `dist/assets/dashboard-icons/`. Ten services without matching marks use original neutral SVG symbols. Cal.diy uses the Cal.com mark; MariaDB Operator uses MariaDB’s mark. Full per-card source mapping and Apache-2.0 license are retained in that asset directory.

## Homelab explorer and standalone blog

The homelab uses original, buildless adaptations of [Magic UI Bento Grid](https://magicui.design/docs/components/bento-grid) (asymmetric cards and photo/metric composition) and [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/base/tabs) (segmented navigation and accessible panels). No React runtime or upstream source is bundled. `homelab.js` enhances otherwise visible content with keyboard-operable tabs. Inventory statements and original rack photos remain intact. The blog lives at `/blog` (`dist/blog/index.html`), with text attribution and no author portrait, comment form, or “Leave a note” section.

Emiliany featured build (2026-10-26): replaces the three infrastructure stories with a two-column brand composition, five service cards and four customer journeys. Uses locally bundled React 19.2.0 and Base UI 1.9.0 Tabs/Accordion, custom olive/cream styles, dark-theme tokens, reduced-motion handling, and complete static HTML fallback. The content distinguishes Google authentication, Medusa commerce ownership, asynchronous Odoo/Mautic customer delivery, optional marketing consent and Zammad contact tickets. Odoo catalog sync is explicitly marked disabled. Original artwork is preserved. Component sources, versions and regeneration instructions are in `components/README.md`; third-party notices are in `dist/assets/vendor/`.
