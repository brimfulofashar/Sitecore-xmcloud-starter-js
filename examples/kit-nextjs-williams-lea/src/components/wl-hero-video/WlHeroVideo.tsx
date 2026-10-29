'use client';

import type React from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { ArrowLink } from '@/components/atoms/wl/ArrowLink';
import { Eyebrow } from '@/components/atoms/wl/Eyebrow';
import { BrandWaves } from '@/components/atoms/wl/BrandWaves';
import type { WlHeroVideoProps } from './wl-hero-video.props';

export const Default: React.FC<WlHeroVideoProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  if (!datasource) {
    return <NoDataFallback componentName="WL Hero Video" />;
  }

  const eyebrow = getFieldValue(datasource.eyebrow);
  const heading = getFieldValue(datasource.heading);
  const link = getFieldValue(datasource.link);
  const image = getFieldValue(datasource.image);
  const videoSrc = getFieldValue(datasource.video)?.value?.href;
  const showVideo = !!videoSrc && !prefersReducedMotion && !isPageEditing;

  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#0a1f3d] lg:min-h-[calc(100vh-108px)]">
      <div className="absolute inset-0 -z-10">
        {!image?.value?.src && !showVideo && (
          // Brand backdrop when no media is set, so the hero never renders as a flat block.
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f3d] via-[#004e97] to-[#5b2a86]">
            <BrandWaves
              lines={22}
              animated={!prefersReducedMotion}
              className="absolute inset-x-0 bottom-0 h-3/4 w-full opacity-40"
            />
          </div>
        )}
        {(image?.value?.src || isPageEditing) && (
          <ImageWrapper
            image={image}
            className="h-full w-full object-cover"
            priority
          />
        )}
        {showVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f3d]/70 via-[#0a1f3d]/45 to-[#0a1f3d]/70" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
        <Eyebrow
          field={eyebrow}
          isPageEditing={isPageEditing}
          tone="highlight"
          className="italic"
        />
        <Text
          tag="h1"
          field={heading}
          className="text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-[3.5rem]"
        />
        <ArrowLink
          field={link}
          isPageEditing={isPageEditing}
          variant="button-light"
        />
      </div>
    </section>
  );
};
