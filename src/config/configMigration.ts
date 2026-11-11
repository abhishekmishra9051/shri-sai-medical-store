import {
  CURRENT_SCHEMA_VERSION,
  FlashDealItem,
  FooterColumnKey,
  FooterQuickLink,
  HeaderElementKey,
  LiveStatusOverride,
  NavLinkConfig,
  StoreCategory,
  StoreConfig,
  StoreGalleryItem,
  StoreProduct,
} from './storeTypes';
import { DEFAULT_STORE_CONFIG } from './defaultStoreConfig';

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function asRecord(val: unknown): Record<string, unknown> {
  return isRecord(val) ? val : {};
}

export function ensureString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback;
}

function asNonEmptyString(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.trim().length > 0 ? val : fallback;
}

function asBoolean(val: unknown, fallback: boolean): boolean {
  return typeof val === 'boolean' ? val : fallback;
}

function asNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

/**
 * Sanitizes image or external HTTP(S) URLs, blocking dangerous protocols (`javascript:`, `vbscript:`, `data:text/html`).
 */
export function sanitizeSafeUrl(
  rawUrl: string | undefined | null,
  options: { allowDataImage?: boolean; fallback?: string } = {}
): string {
  const fallback = options.fallback ?? '';
  const trimmed = ensureString(rawUrl).trim();
  if (!trimmed) return fallback;

  // Allow relative root paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Allow safe base64 data:image/* if enabled
  if (
    options.allowDataImage &&
    /^data:image\/(jpeg|jpg|png|webp|gif|svg\+xml);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Extracts raw iframe src URL if the user pastes an entire `<iframe src="..."></iframe>` tag,
 * and strictly enforces an `https://` protocol to prevent `javascript:` or `data:` iframe XSS.
 */
export function sanitizeMapEmbedInput(input: string): string {
  const trimmed = ensureString(input).trim();
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const candidate = srcMatch && srcMatch[1] ? srcMatch[1].trim() : trimmed;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Reject non-https or malformed URLs
  }
  return DEFAULT_STORE_CONFIG.business.map.embedIframeUrl;
}

function normalizeStatusOverride(val: unknown, fallback: LiveStatusOverride = 'auto'): LiveStatusOverride {
  if (val === 'auto' || val === 'force_open' || val === 'force_closed') {
    return val;
  }
  return fallback;
}

const VALID_HEADER_ELEMENTS: HeaderElementKey[] = [
  'logo',
  'storeName',
  'navLinks',
  'liveStatusBadge',
  'callButton',
  'whatsappButton',
  'cmsButton',
];

const VALID_FOOTER_COLUMNS: FooterColumnKey[] = ['brand', 'quickLinks', 'hours', 'contact'];

function normalizeNavLink(raw: unknown, idx: number, fallback?: NavLinkConfig): NavLinkConfig {
  const rec = asRecord(raw);
  const defLink: NavLinkConfig = fallback ?? {
    id: `nav-${idx + 1}`,
    label: `Link ${idx + 1}`,
    href: '#home',
    visible: true,
    showOnDesktop: true,
    showOnMobile: true,
  };
  return {
    id: asNonEmptyString(rec.id, defLink.id),
    label: ensureString(rec.label, defLink.label),
    href: ensureString(rec.href, defLink.href),
    visible: asBoolean(rec.visible, defLink.visible),
    showOnDesktop: asBoolean(rec.showOnDesktop, defLink.showOnDesktop),
    showOnMobile: asBoolean(rec.showOnMobile, defLink.showOnMobile),
  };
}

function normalizeFooterQuickLink(raw: unknown, idx: number, fallback?: FooterQuickLink): FooterQuickLink {
  const rec = asRecord(raw);
  const defLink: FooterQuickLink = fallback ?? {
    id: `fl-${idx + 1}`,
    label: `Quick Link ${idx + 1}`,
    href: '#home',
    visible: true,
  };
  return {
    id: asNonEmptyString(rec.id, defLink.id),
    label: ensureString(rec.label, defLink.label),
    href: ensureString(rec.href, defLink.href),
    visible: asBoolean(rec.visible, defLink.visible),
  };
}

function normalizeCategory(raw: unknown, idx: number): StoreCategory {
  const rec = asRecord(raw);
  const fallback = DEFAULT_STORE_CONFIG.categories[idx] ?? DEFAULT_STORE_CONFIG.categories[0];
  return {
    id: asNonEmptyString(rec.id, `cat-${idx + 1}`),
    title: ensureString(rec.title, fallback?.title ?? 'Category'),
    description: ensureString(rec.description, fallback?.description ?? ''),
    iconName: asNonEmptyString(rec.iconName, fallback?.iconName ?? 'Pill'),
    badgeText: ensureString(rec.badgeText, fallback?.badgeText ?? ''),
    subText: ensureString(rec.subText, fallback?.subText ?? ''),
  };
}

function normalizeProduct(raw: unknown, idx: number): StoreProduct {
  const rec = asRecord(raw);
  const availability =
    rec.availability === 'In Stock' || rec.availability === 'Ask for Availability'
      ? rec.availability
      : 'In Stock';
  return {
    id: asNonEmptyString(rec.id, `prod-${idx + 1}`),
    name: ensureString(rec.name, ''),
    category: ensureString(rec.category, 'OTC & Daily Wellness'),
    description: ensureString(rec.description, ''),
    availability,
    isPrescription: Boolean(rec.isPrescription),
    packInfo: ensureString(rec.packInfo, ''),
    imageUrl: sanitizeSafeUrl(ensureString(rec.imageUrl, ''), { allowDataImage: true }),
  };
}

function normalizeGalleryItem(raw: unknown, idx: number): StoreGalleryItem {
  const rec = asRecord(raw);
  const category =
    rec.category === 'Exterior' ||
    rec.category === 'Interior' ||
    rec.category === 'Shelves' ||
    rec.category === 'General'
      ? rec.category
      : 'General';
  const targetSection =
    rec.targetSection === 'hero' || rec.targetSection === 'about' || rec.targetSection === 'gallery'
      ? rec.targetSection
      : idx === 0
        ? 'hero'
        : idx === 1
          ? 'about'
          : 'gallery';

  return {
    id: asNonEmptyString(rec.id, `gal-${idx + 1}`),
    title: ensureString(rec.title, ''),
    caption: ensureString(rec.caption, ''),
    category,
    imageUrl: sanitizeSafeUrl(ensureString(rec.imageUrl, ''), { allowDataImage: true }),
    isPlaceholder: asBoolean(rec.isPlaceholder, false),
    targetSection,
  };
}

function normalizeFlashDealOffer(raw: unknown, idx: number): FlashDealItem {
  const rec = asRecord(raw);
  const seedMatch = DEFAULT_STORE_CONFIG.flashSale.offers.find((s) => s.id === rec.id);
  const highlightColor =
    rec.highlightColor === 'emerald' ||
    rec.highlightColor === 'amber' ||
    rec.highlightColor === 'rose' ||
    rec.highlightColor === 'blue'
      ? rec.highlightColor
      : (seedMatch?.highlightColor ?? 'emerald');
  const priceCalculationMode =
    rec.priceCalculationMode === 'auto' || rec.priceCalculationMode === 'custom'
      ? rec.priceCalculationMode
      : (seedMatch?.priceCalculationMode ?? 'custom');

  return {
    id: asNonEmptyString(rec.id, `deal-${idx + 1}`),
    title: ensureString(rec.title, ''),
    subtitle: ensureString(rec.subtitle, ''),
    discountBadge: ensureString(rec.discountBadge, 'SPECIAL OFFER'),
    couponCode: ensureString(rec.couponCode ?? seedMatch?.couponCode, ''),
    originalPrice: ensureString(rec.originalPrice ?? seedMatch?.originalPrice, ''),
    offerPrice: ensureString(rec.offerPrice ?? seedMatch?.offerPrice, ''),
    validUntil: ensureString(rec.validUntil, 'Limited Time Offer'),
    category: ensureString(rec.category, 'Wellness & Devices'),
    imageUrl: sanitizeSafeUrl(ensureString(rec.imageUrl, ''), { allowDataImage: true }),
    highlightColor,
    priceCalculationMode,
  };
}

/**
 * Safely merges, migrates, and normalizes any stored, partial, or imported configuration object
 * to the latest schema version (v3), guaranteeing every required field is defined with zero undefined properties.
 * Preserves owner-edited values including explicit empty arrays (e.g., products: [], categories: []).
 */
export function normalizeStoreConfig(parsedRaw: unknown): StoreConfig {
  const base = structuredClone(DEFAULT_STORE_CONFIG);
  if (!isRecord(parsedRaw)) {
    return base;
  }

  const parsed = parsedRaw;
  const pb = asRecord(parsed.business);
  const pContact = asRecord(pb.contact);
  const pHours = asRecord(pb.hours);
  const pAddr = asRecord(pb.address);
  const pMap = asRecord(pb.map);

  const pAppearance = asRecord(parsed.appearance);
  const pSectionVis = asRecord(parsed.sectionVisibility);
  const pHeaderEl = asRecord(parsed.headerElements);
  const pFooterEl = asRecord(parsed.footerElements);
  const pHeaderCfg = asRecord(parsed.headerConfig);
  const pFooterCfg = asRecord(parsed.footerConfig);
  const pFlashSale = asRecord(parsed.flashSale);
  const pAnnouncement = asRecord(parsed.announcement);
  const pDelivery = asRecord(parsed.delivery);

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const rawOpensAt = ensureString(pHours.opensAt, base.business.hours.opensAt);
  const rawClosesAt = ensureString(pHours.closesAt, base.business.hours.closesAt);

  const logoSymbolMode =
    pAppearance.logoSymbolMode === 'initials' ||
    pAppearance.logoSymbolMode === 'om' ||
    pAppearance.logoSymbolMode === 'cross' ||
    pAppearance.logoSymbolMode === 'rx' ||
    pAppearance.logoSymbolMode === 'custom_image'
      ? pAppearance.logoSymbolMode
      : (base.appearance.logoSymbolMode ?? 'initials');

  const logoBorderColor =
    pAppearance.logoBorderColor === 'gold' ||
    pAppearance.logoBorderColor === 'emerald' ||
    pAppearance.logoBorderColor === 'white'
      ? pAppearance.logoBorderColor
      : (base.appearance.logoBorderColor ?? 'gold');

  const logoShape =
    pAppearance.logoShape === 'squircle' ||
    pAppearance.logoShape === 'rounded' ||
    pAppearance.logoShape === 'circle' ||
    pAppearance.logoShape === 'shield'
      ? pAppearance.logoShape
      : (base.appearance.logoShape ?? 'squircle');

  const elementOrder =
    Array.isArray(pHeaderCfg.elementOrder) && pHeaderCfg.elementOrder.length > 0
      ? pHeaderCfg.elementOrder.filter((k): k is HeaderElementKey =>
          VALID_HEADER_ELEMENTS.includes(k as HeaderElementKey)
        )
      : base.headerConfig.elementOrder;

  const columnOrder =
    Array.isArray(pFooterCfg.columnOrder) && pFooterCfg.columnOrder.length > 0
      ? pFooterCfg.columnOrder.filter((k): k is FooterColumnKey =>
          VALID_FOOTER_COLUMNS.includes(k as FooterColumnKey)
        )
      : base.footerConfig.columnOrder;

  const navLinks =
    Array.isArray(pHeaderCfg.navLinks) && pHeaderCfg.navLinks.length > 0
      ? pHeaderCfg.navLinks.map((l, idx) => normalizeNavLink(l, idx, base.headerConfig.navLinks[idx]))
      : base.headerConfig.navLinks.map((l, idx) => normalizeNavLink(l, idx, l));

  const quickLinks =
    Array.isArray(pFooterCfg.quickLinks) && pFooterCfg.quickLinks.length > 0
      ? pFooterCfg.quickLinks.map((l, idx) =>
          normalizeFooterQuickLink(l, idx, base.footerConfig.quickLinks[idx])
        )
      : base.footerConfig.quickLinks.map((l, idx) => normalizeFooterQuickLink(l, idx, l));

  const isLegacySchema = typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion < 3;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    business: {
      name: ensureString(pb.name, base.business.name),
      shortName: ensureString(pb.shortName, base.business.shortName),
      tagline: ensureString(pb.tagline, base.business.tagline),
      subheadline: ensureString(pb.subheadline, base.business.subheadline),
      description: ensureString(pb.description, base.business.description),
      businessTypes: Array.isArray(pb.businessTypes)
        ? pb.businessTypes.map((t) => ensureString(t)).filter(Boolean)
        : base.business.businessTypes,
      hours: {
        opensAt: timeRegex.test(rawOpensAt) ? rawOpensAt : base.business.hours.opensAt,
        closesAt: timeRegex.test(rawClosesAt) ? rawClosesAt : base.business.hours.closesAt,
        display: ensureString(pHours.display, base.business.hours.display),
        daysSummary: ensureString(pHours.daysSummary, base.business.hours.daysSummary),
        statusOverride: normalizeStatusOverride(
          pHours.statusOverride,
          base.business.hours.statusOverride ?? 'auto'
        ),
      },
      contact: {
        primaryPhone: ensureString(pContact.primaryPhone, base.business.contact.primaryPhone),
        secondaryPhone: ensureString(pContact.secondaryPhone, base.business.contact.secondaryPhone),
        primaryPhoneDisplay: ensureString(
          pContact.primaryPhoneDisplay,
          base.business.contact.primaryPhoneDisplay
        ),
        secondaryPhoneDisplay: ensureString(
          pContact.secondaryPhoneDisplay,
          base.business.contact.secondaryPhoneDisplay
        ),
        primaryPhoneLabel: ensureString(
          pContact.primaryPhoneLabel,
          base.business.contact.primaryPhoneLabel
        ),
        secondaryPhoneLabel: ensureString(
          pContact.secondaryPhoneLabel,
          base.business.contact.secondaryPhoneLabel
        ),
        whatsappNumber: ensureString(pContact.whatsappNumber, base.business.contact.whatsappNumber),
        secondaryWhatsappNumber: ensureString(
          pContact.secondaryWhatsappNumber,
          base.business.contact.secondaryWhatsappNumber
        ),
        whatsappDefaultMessage: ensureString(
          pContact.whatsappDefaultMessage,
          base.business.contact.whatsappDefaultMessage
        ),
        email: ensureString(pContact.email, base.business.contact.email),
      },
      address: {
        building: ensureString(pAddr.building, base.business.address.building),
        area: ensureString(pAddr.area, base.business.address.area),
        city: ensureString(pAddr.city, base.business.address.city),
        state: ensureString(pAddr.state, base.business.address.state),
        pincode: ensureString(pAddr.pincode, base.business.address.pincode),
        country: ensureString(pAddr.country, base.business.address.country),
        fullAddress: ensureString(pAddr.fullAddress, base.business.address.fullAddress),
        landmarkNote: ensureString(pAddr.landmarkNote, base.business.address.landmarkNote),
      },
      map: {
        googleMapsSearchUrl: sanitizeSafeUrl(ensureString(pMap.googleMapsSearchUrl), {
          fallback: base.business.map.googleMapsSearchUrl,
        }),
        googleMapsDirectionsUrl: sanitizeSafeUrl(ensureString(pMap.googleMapsDirectionsUrl), {
          fallback: base.business.map.googleMapsDirectionsUrl,
        }),
        embedIframeUrl:
          typeof pMap.embedIframeUrl === 'string' && pMap.embedIframeUrl.trim()
            ? sanitizeMapEmbedInput(pMap.embedIframeUrl)
            : base.business.map.embedIframeUrl,
      },
    },
    appearance: {
      primaryGreen: ensureString(pAppearance.primaryGreen, base.appearance.primaryGreen),
      secondaryGreen: ensureString(pAppearance.secondaryGreen, base.appearance.secondaryGreen),
      lightGreen: ensureString(pAppearance.lightGreen, base.appearance.lightGreen),
      showAnnouncementBar: asBoolean(
        pAppearance.showAnnouncementBar,
        base.appearance.showAnnouncementBar
      ),
      showFloatingWhatsApp: asBoolean(
        pAppearance.showFloatingWhatsApp,
        base.appearance.showFloatingWhatsApp
      ),
      logoSymbolMode,
      customLogoUrl: sanitizeSafeUrl(ensureString(pAppearance.customLogoUrl, ''), {
        allowDataImage: true,
        fallback: '',
      }),
      logoBorderColor,
      logoShape,
    },
    sectionVisibility: {
      announcementBar: asBoolean(
        pSectionVis.announcementBar,
        base.sectionVisibility.announcementBar
      ),
      headerBar: asBoolean(pSectionVis.headerBar, base.sectionVisibility.headerBar),
      heroSection: asBoolean(pSectionVis.heroSection, base.sectionVisibility.heroSection),
      flashDealsSection: asBoolean(
        pSectionVis.flashDealsSection,
        base.sectionVisibility.flashDealsSection
      ),
      aboutSection: asBoolean(pSectionVis.aboutSection, base.sectionVisibility.aboutSection),
      categoriesSection: asBoolean(
        pSectionVis.categoriesSection,
        base.sectionVisibility.categoriesSection
      ),
      catalogueSection: asBoolean(
        pSectionVis.catalogueSection,
        base.sectionVisibility.catalogueSection
      ),
      deliverySection: asBoolean(
        pSectionVis.deliverySection,
        base.sectionVisibility.deliverySection
      ),
      gallerySection: asBoolean(pSectionVis.gallerySection, base.sectionVisibility.gallerySection),
      contactMapSection: asBoolean(
        pSectionVis.contactMapSection,
        base.sectionVisibility.contactMapSection
      ),
      footerSection: asBoolean(pSectionVis.footerSection, base.sectionVisibility.footerSection),
    },
    headerElements: {
      logo: asBoolean(pHeaderEl.logo, base.headerElements.logo),
      storeName: asBoolean(pHeaderEl.storeName, base.headerElements.storeName),
      navLinks: asBoolean(pHeaderEl.navLinks, base.headerElements.navLinks),
      liveStatusBadge: asBoolean(
        pHeaderEl.liveStatusBadge,
        base.headerElements.liveStatusBadge
      ),
      callButton: asBoolean(pHeaderEl.callButton, base.headerElements.callButton),
      whatsappButton: asBoolean(pHeaderEl.whatsappButton, base.headerElements.whatsappButton),
      cmsButton: asBoolean(pHeaderEl.cmsButton, base.headerElements.cmsButton),
    },
    footerElements: {
      brandColumn: asBoolean(pFooterEl.brandColumn, base.footerElements.brandColumn),
      quickLinksColumn: asBoolean(
        pFooterEl.quickLinksColumn,
        base.footerElements.quickLinksColumn
      ),
      hoursColumn: asBoolean(pFooterEl.hoursColumn, base.footerElements.hoursColumn),
      contactColumn: asBoolean(pFooterEl.contactColumn, base.footerElements.contactColumn),
      copyrightBar: asBoolean(pFooterEl.copyrightBar, base.footerElements.copyrightBar),
      ownerAccessButtons: asBoolean(
        pFooterEl.ownerAccessButtons,
        base.footerElements.ownerAccessButtons
      ),
    },
    headerConfig: {
      sticky: asBoolean(pHeaderCfg.sticky, base.headerConfig.sticky),
      compactMode: asBoolean(pHeaderCfg.compactMode, base.headerConfig.compactMode),
      callButtonText: ensureString(pHeaderCfg.callButtonText, base.headerConfig.callButtonText),
      whatsappButtonText: ensureString(
        pHeaderCfg.whatsappButtonText,
        base.headerConfig.whatsappButtonText
      ),
      cmsButtonText: ensureString(pHeaderCfg.cmsButtonText, base.headerConfig.cmsButtonText),
      showCallOnMobile: asBoolean(
        pHeaderCfg.showCallOnMobile,
        base.headerConfig.showCallOnMobile
      ),
      showWhatsAppOnMobile: asBoolean(
        pHeaderCfg.showWhatsAppOnMobile,
        base.headerConfig.showWhatsAppOnMobile
      ),
      showStatusOnMobile: asBoolean(
        pHeaderCfg.showStatusOnMobile,
        base.headerConfig.showStatusOnMobile
      ),
      elementOrder: elementOrder.length > 0 ? elementOrder : base.headerConfig.elementOrder,
      navLinks,
    },
    footerConfig: {
      columnOrder: columnOrder.length > 0 ? columnOrder : base.footerConfig.columnOrder,
      brandColumnTitle: ensureString(
        pFooterCfg.brandColumnTitle,
        base.footerConfig.brandColumnTitle
      ),
      quickLinksTitle: ensureString(
        pFooterCfg.quickLinksTitle,
        base.footerConfig.quickLinksTitle
      ),
      hoursTitle: ensureString(pFooterCfg.hoursTitle, base.footerConfig.hoursTitle),
      contactTitle: ensureString(pFooterCfg.contactTitle, base.footerConfig.contactTitle),
      copyrightSuffix: ensureString(
        pFooterCfg.copyrightSuffix,
        base.footerConfig.copyrightSuffix
      ),
      regulatoryNote: ensureString(pFooterCfg.regulatoryNote, base.footerConfig.regulatoryNote),
      showOnMobile: asBoolean(pFooterCfg.showOnMobile, base.footerConfig.showOnMobile),
      quickLinks,
    },
    flashSale: {
      enabled: asBoolean(pFlashSale.enabled, base.flashSale.enabled),
      autoPlay: asBoolean(pFlashSale.autoPlay, base.flashSale.autoPlay),
      showWelcomePopup: isLegacySchema
        ? true
        : asBoolean(pFlashSale.showWelcomePopup, base.flashSale.showWelcomePopup),
      intervalSeconds: asNumber(pFlashSale.intervalSeconds, base.flashSale.intervalSeconds),
      bannerTitle: ensureString(pFlashSale.bannerTitle, base.flashSale.bannerTitle),
      bannerSubtitle: ensureString(pFlashSale.bannerSubtitle, base.flashSale.bannerSubtitle),
      regulatoryDisclaimer: isLegacySchema
        ? base.flashSale.regulatoryDisclaimer
        : ensureString(pFlashSale.regulatoryDisclaimer, base.flashSale.regulatoryDisclaimer),
      offers: Array.isArray(pFlashSale.offers)
        ? pFlashSale.offers.map((o, idx) => normalizeFlashDealOffer(o, idx))
        : base.flashSale.offers.map((o, idx) => normalizeFlashDealOffer(o, idx)),
    },
    announcement: {
      enabled: asBoolean(pAnnouncement.enabled, base.announcement.enabled),
      badgeText: ensureString(pAnnouncement.badgeText, base.announcement.badgeText),
      speedSeconds: asNumber(pAnnouncement.speedSeconds, base.announcement.speedSeconds),
      items: Array.isArray(pAnnouncement.items)
        ? pAnnouncement.items.map((i) => ensureString(i)).filter(Boolean)
        : base.announcement.items,
    },
    delivery: {
      available: asBoolean(pDelivery.available, base.delivery.available),
      headline: ensureString(pDelivery.headline, base.delivery.headline),
      summary: ensureString(pDelivery.summary, base.delivery.summary),
      terms: Array.isArray(pDelivery.terms)
        ? pDelivery.terms.map((t) => ensureString(t)).filter(Boolean)
        : base.delivery.terms,
      coverageNote: ensureString(pDelivery.coverageNote, base.delivery.coverageNote),
      ctaLabel: ensureString(pDelivery.ctaLabel, base.delivery.ctaLabel),
    },
    categories: Array.isArray(parsed.categories)
      ? parsed.categories.map((c, idx) => normalizeCategory(c, idx))
      : base.categories.map((c, idx) => normalizeCategory(c, idx)),
    products: Array.isArray(parsed.products)
      ? parsed.products.map((p, idx) => normalizeProduct(p, idx))
      : base.products.map((p, idx) => normalizeProduct(p, idx)),
    gallery: Array.isArray(parsed.gallery)
      ? parsed.gallery.map((g, idx) => normalizeGalleryItem(g, idx))
      : base.gallery.map((g, idx) => normalizeGalleryItem(g, idx)),
  };
}

/**
 * Alias for normalizeStoreConfig to maintain full compatibility across all modules.
 */
export const migrateAndNormalizeConfig = normalizeStoreConfig;
