/**
 * ============================================================================
 * SHRI SAI MEDICAL & GENERAL STORE — CONFIGURATION VERSIONING & UPDATE ENGINE
 * ============================================================================
 * Manages:
 * 1. Deterministic PublishedConfigMetadata (configVersion, buildId, schemaVersion, publishedAt)
 * 2. Strict separation between Published Configuration (public visitors) and
 *    Local CMS Drafts (unpublished owner edits in LocalStorage)
 * 3. Safe migration of legacy LocalStorage records without losing owner drafts
 * 4. Live deployment update detection via /version.json and /published-config.json
 * 5. Reload loop protection and service worker update synchronization
 * ============================================================================
 */

import {
  CURRENT_SCHEMA_VERSION,
  INITIAL_STORE_CONFIG,
  LocalCmsDraftRecord,
  PublishedConfigMetadata,
  StoreConfig,
} from './storeConfig';
import { normalizeStoreConfig } from './configMigration';
import { safeJsonParse, validateStoreConfig } from './configValidation';

export const PUBLISHED_VERSION_STORAGE_KEY = 'shri_sai_published_version_v1';
export const LAST_KNOWN_GOOD_CONFIG_KEY = 'shri_sai_published_config_cache_v1';
export const OWNER_CMS_DRAFT_STORAGE_KEY = 'shri_sai_owner_cms_draft_v1';
export const LEGACY_PUBLIC_CONFIG_KEY = 'shri_sai_store_config_v4';
export const OWNER_PIN_HASH_KEY = 'shri_sai_custom_pin_hash_v4';
export const RELOAD_GUARD_SESSION_KEY = 'shri_sai_reload_guard_v1';

export const DEFAULT_UPDATE_POLL_INTERVAL_MS = 60_000; // 60 seconds
export const MIN_UPDATE_CHECK_THROTTLE_MS = 3_000; // Minimum 3s between rapid focus/visibility checks
export const RELOAD_COOLDOWN_MS = 60_000; // 60 seconds loop guard

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Computes a deterministic 64-bit hex fingerprint (`cfg-v3-<16-hex-chars>`) over the
 * canonical normalized StoreConfig. Remains 100% identical across renders for the same
 * configuration and changes immediately whenever any field in StoreConfig changes.
 */
