# content/site-content.json

The content plan is the single source for the site the tile creates. Every page, datasource and partial design comes from here. Edit it and re-run the generator; never hand-edit the generated YAML.

Full example: `examples/kit-nextjs-williams-lea/content/site-content.json` (36 pages).

## Top level

```jsonc
{
  "$comment": "What this file is and where the text came from.",
  "site": { "name": "acme", "renderingHost": "kit-nextjs-acme", "language": "en" },
  "sharedDatasources": { "Header": { ... }, "Footer": { ... }, "Contact CTA": { ... } },
  "partialDesigns": {
    "headless-header": ["AC Header -> Header"],
    "headless-footer": ["AC CTA Band (Subscribe) -> Subscribe Banner", "AC Footer -> Footer"]
  },
  "pages": [ ... ]
}
```

- **`site.renderingHost`**: the name of the app's entry in the root `xmcloud.build.json`. The Post Setup step writes it to the site's Site Grouping.
- **`partialDesigns`**: maps a placeholder to its renderings.
  - Each entry is `Rendering name (Variant) -> shared datasource name`, and the variant is optional.
  - Keys must be `headless-header` and `headless-footer`. The setup script wires those two into the Default page design.
  - Their datasources are copied locally under each partial design.

## Datasource objects

Used in `sharedDatasources` and inline on components:

```jsonc
{
  "name": "Home Hero",            // inline only: item name under the page's Data folder
  "template": "AC Hero",          // optional inline (defaults to the rendering's datasource template)
  "variant": "Subscribe",         // informational for shared ones; the placement sets the variant
  "fields": {
    "heading": "Plain text or <p>rich text</p>",
    "link": { "text": "Learn more", "href": "/services", "target": "_blank" },
    "items": ["/Home/Case Studies/first", "/Insights/Blog/post"],  // Treelist: page paths
    "source": "/Home/Insights/Blog",                                 // Droptree: one page path
    "image": "<hero poster image>"                                   // placeholder: skipped
  },
  "children": [
    ["Link text", "/services/foo"],                         // shorthand: linkItemTemplate
    { "question": "Q?", "answer": "<p>A.</p>" },            // shorthand: faqItemTemplate
    { "template": "AC Link Group", "name": "Group", "fields": { ... }, "children": [ ... ] }
  ]
}
```

- **Links**: when an `href` (minus any `#anchor`) matches a page URL in the plan, it becomes an internal link resolved at site creation.
  - URLs are the page path without `/Home`, lowercased, with spaces as hyphens. `/Home/Solutions in Action` is `/solutions-in-action`.
  - Any other `href` stays an external link with that URL. Relative URLs still navigate inside the Next.js app.
- **Page paths** in Treelist and Droptree values may omit the `/Home` prefix.
- **Placeholder values** are strings like `"<hero poster image>"`. They document what to supply later and are left empty. Use them for media, since the template ships none.
- **Child item names** come from the text or name.
  - Characters Sitecore rejects (`, . & ' ?` and so on) are removed. `&` becomes "and".
  - Duplicate names get a suffix.

## Pages

```jsonc
{
  "path": "/Home/Services/Presentations",
  "template": "Detail Page",
  "fields": { "pageTitle": "Presentations", "pageSummary": "<p>...</p>", "metadataDescription": "..." },
  "components": [
    { "rendering": "AC Page Banner" },
    { "rendering": "AC Page Banner", "variant": "Article" },
    { "rendering": "Breadcrumbs (CCL)" },
    { "rendering": "RichText (CCL)", "datasource": { "name": "Body", "fields": { "text": "<p>..</p>" } } },
    { "rendering": "AC Insight Cards", "sharedDatasource": "Case Studies" },
    { "rendering": "AC Service Stack", "reuseDatasource": "Home Services" }
  ]
}
```

- **Page fields:**
  - **`path`**: starts with `/Home`. List parents before children. Every intermediate page must be listed.
  - **`template`**: `Home Page` (only `/Home`), `Detail Page`, `Article Page`, `Landing Page`, `Product Page` or `Page Folder`. The setup script creates the site's page templates on the matching CCL base.
  - **`fields`**: set by name after creation. A field the template lacks is skipped with a log line instead of failing.
- **Components** render in `headless-main`, in order. A component's datasource is one of:
  - `datasource`: an inline item under `<page>/Data/<name>`;
  - `sharedDatasource`: an item in `<site>/Data/<displayName>/<name>`, which only includes shared datasources a page actually uses;
  - `reuseDatasource`: another page's inline datasource, by name;
  - none, for page-driven renderings.
- **`variant`**: a non-default variant name.
  - It is placed via `FieldNames` and created under Headless Variants, together with `Default`.
  - The component must export a variant with that name.
- **`stubOf: "/Home/Industries/Legal"`** gives a page the same layout as another page, without that page's inline content. Shared and page-driven components are kept.
  - If the kit config sets them, an inline CTA becomes `defaultCtaDatasource`.
  - Use it to stub out sibling pages, for example more industries or articles, without writing their bodies.
