import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  INITIAL_STORE_CONFIG,
  LocalCmsDraftRecord,
  PublishedConfigMetadata,
  PublishingStatus,
  StoreConfig,
} from '../config/storeConfig';
import { normalizeStoreConfig } from '../config/configMigration';
import {
  checkForPublishedUpdate,
  DEFAULT_UPDATE_POLL_INTERVAL_MS,
  getBundledPublishedMetadata,
  isUserEditingFormElement,
  LAST_KNOWN_GOOD_CONFIG_KEY,
  OWNER_CMS_DRAFT_STORAGE_KEY,
  PUBLISHED_VERSION_STORAGE_KEY,
  reconcileConfigStorage,
  syncExistingServiceWorkers,
} from '../config/versioning';
import { generateStoreConfigCode } from '../utils/storeUtils';

export const STORE_CONFIG_STORAGE_KEY = OWNER_CMS_DRAFT_STORAGE_KEY;

export type StoragePersistenceStatus = 'ok' | 'quota_exceeded' | 'unavailable';

declare global {
  interface Window {
    __STORE_UPDATE_POLL_INTERVAL_MS__?: number;
  }
}

export interface StoreConfigContextValue {
  /** Active configuration rendered by the UI (Published Config for visitors; Draft Config when Owner previews draft) */
  config: StoreConfig;
  /** Authoritative published configuration from the latest deployment */
  publishedConfig: StoreConfig;
  /** Deployment version & build metadata for the published configuration */
  publishedMetadata: PublishedConfigMetadata;
  /** Unpublished browser-local Owner CMS draft record, if one exists */
  savedDraft: LocalCmsDraftRecord | null;
  /** Whether the current session is previewing the Owner's unpublished local draft */
  isPreviewingDraft: boolean;
  /** True when an unpublished local Owner CMS draft exists and differs from the published config */
  hasLocalChanges: boolean;
  /** Current publishing / deployment lifecycle state */
  publishingStatus: PublishingStatus;
  /** Non-null when a newer deployment was detected while user was mid-form or previewing a draft */
  pendingRemoteUpdate: { metadata: PublishedConfigMetadata; config: StoreConfig } | null;
  /** Last time `/version.json` was checked */
  lastCheckedAt: string | null;
  /** Non-fatal error message from the last update check, if any */
  updateCheckError: string | null;
  /** LocalStorage health status */
  storageStatus: StoragePersistenceStatus;
  /** Saves an unpublished Owner CMS draft to LocalStorage and previews it in the current owner session */
  saveConfig: (nextConfig: StoreConfig) => StoragePersistenceStatus;
  /** Discards the local Owner CMS draft (after confirmation) and reverts to the Published Configuration */
  resetToDefault: () => void;
  /** Toggles between viewing the Published Configuration and the Owner's saved Local CMS Draft */
  setPreviewingDraft: (preview: boolean) => void;
  /** Notifies context when Owner CMS is unlocked so existing drafts for this version can be previewed */
  notifyCmsUnlocked: (unlocked: boolean) => void;
  /** Manually triggers an immediate deployment check against `/version.json` */
  checkForUpdatesNow: () => Promise<boolean>;
  /** Applies a pending deployment update immediately */
  applyPendingUpdate: () => void;
  /** Generates drop-in replaceable `src/config/storeConfig.ts` TypeScript code */
  exportTypeScriptCode: () => string;
  /** Generates normalized `storeConfig.json` string */
  exportJsonString: () => string;
}

const StoreConfigContext = createContext<StoreConfigContextValue | null>(null);

