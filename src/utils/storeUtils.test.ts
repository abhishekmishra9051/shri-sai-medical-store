import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPharmacySchemaJsonLd,
  calculateLockoutSeconds,
  calculateOfferPrice,
  constantTimeEqual,
  createFlashDealWhatsAppMessage,
  createWhatsAppLink,
  deriveSecureHash,
  extractDiscountPercent,
  generateRandomHex,
  generateStoreConfigCode,
  getLiveStoreStatus,
  isRestrictedRxOffer,
  migrateAndNormalizeConfig,
  normalizeStoreConfig,
  parseImportedConfigContent,
  safeJsonParse,
  sanitizeMapEmbedInput,
  sanitizeSafeUrl,
  validateStoreConfig,
} from './storeUtils';
import { CURRENT_SCHEMA_VERSION, INITIAL_STORE_CONFIG, StoreConfig } from '../config/storeConfig';
import { DEFAULT_STORE_CONFIG } from '../config/defaultStoreConfig';
import {
  LAST_KNOWN_GOOD_CONFIG_KEY,
  LEGACY_PUBLIC_CONFIG_KEY,
  OWNER_CMS_DRAFT_STORAGE_KEY,
  OWNER_PIN_HASH_KEY,
  PUBLISHED_VERSION_STORAGE_KEY,
  RELOAD_COOLDOWN_MS,
  StorageLike,
  canPerformSafeReload,
  checkForPublishedUpdate,
  computeConfigVersionHash,
  getBundledPublishedMetadata,
  reconcileConfigStorage,
  validateVersionManifest,
} from '../config/versioning';

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

// ============================================================================
// PHASE 1: AUTHENTICATION, ACCESS CONTROL & SESSION HARDENING
// ============================================================================
test('Phase 1.1: CSPRNG Salt Generation (256-bit / 32-byte uniqueness)', () => {
  const salt1 = generateRandomHex(32);
  const salt2 = generateRandomHex(32);
  assert.equal(salt1.length, 64); // 32 bytes = 64 hex chars (256 bits)
  assert.equal(salt2.length, 64);
  assert.notEqual(salt1, salt2);
  assert.match(salt1, /^[0-9a-f]{64}$/);
});

test('Phase 1.1: PBKDF2-HMAC-SHA256 100k Iteration Derivation & Length-Blind Constant-Time Comparison', async () => {
  const salt = generateRandomHex(32);
  const hash1 = await deriveSecureHash('987654', salt);
  const hash2 = await deriveSecureHash('987654', salt);
  const wrongHash = await deriveSecureHash('123456', salt);

  assert.equal(hash1.length, 64); // 256-bit SHA-256 output in hex
  assert.equal(constantTimeEqual(hash1, hash2), true);
  assert.equal(constantTimeEqual(hash1, wrongHash), false);
  assert.equal(constantTimeEqual(hash1, ''), false);
  assert.equal(constantTimeEqual('', hash1), false);
  assert.equal(constantTimeEqual('', ''), false);
  assert.equal(constantTimeEqual(hash1, hash1.slice(0, 62)), false);
  assert.equal(constantTimeEqual(hash1, hash1 + '00'), false);
});

test('Phase 2.4: Schema.org Pharmacy & MedicalBusiness JSON-LD Generator synchronization', () => {
  const jsonLd = buildPharmacySchemaJsonLd(
    INITIAL_STORE_CONFIG,
    'https://shrisaimedicalmanipal.com'
  );
  assert.deepEqual(jsonLd['@type'], ['Pharmacy', 'MedicalBusiness', 'LocalBusiness']);
  assert.equal(jsonLd.name, 'Shri Sai Medical & General Store');
  assert.deepEqual(jsonLd.telephone, ['+91-9632824134']);
  assert.equal(jsonLd.priceRange, '₹');
  assert.equal(jsonLd.currenciesAccepted, 'INR');
  assert.ok(Array.isArray(jsonLd.areaServed));
  assert.ok((jsonLd.areaServed as string[]).includes('Manipal'));
});

