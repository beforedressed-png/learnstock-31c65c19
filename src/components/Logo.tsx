import React, { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* First Bar (left) */}
      <rect x="14" y="55" width="14" height="30" fill="currentColor" opacity="0.4" />
      
      {/* Second Bar */}
      <rect x="32" y="45" width="14" height="40" fill="currentColor" opacity="0.55" />
      
      {/* Third Bar */}
      <rect x="50" y="35" width="14" height="50" fill="currentColor" opacity="0.7" />
      
      {/* Fourth Bar (Arrow) */}
      <rect x="68" y="35" width="14" height="50" fill="currentColor" opacity="0.85" />
      {/* Arrow Head */}
      <path d="M75 10 L64 35 L86 35 Z" fill="currentColor" />
    </svg>
  );
}
