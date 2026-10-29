'use client';

import type React from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ArrowLink } from '@/components/atoms/wl/ArrowLink';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import type { WlTabsProps } from './wl-tabs.props';

export const Default: React.FC<WlTabsProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Tabs" />;
  }

  const tabs = datasource.children?.results ?? [];
  if (!tabs.length) {
    return (
      <section className="px-4 py-20">
        <SectionHeading fields={datasource} isPageEditing={isPageEditing} />
      </section>
    );
  }

  return (
    <section className="bg-white px-4 py-20 lg:px-8">
      <SectionHeading fields={datasource} isPageEditing={isPageEditing} />

      <Tabs defaultValue="tab-0" className="mx-auto mt-12 max-w-screen-xl">
        <TabsList className="mx-auto flex h-auto w-fit flex-wrap justify-center gap-2 rounded-sm bg-transparent p-0">
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.id ?? index}
              value={`tab-${index}`}
              className="data-[state=active]:bg-primary border-primary text-primary rounded-sm border px-6 py-2.5 text-base data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              {getFieldValue(tab.title)?.value}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab, index) => (
          <TabsContent
            key={tab.id ?? index}
            value={`tab-${index}`}
            // Keep every panel mounted while editing so authors can reach all fields.
            forceMount={isPageEditing ? true : undefined}
            className="bg-secondary mt-10 grid gap-10 rounded-sm p-8 data-[state=inactive]:hidden md:p-12 lg:grid-cols-[3fr_2fr] lg:gap-16"
          >
            <div className="flex flex-col gap-6">
              <Text
                tag="h3"
                field={getFieldValue(tab.title)}
                className="text-primary text-3xl font-medium"
              />
              <RichText
                field={getFieldValue(tab.description)}
                className="prose text-foreground max-w-none font-light leading-relaxed"
              />
              <ArrowLink
                field={getFieldValue(tab.link)}
                isPageEditing={isPageEditing}
                variant="button"
                className="self-start"
              />
            </div>
            <ul className="self-center">
              {tab.children?.results?.map((child, i) => (
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
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};
