import type React from 'react';
import type {
  Field,
  ImageField,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { getFieldValue } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { Eyebrow } from '@/components/atoms/wl/Eyebrow';
import { formatCardDate } from '@/components/atoms/wl/InsightCard';
import type {
  WlPageBannerPageFields,
  WlPageBannerProps,
} from './wl-page-banner.props';

type RouteFields = Record<
  string,
  Field<string> | ImageField | RichTextField | undefined
>;

/**
 * Reads banner fields from the context page via the rendering's Integrated GraphQL query,
 * falling back to route fields so the banner works without a datasource.
 */
const useBannerFields = ({ fields, page }: WlPageBannerProps) => {
  const external: WlPageBannerPageFields = fields?.data?.externalFields ?? {};
  const route = (page.layout.sitecore.route?.fields ?? {}) as RouteFields;
  const pick = <T,>(name: keyof WlPageBannerPageFields): T | undefined =>
    (getFieldValue(external[name] as never) as T | undefined) ??
    (route[name] as T | undefined);

  return {
    title: pick<Field<string>>('pageHeaderTitle')?.value
      ? pick<Field<string>>('pageHeaderTitle')
      : pick<Field<string>>('pageTitle'),
    summary: pick<RichTextField>('pageSummary'),
    subtitle: pick<Field<string>>('pageSubtitle'),
    image: pick<ImageField>('pageThumbnail'),
    date: pick<Field<string>>('pageDisplayDate'),
    readTime: pick<Field<string>>('pageReadTime'),
    eyebrow: getFieldValue(external.parent?.pageTitle),
  };
};

/** Detail-page banner: eyebrow from parent page, title and intro from the page itself. */
export const Default: React.FC<WlPageBannerProps> = (props) => {
  const isPageEditing = props.page.mode.isEditing;
  const { title, summary, image, eyebrow } = useBannerFields(props);
  const hasImage = !!image?.value?.src;

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden px-4 py-20 lg:px-8 lg:py-28',
        hasImage ? 'bg-[#0a1f3d] text-white' : 'bg-primary text-white',
      )}
    >
      {hasImage && (
        <div className="absolute inset-0 -z-10">
          <ImageWrapper
            image={image}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f3d]/90 via-[#0a1f3d]/70 to-[#0a1f3d]/30" />
        </div>
      )}
      <div className="mx-auto flex max-w-screen-xl flex-col gap-6">
        <Eyebrow field={eyebrow} isPageEditing={false} tone="light" />
        <Text
          tag="h1"
          field={title}
          className="max-w-4xl text-4xl font-light leading-tight md:text-5xl"
        />
        {(summary?.value || isPageEditing) && (
          <RichText
            field={summary}
            className="prose prose-invert max-w-3xl text-lg font-light text-white/90"
          />
        )}
      </div>
    </section>
  );
};

/** Insight article header: date, title, standfirst and read time on a light background. */
export const Article: React.FC<WlPageBannerProps> = (props) => {
  const isPageEditing = props.page.mode.isEditing;
  const { title, subtitle, date, readTime } = useBannerFields(props);
  const formattedDate = formatCardDate(date?.value);

  return (
    <section className="bg-secondary px-4 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {formattedDate && (
          <p className="text-primary text-sm font-medium tracking-wider">
            {formattedDate}
          </p>
        )}
        <Text
          tag="h1"
          field={title}
          className="text-4xl font-medium leading-tight text-black md:text-5xl"
        />
        {(subtitle?.value || isPageEditing) && (
          <Text
            tag="p"
            field={subtitle}
            className="text-foreground text-xl font-light"
          />
        )}
        {readTime?.value && (
          <p className="text-foreground/70 text-sm">{readTime.value}</p>
        )}
      </div>
    </section>
  );
};
