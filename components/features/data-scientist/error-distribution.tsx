"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ErrorDistribution() {
  const data = [
    { day: 1, error: 0.12 },
    { day: 2, error: 0.18 },
    { day: 3, error: 0.22 },
    { day: 4, error: 0.19 },
    { day: 5, error: 0.25 },
    { day: 6, error: 0.21 },
    { day: 7, error: 0.16 },
    { day: 8, error: 0.14 },
    { day: 9, error: 0.17 },
    { day: 10, error: 0.2 },
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#94a3b8" label={{ value: "Forecast Day", position: "right", offset: -5 }} />
        <YAxis stroke="#94a3b8" label={{ value: "RMSE", angle: -90, position: "insideLeft" }} />
        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
        <Line type="monotone" dataKey="error" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899" }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
