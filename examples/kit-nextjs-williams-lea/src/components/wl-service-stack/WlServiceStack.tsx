import type React from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ArrowLink } from '@/components/atoms/wl/ArrowLink';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlServiceStackProps } from './wl-service-stack.props';

/** Card themes cycle in the order the pillars appear on williamslea.com. */
const CARD_THEMES = [
  'bg-gradient-to-br from-[#004e97] to-[#1b78c9] text-white',
  'bg-gradient-to-br from-[#ad3673] to-[#5b2a86] text-white',
  'bg-gradient-to-br from-[#077c82] to-[#1a9fa6] text-white',
  'bg-gradient-to-br from-[#f4eaec] to-[#e6d3d8] text-black',
];

export const Default: React.FC<WlServiceStackProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Service Stack" />;
  }

  const pillars = datasource.children?.results ?? [];

  return (
    <section className="bg-white px-4 py-20 lg:px-8">
      <SectionHeading fields={datasource} isPageEditing={isPageEditing} />

      <ol className="mx-auto mt-14 flex max-w-screen-xl flex-col gap-8">
        {pillars.map((pillar, index) => {
          const title = getFieldValue(pillar.title);
          const description = getFieldValue(pillar.description);
          const tagline = getFieldValue(pillar.tagline);
          const theme = CARD_THEMES[index % CARD_THEMES.length];

          return (
            <li
              key={pillar.id ?? index}
              // Sticky offsets stack each card a little lower than the previous one.
              style={
                isPageEditing ? undefined : { top: `${120 + index * 24}px` }
              }
              className={cn(
                'rounded-sm p-8 shadow-lg md:p-12',
                theme,
                !isPageEditing && 'md:sticky',
              )}
            >
              <Text
                tag="h3"
                field={title}
                className="text-3xl font-medium md:text-[2rem]"
              />
              <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
                <div className="flex flex-col gap-4 border-current/25 md:border-r md:pr-12">
                  <RichText
                    field={description}
                    className="text-lg font-light leading-relaxed"
                  />
                  {(tagline?.value || isPageEditing) && (
                    <Text
                      tag="p"
                      field={tagline}
                      className="font-light italic opacity-90"
                    />
                  )}
                </div>
                <ul>
                  {pillar.children?.results?.map((child, i) => (
                    <li key={child.id ?? i}>
                      <ArrowLink
                        field={getFieldValue(child.link)}
                        isPageEditing={isPageEditing}
                        variant="list"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
