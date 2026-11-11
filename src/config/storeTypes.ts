/**
 * ============================================================================
 * SHRI SAI MEDICAL & GENERAL STORE — CENTRAL CONFIGURATION TYPES
 * ============================================================================
 * Canonical TypeScript schema definitions shared across:
 * - INITIAL_STORE_CONFIG (src/config/storeConfig.ts)
 * - DEFAULT_STORE_CONFIG (src/config/defaultStoreConfig.ts)
 * - Owner CMS state & forms
 * - LocalStorage persistence
 * - JSON / TypeScript export & import
 * - Public storefront components
 * ============================================================================
 */

export const CURRENT_SCHEMA_VERSION = 3;

export interface StoreCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badgeText?: string;
  subText?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  availability: 'In Stock' | 'Ask for Availability';
  isPrescription: boolean;
  packInfo?: string;
  imageUrl?: string;
}

export interface StoreGalleryItem {
  id: string;
  title: string;
  caption: string;
  category: 'Exterior' | 'Interior' | 'Shelves' | 'General';
  imageUrl: string;
  isPlaceholder?: boolean;
  targetSection?: 'hero' | 'about' | 'gallery';
}

export interface FlashDealItem {
  id: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  couponCode?: string;
  originalPrice?: string;
  offerPrice?: string;
  validUntil: string;
  category: string;
  imageUrl: string;
  highlightColor?: 'emerald' | 'amber' | 'rose' | 'blue';
  priceCalculationMode?: 'auto' | 'custom';
}

export type HeaderElementKey =
  | 'logo'
  | 'storeName'
  | 'navLinks'
  | 'liveStatusBadge'
  | 'callButton'
  | 'whatsappButton'
  | 'cmsButton';

export type FooterColumnKey = 'brand' | 'quickLinks' | 'hours' | 'contact';

export interface NavLinkConfig {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

export interface HeaderControlsConfig {
  sticky: boolean;
  compactMode: boolean;
  callButtonText: string;
  whatsappButtonText: string;
  cmsButtonText: string;
  showCallOnMobile: boolean;
  showWhatsAppOnMobile: boolean;
  showStatusOnMobile: boolean;
  elementOrder: HeaderElementKey[];
  navLinks: NavLinkConfig[];
}

export interface FooterQuickLink {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface FooterControlsConfig {
  columnOrder: FooterColumnKey[];
  brandColumnTitle: string;
  quickLinksTitle: string;
  hoursTitle: string;
  contactTitle: string;
  copyrightSuffix: string;
  regulatoryNote: string;
  showOnMobile: boolean;
  quickLinks: FooterQuickLink[];
}

export type LiveStatusOverride = 'auto' | 'force_open' | 'force_closed';

export interface StoreConfig {
  schemaVersion: number;
  business: {
    name: string;
    shortName: string;
    tagline: string;
    subheadline: string;
    description: string;
    businessTypes: string[];
    hours: {
      opensAt: string; // 24-hour format HH:mm in IST
      closesAt: string; // 24-hour format HH:mm in IST
      display: string;
      daysSummary: string;
      statusOverride?: LiveStatusOverride;
    };
    contact: {
      primaryPhone: string;
      secondaryPhone: string;
      primaryPhoneDisplay: string;
      secondaryPhoneDisplay: string;
      primaryPhoneLabel: string;
      secondaryPhoneLabel: string;
      whatsappNumber: string;
      secondaryWhatsappNumber: string;
      whatsappDefaultMessage: string;
      email: string;
    };
    address: {
      building: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
      fullAddress: string;
      landmarkNote: string;
    };
    map: {
      googleMapsSearchUrl: string;
      googleMapsDirectionsUrl: string;
      embedIframeUrl: string;
    };
  };
  appearance: {
    primaryGreen: string;
    secondaryGreen: string;
    lightGreen: string;
    showAnnouncementBar: boolean;
    showFloatingWhatsApp: boolean;
    logoSymbolMode?: 'initials' | 'om' | 'cross' | 'rx' | 'custom_image';
    customLogoUrl?: string;
    logoBorderColor?: 'gold' | 'emerald' | 'white';
    logoShape?: 'squircle' | 'rounded' | 'circle' | 'shield';
  };
  sectionVisibility: {
    announcementBar: boolean;
    headerBar: boolean;
    heroSection: boolean;
    flashDealsSection: boolean;
    aboutSection: boolean;
    categoriesSection: boolean;
    catalogueSection: boolean;
    deliverySection: boolean;
    gallerySection: boolean;
    contactMapSection: boolean;
    footerSection: boolean;
  };
  headerElements: {
    logo: boolean;
    storeName: boolean;
    navLinks: boolean;
    liveStatusBadge: boolean;
    callButton: boolean;
    whatsappButton: boolean;
    cmsButton: boolean;
  };
  footerElements: {
    brandColumn: boolean;
    quickLinksColumn: boolean;
    hoursColumn: boolean;
    contactColumn: boolean;
    copyrightBar: boolean;
    ownerAccessButtons: boolean;
  };
  headerConfig: HeaderControlsConfig;
  footerConfig: FooterControlsConfig;
  flashSale: {
    enabled: boolean;
    autoPlay: boolean;
    showWelcomePopup: boolean;
    intervalSeconds: number;
    bannerTitle: string;
    bannerSubtitle: string;
    regulatoryDisclaimer: string;
    offers: FlashDealItem[];
  };
  announcement: {
    enabled: boolean;
    badgeText: string;
    items: string[];
    speedSeconds: number;
  };
  delivery: {
    available: boolean;
    headline: string;
    summary: string;
    terms: string[];
    coverageNote: string;
    ctaLabel: string;
  };
  categories: StoreCategory[];
  products: StoreProduct[];
  gallery: StoreGalleryItem[];
}

export interface PublishedConfigMetadata {
  configVersion: string;
  schemaVersion: number;
  publishedAt: string;
  buildId: string;
}

export interface LocalCmsDraftRecord {
  draftConfig: StoreConfig;
  baseConfigVersion: string;
  updatedAt: string;
}

export type PublishingStatus =
  | 'published'
  | 'local_draft_saved'
  | 'new_deployment_available'
  | 'deployment_updated';

