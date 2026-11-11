import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Check,
  AlertCircle,
  Upload,
  Sparkles,
  Flame,
  MessageCircle,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Globe,
  FileCode2,
  Database,
  ChevronLeft,
  ChevronRight,
  Tag,
  Copy,
  Pause,
  Play,
} from 'lucide-react';
import {
  FlashDealItem,
  StoreCategory,
  StoreConfig,
  StoreGalleryItem,
  StoreProduct,
} from '../config/storeConfig';
import {
  calculateOfferPrice,
  createFlashDealWhatsAppMessage,
  createWhatsAppLink,
  extractDiscountPercent,
  isRestrictedRxOffer,
} from '../utils/storeUtils';
import { CategoryIcon, SafeImage } from './SafeImage';

export type CmsPageId =
  | 'sections'
  | 'security'
  | 'profile'
  | 'contact'
  | 'location'
  | 'hours'
  | 'announcement'
  | 'flashSale'
  | 'delivery'
  | 'categories'
  | 'products'
  | 'gallery'
  | 'appearance'
  | 'export';

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface ModalsProps {
  config: StoreConfig;
  // Category Modal
  editingCategory: StoreCategory | null;
  isNewCategory: boolean;
  onChangeEditingCategory: (cat: StoreCategory | null) => void;
  onSaveCategory: (cat: StoreCategory) => void;
  // Product Modal
  editingProduct: StoreProduct | null;
  isNewProduct: boolean;
  onChangeEditingProduct: (prod: StoreProduct | null) => void;
  onSaveProduct: (prod: StoreProduct) => void;
  // Flash Deal Modal
  editingDeal: FlashDealItem | null;
  isNewDeal: boolean;
  onChangeEditingDeal: (deal: FlashDealItem | null) => void;
  onSaveDeal: (deal: FlashDealItem) => void;
  // Gallery Item Modal
  editingGalleryItem: StoreGalleryItem | null;
  isNewGalleryItem: boolean;
  onChangeEditingGalleryItem: (item: StoreGalleryItem | null) => void;
  onSaveGalleryItem: (item: StoreGalleryItem) => void;
  // Confirm Dialog
  confirmDialog: ConfirmDialogState | null;
  onCloseConfirmDialog: () => void;
  // Shopkeeper Easy Guide Modal
  shopkeeperGuideOpen: boolean;
  onCloseShopkeeperGuide: () => void;
  onJumpToCmsTab: (tab: CmsPageId) => void;
  // Deployment & Hosting Guide Modal
  guideModalOpen: boolean;
  onCloseGuideModal: () => void;
  // Flash Deals Popup Modal
  flashPopupOpen: boolean;
  reEngagedByTabSwitch?: boolean;
  onCloseFlashPopup: () => void;
}

/**
 * Helper to resize an uploaded image file via HTML5 canvas so it fits comfortably in localStorage.
 */