export function StoreConfigProvider({
  children,
  pollIntervalMs,
}: {
  children: React.ReactNode;
  pollIntervalMs?: number;
}) {
  const initialBundledMetadata = useMemo(
    () => getBundledPublishedMetadata(INITIAL_STORE_CONFIG),
    []
  );

  const initialReconciled = useMemo(
    () => reconcileConfigStorage(INITIAL_STORE_CONFIG, initialBundledMetadata),
    [initialBundledMetadata]
  );

  const [publishedConfig, setPublishedConfig] = useState<StoreConfig>(
    () => initialReconciled.publishedConfig
  );
  const [publishedMetadata, setPublishedMetadata] = useState<PublishedConfigMetadata>(
    () => initialReconciled.publishedMetadata
  );
  const [savedDraft, setSavedDraft] = useState<LocalCmsDraftRecord | null>(
    () => initialReconciled.savedDraft
  );
  const [isPreviewingDraft, setIsPreviewingDraft] = useState<boolean>(false);
  const [justUpdatedDeployment, setJustUpdatedDeployment] = useState<boolean>(
    () => initialReconciled.wasUpdatedFromOlderDeployment
  );
  const [pendingRemoteUpdate, setPendingRemoteUpdate] = useState<{
    metadata: PublishedConfigMetadata;
    config: StoreConfig;
  } | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [updateCheckError, setUpdateCheckError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<StoragePersistenceStatus>('ok');

  // Keep mutable refs for event/interval callbacks to avoid stale closures
  const publishedMetadataRef = useRef<PublishedConfigMetadata>(publishedMetadata);
  publishedMetadataRef.current = publishedMetadata;

  const isPreviewingDraftRef = useRef<boolean>(isPreviewingDraft);
  isPreviewingDraftRef.current = isPreviewingDraft;

  const savedDraftRef = useRef<LocalCmsDraftRecord | null>(savedDraft);
  savedDraftRef.current = savedDraft;

  const isCheckingRef = useRef<boolean>(false);
  const lastCheckTimestampRef = useRef<number>(0);

  const persistPublishedBundle = useCallback(
    (meta: PublishedConfigMetadata, cfg: StoreConfig) => {
      try {
        localStorage.setItem(PUBLISHED_VERSION_STORAGE_KEY, JSON.stringify(meta));
        localStorage.setItem(
          LAST_KNOWN_GOOD_CONFIG_KEY,
          JSON.stringify({
            metadata: meta,
            config: cfg,
            bundledVersionAtSave: initialBundledMetadata.configVersion,
          })
        );
      } catch {
        // Ignore storage quota error on cache update
      }
    },
    [initialBundledMetadata.configVersion]
  );

  const applyRemoteDeployment = useCallback(
    (newMeta: PublishedConfigMetadata, newCfg: StoreConfig) => {
      const normalized = normalizeStoreConfig(newCfg);
      setPublishedConfig(normalized);
      setPublishedMetadata(newMeta);
      setPendingRemoteUpdate(null);
      setJustUpdatedDeployment(true);
      persistPublishedBundle(newMeta, normalized);

      // If the owner had a draft that is now identical to the newly deployed config, clear the draft
      const currentDraft = savedDraftRef.current;
      if (currentDraft && JSON.stringify(currentDraft.draftConfig) === JSON.stringify(normalized)) {
        setSavedDraft(null);
        setIsPreviewingDraft(false);
        try {
          localStorage.removeItem(OWNER_CMS_DRAFT_STORAGE_KEY);
        } catch {
          // Ignore
        }
      } else {
        // Ensure public visitors and newly updated tabs view the new published config by default
        setIsPreviewingDraft(false);
      }
    },
    [persistPublishedBundle]
  );

  const runUpdateCheck = useCallback(
    async (force = false): Promise<boolean> => {
      if (isCheckingRef.current) return false;
      const now = Date.now();
      if (!force && now - lastCheckTimestampRef.current < 150) {
        return false;
      }

      isCheckingRef.current = true;
      lastCheckTimestampRef.current = now;

      try {
        const outcome = await checkForPublishedUpdate(publishedMetadataRef.current);
        setLastCheckedAt(new Date().toISOString());

        if (outcome.status === 'up_to_date') {
          setUpdateCheckError(null);
          return false;
        }

        if (outcome.status === 'update_ready') {
          setUpdateCheckError(null);
          persistPublishedBundle(outcome.metadata, outcome.config);
          void syncExistingServiceWorkers();

          // Defer immediate swap only if user is actively typing in an input OR actively previewing a CMS draft
          if (isUserEditingFormElement() || isPreviewingDraftRef.current) {
            setPendingRemoteUpdate({
              metadata: outcome.metadata,
              config: outcome.config,
            });
          } else {
            applyRemoteDeployment(outcome.metadata, outcome.config);
          }
          return true;
        }

        if (outcome.status === 'invalid_remote_config' || outcome.status === 'invalid_manifest') {
          setUpdateCheckError(outcome.error);
          return false;
        }

        // offline_or_unreachable: keep working website without destructive error
        return false;
      } finally {
        isCheckingRef.current = false;
      }
    },
    [applyRemoteDeployment, persistPublishedBundle]
  );

  // Automatic update detection lifecycle: initial mount, periodic polling, visibilitychange, focus, online
  useEffect(() => {
    void runUpdateCheck(true);

    const effectiveInterval =
      pollIntervalMs ??
      (typeof window !== 'undefined' &&
      typeof window.__STORE_UPDATE_POLL_INTERVAL_MS__ === 'number'
        ? window.__STORE_UPDATE_POLL_INTERVAL_MS__
        : DEFAULT_UPDATE_POLL_INTERVAL_MS);

    const intervalId = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        void runUpdateCheck(false);
      }
    }, effectiveInterval);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runUpdateCheck(false);
      }
    };

    const handleFocus = () => {
      void runUpdateCheck(false);
    };

    const handleOnline = () => {
      void runUpdateCheck(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [pollIntervalMs, runUpdateCheck]);

  // If a pending update was deferred only because an input was focused (not in CMS draft mode),
  // apply it automatically as soon as the input loses focus.
  useEffect(() => {
    if (!pendingRemoteUpdate || isPreviewingDraft) return;

    const handleFocusOut = () => {
      setTimeout(() => {
        if (!isUserEditingFormElement() && !isPreviewingDraftRef.current && pendingRemoteUpdate) {
          applyRemoteDeployment(pendingRemoteUpdate.metadata, pendingRemoteUpdate.config);
        }
      }, 150);
    };

    window.addEventListener('focusout', handleFocusOut);
    return () => window.removeEventListener('focusout', handleFocusOut);
  }, [pendingRemoteUpdate, isPreviewingDraft, applyRemoteDeployment]);

  const applyPendingUpdate = useCallback(() => {
    if (!pendingRemoteUpdate) return;
    applyRemoteDeployment(pendingRemoteUpdate.metadata, pendingRemoteUpdate.config);
  }, [pendingRemoteUpdate, applyRemoteDeployment]);

  const saveConfig = useCallback((nextConfig: StoreConfig): StoragePersistenceStatus => {
    const normalized = normalizeStoreConfig(nextConfig);
    const currentPubMeta = publishedMetadataRef.current;

    const draftRecord: LocalCmsDraftRecord = {
      draftConfig: normalized,
      baseConfigVersion: currentPubMeta.configVersion,
      updatedAt: new Date().toISOString(),
    };

    setSavedDraft(draftRecord);
    setIsPreviewingDraft(true);

    try {
      localStorage.setItem(OWNER_CMS_DRAFT_STORAGE_KEY, JSON.stringify(draftRecord));
      setStorageStatus('ok');
      return 'ok';
    } catch (err) {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      const status: StoragePersistenceStatus = isQuota ? 'quota_exceeded' : 'unavailable';
      setStorageStatus(status);
      return status;
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setSavedDraft(null);
    setIsPreviewingDraft(false);
    try {
      localStorage.removeItem(OWNER_CMS_DRAFT_STORAGE_KEY);
      setStorageStatus('ok');
    } catch {
      setStorageStatus('unavailable');
    }
  }, []);

  const notifyCmsUnlocked = useCallback((unlocked: boolean) => {
    if (unlocked) {
      const draft = savedDraftRef.current;
      // Automatically preview saved draft when owner unlocks CMS if draft was created on the current version
      if (draft && draft.baseConfigVersion === publishedMetadataRef.current.configVersion) {
        setIsPreviewingDraft(true);
      }
    } else {
      // When Owner locks CMS, return public storefront view to the authoritative Published Configuration
      setIsPreviewingDraft(false);
    }
  }, []);

  const activeConfig = useMemo<StoreConfig>(() => {
    if (isPreviewingDraft && savedDraft) {
      return savedDraft.draftConfig;
    }
    return publishedConfig;
  }, [isPreviewingDraft, savedDraft, publishedConfig]);

  const hasLocalChanges = useMemo<boolean>(() => {
    if (!savedDraft) return false;
    try {
      return JSON.stringify(savedDraft.draftConfig) !== JSON.stringify(publishedConfig);
    } catch {
      return false;
    }
  }, [savedDraft, publishedConfig]);

  const publishingStatus = useMemo<PublishingStatus>(() => {
    if (pendingRemoteUpdate) {
      return 'new_deployment_available';
    }
    if (hasLocalChanges && isPreviewingDraft) {
      return 'local_draft_saved';
    }
    if (justUpdatedDeployment) {
      return 'deployment_updated';
    }
    return 'published';
  }, [pendingRemoteUpdate, hasLocalChanges, isPreviewingDraft, justUpdatedDeployment]);

  const exportTypeScriptCode = useCallback(() => {
    const target = savedDraft ? savedDraft.draftConfig : publishedConfig;
    return generateStoreConfigCode(target);
  }, [savedDraft, publishedConfig]);

  const exportJsonString = useCallback(() => {
    const target = savedDraft ? savedDraft.draftConfig : publishedConfig;
    return JSON.stringify(normalizeStoreConfig(target), null, 2);
  }, [savedDraft, publishedConfig]);

  const value = useMemo<StoreConfigContextValue>(
    () => ({
      config: activeConfig,
      publishedConfig,
      publishedMetadata,
      savedDraft,
      isPreviewingDraft,
      hasLocalChanges,
      publishingStatus,
      pendingRemoteUpdate,
      lastCheckedAt,
      updateCheckError,
      storageStatus,
      saveConfig,
      resetToDefault,
      setPreviewingDraft: setIsPreviewingDraft,
      notifyCmsUnlocked,
      checkForUpdatesNow: () => runUpdateCheck(true),
      applyPendingUpdate,
      exportTypeScriptCode,
      exportJsonString,
    }),
    [
      activeConfig,
      publishedConfig,
      publishedMetadata,
      savedDraft,
      isPreviewingDraft,
      hasLocalChanges,
      publishingStatus,
      pendingRemoteUpdate,
      lastCheckedAt,
      updateCheckError,
      storageStatus,
      saveConfig,
      resetToDefault,
      notifyCmsUnlocked,
      runUpdateCheck,
      applyPendingUpdate,
      exportTypeScriptCode,
      exportJsonString,
    ]
  );

  return <StoreConfigContext.Provider value={value}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig(): StoreConfigContextValue {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) {
    throw new Error('useStoreConfig must be used within a StoreConfigProvider');
  }
  return ctx;
}
