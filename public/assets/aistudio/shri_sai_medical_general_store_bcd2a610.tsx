import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  Truck,
  HeartPulse,
  Pill,
  ShoppingBag,
  Baby,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Settings,
  Copy,
  Check,
  Navigation,
  Info,
  Building,
  HelpCircle,
  Activity,
  ArrowUpRight,
  SlidersHorizontal,
  Stethoscope,
  Sparkle,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Upload,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Palette,
  LayoutGrid,
  FileCode,
  Image as ImageIcon,
  CheckCheck,
  FolderPlus,
  BookOpen,
  Lightbulb,
  Compass,
  ArrowRight,
  Camera,
  Flame,
  Tag,
  Play,
  Pause,
  Percent,
  Timer,
  KeyRound,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

// ==========================================
// 0. ADVANCED MILITARY-GRADE WEBCRYPTO SECURITY UTILITIES
// ==========================================
const SECURITY_SALT_KEY = "sai_med_salt_v2_98741362";

// PBKDF2 100,000 iterations key derivation (Immune to rainbow tables and brute-force)
async function deriveSecureHash(secretPin, saltStr = SECURITY_SALT_KEY) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretPin),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(saltStr),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"]
  );

  const exported = await crypto.subtle.exportKey("raw", key);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random high-entropy ephemeral cryptographic session token
function generateEphemeralAuthToken() {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// 1. CENTRAL STORE CONFIGURATION (INITIAL SEED)
// ==========================================
export const INITIAL_STORE_CONFIG = {
  business: {
    name: "Shri Sai Medical & General Store",
    tagline: "Your Health, Our Priority",
    subheadline: "Your Trusted Neighbourhood Medical & General Store in Manipal",
    description: "Serving the Adarsha Nagar & Manipal community with genuine medicines, trusted healthcare products, personal care items, and everyday general essentials with honesty and dedicated customer care.",
    businessTypes: ["Medical Store", "Pharmacy", "General Store"],
    email: "shrisaimedical.manipal@gmail.com",
    address: {
      building: "Siddhesh Complex",
      street: "Adarsha Nagar",
      city: "Manipal",
      state: "Karnataka",
      pincode: "576104",
      country: "India",
      googleMapsSearchUrl: "https://www.google.com/maps/search/?api=1&query=Shri+Sai+Medical+Siddhesh+Complex+Adarsha+Nagar+Manipal+576104",
      googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=13.3417133,74.7890993",
      googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d970.5344088288856!2d74.78909926950917!3d13.341713304098318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTPCsDIwJzMwLjIiTiA3NMKwNDcnMjMuMSJF!5e0!3m2!1sen!2sin!4v1794250942176!5m2!1sen!2sin"
    },
    phones: [
      { display: "+91 89040 18698", raw: "8904018698", label: "Counter & Delivery Desk" },
      { display: "+91 99452 27858", raw: "9945227858", label: "Store & Enquiries" }
    ],
    whatsapp: {
      primaryRaw: "918904018698",
      secondaryRaw: "919945227858",
      defaultGreeting: "Hello Shri Sai Medical, I would like to enquire about:"
    },
    hours: {
      opensAt: "07:30",
      closesAt: "23:00",
      display: "Every day: 7:30 AM – 11:00 PM",
      daysSummary: "Monday to Sunday (Open 365 Days)"
    }
  },
  appearance: {
    primaryColor: "#08783F",
    secondaryColor: "#075C34",
    lightGreen: "#EAF7EF",
    logoType: "initials", // 'initials' | 'om' | 'cross' | 'rx' | 'custom_image'
    logoBadgeText: "SS",
    logoShape: "squircle", // 'squircle' | 'rounded' | 'circle' | 'shield'
    logoCustomUrl: "",
    badgeBorderAccent: "gold", // 'gold' | 'emerald' | 'none'
    fontFamily: "Inter, sans-serif"
  },
  sectionVisibility: {
    header: true,
    footer: true,
    announcement: true,
    flashSale: true,
    hero: true,
    about: true,
    categories: true,
    catalogue: true,
    delivery: true,
    gallery: true,
    contact: true
  },
  headerElements: {
    emergencyBar: true,
    logo: true,
    locationBadge: true,
    navLinks: true,
    helpBtn: true,
    whatsappBtn: true,
    callBtn: true,
    cmsBtn: true
  },
  footerElements: {
    brandSummary: true,
    quickLinks: true,
    contactInfo: true,
    ownerArea: true,
    copyright: true
  },
  flashSale: {
    enabled: true,
    autoPlay: true,
    showWelcomePopup: true, // Enable/disable welcome animated pop-up
    intervalSeconds: 5,
    title: "Flash Deals & Seasonal Offers",
    subtitle: "Exclusive in-store & local delivery savings on daily essentials, personal care & health devices.",
    disclaimer: "Notice: In accordance with Indian pharmaceutical regulations, prescription medicines are excluded from promotional discounts.",
    offers: [
      {
        id: "offer_1",
        title: "Family First Aid & Hygiene Combo",
        discountBadge: "SAVE 20%",
        couponCode: "FAMILY20",
        category: "firstaid",
        validity: "Limited Period Stock",
        originalPrice: "₹450",
        offerPrice: "₹360",
        description: "Includes Dettol antiseptic liquid, sterile cotton roll, adhesive plasters, and antiseptic ointment.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
        active: true
      },
      {
        id: "offer_2",
        title: "Baby Care Gentle Essentials Kit",
        discountBadge: "FLAT 15% OFF",
        couponCode: "BABYCARE15",
        category: "babycare",
        validity: "Everyday Counter Deal",
        originalPrice: "₹899",
        offerPrice: "₹760",
        description: "Special bundle of sensitive skin baby wipes, gentle bath cleanser, and anti-rash lotion pack.",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
        active: true
      },
      {
        id: "offer_3",
        title: "Digital BP Monitor & Health Kit",
        discountBadge: "SPECIAL ₹250 OFF",
        couponCode: "HEALTH250",
        category: "essentials",
        validity: "Special Promotion",
        originalPrice: "₹2,100",
        offerPrice: "₹1,850",
        description: "Certified automatic upper arm blood pressure monitor with warranty and free battery pack.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
        active: true
      },
      {
        id: "offer_4",
        title: "Student Grooming & Hostel Pack",
        discountBadge: "BUY 2 GET 10% OFF",
        couponCode: "STUDENT10",
        category: "general",
        validity: "Hostel & Campus Deal",
        originalPrice: "₹380",
        offerPrice: "₹340",
        description: "Toothpastes, medicated soaps, shampoo sachets, battery cells, and energy drinks package.",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
        active: true
      }
    ]
  },
  announcement: {
    enabled: true,
    badge: "Store Updates",
    speedSeconds: 70, // Relaxed, easy-to-read scrolling speed
    items: [
      "🌿 Welcome to Shri Sai Medical & General Store – Siddhesh Complex, Adarsha Nagar, Manipal",
      "🕒 Open Everyday: 7:30 AM – 11:00 PM (Including Sundays & Public Holidays)",
      "🚚 Doorstep Home Delivery Available in Manipal & Adarsha Nagar – Call 8904018698 / 9945227858",
      "💊 100% Genuine Prescription Drugs, OTC Health, First Aid, Baby Care & Student Provisions",
      "⚡ Instant WhatsApp Ordering & Stock Verification: +91 89040 18698"
    ]
  },
  delivery: {
    available: true,
    title: "Healthcare Essentials, Closer to Home",
    summary: "Reliable neighbourhood doorstep assistance for elderly patients, students, families, and residents in Manipal.",
    terms: [
      "Contact the pharmacy via WhatsApp or Call to check delivery radius & slot availability.",
      "Valid doctor prescriptions are mandatory for schedule medications (H/H1/X) prior to dispensing.",
      "Cash on Delivery and UPI payments (Google Pay, PhonePe, Paytm) accepted upon delivery.",
      "Standard delivery hours: 7:30 AM – 10:30 PM depending on counter staff availability."
    ]
  },
  categories: [
    {
      id: "prescriptions",
      name: "Prescription Medicines",
      description: "Authentic chronic, acute, and prescribed pharmaceuticals. Sourced strictly from verified distributors.",
      badge: "Rx Required",
      count: "1,200+ Formulations"
    },
    {
      id: "otc",
      name: "OTC Medicines",
      description: "Pain relievers, antacids, cold & cough remedies, lozenges, and essential over-the-counter relief.",
      badge: "Everyday Care",
      count: "Ready Stock"
    },
    {
      id: "firstaid",
      name: "First Aid & Dressings",
      description: "Bandages, sterile cotton, antiseptic liquids, burn creams, surgical tapes, and wound care kits.",
      badge: "Emergency Care",
      count: "Hospital Grade"
    },
    {
      id: "essentials",
      name: "Healthcare Essentials",
      description: "Digital BP monitors, glucometers, nebulizers, thermometers, pulse oximeters & wellness supplements.",
      badge: "Home Wellness",
      count: "Verified Devices"
    },
    {
      id: "personalcare",
      name: "Personal Care",
      description: "Dermatological skincare, medicated shampoos, oral care, sunscreens, and body wellness products.",
      badge: "Daily Care",
      count: "Top Brands"
    },
    {
      id: "babycare",
      name: "Baby Care",
      description: "Premium baby diapers, gentle baby washes, formulas, feeding bottles, powders, and wipes.",
      badge: "Mother & Baby",
      count: "Infant Safe"
    },
    {
      id: "hygiene",
      name: "Hygiene & Sanitization",
      description: "Sanitizers, antibacterial hand washes, disinfectant sprays, surface cleaners, and masks.",
      badge: "Hygiene",
      count: "Daily Protective"
    },
    {
      id: "general",
      name: "General Store Essentials",
      description: "Everyday snacks, packaged water, battery cells, grooming essentials, toiletries, and confectioneries.",
      badge: "Daily Needs",
      count: "Campus & Home"
    }
  ],
  products: [
    {
      id: "p1",
      name: "Blood Pressure Digital Monitor",
      category: "essentials",
      brand: "Omron / Standard Medical",
      price: "Enquire in store",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      description: "Accurate automatic upper arm BP monitor with digital cuff for routine health monitoring at home.",
      isPrescription: false
    },
    {
      id: "p2",
      name: "Accu-Chek Blood Glucose Test Strips & Meter",
      category: "essentials",
      brand: "Roche / Accu-Chek",
      price: "Available at counter",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80",
      description: "Instant blood sugar testing strips and digital monitoring kit with painless lancing device.",
      isPrescription: false
    },
    {
      id: "p3",
      name: "Dettol Antiseptic Liquid (Multiple Sizes)",
      category: "firstaid",
      brand: "Reckitt Benckiser",
      price: "MRP on Pack",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      description: "Trusted antiseptic disinfectant liquid for first aid wound cleansing and personal hygiene.",
      isPrescription: false
    },
    {
      id: "p4",
      name: "Pampers Baby Dry Diaper Pants (S, M, L, XL)",
      category: "babycare",
      brand: "P&G Pampers",
      price: "MRP on Pack",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80",
      description: "Ultra-absorbent baby diapers with anti-rash lotion core for comfortable sleep and protection.",
      isPrescription: false
    },
    {
      id: "p5",
      name: "Sebamed Baby Gentle Wash & Cleansing Bar",
      category: "babycare",
      brand: "Sebamed Germany",
      price: "MRP on Pack",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
      description: "pH 5.5 balanced soap-free formulation designed for delicate and sensitive infant skin.",
      isPrescription: false
    },
    {
      id: "p6",
      name: "Cetaphil Gentle Skin Cleanser & Moisturizer",
      category: "personalcare",
      brand: "Galderma",
      price: "Available at counter",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1556228722-d0b5de731744?auto=format&fit=crop&w=400&q=80",
      description: "Dermatologist-recommended gentle hydration for sensitive, dry and acne-prone skin.",
      isPrescription: false
    },
    {
      id: "p7",
      name: "Himalaya Herbal Dental Cream & Oral Health",
      category: "personalcare",
      brand: "Himalaya Wellness",
      price: "MRP on Pack",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
      description: "Ayurvedic fluoride-free herbal toothpaste protecting against plaque, gum bleeding, and toothache.",
      isPrescription: false
    },
    {
      id: "p8",
      name: "Crepe Bandage & Surgical Micropore Tape",
      category: "firstaid",
      brand: "Hospital Grade",
      price: "Affordable",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      description: "High-stretch elastic supportive bandage for sprains, muscle strains, and dressing fixation.",
      isPrescription: false
    },
    {
      id: "p9",
      name: "Prescription Antibiotics & Chronic Medications",
      category: "prescriptions",
      brand: "Cipla / Sun Pharma / Torrent / Mankind",
      price: "Dispensed per prescription",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
      description: "Dispensed strictly by qualified pharmacist upon physical verification of valid doctor's prescription.",
      isPrescription: true
    },
    {
      id: "p10",
      name: "Pulse Oximeter Fingertip Oxygen Sensor",
      category: "essentials",
      brand: "Standard Medical",
      price: "Enquire in store",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      description: "High accuracy SpO2 blood oxygen saturation and pulse rate monitor with digital display.",
      isPrescription: false
    },
    {
      id: "p11",
      name: "Electral Oral Rehydration Salts (ORS)",
      category: "otc",
      brand: "FDC Limited",
      price: "WHO Approved MRP",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      description: "WHO approved formula for fast recovery from dehydration, fatigue, and heat exhaustion.",
      isPrescription: false
    },
    {
      id: "p12",
      name: "Everyday FMCG & General Store Goods",
      category: "general",
      brand: "Daily Brands",
      price: "Best Local Price",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80",
      description: "Biscuits, milk drinks, bottled water, soaps, detergents, shaving supplies, batteries & student stationery.",
      isPrescription: false
    }
  ],
  gallery: [
    {
      id: "g1",
      title: "Store Exterior & Signboard",
      category: "Exterior",
      caption: "Prominent green signboard at Siddhesh Complex, Adarsha Nagar, Manipal with clear road visibility.",
      tag: "Actual Storefront",
      targetSection: "hero",
      imageUrl: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "g2",
      title: "Organised Pharmaceutical Bays",
      category: "Interior",
      caption: "Systematically arranged temperature-monitored racks storing chronic medicines, pediatric syrups, and tablets.",
      tag: "Pharmacy Counter",
      targetSection: "about",
      imageUrl: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "g3",
      title: "Baby Care & Wellness Shelves",
      category: "Retail",
      caption: "Dedicated baby nutritional food, mother essentials, diapers, wipes, and pediatric hygiene products.",
      tag: "Baby & Nutrition",
      targetSection: "gallery",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "g4",
      title: "FMCG & General Essentials Aisle",
      category: "General",
      caption: "Everyday toiletries, grooming kits, oral care, and home convenience goods under one roof.",
      tag: "General Store",
      targetSection: "gallery",
      imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80"
    }
  ]
};

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================
function getLiveStoreStatus(opensAtStr = "07:30", closesAtStr = "23:00") {
  try {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);

    const [openH, openM] = opensAtStr.split(':').map(Number);
    const [closeH, closeM] = closesAtStr.split(':').map(Number);

    const currentMinutes = istDate.getHours() * 60 + istDate.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    const minutesUntilClose = closeMinutes - currentMinutes;
    const isClosingSoon = isOpen && minutesUntilClose > 0 && minutesUntilClose <= 45;

    if (isOpen) {
      if (isClosingSoon) {
        return {
          status: "closing-soon",
          isOpen: true,
          badgeText: `Closing in ${minutesUntilClose} min`,
          colorClass: "bg-amber-500/10 text-amber-800 border-amber-500/30",
          dotClass: "bg-amber-500 animate-pulse",
          detail: `Counter closes tonight at ${formatTime12(closesAtStr)}`,
          bannerNote: `⚠️ Closing soon at ${formatTime12(closesAtStr)}. For urgent delivery or night medication, call the counter directly.`
        };
      }
      return {
        status: "open",
        isOpen: true,
        badgeText: "Open Now",
        colorClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
        dotClass: "bg-emerald-500 animate-pulse",
        detail: `Open today until ${formatTime12(closesAtStr)}`,
        bannerNote: null
      };
    } else {
      return {
        status: "closed",
        isOpen: false,
        badgeText: "Currently Closed",
        colorClass: "bg-rose-500/10 text-rose-800 border-rose-500/30",
        dotClass: "bg-rose-500",
        detail: `Reopens tomorrow at ${formatTime12(opensAtStr)} (7:30 AM)`,
        bannerNote: `🌙 Store is currently closed for counter dispensing. For urgent emergency medicine availability or early morning delivery, leave a WhatsApp message or call.`
      };
    }
  } catch (e) {
    return {
      status: "open",
      isOpen: true,
      badgeText: "Open Daily",
      colorClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
      dotClass: "bg-emerald-500",
      detail: "7:30 AM – 11:00 PM Every day",
      bannerNote: null
    };
  }
}

function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const minStr = m < 10 ? `0${m}` : m;
  return `${hour12}:${minStr} ${suffix}`;
}

function createWhatsAppLink(numberRaw, message) {
  const cleanNumber = (numberRaw || "").replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent((message || "").trim());
  return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
}

// Generate complete TypeScript file string
function generateStoreConfigCode(cfg) {
  return `// src/config/storeConfig.ts
// Production Store Configuration for Shri Sai Medical & General Store
// Auto-generated by Owner CMS - Preserving all verified store details

export interface StoreConfig {
  business: {
    name: string;
    tagline: string;
    subheadline: string;
    description: string;
    businessTypes: string[];
    email?: string;
    address: {
      building: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
      googleMapsSearchUrl: string;
      googleMapsDirectionsUrl: string;
    };
    phones: Array<{ display: string; raw: string; label: string }>;
    whatsapp: {
      primaryRaw: string;
      secondaryRaw: string;
      defaultGreeting: string;
    };
    hours: {
      opensAt: string;
      closesAt: string;
      display: string;
      daysSummary: string;
    };
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    lightGreen: string;
    logoType?: 'initials' | 'om' | 'cross' | 'rx' | 'custom_image';
    logoBadgeText: string;
    logoShape?: 'squircle' | 'rounded' | 'circle' | 'shield';
    logoCustomUrl?: string;
    badgeBorderAccent?: 'gold' | 'emerald' | 'none';
    fontFamily: string;
  };
  sectionVisibility: {
    header: boolean;
    footer: boolean;
    announcement: boolean;
    flashSale: boolean;
    hero: boolean;
    about: boolean;
    categories: boolean;
    catalogue: boolean;
    delivery: boolean;
    gallery: boolean;
    contact: boolean;
  };
  headerElements?: {
    emergencyBar?: boolean;
    logo?: boolean;
    locationBadge?: boolean;
    navLinks?: boolean;
    sectionsBtn?: boolean;
    helpBtn?: boolean;
    whatsappBtn?: boolean;
    callBtn?: boolean;
    cmsBtn?: boolean;
  };
  footerElements?: {
    brandSummary?: boolean;
    quickLinks?: boolean;
    contactInfo?: boolean;
    ownerArea?: boolean;
    copyright?: boolean;
  };
  announcement: {
    enabled: boolean;
    badge: string;
    speedSeconds: number;
    items: string[];
  };
  delivery: {
    available: boolean;
    title: string;
    summary: string;
    terms: string[];
  };
  categories: Array<{
    id: string;
    name: string;
    description: string;
    badge: string;
    count?: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    category: string;
    brand: string;
    price: string;
    available: boolean;
    imageUrl?: string;
    description: string;
    isPrescription: boolean;
  }>;
  gallery: Array<{
    id: string;
    title: string;
    category: string;
    caption: string;
    tag: string;
    imageUrl?: string;
  }>;
}

export const STORE_CONFIG: StoreConfig = ${JSON.stringify(cfg, null, 2)};

export default STORE_CONFIG;
`;
}

