import type React from 'react';
import { cn } from '@/lib/utils';

interface BrandWavesProps {
  lines?: number;
  animated?: boolean;
  className?: string;
}

/**
 * Decorative flowing line field echoing the wave backdrop on williamslea.com.
 * Used behind dark sections and as the hero fallback when no video or image is set.
 */
export const BrandWaves: React.FC<BrandWavesProps> = ({
  lines = 14,
  animated = false,
  className,
}) => (
  <svg
    className={cn('pointer-events-none', className)}
    viewBox="0 0 1440 400"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <g
      className={cn(
        animated &&
          'motion-safe:animate-[wl-wave-drift_18s_ease-in-out_infinite_alternate]',
      )}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${260 + i * 6} C 360 ${120 + i * 10}, 720 ${380 - i * 4}, 1080 ${200 + i * 8} S 1440 ${240 + i * 5}, 1440 ${240 + i * 5}`}
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
      ))}
    </g>
  </svg>
);
