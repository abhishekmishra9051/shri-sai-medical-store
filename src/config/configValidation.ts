import { FlashDealItem, StoreConfig, StoreProduct } from './storeTypes';
import { ensureString } from './configMigration';

/**
 * Checks whether a Flash Deal violates the Indian Drugs and Cosmetics Act by targeting
 * Schedule H, Schedule H1, Schedule X, Prescription-Only (Rx) categories/keywords,
 * or matching any product in the catalogue flagged with `isPrescription: true`.
 */
export function isRestrictedRxOffer(
  offer: Partial<FlashDealItem>,
  catalogueProducts: StoreProduct[] = []
): boolean {
  const combinedText = `${ensureString(offer.category)} ${ensureString(offer.title)} ${ensureString(
    offer.subtitle
  )}`.toLowerCase();

  const restrictedPatterns = [
    /\bprescription\b/i,
    /\bschedule\s*h1?\b/i,
    /\bschedule\s*x\b/i,
    /\brx\s*only\b/i,
    /\brx\s*required\b/i,
    /\brx\s*medicine/i,
  ];

  if (restrictedPatterns.some((regex) => regex.test(combinedText))) {
    return true;
  }

  // Cross-check against catalogue products marked with isPrescription: true
  const offerTitleLower = ensureString(offer.title).trim().toLowerCase();
  if (offerTitleLower) {
    for (const prod of catalogueProducts) {
      if (prod.isPrescription) {
        const prodNameLower = ensureString(prod.name).trim().toLowerCase();
        if (
          prodNameLower &&
          (offerTitleLower.includes(prodNameLower) || prodNameLower.includes(offerTitleLower))
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates a StoreConfig object for required business details, phone number formats,
 * valid hours, structural integrity, and pharmacy regulatory compliance (disallowing promotional discounts on Rx category).
 */
export function validateStoreConfig(config: StoreConfig): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return {
      valid: false,
      issues: [
        {
          field: 'root',
          severity: 'error',
          message: 'Root configuration must be a valid object.',
        },
      ],
    };
  }

  if (!ensureString(config?.business?.name).trim()) {
    issues.push({
      field: 'business.name',
      severity: 'error',
      message: 'Store name is required.',
    });
  }

  const primaryPhoneRaw = config?.business?.contact?.primaryPhone;
  if (typeof primaryPhoneRaw !== 'string' && typeof primaryPhoneRaw !== 'number') {
    issues.push({
      field: 'business.contact.primaryPhone',
      severity: 'error',
      message: 'Primary contact number must be a valid string.',
    });
  }
  const primaryDigits = ensureString(primaryPhoneRaw).replace(/\D/g, '');
  if (primaryDigits.length < 10 || primaryDigits.length > 15) {
    issues.push({
      field: 'business.contact.primaryPhone',
      severity: 'error',
      message: 'Primary contact number must contain 10 to 15 digits.',
    });
  }

  const waDigits = ensureString(config?.business?.contact?.whatsappNumber).replace(/\D/g, '');
  if (waDigits.length < 10 || waDigits.length > 15) {
    issues.push({
      field: 'business.contact.whatsappNumber',
      severity: 'error',
      message: 'Primary WhatsApp number must contain 10 to 15 digits.',
    });
  }

  if (!ensureString(config?.business?.address?.fullAddress).trim()) {
    issues.push({
      field: 'business.address.fullAddress',
      severity: 'error',
      message: 'Full store address is required.',
    });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(ensureString(config?.business?.hours?.opensAt))) {
    issues.push({
      field: 'business.hours.opensAt',
      severity: 'error',
      message: 'Opening time must be in valid 24-hour HH:mm format.',
    });
  }
  if (!timeRegex.test(ensureString(config?.business?.hours?.closesAt))) {
    issues.push({
      field: 'business.hours.closesAt',
      severity: 'error',
      message: 'Closing time must be in valid 24-hour HH:mm format.',
    });
  }

  if (!Array.isArray(config?.categories)) {
    issues.push({
      field: 'categories',
      severity: 'error',
      message: 'Categories must be an array.',
    });
  } else {
    for (const cat of config.categories) {
      if (!ensureString(cat.id).trim() || !ensureString(cat.title).trim()) {
        issues.push({
          field: `categories.${cat.id || 'unknown'}`,
          severity: 'error',
          message: 'Every category must have a valid id and title.',
        });
      }
    }
  }

  const productsList = Array.isArray(config?.products) ? config.products : [];
  if (!Array.isArray(config?.products)) {
    issues.push({
      field: 'products',
      severity: 'error',
      message: 'Products must be an array.',
    });
  } else {
    for (const prod of productsList) {
      if (!ensureString(prod.id).trim() || !ensureString(prod.name).trim()) {
        issues.push({
          field: `products.${prod.id || 'unknown'}`,
          severity: 'error',
          message: 'Every product in the catalogue must have a valid id and name.',
        });
      }
    }
  }

  if (!Array.isArray(config?.gallery)) {
    issues.push({
      field: 'gallery',
      severity: 'error',
      message: 'Gallery must be an array.',
    });
  }

  // Pharmacy compliance check: Flash sale offers must never target Prescription-only (Schedule H/H1/X) medicines
  for (const offer of config?.flashSale?.offers || []) {
    if (isRestrictedRxOffer(offer, productsList)) {
      issues.push({
        field: `flashSale.offers.${offer.id}`,
        severity: 'error',
        message: `Pharmacy Compliance Violation: Promotional offer "${offer.title}" cannot target Schedule H, H1, X, or prescription-only (Rx) medicines.`,
      });
    }
  }

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}

export interface ParsedConfigImport {
  ok: boolean;
  rawObject?: Record<string, unknown>;
  detectedFormat?: 'json' | 'typescript';
  detectedSchemaVersion?: number;
  error?: string;
}

/**
 * Safely parses JSON while stripping prototype pollution vectors (`__proto__`, `constructor`, `prototype`)
 * and enforcing a maximum payload size (default 2 MB).
 */
export function safeJsonParse<T = unknown>(rawJson: string, maxBytes = 2 * 1024 * 1024): T {
  if (typeof rawJson !== 'string') {
    throw new Error('Input payload must be a JSON string.');
  }
  if (rawJson.length > maxBytes) {
    throw new Error(`JSON payload exceeds maximum allowed size (${maxBytes} bytes).`);
  }
  const parsed = JSON.parse(rawJson, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Root JSON payload must be a valid configuration object.');
  }
  return parsed as T;
}

/**
 * Safely parses imported configuration content from either a .json file OR an exported storeConfig.ts file
 * without executing any JavaScript/TypeScript code (no eval or Function constructor).
 */
export function parseImportedConfigContent(rawText: string): ParsedConfigImport {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { ok: false, error: 'Imported file is empty.' };
  }

  const trimmed = rawText.trim();

  // 1. Try direct JSON parse first
  if (trimmed.startsWith('{')) {
    try {
      const parsed = safeJsonParse<Record<string, unknown>>(trimmed);
      const ver =
        typeof parsed.schemaVersion === 'number' ? (parsed.schemaVersion as number) : undefined;
      return {
        ok: true,
        rawObject: parsed,
        detectedFormat: 'json',
        detectedSchemaVersion: ver,
      };
    } catch (err) {
      return {
        ok: false,
        error: `Invalid JSON syntax: ${err instanceof Error ? err.message : 'Unable to parse JSON'}.`,
      };
    }
  }

  // 2. Check if it is an exported TypeScript configuration file (e.g., storeConfig.ts)
  // Matches `export const INITIAL_STORE_CONFIG: StoreConfig = { ... };` or `export const DEFAULT_STORE_CONFIG = { ... };`
  const tsExportMatch = trimmed.match(
    /export\s+const\s+(?:INITIAL_STORE_CONFIG|DEFAULT_STORE_CONFIG)\s*(?::\s*[A-Za-z0-9_<>]+\s*)?=\s*(\{[\s\S]*\})\s*;?\s*$/
  );

  if (tsExportMatch && tsExportMatch[1]) {
    const jsonCandidate = tsExportMatch[1].trim().replace(/;\s*$/, '');
    try {
      const parsed = safeJsonParse<Record<string, unknown>>(jsonCandidate);
      const ver =
        typeof parsed.schemaVersion === 'number' ? (parsed.schemaVersion as number) : undefined;
      return {
        ok: true,
        rawObject: parsed,
        detectedFormat: 'typescript',
        detectedSchemaVersion: ver,
      };
    } catch (err) {
      return {
        ok: false,
        error: `Could not parse TypeScript configuration object: ${
          err instanceof Error ? err.message : 'Invalid object format'
        }.`,
      };
    }
  }

  return {
    ok: false,
    error:
      'Unrecognized configuration format. Please upload a valid JSON backup (.json) or an exported storeConfig.ts file.',
  };
}
