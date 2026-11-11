import {
  CURRENT_SCHEMA_VERSION,
  FlashDealItem,
  INITIAL_STORE_CONFIG,
  LiveStatusOverride,
  StoreConfig,
  StoreProduct,
} from '../config/storeConfig';
import {
  ensureString,
  migrateAndNormalizeConfig,
  normalizeStoreConfig,
  sanitizeMapEmbedInput,
  sanitizeSafeUrl,
} from '../config/configMigration';
import {
  isRestrictedRxOffer,
  ParsedConfigImport,
  parseImportedConfigContent,
  safeJsonParse,
   validateStoreConfig,
  ValidationIssue,
  ValidationResult,
} from '../config/configValidation';

export {
  ensureString,
  isRestrictedRxOffer,
  migrateAndNormalizeConfig,
  normalizeStoreConfig,
  parseImportedConfigContent,
  safeJsonParse,
  sanitizeMapEmbedInput,
  sanitizeSafeUrl,
  validateStoreConfig,
};
export type { ParsedConfigImport, ValidationIssue, ValidationResult, FlashDealItem, StoreProduct };

export interface LiveStoreStatus {
  isOpen: boolean;
  statusType: 'open' | 'closing-soon' | 'closed';
  badgeText: string;
  detailText: string;
  currentTimeIST: string;
  isOverridden?: boolean;
}

/**
 * Formats 24-hour time string ("07:30", "23:00") to 12-hour human readable ("7:30 AM", "11:00 PM").
 */
export function formatTime12(time24: string): string {
  const safeStr = ensureString(time24, '00:00');
  const parts = safeStr.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return safeStr;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Computes real-time store status in Indian Standard Time (Asia/Kolkata)
 * with optional owner manual override ('auto' | 'force_open' | 'force_closed').
 */
export function getLiveStoreStatus(
  opensAtStr: string,
  closesAtStr: string,
  statusOverride: LiveStatusOverride = 'auto',
  now: Date = new Date()
): LiveStoreStatus {
  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '12';
    const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '00';

    const currentHour = parseInt(hourPart, 10) % 24;
    const currentMinute = parseInt(minutePart, 10);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const [openH, openM] = ensureString(opensAtStr, '07:30').split(':').map(Number);
    const [closeH, closeM] = ensureString(closesAtStr, '23:00').split(':').map(Number);

    const openTotalMinutes = openH * 60 + openM;
    const closeTotalMinutes = closeH * 60 + closeM;

    const readableFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const currentTimeIST = `${readableFormatter.format(now).toUpperCase()} IST`;

    if (statusOverride === 'force_open') {
      return {
        isOpen: true,
        statusType: 'open',
        badgeText: 'Open Now',
        detailText: `Open until ${formatTime12(closesAtStr)}`,
        currentTimeIST,
        isOverridden: true,
      };
    }

    if (statusOverride === 'force_closed') {
      return {
        isOpen: false,
        statusType: 'closed',
        badgeText: 'Currently Closed',
        detailText: `Reopens at ${formatTime12(opensAtStr)}`,
        currentTimeIST,
        isOverridden: true,
      };
    }

    const isOpen =
      currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;

    if (isOpen) {
      const minutesRemaining = closeTotalMinutes - currentTotalMinutes;
      if (minutesRemaining <= 45) {
        return {
          isOpen: true,
          statusType: 'closing-soon',
          badgeText: 'Closing Soon',
          detailText: `Closes at ${formatTime12(closesAtStr)} (in ${minutesRemaining} mins)`,
          currentTimeIST,
        };
      }
      return {
        isOpen: true,
        statusType: 'open',
        badgeText: 'Open Now',
        detailText: `Open today until ${formatTime12(closesAtStr)}`,
        currentTimeIST,
      };
    }

    const opensToday = currentTotalMinutes < openTotalMinutes;
    return {
      isOpen: false,
      statusType: 'closed',
      badgeText: 'Currently Closed',
      detailText: opensToday
        ? `Opens today at ${formatTime12(opensAtStr)}`
        : `Opens tomorrow at ${formatTime12(opensAtStr)}`,
      currentTimeIST,
    };
  } catch {
    return {
      isOpen: true,
      statusType: 'open',
      badgeText: 'Open Daily',
      detailText: '7:30 AM – 11:00 PM IST',
      currentTimeIST: 'IST',
    };
  }
}

