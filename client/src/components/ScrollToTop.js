import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Isse slow aur smooth scroll up hoga
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // "smooth" se slow scrolling effect aayega
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;