"use client"

import { AlertCircle, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

export function AlertsBanner() {
  const alerts = [
    { type: "warning", station: "Pakse", message: "Water level approaching alert threshold" },
    { type: "info", station: "Nong Khai", message: "Model accuracy: 94.2% (Excellent)" },
  ]

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <Card
          key={idx}
          className={`p-4 border-l-4 ${
            alert.type === "warning"
              ? "bg-amber-900/30 border-l-amber-500 border-r border-t border-b border-amber-800"
              : "bg-green-900/30 border-l-green-500 border-r border-t border-b border-green-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {alert.type === "warning" ? (
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            )}
            <div>
              <p className={alert.type === "warning" ? "text-amber-300 font-medium" : "text-green-300 font-medium"}>
                {alert.station}
              </p>
              <p className="text-sm text-slate-300">{alert.message}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
