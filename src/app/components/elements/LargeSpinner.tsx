import { memo } from "react";
import classNames from "clsx";

const LargeSpinner = memo<{ className?: string }>(({ className }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    className={classNames("animate-spin w-[7.5rem] h-[7.5rem]", className)}
  >
    <circle
      cx="60"
      cy="60"
      r="54"
      stroke="#CCF9FF"
      strokeOpacity="0.15"
      strokeWidth="12"
    />
    <path
      d="M65.0054 6.23253C65.3125 2.93309 62.883 -0.0222163 59.5694 0.00154181C48.9029 0.0780186 38.4099 2.9984 29.1944 8.51206C18.2565 15.0563 9.68679 24.9138 4.72759 36.6557C-0.231603 48.3976 -1.32262 61.4138 1.61268 73.8174C4.08574 84.2677 9.30857 93.8257 16.6909 101.525C18.9843 103.917 22.7967 103.598 24.9477 101.077V101.077C27.0987 98.5565 26.7659 94.792 24.5331 92.3435C19.0597 86.3416 15.1758 79.022 13.2902 71.0539C10.9419 61.131 11.8147 50.7181 15.7821 41.3246C19.7494 31.9311 26.6052 24.0451 35.3555 18.8097C42.3821 14.6056 50.3371 12.2862 58.4557 12.0249C61.7677 11.9182 64.6982 9.53198 65.0054 6.23253V6.23253Z"
      fill="url(#paint0_linear_3870_37340)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_3870_37340"
        x1="37.5926"
        y1="-63.4817"
        x2="-63.4501"
        y2="-40.3675"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#80EF6E" />
        <stop offset="1" stopColor="#80EF6E" />
      </linearGradient>
    </defs>
  </svg>
));

export default LargeSpinner;