export function computeConfigVersionHash(config: StoreConfig): string {
  const normalized = normalizeStoreConfig(config);
  const canonicalJson = JSON.stringify(normalized);

  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;

  for (let i = 0; i < canonicalJson.length; i++) {
    const ch = canonicalJson.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch ^ (i & 0xff);
    h2 = Math.imul(h2, 0x811c9dc5);
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `cfg-v${normalized.schemaVersion || CURRENT_SCHEMA_VERSION}-${hex1}${hex2}`;
}

declare global {
  interface Window {
    __PUBLISHED_CONFIG_METADATA__?: PublishedConfigMetadata;
  }
}

/**
 * Returns the PublishedConfigMetadata for the currently bundled `INITIAL_STORE_CONFIG`.
 * Uses build-time metadata if injected, while always verifying `configVersion` against
 * the actual `config` object so replaced `storeConfig.ts` files immediately get a fresh version.
 */
export function getBundledPublishedMetadata(
  config: StoreConfig = INITIAL_STORE_CONFIG
): PublishedConfigMetadata {
  const computedConfigVersion = computeConfigVersionHash(config);
  let injected: PublishedConfigMetadata | undefined =
    typeof window !== 'undefined' && window.__PUBLISHED_CONFIG_METADATA__
      ? window.__PUBLISHED_CONFIG_METADATA__
      : undefined;

  if (!injected && typeof document !== 'undefined') {
    const metaEl = document.getElementById('store-version-manifest');
    if (metaEl) {
      const contentVer = metaEl.getAttribute('content') || '';
      const buildId = metaEl.getAttribute('data-build-id') || '';
      const publishedAt = metaEl.getAttribute('data-published-at') || '';
      const schemaVer = Number(metaEl.getAttribute('data-schema-version') || CURRENT_SCHEMA_VERSION);
      if (contentVer && buildId && publishedAt) {
        injected = {
          configVersion: contentVer,
          buildId,
          publishedAt,
          schemaVersion: Number.isFinite(schemaVer) ? schemaVer : CURRENT_SCHEMA_VERSION,
        };
      }
    }
  }

  if (injected && injected.configVersion === computedConfigVersion) {
    return {
      configVersion: computedConfigVersion,
      schemaVersion: config.schemaVersion || CURRENT_SCHEMA_VERSION,
      publishedAt: injected.publishedAt || '2026-11-10T09:40:00.000Z',
      buildId: injected.buildId || `build-${computedConfigVersion.slice(-12)}`,
    };
  }

  return {
    configVersion: computedConfigVersion,
    schemaVersion: config.schemaVersion || CURRENT_SCHEMA_VERSION,
    publishedAt: injected?.publishedAt || '2026-11-10T09:40:00.000Z',
    buildId: `build-${computedConfigVersion.slice(-12)}`,
  };
}

export interface VersionManifestValidation {
  valid: boolean;
  manifest?: PublishedConfigMetadata;
  error?: string;
}

/**
 * Validates a raw `/version.json` manifest object.
 */
export function validateVersionManifest(raw: unknown): VersionManifestValidation {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Version manifest must be a valid JSON object.' };
  }

  const rec = raw as Record<string, unknown>;
  const configVersion = typeof rec.configVersion === 'string' ? rec.configVersion.trim() : '';
  const buildId = typeof rec.buildId === 'string' ? rec.buildId.trim() : '';
  const publishedAt = typeof rec.publishedAt === 'string' ? rec.publishedAt.trim() : '';
  const schemaVersion = typeof rec.schemaVersion === 'number' ? rec.schemaVersion : NaN;

  if (!configVersion) {
    return { valid: false, error: 'Version manifest is missing a valid configVersion string.' };
  }
  if (!buildId) {
    return { valid: false, error: 'Version manifest is missing a valid buildId string.' };
  }
  if (!publishedAt) {
    return { valid: false, error: 'Version manifest is missing a valid publishedAt timestamp.' };
  }
  if (!Number.isFinite(schemaVersion) || schemaVersion < 1) {
    return { valid: false, error: 'Version manifest has an invalid schemaVersion number.' };
  }

  return {
    valid: true,
    manifest: {
      configVersion,
      buildId,
      publishedAt,
      schemaVersion,
    },
  };
}

interface CachedPublishedBundle {
  metadata: PublishedConfigMetadata;
  config: StoreConfig;
  bundledVersionAtSave: string;
}

export interface ReconciledStorageResult {
  publishedConfig: StoreConfig;
  publishedMetadata: PublishedConfigMetadata;
  savedDraft: LocalCmsDraftRecord | null;
  wasUpdatedFromOlderDeployment: boolean;
  migratedLegacyDraft: boolean;
}

/**
 * Reconciles browser LocalStorage with the deployed configuration on startup:
 * 1. Ensures ordinary visitors ALWAYS receive the latest Published Configuration.
 * 2. Never allows old visitor LocalStorage (`shri_sai_store_config_v4`) to override a deployment.
 * 3. If the browser belongs to the store owner (has an Owner PIN configured) and had unpublished
 *    changes in `shri_sai_store_config_v4`, migrates them safely into `shri_sai_owner_cms_draft_v1`.
 * 4. Preserves any existing unpublished Owner CMS draft in `shri_sai_owner_cms_draft_v1` without
 *    overriding the public storefront for visitors.
 */
