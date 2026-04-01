import { useState } from 'react'
import './css/App.css'
import ContactBar from './components/componentBar'
import GlassCard from './components/GlassCard'
import Aero from './components/aero';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Aero className="fixed bottom-4 right-4 z-10" />
      <div className="flex items-center justify-center min-h-screen gap-10 flex-col-reverse md:flex-row md:gap-30">
        <GlassCard />
        <div className="flex flex-col items-center gap-5">
          <img
            src="src/assets/profile.svg"
            className="w-70 h-70 object-cover rounded-full flex items-center justify-center text-4xl shadow-lg"
          />
          <div className=''>
            <ContactBar />
          </div>
        </div>
      </div>
    </>
  )
}

export default App