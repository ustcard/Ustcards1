import React, { useState, useRef } from 'react';
import { VisaLogo, MastercardLogo, ModernGoldChip, ContactlessSymbol, MasterBlueArtwork, MasterBlueCardBack } from './CardVisuals';
import { RefreshCw, Sparkles } from 'lucide-react';

interface Card3DProps {
  cardholderName?: string;
  network?: 'visa' | 'mastercard';
  simulatedNumber?: string;
  simulatedExpiry?: string;
  isFlipped?: boolean;
  onFlipToggle?: () => void;
  watermarkSettings?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
  customArtworkFront?: string;
  customArtworkBack?: string;
  className?: string;
  showFlipButton?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  cardholderName = '',
  network = 'visa',
  simulatedNumber,
  simulatedExpiry = '12/29',
  isFlipped: controlledFlipped,
  onFlipToggle,
  watermarkSettings,
  customArtworkFront,
  customArtworkBack,
  className = '',
  showFlipButton = true
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleFlip = () => {
    if (onFlipToggle) {
      onFlipToggle();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Safe display name
  const displayName = cardholderName.trim() ? cardholderName.toUpperCase() : 'YOUR NAME HERE';

  // Live 3D card preview: hide the middle numbers for security and privacy (e.g. 4892 •••• •••• 9210)
  const getMasked3DNumber = (num?: string, net: 'visa' | 'mastercard' = 'visa') => {
    const defaultPrefix = net === 'mastercard' ? '5412' : '4892';
    const defaultLast4 = net === 'mastercard' ? '8201' : '9210';
    if (!num) {
      return `${defaultPrefix} •••• •••• ${defaultLast4}`;
    }
    const digits = num.replace(/\D/g, '');
    const prefix = digits.length >= 4 ? digits.slice(0, 4) : defaultPrefix;
    const last4 = digits.length >= 8 ? digits.slice(-4) : defaultLast4;
    return `${prefix} •••• •••• ${last4}`;
  };
  const cardNumberDisplay = getMasked3DNumber(simulatedNumber, network);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Perspective Container */}
      <div
        className="w-full max-w-[420px] aspect-[1.586] perspective-1000 cursor-pointer group"
        onClick={handleFlip}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); }}
        aria-label="Interactive 3D sports tip card. Click to flip."
      >
        {/* Card Body with Smooth 3D Rotation */}
        <div
          className="relative w-full h-full rounded-[20px] shadow-2xl transition-transform duration-700 ease-out transform-style-preserve-3d"
          style={{
            transform: `rotateY(${isFlipped ? 180 : 0 + tilt.rotateY}deg) rotateX(${isFlipped ? 0 : tilt.rotateX}deg)`,
            boxShadow: isHovering && !isFlipped
              ? '0 25px 50px -12px rgba(37, 99, 235, 0.35), 0 0 25px rgba(59, 130, 246, 0.2)'
              : '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full rounded-[20px] backface-hidden overflow-hidden border border-blue-500/30">
            {customArtworkFront ? (
              <img
                src={customArtworkFront}
                alt="Card Front"
                className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
              />
            ) : (
              <MasterBlueArtwork watermark={watermarkSettings} />
            )}

            {/* Specular light glare overlay */}
            <div
              className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${50 + tilt.rotateY * 3}% ${50 - tilt.rotateX * 3}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
                opacity: isHovering ? 1 : 0.3
              }}
            />

            {/* Front Card Content */}
            <div className="relative w-full h-full p-4 sm:p-6 flex flex-col justify-between z-10 text-white">
              {/* Header: Platform Brand & Contactless Waves */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="font-heading text-xs sm:text-sm font-bold tracking-wider text-slate-100 uppercase">
                      Universal Sports Tip
                    </span>
                  </div>
                </div>

                {/* Contactless Wave Symbol in Top Right */}
                <div className="flex items-center text-slate-200/90 drop-shadow pr-0.5 shrink-0">
                  <ContactlessSymbol className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                </div>
              </div>

              {/* Authentic Gold EMV Microchip (CR80 Standard Left Position - Uncompressed) */}
              <div className="pt-0.5 sm:pt-1">
                <ModernGoldChip className="w-11 sm:w-13 h-8 sm:h-10 shrink-0" />
              </div>

              {/* Middle: Card Number (Middle digits hidden for privacy on 3D preview) */}
              <div className="w-full overflow-hidden my-auto py-0.5">
                <div className="font-mono-card text-[13px] xs:text-[15px] sm:text-lg md:text-xl font-semibold tracking-[0.14em] sm:tracking-[0.18em] text-white/95 drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
                  {cardNumberDisplay}
                </div>
              </div>

              {/* Footer: Cardholder Name and Expiration in ONE LINE in visual hierarchy, plus Network Logo */}
              <div className="flex items-end justify-between pt-1 w-full">
                <div className="flex items-baseline gap-4 sm:gap-6 min-w-0 pr-2">
                  <div className="truncate">
                    <span className="text-[7.5px] sm:text-[8px] text-blue-200/70 uppercase tracking-wider block font-medium">
                      CARDHOLDER
                    </span>
                    <span className="font-heading font-semibold text-xs sm:text-sm tracking-wider text-white uppercase truncate drop-shadow block">
                      {displayName}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[7.5px] sm:text-[8px] text-blue-200/70 uppercase tracking-wider block font-medium">
                      EXPIRES
                    </span>
                    <span className="font-mono-card text-xs sm:text-sm text-white font-semibold block tracking-wider">
                      {simulatedExpiry}
                    </span>
                  </div>
                </div>

                {/* Network Logo with strict aspect ratio */}
                <div className="flex items-center justify-end shrink-0 pl-2">
                  {network === 'mastercard' ? (
                    <MastercardLogo className="h-7 sm:h-9" />
                  ) : (
                    <VisaLogo className="h-5 sm:h-6" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full rounded-[20px] backface-hidden rotate-y-180 overflow-hidden border border-blue-900/40">
            {customArtworkBack ? (
              <img
                src={customArtworkBack}
                alt="Card Back"
                className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
              />
            ) : (
              <MasterBlueCardBack network={network} watermark={watermarkSettings} />
            )}
          </div>
        </div>
      </div>

      {/* Interactive Controls & Status Bar */}
      {showFlipButton && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleFlip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
            <span>{isFlipped ? 'View Front Side' : 'Flip to Back Side'}</span>
          </button>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            3D Interactive Preview
          </span>
        </div>
      )}
    </div>
  );
};
