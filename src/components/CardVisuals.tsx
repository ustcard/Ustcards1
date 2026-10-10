import React from 'react';

// Authorized Visa Logo SVG (Aspect Ratio: ~3:1, official proportions)
export const VisaLogo: React.FC<{ className?: string }> = ({ className = "h-6" }) => (
  <svg
    viewBox="0 0 100 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ aspectRatio: '100 / 32' }}
    aria-label="Visa"
  >
    <path
      d="M38.5 2.5L25.3 30.5H17.2L10.5 8.9C10.1 7.3 9.8 6.7 8.5 6C6.4 4.8 3 3.8 0 3.2L0.2 2.5H14.1C15.9 2.5 17.5 3.7 17.9 5.8L21.3 22.3L29.3 2.5H38.5ZM72.6 21.6C72.7 13.7 61.2 13.2 61.4 9.6C61.4 8.5 62.6 7.3 65.1 7C66.3 6.8 69.8 6.7 73.3 8.3L74.8 2C72.7 1.2 70 0.5 66.5 0.5C58.3 0.5 52.6 4.9 52.5 11.1C52.4 15.7 56.6 18.3 59.8 19.9C63.1 21.5 64.2 22.5 64.2 23.9C64.1 26.1 61.5 27.1 59.1 27.1C54.8 27.1 52.3 25.8 50.4 24.9L48.8 31.4C50.9 32.3 54.7 33.1 58.7 33.1C67.4 33.1 72.6 28.8 72.6 21.6ZM94 30.5H100L94.8 2.5H89.4C87.6 2.5 86.1 3.5 85.5 5.1L73 30.5H81.8L83.5 25.9H92.2L94 30.5ZM85.9 19.5L89.5 9.7L91.6 19.5H85.9ZM50.8 2.5L44.2 30.5H36.2L42.8 2.5H50.8Z"
      fill="#FFFFFF"
    />
  </svg>
);

// Authorized Mastercard Logo SVG (Interlocking red & orange-yellow circles, official proportions)
export const MastercardLogo: React.FC<{ className?: string }> = ({ className = "h-8" }) => (
  <svg
    viewBox="0 0 138 108"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ aspectRatio: '138 / 108' }}
    aria-label="Mastercard"
  >
    <rect width="138" height="108" rx="10" fill="transparent" />
    <circle cx="48" cy="54" r="42" fill="#EB001B" />
    <circle cx="90" cy="54" r="42" fill="#F79E1B" />
    <path
      d="M69 22.9C79.4 30.8 86 41.8 86 54C86 66.2 79.4 77.2 69 85.1C58.6 77.2 52 66.2 52 54C52 41.8 58.6 30.8 69 22.9Z"
      fill="#FF5F00"
    />
  </svg>
);

// Authentic Contactless 4-Arc Symbol (Uncompressed, strictly concentric radio wave arcs radiating outward)
export const ContactlessSymbol: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-slate-200/90" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className={`shrink-0 ${className}`}
    style={{ aspectRatio: '1 / 1' }}
    aria-label="Contactless Indicator"
  >
    {/* 4 Concentric Radio Waves radiating outward - shared center (5, 12), true circular arcs */}
    <path d="M7.83 14.83 A 4 4 0 0 0 7.83 9.17" />
    <path d="M10.66 17.66 A 8 8 0 0 0 10.66 6.34" />
    <path d="M13.48 20.48 A 12 12 0 0 0 13.48 3.52" />
    <path d="M16.31 23.31 A 16 16 0 0 0 16.31 0.69" />
  </svg>
);

