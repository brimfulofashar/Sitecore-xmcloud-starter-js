/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Default as WlServiceStack } from '@/components/wl-service-stack/WlServiceStack';
import { Default as WlSolutionsGrid } from '@/components/wl-solutions-grid/WlSolutionsGrid';
import { Default as WlInsightCards } from '@/components/wl-insight-cards/WlInsightCards';
import { Default as WlFaq } from '@/components/wl-faq/WlFaq';
import {
  Default as WlCtaBand,
  Subscribe,
} from '@/components/wl-cta-band/WlCtaBand';
import {
  Default as WlPageBanner,
  Article,
} from '@/components/wl-page-banner/WlPageBanner';
import { formatCardDate } from '@/components/atoms/wl/InsightCard';
import { baseProps, image, link, mockPage, text } from './wl.mocks';

jest.mock('@sitecore-content-sdk/nextjs', () => require('./wl.mocks').sdkMock);
jest.mock(
  '@/components/image/ImageWrapper.dev',
  () => require('./wl.mocks').imageWrapperMock,
);
jest.mock('lucide-react', () => require('./wl.mocks').lucideMock);
jest.mock('@/components/structured-data/StructuredData', () => ({
  StructuredData: ({ id }: { id: string }) => <script data-testid={id} />,
}));

const heading = {
  eyebrow: text('Services'),
  heading: text('Our Core Expertise, Your Strategic Edge'),
  subheading: text(
    'Insight, creative excellence and integrated solutions combine to drive outcomes',
  ),
};

describe('formatCardDate', () => {
  it('formats Sitecore and ISO dates as "MON DD, YYYY"', () => {
    expect(formatCardDate('20261009T000000Z')).toBe('OCT 09, 2026');
    expect(formatCardDate('2026-09-30T00:00:00Z')).toBe('SEP 30, 2026');
  });

  it('returns an empty string for empty or unset Sitecore dates', () => {
    expect(formatCardDate(undefined)).toBe('');
    expect(formatCardDate('00010101T000000Z')).toBe('');
    expect(formatCardDate('not a date')).toBe('');
  });
});

describe('WlServiceStack', () => {
  const datasource = {
    ...heading,
    children: {
      results: [
        {
          id: 'p1',
          title: text('Business Support'),
          description: text('<p>Critical business support.</p>'),
          tagline: text('Maximizing productivity'),
          children: {
            results: [
              {
                id: 'l1',
                link: link(
                  'Administrative Support',
                  '/services/administrative-support',
                ),
              },
              {
                id: 'l2',
                link: link('Presentations Services', '/services/presentations'),
              },
            ],
          },
        },
        {
          id: 'p2',
          title: text('Backoffice Transformation'),
          children: { results: [] },
        },
      ],
    },
  };

  it('renders the section heading and one card per pillar with its links', () => {
    render(<WlServiceStack {...(baseProps(datasource) as any)} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Our Core Expertise, Your Strategic Edge',
    );
    const cards = screen
      .getAllByRole('listitem')
      .filter((li) => li.querySelector('h3'));
    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByRole('link', { name: /Presentations Services/ }),
    ).toHaveAttribute('href', '/services/presentations');
    expect(screen.getByText('Maximizing productivity')).toBeInTheDocument();
  });

  it('makes cards sticky outside editing only', () => {
    const { container, rerender } = render(
      <WlServiceStack {...(baseProps(datasource) as any)} />,
    );
    expect(container.querySelector('ol > li')).toHaveClass('md:sticky');

    rerender(<WlServiceStack {...(baseProps(datasource, true) as any)} />);
    expect(container.querySelector('ol > li')).not.toHaveClass('md:sticky');
  });

  it('shows the datasource fallback without a datasource', () => {
    render(<WlServiceStack {...(baseProps(undefined) as any)} />);
    expect(screen.getByText(/requires a datasource item/i)).toBeInTheDocument();
  });
});

