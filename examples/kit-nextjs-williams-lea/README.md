# Williams Lea - Demo Site (NextJS) - kit-nextjs-williams-lea

## Table of Contents

- [Overview](#overview)
- [Components](#components)
- [Preconditions](#preconditions)
- [Push templates and renderings](#push-templates-and-renderings)
- [Create the site and content](#create-the-site-and-content)
- [Build and run site locally](#build-and-run-site-locally)
- [Add Editing host to XM Cloud](#add-editing-host-to-xm-cloud)
- [Documentation](#documentation)

## Overview

A SitecoreAI recreation of [williamslea.com](https://www.williamslea.com/) for demo purposes: homepage, service, industry, solution and insight page types, global header with mega menu, and footer. It is built on the `kit-nextjs-article-starter` foundation (Content SDK, App Router, Tailwind, Shadcn) and reuses the click-click-launch (CCL) site template, page templates and generic renderings (Breadcrumbs, RichText, Container).

Brand notes:

* Colours: primary blue `#004E97`, slate `#333D47`, accent pink `#AD3673`, highlight orange `#FF9E25`, blush `#F4EAEC` (see `src/assets/styles/globals.css`).
* Typeface: the live site uses Halyard Display (Adobe Fonts licence). This kit substitutes Figtree from Google Fonts.

## Components

All Williams Lea components live in `src/components/wl-*`, with shared atoms in `src/components/atoms/wl`. Each maps to a JSON rendering under `/sitecore/layout/Renderings/Project/williams-lea` and a datasource template under `/sitecore/templates/Project/williams-lea/Components`.

| Rendering | Component | Used for |
| --- | --- | --- |
| WL Header | `WlHeader` | Utility bar, main nav with mega menus, Contact CTA, mobile drawer |
| WL Footer | `WlFooter` | Footer links, CTA, social links, copyright |
| WL Hero Video | `WlHeroVideo` | Full-height video hero (respects reduced motion); falls back to the image, then to an animated brand wave backdrop |
| WL Service Stack | `WlServiceStack` | Sticky stacked service-pillar cards |
| WL Solutions Grid | `WlSolutionsGrid` | "Solutions in Action" link grid |
| WL Industries | `WlIndustries` | "Powering Diverse Sectors" industry list with image |
| WL Tabs | `WlTabs` | "Innovation Without Limits" tabbed panels |
| WL Insight Cards | `WlInsightCards` | Hand-picked Insight/Case Study cards (reads the selected pages' fields) |
| WL Insight Listing | `WlInsightListing` | All child pages of a source page, newest first, with Load More |
| WL Page Banner | `WlPageBanner` (`Default`, `Article`) | Detail page banner from page fields; parent title as eyebrow |
| WL CTA Band | `WlCtaBand` (`Default`, `Subscribe`) | "Ready to get started?" band and newsletter banner |
| WL Related Services | `WlRelatedServices` | Related services grouped by pillar |
| WL FAQ | `WlFaq` | Numbered FAQ accordion with FAQPage structured data |

Templates and renderings are serialized in [`authoring/items/williams-lea`](../../authoring/items/williams-lea) and generated from a single spec by `scripts/generate-sitecore-items.mjs`. Integrated GraphQL queries select fields with `field(name: "...")` aliases, so they do not depend on generated GraphQL type names. To change a template or query, edit the spec and re-run:

```bash
node scripts/generate-sitecore-items.mjs
```

## Preconditions

1. You have deployed your XM Cloud environment, including the CCL module that the other kits use. If not, follow [Deploy a Project and Environment](https://doc.sitecore.com/xmc/en/developers/xm-cloud/deploy-a-project-and-environment.html).

## Push templates and renderings

From the repository root, after `dotnet sitecore cloud login` and connecting to your environment:

```bash
dotnet sitecore ser push -i Project.williams-lea
```

The module is also picked up automatically by an XM Cloud Deploy build, because `sitecore.json` includes `authoring/items/**/*.module.json`.

## Create the site and content

1. Deploy the branch so the `Project.williams-lea` items and the `kit-nextjs-williams-lea` rendering host exist.
2. In the SitecoreAI Sites dashboard, create a site named `williams-lea` from the **Empty site** template (collection `demo`).
3. Wire up the site (done through the Sitecore MCP, or by hand):
   - Rebase the site's page templates on the CCL bases: `Page` → `{AC9DE9BE-8E86-4147-8FBC-739D5560408B}`, plus `Home Page`, `Detail Page` and `Article Page` templates as in `authoring/spe-scripts/site-2-setup.ps1`.
   - Set the Site Grouping `RenderingHost` field to `kit-nextjs-williams-lea`.
   - Add the WL renderings (plus CCL Breadcrumbs and RichText) to **Presentation > Available Renderings**.
   - Create **Headless Variants** for `WlPageBanner` (`Default`, `Article`) and `WlCtaBand` (`Default`, `Subscribe`).
   - Create Header and Footer partial designs and a Default page design mapped to all page templates.
4. Create the pages and datasources described in [`content/site-content.json`](content/site-content.json).

## Build and run site locally

1. Starting from the root of the repository, navigate to the site app folder:
    ```cd examples\kit-nextjs-williams-lea\```
2. Copy `.env.remote.example` to `.env.local`.
3. Edit `.env.local` and provide `SITECORE_EDGE_CONTEXT_ID`, `NEXT_PUBLIC_DEFAULT_SITE_NAME` (`williams-lea`), `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` and `SITECORE_EDITING_SECRET`. (More info: [Environment variables in XM Cloud](https://doc.sitecore.com/xmc/en/developers/xm-cloud/get-the-environment-variables-for-a-site.html))
4. Install dependencies: `npm install`
5. Run the site: `npm run dev`
6. Visit http://localhost:3000.

## Add Editing host to XM Cloud

This app is registered as the `kit-nextjs-williams-lea` rendering host in the root `xmcloud.build.json`. After creating the site, set its rendering host to `kit-nextjs-williams-lea` (Site Grouping item, `RenderingHost` field, or the site's settings in SitecoreAI).

If you have not enabled split deployment, editing hosts are created automatically from `xmcloud.build.json`. With split deployment enabled, add an editing host named `kit-nextjs-williams-lea` in XM Cloud Deploy (Editing Hosts > Add editing host), then run **Build and deploy**.

## Documentation

- [Skills: capability map for this starter](Skills.md) — High-level capability groupings; see also the repo [docs/Skills.md](../../docs/Skills.md).
- [Sitecore Content SDK for XM Cloud](https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html)
