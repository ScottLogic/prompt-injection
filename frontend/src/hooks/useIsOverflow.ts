import { useEffect, useState } from "react";

function useIsOverflow(ref: React.MutableRefObject<HTMLInputElement | null>) {
  const [isOverflow, setIsOverflow] = useState(false);

  function checkForOverflow() {
    const { current } = ref;

    if (!current) return;

    const hasOverflow =
      current.scrollHeight > current.clientHeight ||
      current.scrollWidth > current.clientWidth;

    setIsOverflow(hasOverflow);
  }

  useEffect(() => {
    checkForOverflow();
  });

  useEffect(() => {
    window.addEventListener("resize", checkForOverflow);
    return () => {
      window.removeEventListener("resize", checkForOverflow);
    };
  }, []);

  return isOverflow;
}

export default useIsOverflow;
