import React from 'react';

interface JJLogoProps {
  className?: string;
  size?: number;
  layout?: 'horizontal' | 'stacked' | 'icon-only';
  bgPureWhite?: boolean;
}

export const JJLogo: React.FC<JJLogoProps> = ({ 
  className = '', 
  size = 44,
  layout = 'horizontal',
  bgPureWhite = true
}) => {
  return (
    <div 
      className={`inline-flex items-center ${
        layout === 'stacked' ? 'flex-col justify-center text-center' : 'flex-row'
      } ${
        bgPureWhite 
          ? 'bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-100' 
          : ''
      } ${className}`}
      id="jj-mudancas-logo-container"
    >
      {/* Modern Circular Vector Emblem */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        id="jj-mudancas-vector-emblem"
      >
        <defs>
          {/* Inner circle clip for crisp edges */}
          <clipPath id="jjCircleClip">
            <circle cx="60" cy="60" r="54" />
          </clipPath>

          {/* Gradients for vibrant depth while strictly adhering to colors */}
          <linearGradient id="blueSideGrad" x1="10" y1="10" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0a1128" />
            <stop offset="50%" stopColor="#0f2b5c" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="pinkSideGrad" x1="60" y1="60" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="60%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>

          <linearGradient id="topBlueStripe" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f2b5c" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="bottomPinkStripe" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Circular Artwork inside ClipPath */}
        <g clipPath="url(#jjCircleClip)">
          {/* Upper-Left Side: Dark Blue (split diagonally top-right to bottom-left) */}
          <path 
            d="M-10,-10 L130,-10 L-10,130 Z" 
            fill="url(#blueSideGrad)" 
          />

          {/* Lower-Right Side: Vibrant Pink */}
          <path 
            d="M130,-10 L130,130 L-10,130 Z" 
            fill="url(#pinkSideGrad)" 
          />

          {/* Dynamic Diagonal Stripe 1: Top Blue Stripe */}
          <polygon 
            points="-20,40 140,-40 140,-22 -20,58" 
            fill="url(#topBlueStripe)" 
            opacity="0.95"
          />

          {/* Dynamic Diagonal Stripe 2: Middle White Empty Space (gap cut through colors) */}
          <polygon 
            points="-20,53 140,-27 140,-13 -20,67" 
            fill="#ffffff" 
          />

          {/* Dynamic Diagonal Stripe 3: Bottom Pink Stripe */}
          <polygon 
            points="-20,72 140,-8 140,6 -20,86" 
            fill="url(#bottomPinkStripe)" 
            opacity="0.95"
          />

          {/* Fine White Cut Accent in pink half */}
          <polygon 
            points="-20,88 140,8 140,14 -20,94" 
            fill="#ffffff" 
            opacity="0.9"
          />
        </g>

        {/* Pure Outer White Ring & Crisp Frame */}
        <circle cx="60" cy="60" r="54" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      </svg>

      {/* Typography Section */}
      {layout !== 'icon-only' && (
        <div 
          className={`flex items-baseline font-black tracking-tight select-none ${
            layout === 'stacked' ? 'mt-1.5' : 'ml-2.5'
          }`}
        >
          {/* 'JJ' in bold pink font on the left */}
          <span 
            className="text-pink-600 font-extrabold text-lg sm:text-xl tracking-tighter mr-1"
            style={{ color: '#db2777', fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            JJ
          </span>

          {/* 'MUDANÇAS' in bold dark blue font on the right */}
          <span 
            className="text-slate-900 font-black text-lg sm:text-xl tracking-wider uppercase"
            style={{ color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            MUDANÇAS
          </span>
        </div>
      )}
    </div>
  );
};

export default JJLogo;