export function reconcileConfigStorage(
  bundledConfig: StoreConfig = INITIAL_STORE_CONFIG,
  bundledMetadata: PublishedConfigMetadata = getBundledPublishedMetadata(bundledConfig),
  storage?: StorageLike | null
): ReconciledStorageResult {
  const normalizedBundled = normalizeStoreConfig(bundledConfig);
  const effectiveStorage: StorageLike | null =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : null;

  if (!effectiveStorage) {
    return {
      publishedConfig: normalizedBundled,
      publishedMetadata: bundledMetadata,
      savedDraft: null,
      wasUpdatedFromOlderDeployment: false,
      migratedLegacyDraft: false,
    };
  }

  let storedVersion: PublishedConfigMetadata | null = null;
  try {
    const rawVer = effectiveStorage.getItem(PUBLISHED_VERSION_STORAGE_KEY);
    if (rawVer) {
      const parsedVer = validateVersionManifest(safeJsonParse(rawVer));
      if (parsedVer.valid && parsedVer.manifest) {
        storedVersion = parsedVer.manifest;
      }
    }
  } catch {
    // Ignore corrupted version record
  }

  // Check if we have a live-polled published config that is newer than a cached JS bundle
  let activePublishedConfig = normalizedBundled;
  let activePublishedMetadata = bundledMetadata;

  try {
    const rawCache = effectiveStorage.getItem(LAST_KNOWN_GOOD_CONFIG_KEY);
    if (rawCache) {
      const parsedCache = safeJsonParse<CachedPublishedBundle>(rawCache);
      const validMeta = validateVersionManifest(parsedCache?.metadata);
      if (
        validMeta.valid &&
        validMeta.manifest &&
        parsedCache?.config &&
        parsedCache.bundledVersionAtSave === bundledMetadata.configVersion &&
        validMeta.manifest.configVersion !== bundledMetadata.configVersion
      ) {
        const candidateConfig = normalizeStoreConfig(parsedCache.config);
        if (validateStoreConfig(candidateConfig).valid) {
          activePublishedConfig = candidateConfig;
          activePublishedMetadata = validMeta.manifest;
        }
      }
    }
  } catch {
    // Ignore corrupted cache
  }

  const wasUpdatedFromOlderDeployment = Boolean(
    storedVersion &&
      (storedVersion.configVersion !== activePublishedMetadata.configVersion ||
        storedVersion.buildId !== activePublishedMetadata.buildId)
  );

  // Migrate or discard legacy `shri_sai_store_config_v4`
  let migratedLegacyDraft = false;
  try {
    const rawLegacy = effectiveStorage.getItem(LEGACY_PUBLIC_CONFIG_KEY);
    if (rawLegacy) {
      const hasOwnerPin = Boolean(effectiveStorage.getItem(OWNER_PIN_HASH_KEY));
      const existingDraftRaw = effectiveStorage.getItem(OWNER_CMS_DRAFT_STORAGE_KEY);

      if (hasOwnerPin && !existingDraftRaw) {
        try {
          const parsedLegacy = normalizeStoreConfig(safeJsonParse(rawLegacy));
          if (
            validateStoreConfig(parsedLegacy).valid &&
            JSON.stringify(parsedLegacy) !== JSON.stringify(activePublishedConfig)
          ) {
            const migratedRecord: LocalCmsDraftRecord = {
              draftConfig: parsedLegacy,
              baseConfigVersion:
                storedVersion?.configVersion || activePublishedMetadata.configVersion,
              updatedAt: new Date().toISOString(),
            };
            effectiveStorage.setItem(
              OWNER_CMS_DRAFT_STORAGE_KEY,
              JSON.stringify(migratedRecord)
            );
            migratedLegacyDraft = true;
          }
        } catch {
          // Ignore malformed legacy config
        }
      }
      // Always remove legacy public override key so it never blocks new deployments
      effectiveStorage.removeItem(LEGACY_PUBLIC_CONFIG_KEY);
    }
  } catch {
    // Ignore storage access errors
  }

  // Load and normalize any saved Owner CMS draft
  let savedDraft: LocalCmsDraftRecord | null = null;
  try {
    const rawDraft = effectiveStorage.getItem(OWNER_CMS_DRAFT_STORAGE_KEY);
    if (rawDraft) {
      const parsedDraft = safeJsonParse<Partial<LocalCmsDraftRecord>>(rawDraft);
      if (parsedDraft && parsedDraft.draftConfig) {
        const normalizedDraft = normalizeStoreConfig(parsedDraft.draftConfig);
        if (validateStoreConfig(normalizedDraft).valid) {
          // If the saved draft is now identical to the newly published config, the draft was published!
          if (JSON.stringify(normalizedDraft) === JSON.stringify(activePublishedConfig)) {
            effectiveStorage.removeItem(OWNER_CMS_DRAFT_STORAGE_KEY);
            savedDraft = null;
          } else {
            savedDraft = {
              draftConfig: normalizedDraft,
              baseConfigVersion:
                typeof parsedDraft.baseConfigVersion === 'string' &&
                parsedDraft.baseConfigVersion.trim()
                  ? parsedDraft.baseConfigVersion
                  : activePublishedMetadata.configVersion,
              updatedAt:
                typeof parsedDraft.updatedAt === 'string'
                  ? parsedDraft.updatedAt
                  : new Date().toISOString(),
            };
          }
        }
      }
    }
  } catch {
    // Ignore corrupted draft
  }

  // Persist current published version and last-known-good published configuration
  try {
    effectiveStorage.setItem(
      PUBLISHED_VERSION_STORAGE_KEY,
      JSON.stringify(activePublishedMetadata)
    );
    const cacheBundle: CachedPublishedBundle = {
      metadata: activePublishedMetadata,
      config: activePublishedConfig,
      bundledVersionAtSave: bundledMetadata.configVersion,
    };
    effectiveStorage.setItem(LAST_KNOWN_GOOD_CONFIG_KEY, JSON.stringify(cacheBundle));
  } catch {
    // Ignore storage quota errors
  }

  return {
    publishedConfig: activePublishedConfig,
    publishedMetadata: activePublishedMetadata,
    savedDraft,
    wasUpdatedFromOlderDeployment,
    migratedLegacyDraft,
  };
}

