import React, { useState } from 'react';
import {
  FileCheck2,
  Pill,
  HeartPulse,
  Stethoscope,
  Baby,
  Sparkles,
  Apple,
  ShoppingBag,
  Cross,
  Package,
} from 'lucide-react';
import { StoreConfig } from '../config/storeConfig';
import { sanitizeSafeUrl } from '../utils/storeUtils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackCategory?: string;
}

/**
 * Resilient image component that gracefully renders a crisp pharmacy SVG illustration
 * if an external URL is empty, uses an unsafe protocol, or fails to load.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  fallbackCategory,
  width = 800,
  height = 600,
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const safeSrc = sanitizeSafeUrl(src || '', { allowDataImage: true });

  if (!safeSrc || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt || fallbackTitle || 'Shri Sai Medical & General Store'}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-2.5 shadow-inner">
          <Cross className="w-6 h-6 text-emerald-300" />
        </div>
        {fallbackCategory && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/90 mb-1">
            {fallbackCategory}
          </span>
        )}
        <span className="text-xs font-bold text-white/95 line-clamp-2 max-w-[200px]">
          {fallbackTitle || alt || 'Shri Sai Medical & General Store'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt || fallbackTitle || 'Store visual'}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};

/**
 * Dynamic Category Icon mapper supporting all pharmacy & general store departments.
 */
export const CategoryIcon: React.FC<{ iconName: string; className?: string }> = ({
  iconName,
  className = 'w-6 h-6',
}) => {
  switch (iconName) {
    case 'FileCheck2':
      return <FileCheck2 className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Baby':
      return <Baby className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Apple':
      return <Apple className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    default:
      return <Package className={className} />;
  }
};

/**
 * Renders the customizable Store Emblem / Logo Badge based on `config.appearance`.
 */
export const StoreLogoBadge: React.FC<{
  appearance: StoreConfig['appearance'];
  size?: 'sm' | 'md' | 'lg';
}> = ({ appearance, size = 'md' }) => {
  const [imgErr, setImgErr] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-9 text-xs'
      : size === 'lg'
        ? 'w-12 h-12 text-base'
        : 'w-11 h-11 text-sm';

  const shapeClass =
    appearance.logoShape === 'circle'
      ? 'rounded-full'
      : appearance.logoShape === 'rounded'
        ? 'rounded-xl'
        : appearance.logoShape === 'shield'
          ? 'rounded-t-2xl rounded-b-3xl'
          : 'rounded-2xl';

  const borderClass =
    appearance.logoBorderColor === 'gold'
      ? 'ring-2 ring-amber-400/90 border border-amber-200/80'
      : appearance.logoBorderColor === 'emerald'
        ? 'ring-2 ring-emerald-400/90 border border-emerald-200/80'
        : 'ring-1 ring-white/40 border border-white/30';

  const mode = appearance.logoSymbolMode || 'initials';
  const safeCustomLogo = sanitizeSafeUrl(appearance.customLogoUrl || '', {
    allowDataImage: true,
  });

  return (
    <div
      className={`relative ${sizeClasses} ${shapeClass} ${borderClass} bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/20 shrink-0 overflow-hidden select-none`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.24),transparent_60%)] pointer-events-none" />
      {mode === 'custom_image' && safeCustomLogo && !imgErr ? (
        <img
          src={safeCustomLogo}
          alt="Shri Sai Medical & General Store Logo"
          width={48}
          height={48}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover relative z-10"
        />
      ) : mode === 'om' ? (
        <span className="relative z-10 font-black text-lg leading-none text-amber-200 drop-shadow">
          ॐ
        </span>
      ) : mode === 'cross' ? (
        <Cross className="relative z-10 w-5 h-5 text-emerald-100 stroke-[2.6]" />
      ) : mode === 'rx' ? (
        <span className="relative z-10 font-serif font-black text-base tracking-tight text-amber-100">
          ℞
        </span>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center leading-none">
          <span className="font-black tracking-tighter text-white">SS</span>
          <span className="text-[7px] font-extrabold uppercase tracking-widest text-amber-300 mt-0.5">
            MED
          </span>
        </div>
      )}
    </div>
  );
};
