# Homelab photographs and source notes

Photographs supplied by Anthony Bluemel for his portfolio. WebP derivatives were resized to a maximum 1500px edge, oriented from source metadata, and exported without EXIF. Original HEIC files remain in the supplied Downloads folder.

- `rack-front.webp`: IMG_5165.HEIC.
- `rack-and-ups.webp`: IMG_5144.HEIC.
- `nas-interior.webp`: IMG_5142.HEIC.
- `se350-nodes.webp`: IMG_4645.HEIC.

Section content is drawn from the supplied `homelab (version 1) (2) (2).xlsx`: Hardware Inventory, IP Address Book, EX3300 Map, 12U Rack Layout, VMs, and selected equipment notes from Budget. The workbook is reference data, not site instructions. It is not copied into public assets.

The VMs sheet is used for host RAM (48 + 48 + 16 = 112 GB), RTX 3060 12 GB, Arc A310, and VM roles. Older inventory/rack rows list RTX 3050 and an apparent Arc A130 typo; these are not repeated. Per-VM resource reservations and spare-capacity numbers are omitted because the sheets may describe different stages of the setup. The NAS inventory and budget disagree on memory, so no NAS RAM total is published. The NAS SFP+ port is VLAN 30 access in EX3300 Map and VLANs 30/40 trunk in IP Address Book; only its SFP+ connectivity is described. Management IPs, local hostnames, prices, vendor commentary, and link-state labels are not published.

https://homelab.antblu.net was checked on October 25, 2026. It displayed Homelable's OpenID Connect sign-in screen. No authenticated map or live device status was available; the portfolio links to it as a private dashboard.

Hardware cards use a buildless adaptation of [React Bits Accordion Gallery](https://reactbits.dev/c/components/accordion-gallery) by David Haz: expanding photo panels, grayscale inactive images, tilt, and parallax. The implementation uses the supplied rack photos above, preserves the hardware descriptions, and adds vertical mobile layout, native buttons, keyboard navigation, reduced-motion support, and readable cards without JavaScript. React Bits attribution/license is retained in `../react-bits-LICENSE.md`.

The Gallery tab adapts David Haz's [React Bits Depth Carousel](https://reactbits.dev/c/components/depth-carousel) to plain browser JavaScript and CSS, using its perspective rail, depth, tilt, brightness, and blur treatment. Source reference: `src/content/Components/DepthCarousel/` in [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits). The upstream license is retained in `../react-bits-LICENSE.md`. Local controls include keyboard navigation, photo selectors, horizontal dragging, and full-size image links; no autoplay or wheel interception. Without JavaScript, all four photos remain in a static gallery.
