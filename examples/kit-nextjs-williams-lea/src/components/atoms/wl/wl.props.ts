import type {
  ComponentProps,
  GraphQLImageField,
  GraphQLLinkField,
  GraphQLRichTextField,
  GraphQLTextField,
} from '@/lib/component-props';

/**
 * Shared field shapes for Williams Lea components. Each maps to a template under
 * /sitecore/templates/Project/williams-lea/Components.
 */

/** _WL Section Heading: base template inherited by most WL section datasources. */
export interface WlSectionHeadingFields {
  eyebrow?: GraphQLTextField;
  heading?: GraphQLTextField;
  subheading?: GraphQLTextField;
  body?: GraphQLRichTextField;
  link?: GraphQLLinkField;
}

/** WL Link Item: a single link child item. */
export interface WlLinkItemFields {
  id?: string;
  link?: GraphQLLinkField;
}

/** WL Link Group: titled group of WL Link Item children (service pillars, tabs, nav, related services). */
export interface WlLinkGroupFields {
  id?: string;
  title?: GraphQLTextField;
  description?: GraphQLRichTextField;
  tagline?: GraphQLTextField;
  link?: GraphQLLinkField;
  children?: {
    results?: WlLinkItemFields[];
  };
}

/** Props for a WL section rendering whose datasource inherits _WL Section Heading. */
export interface WlSectionProps<TExtra = object> extends ComponentProps {
  fields?: {
    data?: {
      datasource?: WlSectionHeadingFields & TExtra;
    };
  };
}

/** Page-level fields read from CCL Page / Article Page items (Insights, Case Studies). */
export interface WlPageCardFields {
  id?: string;
  url?: {
    path?: string;
  };
  pageTitle?: GraphQLTextField;
  pageSummary?: GraphQLRichTextField;
  pageThumbnail?: GraphQLImageField;
  pageDisplayDate?: GraphQLTextField;
  pageReadTime?: GraphQLTextField;
}
