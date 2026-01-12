import { useState } from 'react'
import { Outlet } from 'react-router'

import Navbar from './components/Navbar'
import { apiClient } from './utils/api'
import { PING_API_URL } from './constants'

function App() {
  const [message, setMessage] = useState<string>('')

  const fetchData = () => {
    apiClient
      .get(PING_API_URL)
      .then((response) => {
        setMessage(response.data.message)
      })
      .catch((error) => console.error('Error fetching data:', error))
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <button
            onClick={fetchData}
            className="
              relative px-8 py-4 text-lg font-semibold text-white
              bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
              rounded-full shadow-2xl
              hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
              focus:outline-none focus:ring-4 focus:ring-indigo-500/50
              transform transition-all duration-300 hover:scale-110 active:scale-95
              before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r
              before:from-indigo-500/30 before:via-purple-500/30 before:to-pink-500/30
              before:blur-xl before:opacity-0 hover:before:opacity-100
              overflow-hidden
            "
          >
            <span className="relative z-10">Ping Server</span>
          </button>

          {message && (
            <div className="mt-12 rounded-lg border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md max-w-2xl mx-auto">
              <h2 className="mb-3 text-2xl font-semibold text-indigo-400">Server Response:</h2>
              <p className="text-gray-300 font-mono break-all">{message}</p>
            </div>
          )}
        </div>
      </main>

      <Outlet />
    </div>
  )
}

export default App