import type React from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { getFieldValue } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { Eyebrow } from './Eyebrow';
import type { WlSectionHeadingFields } from './wl.props';

interface SectionHeadingProps {
  fields?: WlSectionHeadingFields;
  isPageEditing?: boolean;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  headingTag?: 'h1' | 'h2';
  className?: string;
}

/** Eyebrow + heading + subheading block shared by WL section components. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  fields,
  isPageEditing,
  align = 'center',
  tone = 'dark',
  headingTag = 'h2',
  className,
}) => {
  const eyebrow = getFieldValue(fields?.eyebrow);
  const heading = getFieldValue(fields?.heading);
  const subheading = getFieldValue(fields?.subheading);
  const body = getFieldValue(fields?.body);

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'mx-auto max-w-3xl items-center text-center',
        className,
      )}
    >
      <Eyebrow
        field={eyebrow}
        isPageEditing={isPageEditing}
        tone={tone === 'light' ? 'light' : 'primary'}
      />
      {(heading?.value || isPageEditing) && (
        <Text
          tag={headingTag}
          field={heading}
          className={cn(
            'text-pretty text-3xl font-medium leading-tight md:text-[2rem]',
            tone === 'light' ? 'text-white' : 'text-black',
          )}
        />
      )}
      {(subheading?.value || isPageEditing) && (
        <Text
          tag="p"
          field={subheading}
          className={cn(
            'text-lg font-light',
            tone === 'light' ? 'text-white/85' : 'text-foreground',
          )}
        />
      )}
      {(body?.value || isPageEditing) && (
        <RichText
          field={body}
          className={cn(
            'prose max-w-none font-light',
            tone === 'light' ? 'prose-invert text-white/85' : 'text-foreground',
          )}
        />
      )}
    </div>
  );
};
