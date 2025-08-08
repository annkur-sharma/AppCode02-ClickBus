import { useState, useEffect } from 'react'
import { Leaf, CloudSun, Waves, Zap, Mountain, Star } from 'lucide-react'

interface TileData {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  facts: string[]
}

const tiles: TileData[] = [
  {
    id: 'leaf',
    name: 'Leaf',
    icon: <Leaf className="w-16 h-16" />,
    color: 'bg-gradient-to-br from-green-400 to-green-600',
    facts: [
      'Leaves produce oxygen through photosynthesis',
      'A single tree can have up to 100,000 leaves',
      'Leaves change color due to chlorophyll breakdown'
    ]
  },
  {
    id: 'sky',
    name: 'Sky',
    icon: <CloudSun className="w-16 h-16" />,
    color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    facts: [
      'The sky appears blue due to light scattering',
      'Sunsets are red because of longer light wavelengths',
      'The atmosphere extends up to 10,000 km above Earth'
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: <Waves className="w-16 h-16" />,
    color: 'bg-gradient-to-br from-cyan-400 to-blue-700',
    facts: [
      'Oceans cover 71% of Earth\'s surface',
      'The deepest ocean point is 36,000 feet down',
      'Oceans contain 99% of Earth\'s living space'
    ]
  },
  {
    id: 'lightning',
    name: 'Lightning',
    icon: <Zap className="w-16 h-16" />,
    color: 'bg-gradient-to-br from-yellow-400 to-purple-600',
    facts: [
      'Lightning is 5x hotter than the sun\'s surface',
      'Thunder is the sound of lightning expanding air',
      'Lightning strikes Earth 100 times per second'
    ]
  },
  {
    id: 'mountain',
    name: 'Mountain',
    icon: <Mountain className="w-16 h-16" />,
    color: 'bg-gradient-to-br from-gray-500 to-gray-800',
    facts: [
      'Mountains cover 25% of Earth\'s land surface',
      'The tallest mountain is Mount Everest at 29,032 feet',
      'Mountains create their own weather patterns'
    ]
  },
  {
    id: 'stars',
    name: 'Stars',
    icon: <Star className="w-16 h-16" />,
    color: 'bg-gradient-to-br from-purple-500 to-indigo-800',
    facts: [
      'There are more stars than grains of sand on Earth',
      'Our sun is a medium-sized yellow dwarf star',
      'Stars are born in nebulae from gas and dust'
    ]
  }
]

export default function Home() {
  const [podGuid, setPodGuid] = useState<string>('')
  const [podInfo, setPodInfo] = useState<any>(null)
  const [currentFacts, setCurrentFacts] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch the persistent pod GUID from backend
    const fetchPodGuid = async () => {
      try {
        const response = await fetch('/api/pod-guid')
        const data = await response.json()
        setPodGuid(data.podGuid)
        setPodInfo(data)
        setLoading(false)
        
        // Log session start with the pod GUID
        logAction('session_start', data.podGuid, `Session started - Pod: ${data.podName}`)
      } catch (error) {
        console.error('Failed to fetch pod GUID:', error)
        // Fallback to a temporary GUID if backend is not available
        const fallbackGuid = crypto.randomUUID()
        setPodGuid(fallbackGuid)
        setLoading(false)
        logAction('session_start', fallbackGuid, 'Session started - Fallback mode')
      }
    }
    
    fetchPodGuid()
  }, [])

  const logAction = async (action: string, guid: string, details: string) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          guid,
          details,
          timestamp: new Date().toISOString(),
          podName: 'frontend-pod' // This would be injected via env in actual deployment
        })
      })
    } catch (error) {
      console.error('Failed to log action:', error)
    }
  }

  const handleTileClick = (tile: TileData) => {
    // Rotate to next fact
    const currentIndex = currentFacts[tile.id] || 0
    const nextIndex = (currentIndex + 1) % tile.facts.length
    setCurrentFacts(prev => ({ ...prev, [tile.id]: nextIndex }))
    
    // Log the click with the pod GUID
    logAction('tile_click', podGuid, `Clicked ${tile.name} tile - Fact ${nextIndex + 1}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white">ClickBus Application</h1>
          <p className="text-purple-200 mt-2">Azure Service Bus Powered Tile Interface</p>
          <div className="text-sm text-purple-300 mt-1">
            Pod GUID: <span className="font-mono text-purple-100">{loading ? 'Loading...' : podGuid}</span>
            {podInfo && !loading && (
              <div className="mt-2 text-xs space-y-1">
                <div>Pod: <span className="font-mono text-purple-100">{podInfo.podName}</span></div>
                <div>Requests Handled: <span className="font-mono text-purple-100">{podInfo.requestsHandled}</span></div>
                <div>Uptime: <span className="font-mono text-purple-100">{podInfo.uptime}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Interactive Knowledge Tiles</h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Click on any tile to explore fascinating facts. Each interaction is logged and tracked through Azure Service Bus.
          </p>
          {!loading && podInfo && (
            <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 max-w-2xl mx-auto">
              <div className="text-sm text-purple-200">
                <div className="font-semibold mb-2">🚀 Deployment Testing Ready</div>
                <div>Each pod generates a unique GUID for 10-replica testing</div>
                <div className="text-xs mt-2 text-purple-300">
                  This pod will maintain GUID <span className="font-mono">{podGuid.substring(0, 8)}...</span> throughout its lifecycle
                </div>
              </div>
            </div>
          )}
          {loading && (
            <div className="mt-4 text-purple-300">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-300"></div>
              <span className="ml-2">Loading pod information...</span>
            </div>
          )}
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiles.map((tile) => {
            const factIndex = currentFacts[tile.id] || 0
            return (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`${tile.color} rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 active:scale-95`}
              >
                <div className="text-center">
                  <div className="text-white mb-4 flex justify-center">
                    {tile.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{tile.name}</h3>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-h-[120px] flex items-center">
                    <p className="text-white text-sm leading-relaxed">
                      {tile.facts[factIndex]}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center space-x-2">
                    {tile.facts.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === factIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-16">
          <div className="space-x-4 mb-6">
            <a
              href="/api/logs/guid"
              target="_blank"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              View Pod GUID Logs
            </a>
            <a
              href="/api/logs/data"
              target="_blank"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              View Pod Activity
            </a>
            <a
              href="/api/pod-status"
              target="_blank"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Pod Deployment Status
            </a>
          </div>
          
        </div>
      </div>
    </div>
  )
}
