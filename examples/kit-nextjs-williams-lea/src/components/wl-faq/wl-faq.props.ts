import type {
  GraphQLRichTextField,
  GraphQLTextField,
} from '@/lib/component-props';
import type { WlSectionProps } from '@/components/atoms/wl/wl.props';

export interface WlFaqItemFields {
  id?: string;
  question?: GraphQLTextField;
  answer?: GraphQLRichTextField;
}

export type WlFaqProps = WlSectionProps<{
  children?: {
    results?: WlFaqItemFields[];
  };
}>;
