import React from 'react';

interface TreeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
  kannadaText?: boolean;
}

export const TreeLogo: React.FC<TreeLogoProps> = ({
  size = 'md',
  className = '',
  withText = false,
  kannadaText = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const svgSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Accessible Minimalist Indian Civic Tree Emblem (Kalpavriksha) */}
      <div className={`relative flex items-center justify-center shrink-0 ${svgSize} rounded-xl bg-gradient-to-br from-saffron-50 via-white to-indian-green-50 border border-gray-200/80 shadow-xs p-1.5 transition-transform hover:scale-105`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Tree Trunk & Deep Roots */}
          <path
            d="M24 42V25M24 42C21 42 18 43 16 44M24 42C27 42 30 43 32 44M24 33C21 31 17 29 15 27M24 30C27 28 31 26 33 24"
            stroke="#075E2A"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom Canopy - Indian Green (Stability & Grounded Welfare) */}
          <path
            d="M12 28C8.5 28 7 24 9.5 21C7 18 10 14 14 15C15 11 20 10 24 13C28 10 33 11 34 15C38 14 41 18 38.5 21C41 24 39.5 28 36 28C34 30 14 30 12 28Z"
            fill="#138A36"
            fillOpacity="0.18"
            stroke="#138A36"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Top Leaf Buds / Canopy Crown - Saffron Orange (Aspiration, Energy & Hope) */}
          <circle cx="24" cy="11" r="5" fill="#FF6B00" fillOpacity="0.9" />
          <circle cx="17" cy="15" r="4.5" fill="#FF6B00" fillOpacity="0.85" />
          <circle cx="31" cy="15" r="4.5" fill="#FF6B00" fillOpacity="0.85" />
          <circle cx="24" cy="18" r="3.5" fill="#FFFFFF" stroke="#075E2A" strokeWidth="1.5" />

          {/* Golden Center Seed / Chakra Dot */}
          <circle cx="24" cy="18" r="1.5" fill="#138A36" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-heading font-black tracking-tight text-dark-text">
              Namma<span className="text-saffron">Seve</span>
            </span>
            {kannadaText && (
              <span className="text-xs font-semibold text-indian-green bg-indian-green-50 border border-indian-green-200 px-1.5 py-0.5 rounded-md font-kannada">
                ನಮ್ಮ ಸೇವೆ
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-text font-medium leading-none">
            Citizen Welfare Discovery
          </span>
        </div>
      )}
    </div>
  );
};
