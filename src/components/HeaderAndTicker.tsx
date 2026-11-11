import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Lock,
  Settings,
  Menu,
  X,
  Sparkles,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { HeaderElementKey, StoreConfig } from '../config/storeConfig';
import { createWhatsAppLink, LiveStoreStatus } from '../utils/storeUtils';
import { StoreLogoBadge } from './SafeImage';

interface HeaderAndTickerProps {
  config: StoreConfig;
  storeStatus: LiveStoreStatus;
  cmsUnlocked: boolean;
  onLogoClick: () => void;
  onOpenCms: () => void;
  onOpenShopkeeperGuide: () => void;
}

export const HeaderAndTicker: React.FC<HeaderAndTickerProps> = ({
  config,
  storeStatus,
  cmsUnlocked,
  onLogoClick,
  onOpenCms,
  onOpenShopkeeperGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryWhatsAppLink = createWhatsAppLink(
    config.business.contact.whatsappNumber,
    config.business.contact.whatsappDefaultMessage
  );

  const visibleNavLinks = (config.headerConfig?.navLinks || []).filter((l) => l.visible);
  const desktopNavLinks = visibleNavLinks.filter((l) => l.showOnDesktop);
  const mobileNavLinks = visibleNavLinks.filter((l) => l.showOnMobile);

  const elementOrder: HeaderElementKey[] =
    config.headerConfig?.elementOrder?.length > 0
      ? config.headerConfig.elementOrder
      : [
          'logo',
          'storeName',
          'navLinks',
          'liveStatusBadge',
          'callButton',
          'whatsappButton',
          'cmsButton',
        ];

  const renderHeaderElement = (key: HeaderElementKey) => {
    const he = config.headerElements;
    const hc = config.headerConfig;

    switch (key) {
      case 'logo':
        if (he?.logo === false) return null;
        return (
          <a
            key="logo"
            href="#home"
            onClick={onLogoClick}
            className="flex items-center group focus:outline-none shrink-0"
            title="Shri Sai Medical & General Store"
          >
            <StoreLogoBadge
              appearance={config.appearance}
              size={hc?.compactMode ? 'sm' : 'md'}
            />
          </a>
        );

      case 'storeName':
        if (he?.storeName === false) return null;
        return (
          <a
            key="storeName"
            href="#home"
            onClick={onLogoClick}
            className="flex flex-col min-w-0 group focus:outline-none"
          >
            <span className="font-extrabold text-slate-900 text-xs sm:text-base lg:text-lg tracking-tight leading-tight truncate">
              <span className="sm:hidden">
                {config.business.shortName || 'Shri Sai Medical'}
              </span>
              <span className="hidden sm:inline">{config.business.name}</span>
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold flex items-center gap-1.5 truncate">
              <span>
                {config.business.address.area}, {config.business.address.city}
              </span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <span className="text-slate-500 hidden md:inline">
                {config.business.businessTypes?.length > 0
                  ? config.business.businessTypes.slice(0, 2).join(' & ')
                  : 'Medical & General Store'}
              </span>
            </span>
          </a>
        );

      case 'liveStatusBadge':
        if (he?.liveStatusBadge === false) return null;
        return (
          <div
            key="liveStatusBadge"
            className={`${
              hc?.showStatusOnMobile ? 'hidden md:flex' : 'hidden lg:flex'
            } items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shrink-0 ${
              storeStatus.statusType === 'open'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : storeStatus.statusType === 'closing-soon'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
            title={`${storeStatus.detailText} (${storeStatus.currentTimeIST})`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                storeStatus.statusType === 'open'
                  ? 'bg-emerald-500 animate-pulse'
                  : storeStatus.statusType === 'closing-soon'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
              }`}
            />
            <span>{storeStatus.badgeText}</span>
          </div>
        );

      case 'callButton':
        if (he?.callButton === false) return null;
        return (
          <a
            key="callButton"
            href={`tel:${config.business.contact.primaryPhone}`}
            className={`${
              hc?.showCallOnMobile ? 'inline-flex' : 'hidden sm:inline-flex'
            } items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{hc?.callButtonText || config.business.contact.primaryPhoneDisplay}</span>
          </a>
        );

      case 'whatsappButton':
        if (he?.whatsappButton === false) return null;
        return (
          <a
            key="whatsappButton"
            href={primaryWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              hc?.showWhatsAppOnMobile === false ? 'hidden sm:inline-flex' : 'inline-flex'
            } items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all shrink-0`}
            aria-label="Enquire on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hc?.whatsappButtonText || 'WhatsApp'}</span>
          </a>
        );

      case 'cmsButton':
        if (he?.cmsButton === false) return null;
        return (
          <button
            key="cmsButton"
            type="button"
            onClick={onOpenCms}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              cmsUnlocked
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50'
            }`}
            title="Open Store Owner CMS Dashboard (Ctrl + Shift + O)"
          >
            {cmsUnlocked ? (
              <Settings className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden md:inline">
              {cmsUnlocked ? 'Manage Store' : hc?.cmsButtonText || 'Owner CMS'}
            </span>
          </button>
        );

      default:
        return null;
    }
  };

  const brandKeys: HeaderElementKey[] = ['logo', 'storeName'];
  const orderedBrandKeys = elementOrder.filter((k) => brandKeys.includes(k));
  const orderedActionKeys = elementOrder.filter(
    (k) => !brandKeys.includes(k) && k !== 'navLinks'
  );
  const showDesktopNav =
    config.headerElements?.navLinks !== false && desktopNavLinks.length > 0;

  return (
    <>
      {/* 1. RUNNING ANNOUNCEMENT MARQUEE TICKER */}
      {config.sectionVisibility?.announcementBar !== false &&
        config.appearance.showAnnouncementBar &&
        config.announcement.enabled &&
        config.announcement.items.length > 0 && (
          <div className="bg-emerald-950 text-emerald-50 border-b border-emerald-900/80 overflow-hidden relative z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {config.announcement.badgeText || 'STORE UPDATES'}
              </span>

              <div className="overflow-hidden flex-1 relative">
                <div
                  className="animate-marquee whitespace-nowrap flex items-center gap-10 text-xs font-medium text-emerald-100/95"
                  style={
                    {
                      '--marquee-duration': `${Math.max(10, config.announcement.speedSeconds || 28)}s`,
                    } as React.CSSProperties
                  }
                >
                  {[...config.announcement.items, ...config.announcement.items].map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-3">
                      <span>{item}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-[11px] text-emerald-300/90 font-mono shrink-0 pl-2 border-l border-emerald-800">
                <span>{storeStatus.currentTimeIST}</span>
              </div>
            </div>
          </div>
        )}

      {/* 2. CLOSED / AFTER-HOURS ALERT BAR */}
      {!storeStatus.isOpen && (
        <div className="bg-rose-950 text-rose-100 border-b border-rose-800/80 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Store is Currently Closed.</strong> {storeStatus.detailText} (Regular Hours:{' '}
                {config.business.hours.display}). You can still send your prescription or enquiry on
                WhatsApp for priority morning processing.
              </span>
            </div>
            <a
              href={primaryWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-800/90 hover:bg-rose-700 text-white font-semibold transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* 3. SAFEGUARD WHEN HEADER IS HIDDEN: NEVER LOCK OWNER OUT OF CMS */}
      {config.sectionVisibility?.headerBar === false && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCms}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg border border-white/15 backdrop-blur-md transition-all cursor-pointer"
            title="Header is currently hidden. Click to open Owner CMS."
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>Owner CMS</span>
          </button>
        </div>
      )}

      {/* 4. MAIN NAVIGATION HEADER */}
      {config.sectionVisibility?.headerBar !== false && (
        <header
          className={`${
            config.headerConfig?.sticky !== false ? 'sticky top-0' : 'relative'
          } z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            {/* Primary Row: Brand + Right Action Controls */}
            <div
              className={`flex items-center justify-between gap-2 sm:gap-4 ${
                config.headerConfig?.compactMode ? 'h-14' : 'h-16'
              }`}
            >
              {/* Brand Area (Never crushed) */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0 max-w-[65%] sm:max-w-none">
                {orderedBrandKeys.map((k) => renderHeaderElement(k))}
              </div>

              {/* Right Status & CTAs */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {orderedActionKeys.map((k) => renderHeaderElement(k))}

                {/* Mobile Hamburger Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Secondary Row on Desktop (lg+): Clean Full-Width Section Navigation Bar */}
            {showDesktopNav && (
              <nav
                aria-label="Primary Navigation"
                className="hidden lg:flex items-center justify-between gap-2 py-2 border-t border-slate-100"
              >
                <div className="flex items-center gap-1 flex-wrap">
                  {desktopNavLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 transition-all whitespace-nowrap"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 font-medium hidden xl:flex items-center gap-2">
                  <span>{config.business.address.building}, {config.business.address.area}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold">
                    {config.business.hours.display}
                  </span>
                </div>
              </nav>
            )}
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
              {/* Mobile Live Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      storeStatus.statusType === 'open'
                        ? 'bg-emerald-500 animate-pulse'
                        : storeStatus.statusType === 'closing-soon'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {storeStatus.badgeText} — {storeStatus.detailText}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Hours: {config.business.hours.display} ({storeStatus.currentTimeIST})
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Nav Links */}
              {config.headerElements?.navLinks !== false && mobileNavLinks.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {mobileNavLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/60 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Mobile Direct Contact & CMS Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${config.business.contact.primaryPhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Call {config.business.contact.primaryPhoneDisplay}
                </a>
                <a
                  href={primaryWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Enquiry
                </a>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenShopkeeperGuide();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Shopkeeper Easy Guide
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCms();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-600" />
                  {cmsUnlocked ? 'Manage Store CMS' : 'Owner CMS Login'}
                </button>
              </div>
            </div>
          )}
        </header>
      )}
    </>
  );
};
