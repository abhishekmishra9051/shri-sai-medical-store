import React, { useRef, useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Flame,
  Truck,
  Layers,
  Package,
  Camera,
  Palette,
  Download,
  Upload,
  Copy,
  BookOpen,
  Building2,
  Search,
  KeyRound,
  LogOut,
  History,
  FileCode2,
} from 'lucide-react';
import {
  FlashDealItem,
  FooterColumnKey,
  HeaderElementKey,
  LiveStatusOverride,
  LocalCmsDraftRecord,
  PublishedConfigMetadata,
  PublishingStatus,
  StoreCategory,
  StoreConfig,
  StoreGalleryItem,
  StoreProduct,
} from '../config/storeConfig';
import {
  formatTime12,
  generateStoreConfigCode,
  LiveStoreStatus,
  migrateAndNormalizeConfig,
  normalizeStoreConfig,
  parseImportedConfigContent,
  sanitizeMapEmbedInput,
  validateStoreConfig,
} from '../utils/storeUtils';
import { CmsPageId, ConfirmDialogState } from './Modals';
import { CategoryIcon, SafeImage, StoreLogoBadge } from './SafeImage';

export interface SecurityAuditEntry {
  time: string;
  event: string;
  type: 'info' | 'warn' | 'success';
}

interface OwnerCMSProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  storeStatus: LiveStoreStatus;
  onSaveConfig: (next: StoreConfig, msg?: string) => void;
  onResetDefault: () => void;
  // Auth state
  cmsUnlocked: boolean;
  hasConfiguredPin: boolean;
  lockoutRemainingSec: number;
  failedAttempts: number;
  pinError: string;
  onSetupInitialPin: (newPin: string, confirmPin: string) => Promise<void>;
  onLoginWithPin: (pin: string) => Promise<void>;
  onChangePin: (currentPin: string, newPin: string, confirmPin: string) => Promise<boolean>;
  onLockCms: () => void;
  onRevokeAllSessions: () => void;
  securityAuditLog: SecurityAuditEntry[];
  // Active tab & modals
  cmsPage: CmsPageId;
  onChangeCmsPage: (page: CmsPageId) => void;
  onEditCategory: (cat: StoreCategory, isNew: boolean) => void;
  onDeleteCategory: (id: string) => void;
  onEditProduct: (prod: StoreProduct, isNew: boolean) => void;
  onDeleteProduct: (id: string) => void;
  onEditDeal: (deal: FlashDealItem, isNew: boolean) => void;
  onDeleteDeal: (id: string) => void;
  onEditGalleryItem: (item: StoreGalleryItem, isNew: boolean) => void;
  onDeleteGalleryItem: (id: string) => void;
  onOpenConfirmDialog: (dialog: ConfirmDialogState) => void;
  onOpenShopkeeperGuide: () => void;
  onOpenDeploymentGuide: () => void;
  saveToastMessage: string;
  hasLocalChanges?: boolean;
  storageStatus?: 'ok' | 'quota_exceeded' | 'unavailable';
  publishedMetadata?: PublishedConfigMetadata;
  savedDraft?: LocalCmsDraftRecord | null;
  isPreviewingDraft?: boolean;
  publishingStatus?: PublishingStatus;
  pendingRemoteUpdate?: { metadata: PublishedConfigMetadata; config: StoreConfig } | null;
  lastCheckedAt?: string | null;
  updateCheckError?: string | null;
  onTogglePreviewDraft?: (preview: boolean) => void;
  onCheckForUpdatesNow?: () => Promise<boolean>;
  onApplyPendingUpdate?: () => void;
}

const CMS_TABS: { id: CmsPageId; label: string; icon: React.ReactNode }[] = [
  { id: 'sections', label: '1. Sections & Layout', icon: <Eye className="w-4 h-4" /> },
  { id: 'security', label: '2. Security & PIN', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'profile', label: '3. Store Profile', icon: <Building2 className="w-4 h-4" /> },
  { id: 'contact', label: '4. Contact & WhatsApp', icon: <Phone className="w-4 h-4" /> },
  { id: 'location', label: '5. Location & Map', icon: <MapPin className="w-4 h-4" /> },
  { id: 'hours', label: '6. Business Hours', icon: <Clock className="w-4 h-4" /> },
  { id: 'announcement', label: '7. Announcement Bar', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'flashSale', label: '8. Flash Deals', icon: <Flame className="w-4 h-4" /> },
  { id: 'delivery', label: '9. Home Delivery', icon: <Truck className="w-4 h-4" /> },
  { id: 'categories', label: '10. Categories', icon: <Layers className="w-4 h-4" /> },
  { id: 'products', label: '11. Products', icon: <Package className="w-4 h-4" /> },
  { id: 'gallery', label: '12. Store Gallery', icon: <Camera className="w-4 h-4" /> },
  { id: 'appearance', label: '13. Appearance', icon: <Palette className="w-4 h-4" /> },
  { id: 'export', label: '14. Export & Backup', icon: <Download className="w-4 h-4" /> },
];

