import { useEffect, useState } from "react";

function useIsOverflow(
  ref: React.MutableRefObject<HTMLInputElement | null>,
  direction: "vertical" | "horizontal" = "vertical"
) {
  const [isOverflow, setIsOverflow] = useState(false);

  function checkForOverflow() {
    const { current } = ref;

    if (!current) return;

    const hasOverflow =
      direction === "vertical"
        ? current.scrollHeight > current.clientHeight
        : current.scrollWidth > current.clientWidth;

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