test('Phase 1.2: Progressive Rate-Limiting Lockout Escalation (45s @ 4, 300s @ 6)', () => {
  assert.equal(calculateLockoutSeconds(0), 0);
  assert.equal(calculateLockoutSeconds(1), 0);
  assert.equal(calculateLockoutSeconds(2), 0);
  assert.equal(calculateLockoutSeconds(3), 0);
  assert.equal(calculateLockoutSeconds(4), 45);
  assert.equal(calculateLockoutSeconds(5), 45);
  assert.equal(calculateLockoutSeconds(6), 300);
  assert.equal(calculateLockoutSeconds(10), 300);
});

// ============================================================================
// PHASE 2: SCHEMA INTEGRITY, STATE INJECTION & DATA PERSISTENCE
// ============================================================================
test('Phase 2.1: safeJsonParse defends against Prototype Pollution & Oversized Payloads', () => {
  const maliciousPayload =
    '{"__proto__":{"polluted":"yes"},"constructor":{"prototype":{"polluted":"yes"}},"business":{"name":"Shri Sai Medical"}}';
  const parsed = safeJsonParse<Record<string, unknown>>(maliciousPayload);

  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(parsed, '__proto__'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(parsed, 'constructor'), false);

  // Truncated / malformed JSON throws cleanly
  assert.throws(() => safeJsonParse('{"business": {"name": "Truncated'));

  // Oversized payload > maxBytes throws cleanly
  assert.throws(() => safeJsonParse('{"a":"' + 'x'.repeat(2048) + '"}', 512));
});

test('Phase 2.1: Schema Migration & Validation handles numeric phone fields & invalid time strings', () => {
  const dirtyConfig = {
    schemaVersion: 1,
    business: {
      name: 'Shri Sai Medical & General Store',
      contact: {
        primaryPhone: 8904018698, // Numeric injection instead of string
        whatsappNumber: 918904018698,
      },
      hours: {
        opensAt: '29:99', // Invalid 24h time
        closesAt: '23:00',
      },
    },
  };

  const normalized = migrateAndNormalizeConfig(dirtyConfig);
  assert.equal(typeof normalized.business.contact.primaryPhone, 'string');
  assert.equal(normalized.business.contact.primaryPhone, '8904018698');

  // If invalid hours are passed directly to validateStoreConfig, it rejects them
  const tamperedHours = structuredClone(INITIAL_STORE_CONFIG);
  tamperedHours.business.hours.opensAt = '29:99';
  const report = validateStoreConfig(tamperedHours);
  assert.equal(report.valid, false);
  assert.ok(report.issues.some((i) => i.field === 'business.hours.opensAt'));
});

test('Phase 2.2: URL Sanitization blocks javascript:, vbscript:, and data:text/html XSS vectors', () => {
  assert.equal(sanitizeSafeUrl('javascript:alert(document.cookie)'), '');
  assert.equal(sanitizeSafeUrl('  JaVaScRiPt:alert(1)  '), '');
  assert.equal(sanitizeSafeUrl('vbscript:msgbox(1)'), '');
  assert.equal(sanitizeSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), '');
  assert.equal(
    sanitizeSafeUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae'),
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae'
  );
  assert.equal(
    sanitizeSafeUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA', {
      allowDataImage: true,
    }),
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
  );

  // Map iframe sanitizer strips script/javascript: payloads and falls back to official Manipal embed
  assert.equal(
    sanitizeMapEmbedInput('<iframe src="javascript:alert(1)" onload="alert(2)"></iframe>'),
    INITIAL_STORE_CONFIG.business.map.embedIframeUrl
  );
  assert.equal(
    sanitizeMapEmbedInput(
      '<iframe src="https://www.google.com/maps?q=Manipal&output=embed"></iframe>'
    ),
    'https://www.google.com/maps?q=Manipal&output=embed'
  );
});

test('Phase 2.3: WhatsApp Deep-Link Sanitization strips foreign protocols & encodes message safely', () => {
  const link = createWhatsAppLink(
    'javascript:alert(1)//+91-89040-18698',
    'Hello <script>alert(1)</script> &Manipal=true'
  );
  assert.ok(link.startsWith('https://wa.me/918904018698?text='));
  assert.ok(!link.includes('javascript:'));
  assert.ok(!link.includes('<script>'));
  assert.ok(link.includes(encodeURIComponent('<script>alert(1)</script>')));
});