function resizeImageFileToDataUrl(
  file: File,
  maxWidth = 900,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(ev.target?.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = String(ev.target?.result || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AVAILABLE_ICONS = [
  { name: 'FileCheck2', label: 'Prescription / Verified' },
  { name: 'Pill', label: 'Medicine / Pill' },
  { name: 'HeartPulse', label: 'First Aid / Cardiac' },
  { name: 'Stethoscope', label: 'Healthcare Device' },
  { name: 'Baby', label: 'Baby & Mother Care' },
  { name: 'Sparkles', label: 'Personal Care & Hygiene' },
  { name: 'Apple', label: 'Vitamins & Nutrition' },
  { name: 'ShoppingBag', label: 'General Store Bag' },
];

export const Modals: React.FC<ModalsProps> = ({
  config,
  editingCategory,
  isNewCategory,
  onChangeEditingCategory,
  onSaveCategory,
  editingProduct,
  isNewProduct,
  onChangeEditingProduct,
  onSaveProduct,
  editingDeal,
  isNewDeal,
  onChangeEditingDeal,
  onSaveDeal,
  editingGalleryItem,
  isNewGalleryItem,
  onChangeEditingGalleryItem,
  onSaveGalleryItem,
  confirmDialog,
  onCloseConfirmDialog,
  shopkeeperGuideOpen,
  onCloseShopkeeperGuide,
  onJumpToCmsTab,
  guideModalOpen,
  onCloseGuideModal,
  flashPopupOpen,
  reEngagedByTabSwitch = false,
  onCloseFlashPopup,
}) => {
  const [guideTopic, setGuideTopic] = useState<
    'overview' | 'sections' | 'deals' | 'products' | 'gallery' | 'hours' | 'publish'
  >('overview');
  const [dealError, setDealError] = useState<string>('');
  const [customCatInput, setCustomCatInput] = useState<string>('');
  const [showCustomCatField, setShowCustomCatField] = useState<boolean>(false);

  // Flash Sale Welcome Pop-up Interactive Carousel States (3.5s Auto-Cycle + Hover/Touch Pause)
  const [popupSlideIdx, setPopupSlideIdx] = useState<number>(0);
  const [popupPaused, setPopupPaused] = useState<boolean>(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string>('');

  const offersList = config.flashSale?.offers || [];
  const offersLen = offersList.length;

  useEffect(() => {
    if (!flashPopupOpen || popupPaused || offersLen <= 1) return;
    const timer = setInterval(() => {
      setPopupSlideIdx((prev) => (prev + 1) % offersLen);
    }, 3500);
    return () => clearInterval(timer);
  }, [flashPopupOpen, popupPaused, offersLen]);

  // =========================================================================
  // 1. CATEGORY ADD / EDIT MODAL
  // =========================================================================
  const renderCategoryModal = () => {
    if (!editingCategory) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-base font-bold">
              {isNewCategory ? 'Add Store Category' : 'Edit Store Category'}
            </h3>
            <button
              type="button"
              onClick={() => onChangeEditingCategory(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Title *
              </label>
              <input
                type="text"
                value={editingCategory.title}
                onChange={(e) =>
                  onChangeEditingCategory({ ...editingCategory, title: e.target.value })
                }
                placeholder="e.g. Ayurvedic & Herbal Care"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                value={editingCategory.description}
                onChange={(e) =>
                  onChangeEditingCategory({ ...editingCategory, description: e.target.value })
                }
                placeholder="Describe what items are available in this department..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Top Highlight Badge
                </label>
                <input
                  type="text"
                  value={editingCategory.badgeText || ''}
                  onChange={(e) =>
                    onChangeEditingCategory({ ...editingCategory, badgeText: e.target.value })
                  }
                  placeholder="e.g. Ready Stock"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bottom Action Subtext
                </label>
                <input
                  type="text"
                  value={editingCategory.subText || ''}
                  onChange={(e) =>
                    onChangeEditingCategory({ ...editingCategory, subText: e.target.value })
                  }
                  placeholder="e.g. Verified Brands"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Department Icon
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() =>
                      onChangeEditingCategory({ ...editingCategory, iconName: ic.name })
                    }
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      editingCategory.iconName === ic.name
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CategoryIcon iconName={ic.name} className="w-4 h-4 text-emerald-600" />
                    <span className="truncate w-full text-center">{ic.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onChangeEditingCategory(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editingCategory.title.trim()}
                onClick={() => onSaveCategory(editingCategory)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {isNewCategory ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 2. PRODUCT ADD / EDIT MODAL
  // =========================================================================
  const renderProductModal = () => {
    if (!editingProduct) return null;

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await resizeImageFileToDataUrl(file);
        onChangeEditingProduct({ ...editingProduct, imageUrl: dataUrl });
      } catch {
        // Ignore upload error
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-base font-bold">
              {isNewProduct ? 'Add Catalogue Product / Medicine' : 'Edit Catalogue Product'}
            </h3>
            <button
              type="button"
              onClick={() => onChangeEditingProduct(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product / Medicine Name *
              </label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  onChangeEditingProduct({ ...editingProduct, name: e.target.value })
                }
                placeholder="e.g. Digital Blood Pressure Monitor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomCatField((v) => !v)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {showCustomCatField ? 'Select Existing' : '+ Custom Category'}
                  </button>
                </div>
                {showCustomCatField ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customCatInput}
                      onChange={(e) => setCustomCatInput(e.target.value)}
                      placeholder="New category name"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customCatInput.trim()) {
                          onChangeEditingProduct({
                            ...editingProduct,
                            category: customCatInput.trim(),
                          });
                          setShowCustomCatField(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Use
                    </button>
                  </div>
                ) : (
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      onChangeEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  >
                    {config.categories.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stock Availability
                </label>
                <select
                  value={editingProduct.availability}
                  onChange={(e) =>
                    onChangeEditingProduct({
                      ...editingProduct,
                      availability: e.target.value as StoreProduct['availability'],
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Ask for Availability">Ask for Availability</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Description *
              </label>
              <textarea
                rows={3}
                value={editingProduct.description}
                onChange={(e) =>
                  onChangeEditingProduct({ ...editingProduct, description: e.target.value })
                }
                placeholder="Explain usage, features, or sizes available..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pack Size / Note
                </label>
                <input
                  type="text"
                  value={editingProduct.packInfo || ''}
                  onChange={(e) =>
                    onChangeEditingProduct({ ...editingProduct, packInfo: e.target.value })
                  }
                  placeholder="e.g. Strip of 10 / 200ml Bottle"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isPrescription}
                    onChange={(e) =>
                      onChangeEditingProduct({
                        ...editingProduct,
                        isPrescription: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    Prescription Required (Rx)
                  </span>
                </label>
              </div>
            </div>

            {/* Image URL or Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Product Image (Upload Photo or Paste URL)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) =>
                    onChangeEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onChangeEditingProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editingProduct.name.trim()}
                onClick={() => onSaveProduct(editingProduct)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {isNewProduct ? 'Add Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 3. FLASH DEAL ADD / EDIT MODAL (WITH AUTO PRICE CALCULATOR & RX GUARD)
  // =========================================================================
  const renderDealModal = () => {
    if (!editingDeal) return null;

    const handleDealBadgeOrOrigChange = (
      nextBadge: string,
      nextOrig: string,
      mode: 'auto' | 'custom'
    ) => {
      let nextOfferPrice = editingDeal.offerPrice || '';
      if (mode === 'auto') {
        const pct = extractDiscountPercent(nextBadge);
        if (pct && nextOrig) {
          const calc = calculateOfferPrice(nextOrig, pct);
          if (calc) nextOfferPrice = calc;
        }
      }
      onChangeEditingDeal({
        ...editingDeal,
        discountBadge: nextBadge,
        originalPrice: nextOrig,
        offerPrice: nextOfferPrice,
        priceCalculationMode: mode,
      });
    };

    const handleSaveDealClick = () => {
      if (isRestrictedRxOffer(editingDeal, config.products)) {
        setDealError(
          'Pharmacy Compliance Rule: Promotional discounts cannot be applied to Schedule H, H1, X, or Prescription-Only (Rx) medicines. Please choose an OTC, Wellness, Device, Personal Care, or General Store product.'
        );
        return;
      }
      setDealError('');
      onSaveDeal(editingDeal);
    };

    const handleDealImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await resizeImageFileToDataUrl(file);
        onChangeEditingDeal({ ...editingDeal, imageUrl: dataUrl });
      } catch {
        // Ignore error
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold">
                {isNewDeal ? 'Create Seasonal / Flash Offer' : 'Edit Seasonal / Flash Offer'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setDealError('');
                onChangeEditingDeal(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {dealError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{dealError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Offer Headline *
              </label>
              <input
                type="text"
                value={editingDeal.title}
                onChange={(e) =>
                  onChangeEditingDeal({ ...editingDeal, title: e.target.value })
                }
                placeholder="e.g. Digital BP & Glucometer Wellness Combo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subtitle / Bundle Details *
              </label>
              <textarea
                rows={2}
                value={editingDeal.subtitle}
                onChange={(e) =>
                  onChangeEditingDeal({ ...editingDeal, subtitle: e.target.value })
                }
                placeholder="Describe what is included in this offer..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Badge (% for auto-math)
                </label>
                <input
                  type="text"
                  value={editingDeal.discountBadge}
                  onChange={(e) =>
                    handleDealBadgeOrOrigChange(
                      e.target.value,
                      editingDeal.originalPrice || '',
                      editingDeal.priceCalculationMode || 'auto'
                    )
                  }
                  placeholder="e.g. UP TO 15% OFF"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  value={editingDeal.couponCode || ''}
                  onChange={(e) =>
                    onChangeEditingDeal({
                      ...editingDeal,
                      couponCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. SAICARE15"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department (Non-Rx Only)
                </label>
                <input
                  type="text"
                  value={editingDeal.category}
                  onChange={(e) =>
                    onChangeEditingDeal({ ...editingDeal, category: e.target.value })
                  }
                  placeholder="e.g. Wellness & Devices"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Price Calculator Mode */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Offer Price Calculation</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      handleDealBadgeOrOrigChange(
                        editingDeal.discountBadge,
                        editingDeal.originalPrice || '',
                        'auto'
                      )
                    }
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                      (editingDeal.priceCalculationMode || 'auto') === 'auto'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    Auto-Calculate %
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeEditingDeal({ ...editingDeal, priceCalculationMode: 'custom' })
                    }
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                      editingDeal.priceCalculationMode === 'custom'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    Custom Price
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Original MRP (e.g. ₹2,499)
                  </label>
                  <input
                    type="text"
                    value={editingDeal.originalPrice || ''}
                    onChange={(e) =>
                      handleDealBadgeOrOrigChange(
                        editingDeal.discountBadge,
                        e.target.value,
                        editingDeal.priceCalculationMode || 'auto'
                      )
                    }
                    placeholder="₹2,499"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Special Offer Price (e.g. ₹2,124)
                  </label>
                  <input
                    type="text"
                    value={editingDeal.offerPrice || ''}
                    onChange={(e) =>
                      onChangeEditingDeal({
                        ...editingDeal,
                        offerPrice: e.target.value,
                        priceCalculationMode: 'custom',
                      })
                    }
                    placeholder="₹2,124"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-emerald-700 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Validity Label
                </label>
                <input
                  type="text"
                  value={editingDeal.validUntil}
                  onChange={(e) =>
                    onChangeEditingDeal({ ...editingDeal, validUntil: e.target.value })
                  }
                  placeholder="e.g. Limited Stock Offer"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Image (Upload or URL)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editingDeal.imageUrl}
                    onChange={(e) =>
                      onChangeEditingDeal({ ...editingDeal, imageUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <label className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer flex items-center">
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDealImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDealError('');
                  onChangeEditingDeal(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editingDeal.title.trim()}
                onClick={handleSaveDealClick}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {isNewDeal ? 'Publish Offer' : 'Save Offer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 4. GALLERY ITEM ADD / EDIT MODAL
  // =========================================================================
  const renderGalleryModal = () => {
    if (!editingGalleryItem) return null;

    const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await resizeImageFileToDataUrl(file, 1000, 0.84);
        onChangeEditingGalleryItem({
          ...editingGalleryItem,
          imageUrl: dataUrl,
          isPlaceholder: false,
        });
      } catch {
        // Ignore error
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-base font-bold">
              {isNewGalleryItem ? 'Add Store Photograph' : 'Edit Store Photograph'}
            </h3>
            <button
              type="button"
              onClick={() => onChangeEditingGalleryItem(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Photo Title *
              </label>
              <input
                type="text"
                value={editingGalleryItem.title}
                onChange={(e) =>
                  onChangeEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })
                }
                placeholder="e.g. Storefront at Siddhesh Complex"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo Category
                </label>
                <select
                  value={editingGalleryItem.category}
                  onChange={(e) =>
                    onChangeEditingGalleryItem({
                      ...editingGalleryItem,
                      category: e.target.value as StoreGalleryItem['category'],
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="Exterior">Exterior</option>
                  <option value="Interior">Interior</option>
                  <option value="Shelves">Shelves</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website Placement Slot
                </label>
                <select
                  value={editingGalleryItem.targetSection || 'gallery'}
                  onChange={(e) =>
                    onChangeEditingGalleryItem({
                      ...editingGalleryItem,
                      targetSection: e.target.value as StoreGalleryItem['targetSection'],
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="hero">Hero Store Card + Gallery</option>
                  <option value="about">About Us Section + Gallery</option>
                  <option value="gallery">Store Gallery Grid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Caption / Description
              </label>
              <textarea
                rows={2}
                value={editingGalleryItem.caption}
                onChange={(e) =>
                  onChangeEditingGalleryItem({ ...editingGalleryItem, caption: e.target.value })
                }
                placeholder="Describe what customers see in this photo..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Upload from Phone/Computer or Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingGalleryItem.imageUrl}
                  onChange={(e) =>
                    onChangeEditingGalleryItem({ ...editingGalleryItem, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {editingGalleryItem.imageUrl && (
              <div className="h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <SafeImage
                  src={editingGalleryItem.imageUrl}
                  alt={editingGalleryItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onChangeEditingGalleryItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editingGalleryItem.title.trim()}
                onClick={() => onSaveGalleryItem(editingGalleryItem)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {isNewGalleryItem ? 'Add Photo' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 5. IN-APP CONFIRMATION DIALOG (REPLACES WINDOW.CONFIRM)
  // =========================================================================
  const renderConfirmDialog = () => {
    if (!confirmDialog) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmDialog.danger
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {confirmDialog.danger ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {confirmDialog.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCloseConfirmDialog}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                confirmDialog.onConfirm();
                onCloseConfirmDialog();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${
                confirmDialog.danger
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {confirmDialog.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 6. SHOPKEEPER EASY STEP-BY-STEP GUIDE MODAL
  // =========================================================================
  const renderShopkeeperGuideModal = () => {
    if (!shopkeeperGuideOpen) return null;

    const topics: {
      id: typeof guideTopic;
      label: string;
      targetTab: CmsPageId;
      title: string;
      steps: string[];
    }[] = [
      {
        id: 'overview',
        label: '1. Quick Start',
        targetTab: 'sections',
        title: 'How Your Website & Owner CMS Works',
        steps: [
          'Click "Owner CMS" in the header (or press Ctrl + Shift + O) to open the store control panel.',
          'Every part of your website — phone numbers, timings, flash deals, products, and photos — can be edited without writing any code.',
          'When you click Save inside the CMS, changes are immediately saved in your browser so you can preview how the website looks.',
        ],
      },
      {
        id: 'sections',
        label: '2. Show/Hide Sections',
        targetTab: 'sections',
        title: 'Controlling Sections, Header & Footer Elements',
        steps: [
          'Open the "Sections" tab in the Owner CMS.',
          'Toggle any section ON or OFF (such as Flash Deals, Gallery, or Announcement Bar).',
          'Use the Header & Footer Controls to reorder buttons, change button labels, or hide individual elements on mobile or desktop.',
        ],
      },
      {
        id: 'deals',
        label: '3. Flash Deals',
        targetTab: 'flashSale',
        title: 'Running Seasonal & Bundle Offers',
        steps: [
          'Go to "Flash Sale" in the Owner CMS.',
          'Click "+ Add New Offer", enter the offer title and a badge like "UP TO 15% OFF".',
          'Type the Original MRP (e.g. ₹2,499) — the calculator automatically computes the discounted price! Note: Prescription (Rx) medicines cannot be discounted.',
        ],
      },
      {
        id: 'products',
        label: '4. Products & Stock',
        targetTab: 'products',
        title: 'Adding Products & Toggling Stock Status',
        steps: [
          'Go to "Products" in the Owner CMS.',
          'Click the green "In Stock" badge on any item to switch it to "Ask for Availability" in 1 click.',
          'Check "Prescription Required (Rx)" for restricted medicines so customers see the mandatory prescription notice.',
        ],
      },
      {
        id: 'gallery',
        label: '5. Store Photos',
        targetTab: 'gallery',
        title: 'Uploading Storefront & Shelf Photographs',
        steps: [
          'Go to "Gallery" in the Owner CMS.',
          'Click "+ Add Store Photo" and choose "Upload" to pick a photo directly from your phone or computer.',
          'Select where the photo should appear: Hero Store Card, About Us section, or Store Gallery Grid.',
        ],
      },
      {
        id: 'hours',
        label: '6. Timings & Phone',
        targetTab: 'hours',
        title: 'Updating Store Timings & Emergency Close Override',
        steps: [
          'Go to "Hours" in the Owner CMS to change opening/closing times (default 7:30 AM – 11:00 PM IST).',
          'Need to close early for a holiday or emergency? Switch Live Status Override to "Force Closed" and customers will immediately see the closed notice.',
        ],
      },
      {
        id: 'publish',
        label: '7. Backup & Live Hosting',
        targetTab: 'export',
        title: 'Saving Backups & Updating Your Live Website',
        steps: [
          'Browser changes are stored locally on your device for instant preview.',
          'To back up your work or move to another computer, go to "Export" and click "Download JSON Backup".',
          'To permanently update a static hosted website (Vercel/Netlify), copy or download the generated storeConfig.ts file in the Export tab.',
        ],
      },
    ];

    const current = topics.find((t) => t.id === guideTopic) || topics[0];

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-emerald-300" />
              <div>
                <h3 className="text-base font-bold">Shopkeeper Easy Step-by-Step Guide</h3>
                <p className="text-[11px] text-emerald-200">
                  Simple instructions to manage Shri Sai Medical &amp; General Store
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseShopkeeperGuide}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setGuideTopic(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    guideTopic === t.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-base font-bold text-slate-900">{current.title}</h4>
              <div className="space-y-2.5">
                {current.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onCloseShopkeeperGuide}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Close Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseShopkeeperGuide();
                  onJumpToCmsTab(current.targetTab);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              >
                <span>Open This Section in Owner CMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 7. DEPLOYMENT, PERSISTENCE & SECURITY ARCHITECTURE GUIDE MODAL
  // =========================================================================
  const renderDeploymentGuideModal = () => {
    if (!guideModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold">
                  Deployment, Persistence &amp; Security Architecture Guide
                </h3>
                <p className="text-[11px] text-slate-400">
                  How local browser edits, static hosting, and PIN security work
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseGuideModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>1. Local Browser Persistence vs. Public Live Website</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                When you edit content in the Owner CMS and click <strong>Save Changes</strong>, your
                updates are immediately saved to your browser&apos;s <code>localStorage</code>.
                Because this is a static React application without a remote database server, browser
                edits apply to your local device first and do not automatically push to external
                visitors on other devices until you export and redeploy.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileCode2 className="w-4 h-4 text-emerald-600" />
                <span>2. Workflow to Publish Changes Permanently for All Visitors</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                <li>Make and preview all your edits in the Owner CMS.</li>
                <li>
                  Open the <strong>Export &amp; Backup</strong> tab in the CMS.
                </li>
                <li>
                  Click <strong>Copy TypeScript Config</strong> or{' '}
                  <strong>Download storeConfig.ts</strong> and replace{' '}
                  <code>src/config/storeConfig.ts</code> in your project repository.
                </li>
                <li>
                  Run <code>npm run build</code> (or push to GitHub connected to Vercel / Netlify /
                  Cloudflare Pages) to publish the updated configuration globally.
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>3. Security Model: Client-Side PBKDF2 vs. Server Authentication</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                The Owner CMS uses WebCrypto <strong>PBKDF2-HMAC-SHA256 (100,000 iterations)</strong>{' '}
                with a random per-installation salt, progressive brute-force rate limiting, and a
                15-minute inactivity auto-lock to protect the dashboard on shared store computers.
                Note that client-side authentication protects local browser state; if multi-user
                remote database writes are added in the future, server-side authentication and
                authorization must be used.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onCloseGuideModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 8. FLASH DEALS ALL-OFFERS SHOWCASE MODAL
  // =========================================================================
  // 8. FLASH SALE WELCOME POP-UP & INTERACTIVE DEALS CAROUSEL (3.5s AUTO-CYCLE)
  // =========================================================================
  const renderFlashDealsPopup = () => {
    if (!flashPopupOpen || !config.flashSale.enabled || offersLen === 0) return null;

    const activeOffer = offersList[popupSlideIdx % offersLen] || offersList[0];
    const whatsappConversionUrl = createWhatsAppLink(
      config.business.contact.whatsappNumber,
      createFlashDealWhatsAppMessage(config.business.name, activeOffer)
    );

    return (
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flash-welcome-popup-title"
      >
        <div
          className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full border border-emerald-500/30 shadow-2xl overflow-hidden my-auto transition-all"
          onMouseEnter={() => setPopupPaused(true)}
          onMouseLeave={() => setPopupPaused(false)}
          onTouchStart={() => setPopupPaused(true)}
          onTouchEnd={() => setPopupPaused(false)}
        >
          {/* Top Modal Banner Header */}
          <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {reEngagedByTabSwitch ? 'Welcome Back • Active Deals' : ' Manipal Store Flash Sale'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {popupPaused ? '• Timer Paused' : '• Auto-cycling (3.5s)'}
                  </span>
                </div>
                <h3
                  id="flash-welcome-popup-title"
                  className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5"
                >
                  {config.flashSale.bannerTitle}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseFlashPopup}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/90 border border-slate-700/80 transition-colors cursor-pointer shrink-0"
              aria-label="Close Flash Sale Welcome Pop-up"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Carousel Spotlight Slide */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
                {/* Deal Image & Discount Tag */}
                <div className="sm:col-span-5 relative min-h-[190px] sm:min-h-[230px] bg-slate-800">
                  <SafeImage
                    src={activeOffer.imageUrl}
                    alt={activeOffer.title}
                    fallbackTitle={activeOffer.title}
                    fallbackCategory={activeOffer.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                      {activeOffer.discountBadge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950/85 text-emerald-300 backdrop-blur-xs border border-white/10">
                      {activeOffer.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/85 text-slate-300">
                      {(popupSlideIdx % offersLen) + 1} / {offersLen}
                    </span>
                  </div>
                </div>

                {/* Deal Details, Coupon Code, Strike-Through MRP & 1-Tap WhatsApp CTA */}
                <div className="sm:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-emerald-400">
                      <span>{activeOffer.validUntil}</span>
                      <span>In-Store &amp; Home Delivery</span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                      {activeOffer.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeOffer.subtitle}
                    </p>
                  </div>

                  {/* Pricing & Coupon Code Box */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Deal Price
                      </span>
                      <div className="flex items-baseline gap-2">
                        {activeOffer.offerPrice && (
                          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                            {activeOffer.offerPrice}
                          </span>
                        )}
                        {activeOffer.originalPrice && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            MRP {activeOffer.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {activeOffer.couponCode && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
                          Coupon Code
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const code = activeOffer.couponCode || '';
                            navigator.clipboard?.writeText(code);
                            setCopiedCoupon(code);
                            setTimeout(() => setCopiedCoupon(''), 2000);
                          }}
                          className="mt-0.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 font-mono text-xs font-extrabold cursor-pointer transition-colors"
                          title="Click to copy coupon code"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{activeOffer.couponCode}</span>
                          {copiedCoupon === activeOffer.couponCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-75" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1-Tap WhatsApp Conversion Button */}
                  <a
                    href={whatsappConversionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order on WhatsApp with Deal</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Controls: Previous/Next Arrows, Indicator Dots & Pause/Play */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPopupSlideIdx((prev) => (prev - 1 + offersLen) % offersLen)
                  }
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                  aria-label="Previous flash deal"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Indicator Dots */}
                <div className="flex items-center gap-1.5 px-2">
                  {offersList.map((deal, idx) => {
                    const isCurrent = idx === popupSlideIdx % offersLen;
                    return (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() => setPopupSlideIdx(idx)}
                        aria-label={`View deal ${idx + 1}: ${deal.title}`}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          isCurrent
                            ? 'w-7 bg-emerald-400'
                            : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPopupSlideIdx((prev) => (prev + 1) % offersLen)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                  aria-label="Next flash deal"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPopupPaused((p) => !p)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-xs cursor-pointer"
                  aria-label={popupPaused ? 'Resume deal carousel' : 'Pause deal carousel'}
                  title={popupPaused ? 'Resume Auto-Cycle' : 'Pause Auto-Cycle'}
                >
                  {popupPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Polite Session Dismissal Button */}
              <button
                type="button"
                onClick={onCloseFlashPopup}
                className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Maybe later
              </button>
            </div>

            {/* Regulatory Compliance Safeguard (Schedule H, H1 & X Exclusion) */}
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Drugs &amp; Cosmetics Act Compliance:</strong>{' '}
                Promotional discounts apply strictly to OTC wellness, healthcare devices, personal
                care, and general store essentials. <strong>Schedule H, H1, and X</strong>{' '}
                prescription-only medications are strictly excluded and dispensed only against a
                valid doctor&apos;s prescription.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderCategoryModal()}
      {renderProductModal()}
      {renderDealModal()}
      {renderGalleryModal()}
      {renderConfirmDialog()}
      {renderShopkeeperGuideModal()}
      {renderDeploymentGuideModal()}
      {renderFlashDealsPopup()}
    </>
  );
};
