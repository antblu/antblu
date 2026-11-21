---
name: Anthony Bluemel Portfolio
description: Blue-toned portfolio and consulting site with a separate Emiliany case-study palette.
colors:
  primary: "#3488ff"
  bright-blue: "#62a5ff"
  cyan: "#57d8ff"
  gold: "#e3ad61"
  gold-ink: "#21170b"
  midnight: "#070d16"
  white: "#ffffff"
  light-page: "#f3f7fb"
  light-soft: "#eaf1f8"
  light-ink: "#132b48"
  light-muted: "#4b6077"
  light-line: "#d4dfeb"
  light-link: "#20558a"
  light-action: "#204e84"
  light-focus: "#2473df"
  dark-page: "#101b29"
  dark-panel: "#111e2d"
  dark-soft: "#142338"
  dark-ink: "#edf5ff"
  dark-muted: "#bbcadb"
  dark-line: "#354c65"
  dark-link: "#a4caff"
  dark-action: "#aacdff"
  dark-action-ink: "#102442"
  dark-focus: "#76acff"
  emiliany-ivory: "#f4f3ed"
  emiliany-olive: "#485b2d"
  emiliany-pine: "#141c18"
  emiliany-sage: "#d3e2ac"
typography:
  display:
    fontFamily: "Raleway, sans-serif"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-2px"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "8px"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 750
    lineHeight: 1.14
    letterSpacing: "-0.033em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  consulting-body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 750
    letterSpacing: "0.11em"
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.3
  hero-action:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 650
    lineHeight: 1.5
  bracket-action:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "1px"
  mono:
    fontFamily: "JetBrains Mono, monospace"
  emiliany-display:
    fontFamily: "Georgia, serif"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-1.8px"
rounded:
  square: "0px"
  field: "8px"
  button: "12px"
  panel: "13px"
  inventory: "14px"
  feature: "16px"
spacing:
  service-gutter: "16px"
  portfolio-gutter: "24px"
  card-padding: "22px"
  service-max: "1168px"
  portfolio-max: "1120px"
components:
  button-primary:
    backgroundColor: "{colors.light-action}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0.52rem 0.9rem"
  button-primary-dark:
    backgroundColor: "{colors.dark-action}"
    textColor: "{colors.dark-action-ink}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.light-link}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0.52rem 0.9rem"
  button-secondary-dark:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.dark-link}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.button}"
  button-hero:
    backgroundColor: "{colors.light-action}"
    textColor: "{colors.white}"
    typography: "{typography.hero-action}"
    rounded: "{rounded.field}"
    padding: "0.52rem 0.9rem"
  button-bracket:
    textColor: "#0c335f"
    typography: "{typography.bracket-action}"
    rounded: "{rounded.square}"
    padding: "7px 25px"
  nav-shared:
    backgroundColor: "{colors.light-page}"
    textColor: "{colors.light-muted}"
  field-standard:
    backgroundColor: "{colors.light-page}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.field}"
    padding: "0.54rem 0.6rem"
  card-services:
    backgroundColor: "{colors.white}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.panel}"
  card-skills:
    backgroundColor: "{colors.light-page}"
    textColor: "{colors.light-muted}"
    rounded: "{rounded.feature}"
    padding: "{spacing.card-padding}"
  card-project:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
---

# Design System: Anthony Bluemel Portfolio

## Overview

**Creative North Star: "Systems, services, automation"**

The portfolio pairs Anthony’s portrait and blue skies with evidence from his systems work. Landscape photography gives the homepage its rhythm. Project artwork, rack photos, topology diagrams, and service logos show visitors what he built and how the pieces fit.

The consulting pages share the blue palette and site navigation. They use solid panels, diagrams, and labeled controls so visitors can compare services and work through estimates. The Emiliany case study uses the store’s olive and ivory palette and its own photography.

- Blue-gray surfaces and a persistent light/dark theme.
- Photo-backed portfolio sections with solid reading surfaces where the content needs them.
- Color and motion on the hero, project artwork, and inventory illustrations.

Read the shared theme in `@portfolio/dist/services/services.css` first. It maps the portfolio’s body, heading, and link variables to the active shared palette. Use `@portfolio/dist/brand.css` for portfolio treatments, `@portfolio/dist/services/landing.css` for the consulting landing page, and `@portfolio/dist/emiliany.css` for the case study. [Brand assets and attribution](portfolio/BRANDING.md)

## Colors

### Primary

- Use Antalos blue (`primary`) in decorative washes and highlights. Use bright blue and cyan on deep navy, including the cyan underline and text of the selected project filter.
- Use the theme’s link, action, and focus values for controls on shared surfaces. Light mode uses dark blue links and actions. Dark mode uses pale blue links and fills with navy text on filled actions.

### Secondary

- Use warm gold for the consulting landing page’s booking CTA, summary figures, and featured package accents. Use the theme’s heading color for the full headline.

### Neutral

- In light mode use blue-gray page backgrounds, white panels, and slate secondary text. In dark mode use navy pages, a lighter navy for panels, and pale blue-gray secondary text.
- The portfolio’s intro, projects, and inventory sit on deep navy in both themes. Use each section’s local colors for light text and borders.
- In Emiliany, pair ivory and olive in light mode and pine and sage in dark mode. Keep that palette within the case study.

