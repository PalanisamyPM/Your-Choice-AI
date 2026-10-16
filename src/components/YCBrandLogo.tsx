import React from 'react';

interface YCBrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const YCBrandLogo: React.FC<YCBrandLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_16px_rgba(0,102,255,0.35)]"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Blue Liquid Gradients */}
            <linearGradient id="blueGlow" x1="10" y1="10" x2="60" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="40%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#0033AA" />
            </linearGradient>
            <linearGradient id="blueHighlight" x1="20" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </linearGradient>

            {/* Red Liquid Gradients */}
            <linearGradient id="redGlow" x1="50" y1="40" x2="110" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B8B" />
              <stop offset="45%" stopColor="#FF2A4D" />
              <stop offset="100%" stopColor="#99001A" />
            </linearGradient>
            <linearGradient id="redHighlight" x1="60" y1="50" x2="90" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FF6B8B" stopOpacity="0" />
            </linearGradient>

            {/* Filter for subtle 3D splash sheen */}
            <filter id="splashSheen" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Outer White Contour Wrapper (like the liquid sticker border) */}
          <g filter="url(#splashSheen)">
            {/* White Stroke Outer Silhouette */}
            <path
              d="M 28 20 
                 C 15 22, 10 35, 20 45 
                 C 25 50, 32 46, 38 42
                 C 32 54, 25 65, 36 78
                 C 44 88, 52 75, 56 68
                 C 54 78, 58 92, 70 96
                 C 86 102, 104 90, 106 72
                 C 108 58, 92 48, 80 50
                 C 74 51, 70 56, 73 62
                 C 76 67, 84 65, 89 72
                 C 93 78, 86 86, 76 84
                 C 66 82, 63 70, 64 62
                 C 60 56, 54 48, 48 36
                 C 56 30, 68 28, 72 20
                 C 60 18, 48 24, 42 30
                 C 38 24, 34 19, 28 20 Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Stylized Liquid Blue 'Y' */}
            <path
              d="M 28 22
                 C 16 24, 12 36, 21 44
                 C 26 48, 33 44, 38 40
                 C 33 52, 27 64, 36 76
                 C 43 85, 50 74, 54 66
                 C 47 52, 42 38, 38 32
                 C 45 27, 56 25, 68 21
                 C 57 19, 47 25, 41 30
                 C 37 25, 33 21, 28 22 Z"
              fill="url(#blueGlow)"
            />

            {/* Blue Highlights & Splash Shine */}
            <path
              d="M 30 26 C 24 28, 22 34, 26 38 C 29 40, 33 36, 36 32 C 34 29, 32 26, 30 26 Z"
              fill="url(#blueHighlight)"
            />
            <path
              d="M 40 34 C 44 48, 49 58, 52 64 C 53 62, 50 54, 47 42 C 45 36, 42 33, 40 34 Z"
              fill="#FFFFFF"
              opacity="0.6"
            />

            {/* Blue Liquid Droplets */}
            <circle cx="16" cy="38" r="4.5" fill="#00D2FF" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="20" cy="52" r="3.5" fill="#0066FF" stroke="#FFFFFF" strokeWidth="1.2" />
            <circle cx="28" cy="65" r="4" fill="#00A2FF" stroke="#FFFFFF" strokeWidth="1.4" />
            <circle cx="34" cy="74" r="2.8" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="1" />

            {/* Stylized Liquid Red 'C' */}
            <path
              d="M 72 38
                 C 86 36, 102 44, 104 60
                 C 106 74, 94 92, 75 92
                 C 58 92, 52 78, 56 66
                 C 60 55, 70 52, 76 56
                 C 81 60, 78 68, 73 69
                 C 68 70, 65 76, 71 81
                 C 78 86, 88 82, 91 73
                 C 93 65, 87 52, 74 50
                 C 69 49, 67 43, 72 38 Z"
              fill="url(#redGlow)"
            />

            {/* Red Highlights & Splash Shine */}
            <path
              d="M 78 44 C 88 43, 97 50, 98 60 C 99 64, 95 62, 92 56 C 88 50, 82 46, 78 44 Z"
              fill="url(#redHighlight)"
            />
            <path
              d="M 68 76 C 73 83, 83 83, 86 78 C 88 74, 85 79, 78 79 C 73 79, 70 76, 68 76 Z"
              fill="#FFFFFF"
              opacity="0.65"
            />

            {/* Red Liquid Droplets */}
            <circle cx="98" cy="52" r="4.5" fill="#FF2A4D" stroke="#FFFFFF" strokeWidth="1.5" />
            <path
              d="M 96 50 C 104 46, 108 52, 102 56 C 98 58, 95 54, 96 50 Z"
              fill="url(#redGlow)"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
            <circle cx="98" cy="76" r="3.8" fill="#FF6B8B" stroke="#FFFFFF" strokeWidth="1.3" />
            <circle cx="89" cy="88" r="4.2" fill="#FF2A4D" stroke="#FFFFFF" strokeWidth="1.4" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg leading-none">
            <span className="text-white">YC</span>
            <span className="text-slate-500 font-light">•</span>
            <span className="text-gradient-yc font-extrabold tracking-tight">TaskForge</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-blue-500/20 text-cyan-400 border border-blue-500/30">
              AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 tracking-wide font-medium mt-1">
            Plan · Build · Achieve
          </span>
        </div>
      )}
    </div>
  );
};
