---
name: sitecore-site-recreation
description: Recreate an existing public website as a SitecoreAI / XM Cloud starter kit in this repo. Produces a branded Next.js app (Content SDK), component templates and JSON renderings, and a site template tile in the Sites dashboard that builds every page and datasource when someone creates a site from it. Use this whenever the user wants to rebuild, clone, recreate or migrate a website into SitecoreAI or XM Cloud, build a demo or POC site for a brand or prospect, add a new kit or site template tile, or turn a URL into a Sitecore site, even if they never say "starter kit" or "site template". Also use it to extend or fix an existing kit generated this way, for example adding pages, components or content to an existing tile.
---

# Recreate a website as a SitecoreAI starter kit

The result is three things that ship together from one branch:

1. **A Next.js app**, `examples/kit-nextjs-<project>/`. It is a copy of the article starter, re-themed, with the brand's components.
2. **Serialized Sitecore items**, `authoring/items/<project>/`. They are generated, never hand-written, from two files in the app:
   - `scripts/sitecore-kit.config.mjs`: kit identity, component templates and renderings;
   - `content/site-content.json`: every page, datasource, link and partial design.
3. **A tile in Channels → Get started.** Creating a site from it builds the whole site, with no manual wiring and no MCP calls.

`examples/kit-nextjs-williams-lea` was built this way and is the reference for every step. When unsure how something should look, open the Williams Lea equivalent.

## Before you start

Settle these with the user, because they change what you build:

- **Fork or upstream.** New example sites are not accepted upstream (see `CONTRIBUTING.md` and the "Upstream, forks" section of `CLAUDE.md`). Work on a feature branch in a fork or template copy, and never frame this as an upstream PR.
- **Scope.** Ask whether they want the homepage only, the homepage plus one page per page type, or a broader set. Recreate the page types fully, and stub out siblings with `stubOf` (see the content plan reference).
- **Who commits and deploys.** Default to leaving commits, pushes and deploys to the user. A deploy is outward-facing and slow.
- **Environment.** Check that the click-click-launch (CCL) module is deployed; the tile depends on its base templates and SPE functions. If a Sitecore MCP is connected, confirm it points at the same tenant the user works in. A mismatch has already wasted a session: the tenant ID is visible in the user's browser URL and in MCP errors.

## Workflow

### 1. Research the site

- Read pages in the built-in browser pane with `get_page_text` and `read_page`, and take screenshots for layout. Many corporate sites return 403 to plain fetches. Don't work around bot protection; the browser pane reads them normally.
- Capture the following:
  - **Brand tokens:** colours, typeface (note whether it is licensed), radii, button styles.
  - **Global elements:** header, mega menu, utility nav, footer, newsletter band.
  - **Page types** and the components on each.
  - **Real copy** for the pages in scope.
- Group what you see into a **component inventory**: a small set of reusable section components. Aim for roughly 8–15, not one per page section, and note the variants each needs.
- Don't copy media (images, video, logos). The kit ships without them and components fall back to brand-drawn visuals. Text is used for demo purposes; say so in the content plan's `$comment`.

### 2. Scaffold and theme the app

Follow `references/app-and-components.md`:

- copy the article starter;
- rename the app;
- re-theme `globals.css` and the fonts;
- register the rendering host in the root `xmcloud.build.json`;
- run `npm install`, then confirm that `npm ci` passes.

### 3. Build the components

- Choose a 2–3 letter prefix, for example `AC` for Acme. Use it for component directories (`ac-hero`), component names (`AcHero`), and template and rendering names (`AC Hero`).
- Build each inventory component with its props sidecar, shared atoms, editing-mode handling and variants, per `references/app-and-components.md`.
- Write tests alongside, then regenerate the component map.

### 4. Write the kit config

1. Copy `scripts/generate-sitecore-items.mjs` from this skill into `<app>/scripts/`. Apps copy shared utilities rather than importing them, per `CLAUDE.md`.
2. Write `<app>/scripts/sitecore-kit.config.mjs` (format in `references/kit-config.md`). Start from the Williams Lea config:
   - one template per datasource-backed component, with a shared section-heading base;
   - one rendering per component;
   - Integrated GraphQL queries built with the `f()` field-alias helper, sized to the content, never `first: 100`. Over-budget queries silently return no content; see "Stay inside the complexity budget" in the reference.
