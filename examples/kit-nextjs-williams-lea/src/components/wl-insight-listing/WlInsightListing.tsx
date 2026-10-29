'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { InsightCard } from '@/components/atoms/wl/InsightCard';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlPageCardFields } from '@/components/atoms/wl/wl.props';
import type { WlInsightListingProps } from './wl-insight-listing.props';

const DEFAULT_PAGE_SIZE = 9;

const sortKey = (item: WlPageCardFields): string =>
  getFieldValue(item.pageDisplayDate)?.value ?? '';

/** Lists every child page of the selected source (e.g. /Insights/Blog), newest first, with "Load more". */
export const Default: React.FC<WlInsightListingProps> = ({
  fields,
  params,
  page,
}) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;
  const pageSize = Number(params?.pageSize) || DEFAULT_PAGE_SIZE;
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const items = useMemo(
    () =>
      [...(datasource?.source?.targetItem?.children?.results ?? [])].sort(
        (a, b) => sortKey(b).localeCompare(sortKey(a)),
      ),
    [datasource],
  );

  if (!datasource) {
    return <NoDataFallback componentName="WL Insight Listing" />;
  }

  return (
    <section className="bg-white px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-screen-xl">
        <SectionHeading
          fields={datasource}
          isPageEditing={isPageEditing}
          align="left"
        />

        {items.length === 0 && isPageEditing && (
          <p className="text-foreground/70 mt-10 text-sm">
            Set the &ldquo;Source&rdquo; field to the page whose children should
            be listed.
          </p>
        )}

        <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, visibleCount).map((item, index) => (
            <li key={item.id ?? index}>
              <InsightCard item={item} />
            </li>
          ))}
        </ul>

        {visibleCount < items.length && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + pageSize)}
              className="border-primary text-primary hover:bg-primary rounded-sm border px-6 py-2.5 text-sm font-medium transition-colors hover:text-white"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
