"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react"

export function EvaluationMetrics() {
  const metrics = [
    { label: "Avg Accuracy", value: "91.2%", icon: Target, trend: "up" },
    { label: "Model Precision", value: "0.945", icon: Activity, trend: "up" },
    { label: "Forecast RMSE", value: "0.238", icon: TrendingDown, trend: "down" },
    { label: "Active Stations", value: "12", icon: TrendingUp, trend: "up" },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
                </div>
                <Icon className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
