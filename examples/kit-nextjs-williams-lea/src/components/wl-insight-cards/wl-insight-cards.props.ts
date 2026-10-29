import type {
  WlPageCardFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlInsightCardsProps = WlSectionProps<{
  items?: {
    targetItems?: WlPageCardFields[];
  };
}>;