3. Choose `project` carefully, because it seeds every item ID. Renaming it after a deploy orphans everything.

### 5. Write the content plan

Write `<app>/content/site-content.json` (format in `references/content-plan.md`). It contains:

- **shared datasources**: header, footer, CTAs, card sets reused across pages;
- **`partialDesigns`** for `headless-header` and `headless-footer`;
- **every page in scope**, with its fields and components in order.

Write `href`s as the site's URLs. The generator turns the ones that match planned pages into internal links.

### 6. Make the tile thumbnail

1. Copy `assets/thumbnail-template.html` to `<app>/scripts/assets/site-template-thumbnail.html`.
2. Fill in the brand tokens and the real header and hero text.
3. Render it:

   ```bash
   powershell -File .claude/skills/sitecore-site-recreation/scripts/render-thumbnail.ps1 -Html examples/kit-nextjs-<project>/scripts/assets/site-template-thumbnail.html
   ```

4. Look at the PNG before moving on. It's the first thing people see on the tile.

### 7. Generate and validate

Run this from the app directory, never from inside `authoring/items/<project>`:

```bash
node scripts/generate-sitecore-items.mjs
```

The generator writes `authoring/items/<project>/` and then runs `dotnet sitecore ser validate -i Project.<project> --fix`, which moves long paths into the CLI's short-path folders. It fails loudly on unknown templates, fields, renderings or shared datasources: fix the config or plan and re-run.

Then check the following:

- `dotnet sitecore ser validate` from the repo root reports "No errors were detected".
- Every `@@WL:` token points at a page or datasource the plan creates:

  ```bash
  grep -rho "@@WLV\?:[^@]*@@" authoring/items/<project> | sort | uniq -c
  ```

- `npm test`, `npx tsc --noEmit`, and `npx eslint` on the new components and scripts all pass.
- Re-running the generator produces no diff.

### 8. Hand off and verify

Tell the user the order:

1. commit and push;
2. run **Build and deploy** in XM Cloud Deploy;
3. go to **Channels → Get started** and create a site from the new tile.

After that, if the MCP is connected to the right tenant, check that pages render content, not just layout:

1. `get_components_on_page` shows what is placed and the datasource content.
2. `get_page_html` shows what actually rendered. Its result is usually too big to read inline and gets saved to a file. Run the checker on that file:

   ```bash
   node .claude/skills/sitecore-site-recreation/scripts/check-rendered-page.mjs <saved file>
   ```

   Every component must be `ok`. A `FAIL` (`isContentResolved: false`) means its GraphQL query returned nothing, almost always because it exceeded the complexity limit. Check at least Home, one page of each type, and a page with a listing.
3. Use `get_page_screenshot` at the default 800px height for the look. Taller viewports stretch viewport-height heroes over everything else. Fix problems in the config, plan or components, regenerate, and redeploy. If site creation itself fails, use the troubleshooting table in `references/site-template-anatomy.md`.

Say plainly what you could not verify. Tile discovery and site creation can only be tested after a deploy, so report them as untested until the user confirms.

## Changing an existing kit

- **Content or pages:** edit `site-content.json` and regenerate. Only sites created afterwards get the change, because existing sites are not touched. Offer to apply the same edit to an existing site through the MCP if the user needs it there.
- **New component:**
  - Add the component and its tests, then the template and rendering in the config.
  - Then place it in the plan.
  - Regenerate both the component map and the items.

## Reference files

- `references/app-and-components.md`: scaffolding, theming, component and test conventions, and known repo issues (lockfiles, the ESLint flat config).
- `references/kit-config.md`: `sitecore-kit.config.mjs` format, GraphQL query patterns, and reusable CCL renderings.
- `references/content-plan.md`: `site-content.json` format (pages, datasources, links, shorthands, `stubOf`).
- `references/site-template-anatomy.md`: what the tile serializes, what runs at site creation, tokens, ID provenance, SCS constraints, troubleshooting.
- `scripts/generate-sitecore-items.mjs`: the engine. Copy it into the app, and don't fork its logic per kit; if a kit needs something new, add it to the engine here and copy it back.
- `scripts/check-rendered-page.mjs`: lists each component on a rendered page (a `get_page_html` result) and whether its content resolved.
- `scripts/render-thumbnail.ps1` and `assets/thumbnail-template.html`: the tile image.
