import type React from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';

interface EyebrowProps {
  field?: Field<string>;
  isPageEditing?: boolean;
  tone?: 'primary' | 'light' | 'highlight';
  className?: string;
}

/** Four-point star used throughout the Williams Lea brand as an eyebrow marker. */
export const BrandStar: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="18"
    height="19"
    viewBox="0 0 18 19"
    fill="none"
    aria-hidden="true"
    className={cn('shrink-0', className)}
  >
    <path
      d="M0 8.77C5.54 8.77 9.23 13.85 9.23 18c.15-3.08 2.12-9.23 8.77-9.23-2.92 0-8.77-1.75-8.77-8.77 0 2.92-1.85 8.77-9.23 8.77Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

const toneClasses: Record<NonNullable<EyebrowProps['tone']>, string> = {
  primary: 'text-primary',
  light: 'text-white',
  highlight: 'text-highlight',
};

export const Eyebrow: React.FC<EyebrowProps> = ({
  field,
  isPageEditing,
  tone = 'primary',
  className,
}) => {
  if (!field?.value && !isPageEditing) return null;

  return (
    <p
      className={cn(
        'flex items-center gap-2 text-sm font-medium tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {tone !== 'highlight' && <BrandStar />}
      <Text tag="span" field={field} />
    </p>
  );
};