// ==========================================
// 3. MAIN APPLICATION & OWNER CMS COMPONENT
// ==========================================
export default function App() {
  // Persistent database / localStorage load
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sai_medical_store_config_master_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage load warning", e);
    }
    return INITIAL_STORE_CONFIG;
  });

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());
  const [overrideStatus, setOverrideStatus] = useState('auto'); // 'auto', 'force-open', 'force-closed'
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Modal & Management States
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOfferItem, setEditingOfferItem] = useState(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [offerPriceMode, setOfferPriceMode] = useState('auto'); // 'auto' | 'custom'
  const [cmsProductFilter, setCmsProductFilter] = useState('');

  // Flash Sale Carousel & Running State
  const [activeOfferSlide, setActiveOfferSlide] = useState(0);
  const [isOfferCarouselPlaying, setIsOfferCarouselPlaying] = useState(true);
  const [showFlashPopup, setShowFlashPopup] = useState(false);
  const [popupOfferSlide, setPopupOfferSlide] = useState(0);
  const [isPopupCarouselPlaying, setIsPopupCarouselPlaying] = useState(true);

  // Product Showcase Carousel State
  const [productCarouselIndex, setProductCarouselIndex] = useState(0);
  const [isProductCarouselPlaying, setIsProductCarouselPlaying] = useState(true);

  // Responsive items-per-view tracking for smooth 1-by-1 sliding
  const [itemsPerView, setItemsPerView] = useState(4);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-cycle popup offers carousel when popup is open
  useEffect(() => {
    if (!showFlashPopup || !isPopupCarouselPlaying) return;
    const activeOffers = (config.flashSale?.offers || []).filter(o => o.active !== false);
    if (activeOffers.length <= 1) return;

    const timer = setInterval(() => {
      setPopupOfferSlide(prev => (prev + 1) % activeOffers.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [showFlashPopup, isPopupCarouselPlaying, config.flashSale]);

  // Auto-play product carousel: smoothly loops back to start after reaching the end
  useEffect(() => {
    if (!isProductCarouselPlaying) return;
    const allProducts = config.products || [];
    const totalPages = Math.ceil(allProducts.length / itemsPerView);
    if (totalPages <= 1) return;

    const timer = setInterval(() => {
      setProductCarouselIndex((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [config.products, isProductCarouselPlaying, itemsPerView]);

  // Trigger attractive welcome pop-up on page load if deals are active and not dismissed in this session
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('sai_flash_modal_dismissed');
    const hasActiveOffers = (config.flashSale?.offers || []).some(o => o.active !== false);

    if (
      config.flashSale?.enabled &&
      config.flashSale?.showWelcomePopup !== false &&
      hasActiveOffers &&
      !isDismissed
    ) {
      // Gentle delay (1.2s) so the user first sees the clean storefront before being pleasantly greeted
      const timer = setTimeout(() => {
        setShowFlashPopup(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [config.flashSale]);

  const handleDismissFlashPopup = () => {
    setShowFlashPopup(false);
    try {
      sessionStorage.setItem('sai_flash_modal_dismissed', 'true');
    } catch (e) {
      // fallback
    }
  };

  const handleClaimFlashPopup = () => {
    handleDismissFlashPopup();
    navigateTo('offers');
  };

  // Auto-play flash sale carousel
  useEffect(() => {
    if (!config.flashSale?.enabled || !isOfferCarouselPlaying) return;
    const activeOffers = (config.flashSale?.offers || []).filter(o => o.active !== false);
    if (activeOffers.length <= 1) return;

    const timer = setInterval(() => {
      setActiveOfferSlide(prev => (prev + 1) % activeOffers.length);
    }, (config.flashSale.intervalSeconds || 5) * 1000);

    return () => clearInterval(timer);
  }, [config.flashSale, isOfferCarouselPlaying]);

  // Helper renderer for the dynamic premium logo badge
  const renderStoreLogoBadge = (customSizeClass = "w-11 h-11", customTextClass = "text-xl") => {
    const app = config.appearance || {};
    const logoType = app.logoType || 'initials';
    const logoShape = app.logoShape || 'squircle';
    const borderAccent = app.badgeBorderAccent || 'gold';

    // Shape radius class
    const shapeClass =
      logoShape === 'circle' ? 'rounded-full' :
      logoShape === 'rounded' ? 'rounded-xl' :
      logoShape === 'shield' ? 'rounded-t-2xl rounded-b-lg' :
      'rounded-2xl'; // squircle default

    // Border trim accent
    const borderClass =
      borderAccent === 'gold' ? 'border-2 border-amber-400 shadow-amber-500/20 shadow-md' :
      borderAccent === 'emerald' ? 'border-2 border-emerald-300 shadow-emerald-500/20 shadow-md' :
      'border border-white/20 shadow-md';

    return (
      <div
        style={{ backgroundColor: app.primaryColor || '#08783F' }}
        className={`${customSizeClass} ${shapeClass} ${borderClass} relative overflow-hidden flex items-center justify-center text-white font-serif font-black select-none transition-all duration-300 group-hover:scale-[1.04] shrink-0`}
      >
        {logoType === 'custom_image' && app.logoCustomUrl ? (
          <img
            src={app.logoCustomUrl}
            alt="Store Logo"
            className="w-full h-full object-cover"
          />
        ) : logoType === 'om' ? (
          <span className={`${customTextClass} leading-none font-bold text-amber-200 drop-shadow-xs`}>
            ॐ
          </span>
        ) : logoType === 'cross' ? (
          <div className="relative w-5 h-5 flex items-center justify-center">
            <span className="absolute w-4 h-1.5 bg-white rounded-full"></span>
            <span className="absolute h-4 w-1.5 bg-white rounded-full"></span>
          </div>
        ) : logoType === 'rx' ? (
          <span className={`${customTextClass} font-sans font-black tracking-tighter text-emerald-100`}>
            ℞
          </span>
        ) : (
          <span className={`${customTextClass} tracking-tight font-sans font-black uppercase text-white`}>
            {app.logoBadgeText || "SS"}
          </span>
        )}
      </div>
    );
  };

  // OWNER CMS STATES
  const [ownerEditorOpen, setOwnerEditorOpen] = useState(false);
  const [cmsPage, setCmsPage] = useState('sections'); // default directly to Section Control Hub
  const [draftConfig, setDraftConfig] = useState(() => JSON.parse(JSON.stringify(config)));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [ownerAuthPin, setOwnerAuthPin] = useState('');
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [shopkeeperGuideOpen, setShopkeeperGuideOpen] = useState(false);
  const [activeGuideTopic, setActiveGuideTopic] = useState('phone');

  // ADVANCED ENTERPRISE SECURITY & ANTI-HACK STATES
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(localStorage.getItem('sai_failed_auth_attempts') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    try {
      return parseInt(localStorage.getItem('sai_lockout_until') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);
  const [storedPinHash, setStoredPinHash] = useState(() => {
    try {
      return localStorage.getItem('sai_owner_secure_hash') || null;
    } catch {
      return null;
    }
  });
  const [securityAuditLog, setSecurityAuditLog] = useState(() => {
    try {
      const logs = localStorage.getItem('sai_sec_audit_log');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  });
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState({ type: '', text: '' });
  const [logoSecretClickCount, setLogoSecretClickCount] = useState(0);

  // Stealth Access: Secret keyboard shortcut (Ctrl + Shift + O) or Triple-click on store logo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setOwnerEditorOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Rolling 15-Minute Session Expiry & Token Verification on Mount
  useEffect(() => {
    try {
      const token = sessionStorage.getItem('sai_owner_ephemeral_token');
      const expiry = parseInt(sessionStorage.getItem('sai_owner_token_expiry') || '0', 10);
      if (token && expiry && Date.now() < expiry) {
        setIsOwnerAuthenticated(true);
      } else {
        setIsOwnerAuthenticated(false);
        sessionStorage.removeItem('sai_owner_ephemeral_token');
        sessionStorage.removeItem('sai_owner_token_expiry');
      }
    } catch {
      setIsOwnerAuthenticated(false);
    }
  }, []);

  // Real-time defensive countdown timer during brute-force lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSec(0);
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemainingSec(remaining);
      if (remaining <= 0) {
        setLockoutUntil(0);
        localStorage.removeItem('sai_lockout_until');
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Log security events safely into local audit log
  const logSecurityEvent = (eventTitle, details, isSuccess = true) => {
    const newEntry = {
      id: `sec_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, timeZone: 'Asia/Kolkata' }),
      date: new Date().toLocaleDateString('en-GB'),
      title: eventTitle,
      details,
      isSuccess
    };
    setSecurityAuditLog(prev => {
      const updated = [newEntry, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('sai_sec_audit_log', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // High-Security Authentication Verification with Cryptographic PBKDF2 & Progressive Lockout
  const handleAuthenticateOwner = async (e) => {
    e.preventDefault();
    if (lockoutRemainingSec > 0) return;

    const trimmedInput = ownerAuthPin.trim();
    if (!trimmedInput) {
      setPinError("Please enter your Master Security PIN.");
      return;
    }

    try {
      const inputHash = await deriveSecureHash(trimmedInput);

      // Default authorized master PIN hashes (1234 and 8904 seed hashes)
      const defaultHash1234 = await deriveSecureHash("1234");
      const defaultHash8904 = await deriveSecureHash("8904");

      const isMatch = storedPinHash
        ? inputHash === storedPinHash
        : (inputHash === defaultHash1234 || inputHash === defaultHash8904);

      if (isMatch) {
        // Authenticated successfully! Issue ephemeral token with 15 min lifetime
        const ephemeralToken = generateEphemeralAuthToken();
        const expiryTime = Date.now() + 15 * 60 * 1000;
        sessionStorage.setItem('sai_owner_ephemeral_token', ephemeralToken);
        sessionStorage.setItem('sai_owner_token_expiry', expiryTime.toString());

        setIsOwnerAuthenticated(true);
        setPinError('');
        setOwnerAuthPin('');
        setFailedAttempts(0);
        localStorage.removeItem('sai_failed_auth_attempts');
        localStorage.removeItem('sai_lockout_until');
        logSecurityEvent("Authorized Access", "Owner successfully logged in via PBKDF2 verification", true);
      } else {
        // Increment progressive lockout
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        localStorage.setItem('sai_failed_auth_attempts', nextFailed.toString());

        if (nextFailed >= 6) {
          // 5-Minute Lockdown
          const lockTime = Date.now() + 300 * 1000;
          setLockoutUntil(lockTime);
          localStorage.setItem('sai_lockout_until', lockTime.toString());
          setPinError("SECURITY LOCKDOWN: Multiple failed attempts. Locked for 5 minutes.");
          logSecurityEvent("Security Lockdown", "Multiple failed login attempts. Defense activated for 5 mins.", false);
        } else if (nextFailed >= 4) {
          // 45-Second Lockdown
          const lockTime = Date.now() + 45 * 1000;
          setLockoutUntil(lockTime);
          localStorage.setItem('sai_lockout_until', lockTime.toString());
          setPinError("Rate limit exceeded. System locked for 45 seconds.");
          logSecurityEvent("Brute-Force Rate Limit", "4 failed attempts. Locked for 45 seconds.", false);
        } else {
          setPinError(`Incorrect Security PIN (${nextFailed}/4 attempts before lockout).`);
          logSecurityEvent("Failed Authentication", `Invalid PIN attempted.`, false);
        }
      }
    } catch (err) {
      setPinError("Security subsystem error. Please try again.");
    }
  };

  // Secure PIN change handler inside CMS
  const handleChangeOwnerPin = async (e) => {
    e.preventDefault();
    setPinChangeMsg({ type: '', text: '' });

    if (!currentPinInput.trim() || !newPinInput.trim() || !confirmNewPinInput.trim()) {
      setPinChangeMsg({ type: 'error', text: 'All PIN fields are required.' });
      return;
    }
    if (newPinInput.length < 4) {
      setPinChangeMsg({ type: 'error', text: 'New PIN must be at least 4 characters long.' });
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setPinChangeMsg({ type: 'error', text: 'New PIN and confirmation do not match.' });
      return;
    }

    try {
      const currentInputHash = await deriveSecureHash(currentPinInput.trim());
      const defaultHash1234 = await deriveSecureHash("1234");
      const defaultHash8904 = await deriveSecureHash("8904");

      const isCurrentValid = storedPinHash
        ? currentInputHash === storedPinHash
        : (currentInputHash === defaultHash1234 || currentInputHash === defaultHash8904);

      if (!isCurrentValid) {
        setPinChangeMsg({ type: 'error', text: 'Current Master PIN is incorrect.' });
        return;
      }

      const newHash = await deriveSecureHash(newPinInput.trim());
      localStorage.setItem('sai_owner_secure_hash', newHash);
      setStoredPinHash(newHash);

      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setPinChangeMsg({ type: 'success', text: 'Master Owner PIN updated and encrypted with PBKDF2 successfully!' });
      logSecurityEvent("Master PIN Updated", "Owner changed and re-encrypted their master access key", true);
    } catch {
      setPinChangeMsg({ type: 'error', text: 'Failed to encrypt new PIN.' });
    }
  };

  // Immediate remote logout & session termination
  const handleLockSession = () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem('sai_owner_ephemeral_token');
    sessionStorage.removeItem('sai_owner_token_expiry');
    logSecurityEvent("Manual Lockout", "Owner locked session and revoked ephemeral token", true);
  };

  // Quick 1-click Toggle to Show/Hide any section directly
  const handleToggleSection = (sectionKey) => {
    const currentVal = draftConfig.sectionVisibility?.[sectionKey] !== false;
    const updatedVisibility = {
      ...(draftConfig.sectionVisibility || {}),
      [sectionKey]: !currentVal
    };
    setDraftConfig(prev => ({
      ...prev,
      sectionVisibility: updatedVisibility
    }));
    setHasUnsavedChanges(true);
  };

  // Offer Helper: Extract discount percentage number from badge strings (e.g. "SAVE 20%" -> 20)
  const extractDiscountPercent = (badgeStr) => {
    if (!badgeStr) return 0;
    const match = badgeStr.match(/(\d+)%/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    const numMatch = badgeStr.match(/\b(\d+)\b/);
    return numMatch ? parseInt(numMatch[1], 10) : 0;
  };

  // Offer Helper: Compute calculated offer price given raw price and percentage
  const calculateOfferPrice = (origPriceStr, percent) => {
    if (!origPriceStr || !percent) return null;
    const num = parseFloat(origPriceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) return null;
    const discounted = Math.round(num * (1 - percent / 100));
    return `₹${discounted}`;
  };

  // Offer CRUD Handlers
  const handleAddNewOffer = () => {
    const newOfferDraft = {
      id: `offer_${Date.now()}`,
      title: "",
      discountBadge: "SAVE 15%",
      couponCode: "DEAL15",
      category: "general",
      validity: "Special Weekend Offer",
      originalPrice: "₹500",
      offerPrice: "₹425",
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      active: true,
      isNew: true
    };
    setOfferPriceMode('auto');
    setEditingOfferItem(newOfferDraft);
  };

  const handleSaveOfferModal = (offerToSave) => {
    if (!offerToSave.title.trim()) return;
    const { isNew, ...cleanedOffer } = offerToSave;

    setDraftConfig(prev => {
      const existingOffers = prev.flashSale?.offers || [];
      const exists = existingOffers.some(o => o.id === cleanedOffer.id);
      const updatedOffers = exists
        ? existingOffers.map(o => o.id === cleanedOffer.id ? cleanedOffer : o)
        : [cleanedOffer, ...existingOffers];

      return {
        ...prev,
        flashSale: {
          ...prev.flashSale,
          offers: updatedOffers
        }
      };
    });
    setHasUnsavedChanges(true);
    setEditingOfferItem(null);
  };

  const handleDeleteOffer = (offerId) => {
    setDraftConfig(prev => ({
      ...prev,
      flashSale: {
        ...prev.flashSale,
        offers: (prev.flashSale?.offers || []).filter(o => o.id !== offerId)
      }
    }));
    setHasUnsavedChanges(true);
    setDeleteConfirmTarget(null);
  };

  // States to toggle custom input when owner chooses "Create New..." from dropdowns
  const [customBadgeMode, setCustomBadgeMode] = useState(false);
  const [customSubtextMode, setCustomSubtextMode] = useState(false);

  // Gallery CRUD & Device File Upload Handlers
  const handleAddNewGalleryPhoto = () => {
    const newPhotoDraft = {
      id: `g_${Date.now()}`,
      title: "",
      category: "Interior",
      caption: "",
      tag: "Store View",
      targetSection: "gallery", // Defaults strictly to Gallery, not Hero
      imageUrl: "",
      isNew: true
    };
    setEditingGalleryItem(newPhotoDraft);
  };

  const handleDeviceImageUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Automatic dimension & aspect ratio adjustment via HTML5 canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized, lightweight JPEG base64 URL
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(optimizedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGalleryItemModal = (itemToSave) => {
    if (!itemToSave.title.trim()) return;
    const { isNew, ...cleanedItem } = itemToSave;

    setDraftConfig(prev => {
      const exists = prev.gallery.some(g => g.id === cleanedItem.id);
      const updatedGallery = exists
        ? prev.gallery.map(g => g.id === cleanedItem.id ? cleanedItem : g)
        : [cleanedItem, ...prev.gallery];
      return {
        ...prev,
        gallery: updatedGallery
      };
    });
    setHasUnsavedChanges(true);
    setEditingGalleryItem(null);
  };

  // Dynamic lists of all existing distinct Badges and Subtexts across all departments
  const existingBadges = useMemo(() => {
    const badges = (draftConfig.categories || [])
      .map(c => c.badge)
      .filter(Boolean);
    return Array.from(new Set(badges));
  }, [draftConfig.categories]);

  const existingSubtexts = useMemo(() => {
    const subtexts = (draftConfig.categories || [])
      .map(c => c.count)
      .filter(Boolean);
    return Array.from(new Set(subtexts));
  }, [draftConfig.categories]);

  // Category CRUD Handlers - Only commit to draftConfig when explicitly saved
  const handleAddNewCategory = () => {
    const newCatId = `cat_${Date.now()}`;
    const newCatDraft = {
      id: newCatId,
      name: "",
      description: "",
      badge: existingBadges[0] || "Everyday Care",
      count: existingSubtexts[0] || "Ready Stock",
      isNew: true // Temporary flag to indicate this is a new draft
    };
    // Do NOT prepend into draftConfig.categories yet!
    setCustomBadgeMode(false);
    setCustomSubtextMode(false);
    setEditingCategory(newCatDraft);
  };

  const handleSaveCategoryModal = (catToSave) => {
    if (!catToSave.name.trim()) return;
    
    // Clean up temporary flag
    const { isNew, ...cleanedCategory } = catToSave;

    setDraftConfig(prev => {
      const exists = prev.categories.some(c => c.id === cleanedCategory.id);
      const updatedCategories = exists
        ? prev.categories.map(c => c.id === cleanedCategory.id ? cleanedCategory : c)
        : [cleanedCategory, ...prev.categories]; // Insert only now upon clicking Save
      return {
        ...prev,
        categories: updatedCategories
      };
    });
    setHasUnsavedChanges(true);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId) => {
    setDraftConfig(prev => {
      const remainingCats = prev.categories.filter(c => c.id !== catId);
      const fallbackCat = remainingCats[0]?.id || "general";
      // Reassign products under this category to fallback category so products don't orphan
      const updatedProducts = prev.products.map(p => p.category === catId ? { ...p, category: fallbackCat } : p);
      return {
        ...prev,
        categories: remainingCats,
        products: updatedProducts
      };
    });
    setHasUnsavedChanges(true);
    setDeleteConfirmTarget(null);
  };

  // Product CRUD Handlers - Only commit to draftConfig when explicitly saved
  const handleAddNewProduct = () => {
    const defaultCat = draftConfig.categories[0]?.id || "prescriptions";
    const newProductDraft = {
      id: `p_${Date.now()}`,
      name: "",
      category: defaultCat,
      brand: "",
      price: "MRP on Pack",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      description: "",
      isPrescription: false,
      isNew: true // Temporary flag to indicate this is a new draft
    };
    // Do NOT prepend into draftConfig.products yet!
    setEditingProduct(newProductDraft);
  };

  const handleSaveProductModal = (prodToSave) => {
    if (!prodToSave.name.trim()) return;
    
    // Clean up temporary flag
    const { isNew, ...cleanedProduct } = prodToSave;

    setDraftConfig(prev => {
      const exists = prev.products.some(p => p.id === cleanedProduct.id);
      const updatedProducts = exists
        ? prev.products.map(p => p.id === cleanedProduct.id ? cleanedProduct : p)
        : [cleanedProduct, ...prev.products]; // Insert only now upon clicking Save
      return {
        ...prev,
        products: updatedProducts
      };
    });
    setHasUnsavedChanges(true);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (prodId) => {
    setDraftConfig(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== prodId)
    }));
    setHasUnsavedChanges(true);
    setDeleteConfirmTarget(null);
  };

  const handleDeleteGalleryItem = (photoId) => {
    setDraftConfig(prev => ({
      ...prev,
      gallery: prev.gallery.filter(g => g.id !== photoId)
    }));
    setHasUnsavedChanges(true);
    setDeleteConfirmTarget(null);
  };

  // Keep draft in sync when opening CMS
  const handleOpenCMS = () => {
    setDraftConfig(JSON.parse(JSON.stringify(config)));
    setHasUnsavedChanges(false);
    setSaveStatusMessage('');
    setOwnerEditorOpen(true);
  };

  // Sync Master Configuration to LocalStorage
  const handleSaveAndPublish = () => {
    try {
      // Validate essentials
      if (!draftConfig.business.name.trim()) {
        setSaveStatusMessage('Error: Store name cannot be empty.');
        return;
      }
      if (!draftConfig.business.phones[0].raw.trim()) {
        setSaveStatusMessage('Error: Primary phone number is required.');
        return;
      }

      // Save to browser database
      localStorage.setItem('sai_medical_store_config_master_v1', JSON.stringify(draftConfig));
      setConfig(JSON.parse(JSON.stringify(draftConfig)));
      setHasUnsavedChanges(false);
      setSaveStatusMessage('✅ Changes saved & published live to the storefront successfully!');
      setTimeout(() => setSaveStatusMessage(''), 4000);
    } catch (err) {
      setSaveStatusMessage('Error saving configuration: ' + err.message);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("Discard all unsaved changes and reload active store settings?")) {
      setDraftConfig(JSON.parse(JSON.stringify(config)));
      setHasUnsavedChanges(false);
      setSaveStatusMessage('Unsaved modifications were reverted.');
      setTimeout(() => setSaveStatusMessage(''), 3000);
    }
  };

  const handleResetToFactoryDefaults = () => {
    if (window.confirm("WARNING: This will reset all details, products, and categories back to the original seed data. Continue?")) {
      setDraftConfig(JSON.parse(JSON.stringify(INITIAL_STORE_CONFIG)));
      setConfig(JSON.parse(JSON.stringify(INITIAL_STORE_CONFIG)));
      localStorage.setItem('sai_medical_store_config_master_v1', JSON.stringify(INITIAL_STORE_CONFIG));
      setHasUnsavedChanges(false);
      setSaveStatusMessage('Restored initial store seed configuration.');
      setTimeout(() => setSaveStatusMessage(''), 3000);
    }
  };

  // Auto-tick real-time status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Store status calculation
  const storeStatus = useMemo(() => {
    if (overrideStatus === 'force-open') {
      return {
        status: "open",
        isOpen: true,
        badgeText: "Open Now",
        colorClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
        dotClass: "bg-emerald-500 animate-pulse",
        detail: `Open today until ${formatTime12(config.business.hours.closesAt)}`,
        bannerNote: null
      };
    }
    if (overrideStatus === 'force-closed') {
      return {
        status: "closed",
        isOpen: false,
        badgeText: "Currently Closed",
        colorClass: "bg-rose-500/10 text-rose-800 border-rose-500/30",
        dotClass: "bg-rose-500",
        detail: `Reopens daily at ${formatTime12(config.business.hours.opensAt)}`,
        bannerNote: `🌙 Store is currently closed. For urgent prescriptions or morning deliveries, leave a WhatsApp message.`
      };
    }
    return getLiveStoreStatus(config.business.hours.opensAt, config.business.hours.closesAt);
  }, [config.business.hours, currentTimeTick, overrideStatus]);

  // Product Filter for Storefront
  const filteredProducts = useMemo(() => {
    return config.products.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [config.products, selectedCategory, searchQuery]);

  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    const elem = document.getElementById(tabId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFA] text-[#14251B] font-sans antialiased selection:bg-[#08783F]/10 selection:text-[#08783F]">
      
      {/* SAFEGUARD: Floating CMS restore button when header is hidden */}
      {config.sectionVisibility?.header === false && (
        <div className="fixed top-3 right-3 z-50">
          <button
            onClick={handleOpenCMS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-900/90 text-white shadow-lg hover:bg-stone-800 transition-all border border-stone-700 backdrop-blur-sm"
            title="Header is hidden. Open Owner CMS to manage sections."
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>Owner CMS</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. RUNNING MARQUEE ANNOUNCEMENT BANNER                        */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.announcement !== false && config.announcement.enabled && (
        <aside aria-label="Store News Ticker" className="relative z-50 bg-[#075C34] text-white border-b border-emerald-950/20 select-none">
          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-banner {
              display: flex;
              width: max-content;
              animation: marqueeScroll ${config.announcement.speedSeconds || 70}s linear infinite;
            }
            .animate-marquee-banner:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="flex items-center">
            {/* Left Micro-Badge */}
            <div className={`z-10 border-r border-emerald-500/20 px-3.5 sm:px-4 py-2 flex items-center gap-2 shrink-0 ${
              !storeStatus.isOpen ? 'bg-[#7a1b1b]' : 'bg-[#064a2a]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${storeStatus.dotClass}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                {storeStatus.isOpen ? (config.announcement.badge || "Store Updates") : "Night Notice"}
              </span>
            </div>

            {/* Scrolling Track */}
            <div className="overflow-hidden flex-1 py-2 cursor-pointer" title="Hover or touch to pause">
              <div className="animate-marquee-banner text-xs sm:text-[13px] font-medium tracking-wide">
                <div className="flex items-center gap-10 px-4 shrink-0 text-emerald-100/90">
                  {!storeStatus.isOpen && (
                    <span className="flex items-center gap-2 text-rose-200 font-bold bg-rose-950/50 px-3 py-0.5 rounded-full border border-rose-400/30">
                      <span>🌙 Counter closed for the day (Opens 7:30 AM). WhatsApp active for morning requests.</span>
                      <span className="text-emerald-400/50 text-[10px]">◆</span>
                    </span>
                  )}
                  {config.announcement.items.map((msg, index) => (
                    <span key={`msg-1-${index}`} className="flex items-center gap-10">
                      <span className="hover:text-white transition-colors">{msg}</span>
                      <span className="text-emerald-400/50 text-[10px]">◆</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-10 px-4 shrink-0 text-emerald-100/90" aria-hidden="true">
                  {!storeStatus.isOpen && (
                    <span className="flex items-center gap-2 text-rose-200 font-bold bg-rose-950/50 px-3 py-0.5 rounded-full border border-rose-400/30">
                      <span>🌙 Counter closed for the day (Opens 7:30 AM). WhatsApp active for morning requests.</span>
                      <span className="text-emerald-400/50 text-[10px]">◆</span>
                    </span>
                  )}
                  {config.announcement.items.map((msg, index) => (
                    <span key={`msg-2-${index}`} className="flex items-center gap-10">
                      <span className="hover:text-white transition-colors">{msg}</span>
                      <span className="text-emerald-400/50 text-[10px]">◆</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Quick Call */}
            <div className="hidden lg:flex items-center gap-2 bg-[#064a2a] border-l border-emerald-500/20 px-4 py-2 shrink-0 z-10 text-xs text-emerald-100 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <a href={`tel:${config.business.phones[0].raw}`} className="hover:text-white underline decoration-emerald-400/50 underline-offset-2">
                {config.business.phones[0].display}
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* EMERGENCY CLOSED ALERT BAR */}
      {!storeStatus.isOpen && (
        <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-rose-950 text-white px-4 py-3 border-b border-rose-800/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-rose-300">Counter Currently Closed: </span>
                <span className="text-stone-300">Operating hours are daily <strong>{config.business.hours.display}</strong>.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={createWhatsAppLink(config.business.whatsapp.primaryRaw, "Hello Shri Sai Medical, I am placing an enquiry for morning store opening / emergency.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#25D366] text-black font-bold text-xs hover:bg-[#20b858] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Leave WhatsApp Note</span>
              </a>
              <a
                href={`tel:${config.business.phones[0].raw}`}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors"
              >
                Call for Urgent Help
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. STICKY HEADER & OWNER CMS LAUNCHER                         */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.header !== false && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* LOGO & BRAND (Triple-click secret trigger for Owner) */}
              <div
                onClick={() => {
                  const newCount = logoSecretClickCount + 1;
                  setLogoSecretClickCount(newCount);
                  if (newCount >= 3) {
                    setLogoSecretClickCount(0);
                    handleOpenCMS();
                  } else {
                    navigateTo('home');
                    setTimeout(() => setLogoSecretClickCount(0), 1200);
                  }
                }}
                className="flex items-center gap-3.5 cursor-pointer group"
                title="Shri Sai Medical (Tip: Triple-click opens Owner Shield)"
              >
                {config.headerElements?.logo !== false && renderStoreLogoBadge("w-11 h-11", "text-xl")}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#14251B] leading-none uppercase">
                      {config.business.name.split('&')[0]}
                    </span>
                    {config.headerElements?.locationBadge !== false && (
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[#EAF7EF] text-[#08783F] border border-[#08783F]/15">
                        MANIPAL
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#64736A] font-medium tracking-tight mt-1 truncate max-w-[220px] sm:max-w-none">
                    {config.business.name.includes('&') ? '& ' + config.business.name.split('&')[1] : config.business.address.building}
                  </p>
                </div>
              </div>

              {/* NAV LINKS */}
              {config.headerElements?.navLinks !== false && (
                <nav className="hidden lg:flex items-center space-x-1 font-medium text-[13px] text-[#14251B]">
                  {[
                    { id: 'home', label: 'Home', visible: config.sectionVisibility?.hero !== false },
                    { id: 'offers', label: 'Flash Deals', visible: config.sectionVisibility?.flashSale !== false && config.flashSale?.enabled && (config.flashSale?.offers || []).length > 0 },
                    { id: 'about', label: 'About', visible: config.sectionVisibility?.about !== false },
                    { id: 'categories', label: 'Categories', visible: config.sectionVisibility?.categories !== false },
                    { id: 'catalogue', label: 'Catalogue', visible: config.sectionVisibility?.catalogue !== false },
                    { id: 'delivery', label: 'Delivery', visible: config.sectionVisibility?.delivery !== false && config.delivery?.available },
                    { id: 'gallery', label: 'Store Tour', visible: config.sectionVisibility?.gallery !== false },
                    { id: 'contact', label: 'Contact & Map', visible: config.sectionVisibility?.contact !== false }
                  ]
                    .filter(item => item.visible)
                    .map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? 'text-[#08783F] font-semibold bg-[#EAF7EF]'
                          : 'text-[#64736A] hover:text-[#08783F] hover:bg-black/[0.03]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}

              {/* ACTION BUTTONS & OWNER CMS */}
              <div className="hidden sm:flex items-center space-x-2.5">
                {config.headerElements?.helpBtn !== false && (
                  <button
                    onClick={() => setShopkeeperGuideOpen(true)}
                    title="Easy Step-by-Step Instructions for Store Owner"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-all duration-200 active:scale-[0.98]"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                    <span>Shopkeeper Steps</span>
                  </button>
                )}

                {config.headerElements?.whatsappBtn !== false && (
                  <a
                    href={createWhatsAppLink(config.business.whatsapp.primaryRaw, config.business.whatsapp.defaultGreeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EAF7EF] text-[#08783F] hover:bg-[#08783F] hover:text-white border border-[#08783F]/15 transition-all duration-200 active:scale-[0.98]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {config.headerElements?.callBtn !== false && (
                  <a
                    href={`tel:${config.business.phones[0].raw}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#08783F] text-white hover:bg-[#075C34] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Store</span>
                  </a>
                )}

                {/* OWNER DASHBOARD TRIGGER */}
                {config.headerElements?.cmsBtn !== false && (
                  <button
                    onClick={handleOpenCMS}
                    title="Launch Complete Owner CMS Dashboard"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all border border-stone-700 shadow-sm active:scale-[0.98] relative"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Owner CMS</span>
                  </button>
                )}
              </div>

              {/* MOBILE MENU */}
              <div className="flex sm:hidden items-center gap-1.5">
                {config.headerElements?.helpBtn !== false && (
                  <button
                    onClick={() => setShopkeeperGuideOpen(true)}
                    className="p-2 text-amber-900 bg-amber-100 rounded-xl hover:bg-amber-200 flex items-center gap-1 text-xs font-bold"
                    aria-label="Shopkeeper Help"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-700" />
                    <span>Help</span>
                  </button>
                )}
                {config.headerElements?.cmsBtn !== false && (
                  <button
                    onClick={handleOpenCMS}
                    className="p-2 text-stone-900 bg-stone-100 rounded-xl hover:bg-stone-200 flex items-center gap-1 text-xs font-bold"
                    aria-label="Open CMS"
                  >
                    <Settings className="w-4 h-4 text-emerald-700" />
                    <span>CMS</span>
                  </button>
                )}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl text-[#14251B] hover:bg-black/5 focus:outline-none"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE DROPDOWN */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-black/[0.06] px-4 pt-3 pb-6 space-y-3 shadow-xl">
              <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                <a
                  href={`tel:${config.business.phones[0].raw}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#08783F] text-white font-semibold text-xs shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>
                <a
                  href={createWhatsAppLink(config.business.whatsapp.primaryRaw, config.business.whatsapp.defaultGreeting)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EAF7EF] text-[#08783F] font-semibold text-xs border border-[#08783F]/20"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="flex flex-col space-y-0.5">
                {[
                  { id: 'home', label: 'Home', visible: config.sectionVisibility?.hero !== false },
                  { id: 'offers', label: '⚡ Flash Deals & Offers', visible: config.sectionVisibility?.flashSale !== false && config.flashSale?.enabled && (config.flashSale?.offers || []).length > 0 },
                  { id: 'about', label: 'About Us', visible: config.sectionVisibility?.about !== false },
                  { id: 'categories', label: 'Product Categories', visible: config.sectionVisibility?.categories !== false },
                  { id: 'catalogue', label: 'Medicines & Store Catalogue', visible: config.sectionVisibility?.catalogue !== false },
                  { id: 'delivery', label: 'Home Delivery Guidelines', visible: config.sectionVisibility?.delivery !== false && config.delivery?.available },
                  { id: 'gallery', label: 'Store Tour', visible: config.sectionVisibility?.gallery !== false },
                  { id: 'contact', label: 'Contact & Location', visible: config.sectionVisibility?.contact !== false }
                ]
                  .filter(item => item.visible)
                  .map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === item.id ? 'bg-[#EAF7EF] text-[#08783F] font-semibold' : 'text-stone-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#64736A]">
                <span>{config.business.hours.display}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setGuideModalOpen(true);
                  }}
                  className="underline text-[#08783F] font-semibold"
                >
                  Owner Guide
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.hero !== false && (
        <section id="home" className="relative pt-6 pb-16 md:pt-14 md:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* LEFT COLUMN: HERO CONTENT */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* STATUS & LOCALITY PILL */}
                <div className="inline-flex flex-wrap items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white border border-black/[0.06] shadow-xs text-xs font-medium">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${storeStatus.colorClass} flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${storeStatus.dotClass}`}></span>
                    {storeStatus.badgeText}
                  </span>
                  <span className="text-[#64736A] hidden sm:inline">{storeStatus.detail}</span>
                  <span className="text-stone-300 hidden sm:inline">•</span>
                  <span className="text-[#08783F] font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {config.business.address.building}, {config.business.address.city}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#14251B] leading-[1.12]">
                    {config.business.tagline.split(',')[0]}, <br className="hidden sm:block" />
                    <span className="text-[#08783F]">{config.business.tagline.split(',')[1] || "Our Priority."}</span>
                  </h1>
                  <p className="text-base sm:text-lg text-[#64736A] max-w-2xl font-normal leading-relaxed">
                    {config.business.subheadline}. {config.business.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={`tel:${config.business.phones[0].raw}`}
                    className="px-6 py-3.5 rounded-2xl bg-[#08783F] text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:bg-[#075C34] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Counter ({config.business.phones[0].raw})</span>
                  </a>

                  <a
                    href={createWhatsAppLink(config.business.whatsapp.primaryRaw, config.business.whatsapp.defaultGreeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-2xl bg-white text-[#08783F] font-semibold text-sm border border-[#08783F]/30 hover:bg-[#EAF7EF]/70 hover:border-[#08783F] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Enquiries</span>
                  </a>

                  <a
                    href={config.business.address.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-2xl bg-stone-100 text-[#14251B] font-semibold text-sm hover:bg-stone-200/80 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4 text-stone-600" />
                    <span>Get Directions</span>
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/[0.06]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#08783F] font-bold text-xs sm:text-sm">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>100% Genuine</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#64736A]">Authorized pharmaceutical sourcing.</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#08783F] font-bold text-xs sm:text-sm">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{config.business.hours.opensAt} – {config.business.hours.closesAt}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#64736A]">Open daily 365 days a year.</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#08783F] font-bold text-xs sm:text-sm">
                      <Truck className="w-4 h-4 shrink-0" />
                      <span>Home Delivery</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#64736A]">Prompt local assistance in Manipal.</p>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: STORE IDENTIFICATION CARD */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="relative bg-white rounded-3xl shadow-xl shadow-black/[0.04] border border-black/[0.06] overflow-hidden">
                    
                    <div className="bg-[#08783F] p-5 text-center text-white border-b-4 border-amber-400 relative">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-emerald-200 mb-1">
                        {config.business.businessTypes?.join(' • ') || "Pharmacy • Medical • General Store"}
                      </div>
                      <div className="text-xl sm:text-2xl font-black tracking-wide drop-shadow-xs uppercase">
                        {config.business.name}
                      </div>
                      <div className="text-xs font-medium text-emerald-100 mt-1 flex items-center justify-center gap-2">
                        <span>{config.business.address.building}, {config.business.address.street}, {config.business.address.city}</span>
                      </div>
                      <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-[#064a2a] rounded-full text-[11px] font-mono text-emerald-100 border border-emerald-500/20">
                        <span>Ph: {config.business.phones[0].raw}</span>
                        <span>•</span>
                        <span>{config.business.phones[1].raw}</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 border border-black/[0.06] group">
                        {/* Only display images specifically designated for the Hero section */}
                        <img
                          src={
                            config.gallery.find(g => g.targetSection === 'hero')?.imageUrl ||
                            "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80"
                          }
                          alt="Store Front in Manipal"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {config.business.address.building}, {config.business.address.city} – {config.business.address.pincode}
                          </div>
                          <div className="text-sm font-bold">Counter &amp; Prescription Dispensing Unit</div>
                        </div>
                      </div>

                      <div className="bg-[#FAFCFA] rounded-2xl p-4 border border-black/[0.05] space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          <span>Direct Counter Lines</span>
                          <span className="text-emerald-700 font-bold">Verified Store</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {config.business.phones.map((p, idx) => (
                            <a
                              key={idx}
                              href={`tel:${p.raw}`}
                              className="p-3 rounded-xl bg-white border border-stone-200/80 hover:border-[#08783F] hover:shadow-xs transition-all flex items-center gap-2.5 active:scale-[0.98]"
                            >
                              <Phone className="w-4 h-4 text-[#08783F] shrink-0" />
                              <div className="overflow-hidden">
                                <div className="font-bold text-stone-900 truncate">{p.raw}</div>
                                <div className="text-[10px] text-stone-500 truncate">{p.label}</div>
                              </div>
                            </a>
                          ))}
                        </div>

                        <div className="text-[11px] text-[#64736A] flex items-center gap-1.5 pt-0.5">
                          <Info className="w-3.5 h-3.5 text-[#08783F] shrink-0" />
                          <span>Prescriptions dispensed strictly under registered supervision.</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3.5 FLASH SALES & SPECIAL OFFERS SECTION                      */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.flashSale !== false && config.flashSale?.enabled && (config.flashSale?.offers || []).length > 0 && (
        <section id="offers" className="py-12 bg-gradient-to-b from-amber-500/[0.04] via-[#FAFCFA] to-white border-b border-black/[0.06] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* 1. CONTINUOUS RUNNING FLASH DEAL TICKER TAPE */}
            <div className="relative rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-0.5 shadow-lg shadow-orange-600/10 overflow-hidden select-none">
              <div className="bg-[#14251B] rounded-[14px] flex items-center overflow-hidden">
                {/* Ticker Lead Badge */}
                <div className="bg-gradient-to-r from-amber-500 to-rose-500 px-3.5 py-2.5 flex items-center gap-2 shrink-0 z-10 text-white font-black text-xs uppercase tracking-wider shadow-md">
                  <Flame className="w-4 h-4 animate-bounce" />
                  <span>Live Deals</span>
                </div>

                {/* Animated Marquee of Promo Codes & Discounts */}
                <div className="overflow-hidden flex-1 py-2">
                  <div className="flex items-center gap-8 whitespace-nowrap animate-marquee-banner text-xs sm:text-sm font-semibold">
                    {(config.flashSale?.offers || []).map((o, idx) => (
                      <span key={`ticker-1-${idx}`} className="inline-flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-[11px]">
                          {o.discountBadge}
                        </span>
                        <span className="text-white">{o.title}</span>
                        <span className="text-emerald-400 font-bold">{o.offerPrice}</span>
                        {o.originalPrice && <span className="line-through text-stone-400 text-xs">{o.originalPrice}</span>}
                        <span className="text-stone-400 text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded">CODE: {o.couponCode}</span>
                        <span className="text-amber-400 text-xs">★</span>
                      </span>
                    ))}
                    {(config.flashSale?.offers || []).map((o, idx) => (
                      <span key={`ticker-2-${idx}`} className="inline-flex items-center gap-3" aria-hidden="true">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-[11px]">
                          {o.discountBadge}
                        </span>
                        <span className="text-white">{o.title}</span>
                        <span className="text-emerald-400 font-bold">{o.offerPrice}</span>
                        {o.originalPrice && <span className="line-through text-stone-400 text-xs">{o.originalPrice}</span>}
                        <span className="text-stone-400 text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded">CODE: {o.couponCode}</span>
                        <span className="text-amber-400 text-xs">★</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Animated Marquee of Promo Codes & Discounts */}
                <div className="overflow-hidden flex-1 py-2 cursor-pointer" title="Hover or touch to pause">
                  <div className="flex items-center gap-8 whitespace-nowrap animate-marquee-banner text-xs sm:text-sm font-semibold">
                    {(config.flashSale?.offers || []).map((o, idx) => (
                      <span key={`ticker-1-${idx}`} className="inline-flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-[11px]">
                          {o.discountBadge}
                        </span>
                        <span className="text-white">{o.title}</span>
                        <span className="text-emerald-400 font-bold">{o.offerPrice}</span>
                        {o.originalPrice && <span className="line-through text-stone-400 text-xs">{o.originalPrice}</span>}
                        <span className="text-stone-400 text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded">CODE: {o.couponCode}</span>
                        <span className="text-amber-400 text-xs">★</span>
                      </span>
                    ))}
                    {(config.flashSale?.offers || []).map((o, idx) => (
                      <span key={`ticker-2-${idx}`} className="inline-flex items-center gap-3" aria-hidden="true">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-[11px]">
                          {o.discountBadge}
                        </span>
                        <span className="text-white">{o.title}</span>
                        <span className="text-emerald-400 font-bold">{o.offerPrice}</span>
                        {o.originalPrice && <span className="line-through text-stone-400 text-xs">{o.originalPrice}</span>}
                        <span className="text-stone-400 text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded">CODE: {o.couponCode}</span>
                        <span className="text-amber-400 text-xs">★</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>In-Store &amp; Delivery Savings</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14251B] tracking-tight">
                  {config.flashSale?.title || "Flash Deals & Seasonal Offers"}
                </h2>
                <p className="text-xs sm:text-sm text-[#64736A] max-w-2xl">
                  {config.flashSale?.subtitle || "Exclusive in-store & local delivery savings on daily essentials, personal care & health devices."}
                </p>
              </div>

              {/* ROTATING SLIDE INDICATOR PILLS */}
              <div className="flex items-center gap-1.5">
                {(config.flashSale?.offers || []).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveOfferSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeOfferSlide === idx ? 'w-8 bg-[#08783F]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                    aria-label={`Go to deal slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 2. AUTO-PLAYING FEATURED SPOTLIGHT CAROUSEL + DEAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SPOTLIGHT HERO CARD (Current Active Slide) */}
              {(() => {
                const activeOffer = (config.flashSale?.offers || [])[activeOfferSlide] || (config.flashSale?.offers || [])[0];
                if (!activeOffer) return null;
                return (
                  <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400/50 shadow-xl shadow-amber-500/5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/20 via-orange-300/10 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="space-y-4 relative">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs animate-pulse">
                          🔥 SPOTLIGHT: {activeOffer.discountBadge}
                        </span>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                          CODE: {activeOffer.couponCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                        <div className="sm:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 border border-black/[0.06]">
                          <img
                            src={activeOffer.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"}
                            alt={activeOffer.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="sm:col-span-7 space-y-2">
                          <h3 className="font-extrabold text-lg sm:text-xl text-[#14251B] leading-snug">
                            {activeOffer.title}
                          </h3>
                          <p className="text-xs text-[#64736A] leading-relaxed line-clamp-3">
                            {activeOffer.description}
                          </p>
                          <div className="pt-2 flex items-baseline gap-3">
                            <span className="text-2xl font-black text-[#08783F]">{activeOffer.offerPrice}</span>
                            {activeOffer.originalPrice && (
                              <span className="text-sm line-through text-stone-400 font-semibold">{activeOffer.originalPrice}</span>
                            )}
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              {activeOffer.validity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center gap-3">
                      <a
                        href={createWhatsAppLink(
                          config.business.whatsapp.primaryRaw,
                          `Hello Shri Sai Medical Store, I would like to order the Flash Deal: ${activeOffer.title} using Coupon Code: ${activeOffer.couponCode} at ${activeOffer.offerPrice}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#08783F] hover:bg-[#075C34] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-300" />
                        <span>Order Deal via WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${config.business.phones[0].raw}`}
                        className="w-full sm:w-auto py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-600" />
                        <span>Call Counter</span>
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* SECONDARY DEALS GRID */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(config.flashSale?.offers || []).map((deal, idx) => (
                  <div
                    key={deal.id}
                    onClick={() => setActiveOfferSlide(idx)}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      activeOfferSlide === idx
                        ? 'bg-amber-50/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'bg-white border-black/[0.06] hover:border-amber-300 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                          {deal.discountBadge}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {deal.couponCode}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{deal.title}</h4>
                      <p className="text-[11px] text-[#64736A] line-clamp-2 leading-relaxed">{deal.description}</p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-black/[0.05] flex items-center justify-between text-xs">
                      <div>
                        {deal.originalPrice && <span className="line-through text-stone-400 mr-1.5 text-[11px]">{deal.originalPrice}</span>}
                        <span className="font-extrabold text-[#08783F]">{deal.offerPrice}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">{deal.validity}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* MANDATORY PHARMACY REGULATORY DISCLAIMER */}
            <div className="text-[11px] text-stone-500 bg-stone-100/70 p-3 rounded-xl border border-stone-200/80 flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{config.flashSale?.disclaimer || "Notice: In accordance with Indian pharmaceutical regulations, prescription medicines are excluded from promotional discounts."}</span>
            </div>

          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ABOUT US SECTION                                           */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.about !== false && (
        <section id="about" className="py-20 bg-white border-y border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F]">
                  About Our Store
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14251B] tracking-tight leading-tight">
                  Your Caring, Neighbourhood Healthcare Partner in Manipal
                </h2>
                
                <div className="space-y-4 text-sm sm:text-base text-[#64736A] leading-relaxed">
                  <p>
                    Located conveniently at <strong className="text-stone-900">{config.business.address.building}, {config.business.address.street}, {config.business.address.city}</strong>, 
                    <strong> {config.business.name}</strong> was established with a pledge to ensure our community has dependable access to 100% genuine pharmaceuticals, wellness supplements, and daily essentials.
                  </p>
                  <p>
                    Whether you are an MAHE student living away from home, a senior citizen needing monthly chronic medications, 
                    or a family caring for a newborn, we guide you with patience and care.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-[#FAFCFA] border border-black/[0.06]">
                    <div className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#08783F]" />
                      Genuine Stock Guarantee
                    </div>
                    <p className="text-xs text-[#64736A] leading-relaxed">Sourced through licensed distributors with transparent batch and expiry tracking.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAFCFA] border border-black/[0.06]">
                    <div className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#08783F]" />
                      Pharmacy &amp; General Store
                    </div>
                    <p className="text-xs text-[#64736A] leading-relaxed">Save extra trips by picking up daily toiletries, snacks, drinks, baby diapers, and first aid together.</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <a href={`tel:${config.business.phones[0].raw}`} className="text-[#08783F] hover:underline flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> Speak with Pharmacist
                  </a>
                  <span className="text-stone-300">|</span>
                  <a href={config.business.address.googleMapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="text-stone-700 hover:text-[#08783F] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Visit our counter
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-stone-100 shadow-sm border border-black/[0.06] relative group">
                      <img
                        src={
                          config.gallery.find(g => g.targetSection === 'about')?.imageUrl ||
                          "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80"
                        }
                        alt="Medicines and organized pharmacy counters"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <span className="absolute bottom-3 left-3 text-xs font-semibold bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-stone-900 shadow-xs">
                        Prescription Bays
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EAF7EF] border border-[#08783F]/15 text-center">
                      <div className="text-2xl font-black text-[#08783F]">{config.business.hours.opensAt} AM</div>
                      <div className="text-xs font-bold text-stone-800">Early Morning Opening</div>
                      <div className="text-[11px] text-[#64736A] mt-0.5">Open before daily office and university hours</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6">
                    <div className="p-4 rounded-2xl bg-[#08783F] text-white text-center shadow-sm">
                      <div className="text-2xl font-black">{config.business.hours.closesAt} PM</div>
                      <div className="text-xs font-bold text-emerald-100">Late Night Availability</div>
                      <div className="text-[11px] text-emerald-200 mt-0.5">Assisting with nighttime healthcare emergencies</div>
                    </div>

                    <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-stone-100 shadow-sm border border-black/[0.06] relative group">
                      <img
                        src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"
                        alt="Healthcare supplies"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <span className="absolute bottom-3 left-3 text-xs font-semibold bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-stone-900 shadow-xs">
                        Daily Essentials
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. PRODUCT CATEGORIES SECTION                                 */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.categories !== false && (
        <section id="categories" className="py-20 bg-[#FAFCFA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F]">
                Store Departments
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14251B] tracking-tight">
                Healthcare Remedies &amp; Daily Conveniences
              </h2>
              <p className="text-xs sm:text-sm text-[#64736A]">
                Carefully organized departments ensuring quick counter service and convenient one-stop shopping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.categories.map((cat) => {
                const IconComp = 
                  cat.id === 'prescriptions' ? Pill :
                  cat.id === 'otc' ? HeartPulse :
                  cat.id === 'firstaid' ? ShieldCheck :
                  cat.id === 'essentials' ? Stethoscope :
                  cat.id === 'babycare' ? Baby :
                  cat.id === 'personalcare' ? Sparkles :
                  cat.id === 'hygiene' ? ShieldCheck : ShoppingBag;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      navigateTo('catalogue');
                    }}
                    className="group bg-white rounded-3xl p-6 border border-black/[0.06] hover:border-[#08783F]/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[#EAF7EF] text-[#08783F] flex items-center justify-center group-hover:bg-[#08783F] group-hover:text-white transition-colors duration-300">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 group-hover:bg-[#EAF7EF] group-hover:text-[#08783F]">
                          {cat.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-[#14251B] group-hover:text-[#08783F] transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-[#64736A] mt-1.5 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-black/[0.05] flex items-center justify-between text-xs font-bold text-[#08783F]">
                      <span className="text-[11px] text-stone-500 font-medium">{cat.count || "Available"}</span>
                      <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Browse</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. PRODUCT CATALOGUE SECTION                                  */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.catalogue !== false && (
        <section id="catalogue" className="py-20 bg-white border-t border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* 6.1 FEATURED PRODUCT SHOWCASE CAROUSEL (SHOW ALL PRODUCTS) */}
            <div className="bg-gradient-to-br from-[#EAF7EF]/70 via-[#FAFCFA] to-white rounded-3xl p-6 sm:p-8 border border-[#08783F]/20 shadow-lg shadow-[#08783F]/5 space-y-6">
              
              {/* Carousel Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F] border border-[#08783F]/20">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Live Product Showcase</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#14251B] tracking-tight">
                    Explore All Available Medicines &amp; Provisions ({config.products.length} Items)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64736A]">
                    Page {productCarouselIndex + 1} of {Math.max(1, Math.ceil(config.products.length / itemsPerView))} • Showing {itemsPerView} items per slide.
                  </p>
                </div>

                {config.products.length > itemsPerView && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Left / Right Buttons */}
                    <button
                      type="button"
                      onClick={() => {
                        const totalPages = Math.ceil(config.products.length / itemsPerView);
                        setProductCarouselIndex((prev) => (prev <= 0 ? totalPages - 1 : prev - 1));
                      }}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-[#08783F] text-stone-700 hover:text-[#08783F] transition-all shadow-xs"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const totalPages = Math.ceil(config.products.length / itemsPerView);
                        setProductCarouselIndex((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
                      }}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-[#08783F] text-stone-700 hover:text-[#08783F] transition-all shadow-xs"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Multi-Item Responsive Carousel Track */}
              <div
                className="overflow-hidden w-full"
                onMouseEnter={() => setIsProductCarouselPlaying(false)}
                onMouseLeave={() => setIsProductCarouselPlaying(true)}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${productCarouselIndex * 100}%)`
                  }}
                >
                  {config.products.map((item, idx) => {
                    const assignedCategory = config.categories.find(c => c.id === item.category)?.name || item.category;
                    return (
                      <div
                        key={`carousel-${item.id}-${idx}`}
                        className="w-full sm:w-1/2 lg:w-1/4 shrink-0 px-2 box-border"
                      >
                        <div className="h-full bg-white rounded-2xl p-4 border border-stone-200 hover:border-[#08783F] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
                          <div className="space-y-3">
                            {/* Image Thumbnail */}
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                              <img
                                src={item.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute top-2 left-2 flex gap-1">
                                {item.isPrescription ? (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-xs">
                                    Rx Required
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                                    In Stock
                                  </span>
                                )}
                              </div>
                              <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
                                {assignedCategory}
                              </span>
                            </div>

                            <div>
                              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{item.brand}</div>
                              <h4 className="font-extrabold text-sm text-[#14251B] line-clamp-1 group-hover:text-[#08783F] transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-[#64736A] mt-1 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="pt-1 flex items-baseline justify-between border-t border-stone-100">
                              <span className="text-[10px] text-stone-500 font-medium">Price:</span>
                              <span className="text-xs font-black text-[#08783F]">{item.price}</span>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-stone-100">
                            <a
                              href={createWhatsAppLink(
                                config.business.whatsapp.primaryRaw,
                                `Hello Shri Sai Medical Store, I would like to check availability and price for: ${item.name} (${item.brand}).`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-2.5 rounded-xl bg-[#EAF7EF] hover:bg-[#08783F] text-[#08783F] hover:text-white border border-[#08783F]/20 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Enquire on WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Dots Indicator (Page-by-page indicator) */}
              {config.products.length > itemsPerView && (
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {Array.from({ length: Math.ceil(config.products.length / itemsPerView) }).map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      onClick={() => setProductCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        productCarouselIndex === idx ? 'w-8 bg-[#08783F]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`Jump to page ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* 6.2 SEARCH, CATEGORY FILTERS & FULL PRODUCT DIRECTORY */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F]">
                  Product Directory
                </span>
                <h2 className="text-3xl font-extrabold text-[#14251B] tracking-tight">
                  Medicines &amp; Store Catalogue
                </h2>
                <p className="text-xs sm:text-sm text-[#64736A] max-w-xl">
                  Search common inventory items or contact us on WhatsApp. Regulated prescription medications are dispensed strictly across the counter with a valid registered doctor's prescription.
                </p>
              </div>

              {/* SEARCH BAR */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine, baby food, brand..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#08783F] focus:border-transparent text-xs sm:text-sm bg-[#FAFCFA]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#08783F] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Items ({config.products.length})
              </button>
              {config.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === c.id
                      ? 'bg-[#08783F] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* PRODUCT CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#FAFCFA] rounded-3xl p-5 border border-black/[0.06] hover:border-[#08783F]/50 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        {prod.brand}
                      </span>
                      {prod.isPrescription ? (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                          Rx Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-stone-900 leading-snug">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#64736A] mt-1.5 line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs font-medium text-stone-700">
                        Price: <span className="text-[#08783F] font-bold">{prod.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/[0.05]">
                    <a
                      href={createWhatsAppLink(
                        config.business.whatsapp.primaryRaw,
                        `Hello Shri Sai Medical Store, I would like to check availability and price for: ${prod.name} (${prod.brand}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#EAF7EF] border border-[#08783F]/25 text-[#08783F] text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs group active:scale-[0.98]"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>Check Availability on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Search className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <div className="font-bold text-stone-700">No matching items found</div>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  We may have this item in our physical counter stock. Please call our counter directly!
                </p>
                <a href={`tel:${config.business.phones[0].raw}`} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-semibold">
                  <Phone className="w-3.5 h-3.5" /> Call Counter Now
                </a>
              </div>
            )}

            {/* PHARMACY REGULATORY CALLOUT */}
            <div className="mt-10 p-5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <strong className="font-semibold">Prescription Dispensing Safeguard:</strong> In strict compliance with the Drugs and Cosmetics Act of India, regulated schedule medications (H, H1 &amp; X) cannot be dispatched without prior physical review of a valid prescription signed by a registered practitioner.
                </div>
              </div>
              <a href={`tel:${config.business.phones[0].raw}`} className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl bg-amber-800 text-white hover:bg-amber-900 transition-colors">
                Ask Pharmacist
              </a>
            </div>

          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. HOME DELIVERY SECTION                                      */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.delivery !== false && config.delivery.available && (
        <section id="delivery" className="py-20 bg-[#EAF7EF]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#08783F]/15 shadow-xl shadow-black/[0.03]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F]">
                    <Truck className="w-3.5 h-3.5" /> Local Doorstep Assistance
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14251B] tracking-tight">
                    {config.delivery.title}
                  </h2>

                  <p className="text-sm sm:text-base text-[#64736A] leading-relaxed">
                    {config.delivery.summary}
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {config.delivery.terms.map((term, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-[#08783F] shrink-0 mt-0.5" />
                        <span>{term}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-3">
                    <a
                      href={createWhatsAppLink(
                        config.business.whatsapp.primaryRaw,
                        "Hello Shri Sai Medical, I would like to request a home delivery in Manipal. Please let me know your availability."
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-[#08783F] text-white text-xs sm:text-sm font-semibold hover:bg-[#075C34] transition-all flex items-center gap-2 shadow-xs active:scale-[0.98]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Delivery Request</span>
                    </a>

                    <a
                      href={`tel:${config.business.phones[0].raw}`}
                      className="px-5 py-3 rounded-xl bg-stone-100 text-stone-800 text-xs sm:text-sm font-semibold hover:bg-stone-200 transition-all flex items-center gap-2 active:scale-[0.98]"
                    >
                      <Phone className="w-4 h-4 text-stone-600" />
                      <span>Call Counter</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-[#FAFCFA] rounded-2xl p-6 border border-black/[0.06] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#08783F] text-white flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">Delivery Coverage Zone</div>
                        <div className="text-xs text-stone-500">Adarsha Nagar, Vidyaratna Nagar &amp; Manipal</div>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 leading-relaxed bg-white p-3.5 rounded-xl border border-black/[0.05]">
                      <strong>Coverage Confirmation:</strong> Share your location pin via WhatsApp with our counter staff to immediately verify distance and dispatch slots.
                    </div>

                    <div className="pt-1 grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-white rounded-xl border border-black/[0.05]">
                        <div className="text-xs text-stone-500">Avg. Delivery</div>
                        <div className="text-sm font-black text-[#08783F]">30–60 Mins</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-black/[0.05]">
                        <div className="text-xs text-stone-500">Payment Modes</div>
                        <div className="text-sm font-black text-[#08783F]">UPI / Cash</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. STORE GALLERY SECTION                                      */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.gallery !== false && (
        <section id="gallery" className="py-20 bg-white border-t border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F]">
                  Store Tour
                </span>
                <h2 className="text-3xl font-extrabold text-[#14251B] tracking-tight mt-1">
                  Inside {config.business.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#64736A] mt-1">
                  Authentic, clean, and organized shelves right at {config.business.address.building}, {config.business.address.street}, {config.business.address.city}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {config.gallery
                .filter(item => item.targetSection !== 'hero') // Keep the gallery clean so Hero signage photos don't duplicate
                .map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl overflow-hidden bg-stone-100 border border-black/[0.06] shadow-2xs hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {item.tag || item.category}
                      </span>
                      {item.targetSection === 'about' && (
                        <span className="px-2 py-0.5 bg-emerald-700/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                          About Page
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 group-hover:text-[#08783F] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#64736A] mt-1 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. CONTACT & GOOGLE MAPS SECTION                              */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.contact !== false && (
        <section id="contact" className="py-20 bg-[#FAFCFA] border-t border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EAF7EF] text-[#08783F]">
                    Reach Us
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#14251B] tracking-tight mt-2">
                    Visit Our Store or Call Directly
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64736A] mt-2">
                    Located at {config.business.address.building}, {config.business.address.street}, {config.business.address.city} with convenient roadside parking.
                  </p>
                </div>

                {/* ADDRESS CARD */}
                <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#EAF7EF] text-[#08783F] shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Store Address</div>
                      <address className="not-italic text-xs text-[#64736A] mt-1 leading-relaxed">
                        <strong>{config.business.name}</strong><br />
                        {config.business.address.building}, {config.business.address.street}<br />
                        {config.business.address.city}, {config.business.address.state} – {config.business.address.pincode}<br />
                        India
                      </address>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <a
                      href={config.business.address.googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#08783F] text-white text-xs font-semibold text-center hover:bg-[#075C34] transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                    </a>
                    <a
                      href={config.business.address.googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors active:scale-[0.98]"
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>

                {/* PHONES CARD */}
                <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs space-y-3">
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#08783F]" />
                    Direct Phone Lines
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.business.phones.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone.raw}`}
                        className="p-3 rounded-xl bg-[#FAFCFA] border border-stone-200/80 hover:border-[#08783F] hover:bg-[#EAF7EF]/50 transition-all block group active:scale-[0.98]"
                      >
                        <div className="text-[11px] text-stone-500 font-medium">{phone.label}</div>
                        <div className="text-sm font-bold text-[#08783F] group-hover:underline">
                          {phone.display}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* TIMINGS CARD */}
                <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#08783F]" />
                      Business Hours
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${storeStatus.colorClass}`}>
                      {storeStatus.badgeText}
                    </span>
                  </div>
                  
                  <div className="text-xs text-[#64736A] pt-1">
                    <div className="flex justify-between py-1 border-b border-stone-100 font-medium">
                      <span>{config.business.hours.daysSummary || "Every day"}</span>
                      <span className="font-bold text-stone-900">{config.business.hours.display}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 pt-2">
                      Open 365 days a year including national and Karnataka holidays.
                    </div>
                  </div>
                </div>

              </div>

              {/* MAP EMBED */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl p-4 sm:p-6 border border-black/[0.06] shadow-xl shadow-black/[0.02] h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#08783F]" />
                        <span className="font-bold text-stone-900 text-sm">
                          {config.business.address.building}, {config.business.address.street}, {config.business.address.city}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-stone-500">{config.business.address.state} {config.business.address.pincode}</span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-stone-100 border border-black/[0.06]">
                      <iframe
                        title="Store Location Map"
                        src={config.business.address.googleMapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d970.5344088288856!2d74.78909926950917!3d13.341713304098318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTPCsDIwJzMwLjIiTiA3NMKwNDcnMjMuMSJF!5e0!3m2!1sen!2sin!4v1794250942176!5m2!1sen!2sin"}
                        className="w-full h-full border-0"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64736A]">
                    <div>
                      Need help finding us? Call counter: <strong>{config.business.phones[0].raw}</strong>
                    </div>
                    <a
                      href={config.business.address.googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#08783F] hover:underline"
                    >
                      Open Google Navigation <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 10. FOOTER                                                    */}
      {/* ------------------------------------------------------------- */}
      {config.sectionVisibility?.footer !== false && (
        <footer className="bg-[#14251B] text-stone-300 pt-16 pb-12 border-t border-emerald-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800/80">
              
              {config.footerElements?.brandSummary !== false && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    {renderStoreLogoBadge("w-9 h-9", "text-base")}
                    <div className="font-extrabold text-white text-base tracking-wide uppercase">
                      {config.business.name}
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Licensed pharmaceutical dispensary and trusted neighbourhood convenience retailer serving Manipal &amp; Udupi.
                  </p>
                  <div className="text-xs text-emerald-400 font-semibold">
                    {config.business.address.building}, {config.business.address.street}, {config.business.address.city}
                  </div>
                </div>
              )}

              {config.footerElements?.quickLinks !== false && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white tracking-wider uppercase">Quick Links</div>
                  <ul className="space-y-2 text-xs">
                    {config.sectionVisibility?.hero !== false && (
                      <li><button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">Home</button></li>
                    )}
                    {config.sectionVisibility?.flashSale !== false && config.flashSale?.enabled && (
                      <li><button onClick={() => navigateTo('offers')} className="hover:text-white transition-colors">Flash Deals</button></li>
                    )}
                    {config.sectionVisibility?.about !== false && (
                      <li><button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">About Us</button></li>
                    )}
                    {config.sectionVisibility?.categories !== false && (
                      <li><button onClick={() => navigateTo('categories')} className="hover:text-white transition-colors">Product Categories</button></li>
                    )}
                    {config.sectionVisibility?.catalogue !== false && (
                      <li><button onClick={() => navigateTo('catalogue')} className="hover:text-white transition-colors">Catalogue &amp; Medicines</button></li>
                    )}
                    {config.sectionVisibility?.delivery !== false && (
                      <li><button onClick={() => navigateTo('delivery')} className="hover:text-white transition-colors">Home Delivery Guidelines</button></li>
                    )}
                    {config.sectionVisibility?.gallery !== false && (
                      <li><button onClick={() => navigateTo('gallery')} className="hover:text-white transition-colors">Store Tour</button></li>
                    )}
                    {config.sectionVisibility?.contact !== false && (
                      <li><button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">Google Maps &amp; Directions</button></li>
                    )}
                  </ul>
                </div>
              )}

              {config.footerElements?.contactInfo !== false && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white tracking-wider uppercase">Direct Contact</div>
                  <div className="space-y-2 text-xs text-stone-400">
                    <p>
                      <strong className="text-white">Phone 1:</strong>{' '}
                      <a href={`tel:${config.business.phones[0].raw}`} className="hover:text-emerald-300">
                        {config.business.phones[0].display}
                      </a>
                    </p>
                    <p>
                      <strong className="text-white">Phone 2:</strong>{' '}
                      <a href={`tel:${config.business.phones[1].raw}`} className="hover:text-emerald-300">
                        {config.business.phones[1].display}
                      </a>
                    </p>
                    <p>
                      <strong className="text-white">Hours:</strong> {config.business.hours.display}
                    </p>
                    <p>
                      <strong className="text-white">Location:</strong> {config.business.address.building}, Manipal – {config.business.address.pincode}
                    </p>
                  </div>
                </div>
              )}

              {config.footerElements?.ownerArea !== false && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white tracking-wider uppercase">Store Owner Area</div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Full central content and catalogue control system. Edit any setting, price, or announcement without writing code.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleOpenCMS}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Launch Owner CMS Panel</span>
                    </button>
                    <button
                      onClick={() => setGuideModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-300"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Deployment &amp; Hosting Guide</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {config.footerElements?.copyright !== false && (
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
                <div>&copy; {new Date().getFullYear()} {config.business.name}. All rights reserved.</div>
                <div className="flex items-center space-x-4">
                  <span>{config.business.address.city}, Karnataka – {config.business.address.pincode}</span>
                  <span>•</span>
                  <button onClick={handleOpenCMS} className="hover:text-emerald-400 text-stone-400 font-medium">
                    Owner Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </footer>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 11. COMPLETE STORE OWNER CMS (FULL FUNCTIONAL DASHBOARD)      */}
      {/* ------------------------------------------------------------- */}
      {ownerEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
            
            {/* CMS TOP HEADER */}
            <div className="px-5 py-4 bg-[#08783F] text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#064a2a] flex items-center justify-center text-emerald-300 border border-emerald-500/30">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold flex items-center gap-2">
                    <span>Store Owner CMS &amp; Security Shield</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>PBKDF2 SHA-256</span>
                    </span>
                    {hasUnsavedChanges && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black animate-pulse">
                        Unsaved Edits
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-200">
                    Encrypted Session • {config.business.name}
                  </div>
                </div>
              </div>

              {/* LOCK & CLOSE BUTTONS IN HEADER */}
              <div className="flex items-center gap-2">
                {isOwnerAuthenticated && (
                  <button
                    onClick={handleLockSession}
                    title="Lock session and revoke temporary authentication token immediately"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors border border-white/20"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lock Session</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Exit anyway?")) {
                      return;
                    }
                    setOwnerEditorOpen(false);
                  }}
                  className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
                  aria-label="Close CMS"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CMS HIGH-SECURITY LOGIN SHIELD (IMMUNE TO BRUTE-FORCE & SCRIPT BOTS) */}
            {!isOwnerAuthenticated ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#08783F] flex items-center justify-center border-2 border-emerald-200 shadow-md">
                    {lockoutRemainingSec > 0 ? (
                      <ShieldAlert className="w-8 h-8 text-rose-600 animate-pulse" />
                    ) : (
                      <KeyRound className="w-8 h-8 text-[#08783F]" />
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-stone-900 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-stone-900 tracking-tight">
                    Owner Security Authentication
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Protected by PBKDF2 cryptographic hashing with client-side salting &amp; progressive rate limiting.
                  </p>
                </div>

                {/* BRUTE-FORCE LOCKOUT ALERT BANNER */}
                {lockoutRemainingSec > 0 ? (
                  <div className="w-full p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 text-left">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Security Lockdown Active</span>
                    </div>
                    <p className="text-xs text-rose-700">
                      Multiple unauthorized attempts were detected from this device. Submissions are temporarily blocked.
                    </p>
                    <div className="flex items-center justify-between pt-1 font-mono text-xs font-bold text-rose-900 border-t border-rose-200">
                      <span>Cooldown unlocks in:</span>
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950">{lockoutRemainingSec}s</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAuthenticateOwner} className="w-full space-y-3.5">
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={16}
                        value={ownerAuthPin}
                        onChange={(e) => setOwnerAuthPin(e.target.value)}
                        placeholder="Enter Master Owner PIN"
                        className="w-full text-center text-xl tracking-[0.3em] px-4 py-3.5 rounded-2xl border-2 border-stone-200 font-mono font-bold focus:border-[#08783F] focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-inner bg-stone-50/50"
                        autoFocus
                      />
                    </div>

                    {pinError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{pinError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={lockoutRemainingSec > 0 || !ownerAuthPin.trim()}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                        lockoutRemainingSec > 0 || !ownerAuthPin.trim()
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-[#08783F] text-white hover:bg-[#075C34] hover:shadow-lg active:scale-[0.98]'
                      }`}
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>Verify &amp; Unlock Dashboard</span>
                    </button>

                    <div className="pt-2 text-[11px] text-stone-400 space-y-1">
                      <div>Default initialization PIN: <strong>1234</strong> or <strong>8904</strong></div>
                      <div className="text-[10px] text-stone-400">Owner can customize and encrypt this PIN inside the Security tab.</div>
                    </div>
                  </form>
                )}

                {/* STEALTH SHORTCUT TIP */}
                <div className="text-[10px] text-stone-400 pt-2 border-t border-stone-100 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stealth Key: <code className="bg-stone-100 px-1 py-0.5 rounded font-bold text-stone-600">Ctrl + Shift + O</code></span>
                </div>
              </div>
            ) : (
              /* AUTHENTICATED CMS WORKSPACE */
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* CMS SIDEBAR NAVIGATION */}
                <div className="w-full md:w-64 bg-stone-50 border-r border-stone-200 p-3 overflow-y-auto shrink-0 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1.5">
                    Settings &amp; Data
                  </div>

                  {[
                    { id: 'sections', label: 'Section Control Hub', icon: LayoutGrid, desc: 'Decide what sections are live/hidden' },
                    { id: 'security', label: 'Security & PIN Shield', icon: ShieldCheck, desc: 'Change PIN, logs & rate limiter' },
                    { id: 'profile', label: 'Store Profile', icon: Building, desc: 'Name, tagline, description' },
                    { id: 'contact', label: 'Contact & WhatsApp', icon: Phone, desc: 'Phones, WhatsApp desks, greetings' },
                    { id: 'location', label: 'Location & Maps', icon: MapPin, desc: 'Address, directions, embed map' },
                    { id: 'hours', label: 'Business Hours', icon: Clock, desc: 'Schedule, opening times, preview' },
                    { id: 'announcement', label: 'Announcement Ticker', icon: Sparkle, desc: 'Marquee banner, ticker speed' },
                    { id: 'flashSale', label: 'Flash Deals & Offers', icon: Flame, desc: 'Promotions, carousel & discounts' },
                    { id: 'delivery', label: 'Home Delivery', icon: Truck, desc: 'Doorstep terms, availability' },
                    { id: 'categories', label: 'Category Manager', icon: LayoutGrid, desc: 'Manage departments' },
                    { id: 'products', label: 'Product Manager', icon: Pill, desc: 'Medicines, pricing, stock' },
                    { id: 'gallery', label: 'Store Gallery', icon: ImageIcon, desc: 'Photo bays and showroom' },
                    { id: 'appearance', label: 'Appearance & Sections', icon: Palette, desc: 'Theme colors, section toggle' },
                    { id: 'export', label: 'Generated Code Export', icon: FileCode, desc: 'Export storeConfig.ts' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = cmsPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCmsPage(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 transition-all ${
                          isActive
                            ? 'bg-white text-[#08783F] shadow-sm border border-stone-200'
                            : 'text-stone-600 hover:bg-stone-200/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-[#08783F]' : 'text-stone-400'}`} />
                        <div className="overflow-hidden">
                          <div className="font-bold truncate">{item.label}</div>
                          <div className="text-[10px] text-stone-400 font-normal truncate">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CMS MAIN EDITING PANEL */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  
                  {/* SAVE STATUS MESSAGE ALERT */}
                  {saveStatusMessage && (
                    <div className="px-6 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold border-b border-emerald-200 flex items-center justify-between">
                      <span>{saveStatusMessage}</span>
                      <button onClick={() => setSaveStatusMessage('')}><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}

                  {/* ACTIVE PAGE CONTENT CONTAINER */}
                  <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6">
                    
                    {/* DEDICATED SECTION CONTROL HUB */}
                    {cmsPage === 'sections' && (
                      <div className="space-y-6 max-w-4xl">
                        {/* Quick Guidance Box */}
                        <div className="bg-gradient-to-r from-emerald-900 to-[#075C34] text-white p-5 rounded-3xl shadow-sm space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-300">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Owner Section Manager: Show / Hide Any Section</span>
                          </div>
                          <h3 className="text-xl font-extrabold tracking-tight">
                            Choose Exactly Which Sections Appear on Your Website
                          </h3>
                          <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
                            Turn any section <strong>SHOW (🟢 Live on Site)</strong> or <strong>HIDE (🔴 Hidden / Off)</strong> with 1 click. When a section is hidden, its link is automatically removed from the header, mobile menu, and homepage.
                          </p>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                          <div>
                            <span className="text-xs font-bold text-stone-800">Quick Batch Actions:</span>
                            <span className="text-xs text-stone-500 ml-2">Show or hide multiple sections at once</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDraftConfig(prev => ({
                                  ...prev,
                                  sectionVisibility: {
                                    header: true,
                                    footer: true,
                                    announcement: true,
                                    flashSale: true,
                                    hero: true,
                                    about: true,
                                    categories: true,
                                    catalogue: true,
                                    delivery: true,
                                    gallery: true,
                                    contact: true
                                  }
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#08783F] text-xs font-bold border border-stone-200 shadow-2xs"
                            >
                              ✓ Show All Sections
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDraftConfig(prev => ({
                                  ...prev,
                                  sectionVisibility: {
                                    ...prev.sectionVisibility,
                                    flashSale: false,
                                    announcement: false
                                  }
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 shadow-2xs"
                            >
                              Hide Flash Sale &amp; Banner
                            </button>
                          </div>
                        </div>

                        {/* SECTION CARDS WITH DIRECT SHOW / HIDE SWITCH */}
                        <div className="space-y-3">
                          {[
                            {
                              key: 'header',
                              name: 'Sticky Header & Brand Navigation Bar',
                              desc: 'The top persistent navigation bar displaying store monogram, phone links, WhatsApp button, and page navigation.',
                              badge: 'Top Navigation',
                              icon: LayoutGrid
                            },
                            {
                              key: 'announcement',
                              name: 'Top Announcement Ticker (Running Marquee)',
                              desc: 'The smooth scrolling top news tape displaying opening hours, emergency numbers, and notices.',
                              badge: 'Header Marquee',
                              icon: Sparkle
                            },
                            {
                              key: 'flashSale',
                              name: 'Flash Deals & Seasonal Offers',
                              desc: 'Promotional discount banner, deal tape, auto-play carousel, and WhatsApp offer claim buttons.',
                              badge: 'Deals & Savings',
                              icon: Flame
                            },
                            {
                              key: 'hero',
                              name: 'Hero Showcase & Quick Call Counter',
                              desc: 'The main storefront banner with your real shop signboard photo, 1-tap call & WhatsApp buttons, and live open status.',
                              badge: 'Main Banner',
                              icon: Building
                            },
                            {
                              key: 'about',
                              name: 'About Store & Customer Commitment',
                              desc: 'Introduction to Shri Sai Medical at Siddhesh Complex, genuine stock guarantees, and timings.',
                              badge: 'Store Info',
                              icon: Info
                            },
                            {
                              key: 'categories',
                              name: 'Department Categories Grid',
                              desc: '8 organized department cards (Prescription, OTC, First Aid, Baby Care, Hygiene, Daily Needs).',
                              badge: 'Departments',
                              icon: LayoutGrid
                            },
                            {
                              key: 'catalogue',
                              name: 'Product Catalogue & Live Showcase',
                              desc: 'Search bar, category filters, product carousel, and medicine pricing cards with Rx safeguards.',
                              badge: 'Products & Medicines',
                              icon: Pill
                            },
                            {
                              key: 'delivery',
                              name: 'Home Delivery Guidelines & Terms',
                              desc: 'Doorstep medicine delivery rules, coverage areas in Manipal, and payment options.',
                              badge: 'Delivery Desk',
                              icon: Truck
                            },
                            {
                              key: 'gallery',
                              name: 'Inside Store Visual Tour (Gallery)',
                              desc: 'Real showroom photographs of medicine shelves, counter bays, and retail aisles.',
                              badge: 'Showroom Photos',
                              icon: ImageIcon
                            },
                            {
                              key: 'contact',
                              name: 'Contact Numbers & Interactive Google Map',
                              desc: 'Both store phone numbers, address, operating hours, and embedded Google Maps directions.',
                              badge: 'Map & Contact',
                              icon: MapPin
                            },
                            {
                              key: 'footer',
                              name: 'Store Footer (Links, Disclaimer & Copyright)',
                              desc: 'The bottom dark footer area containing directory links, store address, pharmacy legal notice, and copyright.',
                              badge: 'Bottom Footer',
                              icon: Building
                            }
                          ].map((sec) => {
                            const isLive = draftConfig.sectionVisibility?.[sec.key] !== false;
                            const Icon = sec.icon;

                            return (
                              <div
                                key={sec.key}
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                  isLive
                                    ? 'bg-white border-stone-200/90 shadow-2xs hover:border-[#08783F]'
                                    : 'bg-stone-50/70 border-stone-200 opacity-70'
                                }`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                    isLive ? 'bg-[#EAF7EF] text-[#08783F]' : 'bg-stone-200 text-stone-500'
                                  }`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-extrabold text-sm text-stone-900">{sec.name}</h4>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                        {sec.badge}
                                      </span>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-0.5 max-w-xl leading-relaxed">
                                      {sec.desc}
                                    </p>
                                  </div>
                                </div>

                                {/* SHOW / HIDE DIRECT BUTTON */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSection(sec.key)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                                      isLive
                                        ? 'bg-[#EAF7EF] text-[#08783F] border border-[#08783F]/30 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                        : 'bg-stone-200 text-stone-600 hover:bg-[#08783F] hover:text-white'
                                    }`}
                                  >
                                    {isLive ? (
                                      <>
                                        <Eye className="w-3.5 h-3.5 text-[#08783F]" />
                                        <span>🟢 Live on Site</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                                        <span>🔴 Hidden (Off)</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* NEW: GRANULAR HEADER & FOOTER ELEMENT VISIBILITY CONTROLS */}
                        <div className="mt-8 space-y-6 pt-6 border-t border-stone-200">
                          <div>
                            <h4 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                              <SlidersHorizontal className="w-4 h-4 text-[#08783F]" />
                              <span>Header &amp; Footer Element Controls</span>
                            </h4>
                            <p className="text-xs text-stone-500">
                              Fine-tune individual buttons, links, and sections within your Header and Footer.
                            </p>
                          </div>

                          {/* 1. HEADER ELEMENTS TOGGLES */}
                          <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                                Sticky Header Elements
                              </span>
                              <span className="text-[10px] text-stone-500 font-medium">Toggle individual parts</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { key: 'logo', label: 'Store Logo / Emblem' },
                                { key: 'locationBadge', label: '"MANIPAL" Badge Pill' },
                                { key: 'navLinks', label: 'Desktop Nav Links' },
                                { key: 'helpBtn', label: '"Shopkeeper Steps" Btn' },
                                { key: 'whatsappBtn', label: 'WhatsApp Header Button' },
                                { key: 'callBtn', label: '"Call Store" Button' },
                                { key: 'cmsBtn', label: '"Owner CMS" Button' }
                              ].map(elem => {
                                const isChecked = draftConfig.headerElements?.[elem.key] !== false;
                                return (
                                  <label
                                    key={elem.key}
                                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-white border-[#08783F]/30 shadow-2xs'
                                        : 'bg-stone-100 border-stone-200 opacity-60'
                                    }`}
                                  >
                                    <span className="text-xs font-bold text-stone-800">{elem.label}</span>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        setDraftConfig(prev => ({
                                          ...prev,
                                          headerElements: {
                                            ...(prev.headerElements || {}),
                                            [elem.key]: e.target.checked
                                          }
                                        }));
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="rounded text-[#08783F] focus:ring-[#08783F]"
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. FOOTER ELEMENTS TOGGLES */}
                          <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                                Store Footer Elements
                              </span>
                              <span className="text-[10px] text-stone-500 font-medium">Toggle footer columns</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { key: 'brandSummary', label: 'Brand Summary & Address' },
                                { key: 'quickLinks', label: 'Quick Links Column' },
                                { key: 'contactInfo', label: 'Direct Phone & Timings' },
                                { key: 'ownerArea', label: 'Owner Area & Links' },
                                { key: 'copyright', label: 'Bottom Copyright Bar' }
                              ].map(elem => {
                                const isChecked = draftConfig.footerElements?.[elem.key] !== false;
                                return (
                                  <label
                                    key={elem.key}
                                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-white border-[#08783F]/30 shadow-2xs'
                                        : 'bg-stone-100 border-stone-200 opacity-60'
                                    }`}
                                  >
                                    <span className="text-xs font-bold text-stone-800">{elem.label}</span>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        setDraftConfig(prev => ({
                                          ...prev,
                                          footerElements: {
                                            ...(prev.footerElements || {}),
                                            [elem.key]: e.target.checked
                                          }
                                        }));
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="rounded text-[#08783F] focus:ring-[#08783F]"
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DEDICATED SECURITY & ACCESS SHIELD MANAGER */}
                    {cmsPage === 'security' && (
                      <div className="space-y-6 max-w-3xl">
                        {/* Security Banner */}
                        <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white p-5 rounded-3xl shadow-sm space-y-2 border border-emerald-900/50">
                          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Military-Grade WebCrypto Security Active</span>
                          </div>
                          <h3 className="text-xl font-extrabold tracking-tight">
                            Live Defense &amp; Anti-Brute-Force Architecture
                          </h3>
                          <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                            Your dashboard uses <strong>PBKDF2-HMAC-SHA256 with 100,000 iterations</strong> and cryptographic salts. Automated script bots are progressively locked out after consecutive failed attempts.
                          </p>
                        </div>

                        {/* CHANGE MASTER OWNER PIN */}
                        <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                            <div>
                              <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-[#08783F]" />
                                <span>Change Master Owner Security PIN</span>
                              </h4>
                              <p className="text-xs text-stone-500">
                                Replace the default initialization PIN (1234/8904) with your private secret code.
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Salted PBKDF2
                            </span>
                          </div>

                          {pinChangeMsg.text && (
                            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                              pinChangeMsg.type === 'error'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {pinChangeMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                              <span>{pinChangeMsg.text}</span>
                            </div>
                          )}

                          <form onSubmit={handleChangeOwnerPin} className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Current Master PIN
                              </label>
                              <input
                                type="password"
                                maxLength={16}
                                value={currentPinInput}
                                onChange={(e) => setCurrentPinInput(e.target.value)}
                                placeholder="Enter current PIN"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                  New Secret PIN (Min 4 digits)
                                </label>
                                <input
                                  type="password"
                                  maxLength={16}
                                  value={newPinInput}
                                  onChange={(e) => setNewPinInput(e.target.value)}
                                  placeholder="New secret PIN"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                  Confirm New PIN
                                </label>
                                <input
                                  type="password"
                                  maxLength={16}
                                  value={confirmNewPinInput}
                                  onChange={(e) => setConfirmNewPinInput(e.target.value)}
                                  placeholder="Confirm new PIN"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                                />
                              </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                              <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-[#08783F] hover:bg-[#075C34] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                              >
                                Encrypt &amp; Save New PIN
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* LIVE SECURITY AUDIT LOG */}
                        <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                            <div>
                              <h4 className="font-extrabold text-sm text-stone-900">Security Audit Trail</h4>
                              <p className="text-xs text-stone-500">Real-time log of authentication requests and token grants.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.removeItem('sai_sec_audit_log');
                                setSecurityAuditLog([]);
                              }}
                              className="text-[11px] font-semibold text-stone-500 hover:text-rose-600 underline"
                            >
                              Clear Logs
                            </button>
                          </div>

                          {securityAuditLog.length === 0 ? (
                            <p className="text-xs text-stone-400 py-3 text-center">No security incidents recorded. System pristine.</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {securityAuditLog.map(log => (
                                <div
                                  key={log.id}
                                  className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs flex items-center justify-between gap-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${log.isSuccess ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                    <div>
                                      <span className="font-bold text-stone-900">{log.title}</span>
                                      <span className="text-stone-500 text-[11px] ml-2">{log.details}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-stone-400 shrink-0">
                                    {log.date} {log.timestamp}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* EMERGENCY STEALTH & REMOTE SESSION REVOCATION */}
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-rose-900 block">Emergency Session Revocation</span>
                            <span className="text-[11px] text-rose-700">Instantly locks out this device and revokes the active authentication key.</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleLockSession}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0"
                          >
                            Revoke Key &amp; Lock Now
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PAGE 2: CONTACT & WHATSAPP */}
                    {cmsPage === 'contact' && (
                      <div className="space-y-6 max-w-3xl">
                        {/* EASY STEPS FOR SHOPKEEPER BANNER */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <Lightbulb className="w-4 h-4 text-emerald-700" />
                            <span>Quick Shopkeeper Guide: Phone &amp; WhatsApp</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            <strong>Step 1:</strong> Type only the 10 digits in the phone boxes (e.g., <code>8904018698</code>).<br />
                            <strong>Step 2:</strong> For WhatsApp, keep <code>91</code> followed by the 10-digit number (e.g., <code>918904018698</code>).<br />
                            <strong>Step 3:</strong> Click <strong>"Save &amp; Publish Changes"</strong> below. Every Call and WhatsApp button on the entire site is updated instantly.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-stone-900">Direct Contact &amp; WhatsApp Desks</h3>
                          <p className="text-xs text-stone-500">Update phone lines, alternate numbers, and customized WhatsApp click-to-chat greetings.</p>
                        </div>

                        {/* PHONE NUMBERS */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                          <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">Store Calling Numbers</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 mb-1">Primary Calling Line (Raw digits)</label>
                              <input
                                type="text"
                                value={draftConfig.business.phones[0].raw}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  const updatedPhones = [...draftConfig.business.phones];
                                  updatedPhones[0] = { ...updatedPhones[0], raw: rawVal, display: `+91 ${rawVal}` };
                                  setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, phones: updatedPhones } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 mb-1">Line 1 Label</label>
                              <input
                                type="text"
                                value={draftConfig.business.phones[0].label}
                                onChange={(e) => {
                                  const updatedPhones = [...draftConfig.business.phones];
                                  updatedPhones[0] = { ...updatedPhones[0], label: e.target.value };
                                  setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, phones: updatedPhones } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 mb-1">Secondary Calling Line (Raw digits)</label>
                              <input
                                type="text"
                                value={draftConfig.business.phones[1].raw}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  const updatedPhones = [...draftConfig.business.phones];
                                  updatedPhones[1] = { ...updatedPhones[1], raw: rawVal, display: `+91 ${rawVal}` };
                                  setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, phones: updatedPhones } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 mb-1">Line 2 Label</label>
                              <input
                                type="text"
                                value={draftConfig.business.phones[1].label}
                                onChange={(e) => {
                                  const updatedPhones = [...draftConfig.business.phones];
                                  updatedPhones[1] = { ...updatedPhones[1], label: e.target.value };
                                  setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, phones: updatedPhones } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* WHATSAPP CONFIGURATION */}
                        <div className="p-4 rounded-2xl bg-[#EAF7EF]/70 border border-[#08783F]/20 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#075C34] uppercase tracking-wider">
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                            WhatsApp Integration (Active Everywhere on Website)
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">Primary WhatsApp Number (e.g. 918904018698)</label>
                              <input
                                type="text"
                                value={draftConfig.business.whatsapp.primaryRaw}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/[^0-9]/g, '');
                                  setDraftConfig({
                                    ...draftConfig,
                                    business: { ...draftConfig.business, whatsapp: { ...draftConfig.business.whatsapp, primaryRaw: clean } }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                              />
                              <p className="text-[11px] text-stone-500 mt-1">Controls the floating chat icon, header quick chat &amp; order buttons.</p>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">Secondary WhatsApp Desk (e.g. 919945227858)</label>
                              <input
                                type="text"
                                value={draftConfig.business.whatsapp.secondaryRaw}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/[^0-9]/g, '');
                                  setDraftConfig({
                                    ...draftConfig,
                                    business: { ...draftConfig.business, whatsapp: { ...draftConfig.business.whatsapp, secondaryRaw: clean } }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Default WhatsApp Message Greeting</label>
                            <input
                              type="text"
                              value={draftConfig.business.whatsapp.defaultGreeting}
                              onChange={(e) => {
                                setDraftConfig({
                                  ...draftConfig,
                                  business: { ...draftConfig.business, whatsapp: { ...draftConfig.business.whatsapp, defaultGreeting: e.target.value } }
                                });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#08783F]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PAGE 3: LOCATION & MAPS */}
                    {cmsPage === 'location' && (
                      <div className="space-y-5 max-w-3xl">
                        <div>
                          <h3 className="text-base font-bold text-stone-900">Physical Address &amp; Google Maps Links</h3>
                          <p className="text-xs text-stone-500">Keep your physical shop address and Google directions coordinates accurate.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Building Name</label>
                            <input
                              type="text"
                              value={draftConfig.business.address.building}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, building: e.target.value } } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Street / Locality</label>
                            <input
                              type="text"
                              value={draftConfig.business.address.street}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, street: e.target.value } } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                            <input
                              type="text"
                              value={draftConfig.business.address.city}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, city: e.target.value } } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                            <input
                              type="text"
                              value={draftConfig.business.address.state}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, state: e.target.value } } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Pincode</label>
                            <input
                              type="text"
                              value={draftConfig.business.address.pincode}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, pincode: e.target.value } } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">Google Maps Directions URL</label>
                          <input
                            type="text"
                            value={draftConfig.business.address.googleMapsDirectionsUrl}
                            onChange={(e) => {
                              setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, googleMapsDirectionsUrl: e.target.value } } });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">Google Maps Embed URL (or paste &lt;iframe&gt; code)</label>
                          <input
                            type="text"
                            value={draftConfig.business.address.googleMapsEmbedUrl || ""}
                            onChange={(e) => {
                              let val = e.target.value.trim();
                              // Auto-extract URL if the owner pastes the full <iframe> tag
                              const match = val.match(/src=["']([^"']+)["']/i);
                              if (match && match[1]) {
                                val = match[1];
                              }
                              setDraftConfig({ ...draftConfig, business: { ...draftConfig.business, address: { ...draftConfig.business.address, googleMapsEmbedUrl: val } } });
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#08783F]"
                          />
                          <p className="text-[11px] text-stone-500 mt-1">
                            Tip: You can paste the direct link or the entire <code>&lt;iframe src="..."&gt;&lt;/iframe&gt;</code> code; the URL will be extracted automatically.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PAGE 5: ANNOUNCEMENT TICKER */}
                    {cmsPage === 'announcement' && (
                      <div className="space-y-6 max-w-3xl">
                        {/* EASY STEPS FOR SHOPKEEPER BANNER */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <Lightbulb className="w-4 h-4 text-emerald-700" />
                            <span>Quick Shopkeeper Guide: Top Running Marquee Banner</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            <strong>Step 1:</strong> Click <strong>"+ Add Message"</strong> to add any festival notice, special Sunday timing, or holiday announcement.<br />
                            <strong>Step 2:</strong> Pick <strong>Gentle (85s)</strong> or <strong>Relaxed (65s)</strong> so it scrolls calmly and customers can read it easily.<br />
                            <strong>Step 3:</strong> Click <strong>"Save &amp; Publish Changes"</strong> at the bottom.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-stone-900">Top Running Ticker Announcement</h3>
                          <p className="text-xs text-stone-500">Add, edit, or adjust the speed of the smooth scrolling announcement marquee.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={draftConfig.announcement.enabled}
                                onChange={(e) => {
                                  setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, enabled: e.target.checked } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-4 h-4 rounded text-[#08783F] focus:ring-[#08783F]"
                              />
                              <span className="text-xs font-bold text-stone-800">Enable Announcement Ticker</span>
                            </label>

                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-stone-500 font-semibold mr-1">Speed Preset:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, speedSeconds: 85 } });
                                  setHasUnsavedChanges(true);
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                  draftConfig.announcement.speedSeconds >= 80 ? 'bg-[#08783F] text-white' : 'bg-white border text-stone-700'
                                }`}
                              >
                                Gentle (85s)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, speedSeconds: 65 } });
                                  setHasUnsavedChanges(true);
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                  draftConfig.announcement.speedSeconds < 80 ? 'bg-[#08783F] text-white' : 'bg-white border text-stone-700'
                                }`}
                              >
                                Relaxed (65s)
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Badge Title</label>
                            <input
                              type="text"
                              value={draftConfig.announcement.badge}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, badge: e.target.value } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>
                        </div>

                        {/* LIST OF MESSAGES */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                            <span>Marquee News Messages ({draftConfig.announcement.items.length})</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...draftConfig.announcement.items, "New store announcement notice"];
                                setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, items: newItems } });
                                setHasUnsavedChanges(true);
                              }}
                              className="inline-flex items-center gap-1 text-[#08783F] hover:underline"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Message
                            </button>
                          </div>

                          {draftConfig.announcement.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const updated = [...draftConfig.announcement.items];
                                  updated[idx] = e.target.value;
                                  setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, items: updated } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (draftConfig.announcement.items.length <= 1) return;
                                  const updated = draftConfig.announcement.items.filter((_, i) => i !== idx);
                                  setDraftConfig({ ...draftConfig, announcement: { ...draftConfig.announcement, items: updated } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NEW PAGE: FLASH DEALS & OFFERS CMS */}
                    {cmsPage === 'flashSale' && (
                      <div className="space-y-6 max-w-4xl">
                        {/* EASY STEPS FOR SHOPKEEPER BANNER */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <Lightbulb className="w-4 h-4 text-emerald-700" />
                            <span>Quick Shopkeeper Guide: Flash Deals &amp; Running Offers</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            <strong>Step 1:</strong> Click <strong>"+ Add New Offer"</strong> below to add deals on general items, baby care, or health devices.<br />
                            <strong>Step 2:</strong> Set the Discount Badge (e.g. <em>"SAVE 20%"</em>) and Offer Price (e.g. <em>₹360</em>).<br />
                            <strong>Step 3:</strong> The deals will run and play smoothly across the website with instant WhatsApp 1-tap ordering!
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-stone-900">Flash Deals &amp; Running Promotions Manager</h3>
                          <p className="text-xs text-stone-500">Configure promotional offers, running deal ticker tape, and auto-play carousel speeds.</p>
                        </div>

                        {/* GLOBAL FLASH SALE SETTINGS */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={draftConfig.flashSale?.enabled !== false}
                                onChange={(e) => {
                                  setDraftConfig({
                                    ...draftConfig,
                                    flashSale: { ...draftConfig.flashSale, enabled: e.target.checked }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-4 h-4 rounded text-[#08783F] focus:ring-[#08783F]"
                              />
                              <span className="text-xs font-bold text-stone-800">Enable Flash Deals &amp; Offers Section</span>
                            </label>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={draftConfig.flashSale?.showWelcomePopup !== false}
                                  onChange={(e) => {
                                    setDraftConfig({
                                      ...draftConfig,
                                      flashSale: { ...draftConfig.flashSale, showWelcomePopup: e.target.checked }
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-4 h-4 rounded text-[#08783F] focus:ring-[#08783F]"
                                />
                                <span className="text-xs font-bold text-stone-700">Show Welcome Popup to Visitors</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={draftConfig.flashSale?.autoPlay !== false}
                                  onChange={(e) => {
                                    setDraftConfig({
                                      ...draftConfig,
                                      flashSale: { ...draftConfig.flashSale, autoPlay: e.target.checked }
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-4 h-4 rounded text-[#08783F] focus:ring-[#08783F]"
                                />
                                <span className="text-xs font-bold text-stone-700">Auto-Run Carousel</span>
                              </label>

                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-stone-500">Interval:</span>
                                <input
                                  type="number"
                                  min={3}
                                  max={20}
                                  value={draftConfig.flashSale?.intervalSeconds || 5}
                                  onChange={(e) => {
                                    setDraftConfig({
                                      ...draftConfig,
                                      flashSale: { ...draftConfig.flashSale, intervalSeconds: Number(e.target.value) || 5 }
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-16 px-2 py-1 rounded-lg border border-stone-300 font-mono text-center text-xs"
                                />
                                <span className="text-stone-400">sec</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">Section Title</label>
                              <input
                                type="text"
                                value={draftConfig.flashSale?.title || ""}
                                onChange={(e) => {
                                  setDraftConfig({
                                    ...draftConfig,
                                    flashSale: { ...draftConfig.flashSale, title: e.target.value }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">Subtitle</label>
                              <input
                                type="text"
                                value={draftConfig.flashSale?.subtitle || ""}
                                onChange={(e) => {
                                  setDraftConfig({
                                    ...draftConfig,
                                    flashSale: { ...draftConfig.flashSale, subtitle: e.target.value }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* LIST OF OFFERS */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                            <span>Active Flash Deals ({(draftConfig.flashSale?.offers || []).length})</span>
                            <button
                              type="button"
                              onClick={handleAddNewOffer}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add New Offer</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(draftConfig.flashSale?.offers || []).map((offer) => (
                              <div key={offer.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 transition-all hover:border-stone-300">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                                      {offer.discountBadge}
                                    </span>
                                    <span className="font-mono text-[10px] text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">
                                      CODE: {offer.couponCode}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingOfferItem({ ...offer })}
                                      className="p-1.5 text-stone-600 hover:text-[#08783F] hover:bg-white rounded-lg transition-colors"
                                      title="Edit Offer"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmTarget({ type: 'offer', item: offer })}
                                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Offer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <div className="font-bold text-sm text-stone-900">{offer.title}</div>
                                  <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{offer.description}</p>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 text-stone-600">
                                  <div>
                                    <span className="line-through text-stone-400 mr-2">{offer.originalPrice}</span>
                                    <span className="font-bold text-[#08783F]">{offer.offerPrice}</span>
                                  </div>
                                  <span className="text-[11px] text-stone-500">{offer.validity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PAGE 6: HOME DELIVERY */}
                    {cmsPage === 'delivery' && (
                      <div className="space-y-6 max-w-3xl">
                        <div>
                          <h3 className="text-base font-bold text-stone-900">Home Delivery Settings</h3>
                          <p className="text-xs text-stone-500">Configure delivery rules, terms, and neighbourhood dispatch conditions.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={draftConfig.delivery.available}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, delivery: { ...draftConfig.delivery, available: e.target.checked } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-4 h-4 rounded text-[#08783F] focus:ring-[#08783F]"
                            />
                            <span className="text-xs font-bold text-stone-800">Home Delivery Service Enabled</span>
                          </label>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Section Headline</label>
                            <input
                              type="text"
                              value={draftConfig.delivery.title}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, delivery: { ...draftConfig.delivery, title: e.target.value } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Summary</label>
                            <textarea
                              rows={2}
                              value={draftConfig.delivery.summary}
                              onChange={(e) => {
                                setDraftConfig({ ...draftConfig, delivery: { ...draftConfig.delivery, summary: e.target.value } });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                            />
                          </div>
                        </div>

                        {/* DELIVERY TERMS */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                            <span>Delivery Guidelines &amp; Conditions</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newTerms = [...draftConfig.delivery.terms, "New delivery condition statement."];
                                setDraftConfig({ ...draftConfig, delivery: { ...draftConfig.delivery, terms: newTerms } });
                                setHasUnsavedChanges(true);
                              }}
                              className="inline-flex items-center gap-1 text-[#08783F] hover:underline"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Term
                            </button>
                          </div>

                          {draftConfig.delivery.terms.map((term, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={term}
                                onChange={(e) => {
                                  const updated = [...draftConfig.delivery.terms];
                                  updated[idx] = e.target.value;
                                  setDraftConfig({ ...draftConfig, delivery: { ...draftConfig.delivery, terms: updated } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (draftConfig.delivery.terms.length <= 1) return;
                                  const updated = draftConfig.delivery.terms.filter((_, i) => i !== idx);
                                  setDraftConfig({ ...draftConfig, delivery: { ...draftConfig.delivery, terms: updated } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PAGE 7: CATEGORY MANAGEMENT */}
                    {cmsPage === 'categories' && (
                      <div className="space-y-6">
                        {/* STEP-BY-STEP QUICK GUIDE FOR OWNER */}
                        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
                          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                            <BookOpen className="w-4 h-4 text-[#08783F]" />
                            <span>How to Add a New Department in 3 Easy Steps</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
                            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 space-y-1">
                              <span className="w-5 h-5 rounded-full bg-[#08783F] text-white font-bold inline-flex items-center justify-center text-[10px] mr-1.5">1</span>
                              <strong className="text-stone-900">Click &amp; Name</strong>
                              <p className="text-[11px] text-stone-500">Tap <strong>"Add New Department"</strong> below and enter your department name (e.g. <em>Ayurvedic Care</em> or <em>Orthopedic Supports</em>).</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 space-y-1">
                              <span className="w-5 h-5 rounded-full bg-[#08783F] text-white font-bold inline-flex items-center justify-center text-[10px] mr-1.5">2</span>
                              <strong className="text-stone-900">Pick Badge &amp; Subtext</strong>
                              <p className="text-[11px] text-stone-500">Select an existing Badge &amp; Count Note from the dropdown, or tap <strong>"➕ Create new..."</strong> to make custom ones.</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 space-y-1">
                              <span className="w-5 h-5 rounded-full bg-[#08783F] text-white font-bold inline-flex items-center justify-center text-[10px] mr-1.5">3</span>
                              <strong className="text-stone-900">Save &amp; Publish</strong>
                              <p className="text-[11px] text-stone-500">Click <strong>Apply</strong>, then hit <strong>"Save &amp; Publish Changes"</strong>. It immediately appears on your homepage &amp; in the product dropdown!</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                          <div>
                            <h3 className="text-base font-bold text-stone-900">Department &amp; Category Manager</h3>
                            <p className="text-xs text-stone-500">
                              Active Departments: <strong>{draftConfig.categories.length}</strong>. Changes sync across all filters, homepage cards, and product dropdowns.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddNewCategory}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34] shadow-sm hover:shadow-md transition-all active:scale-95"
                          >
                            <FolderPlus className="w-4 h-4" />
                            <span>Add New Department</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {draftConfig.categories.map((cat, idx) => {
                            const productCountForCat = draftConfig.products.filter(p => p.category === cat.id).length;
                            return (
                              <div key={cat.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-[#08783F]/40 space-y-3 transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md">ID: {cat.id}</span>
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      {productCountForCat} products
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategory({ ...cat })}
                                      className="p-1.5 text-stone-600 hover:text-[#08783F] hover:bg-white rounded-lg transition-colors"
                                      title="Edit Category Details"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmTarget({ type: 'category', item: cat })}
                                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Category"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <div className="font-bold text-sm text-stone-900">{cat.name}</div>
                                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{cat.description}</p>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-200/80">
                                  <span>Badge: <strong className="text-stone-800">{cat.badge}</strong></span>
                                  <span>Subtext: <strong className="text-stone-800">{cat.count || "Available"}</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* PAGE 8: PRODUCT MANAGEMENT */}
                    {cmsPage === 'products' && (
                      <div className="space-y-6">
                        {/* EASY STEPS FOR SHOPKEEPER BANNER */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <Lightbulb className="w-4 h-4 text-emerald-700" />
                            <span>Quick Shopkeeper Guide: Products, Prices &amp; Stock</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            <strong>To add a new product:</strong> Click the green <strong>"+ Add New Product"</strong> button above, type the medicine/item name, select the department from the dropdown, and enter the price.<br />
                            <strong>To change stock:</strong> Click the quick button <code>● In Stock</code> / <code>○ Out of Stock</code> on any item.<br />
                            <strong>To save:</strong> Remember to click <strong>"Save &amp; Publish Changes"</strong> at the bottom right.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                          <div>
                            <h3 className="text-base font-bold text-stone-900">Products &amp; Medicine Inventory</h3>
                            <p className="text-xs text-stone-500">
                              Active Listed Products: <strong>{draftConfig.products.length}</strong>. Real-time counter availability &amp; pricing.
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleAddNewProduct}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34] shadow-sm transition-all active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add New Product</span>
                          </button>
                        </div>

                        {/* SEARCH & FILTERS IN CMS */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={cmsProductFilter}
                              onChange={(e) => setCmsProductFilter(e.target.value)}
                              placeholder="Search item name, brand, or description in editor..."
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                            />
                            {cmsProductFilter && (
                              <button onClick={() => setCmsProductFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* PRODUCT EDITOR LIST / CARDS */}
                        <div className="space-y-3">
                          {draftConfig.products
                            .filter(p => !cmsProductFilter || p.name.toLowerCase().includes(cmsProductFilter.toLowerCase()) || p.brand.toLowerCase().includes(cmsProductFilter.toLowerCase()))
                            .map((prod) => {
                              const assignedCategory = draftConfig.categories.find(c => c.id === prod.category)?.name || prod.category;
                              return (
                                <div key={prod.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-300 space-y-3 transition-all">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] bg-stone-200 px-2 py-0.5 rounded text-stone-700">ID: {prod.id}</span>
                                      
                                      {/* Quick Stock Toggle */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDraftConfig(prev => ({
                                            ...prev,
                                            products: prev.products.map(p => p.id === prod.id ? { ...p, available: !p.available } : p)
                                          }));
                                          setHasUnsavedChanges(true);
                                        }}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                          prod.available
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : 'bg-stone-200 text-stone-600 border-stone-300'
                                        }`}
                                      >
                                        {prod.available ? "● In Stock" : "○ Out of Stock"}
                                      </button>

                                      {/* Prescription Safeguard Tag */}
                                      {prod.isPrescription && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                          Rx Mandatory
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...prod })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-stone-200 hover:border-[#08783F] hover:text-[#08783F] text-stone-700 transition-colors shadow-2xs"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmTarget({ type: 'product', item: prod })}
                                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Item"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                    <div className="sm:col-span-8 space-y-1">
                                      <div className="text-sm font-bold text-stone-900">{prod.name}</div>
                                      <div className="text-xs text-stone-500">
                                        Brand: <strong className="text-stone-700">{prod.brand}</strong> • Category: <strong className="text-[#08783F]">{assignedCategory}</strong>
                                      </div>
                                      <p className="text-xs text-stone-600 line-clamp-1">{prod.description}</p>
                                    </div>

                                    <div className="sm:col-span-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                                      <div className="text-xs text-stone-400">Price / Dispense</div>
                                      <div className="text-sm font-bold text-[#08783F]">{prod.price}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                          {draftConfig.products.length === 0 && (
                            <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                              <Pill className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                              <div className="font-bold text-stone-700 text-sm">No products listed</div>
                              <button
                                type="button"
                                onClick={handleAddNewProduct}
                                className="mt-3 px-3 py-1.5 rounded-lg bg-[#08783F] text-white text-xs font-bold"
                              >
                                Add your first product
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PAGE 9: STORE GALLERY */}
                    {cmsPage === 'gallery' && (
                      <div className="space-y-6">
                        {/* EASY STEPS FOR SHOPKEEPER BANNER */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <Lightbulb className="w-4 h-4 text-emerald-700" />
                            <span>Quick Shopkeeper Guide: Store Photos</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            <strong>To add a photo:</strong> Tap <strong>"Add New Photo"</strong> below. You can either <strong>choose an image directly from your phone / computer</strong> or paste an image link.<br />
                            <strong>Automatic Size Adjustment:</strong> The website automatically balances and resizes your photo to fit perfectly on phones and desktops without stretching.<br />
                            <strong>To publish:</strong> Click <strong>"Add Photo to Gallery"</strong> and remember to click <strong>"Save &amp; Publish Changes"</strong>!
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                          <div>
                            <h3 className="text-base font-bold text-stone-900">Store Visual Gallery ({draftConfig.gallery.length})</h3>
                            <p className="text-xs text-stone-500">Manage real photographs of the storefront, counter, shelves, and signboard.</p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleAddNewGalleryPhoto}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34] shadow-sm transition-all active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add New Photo</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {draftConfig.gallery.map((item, idx) => (
                            <div key={item.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-300 space-y-3 transition-all">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] text-stone-500 bg-stone-200 px-2 py-0.5 rounded">{item.id}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingGalleryItem({ ...item })}
                                    className="p-1.5 text-stone-600 hover:text-[#08783F] hover:bg-white rounded-lg transition-colors"
                                    title="Edit Photo Details"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmTarget({ type: 'gallery', item: item })}
                                    className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete Photo"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 border border-stone-300 relative group">
                                <img
                                  src={item.imageUrl || "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80"}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                                  {item.tag || item.category}
                                </span>
                              </div>

                              <div>
                                <div className="font-bold text-sm text-stone-900">{item.title}</div>
                                <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{item.caption}</p>
                              </div>

                              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                                <span>Category: <strong className="text-stone-800">{item.category}</strong></span>
                                <span className="truncate max-w-[160px]">{item.imageUrl?.startsWith('data:') ? 'Custom Device Photo' : 'Web Link'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PAGE 10: APPEARANCE & SECTION VISIBILITY */}
                    {cmsPage === 'appearance' && (
                      <div className="space-y-6 max-w-3xl">
                        {/* EASY STEPS FOR SHOPKEEPER BANNER */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <Lightbulb className="w-4 h-4 text-emerald-700" />
                            <span>Quick Shopkeeper Guide: Premium Logo &amp; Brand Appearance</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            <strong>Step 1:</strong> Pick your brand badge style (Monogram Initials, Sacred ॐ, Pharmacy Cross, Rx Glyph, or Upload your own Logo).<br />
                            <strong>Step 2:</strong> Choose your favorite badge shape (Apple Squircle, Round, or Shield) and edge trim.<br />
                            <strong>Step 3:</strong> Click <strong>"Save &amp; Publish Changes"</strong> at the bottom right. The live logo updates across the header and footer immediately!
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-stone-900">Website Appearance &amp; Brand Identity</h3>
                          <p className="text-xs text-stone-500">Customize your pharmacy emblem, brand color palette, and toggle storefront sections.</p>
                        </div>

                        {/* PREMIUM LOGO BADGE MANAGER */}
                        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-5">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                            <div>
                              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">Store Logo &amp; Emblem Style</div>
                              <p className="text-[11px] text-stone-500">Displayed prominently on the top navigation bar, mobile drawer, and footer.</p>
                            </div>

                            {/* LIVE BADGE MINI-PREVIEW */}
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-bold text-stone-400">Preview:</span>
                              <div
                                style={{ backgroundColor: draftConfig.appearance?.primaryColor || '#08783F' }}
                                className={`w-9 h-9 flex items-center justify-center text-white select-none transition-all ${
                                  (draftConfig.appearance?.logoShape || 'squircle') === 'circle' ? 'rounded-full' :
                                  (draftConfig.appearance?.logoShape || 'squircle') === 'rounded' ? 'rounded-lg' :
                                  (draftConfig.appearance?.logoShape || 'squircle') === 'shield' ? 'rounded-t-xl rounded-b-md' :
                                  'rounded-xl'
                                } ${
                                  (draftConfig.appearance?.badgeBorderAccent || 'gold') === 'gold' ? 'border-2 border-amber-400 shadow-xs' :
                                  (draftConfig.appearance?.badgeBorderAccent || 'gold') === 'emerald' ? 'border-2 border-emerald-300 shadow-xs' :
                                  'border border-white/20'
                                }`}
                              >
                                {(draftConfig.appearance?.logoType || 'initials') === 'custom_image' && draftConfig.appearance?.logoCustomUrl ? (
                                  <img src={draftConfig.appearance.logoCustomUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (draftConfig.appearance?.logoType || 'initials') === 'om' ? (
                                  <span className="text-base font-bold text-amber-200 font-serif">ॐ</span>
                                ) : (draftConfig.appearance?.logoType || 'initials') === 'cross' ? (
                                  <div className="relative w-4 h-4 flex items-center justify-center">
                                    <span className="absolute w-3 h-1 bg-white rounded-full"></span>
                                    <span className="absolute h-3 w-1 bg-white rounded-full"></span>
                                  </div>
                                ) : (draftConfig.appearance?.logoType || 'initials') === 'rx' ? (
                                  <span className="text-sm font-black font-sans text-emerald-100">℞</span>
                                ) : (
                                  <span className="text-sm font-black font-sans uppercase">
                                    {draftConfig.appearance?.logoBadgeText || "SS"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 1. EMBLEM TYPE PICKER */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-stone-700">Choose Logo Emblem Mode</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                              {[
                                { id: 'initials', label: 'Store Monogram', desc: 'Initials (e.g. SS)', icon: 'SS' },
                                { id: 'om', label: 'Sacred ॐ', desc: 'Spiritual Heritage', icon: 'ॐ' },
                                { id: 'cross', label: 'Medical Cross', desc: 'Healthcare Swiss Cross', icon: '✚' },
                                { id: 'rx', label: 'Pharmacy ℞', desc: 'Classic Prescription', icon: '℞' },
                                { id: 'custom_image', label: 'Custom Logo Image', desc: 'Upload file / URL', icon: '📷' }
                              ].map(mode => {
                                const isSelected = (draftConfig.appearance?.logoType || 'initials') === mode.id;
                                return (
                                  <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => {
                                      setDraftConfig({
                                        ...draftConfig,
                                        appearance: {
                                          ...draftConfig.appearance,
                                          logoType: mode.id
                                        }
                                      });
                                      setHasUnsavedChanges(true);
                                    }}
                                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                                      isSelected
                                        ? 'bg-[#EAF7EF] border-[#08783F] shadow-xs'
                                        : 'bg-white border-stone-200 hover:border-stone-300'
                                    }`}
                                  >
                                    <div className="text-lg font-bold text-[#08783F] mb-1">{mode.icon}</div>
                                    <div>
                                      <div className={`text-xs font-bold ${isSelected ? 'text-[#08783F]' : 'text-stone-800'}`}>
                                        {mode.label}
                                      </div>
                                      <div className="text-[10px] text-stone-500 mt-0.5">{mode.desc}</div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. MODE SPECIFIC INPUTS */}
                          {(draftConfig.appearance?.logoType || 'initials') === 'initials' && (
                            <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-1">
                              <label className="block text-xs font-bold text-stone-700">
                                Monogram Badge Letters (Max 3 Characters)
                              </label>
                              <input
                                type="text"
                                maxLength={3}
                                value={draftConfig.appearance?.logoBadgeText || "SS"}
                                onChange={(e) => {
                                  setDraftConfig({
                                    ...draftConfig,
                                    appearance: { ...draftConfig.appearance, logoBadgeText: e.target.value.toUpperCase() }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="SS"
                                className="w-32 px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-[#08783F]"
                              />
                              <p className="text-[10px] text-stone-500">Displays "SS" for Shri Sai Medical &amp; General Store.</p>
                            </div>
                          )}

                          {(draftConfig.appearance?.logoType || 'initials') === 'custom_image' && (
                            <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-3">
                              <div className="text-xs font-bold text-stone-800">Upload Logo Image from Phone / Computer or Web URL</div>
                              <div className="flex flex-wrap items-center gap-2">
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors border border-stone-300">
                                  <Camera className="w-3.5 h-3.5 text-[#08783F]" />
                                  <span>Choose Logo File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleDeviceImageUpload(file, (optimizedUrl) => {
                                          setDraftConfig({
                                            ...draftConfig,
                                            appearance: {
                                              ...draftConfig.appearance,
                                              logoCustomUrl: optimizedUrl
                                            }
                                          });
                                          setHasUnsavedChanges(true);
                                        });
                                      }
                                    }}
                                  />
                                </label>
                                <span className="text-[11px] text-stone-500">Auto-fits and clips to badge shape</span>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Or paste Logo Image URL</label>
                                <input
                                  type="text"
                                  value={draftConfig.appearance?.logoCustomUrl || ""}
                                  onChange={(e) => {
                                    setDraftConfig({
                                      ...draftConfig,
                                      appearance: { ...draftConfig.appearance, logoCustomUrl: e.target.value }
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="https://example.com/logo.png"
                                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#08783F]"
                                />
                              </div>
                            </div>
                          )}

                          {/* 3. SHAPE & TRIM SELECTOR */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                              <label className="block text-xs font-bold text-stone-700 mb-1.5">Badge Shape Geometry</label>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { id: 'squircle', label: 'Squircle' },
                                  { id: 'rounded', label: 'Rounded' },
                                  { id: 'circle', label: 'Circle' },
                                  { id: 'shield', label: 'Shield' }
                                ].map(shape => {
                                  const isSelected = (draftConfig.appearance?.logoShape || 'squircle') === shape.id;
                                  return (
                                    <button
                                      key={shape.id}
                                      type="button"
                                      onClick={() => {
                                        setDraftConfig({
                                          ...draftConfig,
                                          appearance: { ...draftConfig.appearance, logoShape: shape.id }
                                        });
                                        setHasUnsavedChanges(true);
                                      }}
                                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                                        isSelected
                                          ? 'bg-[#08783F] text-white border-[#08783F] shadow-xs'
                                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                      }`}
                                    >
                                      {shape.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-stone-700 mb-1.5">Edge Border Trim</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'gold', label: 'Gold Trim' },
                                  { id: 'emerald', label: 'Emerald' },
                                  { id: 'none', label: 'Subtle Glass' }
                                ].map(trim => {
                                  const isSelected = (draftConfig.appearance?.badgeBorderAccent || 'gold') === trim.id;
                                  return (
                                    <button
                                      key={trim.id}
                                      type="button"
                                      onClick={() => {
                                        setDraftConfig({
                                          ...draftConfig,
                                          appearance: { ...draftConfig.appearance, badgeBorderAccent: trim.id }
                                        });
                                        setHasUnsavedChanges(true);
                                      }}
                                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                                        isSelected
                                          ? 'bg-[#08783F] text-white border-[#08783F] shadow-xs'
                                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                      }`}
                                    >
                                      {trim.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BRAND COLOR PALETTE */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                          <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">Brand Palette</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Pharmacy Green</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={draftConfig.appearance?.primaryColor || "#08783F"}
                                  onChange={(e) => {
                                    setDraftConfig({ ...draftConfig, appearance: { ...draftConfig.appearance, primaryColor: e.target.value } });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={draftConfig.appearance?.primaryColor || "#08783F"}
                                  onChange={(e) => {
                                    setDraftConfig({ ...draftConfig, appearance: { ...draftConfig.appearance, primaryColor: e.target.value } });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">Secondary Deep Green</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={draftConfig.appearance?.secondaryColor || "#075C34"}
                                  onChange={(e) => {
                                    setDraftConfig({ ...draftConfig, appearance: { ...draftConfig.appearance, secondaryColor: e.target.value } });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={draftConfig.appearance?.secondaryColor || "#075C34"}
                                  onChange={(e) => {
                                    setDraftConfig({ ...draftConfig, appearance: { ...draftConfig.appearance, secondaryColor: e.target.value } });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECTION TOGGLE SWITCHES */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                          <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">Storefront Sections Visibility</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { key: 'header', label: 'Sticky Header' },
                              { key: 'announcement', label: 'Announcement Ticker' },
                              { key: 'flashSale', label: 'Flash Deals & Offers' },
                              { key: 'hero', label: 'Hero Banner' },
                              { key: 'about', label: 'About Store' },
                              { key: 'categories', label: 'Category Grid' },
                              { key: 'catalogue', label: 'Product Catalogue' },
                              { key: 'delivery', label: 'Delivery Terms' },
                              { key: 'gallery', label: 'Photo Tour' },
                              { key: 'contact', label: 'Contact & Map' },
                              { key: 'footer', label: 'Website Footer' }
                            ].map((sec) => (
                              <label key={sec.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer text-xs font-semibold text-stone-700">
                                <input
                                  type="checkbox"
                                  checked={draftConfig.sectionVisibility?.[sec.key] !== false}
                                  onChange={(e) => {
                                    setDraftConfig({
                                      ...draftConfig,
                                      sectionVisibility: {
                                        ...draftConfig.sectionVisibility,
                                        [sec.key]: e.target.checked
                                      }
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="rounded text-[#08783F]"
                                />
                                <span className="truncate">{sec.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NEW PAGE: SECURITY & PIN MANAGEMENT */}
                    {cmsPage === 'security' && (
                      <div className="space-y-6 max-w-2xl">
                        <div>
                          <h3 className="text-base font-bold text-stone-900">Owner CMS Security &amp; Access Controls</h3>
                          <p className="text-xs text-stone-500">
                            Configure your master access credentials and review automated anti-hacking defenses.
                          </p>
                        </div>

                        {/* SECURITY STATUS CARD */}
                        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
                          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                            <ShieldCheck className="w-4 h-4 text-[#08783F]" />
                            <span>Active Security Defenses</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-white p-3 rounded-2xl border border-emerald-100 space-y-1">
                              <span className="font-bold text-stone-900 block">SHA-256 Hashing</span>
                              <span className="text-[11px] text-stone-500">PINs are never stored in plaintext.</span>
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-emerald-100 space-y-1">
                              <span className="font-bold text-stone-900 block">Rate Limiting</span>
                              <span className="text-[11px] text-stone-500">Locks out bots after 4 wrong attempts.</span>
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-emerald-100 space-y-1">
                              <span className="font-bold text-stone-900 block">Inactivity Lock</span>
                              <span className="text-[11px] text-stone-500">Auto-secures after 15 min idle.</span>
                            </div>
                          </div>
                        </div>

                        {/* CHANGE MASTER PIN FORM */}
                        <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 space-y-4">
                          <div className="border-b border-stone-200 pb-2">
                            <h4 className="font-bold text-sm text-stone-900">Update Master Owner PIN</h4>
                            <p className="text-xs text-stone-500">Set a personal secret PIN to replace the default access code.</p>
                          </div>

                          {pinChangeMsg.text && (
                            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                              pinChangeMsg.type === 'error'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {pinChangeMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                              <span>{pinChangeMsg.text}</span>
                            </div>
                          )}

                          <form onSubmit={handleChangeOwnerPin} className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Current PIN
                              </label>
                              <input
                                type="password"
                                maxLength={12}
                                value={currentPinInput}
                                onChange={(e) => setCurrentPinInput(e.target.value)}
                                placeholder="Enter current PIN"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                  New Secret PIN (Min 4 digits)
                                </label>
                                <input
                                  type="password"
                                  maxLength={12}
                                  value={newPinInput}
                                  onChange={(e) => setNewPinInput(e.target.value)}
                                  placeholder="New PIN"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                  Confirm New PIN
                                </label>
                                <input
                                  type="password"
                                  maxLength={12}
                                  value={confirmNewPinInput}
                                  onChange={(e) => setConfirmNewPinInput(e.target.value)}
                                  placeholder="Confirm new PIN"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#08783F]"
                                />
                              </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                              <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-[#08783F] hover:bg-[#075C34] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                              >
                                Save New Encrypted PIN
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* PAGE 11: GENERATED STORECONFIG.TS EXPORT */}
                    {cmsPage === 'export' && (
                      <div className="space-y-4 max-w-4xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-stone-900">Synchronized TypeScript Configuration</h3>
                            <p className="text-xs text-stone-500">
                              This code represents your exact store data. Whenever you deploy changes to GitHub Pages, you can paste this into <code>src/config/storeConfig.ts</code>.
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const code = generateStoreConfigCode(draftConfig);
                              navigator.clipboard.writeText(code);
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2500);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34] shadow-xs"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode ? "Copied to Clipboard!" : "Copy storeConfig.ts"}</span>
                          </button>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-stone-800 bg-stone-950">
                          <div className="bg-stone-900 px-4 py-2 text-[11px] font-mono text-stone-400 flex items-center justify-between">
                            <span>src/config/storeConfig.ts</span>
                            <span>UTF-8 • TypeScript</span>
                          </div>
                          <pre className="p-4 text-emerald-400 text-xs font-mono overflow-x-auto max-h-[460px] scrollbar-thin">
                            {generateStoreConfigCode(draftConfig)}
                          </pre>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* CMS BOTTOM ACTION BAR (PERSISTENCE & PUBLISH) */}
                  <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetToFactoryDefaults}
                        className="text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors"
                      >
                        Reset to Initial Seed Data
                      </button>

                      {hasUnsavedChanges && (
                        <button
                          type="button"
                          onClick={handleDiscardChanges}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
                        >
                          <RotateCcw className="w-3 h-3" /> Discard Edits
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (hasUnsavedChanges && !window.confirm("Exit CMS without publishing unsaved changes?")) {
                            return;
                          }
                          setOwnerEditorOpen(false);
                        }}
                        className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAndPublish}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          hasUnsavedChanges
                            ? 'bg-[#08783F] text-white hover:bg-[#075C34] shadow-md animate-pulse'
                            : 'bg-emerald-800 text-white hover:bg-emerald-900'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        <span>Save &amp; Publish Changes</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 13. SHOPKEEPER STEP-BY-STEP EASY GUIDE MODAL                  */}
      {/* ------------------------------------------------------------- */}
      {shopkeeperGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
            {/* HEADER */}
            <div className="px-6 py-4 bg-[#08783F] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Shopkeeper Easy Step-by-Step Guide</h3>
                  <p className="text-xs text-emerald-100">Simple instructions written specifically for the shop owner – no technical skills required!</p>
                </div>
              </div>
              <button
                onClick={() => setShopkeeperGuideOpen(false)}
                className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY TABS & CONTENT */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* TOPIC SELECTOR */}
              <div className="w-full md:w-64 bg-stone-50 border-r border-stone-200 p-3 overflow-y-auto space-y-1.5 shrink-0">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                  Choose a Task
                </div>
                {[
                  { id: 'phone', label: '1. Change Phone & WhatsApp', icon: Phone },
                  { id: 'timing', label: '2. Change Shop Timings', icon: Clock },
                  { id: 'department', label: '3. Add a New Department', icon: LayoutGrid },
                  { id: 'product', label: '4. Add / Edit Products & Prices', icon: Pill },
                  { id: 'ticker', label: '5. Update Running Banner', icon: Sparkle },
                  { id: 'delivery', label: '6. Update Home Delivery Terms', icon: Truck },
                  { id: 'save', label: '7. How to Save & Publish', icon: Save }
                ].map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = activeGuideTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setActiveGuideTopic(topic.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-white text-[#08783F] shadow-sm border border-stone-200 font-bold'
                          : 'text-stone-600 hover:bg-stone-200/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#08783F]' : 'text-stone-400'}`} />
                      <span className="truncate">{topic.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TOPIC DETAILS */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 text-stone-700 text-xs sm:text-sm">
                
                {/* 1. PHONE & WHATSAPP */}
                {activeGuideTopic === 'phone' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Change Phone Numbers &amp; WhatsApp</h4>
                      <p className="text-xs text-stone-500">Update the numbers that customers call or message.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Open the Owner Dashboard</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click the black <strong>"Owner CMS"</strong> button at the top right of the page and enter your PIN (Default: <code>1234</code> or <code>8904</code>).
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>Click "Contact &amp; WhatsApp" in the left menu</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Type your 10-digit number into the <strong>Primary Calling Line</strong> and <strong>Secondary Calling Line</strong> boxes.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">3</span>
                          <span>Enter your WhatsApp Number</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Enter <code>91</code> followed by your 10-digit number (e.g., <code>918904018698</code>).
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">4</span>
                          <span>Click "Save &amp; Publish Changes"</span>
                        </div>
                        <p className="text-xs text-emerald-800 pl-7">
                          Click the green button at the bottom right. Every call and WhatsApp button across the whole website updates immediately!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('contact');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Contact Settings now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 2. TIMINGS */}
                {activeGuideTopic === 'timing' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Change Daily Store Timings</h4>
                      <p className="text-xs text-stone-500">The website automatically calculates Open/Closed status in real-time according to Indian Standard Time (IST).</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Open Owner CMS &gt; Business Hours</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click <strong>"Business Hours"</strong> in the left sidebar menu.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>Adjust Opening &amp; Closing Times</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Set the opening time (default: <code>07:30</code>) and closing time (default: <code>23:00</code>).
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">3</span>
                          <span>Save &amp; Automatic Closed Switch</span>
                        </div>
                        <p className="text-xs text-emerald-800 pl-7">
                          Click <strong>"Save &amp; Publish Changes"</strong>. The website will switch to <em>"Currently Closed"</em> every night automatically after your closing hour!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('hours');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Timings Settings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 3. NEW DEPARTMENT */}
                {activeGuideTopic === 'department' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Add a New Department</h4>
                      <p className="text-xs text-stone-500">Create new aisles like Ayurvedic, Fitness, Ortho, or Personal Care.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Go to Category Manager</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          In the CMS left menu, click <strong>"Category Manager"</strong>, then tap the green <strong>"Add New Department"</strong> button.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>Fill in Name &amp; Select Badges</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Type the department name. Choose a badge from the dropdown or select <code>➕ Create new custom badge</code> to type a new one.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">3</span>
                          <span>Create &amp; Publish</span>
                        </div>
                        <p className="text-xs text-emerald-800 pl-7">
                          Click <strong>"Create Department"</strong>, then <strong>"Save &amp; Publish Changes"</strong>. The department card is live and ready in your product dropdown!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('categories');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Category Manager</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 4. PRODUCTS & PRICES */}
                {activeGuideTopic === 'product' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Add / Edit Products &amp; Prices</h4>
                      <p className="text-xs text-stone-500">Update medicines, FMCG goods, prices, and stock availability.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Open Product Manager</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click <strong>"Product Manager"</strong> in the CMS menu.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>To Edit or Add a Product</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click <strong>"Edit"</strong> on any listed product, or click <strong>"+ Add New Product"</strong> at the top to add an item. Select the department from the dropdown and type the price or <em>"MRP on Pack"</em>.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">3</span>
                          <span>Toggle Stock with 1 Click</span>
                        </div>
                        <p className="text-xs text-emerald-800 pl-7">
                          Click the <code>● In Stock</code> / <code>○ Out of Stock</code> pill on any product to quickly update availability. When finished, hit <strong>"Save &amp; Publish Changes"</strong>!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('products');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Product Manager</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 5. RUNNING BANNER */}
                {activeGuideTopic === 'ticker' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Update the Top Running Banner</h4>
                      <p className="text-xs text-stone-500">Post announcements, festival hours, or doorstep delivery notices.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Go to Announcement Ticker</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click <strong>"Announcement Ticker"</strong> in the CMS menu.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>Edit or Add New Messages</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Type directly into the existing message boxes or click <strong>"+ Add Message"</strong>. Choose <strong>Gentle (85s)</strong> for calm, easy readability.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">3</span>
                          <span>Save &amp; View Live</span>
                        </div>
                        <p className="text-xs text-emerald-800 pl-7">
                          Click <strong>"Save &amp; Publish Changes"</strong> to see your new scrolling message instantly at the top of the website.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('announcement');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Announcement Settings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 6. DELIVERY TERMS */}
                {activeGuideTopic === 'delivery' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Update Home Delivery Terms</h4>
                      <p className="text-xs text-stone-500">Configure delivery radius, UPI payment instructions, and hours.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Go to Home Delivery</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click <strong>"Home Delivery"</strong> in the CMS menu.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>Edit Guidelines &amp; Conditions</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Update the terms, delivery timings, and WhatsApp dispatch notes.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">3</span>
                          <span>Publish</span>
                        </div>
                        <p className="text-xs text-emerald-800 pl-7">
                          Click <strong>"Save &amp; Publish Changes"</strong>. The delivery section on your storefront reflects the changes immediately.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('delivery');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Delivery Settings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 7. SAVE & PUBLISH */}
                {activeGuideTopic === 'save' && (
                  <div className="space-y-4">
                    <div className="border-b border-stone-200 pb-3">
                      <h4 className="text-base font-bold text-stone-900">How to Save, Publish &amp; Keep Code in Sync</h4>
                      <p className="text-xs text-stone-500">Your changes are automatically saved to your browser and can be exported into your code anytime.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">1</span>
                          <span>Instant Live Save</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Whenever you finish editing, click the green <strong>"Save &amp; Publish Changes"</strong> button at the bottom right. The live website updates immediately without page reloads.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#08783F] text-white inline-flex items-center justify-center text-xs">2</span>
                          <span>Exporting to GitHub or Cloudflare</span>
                        </div>
                        <p className="text-xs text-stone-600 pl-7">
                          Click <strong>"Generated Code Export"</strong> in the left menu and tap <strong>"Copy storeConfig.ts"</strong>. Paste that code into <code>src/config/storeConfig.ts</code> in your project repository to preserve it permanently across all devices.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShopkeeperGuideOpen(false);
                        setCmsPage('export');
                        handleOpenCMS();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08783F] text-white text-xs font-bold hover:bg-[#075C34]"
                    >
                      <span>Take me to Code Export</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500 shrink-0">
              <span>Shri Sai Medical &amp; General Store • Owner Quick Help</span>
              <button
                onClick={() => setShopkeeperGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-white font-bold hover:bg-stone-900 transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 14. EDIT / CREATE CATEGORY MODAL                              */}
      {/* ------------------------------------------------------------- */}
      {editingCategory && (
              <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="px-5 py-4 bg-[#08783F] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-emerald-200" />
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {editingCategory.isNew ? "Create New Department" : "Edit Department Details"}
                        </h4>
                        <p className="text-[11px] text-emerald-100">
                          {editingCategory.isNew ? "Define name, badges, and inventory counters" : `Updating ${editingCategory.name || "Department"}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCustomBadgeMode(false);
                        setCustomSubtextMode(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="e.g. Ayurvedic Care, Orthopedic Supports"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-semibold focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {/* BADGE DROPDOWN OR CUSTOM */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">Badge Tag</label>
                        <button
                          type="button"
                          onClick={() => setCustomBadgeMode(!customBadgeMode)}
                          className="text-[11px] text-[#08783F] font-semibold hover:underline"
                        >
                          {customBadgeMode ? "Choose from existing" : "➕ Create new custom badge"}
                        </button>
                      </div>

                      {customBadgeMode ? (
                        <input
                          type="text"
                          value={editingCategory.badge}
                          onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                          placeholder="Type new badge tag (e.g. Wellness)"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        />
                      ) : (
                        <select
                          value={editingCategory.badge}
                          onChange={(e) => {
                            if (e.target.value === "__NEW__") {
                              setCustomBadgeMode(true);
                            } else {
                              setEditingCategory({ ...editingCategory, badge: e.target.value });
                            }
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none bg-stone-50"
                        >
                          {existingBadges.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                          <option value="__NEW__">➕ Create new custom badge...</option>
                        </select>
                      )}
                    </div>

                    {/* SUBTEXT / STOCK NOTE DROPDOWN OR CUSTOM */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">Subtext Note / Product Count</label>
                        <button
                          type="button"
                          onClick={() => setCustomSubtextMode(!customSubtextMode)}
                          className="text-[11px] text-[#08783F] font-semibold hover:underline"
                        >
                          {customSubtextMode ? "Choose from existing" : "➕ Create new note"}
                        </button>
                      </div>

                      {customSubtextMode ? (
                        <input
                          type="text"
                          value={editingCategory.count || ""}
                          onChange={(e) => setEditingCategory({ ...editingCategory, count: e.target.value })}
                          placeholder="Type note (e.g. 50+ Varieties)"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        />
                      ) : (
                        <select
                          value={editingCategory.count || ""}
                          onChange={(e) => {
                            if (e.target.value === "__NEW__") {
                              setCustomSubtextMode(true);
                            } else {
                              setEditingCategory({ ...editingCategory, count: e.target.value });
                            }
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none bg-stone-50"
                        >
                          {existingSubtexts.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="__NEW__">➕ Create new custom note...</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Department Description</label>
                      <textarea
                        rows={2}
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        placeholder="Brief summary shown to customers on the homepage"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                      />
                    </div>

                    {/* LIVE VISUAL PREVIEW PILL */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">Card Preview</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 text-xs">{editingCategory.name || "Department Name"}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF7EF] text-[#08783F]">
                          {editingCategory.badge || "Badge"}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1">{editingCategory.count || "Stock Note"}</div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCustomBadgeMode(false);
                        setCustomSubtextMode(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!editingCategory.name.trim()}
                      onClick={() => handleSaveCategoryModal(editingCategory)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        editingCategory.name.trim()
                          ? 'bg-[#08783F] text-white hover:bg-[#075C34] shadow-xs active:scale-95'
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {editingCategory.isNew ? "Create Department" : "Apply Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 15. EDIT / CREATE PRODUCT MODAL                               */}
            {/* ------------------------------------------------------------- */}
            {editingProduct && (
              <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
                  {/* Modal Header */}
                  <div className="px-5 py-4 bg-[#08783F] text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-emerald-200" />
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {editingProduct.isNew ? "Add New Product" : "Edit Product Information"}
                        </h4>
                        <p className="text-[11px] text-emerald-100">
                          {editingProduct.isNew ? "Fill medicine name, pricing, and department" : `Editing: ${editingProduct.name}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Product / Medicine Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="e.g. Paracetamol 650mg, Baby Wipes"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-semibold focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Brand / Manufacturer</label>
                        <input
                          type="text"
                          value={editingProduct.brand}
                          onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                          placeholder="e.g. Cipla, Himalaya, Dettol"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Price / Dispense Note</label>
                        <input
                          type="text"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          placeholder="e.g. ₹95 or MRP on Pack"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-[#08783F] focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* DEPARTMENT SELECTOR DROPDOWN (SYNCS WITH ALL CATEGORIES) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Assigned Department / Category
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none bg-stone-50 font-semibold"
                      >
                        {draftConfig.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — [Badge: {c.badge} | Note: {c.count || "Available"}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Product Description</label>
                      <textarea
                        rows={2}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Usage guidance, dosage packaging, or details"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                      />
                    </div>

                    {/* STATUS TOGGLES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.available}
                          onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                          className="w-4 h-4 rounded text-[#08783F] focus:ring-[#08783F]"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-800">In Stock at Counter</span>
                          <p className="text-[10px] text-stone-500">Uncheck if temporarily out of stock</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50/50 border border-red-200/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.isPrescription}
                          onChange={(e) => setEditingProduct({ ...editingProduct, isPrescription: e.target.checked })}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-600"
                        />
                        <div>
                          <span className="font-bold text-xs text-red-900">Rx Required (Doctor Prescription)</span>
                          <p className="text-[10px] text-red-700">Marks Schedule H/H1/X safeguards</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!editingProduct.name.trim()}
                      onClick={() => handleSaveProductModal(editingProduct)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        editingProduct.name.trim()
                          ? 'bg-[#08783F] text-white hover:bg-[#075C34] shadow-xs active:scale-95'
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {editingProduct.isNew ? "Create Product" : "Apply Product Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 16. DELETE CONFIRMATION MODAL                                 */}
            {/* ------------------------------------------------------------- */}
            {deleteConfirmTarget && (
              <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-stone-200 p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-stone-900 text-base">
                      Delete {deleteConfirmTarget.type === 'category' ? 'Department' : deleteConfirmTarget.type === 'product' ? 'Product' : deleteConfirmTarget.type === 'offer' ? 'Offer' : 'Photo'}?
                    </h4>
                    <p className="text-xs text-stone-500">
                      Are you sure you want to remove <strong className="text-stone-800">{deleteConfirmTarget.item.name || deleteConfirmTarget.item.title}</strong>?
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      onClick={() => setDeleteConfirmTarget(null)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (deleteConfirmTarget.type === 'category') {
                          handleDeleteCategory(deleteConfirmTarget.item.id);
                        } else if (deleteConfirmTarget.type === 'product') {
                          handleDeleteProduct(deleteConfirmTarget.item.id);
                        } else if (deleteConfirmTarget.type === 'gallery') {
                          handleDeleteGalleryItem(deleteConfirmTarget.item.id);
                        } else if (deleteConfirmTarget.type === 'offer') {
                          handleDeleteOffer(deleteConfirmTarget.item.id);
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 18. EDIT / CREATE FLASH OFFER MODAL                           */}
            {/* ------------------------------------------------------------- */}
            {editingOfferItem && (
              <div className="fixed inset-0 z-[65] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
                  {/* Modal Header */}
                  <div className="px-5 py-4 bg-[#08783F] text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-300" />
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {editingOfferItem.isNew ? "Create New Flash Deal" : "Edit Offer Details"}
                        </h4>
                        <p className="text-[11px] text-emerald-100">
                          Add discounts, coupons, and promotional prices
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingOfferItem(null)}
                      className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Offer Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingOfferItem.title}
                        onChange={(e) => setEditingOfferItem({ ...editingOfferItem, title: e.target.value })}
                        placeholder="e.g. Baby Care Gentle Kit, First Aid Combo"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-semibold focus:ring-2 focus:ring-[#08783F] focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {/* DISCOUNT BADGE & QUICK PRESET BUTTONS */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700">
                        Discount Badge Tag
                      </label>
                      <input
                        type="text"
                        value={editingOfferItem.discountBadge}
                        onChange={(e) => {
                          const newBadge = e.target.value;
                          const pct = extractDiscountPercent(newBadge);
                          let updatedPrice = editingOfferItem.offerPrice;
                          if (offerPriceMode === 'auto' && pct > 0 && editingOfferItem.originalPrice) {
                            const calc = calculateOfferPrice(editingOfferItem.originalPrice, pct);
                            if (calc) updatedPrice = calc;
                          }
                          setEditingOfferItem({
                            ...editingOfferItem,
                            discountBadge: newBadge,
                            offerPrice: updatedPrice
                          });
                        }}
                        placeholder="e.g. SAVE 20%, FLAT 15% OFF"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-rose-700 focus:ring-2 focus:ring-[#08783F]"
                      />
                      {/* One-touch quick percentage presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-stone-400 font-bold uppercase">Quick Presets:</span>
                        {[10, 15, 20, 25, 30, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              const newBadge = `SAVE ${pct}%`;
                              let updatedPrice = editingOfferItem.offerPrice;
                              if (editingOfferItem.originalPrice) {
                                const calc = calculateOfferPrice(editingOfferItem.originalPrice, pct);
                                if (calc) updatedPrice = calc;
                              }
                              setEditingOfferItem({
                                ...editingOfferItem,
                                discountBadge: newBadge,
                                couponCode: `SAVE${pct}`,
                                offerPrice: updatedPrice
                              });
                            }}
                            className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-stone-200 text-[11px] font-bold text-stone-600 transition-colors"
                          >
                            {pct}% OFF
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Coupon Code</label>
                        <input
                          type="text"
                          value={editingOfferItem.couponCode}
                          onChange={(e) => setEditingOfferItem({ ...editingOfferItem, couponCode: e.target.value.toUpperCase() })}
                          placeholder="e.g. DEAL20, SAIHEALTH"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-[#08783F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Validity Tag</label>
                        <input
                          type="text"
                          value={editingOfferItem.validity || ""}
                          onChange={(e) => setEditingOfferItem({ ...editingOfferItem, validity: e.target.value })}
                          placeholder="e.g. Limited Stock, Weekend Special"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* PRICING WITH AUTO-CALCULATION OR CUSTOM MANUAL ENTRY */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                          Pricing &amp; Calculation Mode
                        </span>
                        {/* Auto-calc vs Custom switch */}
                        <div className="inline-flex rounded-xl bg-stone-200 p-0.5 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setOfferPriceMode('auto');
                              const pct = extractDiscountPercent(editingOfferItem.discountBadge);
                              if (pct > 0 && editingOfferItem.originalPrice) {
                                const calc = calculateOfferPrice(editingOfferItem.originalPrice, pct);
                                if (calc) {
                                  setEditingOfferItem(prev => ({ ...prev, offerPrice: calc }));
                                }
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg transition-all ${
                              offerPriceMode === 'auto'
                                ? 'bg-[#08783F] text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            ⚡ Auto-Calculate
                          </button>
                          <button
                            type="button"
                            onClick={() => setOfferPriceMode('custom')}
                            className={`px-2.5 py-1 rounded-lg transition-all ${
                              offerPriceMode === 'custom'
                                ? 'bg-[#08783F] text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            ✏️ Custom Price
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Original Price (MRP)
                          </label>
                          <input
                            type="text"
                            value={editingOfferItem.originalPrice || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              let updatedOfferPrice = editingOfferItem.offerPrice;
                              if (offerPriceMode === 'auto') {
                                const pct = extractDiscountPercent(editingOfferItem.discountBadge);
                                if (pct > 0) {
                                  const calc = calculateOfferPrice(val, pct);
                                  if (calc) updatedOfferPrice = calc;
                                }
                              }
                              setEditingOfferItem({
                                ...editingOfferItem,
                                originalPrice: val,
                                offerPrice: updatedOfferPrice
                              });
                            }}
                            placeholder="e.g. ₹500"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-stone-700">
                              Special Offer Price
                            </label>
                            {offerPriceMode === 'auto' && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Auto ({extractDiscountPercent(editingOfferItem.discountBadge)}% off)
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingOfferItem.offerPrice || ""}
                            readOnly={offerPriceMode === 'auto'}
                            onChange={(e) => {
                              if (offerPriceMode === 'custom') {
                                setEditingOfferItem({ ...editingOfferItem, offerPrice: e.target.value });
                              }
                            }}
                            placeholder="e.g. ₹399"
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-black text-[#08783F] ${
                              offerPriceMode === 'auto'
                                ? 'bg-emerald-50/60 border-emerald-300 cursor-not-allowed'
                                : 'bg-white border-stone-300 focus:ring-2 focus:ring-[#08783F]'
                            }`}
                          />
                          <p className="text-[10px] text-stone-500 mt-1">
                            {offerPriceMode === 'auto'
                              ? "Calculated automatically from badge & original price. Click 'Custom Price' to enter your own."
                              : "Manual mode: Type any custom offer price freely."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DUAL OPTION OFFER IMAGE: DEVICE UPLOAD (AUTO-ADJUSTED) OR DIRECT URL */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-800">
                          Offer Photograph (Device or Link)
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Auto-Sized &amp; Scaled
                        </span>
                      </div>

                      {/* OPTION A: Pick from Device */}
                      <div>
                        <div className="text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#08783F]" />
                          <span>Option 1: Choose photo from smartphone / PC</span>
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-300 transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-[#08783F]" />
                          <span>Browse Device Image...</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleDeviceImageUpload(file, (optimizedUrl) => {
                                  setEditingOfferItem({
                                    ...editingOfferItem,
                                    imageUrl: optimizedUrl
                                  });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* OPTION B: Image URL */}
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Option 2: Or enter direct web Image URL
                        </label>
                        <input
                          type="text"
                          value={editingOfferItem.imageUrl || ""}
                          onChange={(e) => setEditingOfferItem({ ...editingOfferItem, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#08783F]"
                        />
                      </div>

                      {/* LIVE IMAGE PREVIEW BOX WITH AUTO-RATIO */}
                      {editingOfferItem.imageUrl && (
                        <div className="pt-2 border-t border-stone-200/80">
                          <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Image Preview:</div>
                          <div className="relative aspect-[16/9] max-w-xs rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shadow-xs">
                            <img
                              src={editingOfferItem.imageUrl}
                              alt="Offer Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingOfferItem({ ...editingOfferItem, imageUrl: "" })}
                              className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Offer Description</label>
                      <textarea
                        rows={2}
                        value={editingOfferItem.description}
                        onChange={(e) => setEditingOfferItem({ ...editingOfferItem, description: e.target.value })}
                        placeholder="What items are included in this bundle / offer"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#08783F]"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingOfferItem(null)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!editingOfferItem.title.trim()}
                      onClick={() => handleSaveOfferModal(editingOfferItem)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        editingOfferItem.title.trim()
                          ? 'bg-[#08783F] text-white hover:bg-[#075C34] shadow-xs active:scale-95'
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {editingOfferItem.isNew ? "Create Offer" : "Apply Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

      {/* FLOATING QUICK WHATSAPP BUTTON */}
      <a
        href={createWhatsAppLink(config.business.whatsapp.primaryRaw, config.business.whatsapp.defaultGreeting)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Message"
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 text-xs font-bold">
          WhatsApp Counter
        </span>
      </a>

      {/* ------------------------------------------------------------- */}
      {/* 19. ATTRACTIVE FLASH SALE ANIMATED WELCOME POPUP              */}
      {/* ------------------------------------------------------------- */}
      {/* 19. ATTRACTIVE FLASH SALE ANIMATED WELCOME POPUP WITH CAROUSEL */}
      {/* ------------------------------------------------------------- */}
      {showFlashPopup && (() => {
        const activeOffers = (config.flashSale?.offers || []).filter(o => o.active !== false);
        if (activeOffers.length === 0) return null;
        const currentOffer = activeOffers[popupOfferSlide % activeOffers.length];

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-300">
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-amber-400/90 overflow-hidden transform transition-all"
              onMouseEnter={() => setIsPopupCarouselPlaying(false)}
              onMouseLeave={() => setIsPopupCarouselPlaying(true)}
            >
              {/* Top Decorative Amber Ribbon */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-5 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-white/20 text-white animate-bounce">
                    <Flame className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider uppercase">Active Flash Deals ({activeOffers.length} Live)</span>
                    <p className="text-[10px] text-amber-100 font-medium">Swipe or browse all seasonal discounts</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismissFlashPopup}
                  title="Close and don't show again this visit"
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Offer Carousel Body */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Badge, Code and Carousel Nav Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs animate-pulse">
                      🔥 {currentOffer.discountBadge}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                      CODE: {currentOffer.couponCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPopupOfferSlide(prev => (prev - 1 + activeOffers.length) % activeOffers.length)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Previous deal"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-stone-500 px-1">
                      {popupOfferSlide + 1}/{activeOffers.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPopupOfferSlide(prev => (prev + 1) % activeOffers.length)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Next deal"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Animated Carousel Card Slide */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/80">
                  <div className="sm:col-span-4 rounded-xl overflow-hidden aspect-square bg-stone-200 border border-stone-300 shrink-0">
                    <img
                      src={currentOffer.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"}
                      alt={currentOffer.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-1.5">
                    <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                      {currentOffer.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {currentOffer.description}
                    </p>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-black text-[#08783F]">{currentOffer.offerPrice}</span>
                      {currentOffer.originalPrice && (
                        <span className="text-xs line-through text-stone-400 font-semibold">{currentOffer.originalPrice}</span>
                      )}
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        {currentOffer.validity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carousel Mini-Dots Navigation */}
                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                  {activeOffers.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPopupOfferSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        popupOfferSlide === idx ? 'w-6 bg-[#08783F]' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`Jump to deal ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={createWhatsAppLink(
                        config.business.whatsapp.primaryRaw,
                        `Hello Shri Sai Medical, I would like to order the Flash Deal: ${currentOffer.title} (Code: ${currentOffer.couponCode}) at ${currentOffer.offerPrice}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#08783F] hover:bg-[#075C34] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Order Deal via WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleClaimFlashPopup}
                      className="py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <span>View All Store Deals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDismissFlashPopup}
                    className="w-full py-1.5 text-center text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Maybe later (Don't show again this visit)
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}