import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import './index.css'

function Root() {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {/* Render App in background so Three.js begins loading immediately */}
      <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        <App />
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
