import { FC } from "react";

const PriceArrow: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="-5 -5 30 30" className={className}>
    <polygon
      className="fill-current stroke-current stroke-[4]"
      strokeLinejoin="round"
      points="10,5 0,15 20,15"
    />
  </svg>
);

export default PriceArrow;