export type UpdateCheckOutcome =
  | { status: 'up_to_date'; metadata: PublishedConfigMetadata }
  | {
      status: 'update_ready';
      metadata: PublishedConfigMetadata;
      config: StoreConfig;
    }
  | { status: 'offline_or_unreachable'; error: string }
  | { status: 'invalid_manifest'; error: string }
  | { status: 'invalid_remote_config'; error: string };

/**
 * Checks `/version.json` (with cache-busting query parameter and no-store headers)
 * and, when a newer deployment is detected, fetches and validates `/published-config.json`
 * (or embedded config) before reporting `update_ready`.
 */
export async function checkForPublishedUpdate(
  currentMetadata: PublishedConfigMetadata,
  options: {
    fetchImpl?: typeof fetch;
    versionUrl?: string;
    publishedConfigUrl?: string;
  } = {}
): Promise<UpdateCheckOutcome> {
  const fetchFn = options.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);
  if (!fetchFn) {
    return { status: 'offline_or_unreachable', error: 'Fetch API unavailable.' };
  }

  const cb = Date.now();
  const versionEndpoint = `${options.versionUrl ?? '/version.json'}?_cb=${cb}`;
  const configEndpoint = `${options.publishedConfigUrl ?? '/published-config.json'}?_cb=${cb}`;

  const noCacheInit: RequestInit = {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Accept: 'application/json',
    },
  };

  let versionRes: Response;
  try {
    versionRes = await fetchFn(versionEndpoint, noCacheInit);
  } catch (err) {
    return {
      status: 'offline_or_unreachable',
      error: err instanceof Error ? err.message : 'Network request failed.',
    };
  }

  if (!versionRes.ok) {
    return {
      status: 'offline_or_unreachable',
      error: `Version endpoint returned HTTP ${versionRes.status}.`,
    };
  }

  let rawManifest: unknown;
  try {
    rawManifest = await versionRes.json();
  } catch {
    return {
      status: 'invalid_manifest',
      error: 'Version endpoint did not return valid JSON.',
    };
  }

  const manifestValidation = validateVersionManifest(rawManifest);
  if (!manifestValidation.valid || !manifestValidation.manifest) {
    return {
      status: 'invalid_manifest',
      error: manifestValidation.error || 'Invalid version manifest.',
    };
  }

  const remoteManifest = manifestValidation.manifest;
  const isChanged =
    remoteManifest.configVersion !== currentMetadata.configVersion ||
    remoteManifest.buildId !== currentMetadata.buildId;

  if (!isChanged) {
    return { status: 'up_to_date', metadata: remoteManifest };
  }

  // Never downgrade to an older manifest if currentMetadata has a newer valid timestamp
  const remoteTime = Date.parse(remoteManifest.publishedAt);
  const currentTime = Date.parse(currentMetadata.publishedAt);
  if (
    Number.isFinite(remoteTime) &&
    Number.isFinite(currentTime) &&
    remoteTime < currentTime &&
    remoteManifest.configVersion !== currentMetadata.configVersion
  ) {
    return { status: 'up_to_date', metadata: currentMetadata };
  }

  // A newer deployment is detected! Obtain and validate the new configuration.
  const rawRecord = rawManifest as Record<string, unknown>;
  let rawRemoteConfig: unknown = rawRecord.config;

  if (!rawRemoteConfig || typeof rawRemoteConfig !== 'object') {
    try {
      const configRes = await fetchFn(configEndpoint, noCacheInit);
      if (!configRes.ok) {
        return {
          status: 'offline_or_unreachable',
          error: `Published config endpoint returned HTTP ${configRes.status}.`,
        };
      }
      rawRemoteConfig = await configRes.json();
    } catch (err) {
      return {
        status: 'offline_or_unreachable',
        error: err instanceof Error ? err.message : 'Failed to fetch published config.',
      };
    }
  }

  if (
    !rawRemoteConfig ||
    typeof rawRemoteConfig !== 'object' ||
    Array.isArray(rawRemoteConfig) ||
    !('business' in (rawRemoteConfig as Record<string, unknown>))
  ) {
    return {
      status: 'invalid_remote_config',
      error: 'Fetched configuration is missing required StoreConfig root fields.',
    };
  }

  const normalizedRemote = normalizeStoreConfig(rawRemoteConfig);
  const configValidation = validateStoreConfig(normalizedRemote);
  if (!configValidation.valid) {
    return {
      status: 'invalid_remote_config',
      error:
        configValidation.issues[0]?.message ||
        'Fetched configuration failed StoreConfig validation.',
    };
  }

  // Verify the fetched config's hash matches the remote manifest's configVersion
  // so a stale static /published-config.json can never overwrite a newer storeConfig.ts
  const remoteComputedHash = computeConfigVersionHash(normalizedRemote);
  if (remoteComputedHash !== remoteManifest.configVersion) {
    return {
      status: 'invalid_remote_config',
      error: 'Fetched configuration hash does not match version manifest.',
    };
  }

  return {
    status: 'update_ready',
    metadata: remoteManifest,
    config: normalizedRemote,
  };
}

