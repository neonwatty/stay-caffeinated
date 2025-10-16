export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Test responsive design */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
          Tailwind CSS Test Page
        </h1>

        {/* Test flexbox and grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition hover:scale-105">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Card 1</h2>
            <p className="text-gray-600">Testing responsive grid layout</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition hover:scale-105">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Card 2</h2>
            <p className="text-gray-600">Testing hover effects</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition hover:scale-105">
            <h2 className="text-xl font-semibold text-purple-600 mb-2">Card 3</h2>
            <p className="text-gray-600">Testing shadows and transitions</p>
          </div>
        </div>

        {/* Test animations */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>

          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg animate-bounce">
            <p className="font-bold">Testing animation classes (bounce)</p>
          </div>

          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 transform active:scale-95">
            Interactive Button
          </button>
        </div>

        {/* Test custom game colors */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 rounded bg-red-500 flex items-center justify-center text-white font-semibold">
            Low Caffeine
          </div>
          <div className="h-20 rounded bg-green-500 flex items-center justify-center text-white font-semibold">
            Optimal
          </div>
          <div className="h-20 rounded bg-amber-500 flex items-center justify-center text-white font-semibold">
            High Caffeine
          </div>
          <div className="h-20 rounded bg-red-600 flex items-center justify-center text-white font-semibold">
            Health Bar
          </div>
        </div>
      </div>
    </div>
  );
}