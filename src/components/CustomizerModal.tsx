import React, { useState } from "react";
import { Watch, CustomOptions } from "../types";
import { CUSTOMIZATION_PRESETS } from "../data";
import { X, Check, Save, HelpCircle } from "lucide-react";

interface CustomizerModalProps {
  watch: Watch;
  onClose: () => void;
  onSaveToCart: (watch: Watch, customization: CustomOptions) => void;
}

export default function CustomizerModal({
  watch,
  onClose,
  onSaveToCart
}: CustomizerModalProps) {
  // Select initial presets
  const [selectedCase, setSelectedCase] = useState(CUSTOMIZATION_PRESETS.caseColors[0]);
  const [selectedDial, setSelectedDial] = useState(CUSTOMIZATION_PRESETS.dialColors[0]);
  const [selectedStrap, setSelectedStrap] = useState(CUSTOMIZATION_PRESETS.straps[0]);
  const [selectedGlass, setSelectedGlass] = useState(CUSTOMIZATION_PRESETS.glasses[0]);
  const [engravingText, setEngravingText] = useState("");

  // Sub-total calculation
  const basePrice = watch.discountPrice || watch.price;
  const customizationCost = selectedCase.cost + selectedStrap.cost + selectedGlass.cost;
  const totalCost = basePrice + customizationCost;

  // Render SVG parameters
  const caseColorHex = selectedCase.hex;
  const dialColorHex = selectedDial.hex;
  
  // Custom strap color/texture maps for SVG
  const getStrapColor = () => {
    switch (selectedStrap.id) {
      case "alligator_black": return "#1C1917";
      case "alligator_chestnut": return "#78350F";
      case "mesh_gold": return "#C5A880";
      case "oyster_silver": return "#94A3B8";
      case "rubber_sport": return "#4B5563";
      default: return "#4B5563";
    }
  };
  const strapColorHex = getStrapColor();

  const handleSave = () => {
    const customConfig: CustomOptions = {
      caseColor: selectedCase.name,
      dialColor: selectedDial.name,
      strapType: selectedStrap.name,
      strapColor: selectedStrap.id.includes("black") ? "Obsidian Black" : selectedStrap.id.includes("chestnut") ? "Chestnut Brown" : "Standard Metallic",
      glassType: selectedGlass.id as any,
      engraving: engravingText.trim() || undefined
    };
    onSaveToCart(watch, customConfig);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6">
      <div 
        className="bg-swanwing w-full max-w-5xl rounded-2xl sm:rounded-[2rem] shadow-2xl border border-quicksand/30 flex flex-col lg:flex-row relative animate-fade-in my-auto h-auto lg:h-[90vh] max-h-none lg:max-h-[90vh] overflow-visible lg:overflow-hidden"
        id="customizer-modal"
      >
        {/* Close Button absolute */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-sapphire/10 hover:bg-sapphire/20 text-sapphire transition-all"
          title="Close customized creator"
          id="close-customizer-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Real-time Interactive Watch Mockup Viewer */}
        <div className="w-full lg:w-1/2 bg-sapphire p-6 sm:p-8 flex flex-col justify-center items-center relative min-h-[340px] sm:min-h-[420px] lg:h-full lg:max-h-[90vh] lg:min-h-[500px] shrink-0 overflow-hidden">
          <div className="absolute top-6 left-6 text-left">
            <span className="text-[10px] text-quicksand uppercase tracking-[0.2em] font-extrabold">Active Lab Workbench</span>
            <h2 className="text-lg sm:text-xl font-serif text-swanwing mt-1 font-bold">{watch.name}</h2>
          </div>

          {/* Interactive Responsive SVG Watch representation */}
          <div className="flex-1 flex items-center justify-center w-full py-6 mt-8 sm:mt-12 lg:mt-0">
            <svg viewBox="0 0 200 200" className="w-52 h-52 sm:w-64 sm:h-64 lg:w-76 lg:h-76 xl:w-80 xl:h-80 drop-shadow-[0_10px_25px_rgba(197,168,128,0.2)]">
              {/* Outer strap upper section */}
              <rect x="80" y="10" width="40" height="50" rx="3" fill={strapColorHex} stroke="#000" strokeWidth="1" />
              <line x1="85" y1="10" x2="85" y2="60" stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
              <line x1="115" y1="10" x2="115" y2="60" stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />

              {/* Outer strap lower section */}
              <rect x="80" y="140" width="40" height="50" rx="3" fill={strapColorHex} stroke="#000" strokeWidth="1" />
              <line x1="85" y1="140" x2="85" y2="190" stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
              <line x1="115" y1="140" x2="115" y2="190" stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />

              {/* Case outline (outer bezel) */}
              <circle cx="100" cy="100" r="48" fill={caseColorHex} stroke="#000" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="44" fill={caseColorHex} opacity="0.8" />

              {/* Metallic gold crown */}
              <rect x="146" y="94" width="8" height="12" rx="1.5" fill={caseColorHex} stroke="#000" strokeWidth="0.8" />
              
              {/* Dial Face */}
              <circle cx="100" cy="100" r="38" fill={dialColorHex} stroke="#000" strokeWidth="0.5" />

              {/* Dial index tick markers */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const sx = 100 + 33 * Math.sin(angle);
                const sy = 100 - 33 * Math.cos(angle);
                const ex = 100 + 36 * Math.sin(angle);
                const ey = 100 - 36 * Math.cos(angle);
                return (
                  <line 
                    key={i} 
                    x1={sx} 
                    y1={sy} 
                    x2={ex} 
                    y2={ey} 
                    stroke={i % 3 === 0 ? "#C5A880" : "#888"} 
                    strokeWidth={i % 3 === 0 ? 1 : 0.5} 
                  />
                );
              })}

              {/* Customized Laser Inner Engraving Text inside dial */}
              {engravingText && (
                <text 
                  x="100" 
                  y="124" 
                  fontSize="4" 
                  fill="#C5A880" 
                  opacity="0.8"
                  textAnchor="middle" 
                  fontFamily="monospace"
                  letterSpacing="1"
                >
                  {engravingText.toUpperCase().slice(0, 15)}
                </text>
              )}

              {/* Watch Hands */}
              {/* Hour hand */}
              <line x1="100" y1="100" x2="100" y2="78" stroke="#F9F9FB" strokeWidth="2.5" strokeLinecap="round" transform="rotate(45 100 100)" />
              {/* Minute hand */}
              <line x1="100" y1="100" x2="100" y2="68" stroke="#F9F9FB" strokeWidth="1.5" strokeLinecap="round" transform="rotate(130 100 100)" />
              {/* Second hand */}
              <line x1="100" y1="100" x2="100" y2="64" stroke="#1E3A8A" strokeWidth="0.8" strokeLinecap="round" transform="rotate(310 100 100)" />

              {/* Center axis pin */}
              <circle cx="100" cy="100" r="3" fill="#C5A880" stroke="#000" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="1.2" fill="#F9F9FB" />

              {/* Glass glare effect overlays */}
              <path d="M 70 70 A 38 38 0 0 1 130 70 Z" fill="#F9F9FB" opacity="0.08" pointerEvents="none" />
            </svg>
          </div>

          {/* Quick specs confirmation */}
          <div className="w-full text-center text-xs text-swanwing/70 space-y-1">
            <div className="font-medium">Case: <span className="text-quicksand font-bold">{selectedCase.name}</span> | Dial: <span className="text-white font-bold">{selectedDial.name}</span></div>
            <div className="text-[11px]">Strap: <span className="text-white/90">{selectedStrap.name}</span></div>
          </div>
        </div>

        {/* Right Side: Configuration Form controls */}
        <div className="w-full lg:w-1/2 p-5 sm:p-8 flex flex-col justify-between h-auto lg:h-[90vh] lg:max-h-[90vh] overflow-hidden bg-swanwing">
          {/* Scrollable controls list */}
          <div className="flex-1 overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-3 space-y-5 mb-4 max-h-none lg:max-h-[calc(90vh-180px)] scrollbar-thin scroll-smooth text-left">
            <div className="border-b border-shellstone pb-2.5">
              <span className="text-[10px] font-extrabold text-quicksand uppercase tracking-wider block">Configure parts</span>
              <h3 className="text-xl sm:text-2xl font-serif text-sapphire mt-0.5 font-bold">Customization Studio</h3>
            </div>

            {/* 1. Case Material & Colors */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[#6B7280] font-bold flex justify-between">
                <span>1. Outer Case Finish</span>
                <span className="text-gray-500 text-[10px] font-semibold">
                  {selectedCase.cost > 0 ? `+₹${selectedCase.cost}` : "No supplementary charge"}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CUSTOMIZATION_PRESETS.caseColors.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedCase(item)}
                    className={`p-2 bg-white rounded-lg border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${selectedCase.name === item.name ? "border-quicksand ring-1 ring-quicksand font-bold bg-quicksand/5 animate-pulse-once" : "border-shellstone hover:border-quicksand/40"}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow shrink-0" style={{ backgroundColor: item.hex }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {selectedCase.name === item.name && <Check className="w-3.5 h-3.5 text-quicksand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Inner Dial Colors */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[#6B7280] font-bold block">2. Custom Dial Palette</label>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOMIZATION_PRESETS.dialColors.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedDial(item)}
                    className={`py-1 py-2 px-3 bg-white rounded-full border text-[11px] transition-all flex items-center gap-2 cursor-pointer ${selectedDial.name === item.name ? "border-quicksand bg-quicksand/10 text-sapphire font-bold" : "border-shellstone hover:border-quicksand/40"}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: item.hex }} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Straps Selections */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[#6B7280] font-bold flex justify-between">
                <span>3. Horology Band / Strap</span>
                <span className="text-gray-500 text-[10px] font-semibold">
                  {selectedStrap.cost > 0 ? `+₹${selectedStrap.cost}` : "Included"}
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CUSTOMIZATION_PRESETS.straps.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedStrap(item)}
                    className={`p-2 bg-white rounded-lg border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${selectedStrap.id === item.id ? "border-quicksand bg-quicksand/5 font-bold" : "border-shellstone hover:border-quicksand/40"}`}
                  >
                    <span className="truncate">{item.name}</span>
                    {selectedStrap.id === item.id && <Check className="w-3.5 h-3.5 text-quicksand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Sapphire or Mineral Glass */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[#6B7280] font-bold flex justify-between">
                <span>4. Protective Lens Glass</span>
                <span className="text-gray-500 text-[10px] font-semibold">
                  {selectedGlass.cost > 0 ? `+₹${selectedGlass.cost}` : "Included"}
                </span>
              </label>
              <div className="space-y-1.5">
                {CUSTOMIZATION_PRESETS.glasses.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedGlass(item)}
                    className={`w-full p-2 bg-white rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${selectedGlass.id === item.id ? "border-quicksand bg-swanwing font-bold" : "border-shellstone hover:border-quicksand/40"}`}
                  >
                    <span className="truncate">{item.name}</span>
                    {selectedGlass.id === item.id && <Check className="w-4 h-4 text-quicksand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Custom Laser back engraving text */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[#6B7280] font-bold flex justify-between">
                <span>5. Personalized back-case engraving</span>
                <span className="text-gray-500 hover:text-gray-700 cursor-help flex items-center gap-1 text-[10px] font-normal">
                  <HelpCircle className="w-3 h-3" /> Max 15 Letters
                </span>
              </label>
              <input
                type="text"
                placeholder="E.g. MY TIME, SINCE 2026..."
                maxLength={15}
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                className="w-full px-3 py-2 border border-shellstone bg-white focus:border-quicksand focus:outline-none rounded-lg text-xs font-mono uppercase text-sapphire"
              />
            </div>
          </div>

          {/* Pricing summary and CTA action - Now fully docked at the bottom of the right panel */}
          <div className="border-t border-shellstone pt-4 space-y-3 bg-swanwing shrink-0">
            <div className="flex justify-between items-center bg-swanwing">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Total customized build</span>
                <span className="text-[10px] sm:text-xs text-gray-500 font-light">Includes free assembly & calibration</span>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold font-mono text-sapphire">
                  ₹{totalCost.toLocaleString()}
                </div>
                <div className="text-[9px] sm:text-[10px] text-royalblue font-bold">
                  Includes {watch.warrantyYears}yr Extended Warranty
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-sapphire text-swanwing hover:bg-royalblue rounded-xl text-xs uppercase font-extrabold tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer py-3.5"
              style={{ minHeight: "44px" }}
              id="confirm-custom-build-btn"
            >
              <Save className="w-4 h-4" />
              <span>Add Custom Build to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
