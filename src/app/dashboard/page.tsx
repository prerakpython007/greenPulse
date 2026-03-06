"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Wifi,
  WifiOff,
  LogOut,
  Activity,
  Loader2,
  TrendingUp,
  Thermometer,
  Droplets,
  Sprout,
  Sun as LucideSun,
  Bell,
  MessageSquare,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
} from "recharts";

interface SensorData {
  temperature: number | null;
  humidity: number | null;
  moisture: number | null;
  timestamp: number;
  healthDelta?: number;
}

interface Heartbeat {
  lastSeen: number;
  board: string;
  online: boolean;
}

// Calculate overall plant health score (0-100)
function getHealthScore(data: SensorData): { score: number; breakdown: { temp: number; hum: number; moist: number } } {
  const scoreFor = (val: number | null, ideal: number, okRange: number, maxRange: number) => {
    if (val === null) return 50;
    const dist = Math.abs(val - ideal);
    if (dist <= okRange) return 100;
    if (dist >= maxRange) return 0;
    return Math.round(100 * (1 - (dist - okRange) / (maxRange - okRange)));
  };

  const temp = scoreFor(data.temperature, 25, 5, 20);
  const hum = scoreFor(data.humidity, 55, 15, 40);
  const moist = scoreFor(data.moisture, 55, 15, 40);

  const score = Math.round(temp * 0.3 + hum * 0.3 + moist * 0.4);
  return { score, breakdown: { temp, hum, moist } };
}

function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-600" };
  if (score >= 70) return { label: "Good", color: "text-green-600" };
  if (score >= 50) return { label: "Fair", color: "text-yellow-600" };
  if (score >= 30) return { label: "Poor", color: "text-orange-600" };
  return { label: "Critical", color: "text-red-600" };
}

function getPlantMood(data: SensorData): { label: string; message: string; color: string; bg: string; emoji: string } {
  const { temperature: t, humidity: h, moisture: m } = data;
  if (t === null && h === null && m === null) return { label: "Unknown", message: "No sensor data", color: "text-gray-500", bg: "bg-gray-50", emoji: "🌫️" };
  if (m !== null && m < 15) return { label: "Dying of Thirst!", message: "Water immediately!", color: "text-red-600", bg: "bg-red-50", emoji: "🥀" };
  if (t !== null && t > 40) return { label: "Overheating!", message: "Move to shade!", color: "text-red-600", bg: "bg-red-50", emoji: "🥵" };
  if (t !== null && t < 8) return { label: "Freezing!", message: "Bring indoors!", color: "text-blue-600", bg: "bg-blue-50", emoji: "🥶" };
  if (m !== null && m < 30) return { label: "Thirsty", message: "Time to water", color: "text-amber-600", bg: "bg-amber-50", emoji: "🥤" };
  if (m !== null && m > 85) return { label: "Drowning!", message: "Too much water", color: "text-blue-600", bg: "bg-blue-50", emoji: "🌊" };
  if (h !== null && h < 25) return { label: "Dry Air", message: "Consider misting", color: "text-amber-600", bg: "bg-amber-50", emoji: "🌫️" };
  if (h !== null && h > 85) return { label: "Too Humid", message: "Watch for fungus", color: "text-blue-600", bg: "bg-blue-50", emoji: "☁️" };
  if (t !== null && t > 35) return { label: "A Bit Warm", message: "Keep an eye on it", color: "text-orange-600", bg: "bg-orange-50", emoji: "☀️" };
  if (t !== null && t < 12) return { label: "Chilly", message: "Prefers warmer", color: "text-sky-600", bg: "bg-sky-50", emoji: "⛄" };
  if (m !== null && m < 40) return { label: "Okay-ish", message: "Water soon", color: "text-yellow-600", bg: "bg-yellow-50", emoji: "😐" };
  return { label: "Thriving!", message: "Happy and healthy!", color: "text-emerald-600", bg: "bg-emerald-50", emoji: "🌿" };
}

