import type {
  WlLinkGroupFields,
  WlSectionProps,
} from '@/components/atoms/wl/wl.props';

export type WlRelatedServicesProps = WlSectionProps<{
  children?: {
    results?: WlLinkGroupFields[];
  };
}>;
