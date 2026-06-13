import { Watch, Review } from "./types";

export const CUSTOMIZED_IMAGE = "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=800&auto=format&fit=crop";

export const WATCHES: Watch[] = [
  {
    id: "time-01",
    name: "Onyx Tourbillon",
    category: "skeleton",
    price: 4499,
    discountPrice: 3999, // Specially updated > 2000
    rating: 4.9,
    image: CUSTOMIZED_IMAGE,
    description: "Our crown jewel. A spectacular skeleton masterpiece featuring an intricate manual-wind flying tourbillon, housed in an obsidian-coated steel casing with physical vapor deposition (PVD). Fully customizable face options.",
    specs: {
      movement: "Symphony Caliber 18 Tourbillon",
      caseMaterial: "Obsidian PVD Steel (41mm)",
      glass: "Double-Domed Sapphire Crystal",
      waterResistance: "5 ATM (50m)",
      strapMaterial: "Alligator Leather"
    },
    warrantyYears: 5,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-02",
    name: "Champagne Monarch",
    category: "luxury",
    price: 2850,
    discountPrice: 2480, // Specially updated > 2000
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop",
    description: "A timeless minimalist model radiating vintage prestige. The Champagne Monarch features physical golden hands set on an elegant cream dial, completed with a solid metallic mesh bracelet.",
    specs: {
      movement: "Swiss Ronda Quartz",
      caseMaterial: "Champagne Gold plated (39mm)",
      glass: "Sapphire Crystal",
      waterResistance: "3 ATM (30m)",
      strapMaterial: "Stainless Mesh"
    },
    warrantyYears: 3,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-03",
    name: "Ascent Chronograph",
    category: "sport",
    price: 2550,
    discountPrice: 2140, // Specially updated > 2000
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
    description: "Built for endurance and action. Features highly resilient mechanical column-wheel chronograph with tachymeter, rugged sub-dials, and glow-in-the-dark indexes.",
    specs: {
      movement: "Automatic Chrono Caliber 400",
      caseMaterial: "Titanium Alloy (43mm)",
      glass: "Scratch-resistant Hardlex",
      waterResistance: "10 ATM (100m)",
      strapMaterial: "Fluoroelastomer Rubber"
    },
    warrantyYears: 4,
    inStock: true
  },
  {
    id: "time-04",
    name: "Ivory Minimalist",
    category: "minimalist",
    price: 2350,
    discountPrice: 2099, // Specially updated > 2000
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop",
    description: "Simplicity redefined. An ultra-thin profile with an unblemished ivory dial, elegant black markers, and a mastercrafted brown genuine leather strap.",
    specs: {
      movement: "Citizen Miyota Quartz",
      caseMaterial: "Polished Stainless Steel (40mm)",
      glass: "Mineral Glass",
      waterResistance: "Splash-proof",
      strapMaterial: "Italian Calfskin"
    },
    warrantyYears: 2,
    inStock: true
  },
  {
    id: "time-05",
    name: "Aero Stealth Carbon",
    category: "sport",
    price: 3250,
    discountPrice: 2950, // Specially updated > 2000
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800&auto=format&fit=crop",
    description: "Machined from forged carbon fiber, a high-tech tactical watch designed with an aeronautical aesthetic. Near indestructible, featherlight, and incredibly sleek.",
    specs: {
      movement: "Auto-Winding Tactical Miyota",
      caseMaterial: "Forged Carbon Fiber (42mm)",
      glass: "Anti-Reflective Sapphire",
      waterResistance: "20 ATM (200m)",
      strapMaterial: "Mil-Spec Cordura"
    },
    warrantyYears: 5,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-06",
    name: "Vanguard Heritage",
    category: "classic",
    price: 2950, // Specially updated > 2000
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1619134778706-7015533a6150?q=80&w=800&auto=format&fit=crop",
    description: "A modern homage to classic watchmaking. Built with a pristine automatic self-winding mechanism visible through an open heart dial at 9 o'clock.",
    specs: {
      movement: "Seiko NH38 Automatic",
      caseMaterial: "Brushed 316L Steel (40mm)",
      glass: "Curved Mineral Glass",
      waterResistance: "5 ATM (50m)",
      strapMaterial: "Handmade Suede Leather"
    },
    warrantyYears: 3,
    inStock: true
  },
  {
    id: "time-07",
    name: "Hyperion Sapphire Skeleton",
    category: "skeleton",
    price: 4800,
    discountPrice: 4200,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop",
    description: "A breathtaking skeleton architecture utilizing space-age sapphire crystal plates as the structural bridges. Offers an uninterrupted 360-degree theater of ticking gears.",
    specs: {
      movement: "Perpetual Caliber S20 Co-Axial",
      caseMaterial: "Anodized Titanium (41.5mm)",
      glass: "Double-Domed AR Sapphire",
      waterResistance: "5 ATM (50m)",
      strapMaterial: "Full Grain Tuscan Suede"
    },
    warrantyYears: 5,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-08",
    name: "Titanium Eclipse Skeleton",
    category: "skeleton",
    price: 4100,
    discountPrice: 3600,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop",
    description: "Artistry meets rugged modernism. Features an asymmetrical skeleton build, open escapement wheel, and precision micro-sandblasted titanium finish.",
    specs: {
      movement: "Atelier NH70 Skeleton Auto",
      caseMaterial: "Sandblasted Titanium (42mm)",
      glass: "Curved Sapphire Crystal",
      waterResistance: "10 ATM (100m)",
      strapMaterial: "High-Tensile FKM Rubber"
    },
    warrantyYears: 4,
    inStock: true
  },
  {
    id: "time-09",
    name: "Royal Emerald Emperor",
    category: "luxury",
    price: 5400,
    discountPrice: 4850,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
    description: "An regal watch radiating status and design perfection. Features a glorious royal emerald-green sunburst face, fluted hand-crafted bezel, and diamond-cut physical hour markings.",
    specs: {
      movement: "Geneva Caliber Gold-Standard",
      caseMaterial: "18k Rose Gold Plated (40mm)",
      glass: "Verifiable Anti-Reflective Scratchproof",
      waterResistance: "5 ATM (50m)",
      strapMaterial: "Polished Oyster-Link Steel"
    },
    warrantyYears: 5,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-10",
    name: "Lumina Platinum Datejust",
    category: "luxury",
    price: 4600,
    discountPrice: 4100,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop",
    description: "A gorgeous, high-class vintage display model designed for high-end ceremonies. Embellished with luminous hands, classic date cyclops magnifier, and matching oyster steel links.",
    specs: {
      movement: "Bespoke Chronometer Certified Auto",
      caseMaterial: "Solid Platinum Finish Alloy (41mm)",
      glass: "Sapphire with Cyclops Magnifier",
      waterResistance: "10 ATM (100m)",
      strapMaterial: "Platinum Finish Triple Link"
    },
    warrantyYears: 5,
    inStock: true
  },
  {
    id: "time-11",
    name: "DeepSea Mariner Pro",
    category: "sport",
    price: 3400,
    discountPrice: 2990,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=800&auto=format&fit=crop",
    description: "The ultimate tool for deep sea navigation. Features a premium unidirectional ceramic rotating bezel with dynamic luminous markers and water-tight double gaskets.",
    specs: {
      movement: "Miyota Calber 9015 High-Beat",
      caseMaterial: "Marine-Grade 316S Steel (43.5mm)",
      glass: "Explosion-Proof Sapphire (4mm)",
      waterResistance: "30 ATM (300m)",
      strapMaterial: "Corrosion-Resistant Steel Mesh"
    },
    warrantyYears: 4,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-12",
    name: "Nürburg Racing Tachymeter",
    category: "sport",
    price: 2990,
    discountPrice: 2490,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
    description: "Revived from classic motorsports era. Featuring an accurate racetrack stopwatch layout, high-integrity red chrono needles, and a tire-tread textured strap.",
    specs: {
      movement: "Meca-Quartz Hybrid Movement",
      caseMaterial: "PVD Matte Carbon Black Steel (42.5mm)",
      glass: "Heavily Coated Hardlex",
      waterResistance: "10 ATM (100m)",
      strapMaterial: "Perforated Racing Calfskin"
    },
    warrantyYears: 3,
    inStock: true
  },
  {
    id: "time-13",
    name: "Sandalwood Charcoal Quartz",
    category: "minimalist",
    price: 2700,
    discountPrice: 2250,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800&auto=format&fit=crop",
    description: "Experience organic earthiness integrated into Swiss precision. Features sandblasted bronze case bezel, a textured charcoal concrete-gray dial, and wooden crown insert.",
    specs: {
      movement: "Precision Ronda Slim Quartz",
      caseMaterial: "Bronze Gold-Coated Alloy (40mm)",
      glass: "Flat Sapphire Face",
      waterResistance: "Splash-proof",
      strapMaterial: "Organic Distressed Leather"
    },
    warrantyYears: 3,
    inStock: true
  },
  {
    id: "time-14",
    name: "Nordic Alabaster Slim",
    category: "minimalist",
    price: 2450,
    discountPrice: 2150,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop",
    description: "Sleek and stark as Scandinavian landscapes. Boasts an ultra-low 6.2mm case thickness, solid silver linear pins, and an elegant white face.",
    specs: {
      movement: "Ultra-Thin Citizen Quartz",
      caseMaterial: "Polished Stainless Silver (38mm)",
      glass: "Shatter-Resistant Glass Block",
      waterResistance: "3 ATM (30m)",
      strapMaterial: "Vegetable-Tanned Tan Leather"
    },
    warrantyYears: 2,
    inStock: true
  },
  {
    id: "time-15",
    name: "Geneva Perpetual Calendar",
    category: "classic",
    price: 3900,
    discountPrice: 3450,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop",
    description: "A magnificent collector's tribute model keeping perpetual track of calendars, featuring day sub-dial, date ring track, and realistic custom moon-phase rotating dial.",
    specs: {
      movement: "Automatic Perpetual Caliber L20",
      caseMaterial: "Polished Rose Gold finish (41mm)",
      glass: "Anti-Reflective Double-Chamber Sapphire",
      waterResistance: "5 ATM (50m)",
      strapMaterial: "Embossed Alligator Black Strap"
    },
    warrantyYears: 5,
    inStock: true,
    isPopular: true
  },
  {
    id: "time-16",
    name: "Heirloom Antique Rose",
    category: "classic",
    price: 3100,
    discountPrice: 2790,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop",
    description: "Nostalgia and high-integrity craftmanship combined. Styled with lovely traditional spade hands, railway tracking subseconds indicator, and charming vintage lugs.",
    specs: {
      movement: "Hand-wound Classic Seiko Mechanical",
      caseMaterial: "Traditional Rose Finish (39mm)",
      glass: "Domed Hesalite Retro Style",
      waterResistance: "Splash-proof",
      strapMaterial: "English Suede Tan Leather"
    },
    warrantyYears: 3,
    inStock: true
  }
];