/**
 * Generates a sanitized WhatsApp deep link (`https://wa.me/...`).
 * Strips all non-digits (including `javascript:`, `data:`, spaces, symbols) and ensures a safe URL.
 */
export function createWhatsAppLink(numberRaw: string, message: string): string {
  const withoutDangerousPrefix = ensureString(numberRaw).replace(
    /^(?:javascript|vbscript|data):[^+0-9]*/i,
    ''
  );
  const digitsOnly = withoutDangerousPrefix.replace(/\D/g, '');
  const normalized =
    digitsOnly.length === 10
      ? `91${digitsOnly}`
      : digitsOnly.length > 12 && digitsOnly.slice(-12).startsWith('91')
        ? digitsOnly.slice(-12)
        : digitsOnly;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(ensureString(message))}`;
}

/**
 * Formats a 1-tap WhatsApp conversion message for a Flash Sale deal, including deal name,
 * coupon code, discount tag, and discounted offer price.
 */
export function createFlashDealWhatsAppMessage(
  storeName: string,
  deal: {
    title: string;
    discountBadge: string;
    couponCode?: string;
    offerPrice?: string;
    originalPrice?: string;
  }
): string {
  const parts: string[] = [
    `Hello ${ensureString(storeName)}, I would like to order / enquire about the Flash Deal: "${ensureString(deal.title)}" (${ensureString(deal.discountBadge)}).`,
  ];
  if (deal.couponCode?.trim()) {
    parts.push(`Coupon Code: ${deal.couponCode.trim().toUpperCase()}.`);
  }
  if (deal.offerPrice?.trim()) {
    parts.push(
      `Offer Price: ${deal.offerPrice.trim()}${
        deal.originalPrice?.trim() ? ` (MRP ${deal.originalPrice.trim()})` : ''
      }.`
    );
  }
  parts.push('Please confirm availability at the Manipal store.');
  return parts.join(' ');
}

/**
 * Extracts a percentage number (1–99) from a discount badge string such as "UP TO 15% OFF" or "FLAT 10% VALUE".
 */
export function extractDiscountPercent(badgeStr: string): number | null {
  const match = ensureString(badgeStr).match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return val > 0 && val < 100 ? val : null;
}

/**
 * Computes discounted offer price formatted in INR (e.g. "₹2,124") given an original price string and discount percentage.
 */
export function calculateOfferPrice(origPriceStr: string, percent: number): string {
  const numericStr = ensureString(origPriceStr).replace(/[^0-9.]/g, '');
  const origVal = parseFloat(numericStr);
  if (Number.isNaN(origVal) || origVal <= 0 || percent <= 0 || percent >= 100) return '';
  const discounted = Math.round(origVal * (1 - percent / 100));
  return `₹${discounted.toLocaleString('en-IN')}`;
}

/**
 * Calculates progressive rate-limiting lockout duration in seconds based on failed login attempts.
 * - >= 6 failed attempts -> 300 seconds (5 minutes)
 * - >= 4 failed attempts -> 45 seconds
 * - < 4 failed attempts -> 0 seconds
 */
export function calculateLockoutSeconds(failedAttempts: number): number {
  if (failedAttempts >= 6) return 300;
  if (failedAttempts >= 4) return 45;
  return 0;
}

/**
 * Constant-time string comparison (bitwise XOR accumulator over both byte length and character codes)
 * to prevent timing side-channel attacks — including early-exit length leaks — when comparing
 * cryptographic PBKDF2 hex digests.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const lenA = a.length;
  const lenB = b.length;
  // Seed XOR accumulator with length difference so length mismatches never short-circuit early
  let diff = lenA ^ lenB;
  // Uniform minimum 64-iteration loop (256-bit hex digest length)
  const loopBound = Math.max(lenA, lenB, 64);
  for (let i = 0; i < loopBound; i++) {
    const codeA = i < lenA ? a.charCodeAt(i) : 0;
    const codeB = i < lenB ? b.charCodeAt(i) : 0;
    diff |= codeA ^ codeB;
  }
  return lenA > 0 && lenB > 0 && diff === 0;
}

/**
 * Cryptographic PBKDF2-HMAC-SHA256 key derivation (100,000 iterations) using Web Crypto API.
 * Used as a client-side password/PIN hardening mechanism.
 */
export async function deriveSecureHash(secretPin: string, saltStr: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretPin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(saltStr),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a 256-bit cryptographically random hex token using Web Crypto CSPRNG.
 */
export function generateRandomHex(byteLength = 32): string {
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Builds the Schema.org Pharmacy, MedicalBusiness & LocalBusiness JSON-LD structured data object
 * dynamically synchronized with the active StoreConfig.
 */
export function buildPharmacySchemaJsonLd(
  cfg: StoreConfig,
  siteOrigin = 'https://ais-pre-o5i52wk4larejaem7ubiuv-984674103469.asia-southeast1.run.app'
): Record<string, unknown> {
  const cleanOrigin = siteOrigin.replace(/\/$/, '');
  const primaryDigits = ensureString(cfg.business.contact.primaryPhone).replace(/\D/g, '');
  const secondaryDigits = ensureString(cfg.business.contact.secondaryPhone).replace(/\D/g, '');
  const telephones = Array.from(
    new Set([
      primaryDigits ? `+91-${primaryDigits.slice(-10)}` : '+91-9632824134',
      secondaryDigits ? `+91-${secondaryDigits.slice(-10)}` : '+91-9632824134',
    ])
  );

  return {
    '@context': 'https://schema.org',
    '@type': ['Pharmacy', 'MedicalBusiness', 'LocalBusiness'],
    '@id': `${cleanOrigin}/#pharmacy`,
    name: cfg.business.name || 'Shri Sai Medical & General Store',
    alternateName: cfg.business.shortName || 'Shri Sai Medical Manipal',
    description:
      'Licensed pharmacy and general store in Adarsha Nagar, Manipal. 100% genuine medicines, prescription refills, baby care, surgical items, and fast home delivery across Manipal.',
    url: `${cleanOrigin}/`,
    image:
      cfg.gallery?.[0]?.imageUrl ||
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80&fm=webp',
    logo: `${cleanOrigin}/favicon.svg`,
    telephone: telephones,
    priceRange: '₹',
    paymentAccepted: 'Cash, UPI, Credit Card, Debit Card',
    currenciesAccepted: 'INR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${cfg.business.address.building}, ${cfg.business.address.area}`,
      addressLocality: cfg.business.address.city || 'Manipal',
      addressRegion: cfg.business.address.state || 'Karnataka',
      postalCode: cfg.business.address.pincode || '576104',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.3525,
      longitude: 74.7868,
    },
    hasMap: cfg.business.map.googleMapsSearchUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: cfg.business.hours.opensAt || '07:30',
        closes: cfg.business.hours.closesAt || '23:00',
      },
    ],
    areaServed: ['Manipal', 'Udupi', 'Adarsha Nagar', 'MIT Campus', 'KMC Manipal'],
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnInStore',
      returnFees: 'https://schema.org/FreeReturn',
    },
  };
}

/**
 * Generates the complete TypeScript source file for `src/config/storeConfig.ts`
 * so the store owner can permanently commit their configuration to static hosting.
 * Uses `./storeTypes` to avoid circular self-imports and re-exports all types so
 * replacing `src/config/storeConfig.ts` works immediately without manual edits.
 */
export function generateStoreConfigCode(cfg: StoreConfig = INITIAL_STORE_CONFIG): string {
  const normalized = normalizeStoreConfig(cfg);
  return `/**
 * ============================================================================
 * SHRI SAI MEDICAL & GENERAL STORE — CENTRAL STORE CONFIGURATION
 * ============================================================================
 * Single source of truth for business identity, hours, contacts, location,
 * header/footer controls, flash deals, announcements, delivery terms,
 * product categories, product catalogue, and store gallery.
 * Schema Version: ${normalized.schemaVersion || CURRENT_SCHEMA_VERSION}
 * ============================================================================
 */

import type { StoreConfig } from './storeTypes';
export * from './storeTypes';

export const INITIAL_STORE_CONFIG: StoreConfig = ${JSON.stringify(normalized, null, 2)};
`;
}
