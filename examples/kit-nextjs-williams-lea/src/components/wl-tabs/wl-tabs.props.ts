import type {
  WlLinkGroupFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlTabsProps = WlSectionProps<{
  children?: {
    results?: WlLinkGroupFields[];
  };
}>;
