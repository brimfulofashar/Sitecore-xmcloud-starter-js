import type {
  WlPageCardFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlInsightListingProps = WlSectionProps<{
  source?: {
    targetItem?: {
      children?: {
        results?: WlPageCardFields[];
      };
    };
  };
}>;
