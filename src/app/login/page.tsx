"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, Thermometer, Droplets, Sprout } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/plants");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-green-100/60">
        {/* Leaf SVG decorations — dark & light greens */}
        <div className="absolute inset-0">
          <svg className="absolute -top-10 -left-10 w-80 h-80 text-emerald-950/45 rotate-12" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
            <line x1="100" y1="190" x2="100" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
            <line x1="100" y1="60" x2="60" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="100" y1="90" x2="55" y2="75" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="100" y1="120" x2="60" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="100" y1="60" x2="145" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="100" y1="90" x2="150" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="100" y1="120" x2="145" y2="115" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          </svg>
          <svg className="absolute top-1/4 right-0 w-64 h-64 text-emerald-900/40 -rotate-45" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
          </svg>
          <svg className="absolute bottom-1/4 -left-8 w-56 h-56 text-emerald-950/35 rotate-45" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
          </svg>
          <svg className="absolute -bottom-16 right-10 w-72 h-72 text-emerald-900/40 -rotate-12" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
            <line x1="100" y1="190" x2="100" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          </svg>
          <svg className="absolute top-10 right-1/3 w-40 h-40 text-emerald-950/30 rotate-90" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
          </svg>
          <svg className="absolute bottom-10 left-1/3 w-36 h-36 text-emerald-900/35 -rotate-30" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
          </svg>
          <svg className="absolute top-1/2 left-16 w-20 h-20 text-emerald-950/40 rotate-180" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
          </svg>
          <svg className="absolute top-16 left-1/2 w-24 h-24 text-emerald-900/35 rotate-60" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 C140 10, 190 50, 190 100 C190 150, 140 190, 100 190 C80 190, 60 170, 50 150 C30 110, 40 50, 100 10 Z" />
          </svg>
        </div>

        {/* Center: Logo — no pulse, just clean and big */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full pb-28">
          <Image
            src="/greenPulse-logo.png"
            alt="GreenPulse Logo"
            width={200}
            height={200}
            className="drop-shadow-2xl"
            priority
          />
          <h1 className="text-5xl font-bold text-emerald-800 mt-4 tracking-tight">
            GreenPulse
          </h1>
          <span className="text-emerald-600/60 text-sm font-medium tracking-[0.25em] uppercase mt-3">
            Brings Your Plant To Life
          </span>
        </div>

        {/* Bottom: Welcome text */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
          <div className="bg-emerald-800/10 backdrop-blur-md rounded-2xl p-5 border border-emerald-700/15">
            <h2 className="text-xl font-bold text-emerald-800 mb-1">
              Welcome to GreenPulse
            </h2>
            <p className="text-emerald-700/60 text-sm leading-relaxed">
              Track your plant health with real-time sensor data, smart alerts, and beautiful visualizations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#fafbfc] px-6 relative overflow-hidden">
        {/* Scattered leaf background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { top: "1%", left: "3%", size: 95, rotate: -25, opacity: 0.1 },
            { top: "5%", left: "55%", size: 70, rotate: 140, opacity: 0.08 },
            { top: "3%", left: "85%", size: 110, rotate: 45, opacity: 0.09 },
            { top: "15%", left: "20%", size: 65, rotate: -70, opacity: 0.07 },
            { top: "18%", left: "75%", size: 80, rotate: 130, opacity: 0.1 },
            { top: "25%", left: "5%", size: 100, rotate: -60, opacity: 0.09 },
            { top: "28%", left: "50%", size: 75, rotate: 200, opacity: 0.08 },
            { top: "30%", left: "90%", size: 85, rotate: -15, opacity: 0.09 },
            { top: "40%", left: "15%", size: 90, rotate: 95, opacity: 0.08 },
            { top: "42%", left: "65%", size: 70, rotate: -150, opacity: 0.07 },
            { top: "48%", left: "88%", size: 80, rotate: 80, opacity: 0.1 },
            { top: "55%", left: "3%", size: 85, rotate: -40, opacity: 0.09 },
            { top: "58%", left: "42%", size: 75, rotate: 170, opacity: 0.07 },
            { top: "62%", left: "78%", size: 95, rotate: -110, opacity: 0.08 },
            { top: "68%", left: "25%", size: 70, rotate: 55, opacity: 0.09 },
            { top: "72%", left: "60%", size: 100, rotate: -30, opacity: 0.08 },
            { top: "78%", left: "8%", size: 80, rotate: 210, opacity: 0.1 },
            { top: "80%", left: "85%", size: 75, rotate: -90, opacity: 0.09 },
            { top: "88%", left: "35%", size: 90, rotate: 160, opacity: 0.08 },
            { top: "92%", left: "70%", size: 85, rotate: -50, opacity: 0.09 },
            { top: "95%", left: "10%", size: 100, rotate: 120, opacity: 0.07 },
          ].map((leaf, i) => (
            <img
              key={i}
              src="/bg.png"
              alt=""
              className="absolute"
              style={{
                top: leaf.top,
                left: leaf.left,
                width: leaf.size,
                height: leaf.size,
                opacity: leaf.opacity,
                transform: `rotate(${leaf.rotate}deg)`,
              }}
            />
          ))}
        </div>

        <div className="w-full max-w-[440px] relative z-10">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <Image
              src="/greenPulse-logo.png"
              alt="GreenPulse Logo"
              width={48}
              height={48}
            />
            <h1 className="text-2xl font-bold text-emerald-700">GreenPulse</h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {isSignUp ? "Create your\naccount" : "Sign in to your\ndashboard"}
            </h2>
            <p className="mt-3 text-gray-400 text-[15px]">
              {isSignUp
                ? "Start monitoring your plants in minutes"
                : "Welcome back! Enter your credentials below."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="bg-red-100 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-xs font-bold">!</span>
                </div>
                <span className="text-[13px]">{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email address
              </Label>
              <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === "email" ? "shadow-lg shadow-emerald-100" : ""}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-300 ${focusedField === "email" ? "text-emerald-500" : "text-gray-300"}`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="h-14 pl-12 rounded-2xl bg-white border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 text-[15px] transition-all duration-300 placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === "password" ? "shadow-lg shadow-emerald-100" : ""}`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-300 ${focusedField === "password" ? "text-emerald-500" : "text-gray-300"}`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={6}
                  className="h-14 pl-12 pr-14 rounded-2xl bg-white border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 text-[15px] transition-all duration-300 placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-semibold text-[15px] transition-all duration-300 shadow-lg shadow-emerald-200/60 hover:shadow-emerald-300/80 hover:shadow-xl active:scale-[0.98] group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors hover:underline underline-offset-4"
              >
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[11px] font-medium text-gray-500">Temperature</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-medium text-gray-500">Humidity</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <Sprout className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium text-gray-500">Soil Moisture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