export const OwnerCMS: React.FC<OwnerCMSProps> = ({
  isOpen,
  onClose,
  config,
  storeStatus,
  onSaveConfig,
  onResetDefault,
  cmsUnlocked,
  hasConfiguredPin,
  lockoutRemainingSec,
  failedAttempts,
  pinError,
  onSetupInitialPin,
  onLoginWithPin,
  onChangePin,
  onLockCms,
  onRevokeAllSessions,
  securityAuditLog,
  cmsPage,
  onChangeCmsPage,
  onEditCategory,
  onDeleteCategory,
  onEditProduct,
  onDeleteProduct,
  onEditDeal,
  onDeleteDeal,
  onEditGalleryItem,
  onDeleteGalleryItem,
  onOpenConfirmDialog,
  onOpenShopkeeperGuide,
  onOpenDeploymentGuide,
  saveToastMessage,
  hasLocalChanges = false,
  storageStatus = 'ok',
  publishedMetadata,
  savedDraft = null,
  isPreviewingDraft = false,
  publishingStatus = 'published',
  pendingRemoteUpdate = null,
  lastCheckedAt = null,
  updateCheckError = null,
  onTogglePreviewDraft,
  onCheckForUpdatesNow,
  onApplyPendingUpdate,
}) => {
  // Login & Setup Form States
  const [pinInput, setPinInput] = useState('');
  const [setupNewPin, setSetupNewPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');

  // Change PIN inside Security tab
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [nextPinInput, setNextPinInput] = useState('');
  const [confirmNextPinInput, setConfirmNextPinInput] = useState('');
  const [pinUpdateFeedback, setPinUpdateFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // CMS Local Helpers
  const [newBusinessType, setNewBusinessType] = useState('');
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [newDeliveryTerm, setNewDeliveryTerm] = useState('');
  const [cmsProductSearch, setCmsProductSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importError, setImportError] = useState('');
  const [pendingImport, setPendingImport] = useState<{
    fileName: string;
    format: 'json' | 'typescript';
    originalSchemaVersion?: number;
    config: StoreConfig;
  } | null>(null);
  const fileImportRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // =========================================================================
  // LOCKED STATE: FIRST-TIME PIN SETUP OR PBKDF2 PIN LOGIN
  // =========================================================================
  if (!cmsUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  {hasConfiguredPin ? 'Owner CMS Security Verification' : 'Initialize Owner CMS PIN'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  PBKDF2-HMAC-SHA256 Client-Side Protection
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Close Owner CMS login"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {lockoutRemainingSec > 0 ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 text-center">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <div className="text-sm font-bold">Rate-Limit Lockout Active</div>
                <p className="text-xs text-rose-700">
                  Too many failed PIN attempts ({failedAttempts}). Please wait{' '}
                  <strong className="font-mono">{lockoutRemainingSec}s</strong> before trying again.
                </p>
              </div>
            ) : !hasConfiguredPin ? (
              /* FIRST-TIME OWNER PIN INITIALIZATION (NO DEFAULT PIN DISCLOSED) */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onSetupInitialPin(setupNewPin, setupConfirmPin);
                  setSetupNewPin('');
                  setSetupConfirmPin('');
                }}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                  <strong>First-Time Security Setup:</strong> Create your private Owner PIN (4 to 12
                  characters) to protect store management controls on this browser. Your PIN is
                  salted and hashed with 100,000 PBKDF2 iterations.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Create Owner PIN (4–12 characters) *
                  </label>
                  <input
                    type="password"
                    value={setupNewPin}
                    onChange={(e) => setSetupNewPin(e.target.value)}
                    placeholder="Enter new secret PIN"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Owner PIN *
                  </label>
                  <input
                    type="password"
                    value={setupConfirmPin}
                    onChange={(e) => setSetupConfirmPin(e.target.value)}
                    placeholder="Re-enter secret PIN"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  Save PIN &amp; Unlock Owner CMS
                </button>
              </form>
            ) : (
              /* STANDARD PIN VERIFICATION FORM */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onLoginWithPin(pinInput);
                  setPinInput('');
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your configured Owner PIN to unlock the store management dashboard. Sessions
                  automatically lock after 15 minutes of inactivity.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Security PIN
                  </label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-base font-mono tracking-widest focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  Verify &amp; Open Dashboard
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Local Browser Hardening</span>
              <button
                type="button"
                onClick={onOpenDeploymentGuide}
                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Security Architecture Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // UNLOCKED STATE: FULL 14-TAB OWNER CMS DASHBOARD
  // =========================================================================
  const validationReport = validateStoreConfig(config);

  const moveItemInArray = <T,>(arr: T[], index: number, direction: 'up' | 'down'): T[] => {
    const next = [...arr];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= next.length) return next;
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    return next;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[94vh] border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Top CMS Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <StoreLogoBadge appearance={config.appearance} size="sm" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold">
                  Owner CMS — {config.business.shortName || config.business.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Unlocked
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    publishingStatus === 'new_deployment_available'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 animate-pulse'
                      : publishingStatus === 'local_draft_saved'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        : publishingStatus === 'deployment_updated'
                          ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                          : 'bg-slate-800 text-emerald-300 border-slate-700'
                  }`}
                >
                  {publishingStatus === 'new_deployment_available'
                    ? 'New Deployment Available'
                    : publishingStatus === 'local_draft_saved'
                      ? 'Local Draft Saved'
                      : publishingStatus === 'deployment_updated'
                        ? 'Deployment Updated'
                        : 'Published Configuration'}
                </span>
                {publishedMetadata && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700 hidden md:inline">
                    {publishedMetadata.configVersion}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {publishingStatus === 'local_draft_saved'
                  ? 'Viewing unpublished browser-local draft • Replace src/config/storeConfig.ts & deploy to publish for all visitors'
                  : 'Viewing live Published Configuration • Edits create a browser-local draft until exported & deployed'}
              </p>
            </div>
          </div>

          {/* Save Toast & Top Actions */}
          <div className="flex items-center gap-2">
            {saveToastMessage && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{saveToastMessage}</span>
              </span>
            )}

            <button
              type="button"
              onClick={onOpenShopkeeperGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Easy Guide</span>
            </button>

            <button
              type="button"
              onClick={onLockCms}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              title="Lock Owner CMS Session"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              <span>Preview Store</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main CMS Body: Sidebar + Active Tab Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left / Top Navigation Tabs */}
          <aside className="lg:w-64 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-2 sm:p-3 overflow-x-auto lg:overflow-y-auto shrink-0">
            <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
              {CMS_TABS.map((tab) => {
                const active = cmsPage === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChangeCmsPage(tab.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Tab Content Workspace */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-white">
            {/* ===============================================================
                TAB 1: SECTIONS & HEADER/FOOTER GRANULAR CONTROLS
            =============================================================== */}
            {cmsPage === 'sections' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Website Section Visibility &amp; Header / Footer Controls
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Show or hide any website section, reorder header &amp; footer elements, and
                      customize button labels and mobile visibility.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSaveConfig(
                          {
                            ...config,
                            sectionVisibility: {
                              announcementBar: true,
                              headerBar: true,
                              heroSection: true,
                              flashDealsSection: true,
                              aboutSection: true,
                              categoriesSection: true,
                              catalogueSection: true,
                              deliverySection: true,
                              gallerySection: true,
                              contactMapSection: true,
                              footerSection: true,
                            },
                          },
                          'All website sections enabled'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer"
                    >
                      Enable All Sections
                    </button>
                  </div>
                </div>

                {/* 1A. Section Visibility Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Storefront Section Switches
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(
                      [
                        { key: 'announcementBar', label: 'Top Announcement Ticker' },
                        { key: 'headerBar', label: 'Main Navigation Header' },
                        { key: 'heroSection', label: 'Hero & Store ID Card' },
                        { key: 'flashDealsSection', label: 'Flash Deals Carousel' },
                        { key: 'aboutSection', label: 'About Store Section' },
                        { key: 'categoriesSection', label: '8 Product Categories' },
                        { key: 'catalogueSection', label: 'Product Catalogue & Search' },
                        { key: 'deliverySection', label: 'Home Delivery Info' },
                        { key: 'gallerySection', label: 'Store Photo Gallery' },
                        { key: 'contactMapSection', label: 'Location & Google Maps' },
                        { key: 'footerSection', label: 'Website Footer' },
                      ] as { key: keyof StoreConfig['sectionVisibility']; label: string }[]
                    ).map((sec) => {
                      const isVisible = config.sectionVisibility[sec.key] !== false;
                      return (
                        <div
                          key={sec.key}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            isVisible
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isVisible ? (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-xs font-bold text-slate-800">{sec.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onSaveConfig(
                                {
                                  ...config,
                                  sectionVisibility: {
                                    ...config.sectionVisibility,
                                    [sec.key]: !isVisible,
                                  },
                                },
                                `${sec.label} ${!isVisible ? 'shown' : 'hidden'}`
                              )
                            }
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isVisible ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    <strong>Lockout Safeguard:</strong> Even if you hide the Main Navigation Header,
                    a floating <em>Owner CMS</em> button and the <code>Ctrl + Shift + O</code>{' '}
                    shortcut always remain active so you are never locked out.
                  </p>
                </div>

                {/* 1B. Granular Header Controls: Visibility, Ordering, Custom Text & Mobile */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Header Element Visibility, Ordering &amp; Custom Labels
                      </h4>
                      <p className="text-xs text-slate-600">
                        Show/hide individual header items, change their display order, and edit
                        button text.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.headerConfig.sticky}
                          onChange={(e) =>
                            onSaveConfig(
                              {
                                ...config,
                                headerConfig: {
                                  ...config.headerConfig,
                                  sticky: e.target.checked,
                                },
                              },
                              'Header sticky mode updated'
                            )
                          }
                          className="accent-emerald-600"
                        />
                        <span>Sticky Header</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.headerConfig.compactMode}
                          onChange={(e) =>
                            onSaveConfig(
                              {
                                ...config,
                                headerConfig: {
                                  ...config.headerConfig,
                                  compactMode: e.target.checked,
                                },
                              },
                              'Header compact mode updated'
                            )
                          }
                          className="accent-emerald-600"
                        />
                        <span>Compact Height</span>
                      </label>
                    </div>
                  </div>

                  {/* Header Element Order & Show/Hide */}
                  <div className="space-y-2">
                    {config.headerConfig.elementOrder.map((elKey, idx) => {
                      const labelMap: Record<HeaderElementKey, string> = {
                        logo: 'Store Emblem / Logo Badge',
                        storeName: 'Store Title & Subtitle',
                        navLinks: 'Desktop Navigation Menu Links',
                        liveStatusBadge: 'Live IST Open/Closed Badge',
                        callButton: 'Phone Call CTA Button',
                        whatsappButton: 'WhatsApp CTA Button',
                        cmsButton: 'Owner CMS Access Button',
                      };
                      const isVis = config.headerElements[elKey] !== false;
                      return (
                        <div
                          key={elKey}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {labelMap[elKey]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onSaveConfig(
                                  {
                                    ...config,
                                    headerConfig: {
                                      ...config.headerConfig,
                                      elementOrder: moveItemInArray(
                                        config.headerConfig.elementOrder,
                                        idx,
                                        'up'
                                      ),
                                    },
                                  },
                                  'Header element order updated'
                                )
                              }
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                              title="Move Earlier"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onSaveConfig(
                                  {
                                    ...config,
                                    headerConfig: {
                                      ...config.headerConfig,
                                      elementOrder: moveItemInArray(
                                        config.headerConfig.elementOrder,
                                        idx,
                                        'down'
                                      ),
                                    },
                                  },
                                  'Header element order updated'
                                )
                              }
                              disabled={idx === config.headerConfig.elementOrder.length - 1}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                              title="Move Later"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onSaveConfig(
                                  {
                                    ...config,
                                    headerElements: {
                                      ...config.headerElements,
                                      [elKey]: !isVis,
                                    },
                                  },
                                  `${labelMap[elKey]} ${!isVis ? 'shown' : 'hidden'}`
                                )
                              }
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                isVis
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isVis ? 'Shown' : 'Hidden'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Header Button Labels & Mobile Visibility */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Call Button Label
                      </label>
                      <input
                        type="text"
                        value={config.headerConfig.callButtonText}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            headerConfig: {
                              ...config.headerConfig,
                              callButtonText: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        WhatsApp Button Label
                      </label>
                      <input
                        type="text"
                        value={config.headerConfig.whatsappButtonText}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            headerConfig: {
                              ...config.headerConfig,
                              whatsappButtonText: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        CMS Button Label
                      </label>
                      <input
                        type="text"
                        value={config.headerConfig.cmsButtonText}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            headerConfig: {
                              ...config.headerConfig,
                              cmsButtonText: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Navigation Links Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-800">
                      Navigation Menu Links (Edit Text, Order &amp; Desktop/Mobile Visibility)
                    </div>
                    <div className="space-y-2">
                      {config.headerConfig.navLinks.map((navLink, idx) => (
                        <div
                          key={navLink.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={navLink.label}
                              onChange={(e) => {
                                const updated = config.headerConfig.navLinks.map((l, i) =>
                                  i === idx ? { ...l, label: e.target.value } : l
                                );
                                onSaveConfig({
                                  ...config,
                                  headerConfig: { ...config.headerConfig, navLinks: updated },
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold w-36"
                            />
                            <input
                              type="text"
                              value={navLink.href}
                              onChange={(e) => {
                                const updated = config.headerConfig.navLinks.map((l, i) =>
                                  i === idx ? { ...l, href: e.target.value } : l
                                );
                                onSaveConfig({
                                  ...config,
                                  headerConfig: { ...config.headerConfig, navLinks: updated },
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-500 w-28"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={navLink.showOnDesktop}
                                onChange={(e) => {
                                  const updated = config.headerConfig.navLinks.map((l, i) =>
                                    i === idx ? { ...l, showOnDesktop: e.target.checked } : l
                                  );
                                  onSaveConfig({
                                    ...config,
                                    headerConfig: { ...config.headerConfig, navLinks: updated },
                                  });
                                }}
                                className="accent-emerald-600"
                              />
                              <span>Desktop</span>
                            </label>
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={navLink.showOnMobile}
                                onChange={(e) => {
                                  const updated = config.headerConfig.navLinks.map((l, i) =>
                                    i === idx ? { ...l, showOnMobile: e.target.checked } : l
                                  );
                                  onSaveConfig({
                                    ...config,
                                    headerConfig: { ...config.headerConfig, navLinks: updated },
                                  });
                                }}
                                className="accent-emerald-600"
                              />
                              <span>Mobile</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = moveItemInArray(
                                  config.headerConfig.navLinks,
                                  idx,
                                  'up'
                                );
                                onSaveConfig({
                                  ...config,
                                  headerConfig: { ...config.headerConfig, navLinks: updated },
                                });
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = moveItemInArray(
                                  config.headerConfig.navLinks,
                                  idx,
                                  'down'
                                );
                                onSaveConfig({
                                  ...config,
                                  headerConfig: { ...config.headerConfig, navLinks: updated },
                                });
                              }}
                              disabled={idx === config.headerConfig.navLinks.length - 1}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1C. Granular Footer Controls */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Footer Column Controls, Ordering &amp; Text
                      </h4>
                      <p className="text-xs text-slate-600">
                        Reorder footer columns, toggle visibility, and customize regulatory notes.
                      </p>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.footerConfig.showOnMobile}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            footerConfig: {
                              ...config.footerConfig,
                              showOnMobile: e.target.checked,
                            },
                          })
                        }
                        className="accent-emerald-600"
                      />
                      <span>Show Footer on Mobile</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {config.footerConfig.columnOrder.map((colKey, idx) => {
                      const colMap: Record<
                        FooterColumnKey,
                        { label: string; elemKey: keyof StoreConfig['footerElements'] }
                      > = {
                        brand: { label: 'Brand & Description Column', elemKey: 'brandColumn' },
                        quickLinks: { label: 'Quick Links Column', elemKey: 'quickLinksColumn' },
                        hours: { label: 'Opening Hours Column', elemKey: 'hoursColumn' },
                        contact: { label: 'Address & Contact Column', elemKey: 'contactColumn' },
                      };
                      const info = colMap[colKey];
                      const isVis = config.footerElements[info.elemKey] !== false;
                      return (
                        <div
                          key={colKey}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-bold text-slate-800">
                            {idx + 1}. {info.label}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onSaveConfig({
                                  ...config,
                                  footerConfig: {
                                    ...config.footerConfig,
                                    columnOrder: moveItemInArray(
                                      config.footerConfig.columnOrder,
                                      idx,
                                      'up'
                                    ),
                                  },
                                })
                              }
                              disabled={idx === 0}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onSaveConfig({
                                  ...config,
                                  footerConfig: {
                                    ...config.footerConfig,
                                    columnOrder: moveItemInArray(
                                      config.footerConfig.columnOrder,
                                      idx,
                                      'down'
                                    ),
                                  },
                                })
                              }
                              disabled={idx === config.footerConfig.columnOrder.length - 1}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onSaveConfig({
                                  ...config,
                                  footerElements: {
                                    ...config.footerElements,
                                    [info.elemKey]: !isVis,
                                  },
                                })
                              }
                              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                                isVis
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isVis ? 'Shown' : 'Hidden'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Footer Copyright Location Suffix
                      </label>
                      <input
                        type="text"
                        value={config.footerConfig.copyrightSuffix}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            footerConfig: {
                              ...config.footerConfig,
                              copyrightSuffix: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Footer Pharmacy Regulatory Note
                      </label>
                      <input
                        type="text"
                        value={config.footerConfig.regulatoryNote}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            footerConfig: {
                              ...config.footerConfig,
                              regulatoryNote: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 2: SECURITY & PIN SHIELD
            =============================================================== */}
            {cmsPage === 'security' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Security &amp; PIN Shield (PBKDF2-HMAC-SHA256)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Manage your Owner CMS secret PIN, review security audit events, and revoke
                    active browser sessions.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Update PIN Form */}
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Change Owner Security PIN</span>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const ok = await onChangePin(
                          currentPinInput,
                          nextPinInput,
                          confirmNextPinInput
                        );
                        if (ok) {
                          setPinUpdateFeedback({
                            type: 'success',
                            text: 'Owner PIN updated and re-hashed with 100,000 PBKDF2 iterations.',
                          });
                          setCurrentPinInput('');
                          setNextPinInput('');
                          setConfirmNextPinInput('');
                        } else {
                          setPinUpdateFeedback({
                            type: 'error',
                            text: 'Could not update PIN. Verify current PIN and ensure new PIN is 4–12 characters.',
                          });
                        }
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Current PIN
                        </label>
                        <input
                          type="password"
                          value={currentPinInput}
                          onChange={(e) => setCurrentPinInput(e.target.value)}
                          placeholder="Enter current PIN"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          New PIN (4–12 characters)
                        </label>
                        <input
                          type="password"
                          value={nextPinInput}
                          onChange={(e) => setNextPinInput(e.target.value)}
                          placeholder="Enter new PIN"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirm New PIN
                        </label>
                        <input
                          type="password"
                          value={confirmNextPinInput}
                          onChange={(e) => setConfirmNextPinInput(e.target.value)}
                          placeholder="Confirm new PIN"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                        />
                      </div>

                      {pinUpdateFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-semibold ${
                            pinUpdateFeedback.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {pinUpdateFeedback.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Update Cryptographic PIN Hash
                      </button>
                    </form>
                  </div>

                  {/* Session Control & Architecture Notice */}
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Active Security Controls
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        <li>• WebCrypto PBKDF2-HMAC-SHA256 (100,000 iterations + random salt)</li>
                        <li>• Progressive rate limiting (45s @ 4 attempts, 5m @ 6 attempts)</li>
                        <li>• Automatic 15-minute session expiry &amp; idle inactivity lock</li>
                        <li>• Zero plaintext default PINs or hardcoded keys in UI</li>
                      </ul>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={onRevokeAllSessions}
                          className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Emergency Revoke Session &amp; Lock CMS Now
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                      <strong>Architectural Security Notice:</strong> Client-side PBKDF2 hardens the
                      local browser CMS against unauthorized counter access. Because a static React
                      SPA runs entirely in the user&apos;s browser, true multi-device authorization
                      requires a backend server with server-side session validation.
                    </div>
                  </div>
                </div>

                {/* Security Audit Log */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>Recent Security Audit Trail</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {securityAuditLog.length === 0 ? (
                      <div className="text-xs text-slate-500">No security events recorded yet.</div>
                    ) : (
                      securityAuditLog.map((entry, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800">{entry.event}</span>
                          <span className="font-mono text-[11px] text-slate-500">{entry.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 3: STORE PROFILE
            =============================================================== */}
            {cmsPage === 'profile' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Store Identity &amp; Profile
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Manage your official store name, hero headline, description, and business
                    category tags.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Store Name *
                    </label>
                    <input
                      type="text"
                      value={config.business.name}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: { ...config.business, name: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Short Name
                    </label>
                    <input
                      type="text"
                      value={config.business.shortName}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: { ...config.business, shortName: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hero Tagline / Main Headline *
                  </label>
                  <input
                    type="text"
                    value={config.business.tagline}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        business: { ...config.business, tagline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hero Subheadline
                  </label>
                  <textarea
                    rows={2}
                    value={config.business.subheadline}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        business: { ...config.business, subheadline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    About Store Description
                  </label>
                  <textarea
                    rows={3}
                    value={config.business.description}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        business: { ...config.business, description: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                {/* Business Category Tags */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Business Category Badges
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {config.business.businessTypes.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onSaveConfig({
                              ...config,
                              business: {
                                ...config.business,
                                businessTypes: config.business.businessTypes.filter(
                                  (_, i) => i !== idx
                                ),
                              },
                            })
                          }
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBusinessType}
                      onChange={(e) => setNewBusinessType(e.target.value)}
                      placeholder="Add category tag (e.g. Surgical Supplies)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBusinessType.trim()) return;
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            businessTypes: [
                              ...config.business.businessTypes,
                              newBusinessType.trim(),
                            ],
                          },
                        });
                        setNewBusinessType('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 4: CONTACT & WHATSAPP
            =============================================================== */}
            {cmsPage === 'contact' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Contact Numbers &amp; WhatsApp Configuration
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Update store telephone numbers, WhatsApp numbers, and default enquiry text.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Phone (Digits) *
                    </label>
                    <input
                      type="text"
                      value={config.business.contact.primaryPhone}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            contact: { ...config.business.contact, primaryPhone: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Phone Display Format
                    </label>
                    <input
                      type="text"
                      value={config.business.contact.primaryPhoneDisplay}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            contact: {
                              ...config.business.contact,
                              primaryPhoneDisplay: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Secondary Phone (Digits)
                    </label>
                    <input
                      type="text"
                      value={config.business.contact.secondaryPhone}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            contact: { ...config.business.contact, secondaryPhone: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Secondary Phone Display Format
                    </label>
                    <input
                      type="text"
                      value={config.business.contact.secondaryPhoneDisplay}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            contact: {
                              ...config.business.contact,
                              secondaryPhoneDisplay: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary WhatsApp Number (with 91) *
                    </label>
                    <input
                      type="text"
                      value={config.business.contact.whatsappNumber}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            contact: { ...config.business.contact, whatsappNumber: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Secondary WhatsApp Number (with 91)
                    </label>
                    <input
                      type="text"
                      value={config.business.contact.secondaryWhatsappNumber}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            contact: {
                              ...config.business.contact,
                              secondaryWhatsappNumber: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default WhatsApp Greeting Message
                  </label>
                  <textarea
                    rows={2}
                    value={config.business.contact.whatsappDefaultMessage}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        business: {
                          ...config.business,
                          contact: {
                            ...config.business.contact,
                            whatsappDefaultMessage: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 5: LOCATION & GOOGLE MAPS
            =============================================================== */}
            {cmsPage === 'location' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Store Address &amp; Google Maps Integration
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Configure Siddhesh Complex, Adarsha Nagar, Manipal address details and Google
                    Maps links.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Building / Complex
                    </label>
                    <input
                      type="text"
                      value={config.business.address.building}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            address: { ...config.business.address, building: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      value={config.business.address.area}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            address: { ...config.business.address, area: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City &amp; PIN Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={config.business.address.city}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            business: {
                              ...config.business,
                              address: { ...config.business.address, city: e.target.value },
                            },
                          })
                        }
                        className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        value={config.business.address.pincode}
                        onChange={(e) =>
                          onSaveConfig({
                            ...config,
                            business: {
                              ...config.business,
                              address: { ...config.business.address, pincode: e.target.value },
                            },
                          })
                        }
                        className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Formatted Address *
                  </label>
                  <input
                    type="text"
                    value={config.business.address.fullAddress}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        business: {
                          ...config.business,
                          address: { ...config.business.address, fullAddress: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Google Maps Embed URL (or paste full &lt;iframe&gt; code)
                  </label>
                  <input
                    type="text"
                    value={config.business.map.embedIframeUrl}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        business: {
                          ...config.business,
                          map: {
                            ...config.business.map,
                            embedIframeUrl: sanitizeMapEmbedInput(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 6: BUSINESS HOURS & LIVE STATUS OVERRIDE
            =============================================================== */}
            {cmsPage === 'hours' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Opening Hours (IST) &amp; Live Status Override
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Configure daily opening and closing times (default 07:30 to 23:00 IST) or
                    override the live store status for holidays/emergencies.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Opens At (24-Hour HH:mm IST)
                    </label>
                    <input
                      type="time"
                      value={config.business.hours.opensAt}
                      onChange={(e) => {
                        const opensAt = e.target.value;
                        const display = `${formatTime12(opensAt)} – ${formatTime12(
                          config.business.hours.closesAt
                        )}`;
                        onSaveConfig(
                          {
                            ...config,
                            business: {
                              ...config.business,
                              hours: { ...config.business.hours, opensAt, display },
                            },
                          },
                          'Opening time updated'
                        );
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Closes At (24-Hour HH:mm IST)
                    </label>
                    <input
                      type="time"
                      value={config.business.hours.closesAt}
                      onChange={(e) => {
                        const closesAt = e.target.value;
                        const display = `${formatTime12(
                          config.business.hours.opensAt
                        )} – ${formatTime12(closesAt)}`;
                        onSaveConfig(
                          {
                            ...config,
                            business: {
                              ...config.business,
                              hours: { ...config.business.hours, closesAt, display },
                            },
                          },
                          'Closing time updated'
                        );
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Display Timings Text
                    </label>
                    <input
                      type="text"
                      value={config.business.hours.display}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            hours: { ...config.business.hours, display: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Days Open Summary
                    </label>
                    <input
                      type="text"
                      value={config.business.hours.daysSummary}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          business: {
                            ...config.business,
                            hours: { ...config.business.hours, daysSummary: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                {/* Manual Live Status Override */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-sm font-bold text-slate-900">
                    Live Store Status Mode (Current: {storeStatus.badgeText} •{' '}
                    {storeStatus.currentTimeIST})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          mode: 'auto',
                          title: 'Automatic IST Clock',
                          desc: 'Automatically switches Open/Closed based on 7:30 AM – 11:00 PM IST.',
                        },
                        {
                          mode: 'force_open',
                          title: 'Force Open Now',
                          desc: 'Displays store as Open Now regardless of current clock.',
                        },
                        {
                          mode: 'force_closed',
                          title: 'Force Closed (Holiday/Break)',
                          desc: 'Displays store as Currently Closed with emergency WhatsApp bar.',
                        },
                      ] as { mode: LiveStatusOverride; title: string; desc: string }[]
                    ).map((item) => {
                      const active = (config.business.hours.statusOverride || 'auto') === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() =>
                            onSaveConfig(
                              {
                                ...config,
                                business: {
                                  ...config.business,
                                  hours: {
                                    ...config.business.hours,
                                    statusOverride: item.mode,
                                  },
                                },
                              },
                              `Store status mode set to ${item.title}`
                            )
                          }
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-600 mt-1">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 7: ANNOUNCEMENT TICKER
            =============================================================== */}
            {cmsPage === 'announcement' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Top Announcement Marquee Ticker
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Manage scrolling store announcements and ticker speed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onSaveConfig(
                        {
                          ...config,
                          announcement: {
                            ...config.announcement,
                            enabled: !config.announcement.enabled,
                          },
                        },
                        `Announcement bar ${!config.announcement.enabled ? 'enabled' : 'disabled'}`
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      config.announcement.enabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {config.announcement.enabled ? 'Ticker Enabled' : 'Ticker Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={config.announcement.badgeText}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          announcement: { ...config.announcement, badgeText: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Scroll Cycle Duration ({config.announcement.speedSeconds} seconds)
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      value={config.announcement.speedSeconds}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          announcement: {
                            ...config.announcement,
                            speedSeconds: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-emerald-600 mt-2"
                    />
                  </div>
                </div>

                {/* Add New Announcement Item */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAnnouncementText}
                    onChange={(e) => setNewAnnouncementText(e.target.value)}
                    placeholder="Type a new scrolling announcement message..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAnnouncementText.trim()) return;
                      onSaveConfig(
                        {
                          ...config,
                          announcement: {
                            ...config.announcement,
                            items: [...config.announcement.items, newAnnouncementText.trim()],
                          },
                        },
                        'Announcement item added'
                      );
                      setNewAnnouncementText('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    + Add Message
                  </button>
                </div>

                <div className="space-y-2">
                  {config.announcement.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = config.announcement.items.map((it, i) =>
                            i === idx ? e.target.value : it
                          );
                          onSaveConfig({
                            ...config,
                            announcement: { ...config.announcement, items: updated },
                          });
                        }}
                        className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.announcement.items.filter((_, i) => i !== idx);
                          onSaveConfig(
                            {
                              ...config,
                              announcement: { ...config.announcement, items: updated },
                            },
                            'Announcement removed'
                          );
                        }}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 8: FLASH DEALS & SEASONAL OFFERS
            =============================================================== */}
            {cmsPage === 'flashSale' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Flash Deals &amp; Seasonal Offers Manager
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Create bundle offers for OTC wellness, devices, personal care &amp; general
                      store items (strictly non-Rx).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSaveConfig(
                          {
                            ...config,
                            flashSale: {
                              ...config.flashSale,
                              showWelcomePopup: !config.flashSale.showWelcomePopup,
                            },
                          },
                          `Welcome Pop-up ${
                            !config.flashSale.showWelcomePopup ? 'enabled' : 'disabled'
                          }`
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        config.flashSale.showWelcomePopup
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {config.flashSale.showWelcomePopup
                        ? 'Welcome Pop-up: Active (1.2s + Tab Re-engage)'
                        : 'Welcome Pop-up: Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onEditDeal(
                          {
                            id: `deal-${Date.now()}`,
                            title: '',
                            subtitle: '',
                            discountBadge: 'UP TO 10% OFF',
                            couponCode: 'SAI10',
                            originalPrice: '₹500',
                            offerPrice: '₹450',
                            validUntil: 'Limited Time Offer',
                            category: 'OTC & Daily Wellness',
                            imageUrl:
                              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
                            priceCalculationMode: 'auto',
                          },
                          true
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Offer</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Section Headline
                    </label>
                    <input
                      type="text"
                      value={config.flashSale.bannerTitle}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          flashSale: { ...config.flashSale, bannerTitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rotation Speed (Seconds per slide)
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={config.flashSale.intervalSeconds}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          flashSale: {
                            ...config.flashSale,
                            intervalSeconds: Math.max(2, Number(e.target.value) || 4),
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.flashSale.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <SafeImage
                            src={offer.imageUrl}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                              {offer.discountBadge}
                            </span>
                            {offer.couponCode && (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
                                Code: {offer.couponCode}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                            {offer.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            {offer.subtitle}
                          </p>
                          <div className="text-xs font-mono font-bold text-emerald-700 mt-1">
                            {offer.offerPrice}{' '}
                            {offer.originalPrice && (
                              <span className="text-slate-400 line-through ml-1">
                                {offer.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => onEditDeal(offer, false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDeal(offer.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 9: HOME DELIVERY
            =============================================================== */}
            {cmsPage === 'delivery' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Home Delivery Configuration
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Configure delivery availability, coverage area, and terms.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onSaveConfig(
                        {
                          ...config,
                          delivery: {
                            ...config.delivery,
                            available: !config.delivery.available,
                          },
                        },
                        `Home delivery ${!config.delivery.available ? 'enabled' : 'disabled'}`
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      config.delivery.available
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {config.delivery.available ? 'Delivery Available' : 'Pickup Only'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Headline
                  </label>
                  <input
                    type="text"
                    value={config.delivery.headline}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        delivery: { ...config.delivery, headline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Summary Description
                  </label>
                  <textarea
                    rows={2}
                    value={config.delivery.summary}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        delivery: { ...config.delivery, summary: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coverage Area Note
                  </label>
                  <input
                    type="text"
                    value={config.delivery.coverageNote}
                    onChange={(e) =>
                      onSaveConfig({
                        ...config,
                        delivery: { ...config.delivery, coverageNote: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                {/* Delivery Terms List */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Delivery Terms &amp; Conditions
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDeliveryTerm}
                      onChange={(e) => setNewDeliveryTerm(e.target.value)}
                      placeholder="Add a delivery guideline or term..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDeliveryTerm.trim()) return;
                        onSaveConfig(
                          {
                            ...config,
                            delivery: {
                              ...config.delivery,
                              terms: [...config.delivery.terms, newDeliveryTerm.trim()],
                            },
                          },
                          'Delivery term added'
                        );
                        setNewDeliveryTerm('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      + Add Term
                    </button>
                  </div>

                  {config.delivery.terms.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <input
                        type="text"
                        value={term}
                        onChange={(e) => {
                          const updated = config.delivery.terms.map((t, i) =>
                            i === idx ? e.target.value : t
                          );
                          onSaveConfig({
                            ...config,
                            delivery: { ...config.delivery, terms: updated },
                          });
                        }}
                        className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.delivery.terms.filter((_, i) => i !== idx);
                          onSaveConfig(
                            {
                              ...config,
                              delivery: { ...config.delivery, terms: updated },
                            },
                            'Delivery term removed'
                          );
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 10: PRODUCT CATEGORIES MANAGER
            =============================================================== */}
            {cmsPage === 'categories' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Store Categories Manager ({config.categories.length})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Add, edit, or remove store departments shown on the homepage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onEditCategory(
                        {
                          id: `cat-${Date.now()}`,
                          title: '',
                          description: '',
                          iconName: 'Pill',
                          badgeText: 'Available',
                          subText: 'Browse Items',
                        },
                        true
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                          </div>
                          {cat.badgeText && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                              {cat.badgeText}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{cat.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => onEditCategory(cat, false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 11: PRODUCT CATALOGUE MANAGER
            =============================================================== */}
            {cmsPage === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Product &amp; Medicine Catalogue ({config.products.length})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Add products, toggle stock availability in 1 click, and mark prescription-only
                      (Rx) items.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cmsProductSearch}
                        onChange={(e) => setCmsProductSearch(e.target.value)}
                        placeholder="Filter products..."
                        className="pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onEditProduct(
                          {
                            id: `prod-${Date.now()}`,
                            name: '',
                            category: config.categories[0]?.title || 'OTC & Daily Wellness',
                            description: '',
                            availability: 'In Stock',
                            isPrescription: false,
                            packInfo: 'Standard Pack',
                            imageUrl: '',
                          },
                          true
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.products
                    .filter((p) => {
                      const q = cmsProductSearch.trim().toLowerCase();
                      return (
                        !q ||
                        p.name.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q)
                      );
                    })
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                            <SafeImage
                              src={prod.imageUrl}
                              alt={prod.name}
                              fallbackTitle={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold uppercase text-emerald-700">
                              {prod.category}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {prod.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                          <div className="flex items-center gap-1.5">
                            {/* 1-Click Stock Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextAvail: StoreProduct['availability'] =
                                  prod.availability === 'In Stock'
                                    ? 'Ask for Availability'
                                    : 'In Stock';
                                const updated = config.products.map((p) =>
                                  p.id === prod.id ? { ...p, availability: nextAvail } : p
                                );
                                onSaveConfig(
                                  { ...config, products: updated },
                                  `${prod.name} marked as ${nextAvail}`
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                prod.availability === 'In Stock'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {prod.availability}
                            </button>

                            {/* 1-Click Rx Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = config.products.map((p) =>
                                  p.id === prod.id
                                    ? { ...p, isPrescription: !p.isPrescription }
                                    : p
                                );
                                onSaveConfig(
                                  { ...config, products: updated },
                                  `${prod.name} Rx requirement updated`
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                prod.isPrescription
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              {prod.isPrescription ? 'Rx Required' : 'OTC / General'}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditProduct(prod, false)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 12: STORE GALLERY MANAGER
            =============================================================== */}
            {cmsPage === 'gallery' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Store Photograph Gallery ({config.gallery.length})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Upload store exterior, shelf, and counter photos and assign them to Hero,
                      About, or Gallery slots.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onEditGalleryItem(
                        {
                          id: `gal-${Date.now()}`,
                          title: '',
                          caption: '',
                          category: 'Interior',
                          imageUrl: '',
                          isPlaceholder: false,
                          targetSection: 'gallery',
                        },
                        true
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Store Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.gallery.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-40 bg-slate-200 relative">
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                            Slot: {item.targetSection || 'gallery'}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.caption}</p>
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditGalleryItem(item, false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteGalleryItem(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 13: APPEARANCE & BRAND EMBLEM
            =============================================================== */}
            {cmsPage === 'appearance' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Store Emblem &amp; Visual Appearance
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Customize the store logo badge symbol, shape, border accent, and floating
                    WhatsApp widget.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-5">
                  <StoreLogoBadge appearance={config.appearance} size="lg" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Live Emblem Preview</div>
                    <div className="text-xs text-slate-600">
                      Appears in the main navigation header and website footer.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Logo Symbol Mode
                    </label>
                    <select
                      value={config.appearance.logoSymbolMode || 'initials'}
                      onChange={(e) =>
                        onSaveConfig(
                          {
                            ...config,
                            appearance: {
                              ...config.appearance,
                              logoSymbolMode: e.target
                                .value as StoreConfig['appearance']['logoSymbolMode'],
                            },
                          },
                          'Logo symbol updated'
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="initials">SS MED Monogram</option>
                      <option value="cross">Medical Cross (+)</option>
                      <option value="rx">Pharmacy Symbol (℞)</option>
                      <option value="om">Sacred Emblem (ॐ)</option>
                      <option value="custom_image">Custom Image URL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge Shape
                    </label>
                    <select
                      value={config.appearance.logoShape || 'squircle'}
                      onChange={(e) =>
                        onSaveConfig(
                          {
                            ...config,
                            appearance: {
                              ...config.appearance,
                              logoShape: e.target.value as StoreConfig['appearance']['logoShape'],
                            },
                          },
                          'Logo shape updated'
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="squircle">Modern Squircle</option>
                      <option value="rounded">Rounded Square</option>
                      <option value="circle">Circle</option>
                      <option value="shield">Crest Shield</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Border Trim Accent
                    </label>
                    <select
                      value={config.appearance.logoBorderColor || 'gold'}
                      onChange={(e) =>
                        onSaveConfig(
                          {
                            ...config,
                            appearance: {
                              ...config.appearance,
                              logoBorderColor: e.target
                                .value as StoreConfig['appearance']['logoBorderColor'],
                            },
                          },
                          'Logo border updated'
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="gold">Royal Gold Ring</option>
                      <option value="emerald">Emerald Glow</option>
                      <option value="white">Subtle Glass</option>
                    </select>
                  </div>
                </div>

                {config.appearance.logoSymbolMode === 'custom_image' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Logo Image URL
                    </label>
                    <input
                      type="text"
                      value={config.appearance.customLogoUrl || ''}
                      onChange={(e) =>
                        onSaveConfig({
                          ...config,
                          appearance: { ...config.appearance, customLogoUrl: e.target.value },
                        })
                      }
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Brand Color Palette &amp; Global Bar Visibility
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Brand Green
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.appearance.primaryGreen || '#059669'}
                          onChange={(e) =>
                            onSaveConfig(
                              {
                                ...config,
                                appearance: {
                                  ...config.appearance,
                                  primaryGreen: e.target.value,
                                },
                              },
                              'Primary brand color updated'
                            )
                          }
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.appearance.primaryGreen || '#059669'}
                          onChange={(e) =>
                            onSaveConfig({
                              ...config,
                              appearance: {
                                ...config.appearance,
                                primaryGreen: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Secondary Accent Green
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.appearance.secondaryGreen || '#047857'}
                          onChange={(e) =>
                            onSaveConfig(
                              {
                                ...config,
                                appearance: {
                                  ...config.appearance,
                                  secondaryGreen: e.target.value,
                                },
                              },
                              'Secondary color updated'
                            )
                          }
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.appearance.secondaryGreen || '#047857'}
                          onChange={(e) =>
                            onSaveConfig({
                              ...config,
                              appearance: {
                                ...config.appearance,
                                secondaryGreen: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Light Tint Surface
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.appearance.lightGreen || '#ECFDF5'}
                          onChange={(e) =>
                            onSaveConfig(
                              {
                                ...config,
                                appearance: {
                                  ...config.appearance,
                                  lightGreen: e.target.value,
                                },
                              },
                              'Light surface color updated'
                            )
                          }
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.appearance.lightGreen || '#ECFDF5'}
                          onChange={(e) =>
                            onSaveConfig({
                              ...config,
                              appearance: {
                                ...config.appearance,
                                lightGreen: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.appearance.showFloatingWhatsApp}
                        onChange={(e) =>
                          onSaveConfig(
                            {
                              ...config,
                              appearance: {
                                ...config.appearance,
                                showFloatingWhatsApp: e.target.checked,
                              },
                            },
                            'Floating WhatsApp button updated'
                          )
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span>Show Floating WhatsApp Button in Bottom-Right Corner</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.appearance.showAnnouncementBar}
                        onChange={(e) =>
                          onSaveConfig(
                            {
                              ...config,
                              appearance: {
                                ...config.appearance,
                                showAnnouncementBar: e.target.checked,
                              },
                              sectionVisibility: {
                                ...config.sectionVisibility,
                                announcementBar: e.target.checked,
                              },
                            },
                            'Announcement bar visibility updated'
                          )
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span>Show Top Announcement Ticker Bar</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 14: EXPORT, BACKUP, RESTORE & VALIDATION
            =============================================================== */}
            {cmsPage === 'export' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Data Management, Backup &amp; Permanent Code Export
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Schema Version v{config.schemaVersion} • Export{' '}
                      <code>src/config/storeConfig.ts</code> for direct replacement or download JSON
                      backups.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenDeploymentGuide}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    Static Hosting Workflow Guide
                  </button>
                </div>

                {/* New Deployment Available Banner */}
                {pendingRemoteUpdate && (
                  <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-400 text-sky-950 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-ping" />
                        <span>
                          New Deployment Available ({pendingRemoteUpdate.metadata.configVersion})
                        </span>
                      </div>
                      <p className="text-xs text-sky-800">
                        A newer published website deployment (Build{' '}
                        <code className="font-mono">{pendingRemoteUpdate.metadata.buildId}</code>)
                        was detected. Apply it now to synchronize your view with the latest live
                        deployment.
                      </p>
                    </div>
                    {onApplyPendingUpdate && (
                      <button
                        type="button"
                        onClick={onApplyPendingUpdate}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        Apply New Deployment Now
                      </button>
                    )}
                  </div>
                )}

                {/* Published Configuration Version & Local Draft Status Card */}
                <div
                  className={`p-5 rounded-3xl border space-y-4 ${
                    publishingStatus === 'local_draft_saved'
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : publishingStatus === 'deployment_updated'
                        ? 'bg-teal-50/90 border-teal-300 text-teal-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            publishingStatus === 'new_deployment_available'
                              ? 'bg-sky-600 text-white'
                              : publishingStatus === 'local_draft_saved'
                                ? 'bg-amber-600 text-white'
                                : publishingStatus === 'deployment_updated'
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-emerald-600 text-white'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-white" />
                          {publishingStatus === 'new_deployment_available'
                            ? 'New Deployment Available'
                            : publishingStatus === 'local_draft_saved'
                              ? 'Local Draft Saved'
                              : publishingStatus === 'deployment_updated'
                                ? 'Deployment Updated'
                                : 'Published Configuration'}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {isPreviewingDraft && savedDraft
                            ? 'Currently Editing Unpublished Browser-Local Draft'
                            : 'Currently Viewing Live Published Configuration'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {hasLocalChanges
                          ? 'Important: Saving edits in Owner CMS stores a Local CMS Draft in this browser only. Ordinary website visitors always see the Published Configuration until you download storeConfig.ts below, replace src/config/storeConfig.ts in the project, run npm run build, and deploy.'
                          : 'All public visitors automatically receive this Published Configuration. Any edits you make in Owner CMS will be saved as a separate Local Draft until exported and deployed.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {savedDraft && onTogglePreviewDraft && (
                        <button
                          type="button"
                          onClick={() => onTogglePreviewDraft(!isPreviewingDraft)}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          {isPreviewingDraft
                            ? 'Switch to Published Configuration'
                            : 'Load Saved Local Draft'}
                        </button>
                      )}
                      {onCheckForUpdatesNow && (
                        <button
                          type="button"
                          onClick={() => {
                            void onCheckForUpdatesNow();
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Check for Deployment Update</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Deployment Metadata Grid */}
                  {publishedMetadata && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Published Config Version
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900 mt-0.5 truncate">
                          {publishedMetadata.configVersion}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Deployment Build ID
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900 mt-0.5 truncate">
                          {publishedMetadata.buildId}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Published Timestamp
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900 mt-0.5 truncate">
                          {publishedMetadata.publishedAt}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Local Draft Status
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                          {savedDraft
                            ? `Saved (${new Date(savedDraft.updatedAt).toLocaleTimeString()})`
                            : 'No Unpublished Draft'}
                        </div>
                      </div>
                    </div>
                  )}

                  {lastCheckedAt && (
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Automatic deployment check active (`/version.json` every 60s + tab focus &amp;
                        online events) • Last checked: {new Date(lastCheckedAt).toLocaleTimeString()}
                      </span>
                      {updateCheckError && (
                        <span className="text-rose-600 font-semibold">
                          Last update check warning: {updateCheckError}
                        </span>
                      )}
                    </div>
                  )}

                  {storageStatus !== 'ok' && (
                    <div className="px-3 py-2 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold">
                      {storageStatus === 'quota_exceeded'
                        ? 'LocalStorage Quota Exceeded — Export File Immediately'
                        : 'LocalStorage Unavailable in Private Mode'}
                    </div>
                  )}
                </div>

                {/* Configuration Validation Status */}
                <div
                  className={`p-4 rounded-2xl border ${
                    validationReport.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    {validationReport.valid ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {validationReport.valid
                        ? 'Configuration Validation Passed (All business, schema v3 & pharmacy compliance checks healthy)'
                        : `Configuration Has ${validationReport.issues.length} Validation Issue(s)`}
                    </span>
                  </div>
                  {validationReport.issues.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                      {validationReport.issues.map((iss, idx) => (
                        <li key={idx}>
                          <strong>{iss.field}:</strong> {iss.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Backup, Restore (.json or .ts) & Factory Reset Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([generateStoreConfigCode(config)], {
                        type: 'text/typescript',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'storeConfig.ts';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-left space-y-1 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <FileCode2 className="w-4 h-4" />
                      <span>Download storeConfig.ts</span>
                    </div>
                    <p className="text-[11px] text-emerald-100">
                      Directly replace <code>src/config/storeConfig.ts</code> and redeploy.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const normalized = normalizeStoreConfig(config);
                      const blob = new Blob([JSON.stringify(normalized, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `storeConfig.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-left space-y-1 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Download storeConfig.json</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Save a portable JSON configuration backup to your device.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileImportRef.current?.click()}
                    className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left space-y-1 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Import .json or .ts File</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Validate &amp; preview a <code>storeConfig.json</code> or{' '}
                      <code>storeConfig.ts</code> file before applying.
                    </p>
                    <input
                      ref={fileImportRef}
                      type="file"
                      accept=".json,.ts,application/json,text/plain"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          setImportError('Configuration file rejected: file size exceeds 2 MB limit.');
                          setPendingImport(null);
                          e.target.value = '';
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const rawText = String(ev.target?.result || '');
                            const parsedResult = parseImportedConfigContent(rawText);
                            if (!parsedResult.ok || !parsedResult.rawObject) {
                              setImportError(
                                parsedResult.error ||
                                  'Configuration file rejected: unrecognized format.'
                              );
                              setPendingImport(null);
                              return;
                            }
                            const rawObj = parsedResult.rawObject;
                            if (!('business' in rawObj)) {
                              setImportError(
                                'Configuration file rejected: missing required root StoreConfig "business" property.'
                              );
                              setPendingImport(null);
                              return;
                            }
                            const migrated = migrateAndNormalizeConfig(rawObj);
                            const validation = validateStoreConfig(migrated);
                            if (!validation.valid) {
                              setImportError(
                                `Configuration file rejected due to validation/compliance error: ${validation.issues[0].field} — ${validation.issues[0].message}`
                              );
                              setPendingImport(null);
                              return;
                            }
                            setImportError('');
                            setPendingImport({
                              fileName: file.name,
                              format: parsedResult.detectedFormat || 'json',
                              originalSchemaVersion: parsedResult.detectedSchemaVersion,
                              config: migrated,
                            });
                          } catch (err) {
                            setPendingImport(null);
                            setImportError(
                              err instanceof Error
                                ? `Invalid configuration file: ${err.message}`
                                : 'Invalid configuration file.'
                            );
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenConfirmDialog({
                        title: 'Reset Store Configuration to Factory Defaults?',
                        message:
                          'This will restore the deployed Shri Sai Medical & General Store configuration in this browser. Download a backup first if you want to keep your custom edits.',
                        confirmLabel: 'Reset to Defaults',
                        danger: true,
                        onConfirm: () => {
                          setPendingImport(null);
                          setImportError('');
                          onResetDefault();
                        },
                      })
                    }
                    className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-left space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>Reset Factory Defaults</span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Revert local browser overrides back to the deployed store defaults.
                    </p>
                  </button>
                </div>

                {/* Import Error Alert */}
                {importError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{importError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImportError('')}
                      className="text-rose-600 hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Import Preview & Confirmation Card */}
                {pendingImport && (
                  <div className="p-5 rounded-3xl bg-emerald-50/90 border-2 border-emerald-500/40 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white">
                          Ready to Import •{' '}
                          {pendingImport.format === 'typescript'
                            ? 'TypeScript (storeConfig.ts)'
                            : 'JSON Backup'}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                          Preview Imported Configuration: {pendingImport.fileName}
                        </h4>
                        <p className="text-xs text-slate-600">
                          Detected Schema v{pendingImport.originalSchemaVersion ?? 1} → Normalized to
                          Schema v{pendingImport.config.schemaVersion} • Store Name:{' '}
                          <strong>{pendingImport.config.business.name}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingImport(null)}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSaveConfig(
                              pendingImport.config,
                              `Imported ${pendingImport.fileName} successfully`
                            );
                            setPendingImport(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm &amp; Apply Configuration</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-white border border-emerald-200">
                        <div className="text-base font-extrabold text-slate-900">
                          {pendingImport.config.categories.length}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">Categories</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-emerald-200">
                        <div className="text-base font-extrabold text-slate-900">
                          {pendingImport.config.products.length}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">Products</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-emerald-200">
                        <div className="text-base font-extrabold text-slate-900">
                          {pendingImport.config.flashSale.offers.length}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">Flash Deals</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-emerald-200">
                        <div className="text-base font-extrabold text-slate-900">
                          {pendingImport.config.gallery.length}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Gallery Photos
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Permanent Source Code Generator for Static Hosting */}
                <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs sm:text-sm font-bold">
                        Generated <code>src/config/storeConfig.ts</code> (Drop-In Replaceable File)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generateStoreConfigCode(config));
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                      >
                        {copiedCode ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedCode ? 'Copied TypeScript!' : 'Copy storeConfig.ts Code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(normalizeStoreConfig(config), null, 2)
                          );
                          setCopiedJson(true);
                          setTimeout(() => setCopiedJson(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        {copiedJson ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>1-Step Permanent Deployment:</strong> Replace the entire contents of{' '}
                    <code>src/config/storeConfig.ts</code> with the generated code below (or
                    overwrite the file with your downloaded <code>storeConfig.ts</code>), then run{' '}
                    <code>npm run build</code> and deploy. No manual edits or type adjustments are
                    required.
                  </p>
                  <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-56 overflow-auto">
                    {generateStoreConfigCode(config)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
