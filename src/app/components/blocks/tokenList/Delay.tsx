import { FC, useState, useEffect } from "react";

const Delay: FC<{ ms: number }> = ({ ms, children }) => {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDelayed(true), ms);
    return () => clearTimeout(t);
  }, [ms, setDelayed]);

  return delayed ? <>{children}</> : null;
};

export default Delay;
