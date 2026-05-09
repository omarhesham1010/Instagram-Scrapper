"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", likes: 120, reposts: 20 },
  { name: "Tue", likes: 180, reposts: 45 },
  { name: "Wed", likes: 150, reposts: 30 },
  { name: "Thu", likes: 220, reposts: 60 },
  { name: "Fri", likes: 280, reposts: 85 },
  { name: "Sat", likes: 350, reposts: 110 },
  { name: "Sun", likes: 310, reposts: 90 },
];

export function ActivityChart() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Activity Overview</h3>
        <select className="bg-white/5 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#e1306c]">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e1306c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e1306c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReposts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#833ab4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#833ab4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="likes"
              stroke="#e1306c"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorLikes)"
            />
            <Area
              type="monotone"
              dataKey="reposts"
              stroke="#833ab4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReposts)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