// Authentic Brushed Gold EMV Microchip (CR80 standard aspect ratio ~1.3:1)
// Vector-based geometry with authentic ISO 7816 contact pad traces — immune to flex compression
export const ModernGoldChip: React.FC<{ className?: string }> = ({ className = "w-12 h-9" }) => (
  <div className={`relative shrink-0 select-none ${className}`}>
    <svg
      viewBox="0 0 52 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-md"
      style={{ aspectRatio: '52 / 40' }}
      aria-label="EMV Smart Card Chip"
    >
      <defs>
        {/* Metallic rich gold base gradient */}
        <linearGradient id="emvMetalGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="18%" stopColor="#fde047" />
          <stop offset="42%" stopColor="#eab308" />
          <stop offset="68%" stopColor="#ca8a04" />
          <stop offset="85%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>

        {/* Diagonal metallic gold light sheen */}
        <linearGradient id="emvGoldSheen" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Chip base body with rounded corners */}
      <rect
        x="1"
        y="1"
        width="50"
        height="38"
        rx="5.5"
        ry="5.5"
        fill="url(#emvMetalGold)"
        stroke="#854d0e"
        strokeWidth="0.9"
      />

      {/* Inner metallic bevel highlight border */}
      <rect
        x="2"
        y="2"
        width="48"
        height="36"
        rx="4.5"
        ry="4.5"
        fill="none"
        stroke="rgba(255, 255, 240, 0.85)"
        strokeWidth="0.6"
      />

      {/* Milled laser trace highlight layers (bottom shadow) */}
      <g stroke="rgba(254, 240, 138, 0.55)" strokeWidth="0.5" transform="translate(0, 0.4)">
        <rect x="18" y="13" width="16" height="14" rx="3.5" ry="3.5" fill="none" />
        <line x1="1" y1="20" x2="18" y2="20" />
        <line x1="34" y1="20" x2="51" y2="20" />
        <line x1="26" y1="1" x2="26" y2="13" />
        <line x1="26" y1="27" x2="26" y2="39" />
        <line x1="10" y1="1" x2="10" y2="39" />
        <line x1="42" y1="1" x2="42" y2="39" />
      </g>

      {/* Authentic ISO 7816 contact pad isolation grooves (laser milled cuts in gold) */}
      <g stroke="#713f12" strokeWidth="1.1" strokeLinecap="round">
        {/* Central contact lozenge core */}
        <rect x="18" y="13" width="16" height="14" rx="3.5" ry="3.5" fill="none" />
        {/* Horizontal isolation grooves */}
        <line x1="1" y1="20" x2="18" y2="20" />
        <line x1="34" y1="20" x2="51" y2="20" />
        {/* Vertical center isolation grooves */}
        <line x1="26" y1="1" x2="26" y2="13" />
        <line x1="26" y1="27" x2="26" y2="39" />
        {/* Left and right quadrant isolation grooves */}
        <line x1="10" y1="1" x2="10" y2="39" />
        <line x1="42" y1="1" x2="42" y2="39" />
      </g>

      {/* Diagonal metallic light sheen overlay */}
      <rect
        x="1.5"
        y="1.5"
        width="49"
        height="37"
        rx="5"
        ry="5"
        fill="url(#emvGoldSheen)"
        pointerEvents="none"
      />
    </svg>
  </div>
);

// Backward-compatible alias for existing imports
export const ModernSilverChip = ModernGoldChip;

