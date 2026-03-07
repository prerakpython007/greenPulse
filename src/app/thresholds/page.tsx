"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, auth } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import Image from "next/image";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Sprout,
  SlidersHorizontal,
  Check,
  ArrowDown,
  ArrowUp,
  LogOut,
  Loader2,
} from "lucide-react";

interface Thresholds {
  tempHigh: number;
  tempLow: number;
  humHigh: number;
  humLow: number;
  moistLow: number;
}

const defaultThresholds: Thresholds = {
  tempHigh: 40,
  tempLow: 10,
  humHigh: 90,
  humLow: 20,
  moistLow: 20,
};

export default function ThresholdsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const thresholdRef = ref(db, "thresholds");
    const unsubscribe = onValue(thresholdRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setThresholds(data);
    });
    return () => unsubscribe();
  }, []);

  const saveThresholds = async () => {
    await set(ref(db, "thresholds"), thresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex">
      {/* Sidebar — same as dashboard */}
      <aside className="w-20 bg-[#1a3a2a] flex flex-col items-center fixed top-0 bottom-0 left-0 z-50">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative group cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative transform transition-transform duration-500 group-hover:scale-110 active:scale-95">
              <Image src="/greenPulse-logo.png" alt="GreenPulse Logo" width={56} height={80} className="drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
            </div>
          </div>
          <div className="flex flex-col items-center" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            <span className="text-[10px] font-black text-white/40 tracking-[0.5em] mb-1">THRESHOLDS</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-white tracking-[0.3em]">GREEN</span>
              <span className="text-sm font-black italic text-transparent bg-clip-text bg-linear-to-t from-emerald-400 to-teal-300 tracking-[0.3em] animate-pulse">PULSE</span>
            </div>
          </div>
        </div>
        <div className="pb-8 border-t border-white/10 pt-6">
          <button onClick={() => signOut(auth)} className="flex flex-col items-center gap-2 text-white/40 hover:text-red-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 overflow-y-auto overflow-x-hidden relative">
        {/* Scattered leaf background */}
        <div className="fixed inset-0 ml-20 pointer-events-none overflow-hidden z-0">
          {[
            { top: "1%", left: "5%", size: 100, rotate: -25, opacity: 0.15 },
            { top: "3%", left: "42%", size: 80, rotate: -80, opacity: 0.13 },
            { top: "2%", left: "78%", size: 110, rotate: 35, opacity: 0.14 },
            { top: "10%", left: "20%", size: 70, rotate: 145, opacity: 0.12 },
            { top: "12%", left: "60%", size: 95, rotate: -40, opacity: 0.13 },
            { top: "10%", left: "90%", size: 65, rotate: 15, opacity: 0.14 },
            { top: "20%", left: "8%", size: 85, rotate: 200, opacity: 0.13 },
            { top: "22%", left: "48%", size: 60, rotate: -155, opacity: 0.12 },
            { top: "20%", left: "82%", size: 90, rotate: 70, opacity: 0.14 },
            { top: "30%", left: "2%", size: 75, rotate: 130, opacity: 0.15 },
            { top: "28%", left: "35%", size: 105, rotate: -110, opacity: 0.12 },
            { top: "32%", left: "68%", size: 70, rotate: 250, opacity: 0.13 },
            { top: "40%", left: "15%", size: 90, rotate: 85, opacity: 0.13 },
            { top: "42%", left: "52%", size: 75, rotate: -170, opacity: 0.12 },
            { top: "40%", left: "85%", size: 100, rotate: 40, opacity: 0.15 },
            { top: "50%", left: "5%", size: 85, rotate: -60, opacity: 0.14 },
            { top: "48%", left: "38%", size: 65, rotate: 160, opacity: 0.12 },
            { top: "52%", left: "72%", size: 95, rotate: -130, opacity: 0.13 },
            { top: "60%", left: "12%", size: 110, rotate: -45, opacity: 0.15 },
            { top: "62%", left: "55%", size: 80, rotate: 210, opacity: 0.12 },
            { top: "60%", left: "88%", size: 75, rotate: -90, opacity: 0.13 },
            { top: "70%", left: "3%", size: 90, rotate: 175, opacity: 0.14 },
            { top: "68%", left: "30%", size: 100, rotate: -15, opacity: 0.13 },
            { top: "80%", left: "18%", size: 75, rotate: 55, opacity: 0.14 },
            { top: "78%", left: "50%", size: 95, rotate: -75, opacity: 0.13 },
            { top: "90%", left: "8%", size: 100, rotate: -35, opacity: 0.13 },
            { top: "92%", left: "42%", size: 85, rotate: 140, opacity: 0.14 },
          ].map((leaf, i) => (
            <Image key={i} src="/bg.png" alt="" width={leaf.size} height={leaf.size} className="absolute" style={{ top: leaf.top, left: leaf.left, width: leaf.size, height: leaf.size, opacity: leaf.opacity, transform: `rotate(${leaf.rotate}deg)` }} />
          ))}
        </div>

        <div className="p-6 space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Threshold Settings</h1>
                <p className="text-sm text-gray-400 font-medium">Configure alert limits for your sensors</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1a3a2a] flex items-center justify-center shadow-lg">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Temperature Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a3a2a] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Temperature</h3>
                  <p className="text-xs text-white/40">Set limits in °C</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUp className="w-3.5 h-3.5 text-rose-400" /> High Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.tempHigh}
                      onChange={(e) => setThresholds({ ...thresholds, tempHigh: Number(e.target.value) })}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-2 border-gray-100 text-center text-2xl font-black text-gray-900 focus:border-emerald-300 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">°C</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-blue-400" /> Low Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.tempLow}
                      onChange={(e) => setThresholds({ ...thresholds, tempLow: Number(e.target.value) })}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-2 border-gray-100 text-center text-2xl font-black text-gray-900 focus:border-emerald-300 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a3a2a] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Humidity</h3>
                  <p className="text-xs text-white/40">Set limits in %</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUp className="w-3.5 h-3.5 text-rose-400" /> High Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.humHigh}
                      onChange={(e) => setThresholds({ ...thresholds, humHigh: Number(e.target.value) })}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-2 border-gray-100 text-center text-2xl font-black text-gray-900 focus:border-emerald-300 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-blue-400" /> Low Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.humLow}
                      onChange={(e) => setThresholds({ ...thresholds, humLow: Number(e.target.value) })}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-2 border-gray-100 text-center text-2xl font-black text-gray-900 focus:border-emerald-300 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Moisture Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a3a2a] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Soil Moisture</h3>
                  <p className="text-xs text-white/40">Alert when too dry</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-blue-400" /> Low Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.moistLow}
                      onChange={(e) => setThresholds({ ...thresholds, moistLow: Number(e.target.value) })}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-2 border-gray-100 text-center text-2xl font-black text-gray-900 focus:border-emerald-300 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">%</span>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                    You&apos;ll receive an alert when soil moisture drops below this value, indicating your plant needs watering.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveThresholds}
            className={`w-full h-14 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
              saved
                ? "bg-emerald-500 shadow-xl shadow-emerald-200/50 scale-[0.98]"
                : "bg-[#1a3a2a] hover:bg-[#234a35] shadow-xl shadow-gray-200/50 hover:shadow-emerald-200/30 hover:scale-[0.99] active:scale-[0.97]"
            }`}
          >
            {saved ? (
              <>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                Saved Successfully
              </>
            ) : (
              "Save Thresholds"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