export const LOCATION_ZONES = [
  {
    id: "metro",
    name: "Metropolitan Areas (Hubs)",
    description: "Major cities and surrounds. Express dispatch is exceptionally swift here.",
    baseShipping: 10,
    fastShippingCharge: 20, // Extra upgrade
    fastDeliveryTime: "Same/Next Day Delivery",
    baseDeliveryTime: "2-3 Business Days"
  },
  {
    id: "suburban",
    name: "Suburban & Regional Centers",
    description: "Regional territories and satellite suburbs.",
    baseShipping: 18,
    fastShippingCharge: 35,
    fastDeliveryTime: "1-2 Days Guaranteed",
    baseDeliveryTime: "3-5 Business Days"
  },
  {
    id: "remote",
    name: "Remote & Outer Districts",
    description: "Interstate outer areas and mountainous regions.",
    baseShipping: 28,
    fastShippingCharge: 55,
    fastDeliveryTime: "3-4 Days Express",
    baseDeliveryTime: "7-10 Business Days"
  }
];

export const COLOR_PALETTE = {
  primary: "#0F1E36",      // Sapphire (Deep Luxurious Navy)
  secondary: "#1E3A8A",    // Royal Blue
  accent: "#C5A880",       // Quick Sand
  background: "#F9F9FB",   // Swan Wing (Soft pristine white)
  cardBg: "#E7E2D8",       // Shell Stone (Limestone beige stone)
  text: "#1A1A1A",         // Charcoal Black
  success: "#2E8B57",      // Emerald Green
  error: "#C62828"         // Crimson Red
};

