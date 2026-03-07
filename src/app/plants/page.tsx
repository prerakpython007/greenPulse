"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import Image from "next/image";
import { Loader2, Wifi, WifiOff, Sprout, ChevronRight } from "lucide-react";

export default function PlantsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boardConnected, setBoardConnected] = useState(false);
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const heartbeatRef = ref(db, "heartbeat");
    const unsubscribe = onValue(heartbeatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const isOnline = Date.now() - data.lastSeen < 60000;
        setBoardConnected(isOnline);
        setBoardName(data.board || "ESP32 Device");
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] relative overflow-hidden">
      {/* Leaf background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { top: "1%", left: "5%", size: 100, rotate: -25, opacity: 0.15 },
          { top: "3%", left: "50%", size: 80, rotate: -80, opacity: 0.13 },
          { top: "2%", left: "80%", size: 110, rotate: 35, opacity: 0.14 },
          { top: "15%", left: "10%", size: 70, rotate: 145, opacity: 0.12 },
          { top: "20%", left: "65%", size: 95, rotate: -40, opacity: 0.13 },
          { top: "25%", left: "90%", size: 65, rotate: 15, opacity: 0.14 },
          { top: "35%", left: "3%", size: 85, rotate: 200, opacity: 0.13 },
          { top: "40%", left: "45%", size: 60, rotate: -155, opacity: 0.12 },
          { top: "45%", left: "85%", size: 90, rotate: 70, opacity: 0.14 },
          { top: "55%", left: "8%", size: 75, rotate: 130, opacity: 0.15 },
          { top: "60%", left: "55%", size: 105, rotate: -110, opacity: 0.12 },
          { top: "65%", left: "75%", size: 70, rotate: 250, opacity: 0.13 },
          { top: "75%", left: "15%", size: 90, rotate: 85, opacity: 0.13 },
          { top: "80%", left: "50%", size: 75, rotate: -170, opacity: 0.12 },
          { top: "85%", left: "88%", size: 100, rotate: 40, opacity: 0.15 },
          { top: "92%", left: "30%", size: 85, rotate: -60, opacity: 0.14 },
        ].map((leaf, i) => (
          <Image key={i} src="/bg.png" alt="" width={leaf.size} height={leaf.size} className="absolute" style={{ top: leaf.top, left: leaf.left, width: leaf.size, height: leaf.size, opacity: leaf.opacity, transform: `rotate(${leaf.rotate}deg)` }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/greenPulse-logo.png" alt="GreenPulse" width={64} height={90} className="drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Green<span className="text-emerald-600">Pulse</span>
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Select your plant to continue</p>
          </div>
        </div>

        {/* Plant Card */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full max-w-md group"
        >
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden group-hover:scale-[1.02] group-active:scale-[0.98]">
            {/* Card Header */}
            <div className="bg-[#1a3a2a] p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5" />
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Image src="/mascot.png" alt="Plant" width={40} height={40} className="rounded-xl" />
              </div>
              <div className="relative flex-1">
                <h2 className="text-lg font-black text-white">My Indoor Plant</h2>
                <p className="text-xs text-white/40 font-medium">{boardName}</p>
              </div>
              <div className="relative">
                {boardConnected ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-red-500/20 px-3 py-1.5 rounded-full">
                    <WifiOff className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Offline</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-1">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center border-2 border-white">
                    <span className="text-xs">🌡</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border-2 border-white">
                    <span className="text-xs">💧</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border-2 border-white">
                    <span className="text-xs">🌱</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">3 Sensors Active</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Temperature, Humidity, Moisture</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1a3a2a] flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </button>

        {/* Add Plant Button (disabled/coming soon) */}
        <div className="mt-4 w-full max-w-md">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-3 opacity-40">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">Add Another Plant</p>
              <p className="text-[10px] text-gray-300 uppercase tracking-wider font-medium">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <p className="mt-8 text-xs text-gray-400 font-medium">
          Signed in as <span className="text-gray-600 font-bold">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}