// ============================================================================
// PHASE 3: REGULATORY & PHARMACY COMPLIANCE ENGINE
// ============================================================================
test('Phase 3.1: Schedule H / H1 / X & Rx Discount Enforcement blocks restricted medicines', () => {
  const scheduleHDeal = {
    title: 'Azithromycin 500mg Antibiotic Offer',
    subtitle: 'Schedule H1 Antibiotic pack',
    category: 'OTC & Daily Wellness',
  };
  assert.equal(isRestrictedRxOffer(scheduleHDeal, INITIAL_STORE_CONFIG.products), true);

  const scheduleXDeal = {
    title: 'Schedule X Controlled Medication',
    subtitle: 'Special discount',
    category: 'General Store Essentials',
  };
  assert.equal(isRestrictedRxOffer(scheduleXDeal, INITIAL_STORE_CONFIG.products), true);

  // Cross-checks against an existing Rx product name in config.products even if 'Rx' is omitted from deal
  const rxProductMatchDeal = {
    title: 'Doctor-Prescribed Chronic & Acute Medicines',
    subtitle: '10% off monthly pack',
    category: 'Daily Wellness',
  };
  assert.equal(isRestrictedRxOffer(rxProductMatchDeal, INITIAL_STORE_CONFIG.products), true);

  // Valid OTC / Healthcare Device deal passes
  const validDeviceDeal = {
    title: 'Digital BP Monitor & Glucometer Combo',
    subtitle: 'Home blood pressure and sugar testing kit',
    category: 'Healthcare Devices',
  };
  assert.equal(isRestrictedRxOffer(validDeviceDeal, INITIAL_STORE_CONFIG.products), false);

  // Full store config validation fails if a restricted Rx deal is injected into flashSale.offers
  const tamperedConfig = structuredClone(INITIAL_STORE_CONFIG);
  tamperedConfig.flashSale.offers.push({
    id: 'deal-rx-illegal',
    title: 'Schedule H1 Antibiotic Flash Sale',
    subtitle: 'Flat 25% off',
    discountBadge: '25% OFF',
    originalPrice: '₹200',
    offerPrice: '₹150',
    validUntil: 'Today Only',
    category: 'Prescription Medicines (Rx)',
    imageUrl: '',
  });
  const validation = validateStoreConfig(tamperedConfig);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((iss) => iss.field.includes('flashSale.offers')));
});

// ============================================================================
// PHASE 4: COMPONENT LOGIC & EDGE CASE STRESS TESTING
// ============================================================================
test('Phase 4.1: Real-Time IST Business Hours Engine boundary timestamps & manual overrides', () => {
  // 2026-05-10T01:59:00Z === 07:29:00 AM IST -> Closed
  const at729IST = new Date('2026-05-10T01:59:00.000Z');
  const status729 = getLiveStoreStatus('07:30', '23:00', 'auto', at729IST);
  assert.equal(status729.isOpen, false);
  assert.equal(status729.statusType, 'closed');
  assert.equal(status729.badgeText, 'Currently Closed');

  // 2026-05-10T02:00:00Z === 07:30:00 AM IST -> Open Now
  const at730IST = new Date('2026-05-10T02:00:00.000Z');
  const status730 = getLiveStoreStatus('07:30', '23:00', 'auto', at730IST);
  assert.equal(status730.isOpen, true);
  assert.equal(status730.statusType, 'open');
  assert.equal(status730.badgeText, 'Open Now');

  // 2026-05-10T17:15:00Z === 10:45:00 PM IST (15 mins before 11:00 PM close) -> Closing Soon
  const at2245IST = new Date('2026-05-10T17:15:00.000Z');
  const status2245 = getLiveStoreStatus('07:30', '23:00', 'auto', at2245IST);
  assert.equal(status2245.isOpen, true);
  assert.equal(status2245.statusType, 'closing-soon');
  assert.equal(status2245.badgeText, 'Closing Soon');

  // 2026-05-10T17:30:00Z === 11:00:00 PM IST -> Closed
  const at2300IST = new Date('2026-05-10T17:30:00.000Z');
  const status2300 = getLiveStoreStatus('07:30', '23:00', 'auto', at2300IST);
  assert.equal(status2300.isOpen, false);
  assert.equal(status2300.statusType, 'closed');
  assert.equal(status2300.badgeText, 'Currently Closed');

  // Manual Overrides override IST schedule
  const forcedOpen = getLiveStoreStatus('07:30', '23:00', 'force_open', at2300IST);
  assert.equal(forcedOpen.isOpen, true);
  assert.equal(forcedOpen.isOverridden, true);

  const forcedClosed = getLiveStoreStatus('07:30', '23:00', 'force_closed', at730IST);
  assert.equal(forcedClosed.isOpen, false);
  assert.equal(forcedClosed.isOverridden, true);
});

