"use client"

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { getStationChartData } from '@/app/actions/chart-actions'

interface StationChartProps {
  stationId: number
  stationName: string
  onAccuracyCalculated?: (accuracy: number | null) => void
  alarmLevel?: number | null
  floodLevel?: number | null
}

const chartConfig = {
  actual: {
    label: "Actual",
    color: "#10B981",
  },
  forecast: {
    label: "Forecast",
    color: "#3B82F6",
  },
  accuracy: {
    label: "Error",
    color: "#FF4444",
  },
} satisfies ChartConfig

// Period options in minutes
type PeriodOption = 15 | 30 | 45 | 60 | 1440

const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: 15, label: '15 mins' },
  { value: 30, label: '30 mins' },
  { value: 45, label: '45 mins' },
  { value: 60, label: '60 mins' },
  { value: 1440, label: '1 day' },
]

export function StationChart({ stationId, stationName, onAccuracyCalculated, alarmLevel, floodLevel }: StationChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(60)
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch more days to show historical data
        // Keep 60m view as the "wide" view; make 15/30/45 show a shorter range.
        const daysToFetch = selectedPeriod === 1440 ? 7 : selectedPeriod === 60 ? 2 : 1
        const futureMinutes = selectedPeriod === 15 ? 60 : selectedPeriod
        const { measurements, forecasts } = await getStationChartData(stationId, daysToFetch, futureMinutes)

        // Round timestamps to selected interval for alignment
        const intervalMs = selectedPeriod * 60 * 1000
        const roundToInterval = (timestamp: number) => {
          return Math.floor(timestamp / intervalMs) * intervalMs
        }

        // Create a map to merge data by rounded timestamp
        const dataMap = new Map<number, any>()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Add historical measurements
        measurements.forEach((m: any) => {
          if (!m.measured_at) return
          const measuredDate = new Date(m.measured_at)
          if (isNaN(measuredDate.getTime())) return

          const roundedTimestamp = roundToInterval(measuredDate.getTime())
          const displayDate = new Date(roundedTimestamp)
          const timeLabel = displayDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

          if (!dataMap.has(roundedTimestamp)) {
            dataMap.set(roundedTimestamp, {
              time: timeLabel,
              timestamp: roundedTimestamp,
              actual: m.water_level != null ? Math.round(m.water_level * 100) / 100 : null,
              forecast: null,
              isToday: displayDate.toDateString() === today.toDateString()
            })
          } else {
            // Average if multiple measurements in same interval
            const existing = dataMap.get(roundedTimestamp)
            if (m.water_level != null) {
              existing.actual = existing.actual != null 
                ? Math.round((existing.actual + m.water_level) / 2 * 100) / 100
                : Math.round(m.water_level * 100) / 100
            }
          }
        })

        // Merge forecasts for the latest forecast batch.
        // Important: don't round forecast timestamps to the selected interval, because
        // targets are tied to the model run time (forecast_date) and may not fall exactly
        // on 30/45/60-minute boundaries.
        const parseTimeMs = (value: any) => {
          if (!value) return null
          const date = new Date(value)
          const ms = date.getTime()
          return Number.isFinite(ms) ? ms : null
        }

        const horizonsToShow: number[] = selectedPeriod === 15
          ? [15, 30, 45, 60]
          : selectedPeriod === 1440
            ? []
            : [selectedPeriod]

        let latestForecastDateMs: number | null = null
        forecasts.forEach((f: any) => {
          const fdMs = parseTimeMs(f.forecast_date)
          if (fdMs == null) return
          if (latestForecastDateMs == null || fdMs > latestForecastDateMs) {
            latestForecastDateMs = fdMs
          }
        })

        const latestBatchForecasts = latestForecastDateMs == null
          ? []
          : forecasts.filter((f: any) => parseTimeMs(f.forecast_date) === latestForecastDateMs)

        const addForecastPoint = (targetMs: number, forecastValue: number | null) => {
          const displayDate = new Date(targetMs)
          const timeLabel = displayDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          const roundedValue = forecastValue != null ? Math.round(forecastValue * 100) / 100 : null

          if (dataMap.has(targetMs)) {
            const existing = dataMap.get(targetMs)
            existing.forecast = roundedValue
          } else {
            dataMap.set(targetMs, {
              time: timeLabel,
              timestamp: targetMs,
              actual: null,
              forecast: roundedValue,
              isToday: displayDate.toDateString() === today.toDateString()
            })
          }
        }

        const horizonsFound = new Set<number>()
        if (latestForecastDateMs != null && horizonsToShow.length > 0) {
          latestBatchForecasts.forEach((f: any) => {
            const targetMs = parseTimeMs(f.target_date)
            if (targetMs == null) return

            const horizonMinutes = Math.round((targetMs - latestForecastDateMs!) / (60 * 1000))
            if (!horizonsToShow.includes(horizonMinutes)) return

            horizonsFound.add(horizonMinutes)
            addForecastPoint(targetMs, f.water_level)
          })

          // Ensure the chart always has slots for the selected horizons (even if a row is missing).
          horizonsToShow.forEach((h) => {
            if (horizonsFound.has(h)) return
            addForecastPoint(latestForecastDateMs! + h * 60 * 1000, null)
          })
        }

        // Convert map to array and sort by timestamp
        let data = Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp)

        const now = Date.now()

        // Calculate accuracy (error) where both actual and forecast exist
        let errorSum = 0
        let errorCount = 0
        data.forEach(point => {
          if (point.actual !== null && point.forecast !== null) {
            // Calculate absolute error
            const error = Math.abs(point.actual - point.forecast)
            point.accuracy = Math.round(error * 100) / 100
            errorSum += error * error // Sum of squared errors for RMSE
            errorCount++
          } else {
            point.accuracy = null
          }
        })

        // Calculate RMSE and report to parent
        if (errorCount > 0 && onAccuracyCalculated) {
          const rmse = Math.sqrt(errorSum / errorCount)
          onAccuracyCalculated(rmse)
        } else if (onAccuracyCalculated) {
          onAccuracyCalculated(null)
        }

        // Limit to a reasonable number of bars.
        // 60m keeps the larger window; 15/30/45 show progressively smaller windows.
        const viewWindow = (() => {
          switch (selectedPeriod) {
            case 15:
              return { maxBars: 48, historyBars: 40 }
            case 30:
              return { maxBars: 56, historyBars: 48 }
            case 45:
              return { maxBars: 64, historyBars: 56 }
            case 60:
              return { maxBars: 80, historyBars: 60 }
            default:
              return { maxBars: 80, historyBars: 60 }
          }
        })()

        if (data.length > viewWindow.maxBars) {
          const nowIndex = data.findIndex(d => d.timestamp >= now)
          if (nowIndex > -1) {
            const startIndex = Math.max(0, nowIndex - viewWindow.historyBars)
            data = data.slice(startIndex, startIndex + viewWindow.maxBars)
          } else {
            data = data.slice(-viewWindow.maxBars)
          }
        }

        setChartData(data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [stationId, selectedPeriod])

  // Calculate statistics
  const currentLevel = chartData.length > 0
    ? chartData.filter(d => d.actual !== null).pop()?.actual
    : null

  const latestForecast = chartData.length > 0
    ? (chartData.find(d => d.timestamp >= Date.now() && d.forecast !== null)?.forecast ?? null)
    : null

  const trend = chartData.length >= 2
    ? (() => {
      const actuals = chartData.filter(d => d.actual !== null)
      if (actuals.length >= 2) {
        const last = actuals[actuals.length - 1].actual
        const prev = actuals[actuals.length - 2].actual
        return last > prev ? '↗ Rising' : last < prev ? '↘ Falling' : '→ Stable'
      }
      return '→ Stable'
    })()
    : '→ Stable'

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg">{stationName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 w-full flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="text-base sm:text-lg">{stationName}</CardTitle>
        <div className="flex items-center gap-2">
          {/* Quick buttons for common periods */}
          <div className="hidden sm:flex gap-1">
            <Button
              variant={selectedPeriod === 15 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(15)}
              className="text-xs"
            >
              15m
            </Button>
            <Button
              variant={selectedPeriod === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(30)}
              className="text-xs"
            >
              30m
            </Button>
            <Button
              variant={selectedPeriod === 45 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(45)}
              className="text-xs"
            >
              45m
            </Button>
            <Button
              variant={selectedPeriod === 60 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(60)}
              className="text-xs"
            >
              60m
            </Button>
            <Button
              variant={selectedPeriod === 1440 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(1440)}
              className="text-xs"
            >
              1D
            </Button>
          </div>
          {/* Dropdown for all options */}
          <div className="sm:hidden">
            <Select
              value={selectedPeriod.toString()}
              onValueChange={(value) => setSelectedPeriod(Number(value) as PeriodOption)}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500" />
            <span className="text-sm text-slate-300">Actual Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500" style={{ backgroundImage: 'linear-gradient(90deg, #3B82F6 50%, transparent 50%)', backgroundSize: '5px 100%' }} />
            <span className="text-sm text-slate-300">Forecast</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={20}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              tickFormatter={(value) => {
                if (!value || isNaN(value)) return ''
                const date = new Date(value)
                if (isNaN(date.getTime())) return ''
                // Always show time for minute-based views
                return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={['auto', 'auto']}
              tickFormatter={(value) => typeof value === 'number' ? `${value.toFixed(1)}m` : value}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="actual"
              fill="var(--color-actual)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="forecast"
              fill="var(--color-forecast)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Quick Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-400">Current</p>
            <p className="text-sm sm:text-lg font-bold text-green-400">
              {currentLevel !== null ? `${currentLevel}m` : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-400">Next Forecast</p>
            <p className="text-sm sm:text-lg font-bold text-blue-400">
              {latestForecast !== null ? `${latestForecast}m` : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-400">Trend</p>
            <p className="text-sm sm:text-lg font-bold text-yellow-400">
              {trend}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}