function App() {
  return (
    <>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
            Talent AI
          </h1>
          <p className="text-slate-300 text-lg">
            Frontend configurado con Vite, React y Tailwind CSS
          </p>
          <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
            Comenzar
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
