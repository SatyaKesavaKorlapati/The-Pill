import React, { useState } from 'react';
import { Disc3 } from 'lucide-react';

interface ResilientThumbProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientThumb: React.FC<ResilientThumbProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-300 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallbackLabel ? (
          <span className="text-xs font-semibold tracking-tight">{fallbackLabel}</span>
        ) : (
          <Disc3 className="w-4 h-4 text-sky-400/80" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
};
