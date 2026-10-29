import type {
  ComponentProps,
  GraphQLImageField,
  GraphQLLinkField,
  GraphQLTextField,
} from '@/lib/component-props';
import type { WlLinkItemFields } from '@/components/atoms/wl/wl.props';

export interface WlFooterFields {
  logo?: GraphQLImageField;
  heading?: GraphQLTextField;
  link?: GraphQLLinkField;
  copyright?: GraphQLTextField;
  linkedinLink?: GraphQLLinkField;
  xLink?: GraphQLLinkField;
  facebookLink?: GraphQLLinkField;
  children?: {
    results?: WlLinkItemFields[];
  };
}

export interface WlFooterProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: WlFooterFields;
    };
  };
}
