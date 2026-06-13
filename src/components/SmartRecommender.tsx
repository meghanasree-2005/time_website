import React, { useState, useRef } from "react";
import { Upload, Mic, Search, Sparkles, Check, ArrowRight, Video, AlertCircle } from "lucide-react";
import { Watch } from "../types";
import { WATCHES } from "../data";

interface SmartRecommenderProps {
  onApplyWatchConfiguration: (watch: Watch, suggestedParts: any) => void;
}

export default function SmartRecommender({ onApplyWatchConfiguration }: SmartRecommenderProps) {
  const [textQuery, setTextQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceQuerySim, setVoiceQuerySim] = useState("");
  
  // Image uploads state
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Recommendations state
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<any | null>(null);
  const [successLoadPrompt, setSuccessLoadPrompt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-seeded style reference files for immediate testing
  const STYLE_VIBES = [
    {
      name: "Gold Wedding Prestige",
      query: "Looking for an elegant classic gold watch suitable for high society weddings and black-tie dinners.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Tactical Outdoors / Carbon",
      query: "Need a highly robust, carbon style tactical watch that can withstand climbing, water and extreme temperatures.",
      image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Modern Silicon Valley minimal",
      query: "A sleek, ultra-thin minimal aesthetic with an ivory clean watch dial to wear at board meetings.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop"
    }
  ];

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const clearImage = () => {
    setUploadedBase64(null);
    setSelectedImageUrl(null);
    setImageMimeType(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setImageName(file.name);
    setImageMimeType(file.type);
    setSelectedImageUrl(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setUploadedBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Convert image URL to Base64 for the preselected vibes
  const handleSelectVibe = (vibe: any) => {
    setTextQuery(vibe.query);
    setRecommendationResult(null);
    setSelectedImageUrl(vibe.image);
    setUploadedBase64(null);
    setImageMimeType("image/jpeg");
    setImageName(vibe.name);
  };

  // Voice capture simulation with high-end waveform
  const toggleVoiceMock = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setVoiceQuerySim("");
      
      const phrases = [
        "I need a black skeleton luxury watch with a real mechanical winding fly movement.",
        "Give me a sporty titanium chrono watch with royal blue dials.",
        "Sleek minimalist ivory timepiece with brown alligator leather band."
      ];
      const randomSelected = phrases[Math.floor(Math.random() * phrases.length)];

      setTimeout(() => {
        setVoiceQuerySim(randomSelected);
        setTextQuery(randomSelected);
        setIsRecording(false);
      }, 3500); // 3.5s wave simulation
    }
  };

  // Run the multi-modal Gemini query
  const submitStyleQuery = async () => {
    setIsLoading(true);
    setRecommendationResult(null);
    setSuccessLoadPrompt(false);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textQuery,
          speechQuery: voiceQuerySim || undefined,
          imageBase64: uploadedBase64 || undefined,
          imageMime: imageMimeType || undefined,
          imageUrl: selectedImageUrl || undefined
        }),
      });

      const data = await response.json();
      if (data.result) {
        setRecommendationResult(data.result);
      } else {
        throw new Error(data.message || "Failed to make style recommendation.");
      }
    } catch (e: any) {
      alert("Error getting suggestion: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendedModel = () => {
    if (!recommendationResult) return;
    const watchMatch = WATCHES.find(w => w.id === recommendationResult.watchId);
    if (!watchMatch) return;

    onApplyWatchConfiguration(watchMatch, recommendationResult.suggestedCustom);
    setSuccessLoadPrompt(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const getMatchedWatchObject = (): Watch | undefined => {
    if (!recommendationResult) return undefined;
    return WATCHES.find(w => w.id === recommendationResult.watchId);
  };

  const matchedWatch = getMatchedWatchObject();

  return (
    <div className="bg-swanwing py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header summary */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-quicksand/15 border border-quicksand/40 rounded-full text-xs text-quicksand uppercase font-bold tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-quicksand animate-spin" style={{ animationDuration: "12s" }} />
            <span>Gemini Multimodal Sourcing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-sapphire tracking-tight">
            AI Style & Outfit Recommendation
          </h2>
          <p className="text-gray-600 text-sm max-w-xl mx-auto font-light leading-relaxed">
            Simply describe your style desires, speak a prompt, or drop a picture highlighting your outfit context. Gemini will recommend the exact base model and custom configuration suited to your vibe.
          </p>
        </div>

        {/* Input parameters panel */}
        <div className="bg-white rounded-2xl border border-shellstone shadow-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Input Text and Simulated Mic */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
                  1. Describe Your Aesthetic / Watch Look
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    placeholder="E.g. Sapphire dials, sapphire indices, quick sand mesh straps, automatic movement..."
                    className="w-full pl-10 pr-4 py-3 bg-swanwing border border-shellstone placeholder-gray-400 focus:border-quicksand focus:outline-none rounded-xl text-xs text-sapphire transition-all"
                  />
                </div>
              </div>

              {/* Voice capture visualizer */}
              <div className="border border-shellstone bg-swanwing/50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-sapphire flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-quicksand" />
                      <span>Horology Voice Search</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Capture style parameters using vocal recognition.</p>
                  </div>

                  <button
                    onClick={toggleVoiceMock}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${isRecording ? "bg-red-800 text-white animate-pulse" : "bg-sapphire text-swanwing hover:bg-royalblue"}`}
                    style={{ minHeight: "38px" }}
                    id="mic-recording-trigger"
                  >
                    <span>{isRecording ? "Recording..." : "Speak"}</span>
                  </button>
                </div>

                {isRecording && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 h-6">
                    <span className="w-1.5 h-3.5 bg-royalblue rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-1.5 h-5 bg-royalblue rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-2.5 bg-royalblue rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    <span className="w-1.5 h-6 bg-royalblue rounded-full animate-bounce" style={{ animationDelay: "0.45s" }} />
                    <span className="w-1.5 h-3 bg-royalblue rounded-full animate-bounce" style={{ animationDelay: "0.6s" }} />
                  </div>
                )}

                {voiceQuerySim && (
                  <div className="mt-3 text-[11px] font-mono bg-white p-2.5 rounded border border-dashed border-shellstone text-gray-600">
                    💬 Transcription matched: <span className="text-sapphire font-bold italic">{voiceQuerySim}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Picture outfit selector */}
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold">
                2. Wearer Outfit or Vibe Photo Upload
              </label>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-shellstone rounded-xl p-5 flex flex-col items-center justify-center bg-swanwing/30 text-center hover:border-quicksand transition-all cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
                id="image-drag-drop-zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file);
                  }}
                  className="hidden"
                  accept="image/*"
                />

                {uploadedBase64 || selectedImageUrl ? (
                  <div className="space-y-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block group">
                      <img
                        src={uploadedBase64 ? `data:${imageMimeType};base64,${uploadedBase64}` : (selectedImageUrl || "")}
                        alt="Preview upload"
                        className="w-20 h-20 object-cover rounded-lg border border-shellstone"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute -top-1.5 -right-1.5 bg-red-800 text-white p-1 rounded-full text-[9px] hover:bg-red-700 font-sans cursor-pointer"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{imageName}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-quicksand mb-2" />
                    <span className="text-xs font-semibold text-sapphire">Drag Outfit Photo Here</span>
                    <span className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Quick preset vibes container */}
          <div className="space-y-2.5 pt-4 border-t border-shellstone">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Or Choose Preselected Style Vibes (Instant Load)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STYLE_VIBES.map((v) => (
                <button
                  key={v.name}
                  onClick={() => handleSelectVibe(v)}
                  className="p-3 bg-swanwing border border-shellstone hover:border-quicksand/50 text-left rounded-xl transition-all cursor-pointer flex gap-3 items-center text-xs group"
                >
                  <img src={v.image} alt={v.name} className="w-10 h-10 object-cover rounded-md shrink-0 border border-shellstone/" referrerPolicy="no-referrer" />
                  <div className="truncate">
                    <span className="font-bold block text-sapphire truncate group-hover:text-royalblue">{v.name}</span>
                    <span className="text-[9px] text-gray-400 block truncate">{v.query}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={submitStyleQuery}
            disabled={isLoading || (!textQuery && !uploadedBase64 && !selectedImageUrl)}
            className="w-full mt-4 py-4.5 bg-sapphire text-swanwing hover:bg-royalblue font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            style={{ minHeight: "48px" }}
            id="ai-style-query-btn"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-swanwing border-t-transparent rounded-full animate-spin" />
                <span>Horologist Analyzing Parameters...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5 text-quicksand" />
                <span>Submit Style Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Live Recommendation Output Display Card */}
        {recommendationResult && (
          <div className="bg-sapphire text-white border border-quicksand/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-fade-in overflow-hidden">
            {/* Ambient metallic radial lights */}
            <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-quicksand/10 filter blur-3xl" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative index-5">
              
              {/* Output Watch Miniature Graphic */}
              {matchedWatch && (
                <div className="w-36 h-36 shrink-0 aspect-square rounded-2xl overflow-hidden border border-quicksand/40 bg-sapphire/80 p-2 relative">
                  <span className="absolute top-1.5 left-1.5 text-[8px] bg-quicksand text-sapphire font-bold py-0.5 px-1.5 uppercase rounded tracking-wider">
                    Recommended Base
                  </span>
                  <img
                    src={matchedWatch.image}
                    alt={matchedWatch.name}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Analysis Text & Details */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] text-quicksand uppercase tracking-[0.25em] font-extrabold block">
                    Bespoke Selection Match Found
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-swanwing font-bold">
                    {matchedWatch?.name || "Bespoke Model Match"}
                  </h3>
                </div>

                <p className="text-swanwing/90 text-xs sm:text-sm font-light leading-relaxed text-left italic">
                  &ldquo;{recommendationResult.explanation}&rdquo;
                </p>

                {/* Suggested laser configuration */}
                <div className="bg-swanwing/5 border border-white/10 rounded-xl p-4 text-left">
                  <div className="text-[9px] uppercase tracking-wider text-quicksand font-bold mb-2">
                    Custom Laser parts suggested:
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div className="text-swanwing/80">Case Finish: <span className="text-swanwing font-bold font-mono">{recommendationResult.suggestedCustom.caseColor}</span></div>
                    <div className="text-swanwing/80">Dial Palette: <span className="text-swanwing font-bold font-mono">{recommendationResult.suggestedCustom.dialColor}</span></div>
                    <div className="text-swanwing/80">Strap/Band: <span className="text-swanwing font-bold font-mono">{recommendationResult.suggestedCustom.strapType}</span></div>
                    <div className="text-swanwing/80">Protective Lens: <span className="text-swanwing font-bold font-mono">{recommendationResult.suggestedCustom.glassType}</span></div>
                    {recommendationResult.suggestedCustom.engraving && (
                      <div className="text-swanwing/80 col-span-2 mt-1 pt-1 border-t border-white/5">
                        Back Engraving: <span className="text-quicksand font-bold font-mono">"{recommendationResult.suggestedCustom.engraving}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button load configuration */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-start">
                  <button
                    onClick={loadRecommendedModel}
                    className="py-3 px-6 bg-quicksand hover:bg-quicksand/80 text-sapphire rounded-lg text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                    style={{ minHeight: "44px" }}
                    id="apply-recommended-setup-btn"
                  >
                    <span>Load Recommended configuration into Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {successLoadPrompt && (
                    <span className="text-xs text-cyan-200 flex items-center gap-1 bg-royalblue/40 p-2.5 rounded border border-quicksand/30">
                      <Check className="w-4 h-4 text-quicksand" />
                      <span>Loaded! Go to studio above</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
