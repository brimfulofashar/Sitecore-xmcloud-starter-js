// Client-safe component map for App Router
import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';


import { BYOCClientWrapper, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in import section
import * as WlTabs from 'src/components/wl-tabs/WlTabs';
import * as WlInsightListing from 'src/components/wl-insight-listing/WlInsightListing';
import * as WlHeroVideo from 'src/components/wl-hero-video/WlHeroVideo';
import * as WlHeader from 'src/components/wl-header/WlHeader';
import * as WlFaq from 'src/components/wl-faq/WlFaq';
import * as VideoPlayerdev from 'src/components/video/VideoPlayer.dev';
import * as VideoModaldev from 'src/components/video/VideoModal.dev';
import * as Video from 'src/components/video/Video';
import * as VerticalImageAccordion from 'src/components/vertical-image-accordion/VerticalImageAccordion';
import * as ThemeProviderdev from 'src/components/theme-provider/theme-provider.dev';
import * as TestimonialCarousel from 'src/components/testimonial-carousel/TestimonialCarousel';
import * as Title from 'src/components/sxa/Title';
import * as NavigationMenuToggleclient from 'src/components/sxa/NavigationMenuToggle.client';
import * as NavigationListclient from 'src/components/sxa/NavigationList.client';
import * as ContentBlock from 'src/components/sxa/ContentBlock';
import * as SubscriptionBanner from 'src/components/subscription-banner/SubscriptionBanner';
import * as SecondaryNavigation from 'src/components/secondary-navigation/SecondaryNavigation';
import * as PromoAnimatedImageRightdev from 'src/components/promo-animated/PromoAnimatedImageRight.dev';
import * as PromoAnimatedDefaultdev from 'src/components/promo-animated/PromoAnimatedDefault.dev';
import * as PromoAnimated from 'src/components/promo-animated/PromoAnimated';
import * as Portaldev from 'src/components/portal/portal.dev';
import * as PageHeader from 'src/components/page-header/PageHeader';
import * as MultiPromoTabs from 'src/components/multi-promo-tabs/MultiPromoTabs';
import * as MultiPromo from 'src/components/multi-promo/MultiPromo';
import * as ModeToggledev from 'src/components/mode-toggle/mode-toggle.dev';
import * as MediaSectiondev from 'src/components/media-section/MediaSection.dev';
import * as Meteors from 'src/components/magicui/meteors';
import * as LogoTabs from 'src/components/logo-tabs/LogoTabs';
import * as NextImageSrcdev from 'src/components/image/nextImageSrc.dev';
import * as ImageWrapperclient from 'src/components/image/ImageWrapper.client';
import * as Icon from 'src/components/icon/Icon';
import * as Hero from 'src/components/hero/Hero';
import * as GlobalHeader from 'src/components/global-header/GlobalHeader';
import * as FooterNavigationColumn from 'src/components/global-footer/FooterNavigationColumn';
import * as FloatingDockdev from 'src/components/floating-dock/floating-dock.dev';
import * as ArticleListing from 'src/components/article-listing/ArticleListing';
import * as ArticleHeader from 'src/components/article-header/ArticleHeader';
import * as AnimatedSectiondev from 'src/components/animated-section/AnimatedSection.dev';
import * as AlertBannerdev from 'src/components/alert-banner/AlertBanner.dev';
import * as AccordionBlock from 'src/components/accordion-block/AccordionBlock';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['WlTabs', { ...WlTabs }],
  ['WlInsightListing', { ...WlInsightListing }],
  ['WlHeroVideo', { ...WlHeroVideo }],
  ['WlHeader', { ...WlHeader }],
  ['WlFaq', { ...WlFaq }],
  ['VideoPlayer', { ...VideoPlayerdev }],
  ['VideoModal', { ...VideoModaldev }],
  ['Video', { ...Video }],
  ['VerticalImageAccordion', { ...VerticalImageAccordion }],
  ['theme-provider', { ...ThemeProviderdev }],
  ['TestimonialCarousel', { ...TestimonialCarousel }],
  ['Title', { ...Title }],
  ['NavigationMenuToggle', { ...NavigationMenuToggleclient }],
  ['NavigationList', { ...NavigationListclient }],
  ['ContentBlock', { ...ContentBlock }],
  ['SubscriptionBanner', { ...SubscriptionBanner }],
  ['SecondaryNavigation', { ...SecondaryNavigation }],
  ['PromoAnimatedImageRight', { ...PromoAnimatedImageRightdev }],
  ['PromoAnimatedDefault', { ...PromoAnimatedDefaultdev }],
  ['PromoAnimated', { ...PromoAnimated }],
  ['portal', { ...Portaldev }],
  ['PageHeader', { ...PageHeader }],
  ['MultiPromoTabs', { ...MultiPromoTabs }],
  ['MultiPromo', { ...MultiPromo }],
  ['mode-toggle', { ...ModeToggledev }],
  ['MediaSection', { ...MediaSectiondev }],
  ['meteors', { ...Meteors }],
  ['LogoTabs', { ...LogoTabs }],
  ['nextImageSrc', { ...NextImageSrcdev }],
  ['ImageWrapper', { ...ImageWrapperclient }],
  ['Icon', { ...Icon }],
  ['Hero', { ...Hero }],
  ['GlobalHeader', { ...GlobalHeader }],
  ['FooterNavigationColumn', { ...FooterNavigationColumn }],
  ['floating-dock', { ...FloatingDockdev }],
  ['ArticleListing', { ...ArticleListing }],
  ['ArticleHeader', { ...ArticleHeader }],
  ['AnimatedSection', { ...AnimatedSectiondev }],
  ['AlertBanner', { ...AlertBannerdev }],
  ['AccordionBlock', { ...AccordionBlock }],
]);

export default componentMap;
