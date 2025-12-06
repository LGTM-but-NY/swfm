"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getErrorDistribution } from "@/app/actions/chart-actions"

export function ErrorDistribution() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const errorData = await getErrorDistribution(10)
        
        // If no data from DB, use mock data
        if (errorData.length === 0) {
          setData([
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
          ])
        } else {
          setData(errorData)
        }
      } catch (error) {
        console.error('Error fetching error distribution:', error)
        // Fallback to mock data
        setData([
          { day: 1, error: 0.12 },
          { day: 2, error: 0.18 },
          { day: 3, error: 0.22 },
          { day: 4, error: 0.19 },
          { day: 5, error: 0.25 },
        ])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

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
