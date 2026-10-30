# App scaffolding and component conventions

## Contents

- [Scaffold the app](#scaffold-the-app)
- [Brand theme](#brand-theme)
- [Component layout](#component-layout)
- [Component rules](#component-rules)
- [Tests](#tests)
- [Known repo issues](#known-repo-issues)

## Scaffold the app

Copy the article starter. It is the most complete App Router kit and its components match the CCL renderings. Copy only tracked files, so `node_modules` and `.next` stay behind:

```bash
cd examples/kit-nextjs-article-starter
git ls-files | tar -cf - -T - | (mkdir -p ../kit-nextjs-acme && cd ../kit-nextjs-acme && tar -xf -)
```

Then, in the new app:

- `package.json`: set `name` and `config.appName` to `kit-nextjs-acme`.
- Replace the org name in `src/app/layout.tsx` and `src/app/[site]/[locale]/[[...path]]/page.tsx` (metadata and JSON-LD). Search for the old brand: `grep -ri solterra src`.
- `README.md`: rewrite it for the kit (components table, generator, how to create the site).
- `npm install` regenerates `package-lock.json`. Then confirm that `npm ci` succeeds, because XM Cloud Deploy uses `npm ci`. Lockfiles are only ever changed by npm, never by hand.
- Register the rendering host in the root `xmcloud.build.json`:
  - Copy an existing entry and set the `path` to `./examples/kit-nextjs-acme`.
  - Keep the same `nodeVersion`, `jssDeploymentSecret`, `type: "sxa"` and `buildCommand`/`runCommand`.
  - Set `enabled: true`.

  The entry name is what the content plan's `site.renderingHost` must match.

## Brand theme

- Re-theme the CSS custom properties in `src/assets/styles/globals.css` (HSL tokens: primary, foreground, accent, and so on). Add extra tokens the brand needs, such as `--color-highlight`.
- **Fonts.** If the site uses a licensed font (Adobe Fonts, a commercial foundry), substitute the closest Google font in `Layout.tsx` and note the substitution in the README. Don't embed the licensed font.
- **Media.** Don't download or re-host the site's images, video or logos. The template ships without media, and components fall back gracefully:
  - text wordmark instead of a logo;
  - brand gradient or code-drawn backdrop instead of hero media.

  Authors add real media later. Use placeholder values such as `"<hero video>"` in the content plan to mark where it goes.

## Component layout

The Williams Lea app (`examples/kit-nextjs-williams-lea/src/components/wl-*`) is the reference implementation. Copy its patterns, not its brand.

```
src/components/
  ac-hero/
    AcHero.tsx            # variants as named exports: Default, Article, ...
    ac-hero.props.ts      # props/types sidecar (excluded from the component map)
  atoms/ac/               # shared pieces (Eyebrow, ArrowLink, SectionHeading, cards)
    ac.props.ts           #   shared field types, e.g. AcSectionProps<TExtra>
```

- **Naming:** directories are kebab-case with the kit prefix (`ac-hero`), components PascalCase (`AcHero`). The rendering `component` value in the kit config must equal that name.
- **Atoms:** `src/components/atoms/**` is excluded from the component map in `sitecore.cli.config.ts`. Put non-rendering building blocks there so they don't register as components.
- **Component map:** run `npm run sitecore-tools:generate-map` after adding or renaming components. Check that `.sitecore/component-map.ts` lists every new component and no `*.props` sidecars.

## Component rules

- Read the datasource with `getDatasource(fields)` and `getFieldValue(...)` from `@/lib/component-props`.
  - The fields arrive as `fields.data.datasource.<alias>.jsonValue` because of the `field(name:)` aliases.
  - Return `<NoDataFallback componentName="…" />` when there is no datasource.
- `page.mode.isEditing` (from the `page` prop or `useSitecore()`):
  - Render the Sitecore field components (`Text`, `RichText`, `Link`, `ImageWrapper`) even when a field is empty, so authors can fill it.
  - Disable sticky, animated or collapsed behaviour that hides content, for example tabs with `forceMount`.
  - Skip structured-data output.
- **Variants:** each named export is a Headless Variant, selected by name. `Default` is always required.
- **Reduced motion:** use the existing `useMediaQuery('(prefers-reduced-motion: reduce)')` hook rather than reading `matchMedia` and calling `setState` inside an effect. The React Compiler lint rule `react-hooks/set-state-in-effect` rejects the latter.
- **Interactive components:** add `'use client'`, ARIA attributes, Escape and outside-click handling for menus, and keyboard support for tabs and accordions.
- **Structured data:** FAQ-style components should use the existing JSON-LD helpers (for example `generateFAQPageSchema`).

## Tests

- Put tests in `src/__tests__/components/<prefix>/`, with one shared `<prefix>.mocks.tsx`. Load the mocks lazily:

  ```ts
  jest.mock('@sitecore-content-sdk/nextjs', () => jest.requireActual('./ac.mocks').sdkMock);
  ```

  `require()` inside `jest.mock` fails the `no-require-imports` lint rule.
- `jest.setup` only mocks `lucide-react`'s `Image`. Mock `lucide-react` with a `Proxy` that returns a stub for any icon name.
- Cover each component with a full datasource, with no datasource (fallback), in editing mode, and in each variant.
- Run `npm test`, `npx tsc --noEmit`, and `npx eslint` on the new files. The article starter's own code has lint findings, which the copy inherits. Report only new problems and don't fix inherited ones unless asked.

## Known repo issues

These came up while building Williams Lea. Check for them before blaming your own changes:

- **Lockfiles out of sync** with `package.json` make `npm ci` fail, and the deploy with it. Fix with `npm install --package-lock-only` in the affected example.
- **ESLint crash** "Converting circular structure to JSON" comes from `FlatCompat` with `eslint-config-next` 16. Fix it by importing the flat configs directly:

  ```js
  import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
  import nextTypescript from 'eslint-config-next/typescript';
  ```

  Then spread `...nextCoreWebVitals, ...nextTypescript`.
