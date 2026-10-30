# How the site template tile works

Read this when the tile doesn't appear, site creation fails, or a created site is missing content. Also read it before changing the engine's site-template section.

## Contents

- [What gets serialized](#what-gets-serialized)
- [What happens when someone creates a site](#what-happens-when-someone-creates-a-site)
- [Tokens](#tokens)
- [Where the IDs came from](#where-the-ids-came-from)
- [SCS constraints the engine handles](#scs-constraints-the-engine-handles)
- [Troubleshooting](#troubleshooting)

## What gets serialized

The kit's module is `authoring/items/<project>/<project>.module.json`, namespace `Project.<project>`. XM Cloud Deploy pushes it automatically because the root `sitecore.json` includes `authoring/items/**/*.module.json`.

| Include | Path | Contents |
| --- | --- | --- |
| `<p>.templates` | `/sitecore/templates/Project/<project>` | Component datasource templates |
| `<p>.renderings` | `/sitecore/layout/Renderings/Project/<project>` | JSON renderings |
| `<p>.branches` | `/sitecore/templates/Branches/Project/<project>` | Add Pages, Add Shared Data, Add Partial Designs, Add Rendering Variants, Add Available Renderings |
| `<p>.settings` | `/sitecore/system/Settings/Project/<project>` | `<Name> Setup` module and `Templates/<Name>` (the tile) |
| `<p>.powershell` | `/sitecore/system/Modules/PowerShell/Script Library/<Name>` | `<Name> Site Setup` and `<Name> Configure Rendering Host` |
| `<p>.media` | `/sitecore/media library/Feature/<project>` | Tile thumbnail |

All six use `CreateUpdateAndDelete`. Never put kit items under the click-click-launch (CCL) paths. The CCL module also uses `CreateUpdateAndDelete`, so a push of that module deletes anything it doesn't serialize itself.

## What happens when someone creates a site

1. The Sites dashboard lists every Site Template item, template `{1B2DFD3B-…}`. The tile shows its Name, Description, Content and `__Thumbnail`.
2. SXA scaffolds the headless site: Home, Data, Presentation, Settings and so on. It then runs the template's Site Modules: the 15 standard SXA modules plus `<Name> Setup`.
3. `<Name> Setup` runs its steps in sortorder:
   - **10–50, Add Item steps.** Each step creates its branch template's top-level children under a location inside the new site:

     | Step | Location |
     | --- | --- |
     | Add Available Renderings | Presentation/Available Renderings |
     | Add Rendering Variants | Presentation/Headless Variants |
     | Add Partial Designs | Presentation/Partial Designs |
     | Add Shared Data | Data |
     | Add Pages | Home (the pages plus Home's own Data folder) |

   - **200, Execute Script: `<Name> Site Setup`.** The script:
     1. sets the start item;
     2. rebases the site's `Page` template onto the CCL Page;
     3. creates `Home Page`, plus each page type the plan uses, on the CCL bases, using `Update-PageTemplate` and `Update-TemplateInsertOptions` from the CCL SPE module;
     4. creates a Default page design with the Header and Footer partials, mapped to all page templates;
     5. moves branch pages off the CCL base templates onto the site's own templates;
     6. writes Home's layout and every page's fields from embedded JSON;
     7. resolves all tokens;
     8. sets workflow to Approved.
   - **300, Post Setup: `<Name> Configure Rendering Host`.** Sets Site Grouping `RenderingHost` to `site.renderingHost`.

The CCL module must already be deployed. The setup script imports CCL functions and the pages inherit the CCL base templates.

## Tokens

Branch items are copied verbatim, so they can't contain IDs of items that only exist after creation. Instead the engine writes:

| Token | Becomes | Used in |
| --- | --- | --- |
| `@@WL:/Home/Services@@` | `{GUID}` of `<site>/Home/Services` | Internal links, Treelist and Droptree values, `s:ds` of shared or reused datasources |
| `@@WL:/Data/<Name>/Contact CTA@@` | `{GUID}` of that shared datasource | `s:ds` in layouts |
| `@@WLV:<Rendering>/<Variant>@@` | URL-encoded `{GUID}` of the Headless Variant | `FieldNames` in `s:par` |

The setup script scans every field of every item under the site and replaces tokens. An unresolvable token becomes an empty string and a `Write-Verbose` line, not a failure. The `WL` in the token names is historical and is the same for every kit.

Local datasources use `local:/Data/<name>`, which SXA resolves natively.

## Where the IDs came from

All IDs are copied from the serialized CCL kits in `authoring/items/items/templates/items`. Check against those files, not from memory:

- **Step, module and site-template templates and their field IDs:** `ccl.modules/click-click-launch/Solterra and Co Setup/*.yml` and `Templates/*.yml`.
- **Location IDs:** the `Location` fields of the same Add Item steps. The Alaris, SYNC and Solterra setups all use the same five.
- **Branch item templates:** `ccl.templates.branches/click-click-launch/Solterra and Co/**`. These cover partial design `fd2059fd`, the Global folder `0bf1e9cd`, the Variants folder `49c111d0`, Variant `4d50cdae`, Page Data `1c82e550` and Available Renderings `76da0a8d`.
- **Site and tenant module lists:** identical across the three kit templates. Only the last site module, the kit's setup module, differs.
- **Headless layout device:** `{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}`.
- **Page design template:** `{1105B8F8-1E00-426B-BF1F-C840742D827B}`.

## SCS constraints the engine handles

- **Blank lines in block values.** SCS's YAML reader rejects a block value (`Value: |`) containing a truly empty line. Blank lines must keep the indentation; the CCL scripts do the same.
- **Long paths.** Items whose path relative to the include root exceeds `defaultMaxRelativeItemPathLength` (100) live in hashed folders such as `DFED9BFDA523BC58/`. Only the CLI knows the hash, so the engine finishes with `dotnet sitecore ser validate -i Project.<project> --fix`.
  - Never run the generator from a shell whose working directory is inside the output folder. On Windows the cleanup then fails with EPERM.
- **Field order.** Fields are written sorted by ID, as `ser pull` writes them, so pulls don't churn diffs.
- **Item names.** Sitecore item names allow only word characters, spaces and hyphens. The engine sanitizes generated child names, but page paths and datasource names in the plan must already be valid.

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| Tile missing after deploy | The deploy didn't include the module: check `ser validate` and the deploy log. Or the dashboard doesn't look under `/sitecore/system/Settings/Project/<project>`. Compare with where the CCL tiles live (`…/Project/click-click-launch/Templates`) before moving anything, because overlapping includes delete each other's items. |
| Site creation fails at an Add Item step | Wrong Location ID, or the branch template ID doesn't exist (module not pushed). The error names the step. |
| Fails in `<Name> Site Setup` | Open the script in the PowerShell ISE on the CM and run it against the half-created site with `-Verbose`. Common causes: CCL SPE functions not deployed, or a page path in the plan that doesn't exist. |
| Some components render as empty sections, or the header shows only the logo | The rendering's Integrated GraphQL query exceeds the complexity limit, usually through a large or nested `first:` (see "Stay inside the complexity budget" in `kit-config.md`). Confirm by running `scripts/check-rendered-page.mjs` on the MCP's saved `get_page_html` result: `FAIL` rows are the over-budget queries. Fix the query in the kit config and regenerate. To verify before a redeploy, paste the generated `ComponentQuery` into the rendering item with `update_fields_on_item` and re-render. The next deploy overwrites it with the serialized value. |
| One child item missing from a list, while its siblings show (open issue) | Seen once on Williams Lea, with the "Careers" utility nav item. The item exists, has an English version, and is serialized exactly like its siblings, yet `children` (GraphQL and the MCP) leaves it out. Re-saving it didn't help, and the cause is unconfirmed. Check the item in Content Editor (hidden or never-publish flags, sortorder, versions) and re-index the subtree. Record the cause here once found. |
| Hero fills a whole screenshot | Not a bug. Viewport-height heroes stretch to the screenshot height, so use `get_page_screenshot` at the default 800px. |
| Links or cards empty on the new site | A token didn't resolve. Search the site for `@@WL` in Content Editor; the path inside the token shows what's missing. |
| Variant not applied | The Headless Variants folder name must equal the rendering item name, and the component must export that variant name. |
| Pages render with no header or footer | The Default page design is missing or not mapped. Check Presentation/Page Designs TemplatesMapping. |
| "Rendering host not found" | `site.renderingHost` must match the app's entry name in `xmcloud.build.json`, and that entry must be `enabled`. |
