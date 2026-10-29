import type {
  WlLinkGroupFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlServiceStackProps = WlSectionProps<{
  children?: {
    results?: WlLinkGroupFields[];
  };
}>;
