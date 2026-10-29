#!/usr/bin/env node
/**
 * Generates Sitecore Content Serialization (SCS) YAML for the Williams Lea templates and
 * JSON renderings into /authoring/items/williams-lea. IDs are derived from item paths, so
 * re-running the script is idempotent and only produces diffs for real spec changes.
 *
 * Usage: node scripts/generate-sitecore-items.mjs
 * Then push with: dotnet sitecore ser push -i Project.williams-lea
 */
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../authoring/items/williams-lea');
const TIMESTAMP = '20261029T000000Z';

// Well-known Sitecore IDs
const T = {
  template: 'ab86861a-6030-46c5-b394-e8f99e8b87db',
  templateSection: 'e269fbb5-3750-427a-9149-7aa950b49301',
  templateField: '455a3e98-a627-4b40-8035-e683a0331ac7',
  templateFolder: '0437fee2-44c9-46a6-abe9-28858d9fee8c',
  renderingFolder: '7ee0975b-0698-493e-b3a2-0b2ef33d0522',
  jsonRendering: '04646a89-996f-4ee7-878a-ffdbf1f0ef0d',
  standardTemplate: '1930bbeb-7805-471a-a3be-4858ac7cf696',
};
const F = {
  type: 'ab162cc0-dc80-4abf-8871-998ee5d7ba32',
  source: '1eb8ae32-e190-44a6-968d-ed904c794ebf',
  sortorder: 'ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e',
  baseTemplate: '12c33f3f-86c5-43a5-aeb4-5598cec45116',
  standardValues: 'f7d48a55-2158-4f02-9356-756654404f73',
  masters: '1172f251-dad4-4efb-a329-0c63500e4f1e',
  icon: '06d5295c-ed2f-4a54-9bf2-26228d113318',
  displayName: 'b5e02ad9-d56f-4c41-a065-a133db87bdeb',
  fieldTitle: '19a69332-a23e-4e70-8d16-b2640cb24cc8',
  created: '25bed78c-4957-4165-998a-ca1b52f67497',
  componentName: '037fe404-dd19-4bf7-8e30-4dadf68b27b0',
  componentQuery: '17bb046a-a32a-41b3-8315-81217947611b',
  datasourceTemplate: '1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f',
  datasourceLocation: 'b5b27af1-25ef-405c-87ce-369b3a004016',
  parametersTemplate: 'a77e8568-1ab3-44f1-a664-b7c37ec7810d',
  canSelectPage: 'a3411ff6-c978-40aa-b059-a49b9ca2209b',
  otherProperties: 'e829c217-5e94-4306-9c48-2634b094fdc2',
};
// Rendering-parameter bases shared by the CCL renderings (styling, grid, base parameters).
const SXA_PARAMETER_BASES = [
  '8ca06d6a-b353-44e8-bc31-b528c7306971',
  '44a022db-56d3-419a-b43b-e27e4d8e9c41',
  '5c74e985-e055-43ff-b28c-db6c6a6450a2',
];

const PROJECT_TEMPLATES = '825b30b4-b40b-422e-9920-23a1b6bda89c'; // /sitecore/templates/Project
const PROJECT_RENDERINGS = '1995806f-0a84-42b5-93b0-88f0e2ff872c'; // /sitecore/layout/Renderings/Project
const TEMPLATES_PATH = '/sitecore/templates/Project/williams-lea';
const RENDERINGS_PATH = '/sitecore/layout/Renderings/Project/williams-lea';

