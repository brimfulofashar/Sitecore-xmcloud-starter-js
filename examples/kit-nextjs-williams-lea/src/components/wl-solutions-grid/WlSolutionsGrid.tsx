import type React from 'react';
import { Link } from '@sitecore-content-sdk/nextjs';
import { ArrowUpRight } from 'lucide-react';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ArrowLink, isLinkPopulated } from '@/components/atoms/wl/ArrowLink';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlSolutionsGridProps } from './wl-solutions-grid.props';

export const Default: React.FC<WlSolutionsGridProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Solutions Grid" />;
  }

  const solutions = datasource.children?.results ?? [];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0a1f3d] via-[#004e97] to-[#5b2a86] px-4 py-24 text-white lg:px-8">
      {/* Decorative wave, echoing the animated backdrop on the source site. */}
      <svg
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 w-full opacity-30"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${260 + i * 6} C 360 ${120 + i * 10}, 720 ${380 - i * 4}, 1080 ${200 + i * 8} S 1440 ${240 + i * 5}, 1440 ${240 + i * 5}`}
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[2fr_3fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeading
            fields={datasource}
            isPageEditing={isPageEditing}
            align="left"
            tone="light"
          />
          <ArrowLink
            field={getFieldValue(datasource.link)}
            isPageEditing={isPageEditing}
            variant="button-light"
            className="self-start"
          />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {solutions.map((solution, index) => {
            const link = getFieldValue(solution.link);
            if (!isLinkPopulated(link) && !isPageEditing) return null;

            return (
              <li key={solution.id ?? index}>
                <Link
                  field={link ?? { value: {} }}
                  className="group flex h-full min-h-32 flex-col justify-between gap-6 rounded-sm border border-white/20 bg-white/5 p-5 text-lg font-light backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  {link?.value?.text}
                  <ArrowUpRight
                    className="size-5 self-end transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
