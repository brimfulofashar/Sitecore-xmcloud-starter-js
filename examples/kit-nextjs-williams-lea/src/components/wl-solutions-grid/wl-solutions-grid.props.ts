import type {
  WlLinkItemFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlSolutionsGridProps = WlSectionProps<{
  children?: {
    results?: WlLinkItemFields[];
  };
}>;
