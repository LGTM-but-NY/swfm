"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function AccuracyChart() {
  const data = [
    { station: "Chiang Khong", accuracy: 94.2 },
    { station: "Nong Khai", accuracy: 92.8 },
    { station: "Vientiane", accuracy: 89.5 },
    { station: "Pakse", accuracy: 88.2 },
    { station: "Khone Phapheng", accuracy: 91.5 },
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="station" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
        <YAxis stroke="#94a3b8" domain={[80, 100]} />
        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
        <Bar dataKey="accuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
