import React, { useState, useEffect } from "react";
import { UserSession, CartItem, Watch, CustomOptions, ServiceAddress, Order, Review } from "./types";
import { WATCHES, LOCATION_ZONES, COLOR_PALETTE, INITIAL_REVIEWS } from "./data";
import AuthScreen from "./components/AuthScreen";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import WatchCard from "./components/WatchCard";
import CustomizerModal from "./components/CustomizerModal";
import ProductDetailModal from "./components/ProductDetailModal";
import SmartRecommender from "./components/SmartRecommender";
import Chatbot from "./components/Chatbot";
import OrderStatusTimelineChart from "./components/OrderStatusTimelineChart";
import { 
  ShoppingBag, Trash2, Shield, Flame, Truck, Check, Heart, Mail, MessageSquare, Phone, 
  MapPin, HelpCircle, ArrowRight, ShieldCheck, CreditCard, Sparkles, AlertCircle, Search,
  Link, Share2
} from "lucide-react";

export default function App() {
  // 1. Session State
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("time_active_session");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Tab Navigation
  const [activeTab, setActiveTab] = useState<string>("home");

  // 3. E-commerce Basket & Saved Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("time_user_cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState<Watch[]>(() => {
    const saved = localStorage.getItem("time_user_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Customizer Studio triggers
  const [customizerWatch, setCustomizerWatch] = useState<Watch | null>(null);

  // 10. Customer Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("time_product_reviews");
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // 11. Selected watch for Product Detail view modal
  const [selectedDetailWatch, setSelectedDetailWatch] = useState<Watch | null>(null);

  // 12. Share tracking states
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  // 5. Dynamic location courier metrics
  const [shippingLocation, setShippingLocation] = useState<string>("metro");
  const [fastShippingUpgrade, setFastShippingUpgrade] = useState<boolean>(false);

  // 6. Placed Orders history
  const [placedOrders, setPlacedOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("time_placed_orders");
    return saved ? JSON.parse(saved) : [];
  });

  // 7. Shipping Address Form
  const [shippingAddress, setShippingAddress] = useState<ServiceAddress>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    locationZone: "metro"
  });

  // 8. Contact Form states
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // 9. Payment Checkout Processing
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod" | "upi" | "wire">("card");
  const [upiId, setUpiId] = useState("");
  const [bankTxRef, setBankTxRef] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "shipping" | "payment" | "success">("review");
  const [recentOrderCode, setRecentOrderCode] = useState<string | null>(null);
  const [recentWarrantyCode, setRecentWarrantyCode] = useState<string | null>(null);

  // 10. Filter & Search
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Sync state changes to storage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem("time_active_session", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("time_active_session");
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem("time_user_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("time_user_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("time_placed_orders", JSON.stringify(placedOrders));
  }, [placedOrders]);

  useEffect(() => {
    localStorage.setItem("time_product_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Check URL parameters for direct tracking share link on mount/launch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const orderIdParam = params.get("orderId");
    if (tabParam === "orders" || orderIdParam) {
      setActiveTab("orders");
      if (orderIdParam) {
        setHighlightedOrderId(orderIdParam);
        // Fade out the highlight after some time
        setTimeout(() => {
          setHighlightedOrderId(null);
        }, 10000);
      }
    }
  }, []);

  // Poll order tracking statuses if there are any that aren't Dispatched/delivered
  useEffect(() => {
    if (placedOrders.length === 0) return;

    const hasActiveOrders = placedOrders.some(
      order => order.status !== "Dispatched" && order.status !== "delivered" && order.status !== "shipped"
    );
    if (!hasActiveOrders) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch("/api/orders/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderList: placedOrders })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.orders) {
            const oldStatusStr = JSON.stringify(placedOrders.map(o => o.status));
            const newStatusStr = JSON.stringify(data.orders.map((o: any) => o.status));
            if (oldStatusStr !== newStatusStr) {
              setPlacedOrders(data.orders);
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync tracking status:", err);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [placedOrders]);

  const handleAddReview = (watchId: string, author: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      watchId,
      author,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0]
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const handleCopyTrackingLink = (orderId: string) => {
    const trackingUrl = `${window.location.origin}?tab=orders&orderId=${orderId}`;
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopiedOrderId(orderId);
      setTimeout(() => {
        setCopiedOrderId(null);
      }, 3000);
    }).catch((err) => {
      console.warn("Could not copy link to clipboard:", err);
    });
  };

  // Auth Callbacks
  const handleLoginSuccess = (emailOrPhone: string, name: string) => {
    setUserSession({ emailOrPhone, name, isAuthenticated: true });
    setActiveTab("home");
  };

  const handleContinueAsGuest = () => {
    setUserSession({ emailOrPhone: "guest@atelier.com", name: "Guest Specialist", isAuthenticated: false, isGuest: true });
    setActiveTab("home");
  };

  const handleLogout = () => {
    setUserSession(null);
    setCart([]);
    setWishlist([]);
    setActiveTab("home");
  };

  // Cart operations
  const handleAddToCart = (watch: Watch, customization?: CustomOptions) => {
    const cartItemId = customization 
      ? `${watch.id}-${JSON.stringify(customization)}` 
      : `base-${watch.id}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: cartItemId, watch, customization, quantity: 1 }];
    });

    // Alert notification simulation
    setActiveTab("cart");
    setCheckoutStep("review");
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleUpdateQuantity = (cartItemId: string, newAmt: number) => {
    if (newAmt <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newAmt } : item));
  };

  // Wishlist toggle
  const handleToggleWishlist = (watch: Watch) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === watch.id);
      if (exists) {
        return prev.filter(item => item.id !== watch.id);
      }
      return [...prev, watch];
    });
  };

  // Contact Experts form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(null);
    setContactLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContactSuccess(data.message);
      setContactForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setContactLoading(false);
    }
  };

  // Handle smart layout loading config
  const handleApplyWatchConfiguration = (watch: Watch, suggestedParts: any) => {
    // Inject suggested configurations and trigger the customized watch workbench modal!
    setCustomizerWatch(watch);
  };

  // Checkout Calculations based on Location zone surcharges
  const cartSubtotal = cart.reduce((acc, item) => {
    const basePrice = item.watch.discountPrice || item.watch.price;
    // Calculate custom build extra cost if custom presets selected
    let extra = 0;
    if (item.customization) {
      if (item.customization.caseColor.includes("Gold")) extra += 150;
      if (item.customization.strapType.includes("Leather")) extra += 120;
      if (item.customization.strapType.includes("Mesh")) extra += 80;
      if (item.customization.glassType.includes("Sapphire")) extra += 150;
      if (item.customization.glassType.includes("Mineral")) extra += 40;
    }
    return acc + (basePrice + extra) * item.quantity;
  }, 0);

  const activeZoneMeta = LOCATION_ZONES.find(zone => zone.id === shippingLocation) || LOCATION_ZONES[0];
  const dynamicShippingCost = activeZoneMeta.baseShipping;
  const dynamicFastServiceCost = fastShippingUpgrade ? activeZoneMeta.fastShippingCharge : 0;
  const totalBillCost = cartSubtotal + dynamicShippingCost + dynamicFastServiceCost;

  // Complete Checkout Placement Simulation
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple verification check to make sure fields loaded
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      alert("Please enter all required shipping coordinates.");
      return;
    }

    if (paymentMethod === "card") {
      if (cardDetails.number.length < 16 || cardDetails.cvc.length < 3) {
        alert("Please enter a valid credit card credentials layout.");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        alert("Please enter a valid UPI ID structure (e.g., name@okaxis or phone@ybl).");
        return;
      }
    } else if (paymentMethod === "wire") {
      if (!bankTxRef.trim() || bankTxRef.trim().length < 8) {
        alert("Please enter a valid Bank Wire Transaction Reference (minimum 8 alphanumeric characters).");
        return;
      }
    }

    setIsPaying(true);

    try {
      const orderPayload = {
        items: cart,
        subtotal: cartSubtotal,
        shippingCost: dynamicShippingCost,
        fastShippingCharge: fastShippingUpgrade,
        address: { ...shippingAddress, locationZone: shippingLocation },
        total: totalBillCost,
        paymentMethod,
        paymentDetails: paymentMethod === "card" 
          ? { cardMask: `•••• •••• •••• ${cardDetails.number.slice(-4)}` }
          : paymentMethod === "upi" 
          ? { upiId }
          : paymentMethod === "wire" 
          ? { bankTxRef }
          : { mode: "Cash on Delivery" }
      };

      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Save order locally
      setPlacedOrders(prev => [data.order, ...prev]);
      setRecentOrderCode(data.order.id);
      setRecentWarrantyCode(data.order.warrantyCode);
      
      // Clear shopping bag
      setCart([]);
      setCheckoutStep("success");
      alert("Order Confirmed! Your bespoke chronometer order was successfully processed via " + 
        (paymentMethod === "card" ? "Credit Card" : paymentMethod === "upi" ? "UPI Link" : paymentMethod === "wire" ? "Bank Wire" : "Cash on Delivery") + 
        ". Reference Ledger ID: " + data.order.id);
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    } finally {
      setIsPaying(false);
    }
  };

  // Filter conditions
  const filteredProducts = WATCHES.filter(watch => {
    const matchesSearch = watch.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          watch.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "all" ? true : watch.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Secure user validation wrapper
  if (!userSession) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-swanwing text-[#1A1A1A] font-sans selection:bg-quicksand selection:text-white">
      
      {/* Premium Top Bar */}
      <Navigation 
        userSession={userSession} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        wishlistCount={wishlist.length} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Main Container Stage */}
      <main className="flex-1">
        
        {/* TAB: CATALOG DEFAULT LANDING VIEW */}
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-in" id="catalogue-tab">
            
            {/* Elegant Hero Slider Banner */}
            <Hero 
              onStartCustomizing={() => {
                // Instantly open customization workbench starting with Onyx Tourbillon
                setCustomizerWatch(WATCHES[0]);
              }} 
              onExploreAI={() => {
                setActiveTab("recommender");
              }} 
            />

            {/* Exclusive watch collections catalog selection stage */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-8">
              
              {/* Refined filtering, categories and search elements */}
              <div className="bg-white rounded-xl shadow-sm border border-shellstone p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by watch name or movement..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                  />
                </div>

                {/* Styled category chips */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                  {["all", "luxury", "skeleton", "sport", "minimalist", "classic"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border transition-all cursor-pointer ${categoryFilter === cat ? "bg-sapphire text-white border-transparent" : "bg-white text-gray-500 border-shellstone hover:border-quicksand/40"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections Grid */}
              <div className="space-y-4">
                <div className="text-left border-l-2 border-quicksand pl-3.5">
                  <h2 className="text-2xl font-serif text-sapphire tracking-tight">Premium Series Catalog</h2>
                  <p className="text-xs text-gray-500">Each piece calibrated by certified artisans and packed with dynamic smart-options.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredProducts.map((watch) => (
                    <WatchCard
                      key={watch.id}
                      watch={watch}
                      isWishlisted={!!wishlist.find(w => w.id === watch.id)}
                      onCustomize={(selected) => setSelectedDetailWatch(selected)}
                      onAddToCart={(selected) => handleAddToCart(selected)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-3">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                    <h3 className="text-base font-serif text-gray-800">No masterpieces match your queries</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">Try typing another watch movement specification or switch back to the 'All' collections tab.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB: SMART MULTIMODAL RECOMMENDER */}
        {activeTab === "recommender" && (
          <div className="animate-fade-in" id="ai-recommender-tab">
            <SmartRecommender onApplyWatchConfiguration={handleApplyWatchConfiguration} />
          </div>
        )}

        {/* TAB: DESIGN STUDIO PORTAL LANDING OR DIRECT */}
        {activeTab === "customizer" && (
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 text-center space-y-6 animate-fade-in" id="customizer-blank-tab">
            <div className="max-w-md mx-auto bg-white border border-shellstone shadow-xl p-8 rounded-2xl space-y-6">
              <div className="w-12 h-12 bg-swanwing border border-quicksand/40 rounded-full flex items-center justify-center mx-auto">
                ⚔
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-light text-sapphire">Select Base Masterpiece</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  To open the physical custom design workbench, please choose one signature platform from our catalog to paint, embellish, and customize under our watchmakers.
                </p>
              </div>

              <div className="space-y-2.5">
                {WATCHES.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setCustomizerWatch(w)}
                    className="w-full flex items-center justify-between p-3.5 bg-swanwing text-xs hover:border-quicksand transition-all rounded-lg border border-shellstone cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={w.image} alt={w.name} className="w-9 h-9 object-cover rounded-md" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-semibold block text-sapphire group-hover:text-quicksand">{w.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{w.category}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700">₹{(w.discountPrice || w.price).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: SHOPPING BASKET DIRECT VIEW */}
        {activeTab === "cart" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fade-in" id="checkout-tab">
            <h2 className="text-3xl font-serif font-light text-[#0F0F0F] tracking-tight text-left mb-8">Bespoke Checkout Ledger</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white border border-shellstone p-8 rounded-2xl space-y-4 max-w-md mx-auto shadow animate-fade-in">
                <ShoppingBag className="w-12 h-12 text-quicksand/45 mx-auto" />
                <div>
                  <h3 className="text-lg font-serif text-sapphire font-bold">Shopping bag is empty</h3>
                  <p className="text-xs text-gray-500 mt-1">Populate it with customized catalog designs or ask the AI style guide for advice.</p>
                </div>
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-6 py-3.5 bg-sapphire text-white text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-quicksand hover:text-sapphire transition-all cursor-pointer"
                >
                  Explore Collection catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Review, details and progress */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Ledger Progress Header */}
                  <div className="bg-white rounded-xl shadow-xs border border-shellstone p-4 flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                    <button 
                      onClick={() => setCheckoutStep("review")}
                      className={`flex-1 text-center py-1 ${checkoutStep === "review" ? "text-quicksand border-b-2 border-quicksand font-bold" : "hover:text-sapphire"}`}
                    >
                      1. Review Cart
                    </button>
                    <button 
                      onClick={() => { if (cart.length > 0) setCheckoutStep("shipping"); }}
                      className={`flex-1 text-center py-1 ${checkoutStep === "shipping" ? "text-quicksand border-b-2 border-quicksand font-bold" : "hover:text-sapphire"}`}
                    >
                      2. Shipping Address
                    </button>
                    <button 
                      className={`flex-1 text-center py-1 ${checkoutStep === "payment" ? "text-quicksand border-b-2 border-quicksand font-bold" : ""}`}
                      disabled
                    >
                      3. Secure Vault Payment
                    </button>
                  </div>

                  {/* STEP 1: CART REVIEW LIST */}
                  {checkoutStep === "review" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                        {cart.map((item) => {
                          const watchPrice = item.watch.discountPrice || item.watch.price;
                          let extraCost = 0;
                          
                          if (item.customization) {
                            if (item.customization.caseColor.includes("Gold")) extraCost += 150;
                            if (item.customization.strapType.includes("Leather")) extraCost += 120;
                            if (item.customization.strapType.includes("Mesh")) extraCost += 80;
                            if (item.customization.glassType.includes("Sapphire")) extraCost += 150;
                            if (item.customization.glassType.includes("Mineral")) extraCost += 40;
                          }
                          const singleItemTotal = watchPrice + extraCost;

                          return (
                            <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                              <div className="flex gap-4 items-center">
                                <img
                                  src={item.watch.image}
                                  alt={item.watch.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  referrerPolicy="no-referrer"
                                />

                                <div className="text-left space-y-1">
                                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                                    {item.watch.category}
                                  </span>
                                  <h4 className="text-sm font-semibold font-serif text-gray-900">{item.watch.name}</h4>
                                  
                                  {item.customization ? (
                                    <div className="text-[10px] text-gray-500 font-sans space-y-0.5 font-medium">
                                      <div>Case: <span className="text-gray-900 font-semibold">{item.customization.caseColor}</span></div>
                                      <div>Strap: <span className="text-gray-900 font-semibold">{item.customization.strapType}</span></div>
                                      <div>Glass: <span className="text-quicksand font-bold">{item.customization.glassType}</span></div>
                                      {item.customization.engraving && (
                                        <div className="font-mono text-[9px] text-[#10B981] bg-swanwing border border-shellstone p-1 rounded inline-block mt-1">Laser: "{item.customization.engraving}"</div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-gray-400">Default Luxury Configuration</div>
                                  )}
                                </div>
                              </div>

                              {/* Quantity increments & and pricing calculation */}
                              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-1">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="w-6.5 h-6.5 text-xs font-bold hover:bg-gray-100 rounded flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-mono w-5 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-6.5 h-6.5 text-xs font-bold hover:bg-gray-100 rounded flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="text-right">
                                  <span className="text-xs font-mono text-gray-400 block sm:hidden">Price</span>
                                  <span className="text-sm font-bold font-mono text-gray-900 block">₹{(singleItemTotal * item.quantity).toLocaleString()}</span>
                                  {item.quantity > 1 && (
                                    <span className="text-[10px] font-mono text-gray-400 block">₹{singleItemTotal.toLocaleString()} each</span>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  className="p-2 text-gray-300 hover:text-[#C62828] transition-colors"
                                  title="Erase item from ledger"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setCheckoutStep("shipping")}
                          className="px-6 py-3 bg-sapphire text-white hover:bg-quicksand hover:text-sapphire rounded-lg text-xs uppercase font-bold tracking-widest transition-all shadow flex items-center gap-2 cursor-pointer"
                          style={{ minHeight: "44px" }}
                        >
                          <span>Proceed to Shipping Address</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SHIPPING AND LOCATION ADDRESS */}
                  {checkoutStep === "shipping" && (
                    <form 
                      onSubmit={(e) => { 
                        e.preventDefault(); 
                        setCheckoutStep("payment"); 
                      }} 
                      className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6 text-left"
                    >
                      <h3 className="text-base font-serif text-sapphire border-b border-shellstone pb-2 font-bold">Atelier Delivery Location & Surcharges</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Recipient Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Johnathan Archer"
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Contact phone details</label>
                          <input
                            type="tel"
                            required
                            placeholder="+1 555-019-2834"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Street Address</label>
                          <input
                            type="text"
                            required
                            placeholder="19 Enterprise Way, Penthouse Suite 7"
                            value={shippingAddress.street}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">City</label>
                          <input
                            type="text"
                            required
                            placeholder="Metropolis"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">State / Province</label>
                          <input
                            type="text"
                            required
                            placeholder="NY"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Postal / ZIP Code</label>
                          <input
                            type="text"
                            required
                            placeholder="10001"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Zone Class (Affects Shipping Cost)</label>
                          <select
                            value={shippingLocation}
                            onChange={(e) => setShippingLocation(e.target.value)}
                            className="w-full px-3 py-2 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs cursor-pointer"
                          >
                            <option value="metro">Metropolitan Hub Surcharge</option>
                            <option value="suburban">Suburban Regional Center Surcharge</option>
                            <option value="remote">Remote Distant District Surcharge</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-shellstone">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep("review")}
                          className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500 font-bold hover:text-quicksand transition-colors"
                        >
                          Back to Ledger
                        </button>

                        <button
                          type="submit"
                          className="px-6 py-3 bg-sapphire text-white hover:bg-quicksand hover:text-sapphire rounded-lg text-xs uppercase font-bold tracking-widest transition-all shadow flex items-center gap-2 cursor-pointer"
                          style={{ minHeight: "44px" }}
                        >
                          <span>Proceed to Payment Vault</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: VAULT PAYMENT CAPTURE */}
                  {checkoutStep === "payment" && (
                    <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl border border-shellstone p-6 sm:p-8 space-y-6 text-left animate-fade-in">
                      <div className="space-y-1">
                        <h3 className="text-base font-serif text-sapphire font-bold">Bespoke Escrow Settlement</h3>
                        <p className="text-[11px] text-gray-400">All transactions are secured with top-tier verification filters and cryptographic hashing.</p>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-gray-500 font-extrabold">Select Atelier Payment Methodology</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "card", label: "Credit Card", desc: "Secure Online Card" },
                            { id: "cod", label: "Cash on Delivery", desc: "No Surcharge Pay" },
                            { id: "upi", label: "UPI Instant", desc: "Mobile Scan Collect" },
                            { id: "wire", label: "Bank Escrow", desc: "Direct Swiss Transfer" }
                          ].map((method) => {
                            const isSelected = paymentMethod === method.id;
                            return (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                                  isSelected 
                                    ? "bg-sapphire border-sapphire text-white shadow-md ring-2 ring-quicksand/30" 
                                    : "bg-white border-shellstone hover:border-quicksand/40 text-gray-700"
                                }`}
                              >
                                <span className="text-[11px] font-bold tracking-tight uppercase block leading-tight">{method.label}</span>
                                <span className={`text-[9px] block ${isSelected ? "text-swanwing/80" : "text-gray-400"}`}>{method.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {paymentMethod === "card" && (
                          <div className="space-y-4 animate-fade-in">
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Credit / Charge Card Number</label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                  <CreditCard className="w-4.5 h-4.5" />
                                </span>
                                <input
                                  type="text"
                                  required
                                  maxLength={16}
                                  placeholder="4111 2222 3333 4444"
                                  value={cardDetails.number}
                                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, "") })}
                                  className="w-full pl-11 pr-4 py-3 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Expiration date</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  value={cardDetails.expiry}
                                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                  className="w-full px-3 py-2.5 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">CVV/CVC</label>
                                <input
                                  type="password"
                                  required
                                  maxLength={3}
                                  placeholder="•••"
                                  value={cardDetails.cvc}
                                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "") })}
                                  className="w-full px-3 py-2.5 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "cod" && (
                          <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-2 animate-fade-in text-xs text-amber-800">
                            <span className="font-bold text-amber-900 block uppercase tracking-wider text-[10px]">📦 Cash on Delivery Sourcing (COD)</span>
                            <p className="leading-relaxed">
                              No online transaction needed. Hand over cash or pay via handheld POS link terminals to the priority courier dispatcher immediately at your coordinates upon delivery of the wooden display crate package.
                            </p>
                            <p className="font-semibold text-[10px] uppercase text-amber-700">✓ Fully authorized for up to ₹500,000 orders without any convenience surcharges.</p>
                          </div>
                        )}

                        {paymentMethod === "upi" && (
                          <div className="space-y-4 animate-fade-in">
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Enter Registered UPI ID</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g., name@okaxis, phone@ybl, or card@upi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full px-4 py-3 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div className="p-4 bg-sky-50/55 border border-sky-200/50 rounded-xl space-y-1.5 text-xs text-sky-800">
                              <span className="font-bold text-sky-900 block uppercase tracking-wider text-[10px]">📲 Instant Integrated UPI Check</span>
                              <p className="leading-relaxed">
                                Submit your order first. You will instantly receive a secure, high-priority payment collect push request inside your selected UPI client app (e.g., BHIM, phonepe, or gpay) to approve high-integrity escrow settlement.
                              </p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "wire" && (
                          <div className="space-y-4 animate-fade-in font-sans">
                            <div className="p-4 bg-indigo-50/40 border border-indigo-200/40 rounded-xl space-y-2.5 text-xs text-indigo-950">
                              <span className="font-bold text-indigo-900 block uppercase tracking-wider text-[10px]">🏦 Atelier Direct Bank Wire Escrow details</span>
                              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 font-mono text-[10px] text-gray-700 bg-white/70 p-3 rounded-lg border border-indigo-150">
                                <div>Beneficiary:</div> <div className="font-bold">TIME Bespoke Horology LLC</div>
                                <div>Bank:</div> <div className="font-bold">Swiss Chrono Bank, Zurich</div>
                                <div>IBAN:</div> <div className="font-bold">CH84 0023 9034 1123 99</div>
                                <div>Swift/BIC:</div> <div className="font-bold text-quicksand">CHRONOCH222</div>
                              </div>
                              <p className="leading-relaxed text-[11px] text-gray-500">
                                Kindly wire the total amount to this escrow reserve accounts pool. Enter your transaction reference code below once complete.
                              </p>
                            </div>

                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Enter Wire Transaction Reference Code</label>
                              <input
                                type="text"
                                required
                                placeholder="TXN987234A81..."
                                value={bankTxRef}
                                onChange={(e) => setBankTxRef(e.target.value)}
                                className="w-full px-4 py-3 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs font-mono uppercase"
                              />
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-emerald-50/75 border border-[#10B981]/30 rounded-lg text-[11px] text-[#10B981] flex items-start gap-2.5">
                          <Check className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block">Artisan Warranty Confirmed</span>
                            <span>A structured {cart[0]?.watch.warrantyYears || 3}-year warranty backing certificate will be auto-generated inside your packaging.</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-shellstone">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep("shipping")}
                          className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500 font-bold hover:text-quicksand transition-colors"
                        >
                          Back to Address
                        </button>

                        <button
                          type="submit"
                          disabled={isPaying}
                          className="px-6 py-3.5 bg-royalblue text-white hover:bg-quicksand hover:text-sapphire rounded-lg text-xs uppercase font-extrabold tracking-widest transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                          style={{ minHeight: "44px" }}
                        >
                          {isPaying ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4.5 h-4.5" />
                              <span>Authorize Escrow ₹{totalBillCost.toLocaleString()}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                </div>

                {/* Left side: Invoice summaries and Shipping Surcharges dynamically computed */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-shellstone shadow-xl p-6 sm:p-8 space-y-6 text-left">
                  <h3 className="text-xs uppercase tracking-widest text-quicksand font-bold border-b border-shellstone pb-3 animate-fade-in">Ledger Cost Summary</h3>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Bespoke custom items subtotal</span>
                      <span className="font-mono font-medium text-gray-900">₹{cartSubtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>Locational Zone Shipping Charge ({activeZoneMeta.id})</span>
                      <span className="font-mono font-medium text-gray-900">₹{dynamicShippingCost.toLocaleString()}</span>
                    </div>

                    {/* Checkbox for Fast Delivery Upgrade */}
                    <div className="bg-swanwing border border-shellstone p-3.5 rounded-lg flex items-start gap-3 mt-3 font-semibold">
                      <input 
                        type="checkbox" 
                        id="fast-courier-chk"
                        checked={fastShippingUpgrade} 
                        onChange={(e) => setFastShippingUpgrade(e.target.checked)}
                        className="mt-1 w-4 h-4 border-gray-300 rounded text-quicksand focus:ring-quicksand cursor-pointer"
                      />
                      <div className="space-y-0.5 text-left">
                        <label htmlFor="fast-courier-chk" className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5 cursor-pointer">
                          <Flame className="w-3.5 h-3.5 text-quicksand" />
                          <span>Upgrade to Priority Express</span>
                        </label>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Priority dispatch: <span className="text-quicksand font-semibold">{activeZoneMeta.fastDeliveryTime}</span>. Surcharge is <span className="font-bold text-gray-900 font-mono">+₹{activeZoneMeta.fastShippingCharge}</span> to your location.
                        </p>
                      </div>
                    </div>

                    {fastShippingUpgrade && (
                      <div className="flex justify-between text-gray-500 transition-all pt-1 animate-fade-in">
                        <span>Express Priority Upgraded Courier fee</span>
                        <span className="font-mono font-medium text-[#C62828]">+₹{dynamicFastServiceCost.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-white text-base">
                      <div>
                        <span className="font-bold text-[#0F0F0F]">Total Invoice Sourcing</span>
                        <span className="text-[10px] text-gray-400 block font-normal">All assembly insurance included</span>
                      </div>
                      <span className="text-xl font-bold font-mono text-[#0F0F0F]">₹{totalBillCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* STEP 4: CHECKOUT RECEIPT & WARRANTY KEYS */}
        {activeTab === "cart" && checkoutStep === "success" && (
          <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in" id="receipt-screen">
            <div className="bg-white border-2 border-dashed border-shellstone rounded-3xl p-8 shadow-2xl space-y-6 relative">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-[#10B981] font-bold text-lg">
                ✓
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-quicksand uppercase tracking-[0.2em] font-extrabold">ESCROW PAYMENT RECEIVED</span>
                <h3 className="text-2xl font-serif text-sapphire font-bold">Bespoke Order Confirmed!</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your customization configuration ledger is sent straight to our master horologists. Calibration begins immediately.
                </p>
              </div>

              {/* Order Receipt and Warranty Details */}
              <div className="bg-swanwing border border-shellstone rounded-xl p-4 text-left divide-y divide-shellstone font-sans space-y-3">
                <div className="flex justify-between text-xs pb-2 pt-1">
                  <span className="text-gray-400">Escrow ID:</span>
                  <span className="font-mono font-bold text-gray-800">{recentOrderCode}</span>
                </div>

                <div className="flex justify-between text-xs pt-3 pb-2">
                  <span className="text-gray-400">Destination:</span>
                  <span className="text-gray-800 truncate max-w-[180px] font-medium">{shippingAddress.street}, {shippingAddress.city}</span>
                </div>

                <div className="flex justify-between text-xs pt-3 pb-2">
                  <span className="text-gray-400">Guaranteed Priority Transit:</span>
                  <span className="text-quicksand font-bold">{fastShippingUpgrade ? "1-2 Days Priority" : "Standard Post"}</span>
                </div>

                <div className="pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 uppercase font-semibold text-[10px] tracking-wider text-gray-500">🛡 Artisan Warranty Reference Code</span>
                    <span className="text-[#10B981] font-mono font-bold">{recentWarrantyCode}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    This laser-certified guarantee secures repairs, calibrations and case sealings under our brand for up to 5 complete years. Keep this reference printed.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab("orders");
                  setCheckoutStep("review");
                }}
                className="w-full py-4 bg-sapphire text-white hover:bg-quicksand hover:text-sapphire rounded-xl text-xs uppercase font-bold tracking-widest transition-all cursor-pointer font-extrabold"
                style={{ minHeight: "44px" }}
              >
                Track Ordered Items
              </button>
            </div>
          </div>
        )}

        {/* TAB: WISHLIST CORNER */}
        {activeTab === "wishlist" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fade-in text-left space-y-8" id="wishlist-tab">
            <div>
              <h2 className="text-3xl font-serif font-light text-[#0F0F0F] tracking-tight flex items-center gap-2">
                <Heart className="w-7 h-7 text-[#C62828] fill-current" />
                <span>My Saved Masters Ledger</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Keep a listing of pristine models. Open configurations to customize color details or append to bag.</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-20 bg-white border border-shellstone rounded-2xl p-8 max-w-sm mx-auto shadow-xs">
                <Heart className="w-12 h-12 text-gray-200 mx-auto animate-pulse" />
                <h3 className="text-base font-serif text-sapphire mt-3 font-bold">Wishlist has no models</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">Sift through our catalogs and save platforms by tapping the solid heart trigger.</p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="mt-4 px-5 py-2.5 bg-sapphire text-white hover:bg-quicksand hover:text-sapphire text-xs uppercase tracking-widest font-extrabold rounded-lg cursor-pointer"
                >
                  Return to Boutique
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {wishlist.map((watch) => (
                  <WatchCard
                    key={watch.id}
                    watch={watch}
                    isWishlisted={true}
                    onCustomize={(selected) => setSelectedDetailWatch(selected)}
                    onAddToCart={(selected) => handleAddToCart(selected)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ATELIER ORDER TRACKER HISTORY */}
        {activeTab === "orders" && (
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 animate-fade-in text-left space-y-8" id="orders-history-tab">
            <div>
              <h2 className="text-3xl font-serif font-light text-[#0F0F0F] tracking-tight">Active Sourced Atelier Runs</h2>
              <p className="text-xs text-gray-500 mt-1">History of authorized watch orders. Track status of laser markings and Swiss calibrations.</p>
            </div>

            {placedOrders.length === 0 ? (
              <div className="text-center py-20 bg-white border border-shellstone rounded-2xl p-8 max-w-sm mx-auto">
                <Truck className="w-12 h-12 text-quicksand mx-auto animate-bounce" />
                <h3 className="text-base font-serif text-sapphire mt-3 font-bold">No Active Runs Sourced</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">You have no pending orders. Complete a custom configuration order checkout ledger to begin assembly.</p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="mt-4 px-5 py-2.5 bg-sapphire text-white hover:bg-quicksand hover:text-sapphire text-xs uppercase tracking-widest font-extrabold rounded-lg cursor-pointer"
                >
                  Boutique Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Atelier-level performance graphs */}
                <OrderStatusTimelineChart orders={placedOrders} />

                {highlightedOrderId && placedOrders.some(o => o.id === highlightedOrderId) && (
                  <div className="bg-[#C9A86A]/5 border border-[#C9A86A]/30 rounded-xl p-4 text-xs text-sapphire flex items-center gap-3 animate-fade-in mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A86A] animate-ping shrink-0" />
                    <div className="font-sans leading-relaxed text-left flex-1 col-span-12">
                      <span className="font-bold">Active Live Tracking Connection:</span> Showing highlighted status for Order <span className="font-mono font-bold text-quicksand">{highlightedOrderId}</span>. The pipeline details keep updating automatically over time.
                    </div>
                  </div>
                )}

                {placedOrders.map((order) => {
                  const isHighlighted = highlightedOrderId === order.id;
                  return (
                    <div 
                      key={order.id} 
                      className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm transition-all duration-700 ${
                        isHighlighted 
                          ? "border-[#C9A86A] ring-2 ring-[#C9A86A]/45 scale-[1.01] shadow-md bg-[#C9A86A]/[0.02]" 
                          : "border-gray-100"
                      }`}
                    >
                      <div className="space-y-4 flex-1">
                        {(() => {
                          const getStatusIndex = (st: string) => {
                            if (st === "Confirmed" || st === "paid") return 0;
                            if (st === "In Calibration" || st === "processing") return 1;
                            if (st === "Quality Assurance") return 2;
                            if (st === "Dispatched" || st === "shipped" || st === "delivered") return 3;
                            return 0;
                          };

                          const getStatusBadgeStyles = (st: string) => {
                            switch (st) {
                              case "Confirmed":
                              case "paid":
                                return "bg-amber-50 text-amber-700 border border-amber-200/60";
                              case "In Calibration":
                              case "processing":
                                return "bg-sky-50 text-sky-700 border border-sky-200/60";
                              case "Quality Assurance":
                                return "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
                              case "Dispatched":
                              case "shipped":
                              case "delivered":
                                return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
                              default:
                                return "bg-gray-50 text-gray-700 border border-gray-200/60";
                            }
                          };

                          const currentIndex = getStatusIndex(order.status);
                          const displayedStatus = order.status === "paid" ? "Confirmed" : order.status;

                          return (
                            <>
                              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border ${getStatusBadgeStyles(order.status)}`}>
                                    • {displayedStatus}
                                  </span>
                                  <span className="text-xs font-mono text-gray-400">Order ID: {order.id}</span>
                                </div>
                                <button
                                  onClick={() => handleCopyTrackingLink(order.id)}
                                  className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                                    copiedOrderId === order.id 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                                      : "bg-swanwing text-sapphire border-shellstone hover:border-quicksand hover:bg-quicksand/5"
                                  }`}
                                  title="Copy direct tracking status link to clipboard"
                                  id={`share-tracking-${order.id}`}
                                >
                                  {copiedOrderId === order.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span className="text-emerald-700">Link Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Share2 className="w-3.5 h-3.5 text-[#C9A86A] shrink-0" />
                                      <span>Share Live Tracker</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Bespoke Custom Pieces</h4>
                                <div className="space-y-1">
                                  {order.items.map((it: any, index: number) => (
                                    <div key={index} className="flex gap-2 text-xs text-gray-700 items-center">
                                      <span className="w-1.5 h-1.5 rounded-full bg-quicksand" />
                                      <span>{it.watch.name} (Qty {it.quantity})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Recipient Coordinates */}
                              <div className="text-xs text-gray-500 font-sans">
                                <div className="font-semibold text-gray-800">Delivery Address Coordinates:</div>
                                <div className="mt-1">{order.address.fullName} | {order.address.street}, {order.address.city}, {order.address.postalCode}</div>
                              </div>

                              {/* Dynamic Assembly Pipeline Tracker */}
                              <div className="pt-5 border-t border-gray-100 space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-sans font-bold text-sapphire uppercase tracking-widest">
                                  <span>Assembly Pipeline Tracker</span>
                                  <span className="text-quicksand font-semibold normal-case">
                                    {currentIndex === 3 ? "✓ Dispatched & Courier Assigned" : "⚡ Crafting in Laboratory"}
                                  </span>
                                </div>

                                <div className="relative pt-2 pb-6">
                                  {/* Bar connector */}
                                  <div className="absolute top-5 left-[6%] right-[6%] h-[3px] bg-gray-100 rounded-full" />
                                  <div 
                                    className="absolute top-5 left-[6%] h-[3px] bg-quicksand rounded-full transition-all duration-[800ms] ease-out" 
                                    style={{ width: `${currentIndex * 29.3}%` }} 
                                  />

                                  <div className="flex justify-between items-center relative z-10">
                                    {[
                                      { label: "Confirmed", desc: "Verified" },
                                      { label: "In Calibration", desc: "Swiss Testing" },
                                      { label: "Quality Assurance", desc: "Gear Alignment" },
                                      { label: "Dispatched", desc: "Shipped out" }
                                    ].map((step, idx) => {
                                      const isDone = currentIndex >= idx;
                                      const isCurrent = currentIndex === idx;
                                      return (
                                        <div key={idx} className="flex flex-col items-center max-w-[20%] text-center">
                                          <div 
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 font-mono ${
                                              isDone 
                                                ? "bg-sapphire border-sapphire text-white shadow-sm" 
                                                : "bg-white border-gray-200 text-gray-300"
                                            } ${isCurrent ? "ring-4 ring-quicksand/35 scale-110 border-quicksand" : ""}`}
                                          >
                                            {isDone && !isCurrent ? "✓" : idx + 1}
                                          </div>
                                          <span className={`text-[9px] font-extrabold mt-2 uppercase tracking-tight ${isDone ? "text-sapphire" : "text-gray-400"}`}>
                                            {step.label}
                                          </span>
                                          <span className="text-[8px] text-gray-400 hidden sm:inline mt-0.5">
                                            {step.desc}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Surcharges & warranty certifications */}
                      <div className="flex flex-col justify-between md:text-right border-l border-gray-100 pl-0 md:pl-6 pt-6 md:pt-0 shrink-0 space-y-4">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Artisan Surcharge</span>
                          <span className="text-lg font-bold font-mono text-gray-900">₹{order.total?.toLocaleString() || order.subtotal.toLocaleString()}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Active Shield Code</span>
                          <span className="text-xs font-mono font-bold text-[#2E8B57]">{order.warrantyCode}</span>
                        </div>

                        <div className="text-[10px] text-gray-400">
                          Placed on {order.date}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: CONTACT HOROLOGIST EXPERT */}
        {activeTab === "contact" && (
          <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in text-left space-y-8" id="contact-tab">
            <div className="text-center space-y-2 mb-8">
              <span className="text-[10px] text-quicksand uppercase font-extrabold tracking-[0.2em]">DIRECT ATELIER CHANNELS</span>
              <h2 className="text-3xl font-serif font-bold text-sapphire">Contact Horology Advising Expert</h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto font-light leading-relaxed">Have bespoke caliber questions, alloy queries or delivery requests? Send an inquiry directly to our advisors.</p>
            </div>

            <div className="bg-white rounded-2xl border border-shellstone shadow-xl p-6 sm:p-8 space-y-6">
              
              {contactSuccess && (
                <div className="p-4 bg-emerald-50 border-l-2 border-[#10B981] text-[#10B981] text-xs rounded flex items-center gap-3 animate-fade-in">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>{contactSuccess}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Avery"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Direct Correspondence Email</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@luxury.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 font-bold">Bespoke Inquiry / Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="I am interested in adding sapphire gold links and diamond engraving backings to a tailored Tourbillon..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2.5 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-4 bg-sapphire text-white hover:bg-quicksand hover:text-sapphire rounded-lg text-xs uppercase font-extrabold tracking-widest transition-all shadow"
                  style={{ minHeight: "44px" }}
                  id="submit-contact-btn"
                >
                  {contactLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Authorize Direct Connection Call"
                  )}
                </button>
              </form>

              {/* Direct channels information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-shellstone text-xs text-gray-500 font-sans">
                <div className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-quicksand shrink-0" />
                  <span>Support Voice Line: +1 (800) ATELIER</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4 text-quicksand shrink-0" />
                  <span>support@timebespoke.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* RENDER DYNAMIC CUSTOMIZER LAB WORKBENCH MODAL */}
      {customizerWatch && (
        <CustomizerModal
          watch={customizerWatch}
          onClose={() => setCustomizerWatch(null)}
          onSaveToCart={(watch, customization) => {
            handleAddToCart(watch, customization);
            setCustomizerWatch(null);
          }}
        />
      )}

      {/* RENDER PRODUCT DETAIL SUMMARY AND FEEDBACK MODAL */}
      {selectedDetailWatch && (
        <ProductDetailModal
          watch={selectedDetailWatch}
          reviews={reviews}
          isWishlisted={!!wishlist.find(w => w.id === selectedDetailWatch.id)}
          onClose={() => setSelectedDetailWatch(null)}
          onStartCustomize={(watch) => {
            setSelectedDetailWatch(null);
            setCustomizerWatch(watch);
          }}
          onAddToCart={(watch) => {
            handleAddToCart(watch);
            setSelectedDetailWatch(null);
          }}
          onToggleWishlist={handleToggleWishlist}
          onAddReview={handleAddReview}
        />
      )}

      {/* Premium Footing footer */}
      <footer className="bg-[#0F0F0F] border-t border-[#C9A86A]/20 pt-16 pb-8 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo brand */}
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-extrabold tracking-[0.2em] text-[#FAF9F6]">T I M E</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs uppercase tracking-widest">
              The premium customized horology atelier on Planet Earth.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3 text-left">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-white">Boutique Directory</h4>
            <div className="flex flex-col space-y-2">
              <button onClick={() => setActiveTab("home")} className="hover:text-white transition-colors cursor-pointer text-left">Collections Catalog</button>
              <button onClick={() => setActiveTab("customizer")} className="hover:text-white transition-colors cursor-pointer text-left">Bespoke Design Studio</button>
              <button onClick={() => setActiveTab("recommender")} className="hover:text-white transition-colors cursor-pointer text-left">AI Outfit Advisor</button>
            </div>
          </div>

          {/* Services & Warranty links */}
          <div className="space-y-3 text-left">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-white">Privileges & Guarantees</h4>
            <div className="flex flex-col space-y-2">
              <span className="hover:text-white transition-colors">5-Year Mechanical Warranty</span>
              <span className="hover:text-white transition-colors">Locational Courier Routing</span>
              <span className="hover:text-white transition-colors">Secured Escrow Payments</span>
            </div>
          </div>

          {/* Legal references */}
          <div className="space-y-3 text-left">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#FAF9F6]">Secure Atelier Info</h4>
            <div className="flex flex-col space-y-2">
              <span className="hover:text-white transition-colors">Privacy Policy Protection</span>
              <span className="hover:text-white transition-colors">Bespoke Agreement Terms</span>
              <span>Client Sourced Account: <strong className="text-white font-mono">{userSession.isGuest ? "Guest Mode" : userSession.emailOrPhone}</strong></span>
            </div>
          </div>
        </div>

         {/* Closing details */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500">
          <p>© 2026 TIME Bespoke Atelier Inc. All master horologists reserved.</p>
          <div className="flex gap-4">
            <span>Powered by Gemini 3.5 Recs</span>
            <span>-</span>
            <span>Switzerland & Silicon Valley</span>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot Assistant */}
      <Chatbot />

    </div>
  );
}
