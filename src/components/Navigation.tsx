import React from "react";
import { UserSession } from "../types";
import { LogOut, ShoppingCart, Heart, Activity, Compass, Hammer, Smartphone, HelpCircle } from "lucide-react";

interface NavigationProps {
  userSession: UserSession;
  cartCount: number;
  wishlistCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Navigation({
  userSession,
  cartCount,
  wishlistCount,
  activeTab,
  setActiveTab,
  onLogout
}: NavigationProps) {
  return (
    <header className="sticky top-0 z-40 bg-sapphire border-b border-quicksand/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex flex-col cursor-pointer group"
          onClick={() => setActiveTab("home")}
          id="brand-logo"
        >
          <span className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-swanwing transition-colors group-hover:text-quicksand">
            T I M E
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-quicksand text-center -mt-0.5 font-bold">
            Bespoke Atelier
          </span>
        </div>

        {/* Dynamic Navigation Tabs (Adaptive layouts) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-all ${activeTab === "home" ? "text-quicksand border-b-2 border-quicksand" : "text-gray-300 hover:text-swanwing"}`}
            id="nav-home-btn"
          >
            Collections
          </button>
          
          <button
            onClick={() => setActiveTab("customizer")}
            className={`px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-1.5 ${activeTab === "customizer" ? "text-quicksand border-b-2 border-quicksand" : "text-gray-300 hover:text-swanwing"}`}
            id="nav-compile-studio-btn"
          >
            <Hammer className="w-3.5 h-3.5 text-quicksand" />
            <span>Design Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("recommender")}
            className={`px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-1.5 ${activeTab === "recommender" ? "text-quicksand border-b-2 border-quicksand" : "text-gray-300 hover:text-swanwing"}`}
            id="nav-recommender-btn"
          >
            <Compass className="w-3.5 h-3.5 text-quicksand animate-pulse" />
            <span>AI Style Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-all ${activeTab === "orders" ? "text-quicksand border-b-2 border-quicksand" : "text-gray-300 hover:text-swanwing"}`}
            id="nav-orders-btn"
          >
            My Orders
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-all ${activeTab === "contact" ? "text-quicksand border-b-2 border-quicksand" : "text-gray-300 hover:text-swanwing"}`}
            id="nav-contact-btn"
          >
            Contact Expert
          </button>
        </nav>

        {/* Dynamic Action Badges & Session Info */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[10px] text-swanwing/60 uppercase tracking-widest leading-none">Logged Client</span>
            <span className="text-xs text-quicksand font-serif font-bold mt-0.5">{userSession.name}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`p-2 rounded-full relative transition-all ${activeTab === "wishlist" ? "bg-quicksand/20 text-quicksand" : "text-gray-300 hover:text-swanwing hover:bg-white/5"}`}
              title="View Wishlist"
              id="nav-wishlist-indicator"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-royalblue text-swanwing text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-sapphire">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveTab("cart")}
              className={`p-2 rounded-full relative transition-all ${activeTab === "cart" ? "bg-quicksand/20 text-quicksand" : "text-gray-300 hover:text-swanwing hover:bg-white/5"}`}
              title="Open Cart"
              id="nav-cart-indicator"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-quicksand text-sapphire text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-sapphire">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Secure Logout */}
          <button
            onClick={onLogout}
            className="p-2 md:px-3 md:py-2 rounded bg-white/5 hover:bg-red-950/40 text-gray-400 hover:text-red-300 transition-colors text-xs flex items-center gap-1.5"
            title="Log Out Securely"
            id="nav-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Exit Vault</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Header Navigation (Icons for easy touch targets) */}
      <div className="md:hidden flex justify-around border-t border-quicksand/10 bg-sapphire py-2 px-1 text-center">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${activeTab === "home" ? "text-quicksand" : "text-gray-400"}`}
        >
          <Compass className="w-4 h-4" />
          <span>Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab("customizer")}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${activeTab === "customizer" ? "text-quicksand" : "text-gray-400"}`}
        >
          <Hammer className="w-4 h-4" />
          <span>Design</span>
        </button>
        <button
          onClick={() => setActiveTab("recommender")}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${activeTab === "recommender" ? "text-quicksand" : "text-gray-400"}`}
        >
          <Activity className="w-4 h-4" />
          <span>AI Guide</span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${activeTab === "orders" ? "text-quicksand" : "text-gray-400"}`}
        >
          <Activity className="w-4 h-4" />
          <span>Orders</span>
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${activeTab === "contact" ? "text-quicksand" : "text-gray-400"}`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Contact</span>
        </button>
      </div>
    </header>
  );
}
