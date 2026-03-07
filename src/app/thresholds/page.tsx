"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen bg-[#f5f7f5] relative overflow-hidden">
      {/* Scattered leaf background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
          <Image
            key={i}
            src="/bg.png"
            alt=""
            width={leaf.size}
            height={leaf.size}
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

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thresholds</h1>
            <p className="text-sm text-gray-400 font-medium">Set custom alert limits for your sensors</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Threshold Cards */}
        <div className="space-y-4">
          {/* Temperature */}
          <Card className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-400" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Temperature</h3>
                  <p className="text-xs text-gray-400">Set high and low temperature limits (°C)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-red-400" /> High Limit (°C)
                  </Label>
                  <Input
                    type="number"
                    value={thresholds.tempHigh}
                    onChange={(e) => setThresholds({ ...thresholds, tempHigh: Number(e.target.value) })}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 text-center text-lg font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-blue-400" /> Low Limit (°C)
                  </Label>
                  <Input
                    type="number"
                    value={thresholds.tempLow}
                    onChange={(e) => setThresholds({ ...thresholds, tempLow: Number(e.target.value) })}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 text-center text-lg font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Humidity</h3>
                  <p className="text-xs text-gray-400">Set high and low humidity limits (%)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-red-400" /> High Limit (%)
                  </Label>
                  <Input
                    type="number"
                    value={thresholds.humHigh}
                    onChange={(e) => setThresholds({ ...thresholds, humHigh: Number(e.target.value) })}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 text-center text-lg font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-blue-400" /> Low Limit (%)
                  </Label>
                  <Input
                    type="number"
                    value={thresholds.humLow}
                    onChange={(e) => setThresholds({ ...thresholds, humLow: Number(e.target.value) })}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 text-center text-lg font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moisture */}
          <Card className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Soil Moisture</h3>
                  <p className="text-xs text-gray-400">Alert when soil gets too dry</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-blue-400" /> Low Limit (%)
                  </Label>
                  <Input
                    type="number"
                    value={thresholds.moistLow}
                    onChange={(e) => setThresholds({ ...thresholds, moistLow: Number(e.target.value) })}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 text-center text-lg font-semibold"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    You&apos;ll be alerted when moisture drops below this value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={saveThresholds}
            className={`w-full h-12 rounded-2xl font-bold text-white text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-500 shadow-lg shadow-emerald-200"
                : "bg-[#1a3a2a] hover:bg-[#234a35] shadow-lg shadow-gray-300"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved Successfully!
              </>
            ) : (
              "Save Thresholds"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
