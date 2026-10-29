import type React from 'react';
import NextLink from 'next/link';
import { Link, LinkField, Text } from '@sitecore-content-sdk/nextjs';
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { ArrowLink, isLinkPopulated } from '@/components/atoms/wl/ArrowLink';
import type { WlFooterProps } from './wl-footer.props';

const SocialLink: React.FC<{
  field?: LinkField;
  label: string;
  children: React.ReactNode;
}> = ({ field, label, children }) =>
  isLinkPopulated(field) ? (
    <Link
      field={field!}
      aria-label={label}
      className="hover:bg-white hover:text-primary flex size-9 items-center justify-center rounded-full border border-white/40 transition-colors"
    >
      {children}
    </Link>
  ) : null;

export const Default: React.FC<WlFooterProps> = ({ fields, page }) => {
  const datasource = getDatasource(fields);
  const isPageEditing = page.mode.isEditing;

  if (!datasource) {
    return <NoDataFallback componentName="WL Footer" />;
  }

  const logo = getFieldValue(datasource.logo);
  const heading = getFieldValue(datasource.heading);
  const copyright = getFieldValue(datasource.copyright);
  const links = datasource.children?.results ?? [];

  return (
    <div className="bg-primary text-white">
      <div className="mx-auto grid max-w-screen-xl gap-12 px-4 py-16 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="flex flex-col gap-10">
          <NextLink href="/" aria-label="Williams Lea home">
            {logo?.value?.src || isPageEditing ? (
              <ImageWrapper
                image={logo}
                className="h-9 w-auto brightness-0 invert"
              />
            ) : (
              <span className="text-2xl font-medium">williams lea</span>
            )}
          </NextLink>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {links.map((item, index) => {
              const link = getFieldValue(item.link);
              if (!isLinkPopulated(link) && !isPageEditing) return null;
              return (
                <li key={item.id ?? index}>
                  <Link
                    field={link ?? { value: {} }}
                    className="text-sm font-light text-white/90 hover:text-white hover:underline"
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-5 lg:items-end lg:text-right">
          <Text tag="p" field={heading} className="text-2xl font-light" />
          <ArrowLink
            field={getFieldValue(datasource.link)}
            isPageEditing={isPageEditing}
            variant="button-light"
          />
          <div className="mt-4 flex gap-3">
            <SocialLink
              field={getFieldValue(datasource.linkedinLink)}
              label="LinkedIn"
            >
              <FaLinkedinIn aria-hidden="true" />
            </SocialLink>
            <SocialLink field={getFieldValue(datasource.xLink)} label="X">
              <FaXTwitter aria-hidden="true" />
            </SocialLink>
            <SocialLink
              field={getFieldValue(datasource.facebookLink)}
              label="Facebook"
            >
              <FaFacebookF aria-hidden="true" />
            </SocialLink>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <Text
          tag="p"
          field={copyright}
          className="mx-auto max-w-screen-xl px-4 py-5 text-xs font-light text-white/75 lg:px-8"
        />
      </div>
    </div>
  );
};
