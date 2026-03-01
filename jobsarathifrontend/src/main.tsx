import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './pages/landing'
// import Navbar from './components/NavBar'
// import HeroSection from './components/hero'
// import JobSarathiCTA from './pages/Newslatter'
// import FeatureSection from './pages/Feature'
// import Footer from './pages/Footer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
    {/* <Navbar />
    <Landing />
    <HeroSection />
    <FeatureSection />
    <JobSarathiCTA />
    <Footer />   */}
  </StrictMode>,
)