// Multi-segment donut chart
function MultiSegmentRing({
  segments,
  size = 200,
}: {
  segments: { score: number; color: string; trackColor: string }[];
  size?: number;
}) {
  const strokeWidth = 28;
  const gap = 30;
  const totalDeg = 360 - gap * segments.length;
  const segDeg = totalDeg / segments.length;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {segments.map((seg, i) => {
        const startAngle = i * (segDeg + gap);
        const segArc = (segDeg / 360) * circumference;
        const filledArc = segArc * (seg.score / 100);

        return (
          <g key={i} transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}>
            {/* Background Track — Now Solid White/Empty mask */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              stroke="#ffffff" strokeWidth={strokeWidth} fill="none"
              strokeLinecap="round"
              strokeDasharray={`${segArc} ${circumference - segArc}`}
              opacity={1}
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              stroke={seg.color} strokeWidth={strokeWidth} fill="none"
              strokeLinecap="round"
              strokeDasharray={`${filledArc} ${circumference - filledArc}`}
              className="transition-all duration-1000 ease-out"
            />
          </g>
        );
      })}
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-xl p-4 min-w-[180px]">
        <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
        {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{entry.value?.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [historyData, setHistoryData] = useState<SensorData[]>([]);
  const [boardConnected, setBoardConnected] = useState(false);
  const [showConnectedMessage, setShowConnectedMessage] = useState(false);
  const [healthRateTab, setHealthRateTab] = useState("1H");
  const [historyRateTab, setHistoryRateTab] = useState("1H");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const heartbeatRef = ref(db, "heartbeat");
    const unsubscribe = onValue(heartbeatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setHeartbeat(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkConnection = () => {
      if (heartbeat) {
        const now = Date.now();
        const wasConnected = boardConnected;
        const isConnected = now - heartbeat.lastSeen < 60000;
        setBoardConnected(isConnected);
        if (!wasConnected && isConnected) {
          setShowConnectedMessage(true);
          setTimeout(() => setShowConnectedMessage(false), 3000);
        }
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [heartbeat, boardConnected]);

  useEffect(() => {
    const sensorRef = query(ref(db, "sensorData"), orderByChild("timestamp"), limitToLast(500));
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filterDataByTime = (hours: number) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const filtered = historyData.filter((d) => d.timestamp > cutoff);

    // Downsample to max ~12-15 points for clean bars
    const targetPoints = 12;
    const sampled = filtered.filter((_, i) => i % Math.max(1, Math.floor(filtered.length / targetPoints)) === 0).slice(-targetPoints);

    return sampled.map((d) => {
      const timeLabel = hours >= 168
        ? new Date(d.timestamp).toLocaleDateString([], { weekday: "short" })
        : new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return { ...d, time: timeLabel };
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex">
      {/* Sidebar */}
      <aside className="w-20 bg-[#1a3a2a] flex flex-col items-center fixed top-0 bottom-0 left-0 z-50">
        {/* Logo + Vertical Name — centered */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative group cursor-pointer">
            {/* Logo Glow/Halo */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative transform transition-transform duration-500 group-hover:scale-110 active:scale-95">
              <Image
                src="/greenPulse-logo.png"
                alt="GreenPulse Logo"
                width={56}
                height={80}
                className="drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            <span className="text-[10px] font-black text-white/40 tracking-[0.5em] mb-1">DASHBOARD</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-white tracking-[0.3em]">GREEN</span>
              <span className="text-sm font-black italic text-transparent bg-clip-text bg-linear-to-t from-emerald-400 to-teal-300 tracking-[0.3em] animate-pulse">PULSE</span>
            </div>
          </div>
        </div>        {/* Sign Out */}
        <div className="pb-8 border-t border-white/10 pt-6">
          <button
            onClick={() => signOut(auth)}
            className="flex flex-col items-center gap-2 text-white/40 hover:text-red-300 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 overflow-y-auto overflow-x-hidden">
        {/* Board Connected Toast */}
        {showConnectedMessage && (
          <div className="m-6 mb-0 bg-emerald-500 text-white rounded-2xl p-4 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">{heartbeat?.board} connected and streaming data</span>
          </div>
        )}

        {/* Disconnected Empty State */}
        {!boardConnected && !latestData && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-20" />
              <div className="relative bg-gray-100 p-8 rounded-full">
                <WifiOff className="w-16 h-16 text-gray-300" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Waiting for your board</h2>
              <p className="text-gray-400 max-w-sm">
                Power on your ESP32 and connect it to WiFi. The dashboard will automatically detect it.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Listening for connections...
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {latestData && (
          <div className="p-6 space-y-6">
            {/* Top Header Section */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-gray-400 font-medium">Welcome back, {user?.displayName || "Stanton"}</p>
              </div>

              {/* Profile Bar */}
              <div className="flex items-center gap-6">
                {/* Action Icons */}
                <div className="flex items-center gap-3">
                  {/* Connection Status Tag */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${boardConnected ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"}`}>
                    {boardConnected ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Offline</span>
                      </>
                    )}
                  </div>

                  <button className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-emerald-500 hover:border-emerald-100 hover:shadow-md transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white">
                      <Image src="/mascot.png" alt="User Mascot" width={56} height={56} className="object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-gray-900 tracking-tight">{user?.displayName || user?.email?.split('@')[0] || "User"}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{user?.email || "Account Settings"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Top Row — Health Card + Growth Activity Card + Mood Card */}
              {(() => {
                const { score, breakdown } = getHealthScore(latestData);
                const { color: healthColor } = getHealthLabel(score);
                const mood = getPlantMood(latestData);

                const now = Date.now();
                const healthRateMs = healthRateTab === "1H" ? 3600000 : healthRateTab === "24H" ? 86400000 : 604800000;
                const filteredHealth = historyData.filter((d) => now - d.timestamp < healthRateMs);
                const recentData = filteredHealth.length > 0
                  ? (healthRateTab === "7D"
                    ? filteredHealth.filter((_, i) => i % Math.max(1, Math.floor(filteredHealth.length / 12)) === 0).slice(-12)
                    : filteredHealth.slice(-20))
                  : historyData.slice(-10);

                const growthPoints = recentData.map((d, i) => {
                  const { score: s } = getHealthScore(d);
                  const timeLabel = healthRateTab === "7D"
                    ? new Date(d.timestamp).toLocaleDateString([], { weekday: "short" })
                    : new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return { idx: i, score: s, time: timeLabel };
                });

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.8fr] gap-8 items-start">
                    {/* Health Donut Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm rounded-[3rem] overflow-hidden h-full relative group">
                      {/* Subdued Background Plant Image */}
                      <div className="absolute -bottom-16 -right-16 w-[130%] h-[130%] opacity-[0.1] pointer-events-none">
                        <Image
                          src="/plant2.png"
                          alt="Background Plant"
                          fill
                          className="object-contain object-bottom-right drop-shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
                        />
                      </div>
                      <CardContent className="p-7 pb-6 flex flex-col justify-between h-full relative z-10">
                        <div className="flex items-start gap-6">
                          <div className="flex-1 flex flex-col">
                            <p
                              className="text-6xl font-[1000] leading-none text-transparent bg-clip-text bg-cover bg-center tracking-tighter"
                              style={{
                                backgroundImage: "url('/day.webp')",
                                filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.6))'
                              }}
                            >
                              {new Date(latestData.timestamp).toLocaleDateString([], { weekday: "long" })}
                            </p>
                            <p className="text-base text-gray-400 mt-2">
                              {new Date(latestData.timestamp).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <div className="mt-6">
                              <span className={`text-8xl font-extrabold ${latestData.temperature !== null
                                ? latestData.temperature >= 38 ? "text-red-500"
                                  : latestData.temperature >= 28 ? "text-orange-500"
                                    : latestData.temperature >= 18 ? "text-emerald-500"
                                      : latestData.temperature >= 10 ? "text-sky-500"
                                        : "text-blue-500"
                                : "text-gray-900"
                                }`}>
                                {latestData.temperature !== null ? `${latestData.temperature}°` : "—"}
                              </span>
                              <span className="text-2xl text-gray-400 font-medium ml-1">C</span>
                            </div>
                          </div>
                          <div className="relative shrink-0 flex items-center justify-center">
                            <MultiSegmentRing
                              size={210}
                              segments={[
                                { score: breakdown.temp, color: "#ef4444", trackColor: "#fecaca" },
                                { score: breakdown.hum, color: "#3b82f6", trackColor: "#bfdbfe" },
                                { score: breakdown.moist, color: "#10b981", trackColor: "#a7f3d0" },
                              ]}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-4xl font-extrabold ${healthColor}`}>{score}%</span>
                              <span className="text-sm font-medium text-gray-400">Health</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-12 mt-auto pt-6 border-t border-gray-50">
                          {[
                            { icon: Thermometer, value: latestData.temperature, unit: "°C", color: "text-red-500" },
                            { icon: Droplets, value: latestData.humidity, unit: "%", color: "text-blue-500" },
                            { icon: Sprout, value: latestData.moisture, unit: "%", color: "text-emerald-500" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <s.icon className={`w-7 h-7 ${s.color} shrink-0`} strokeWidth={2.5} />
                              <span className="text-2xl font-extrabold text-gray-800 leading-none">
                                {s.value !== null ? `${s.value}${s.unit}` : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Plant Growth Activity Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm rounded-[3rem] overflow-hidden h-full">
                      <CardContent className="p-5 pb-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-bold text-gray-800">Plant Health Rate</h3>
                          <div className="flex gap-1">
                            {["1H", "24H", "7D"].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setHealthRateTab(tab)}
                                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${healthRateTab === tab
                                  ? "bg-emerald-500 text-white"
                                  : "text-gray-400 bg-gray-50 hover:bg-gray-100"
                                  }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 h-[160px] relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={growthPoints.map(p => ({ ...p, base: p.score * 0.5, peak: p.score * 0.5 }))}
                              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                              barGap={0}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                              <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                                dy={5}
                              />
                              <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                              />
                              <Bar
                                dataKey="base"
                                stackId="health"
                                fill="#bef264"
                                radius={[0, 0, 12, 12]}
                                barSize={18}
                              />
                              <Bar
                                dataKey="peak"
                                stackId="health"
                                fill="#166534"
                                radius={[12, 12, 0, 0]}
                                barSize={18}
                              />
                              <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 12 }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const total = payload.reduce((acc, entry) => acc + (entry.value as number), 0);
                                    return (
                                      <div className="bg-[#1a2e05] text-white rounded-lg px-2.5 py-1.5 text-[10px] font-black shadow-2xl border border-white/10">
                                        <p className="opacity-50 text-[8px] uppercase tracking-widest mb-0.5">Health Grade</p>
                                        <p className="text-sm">{total.toFixed(0)}%</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-end justify-end mt-1">
                          <span className="text-4xl font-extrabold text-gray-900 leading-none">{score}</span>
                          <span className="text-xs text-gray-400 font-medium ml-1 mb-1">% health</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Plant Mood Card (Top Right) — Independent Height layout */}
                    <div className="relative flex flex-col pt-48">
                      <Card className="bg-[#edf7ee]/95 backdrop-blur-sm border-2 border-white shadow-xl shadow-black/5 rounded-[3rem] overflow-visible mt-auto h-[230px] flex flex-col relative group/card hover:shadow-2xl transition-all duration-700">
                        {/* Decorative internal glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <CardContent className="p-0 flex flex-col items-center flex-1 relative z-10 w-full">
                          {/* Depth Layer — Multi-glow behind plant */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 bg-lime-300/[0.08] blur-[80px] rounded-full animate-pulse" />
                            <div className="w-48 h-48 bg-emerald-200/[0.1] blur-[60px] rounded-full" />
                          </div>

                          {/* Overlapping Plant — Balanced overlap */}
                          <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                            <Image
                              src="/plant.png"
                              alt="Plant"
                              width={500}
                              height={500}
                              className="object-contain animate-in zoom-in duration-1000 select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                            />
                          </div>

                          {/* Status Container — Sleek Floating Pill */}
                          <div className="w-full mt-auto mb-8 px-8 relative z-20 group">
                            <div className="bg-white/20 backdrop-blur-3xl px-5 py-3 rounded-full border border-white/40 shadow-lg flex items-center justify-between relative overflow-hidden group-hover:bg-white/30 hover:scale-[1.02] transition-all duration-500">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{mood.emoji}</span>
                                  <h2 className={`text-lg font-black uppercase tracking-tighter ${mood.color} antialiased leading-none`}>{mood.label}</h2>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-px h-3 bg-gray-900/10" />
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap leading-none">{mood.message}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })()}

              {/* Bottom Row — Sensor History + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.8fr] gap-8">
                {/* Sensor History Chart */}
                <Card className="border-none shadow-sm overflow-hidden bg-white lg:col-span-2 rounded-[3.5rem]">
                  <div className="px-8 pt-6 pb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Sensor Evolution</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Statistical monitoring</p>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Manual Legend */}
                      <div className="hidden sm:flex items-center gap-4 border-r border-gray-100 pr-6 mr-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1a2e05]" />
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Temp</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Hum</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Moist</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        {["1H", "6H", "24H", "7D"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setHistoryRateTab(tab)}
                            className={`text-[10px] px-3.5 py-1.5 rounded-xl font-black transition-all ${historyRateTab === tab
                              ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                              : "text-gray-400 hover:text-gray-600"
                              }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-8 pb-4">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filterDataByTime(historyRateTab === "1H" ? 1 : historyRateTab === "6H" ? 6 : historyRateTab === "24H" ? 24 : 168)}
                          margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                          barGap={8}
                        >
                          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#1a2e05] text-white rounded-xl px-4 py-2.5 shadow-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
                                    <div className="space-y-1">
                                      {payload.map((entry: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between gap-4">
                                          <span className="text-xs font-bold opacity-80">{entry.name}</span>
                                          <span className="text-xs font-black">{entry.value}{entry.name.includes('%') ? '%' : '°C'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          <Bar
                            dataKey="temperature"
                            name="Temp"
                            fill="#1a2e05"
                            radius={[6, 6, 0, 0]}
                            barSize={12}
                          />
                          <Bar
                            dataKey="humidity"
                            name="Humidity"
                            fill="#bef264"
                            radius={[6, 6, 0, 0]}
                            barSize={12}
                          />
                          <Bar
                            dataKey="moisture"
                            name="Moisture"
                            fill="#4ade80"
                            radius={[6, 6, 0, 0]}
                            barSize={12}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats Card (Bottom Right) */}
                <div className="lg:col-span-1">
                  {latestData && (() => {
                    const { score } = getHealthScore(latestData);
                    const healthScores = historyData.slice(-12).map(d => getHealthScore(d).score);
                    const avgStability = 100 - Math.min(100, Math.max(0,
                      (Math.abs((latestData.temperature || 0) - (historyData[historyData.length - 2]?.temperature || 0)) * 5) +
                      (Math.abs((latestData.moisture || 0) - (historyData[historyData.length - 2]?.moisture || 0)) * 2)
                    ));
                    const scoreTrend = healthScores.length > 1 ? healthScores[healthScores.length - 1] - healthScores[0] : 0;
                    const avgTemp = historyData.length > 0
                      ? (historyData.reduce((a, d) => a + (d.temperature ?? 0), 0) / historyData.length).toFixed(1)
                      : latestData.temperature?.toFixed(1) ?? "—";
                    const avgMoist = historyData.length > 0
                      ? (historyData.reduce((a, d) => a + (d.moisture ?? 0), 0) / historyData.length).toFixed(1)
                      : latestData.moisture?.toFixed(1) ?? "—";
                    const maxTemp = historyData.length > 0
                      ? Math.max(...historyData.map((d) => d.temperature ?? 0)).toFixed(1)
                      : latestData.temperature?.toFixed(1) ?? "—";

                    return (
                      <Card className="bg-[#1a2e05] border-none shadow-2xl rounded-[3.5rem] overflow-hidden flex flex-col h-full group">
                        {/* Header Section — NOW AT THE TOP (Single Line) */}
                        <div className="px-6 pt-5 pb-0 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-lime-400 flex items-center justify-center text-[#1a2e05] shadow-lg shadow-lime-400/20">
                              <Activity className="w-4 h-4 animate-pulse" />
                            </div>
                            <h3 className="text-base font-black text-white tracking-tighter leading-none">Environmental Pulse</h3>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-full px-2.5 py-0.5 border border-white/5">
                            <span className="text-[8px] font-black text-lime-400 uppercase tracking-widest">Live Momentum</span>
                          </div>
                        </div>

                        {/* 'Blobby Momentum' Pulse — Re-engineered for Pure Aesthetics */}
                        <div className="flex-1 px-4 pt-4 mt-1">
                          <div className="h-[160px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={historyData.slice(-8).map((d, i) => ({
                                  momentum: (getHealthScore(d).score + (d.temperature || 0) + (d.humidity || 0) + (d.moisture || 0)) / 4,
                                  id: i + 1
                                }))}
                                margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="blobGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#bef264" />
                                    <stop offset="50%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#1a2e05" />
                                  </linearGradient>
                                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                  </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <Area
                                  type="natural"
                                  dataKey="momentum"
                                  stroke="#bef264"
                                  strokeWidth={6}
                                  fill="url(#blobGradient)"
                                  fillOpacity={1}
                                  dot={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    // Only show pins on specific peaks for cleaner look
                                    if (payload.id % 2 === 0) return null;
                                    return (
                                      <g key={payload.id} className="drop-shadow-xl">
                                        <circle cx={cx} cy={cy - 12} r="10" fill="#bef264" />
                                        <text x={cx} y={cy - 8.5} textAnchor="middle" fill="#1a2e05" fontSize="8" fontWeight="900">0{payload.id}</text>
                                        <path d={`M${cx} ${cy - 2} L${cx - 3} ${cy - 10} L${cx + 3} ${cy - 10} Z`} fill="#bef264" />
                                      </g>
                                    );
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Simplified Aesthetic Legend */}
                          <div className="flex justify-center pb-8 mt-2 border-t border-white/5 pt-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(190,242,100,0.5)]" />
                              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Consolidated Momentum Index</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              </div>
            </div >
          </div >
        )}
      </main >
    </div >
  );
}
