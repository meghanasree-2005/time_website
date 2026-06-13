import React from "react";
import { CUSTOMIZED_IMAGE } from "../data";
import { BadgePercent, ShieldCheck, MapPin, Sparkles, Hammer } from "lucide-react";

interface HeroProps {
  onStartCustomizing: () => void;
  onExploreAI: () => void;
}

export default function Hero({ onStartCustomizing, onExploreAI }: HeroProps) {
  return (
    <section className="bg-sapphire text-white overflow-hidden relative border-b border-quicksand/25" id="landing-hero">
      {/* Background blurs with brand colors */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-quicksand/5 filter blur-3xl" />
      <div className="absolute left-1/4 bottom-0 w-[300px] h-[300px] rounded-full bg-royalblue/5 filter blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text descriptor */}
          <div className="lg:col-span-7 space-y-8 index-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-quicksand/10 border border-quicksand/30 rounded-full text-xs text-quicksand tracking-[#0.15em] uppercase font-bold">
              <BadgePercent className="w-4 h-4 text-quicksand" />
              <span>LIMITED INAUGURAL OFFERS: 20% OFF ALL WORKSHOP CREATIONS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light font-serif tracking-tight leading-tight">
              Craft. Customize.<br />
              Define Your <span className="text-quicksand font-bold inline-block relative italic">
                Legacy.
                <span className="absolute bottom-1 left-0 w-full h-[2px] bg-quicksand/60" />
              </span>
            </h1>

            <p className="text-swanwing/90 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              Welcome to <strong>TIME</strong>, where modern Swiss precision meets the ultimate individualized design workbench. Elevate standard movements or customize sapphire bezels, fine ostrich straps, and case contours. 
            </p>

            {/* Quick action triggers */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onStartCustomizing}
                className="px-8 py-4 bg-quicksand text-sapphire rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-royalblue hover:text-swanwing hover:shadow-royalblue/30 transition-all hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                style={{ minHeight: "44px" }}
                id="hero-customizer-trigger"
              >
                <Hammer className="w-4.5 h-4.5" />
                <span>Open Customizer Workbench</span>
              </button>

              <button
                onClick={onExploreAI}
                className="px-8 py-4 bg-white/5 border border-white/20 text-swanwing rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-white/15 hover:border-quicksand transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ minHeight: "44px" }}
                id="hero-ai-trigger"
              >
                <Sparkles className="w-4.5 h-4.5 text-quicksand" />
                <span>AI Photo & Style Recommendation</span>
              </button>
            </div>

            {/* Core Brand Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded text-quicksand bg-quicksand/10">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-swanwing">Full Warranty</h4>
                  <p className="text-[11px] text-swanwing/70 mt-1">Up to 5 years manufacturer backing on custom builds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded text-quicksand bg-quicksand/10">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-swanwing">Locational Transit</h4>
                  <p className="text-[11px] text-swanwing/70 mt-1">Dynamic courier priority option mapped by location zone.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded text-quicksand bg-quicksand/10">
                  <Sparkles className="w-5 h-5 text-quicksand" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-swanwing">Gemini Smart Search</h4>
                  <p className="text-[11px] text-swanwing/70 mt-1">Upload outfit photos or speak to fetch instant advice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Product Exhibition */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center items-center">
            <div className="relative group w-full max-w-sm sm:max-w-md aspect-square">
              
              {/* Outer circular gold layout accent element - now a perfect circle */}
              <div className="absolute inset-0 rounded-full border border-quicksand/30 scale-105 animate-spin" style={{ animationDuration: "120s" }} />
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-quicksand to-royalblue opacity-20 filter blur-xl group-hover:opacity-30 transition-opacity" />
              
              {/* Image Border frame */}
              <div className="relative h-full w-full border-4 border-sapphire rounded-[2rem] overflow-hidden shadow-2xl bg-sapphire/80 aspect-square">
                <img 
                  src={CUSTOMIZED_IMAGE} 
                  alt="TIME Bespoke Onyx Tourbillon" 
                  className="w-full h-full object-cover transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                
                {/* Embedded specs badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-sapphire/90 backdrop-blur-md border border-quicksand/30 p-4 rounded-xl text-left">
                  <span className="text-[9px] uppercase tracking-widest text-quicksand font-bold">Featured Creation</span>
                  <h3 className="text-sm font-serif font-semibold mt-0.5 text-swanwing">Classic Onyx Tourbillon</h3>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10 text-xs">
                    <span className="text-swanwing/75 font-mono">Caliber 18 System</span>
                    <span className="text-quicksand font-bold font-mono">$1,999 <span className="text-swanwing/45 line-through text-[10px] ml-1">$2,499</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
