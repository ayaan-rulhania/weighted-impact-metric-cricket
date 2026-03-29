/** Face-on cricket bat mark (matches public/favicon.svg blade, without app frame). */
export function CricketBatMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="8.25 4.35 15.5 26.7" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cricketBatWillowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B89562" />
          <stop offset="18%" stopColor="#D9C08A" />
          <stop offset="45%" stopColor="#F2E4C4" />
          <stop offset="62%" stopColor="#E8D6AE" />
          <stop offset="82%" stopColor="#C6A66E" />
          <stop offset="100%" stopColor="#A67C48" />
        </linearGradient>
      </defs>
      <g transform="translate(16 15.75)">
        <path
          fill="url(#cricketBatWillowGrad)"
          stroke="currentColor"
          strokeWidth="1.12"
          strokeLinejoin="round"
          d="
            M 0 -11.15
            C -1.08 -11.15 -1.88 -10.32 -1.88 -9.28
            L -1.88 -2.42
            C -1.88 -1.78 -2.05 -1.22 -2.42 -0.82
            C -3.62 0.92 -5.42 2.18 -6.62 3.98
            C -7.22 4.88 -7.38 5.95 -7.38 7.05
            L -7.38 9.82
            C -7.38 10.55 -7.28 11.22 -7.05 11.88
            C -6.52 13.32 -5.32 14.42 -3.82 14.82
            C -2.52 15.15 -1.12 15.12 0 14.72
            C 1.12 15.12 2.52 15.15 3.82 14.82
            C 5.32 14.42 6.52 13.32 7.05 11.88
            C 7.28 11.22 7.38 10.55 7.38 9.82
            L 7.38 7.05
            C 7.38 5.95 7.22 4.88 6.62 3.98
            C 5.42 2.18 3.62 0.92 2.42 -0.82
            C 2.05 -1.22 1.88 -1.78 1.88 -2.42
            L 1.88 -9.28
            C 1.88 -10.32 1.08 -11.15 0 -11.15
            Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.42"
          strokeLinecap="round"
          opacity={0.45}
          d="M -1.52 -8.95 L 1.52 -8.95 M -1.55 -7.35 L 1.55 -7.35 M -1.58 -5.75 L 1.58 -5.75 M -1.6 -4.2 L 1.6 -4.2"
        />
        <path fill="none" stroke="currentColor" strokeWidth="0.48" strokeLinecap="round" opacity={0.55} d="M -1.88 -2.42 Q 0 -1.9 1.88 -2.42" />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeLinecap="round"
          opacity={0.35}
          d="M -0.35 -1.1 V 13.85 M 0.35 -1.1 V 13.85"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.26"
          strokeLinecap="round"
          opacity={0.32}
          d="M -4.15 4.35 Q -1.6 5.85 0 5.65 Q 1.6 5.85 4.15 4.35 M -4.85 8.05 Q -2 9.55 0 9.28 Q 2 9.55 4.85 8.05 M -4.35 11.35 Q -1.75 12.45 0 12.22 Q 1.75 12.45 4.35 11.35"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.32"
          strokeLinecap="round"
          opacity={0.4}
          d="M -6.95 6.55 Q -5.55 4.45 -3.85 3.15 M 6.95 6.55 Q 5.55 4.45 3.85 3.15"
        />
        <ellipse cx="-2.2" cy="5.5" rx="1.1" ry="4.2" fill="#FFFFFF" opacity="0.12" />
      </g>
    </svg>
  );
}
