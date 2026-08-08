const ScoreCircle = ({ score = 75, size = 100 }: { score?: number; size?: number }) => {
  const stroke = 14; 
  const trackStroke = stroke - 2; 
  const padding = 4;
  const radius = (100 - stroke - padding * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: size, height: size }}
    >
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        // 1. Removed CSS transform rotation to prevent GPU layer rasterization
        className="absolute inset-0" 
        // 2. Forced smooth anti-aliasing
        shapeRendering="geometricPrecision" 
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={trackStroke}
          fill="transparent"
        />
        
        {/* 
          3. Added gradientUnits="userSpaceOnUse" 
          This locks the gradient to the 100x100 canvas so it doesn't spin 
          when we natively rotate the circle shape below.
        */}
        <defs>
          <linearGradient 
            id="score-gradient" 
            x1="0" y1="100" x2="100" y2="0" 
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ef4444" />   {/* Red */}
            <stop offset="33%" stopColor="#f97316" />  {/* Orange */}
            <stop offset="66%" stopColor="#eab308" />  {/* Yellow */}
            <stop offset="100%" stopColor="#22c55e" /> {/* Green */}
          </linearGradient>
        </defs>
        
        {/* Partial circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="url(#score-gradient)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // 4. Rotated the vector math directly instead of using CSS
          transform="rotate(-90 50 50)" 
        />
      </svg>

      <div 
        className="relative font-semibold flex flex-col items-center justify-center"
        style={{ fontSize: size * 0.16 }}
      >
        <span>{`${score}/100`}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;