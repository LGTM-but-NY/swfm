"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ForecastChartProps {
  station: string
  showMultiple?: boolean
}

export function ForecastChart({ station, showMultiple = false }: ForecastChartProps) {
  const data = [
    { day: "Today", actual: 2.8, forecast: 2.85, hybrid: 2.82 },
    { day: "Day 2", actual: 2.9, forecast: 2.88, hybrid: 2.91 },
    { day: "Day 3", actual: 3.1, forecast: 3.05, hybrid: 3.12 },
    { day: "Day 4", actual: 3.3, forecast: 3.25, hybrid: 3.28 },
    { day: "Day 5", actual: 3.5, forecast: 3.45, hybrid: 3.48 },
    { day: "Day 6", actual: 3.7, forecast: 3.65, hybrid: 3.72 },
    { day: "Day 7", actual: 3.9, forecast: 3.85, hybrid: 3.92 },
    { day: "Day 8", actual: null, forecast: 4.05, hybrid: 4.08 },
    { day: "Day 9", actual: null, forecast: 4.15, hybrid: 4.18 },
    { day: "Day 10", actual: null, forecast: 4.2, hybrid: 4.25 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
        <Legend />
        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual Level" />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Forecast"
        />
        {showMultiple && (
          <Line
            type="monotone"
            dataKey="hybrid"
            stroke="#a78bfa"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Hybrid Model"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
