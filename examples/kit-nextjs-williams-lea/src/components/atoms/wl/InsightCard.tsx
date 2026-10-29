import type React from 'react';
import NextLink from 'next/link';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Clock } from 'lucide-react';
import { getFieldValue } from '@/lib/component-props';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import type { WlPageCardFields } from './wl.props';

/** Formats a Sitecore date value (yyyyMMddTHHmmssZ or ISO) as "OCT 09, 2026". */
export const formatCardDate = (value?: string): string => {
  if (!value) return '';
  const iso = /^\d{8}T\d{6}Z?$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`
    : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900) return '';
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
};

interface InsightCardProps {
  item: WlPageCardFields;
  showImage?: boolean;
}

/** Card linking to an Insight or Case Study page, built from the target page's own fields. */
export const InsightCard: React.FC<InsightCardProps> = ({
  item,
  showImage = true,
}) => {
  const title = getFieldValue(item.pageTitle);
  const thumbnail = getFieldValue(item.pageThumbnail);
  const readTime = getFieldValue(item.pageReadTime)?.value;
  const date = formatCardDate(getFieldValue(item.pageDisplayDate)?.value);
  const href = item.url?.path || '#';

  return (
    <article className="group relative flex h-full flex-col overflow-hidden bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg">
      {showImage && thumbnail?.value?.src && (
        <div className="aspect-[16/10] overflow-hidden">
          <ImageWrapper
            image={thumbnail}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        {date && (
          <p className="text-primary text-xs font-medium tracking-wider">
            {date}
          </p>
        )}
        <h3 className="text-xl font-medium leading-snug text-black">
          <NextLink
            href={href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            <Text field={title} encode={false} />
          </NextLink>
        </h3>
        {readTime && (
          <p className="text-foreground/70 mt-auto flex items-center gap-1.5 pt-2 text-sm font-light">
            <Clock className="size-4" aria-hidden="true" />
            {readTime}
          </p>
        )}
      </div>
    </article>
  );
};
