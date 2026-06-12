import React from "react";
import { Watch } from "../types";
import { Star, Shield, Eye, ShoppingBag, Heart } from "lucide-react";

interface WatchCardProps {
  key?: any;
  watch: Watch;
  isWishlisted: boolean;
  onCustomize: (watch: Watch) => void;
  onAddToCart: (watch: Watch) => void;
  onToggleWishlist: (watch: Watch) => void;
}

export default function WatchCard({
  watch,
  isWishlisted,
  onCustomize,
  onAddToCart,
  onToggleWishlist
}: WatchCardProps) {
  const saveAmount = watch.discountPrice ? watch.price - watch.discountPrice : 0;
  const activePrice = watch.discountPrice || watch.price;

  return (
    <div 
      onClick={() => onCustomize(watch)}
      className="bg-white rounded-xl overflow-hidden border border-shellstone hover:border-quicksand shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full cursor-pointer"
      id={`watch-card-${watch.id}`}
    >
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF9F6]">
        <img 
          src={watch.image} 
          alt={watch.name} 
          className="w-full h-full object-cover transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Promo Discount Tag */}
        {watch.discountPrice && (
          <div className="absolute top-3 left-3 bg-royalblue text-swanwing text-[10px] uppercase font-bold tracking-wider py-1 px-2.5 rounded shadow">
            Special-{Math.round(((watch.price - watch.discountPrice)/watch.price)*100)}% Off
          </div>
        )}

        {/* Popular Item tag */}
        {watch.isPopular && (
          <div className="absolute top-3 right-3 bg-sapphire text-quicksand text-[9px] uppercase font-bold tracking-widest py-1 px-2.5 rounded-full border border-quicksand/30">
            ★ Popular
          </div>
        )}

        {/* Heart/Wishlist Button overlay (touch target at least 44px) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(watch);
          }}
          className={`absolute bottom-3 right-3 p-3 rounded-full bg-white/90 backdrop-blur shadow-md transition-colors ${isWishlisted ? "text-royalblue" : "text-gray-400 hover:text-royalblue"}`}
          style={{ minWidth: "44px", minHeight: "44px" }}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          id={`wishlist-toggle-${watch.id}`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Rating and category */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 font-mono">
            <span className="bg-swanwing px-2 py-0.5 rounded text-sapphire font-sans font-bold border border-shellstone">{watch.category}</span>
            <div className="flex items-center gap-1 text-quicksand">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold">{watch.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold font-serif text-sapphire group-hover:text-[#1E3A8A] transition-colors leading-snug">
            {watch.name}
          </h3>

          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 h-8">
            {watch.description}
          </p>

          {/* Structured core specifications list */}
          <div className="pt-2 pb-1 space-y-1 text-[10px] text-gray-600 border-t border-shellstone/60 font-sans grid grid-cols-2 gap-x-2">
            <div>⚙ {watch.specs.movement.split(" ")[0]} Movement</div>
            <div>🛡 {watch.specs.caseMaterial.split(" ")[0]} Case</div>
            <div>💎 {watch.specs.glass.split(" ")[0]} Glass</div>
            <div>☂ {watch.specs.waterResistance}</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-shellstone/60 space-y-3">
          {/* Warranty & prices */}
          <div className="flex items-end justify-between">
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-royalblue" />
              <span>{watch.warrantyYears} Year Warranty</span>
            </div>
            
            <div className="text-right">
              {watch.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through font-mono">
                    ₹{watch.price.toLocaleString()}
                  </span>
                  <span className="text-lg font-extrabold font-mono text-sapphire">
                    ₹{watch.discountPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-royalblue font-bold font-mono">
                    Save ₹{saveAmount.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-extrabold font-mono text-sapphire">
                  ₹{watch.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(watch);
              }}
              className="py-2 px-3 text-[10px] bg-swanwing text-sapphire border border-shellstone hover:border-quicksand uppercase font-bold tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="View watch details, specifications, and customer reviews"
              style={{ minHeight: "38px" }}
              id={`customize-btn-${watch.id}`}
            >
              <Eye className="w-3.5 h-3.5 text-quicksand" />
              <span>View Details</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(watch);
              }}
              className="py-2 px-3 text-[10px] bg-sapphire text-swanwing hover:bg-royalblue uppercase font-bold tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              style={{ minHeight: "38px" }}
              id={`add-cart-btn-${watch.id}`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-quicksand" />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
