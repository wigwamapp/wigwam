import { FC, useEffect } from "react";

const SetImageBg: FC = () => {
  useEffect(() => {
    const t = setTimeout(() => {
      document.documentElement.style.backgroundImage = "url(images/bg.jpeg)";
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return null;
};

export default SetImageBg;
