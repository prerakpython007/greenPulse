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
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Image src="/greenPulse-logo.png" alt="GreenPulse" width={48} height={68} className="drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Green<span className="text-emerald-600">Pulse</span>
              </h1>
              <p className="text-xs text-gray-400 font-medium">Select a plant to monitor</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            <span className="text-gray-600 font-bold">{user?.email}</span>
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Plant Card */}
          <button
            onClick={() => router.push("/dashboard")}
            className="group text-left"
          >
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 transition-colors">
              <div className="bg-emerald-50 p-6 flex items-center justify-center">
                <Image src="/mascot.png" alt="Plant" width={100} height={100} className="rounded-xl" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">My Indoor Plant</h2>
                    <p className="text-[11px] text-gray-400">{boardName}</p>
                  </div>
                  {boardConnected ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Live</span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Offline</span>
                  )}
                </div>
                <div className="flex gap-2 text-[10px] text-gray-400 font-medium">
                  <span>🌡 Temp</span>
                  <span>·</span>
                  <span>💧 Humid</span>
                  <span>·</span>
                  <span>🌱 Soil</span>
                </div>
              </div>
            </div>
          </button>

          {/* Add Plant Card */}
          <div className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[250px] opacity-40 cursor-not-allowed">
            <Sprout className="w-6 h-6 text-gray-300" />
            <p className="text-xs font-medium text-gray-400">Add Plant</p>
            <p className="text-[10px] text-gray-300">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
