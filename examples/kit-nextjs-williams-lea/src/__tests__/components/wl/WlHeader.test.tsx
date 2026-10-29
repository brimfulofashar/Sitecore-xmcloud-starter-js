/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Default as WlHeader } from '@/components/wl-header/WlHeader';
import { Default as WlFooter } from '@/components/wl-footer/WlFooter';
import { baseProps, image, link, text } from './wl.mocks';

jest.mock('@sitecore-content-sdk/nextjs', () => require('./wl.mocks').sdkMock);
jest.mock(
  '@/components/image/ImageWrapper.dev',
  () => require('./wl.mocks').imageWrapperMock,
);
jest.mock('lucide-react', () => require('./wl.mocks').lucideMock);

const navGroup = (
  id: string,
  title: string,
  children: [string, string][],
  isUtility = false,
) => ({
  id,
  title: text(title),
  description: text(`<p>${title} overview</p>`),
  link: link(`All ${title}`, `/${id}`),
  isUtility: { jsonValue: { value: isUtility } },
  children: {
    results: children.map(([label, href], i) => ({
      id: `${id}-${i}`,
      link: link(label, href),
    })),
  },
});

const headerDatasource = {
  logo: image('/media/wl-logo.svg', 'Williams Lea'),
  link: link('Contact Us', '/contact'),
  children: {
    results: [
      {
        id: 'home',
        title: text('Home'),
        link: link('Home', '/'),
        children: { results: [] },
      },
      navGroup('services', 'Services', [
        ['Administrative Support', '/services/administrative-support'],
        ['Presentation Services', '/services/presentations'],
      ]),
      navGroup('industries', 'Industries', [
        ['Legal Services', '/industries/legal'],
      ]),
      navGroup('insights', 'Insights', [['Blog', '/insights/blog']], true),
      {
        id: 'careers',
        title: text('Careers'),
        link: link('Careers', '/careers'),
        isUtility: { jsonValue: { value: true } },
        children: { results: [] },
      },
    ],
  },
};

describe('WlHeader', () => {
  it('splits utility items into the top bar and renders the CTA', () => {
    render(<WlHeader {...(baseProps(headerDatasource) as any)} />);

    expect(screen.getByRole('link', { name: 'Careers' })).toHaveClass(
      'text-xs',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('text-sm');
    expect(screen.getByRole('link', { name: /Contact Us/ })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('opens one mega menu at a time and closes on Escape', () => {
    render(<WlHeader {...(baseProps(headerDatasource) as any)} />);

    const services = screen.getByRole('button', { name: /Services/ });
    fireEvent.click(services);
    expect(services).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: /Presentation Services/ }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Industries/ }));
    expect(services).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: /Presentation Services/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Legal Services/ }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.queryByRole('link', { name: /Legal Services/ }),
    ).not.toBeInTheDocument();
  });

  it('opens a utility mega menu without colliding with main menu indices', () => {
    render(<WlHeader {...(baseProps(headerDatasource) as any)} />);

    fireEvent.click(screen.getByRole('button', { name: /Insights/ }));
    expect(screen.getByRole('link', { name: /^Blog/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Presentation Services/ }),
    ).not.toBeInTheDocument();
  });

  it('toggles the mobile menu', () => {
    render(<WlHeader {...(baseProps(headerDatasource) as any)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('shows the datasource fallback without a datasource', () => {
    render(<WlHeader {...(baseProps(undefined) as any)} />);
    expect(screen.getByText(/requires a datasource item/i)).toBeInTheDocument();
  });
});

describe('WlFooter', () => {
  it('renders links, CTA, populated social links and copyright', () => {
    const datasource = {
      heading: text('Ready to transform your operations?'),
      link: link('Contact Us', '/contact'),
      copyright: text('Copyright © 2026 Williams Lea'),
      linkedinLink: link('', 'https://www.linkedin.com/company/williamslea'),
      xLink: { jsonValue: { value: { href: '' } } },
      children: { results: [{ id: 'f1', link: link('Careers', '/careers') }] },
    };
    render(<WlFooter {...(baseProps(datasource) as any)} />);

    expect(screen.getByRole('link', { name: 'Careers' })).toHaveAttribute(
      'href',
      '/careers',
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'X' })).not.toBeInTheDocument();
    expect(
      screen.getByText('Copyright © 2026 Williams Lea'),
    ).toBeInTheDocument();
  });
});