// Authoritative Master Blue Artwork (Matching project_20261007_1358053-01.png)
export const MasterBlueArtwork: React.FC<{ watermark?: { enabled: boolean; text: string; opacity: number } }> = ({ watermark }) => (
  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[20px] bg-[#0e297a]">
    {/* Exact Master Vector Graphic from Reference */}
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 630"
      preserveAspectRatio="none"
    >
      {/* Deep Royal Navy Blue Base */}
      <rect width="1000" height="630" fill="#0e297a" />

      {/* Bottom-Left Slate Blue Curved Arc */}
      <path
        d="M 0 345 C 130 350 275 475 285 630 L 0 630 Z"
        fill="#7088b6"
      />

      {/* Top-Right Sweeping Curved Ribbon */}
      <path
        d="M 575 0 C 600 290 820 530 1000 595 L 1000 270 C 930 170 890 70 830 0 Z"
        fill="#7088b6"
      />
    </svg>

    {/* Subtle gloss sheen layer */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none" />

    {/* Watermark overlay if configured */}
    {watermark?.enabled && (
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -rotate-12"
        style={{ opacity: watermark.opacity }}
      >
        <span className="text-white text-xs md:text-sm font-bold tracking-[0.25em] border border-white/40 px-4 py-1 rounded bg-black/30 backdrop-blur-xs">
          {watermark.text || 'UNIVERSAL SPORTS TIP'}
        </span>
      </div>
    )}
  </div>
);

// Master Card Backside Visual
export const MasterBlueCardBack: React.FC<{
  watermark?: { enabled: boolean; text: string; opacity: number };
  network?: 'visa' | 'mastercard';
}> = ({ watermark, network = 'visa' }) => (
  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[20px] bg-[#04091a] text-slate-300 flex flex-col justify-between">
    {/* Deep navy back gradient */}
    <div className="absolute inset-0 bg-gradient-to-bl from-[#05102a] via-[#030818] to-[#01040f] pointer-events-none" />

    {/* Top Section: Magnetic Stripe (CR80 standard placement) */}
    <div className="relative w-full pt-3 sm:pt-4">
      <div className="w-full h-7 sm:h-9 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-y border-neutral-800 shadow-inner flex items-center px-4">
        <div className="w-full h-0.5 sm:h-1 bg-neutral-800/60 rounded" />
      </div>
    </div>

    {/* Middle Section: Signature Panel & CVV box */}
    <div className="relative px-4 sm:px-6 my-auto space-y-1 sm:space-y-1.5">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* White Signature bar */}
        <div className="flex-1 h-6 sm:h-7.5 bg-slate-100 rounded-xs shadow-inner px-2 sm:px-3 flex items-center justify-between overflow-hidden border border-slate-300">
          <span className="font-heading text-[7px] sm:text-[9px] text-slate-400 select-none tracking-wider italic font-semibold">
            AUTHORIZED SIGNATURE
          </span>
          <div className="flex items-center gap-1 opacity-30">
            <div className="w-8 sm:w-12 h-2.5 border-b border-dashed border-slate-600" />
          </div>
        </div>

        {/* CVV Security Code Box */}
        <div className="w-10 sm:w-13 h-6 sm:h-7.5 bg-slate-900 border border-slate-700 rounded-xs flex items-center justify-center px-1 shadow-inner">
          <span className="font-mono-card text-[9px] sm:text-xs text-slate-200 tracking-wider font-semibold">
            842
          </span>
        </div>
      </div>

      {/* Concise Legal Specimen Text (Cleanly spaced below signature bar) */}
      <p className="text-[6.5px] sm:text-[7.5px] text-slate-400 leading-tight">
        Universal Sports Tip Membership Pass. Subject to agreed terms. Support: support@universalsportstip.com
      </p>
    </div>

    {/* Bottom Footer Row: Hologram Seal on left, Network Logo on right */}
    <div className="relative px-4 sm:px-6 pb-2.5 sm:pb-3.5 flex items-end justify-between">
      {/* Holographic specimen badge */}
      <div className="flex items-center gap-1.5">
        <div className="w-7 sm:w-8 h-4 sm:h-5 rounded-xs border border-cyan-400/50 bg-gradient-to-tr from-cyan-600/30 via-indigo-500/20 to-sky-400/40 flex items-center justify-center shadow-xs">
          <span className="text-[5.5px] sm:text-[6.5px] font-bold text-cyan-200 tracking-tight">SECURE</span>
        </div>
        <span className="text-[6.5px] sm:text-[7.5px] text-slate-500 font-mono tracking-wider">
          UST-CR80
        </span>
      </div>

      {/* Network Logo with strict natural aspect ratio */}
      <div className="flex items-center justify-end opacity-90">
        {network === 'mastercard' ? (
          <MastercardLogo className="h-5 sm:h-6" />
        ) : (
          <VisaLogo className="h-3 sm:h-4" />
        )}
      </div>
    </div>

    {/* Watermark overlay if configured */}
    {watermark?.enabled && (
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none rotate-12"
        style={{ opacity: watermark.opacity }}
      >
        <span className="text-white text-[9px] sm:text-xs font-bold tracking-[0.25em] border border-white/40 px-2.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">
          {watermark.text || 'UNIVERSAL SPORTS TIP'}
        </span>
      </div>
    )}
  </div>
);
