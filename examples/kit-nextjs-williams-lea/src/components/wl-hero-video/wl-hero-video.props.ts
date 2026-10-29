import type {
  GraphQLImageField,
  GraphQLLinkField,
} from '@/lib/component-props';
import type { WlSectionProps } from '@/components/atoms/wl/wl.props';

export type WlHeroVideoProps = WlSectionProps<{
  video?: GraphQLLinkField;
  image?: GraphQLImageField;
}>;
