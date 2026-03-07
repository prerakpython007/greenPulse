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
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-300 overflow-hidden group-hover:scale-[1.03] group-active:scale-[0.97]">
              {/* Plant Image Area */}
              <div className="relative h-52 overflow-hidden bg-emerald-100/50">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-lime-300/15 rounded-full blur-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-3xl bg-white/60 backdrop-blur-sm border-2 border-emerald-200/50 flex items-center justify-center shadow-lg">
                    <Image src="/mascot.png" alt="Plant" width={90} height={90} className="rounded-2xl drop-shadow-lg" />
                  </div>
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {boardConnected ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500 px-3 py-1.5 rounded-full shadow-md">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-red-500 px-3 py-1.5 rounded-full shadow-md">
                      <WifiOff className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Offline</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">My Indoor Plant</h2>
                    <p className="text-[11px] text-gray-400 font-medium">{boardName}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#1a3a2a] flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Sensor Pills */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-rose-50 rounded-xl px-3 py-2 text-center border border-rose-100">
                    <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-wider">Temp</span>
                    <span className="text-sm">🌡</span>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2 text-center border border-blue-100">
                    <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-wider">Humid</span>
                    <span className="text-sm">💧</span>
                  </div>
                  <div className="flex-1 bg-emerald-50 rounded-xl px-3 py-2 text-center border border-emerald-100">
                    <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-wider">Soil</span>
                    <span className="text-sm">🌱</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Add Plant Card */}
          <div className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 min-h-[300px] opacity-40 cursor-not-allowed">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Sprout className="w-7 h-7 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">Add Plant</p>
              <p className="text-[10px] text-gray-300 uppercase tracking-wider font-medium">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
