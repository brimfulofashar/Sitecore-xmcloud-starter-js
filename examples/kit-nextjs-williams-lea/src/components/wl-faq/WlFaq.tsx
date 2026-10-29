'use client';

import type React from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { SectionHeading } from '@/components/atoms/wl/SectionHeading';
import { StructuredData } from '@/components/structured-data/StructuredData';
import { generateFAQPageSchema } from '@/lib/structured-data/schema';
import type { WlFaqProps } from './wl-faq.props';

/** Numbered FAQ accordion with FAQPage structured data for search and AI answer engines. */
export const Default: React.FC<WlFaqProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL FAQ" />;
  }

  const items = datasource.children?.results ?? [];
  const faqSchema = generateFAQPageSchema({
    faqs: items
      .filter((item) => getFieldValue(item.question)?.value)
      .map((item) => ({
        question: getFieldValue(item.question)?.value ?? '',
        answer: getFieldValue(item.answer)?.value ?? '',
      })),
  });

  return (
    <section className="bg-secondary px-4 py-20 lg:px-8">
      {!isPageEditing && faqSchema && (
        <StructuredData id="faq-schema" data={faqSchema} />
      )}
      <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <SectionHeading
          fields={datasource}
          isPageEditing={isPageEditing}
          align="left"
        />
        <Accordion
          type="single"
          collapsible
          className="border-t border-black/10"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.id ?? index}
              value={`faq-${index}`}
              className="border-black/10"
            >
              <AccordionTrigger className="gap-4 py-5 text-left text-lg font-medium text-black hover:no-underline">
                <span className="flex gap-3">
                  <span className="text-primary">{index + 1}.</span>
                  <Text field={getFieldValue(item.question)} />
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <RichText
                  field={getFieldValue(item.answer)}
                  className="prose text-foreground max-w-none pb-2 pl-7 font-light"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
