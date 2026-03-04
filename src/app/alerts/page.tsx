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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Sprout,
  Bell,
  Save,
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

  // Load thresholds
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

  // Load alerts
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

  // Check sensor data against thresholds and generate alerts
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

  const getAlertColor = (type: string) => {
    if (type.includes("high")) return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold">Alerts & Thresholds</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Threshold Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Alert Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600">
                  <Thermometer className="w-4 h-4" />
                  <span className="font-medium">Temperature</span>
                </div>
                <div className="space-y-2">
                  <Label>High Threshold (°C)</Label>
                  <Input
                    type="number"
                    value={thresholds.tempHigh}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, tempHigh: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Low Threshold (°C)</Label>
                  <Input
                    type="number"
                    value={thresholds.tempLow}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, tempLow: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Droplets className="w-4 h-4" />
                  <span className="font-medium">Humidity</span>
                </div>
                <div className="space-y-2">
                  <Label>High Threshold (%)</Label>
                  <Input
                    type="number"
                    value={thresholds.humHigh}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, humHigh: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Low Threshold (%)</Label>
                  <Input
                    type="number"
                    value={thresholds.humLow}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, humLow: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Sprout className="w-4 h-4" />
                  <span className="font-medium">Soil Moisture</span>
                </div>
                <div className="space-y-2">
                  <Label>Low Threshold (%)</Label>
                  <Input
                    type="number"
                    value={thresholds.moistLow}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, moistLow: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={saveThresholds} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Thresholds
              </Button>
              {saved && (
                <span className="text-green-600 text-sm font-medium">
                  Thresholds saved!
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader>
            <CardTitle>Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No alerts yet. Alerts will appear here when sensor readings exceed your thresholds.
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs opacity-75">
                          Value: {alert.value} |{" "}
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.type.includes("high") ? "HIGH" : "LOW"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