## Typography

- Set Anthony’s hero name in Raleway at weight 700. The default desktop rule uses `clamp(52px, 4.5vw, 80px)` with tight spacing. At 700px and below, use `clamp(38px, 10.6vw, 56px)`, a 1.08 line height, and two lines.
- Use Plus Jakarta Sans for headings. Portfolio section titles use uppercase letters and an outlined frame. The desktop base uses 25px type with 8px tracking. Phone titles use a lighter frame and narrower tracking so long labels fit. Consulting headings use sentence case, tight tracking, and a fluid 2rem to 3.5rem page title.
- Use Inter for body text and actions. Body copy is 16px on the portfolio and 0.94rem on consulting routes, with a 1.65 base line height. Consulting leads cap at 62ch. Keep uppercase tracked type for short labels and use JetBrains Mono for technical catalog labels on the consulting landing page.
- Use Georgia for Emiliany’s main headline, with olive or sage italic emphasis. Keep supporting paragraphs and controls in the shared sans-serif families.

## Layout

- Center the shared header and consulting content in a 1,168px wrapper with a minimum 16px gutter on each side. The homepage hero places copy at left and the transparent portrait at right. At 700px and below, put the portrait above the copy and let the hero grow with its text.
- Use the 1,120px content width for the portfolio’s experience, skills, and homelab sections. The experience timeline uses a 192px date rail and stacks dates above the entry at 767px and below.
- Lay out skills cards in one column below 580px, two from 580px through 959px, and three from 960px. Wide cards span two columns in the three-column layout. Keep the 16px gap and 22px card padding.
- Set the inventory in four columns above 1,100px, three through 1,100px, two through 700px, and one at 360px and below. Enable dragging through its dedicated handle on wider layouts. Small screens use cards in a static grid.
- Give the calculator a two-column form and results layout with sticky results where space permits. Stack the form and results at 850px and below. Let comparison tables scroll inside their own wrapper.

## Elevation & Depth

Use theme-aware scrims over landscape photography, with a dark fade behind project card copy. The homepage hero pairs Anthony’s portrait with his role and experience link. Consulting controls sit on solid panels with a thin border. The consulting hero features a Grafana screenshot. Frame product previews with a 14px outer radius and 6px padding. Use an 8px radius on the image.

The project carousel uses a diffuse black shadow (`0 18px 50px #0005`). Inventory cards use an inset rim and a shorter shadow (`0 12px 26px #070d1626` plus the inset stroke in light mode). Consulting landing cards use lighter lift (`0 12px 32px #0a1a2c15`). Keep the calculator panels and skills cards flat with a visible border.

## Shapes

- Keep boxed portfolio titles square and bracket links open at the top and bottom. Use a circle for the shared theme toggle. Show experience dates and project categories as plain text.
- Use 8px corners for standard inputs, 12px for consulting buttons and carousel cards, 13px for consulting panels, 14px for foil inventory cards, and 16px for skills cards. Clip artwork inside cards that use it as a background.
- Use a rounded browser frame for the Emiliany composition. Preserve the provided logo, collection artwork, and case-study photography.

## Components

### Actions

Use filled blue buttons for primary consulting actions and bordered buttons for secondary actions. Standard buttons have a 44px minimum height. Gold marks the booking action in the consulting hero. In the portfolio hero, use one filled experience link and underlined links for projects and services. Elsewhere on portfolio surfaces, paired vertical strokes identify bracket links and give way to a fill on hover.

### Navigation and filters

Keep the logo and theme toggle in the sticky shared header. At 700px and below, show the Menu button and put navigation in a dropdown. Underline the current route and links on hover. The theme toggle follows system preference until the visitor chooses a theme, then stores that choice. Underline the selected project filter and the active Emiliany journey. Homelab tabs use a filled selected state.

### Cards and dialogs

Use a consistent mix of artwork, category, title, description, and actions for project cards. The enhanced carousel uses perspective and separate previous/next controls. Use the native project dialog for longer details. It has a blue top rule, a dark backdrop, and scrolls inside the viewport on phones.

Use 1px borders and solid fills for consulting cards, with the action near the foot of each card. Skills cards pair a small icon tile with a title and description. Inventory cards put foil and service logos in the illustration area, leaving the service name, metadata, and link on a readable panel.

### Fields

Give standard fields a visible border, 8px corners, and a 44px minimum height. Consulting forms use 16px input text. Use a 3px focus outline with a 4px offset on shared consulting controls. Keep contact field labels visible as visitors type. Show progress beside the submit label while the request is pending.

### Motion and fallback

Use motion to show carousel position, pending submissions, and confirmed actions. Keep navigation, form feedback, and selected states readable when motion is reduced. Preserve keyboard controls, native form fields, and the static content that the portfolio renders before enhancement. Use visible borders and system colors for interactive states in forced colors.

## Do's and Don'ts

- **Do** use the shared theme variables for new consulting pages and check the page in both themes at 320px.
- **Do** keep text readable against a solid panel or a theme-aware photo overlay.
- **Do** limit the Emiliany colors and Georgia headline to that case study.
- **Do** keep visible keyboard focus and preserve text labels when a control has a decorative effect.
- **Do** keep project and inventory details available through their text and actions, including in reduced motion.
