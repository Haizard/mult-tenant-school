export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Debug Page - No Duplication
        </h1>
        
        <div className="glass-card p-6 mb-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Single Glass Card</h2>
          <p className="text-text-secondary">This should appear only once on the page.</p>
        </div>
        
        <div className="glass-card-strong p-6 mb-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Strong Glass Card</h2>
          <p className="text-text-secondary">This should also appear only once.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Card 1</h3>
            <p className="text-text-secondary">First card in grid</p>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Card 2</h3>
            <p className="text-text-secondary">Second card in grid</p>
          </div>
        </div>
      </div>
    </div>
  );
}

