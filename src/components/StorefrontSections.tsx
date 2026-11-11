import React, { useEffect, useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
  Building2,
  Pause,
  Play,
  Flame,
  Tag,
  Package,
  Camera,
  Settings,
  Lock,
  BookOpen,
  HelpCircle,
  HeartHandshake,
  Award,
  FileCheck2,
  X,
} from 'lucide-react';
import { FooterColumnKey, StoreConfig } from '../config/storeConfig';
import {
  createFlashDealWhatsAppMessage,
  createWhatsAppLink,
  LiveStoreStatus,
} from '../utils/storeUtils';
import { CategoryIcon, SafeImage, StoreLogoBadge } from './SafeImage';

interface StorefrontSectionsProps {
  config: StoreConfig;
  storeStatus: LiveStoreStatus;
  cmsUnlocked: boolean;
  onOpenCms: () => void;
  onOpenShopkeeperGuide: () => void;
  onOpenDeploymentGuide: () => void;
  onOpenFlashDealsModal: () => void;
}

export const StorefrontSections: React.FC<StorefrontSectionsProps> = ({
  config,
  storeStatus,
  cmsUnlocked,
  onOpenCms,
  onOpenShopkeeperGuide,
  onOpenDeploymentGuide,
  onOpenFlashDealsModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDealIndex, setActiveDealIndex] = useState<number>(0);
  const [isDealPaused, setIsDealPaused] = useState<boolean>(false);
  const [productSlideIndex, setProductSlideIndex] = useState<number>(0);
  const [isProductCarouselPaused, setIsProductCarouselPaused] = useState<boolean>(false);
  const [itemsPerSlide, setItemsPerSlide] = useState<number>(3);

  const primaryWhatsAppLink = createWhatsAppLink(
    config.business.contact.whatsappNumber,
    config.business.contact.whatsappDefaultMessage
  );
  const secondaryWhatsAppLink = createWhatsAppLink(
    config.business.contact.secondaryWhatsappNumber,
    config.business.contact.whatsappDefaultMessage
  );

  const offersCount = config.flashSale?.offers?.length || 0;

  // Responsive items per slide for Product Showcase Carousel
  useEffect(() => {
    const updateSlideCount = () => {
      if (window.innerWidth < 640) setItemsPerSlide(1);
      else if (window.innerWidth < 1024) setItemsPerSlide(2);
      else setItemsPerSlide(3);
    };
    updateSlideCount();
    window.addEventListener('resize', updateSlideCount);
    return () => window.removeEventListener('resize', updateSlideCount);
  }, []);

  // Flash sale auto-rotation
  useEffect(() => {
    if (!config.flashSale?.enabled || !config.flashSale?.autoPlay || isDealPaused || offersCount <= 1) {
      return;
    }
    const intervalMs = Math.max(2, config.flashSale.intervalSeconds || 4) * 1000;
    const timer = setInterval(() => {
      setActiveDealIndex((prev) => (prev + 1) % offersCount);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [
    config.flashSale?.enabled,
    config.flashSale?.autoPlay,
    config.flashSale?.intervalSeconds,
    isDealPaused,
    offersCount,
  ]);

  // Product showcase carousel auto-rotation
  const totalProductSlides = Math.max(1, Math.ceil(config.products.length / itemsPerSlide));
  useEffect(() => {
    if (isProductCarouselPaused || totalProductSlides <= 1) return;
    const timer = setInterval(() => {
      setProductSlideIndex((prev) => (prev + 1) % totalProductSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, [isProductCarouselPaused, totalProductSlides]);

  // Filtered products for Catalogue
  const filteredProducts = config.products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      (product.packInfo && product.packInfo.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Resolve targeted gallery photos
  const heroGalleryItem =
    config.gallery.find((g) => g.targetSection === 'hero') || config.gallery[0];
  const aboutGalleryItem =
    config.gallery.find((g) => g.targetSection === 'about') ||
    config.gallery[1] ||
    config.gallery[0];

  const activeDeal =
    offersCount > 0 ? config.flashSale.offers[activeDealIndex % offersCount] : null;

  const handleCategorySelect = (catTitle: string) => {
    setSelectedCategory(catTitle);
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main>
      {/* =====================================================================
          1. HERO SECTION
      ===================================================================== */}
      {config.sectionVisibility?.heroSection !== false && (
        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Core Value Proposition & Direct Actions */}
              <div className="lg:col-span-7 space-y-6">
                {/* Business Category Tags & Live IST Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                      storeStatus.statusType === 'open'
                        ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300'
                        : storeStatus.statusType === 'closing-soon'
                          ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                          : 'bg-rose-100/90 text-rose-900 border-rose-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        storeStatus.statusType === 'open'
                          ? 'bg-emerald-600 animate-ping'
                          : storeStatus.statusType === 'closing-soon'
                            ? 'bg-amber-600 animate-ping'
                            : 'bg-rose-600'
                      }`}
                    />
                    <span>
                      {storeStatus.badgeText} • {storeStatus.detailText}
                    </span>
                  </div>

                  {config.business.businessTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* Headline & Subheadline */}
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                    {config.business.tagline}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                    {config.business.subheadline}
                  </p>
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={primaryWhatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire on WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${config.business.contact.primaryPhone}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Call {config.business.contact.primaryPhoneDisplay}</span>
                  </a>

                  <a
                    href={config.business.map.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    <span>Get Directions</span>
                  </a>
                </div>

                {/* Key Store Highlights Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Open Every Day</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {config.business.hours.display}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {config.delivery.available ? 'Home Delivery' : 'In-Store Pickup'}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {config.business.address.area}, {config.business.address.city}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Genuine Stock</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Verified Pharmacy &amp; General Store
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Store Identification Card & Visual Showcase */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden">
                  {/* Top Photo Frame */}
                  <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
                    <SafeImage
                      src={heroGalleryItem?.imageUrl}
                      alt={heroGalleryItem?.title || config.business.name}
                      fallbackTitle={config.business.name}
                      fallbackCategory="Manipal Storefront"
                      width={800}
                      height={500}
                      loading="eager"
                      fetchPriority="high"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/15">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {config.business.address.building}, {config.business.address.area}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-600/90 text-white backdrop-blur-md">
                        PIN {config.business.address.pincode}
                      </span>
                    </div>
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                        Official Store Information Card
                      </p>
                      <h2 className="text-lg font-bold leading-snug mt-0.5">
                        {config.business.name}
                      </h2>
                    </div>
                  </div>

                  {/* Store Quick Details Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block">Store Address:</strong>
                        {config.business.address.fullAddress}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      <div className="text-xs sm:text-sm text-slate-700">
                        <strong className="text-slate-900 block">Opening Hours (IST):</strong>
                        {config.business.hours.daysSummary} •{' '}
                        <span className="font-semibold text-emerald-700">
                          {config.business.hours.display}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                      <a
                        href={`tel:${config.business.contact.primaryPhone}`}
                        className="flex flex-col p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-colors"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {config.business.contact.primaryPhoneLabel}
                        </span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {config.business.contact.primaryPhoneDisplay}
                        </span>
                      </a>

                      <a
                        href={`tel:${config.business.contact.secondaryPhone}`}
                        className="flex flex-col p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-colors"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {config.business.contact.secondaryPhoneLabel}
                        </span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {config.business.contact.secondaryPhoneDisplay}
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          2. FLASH DEALS & SEASONAL OFFERS CAROUSEL SECTION
      ===================================================================== */}
      {config.sectionVisibility?.flashDealsSection !== false &&
        config.flashSale?.enabled &&
        offersCount > 0 &&
        activeDeal && (
          <section
            id="deals"
            className="py-12 sm:py-16 bg-slate-950 text-white relative overflow-hidden"
          >
            {/* Single Clean Running Flash Deals Marquee Ticker */}
            <div className="bg-emerald-900/50 border-y border-emerald-500/20 mb-10 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shrink-0 my-1.5">
                  <Flame className="w-3.5 h-3.5 fill-slate-950" />
                  LIVE OFFERS
                </span>
                <div className="overflow-hidden flex-1 py-2">
                  <div
                    className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs font-semibold text-emerald-100"
                    style={{ '--marquee-duration': '26s' } as React.CSSProperties}
                  >
                    {[...config.flashSale.offers, ...config.flashSale.offers].map((deal, idx) => (
                      <span key={`${deal.id}-${idx}`} className="inline-flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-amber-300 font-extrabold text-[10px]">
                          {deal.discountBadge}
                        </span>
                        <span className="text-white font-bold">{deal.title}</span>
                        {deal.offerPrice && (
                          <span className="text-emerald-300 font-mono">Now {deal.offerPrice}</span>
                        )}
                        <span className="text-emerald-500">•</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>In-Store &amp; Home Delivery Value</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {config.flashSale.bannerTitle}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
                    {config.flashSale.bannerSubtitle}
                  </p>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenFlashDealsModal}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View All ({offersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDealPaused((p) => !p)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    aria-label={isDealPaused ? 'Resume offer rotation' : 'Pause offer rotation'}
                    title={isDealPaused ? 'Resume Auto-Play' : 'Pause Auto-Play'}
                  >
                    {isDealPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDealIndex((prev) => (prev - 1 + offersCount) % offersCount)
                    }
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition-colors cursor-pointer"
                    aria-label="Previous offer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDealIndex((prev) => (prev + 1) % offersCount)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition-colors cursor-pointer"
                    aria-label="Next offer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Spotlight Deal Card */}
              <div
                className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border border-slate-800 overflow-hidden shadow-2xl"
                onMouseEnter={() => setIsDealPaused(true)}
                onMouseLeave={() => setIsDealPaused(false)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[280px] bg-slate-800">
                    <SafeImage
                      src={activeDeal.imageUrl}
                      alt={activeDeal.title}
                      fallbackTitle={activeDeal.title}
                      fallbackCategory={activeDeal.category}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                        {activeDeal.discountBadge}
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-950/80 text-white backdrop-blur-md border border-white/15">
                        {activeDeal.category}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs text-emerald-400 font-semibold">
                        <span>{activeDeal.validUntil}</span>
                        <span className="font-mono text-slate-400">
                          Offer {(activeDealIndex % offersCount) + 1} of {offersCount}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {activeDeal.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {activeDeal.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6 pt-4 border-t border-slate-800/90">
                      <div className="flex flex-wrap items-baseline gap-4">
                        {activeDeal.offerPrice && (
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                              Special Offer Price
                            </span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                              {activeDeal.offerPrice}
                            </span>
                          </div>
                        )}
                        {activeDeal.originalPrice && (
                          <div className="pb-1">
                            <span className="text-xs text-slate-500 line-through font-mono">
                              MRP {activeDeal.originalPrice}
                            </span>
                          </div>
                        )}
                        {activeDeal.couponCode && (
                          <div className="pb-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono text-xs font-extrabold">
                              <Tag className="w-3 h-3" />
                              <span>Code: {activeDeal.couponCode}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={createWhatsAppLink(
                            config.business.contact.whatsappNumber,
                            createFlashDealWhatsAppMessage(config.business.name, activeDeal)
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Claim / Enquire on WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${config.business.contact.primaryPhone}`}
                          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-emerald-400" />
                          <span>Call Desk</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Quick Selector Pills */}
              {offersCount > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  {config.flashSale.offers.map((offer, idx) => {
                    const isActive = idx === activeDealIndex % offersCount;
                    return (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => setActiveDealIndex(idx)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-950/80 border-emerald-500/80 shadow-md'
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            {offer.discountBadge}
                          </span>
                          {offer.offerPrice && (
                            <span className="text-xs font-bold font-mono text-amber-300">
                              {offer.offerPrice}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white truncate">{offer.title}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pharmacy Compliance Disclaimer */}
              <div className="mt-6 flex items-center gap-2.5 text-xs text-slate-400 bg-slate-900/70 border border-slate-800/80 rounded-2xl px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {config.flashSale.regulatoryDisclaimer ||
                    'Promotional discounts apply strictly to OTC wellness, personal care, and general store items — never to prescription-only (Rx) medicines.'}
                </span>
              </div>
            </div>
          </section>
        )}

      {/* =====================================================================
          3. ABOUT STORE SECTION
      ===================================================================== */}
      {config.sectionVisibility?.aboutSection !== false && (
        <section id="about" className="py-16 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  <span>About Our Manipal Pharmacy &amp; General Store</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Dedicated to Community Health &amp; Daily Convenience at Siddhesh Complex
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {config.business.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-1">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Responsible Pharmacy Care</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Prescription medicines are dispensed strictly against valid doctor
                      prescriptions with proper storage and batch verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-1">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Complete Everyday Essentials</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      From surgical supplies and diagnostic monitors to baby care, nutrition, and
                      household general store items under one roof.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100">
                  <div className="h-72 sm:h-80">
                    <SafeImage
                      src={aboutGalleryItem?.imageUrl}
                      alt={aboutGalleryItem?.title || 'Interior view of store'}
                      fallbackTitle={aboutGalleryItem?.title || config.business.name}
                      fallbackCategory="Store Interior & Shelves"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {aboutGalleryItem?.title || 'Organized Medicine & Wellness Shelves'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {aboutGalleryItem?.caption || config.business.address.fullAddress}
                      </div>
                    </div>
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 shrink-0"
                    >
                      <span>Visit Store</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          4. PRODUCT CATEGORIES SECTION
      ===================================================================== */}
      {config.sectionVisibility?.categoriesSection !== false && (
        <section
          id="categories"
          className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/60"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  Store Departments
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Explore Our Medical &amp; General Store Categories
                </h2>
                <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
                  Select any category below to filter products or enquire directly on WhatsApp for
                  specific brand availability.
                </p>
              </div>
              <a
                href={primaryWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 shrink-0"
              >
                <span>Need a specific item? Message us</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {config.categories.map((cat) => {
                const isRxCat = cat.title.toLowerCase().includes('prescription');
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.title)}
                    className="group bg-white hover:bg-emerald-50/30 rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                          <CategoryIcon iconName={cat.iconName} className="w-5 h-5" />
                        </div>
                        {cat.badgeText && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              isRxCat
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {cat.badgeText}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                      <span>{cat.subText || 'Browse Items'}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          5. PRODUCT CATALOGUE, SEARCH & WHATSAPP ENQUIRY SECTION
      ===================================================================== */}
      {config.sectionVisibility?.catalogueSection !== false && (
        <section id="products" className="py-16 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  Catalogue &amp; Availability Enquiry
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Medicines, Devices &amp; General Store Catalogue
                </h2>
                <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
                  Search our key inventory or filter by department. Click{' '}
                  <strong>Enquire on WhatsApp</strong> on any item to confirm live batch stock or
                  request home delivery.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative w-full lg:w-80 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine, device, or item..."
                  aria-label="Search medicines and general store products"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Categories ({config.products.length})
              </button>
              {config.categories.map((cat) => {
                const count = config.products.filter((p) => p.category === cat.title).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.title)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.title
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.title} ({count})
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-200/80">
                <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">
                  No matching items in preview catalogue
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-5">
                  We stock thousands of prescription and general store items at our Manipal counter
                  that may not all be listed online. Message us directly on WhatsApp for instant
                  stock confirmation!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <a
                    href={createWhatsAppLink(
                      config.business.contact.whatsappNumber,
                      `Hello ${config.business.name}, I am looking for "${searchQuery || selectedCategory}". Is it currently available at the Manipal store?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const enquiryMessage = product.isPrescription
                    ? `Hello ${config.business.name}, I would like to check availability for "${product.name}" (${product.category}). I have a valid doctor prescription ready to share.`
                    : `Hello ${config.business.name}, I would like to enquire about "${product.name}" (${product.category}). Is it in stock for pickup / home delivery in Manipal?`;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Product Image Header */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <SafeImage
                            src={product.imageUrl}
                            alt={product.name}
                            fallbackTitle={product.name}
                            fallbackCategory={product.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border ${
                                product.availability === 'In Stock'
                                  ? 'bg-emerald-950/85 text-emerald-200 border-emerald-400/30'
                                  : 'bg-slate-900/85 text-amber-200 border-amber-400/30'
                              }`}
                            >
                              {product.availability}
                            </span>

                            {product.isPrescription && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 shadow-sm">
                                Rx Required
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Info Body */}
                        <div className="p-5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                            {product.category}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {product.name}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mt-2">
                            {product.description}
                          </p>

                          {product.packInfo && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>{product.packInfo}</span>
                            </div>
                          )}

                          {product.isPrescription && (
                            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span>
                                <strong>Prescription Mandatory:</strong> Dispensed strictly upon
                                verification of a valid doctor&apos;s prescription.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enquiry Footer Action */}
                      <div className="px-5 pb-5 pt-2">
                        <a
                          href={createWhatsAppLink(
                            config.business.contact.whatsappNumber,
                            enquiryMessage
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                            product.isPrescription
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>
                            {product.isPrescription
                              ? 'Send Prescription Enquiry'
                              : 'Check Availability on WhatsApp'}
                          </span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pharmacy Compliance Callout Banner */}
            <div className="mt-10 p-5 sm:p-6 rounded-3xl bg-emerald-950 text-emerald-50 border border-emerald-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Pharmacy Compliance &amp; Patient Safety Notice
                  </h3>
                  <p className="text-xs text-emerald-200/90 leading-relaxed mt-1 max-w-3xl">
                    In accordance with Indian pharmacy regulations, prescription-only medicines are
                    never sold without a valid prescription from a registered medical practitioner.
                    We do not provide medical diagnosis or treatment advice online.
                  </p>
                </div>
              </div>
              <a
                href={`tel:${config.business.contact.primaryPhone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 text-xs font-bold shrink-0 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Speak to Pharmacist</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          6. HOME DELIVERY SECTION
      ===================================================================== */}
      {config.sectionVisibility?.deliverySection !== false && (
        <section
          id="delivery"
          className="py-16 sm:py-20 bg-gradient-to-b from-emerald-50/60 to-white border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-lg shadow-emerald-950/5 p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {config.delivery.available
                        ? 'Home Delivery Available in Manipal'
                        : 'In-Store Counter Pickup Only'}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {config.delivery.headline}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {config.delivery.summary}
                  </p>

                  {/* Delivery Terms & Coverage Guidelines */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Delivery Coverage &amp; Terms:
                    </div>
                    {config.delivery.terms.map((term, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{term}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Delivery Contact Box */}
                <div className="lg:col-span-5">
                  <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Quick Home Delivery Desk
                      </span>
                      <h3 className="text-lg font-bold mt-1">
                        How to Request Home Delivery
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {config.delivery.coverageNote}
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-200">
                      <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                        <strong>Step 1:</strong> Send your item list or clear doctor prescription
                        photo on WhatsApp.
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                        <strong>Step 2:</strong> Our pharmacist verifies availability &amp; shares
                        the bill total.
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                        <strong>Step 3:</strong> Prompt doorstep delivery across Adarsha Nagar &amp;
                        Manipal.
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <a
                        href={createWhatsAppLink(
                          config.business.contact.whatsappNumber,
                          `Hello ${config.business.name}, I would like to request Home Delivery in Manipal. Here are the items / prescription details:`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{config.delivery.ctaLabel || 'Order / Enquire on WhatsApp'}</span>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${config.business.contact.primaryPhone}`}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{config.business.contact.primaryPhone}</span>
                        </a>
                        <a
                          href={`tel:${config.business.contact.secondaryPhone}`}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{config.business.contact.secondaryPhone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          7. STORE IMAGE GALLERY SECTION
      ===================================================================== */}
      {config.sectionVisibility?.gallerySection !== false && (
        <section id="gallery" className="py-16 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Inside Shri Sai Medical &amp; General Store</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Store Photographs &amp; Departments
                </h2>
                <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
                  A look at our storefront at Siddhesh Complex, organized medicine shelves, and
                  daily essentials counter in Manipal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {config.gallery.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-52 bg-slate-200 overflow-hidden">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      fallbackTitle={item.title}
                      fallbackCategory={item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 bg-white flex-1">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          8. LOCATION, CONTACT & GOOGLE MAPS SECTION
      ===================================================================== */}
      {config.sectionVisibility?.contactMapSection !== false && (
        <section id="contact" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Visit or Contact Us
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Store Location, Timings &amp; Direct Numbers
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
                {config.business.address.landmarkNote}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Contact Details Column */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Store Address</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                        {config.business.address.fullAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Opening Hours</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {config.business.hours.daysSummary}
                      </p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">
                        {config.business.hours.display} (IST)
                      </p>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Direct Telephone Numbers
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={`tel:${config.business.contact.primaryPhone}`}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 transition-colors"
                      >
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          {config.business.contact.primaryPhoneLabel}
                        </div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {config.business.contact.primaryPhoneDisplay}
                        </div>
                      </a>

                      <a
                        href={`tel:${config.business.contact.secondaryPhone}`}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 transition-colors"
                      >
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          {config.business.contact.secondaryPhoneLabel}
                        </div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {config.business.contact.secondaryPhoneDisplay}
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp Numbers */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      WhatsApp Enquiry &amp; Prescription Desk
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={primaryWhatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          WhatsApp{' '}
                          {config.business.contact.primaryPhoneDisplay ||
                            config.business.contact.primaryPhone}
                        </span>
                      </a>
                      <a
                        href={secondaryWhatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-700" />
                        <span>
                          WhatsApp{' '}
                          {config.business.contact.secondaryPhoneDisplay ||
                            config.business.contact.secondaryPhone}
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Map External Links */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <a
                    href={config.business.map.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Directions in Google Maps</span>
                  </a>
                  <a
                    href={config.business.map.googleMapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Map</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Embed Column */}
              <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xs min-h-[360px] flex flex-col">
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>
                      {config.business.address.building}, {config.business.address.area},{' '}
                      {config.business.address.city} {config.business.address.pincode}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Interactive Map
                  </span>
                </div>
                <div className="flex-1 relative min-h-[320px] bg-slate-100">
                  <iframe
                    title="Shri Sai Medical & General Store Location Map"
                    src={config.business.map.embedIframeUrl}
                    className="w-full h-full min-h-[320px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          9. GRANULAR CONFIGURABLE FOOTER
      ===================================================================== */}
      {config.sectionVisibility?.footerSection !== false && (
        <footer
          className={`${
            config.footerConfig?.showOnMobile === false ? 'hidden sm:block' : 'block'
          } bg-slate-950 text-slate-300 pt-14 pb-10 border-t border-slate-900`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
              {(config.footerConfig?.columnOrder || ['brand', 'quickLinks', 'hours', 'contact']).map(
                (colKey: FooterColumnKey) => {
                  if (colKey === 'brand' && config.footerElements?.brandColumn !== false) {
                    return (
                      <div key="brand" className="space-y-4">
                        <div className="flex items-center gap-3">
                          <StoreLogoBadge appearance={config.appearance} size="md" />
                          <div>
                            <div className="text-base font-bold text-white leading-tight">
                              {config.footerConfig?.brandColumnTitle || config.business.name}
                            </div>
                            <div className="text-xs text-emerald-400 font-medium">
                              {config.business.address.area}, {config.business.address.city}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {config.business.description}
                        </p>
                      </div>
                    );
                  }

                  if (
                    colKey === 'quickLinks' &&
                    config.footerElements?.quickLinksColumn !== false
                  ) {
                    const visibleLinks = (config.footerConfig?.quickLinks || []).filter(
                      (q) => q.visible
                    );
                    return (
                      <div key="quickLinks" className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                          {config.footerConfig?.quickLinksTitle || 'Quick Links'}
                        </h3>
                        <ul className="space-y-2 text-xs">
                          {visibleLinks.map((item) => (
                            <li key={item.id}>
                              <a
                                href={item.href}
                                className="text-slate-400 hover:text-emerald-400 transition-colors"
                              >
                                {item.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  if (colKey === 'hours' && config.footerElements?.hoursColumn !== false) {
                    return (
                      <div key="hours" className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                          {config.footerConfig?.hoursTitle || 'Opening Hours'}
                        </h3>
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <div className="font-semibold text-white">
                            {config.business.hours.daysSummary}
                          </div>
                          <div className="text-emerald-400 font-bold text-sm">
                            {config.business.hours.display}
                          </div>
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            Status: <strong className="text-white">{storeStatus.badgeText}</strong> (
                            {storeStatus.currentTimeIST})
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (colKey === 'contact' && config.footerElements?.contactColumn !== false) {
                    return (
                      <div key="contact" className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                          {config.footerConfig?.contactTitle || 'Store Address & Contact'}
                        </h3>
                        <div className="space-y-2 text-xs text-slate-400">
                          <p>{config.business.address.fullAddress}</p>
                          <p className="font-mono text-white">
                            Phone: {config.business.contact.primaryPhoneDisplay} /{' '}
                            {config.business.contact.secondaryPhoneDisplay}
                          </p>
                          <p className="font-mono text-emerald-400">
                            WhatsApp: +{config.business.contact.whatsappNumber}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return null;
                }
              )}
            </div>

            {/* Bottom Copyright, Regulatory Note & Owner Access Controls */}
            <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-500">
              {config.footerElements?.copyrightBar !== false && (
                <div className="space-y-1">
                  <p>
                    © {new Date().getFullYear()} {config.business.name}.{' '}
                    {config.footerConfig?.copyrightSuffix}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {config.footerConfig?.regulatoryNote}
                  </p>
                </div>
              )}

              {config.footerElements?.ownerAccessButtons !== false && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenShopkeeperGuide}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shopkeeper Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenDeploymentGuide}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hosting Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenCms}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {cmsUnlocked ? (
                      <Settings className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>{cmsUnlocked ? 'Open Owner CMS' : 'Owner CMS'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* =====================================================================
          10. FLOATING WHATSAPP ACTION BUTTON
      ===================================================================== */}
      {config.appearance.showFloatingWhatsApp && (
        <a
          href={primaryWhatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xl shadow-emerald-950/30 border border-emerald-400/30 transition-all hover:scale-105"
          aria-label="Chat with Shri Sai Medical & General Store on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp Enquiry</span>
        </a>
      )}
    </main>
  );
};
