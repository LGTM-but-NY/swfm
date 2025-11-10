"use client"

interface MapViewProps {
  onStationSelect: (station: string) => void
}

export function MapView({ onStationSelect }: MapViewProps) {
  const stations = [
    { name: "Chiang Khong", lat: 20.27, lon: 100.45 },
    { name: "Nong Khai", lat: 17.88, lon: 102.74 },
    { name: "Vientiane", lat: 17.97, lon: 102.63 },
    { name: "Pakse", lat: 15.12, lon: 105.81 },
  ]

  return (
    <div className="h-96 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col">
      {/* Map Placeholder */}
      <div className="flex-1 bg-slate-900 rounded mb-4 flex items-center justify-center relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300">
          <path d="M 50 150 Q 100 80 150 100 T 250 120 Q 300 140 350 160" stroke="currentColor" fill="none" />
          <circle cx="80" cy="120" r="3" fill="currentColor" />
          <circle cx="160" cy="110" r="3" fill="currentColor" />
          <circle cx="240" cy="130" r="3" fill="currentColor" />
          <circle cx="320" cy="155" r="3" fill="currentColor" />
        </svg>
        <p className="text-slate-400 text-sm z-10">Mekong River Monitoring Stations</p>
      </div>

      {/* Station List */}
      <div className="grid grid-cols-2 gap-2">
        {stations.map((station) => (
          <button
            key={station.name}
            onClick={() => onStationSelect(station.name)}
            className="p-2 bg-slate-700 hover:bg-blue-600 rounded text-left text-xs transition-colors"
          >
            <p className="text-white font-medium">{station.name}</p>
            <p className="text-slate-400 text-xs">
              {station.lat.toFixed(2)}°, {station.lon.toFixed(2)}°
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
