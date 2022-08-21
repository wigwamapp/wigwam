import { FC, useState, useEffect, ReactNode } from "react";

const Delay: FC<{ ms: number; fallback?: ReactNode }> = ({
  ms,
  children,
  fallback = null,
}) => {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDelayed(true), ms);
    return () => clearTimeout(t);
  }, [ms, setDelayed]);

  return <>{delayed ? children : fallback}</>;
};

export default Delay;
