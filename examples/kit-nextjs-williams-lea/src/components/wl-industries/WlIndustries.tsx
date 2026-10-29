import type React from 'react';
import { Link } from '@sitecore-content-sdk/nextjs';
import { ArrowRight } from 'lucide-react';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { isLinkPopulated } from '@/components/atoms/wl/ArrowLink';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlIndustriesProps } from './wl-industries.props';

export const Default: React.FC<WlIndustriesProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Industries" />;
  }

  const image = getFieldValue(datasource.image);
  const industries = datasource.children?.results ?? [];

  return (
    <section className="bg-secondary px-4 py-20 lg:px-8">
      <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeading
            fields={datasource}
            isPageEditing={isPageEditing}
            align="left"
          />
          <ul className="border-t border-black/10">
            {industries.map((industry, index) => {
              const link = getFieldValue(industry.link);
              if (!isLinkPopulated(link) && !isPageEditing) return null;

              return (
                <li
                  key={industry.id ?? index}
                  className="border-b border-black/10"
                >
                  <Link
                    field={link ?? { value: {} }}
                    className="hover:text-primary group flex items-center justify-between py-5 text-2xl font-light text-black transition-colors md:text-[1.75rem]"
                  >
                    {link?.value?.text}
                    <ArrowRight
                      className="text-primary size-6 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {(image?.value?.src || isPageEditing) && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-xl">
            <ImageWrapper
              image={image}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};
