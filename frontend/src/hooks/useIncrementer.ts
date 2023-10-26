import { useState } from "react";

function useIncrementer(initialValue = 0) {
  const [value, setValue] = useState(initialValue);

  function increase(maxCap?: number) {
    if (maxCap && value >= maxCap) return;
    setValue(value + 1);
  }

  function decrease(minCap = 0) {
    if (value <= minCap) return;
    setValue(value - 1);
  }

  function reset() {
    setValue(initialValue);
  }

  return [value, increase, decrease, reset] as const;
}

export default useIncrementer;
