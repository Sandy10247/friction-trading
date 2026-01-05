import { useState } from 'react'
import { apiClient } from './utils/api'
import { PING_API_URL } from './constants'
import Navbar from './components/Navbar'
import './App.css'
import { Outlet } from 'react-router'

function App() {

  const fetchData = () => {
    apiClient.get(PING_API_URL)
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => console.error('Error fetching data:', error))
  }


  const [message, setMessage] = useState<string>('')

  return (
    <>
      <Navbar />
      <button onClick={fetchData}>
        ping
      </button>
      {message && (
        <div>
          <h2>Server Response:</h2>
          <p>{message}</p>
        </div>
      )}
      <Outlet />
    </>
  )
}

export default App
