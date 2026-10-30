#!/usr/bin/env node
/**
 * Generates Sitecore Content Serialization (SCS) YAML for the Williams Lea templates, JSON
 * renderings and "Williams Lea" site template into /authoring/items/williams-lea. The site
 * template's pages and datasources come from content/site-content.json. IDs are derived from
 * item paths, so re-running the script is idempotent and only produces diffs for real changes.
 *
 * Usage: node scripts/generate-sitecore-items.mjs
 * Then push with: dotnet sitecore ser push -i Project.williams-lea
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../authoring/items/williams-lea",
);
const TIMESTAMP = "20261029T000000Z";

// Well-known Sitecore IDs
const T = {
    template: "ab86861a-6030-46c5-b394-e8f99e8b87db",
    templateSection: "e269fbb5-3750-427a-9149-7aa950b49301",
    templateField: "455a3e98-a627-4b40-8035-e683a0331ac7",
    templateFolder: "0437fee2-44c9-46a6-abe9-28858d9fee8c",
    renderingFolder: "7ee0975b-0698-493e-b3a2-0b2ef33d0522",
    jsonRendering: "04646a89-996f-4ee7-878a-ffdbf1f0ef0d",
    standardTemplate: "1930bbeb-7805-471a-a3be-4858ac7cf696",
};
const F = {
    type: "ab162cc0-dc80-4abf-8871-998ee5d7ba32",
    source: "1eb8ae32-e190-44a6-968d-ed904c794ebf",
    sortorder: "ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e",
    baseTemplate: "12c33f3f-86c5-43a5-aeb4-5598cec45116",
    standardValues: "f7d48a55-2158-4f02-9356-756654404f73",
    masters: "1172f251-dad4-4efb-a329-0c63500e4f1e",
    icon: "06d5295c-ed2f-4a54-9bf2-26228d113318",
    displayName: "b5e02ad9-d56f-4c41-a065-a133db87bdeb",
    fieldTitle: "19a69332-a23e-4e70-8d16-b2640cb24cc8",
    created: "25bed78c-4957-4165-998a-ca1b52f67497",
    componentName: "037fe404-dd19-4bf7-8e30-4dadf68b27b0",
    componentQuery: "17bb046a-a32a-41b3-8315-81217947611b",
    datasourceTemplate: "1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f",
    datasourceLocation: "b5b27af1-25ef-405c-87ce-369b3a004016",
    parametersTemplate: "a77e8568-1ab3-44f1-a664-b7c37ec7810d",
    canSelectPage: "a3411ff6-c978-40aa-b059-a49b9ca2209b",
    otherProperties: "e829c217-5e94-4306-9c48-2634b094fdc2",
};
// Rendering-parameter bases shared by the CCL renderings (styling, grid, base parameters).
const SXA_PARAMETER_BASES = [
    "8ca06d6a-b353-44e8-bc31-b528c7306971",
    "44a022db-56d3-419a-b43b-e27e4d8e9c41",
    "5c74e985-e055-43ff-b28c-db6c6a6450a2",
];

const PROJECT_TEMPLATES = "825b30b4-b40b-422e-9920-23a1b6bda89c"; // /sitecore/templates/Project
const PROJECT_RENDERINGS = "1995806f-0a84-42b5-93b0-88f0e2ff872c"; // /sitecore/layout/Renderings/Project
const TEMPLATES_PATH = "/sitecore/templates/Project/williams-lea";
const RENDERINGS_PATH = "/sitecore/layout/Renderings/Project/williams-lea";

const id = (path) => {
    const h = createHash("md5")
        .update(`williams-lea:${path.toLowerCase()}`)
        .digest("hex");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const braced = (guid) => `{${guid.toUpperCase()}}`;

// ---------------------------------------------------------------------------
// Template spec
// ---------------------------------------------------------------------------
const SECTION_HEADING = "_WL Section Heading";
const tpl = (name) => `${TEMPLATES_PATH}/Components/${name}`;

const TEMPLATES = [
    {
        name: SECTION_HEADING,
        icon: "Office/32x32/text_bold.png",
        fields: [
            ["eyebrow", "Single-Line Text"],
            ["heading", "Single-Line Text"],
            ["subheading", "Multi-Line Text"],
            ["body", "Rich Text"],
            ["link", "General Link"],
        ],
    },
    {
        name: "WL Link Item",
        icon: "Office/32x32/link.png",
        fields: [["link", "General Link"]],
    },
    {
        name: "WL Link Group",
        icon: "Office/32x32/links.png",
        fields: [
            ["title", "Single-Line Text"],
            ["description", "Rich Text"],
            ["tagline", "Single-Line Text"],
            ["link", "General Link"],
        ],
        insert: ["WL Link Item"],
    },
    {
        name: "WL Nav Item",
        icon: "Office/32x32/window_dialog.png",
        bases: ["WL Link Group"],
        fields: [["isUtility", "Checkbox"]],
        insert: ["WL Link Item"],
    },
    {
        name: "WL Header",
        icon: "Office/32x32/window_split_ver.png",
        fields: [
            ["logo", "Image"],
            ["link", "General Link"],
        ],
        insert: ["WL Nav Item"],
    },
    {
        name: "WL Footer",
        icon: "Office/32x32/window_split_hor.png",
        fields: [
            ["logo", "Image"],
            ["heading", "Single-Line Text"],
            ["link", "General Link"],
            ["copyright", "Single-Line Text"],
            ["linkedinLink", "General Link"],
            ["xLink", "General Link"],
            ["facebookLink", "General Link"],
        ],
        insert: ["WL Link Item"],
    },
    {
        name: "WL Hero Video",
        icon: "Office/32x32/movie.png",
        bases: [SECTION_HEADING],
        fields: [
            ["video", "General Link"],
            ["image", "Image"],
        ],
    },
    {
        name: "WL Service Stack",
        icon: "Office/32x32/cards.png",
        bases: [SECTION_HEADING],
        insert: ["WL Link Group"],
    },
    {
        name: "WL Solutions Grid",
        icon: "Office/32x32/table.png",
        bases: [SECTION_HEADING],
        insert: ["WL Link Item"],
    },
    {
        name: "WL Industries",
        icon: "Office/32x32/factory.png",
        bases: [SECTION_HEADING],
        fields: [["image", "Image"]],
        insert: ["WL Link Item"],
    },
    {
        name: "WL Tabs",
        icon: "Office/32x32/tabs.png",
        bases: [SECTION_HEADING],
        insert: ["WL Link Group"],
    },
    {
        name: "WL Insight Cards",
        icon: "Office/32x32/newspaper.png",
        bases: [SECTION_HEADING],
        fields: [["items", "Treelist", "query:$home"]],
    },
    {
        name: "WL Insight Listing",
        icon: "Office/32x32/list.png",
        bases: [SECTION_HEADING],
        fields: [["source", "Droptree", "query:$home"]],
    },
    {
        name: "WL CTA Band",
        icon: "Office/32x32/megaphone.png",
        bases: [SECTION_HEADING],
        fields: [["image", "Image"]],
    },
    {
        name: "WL Related Services",
        icon: "Office/32x32/elements_tree.png",
        bases: [SECTION_HEADING],
        insert: ["WL Link Group"],
    },
    {
        name: "WL FAQ Item",
        icon: "Office/32x32/question_and_answer.png",
        fields: [
            ["question", "Single-Line Text"],
            ["answer", "Rich Text"],
        ],
    },
    {
        name: "WL FAQ",
        icon: "Office/32x32/help.png",
        bases: [SECTION_HEADING],
        insert: ["WL FAQ Item"],
    },
    {
        name: "WL Rendering Parameters",
        icon: "Office/32x32/gear.png",
        rawBases: SXA_PARAMETER_BASES,
        fields: [["pageSize", "Integer"]],
    },
];

const DATASOURCE_ROOTS = [
    "WL Header",
    "WL Footer",
    "WL Hero Video",
    "WL Service Stack",
    "WL Solutions Grid",
    "WL Industries",
    "WL Tabs",
    "WL Insight Cards",
    "WL Insight Listing",
    "WL CTA Band",
    "WL Related Services",
    "WL FAQ",
];
TEMPLATES.push({
    name: "WL Data Folder",
    icon: "Office/32x32/folder_window.png",
    insert: [...DATASOURCE_ROOTS, "WL Data Folder"],
});

// ---------------------------------------------------------------------------
// Integrated GraphQL. Fields are selected with field(name:) aliases so queries do not
// depend on generated GraphQL type names.
// ---------------------------------------------------------------------------
const f = (...names) =>
    names.map((n) => `${n}: field(name: "${n}") { jsonValue }`).join("\n");
const HEADING = f("eyebrow", "heading", "subheading", "body", "link");
const LINK_ITEMS = `children(first: 100) {\n  results {\n    id\n    ${f("link")}\n  }\n}`;
const LINK_GROUPS = `children(first: 100) {
  results {
    id
    ${f("title", "description", "tagline", "link", "isUtility").replace(/\n/g, "\n    ")}
    ${LINK_ITEMS.replace(/\n/g, "\n    ")}
  }
}`;
const PAGE_CARD = `id\nurl { path }\n${f("pageTitle", "pageSummary", "pageThumbnail", "pageDisplayDate", "pageReadTime")}`;

const indent = (text, depth) => text.replace(/\n/g, `\n${" ".repeat(depth)}`);
const datasourceQuery = (
    name,
    body,
) => `query ${name}($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    ${indent(body, 4)}
  }
}
`;

const RENDERINGS = [
    {
        name: "WL Header",
        component: "WlHeader",
        icon: "Office/32x32/window_split_ver.png",
        datasource: "WL Header",
        query: datasourceQuery(
            "WlHeader",
            `${f("logo", "link")}\n${LINK_GROUPS}`,
        ),
    },
    {
        name: "WL Footer",
        component: "WlFooter",
        icon: "Office/32x32/window_split_hor.png",
        datasource: "WL Footer",
        query: datasourceQuery(
            "WlFooter",
            `${f("logo", "heading", "link", "copyright", "linkedinLink", "xLink", "facebookLink")}\n${LINK_ITEMS}`,
        ),
    },
    {
        name: "WL Hero Video",
        component: "WlHeroVideo",
        icon: "Office/32x32/movie.png",
        datasource: "WL Hero Video",
        query: datasourceQuery(
            "WlHeroVideo",
            `${HEADING}\n${f("video", "image")}`,
        ),
    },
    {
        name: "WL Service Stack",
        component: "WlServiceStack",
        icon: "Office/32x32/cards.png",
        datasource: "WL Service Stack",
        query: datasourceQuery("WlServiceStack", `${HEADING}\n${LINK_GROUPS}`),
    },
    {
        name: "WL Solutions Grid",
        component: "WlSolutionsGrid",
        icon: "Office/32x32/table.png",
        datasource: "WL Solutions Grid",
        query: datasourceQuery("WlSolutionsGrid", `${HEADING}\n${LINK_ITEMS}`),
    },
    {
        name: "WL Industries",
        component: "WlIndustries",
        icon: "Office/32x32/factory.png",
        datasource: "WL Industries",
        query: datasourceQuery(
            "WlIndustries",
            `${HEADING}\n${f("image")}\n${LINK_ITEMS}`,
        ),
    },
    {
        name: "WL Tabs",
        component: "WlTabs",
        icon: "Office/32x32/tabs.png",
        datasource: "WL Tabs",
        query: datasourceQuery("WlTabs", `${HEADING}\n${LINK_GROUPS}`),
    },
    {
        name: "WL Insight Cards",
        component: "WlInsightCards",
        icon: "Office/32x32/newspaper.png",
        datasource: "WL Insight Cards",
        query: datasourceQuery(
            "WlInsightCards",
            `${HEADING}\nitems: field(name: "items") {\n  ... on MultilistField {\n    targetItems {\n      ${indent(PAGE_CARD, 6)}\n    }\n  }\n}`,
        ),
    },
    {
        name: "WL Insight Listing",
        component: "WlInsightListing",
        icon: "Office/32x32/list.png",
        datasource: "WL Insight Listing",
        query: datasourceQuery(
            "WlInsightListing",
            `${HEADING}\nsource: field(name: "source") {\n  ... on LookupField {\n    targetItem {\n      children(hasLayout: true, first: 100) {\n        results {\n          ${indent(PAGE_CARD, 10)}\n        }\n      }\n    }\n  }\n}`,
        ),
    },
    {
        name: "WL Page Banner",
        component: "WlPageBanner",
        icon: "Office/32x32/window_size.png",
        canSelectPage: true,
        query: `query WlPageBanner($contextItem: String!, $language: String!) {
  externalFields: item(path: $contextItem, language: $language) {
    ${indent(f("pageTitle", "pageHeaderTitle", "pageSubtitle", "pageSummary", "pageThumbnail", "pageDisplayDate", "pageReadTime"), 4)}
    parent {
      ${f("pageTitle")}
    }
  }
}
`,
    },
    {
        name: "WL CTA Band",
        component: "WlCtaBand",
        icon: "Office/32x32/megaphone.png",
        datasource: "WL CTA Band",
        query: datasourceQuery("WlCtaBand", `${HEADING}\n${f("image")}`),
    },
    {
        name: "WL Related Services",
        component: "WlRelatedServices",
        icon: "Office/32x32/elements_tree.png",
        datasource: "WL Related Services",
        query: datasourceQuery(
            "WlRelatedServices",
            `${HEADING}\n${LINK_GROUPS}`,
        ),
    },
    {
        name: "WL FAQ",
        component: "WlFaq",
        icon: "Office/32x32/help.png",
        datasource: "WL FAQ",
        query: datasourceQuery(
            "WlFaq",
            `${HEADING}\nchildren(first: 100) {\n  results {\n    id\n    ${indent(f("question", "answer"), 4)}\n  }\n}`,
        ),
    },
];

// ---------------------------------------------------------------------------
// YAML emitter
// ---------------------------------------------------------------------------
const yamlValue = (value, depth) => {
    const str = String(value);
    if (str.includes("\n")) {
        const pad = " ".repeat(depth + 2);
        // SCS's YAML reader requires blank lines in a block value to keep the indentation.
        return `|\n${str
            .replace(/\n$/, "")
            .split("\n")
            .map((line) => pad + line)
            .join("\n")}\n`;
    }
    return `${JSON.stringify(str)}\n`;
};
// SCS writes fields ordered by ID; matching that keeps `ser pull` from churning diffs.
const fieldList = (fields, depth) =>
    [...fields]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fid, hint, value, blobId]) => {
            const pad = " ".repeat(depth);
            const blob = blobId ? `${pad}  BlobID: "${blobId}"\n` : "";
            return `${pad}- ID: "${fid}"\n${pad}  Hint: ${hint}\n${blob}${pad}  Value: ${yamlValue(value, depth + 2)}`;
        })
        .join("");

const files = [];
const item = ({
    include,
    relPath,
    itemId,
    parent,
    template,
    path,
    shared = [],
    unversioned = [],
    versioned = [],
}) => {
    let yml = `---\nID: "${itemId}"\nParent: "${parent}"\nTemplate: "${template}"\nPath: "${path}"\n`;
    if (shared.length) yml += `SharedFields:\n${fieldList(shared, 0)}`;
    yml += "Languages:\n- Language: en\n";
    if (unversioned.length) yml += `  Fields:\n${fieldList(unversioned, 2)}`;
    yml += `  Versions:\n  - Version: 1\n    Fields:\n${fieldList([[F.created, "__Created", TIMESTAMP], ...versioned], 4)}`;
    files.push({ file: join(ROOT, "items", include, `${relPath}.yml`), yml });
};

const folder = (include, rootPath, path, template) => {
    const name = path.split("/").pop();
    const parentPath = path.slice(0, path.lastIndexOf("/"));
    item({
        include,
        relPath: path.slice(rootPath.lastIndexOf("/") + 1),
        itemId: id(path),
        parent:
            path === rootPath
                ? include === "wl.templates"
                    ? PROJECT_TEMPLATES
                    : PROJECT_RENDERINGS
                : id(parentPath),
        template,
        path,
        unversioned: [[F.displayName, "__Display name", name]],
    });
};

// Templates
folder("wl.templates", TEMPLATES_PATH, TEMPLATES_PATH, T.templateFolder);
folder(
    "wl.templates",
    TEMPLATES_PATH,
    `${TEMPLATES_PATH}/Components`,
    T.templateFolder,
);
for (const t of TEMPLATES) {
    const path = tpl(t.name);
    const tid = id(path);
    const svId = id(`${path}/__Standard Values`);
    const bases = [
        ...(t.bases ?? []).map((b) => id(tpl(b))),
        ...(t.rawBases ?? []),
    ];
    if (!bases.length || t.bases) bases.push(T.standardTemplate);
    const rel = path.slice(TEMPLATES_PATH.lastIndexOf("/") + 1);

    item({
        include: "wl.templates",
        relPath: rel,
        itemId: tid,
        parent: id(`${TEMPLATES_PATH}/Components`),
        template: T.template,
        path,
        shared: [
            [F.icon, "__Icon", t.icon],
            [
                F.baseTemplate,
                "__Base template",
                [...new Set(bases)].map(braced).join("\n") + "\n",
            ],
            [F.standardValues, "__Standard values", braced(svId)],
        ],
    });
    item({
        include: "wl.templates",
        relPath: `${rel}/__Standard Values`,
        itemId: svId,
        parent: tid,
        template: tid,
        path: `${path}/__Standard Values`,
        shared: t.insert?.length
            ? [
                  [
                      F.masters,
                      "__Masters",
                      t.insert.map((n) => braced(id(tpl(n)))).join("\n") + "\n",
                  ],
              ]
            : [],
    });

    if (t.fields?.length) {
        const sectionPath = `${path}/Content`;
        item({
            include: "wl.templates",
            relPath: `${rel}/Content`,
            itemId: id(sectionPath),
            parent: tid,
            template: T.templateSection,
            path: sectionPath,
        });
        t.fields.forEach(([fname, ftype, fsource], i) => {
            const fieldPath = `${sectionPath}/${fname}`;
            const shared = [
                [F.type, "Type", ftype],
                [F.sortorder, "__Sortorder", (i + 1) * 100],
            ];
            if (fsource) shared.push([F.source, "Source", fsource]);
            item({
                include: "wl.templates",
                relPath: `${rel}/Content/${fname}`,
                itemId: id(fieldPath),
                parent: id(sectionPath),
                template: T.templateField,
                path: fieldPath,
                shared,
                unversioned: [
                    [
                        F.fieldTitle,
                        "Title",
                        fname
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (c) => c.toUpperCase()),
                    ],
                ],
            });
        });
    }
}

// Renderings
folder("wl.renderings", RENDERINGS_PATH, RENDERINGS_PATH, T.renderingFolder);
const PARAMS_ID = braced(id(tpl("WL Rendering Parameters")));
RENDERINGS.forEach((r, i) => {
    const path = `${RENDERINGS_PATH}/${r.name}`;
    const shared = [
        [F.componentName, "componentName", r.component],
        [F.icon, "__Icon", r.icon],
        [F.componentQuery, "ComponentQuery", r.query],
        [F.parametersTemplate, "Parameters Template", PARAMS_ID],
        [F.sortorder, "__Sortorder", (i + 1) * 100],
        [
            F.otherProperties,
            "OtherProperties",
            "IsRenderingsWithDynamicPlaceholders=true",
        ],
    ];
    if (r.datasource) {
        shared.push(
            [F.datasourceTemplate, "Datasource Template", tpl(r.datasource)],
            [
                F.datasourceLocation,
                "Datasource Location",
                "query:$site/*[@@name='Data']/*[@@templatename='WL Data Folder']|query:$site/*[@@name='Data']",
            ],
        );
    }
    if (r.canSelectPage)
        shared.push([F.canSelectPage, "Can select Page as a data source", 1]);
    item({
        include: "wl.renderings",
        relPath: `williams-lea/${r.name}`,
        itemId: id(path),
        parent: id(RENDERINGS_PATH),
        template: T.jsonRendering,
        path,
        shared,
    });
});

// ---------------------------------------------------------------------------
// Site template: the "Williams Lea" tile in the SitecoreAI Sites dashboard. Mirrors the
// click-click-launch kits: a Site Template item, a setup module of Add Item steps backed by
// branch templates, and SPE scripts that rebase page templates and resolve cross-item links.
// Branch content cannot hold real IDs for items that only exist once the site is created, so
// it carries tokens that the setup script resolves:
//   @@WL:/Home/Services@@                     -> ID of <site>/Home/Services
//   @@WLV:WL Page Banner/Article@@            -> URL-encoded ID of that headless variant
// ---------------------------------------------------------------------------
const CONTENT = JSON.parse(
    readFileSync(
        resolve(
            dirname(fileURLToPath(import.meta.url)),
            "../content/site-content.json",
        ),
        "utf8",
    ),
);
const THUMBNAIL = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "assets/site-template-thumbnail.png",
);

const BRANCHES_PATH = "/sitecore/templates/Branches/Project/williams-lea";
const SETTINGS_PATH = "/sitecore/system/Settings/Project/williams-lea";
const SPE_PATH =
    "/sitecore/system/Modules/PowerShell/Script Library/Williams Lea";
const MEDIA_PATH = "/sitecore/media library/Feature/williams-lea";
const ROOT_PARENTS = {
    "wl.branches": "a1f6469d-16e1-4a5f-9e49-1aad869a5d11", // /sitecore/templates/Branches/Project
    "wl.settings": "0af56f64-b5d7-473f-9497-1dc19265e494", // /sitecore/system/Settings/Project
    "wl.powershell": "a3572733-5062-43e9-a447-54698bc1c637", // SPE Script Library
    "wl.media": "aa12eeae-d925-4569-bc39-6092c745fc05", // /sitecore/media library/Feature
};
const S = {
    branchFolder: "85adbf5b-e836-4932-a333-fe0f9fa1ed1e",
    branch: "35e75c72-4985-4e09-88c3-0eac6cd1e64f",
    settingsFolder: "b4d86f9b-e917-4d68-978e-741361332174",
    folder: "a87a00b1-e6db-45ab-8b54-636fec3b5523",
    setupModule: "bed31d6f-d968-45a9-b54e-12d7f977d861",
    addItemStep: "3aea335c-d06d-45b1-841a-cbc8d2d1ce40",
    executeScriptStep: "bc9bb684-36df-4285-888b-d8b4d87b10de",
    postSetupStep: "8ff2febf-f6d2-461d-9ed3-8b0cb5d9d86f",
    siteTemplate: "1b2dfd3b-f2f2-4f40-a75c-f6c2490919c4",
    speModule: "6d82fcd8-c379-443c-97a9-c6423c71e7d5",
    speFolder: "ab154d3d-1126-4ab4-ac21-8b86e6bd70ea",
    speScript: "dd22f1b3-bd87-4db2-9e7d-f7a496888d43",
    availableRenderings: "76da0a8d-fc7e-42b2-af1e-205b49e43f98",
    variantsFolder: "49c111d0-6867-4798-a724-1f103166e6e9",
    variant: "4d50cdae-c2d9-4de8-b080-8f992bfb1b55",
    partialDesignFolder: "0bf1e9cd-873c-42f2-a863-999d8e69bd3c",
    partialDesign: "fd2059fd-6043-4dfe-8c04-e2437ce87634",
    pageData: "1c82e550-ebcd-4e5d-8abd-d50d0809541e",
    mediaFolder: "fe5dd826-48c6-436d-b87a-7c4210c7413b",
    image: "f1828a2c-7e5d-4bbd-98ca-320474871548",
    cclDetailPage: "a9919790-3389-4fc2-abc8-24f73c847c8e",
    cclArticlePage: "b0602368-f67c-433c-8700-862d480546d0",
    cclText: "58041043-7bea-44f0-b1b8-08e4ea7054f4",
};
const SF = {
    location: "52c91c75-6698-4701-a8a2-242ace59a8d6",
    stepName: "7868e6bc-525c-4fce-ab8a-77da3e09b171",
    stepTemplate: "e62c28f0-9d3b-46e2-8bec-a5e120542499",
    stepScript: "c0a5bd91-e658-46ce-b631-77ce337d8e6e",
    dependencies: "40deee2f-7595-40bd-b2c9-51f9e2346100",
    moduleName: "c202067e-7fab-4606-afb4-e76df2185ddc",
    tenantModules: "41ac536a-923a-43f9-ac87-f3993f638125",
    siteModules: "c262443b-653d-461d-96c8-7cfaa0ef2b2d",
    thumbnail: "c7c26117-dbb1-42b2-ab5e-f7223845cca3",
    templateName: "82e64b52-0b8a-4a38-8c78-530c5493814e",
    description: "9f437e68-a84d-48ae-8ce1-a3e26c0b5e64",
    content: "da855368-e5f2-4932-ae55-7f8b08a5a205",
    speEnabled: "218ca464-cb77-4c97-b141-34871ecae00b",
    speScript: "b1a94ff0-6897-47c0-9c51-aa6acb80b1f0",
    renderings: "715ae6c0-71c8-4744-ab4f-65362d20ad65",
    signature: "55faae90-3bba-4f7f-96fe-13c3f40055ff",
    finalRenderings: "04bf00db-f5fb-41f7-8ab7-22408372a981",
    cclText: "8b57dadd-0825-4f5d-9c32-187c0af7e1fd",
    blob: "40e50ed9-ba07-4702-992e-a912738d32dc",
    size: "6954b7c7-2487-423f-8600-436cb3b6dc0e",
    mimeType: "6f47a0a5-9c94-4b48-abeb-42d38def6054",
    extension: "c06867fe-9a43-4c7d-b739-48780492d06f",
};
// Locations inside the headless site branch, as used by the click-click-launch setup steps.
const LOCATION = {
    home: "{E96B4685-0341-4077-AFCE-BCCE690B3927}",
    siteData: "{BA2F959D-A614-4C92-8B57-F1FC1A323ABE}",
    availableRenderings: "{3F14C1B6-5A2D-44CA-A8EF-DFE3CBD574E4}",
    headlessVariants: "{C6F65339-F4DA-40FA-88D1-E1ECFFD54B91}",
    partialDesigns: "{98AB60C3-0FE5-467B-A6C7-ABD981E30E7A}",
};
// Same tenant/site modules and dependencies as the other kit site templates.
const TENANT_MODULES = [
    "7B81B847-1891-43B2-BC13-5047A62EC32A",
    "7BAAA4FC-3051-442D-9BD2-AD720B655E0B",
    "0DC2E395-4A95-4773-88CA-75B22A130849",
    "4346A98A-D6E9-491E-A0ED-CD12F524CF4E",
    "4CBC64BF-8116-48A1-ABAC-DB19103897A6",
    "7574F439-0B48-48BE-BA6B-94B1A3CE01A3",
    "D912C30C-7A98-4A8D-A094-611D9AF9605D",
    "6DE1F4E9-815D-491D-923D-D5038100DBEE",
    "02CD7086-1F87-41EC-B40F-B92C1226895B",
    "1B0A98C0-1801-44A0-85F2-845694FEAFF3",
    "D315A501-6503-4545-A5D8-B9FECBA1097D",
];
const SITE_MODULES = [
    "5A2F6A6F-3028-4210-AAD3-82C1365C4802",
    "9F10010E-49E2-4DCD-A5A1-4DA752ADED2A",
    "4342A029-0186-4B0D-8959-FFEF4FD998C2",
    "AE5D1384-BB75-4C6B-A8B5-4B008C2AC5DA",
    "C4658673-5D70-44ED-9004-D66EAC1DC718",
    "CA502DCF-20D2-4618-A735-E4FCB6D5E114",
    "E2AF1A41-799E-481B-8FDC-B2D33FB729A1",
    "66B9C663-2602-42B1-A5A2-3D04DB6C506A",
    "1FD78E81-59A6-4513-90F1-165A95D4B16B",
    "BEBF4026-24A3-4EA6-986A-518B76DBD71A",
    "385F31BE-FF0C-4D84-A627-9ECD21295AFD",
    "F0EA389E-F78D-440B-9429-F04FE735344A",
    "AC1A27CA-6BF3-4D23-915E-668326D52CF1",
    "D7EEAF4D-2B58-4029-B141-844221565EF0",
    "1F35559F-2140-4774-8BC1-525BB722BAA2",
];
const SETUP_DEPENDENCIES = [
    "C4D79D81-83E9-4506-AE8C-F7145C75762F",
    "ED48A6C5-0E91-43AF-A2CE-4D00D5FE8F5D",
    "0006F007-9BA4-4AB7-B336-65A1452BD255",
    "B2486523-7487-4526-978F-AD2E986B5CC4",
];
const idList = (ids) => ids.map((g) => `{${g}}`).join("\n") + "\n";

const node = (include, rootPath, path, template, opts = {}) =>
    item({
        include,
        relPath: path.slice(rootPath.lastIndexOf("/") + 1),
        itemId: id(path),
        parent:
            path === rootPath
                ? ROOT_PARENTS[include]
                : id(path.slice(0, path.lastIndexOf("/"))),
        template,
        path,
        ...opts,
    });
const sortorder = (i) => [F.sortorder, "__Sortorder", (i + 1) * 100];

// Field lookup across the WL template spec (including base templates) plus the CCL Text template.
const TEMPLATE_SPEC = Object.fromEntries(TEMPLATES.map((t) => [t.name, t]));
const CCL_TEXT = "Text (CCL)";
const templateId = (name) => (name === CCL_TEXT ? S.cclText : id(tpl(name)));
const fieldOf = (templateName, fieldName) => {
    if (templateName === CCL_TEXT)
        return fieldName === "text"
            ? { id: SF.cclText, type: "Rich Text" }
            : null;
    const t = TEMPLATE_SPEC[templateName];
    const own = t?.fields?.find(([n]) => n === fieldName);
    if (own)
        return {
            id: id(`${tpl(templateName)}/Content/${fieldName}`),
            type: own[1],
        };
    for (const base of t?.bases ?? []) {
        const found = fieldOf(base, fieldName);
        if (found) return found;
    }
    return null;
};

const RENDERING_IDS = {
    ...Object.fromEntries(
        RENDERINGS.map((r) => [
            r.name,
            braced(id(`${RENDERINGS_PATH}/${r.name}`)),
        ]),
    ),
    "Breadcrumbs (CCL)": "{B4CBCB8F-9096-4888-AC6E-34DF687276FB}",
    "RichText (CCL)": "{50B36874-8C4E-4958-9DD6-8B95C6AFD09A}",
};
const DATASOURCE_TEMPLATES = {
    ...Object.fromEntries(
        RENDERINGS.filter((r) => r.datasource).map((r) => [
            r.name,
            r.datasource,
        ]),
    ),
    "RichText (CCL)": CCL_TEXT,
};

const esc = (s) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
// "<hero poster image>" style notes in the content plan mark values to supply later.
const isPlaceholder = (v) =>
    typeof v === "string" && /^<[^/>]*>$/.test(v) && !/^<\w+\s*\/?>$/.test(v);
const itemToken = (sitePath) => `@@WL:${sitePath}@@`;
const pageRef = (p) => (p.startsWith("/Home") ? p : `/Home${p}`);
const urlOf = (pagePath) =>
    pagePath
        .replace(/^\/Home/, "")
        .toLowerCase()
        .replace(/ /g, "-") || "/";
const PAGE_BY_URL = new Map(CONTENT.pages.map((p) => [urlOf(p.path), p.path]));
// Sitecore item names allow word characters, spaces and hyphens only.
const itemName = (text) =>
    text
        .replace(/&/g, "and")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim();

const linkXml = (link) => {
    if (!link?.href || isPlaceholder(link.href)) return null;
    const [base, anchor = ""] = link.href.split("#");
    const text = esc(link.text ?? "");
    const target = esc(link.target ?? "");
    const page = PAGE_BY_URL.get(base || "/");
    return page
        ? `<link text="${text}" linktype="internal" anchor="${esc(anchor)}" querystring="" title="" target="${target}" id="${itemToken(page)}" />`
        : `<link text="${text}" linktype="external" url="${esc(link.href)}" anchor="" title="" target="${target}" />`;
};
const fieldValue = (type, value) => {
    switch (type) {
        case "General Link":
            return linkXml(value);
        case "Checkbox":
            return value ? "1" : "";
        case "Treelist":
            return value.map((p) => itemToken(pageRef(p))).join("|");
        case "Droptree":
            return itemToken(pageRef(value));
        case "Image":
            return null; // No brand media ships with the template; components fall back gracefully.
        default:
            return isPlaceholder(value) ? null : String(value);
    }
};

const datasourceItem = (
    include,
    rootPath,
    path,
    templateName,
    fields = {},
    children = [],
    index = 0,
) => {
    const versioned = [];
    for (const [name, value] of Object.entries(fields)) {
        const field = fieldOf(templateName, name);
        if (!field)
            throw new Error(
                `Unknown field "${name}" on ${templateName} (${path})`,
            );
        const v = fieldValue(field.type, value);
        if (v) versioned.push([field.id, name, v]);
    }
    node(include, rootPath, path, templateId(templateName), {
        shared: [sortorder(index)],
        versioned,
    });
    const used = new Set();
    children.forEach((child, i) => {
        // Shorthands: [text, href] is a link item, { question, answer } is an FAQ item.
        const [name, tName, cFields, cChildren] = Array.isArray(child)
            ? [
                  child[0],
                  "WL Link Item",
                  { link: { text: child[0], href: child[1] } },
                  [],
              ]
            : child.question
              ? [`Question ${i + 1}`, "WL FAQ Item", child, []]
              : [child.name, child.template, child.fields, child.children];
        let safe = itemName(name);
        while (used.has(safe.toLowerCase())) safe += " 2";
        used.add(safe.toLowerCase());
        datasourceItem(
            include,
            rootPath,
            `${path}/${safe}`,
            tName,
            cFields,
            cChildren,
            i,
        );
    });
};

const layoutXml = (ownerPath, placements) => {
    const lines = [
        '<r xmlns:p="p" xmlns:s="s" p:p="1">',
        '  <d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}">',
    ];
    let previous;
    placements.forEach((p, i) => {
        const uid = braced(id(`${ownerPath}#rendering-${i}`));
        const fieldNames =
            p.variant && p.variant !== "Default"
                ? `FieldNames=@@WLV:${p.rendering}/${p.variant}@@`
                : "FieldNames";
        const order = previous
            ? `p:after="r[@uid='${previous}']"`
            : 'p:before="*"';
        lines.push(
            `    <r uid="${uid}" ${order} s:ds="${esc(p.ds ?? "")}" s:id="${RENDERING_IDS[p.rendering]}" s:par="${fieldNames}&amp;DynamicPlaceholderId=${i + 1}" s:ph="${p.ph}" />`,
        );
        previous = uid;
    });
    lines.push("  </d>", "</r>");
    return `${lines.join("\n")}\n`;
};

const SHARED_FOLDER = "Williams Lea";
const sharedToken = (name) => itemToken(`/Data/${SHARED_FOLDER}/${name}`);
const inlineOwner = new Map(); // inline datasource name -> owning page path (for reuseDatasource)
CONTENT.pages.forEach((p) =>
    (p.components ?? []).forEach(
        (c) => c.datasource && inlineOwner.set(c.datasource.name, p.path),
    ),
);
// Stub pages reuse the layout of the page they copy, minus that page's own inline content.
const componentsOf = (page) => {
    if (!page.stubOf) return page.components ?? [];
    const source = CONTENT.pages.find((p) => p.path === page.stubOf);
    return source.components
        .map((c) => {
            if (!c.datasource) return c;
            return c.rendering === "WL CTA Band"
                ? { rendering: c.rendering, sharedDatasource: "Contact CTA" }
                : null;
        })
        .filter(Boolean);
};

// Branch: pages under Home (including Home's own Data folder) with their local datasources.
const ADD_PAGES = `${BRANCHES_PATH}/Add Pages`;
const branchPathOf = (pagePath) =>
    pagePath === "/Home"
        ? ADD_PAGES
        : `${ADD_PAGES}/${pagePath.slice("/Home/".length)}`;
let homeLayout = "";
const pageFields = {};
const usedShared = new Set();
const siblingIndex = new Map();
const dataFolders = new Set();

node("wl.branches", BRANCHES_PATH, BRANCHES_PATH, S.branchFolder);
node("wl.branches", BRANCHES_PATH, ADD_PAGES, S.branch);
for (const page of CONTENT.pages) {
    const branchPath = branchPathOf(page.path);
    const placements = componentsOf(page).map((c) => {
        if (c.datasource) {
            if (!dataFolders.has(branchPath)) {
                dataFolders.add(branchPath);
                node(
                    "wl.branches",
                    BRANCHES_PATH,
                    `${branchPath}/Data`,
                    S.pageData,
                    { shared: [sortorder(-1)] },
                );
            }
            const ds = c.datasource;
            const dsTemplate = ds.template ?? DATASOURCE_TEMPLATES[c.rendering];
            datasourceItem(
                "wl.branches",
                BRANCHES_PATH,
                `${branchPath}/Data/${ds.name}`,
                dsTemplate,
                ds.fields,
                ds.children,
            );
            return { ...c, ds: `local:/Data/${ds.name}`, ph: "headless-main" };
        }
        if (c.sharedDatasource) {
            usedShared.add(c.sharedDatasource);
            return {
                ...c,
                ds: sharedToken(c.sharedDatasource),
                ph: "headless-main",
            };
        }
        if (c.reuseDatasource) {
            return {
                ...c,
                ds: itemToken(
                    `${inlineOwner.get(c.reuseDatasource)}/Data/${c.reuseDatasource}`,
                ),
                ph: "headless-main",
            };
        }
        return { ...c, ph: "headless-main" };
    });
    const layout = layoutXml(page.path, placements);
    if (Object.keys(page.fields ?? {}).length)
        pageFields[page.path] = page.fields;
    if (page.path === "/Home") {
        homeLayout = layout; // Home is created by the site scaffolding; the setup script applies its layout.
        continue;
    }
    const parent = page.path.slice(0, page.path.lastIndexOf("/"));
    const index = siblingIndex.get(parent) ?? 0;
    siblingIndex.set(parent, index + 1);
    node(
        "wl.branches",
        BRANCHES_PATH,
        branchPath,
        page.template === "Article Page" ? S.cclArticlePage : S.cclDetailPage,
        {
            shared: [sortorder(index)],
            versioned: [[SF.finalRenderings, "__Final Renderings", layout]],
        },
    );
}

// Branch: shared datasources in <site>/Data/Williams Lea.
const ADD_SHARED = `${BRANCHES_PATH}/Add Shared Data`;
node("wl.branches", BRANCHES_PATH, ADD_SHARED, S.branch);
node(
    "wl.branches",
    BRANCHES_PATH,
    `${ADD_SHARED}/${SHARED_FOLDER}`,
    id(tpl("WL Data Folder")),
);
[...usedShared].forEach((name, i) => {
    const ds = CONTENT.sharedDatasources[name];
    datasourceItem(
        "wl.branches",
        BRANCHES_PATH,
        `${ADD_SHARED}/${SHARED_FOLDER}/${name}`,
        ds.template,
        ds.fields,
        ds.children,
        i,
    );
});

// Branch: Header and Footer partial designs, each with local datasources.
const ADD_PARTIALS = `${BRANCHES_PATH}/Add Partial Designs`;
node("wl.branches", BRANCHES_PATH, ADD_PARTIALS, S.branch);
node(
    "wl.branches",
    BRANCHES_PATH,
    `${ADD_PARTIALS}/Global`,
    S.partialDesignFolder,
);
const variantsUsed = new Map(); // rendering -> Set of variant names
const useVariant = (rendering, variant) => {
    if (!variant || variant === "Default") return;
    if (!variantsUsed.has(rendering))
        variantsUsed.set(rendering, new Set(["Default"]));
    variantsUsed.get(rendering).add(variant);
};
CONTENT.pages.forEach((p) =>
    componentsOf(p).forEach((c) => useVariant(c.rendering, c.variant)),
);
Object.entries(CONTENT.partialDesigns).forEach(([placeholder, entries], i) => {
    const signature = placeholder.replace("headless-", "");
    const name = signature.charAt(0).toUpperCase() + signature.slice(1);
    const designPath = `${ADD_PARTIALS}/Global/${name}`;
    const placements = entries.map((entry, j) => {
        const [, rendering, variant, dsName] = entry.match(
            /^(.+?)(?: \((\w+)\))? -> (.+)$/,
        );
        const ds = CONTENT.sharedDatasources[dsName];
        datasourceItem(
            "wl.branches",
            BRANCHES_PATH,
            `${designPath}/Data/${dsName}`,
            ds.template,
            ds.fields,
            ds.children,
            j,
        );
        useVariant(rendering, variant);
        return {
            rendering,
            variant,
            ds: `local:/Data/${dsName}`,
            ph: placeholder,
        };
    });
    node("wl.branches", BRANCHES_PATH, designPath, S.partialDesign, {
        shared: [[SF.signature, "Signature", signature], sortorder(i)],
        versioned: [
            [
                SF.finalRenderings,
                "__Final Renderings",
                layoutXml(designPath, placements),
            ],
        ],
    });
    node("wl.branches", BRANCHES_PATH, `${designPath}/Data`, S.pageData);
});

// Branch: headless variants, named after the renderings they apply to.
const ADD_VARIANTS = `${BRANCHES_PATH}/Add Rendering Variants`;
node("wl.branches", BRANCHES_PATH, ADD_VARIANTS, S.branch);
[...variantsUsed].forEach(([rendering, variants], i) => {
    node(
        "wl.branches",
        BRANCHES_PATH,
        `${ADD_VARIANTS}/${rendering}`,
        S.variantsFolder,
        { shared: [sortorder(i)] },
    );
    [...variants].forEach((v, j) =>
        node(
            "wl.branches",
            BRANCHES_PATH,
            `${ADD_VARIANTS}/${rendering}/${v}`,
            S.variant,
            { shared: [sortorder(j)] },
        ),
    );
});

// Branch: Available Renderings for the Pages component gallery.
const ADD_AVAILABLE = `${BRANCHES_PATH}/Add Available Renderings`;
node("wl.branches", BRANCHES_PATH, ADD_AVAILABLE, S.branch);
node(
    "wl.branches",
    BRANCHES_PATH,
    `${ADD_AVAILABLE}/Williams Lea`,
    S.availableRenderings,
    {
        shared: [
            [
                SF.renderings,
                "Renderings",
                Object.values(RENDERING_IDS).join("\n") + "\n",
            ],
        ],
    },
);

// SPE scripts run by the setup module.
const RENDERING_HOST_SCRIPT = `function Invoke-Step {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [Sitecore.XA.JSS.Foundation.Scaffolding.Models.CreateNewJSSSiteModel]$Model
    )

    process {
        [Item]$SiteLocation = $Model.SiteLocation
        $sitePath = "$($SiteLocation.Paths.Path)/$($Model.SiteName)"
        Write-Log "Williams Lea: set rendering host for $sitePath" -Log "INFO"
        $siteGrouping = Get-Item -Path "$sitePath/Settings/Site Grouping/$($Model.SiteName)"
        $siteGrouping.RenderingHost = "${CONTENT.site.renderingHost}"
    }
}
`;
const SITE_SETUP_SCRIPT = `# Generated by examples/kit-nextjs-williams-lea/scripts/generate-sitecore-items.mjs. Edit the generator, not this item.
Import-Function Update-PageTemplate
Import-Function Update-TemplateInsertOptions

function Resolve-WlTokens {
    param([string]$Value, [string]$SitePath)

    foreach ($match in [regex]::Matches($Value, '@@WLV:([^@]+)@@')) {
        $target = Get-Item -Path "$SitePath/Presentation/Headless Variants/$($match.Groups[1].Value)" -ErrorAction SilentlyContinue
        $replacement = ''
        if ($target) { $replacement = [System.Uri]::EscapeDataString($target.ID.ToString()) }
        else { Write-Verbose "Unresolved variant token $($match.Value)" }
        $Value = $Value.Replace($match.Value, $replacement)
    }
    foreach ($match in [regex]::Matches($Value, '@@WL:([^@]+)@@')) {
        $target = Get-Item -Path "$SitePath$($match.Groups[1].Value)" -ErrorAction SilentlyContinue
        $replacement = ''
        if ($target) { $replacement = $target.ID.ToString() }
        else { Write-Verbose "Unresolved item token $($match.Value)" }
        $Value = $Value.Replace($match.Value, $replacement)
    }
    $Value
}

function Invoke-ModuleScriptBody {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0 )]
        [Item]$Site,

        [Parameter(Mandatory = $true, Position = 1 )]
        [Item[]]$TenantTemplates
    )

    process {
        $sitePath = $Site.Paths.Path
        $siteCollection = $Site.Parent
        $language = $Site.Language
        $homeItem = Get-Item -Path "$sitePath/Home" -Language $language

        Write-Verbose "Set the start item"
        $siteGrouping = Get-Item -Path "$sitePath/Settings/Site Grouping/$($Site.Name)" -Language $language
        $siteGrouping.StartItem = $homeItem.ID

        Write-Verbose "Create page templates on the click-click-launch bases"
        $templatesRootPath = "master:/sitecore/templates/Project/$($siteCollection.Name)"
        $pageTemplate = Get-Item -Path "$templatesRootPath/Page"
        $pageTemplate."__Base template" = "{AC9DE9BE-8E86-4147-8FBC-739D5560408B}"
        $homePageTemplate = Update-PageTemplate -BaseTemplateId "{4ACCF644-A506-421F-B60F-A05E5C6196B4}" -TemplateName "Home Page" -TemplatesRootPath $templatesRootPath
        $detailPageTemplate = Update-PageTemplate -BaseTemplateId "${braced(S.cclDetailPage)}" -TemplateName "Detail Page" -TemplatesRootPath $templatesRootPath
        $articlePageTemplate = Update-PageTemplate -BaseTemplateId "${braced(S.cclArticlePage)}" -TemplateName "Article Page" -TemplatesRootPath $templatesRootPath
        $insertOptions = @( $detailPageTemplate.ID, $articlePageTemplate.ID )
        foreach ($template in @($homePageTemplate, $detailPageTemplate, $articlePageTemplate)) {
            Update-TemplateInsertOptions -TemplateItem $template -InsertOptions $insertOptions
        }

        Write-Verbose "Add the Default page design with the Header and Footer partial designs"
        $headerPartial = Get-Item -Path "$sitePath/Presentation/Partial Designs/Global/Header" -Language $language
        $footerPartial = Get-Item -Path "$sitePath/Presentation/Partial Designs/Global/Footer" -Language $language
        $defaultPageDesign = New-Item -Path "$sitePath/Presentation/Page Designs" -Name "Default" -ItemType "{1105B8F8-1E00-426B-BF1F-C840742D827B}"
        $defaultPageDesign.PartialDesigns = "$($headerPartial.ID)|$($footerPartial.ID)"
        $pageDesigns = Get-Item -Path "$sitePath/Presentation/Page Designs" -Language $language
        $map = [Sitecore.Text.UrlString]::new()
        foreach ($template in @($pageTemplate, $homePageTemplate, $detailPageTemplate, $articlePageTemplate)) {
            $map[$template.ID] = "$($defaultPageDesign.ID)"
        }
        $pageDesigns.TemplatesMapping = [System.Web.HttpUtility]::UrlEncode($map.ToString())

        Write-Verbose "Move pages from the base templates to the site page templates"
        Set-ItemTemplate -Item $homeItem -Template $homePageTemplate.ID
        $templateMap = @{
            "${braced(S.cclDetailPage)}" = $detailPageTemplate.ID
            "${braced(S.cclArticlePage)}" = $articlePageTemplate.ID
        }
        foreach ($page in @(Get-ChildItem -Path "$sitePath/Home" -Recurse -Language $language)) {
            $key = $page.TemplateID.ToString()
            if ($templateMap.ContainsKey($key)) { Set-ItemTemplate -Item $page -Template $templateMap[$key] }
        }

        Write-Verbose "Apply the Home layout"
        $homeLayout = @'
${homeLayout.trimEnd()}
'@
        $homeItem = Get-Item -Path "$sitePath/Home" -Language $language
        $homeItem.Editing.BeginEdit()
        $homeItem["__Final Renderings"] = $homeLayout
        $homeItem.Editing.EndEdit() | Out-Null

        Write-Verbose "Set page fields"
        $pageFieldsJson = @'
${JSON.stringify(pageFields)}
'@
        $pageFields = $pageFieldsJson | ConvertFrom-Json
        foreach ($entry in $pageFields.PSObject.Properties) {
            $page = Get-Item -Path "$sitePath$($entry.Name)" -Language $language -ErrorAction SilentlyContinue
            if ($null -eq $page) { Write-Verbose "Missing page $($entry.Name)"; continue }
            $page.Editing.BeginEdit()
            foreach ($field in $entry.Value.PSObject.Properties) {
                if ($null -ne $page.Fields[$field.Name]) { $page[$field.Name] = [string]$field.Value }
                else { Write-Verbose "No field $($field.Name) on $($entry.Name)" }
            }
            $page.Editing.EndEdit() | Out-Null
        }

        Write-Verbose "Resolve links between pages, datasources and variants"
        foreach ($siteItem in @(Get-ChildItem -Path $sitePath -Recurse -Language $language)) {
            if ($siteItem.Versions.Count -eq 0) { continue }
            $siteItem.Fields.ReadAll()
            $updates = @{}
            foreach ($field in $siteItem.Fields) {
                $raw = $field.GetValue($false, $false)
                if ([string]::IsNullOrEmpty($raw) -or -not $raw.Contains('@@WL')) { continue }
                $updates[$field.ID.ToString()] = Resolve-WlTokens -Value $raw -SitePath $sitePath
            }
            if ($updates.Count -eq 0) { continue }
            $siteItem.Editing.BeginEdit()
            foreach ($fieldId in $updates.Keys) { $siteItem.Fields[$fieldId].Value = $updates[$fieldId] }
            $siteItem.Editing.EndEdit() | Out-Null
        }

        Write-Verbose "Set site content workflow state to Approved"
        $basicWorkflowApprovedStateId = "{F7FE5BDD-A991-4A58-9735-CD08F9B097AB}"
        $basicDatasourceWorkflowApprovedStateId = "{4460E76C-87E9-4859-9DE6-DE122774937F}"
        $basicDatasourceWorkflowDraftStateId = "{12FFAC4C-565F-4C9A-B63E-7F77E96B4D1F}"
        $workflowStateFieldId = [Sitecore.FieldIDs]::WorkflowState
        foreach ($siteItem in @(Get-ChildItem -Path $sitePath -Recurse -Language $language)) {
            if ($siteItem.Versions.Count -eq 0) { continue }
            $wfField = $siteItem.Fields[$workflowStateFieldId]
            if ($null -eq $wfField) { continue }
            $approvedStateId = $basicWorkflowApprovedStateId
            if ($wfField.Value -eq $basicDatasourceWorkflowDraftStateId) { $approvedStateId = $basicDatasourceWorkflowApprovedStateId }
            if ($wfField.Value -ne $approvedStateId) {
                $siteItem.Editing.BeginEdit()
                $siteItem.Fields[$workflowStateFieldId].Value = $approvedStateId
                $siteItem.Editing.EndEdit() | Out-Null
            }
        }
    }
}
`;
const SITE_SETUP_SCRIPT_PATH = `${SPE_PATH}/Functions/Williams Lea Site Setup`;
const RENDERING_HOST_SCRIPT_PATH = `${SPE_PATH}/Functions/Williams Lea Configure Rendering Host`;
node("wl.powershell", SPE_PATH, SPE_PATH, S.speModule, {
    shared: [
        [F.icon, "__Icon", "Office/32x32/jar_coffee_bean.png"],
        [SF.speEnabled, "Enabled", 1],
    ],
});
node("wl.powershell", SPE_PATH, `${SPE_PATH}/Functions`, S.speFolder);
node("wl.powershell", SPE_PATH, SITE_SETUP_SCRIPT_PATH, S.speScript, {
    shared: [[SF.speScript, "Script", SITE_SETUP_SCRIPT]],
});
node("wl.powershell", SPE_PATH, RENDERING_HOST_SCRIPT_PATH, S.speScript, {
    shared: [[SF.speScript, "Script", RENDERING_HOST_SCRIPT]],
});

// Setup module: Add Item steps first, then the setup script, then the rendering host.
const SETUP_PATH = `${SETTINGS_PATH}/Williams Lea Setup`;
node("wl.settings", SETTINGS_PATH, SETTINGS_PATH, S.settingsFolder);
node("wl.settings", SETTINGS_PATH, SETUP_PATH, S.setupModule, {
    shared: [[SF.dependencies, "Dependencies", idList(SETUP_DEPENDENCIES)]],
    versioned: [[SF.moduleName, "Name", "Williams Lea"]],
});
[
    [
        "Add Available Renderings",
        LOCATION.availableRenderings,
        "Williams Lea",
        ADD_AVAILABLE,
    ],
    [
        "Add Rendering Variants",
        LOCATION.headlessVariants,
        "Williams Lea",
        ADD_VARIANTS,
    ],
    ["Add Partial Designs", LOCATION.partialDesigns, "Global", ADD_PARTIALS],
    ["Add Shared Data", LOCATION.siteData, SHARED_FOLDER, ADD_SHARED],
    ["Add Pages", LOCATION.home, "Pages", ADD_PAGES],
].forEach(([name, location, itemNameValue, branch], i) =>
    node("wl.settings", SETTINGS_PATH, `${SETUP_PATH}/${name}`, S.addItemStep, {
        shared: [
            [SF.location, "Location", location],
            [SF.stepName, "Name", itemNameValue],
            [SF.stepTemplate, "Template", braced(id(branch))],
            [F.sortorder, "__Sortorder", (i + 1) * 10],
        ],
    }),
);
node(
    "wl.settings",
    SETTINGS_PATH,
    `${SETUP_PATH}/Add Williams Lea Content`,
    S.executeScriptStep,
    {
        shared: [
            [SF.stepScript, "Script", braced(id(SITE_SETUP_SCRIPT_PATH))],
            [F.sortorder, "__Sortorder", 200],
        ],
    },
);
node(
    "wl.settings",
    SETTINGS_PATH,
    `${SETUP_PATH}/Post Setup Step`,
    S.postSetupStep,
    {
        shared: [
            [SF.stepScript, "Script", braced(id(RENDERING_HOST_SCRIPT_PATH))],
            [F.sortorder, "__Sortorder", 300],
        ],
    },
);

// Thumbnail shown on the tile (rendered from scripts/assets/site-template-thumbnail.html).
const thumbnail = readFileSync(THUMBNAIL);
const THUMBNAIL_PATH = `${MEDIA_PATH}/site-template-thumbnail`;
node("wl.media", MEDIA_PATH, MEDIA_PATH, S.mediaFolder);
node("wl.media", MEDIA_PATH, THUMBNAIL_PATH, S.image, {
    shared: [
        [
            SF.blob,
            "Blob",
            thumbnail.toString("base64"),
            id(`${THUMBNAIL_PATH}#blob`),
        ],
        [SF.size, "Size", thumbnail.length],
        [SF.mimeType, "Mime Type", "image/png"],
        [SF.extension, "Extension", "png"],
    ],
});

// The site template itself.
node("wl.settings", SETTINGS_PATH, `${SETTINGS_PATH}/Templates`, S.folder);
node(
    "wl.settings",
    SETTINGS_PATH,
    `${SETTINGS_PATH}/Templates/Williams Lea`,
    S.siteTemplate,
    {
        shared: [
            [SF.tenantModules, "Tenant Modules", idList(TENANT_MODULES)],
            [
                SF.siteModules,
                "Site Modules",
                idList([...SITE_MODULES, id(SETUP_PATH).toUpperCase()]),
            ],
            [
                SF.thumbnail,
                "__Thumbnail",
                `<image mediaid="${braced(id(THUMBNAIL_PATH))}" />\n`,
            ],
            [F.sortorder, "__Sortorder", 50],
        ],
        versioned: [
            [SF.templateName, "Name", "Williams Lea"],
            [
                SF.description,
                "Description",
                "A tech-enabled outsourcing template with a video hero, mega-menu navigation, service stack, industries, insights and case studies.",
            ],
            [
                SF.content,
                "Content",
                `${JSON.stringify([
                    {
                        name: "Pages",
                        content:
                            "Home, Services, Industries, Solutions in Action, Insights, Case Studies, About, Contact",
                    },
                    {
                        name: "Components",
                        content: "Williams Lea components plus SXA components",
                    },
                    {
                        name: "Integrations",
                        content: "Personalization and Analytics",
                    },
                ])}\n`,
            ],
        ],
    },
);

// Module file
const include = (name, path) => ({
    name,
    path,
    allowedPushOperations: "CreateUpdateAndDelete",
});
const moduleJson = {
    $schema: "../../../.sitecore/schemas/ModuleFile.schema.json",
    namespace: "Project.williams-lea",
    items: {
        includes: [
            include("wl.templates", TEMPLATES_PATH),
            include("wl.renderings", RENDERINGS_PATH),
            include("wl.branches", BRANCHES_PATH),
            include("wl.settings", SETTINGS_PATH),
            include("wl.powershell", SPE_PATH),
            include("wl.media", MEDIA_PATH),
        ],
    },
};

rmSync(join(ROOT, "items"), { recursive: true, force: true });
for (const { file, yml } of files) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, yml, "utf8");
}
writeFileSync(
    join(ROOT, "williams-lea.module.json"),
    `${JSON.stringify(moduleJson, null, 4)}\n`,
    "utf8",
);
console.log(`Wrote ${files.length} items to ${ROOT}`);

// Item paths over sitecore.json's defaultMaxRelativeItemPathLength live in hashed folders that
// only the Sitecore CLI knows how to name, so let it move those files.
const repoRoot = resolve(ROOT, "../../..");
const validate = spawnSync(
    "dotnet sitecore ser validate -i Project.williams-lea --fix",
    {
        cwd: repoRoot,
        encoding: "utf8",
        shell: true,
    },
);
if (validate.status !== 0) {
    console.warn(`${validate.stdout ?? ""}${validate.stderr ?? ""}`);
    console.warn(
        'Run "dotnet sitecore ser validate -i Project.williams-lea --fix" from the repo root before pushing.',
    );
    process.exitCode = 1;
} else {
    console.log(
        "Sitecore CLI validation passed (long item paths moved to SCS short-path folders).",
    );
}
