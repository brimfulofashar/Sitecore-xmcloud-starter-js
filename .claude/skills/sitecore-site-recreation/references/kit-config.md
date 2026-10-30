# sitecore-kit.config.mjs

The kit config tells `generate-sitecore-items.mjs` who the kit is and which component templates and JSON renderings to create. It lives at `<app>/scripts/sitecore-kit.config.mjs`.

The complete, working example is `examples/kit-nextjs-williams-lea/scripts/sitecore-kit.config.mjs`. Start from a copy of it and replace the identity block, templates and renderings.

## Shape

The default export is a function. The engine calls it with GraphQL helpers so the config can build queries without importing anything:

```js
const acmeKit = ({ f, indent, datasourceQuery }) => {
  const templates = [/* ... */];
  const renderings = [/* ... */];
  return {
    project: 'acme',            // kebab-case; folder, namespace (Project.acme) and ID seed
    displayName: 'Acme',        // tile name, setup module, SPE module, shared data folder
    prefix: 'AC',               // 2–3 letters; template prefix and include names (ac.templates, ...)
    tile: {
      description: 'One sentence shown under the tile.',
      pages: 'Home, Products, About, Contact', // "Pages" row on the tile details
      sortorder: 60,            // position among tiles; existing kits use 10–50
    },
    parameterFields: [['pageSize', 'Integer']], // extra fields on "<prefix> Rendering Parameters"
    linkItemTemplate: 'AC Link Item',           // template for [text, href] shorthand children
    faqItemTemplate: 'AC FAQ Item',             // template for { question, answer } shorthand (optional)
    ctaRendering: 'AC CTA Band',                // stub pages swap a copied inline CTA for...
    defaultCtaDatasource: 'Contact CTA',        // ...this shared datasource (both optional)
    templates,
    renderings,
  };
};

export default acmeKit; // named first: the app's ESLint rejects anonymous default exports
```

**`project` is permanent.** Every item ID is an MD5 of `<project>:<item path>`. If you rename it after a deploy, every item gets a new ID and the old ones are orphaned.

## templates

Each entry becomes `/sitecore/templates/Project/<project>/Components/<name>`. A field section named `Content` is created whenever the entry has `fields`.

```js
{
  name: 'AC Hero',
  icon: 'Office/32x32/movie.png',
  bases: ['_AC Section Heading'],    // other kit templates by name (inherits their fields)
  fields: [
    ['video', 'General Link'],
    ['image', 'Image'],
    ['items', 'Treelist', 'query:$home'], // third value = Source
  ],
  insert: ['AC Link Item'],          // insert options (children authors can add)
}
```

- A shared base such as `_AC Section Heading` (eyebrow, heading, subheading, body, link) avoids repeating the same five fields on every section template.
- Supported field types in content values: Single-Line Text, Multi-Line Text, Rich Text, General Link, Image, Checkbox, Integer, Treelist/Multilist (list of page paths), Droptree/Droplink (one page path). Image values are skipped, because no brand media ships with the template.
- The engine adds two templates itself:
  - `<prefix> Rendering Parameters`, on the SXA parameter bases plus `parameterFields`.
  - `<prefix> Data Folder`, whose insert options are every rendering's datasource template.

## renderings

Each entry becomes a JSON rendering under `/sitecore/layout/Renderings/Project/<project>/<name>`.

```js
{
  name: 'AC Hero',               // rendering item name; also the Headless Variants folder name
  component: 'AcHero',           // must match the component-map key (the component file name)
  icon: 'Office/32x32/movie.png',
  datasource: 'AC Hero',         // datasource template name; omit for page-driven renderings
  canSelectPage: true,           // optional: allow the page itself as datasource
  query: datasourceQuery('AcHero', `${HEADING}\n${f('video', 'image')}`),
}
```

- **Datasource location:** `$site/Data/<prefix> Data Folder`, falling back to `$site/Data`.
- **Parameters template:** every rendering gets the kit's parameters template.
- **Order:** the order of the array sets the rendering sortorder.

### Writing Integrated GraphQL queries

- Select fields with `f('a', 'b')`. It expands to `a: field(name: "a") { jsonValue }`. Aliasing by field name means the query never depends on generated GraphQL type names, which differ per environment.
- **Stay inside the complexity budget.** This is the most likely way for a kit to look broken. When a query exceeds the resolver's complexity limit, the rendering gets *no content at all*: the layout JSON shows `isContentResolved: false` and the section renders empty. There is no error in the page. `first: N` multiplies the cost of everything inside it. These shapes were measured on XM Cloud (Williams Lea):

  | Shape | Result |
  | --- | --- |
  | One level, `children(first: 20) { results { id link } }` | works |
  | One level, `first: 100` | fails |
  | Nested, `first` on both levels (8×12, 10×20) | fails |
  | Nested, outer `children` with no `first` (default page size 10), inner `children(first: 12) { results { link } }`, 2 top-level fields | works |
  | Same, with 5 top-level heading fields and 5 group fields | fails |
  | Same, with 5 heading fields, 4 group fields, inner `first: 8` | works |

  Rules of thumb:
  - Size every list to the real content plus a little headroom, never 100.
  - Leave `first` off outer lists of 10 or fewer items.
  - Keep inner lists lean: `link` only, no `id`, since components key on the index anyway.
  - Don't fetch fields a component doesn't read. For example, `isUtility` belongs in the header query only.

  The generator warns when `first` exceeds 20 or appears on more than one nested level.
- Children: `children(first: 20) { results { id ${f('link')} } }`.
- Multilist targets: `items: field(name: "items") { ... on MultilistField { targetItems { id url { path } ${f('pageTitle')} } } }`.
- Droptree target: `source: field(name: "source") { ... on LookupField { targetItem { children(hasLayout: true, first: 100) { results { ... } } } } }`.
- Page-driven rendering (no datasource), with variables `$contextItem` and `$language`:

  ```graphql
  query AcPageBanner($contextItem: String!, $language: String!) {
    externalFields: item(path: $contextItem, language: $language) {
      pageTitle: field(name: "pageTitle") { jsonValue }
      parent { pageTitle: field(name: "pageTitle") { jsonValue } }
    }
  }
  ```

  The component reads `fields.data.externalFields`, and should fall back to route fields when that is missing.
- The page fields available on the CCL page bases are pageTitle, pageHeaderTitle, pageSubtitle, pageSummary, pageThumbnail and pageShortTitle. Article pages add pageDisplayDate, pageReadTime and taxAuthor.

## CCL renderings you can place without defining them

| Content plan name | Rendering | Datasource template |
| --- | --- | --- |
| `Breadcrumbs (CCL)` | Navigation/Breadcrumbs | none |
| `RichText (CCL)` | Page Content/Rich Text (`RichTextBlock`) | `Text (CCL)`, field `text` |

To reuse more CCL renderings, add them to `RENDERING_IDS` in the engine, using IDs from `authoring/items/items/templates/items/ccl.renderings`. Make sure the copied app still contains the matching component.