describe('WlSolutionsGrid', () => {
  it('skips empty links outside editing', () => {
    const datasource = {
      ...heading,
      children: {
        results: [
          {
            id: 's1',
            link: link('Accelerate Digital Transformation', '/solutions/adt'),
          },
          { id: 's2', link: { jsonValue: { value: { href: '' } } } },
        ],
      },
    };
    render(<WlSolutionsGrid {...(baseProps(datasource) as any)} />);

    expect(
      screen.getByRole('link', { name: /Accelerate Digital Transformation/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});

describe('WlInsightCards', () => {
  const card = (id: string, title: string, date: string) => ({
    id,
    url: { path: `/insights/blog/${id}` },
    pageTitle: text(title),
    pageDisplayDate: text(date),
    pageReadTime: text('3 Mins Read'),
    pageThumbnail: image(`/media/${id}.jpg`),
  });

  it('renders a card per selected page linking to the page URL', () => {
    const datasource = {
      eyebrow: text('Insights'),
      heading: text('The Think Space'),
      link: link('See all insights', '/insights/blog'),
      items: {
        targetItems: [card('a', 'Who Owns the Work?', '20261009T000000Z')],
      },
    };
    render(<WlInsightCards {...(baseProps(datasource) as any)} />);

    expect(
      screen.getByRole('link', { name: 'Who Owns the Work?' }),
    ).toHaveAttribute('href', '/insights/blog/a');
    expect(screen.getByText('OCT 09, 2026')).toBeInTheDocument();
    expect(screen.getByText('3 Mins Read')).toBeInTheDocument();
  });

  it('prompts authors to pick items when empty in editing mode', () => {
    render(
      <WlInsightCards
        {...(baseProps({ heading: text('The Think Space') }, true) as any)}
      />,
    );
    expect(
      screen.getByText(/Select Insight or Case Study pages/),
    ).toBeInTheDocument();
  });
});

describe('WlFaq', () => {
  const datasource = {
    heading: text('One Solution. Many Answers.'),
    children: {
      results: [
        {
          id: 'q1',
          question: text('What are presentation design services?'),
          answer: text('<p>Specialist support.</p>'),
        },
      ],
    },
  };

  it('numbers questions, expands answers and emits FAQ schema', () => {
    render(<WlFaq {...(baseProps(datasource) as any)} />);

    const trigger = screen.getByRole('button', {
      name: /What are presentation design services/,
    });
    expect(trigger).toHaveTextContent('1.');
    fireEvent.click(trigger);
    expect(screen.getByText('Specialist support.')).toBeInTheDocument();
    expect(screen.getByTestId('faq-schema')).toBeInTheDocument();
  });

  it('omits FAQ schema while editing', () => {
    render(<WlFaq {...(baseProps(datasource, true) as any)} />);
    expect(screen.queryByTestId('faq-schema')).not.toBeInTheDocument();
  });
});

describe('WlCtaBand', () => {
  const datasource = {
    eyebrow: text('Ready to get started?'),
    heading: text('Reimagine what is possible.'),
    subheading: text('Subscribe to our blog'),
    link: link('Contact Us', '/contact'),
  };

  it('renders the default CTA band', () => {
    render(<WlCtaBand {...(baseProps(datasource) as any)} />);
    expect(screen.getByText('Ready to get started?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contact Us/ })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('renders the Subscribe variant', () => {
    render(<Subscribe {...(baseProps(datasource) as any)} />);
    expect(
      screen.getByRole('heading', { name: 'Reimagine what is possible.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Subscribe to our blog')).toBeInTheDocument();
  });
});

describe('WlPageBanner', () => {
  it('uses the Integrated GraphQL page fields with the parent title as eyebrow', () => {
    const props = {
      ...baseProps(undefined),
      fields: {
        data: {
          externalFields: {
            pageTitle: text('Presentation Services'),
            pageSummary: text('<p>Tight deadlines. High stakes.</p>'),
            parent: { pageTitle: text('Services') },
          },
        },
      },
    };
    render(<WlPageBanner {...(props as any)} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Presentation Services',
    );
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(
      screen.getByText('Tight deadlines. High stakes.'),
    ).toBeInTheDocument();
  });

  it('falls back to route fields when no GraphQL data is present', () => {
    const props = {
      ...baseProps(undefined),
      page: mockPage(false, { pageTitle: { value: 'Legal Services' } }),
    };
    render(<WlPageBanner {...(props as any)} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Legal Services',
    );
  });

  it('prefers pageHeaderTitle over pageTitle', () => {
    const props = {
      ...baseProps(undefined),
      page: mockPage(false, {
        pageTitle: { value: 'Legal' },
        pageHeaderTitle: { value: 'Legal Services' },
      }),
    };
    render(<WlPageBanner {...(props as any)} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Legal Services',
    );
  });

  it('renders the Article variant with a formatted date and read time', () => {
    const props = {
      ...baseProps(undefined),
      page: mockPage(false, {
        pageTitle: {
          value: 'Who Owns the Work When AI Crosses Every Department?',
        },
        pageDisplayDate: { value: '20261009T000000Z' },
        pageReadTime: { value: '3 Mins Read' },
      }),
    };
    render(<Article {...(props as any)} />);
    expect(screen.getByText('OCT 09, 2026')).toBeInTheDocument();
    expect(screen.getByText('3 Mins Read')).toBeInTheDocument();
  });
});
