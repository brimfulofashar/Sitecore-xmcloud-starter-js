import type { Field } from '@sitecore-content-sdk/nextjs';
import type {
  ComponentProps,
  GraphQLImageField,
  GraphQLLinkField,
} from '@/lib/component-props';
import type { WlLinkGroupFields } from '@/components/atoms/wl/wl.props';

export interface WlNavItemFields extends WlLinkGroupFields {
  isUtility?: { jsonValue?: Field<boolean> };
}

export interface WlHeaderFields {
  logo?: GraphQLImageField;
  link?: GraphQLLinkField;
  children?: {
    results?: WlNavItemFields[];
  };
}

export interface WlHeaderProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: WlHeaderFields;
    };
  };
}
