import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './pages/landing'
import Navbar from './components/NavBar'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navbar />
    <Landing />
  </StrictMode>,
)
