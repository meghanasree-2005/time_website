import React, { useState } from "react";
import { Watch, Review } from "../types";
import { Star, X, Hammer, ShoppingBag, Heart, Shield, Sparkles, MessageSquare, Check, ThumbsUp } from "lucide-react";

interface ProductDetailModalProps {
  watch: Watch;
  reviews: Review[];
  isWishlisted: boolean;
  onClose: () => void;
  onStartCustomize: (watch: Watch) => void;
  onAddToCart: (watch: Watch) => void;
  onToggleWishlist: (watch: Watch) => void;
  onAddReview: (watchId: string, author: string, rating: number, comment: string) => void;
}

export default function ProductDetailModal({
  watch,
  reviews,
  isWishlisted,
  onClose,
  onStartCustomize,
  onAddToCart,
  onToggleWishlist,
  onAddReview
}: ProductDetailModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"specs" | "reviews">("specs");
  
  // Review form states
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);

  // Filter reviews for this watch
  const watchReviews = reviews.filter(r => r.watchId === watch.id);
  
  // Calculate stats
  const averageRating = watchReviews.length > 0 
    ? watchReviews.reduce((sum, r) => sum + r.rating, 0) / watchReviews.length 
    : watch.rating;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    onAddReview(watch.id, newAuthor.trim(), newRating, newComment.trim());
    
    // Reset and show success banner
    setNewAuthor("");
    setNewRating(5);
    setNewComment("");
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  const saveAmount = watch.discountPrice ? watch.price - watch.discountPrice : 0;
  const activePrice = watch.discountPrice || watch.price;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6" id="product-detail-backdrop">
      <div 
        className="bg-swanwing w-full max-w-5xl rounded-2xl sm:rounded-[2rem] shadow-2xl border border-quicksand/30 flex flex-col md:flex-row relative animate-fade-in my-auto max-h-[96vh] md:max-h-[90vh] overflow-hidden"
        id="product-detail-modal"
      >
        {/* Close absolute button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-sapphire/10 hover:bg-sapphire/20 text-sapphire transition-all"
          title="Close product detail popup"
          id="close-detail-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Timepiece Immersive Imagery Viewer */}
        <div className="w-full md:w-1/2 bg-[#FAF9F6] relative h-[280px] sm:h-[380px] md:h-auto min-h-[250px] flex items-center justify-center overflow-hidden border-r border-shellstone/50 shrink-0">
          <img 
            src={watch.image} 
            alt={watch.name}
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay Luxury Badging */}
          <div className="absolute top-6 left-6 text-left">
            <span className="text-[10px] text-quicksand uppercase tracking-[0.2em] font-extrabold bg-sapphire/90 backdrop-blur px-2.5 py-1 rounded">
              Aurelius Atelier Showcase
            </span>
          </div>

          {/* Popular Tag */}
          {watch.isPopular && (
            <div className="absolute bottom-6 left-6 bg-quicksand text-white text-[10px] uppercase font-semibold tracking-widest px-3 py-1 rounded-full shadow-lg">
              ★ Highly Requested Masterpiece
            </div>
          )}

          {/* Promo Discount Tag */}
          {watch.discountPrice && (
            <div className="absolute bottom-6 right-6 bg-royalblue text-white text-xs uppercase font-extrabold tracking-widest py-1.5 px-3 rounded shadow-md">
              Special Offer
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Details & Dynamic Review Engine */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 flex flex-col justify-between h-auto md:h-[90vh] overflow-hidden bg-white">
          
          {/* Scrollable container for specs & reviews */}
          <div className="flex-1 overflow-y-auto pr-0 md:pr-1 space-y-5 mb-4 scrollbar-thin scroll-smooth text-left">
            
            {/* Header info */}
            <div className="space-y-1.5 border-b border-shellstone pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">{watch.category} Collection</span>
                <div className="flex items-center gap-1.5 bg-quicksand/10 px-2.5 py-0.5 rounded text-quicksand text-xs font-bold font-sans">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{averageRating.toFixed(1)} / 5.0</span>
                  <span className="text-[10px] text-gray-500 font-normal font-mono">({watchReviews.length} reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-sapphire font-extrabold tracking-tight leading-tight">
                {watch.name}
              </h2>
              
              <div className="flex items-center gap-3">
                {watch.discountPrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-sapphire">₹{watch.discountPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through font-mono">₹{watch.price.toLocaleString()}</span>
                    <span className="text-[10px] text-royalblue font-bold border border-royalblue/20 px-2 py-0.5 rounded bg-royalblue/5">Save ₹{saveAmount.toLocaleString()} (20% Off)</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black font-mono text-sapphire">₹{watch.price.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-quicksand uppercase tracking-wider block">Artisan Philosophy</span>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {watch.description}
              </p>
            </div>

            {/* Tab Selection: Specs vs. Custom Reviews */}
            <div className="flex border-b border-shellstone pt-2">
              <button
                onClick={() => setActiveSubTab("specs")}
                className={`flex-1 pb-2.5 text-xs uppercase tracking-widest font-extrabold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${activeSubTab === "specs" ? "text-sapphire border-sapphire font-extrabold" : "text-gray-400 border-transparent hover:text-gray-600 font-bold"}`}
              >
                🛠 Specifications
              </button>
              <button
                onClick={() => setActiveSubTab("reviews")}
                className={`flex-1 pb-2.5 text-xs uppercase tracking-widest font-extrabold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${activeSubTab === "reviews" ? "text-sapphire border-sapphire font-extrabold" : "text-gray-400 border-transparent hover:text-gray-600 font-bold"}`}
                id="reviews-tab-trigger"
              >
                💬 Customer Feedback ({watchReviews.length})
              </button>
            </div>

            {/* Sub-tab 1: HOROLOGY SPECS */}
            {activeSubTab === "specs" && (
              <div className="space-y-3 py-1 animate-fade-in text-xs text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-shellstone/40">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Caliber Movement</span>
                    <span className="font-semibold text-sapphire">{watch.specs.movement}</span>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-shellstone/40">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Outer Case Material</span>
                    <span className="font-semibold text-sapphire">{watch.specs.caseMaterial}</span>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-shellstone/40">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Protective Glass Shield</span>
                    <span className="font-semibold text-sapphire">{watch.specs.glass}</span>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-shellstone/40">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Depth Water Resistance</span>
                    <span className="font-semibold text-sapphire">{watch.specs.waterResistance}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-shellstone/40 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Standard Horology Band</span>
                    <span className="font-semibold text-sapphire">{watch.specs.strapMaterial}</span>
                  </div>
                  <div className="text-right text-[10px] text-gray-500 font-mono">
                    Flexible and replaceable in customizer
                  </div>
                </div>

                <div className="p-3 bg-quicksand/5 border border-quicksand/20 rounded-xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-quicksand shrink-0" />
                  <div className="text-xs text-gray-600 leading-snug">
                    <span className="block font-bold text-sapphire">Guaranteed Official {watch.warrantyYears}-Year Extended Warranty</span>
                    Covers internal mechanical gears, movement calibrations, bezel fittings, and dial restorations.
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: CUSTOMER REVIEWS & FEEDBACK */}
            {activeSubTab === "reviews" && (
              <div className="space-y-5 py-1 animate-fade-in text-xs">
                
                {/* Active review items */}
                <div className="space-y-4">
                  {watchReviews.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 italic">
                      No customer reviews yet. Be the first to grace this timepiece with feedback!
                    </div>
                  ) : (
                    watchReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-[#FAF9F6] rounded-xl border border-shellstone/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-sapphire text-quicksand flex items-center justify-center font-bold font-sans text-xs uppercase">
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-sapphire block">{rev.author}</span>
                              <span className="text-[9px] text-[#9CA3AF] font-mono">{rev.date}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-0.5 text-quicksand">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-gray-200"}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-xs pl-9">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* ADD NEW ATELIER FEEDBACK FORM */}
                <div className="border-t border-shellstone pt-4 space-y-3 bg-[#FAF9F6]/60 p-4 rounded-xl border border-shellstone/40">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-quicksand" />
                    <h4 className="font-serif text-sm font-bold text-sapphire">Leave Your Verified Feedback</h4>
                  </div>

                  {reviewSuccess && (
                    <div className="bg-success/10 text-success text-xs p-3 rounded-lg border border-success/20 flex items-center gap-2 animate-fade-in" id="review-success-badge">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Atelier review submitted successfully! Thank you for the verified evaluation.</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReview} className="space-y-3 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#4B5563] block mb-1">Your Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="e.g. Jean-Luc Picard"
                          className="w-full p-2 bg-white rounded-lg border border-shellstone focus:outline-none focus:ring-1 focus:ring-quicksand text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#4B5563] block mb-1">Rating Evaluated</label>
                        <div className="flex items-center gap-1.5 h-9" id="interactive-star-selector">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const starValue = idx + 1;
                            const isGold = hoveredStars !== null ? starValue <= hoveredStars : starValue <= newRating;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setNewRating(starValue)}
                                onMouseEnter={() => setHoveredStars(starValue)}
                                onMouseLeave={() => setHoveredStars(null)}
                                className="p-0.5 transition-colors focus:outline-none cursor-pointer"
                                title={`Rate ${starValue} Stars`}
                                style={{ minWidth: "28px", minHeight: "28px" }}
                              >
                                <Star className={`w-5 h-5 ${isGold ? "text-quicksand fill-current" : "text-gray-300"}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#4B5563] block mb-1 font-sans">Timepiece Experience Comments</label>
                      <textarea
                        required
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="State your horological observations on strap comfort, case symmetry, caliber timekeeping accuracy, and design appeal..."
                        className="w-full p-2 bg-white rounded-lg border border-shellstone focus:outline-none focus:ring-1 focus:ring-quicksand text-xs leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-sapphire text-swanwing hover:bg-royalblue text-[11px] uppercase tracking-widest font-extrabold rounded-lg select-all transition-all shadow-sm"
                      style={{ minHeight: "40px" }}
                      id="submit-review-btn"
                    >
                      Authenticate & Submit Evaluated Review
                    </button>
                  </form>
                </div>

              </div>
            )}

          </div>

          {/* LOWER MODAL ACTION PANEL DOCKETED AT BOTTOM */}
          <div className="border-t border-shellstone pt-4 space-y-4 bg-white shrink-0">
            {/* Pricing details */}
            <div className="flex justify-between items-center bg-white">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">In-Stock Atelier Availability</span>
                <span className="text-xs text-[#2E8B57] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2E8B57] animate-ping" />
                  Calibrated & Ready to Air-Dispatch (Free Shipping)
                </span>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Estimated Total Value</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-sapphire">
                  ₹{activePrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* ACTION TRIGGERS */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              
              {/* Add to Bag (Immediate default) */}
              <button
                onClick={() => {
                  onAddToCart(watch);
                }}
                className="col-span-1 sm:col-span-12 md:col-span-5 bg-sapphire text-swanwing hover:bg-royalblue rounded-xl text-[10px] uppercase font-extrabold tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer py-3.5 text-center px-4"
                title={`Add unmodified ${watch.name} to the Shopping Cart`}
                style={{ minHeight: "44px" }}
                id="modal-add-tobkt-btn"
              >
                <ShoppingBag className="w-4 h-4 text-quicksand shrink-0" />
                <span>Add Base Model</span>
              </button>

              {/* Configure & Customize in Lab Workspace */}
              <button
                onClick={() => {
                  onStartCustomize(watch);
                }}
                className="col-span-1 sm:col-span-12 md:col-span-5 bg-quicksand text-white hover:bg-quicksand/95 rounded-xl text-[10px] uppercase font-extrabold tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer py-3.5 text-center px-4"
                title={`Open the customizer laboratory to modify cases, dial and back engravings`}
                style={{ minHeight: "44px" }}
                id="modal-configure-customize-btn"
              >
                <Hammer className="w-4 h-4 text-white shrink-0" />
                <span>Bespoke Customizer</span>
              </button>

              {/* Wishlist Link button */}
              <button
                onClick={() => {
                  onToggleWishlist(watch);
                }}
                className={`col-span-1 sm:col-span-12 md:col-span-2 rounded-xl transition-all border shadow-sm flex items-center justify-center cursor-pointer py-3.5 px-3 ${isWishlisted ? "bg-royalblue/10 text-royalblue border-royalblue/30" : "bg-white text-gray-400 border-shellstone hover:border-quicksand/40"}`}
                title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                style={{ minHeight: "44px" }}
                id="modal-toggle-wish-btn"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current text-royalblue" : ""}`} />
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
