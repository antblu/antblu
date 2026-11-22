# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Prioritize prospective employers on the antblu.net homepage (`/`). Hiring managers and technical interviewers use the portfolio to assess Anthony Bluemel for systems administration and infrastructure engineering roles. They need to find his experience, see what he owned, and inspect the work behind his claims.

Prioritize prospective consulting clients on `/services` and all other pages on antblu.net. These visitors need to assess whether their organization can run open-source infrastructure, a business website, or an online store in its own accounts. They need to understand what deployment and ongoing operation would require before requesting a consultation.

## Product Purpose

Anthony uses the site to show how he supports systems for clients and builds infrastructure in his homelab. A prospective employer can connect a responsibility or skill to a project, source repository, or architecture walkthrough and reach Anthony for a conversation. A prospective client can compare options using their own costs and bring a defined problem to a consultation.

## Positioning

Anthony draws on systems work in an MSP environment and on Antalos, his self-hosted infrastructure. Visitors can trace his approach from infrastructure provisioning to monitoring and recovery. The Emiliany case study extends that evidence to a bilingual storefront. Consulting clients keep control of their accounts and data. Anthony scopes a one-time implementation, documents the deployment, and trains the client’s operators to verify and run it.

## Operating Context

- Employers can review the experience timeline, technical skills, and selected projects, then inspect public source and architecture material.
- Consulting clients can review service scopes, browse application and subscription comparisons, and estimate ownership costs over one, three, or five years. The incident walkthrough uses fictional data and scripted responses. Visitors can prepare a project brief in the browser and send it to Anthony from their email app.
- The Blog link leads to Anthony’s separate Drupal journal.

## Capabilities and Constraints

- Serve the site from `portfolio/dist/` without a build step. Keep credentials out of browser assets. The local preview command is `python3 -m http.server 4173 --directory portfolio/dist`.
- Keep the project brief, restore exercise, and cost calculator usable without API calls. The contact page offers an email draft, copy action, and direct email address.
- Treat the homelab and Antalos inventory as snapshots of hardware and source configuration. Date the evidence, label archived templates, and verify deployment or health claims against the running system.
- Treat calculator outputs as estimates based on visitor inputs and stated assumptions. Keep implementation, hosting, subscriptions, and administrator labor visible as separate costs. Check upstream sources and verification dates before quoting prices or license terms.

## Brand Commitments

Use Anthony Bluemel for the person and antblu for the site identity. Preserve the original portrait, supplied logo, and asset attribution. Use Anthony’s first-person voice when describing his work, decisions, and services. [Brand and asset notes](portfolio/BRANDING.md)

## Evidence on Hand

- The [experience timeline](portfolio/dist/index.html#resume) and [plain-text résumé](portfolio/dist/assets/documents/anthony-bluemel-resume.txt) record work at Vector Digital and Emiliany alongside education and credentials.
- The [Antalos explorer](portfolio/dist/services/index.html#stack) links to service homepages and the public Antalos configuration. The [homelab section](portfolio/dist/index.html#homelab) includes rack photos, hardware, and network topology. [Homelab source notes](portfolio/dist/assets/homelab/README.md)
- The [Emiliany case study](portfolio/dist/index.html#emiliany) documents the storefront, deployment, and integrations, with links to the storefront and project source. The [handoff exercise](portfolio/dist/services/handoff/index.html#restore) illustrates a workflow using a scenario.

## Product Principles

- Pair technical claims with source, photos, diagrams, or a walkthrough that visitors can inspect.
- Name Anthony’s role and the scope of the work. Distinguish client work, coursework, lab experiments, and simulated examples.
- Give consulting clients enough detail to decide what their team can own and support after handoff.

## Accessibility & Inclusion

Preserve semantic HTML, keyboard access, visible focus, and reduced-motion support. Keep core portfolio content and contact information available before script enhancement. Support phone widths down to 320px and check both themes.
