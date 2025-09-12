export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Glassmorphism Style Test
        </h1>
        
        {/* Test Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Glass Card</h2>
            <p className="text-text-secondary">This should have a glassmorphism effect with backdrop blur and transparency.</p>
          </div>
          
          <div className="glass-card-strong p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Strong Glass Card</h2>
            <p className="text-text-secondary">This should have a stronger glassmorphism effect.</p>
          </div>
          
          <div className="glass-card-premium p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Premium Glass Card</h2>
            <p className="text-text-secondary">This should have the premium glassmorphism effect.</p>
          </div>
        </div>
        
        {/* Test Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Glass Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="glass-button px-6 py-3 text-text-primary">
              Default Glass Button
            </button>
            <button className="glass-button bg-gradient-to-r from-accent-purple to-accent-purple-light text-white px-6 py-3">
              Purple Gradient Button
            </button>
            <button className="glass-button bg-gradient-to-r from-accent-green to-accent-green-light text-white px-6 py-3">
              Green Gradient Button
            </button>
          </div>
        </div>
        
        {/* Test Inputs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Glass Inputs</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Glass input field" 
              className="glass-input w-full px-4 py-3 text-text-primary placeholder-text-muted"
            />
            <textarea 
              placeholder="Glass textarea" 
              className="glass-input w-full px-4 py-3 text-text-primary placeholder-text-muted h-24"
            />
          </div>
        </div>
        
        {/* Test Glow Effects */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Glow Effects</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-4 text-center purple-glow">
              <p className="text-text-primary">Purple Glow</p>
            </div>
            <div className="glass-card p-4 text-center green-glow">
              <p className="text-text-primary">Green Glow</p>
            </div>
            <div className="glass-card p-4 text-center blue-glow">
              <p className="text-text-primary">Blue Glow</p>
            </div>
            <div className="glass-card p-4 text-center orange-glow">
              <p className="text-text-primary">Orange Glow</p>
            </div>
            <div className="glass-card p-4 text-center red-glow">
              <p className="text-text-primary">Red Glow</p>
            </div>
          </div>
        </div>
        
        {/* Test Animations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Animations</h2>
          <div className="flex flex-wrap gap-4">
            <div className="glass-card p-6 animate-float">
              <p className="text-text-primary">Float Animation</p>
            </div>
            <div className="glass-card p-6 animate-glow">
              <p className="text-text-primary">Glow Animation</p>
            </div>
            <div className="glass-card p-6 animate-slide-in-up">
              <p className="text-text-primary">Slide In Up</p>
            </div>
          </div>
        </div>
        
        {/* Test Gradient Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Gradient Text</h2>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold gradient-text">Gradient Text Effect</h3>
            <h3 className="text-3xl font-bold gradient-text-animated">Animated Gradient Text</h3>
          </div>
        </div>
      </div>
    </div>
  );
}