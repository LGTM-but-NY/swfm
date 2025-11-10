"use client"

export function DataSourcesTable() {
  const sources = [
    { id: 1, name: "Thai Meteorological Station", type: "Weather", status: "Connected", lastSync: "2min ago" },
    { id: 2, name: "Laos Water Authority", type: "Hydro", status: "Connected", lastSync: "5min ago" },
    { id: 3, name: "USGS River Data", type: "External", status: "Connected", lastSync: "1hr ago" },
    { id: 4, name: "Local Sensors Network", type: "IoT", status: "Connected", lastSync: "30sec ago" },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Source</th>
            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Type</th>
            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
            <th className="text-right py-3 px-4 text-slate-300 font-semibold">Last Sync</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id} className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="py-3 px-4 text-slate-100 font-medium">{source.name}</td>
              <td className="text-center py-3 px-4 text-slate-300">{source.type}</td>
              <td className="text-center py-3 px-4">
                <span className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs font-medium">
                  {source.status}
                </span>
              </td>
              <td className="text-right py-3 px-4 text-slate-400">{source.lastSync}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
