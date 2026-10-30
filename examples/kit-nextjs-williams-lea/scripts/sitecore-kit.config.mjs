/**
 * Williams Lea kit spec for scripts/generate-sitecore-items.mjs: kit identity, component
 * datasource templates and JSON renderings. Pages and datasources live in
 * content/site-content.json. Regenerate with: node scripts/generate-sitecore-items.mjs
 */
const williamsLeaKit = ({ f, indent, datasourceQuery }) => {
    const SECTION_HEADING = "_WL Section Heading";

    const templates = [
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
    ];

    // Integrated GraphQL fragments shared by several renderings.
    // Keep queries small: the resolver multiplies query complexity by `first`, and a query over
    // the limit resolves no content at all (isContentResolved: false). Verified on XM Cloud:
    // one level at first: 20 works; nested lists only work with the outer list at the default
    // page size (10), a lean inner list, and few fields per level.
    const HEADING = f("eyebrow", "heading", "subheading", "body", "link");
    const LINK_ITEMS = `children(first: 20) {\n  results {\n    id\n    ${f("link")}\n  }\n}`;
    const linkGroups = (groupFields, maxLinks) => `children {
  results {
    id
    ${f(...groupFields).replace(/\n/g, "\n    ")}
    children(first: ${maxLinks}) {
      results {
        ${f("link")}
      }
    }
  }
}`;
    // Mega-menu: up to 10 nav items of up to 12 links (Services has 12).
    const NAV_GROUPS = linkGroups(
        ["title", "description", "tagline", "link", "isUtility"],
        12,
    );
    // Section groups (service pillars, tabs, related services): up to 10 groups of 8 links.
    const LINK_GROUPS = linkGroups(
        ["title", "description", "tagline", "link"],
        8,
    );
    const PAGE_CARD = `id\nurl { path }\n${f("pageTitle", "pageSummary", "pageThumbnail", "pageDisplayDate", "pageReadTime")}`;

    const renderings = [
        {
            name: "WL Header",
            component: "WlHeader",
            icon: "Office/32x32/window_split_ver.png",
            datasource: "WL Header",
            query: datasourceQuery(
                "WlHeader",
                `${f("logo", "link")}\n${NAV_GROUPS}`,
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
            query: datasourceQuery(
                "WlServiceStack",
                `${HEADING}\n${LINK_GROUPS}`,
            ),
        },
        {
            name: "WL Solutions Grid",
            component: "WlSolutionsGrid",
            icon: "Office/32x32/table.png",
            datasource: "WL Solutions Grid",
            query: datasourceQuery(
                "WlSolutionsGrid",
                `${HEADING}\n${LINK_ITEMS}`,
            ),
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
                `${HEADING}\nsource: field(name: "source") {\n  ... on LookupField {\n    targetItem {\n      children(hasLayout: true) {\n        results {\n          ${indent(PAGE_CARD, 10)}\n        }\n      }\n    }\n  }\n}`,
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
                `${HEADING}\nchildren {\n  results {\n    id\n    ${indent(f("question", "answer"), 4)}\n  }\n}`,
            ),
        },
    ];

    return {
        project: "williams-lea", // folder/namespace segment and ID seed; never change once deployed
        displayName: "Williams Lea", // tile name, setup module, SPE module, shared data folder
        prefix: "WL", // template prefix and include-name prefix (wl.templates, ...)
        tile: {
            description:
                "A tech-enabled outsourcing template with a video hero, mega-menu navigation, service stack, industries, insights and case studies.",
            pages: "Home, Services, Industries, Solutions in Action, Insights, Case Studies, About, Contact",
            sortorder: 50,
        },
        parameterFields: [["pageSize", "Integer"]],
        linkItemTemplate: "WL Link Item", // [text, href] shorthand in site-content.json
        faqItemTemplate: "WL FAQ Item", // { question, answer } shorthand
        ctaRendering: "WL CTA Band", // stub pages swap a copied inline CTA for...
        defaultCtaDatasource: "Contact CTA", // ...this shared datasource
        templates,
        renderings,
    };
};

export default williamsLeaKit;
