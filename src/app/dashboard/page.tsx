"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Thermometer,
  Droplets,
  Sprout,
  Wifi,
  WifiOff,
  LogOut,
  Bell,
  Leaf,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SensorData {
  temperature: number | null;
  humidity: number | null;
  moisture: number | null;
  timestamp: number;
}

interface Heartbeat {
  lastSeen: number;
  board: string;
  online: boolean;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [historyData, setHistoryData] = useState<SensorData[]>([]);
  const [boardConnected, setBoardConnected] = useState(false);
  const [showConnectedMessage, setShowConnectedMessage] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Listen for heartbeat
  useEffect(() => {
    const heartbeatRef = ref(db, "heartbeat");
    const unsubscribe = onValue(heartbeatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHeartbeat(data);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check board connection status — immediately and every 5 seconds
  useEffect(() => {
    const checkConnection = () => {
      if (heartbeat) {
        const now = Date.now();
        const lastSeen = heartbeat.lastSeen;
        const wasConnected = boardConnected;
        const isConnected = now - lastSeen < 60000; // 60 seconds timeout
        setBoardConnected(isConnected);

        if (!wasConnected && isConnected) {
          setShowConnectedMessage(true);
          setTimeout(() => setShowConnectedMessage(false), 3000);
        }
      }
    };

    checkConnection(); // Check immediately when heartbeat updates
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [heartbeat, boardConnected]);

  // Listen for sensor data
  useEffect(() => {
    const sensorRef = query(
      ref(db, "sensorData"),
      orderByChild("timestamp"),
      limitToLast(500)
    );
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries: SensorData[] = Object.values(data);
        entries.sort((a, b) => a.timestamp - b.timestamp);
        setHistoryData(entries);
        setLatestData(entries[entries.length - 1]);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterDataByTime = (hours: number) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return historyData
      .filter((d) => d.timestamp > cutoff)
      .map((d) => ({
        ...d,
        time: formatTime(d.timestamp),
      }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-bold text-green-700 dark:text-green-400">
              GreenPulse
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {boardConnected ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 gap-1">
                <Wifi className="w-3 h-3" />
                {heartbeat?.board || "Board"} Connected
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Board Offline
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/alerts")}
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut(auth)}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Board Connection Message */}
        {showConnectedMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">
                Board Connected! ({heartbeat?.board})
              </span>
            </div>
          </div>
        )}

        {/* Disconnected State */}
        {!boardConnected && !latestData && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
              <WifiOff className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
              Please connect your board
            </h2>
            <p className="text-gray-500 max-w-md text-center">
              Power on your ESP32 and make sure it&apos;s connected to WiFi. The
              dashboard will automatically detect your board.
            </p>
          </div>
        )}

        {/* Show data if we have any (even if board is currently offline) */}
        {latestData && (
          <>
            {/* Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-red-400">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Temperature
                  </CardTitle>
                  <Thermometer className="w-5 h-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {latestData.temperature !== null
                      ? `${latestData.temperature}°C`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!boardConnected && latestData && "Last reading before disconnect"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-400">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Humidity
                  </CardTitle>
                  <Droplets className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {latestData.humidity !== null
                      ? `${latestData.humidity}%`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!boardConnected && latestData && "Last reading before disconnect"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-400">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Soil Moisture
                  </CardTitle>
                  <Sprout className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {latestData.moisture !== null
                      ? `${latestData.moisture}%`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!boardConnected && latestData && "Last reading before disconnect"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Sensor History</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="1h">
                  <TabsList>
                    <TabsTrigger value="1h">1 Hour</TabsTrigger>
                    <TabsTrigger value="6h">6 Hours</TabsTrigger>
                    <TabsTrigger value="24h">24 Hours</TabsTrigger>
                    <TabsTrigger value="7d">7 Days</TabsTrigger>
                  </TabsList>
                  {["1h", "6h", "24h", "7d"].map((period) => {
                    const hours =
                      period === "1h"
                        ? 1
                        : period === "6h"
                          ? 6
                          : period === "24h"
                            ? 24
                            : 168;
                    return (
                      <TabsContent key={period} value={period}>
                        <div className="h-[350px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filterDataByTime(hours)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                              />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="temperature"
                                stroke="#ef4444"
                                name="Temperature (°C)"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="humidity"
                                stroke="#3b82f6"
                                name="Humidity (%)"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="moisture"
                                stroke="#22c55e"
                                name="Moisture (%)"
                                dot={false}
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