const id = (path) => {
  const h = createHash('md5').update(`williams-lea:${path.toLowerCase()}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const braced = (guid) => `{${guid.toUpperCase()}}`;

// ---------------------------------------------------------------------------
// Template spec
// ---------------------------------------------------------------------------
const SECTION_HEADING = '_WL Section Heading';
const tpl = (name) => `${TEMPLATES_PATH}/Components/${name}`;

const TEMPLATES = [
  {
    name: SECTION_HEADING,
    icon: 'Office/32x32/text_bold.png',
    fields: [
      ['eyebrow', 'Single-Line Text'],
      ['heading', 'Single-Line Text'],
      ['subheading', 'Multi-Line Text'],
      ['body', 'Rich Text'],
      ['link', 'General Link'],
    ],
  },
  { name: 'WL Link Item', icon: 'Office/32x32/link.png', fields: [['link', 'General Link']] },
  {
    name: 'WL Link Group',
    icon: 'Office/32x32/links.png',
    fields: [
      ['title', 'Single-Line Text'],
      ['description', 'Rich Text'],
      ['tagline', 'Single-Line Text'],
      ['link', 'General Link'],
    ],
    insert: ['WL Link Item'],
  },
  {
    name: 'WL Nav Item',
    icon: 'Office/32x32/window_dialog.png',
    bases: ['WL Link Group'],
    fields: [['isUtility', 'Checkbox']],
    insert: ['WL Link Item'],
  },
  {
    name: 'WL Header',
    icon: 'Office/32x32/window_split_ver.png',
    fields: [
      ['logo', 'Image'],
      ['link', 'General Link'],
    ],
    insert: ['WL Nav Item'],
  },
  {
    name: 'WL Footer',
    icon: 'Office/32x32/window_split_hor.png',
    fields: [
      ['logo', 'Image'],
      ['heading', 'Single-Line Text'],
      ['link', 'General Link'],
      ['copyright', 'Single-Line Text'],
      ['linkedinLink', 'General Link'],
      ['xLink', 'General Link'],
      ['facebookLink', 'General Link'],
    ],
    insert: ['WL Link Item'],
  },
  {
    name: 'WL Hero Video',
    icon: 'Office/32x32/movie.png',
    bases: [SECTION_HEADING],
    fields: [
      ['video', 'General Link'],
      ['image', 'Image'],
    ],
  },
  { name: 'WL Service Stack', icon: 'Office/32x32/cards.png', bases: [SECTION_HEADING], insert: ['WL Link Group'] },
  { name: 'WL Solutions Grid', icon: 'Office/32x32/table.png', bases: [SECTION_HEADING], insert: ['WL Link Item'] },
  {
    name: 'WL Industries',
    icon: 'Office/32x32/factory.png',
    bases: [SECTION_HEADING],
    fields: [['image', 'Image']],
    insert: ['WL Link Item'],
  },
  { name: 'WL Tabs', icon: 'Office/32x32/tabs.png', bases: [SECTION_HEADING], insert: ['WL Link Group'] },
  {
    name: 'WL Insight Cards',
    icon: 'Office/32x32/newspaper.png',
    bases: [SECTION_HEADING],
    fields: [['items', 'Treelist', 'query:$home']],
  },
  {
    name: 'WL Insight Listing',
    icon: 'Office/32x32/list.png',
    bases: [SECTION_HEADING],
    fields: [['source', 'Droptree', 'query:$home']],
  },
  { name: 'WL CTA Band', icon: 'Office/32x32/megaphone.png', bases: [SECTION_HEADING], fields: [['image', 'Image']] },
  {
    name: 'WL Related Services',
    icon: 'Office/32x32/elements_tree.png',
    bases: [SECTION_HEADING],
    insert: ['WL Link Group'],
  },
  {
    name: 'WL FAQ Item',
    icon: 'Office/32x32/question_and_answer.png',
    fields: [
      ['question', 'Single-Line Text'],
      ['answer', 'Rich Text'],
    ],
  },
  { name: 'WL FAQ', icon: 'Office/32x32/help.png', bases: [SECTION_HEADING], insert: ['WL FAQ Item'] },
  {
    name: 'WL Rendering Parameters',
    icon: 'Office/32x32/gear.png',
    rawBases: SXA_PARAMETER_BASES,
    fields: [['pageSize', 'Integer']],
  },
];

const DATASOURCE_ROOTS = [
  'WL Header',
  'WL Footer',
  'WL Hero Video',
  'WL Service Stack',
  'WL Solutions Grid',
  'WL Industries',
  'WL Tabs',
  'WL Insight Cards',
  'WL Insight Listing',
  'WL CTA Band',
  'WL Related Services',
  'WL FAQ',
];
TEMPLATES.push({
  name: 'WL Data Folder',
  icon: 'Office/32x32/folder_window.png',
  insert: [...DATASOURCE_ROOTS, 'WL Data Folder'],
});

// ---------------------------------------------------------------------------
// Integrated GraphQL. Fields are selected with field(name:) aliases so queries do not
// depend on generated GraphQL type names.
// ---------------------------------------------------------------------------
const f = (...names) => names.map((n) => `${n}: field(name: "${n}") { jsonValue }`).join('\n');
const HEADING = f('eyebrow', 'heading', 'subheading', 'body', 'link');
const LINK_ITEMS = `children(first: 100) {\n  results {\n    id\n    ${f('link')}\n  }\n}`;
const LINK_GROUPS = `children(first: 100) {
  results {
    id
    ${f('title', 'description', 'tagline', 'link', 'isUtility').replace(/\n/g, '\n    ')}
    ${LINK_ITEMS.replace(/\n/g, '\n    ')}
  }
}`;
const PAGE_CARD = `id\nurl { path }\n${f('pageTitle', 'pageSummary', 'pageThumbnail', 'pageDisplayDate', 'pageReadTime')}`;

const indent = (text, depth) => text.replace(/\n/g, `\n${' '.repeat(depth)}`);
const datasourceQuery = (name, body) => `query ${name}($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    ${indent(body, 4)}
  }
}
`;

const RENDERINGS = [
  {
    name: 'WL Header',
    component: 'WlHeader',
    icon: 'Office/32x32/window_split_ver.png',
    datasource: 'WL Header',
    query: datasourceQuery('WlHeader', `${f('logo', 'link')}\n${LINK_GROUPS}`),
  },
  {
    name: 'WL Footer',
    component: 'WlFooter',
    icon: 'Office/32x32/window_split_hor.png',
    datasource: 'WL Footer',
    query: datasourceQuery(
      'WlFooter',
      `${f('logo', 'heading', 'link', 'copyright', 'linkedinLink', 'xLink', 'facebookLink')}\n${LINK_ITEMS}`
    ),
  },
  {
    name: 'WL Hero Video',
    component: 'WlHeroVideo',
    icon: 'Office/32x32/movie.png',
    datasource: 'WL Hero Video',
    query: datasourceQuery('WlHeroVideo', `${HEADING}\n${f('video', 'image')}`),
  },
  {
    name: 'WL Service Stack',
    component: 'WlServiceStack',
    icon: 'Office/32x32/cards.png',
    datasource: 'WL Service Stack',
    query: datasourceQuery('WlServiceStack', `${HEADING}\n${LINK_GROUPS}`),
  },
  {
    name: 'WL Solutions Grid',
    component: 'WlSolutionsGrid',
    icon: 'Office/32x32/table.png',
    datasource: 'WL Solutions Grid',
    query: datasourceQuery('WlSolutionsGrid', `${HEADING}\n${LINK_ITEMS}`),
  },
  {
    name: 'WL Industries',
    component: 'WlIndustries',
    icon: 'Office/32x32/factory.png',
    datasource: 'WL Industries',
    query: datasourceQuery('WlIndustries', `${HEADING}\n${f('image')}\n${LINK_ITEMS}`),
  },
  {
    name: 'WL Tabs',
    component: 'WlTabs',
    icon: 'Office/32x32/tabs.png',
    datasource: 'WL Tabs',
    query: datasourceQuery('WlTabs', `${HEADING}\n${LINK_GROUPS}`),
  },
  {
    name: 'WL Insight Cards',
    component: 'WlInsightCards',
    icon: 'Office/32x32/newspaper.png',
    datasource: 'WL Insight Cards',
    query: datasourceQuery(
      'WlInsightCards',
      `${HEADING}\nitems: field(name: "items") {\n  ... on MultilistField {\n    targetItems {\n      ${indent(PAGE_CARD, 6)}\n    }\n  }\n}`
    ),
  },
  {
    name: 'WL Insight Listing',
    component: 'WlInsightListing',
    icon: 'Office/32x32/list.png',
    datasource: 'WL Insight Listing',
    query: datasourceQuery(
      'WlInsightListing',
      `${HEADING}\nsource: field(name: "source") {\n  ... on LookupField {\n    targetItem {\n      children(hasLayout: true, first: 100) {\n        results {\n          ${indent(PAGE_CARD, 10)}\n        }\n      }\n    }\n  }\n}`
    ),
  },
  {
    name: 'WL Page Banner',
    component: 'WlPageBanner',
    icon: 'Office/32x32/window_size.png',
    canSelectPage: true,
    query: `query WlPageBanner($contextItem: String!, $language: String!) {
  externalFields: item(path: $contextItem, language: $language) {
    ${indent(f('pageTitle', 'pageHeaderTitle', 'pageSubtitle', 'pageSummary', 'pageThumbnail', 'pageDisplayDate', 'pageReadTime'), 4)}
    parent {
      ${f('pageTitle')}
    }
  }
}
`,
  },
  {
    name: 'WL CTA Band',
    component: 'WlCtaBand',
    icon: 'Office/32x32/megaphone.png',
    datasource: 'WL CTA Band',
    query: datasourceQuery('WlCtaBand', `${HEADING}\n${f('image')}`),
  },
  {
    name: 'WL Related Services',
    component: 'WlRelatedServices',
    icon: 'Office/32x32/elements_tree.png',
    datasource: 'WL Related Services',
    query: datasourceQuery('WlRelatedServices', `${HEADING}\n${LINK_GROUPS}`),
  },
  {
    name: 'WL FAQ',
    component: 'WlFaq',
    icon: 'Office/32x32/help.png',
    datasource: 'WL FAQ',
    query: datasourceQuery(
      'WlFaq',
      `${HEADING}\nchildren(first: 100) {\n  results {\n    id\n    ${indent(f('question', 'answer'), 4)}\n  }\n}`
    ),
  },
];

// ---------------------------------------------------------------------------
// YAML emitter
// ---------------------------------------------------------------------------
const yamlValue = (value, depth) => {
  const str = String(value);
  if (str.includes('\n')) {
    const pad = ' '.repeat(depth + 2);
    return `|\n${str.replace(/\n$/, '').split('\n').map((line) => (line ? pad + line : '')).join('\n')}\n`;
  }
  return `${JSON.stringify(str)}\n`;
};
// SCS writes fields ordered by ID; matching that keeps `ser pull` from churning diffs.
const fieldList = (fields, depth) =>
  [...fields]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([fid, hint, value]) =>
        `${' '.repeat(depth)}- ID: "${fid}"\n${' '.repeat(depth)}  Hint: ${hint}\n${' '.repeat(depth)}  Value: ${yamlValue(value, depth + 2)}`
    )
    .join('');

const files = [];
const item = ({ include, relPath, itemId, parent, template, path, shared = [], unversioned = [] }) => {
  let yml = `---\nID: "${itemId}"\nParent: "${parent}"\nTemplate: "${template}"\nPath: "${path}"\n`;
  if (shared.length) yml += `SharedFields:\n${fieldList(shared, 0)}`;
  yml += 'Languages:\n- Language: en\n';
  if (unversioned.length) yml += `  Fields:\n${fieldList(unversioned, 2)}`;
  yml += `  Versions:\n  - Version: 1\n    Fields:\n${fieldList([[F.created, '__Created', TIMESTAMP]], 4)}`;
  files.push({ file: join(ROOT, 'items', include, `${relPath}.yml`), yml });
};

const folder = (include, rootPath, path, template) => {
  const name = path.split('/').pop();
  const parentPath = path.slice(0, path.lastIndexOf('/'));
  item({
    include,
    relPath: path.slice(rootPath.lastIndexOf('/') + 1),
    itemId: id(path),
    parent: path === rootPath ? (include === 'wl.templates' ? PROJECT_TEMPLATES : PROJECT_RENDERINGS) : id(parentPath),
    template,
    path,
    unversioned: [[F.displayName, '__Display name', name]],
  });
};

// Templates
folder('wl.templates', TEMPLATES_PATH, TEMPLATES_PATH, T.templateFolder);
folder('wl.templates', TEMPLATES_PATH, `${TEMPLATES_PATH}/Components`, T.templateFolder);
for (const t of TEMPLATES) {
  const path = tpl(t.name);
  const tid = id(path);
  const svId = id(`${path}/__Standard Values`);
  const bases = [...(t.bases ?? []).map((b) => id(tpl(b))), ...(t.rawBases ?? [])];
  if (!bases.length || t.bases) bases.push(T.standardTemplate);
  const rel = path.slice(TEMPLATES_PATH.lastIndexOf('/') + 1);

  item({
    include: 'wl.templates',
    relPath: rel,
    itemId: tid,
    parent: id(`${TEMPLATES_PATH}/Components`),
    template: T.template,
    path,
    shared: [
      [F.icon, '__Icon', t.icon],
      [F.baseTemplate, '__Base template', [...new Set(bases)].map(braced).join('\n') + '\n'],
      [F.standardValues, '__Standard values', braced(svId)],
    ],
  });
  item({
    include: 'wl.templates',
    relPath: `${rel}/__Standard Values`,
    itemId: svId,
    parent: tid,
    template: tid,
    path: `${path}/__Standard Values`,
    shared: t.insert?.length ? [[F.masters, '__Masters', t.insert.map((n) => braced(id(tpl(n)))).join('\n') + '\n']] : [],
  });

  if (t.fields?.length) {
    const sectionPath = `${path}/Content`;
    item({
      include: 'wl.templates',
      relPath: `${rel}/Content`,
      itemId: id(sectionPath),
      parent: tid,
      template: T.templateSection,
      path: sectionPath,
    });
    t.fields.forEach(([fname, ftype, fsource], i) => {
      const fieldPath = `${sectionPath}/${fname}`;
      const shared = [
        [F.type, 'Type', ftype],
        [F.sortorder, '__Sortorder', (i + 1) * 100],
      ];
      if (fsource) shared.push([F.source, 'Source', fsource]);
      item({
        include: 'wl.templates',
        relPath: `${rel}/Content/${fname}`,
        itemId: id(fieldPath),
        parent: id(sectionPath),
        template: T.templateField,
        path: fieldPath,
        shared,
        unversioned: [[F.fieldTitle, 'Title', fname.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())]],
      });
    });
  }
}

// Renderings
folder('wl.renderings', RENDERINGS_PATH, RENDERINGS_PATH, T.renderingFolder);
const PARAMS_ID = braced(id(tpl('WL Rendering Parameters')));
RENDERINGS.forEach((r, i) => {
  const path = `${RENDERINGS_PATH}/${r.name}`;
  const shared = [
    [F.componentName, 'componentName', r.component],
    [F.icon, '__Icon', r.icon],
    [F.componentQuery, 'ComponentQuery', r.query],
    [F.parametersTemplate, 'Parameters Template', PARAMS_ID],
    [F.sortorder, '__Sortorder', (i + 1) * 100],
    [F.otherProperties, 'OtherProperties', 'IsRenderingsWithDynamicPlaceholders=true'],
  ];
  if (r.datasource) {
    shared.push(
      [F.datasourceTemplate, 'Datasource Template', tpl(r.datasource)],
      [
        F.datasourceLocation,
        'Datasource Location',
        "query:$site/*[@@name='Data']/*[@@templatename='WL Data Folder']|query:$site/*[@@name='Data']",
      ]
    );
  }
  if (r.canSelectPage) shared.push([F.canSelectPage, 'Can select Page as a data source', 1]);
  item({
    include: 'wl.renderings',
    relPath: `williams-lea/${r.name}`,
    itemId: id(path),
    parent: id(RENDERINGS_PATH),
    template: T.jsonRendering,
    path,
    shared,
  });
});

// Module file
const moduleJson = {
  $schema: '../../../.sitecore/schemas/ModuleFile.schema.json',
  namespace: 'Project.williams-lea',
  items: {
    includes: [
      { name: 'wl.templates', path: TEMPLATES_PATH, allowedPushOperations: 'CreateUpdateAndDelete' },
      { name: 'wl.renderings', path: RENDERINGS_PATH, allowedPushOperations: 'CreateUpdateAndDelete' },
    ],
  },
};

rmSync(join(ROOT, 'items'), { recursive: true, force: true });
for (const { file, yml } of files) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, yml, 'utf8');
}
writeFileSync(join(ROOT, 'williams-lea.module.json'), `${JSON.stringify(moduleJson, null, 4)}\n`, 'utf8');
console.log(`Wrote ${files.length} items to ${ROOT}`);
