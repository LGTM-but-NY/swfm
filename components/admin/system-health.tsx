"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Server, Database, Zap } from "lucide-react"

export function SystemHealthPanel() {
  const healthMetrics = [
    { label: "API Uptime", value: "99.98%", icon: Activity, status: "excellent" },
    { label: "CPU Usage", value: "34%", icon: Server, status: "good" },
    { label: "Database", value: "Optimal", icon: Database, status: "excellent" },
    { label: "Model Queue", value: "2 jobs", icon: Zap, status: "good" },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {healthMetrics.map((metric) => {
        const Icon = metric.icon
        const statusColor = metric.status === "excellent" ? "text-green-400" : "text-blue-400"
        return (
          <Card key={metric.label} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-300 text-sm font-medium flex items-center justify-between">
                {metric.label}
                <Icon className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${statusColor}`}>{metric.value}</p>
              <p className="text-xs text-slate-400 mt-2">System normal</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
