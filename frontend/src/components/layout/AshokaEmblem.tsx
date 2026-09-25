'use client';

import React from 'react';

interface AshokaEmblemProps {
  className?: string;
  size?: number;
}

export const AshokaEmblem: React.FC<AshokaEmblemProps> = ({ className = 'w-10 h-10', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Lion Capital of Ashoka - State Emblem of India"
    >
      {/* Outer Subtle Golden Halo Ring */}
      <circle cx="50" cy="50" r="48" stroke="url(#goldGradient)" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
      
      {/* Base Pedestal (Abacus) */}
      <rect x="25" y="76" width="50" height="5" rx="1.5" fill="url(#goldGradient)" />
      <rect x="20" y="82" width="60" height="4" rx="1.5" fill="url(#goldGradientDark)" />
      
      {/* Central Ashoka Chakra on Abacus */}
      <circle cx="50" cy="78.5" r="3.5" fill="#000080" stroke="url(#goldGradient)" strokeWidth="0.8" />
      
      {/* Lion Capital Silhouette & Features */}
      {/* Central Lion Head */}
      <path
        d="M50 16 C42 16 38 23 38 31 C38 38 41 43 45 47 L45 74 L55 74 L55 47 C59 43 62 38 62 31 C62 23 58 16 50 16 Z"
        fill="url(#goldGradient)"
      />
      {/* Left Lion Head Profile */}
      <path
        d="M38 28 C32 28 26 33 26 40 C26 47 30 52 35 55 L38 56 L41 48 C37 45 36 41 36 38 C36 34 37 30 38 28 Z"
        fill="url(#goldGradientDark)"
      />
      {/* Right Lion Head Profile */}
      <path
        d="M62 28 C68 28 74 33 74 40 C74 47 70 52 65 55 L62 56 L59 48 C63 45 64 41 64 38 C64 34 63 30 62 28 Z"
        fill="url(#goldGradientDark)"
      />
      {/* Mane & Facial Detailing */}
      <path d="M46 28 C48 30 52 30 54 28" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="45" cy="24" r="1.5" fill="#3E2723" />
      <circle cx="55" cy="24" r="1.5" fill="#3E2723" />
      <path d="M48 34 L52 34 L50 37 Z" fill="#3E2723" />
      <path d="M46 41 C48 43 52 43 54 41" stroke="#3E2723" strokeWidth="1.2" strokeLinecap="round" />

      {/* Traditional Floral Accents on Base */}
      <circle cx="34" cy="78.5" r="1.5" fill="url(#goldGradient)" />
      <circle cx="66" cy="78.5" r="1.5" fill="url(#goldGradient)" />

      {/* Motto text label "सत्यमेव जयते" underline bar */}
      <text
        x="50"
        y="93"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="bold"
        fill="url(#goldGradientDark)"
        fontFamily="serif"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>

      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5D061" />
          <stop offset="0.5" stopColor="#E5A623" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="goldGradientDark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#8C6208" />
        </linearGradient>
      </defs>
    </svg>
  );
};
