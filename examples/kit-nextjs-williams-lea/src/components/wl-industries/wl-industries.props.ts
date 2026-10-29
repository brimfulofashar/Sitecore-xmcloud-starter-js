import type { GraphQLImageField } from '@/lib/component-props';
import type {
  WlLinkItemFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlIndustriesProps = WlSectionProps<{
  image?: GraphQLImageField;
  children?: {
    results?: WlLinkItemFields[];
  };
}>;
