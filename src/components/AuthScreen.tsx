import React, { useState } from "react";
import { Mail, Phone, Lock, Sparkles, Check, AlertCircle } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (emailOrPhone: string, name: string) => void;
  onContinueAsGuest?: () => void;
}

export default function AuthScreen({ onLoginSuccess, onContinueAsGuest }: AuthScreenProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time password validation state
  const passwordCriteria = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailOrPhone.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all luxury strength requirements.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password, isRegistering }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Try again.");
      }

      setSuccess(isRegistering ? "Your horology account has been registered!" : "Welcome back to TIME.");
      setTimeout(() => {
        onLoginSuccess(data.user.emailOrPhone, data.user.name);
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      if (isRegistering && err.message && err.message.toLowerCase().includes("already exists")) {
        alert("User already exists");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-swanwing text-[#1A1A1A] flex font-sans" id="auth-container">
      {/* Editorial Split Screen Panel (Only visible on Desktop/Lg Screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-sapphire relative overflow-hidden flex-col justify-between p-16 border-r border-quicksand/20">
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-sapphire/90 z-10" />
        {/* Abstract metallic background blur */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-quicksand opacity-10 filter blur-3xl animate-pulse" />
        <div className="absolute -bottom-45 -right-20 w-80 h-80 rounded-full bg-royalblue opacity-10 filter blur-3xl" />
        
        {/* Header Branding */}
        <div className="z-20">
          <h1 className="text-4xl font-extrabold tracking-[0.25em] text-swanwing">
            T I M E
          </h1>
          <p className="text-quicksand text-xs uppercase tracking-widest mt-2 font-bold">
            The Bespoke Horology Atelier
          </p>
        </div>

        {/* Hero concept text */}
        <div className="z-20 max-w-md">
          <span className="text-xs uppercase tracking-[0.2em] text-quicksand font-extrabold">
            TIMELESS MASTERPIECES
          </span>
          <h2 className="text-5xl font-light leading-tight text-swanwing mt-4 font-serif">
            Every second shaped to your <span className="text-quicksand italic">essence</span>.
          </h2>
          <p className="text-swanwing/70 text-sm mt-4 leading-relaxed font-light">
            Log in to customize tourbillons, auto-calculate regional priority courier charges, and catalog your virtual wishlist of pristine automatic mechanisms.
          </p>
        </div>

        {/* Footer info */}
        <div className="z-20 text-xs text-swanwing/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Active Horological Encryption Live</span>
        </div>
      </div>

      {/* Auth Form and Responsive layouts (Full Mobile Screen, Tablet Card, Desktop Side) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div 
          className="w-full max-w-md bg-white lg:bg-transparent rounded-2xl border border-shellstone lg:border-none p-8 md:p-12 shadow-xl md:shadow-md lg:shadow-none transition-all duration-500 animate-fade-in"
          id="auth-form-card"
        >
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-black tracking-[0.2em] text-sapphire">
              TIME
            </h1>
            <p className="text-quicksand text-xs uppercase tracking-widest mt-1">
              Bespoke Watch Studio
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-sapphire">
              {isRegistering ? "Create Atelier Account" : "Access Your Collection"}
            </h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              {isRegistering 
                ? "Gain access to luxury parts building, direct dynamic layout controls & live priority service." 
                : "Enter your registered credentials to manage customized layouts & explore order history."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-700 text-red-700 text-xs rounded flex items-center gap-3 animate-head-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border-l-2 border-[#10B981] text-[#10B981] text-xs rounded flex items-center gap-3">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {emailOrPhone.includes("@") ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </span>
                <input
                  type="text"
                  placeholder="name@luxury.com or +1 234..."
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-sm text-[#1A1A1A] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-swanwing border border-shellstone focus:border-quicksand focus:outline-none rounded-lg text-sm text-[#1A1A1A] transition-all"
                  required
                />
              </div>
            </div>

            {/* Live Password Strength Requirements Panel */}
            <div className="bg-swanwing border border-shellstone rounded-lg p-3 space-y-2 text-xs text-gray-500">
              <div className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                Luxury Password Strength Checklist
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${passwordCriteria.length ? 'bg-royalblue/10 text-royalblue border-royalblue font-bold' : 'border-shellstone text-gray-400'}`}>
                  {passwordCriteria.length ? "✓" : "○"}
                </span>
                <span className={passwordCriteria.length ? "text-royalblue font-medium" : ""}>Minimum 6 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${passwordCriteria.uppercase ? 'bg-royalblue/10 text-royalblue border-royalblue font-bold' : 'border-shellstone text-gray-400'}`}>
                  {passwordCriteria.uppercase ? "✓" : "○"}
                </span>
                <span className={passwordCriteria.uppercase ? "text-royalblue font-medium" : ""}>At least one uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${passwordCriteria.number ? 'bg-royalblue/10 text-[#1E3A8A] border-[#1E3A8A] font-bold' : 'border-shellstone text-gray-400'}`}>
                  {passwordCriteria.number ? "✓" : "○"}
                </span>
                <span className={passwordCriteria.number ? "text-royalblue font-medium" : ""}>At least one numeric digit (0-9)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-sapphire hover:bg-royalblue transition-colors duration-300 rounded-lg text-white font-bold text-sm border border-transparent hover:border-[#FAF9F6] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              style={{ minHeight: "44px" }}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-quicksand" />
                  <span>{isRegistering ? "Initialize Luxury Account" : "Access Workspace"}</span>
                </>
              )}
            </button>

            {onContinueAsGuest && (
              <>
                <div className="flex items-center justify-center gap-2 py-1 text-[10px] tracking-wide text-gray-400">
                  <span className="h-[1px] w-full bg-shellstone" />
                  <span className="px-1 font-bold text-gray-400">OR</span>
                  <span className="h-[1px] w-full bg-shellstone" />
                </div>

                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full py-3 bg-white hover:bg-swanwing border border-shellstone hover:border-quicksand/40 transition-all rounded-lg text-sapphire font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                  style={{ minHeight: "44px" }}
                >
                  <span>Explore as Guest Specialist</span>
                </button>
              </>
            )}
          </form>

          <div className="mt-8 text-center border-t border-shellstone pt-6">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setSuccess(null);
                setPassword("");
              }}
              className="text-xs text-quicksand hover:text-royalblue font-bold tracking-wide transition-colors"
            >
              {isRegistering 
                ? "Already registered? Access vault here" 
                : "New client? Craft your horological key account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
