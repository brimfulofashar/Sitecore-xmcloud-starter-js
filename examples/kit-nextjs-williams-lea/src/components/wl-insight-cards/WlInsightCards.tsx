import type React from 'react';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ArrowLink } from '@/components/atoms/wl/ArrowLink';
import { InsightCard } from '@/components/atoms/wl/InsightCard';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlInsightCardsProps } from './wl-insight-cards.props';

/**
 * Hand-picked Insight or Case Study cards ("The Think Space", "Case Studies").
 * Card content comes from the selected pages, so authors only pick items.
 */
export const Default: React.FC<WlInsightCardsProps> = ({
  fields,
  params,
  page,
}) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Insight Cards" />;
  }

  const items = datasource.items?.targetItems ?? [];

  return (
    <section
      className={cn(
        'px-4 py-20 lg:px-8',
        params?.styles?.includes('bg-secondary') ? 'bg-secondary' : 'bg-white',
      )}
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            fields={datasource}
            isPageEditing={isPageEditing}
            align="left"
          />
          <ArrowLink
            field={getFieldValue(datasource.link)}
            isPageEditing={isPageEditing}
            className="shrink-0"
          />
        </div>

        {items.length > 0 ? (
          <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <li key={item.id ?? index}>
                <InsightCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          isPageEditing && (
            <p className="text-foreground/70 mt-12 text-sm">
              Select Insight or Case Study pages in the &ldquo;Items&rdquo;
              field to show cards.
            </p>
          )
        )}
      </div>
    </section>
  );
};
