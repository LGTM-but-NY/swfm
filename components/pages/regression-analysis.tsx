"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from "recharts"

interface RegressionAnalysisProps {
  role: "expert" | "admin"
  onNavigate: (page: "guest" | "expert" | "tune" | "evaluation" | "admin" | "users" | "data" | "preprocessing" | "map" | "regression") => void
  onLogout: () => void
}

export function RegressionAnalysisPage({ role, onNavigate, onLogout }: RegressionAnalysisProps) {
  // Feature importance data - showing the impact level of each feature
  const featureImportanceData = [
    { feature: "Current Water Level", importance: 0.35, type: "Numerical" },
    { feature: "3-Day Rainfall", importance: 0.28, type: "Numerical" },
    { feature: "7-Day Lagged Level", importance: 0.18, type: "Numerical" },
    { feature: "Temperature", importance: 0.08, type: "Numerical" },
    { feature: "Humidity", importance: 0.06, type: "Numerical" },
    { feature: "Season", importance: 0.05, type: "Categorical" },
  ]

  // Mekong River stations data
  const mekongStations = [
    { name: "Jinghong", country: "China", lat: 22.02, lon: 100.79 },
    { name: "Chiang Saen", country: "Thailand", lat: 20.27, lon: 100.08 },
    { name: "Luang Prabang", country: "Laos", lat: 19.88, lon: 102.14 },
    { name: "Vientiane (KM4)", country: "Laos", lat: 17.97, lon: 102.61 },
    { name: "Pakse", country: "Laos", lat: 15.12, lon: 105.80 },
    { name: "Stung Treng", country: "Cambodia", lat: 13.57, lon: 105.97 },
    { name: "Kratie", country: "Cambodia", lat: 12.49, lon: 106.02 },
    { name: "Tan Chau", country: "Vietnam", lat: 10.78, lon: 105.24 },
    { name: "Châu Đốc", country: "Vietnam", lat: 10.70, lon: 105.05 },
  ]

  // Scatter plot data - actual vs predicted (sample from stations)
  const scatterData = [
    { actual: 2.5, predicted: 2.48, residual: 0.02, station: "Jinghong" },
    { actual: 2.8, predicted: 2.85, residual: -0.05, station: "Chiang Saen" },
    { actual: 3.1, predicted: 3.08, residual: 0.02, station: "Luang Prabang" },
    { actual: 3.5, predicted: 3.42, residual: 0.08, station: "Vientiane" },
    { actual: 3.8, predicted: 3.85, residual: -0.05, station: "Pakse" },
    { actual: 4.2, predicted: 4.15, residual: 0.05, station: "Stung Treng" },
    { actual: 4.5, predicted: 4.52, residual: -0.02, station: "Kratie" },
    { actual: 4.8, predicted: 4.75, residual: 0.05, station: "Tan Chau" },
    { actual: 5.1, predicted: 5.12, residual: -0.02, station: "Châu Đốc" },
  ]

  // Residual distribution
  const residualData = [
    { range: "-0.2", count: 2 },
    { range: "-0.1", count: 8 },
    { range: "0", count: 45 },
    { range: "0.1", count: 12 },
    { range: "0.2", count: 3 },
  ]

  // Model comparison
  const modelComparison = [
    { 
      name: "Linear Regression",
      rmse: 0.312,
      mae: 0.245,
      r2: 0.87,
      type: "Simple"
    },
    { 
      name: "Polynomial Regression",
      rmse: 0.278,
      mae: 0.198,
      r2: 0.89,
      type: "Complex"
    },
    { 
      name: "Ridge Regression",
      rmse: 0.289,
      mae: 0.215,
      r2: 0.88,
      type: "Regularized"
    },
    { 
      name: "LSTM (Deep Learning)",
      rmse: 0.267,
      mae: 0.189,
      r2: 0.91,
      type: "Neural Network"
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="regression" role={role} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Regression Model Analysis" role={role} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2">Regression Analysis - Mekong River Basin</h3>
              <p className="text-slate-400 text-sm">
                Analyze the impact level of features on water level forecast results across {mekongStations.length} monitoring stations. 
                Regression models help understand the relationship between input features and output predictions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {mekongStations.map((station) => (
                  <span key={station.name} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {station.name} ({station.country})
                  </span>
                ))}
              </div>
            </div>

            {/* Feature Importance */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Feature Importance (Impact Level Analysis)</CardTitle>
                <CardDescription className="text-slate-400">
                  Factors affecting water level forecast results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureImportanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="feature" type="category" width={150} stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Bar dataKey="importance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {featureImportanceData.slice(0, 3).map((item) => (
                    <div key={item.feature} className="bg-slate-700 rounded p-3">
                      <p className="text-xs text-slate-400">{item.feature}</p>
                      <p className="text-lg font-bold text-blue-400 mt-1">
                        {(item.importance * 100).toFixed(1)}%
                      </p>
                      <span className="text-xs text-slate-500">{item.type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Actual vs Predicted Scatter Plot */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Actual vs Predicted Values</CardTitle>
                  <CardDescription className="text-slate-400">
                    Comparison across 9 Mekong stations (R² = 0.91)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        type="number" 
                        dataKey="actual" 
                        name="Actual" 
                        stroke="#94a3b8"
                        label={{ value: 'Actual (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="predicted" 
                        name="Predicted" 
                        stroke="#94a3b8"
                        label={{ value: 'Predicted (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        formatter={(value: number, name: string) => [value.toFixed(2) + 'm', name]}
                        labelFormatter={(value: any, payload: any) => {
                          if (payload && payload[0]) {
                            return `Station: ${payload[0].payload.station}`
                          }
                          return ''
                        }}
                      />
                      <Scatter name="Predictions" data={scatterData} fill="#3b82f6" />
                      {/* Perfect prediction line */}
                      <Line 
                        type="linear" 
                        data={[{actual: 2, predicted: 2}, {actual: 6, predicted: 6}]} 
                        dataKey="predicted"
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Green line: Perfect prediction line
                  </p>
                </CardContent>
              </Card>

              {/* Residual Distribution */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Residual Distribution</CardTitle>
                  <CardDescription className="text-slate-400">
                    Error Distribution Analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={residualData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="range" 
                        stroke="#94a3b8"
                        label={{ value: 'Residual (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      />
                      <Bar dataKey="count" fill="#a78bfa" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Normal distribution = Good model
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Model Comparison Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Regression Model Comparison</CardTitle>
                <CardDescription className="text-slate-400">
                  Performance comparison of regression models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Model</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">Type</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">RMSE ↓</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">MAE ↓</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">R² ↑</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelComparison.map((model, idx) => (
                        <tr key={model.name} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4 text-slate-100 font-medium">{model.name}</td>
                          <td className="text-center py-3 px-4">
                            <span className="bg-slate-600 text-slate-200 px-2 py-1 rounded text-xs">
                              {model.type}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4 text-slate-300">{model.rmse.toFixed(3)}</td>
                          <td className="text-center py-3 px-4 text-slate-300">{model.mae.toFixed(3)}</td>
                          <td className="text-center py-3 px-4 text-slate-300">{model.r2.toFixed(2)}</td>
                          <td className="text-center py-3 px-4 text-slate-400 text-xs">
                            {idx === 0 && "Baseline, Fast"}
                            {idx === 1 && "Non-linear patterns"}
                            {idx === 2 && "Prevent overfitting"}
                            {idx === 3 && "Complex patterns"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Key Insights */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded p-4">
                    <h4 className="text-white font-semibold mb-2">📊 What is Regression?</h4>
                    <p className="text-slate-300 text-sm mb-2">
                      Regression predicts <strong>continuous values</strong>
                    </p>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>• Water level forecast: 3.52m, 4.15m,...</li>
                      <li>• Output: Real numbers</li>
                      <li>• Evaluation: RMSE, MAE, R²</li>
                    </ul>
                  </div>

                  <div className="bg-slate-700 rounded p-4">
                    <h4 className="text-white font-semibold mb-2">🎯 What is Classification?</h4>
                    <p className="text-slate-300 text-sm mb-2">
                      Classification predicts <strong>categories/classes</strong>
                    </p>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>• Levels: Normal, Warning, Critical</li>
                      <li>• Output: Labels/Classes</li>
                      <li>• Evaluation: Accuracy, Precision, F1</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
