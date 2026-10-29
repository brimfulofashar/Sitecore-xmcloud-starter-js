import type React from 'react';
import { Link, LinkField } from '@sitecore-content-sdk/nextjs';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const isLinkPopulated = (link?: LinkField): boolean =>
  !!(link?.value?.href && link.value.href !== 'http://');

interface ArrowLinkProps {
  field?: LinkField;
  isPageEditing?: boolean;
  variant?: 'button' | 'button-light' | 'text' | 'list';
  className?: string;
}

const variantClasses: Record<NonNullable<ArrowLinkProps['variant']>, string> = {
  button:
    'inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover',
  'button-light':
    'inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary',
  text: 'inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline',
  list: 'group flex w-full items-center justify-between gap-4 border-b border-current/20 py-3 text-base font-normal transition-[padding] hover:pl-1',
};

/**
 * Brand link with trailing arrow. Renders the Sitecore Link field so it stays
 * inline-editable; hides itself outside editing when the link is empty.
 */
export const ArrowLink: React.FC<ArrowLinkProps> = ({
  field,
  isPageEditing,
  variant = 'text',
  className,
}) => {
  if (!isLinkPopulated(field) && !isPageEditing) return null;

  const Icon = variant === 'list' ? ArrowRight : ChevronRight;

  return (
    <Link
      field={field ?? { value: {} }}
      className={cn(variantClasses[variant], className)}
    >
      {field?.value?.text}
      <Icon
        className={cn(
          'size-4 shrink-0',
          variant === 'list' &&
            'transition-transform group-hover:translate-x-1',
        )}
        aria-hidden="true"
      />
    </Link>
  );
};
