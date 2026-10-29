import type {
  ComponentProps,
  GraphQLImageField,
  GraphQLRichTextField,
  GraphQLTextField,
} from '@/lib/component-props';

/** Fields of the context page (and its parent, used as the eyebrow). */
export interface WlPageBannerPageFields {
  pageTitle?: GraphQLTextField;
  pageHeaderTitle?: GraphQLTextField;
  pageSubtitle?: GraphQLTextField;
  pageSummary?: GraphQLRichTextField;
  pageThumbnail?: GraphQLImageField;
  pageDisplayDate?: GraphQLTextField;
  pageReadTime?: GraphQLTextField;
  parent?: {
    pageTitle?: GraphQLTextField;
  };
}

export interface WlPageBannerProps extends ComponentProps {
  fields?: {
    data?: {
      externalFields?: WlPageBannerPageFields;
    };
  };
}
