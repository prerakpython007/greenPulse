"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  ref,
  onValue,
  set,
  push,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Sprout,
  Bell,
  Check,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Loader2,
  Leaf,
} from "lucide-react";

interface Thresholds {
  tempHigh: number;
  tempLow: number;
  humHigh: number;
  humLow: number;
  moistLow: number;
}

interface AlertEntry {
  id?: string;
  type: string;
  message: string;
  value: number;
  timestamp: number;
  read: boolean;
}

const defaultThresholds: Thresholds = {
  tempHigh: 40,
  tempLow: 10,
  humHigh: 90,
  humLow: 20,
  moistLow: 20,
};

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
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
      if (data) {
        setThresholds(data);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const alertsRef = query(
      ref(db, "alerts"),
      orderByChild("timestamp"),
      limitToLast(50)
    );
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries: AlertEntry[] = Object.entries(data).map(
          ([id, val]) => ({
            id,
            ...(val as Omit<AlertEntry, "id">),
          })
        );
        entries.sort((a, b) => b.timestamp - a.timestamp);
        setAlerts(entries);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sensorRef = query(
      ref(db, "sensorData"),
      orderByChild("timestamp"),
      limitToLast(1)
    );
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const latest = Object.values(data)[0] as {
        temperature: number | null;
        humidity: number | null;
        moisture: number | null;
        timestamp: number;
      };

      const alertsRef = ref(db, "alerts");

      if (latest.temperature !== null) {
        if (latest.temperature > thresholds.tempHigh) {
          push(alertsRef, {
            type: "high_temp",
            message: `Temperature exceeded ${thresholds.tempHigh}°C`,
            value: latest.temperature,
            timestamp: Date.now(),
            read: false,
          });
        }
        if (latest.temperature < thresholds.tempLow) {
          push(alertsRef, {
            type: "low_temp",
            message: `Temperature dropped below ${thresholds.tempLow}°C`,
            value: latest.temperature,
            timestamp: Date.now(),
            read: false,
          });
        }
      }

      if (latest.humidity !== null) {
        if (latest.humidity > thresholds.humHigh) {
          push(alertsRef, {
            type: "high_humidity",
            message: `Humidity exceeded ${thresholds.humHigh}%`,
            value: latest.humidity,
            timestamp: Date.now(),
            read: false,
          });
        }
        if (latest.humidity < thresholds.humLow) {
          push(alertsRef, {
            type: "low_humidity",
            message: `Humidity dropped below ${thresholds.humLow}%`,
            value: latest.humidity,
            timestamp: Date.now(),
            read: false,
          });
        }
      }

      if (latest.moisture !== null && latest.moisture < thresholds.moistLow) {
        push(alertsRef, {
          type: "low_moisture",
          message: `Soil moisture dropped below ${thresholds.moistLow}%`,
          value: latest.moisture,
          timestamp: Date.now(),
          read: false,
        });
      }
    });
    return () => unsubscribe();
  }, [thresholds]);

  const saveThresholds = async () => {
    await set(ref(db, "thresholds"), thresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getAlertIcon = (type: string) => {
    if (type.includes("temp")) return <Thermometer className="w-4 h-4" />;
    if (type.includes("humidity")) return <Droplets className="w-4 h-4" />;
    return <Sprout className="w-4 h-4" />;
  };

  const getAlertStyle = (type: string) => {
    if (type.includes("high"))
      return {
        bg: "bg-red-50 border-red-100",
        icon: "bg-red-100 text-red-600",
        text: "text-red-800",
        sub: "text-red-500",
        badge: "bg-red-100 text-red-700",
      };
    return {
      bg: "bg-blue-50 border-blue-100",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-800",
      sub: "text-blue-500",
      badge: "bg-blue-100 text-blue-700",
    };
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-amber-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-xl shadow-lg shadow-amber-200">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Alerts</h1>
                <p className="text-xs text-gray-400 -mt-0.5">Thresholds & History</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Threshold Configuration */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Alert Thresholds</h2>
          <p className="text-sm text-gray-400 mb-5">Get notified when readings go beyond these limits</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Temperature */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-rose-500 to-orange-500" />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2.5 rounded-xl">
                    <Thermometer className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Temperature</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-red-400" /> High Limit (°C)
                    </Label>
                    <Input
                      type="number"
                      value={thresholds.tempHigh}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, tempHigh: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-blue-400" /> Low Limit (°C)
                    </Label>
                    <Input
                      type="number"
                      value={thresholds.tempLow}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, tempLow: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Humidity */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-xl">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Humidity</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-red-400" /> High Limit (%)
                    </Label>
                    <Input
                      type="number"
                      value={thresholds.humHigh}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, humHigh: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-blue-400" /> Low Limit (%)
                    </Label>
                    <Input
                      type="number"
                      value={thresholds.humLow}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, humLow: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moisture */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-green-500" />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Soil Moisture</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-blue-400" /> Low Limit (%)
                    </Label>
                    <Input
                      type="number"
                      value={thresholds.moistLow}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, moistLow: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Alert when soil gets too dry for your plants
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-5">
            <Button
              onClick={saveThresholds}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-emerald-200 transition-all duration-200"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Thresholds"
              )}
            </Button>
          </div>
        </div>

        {/* Alert History */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Alert History</h2>
          <p className="text-sm text-gray-400 mb-5">Recent threshold violations</p>

          {alerts.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No alerts yet</p>
                <p className="text-sm text-gray-400 max-w-xs text-center">
                  Alerts will appear here when sensor readings cross your thresholds
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const style = getAlertStyle(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${style.bg} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className={`p-2.5 rounded-xl ${style.icon}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${style.text}`}>
                        {alert.message}
                      </p>
                      <p className={`text-xs mt-0.5 ${style.sub}`}>
                        Reading: {alert.value} · {timeAgo(alert.timestamp)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge} flex items-center gap-1`}>
                      {alert.type.includes("high") ? (
                        <><AlertTriangle className="w-3 h-3" /> HIGH</>
                      ) : (
                        <><ArrowDown className="w-3 h-3" /> LOW</>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
