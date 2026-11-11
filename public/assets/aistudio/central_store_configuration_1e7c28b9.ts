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
      googleMapsEmbedUrl?: string;
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
  headerElements?: Record<string, boolean>;
  footerElements?: Record<string, boolean>;
  flashSale?: {
    enabled: boolean;
    autoPlay: boolean;
    showWelcomePopup: boolean;
    intervalSeconds: number;
    title: string;
    subtitle: string;
    disclaimer: string;
    offers: Array<{
      id: string;
      title: string;
      discountBadge: string;
      couponCode: string;
      category: string;
      validity: string;
      originalPrice?: string;
      offerPrice: string;
      description: string;
      imageUrl?: string;
      active: boolean;
    }>;
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
    targetSection?: string;
    imageUrl?: string;
  }>;
}

export const STORE_CONFIG: StoreConfig = {
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
    logoType: "initials",
    logoBadgeText: "SS",
    logoShape: "squircle",
    logoCustomUrl: "",
    badgeBorderAccent: "gold",
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
    showWelcomePopup: true,
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
    speedSeconds: 70,
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
    }
  ]
};

export default STORE_CONFIG;