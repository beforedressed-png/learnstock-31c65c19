import React, { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="logo-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="logo-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      
      {/* First Bar (left) */}
      <rect x="14" y="55" width="14" height="30" fill="url(#logo-green)" />
      
      {/* Second Bar */}
      <rect x="32" y="45" width="14" height="40" fill="url(#logo-green)" />
      {/* Blue overlap for Bar 2 */}
      <path d="M32 85 L46 85 L46 76 L32 85 Z" fill="url(#logo-blue)" />
      
      {/* Third Bar */}
      <rect x="50" y="35" width="14" height="50" fill="url(#logo-green)" />
      {/* Blue overlap for Bar 3 */}
      <path d="M50 85 L64 85 L64 62 L50 72 Z" fill="url(#logo-blue)" />
      
      {/* Fourth Bar (Arrow) */}
      {/* Left side (Green) */}
      <rect x="68" y="35" width="7" height="50" fill="url(#logo-green)" />
      {/* Left Arrow Head */}
      <path d="M75 10 L64 35 L75 35 Z" fill="url(#logo-green)" />
      
      {/* Blue overlap for left stem */}
      <path d="M68 85 L75 85 L75 48 L68 58 Z" fill="url(#logo-blue)" />
      
      {/* Right side (Blue) */}
      <rect x="75" y="35" width="7" height="50" fill="url(#logo-blue)" />
      {/* Right Arrow Head */}
      <path d="M75 10 L75 35 L86 35 Z" fill="url(#logo-blue)" />
    </svg>
  );
}
