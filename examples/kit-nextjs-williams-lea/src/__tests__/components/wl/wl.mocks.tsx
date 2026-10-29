/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import type { Page, PageMode } from '@sitecore-content-sdk/nextjs';

/**
 * Lightweight stand-ins for Content SDK field components, shared by the WL component tests.
 * Use with: jest.mock('@sitecore-content-sdk/nextjs', () => require('./wl.mocks').sdkMock);
 */
export const sdkMock = {
  Text: ({ field, tag, className }: any) =>
    React.createElement(tag || 'span', { className }, field?.value),
  RichText: ({ field, className }: any) =>
    React.createElement('div', {
      className,
      dangerouslySetInnerHTML: { __html: field?.value ?? '' },
    }),
  Link: ({ field, className, children, ...rest }: any) =>
    React.createElement(
      'a',
      { href: field?.value?.href, className, ...rest },
      children ?? field?.value?.text,
    ),
};

/** jest.setup.js only stubs lucide's Image icon; this returns an <svg> for any icon name. */
export const lucideMock = new Proxy(
  {},
  {
    get: (_target, name) =>
      name === '__esModule' || name === 'then'
        ? undefined
        : (props: any) =>
            React.createElement('svg', { ...props, 'data-icon': String(name) }),
  },
);

export const imageWrapperMock = {
  Default: ({ image, className }: any) =>
    image?.value?.src
      ? React.createElement('img', {
          src: image.value.src,
          alt: image.value.alt ?? '',
          className,
        })
      : null,
};

const mode = (isEditing: boolean) => ({
  isEditing,
  isPreview: false,
  isNormal: !isEditing,
  name: (isEditing ? 'edit' : 'normal') as PageMode['name'],
  designLibrary: { isVariantGeneration: false },
  isDesignLibrary: false,
});

export const mockPage = (
  isEditing = false,
  routeFields: Record<string, unknown> = {},
): Page =>
  ({
    mode: mode(isEditing),
    layout: {
      sitecore: {
        context: {},
        route: { name: 'test', placeholders: {}, fields: routeFields },
      },
    },
    locale: 'en',
  }) as unknown as Page;

export const text = (value: string) => ({ jsonValue: { value } });
export const link = (text: string, href: string) => ({
  jsonValue: { value: { text, href } },
});
export const image = (src: string, alt = '') => ({
  jsonValue: { value: { src, alt } },
});

export const baseProps = (datasource: unknown, isEditing = false) => ({
  rendering: { componentName: 'Test' },
  params: {},
  page: mockPage(isEditing),
  fields: datasource === undefined ? undefined : { data: { datasource } },
});
