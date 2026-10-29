import type React from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { ArrowLink } from '@/components/atoms/wl/ArrowLink';
import type { WlCtaBandProps } from './wl-cta-band.props';

/** "Ready to get started?" call-to-action band used on detail pages. */
export const Default: React.FC<WlCtaBandProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL CTA Band" />;
  }

  const eyebrow = getFieldValue(datasource.eyebrow);
  const heading = getFieldValue(datasource.heading);

  return (
    <section className="px-4 py-12 lg:px-8">
      <div className="from-primary relative isolate mx-auto flex max-w-screen-xl flex-col items-start justify-between gap-6 overflow-hidden rounded-sm bg-gradient-to-r to-[#5b2a86] p-10 text-white md:flex-row md:items-center md:p-14">
        <div className="flex flex-col gap-2">
          {(eyebrow?.value || isPageEditing) && (
            <Text
              tag="p"
              field={eyebrow}
              className="text-highlight text-sm font-medium italic"
            />
          )}
          <Text
            tag="h2"
            field={heading}
            className="text-3xl font-light md:text-4xl"
          />
        </div>
        <ArrowLink
          field={getFieldValue(datasource.link)}
          isPageEditing={isPageEditing}
          variant="button-light"
        />
      </div>
    </section>
  );
};

/** Newsletter subscribe banner ("The latest expert insights delivered to your inbox"). */
export const Subscribe: React.FC<WlCtaBandProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL CTA Band" />;
  }

  const heading = getFieldValue(datasource.heading);
  const subheading = getFieldValue(datasource.subheading);
  const image = getFieldValue(datasource.image);

  return (
    <section className="bg-secondary relative isolate overflow-hidden px-4 py-16 lg:px-8">
      {image?.value?.src && (
        <div className="absolute inset-0 -z-10 opacity-60">
          <ImageWrapper image={image} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="mx-auto flex max-w-screen-xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <Text
            tag="h2"
            field={heading}
            className="text-2xl font-medium text-black md:text-3xl"
          />
          {(subheading?.value || isPageEditing) && (
            <Text
              tag="p"
              field={subheading}
              className="text-foreground font-light"
            />
          )}
        </div>
        <ArrowLink
          field={getFieldValue(datasource.link)}
          isPageEditing={isPageEditing}
          variant="button"
        />
      </div>
    </section>
  );
};