export const CUSTOMIZATION_PRESETS = {
  caseColors: [
    { name: "Sapphire Steel", hex: "#0F1E36", cost: 150 },
    { name: "Quick Sand Gold", hex: "#C5A880", cost: 180 },
    { name: "Obsidian Black", hex: "#0F0F0F", cost: 100 },
    { name: "Chrome Silver", hex: "#E5E5E5", cost: 0 },
  ],
  dialColors: [
    { name: "Sapphire Deep Ocean", hex: "#0F1E36" },
    { name: "Sunburst Royal Blue", hex: "#1E3A8A" },
    { name: "Swan Wing White", hex: "#F9F9FB" },
    { name: "Shell Stone Limestone", hex: "#E7E2D8" },
    { name: "Emerald Sunburst", hex: "#064E3B" },
  ],
  straps: [
    { name: "Alligator Leather (Chestnut)", id: "alligator_chestnut", cost: 120 },
    { name: "Alligator Leather (Black)", id: "alligator_black", cost: 120 },
    { name: "Milanese Loop Quick Sand Mesh", id: "mesh_gold", cost: 80 },
    { name: "Solid Oyster Link Steel (Silver)", id: "oyster_silver", cost: 100 },
    { name: "Tactical Rubber Strap (Matte)", id: "rubber_sport", cost: 40 },
  ],
  glasses: [
    { name: "Sapphire Crystal (Double-Domed, Scratch-proof)", id: "Sapphire Crystal", cost: 150 },
    { name: "Mineral Toughened Glass", id: "Mineral Glass", cost: 40 },
    { name: "Hardlex Tempered Classic", id: "Hardlex", cost: 0 },
  ]
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-01",
    watchId: "time-01",
    author: "Richard B. (Certified Enthusiast)",
    rating: 5,
    comment: "Absolutely phenomenal gravity-defying tourbillon. The skeletal movement is mesmerizing and keeps pristine time. True luxury.",
    date: "2026-05-18"
  },
  {
    id: "rev-02",
    watchId: "time-01",
    author: "Helena V.",
    rating: 5,
    comment: "A modern horological masterpiece. It is easily the centerpiece of my premium watch collection. Highly customizable, brilliant build.",
    date: "2026-06-02"
  },
  {
    id: "rev-03",
    watchId: "time-02",
    author: "James K.",
    rating: 5,
    comment: "The champagne gold is subtle and elegant. It looks outstanding under evening light. Received countless inquiries during our anniversary evening.",
    date: "2026-04-20"
  },
  {
    id: "rev-04",
    watchId: "time-02",
    author: "Clara P.",
    rating: 4,
    comment: "Incredible vintage charm with a thin profile and exceptionally solid gold-mesh band. Highly stylish.",
    date: "2025-12-14"
  },
  {
    id: "rev-05",
    watchId: "time-03",
    author: "Cmdr. Marcus Tyler",
    rating: 5,
    comment: "Built like an absolute tank. I have taken it on high mountain climbing sessions and rugged dive runs. Spotlessly resilient.",
    date: "2026-05-30"
  },
  {
    id: "rev-06",
    watchId: "time-04",
    author: "Liam H.",
    rating: 4,
    comment: "Minimalist perfection. Unblemished ivory dial and ultra-thin case that slips comfortably under any office cuff. Supple Italian calfskin.",
    date: "2026-06-10"
  },
  {
    id: "rev-07",
    watchId: "time-05",
    author: "Major Vance Miller",
    rating: 5,
    comment: "Remarkably lightweight yet near-indestructible forged carbon tactical model. Black-stealth face is extremely tactile.",
    date: "2026-03-24"
  },
  {
    id: "rev-08",
    watchId: "time-06",
    author: "Pierre S.",
    rating: 5,
    comment: "The mechanical open heart layout breathes beautifully at 9 o'clock. Superb value for a genuine mechanical automatic watch.",
    date: "2026-05-11"
  }
];
