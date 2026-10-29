'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import { Link, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ChevronDown, Menu, X } from 'lucide-react';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { ArrowLink, isLinkPopulated } from '@/components/atoms/wl/ArrowLink';
import type { WlHeaderProps, WlNavItemFields } from './wl-header.props';

const isUtilityItem = (item: WlNavItemFields): boolean =>
  !!getFieldValue(item.isUtility)?.value;

const hasChildLinks = (item: WlNavItemFields): boolean =>
  !!item.children?.results?.length;

/** Top-level nav entry: a plain link when it has no children, otherwise a mega-menu trigger. */
const NavEntry: React.FC<{
  item: WlNavItemFields;
  index: number;
  openIndex: number | null;
  onToggle: (index: number | null) => void;
  small?: boolean;
}> = ({ item, index, openIndex, onToggle, small }) => {
  const title = getFieldValue(item.title);
  const link = getFieldValue(item.link);
  const isOpen = openIndex === index;
  const textClass = small
    ? 'text-xs text-white'
    : 'text-sm text-black hover:text-primary';

  if (!hasChildLinks(item)) {
    return isLinkPopulated(link) ? (
      <Link
        field={link!}
        className={cn('font-medium transition-colors', textClass)}
      />
    ) : (
      <Text tag="span" field={title} className={cn('font-medium', textClass)} />
    );
  }

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`wl-mega-${index}`}
      onClick={() => onToggle(isOpen ? null : index)}
      className={cn(
        'flex items-center gap-1 font-medium transition-colors',
        textClass,
      )}
    >
      {title?.value}
      <ChevronDown
        className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  );
};

/** Mega-menu panel showing the group's intro on the left and its child links on the right. */
const MegaPanel: React.FC<{ item: WlNavItemFields; index: number }> = ({
  item,
  index,
}) => {
  const title = getFieldValue(item.title);
  const description = getFieldValue(item.description);
  const link = getFieldValue(item.link);

  return (
    <div
      id={`wl-mega-${index}`}
      className="absolute inset-x-0 top-full border-t border-black/5 bg-white shadow-xl"
    >
      <div className="mx-auto grid max-w-screen-xl gap-10 px-8 py-10 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          <Text
            tag="p"
            field={title}
            className="text-primary text-2xl font-medium"
          />
          {description?.value && (
            <RichText
              field={description}
              className="text-foreground text-sm font-light"
            />
          )}
          <ArrowLink field={link} variant="text" />
        </div>
        <ul className="grid content-start gap-x-10 sm:grid-cols-2">
          {item.children?.results?.map((child, i) => {
            const childLink = getFieldValue(child.link);
            return (
              <li key={child.id ?? i}>
                <ArrowLink
                  field={childLink}
                  variant="list"
                  className="text-black"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

/** Mobile drawer with collapsible groups. */
const MobileMenu: React.FC<{
  items: WlNavItemFields[];
  onClose: () => void;
}> = ({ items, onClose }) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-white px-4 pb-10 lg:hidden">
      <ul className="divide-y divide-black/10">
        {items.map((item, index) => {
          const title = getFieldValue(item.title);
          const link = getFieldValue(item.link);
          const isOpen = expanded === index;

          if (!hasChildLinks(item)) {
            return (
              <li key={item.id ?? index} className="py-4" onClick={onClose}>
                {isLinkPopulated(link) ? (
                  <Link
                    field={link!}
                    className="text-lg font-medium text-black"
                  />
                ) : (
                  <Text
                    tag="span"
                    field={title}
                    className="text-lg font-medium"
                  />
                )}
              </li>
            );
          }

          return (
            <li key={item.id ?? index} className="py-4">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : index)}
                className="flex w-full items-center justify-between text-lg font-medium text-black"
              >
                {title?.value}
                <ChevronDown
                  className={cn(
                    'size-5 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <ul className="mt-2 pl-2">
                  {[
                    { id: 'overview', link: item.link },
                    ...(item.children?.results ?? []),
                  ].map((child, i) => (
                    <li key={child.id ?? i} onClick={onClose}>
                      <ArrowLink
                        field={getFieldValue(child.link)}
                        variant="list"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const Default: React.FC<WlHeaderProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenIndex(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenIndex(null);
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!datasource) {
    return <NoDataFallback componentName="WL Header" />;
  }

  const logo = getFieldValue(datasource.logo);
  const cta = getFieldValue(datasource.link);
  const items = datasource.children?.results ?? [];
  const utilityItems = items.filter(isUtilityItem);
  const mainItems = items.filter((item) => !isUtilityItem(item));
  // Utility entries share the openIndex space; offset them so indices never collide.
  const utilityOffset = mainItems.length;
  const openItem =
    openIndex === null
      ? undefined
      : openIndex >= utilityOffset
        ? utilityItems[openIndex - utilityOffset]
        : mainItems[openIndex];

  return (
    <div
      ref={headerRef}
      className={cn('relative z-50', !isPageEditing && 'sticky top-0')}
    >
      {utilityItems.length > 0 && (
        <div className="bg-primary hidden lg:block">
          <ul className="mx-auto flex max-w-screen-xl items-center justify-end gap-8 px-8 py-2">
            {utilityItems.map((item, i) => (
              <li key={item.id ?? i}>
                <NavEntry
                  item={item}
                  index={utilityOffset + i}
                  openIndex={openIndex}
                  onToggle={setOpenIndex}
                  small
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white shadow-sm">
        <nav
          aria-label="Main"
          className="mx-auto flex h-[72px] max-w-screen-xl items-center justify-between gap-8 px-4 lg:px-8"
        >
          <NextLink
            href="/"
            aria-label="Williams Lea home"
            className="shrink-0"
          >
            {logo?.value?.src || isPageEditing ? (
              <ImageWrapper image={logo} className="h-9 w-auto" priority />
            ) : (
              <span className="text-primary text-2xl font-medium">
                williams lea
              </span>
            )}
          </NextLink>

          <ul className="hidden items-center gap-8 lg:flex">
            {mainItems.map((item, i) => (
              <li key={item.id ?? i}>
                <NavEntry
                  item={item}
                  index={i}
                  openIndex={openIndex}
                  onToggle={setOpenIndex}
                />
              </li>
            ))}
            <li>
              <ArrowLink
                field={cta}
                isPageEditing={isPageEditing}
                variant="button"
              />
            </li>
          </ul>

          <button
            type="button"
            className="text-primary lg:hidden"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((open) => !open)}
          >
            {isMobileOpen ? (
              <X className="size-7" />
            ) : (
              <Menu className="size-7" />
            )}
          </button>
        </nav>
      </div>

      {openItem && hasChildLinks(openItem) && (
        <div className="hidden lg:block">
          <MegaPanel item={openItem} index={openIndex!} />
        </div>
      )}

      {isMobileOpen && (
        <MobileMenu
          items={[...mainItems, ...utilityItems]}
          onClose={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};