test('Phase 4.2: Flash Deal Discount Calculator & Coupon WhatsApp Message formatting', () => {
  assert.equal(extractDiscountPercent('UP TO 15% OFF'), 15);
  assert.equal(calculateOfferPrice('₹1,000', 15), '₹850');

  const msg = createFlashDealWhatsAppMessage('Shri Sai Medical & General Store', {
    title: 'Digital BP Monitor Combo',
    discountBadge: '15% OFF',
    originalPrice: '₹2,650',
    offerPrice: '₹2,249',
    couponCode: 'BP15',
  });
  assert.ok(msg.includes('Digital BP Monitor Combo'));
  assert.ok(msg.includes('Coupon Code: BP15.'));
  assert.ok(msg.includes('₹2,249'));
});

// ============================================================================
// PHASE 5: CENTRAL STORE CONFIGURATION — EXPORT/IMPORT & NORMALIZATION SUITE
// ============================================================================
test('Phase 5.1: Default and Initial StoreConfig schema validity & equality', () => {
  assert.equal(INITIAL_STORE_CONFIG.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(DEFAULT_STORE_CONFIG.schemaVersion, CURRENT_SCHEMA_VERSION);

  const valInitial = validateStoreConfig(INITIAL_STORE_CONFIG);
  assert.equal(valInitial.valid, true);
  assert.equal(valInitial.issues.length, 0);

  const valDefault = validateStoreConfig(DEFAULT_STORE_CONFIG);
  assert.equal(valDefault.valid, true);
  assert.equal(valDefault.issues.length, 0);

  assert.deepEqual(normalizeStoreConfig(INITIAL_STORE_CONFIG), INITIAL_STORE_CONFIG);
  assert.deepEqual(normalizeStoreConfig(DEFAULT_STORE_CONFIG), INITIAL_STORE_CONFIG);
});

test('Phase 5.2: Exported TypeScript configuration round-trip & drop-in storeConfig.ts compatibility', () => {
  // Modify several fields in CMS state including Unicode & ₹ currency symbols
  const editedConfig: StoreConfig = structuredClone(INITIAL_STORE_CONFIG);
  editedConfig.business.tagline = 'Manipal’s Trusted 24×7 Health & Wellness Partner — ₹0 Delivery Fee';
  editedConfig.flashSale.offers[0].offerPrice = '₹1,999';
  editedConfig.appearance.primaryGreen = '#047857';

  // Generate TypeScript source code for src/config/storeConfig.ts
  const generatedTsCode = generateStoreConfigCode(editedConfig);

  // Verify exact structure required for direct replacement of src/config/storeConfig.ts
  assert.ok(generatedTsCode.includes("import type { StoreConfig } from './storeTypes';"));
  assert.ok(generatedTsCode.includes("export * from './storeTypes';"));
  assert.ok(generatedTsCode.includes('export const INITIAL_STORE_CONFIG: StoreConfig = {'));
  // Must NOT contain circular self-import from './storeConfig'
  assert.equal(generatedTsCode.includes("from './storeConfig'"), false);
  // Must NOT contain any undefined values
  assert.equal(generatedTsCode.includes(': undefined'), false);

  // Parse the generated .ts file back via parseImportedConfigContent
  const parsedTs = parseImportedConfigContent(generatedTsCode);
  assert.equal(parsedTs.ok, true);
  assert.equal(parsedTs.detectedFormat, 'typescript');
  assert.equal(parsedTs.detectedSchemaVersion, 3);

  const roundTripConfig = normalizeStoreConfig(parsedTs.rawObject);
  assert.deepEqual(roundTripConfig, editedConfig);
  assert.equal(
    roundTripConfig.business.tagline,
    'Manipal’s Trusted 24×7 Health & Wellness Partner — ₹0 Delivery Fee'
  );
  assert.equal(roundTripConfig.flashSale.offers[0].offerPrice, '₹1,999');
});

test('Phase 5.3: normalizeStoreConfig preserves empty products: [] and categories: [] arrays', () => {
  const emptyListsConfig = {
    ...structuredClone(INITIAL_STORE_CONFIG),
    categories: [],
    products: [],
    gallery: [],
    flashSale: {
      ...INITIAL_STORE_CONFIG.flashSale,
      offers: [],
    },
  };

  const normalized = normalizeStoreConfig(emptyListsConfig);
  assert.deepEqual(normalized.categories, []);
  assert.deepEqual(normalized.products, []);
  assert.deepEqual(normalized.gallery, []);
  assert.deepEqual(normalized.flashSale.offers, []);

  // Validation still passes when product or category arrays are intentionally empty
  const validation = validateStoreConfig(normalized);
  assert.equal(validation.valid, true);
});

test('Phase 5.4: normalizeStoreConfig fills missing nested objects and optional fields without undefined', () => {
  const partialLegacyConfig = {
    schemaVersion: 2,
    business: {
      name: 'Shri Sai Medical Custom Name',
      // Missing contact, hours, address, map
    },
    // Missing appearance, sectionVisibility, headerElements, footerElements, headerConfig, footerConfig
    products: [
      {
        id: 'prod-custom-1',
        name: 'Custom Thermometer ₹250',
        category: 'Healthcare Devices',
        description: 'Accurate digital reading',
        availability: 'In Stock',
        isPrescription: false,
        // packInfo and imageUrl omitted
      },
    ],
  };

  const normalized = normalizeStoreConfig(partialLegacyConfig);
  assert.equal(normalized.schemaVersion, 3);
  assert.equal(normalized.business.name, 'Shri Sai Medical Custom Name');
  assert.equal(normalized.business.contact.primaryPhone, '9632824134');
  assert.equal(normalized.business.address.pincode, '576104');
  assert.equal(normalized.products.length, 1);
  assert.equal(normalized.products[0].name, 'Custom Thermometer ₹250');
  assert.equal(normalized.products[0].packInfo, '');
  assert.equal(normalized.products[0].imageUrl, '');

  // Verify JSON serialization produces zero undefined values and round-trips identically
  const jsonStr = JSON.stringify(normalized);
  const reparsed = parseImportedConfigContent(jsonStr);
  assert.equal(reparsed.ok, true);
  assert.equal(reparsed.detectedFormat, 'json');
  assert.deepEqual(normalizeStoreConfig(reparsed.rawObject), normalized);
});

// ============================================================================
// PHASE 6: GLOBAL CONFIGURATION VERSIONING, STORAGE RECONCILIATION & LIVE SYNC
// ============================================================================
test('Phase 6.1: Deterministic computeConfigVersionHash stability & change sensitivity', () => {
  const hash1 = computeConfigVersionHash(INITIAL_STORE_CONFIG);
  const hash2 = computeConfigVersionHash(structuredClone(INITIAL_STORE_CONFIG));
  assert.equal(hash1, hash2);
  assert.match(hash1, /^cfg-v3-[0-9a-f]{16}$/);

  const modifiedConfig = structuredClone(INITIAL_STORE_CONFIG);
  modifiedConfig.business.tagline = 'Updated Manipal Pharmacy Tagline';
  const hash3 = computeConfigVersionHash(modifiedConfig);
  assert.notEqual(hash1, hash3);
});

test('Phase 6.2: First-time visitor receives latest deployed configuration and stores version metadata', () => {
  const storage = new MemoryStorage();
  const bundledMeta = getBundledPublishedMetadata(INITIAL_STORE_CONFIG);

  const reconciled = reconcileConfigStorage(INITIAL_STORE_CONFIG, bundledMeta, storage);
  assert.deepEqual(reconciled.publishedConfig, INITIAL_STORE_CONFIG);
  assert.deepEqual(reconciled.publishedMetadata, bundledMeta);
  assert.equal(reconciled.savedDraft, null);
  assert.equal(reconciled.wasUpdatedFromOlderDeployment, false);

  const storedVerRaw = storage.getItem(PUBLISHED_VERSION_STORAGE_KEY);
  assert.ok(storedVerRaw);
  const storedVer = validateVersionManifest(JSON.parse(storedVerRaw));
  assert.equal(storedVer.valid, true);
  assert.equal(storedVer.manifest?.configVersion, bundledMeta.configVersion);
});

test('Phase 6.3: Returning visitor with old LocalStorage config never overrides new deployment', () => {
  const storage = new MemoryStorage();

  // Simulate an old visitor who has stale data in legacy `shri_sai_store_config_v4`
  // and an older published version record in LocalStorage
  const staleConfig = structuredClone(INITIAL_STORE_CONFIG);
  staleConfig.business.name = 'STALE CACHED MEDICAL STORE NAME';
  staleConfig.announcement.badgeText = 'EXPIRED OLD PROMOTION FROM LAST MONTH';
  storage.setItem(LEGACY_PUBLIC_CONFIG_KEY, JSON.stringify(staleConfig));
  storage.setItem(
    PUBLISHED_VERSION_STORAGE_KEY,
    JSON.stringify({
      configVersion: 'cfg-v3-0000000000000001',
      schemaVersion: 3,
      publishedAt: '2026-01-01T00:00:00.000Z',
      buildId: 'build-old-0001',
    })
  );

  // Now a new deployment arrives
  const newDeployedConfig = structuredClone(INITIAL_STORE_CONFIG);
  newDeployedConfig.business.tagline = 'Freshly Deployed Manipal Store Configuration';
  const newMeta = getBundledPublishedMetadata(newDeployedConfig);

  const reconciled = reconcileConfigStorage(newDeployedConfig, newMeta, storage);

  // Returning visitor MUST receive the newly deployed config, NOT the stale LocalStorage config
  assert.equal(reconciled.publishedConfig.business.name, 'Shri Sai Medical & General Store');
  assert.equal(
    reconciled.publishedConfig.business.tagline,
    'Freshly Deployed Manipal Store Configuration'
  );
  assert.equal(reconciled.wasUpdatedFromOlderDeployment, true);
  assert.equal(reconciled.savedDraft, null);
  // Stale legacy key must be cleaned up
  assert.equal(storage.getItem(LEGACY_PUBLIC_CONFIG_KEY), null);
});

test('Phase 6.4: Owner unpublished draft is preserved across deployments & legacy owner config migrates safely', () => {
  const storage = new MemoryStorage();

  // Simulate store owner browser (has custom PIN hash) with legacy unpublished edits
  storage.setItem(OWNER_PIN_HASH_KEY, 'salt:hash');
  const ownerLegacyDraft = structuredClone(INITIAL_STORE_CONFIG);
  ownerLegacyDraft.business.tagline = 'Owner Unpublished Local Draft Tagline';
  storage.setItem(LEGACY_PUBLIC_CONFIG_KEY, JSON.stringify(ownerLegacyDraft));

  const bundledMeta = getBundledPublishedMetadata(INITIAL_STORE_CONFIG);
  const reconciled1 = reconcileConfigStorage(INITIAL_STORE_CONFIG, bundledMeta, storage);

  // Public publishedConfig still reflects the official deployment
  assert.equal(reconciled1.publishedConfig.business.tagline, INITIAL_STORE_CONFIG.business.tagline);
  // But the owner's unpublished edits were safely migrated into `savedDraft`
  assert.equal(reconciled1.migratedLegacyDraft, true);
  assert.ok(reconciled1.savedDraft);
  assert.equal(
    reconciled1.savedDraft?.draftConfig.business.tagline,
    'Owner Unpublished Local Draft Tagline'
  );
  assert.equal(storage.getItem(LEGACY_PUBLIC_CONFIG_KEY), null);

  // Next, simulate another public deployment while owner still has that unpublished draft
  const secondDeployment = structuredClone(INITIAL_STORE_CONFIG);
  secondDeployment.announcement.badgeText = 'New Public Announcement Live!';
  const secondMeta = getBundledPublishedMetadata(secondDeployment);

  const reconciled2 = reconcileConfigStorage(secondDeployment, secondMeta, storage);
  assert.equal(
    reconciled2.publishedConfig.announcement.badgeText,
    'New Public Announcement Live!'
  );
  // Owner's unpublished draft is still preserved
  assert.ok(reconciled2.savedDraft);
  assert.equal(
    reconciled2.savedDraft?.draftConfig.business.tagline,
    'Owner Unpublished Local Draft Tagline'
  );

  // Finally, when the owner publishes their draft (so the deployed config equals the draft),
  // reconcileConfigStorage automatically clears the redundant draft record
  const publishedDraftMeta = getBundledPublishedMetadata(ownerLegacyDraft);
  const reconciled3 = reconcileConfigStorage(ownerLegacyDraft, publishedDraftMeta, storage);
  assert.equal(reconciled3.savedDraft, null);
  assert.equal(storage.getItem(OWNER_CMS_DRAFT_STORAGE_KEY), null);
});

test('Phase 6.5: Live update detection fetches /version.json & /published-config.json with no-store cache headers', async () => {
  const currentMeta = getBundledPublishedMetadata(INITIAL_STORE_CONFIG);

  const remoteConfig = structuredClone(INITIAL_STORE_CONFIG);
  remoteConfig.business.tagline = 'Live Remote Deployment Tagline — Instant Sync';
  remoteConfig.flashSale.offers[0].offerPrice = '₹2,099';
  const remoteMeta = {
    configVersion: computeConfigVersionHash(remoteConfig),
    schemaVersion: 3,
    publishedAt: '2026-11-11T10:00:00.000Z',
    buildId: 'build-live-sync-999',
  };

  const requestedUrls: string[] = [];
  const requestedInit: RequestInit[] = [];

  const mockFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    requestedUrls.push(url);
    if (init) requestedInit.push(init);

    if (url.startsWith('/version.json')) {
      return new Response(JSON.stringify(remoteMeta), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.startsWith('/published-config.json')) {
      return new Response(JSON.stringify(remoteConfig), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Not Found', { status: 404 });
  };

  const outcome = await checkForPublishedUpdate(currentMeta, { fetchImpl: mockFetch });
  assert.equal(outcome.status, 'update_ready');
  if (outcome.status === 'update_ready') {
    assert.equal(outcome.metadata.configVersion, remoteMeta.configVersion);
    assert.equal(outcome.metadata.buildId, 'build-live-sync-999');
    assert.equal(
      outcome.config.business.tagline,
      'Live Remote Deployment Tagline — Instant Sync'
    );
    assert.equal(outcome.config.flashSale.offers[0].offerPrice, '₹2,099');
  }

  // Verify cache-busting query string and no-store cache headers were sent
  assert.equal(requestedUrls.length, 2);
  assert.ok(requestedUrls[0].includes('/version.json?_cb='));
  assert.ok(requestedUrls[1].includes('/published-config.json?_cb='));
  assert.equal(requestedInit[0].cache, 'no-store');

  // Calling checkForPublishedUpdate again with the updated metadata reports `up_to_date`
  const secondOutcome = await checkForPublishedUpdate(remoteMeta, { fetchImpl: mockFetch });
  assert.equal(secondOutcome.status, 'up_to_date');
});

test('Phase 6.6: Offline resilience, invalid version manifest handling & invalid remote config rejection', async () => {
  const currentMeta = getBundledPublishedMetadata(INITIAL_STORE_CONFIG);

  // 1. Offline / network failure does not throw or corrupt state
  const offlineOutcome = await checkForPublishedUpdate(currentMeta, {
    fetchImpl: async () => {
      throw new Error('Failed to fetch (offline)');
    },
  });
  assert.equal(offlineOutcome.status, 'offline_or_unreachable');

  // 2. HTTP 502 Bad Gateway handled gracefully
  const gatewayErrorOutcome = await checkForPublishedUpdate(currentMeta, {
    fetchImpl: async () => new Response('Bad Gateway', { status: 502 }),
  });
  assert.equal(gatewayErrorOutcome.status, 'offline_or_unreachable');

  // 3. Invalid / malformed version manifest rejected cleanly
  const badManifestOutcome = await checkForPublishedUpdate(currentMeta, {
    fetchImpl: async () =>
      new Response(JSON.stringify({ configVersion: '', buildId: null }), { status: 200 }),
  });
  assert.equal(badManifestOutcome.status, 'invalid_manifest');

  // 4. Remote config that fails pharmacy regulatory validation (e.g. restricted Rx flash deal) is rejected
  const illegalRemoteConfig = structuredClone(INITIAL_STORE_CONFIG);
  illegalRemoteConfig.flashSale.offers.push({
    id: 'illegal-rx',
    title: 'Schedule H1 Antibiotic Flash Discount',
    subtitle: '20% off prescription antibiotic',
    discountBadge: '20% OFF',
    originalPrice: '₹300',
    offerPrice: '₹240',
    validUntil: 'Today',
    category: 'Prescription Medicines (Rx)',
    imageUrl: '',
  });

  const illegalConfigOutcome = await checkForPublishedUpdate(currentMeta, {
    fetchImpl: async (input) => {
      const url = String(input);
      if (url.startsWith('/version.json')) {
        return new Response(
          JSON.stringify({
            configVersion: 'cfg-v3-illegal999999999',
            schemaVersion: 3,
            publishedAt: '2026-11-12T00:00:00.000Z',
            buildId: 'build-illegal-999',
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify(illegalRemoteConfig), { status: 200 });
    },
  });
  assert.equal(illegalConfigOutcome.status, 'invalid_remote_config');
});

test('Phase 6.7: Reload loop protection prevents repeated reloads for same buildId/configVersion', () => {
  const sessionStore = new MemoryStorage();
  const t0 = 1_700_000_000_000;

  // First reload for build-101 is allowed
  assert.equal(canPerformSafeReload('build-101', 'cfg-v3-aaaa', sessionStore, t0), true);

  // Second reload for same build-101 within 60s cooldown is blocked (prevents infinite loop)
  assert.equal(canPerformSafeReload('build-101', 'cfg-v3-aaaa', sessionStore, t0 + 5_000), false);
  assert.equal(canPerformSafeReload('build-101', 'cfg-v3-aaaa', sessionStore, t0 + 59_000), false);

  // A different deployment build-102 is immediately allowed even within the cooldown window
  assert.equal(canPerformSafeReload('build-102', 'cfg-v3-bbbb', sessionStore, t0 + 10_000), true);

  // After cooldown expires (> 60s), reload is allowed again
  assert.equal(
    canPerformSafeReload(
      'build-102',
      'cfg-v3-bbbb',
      sessionStore,
      t0 + 10_000 + RELOAD_COOLDOWN_MS + 100
    ),
    true
  );
});

test('Phase 6.8: Cached live-updated published configuration survives page reload when JS bundle is cached', () => {
  const storage = new MemoryStorage();
  const bundledMeta = getBundledPublishedMetadata(INITIAL_STORE_CONFIG);

  // Suppose live update polling previously saved a newer published configuration into LAST_KNOWN_GOOD_CONFIG_KEY
  const liveUpdatedConfig = structuredClone(INITIAL_STORE_CONFIG);
  liveUpdatedConfig.business.tagline = 'Live Updated Config Persisted Across Reload';
  const liveMeta = {
    configVersion: computeConfigVersionHash(liveUpdatedConfig),
    schemaVersion: 3,
    publishedAt: '2026-11-12T12:00:00.000Z',
    buildId: 'build-live-persisted-777',
  };

  storage.setItem(
    LAST_KNOWN_GOOD_CONFIG_KEY,
    JSON.stringify({
      metadata: liveMeta,
      config: liveUpdatedConfig,
      bundledVersionAtSave: bundledMeta.configVersion,
    })
  );

  const reconciled = reconcileConfigStorage(INITIAL_STORE_CONFIG, bundledMeta, storage);
  assert.equal(
    reconciled.publishedConfig.business.tagline,
    'Live Updated Config Persisted Across Reload'
  );
  assert.equal(reconciled.publishedMetadata.configVersion, liveMeta.configVersion);
});

