export interface Watch {
  id: string;
  name: string;
  category: "classic" | "sport" | "minimalist" | "skeleton" | "luxury";
  price: number;
  discountPrice?: number; // Promo discounts
  rating: number;
  image: string;
  description: string;
  specs: {
    movement: string;
    caseMaterial: string;
    glass: string;
    waterResistance: string;
    strapMaterial: string;
  };
  warrantyYears: number;
  inStock: boolean;
  isPopular?: boolean;
}

export interface CustomOptions {
  caseColor: string; // e.g., "#C9A86A" (Champagne Gold), "#0F0F0F" (Rich Black), "#E5E5E5" (Silver)
  dialColor: string; // e.g., Matte Black, Royal Blue, Forest Green, Ivory White
  strapType: string; // "alligator_leather" | "mesh_steel" | "oyster_steel" | "rubber_sport"
  strapColor: string;
  glassType: "Sapphire Crystal" | "Mineral Glass" | "Hardlex";
  engraving?: string; // custom back engraving text
}

export interface CustomWatch {
  id: string;
  baseWatch: Watch;
  customization: CustomOptions;
  extraCost: number;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. watchId + serialization of customization)
  watch: Watch;
  customization?: CustomOptions;
  quantity: number;
}

export interface UserSession {
  emailOrPhone: string;
  isAuthenticated: boolean;
  name?: string;
  isGuest?: boolean;
}

export interface ServiceAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  locationZone: "metro" | "suburban" | "remote"; // Fast service options base
}

export interface Order {
  id: string;
  userEmailOrPhone: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  fastShippingCharge: boolean;
  total: number;
  address: ServiceAddress;
  warrantyCode: string;
  status: "Confirmed" | "In Calibration" | "Quality Assurance" | "Dispatched" | "paid" | "processing" | "shipped" | "delivered";
  date: string;
  createdAt?: number;
}

export interface Review {
  id: string;
  watchId: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}
