import type React from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ArrowLink } from '@/components/atoms/wl/ArrowLink';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlRelatedServicesProps } from './wl-related-services.props';

/** Related services grouped by pillar (e.g. "BUSINESS SUPPORT" → Proofreading, ...). */
export const Default: React.FC<WlRelatedServicesProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Related Services" />;
  }

  const groups = datasource.children?.results ?? [];

  return (
    <section className="bg-white px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-screen-xl">
        <SectionHeading
          fields={datasource}
          isPageEditing={isPageEditing}
          align="left"
        />
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, index) => (
            <div key={group.id ?? index}>
              <Text
                tag="h3"
                field={getFieldValue(group.title)}
                className="text-primary border-primary border-b-2 pb-3 text-sm font-semibold uppercase tracking-wider"
              />
              <ul className="mt-2">
                {group.children?.results?.map((child, i) => (
                  <li key={child.id ?? i}>
                    <ArrowLink
                      field={getFieldValue(child.link)}
                      isPageEditing={isPageEditing}
                      variant="list"
                      className="text-black"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