/**
 * Prevents infinite reload loops by ensuring the browser never reloads more than once
 * for the same target `buildId` / `configVersion` within `RELOAD_COOLDOWN_MS`.
 */
export function canPerformSafeReload(
  targetBuildId: string,
  targetConfigVersion: string,
  sessionStore?: StorageLike | null,
  nowMs = Date.now()
): boolean {
  const store =
    sessionStore !== undefined
      ? sessionStore
      : typeof window !== 'undefined' && window.sessionStorage
        ? window.sessionStorage
        : null;

  if (!store) return false;

  try {
    const raw = store.getItem(RELOAD_GUARD_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        buildId?: string;
        configVersion?: string;
        timestamp?: number;
      };
      const elapsed = nowMs - (parsed.timestamp || 0);
      if (
        elapsed < RELOAD_COOLDOWN_MS &&
        parsed.buildId === targetBuildId &&
        parsed.configVersion === targetConfigVersion
      ) {
        return false;
      }
    }
    store.setItem(
      RELOAD_GUARD_SESSION_KEY,
      JSON.stringify({
        buildId: targetBuildId,
        configVersion: targetConfigVersion,
        timestamp: nowMs,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether the user is actively typing in a form field so automatic updates
 * do not interrupt an in-progress form entry or search query.
 */
export function isUserEditingFormElement(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    return true;
  }
  return Boolean((active as HTMLElement).isContentEditable);
}

/**
 * If an existing service worker is registered on the origin, checks for updates
 * and safely activates any waiting worker without introducing a new service worker.
 */
export async function syncExistingServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.update();
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  } catch {
    // Ignore service worker inspection errors
  }
}
