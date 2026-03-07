"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Sprout,
  Bell,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";

interface Notification {
  id: number;
  type: "alert" | "info" | "success" | "warning";
  sensor?: "temperature" | "humidity" | "moisture";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: 1,
    type: "alert",
    sensor: "moisture",
    title: "Low Soil Moisture Detected",
    message: "Moisture dropped to 12%. Your plant needs watering immediately.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Board Connected",
    message: "Your ESP32 board is now online and streaming sensor data.",
    time: "15 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    sensor: "temperature",
    title: "High Temperature Alert",
    message: "Temperature reached 38°C. Consider moving your plant to a cooler spot.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    type: "info",
    title: "Health Score Improving",
    message: "Your plant health score improved from 62% to 78% in the last 6 hours.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "warning",
    sensor: "humidity",
    title: "Humidity Below Optimal Range",
    message: "Humidity is at 28%. Ideal range is 40-70% for your plant.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 6,
    type: "success",
    title: "Plant Mood: Happy",
    message: "All sensors are in optimal range. Your plant is thriving!",
    time: "8 hours ago",
    read: true,
  },
  {
    id: 7,
    type: "alert",
    sensor: "moisture",
    title: "Overwatering Detected",
    message: "Soil moisture reached 88%. Reduce watering to prevent root rot.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 8,
    type: "info",
    title: "Weekly Summary",
    message: "Average health score this week: 74%. Plant was happy 68% of the time.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 9,
    type: "warning",
    sensor: "temperature",
    title: "Cold Night Detected",
    message: "Temperature dropped to 11°C overnight. Consider bringing plant indoors.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 10,
    type: "success",
    title: "Thresholds Updated",
    message: "Your alert thresholds have been saved successfully.",
    time: "4 days ago",
    read: true,
  },
];

const getIcon = (n: Notification) => {
  if (n.sensor === "temperature") return <Thermometer className="w-5 h-5" />;
  if (n.sensor === "humidity") return <Droplets className="w-5 h-5" />;
  if (n.sensor === "moisture") return <Sprout className="w-5 h-5" />;
  if (n.type === "success") return <CheckCircle className="w-5 h-5" />;
  if (n.type === "warning") return <AlertTriangle className="w-5 h-5" />;
  if (n.type === "info") return <Info className="w-5 h-5" />;
  return <Bell className="w-5 h-5" />;
};

const getStyle = (type: string) => {
  switch (type) {
    case "alert":
      return { bg: "bg-red-50", border: "border-red-100", icon: "bg-red-100 text-red-600", badge: "bg-red-500" };
    case "warning":
      return { bg: "bg-amber-50", border: "border-amber-100", icon: "bg-amber-100 text-amber-600", badge: "bg-amber-500" };
    case "success":
      return { bg: "bg-emerald-50", border: "border-emerald-100", icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-500" };
    case "info":
    default:
      return { bg: "bg-blue-50", border: "border-blue-100", icon: "bg-blue-100 text-blue-600", badge: "bg-blue-500" };
  }
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const unreadCount = dummyNotifications.filter((n) => !n.read).length;

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
          { top: "30%", left: "92%", size: 80, rotate: -20, opacity: 0.14 },
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
          { top: "72%", left: "65%", size: 70, rotate: 120, opacity: 0.15 },
          { top: "80%", left: "18%", size: 75, rotate: 55, opacity: 0.14 },
          { top: "78%", left: "50%", size: 95, rotate: -75, opacity: 0.13 },
          { top: "82%", left: "80%", size: 65, rotate: 190, opacity: 0.15 },
          { top: "90%", left: "8%", size: 100, rotate: -35, opacity: 0.13 },
          { top: "92%", left: "42%", size: 85, rotate: 140, opacity: 0.14 },
          { top: "94%", left: "70%", size: 90, rotate: -100, opacity: 0.12 },
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-gray-400 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {dummyNotifications.map((n) => {
            const style = getStyle(n.type);
            return (
              <Card
                key={n.id}
                className={`border ${n.read ? "border-gray-100 bg-white" : `${style.border} ${style.bg}`} rounded-2xl overflow-hidden transition-all hover:shadow-md`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${style.icon} flex items-center justify-center shrink-0 mt-0.5`}>
                      {getIcon(n)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className={`w-2 h-2 rounded-full ${style.badge} shrink-0`} />
                        )}
                      </div>
                      <p className={`text-xs ${n.read ? "text-gray-400" : "text-gray-600"} leading-relaxed`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium mt-2 block uppercase tracking-wider">
                        {n.time}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
