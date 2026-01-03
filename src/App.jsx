import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      {/* Test Card */}
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 text-center">
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          React + Tailwind
        </h1>
        
        <p className="text-slate-400 mb-8">
          If this box has a dark background and the text above is a gradient, 
          <span className="text-green-400 font-mono"> Tailwind is working!</span>
        </p>

        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 transition-colors rounded-lg font-semibold shadow-lg active:scale-95"
        >
          Count is {count}
        </button>

        <div className="mt-8 flex justify-center gap-4 text-sm text-slate-500">
          <code className="bg-slate-900 px-2 py-1 rounded">Edit src/App.jsx</code>
        </div>
      </div>
    </div>
  )
}

export default App