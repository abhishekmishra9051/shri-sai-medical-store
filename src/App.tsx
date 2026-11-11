import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlashDealItem,
  StoreCategory,
  StoreConfig,
  StoreGalleryItem,
  StoreProduct,
} from './config/storeConfig';
import {
  buildPharmacySchemaJsonLd,
  calculateLockoutSeconds,
  constantTimeEqual,
  deriveSecureHash,
  generateRandomHex,
  getLiveStoreStatus,
  LiveStoreStatus,
} from './utils/storeUtils';
import { useStoreConfig } from './context/StoreConfigContext';
import { HeaderAndTicker } from './components/HeaderAndTicker';
import { StorefrontSections } from './components/StorefrontSections';
import { CmsPageId, ConfirmDialogState, Modals } from './components/Modals';
import { OwnerCMS, SecurityAuditEntry } from './components/OwnerCMS';

const PIN_HASH_KEY = 'shri_sai_custom_pin_hash_v4';
const PIN_SALT_KEY = 'shri_sai_security_salt_v4';
const AUTH_SESSION_KEY = 'shri_sai_cms_session_v4';
const SECURITY_LOCKOUT_KEY = 'shri_sai_cms_lockout_v4';
const SECURITY_AUDIT_KEY = 'shri_sai_security_audit_v4';
const FLASH_POPUP_DISMISSED_KEY = 'shri_sai_flash_popup_dismissed_v1';
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes session & inactivity lock

function getOrCreateInstallationSalt(): string {
  try {
    const existing = localStorage.getItem(PIN_SALT_KEY);
    if (existing && existing.length >= 64) return existing;
    const created = generateRandomHex(32); // 256-bit (32-byte) CSPRNG salt
    localStorage.setItem(PIN_SALT_KEY, created);
    return created;
  } catch {
    return 'shri-sai-manipal-fallback-salt-576104';
  }
}

function readPersistedLockout(): { attempts: number; lockoutUntil: number } {
  let attempts = 0;
  let lockoutUntil = 0;
  for (const store of [localStorage, sessionStorage]) {
    try {
      const raw = store.getItem(SECURITY_LOCKOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.attempts === 'number' && parsed.attempts > attempts) {
          attempts = parsed.attempts;
        }
        if (typeof parsed?.lockoutUntil === 'number' && parsed.lockoutUntil > lockoutUntil) {
          lockoutUntil = parsed.lockoutUntil;
        }
      }
    } catch {
      // Ignore storage error
    }
  }
  return { attempts, lockoutUntil };
}

function persistLockoutState(attempts: number, lockoutUntil: number): void {
  const payload = JSON.stringify({ attempts, lockoutUntil });
  for (const store of [localStorage, sessionStorage]) {
    try {
      store.setItem(SECURITY_LOCKOUT_KEY, payload);
    } catch {
      // Ignore storage error
    }
  }
}

function clearLockoutState(): void {
  for (const store of [localStorage, sessionStorage]) {
    try {
      store.removeItem(SECURITY_LOCKOUT_KEY);
    } catch {
      // Ignore storage error
    }
  }
}

export default function App() {
  // 1. Central Store Configuration via StoreConfigContext
  const {
    config,
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
    setPreviewingDraft,
    notifyCmsUnlocked,
    checkForUpdatesNow,
    applyPendingUpdate,
  } = useStoreConfig();

  // 2. Live IST Store Opening Status
  const [storeStatus, setStoreStatus] = useState<LiveStoreStatus>(() =>
    getLiveStoreStatus(
      config.business.hours.opensAt,
      config.business.hours.closesAt,
      config.business.hours.statusOverride || 'auto'
    )
  );

  useEffect(() => {
    const updateStatus = () => {
      setStoreStatus(
        getLiveStoreStatus(
          config.business.hours.opensAt,
          config.business.hours.closesAt,
          config.business.hours.statusOverride || 'auto'
        )
      );
    };
    updateStatus();
    const timer = setInterval(updateStatus, 30000);
    return () => clearInterval(timer);
  }, [
    config.business.hours.opensAt,
    config.business.hours.closesAt,
    config.business.hours.statusOverride,
  ]);

  // 2B. Dynamic Schema.org JSON-LD & Canonical URL Synchronization
  useEffect(() => {
    try {
      const origin = window.location.origin;
      const canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
      if (canonicalEl && origin.startsWith('http')) {
        canonicalEl.href = `${origin}${window.location.pathname}`;
      }
      const schemaEl = document.getElementById('store-schema-jsonld');
      if (schemaEl) {
        schemaEl.textContent = JSON.stringify(
          buildPharmacySchemaJsonLd(config, origin.startsWith('http') ? origin : undefined),
          null,
          2
        );
      }
    } catch {
      // Ignore DOM sync errors
    }
  }, [config]);

  // 3. CMS Navigation & Modal States
  const [cmsOpen, setCmsOpen] = useState(false);
  const [cmsPage, setCmsPage] = useState<CmsPageId>('sections');
  const [saveToastMessage, setSaveToastMessage] = useState('');

  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  const [editingDeal, setEditingDeal] = useState<FlashDealItem | null>(null);
  const [isNewDeal, setIsNewDeal] = useState(false);

  const [editingGalleryItem, setEditingGalleryItem] = useState<StoreGalleryItem | null>(null);
  const [isNewGalleryItem, setIsNewGalleryItem] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [shopkeeperGuideOpen, setShopkeeperGuideOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [flashPopupOpen, setFlashPopupOpen] = useState(false);
  const [reEngagedByTabSwitch, setReEngagedByTabSwitch] = useState(false);
  const leftTabWithoutDismissingRef = useRef(false);

  // Strict Session Dismissal Handler for Flash Sale Welcome Pop-up
  const handleDismissFlashPopup = useCallback(() => {
    try {
      sessionStorage.setItem(FLASH_POPUP_DISMISSED_KEY, 'true');
    } catch {
      // Ignore storage error
    }
    leftTabWithoutDismissingRef.current = false;
    setFlashPopupOpen(false);
  }, []);

  // First-Load Welcome Pop-up (1.2s Delay)
  useEffect(() => {
    if (
      !config.flashSale?.enabled ||
      !config.flashSale?.showWelcomePopup ||
      (config.flashSale?.offers?.length || 0) === 0 ||
      cmsOpen
    ) {
      return;
    }

    let isDismissed = false;
    try {
      isDismissed = sessionStorage.getItem(FLASH_POPUP_DISMISSED_KEY) === 'true';
    } catch {
      // Ignore
    }
    if (isDismissed) return;

    const welcomeTimer = setTimeout(() => {
      try {
        if (sessionStorage.getItem(FLASH_POPUP_DISMISSED_KEY) === 'true') return;
      } catch {
        // Ignore
      }
      setReEngagedByTabSwitch(false);
      setFlashPopupOpen(true);
    }, 1200);

    return () => clearTimeout(welcomeTimer);
  }, [
    config.flashSale?.enabled,
    config.flashSale?.showWelcomePopup,
    config.flashSale?.offers?.length,
    cmsOpen,
  ]);

  // Smart Tab Re-Engagement (800ms Delay via Page Visibility API)
  useEffect(() => {
    let reEngageTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (
        !config.flashSale?.enabled ||
        !config.flashSale?.showWelcomePopup ||
        (config.flashSale?.offers?.length || 0) === 0
      ) {
        return;
      }

      let isDismissed = false;
      try {
        isDismissed = sessionStorage.getItem(FLASH_POPUP_DISMISSED_KEY) === 'true';
      } catch {
        // Ignore
      }
      if (isDismissed) return;

      if (document.visibilityState === 'hidden') {
        if (reEngageTimer) {
          clearTimeout(reEngageTimer);
          reEngageTimer = null;
        }
        // Visitor navigated to another tab without explicitly dismissing the modal
        leftTabWithoutDismissingRef.current = true;
        setFlashPopupOpen(false);
      } else if (document.visibilityState === 'visible') {
        if (leftTabWithoutDismissingRef.current && !cmsOpen) {
          reEngageTimer = setTimeout(() => {
            try {
              if (sessionStorage.getItem(FLASH_POPUP_DISMISSED_KEY) === 'true') return;
            } catch {
              // Ignore
            }
            setReEngagedByTabSwitch(true);
            setFlashPopupOpen(true);
          }, 800);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reEngageTimer) clearTimeout(reEngageTimer);
    };
  }, [
    config.flashSale?.enabled,
    config.flashSale?.showWelcomePopup,
    config.flashSale?.offers?.length,
    cmsOpen,
  ]);

  // 4. Security & Authentication State
  const [hasConfiguredPin, setHasConfiguredPin] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(PIN_HASH_KEY));
    } catch {
      return false;
    }
  });

  const [cmsUnlocked, setCmsUnlocked] = useState<boolean>(() => {
    try {
      const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() < parsed.expiresAt && parsed.token?.length === 64) {
        return true;
      }
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore
    }
    return false;
  });

  // Synchronize CMS unlock state with StoreConfigContext so Owner drafts are only previewed in Owner session
  useEffect(() => {
    notifyCmsUnlocked(cmsUnlocked);
  }, [cmsUnlocked, notifyCmsUnlocked]);

  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState<number>(
    () => readPersistedLockout().attempts
  );
  const [lockoutUntil, setLockoutUntil] = useState<number>(
    () => readPersistedLockout().lockoutUntil
  );
  // Monotonic deadline in performance.now() ms to prevent wall-clock manipulation bypass
  const monotonicLockoutDeadlineRef = useRef<number>(0);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);

  const [securityAuditLog, setSecurityAuditLog] = useState<SecurityAuditEntry[]>(() => {
    try {
      const raw = localStorage.getItem(SECURITY_AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const appendAuditEvent = useCallback(
    (event: string, type: SecurityAuditEntry['type'] = 'info') => {
      const entry: SecurityAuditEntry = {
        time: new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        event,
        type,
      };
      setSecurityAuditLog((prev) => {
        const next = [entry, ...prev].slice(0, 20);
        try {
          localStorage.setItem(SECURITY_AUDIT_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage quota
        }
        return next;
      });
    },
    []
  );

  // Lockout countdown timer (combines wall-clock persistence + monotonic session timer)
  useEffect(() => {
    const checkLockout = () => {
      const persisted = readPersistedLockout();
      const effectiveWallUntil = Math.max(lockoutUntil, persisted.lockoutUntil);
      const wallRemSec = Math.ceil((effectiveWallUntil - Date.now()) / 1000);
      const monoRemSec = Math.ceil(
        (monotonicLockoutDeadlineRef.current - performance.now()) / 1000
      );
      const activeRemSec = Math.max(0, wallRemSec, monoRemSec);
      setLockoutRemainingSec(activeRemSec);
    };
    checkLockout();
    const timer = setInterval(checkLockout, 500);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  // 15-Minute Inactivity & Session Expiry Auto-Lock (including background tab wake verification)
  const lastActivityRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!cmsUnlocked) return;

    const verifySessionAndActivity = () => {
      const idleMs = Date.now() - lastActivityRef.current;
      let sessionExpired = false;
      try {
        const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (!raw) sessionExpired = true;
        else {
          const parsed = JSON.parse(raw);
          if (!parsed.expiresAt || Date.now() >= parsed.expiresAt) {
            sessionExpired = true;
          }
        }
      } catch {
        sessionExpired = true;
      }

      if (idleMs >= SESSION_TIMEOUT_MS || sessionExpired) {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        setCmsUnlocked(false);
        appendAuditEvent('CMS session auto-locked due to 15m timeout/inactivity', 'warn');
        return true;
      }
      return false;
    };

    const refreshActivity = () => {
      if (!verifySessionAndActivity()) {
        lastActivityRef.current = Date.now();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        verifySessionAndActivity();
      }
    };

    window.addEventListener('mousemove', refreshActivity);
    window.addEventListener('keydown', refreshActivity);
    window.addEventListener('click', refreshActivity);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const checkSession = setInterval(verifySessionAndActivity, 5000);

    return () => {
      window.removeEventListener('mousemove', refreshActivity);
      window.removeEventListener('keydown', refreshActivity);
      window.removeEventListener('click', refreshActivity);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(checkSession);
    };
  }, [cmsUnlocked, appendAuditEvent]);

  // Keyboard shortcut Ctrl + Shift + O to open Owner CMS even if header is hidden
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setCmsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Triple-click logo stealth trigger
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      setCmsOpen(true);
    } else {
      logoClickTimerRef.current = setTimeout(() => {
        logoClickCountRef.current = 0;
      }, 900);
    }
  };

  // Save Config Helper
  const handleSaveConfig = useCallback(
    (nextConfig: StoreConfig, toastMsg = 'Saved') => {
      saveConfig(nextConfig);
      setSaveToastMessage(toastMsg);
      setTimeout(() => {
        setSaveToastMessage((prev) => (prev === toastMsg ? '' : prev));
      }, 2400);
    },
    [saveConfig]
  );

  const handleResetDefault = useCallback(() => {
    resetToDefault();
    appendAuditEvent('Store configuration reset to factory seed defaults', 'warn');
    setSaveToastMessage('Reset to Factory Defaults');
  }, [resetToDefault, appendAuditEvent]);

  // First-time Owner PIN setup
  const handleSetupInitialPin = async (newPin: string, confirmPin: string) => {
    const cleanNew = newPin.trim();
    const cleanConfirm = confirmPin.trim();
    if (cleanNew.length < 4 || cleanNew.length > 12) {
      setPinError('Owner PIN must be between 4 and 12 characters.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setPinError('PIN confirmation does not match.');
      return;
    }

    const salt = getOrCreateInstallationSalt();
    const derived = await deriveSecureHash(cleanNew, salt);
    localStorage.setItem(PIN_HASH_KEY, derived);
    setHasConfiguredPin(true);

    const token = generateRandomHex(32);
    sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({ token, expiresAt: Date.now() + SESSION_TIMEOUT_MS })
    );
    lastActivityRef.current = Date.now();
    setCmsUnlocked(true);
    setPinError('');
    appendAuditEvent('Owner security PIN initialized with PBKDF2-HMAC-SHA256', 'success');
  };

  // Verify Owner PIN (with constant-time digest verification & tamper-resistant lockout)
  const handleLoginWithPin = async (enteredPin: string) => {
    const persisted = readPersistedLockout();
    const activeWallUntil = Math.max(lockoutUntil, persisted.lockoutUntil);
    if (
      activeWallUntil > Date.now() ||
      monotonicLockoutDeadlineRef.current > performance.now()
    ) {
      return;
    }

    const clean = enteredPin.trim();
    if (!clean) {
      setPinError('Please enter your Owner PIN.');
      return;
    }

    const salt = getOrCreateInstallationSalt();
    const candidateHash = await deriveSecureHash(clean, salt);
    const storedHash = localStorage.getItem(PIN_HASH_KEY);

    if (storedHash && constantTimeEqual(candidateHash, storedHash)) {
      const token = generateRandomHex(32);
      sessionStorage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({ token, expiresAt: Date.now() + SESSION_TIMEOUT_MS })
      );
      clearLockoutState();
      monotonicLockoutDeadlineRef.current = 0;
      setFailedAttempts(0);
      setLockoutUntil(0);
      setLockoutRemainingSec(0);
      setPinError('');
      setCmsUnlocked(true);
      lastActivityRef.current = Date.now();
      appendAuditEvent('Owner CMS unlocked via verified PBKDF2 PIN', 'success');
    } else {
      const baseAttempts = Math.max(failedAttempts, persisted.attempts);
      const nextAttempts = baseAttempts + 1;
      const lockSec = calculateLockoutSeconds(nextAttempts);
      const nextLockUntil = lockSec > 0 ? Date.now() + lockSec * 1000 : 0;
      if (lockSec > 0) {
        monotonicLockoutDeadlineRef.current = performance.now() + lockSec * 1000;
        setLockoutRemainingSec(lockSec);
      }

      setFailedAttempts(nextAttempts);
      setLockoutUntil(nextLockUntil);
      persistLockoutState(nextAttempts, nextLockUntil);

      if (lockSec > 0) {
        setPinError(`Too many failed attempts. Locked for ${lockSec} seconds.`);
        appendAuditEvent(
          `Brute-force rate limit triggered (${nextAttempts} failed attempts)`,
          'warn'
        );
      } else {
        setPinError(`Invalid Owner PIN (${4 - nextAttempts} attempts remaining before lockout).`);
        appendAuditEvent('Failed Owner CMS PIN verification attempt', 'warn');
      }
    }
  };

  // Change PIN inside Security tab
  const handleChangePin = async (
    currentPin: string,
    newPin: string,
    confirmPin: string
  ): Promise<boolean> => {
    const cleanNew = newPin.trim();
    if (cleanNew.length < 4 || cleanNew.length > 12 || cleanNew !== confirmPin.trim()) {
      return false;
    }
    const salt = getOrCreateInstallationSalt();
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (storedHash) {
      const currentCandidate = await deriveSecureHash(currentPin.trim(), salt);
      if (!constantTimeEqual(currentCandidate, storedHash)) {
        appendAuditEvent('Rejected PIN change: current PIN mismatch', 'warn');
        return false;
      }
    }
    const nextSalt = generateRandomHex(32);
    localStorage.setItem(PIN_SALT_KEY, nextSalt);
    const nextHash = await deriveSecureHash(cleanNew, nextSalt);
    localStorage.setItem(PIN_HASH_KEY, nextHash);
    setHasConfiguredPin(true);
    appendAuditEvent('Owner PIN rotated with fresh salt & 100k PBKDF2 iterations', 'success');
    return true;
  };

  const handleLockCms = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setCmsUnlocked(false);
    appendAuditEvent('Owner manually locked CMS session', 'info');
  };

  const handleRevokeAllSessions = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    clearLockoutState();
    monotonicLockoutDeadlineRef.current = 0;
    setCmsUnlocked(false);
    appendAuditEvent('Emergency session revocation executed', 'warn');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-slate-900"
      style={
        {
          '--store-primary-green': config.appearance.primaryGreen || '#059669',
          '--store-secondary-green': config.appearance.secondaryGreen || '#047857',
          '--store-light-green': config.appearance.lightGreen || '#ECFDF5',
        } as React.CSSProperties
      }
    >
      {/* Header, Announcement Ticker & Lockout Safeguard */}
      <HeaderAndTicker
        config={config}
        storeStatus={storeStatus}
        cmsUnlocked={cmsUnlocked}
        onLogoClick={handleLogoClick}
        onOpenCms={() => setCmsOpen(true)}
        onOpenShopkeeperGuide={() => setShopkeeperGuideOpen(true)}
      />

      {/* Customer Storefront Sections */}
      <StorefrontSections
        config={config}
        storeStatus={storeStatus}
        cmsUnlocked={cmsUnlocked}
        onOpenCms={() => setCmsOpen(true)}
        onOpenShopkeeperGuide={() => setShopkeeperGuideOpen(true)}
        onOpenDeploymentGuide={() => setGuideModalOpen(true)}
        onOpenFlashDealsModal={() => setFlashPopupOpen(true)}
      />

      {/* Centralized 14-Tab Owner CMS */}
      <OwnerCMS
        isOpen={cmsOpen}
        onClose={() => setCmsOpen(false)}
        config={config}
        storeStatus={storeStatus}
        onSaveConfig={handleSaveConfig}
        onResetDefault={handleResetDefault}
        cmsUnlocked={cmsUnlocked}
        hasConfiguredPin={hasConfiguredPin}
        lockoutRemainingSec={lockoutRemainingSec}
        failedAttempts={failedAttempts}
        pinError={pinError}
        onSetupInitialPin={handleSetupInitialPin}
        onLoginWithPin={handleLoginWithPin}
        onChangePin={handleChangePin}
        onLockCms={handleLockCms}
        onRevokeAllSessions={handleRevokeAllSessions}
        securityAuditLog={securityAuditLog}
        cmsPage={cmsPage}
        onChangeCmsPage={setCmsPage}
        onEditCategory={(cat, isNew) => {
          setEditingCategory(cat);
          setIsNewCategory(isNew);
        }}
        onDeleteCategory={(id) => {
          setConfirmDialog({
            title: 'Delete Category?',
            message: 'Are you sure you want to remove this department from your storefront?',
            confirmLabel: 'Delete Category',
            danger: true,
            onConfirm: () => {
              handleSaveConfig(
                {
                  ...config,
                  categories: config.categories.filter((c) => c.id !== id),
                },
                'Category deleted'
              );
            },
          });
        }}
        onEditProduct={(prod, isNew) => {
          setEditingProduct(prod);
          setIsNewProduct(isNew);
        }}
        onDeleteProduct={(id) => {
          setConfirmDialog({
            title: 'Delete Product from Catalogue?',
            message: 'Are you sure you want to remove this product from your catalogue?',
            confirmLabel: 'Delete Product',
            danger: true,
            onConfirm: () => {
              handleSaveConfig(
                {
                  ...config,
                  products: config.products.filter((p) => p.id !== id),
                },
                'Product deleted'
              );
            },
          });
        }}
        onEditDeal={(deal, isNew) => {
          setEditingDeal(deal);
          setIsNewDeal(isNew);
        }}
        onDeleteDeal={(id) => {
          setConfirmDialog({
            title: 'Delete Promotional Offer?',
            message: 'Are you sure you want to delete this offer from the Flash Deals carousel?',
            confirmLabel: 'Delete Offer',
            danger: true,
            onConfirm: () => {
              handleSaveConfig(
                {
                  ...config,
                  flashSale: {
                    ...config.flashSale,
                    offers: config.flashSale.offers.filter((o) => o.id !== id),
                  },
                },
                'Offer deleted'
              );
            },
          });
        }}
        onEditGalleryItem={(item, isNew) => {
          setEditingGalleryItem(item);
          setIsNewGalleryItem(isNew);
        }}
        onDeleteGalleryItem={(id) => {
          setConfirmDialog({
            title: 'Delete Store Photograph?',
            message: 'Are you sure you want to remove this photograph from the store gallery?',
            confirmLabel: 'Delete Photo',
            danger: true,
            onConfirm: () => {
              handleSaveConfig(
                {
                  ...config,
                  gallery: config.gallery.filter((g) => g.id !== id),
                },
                'Photo deleted'
              );
            },
          });
        }}
        onOpenConfirmDialog={(dialog) => setConfirmDialog(dialog)}
        onOpenShopkeeperGuide={() => setShopkeeperGuideOpen(true)}
        onOpenDeploymentGuide={() => setGuideModalOpen(true)}
        saveToastMessage={saveToastMessage}
        hasLocalChanges={hasLocalChanges}
        storageStatus={storageStatus}
        publishedMetadata={publishedMetadata}
        savedDraft={savedDraft}
        isPreviewingDraft={isPreviewingDraft}
        publishingStatus={publishingStatus}
        pendingRemoteUpdate={pendingRemoteUpdate}
        lastCheckedAt={lastCheckedAt}
        updateCheckError={updateCheckError}
        onTogglePreviewDraft={setPreviewingDraft}
        onCheckForUpdatesNow={checkForUpdatesNow}
        onApplyPendingUpdate={applyPendingUpdate}
      />

      {/* Interactive Modals (CRUD, Confirmation, Guides, Flash Deals) */}
      <Modals
        config={config}
        editingCategory={editingCategory}
        isNewCategory={isNewCategory}
        onChangeEditingCategory={setEditingCategory}
        onSaveCategory={(cat) => {
          const nextCategories = isNewCategory
            ? [...config.categories, cat]
            : config.categories.map((c) => (c.id === cat.id ? cat : c));
          handleSaveConfig({ ...config, categories: nextCategories }, 'Category saved');
          setEditingCategory(null);
        }}
        editingProduct={editingProduct}
        isNewProduct={isNewProduct}
        onChangeEditingProduct={setEditingProduct}
        onSaveProduct={(prod) => {
          const nextProducts = isNewProduct
            ? [prod, ...config.products]
            : config.products.map((p) => (p.id === prod.id ? prod : p));
          handleSaveConfig({ ...config, products: nextProducts }, 'Product saved');
          setEditingProduct(null);
        }}
        editingDeal={editingDeal}
        isNewDeal={isNewDeal}
        onChangeEditingDeal={setEditingDeal}
        onSaveDeal={(deal) => {
          const nextOffers = isNewDeal
            ? [deal, ...config.flashSale.offers]
            : config.flashSale.offers.map((o) => (o.id === deal.id ? deal : o));
          handleSaveConfig(
            {
              ...config,
              flashSale: { ...config.flashSale, offers: nextOffers },
            },
            'Flash offer saved'
          );
          setEditingDeal(null);
        }}
        editingGalleryItem={editingGalleryItem}
        isNewGalleryItem={isNewGalleryItem}
        onChangeEditingGalleryItem={setEditingGalleryItem}
        onSaveGalleryItem={(item) => {
          const nextGallery = isNewGalleryItem
            ? [...config.gallery, item]
            : config.gallery.map((g) => (g.id === item.id ? item : g));
          handleSaveConfig({ ...config, gallery: nextGallery }, 'Gallery photo saved');
          setEditingGalleryItem(null);
        }}
        confirmDialog={confirmDialog}
        onCloseConfirmDialog={() => setConfirmDialog(null)}
        shopkeeperGuideOpen={shopkeeperGuideOpen}
        onCloseShopkeeperGuide={() => setShopkeeperGuideOpen(false)}
        onJumpToCmsTab={(tab) => {
          setCmsPage(tab);
          setCmsOpen(true);
        }}
        guideModalOpen={guideModalOpen}
        onCloseGuideModal={() => setGuideModalOpen(false)}
        flashPopupOpen={flashPopupOpen && !cmsOpen}
        reEngagedByTabSwitch={reEngagedByTabSwitch}
        onCloseFlashPopup={handleDismissFlashPopup}
      />
    </div>
  );
}
